import axios from "npm:axios";

export const getTask = async (
  client: any,
  taskListId: string,
  id: string
): Promise<Task> => {
  return await client.request({
    url: `/tasks/v1/users/@me/lists/${taskListId}/tasks/${id}`,
    method: "GET",
  });
};


interface ListTasksParams {
  completedMax?:string
  completedMin?: string
  dueMax?: string
  dueMin?: string
  maxResults?: number
  pageToken?: string
  showCompleted?: boolean
  showDeleted?: boolean
  showHidden?: boolean
  updatedMin?: string
  showAssigned?: boolean
}
export const listTasks = async (
  client: any,
  taskListId: string,
  params: ListTasksParams = {}
): Promise<Task[]> => {
  return await client.request({
    url:
      `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`,
    method: "GET",
    params: {
      maxResults: 100,
      showAssigned: true,
      ...params
    }
  });
};

export const listAllTasks = async (client: any, taskListId: string, params: ListTasksParams = {})=>{

  let rawTasks = [];
  let emptyPageReceived = false;
  let nextPageToken = undefined;
  let attempts = 0;
  while (
    (attempts == 0 && !nextPageToken && !emptyPageReceived) ||
    (attempts < 50 && nextPageToken && !emptyPageReceived) 
  ) {
    attempts += 1
    const {data: result} = await listTasks(client, taskListId, {...params, pageToken: nextPageToken})

    if (result.nextPageToken) {
      console.log('setting next page token')
      nextPageToken = result.nextPageToken;
    } 
    if (result.items.length === 0) {
      console.log('empty page received')
      emptyPageReceived = true;
    } else {
      rawTasks = rawTasks.concat(result.items);
    }
  }

  return rawTasks
}



export const deleteTask = async (
  client: any,
  taskListId: string,
  id: string
) => {
  return await client.request({
    url: `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${id}`,
    method: "DELETE",
  });
};

export const patchTask = async (
  client: any,
  taskListId: string,
  id: string,
  attrs: Partial<Task>
) => {
  return await client.request({
    url: `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${id}`,
    method: "PATCH",
    body: JSON.stringify(attrs),
    // For some reason, will give a Request configuration is invalid if this is not provided.
    headers: {
      'Content-Type': "application/json"
    },
  });
};

export const moveTask = async (
  client: any,
  taskListId: string,
  id: string,
  opts: {
    parent?: string;
    previous?: string;
    destinationTasklist?: string;
  }
) => {
  return await client.request({
    url: `https://tasks.googleapis.com//tasks/v1/lists/${taskListId}/tasks/${id}/move`,
    method: "POST",
    body: JSON.stringify({
      parent: opts.parent,
      previous: opts.previous,
      destinationTasklist: opts.destinationTasklist,
    }),
  });
};

export const reorderTaskAsChild = async (
  client: any,
  taskListId: string,
  id: string,
  parent: string,
  sibling?: string
) => {
  const qp = new URLSearchParams({
    parent,
    sibling,
  });

  return await client.request({
    url: `https://tasks.googleapis.com//tasks/v1/lists/${taskListId}/tasks/${id}/move?${qs.toString()}`,
    method: "POST",
  });
};

export const insertTask = async (
  client: any,
  taskListId: string,
  attrs: Partial<Task>,
  parent = "",
  previous = ""
) => {
  const qs = new URLSearchParams({
    parent,
    previous,
  });

  return await client.request({
    url: `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?${qs.toString()}`,
    method: "POST",
    body: JSON.stringify(attrs),
  });
};
