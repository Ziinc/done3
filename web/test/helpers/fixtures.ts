import { Counter } from "../../src/api/counters";

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

export const countsFixture = (value: number = 1,counterId: number = 1) => ({
  [counterId]: {
    sum_1_day: value,
    sum_3_day: value,
    sum_7_day: value,
    sum_30_day: value,
    sum_90_day: value,
    sum_lifetime: value,
  },
});
