import axios from "axios";

export interface TaskList {
  kind: string;
  id: string;
  etag: string;
  title: string;
  updated: string;
  selfLink: string;
}

const instance = () =>
  axios.create({
    baseURL: "https://tasks.googleapis.com",
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem(
        "oauth_provider_token"
      )}`,
    },
  });

export const listTaskLists = async (): Promise<TaskList[]> => {
  return await instance()
    .get(`/tasks/v1/users/@me/lists`)
    .then(
      (res: {
        data: {
          etag: string;
          kind: string;
          items: TaskList[];
        };
      }) => res.data.items
    );
};
export const getTaskList = async (id: string): Promise<TaskList> => {
  return await instance().get(`/tasks/v1/users/@me/lists/${id}`);
};
export const deleteTaskList = async (id: string) => {
  return await instance().delete(`/tasks/v1/users/@me/lists/${id}`);
};

export const patchTaskList = async (
  id: string,
  attrs: Pick<TaskList, "title">
) => {
  return await instance().patch(`/tasks/v1/users/@me/lists/${id}`, attrs);
};

export const insertTaskList = async (attrs: Partial<TaskList>) => {
  return await instance().post("/tasks/v1/users/@me/lists", attrs);
};
