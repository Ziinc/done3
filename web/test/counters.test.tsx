import { expect, test, Mock, describe, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { render, wait } from "./helpers/utils";
import React from "react";
import { AuthedApp } from "../src/App";
import {
  createCounter,
  deleteCounter,
  rearrangeCounters,
  listCounters,
  updateCounter,
  getCounts,
} from "../src/api/counters";
import userEvent from "@testing-library/user-event";
import { counterFixture, countsFixture } from "./helpers/fixtures";

beforeEach(() => {
  (getCounts as Mock).mockResolvedValue(countsFixture());
});
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
    counterFixture({ name: "my counter", notes: "special" }),
  ]);

  await userEvent.click(await screen.findByText("Submit"));
  await wait();
  expect(() => screen.getByPlaceholderText("Name")).toThrow();
  expect(createCounter).toBeCalled();
  await screen.findByText("my counter");
  await screen.findByText("special");
});

test("update counters", async () => {
  (listCounters as Mock).mockResolvedValue([
    counterFixture({ name: "my counter" }),
  ]);
  render(<AuthedApp />);
  await screen.findByText("my counter");
  const more = await screen.findByTitle("More options for 'my counter'");
  await userEvent.click(more);
  await userEvent.click(await screen.findByText(/Edit counter/));
  const input = await screen.findByLabelText("Name");
  await userEvent.type(input, "other name");
  await userEvent.click(await screen.findByText("Submit"));
  expect(updateCounter).toBeCalled();
});

test("list counter", async () => {
  (listCounters as Mock).mockResolvedValue([
    counterFixture({ id: 123, name: "my counter" }),
    counterFixture({ id: 124, name: "other counter" }),
  ]);
  (getCounts as Mock).mockResolvedValue({
    ...countsFixture(1, 123),
    ...countsFixture(1, 124),
  });

  render(<AuthedApp />);
  await screen.findByText("other counter");
  expect(listCounters).toBeCalledTimes(1);
});

test("archive counter", async () => {
  (listCounters as Mock).mockResolvedValue([
    counterFixture({ name: "my counter" }),
  ]);
  render(<AuthedApp />);
  const more = await screen.findByTitle("More options for 'my counter'");
  await userEvent.click(more);
  (listCounters as Mock).mockResolvedValue([
    counterFixture({ name: "archived-counter", archived: true }),
  ]);
  await userEvent.click(await screen.findByText(/Archive counter/));
  expect(updateCounter).toHaveBeenCalledWith(1, { archived: true });
  await userEvent.click(await screen.findByText("Archive"));
  await screen.findByText("archived-counter");
  await screen.findByText("Unarchive");
});
test("delete counter", async () => {
  (listCounters as Mock).mockResolvedValue([
    counterFixture({ name: "my counter" }),
  ]);
  render(<AuthedApp />);
  const more = await screen.findByTitle("More options for 'my counter'");
  (listCounters as Mock).mockResolvedValueOnce([]);
  await userEvent.click(more);
  await userEvent.click(await screen.findByText(/Delete counter/));
  expect(deleteCounter).toBeCalled();
  expect(listCounters).toBeCalledTimes(2);
  expect(screen.findByText("my counter")).rejects.toThrow();
});

describe("kbd shortcuts", () => {
  test("open the new counter form", async () => {
    (listCounters as Mock).mockResolvedValue([]);
    render(<AuthedApp />);
    await userEvent.keyboard("n");
    await screen.findAllByText("Create New Counter");
  });
  test("edit the counter", async () => {
    (listCounters as Mock).mockResolvedValue([
      counterFixture({ name: "my-counter" }),
    ]);
    render(<AuthedApp />);
    await userEvent.pointer({ target: await screen.findByText("my-counter") });
    await userEvent.keyboard("e");
    await screen.findByDisplayValue("my-counter");
  });
});

describe("context menu", () => {
  test("context menu - edit", async () => {
    (listCounters as Mock).mockResolvedValue([
      counterFixture({ name: "my-counter" }),
    ]);
    render(<AuthedApp />);
    await userEvent.pointer({
      target: await screen.findByText("my-counter"),
      keys: "[MouseRight]",
    });
    await userEvent.click(await screen.findByText(/Edit counter/));
    await screen.findByDisplayValue("my-counter");
  });

  test("context menu - delete", async () => {
    (listCounters as Mock).mockResolvedValue([
      counterFixture({ name: "my-counter" }),
    ]);
    render(<AuthedApp />);
    await userEvent.pointer({
      target: await screen.findByText("my-counter"),
      keys: "[MouseRight]",
    });
    (listCounters as Mock).mockResolvedValue([]);
    await userEvent.click(await screen.findByText(/Delete counter/));
    expect(deleteCounter).toBeCalled();
  });

  test("context menu - archive", async () => {
    (listCounters as Mock).mockResolvedValue([
      counterFixture({ name: "my-counter", archived: false }),
    ]);
    render(<AuthedApp />);
    (listCounters as Mock).mockResolvedValue([
      counterFixture({ name: "my-counter", archived: true }),
    ]);
    await userEvent.pointer({
      target: await screen.findByText("my-counter"),
      keys: "[MouseRight]",
    });
    await userEvent.click(await screen.findByText(/Archive counter/));
    expect(updateCounter).toBeCalled()
  });
});
