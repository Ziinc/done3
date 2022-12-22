import { client } from "../utils";
import { getUserId } from "./auth";

export interface Counter {
  id: number;
  name: string;
  count: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}
export const listCounters = async () => {
  const { data } = await client
    .from("view_counters")
    .select()
  return data as Counter[];
};

export const createCounter = async (attrs: Partial<Counter>) => {
  await client
    .from("counters")
    .insert({ ...attrs, user_id: await getUserId() });
};

export const updateCounter = async (id: number, attrs: Partial<Counter>) => {
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
