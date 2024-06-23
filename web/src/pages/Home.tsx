import { useEffect, useState } from "react";
import { Button, Drawer, Modal, Statistic, Tooltip, List } from "antd";
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
} from "../api/task_lists";
import TaskList from "../components/tasks/TaskList";
import { IconButton, Stack, TextField } from "@mui/material";
import { Cancel } from "@mui/icons-material";

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
      setShowNewForm(true);
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
    <div className="flex flex-col gap-4 p-4 h-100 flex-grow focus:border-none">
      <Drawer
        title="Create New Counter"
        onClose={() => setShowNewForm(false)}
        open={showNewForm}
        closeIcon={<X strokeWidth={2} size={20} />}
        destroyOnClose
      >
        {showNewForm && (
          <CounterForm
            onSubmit={async (data, { cancelLoading }) => {
              await createCounter(data);
              cancelLoading();
              setShowNewForm(false);
              reload();
            }}
          />
        )}
      </Drawer>
      <Drawer
        destroyOnClose
        title="Edit Counter"
        onClose={() => setEditingId(null)}
        open={!!editingId}
        closeIcon={<X strokeWidth={2} size={20} />}
      >
        {editingCounter && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col w-full items-center justify-center">
              <Statistic
                title="Count"
                value={
                  countMapping[editingCounter.id][editingCounter.tally_method]
                }
              />
              <div className="flex flex-row gap-1">
                <Button
                  className="flex flex-row justify-center items-center"
                  shape="round"
                  type="primary"
                  icon={<Plus size={16} strokeWidth={3} />}
                  onClick={() => handleIncrease(editingCounter, 1)}
                >
                  1
                </Button>
                <Button
                  className="flex flex-row justify-center items-center"
                  shape="round"
                  type="primary"
                  icon={<Plus size={16} strokeWidth={3} />}
                  onClick={() => handleIncrease(editingCounter, 5)}
                >
                  5
                </Button>

                <Button
                  className="flex flex-row justify-center items-center"
                  shape="round"
                  type="primary"
                  onClick={() => handleIncrease(editingCounter, 10)}
                  icon={<Plus size={16} strokeWidth={3} />}
                >
                  10
                </Button>
              </div>
            </div>
            <CounterForm
              defaultValues={editingCounter}
              onSubmit={async (data, { cancelLoading }) => {
                await updateCounter(editingId!, data);
                cancelLoading();
                setEditingId(null);
                reload();
              }}
            />
          </div>
        )}
      </Drawer>

      <Stack direction="row" justifyContent={"start"} gap={1} overflow="scroll">
        {taskLists.map((list) => (
          <TaskList
            key={list.id}
            taskList={list}
            onDeleteTaskList={() => {
              deleteTaskList(list.id);
              const updated = taskLists.filter((tl) => tl.id !== list.id);
              mutateTaskLists(updated, { revalidate: false });
            }}
          />
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
                <Button htmlType="submit">Add list</Button>
                <IconButton type="button" onClick={() => setNewList(false)}>
                  <Cancel />
                </IconButton>
              </form>
            </>
          ) : (
            <>
              <Button onClick={() => setNewList(true)}>Add new list</Button>
            </>
          )}
        </div>
      </Stack>
      <DragDropContext onDragUpdate={handleDrag} onDragEnd={handleDrag}>
        <CounterList
          header={
            <div className="flex flex-row justify-end gap-2">
              <Tooltip
                mouseEnterDelay={1.5}
                placement="topLeft"
                title={
                  <span>
                    Press <span className="kbd kbd-light kbd-xs">n</span> to add
                    a counter
                  </span>
                }
              >
                <Button onClick={() => setShowNewForm(true)}>
                  New counter
                </Button>
              </Tooltip>
            </div>
          }
          tabIndex={0}
          className="flex-grow h-full"
          counters={counters.filter((c) => c.archived === false)}
          countMapping={countMapping}
          noDataFallback={<CounterOnboardingPrompt />}
          renderCounter={(counter, tally, state) => {
            return (
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
                onArchive={async () => {
                  await updateCounter(counter.id, { archived: true });
                  reload();
                }}
                wrapperProps={state.draggableProps}
                isDragging={state.isDragging}
                onEdit={() => setEditingId(counter.id)}
                isHovering={hoveringId === counter.id}
                onMouseEnter={() => setHoveringId(counter.id)}
                onMouseLeave={() => setHoveringId(null)}
              />
            );
          }}
        />
      </DragDropContext>
    </div>
  );
};

export default Home;
