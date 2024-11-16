import { expect, test, Mock, describe, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { render, wait } from "./helpers/utils";
import React from "react";
import { AuthedApp } from "../src/App";
import {
  insertNote
} from "../src/api/notes";
import userEvent from "@testing-library/user-event";
import { counterFixture, countsFixture } from "./helpers/fixtures";
beforeEach(() => {
  // (getCounts as Mock).mockResolvedValue(countsFixture());
});

test("create note", async () => {
  render(<AuthedApp />);
  const btn = await screen.findByText("Add a note", {selector: "button"});
  await userEvent.click(btn);
  await userEvent.type(await screen.getByLabelText("Title", {selector: "input"}), "my note",);
  await userEvent.type(await screen.getByLabelText("Text", {selector: "input"}), "my text",);

  await userEvent.click(await screen.findByText("Close"));
  await wait();
  expect(() => screen.getByLabelText("Title")).toThrow();
  expect(() => screen.getByLabelText("Text")).toThrow();
  expect(insertNote).toBeCalled();
  await screen.findByText("my note");
  await screen.findByText("my text");
});

// test("update counters", async () => {
//   (listCounters as Mock).mockResolvedValue([
//     counterFixture({ name: "my counter" }),
//   ]);
//   render(<AuthedApp />);
//   const counter = await screen.findByText("my counter");
//   await userEvent.click(counter);
//   await userEvent.type(await screen.findByLabelText(/Name/), "other name");
//   await userEvent.click(await screen.findByText("Submit"));
//   await waitFor(()=>{
//     expect(updateCounter).toBeCalled();
//   })
// });

// test("list counter", async () => {
//   (listCounters as Mock).mockResolvedValue([
//     counterFixture({ id: 123, name: "my counter" }),
//     counterFixture({ id: 124, name: "other counter" }),
//   ]);
//   (getCounts as Mock).mockResolvedValue({
//     ...countsFixture(1, 123),
//     ...countsFixture(1, 124),
//   });

//   render(<AuthedApp />);
//   await screen.findByText("other counter");
//   expect(listCounters).toBeCalledTimes(1);
// });

// test("delete counter", async () => {
//   (listCounters as Mock).mockResolvedValue([
//     counterFixture({ name: "my counter" }),
//   ]);
//   render(<AuthedApp />);
//   const more = await screen.findByTitle("More options for 'my counter'");
//   (listCounters as Mock).mockResolvedValueOnce([]);
//   await userEvent.click(more);
//   await userEvent.click(await screen.findByText(/Delete counter/));
//   expect(deleteCounter).toBeCalled();
//   expect(listCounters).toBeCalledTimes(2);
//   expect(screen.findByText("my counter")).rejects.toThrow();
// });
