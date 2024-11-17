import { Counter } from "../../src/api/counters";
import { Note, NoteParam } from "../../src/api/notes";
import { List, TaskList } from "../../src/api/task_lists";

export const counterFixture = (attrs: Partial<Counter> = {}): Counter => {
  return {
    id: 1,
    name: "my counter",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "123-123",
    sort_index: 1,
    target: 1,
    archived: false,
    notes: null,
    tally_method: "sum_1_day",
    ...attrs,
  };
};

export const listFixture = (attrs: Partial<List> = {}): List => {
  return {
    id: "some-uuid",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "123-123",
    ...attrs,
    raw: {
      kind: "list",
      id: "somegoogleuuid",
      etag: "someetag",
      title: "some title",
      updated: new Date().toISOString(),
      selfLink: "somelink",
      ...(attrs.raw || {}),
    },
  };
};

export const noteFixture = (attrs: Partial<NoteParam> = {}): Note => {
  return {
    id: "some-uuid",
    user_id: "123-123",
    ...attrs,
    raw: {
      name: "somegoogleuuid",
      createTime:  new Date().toISOString(),
      updateTime:  new Date().toISOString(),
      trashTime: null,
      trashed: false,
      attachments: [],
      permissions: [],
      title: attrs.title,
      body: {
        text: {text: attrs.text},
        list: {listItems: []}
      },
    },
  };
};

export const countsFixture = (value: number = 1, counterId: number = 1) => ({
  [counterId]: {
    sum_1_day: value,
    sum_3_day: value,
    sum_7_day: value,
    sum_30_day: value,
    sum_90_day: value,
    sum_lifetime: value,
  },
});
