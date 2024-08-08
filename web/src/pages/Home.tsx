import { useEffect, useState } from "react";
import {
  Counter,
  createCounter,
  deleteCounter,
  rearrangeCounters,
  increaseCounter,
  listCounters,
  updateCounter,
  upsertCounters,
  getCounts,
  CountMapping,
  CountTally,
} from "../api/counters";
import CounterForm from "../components/CounterForm";
import CounterItem from "../components/CounterItem";
import {
  DragDropContext,
  OnDragEndResponder,
  OnDragUpdateResponder,
} from "react-beautiful-dnd";
import CounterList from "../components/CounterList";
import useSWR, { unstable_serialize } from "swr";
import {
  deleteTaskList,
  insertTaskList,
  listTaskLists,
  patchTaskList,
} from "../api/task_lists";
import TaskList from "../components/tasks/TaskList";
import {
  ClickAwayListener,
  Container,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import { Add, Cancel } from "@mui/icons-material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { useSWRConfig } from "swr";
import { Task, moveTask } from "../api/tasks";
import sortBy from "lodash/sortBy";
const Home: React.FC = () => {
  const { cache, mutate } = useSWRConfig();
  const { data: counters = [], mutate: mutateCounters } = useSWR<Counter[]>(
    "counters",
    () => listCounters(),
    {
      revalidateOnFocus: false,
    }
  );

  const { data: taskLists = [], mutate: mutateTaskLists } = useSWR(
    "tasklists",
    () => listTaskLists(),
    {
      revalidateOnFocus: false,
    }
  );

  const { data: countMapping = {}, mutate: mutateCounts } =
    useSWR<CountMapping>("counts", () => getCounts(), {
      revalidateOnFocus: false,
    });
  const [showNewForm, setShowNewForm] = useState(false);
  const [newList, setNewList] = useState(false);
  const [editingId, setEditingId] = useState<null | number>(null);
  const [hoveringId, setHoveringId] = useState<null | number>(null);
  const [keydown, setKeydown] = useState<string | null>(null);
  const reload = () => {
    mutateCounters();
    mutateCounts();
  };
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

  const handleTaskDrag: OnDragEndResponder &
    OnDragUpdateResponder = async args => {
    const { draggableId, destination } = args;
    if (destination?.index === undefined) return;
    const destinationTaskListId = destination.droppableId.split("-")[1];
    const taskId = draggableId.split("-")[2];
    const sourceTaskListId = draggableId.split("-")[1];
    const destinationIndex = destination.index;

    const destinationTaskListIdSerialized = unstable_serialize([
      "taskslist",
      destinationTaskListId,
    ]);
    const destinationTaskList = cache.get(destinationTaskListIdSerialized);
    const destinationTasks = sortBy(
      destinationTaskList?.data || [],
      "position"
    );

    const sourceTaskListIdSerialized = unstable_serialize([
      "taskslist",
      sourceTaskListId,
    ]);
    const sourceTaskList = cache.get(sourceTaskListIdSerialized);
    const sourceTasks = sourceTaskList?.data || [];
    let prev;
    if (
      destination?.index !== 0 &&
      destinationTaskListId !== sourceTaskListId
    ) {
      prev = destinationTasks.at(destination?.index - 1);
    } else if (
      destination?.index !== 0 &&
      destinationTaskListId === sourceTaskListId
    ) {
      // moving within the same list
      prev = destinationTasks.at(destination?.index);
    }
    // do api call to move the task
    const { data: task } = await moveTask(sourceTaskListId, taskId, {
      parent: undefined,
      previous: prev ? prev.id : null,
      destinationTasklist:
        sourceTaskListId === destinationTaskListId
          ? undefined
          : destinationTaskListId,
    });

    if (sourceTaskListId === destinationTaskListId) {
      await mutate(
        ["taskslist", sourceTaskListId],
        async (tasks: Task[] | undefined) => {
          const filtered = (tasks || []).filter(t => t.id !== taskId);
          filtered.push(task);
          return filtered;
        },
        { revalidate: true }
      );
    } else {
      await mutate(
        ["taskslist", sourceTaskListId],
        async (tasks: Task[] | undefined) => {
          return (tasks || []).filter((t: Task) => t.id !== taskId);
        },
        { revalidate: true }
      );
      await mutate(
        ["taskslist", destinationTaskListId],
        async tasks => {
          const head = tasks.slice(0, destination?.index);
          const tail = tasks.slice(destination?.index, tasks.length);
          tasks.push(task);
          return tasks;
        },
        { revalidate: true }
      );
    }
  };

  const handleCounterDrag: OnDragEndResponder & OnDragUpdateResponder = async ({
    draggableId,
    destination,
  }) => {
    if (destination?.index === undefined) return;
    const strId = draggableId.split("-")[1];
    const id = Number(strId);
    const counterIndex = counters.findIndex(c => c.id === id);

    // return early if no change in pos
    if (counterIndex === destination.index) return;

    const toUpsert = rearrangeCounters(
      counters,
      counters[counterIndex],
      destination.index
    );
    await upsertCounters(toUpsert);
    mutateCounters(toUpsert, { revalidate: false });
  };

  const editingCounter = (counters || []).find(c => c.id === editingId);

  // hotkey management
  useEffect(() => {
    if (!keydown) return;
    if (keydown === "n" && !showNewForm && !editingCounter) {
    } else if (keydown === "e" && hoveringId !== null) {
      setEditingId(hoveringId);
    }
  }, [keydown]);

  const hotkeyHandler = (e: KeyboardEvent) => {
    setKeydown(e.key);
  };

  useEffect(() => {
    document.addEventListener("keydown", hotkeyHandler);
    return () => removeEventListener("keydown", hotkeyHandler, false);
  }, []);

  return (
    <>
      <Grid
        container
        spacing={1}
        direction="row"
        sx={{ overflowX: "scroll" }}
        wrap="nowrap"
        justifyContent={"start"}
        gap={1}
        overflow="scroll"
        flexGrow="inherit">
        <Grid flexGrow="inherit" minWidth={380} xs={12} md={4}>
          <DragDropContext onDragEnd={handleCounterDrag}>
            <CounterList
              onAddCounter={async (data, { cancelLoading }) => {
                await createCounter(data);
                cancelLoading();
                setShowNewForm(false);
                reload();
              }}
              tabIndex={0}
              counters={counters}
              countMapping={countMapping}
              renderCounter={(counter, tally, state) => {
                return (
                  <>
                    <CounterItem
                      key={counter.id}
                      count={tally ? tally[counter.tally_method] : 0}
                      wrapperTag="li"
                      counter={counter}
                      onIncrease={value => handleIncrease(counter, value)}
                      onDelete={async () => {
                        const confirmation = window.confirm(
                          "Delete cannot be undone. Consider archiving instead. Proceed with delete?"
                        );
                        if (!confirmation) return;
                        await deleteCounter(counter.id);
                        reload();
                      }}
                      wrapperProps={state.draggableProps}
                      isDragging={state.isDragging}
                      onEdit={() => setEditingId(counter.id)}
                      isHovering={hoveringId === counter.id}
                      onMouseEnter={() => setHoveringId(counter.id)}
                      onMouseLeave={() => setHoveringId(null)}
                    />
                    {counter.id === editingId && (
                      <ClickAwayListener
                        onClickAway={e => {
                          console.log(e);
                          // maybe submit
                          setEditingId(null);
                        }}>
                        <div className="flex flex-col gap-4">
                          {editingCounter && (
                            <div className="flex flex-col w-full items-center justify-center">
                              <Typography variant="h4">
                                {
                                  countMapping[editingCounter.id][
                                    editingCounter.tally_method
                                  ]
                                }
                              </Typography>
                              <div className="flex flex-row gap-1">
                                <Button
                                  className="flex flex-row justify-center items-center"
                                  variant="contained"
                                  color="primary"
                                  startIcon={<Add />}
                                  onClick={() =>
                                    handleIncrease(editingCounter, 1)
                                  }>
                                  1
                                </Button>
                                <Button
                                  className="flex flex-row justify-center items-center"
                                  variant="contained"
                                  color="primary"
                                  startIcon={<Add />}
                                  onClick={() =>
                                    handleIncrease(editingCounter, 5)
                                  }>
                                  5
                                </Button>

                                <Button
                                  className="flex flex-row justify-center items-center"
                                  variant="contained"
                                  color="primary"
                                  onClick={() =>
                                    handleIncrease(editingCounter, 10)
                                  }
                                  startIcon={<Add />}>
                                  10
                                </Button>
                              </div>
                            </div>
                          )}
                          <CounterForm
                            onCancel={() => setEditingId(null)}
                            defaultValues={editingCounter}
                            onSubmit={async (data, { cancelLoading }) => {
                              await updateCounter(editingId!, data);
                              cancelLoading();
                              setEditingId(null);
                              reload();
                            }}
                          />
                        </div>
                      </ClickAwayListener>
                    )}
                  </>
                );
              }}
            />
          </DragDropContext>
        </Grid>

        <DragDropContext onDragEnd={handleTaskDrag}>
          {taskLists.map(list => (
            <Grid minWidth={380} xs={12} md={4} key={list.id}>
              <TaskList
                key={list.id}
                taskList={list}
                onDeleteTaskList={() => {
                  deleteTaskList(list.id);
                  const updated = taskLists.filter(tl => tl.id !== list.id);
                  mutateTaskLists(updated, { revalidate: false });
                }}
                onUpdateTaskList={async attrs => {
                  patchTaskList(list.id, attrs);
                  const updated = taskLists.map(tl =>
                    tl.id === list.id ? { ...tl, ...attrs } : tl
                  );
                  mutateTaskLists(updated, { revalidate: false });
                }}
              />
            </Grid>
          ))}
        </DragDropContext>
        <div>
          {newList ? (
            <>
              <form
                className="w-48"
                onSubmit={async e => {
                  e.preventDefault();
                  const { data } = await insertTaskList({
                    title: e.currentTarget.taskListTitle.value,
                  });
                  mutateTaskLists([...taskLists, data]);
                }}>
                <TextField label="Title" name="taskListTitle" required />
                <Button variant="outlined" color="secondary" type="submit">
                  Add list
                </Button>
                <IconButton type="button" onClick={() => setNewList(false)}>
                  <Cancel />
                </IconButton>
              </form>
            </>
          ) : (
            <Container sx={{ minWidth: 380, p: 1 }}>
              <Button
                variant="contained"
                sx={{ width: 300 }}
                onClick={() => setNewList(true)}>
                Add new list
              </Button>
            </Container>
          )}
        </div>
      </Grid>
    </>
  );
};

export default Home;
