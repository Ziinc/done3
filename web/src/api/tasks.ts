import axios, { AxiosResponse } from "axios";
import { client } from "../utils";
import { ListOrdered } from "lucide-react";

export interface Task {
  raw: TaskRaw;
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}
export interface TaskRaw {
  readonly kind: string;
  readonly id: string;
  readonly etag: string;
  title: string;
  readonly updated: string;
  readonly selfLink: string;
  parent: string;
  position: string;
  notes: string;
  status: "needsAction" | "completed";
  due: string;
  completed: string;
  deleted: boolean;
  hidden: boolean;
  links: [
    {
      type: string;
      description: string;
      link: string;
    },
  ];
  webViewLink: string;
}

export const getTask = async (id: string) => {
  return await client
    .from<"tasks", Task>("tasks")
    .select("*")
    .eq("id", id)
    .limit(1)
    .single();
};

export const listTasks = async (listId: string) => {
  return await client
    .from("tasks")
    .select("*")
    .eq("list_id", listId)
    .limit(1000);
};

export const deleteTask = async (id: string) => {
  return await client.functions.invoke(`tasks/${id}`, {
    method: "DELETE",
  });
};

export const patchTask = async (id: string, attrs: Partial<TaskRaw>) => {
  return await client.functions.invoke<Task>(`tasks/${id}`, {
    method: "PATCH",
    body: attrs,
  });
};

export const moveTask = async (
  id: string,
  opts: {
    parent?: string;
    previous?: string;
    destinationTasklist?: string;
  }
) => {
  return await client.functions.invoke<Task>(`tasks/${id}/move`, {
    method: "POST",
    body: opts,
  });
};

// export const reorderTaskAsChild = async (
//   taskListId: string,
//   id: string,
//   parent: string,
//   sibling?: string
// ) => {
//   return await instance().post(
//     `/tasks/v1/lists/${taskListId}/tasks/${id}/move`,
//     null,
//     {
//       params: {
//         parent,
//         sibling,
//       },
//     }
//   );
// };
// export const reorderTaskAsTopLevel = async (
//   taskListId: string,
//   id: string,
//   sibling?: string
// ) => {
//   return await instance().post(
//     `/tasks/v1/lists/${taskListId}/tasks/${id}/move`,
//     null,
//     {
//       params: {
//         parent: null,
//         sibling,
//       },
//     }
//   );
// };

export const insertTask = async (
  listId: string,
  attrs: Partial<TaskRaw>,
  parent?: string | null,
  previous?: string | null
) => {
  return await client.functions.invoke(`tasks`, {
    method: "POST",
    body: { list_id: listId, task: attrs, parent, previous },
  });
};
