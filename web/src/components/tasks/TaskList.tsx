import useSWR from "swr";
import { List, putTaskList } from "../../api/task_lists";
import {
  Task,
  deleteTask,
  insertTask,
  listTasks,
  patchTask,
} from "../../api/tasks";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  ClickAwayListener,
  Collapse,
  IconButton,
  List as MaterialList,
  ListItem,
  ListItemIcon,
  MenuItem,
  Modal,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Button } from "@mui/material";
import {
  AddTask,
  CancelOutlined,
  ChevronRightSharp,
  Delete,
  MoreVert,
  NoteAdd,
  PlusOne,
  RadioButtonUnchecked,
  Notes as NotesIcon,
  CalendarToday as CalendarTodayIcon,
} from "@mui/icons-material";
import React, { useEffect, useMemo, useState } from "react";
import TaskListItem from "./Task";
import { Draggable, Droppable } from "react-beautiful-dnd";
import sortBy from "lodash/sortBy";
import { useAuth } from "../Auth";
import { Note, deleteNote, insertNote, listNotes } from "../../api/notes";
import NoteItem from "../NoteItem";
import CounterForm, { CounterFormProps } from "../CounterForm";
import {
  CountMapping,
  CountTally,
  Counter,
  createCounter,
  deleteCounter,
  getCounts,
  increaseCounter,
  listCounters,
} from "../../api/counters";
import CounterItem from "../CounterItem";
import DropdownMenu from "../DropdownMenu";
import { LoadingButton } from "@mui/lab";
import theme from "../../theme";
import CenteredModal from "../CenteredModal";
import Editor from "../Editor";
import ActionButton from "./ActionButton";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";

interface Props {
  taskList: List;
  onDeleteTaskList: () => void;
  onUpdateTaskList: (attrs: Parameters<typeof putTaskList>[1]) => void;
}

