import { Counter } from "../../src/api/counters";

export const counterFixture = (attrs: Partial<Counter> = {}): Counter => {
  return {
    id: 1,
    name: "my counter",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    count: 1,
    user_id: "123-123",
    sort_index: 1,
    target: 1,
    archived: false,
    notes: null,
    ...attrs,
  };
};
