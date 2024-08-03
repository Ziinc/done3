import axios, { AxiosResponse } from "axios";

export interface Task {
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

const instance = () =>
  axios.create({
    baseURL: "https://tasks.googleapis.com",
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem(
        "oauth_provider_token"
      )}`,
    },
  });
export const getTask = async (
  taskListId: string,
  id: string
): Promise<Task> => {
  return await instance().get(
    `/tasks/v1/users/@me/lists/${taskListId}/tasks/${id}`
  );
};

export const listTasks = async (taskListId: string): Promise<Task[]> => {
  return await instance()
    .get(`/tasks/v1/lists/${taskListId}/tasks`, {params: {
      showAssigned: true, maxResults: 100,
    }})
    .then(res => res.data.items);
};

export const deleteTask = async (taskListId: string, id: string) => {
  return await instance().delete(`/tasks/v1/lists/${taskListId}/tasks/${id}`);
};

export const patchTask = async (
  taskListId: string,
  id: string,
  attrs: Partial<Task>
): Promise<AxiosResponse<Task>> => {
  return await instance().patch(
    `/tasks/v1/lists/${taskListId}/tasks/${id}`,
    attrs
  );
};

export const moveTask = async (
  taskListId: string,
  id: string,
  opts: {
    parent?: string;
    previous?: string;
    destinationTasklist?: string;
  }
) => {
  return await instance().post(
    `/tasks/v1/lists/${taskListId}/tasks/${id}/move`,
    {
      parent: opts.parent,
      previous: opts.previous,
      destinationTasklist: opts.destinationTasklist,
    }
  );
};

export const reorderTaskAsChild = async (
  taskListId: string,
  id: string,
  parent: string,
  sibling?: string
) => {
  return await instance().post(
    `/tasks/v1/lists/${taskListId}/tasks/${id}/move`,
    null,
    {
      params: {
        parent,
        sibling,
      },
    }
  );
};
export const reorderTaskAsTopLevel = async (
  taskListId: string,
  id: string,
  sibling?: string
) => {
  return await instance().post(
    `/tasks/v1/lists/${taskListId}/tasks/${id}/move`,
    null,
    {
      params: {
        parent: null,
        sibling,
      },
    }
  );
};

export const insertTask = async (
  taskListId: string,
  attrs: Partial<Task>,
  parent?: string | null,
  previous?: string | null
) => {
  return await instance().post(`/tasks/v1/lists/${taskListId}/tasks`, attrs, {
    params: {
      parent,
      previous,
    },
  });
};