const TaskListComponent = ({
  taskList,
  onDeleteTaskList,
  onUpdateTaskList,
}: Props) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const [isUpdatingList, setIsUpdatingList] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [updateListAttrs, setUpdateListAttrs] = useState({
    title: taskList.raw.title,
  });
  const [showNewForm, setShowNewForm] = useState(false);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [newNoteAttrs, setNewNoteAttrs] = useState({
    title: "",
    text: "",
  });
  const [showNewCounterForm, setShowNewCounterForm] = useState(false);
  const [newlyAddedTasks, setNewlyAddedTasks] = useState<Set<string>>(new Set());

  // Hoisted state/refs for create task form
  const [dueDate, setDueDate] = React.useState<string | null>(null);
  const [descFocus, setDescFocus] = React.useState(false);
  const titleRef = React.useRef<HTMLInputElement>(null);
  const descRef = React.useRef<HTMLInputElement>(null);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const calendarBtnRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (taskList.raw.title !== updateListAttrs.title) {
      setUpdateListAttrs({ title: taskList.raw.title });
    }
  }, [taskList.raw.title]);

  const { data: countMapping = {}, mutate: mutateCounts } =
    useSWR<CountMapping>("counts", () => getCounts(), {
      revalidateOnFocus: false,
    });
  const {
    data: tasks = [],
    isLoading: isLoadingTasks,
    mutate: mutateTasks,
  } = useSWR<Task[]>(
    ["taskslist", taskList.id],
    () => listTasks(taskList.id).then(res => res.data as Task[]),
    {
      revalidateOnFocus: false,
      // 2 minute
      refreshInterval: 2 * 60 * 1000,
      revalidateIfStale: true,
      revalidateOnMount: true,
      revalidateOnReconnect: true,
    }
  );

  const isDefaultList = useMemo(() => {
    const decoded = atob(taskList.raw.id);
    return decoded.split(":").length > 1;
  }, [taskList.raw.id]);

  const {
    data: notes,
    mutate: mutateNotes,
    isLoading: isNotesLoading,
  } = useSWR(
    ["taskslist", taskList.id, "notes"],
    () => listNotes(taskList.id, isDefaultList).then(result => result.data),
    {
      revalidateOnFocus: false,
    }
  );

  const {
    data: counters,
    mutate: mutateCounters,
    isLoading: isCountersLoading,
  } = useSWR(
    ["taskslist", taskList.id, "counters"],
    () => listCounters(taskList.id, isDefaultList).then(result => result.data),
    {
      revalidateOnFocus: false,
    }
  );
  const completedTasks = useMemo(
    () => tasks.filter(t => t.raw.status === "completed"),
    [tasks]
  );
  const pendingTasks = useMemo(
    () => tasks.filter(t => t.raw.status !== "completed"),
    [tasks]
  );

  const handleIncrease = async (counter: Counter, value: number) => {
    const updated: CountTally = Object.assign({}, countMapping[counter.id]);
    for (const [key, currValue] of Object.entries(updated)) {
      updated[key as keyof CountTally] = currValue + value;
    }

    const newMapping = { ...countMapping, [counter.id]: updated };
    await Promise.all([
      increaseCounter(counter.id, value),
      mutateCounts(newMapping, { revalidate: false }),
    ]);
    mutateCounts();
  };

  const onToggleTask = async (task: Task) => {
    if (task.raw.status === "needsAction") {
      patchTask(task.id, {
        status: "completed",
      });
      const updated = tasks.map(t =>
        t.id === task.id ? { ...t, status: "completed" as const } : t
      );
      mutateTasks(updated);
    } else {
      patchTask(task.id, {
        status: "needsAction",
      });
      const updated = tasks.map(t =>
        t.id === task.id ? { ...t, status: "needsAction" as const } : t
      );
      mutateTasks(updated, { revalidate: false });
    }
  };
  const handleDelete = async (task: Task) => {
    deleteTask(task.id);
    const updated = tasks.filter(t => t.id !== task.id);
    mutateTasks(updated, { revalidate: false });
  };
  const handleUpdate = async (taskId: string, attrs: Partial<Task>) => {
    patchTask(taskId, attrs).then();
    const updated = tasks.map(t => {
      if (t.id == taskId) {
        return { ...t, raw: { ...t.raw, ...attrs } };
      } else {
        return t;
      }
    });

    mutateTasks(updated, { revalidate: false });
  };

  const handleAddCounter: CounterFormProps["onSubmit"] = async (
    data,
    { cancelLoading }
  ) => {
    await createCounter({ ...data, list_id: taskList.id });
    cancelLoading();
  };

  const handleNewNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newNoteAttrs.title && !newNoteAttrs.text) {
      setShowNewNoteForm(false);
      return;
    }
    const tempId: string = String(self.crypto.randomUUID());
    const tempNote: Note = {
      raw: {
        title: newNoteAttrs.title,
        name: tempId,
        permissions: [],
        attachments: [],
        body: { text: { text: newNoteAttrs.text }, list: { listItems: [] } },
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        trashTime: null,
        trashed: false,
      },
      id: tempId,
      user_id: taskList.user_id,
    };
    mutateNotes([tempNote, ...(notes || [])], { revalidate: false });
    setShowNewNoteForm(false);
    const { data: result } = await insertNote({
      ...newNoteAttrs,
      list_id: taskList.id,
    });
    if (result && result.data) {
      await mutateNotes(
        (notes: Note[] | null | undefined) => {
          const filtered = (notes || []).filter(n => n.id !== tempId);
          const newNotes = [result.data, ...filtered];
          return newNotes;
        },
        {
          revalidate: false,
        }
      );
    }
    setNewNoteAttrs({ title: "", text: "" });
  };

  const handleRenameList = () => {
    if (updateListAttrs.title && taskList.raw.title !== updateListAttrs.title) {
      onUpdateTaskList(updateListAttrs);
      setUpdateListAttrs({ title: updateListAttrs.title });
    }
    setEditingTitle(false);
  };

  const handleDeleteNote = (note: Note) => {
    deleteNote(note.id);
    mutateNotes(prev => prev?.filter(n => n.id !== note.id), {
      revalidate: false,
    });
  };

  const handleOpenNewForm = () => {
    setDueDate(null);
    setShowNewForm(true);
  };

  return (
    <Paper
      elevation={0}
      className="overflow-y-auto !shadow-sm hover:!shadow-lg group"
      sx={{
        scrollbarWidth: "thin",
        borderRadius: 3,
        pt: 1,
        px: 1.4,
        height: "100%",
        maxHeight: "90vh",
      }}>
      <Box
        className="group-hover:visible invisible bg-gray-300 w-12 cursor-grab h-1 rounded mx-auto"
      />
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" className="overflow-x-hidden">
          {taskList.raw.title}
        </Typography>

        <DropdownMenu
          renderTrigger={({ ref, onClick }) => (
            <IconButton
              ref={ref}
              onClick={onClick}
              title={`More options for list '${taskList.raw.title}'`}>
              <MoreVert />
            </IconButton>
          )}>
          {[
            {
              label: "Rename list",
              key: "rename",
              onClick: () => setEditingTitle(true),
            },
            {
              label: "Delete list",
              key: "delete",
              onClick: onDeleteTaskList,
            },
          ].map(item => (
            <MenuItem onClick={item.onClick} key={item.label}>
              {item.label}
            </MenuItem>
          ))}
        </DropdownMenu>
        <CenteredModal
          open={editingTitle}
          onClose={() => {
            handleRenameList();
          }}
          renderTrigger={null}
          renderContent={
            <form
              onSubmit={async e => {
                e.preventDefault();
                handleRenameList();
              }}>
              <TextField
                name="listTitle"
                label="Title"
                variant="filled"
                className="w-full"
                autoFocus
                onChange={e => {
                  setUpdateListAttrs(prev => ({
                    ...prev,
                    title: e.currentTarget.value,
                  }));
                }}
                value={updateListAttrs.title}
              />
            </form>
          }
        />
      </Stack>
      {import.meta.env.DEV && import.meta.env.VITE_SHOW_IDS === "true" && (
        <Box sx={{ pl: 1.5 }}>
          <Typography
            variant="body2"
            sx={{ fontSize: "0.7rem" }}
            className="text-gray-500">
            id: {taskList.id}
            <br />
            raw: {taskList.raw.id}
          </Typography>
        </Box>
      )}
      <ActionButton
        startIcon={<AddTask />}
        onClick={handleOpenNewForm}>
        Add a task
      </ActionButton>
      <ActionButton
        startIcon={<NoteAdd />}
        onClick={() => setShowNewNoteForm(true)}>
        Add a note
      </ActionButton>

      <ActionButton
        startIcon={<PlusOne />}
        onClick={() => setShowNewCounterForm(true)}>
        Add a counter
      </ActionButton>

      {showNewNoteForm && (
        <Card raised sx={{ py: 0 }}>
          <CardContent className="!py-1">
            <form onSubmit={handleNewNote}>
              <TextField
                className="w-full"
                label="Title"
                id="noteTitle"
                name="noteTitle"
                type="text"
                variant="standard"
                onChange={e =>
                  setNewNoteAttrs(prev => ({ ...prev, title: e.target.value }))
                }
                size="small"
              />
              <Editor
                className="mt-1 min-h-24"
                autofocus
                showControls={false}
                defaultValue=""
                onChange={v => {
                  setNewNoteAttrs(prev => ({ ...prev, text: v }));
                }}
              />
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button type="submit">Close</Button>
              </CardActions>
            </form>
          </CardContent>
        </Card>
      )}
      {showNewCounterForm && (
        <ClickAwayListener onClickAway={() => setShowNewCounterForm(false)}>
          <div>
            <CounterForm
              onSubmit={async (...args) => {
                await handleAddCounter(...args);
                setShowNewCounterForm(false);
                await mutateCounters();
              }}
              onCancel={() => setShowNewCounterForm(false)}
            />
          </div>
        </ClickAwayListener>
      )}

      {showNewForm ? (
        <ClickAwayListener onClickAway={() => setShowNewForm(false)}>
          <ListItem sx={{ p: 0, bgcolor: '#f6fafd', borderRadius: 2, mb: 1 }} alignItems="flex-start">
            <ListItemIcon>
              <IconButton color="primary" disabled>
                <RadioButtonUnchecked />
              </IconButton>
            </ListItemIcon>
            <form
              style={{ width: '100%' }}
              onSubmit={async e => {
                e.preventDefault();
                if (isUpdatingList) return;
                setIsUpdatingList(true);
                const title = e.currentTarget.taskTitle.value;
                const notes = e.currentTarget.taskNotes?.value || '';
                const due = dueDate || undefined;
                const { data: returned } = await insertTask(taskList.id, {
                  title,
                  notes,
                  due,
                });
                setNewlyAddedTasks(prev => new Set(prev).add(returned.id));
                mutateTasks([returned, ...tasks], { revalidate: false });
                setIsUpdatingList(false);
                setShowNewForm(false);
                setTimeout(() => {
                  setNewlyAddedTasks(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(returned.id);
                    return newSet;
                  });
                }, 600);
              }}
            >
              <Stack direction="column" alignItems="start" gap={0} sx={{ width: '100%' }}>
                <TextField
                  name="taskTitle"
                  placeholder="Title"
                  variant="standard"
                  fullWidth
                  autoFocus
                  inputRef={titleRef}
                  InputProps={{ disableUnderline: true }}
                  sx={{ fontSize: 16, bgcolor: 'transparent', mb: 0.5 }}
                  disabled={isUpdatingList}
                  required
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      (e.target as HTMLFormElement).form?.requestSubmit();
                    } else if (e.key === 'Enter' && e.shiftKey) {
                      e.preventDefault();
                      setDescFocus(true);
                      setTimeout(() => descRef.current?.focus(), 0);
                    }
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <NotesIcon fontSize="small" sx={{ mr: 0.5, color: 'grey.600' }} />
                  <TextField
                    name="taskNotes"
                    placeholder="Details"
                    variant="standard"
                    fullWidth
                    inputRef={descRef}
                    InputProps={{ disableUnderline: true }}
                    sx={{ fontSize: 12, bgcolor: 'transparent' }}
                    disabled={isUpdatingList}
                    onFocus={() => setDescFocus(true)}
                    onBlur={() => setDescFocus(false)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        (e.target as HTMLFormElement).form?.requestSubmit();
                      }
                    }}
                  />
                </Box>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  <Button
                    variant={dueDate && dayjs(dueDate).isSame(dayjs().startOf('day'), 'day') ? 'contained' : 'outlined'}
                    size="small"
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                    onClick={e => { e.preventDefault(); setDueDate(dayjs().startOf('day').toISOString()); }}
                    disabled={isUpdatingList}
                  >
                    Today
                  </Button>
                  <Button
                    variant={dueDate && dayjs(dueDate).isSame(dayjs().add(1, 'day').startOf('day'), 'day') ? 'contained' : 'outlined'}
                    size="small"
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                    onClick={e => { e.preventDefault(); setDueDate(dayjs().add(1, 'day').startOf('day').toISOString()); }}
                    disabled={isUpdatingList}
                  >
                    Tomorrow
                  </Button>
                  <Button
                    ref={calendarBtnRef}
                    variant={dueDate && !(dayjs(dueDate).isSame(dayjs().startOf('day'), 'day') || dayjs(dueDate).isSame(dayjs().add(1, 'day').startOf('day'), 'day')) ? 'contained' : 'outlined'}
                    size="small"
                    sx={{ borderRadius: 2, minWidth: 36, p: 0 }}
                    onClick={e => { e.preventDefault(); setShowDatePicker(true); }}
                    disabled={isUpdatingList}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
                      <CalendarTodayIcon fontSize="small" />
                    </span>
                  </Button>
                  <DatePicker
                    open={showDatePicker}
                    onClose={() => setShowDatePicker(false)}
                    value={dueDate ? dayjs(dueDate) : null}
                    onChange={v => setDueDate(v ? v.toISOString() : null)}
                    slotProps={{
                      textField: { style: { display: 'none' } },
                      popper: { anchorEl: calendarBtnRef.current },
                    }}
                    disablePast
                  />
                  {dueDate && !(dayjs(dueDate).isSame(dayjs().startOf('day'), 'day') || dayjs(dueDate).isSame(dayjs().add(1, 'day').startOf('day'), 'day')) && (
                    <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: 2, px: 1, minHeight: 32, fontWeight: 500, fontSize: 14, color: 'text.primary', borderColor: 'grey.300', background: 'white' }}
                        disabled
                      >
                        {dayjs(dueDate).format('D MMM')}
                      </Button>
                      <IconButton size="small" sx={{ ml: 0.5 }} onClick={() => setDueDate(null)}>
                        ×
                      </IconButton>
                    </Box>
                  )}
                  <Box sx={{ flexGrow: 1 }} />
                  {isUpdatingList && (
                    <LoadingButton loading variant="text" size="small" sx={{ p: 0, minWidth: 32, ml: 1 }} />
                  )}
                </Stack>
              </Stack>
            </form>
            <IconButton onClick={() => setShowNewForm(false)} disabled={isUpdatingList} sx={{ ml: 1 }}>
              <CancelOutlined />
            </IconButton>
          </ListItem>
        </ClickAwayListener>
      ) : null}
      {isLoadingTasks ? (
        <Stack spacing={1}>
          <Skeleton variant="rounded" height={30} />
          <Skeleton variant="rounded" height={30} />
          <Skeleton variant="rounded" height={30} />
          <Skeleton variant="rounded" height={30} />
          <Skeleton variant="rounded" height={30} />
        </Stack>
      ) : (
        <>
          <Droppable droppableId={`taskList-${taskList.id}`} type="TASK">
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <MaterialList className="gap-1">
                  {sortBy(pendingTasks, "position").map((task, index) => (
                    <Draggable
                      draggableId={`task-${taskList.id}-${task.id}`}
                      index={index}
                      key={task.id}>
                      {(provided, snapshot) => (
                        <Collapse
                          in={true}
                          timeout={newlyAddedTasks.has(task.id) ? 500 : 0}
                          sx={{
                            transformOrigin: 'top',
                          }}
                        >
                          <div
                            ref={provided.innerRef}
                            key={task.id}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: newlyAddedTasks.has(task.id) ? 0 : 1,
                              transition: newlyAddedTasks.has(task.id) ? 'opacity 0.5s ease-out' : 'none',
                            }}
                          >
                            <ItemWrapper
                              moreActions={[
                                {
                                  label: "Delete task",
                                  onClick: () => handleDelete(task),
                                },
                              ]}>
                              <TaskListItem
                                task={task}
                                onDeleteTask={() => handleDelete(task)}
                                onToggleTask={onToggleTask}
                                onUpdateTask={handleUpdate}
                              />
                            </ItemWrapper>
                          </div>
                        </Collapse>
                      )}
                    </Draggable>
                  ))}
                  {notes &&
                    notes.map((note: Note) => (
                      <Collapse
                        in={true}
                        timeout={300}
                        key={note.id}
                      >
                        <ItemWrapper
                          wrapper={Card}
                          wrapperProps={{
                            variant: "outlined",
                            sx: { mt: 0.7 },
                            className: "hover:shadow-lg",
                          }}
                          moreActions={[
                            {
                              label: "Delete note",
                              onClick: () => handleDeleteNote(note),
                            },
                          ]}>
                          <NoteItem
                            note={note}
                            onUpdate={(newNote: Note) => {
                              mutateNotes(notes =>
                                (notes || []).map(
                                  n => (n.id === newNote.id ? newNote : n),
                                  { revalidate: false }
                                )
                              );
                            }}
                            onDelete={() => handleDeleteNote(note)}
                          />
                        </ItemWrapper>
                      </Collapse>
                    ))}
                  {counters &&
                    counters.length > 0 &&
                    counters.map((counter, index) => (
                      <Collapse
                        in={true}
                        timeout={300}
                        key={counter.id}
                      >
                        <ItemWrapper
                          moreActions={[
                            {
                              label: "Delete counter",
                              onClick: () => {
                                deleteCounter(counter.id);
                                mutateCounters(
                                  prev => prev?.filter(c => c.id !== counter.id),
                                  { revalidate: false }
                                );
                              },
                            },
                          ]}>
                          <CounterItem
                            count={
                              countMapping[counter.id]
                                ? (countMapping[counter.id] as any)[
                                    counter.tally_method
                                  ]
                                : 0
                            }
                            key={counter.id}
                            wrapperTag="li"
                            counter={counter}
                            onIncrease={value => handleIncrease(counter, value)}
                            onDelete={console.log}
                            // wrapperProps={state.draggableProps}
                            // isDragging={state.isDragging}
                            onUpdate={console.log}
                            // isHovering={hoveringId === counter.id}
                            // onMouseEnter={() => setHoveringId(counter.id)}
                            // onMouseLeave={() => setHoveringId(null)}
                          />
                        </ItemWrapper>
                      </Collapse>
                    ))}
                </MaterialList>
              </div>
            )}
          </Droppable>
        </>
      )}
    </Paper>
  );
};

