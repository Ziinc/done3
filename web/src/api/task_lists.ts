import { client } from "../utils";

export interface TaskList {
  kind: string;
  id: string;
  etag: string;
  title: string;
  updated: string;
  selfLink: string;
}

export interface List {
  readonly id: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly user_id: string;
  readonly raw: TaskList;
}

export const listTaskLists = async () => {
  return await client.from("lists").select("*");
};
export const getTaskList = async (id: string) => {
  return await client
    .from("lists")
    .select("*")
    .eq("id", id)
    .limit(1)
    .single();

};
export const deleteTaskList = async (id: string) => {
  return await client.functions.invoke<List[]>(`lists/${id}`, {
    method: "DELETE",
  });
};

export const putTaskList = async (
  id: string,
  attrs: Pick<TaskList, "title">
) => {
  return await client.functions
    .invoke<List[]>(`lists/${id}`, {
      method: "PUT",
      body: attrs,
    })
};

export const insertTaskList = async (attrs: Partial<TaskList>) => {
  return await client.functions.invoke<List>(`lists`, {
    method: "POST",
    body: attrs,
  });
};

export const syncTaskLists = async () => {
  return await client.functions.invoke<null>(`lists/sync`, {
    method: "POST",
  });
};