import { useEffect, useState } from "react";
import { Button, Form, Input, Dropdown } from "antd";
import {
  Counter,
  createCounter,
  deleteCounter,
  increaseCounter,
  listCounters,
  updateCounter,
} from "../api/counters";
import CounterForm from "../components/CounterForm";
import CounterItem from "../components/CounterItem";

const Home: React.FC = () => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<null | number>(null);
  const [counters, setCounters] = useState<Counter[]>([]);

  const reload = async () => {
    const result = await listCounters();
    setCounters(result);
  };
  useEffect(() => {
    reload();
  }, []);

  return (
    <>
      <Button onClick={() => setShowNewForm(true)}>New counter</Button>
      {showNewForm && (
        <div>
          <CounterForm
            onSubmit={async (data) => {
              await createCounter(data);
              setShowNewForm(false);
              reload();
            }}
          />
        </div>
      )}
      {editingId && (
        <CounterForm
          defaultValues={counters.find((c) => c.id === editingId)}
          onSubmit={async (data) => {
            await updateCounter(editingId, data);
            setEditingId(null);
            reload();
          }}
        />
      )}
      <ul className="flex flex-col gap-4">
        {counters.map((counter: Counter) => (
          <CounterItem
            key={counter.id}
            wrapperTag="li"
            counter={counter}
            onIncrease={async () => {
              await increaseCounter(counter.id);
              reload();
            }}
            onDelete={async () => {
              await deleteCounter(counter.id);
              reload();
            }}
            onEdit={() => setEditingId(counter.id)}
          />
        ))}
      </ul>
    </>
  );
};

export default Home;
