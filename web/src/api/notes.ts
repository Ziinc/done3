import axios, { AxiosResponse } from "axios";
import { client } from "../utils";
interface NoteParam {
  title?: string;
  text?: string;
}

export interface Note {
  readonly id: string;
  readonly user_id: string;
  raw: NoteRaw;
}
export interface NoteRaw {
  name: string;
  createTime: string;
  updateTime: string;
  trashTime: string;
  trashed: boolean;
  attachments: [
    {
      name: string;
      mimeType: [string];
    },
  ];
  permissions: object[];
  title?: string;
  body: {
    text: {
      text: string;
    };
    list: {
      listItems: [
        {
          childListItems: [
            {
              text: {
                text: string;
              };
              checked: boolean;
            },
          ];
          text: {
            text: string;
          };
          checked: boolean;
        },
      ];
    };
  };
}

// const instance = () =>
//   axios.create({
//     baseURL: "https://keep.googleapis.com",
//     headers: {
//       Authorization: `Bearer ${window.localStorage.getItem(
//         "oauth_provider_token"
//       )}`,
//     },
//   });
export const listNotes = async () => {
  return client.functions
    .invoke<Note[]>("notes", {
      // body: JSON.stringify({ foo: 'bar' })
      method: "GET",
    })
    .then(result => result.data);
};

export const deleteNote = async (uuid: string) => {
  return client.functions.invoke<Note[]>(`notes/${uuid}`, {
    // body: JSON.stringify({ foo: 'bar' })
    method: "DELETE",
  });
};

export const updateNote = async (uuid: string, attrs: NoteParam) => {
  return client.functions
    .invoke<Note>(`notes/${uuid}`, {
      body: {
        title: attrs?.title,
        body: attrs.text
          ? {
              text: { text: attrs?.text },
            }
          : undefined,
      },
      method: "PUT",
    })
    .then(result => result.data);
};

export const insertNote = async (attrs: NoteParam) => {
  return client.functions.invoke<Note>(`notes`, {
    body: {
      title: attrs?.title,
      body: attrs.text
        ? {
            text: { text: attrs?.text },
          }
        : undefined,
    },
    method: "POST",
  });
};
