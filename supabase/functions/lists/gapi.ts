export interface TaskList {
  kind: string;
  id: string;
  etag: string;
  title: string;
  updated: string;
  selfLink: string;
}

export const listTaskLists = async (
  client: any,
  pageToken?: string
): Promise<TaskList[]> => {
   return await client.request({
    url: `https://tasks.googleapis.com/tasks/v1/users/@me/lists`,
    method: "GET",
    params: {
      maxResults: 100,
      pageToken,
    },
  });
};

export const listAllTaskLists = async (client) =>{
  let rawLists = [];
  let emptyPageReceived = false;
  let nextPageToken = undefined;
  let attempts = 0;
  while (
    (attempts == 0 && !nextPageToken && !emptyPageReceived) ||
    (attempts < 50 && nextPageToken && !emptyPageReceived) 
  ) {
    attempts += 1
    const {data: result} = await listTaskLists(client, nextPageToken)

    if (result.nextPageToken) {
      console.log('setting next page token')
      nextPageToken = result.nextPageToken;
    } 
    if (result.items.length === 0) {
      console.log('empty lists page received')
      emptyPageReceived = true;
    } else {
      rawLists = rawLists.concat(result.items);
    }
  }

  return rawLists
}



export const getTaskList = async (
  client: any,
  id: string
): Promise<TaskList> => {
  return await client.request({
    url: `https://tasks.googleapis.com/tasks/v1/users/@me/lists/${id}`,
    method: "GET",
  });
};
export const deleteTaskList = async (client: any, id: string) => {
  return await client.request({
    url: `https://tasks.googleapis.com/tasks/v1/users/@me/lists/${id}`,
    method: "DELETE",
  });
};

export const patchTaskList = async (
  client: any,
  id: string,
  attrs: Pick<TaskList, "title">
) => {
  return await client.request({
    url: `https://tasks.googleapis.com/tasks/v1/users/@me/lists/${id}`,
    method: "PUT",
    body: JSON.stringify({ ...attrs, id }),
  });
};

export const insertTaskList = async (client: any, attrs: Partial<TaskList>) => {
  return await client.request({
    url: `https://tasks.googleapis.com/tasks/v1/users/@me/lists`,
    method: "POST",
    body: JSON.stringify(attrs),
  });
};
