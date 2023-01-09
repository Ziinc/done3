import { expect, test, Mock, describe, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render, wait } from "./helpers/utils";
import React from "react";
import { AuthedApp } from "../src/App";
import {
  createCounter,
  deleteCounter,
  rearrangeCounters,
  listCounters,
  updateCounter,
} from "../src/api/counters";
import userEvent from "@testing-library/user-event";
import { counterFixture } from "./helpers/fixtures";

describe("api & context", () => {
  test("rearrangeCounters", () => {
    (rearrangeCounters as Mock).mockRestore();
    let counters = [0, 1, 2, 3].map((v) =>
      counterFixture({ id: v, sort_index: v })
    );
    let newOrder = rearrangeCounters(counters, counters[2], 0);
    expect(newOrder[0]).toMatchObject({ id: 2, sort_index: 0 });
    expect(newOrder[1]).toMatchObject({ id: 0, sort_index: 1 });
    expect(newOrder[2]).toMatchObject({ id: 1, sort_index: 2 });
    expect(newOrder[3]).toMatchObject({ id: 3, sort_index: 3 });

    // move down
    newOrder = rearrangeCounters(counters, counters[0], 2);
    expect(newOrder[0]).toMatchObject({ id: 1, sort_index: 0 });
    expect(newOrder[1]).toMatchObject({ id: 2, sort_index: 1 });
    expect(newOrder[2]).toMatchObject({ id: 0, sort_index: 2 });
    expect(newOrder[3]).toMatchObject({ id: 3, sort_index: 3 });
  });
});

test("onboarding", async () => {
  (listCounters as Mock).mockResolvedValue([]);
  render(<AuthedApp />);
  await screen.findByText(/Create a new counter/);
});

test("create counter", async () => {
  (listCounters as Mock).mockResolvedValue([]);
  render(<AuthedApp />);
  const btn = await screen.findByText("New counter");
  await userEvent.click(btn);
  const input = await screen.findByPlaceholderText("Name");
  await userEvent.type(input, "my counter");

  await userEvent.type(
    await screen.findByLabelText("Notes"),
    "special counter"
  );

  (listCounters as Mock).mockResolvedValue([
    { id: 123, name: "my counter", notes: "special" },
  ]);

  await userEvent.click(await screen.findByText("Submit"));
  await wait();
  expect(() => screen.getByPlaceholderText("Name")).toThrow();
  expect(createCounter).toBeCalled();
  await screen.findByText("my counter");
  await screen.findByText("special");
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
  (listCounters as Mock).mockResolvedValue([{ id: 123, name: "my counter" }]);
  render(<AuthedApp />);
  const more = await screen.findByTitle("More options for 'my counter'");
  (listCounters as Mock).mockResolvedValueOnce([]);
  await userEvent.click(more);
  await userEvent.click(await screen.findByText("Delete"));
  expect(deleteCounter).toBeCalled();
  expect(listCounters).toBeCalledTimes(2);
  expect(screen.findByText("my counter")).rejects.toThrow();
});

describe("kbd shortcuts", () => {
  test("open the new counter form", async () => {
    (listCounters as Mock).mockResolvedValue([]);
    render(<AuthedApp />);
    await userEvent.type(await screen.findByText("New counter"), "n");
    await screen.findAllByText("Create New Counter");
  });
});
