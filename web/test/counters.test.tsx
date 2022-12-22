import {
  expect,
  test,
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

test("create counter", async () => {
  render(<AuthedApp />);
  const btn = await screen.findByText("New counter");
  await userEvent.click(btn);
  const input = await screen.findByPlaceholderText("Name");
  await userEvent.type(input, "my counter");

  (listCounters as Mock).mockResolvedValue([{ id: 123, name: "my counter" }]);

  await userEvent.click(await screen.findByText("Submit"));
  expect(()=> screen.getByPlaceholderText("Name")).toThrow();
  expect(createCounter).toBeCalled();
  await screen.findByText("my counter");
});

test("update counters", async () => {
  (listCounters as Mock).mockResolvedValue([{ id: 123, name: "my counter" }]);
  render(<AuthedApp />);
  await screen.findByText("my counter");
  const more = await screen.findByTitle("More options for 'my counter'");
  await userEvent.click(more);
  await userEvent.click(await screen.findByText("Edit"));
  const input = await screen.findByLabelText("Name");
  await userEvent.type(input, "other name");
  await userEvent.click(await screen.findByText("Submit"));
  expect(updateCounter).toBeCalled();
});

test("list counter", async () => {
  (listCounters as Mock).mockResolvedValue([
    { id: 123, name: "my counter" },
    { id: 124, name: "other counter" },
  ]);
  render(<AuthedApp />);
  await screen.findByText("other counter");
  expect(listCounters).toBeCalledTimes(1);
});
test("delete counter", async () => {
  (listCounters as Mock).mockResolvedValue([
    { id: 123, name: "my counter" },
  ]);
  render(<AuthedApp />);
  const more = await screen.findByTitle("More options for 'my counter'");
  (listCounters as Mock).mockResolvedValueOnce([]);
  await userEvent.click(more);
  await userEvent.click(await screen.findByText("Delete"));
  expect(deleteCounter).toBeCalled();
  expect(listCounters).toBeCalledTimes(2);
  expect(screen.findByText("my counter")).rejects.toThrow();
});
