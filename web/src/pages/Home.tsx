import React, { useEffect, useRef, useState } from "react";
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

const Home: React.FC = () => {
  const { data: counters = [], mutate } = useSWR<Counter[]>(
    "counters",
    () => listCounters(),
    { revalidateOnFocus: false }
  );
  const { data: countMapping = {}, mutate: mutateCounts } =
    useSWR<CountMapping>("counts", () => getCounts(), {
      revalidateOnFocus: false,
    });
  const [showNewForm, setShowNewForm] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [editingId, setEditingId] = useState<null | number>(null);
  const [hoveringId, setHoveringId] = useState<null | number>(null);
  const [keydown, setKeydown] = useState<string | null>(null);
  const reload = () => {
    mutate();
    mutateCounts();
  };
  const handleIncrease = async (counter: Counter, value: number) => {
    function getNewMapping(currentMapping: CountMapping, counterId: number) {
      let updated: CountTally = Object.assign({}, currentMapping[counterId]);
      for (const [key, currValue] of Object.entries(updated)) {
        updated[key as keyof CountTally] = currValue + value;
      }
      return { ...currentMapping, [counterId]: updated };
    }
    let mapping = countMapping;
    if (counter.parent_id) {
      // increment the parent as well
      mapping = getNewMapping(mapping, counter.parent_id);
    }

    mapping = getNewMapping(mapping, counter.id);

    await Promise.all([
      increaseCounter(counter.id, value),
      counter.parent_id
        ? increaseCounter(counter.parent_id, value)
        : Promise.resolve(),
      mutateCounts(mapping, { revalidate: false }),
    ]);
    mutateCounts();
  };

  const handleDrag: OnDragEndResponder & OnDragUpdateResponder = async ({
    draggableId,
    destination,
  }) => {
    console.log("counters", counters);
    if (destination?.index === undefined) return;
    const [_resource, strId] = draggableId.split("-");
    const id = Number(strId);
    const counterIndex = counters.findIndex((c) => c.id === id);

    // return early if no change in pos
    console.log("moved", counters[counterIndex]);

    if (counterIndex === destination.index) return;
    const toUpsert = rearrangeCounters(
      counters,
      counters[counterIndex],
      destination.index
    );
    console.log("toUpsert", toUpsert);
    mutate(
      async () => {
        await upsertCounters(toUpsert);
        return listCounters();
      },
      { optimisticData: toUpsert }
    );
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

      <Modal
        title="Counter Archive"
        open={showArchive}
        onCancel={() => setShowArchive(false)}
        okText={false}
        cancelText="Close"
      >
        {showArchive && (
          <List
            rowKey="id"
            bordered
            dataSource={counters.filter((c) => c.archived === true)}
            locale={{ emptyText: "No archived counters yet" }}
            renderItem={(counter) => (
              <List.Item
                className="flex flex-row justify-between"
                actions={[
                  <Button
                    onClick={async () => {
                      await updateCounter(counter.id, { archived: false });
                      reload();
                    }}
                  >
                    Unarchive
                  </Button>,
                ]}
              >
                <span>{counter.name}</span>
              </List.Item>
            )}
          />
        )}
      </Modal>

      <div className="flex flex-row justify-end gap-2">
        <Button onClick={() => setShowArchive(true)}>Archive</Button>
      </div>

      <DragDropContext onDragEnd={handleDrag}>
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
                  className={state.className}
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
                  onSetAsStandalone={async () => {
                    await updateCounter(counter.id, { parent_id: null });
                    reload();
                  }}
                  onSetAsSubcounter={async (parentId) => {
                    await updateCounter(counter.id, { parent_id: parentId });
                    reload();
                  }}
                  previousCounter={state.previousCounter ?? undefined}
                  wrapperProps={state.draggableProps}
                  isDragging={state.isDragging}
                  onEdit={() => setEditingId(counter.id)}
                  isHovering={hoveringId === counter.id}
                  onMouseEnter={() => setHoveringId(counter.id)}
                  onMouseLeave={() => setHoveringId(null)}
                >
                  {state.subcounterChildren}
                  </CounterItem>
            );
          }}
        />
      </DragDropContext>
    </div>
  );
};

export default Home;
