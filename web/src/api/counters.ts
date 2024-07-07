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
  archived: boolean;
  tally_method: keyof CountTally;
}

export interface CountTally {
  sum_1_day: number;
  sum_3_day: number;
  sum_7_day: number;
  sum_30_day: number;
  sum_90_day: number;
  sum_lifetime: number;
}
export interface CountMapping {
  [id: number]: CountTally;
}
export interface Counter extends CounterAttrs {
  readonly id: number;
}

export const listCounters = async () => {
  const { data } = await client
    .from("counters")
    .select()
    .order("sort_index", { ascending: true });
  return data as Counter[];
};

export const createCounter = async (attrs: Partial<Counter>) => {
  await client
    .from("counters")
    .insert({ ...attrs, user_id: await getUserId() });
};

export const archiveCounter = async (id: number) => {
  updateCounter(id, { archived: true });
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

export const increaseCounter = async (counter_id: number, value: number) => {
  await client.from("counter_events").insert({ counter_id, value });
};

export const upsertCounters = async (attrsArr: Partial<CounterAttrs>[]) => {
  const user_id = await getUserId();
  const values = attrsArr.map(v => ({ ...v, user_id }));
  await client.from("counters").upsert(values);
};

export const rearrangeCounters = (
  orderedCounters: Counter[],
  movedCounter: Counter,
  newIndex: number
): Counter[] => {
  const filtered = orderedCounters.filter(
    counter => counter.id !== movedCounter.id
  );
  const part1 = filtered.slice(0, newIndex);
  const part2 = filtered.slice(newIndex);
  return [...part1, movedCounter, ...part2].map((counter, index) => ({
    ...counter,
    sort_index: index,
  }));
};

export const getCounts = async (): Promise<CountMapping> => {
  const { data } = await client.from("view_counts").select();
  const mapping = data?.reduce((acc, count) => {
    const { id: _id, ...values } = count;
    acc[count.id] = values;
    return acc;
  }, {});
  return mapping;
};
