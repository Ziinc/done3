import { useEffect, useState } from "react";
import { Drawer, Statistic } from "antd";
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
import useSWR from "swr";
import { Plus, X } from "lucide-react";
import CounterOnboardingPrompt from "../components/CounterOnboardingPrompt";
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
} from "@mui/material";
import Button from "@mui/material/Button";
import { Cancel } from "@mui/icons-material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";

const Home: React.FC = () => {
  let {
    data: counters = [],
    isLoading,
    mutate,
  } = useSWR<Counter[]>("counters", () => listCounters(), {
    revalidateOnFocus: false,
  });

  let {
    data: taskLists = [],
    isLoading: isLoadingTaskLists,
    mutate: mutateTaskLists,
  } = useSWR("tasklists", () => listTaskLists(), {
    revalidateOnFocus: false,
  });

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
    mutate();
    mutateCounts();
  };
  const handleIncrease = async (counter: Counter, value: number) => {
    let updated: CountTally = Object.assign({}, countMapping[counter.id]);
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

  const handleDrag: OnDragEndResponder & OnDragUpdateResponder = async ({
    draggableId,
    destination,
  }) => {
    if (destination?.index === undefined) return;
    const [_resource, strId] = draggableId.split("-");
    const id = Number(strId);
    const counterIndex = counters.findIndex((c) => c.id === id);

    // return early if no change in pos
    if (counterIndex === destination.index) return;

    const toUpsert = rearrangeCounters(
      counters,
      counters[counterIndex],
      destination.index
    );
    await upsertCounters(toUpsert);
    mutate(toUpsert);
  };
  const editingCounter = (counters || []).find((c) => c.id === editingId);

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
        flexGrow="inherit"
      >
        <Grid flexGrow="inherit" minWidth={380} xs={12} md={4}>
          <DragDropContext onDragUpdate={handleDrag} onDragEnd={handleDrag}>
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
              noDataFallback={<CounterOnboardingPrompt />}
              renderCounter={(counter, tally, state) => {
                return (
                  <>
                    <CounterItem
                      key={counter.id}
                      count={tally ? tally[counter.tally_method] : 0}
                      wrapperTag="li"
                      counter={counter}
                      onIncrease={(value) => handleIncrease(counter, value)}
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
                        onClickAway={() => {
                          // maybe submit
                          setEditingId(null);
                        }}
                      >
                        <div className="flex flex-col gap-4">
                          {editingCounter && (
                            <div className="flex flex-col w-full items-center justify-center">
                              <Statistic
                                title="Count"
                                value={
                                  countMapping[editingCounter.id][
                                    editingCounter.tally_method
                                  ]
                                }
                              />
                              <div className="flex flex-row gap-1">
                                <Button
                                  className="flex flex-row justify-center items-center"
                                  variant="contained"
                                  color="primary"
                                  startIcon={<Plus size={16} strokeWidth={3} />}
                                  onClick={() =>
                                    handleIncrease(editingCounter, 1)
                                  }
                                >
                                  1
                                </Button>
                                <Button
                                  className="flex flex-row justify-center items-center"
                                  variant="contained"
                                  color="primary"
                                  startIcon={<Plus size={16} strokeWidth={3} />}
                                  onClick={() =>
                                    handleIncrease(editingCounter, 5)
                                  }
                                >
                                  5
                                </Button>

                                <Button
                                  className="flex flex-row justify-center items-center"
                                  variant="contained"
                                  color="primary"
                                  onClick={() =>
                                    handleIncrease(editingCounter, 10)
                                  }
                                  startIcon={<Plus size={16} strokeWidth={3} />}
                                >
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

        {taskLists.map((list) => (
          <Grid minWidth={380} xs={12} md={4}>
            <TaskList
              key={list.id}
              taskList={list}
              onDeleteTaskList={() => {
                deleteTaskList(list.id);
                const updated = taskLists.filter((tl) => tl.id !== list.id);
                mutateTaskLists(updated, { revalidate: false });
              }}
              onUpdateTaskList={async (attrs) => {
                patchTaskList(list.id, attrs);
                const updated = taskLists.map((tl) =>
                  tl.id === list.id ? { ...tl, ...attrs } : tl
                );
                mutateTaskLists(updated, { revalidate: false });
              }}
            />
          </Grid>
        ))}
        <div>
          {newList ? (
            <>
              <form
                className="w-48"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const { data } = await insertTaskList({
                    title: e.currentTarget.taskListTitle.value,
                  });
                  mutateTaskLists([...taskLists, data]);
                }}
              >
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
                onClick={() => setNewList(true)}
              >
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
