import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
  Mocked,
  Mock,
} from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { AuthedApp } from "../src/App";

import {
  createCounter,
  deleteCounter,
  increaseCounter,
  listCounters,
  updateCounter,
} from "../src/api/counters";
import userEvent from "@testing-library/user-event";


test("increase counter", async () => {
  (listCounters as Mock).mockResolvedValue([
    { id: 123, name: "my counter", count: 0 },
  ]);
  render(<AuthedApp />);
  await screen.findByText(/0/);
  const inc = await screen.findByTitle("Increase 'my counter' by 1");
  (listCounters as Mock).mockResolvedValue([
    { id: 123, name: "my counter", count: 1 },
  ]);
  await userEvent.click(inc);
  await screen.findByText(/1/);
  (listCounters as Mock).mockResolvedValue([
    { id: 123, name: "my counter", count: 2 },
  ]);
  await userEvent.click(inc);
  await screen.findByText(/2/);
  expect(increaseCounter).toBeCalled();
});
