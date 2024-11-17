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
  ClickAwayListener,
  IconButton,
  List as MaterialList,
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
} from "@mui/icons-material";
import { useMemo, useState } from "react";
import TaskListItem from "./Task";
import { Draggable, Droppable } from "react-beautiful-dnd";
import sortBy from "lodash/sortBy";
import { useAuth } from "../Auth";
import { Note, insertNote, listNotes } from "../../api/notes";
import NoteItem from "../NoteItem";
import CounterForm, { CounterFormProps } from "../CounterForm";
import {
  CountMapping,
  CountTally,
  Counter,
  createCounter,
  getCounts,
  increaseCounter,
  listCounters,
} from "../../api/counters";
import CounterItem from "../CounterItem";
import DropdownMenu from "../DropdownMenu";
import { LoadingButton } from "@mui/lab";
import theme from "../../theme";
import CenteredModal from "../CenteredModal";
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
  const [showNewForm, setShowNewForm] = useState(false);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [newNoteAttrs, setNewNoteAttrs] = useState({
    title: "",
    text: "",
  });
  const [showNewCounterForm, setShowNewCounterForm] = useState(false);

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

  return (
    <Paper
      elevation={1}
      sx={{ borderRadius: 3, p: 2, flexGrow: "inherit", height: "100%" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">{taskList.raw.title}</Typography>

        <DropdownMenu
          renderTrigger={({ ref, onClick }) => (
            <Button
              ref={ref}
              onClick={onClick}
              variant="text"
              startIcon={<MoreVert />}
              title={`More options for list '${taskList.raw.title}'`}></Button>
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
        {editingTitle && (
          <Modal
            open={editingTitle}
            onClose={() => setEditingTitle(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description">
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 600,
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
              }}>
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  setIsUpdatingList(true);
                  await onUpdateTaskList({
                    title: (e.currentTarget as any).listTitle.value,
                  });
                  setEditingTitle(false);
                  setIsUpdatingList(false);
                }}>
                <Stack
                  direction="column"
                  gap={4}
                  justifyContent="start"
                  alignItems="start">
                  <TextField
                    name="listTitle"
                    label="List title"
                    defaultValue={taskList.raw.title}
                  />
                  <LoadingButton
                    variant="contained"
                    loading={isUpdatingList}
                    type="submit">
                    Submit
                  </LoadingButton>
                </Stack>
              </form>
            </Box>
          </Modal>
        )}
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
      <Button startIcon={<AddTask />} onClick={() => setShowNewForm(true)}>
        Add a task
      </Button>
      <Button startIcon={<NoteAdd />} onClick={() => setShowNewNoteForm(true)}>
        Add a note
      </Button>

      <Button
        startIcon={<PlusOne />}
        onClick={() => setShowNewCounterForm(true)}>
        Add a counter
      </Button>

      {showNewNoteForm && (
        <form
          onSubmit={async e => {
            e.preventDefault();
            const { data: result } = await insertNote({
              ...newNoteAttrs,
              list_id: taskList.id,
            });
            if (result && result.data) {
              await mutateNotes(
                (notes: any) => {
                  const newNotes = [...(notes || []), result.data];
                  return newNotes;
                },
                {
                  revalidate: false,
                }
              );
            }
            setShowNewNoteForm(false);
            setNewNoteAttrs({ title: "", text: "" });
          }}>
          <TextField
            label="Title"
            id="noteTitle"
            name="noteTitle"
            type="text"
            variant="standard"
            onChange={e =>
              setNewNoteAttrs(prev => ({ ...prev, title: e.target.value }))
            }
          />
          <TextField
            label="Text"
            id="noteText"
            name="noteText"
            type="text"
            variant="standard"
            minRows={5}
            maxRows={10}
            onChange={e =>
              setNewNoteAttrs(prev => ({ ...prev, text: e.target.value }))
            }
          />
          <Button type="submit">Close</Button>
        </form>
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
          <form
            onSubmit={async e => {
              e.preventDefault();
              setIsUpdatingList(true);
              const title = e.currentTarget.taskTitle.value;
              const { data: returned } = await insertTask(taskList.id, {
                title,
              });
              mutateTasks([returned, ...tasks]);
              setIsUpdatingList(false);
              setShowNewForm(false);
            }}>
            <TextField
              disabled={isUpdatingList}
              name="taskTitle"
              label="Task title"
              variant="outlined"
            />
            <IconButton
              onClick={() => setShowNewForm(false)}
              disabled={isUpdatingList}>
              <CancelOutlined />
            </IconButton>

            <LoadingButton loading={isUpdatingList} type="submit">
              Add
            </LoadingButton>
          </form>
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
                <MaterialList>
                  {sortBy(pendingTasks, "position").map((task, index) => (
                    <Draggable
                      draggableId={`task-${taskList.id}-${task.id}`}
                      index={index}
                      key={task.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          key={task.id}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}>
                          <ItemWrapper>
                            <TaskListItem
                              task={task}
                              onDeleteTask={() => handleDelete(task)}
                              onToggleTask={onToggleTask}
                              onUpdateTask={handleUpdate}
                            />
                          </ItemWrapper>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  <div>
                    {completedTasks.length > 0 && (
                      <Button
                        variant="text"
                        startIcon={
                          <ChevronRightSharp
                            sx={{
                              rotate: showCompleted ? "90deg" : 0,
                            }}
                          />
                        }
                        onClick={() => setShowCompleted(!showCompleted)}>
                        <Typography
                          variant="subtitle1"
                          className="text-gray-600">
                          Completed ({completedTasks.length})
                        </Typography>
                      </Button>
                    )}
                    {provided.placeholder}

                    {showCompleted &&
                      completedTasks.map((task, index) => (
                        <TaskListItem
                          key={task.id}
                          task={task}
                          onDeleteTask={() => handleDelete(task)}
                          onToggleTask={onToggleTask}
                          onUpdateTask={handleUpdate}
                        />
                      ))}
                  </div>
                </MaterialList>
                {notes &&
                  notes.map((note: Note) => (
                    <ItemWrapper key={note.id}>
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
                        onDelete={() => {
                          mutateNotes(notes =>
                            notes?.filter(n => n.raw.name !== note.raw.name)
                          );
                        }}
                      />
                    </ItemWrapper>
                  ))}

                {counters &&
                  counters.length > 0 &&
                  counters.map((counter, index) => (
                    <ItemWrapper>
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
                  ))}
              </div>
            )}
          </Droppable>
        </>
      )}
    </Paper>
  );
};

const ItemWrapper = ({ children }: React.PropsWithChildren<{}>) => {
  return (
    <Box
      className="flex justify-start items-stretch"
      sx={{
        "&:hover .handle": {
          display: "flex",
          background: theme.palette.secondary.main,
        },
      }}>
      <Box
        className="handle rounded-lg w-[2px] h-100 mr-[1px]"
        sx={{
          background: "transparent",
        }}
      />

      <Box
        className="handle rounded-lg w-[2px] h-100"
        sx={{
          background: "transparent",
        }}
      />
      {children}
    </Box>
  );
};
export default TaskListComponent;
