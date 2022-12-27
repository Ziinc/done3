import { useState } from "react";
import { Button, Drawer } from "antd";
import {
  Counter,
  createCounter,
  deleteCounter,
  rearrangeCounters,
  increaseCounter,
  listCounters,
  updateCounter,
  upsertCounters,
  CounterAttrs,
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
import { X } from "lucide-react";

const Home: React.FC = () => {
  const { data: counters = [], mutate } = useSWR<Counter[]>("counters", () =>
    listCounters()
  );
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<null | number>(null);

  const reload = () => {
    mutate();
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
    const upsertAttrs = toUpsert.map((counter): CounterAttrs => {
      const { count, ...rest } = counter;
      return rest;
    });
    await upsertCounters(upsertAttrs);
    mutate(toUpsert);
  };

  return (
    <div className="flex flex-col gap-4 p-4 h-100 flex-grow">
      <Drawer
        title="New Counter"
        width={520}
        onClose={() => setShowNewForm(false)}
        open={showNewForm}
        closeIcon={<X strokeWidth={2} size={20} />}
        destroyOnClose
      >
        <CounterForm
          onSubmit={async (data) => {
            await createCounter(data);
            setShowNewForm(false);
            reload();
          }}
        />
      </Drawer>
      <Drawer
        destroyOnClose
        title="Edit Counter"
        width={520}
        onClose={() => setEditingId(null)}
        open={!!editingId}
        closeIcon={<X strokeWidth={2} size={20} />}
      >
        <CounterForm
          defaultValues={(counters || []).find((c) => c.id === editingId)}
          onSubmit={async (data) => {
            await updateCounter(editingId!, data);
            setEditingId(null);
            reload();
          }}
        />
      </Drawer>

      <div className="flex flex-row justify-end gap-2">
        <Button onClick={() => setShowNewForm(true)}>New counter</Button>
      </div>

      <DragDropContext onDragUpdate={handleDrag} onDragEnd={handleDrag}>
        <CounterList
          className="flex-grow h-full"
          counters={counters}
          renderCounter={(counter) => (
            <CounterItem
              key={counter.id}
              wrapperTag="li"
              counter={counter}
              onIncrease={async () => {
                await increaseCounter(counter.id);
                const index = counters.findIndex((c) => c.id === counter.id);
                const updated = {
                  ...counters[index],
                  count: counters[index].count + 1,
                };
                const newArr = counters.map((c) =>
                  c.id === counter.id ? updated : c
                );
                mutate(newArr);
              }}
              onDelete={async () => {
                await deleteCounter(counter.id);
                reload();
              }}
              onEdit={() => setEditingId(counter.id)}
              className=""
            />
          )}
        />
      </DragDropContext>
    </div>
  );
};

export default Home;
