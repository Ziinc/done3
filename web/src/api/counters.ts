import { client } from "../utils";
import { getUserId } from "./auth";

export interface CounterAttrs {
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  sort_index: number;
  target: number;
  notes: string;
}
export interface Counter extends CounterAttrs {
  readonly id: number;
  readonly count: number;
}

export const listCounters = async () => {
  const { data } = await client
    .from("view_counters")
    .select()
    .order("sort_index");
  return data as Counter[];
};

export const createCounter = async (attrs: Partial<Counter>) => {
  await client
    .from("counters")
    .insert({ ...attrs, user_id: await getUserId() });
};

export const updateCounter = async (
  id: number,
  attrs: Partial<CounterAttrs>
) => {
  await client
    .from("counters")
    .update({ ...attrs, user_id: await getUserId() })
    .eq("id", id);
};

export const deleteCounter = async (id: number) => {
  await client.from("counters").delete().eq("id", id);
};

export const increaseCounter = async (counter_id: number) => {
  await client.from("counter_events").insert({ counter_id });
};

export const upsertCounters = async (attrsArr: Partial<CounterAttrs>[]) => {
  const user_id = await getUserId();
  const values = attrsArr.map((v) => ({ ...v, user_id }));
  await client.from("counters").upsert(values);
};

export const rearrangeCounters = (
  orderedCounters: Counter[],
  movedCounter: Counter,
  newIndex: number
): Counter[] => {
  const filtered = orderedCounters.filter(
    (counter) => counter.id !== movedCounter.id
  );
  const part1 = filtered.slice(0, newIndex);
  const part2 = filtered.slice(newIndex);
  return [...part1, movedCounter, ...part2].map((counter, index) => ({
    ...counter,
    sort_index: index,
  }));
};