const ItemWrapper = ({
  children,
  moreActions,
  wrapper,
  wrapperProps,
}: React.PropsWithChildren<{
  wrapperProps?: any;
  wrapper?: React.FC<any>;
  moreActions: {
    label: string;
    onClick: () => void;
  }[];
}>) => {
  const Wrapper = wrapper ?? Box;
  return (
    <Wrapper
      {...wrapperProps}
      className={
        "group flex justify-start items-stretch " +
        (wrapperProps?.className ?? "")
      }
      sx={{
        "&:hover .handle": {
          display: "flex",
          background: theme.palette.secondary.main,
        },
        transition: "all 0.2s ease-in-out",
        ...wrapperProps?.sx,
      }}>
      <Box
        className="handle rounded-lg w-[2px] h-100 mr-[1px]"
        sx={{
          background: "transparent",
          transition: "background 0.2s ease-in-out",
        }}
      />

      <Box
        className="handle rounded-lg w-[2px] h-100"
        sx={{
          background: "transparent",
          transition: "background 0.2s ease-in-out",
        }}
      />
      {children}
      {moreActions && (
        <Box className="">
          <DropdownMenu
            placement="bottom-end"
            renderTrigger={({ ref, onClick }) => (
              <IconButton
                size="small"
                sx={{ mt: 1.5 }}
                ref={ref}
                onClick={onClick}
                className="invisible group-hover:visible"
                title={`More options`}
                style={{
                  transition: "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out",
                }}>
                <MoreVert />
              </IconButton>
            )}>
            {moreActions.map(item => (
              <MenuItem onClick={item.onClick} key={item.label}>
                {item.label}
              </MenuItem>
            ))}
          </DropdownMenu>
        </Box>
      )}
    </Wrapper>
  );
};
export default TaskListComponent;
