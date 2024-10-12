import { expect, test, Mock, describe, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { render, wait } from "./helpers/utils";
import React from "react";
import { AuthedApp } from "../src/App";
import {
  createCounter,
  deleteCounter,
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
  test("rearrangeCounters", async () => {
    const { rearrangeCounters } = await vi.importActual<any>("../src/api/counters");
    // (rearrangeCounters as Mock).mockRestore();
    console.log(rearrangeCounters);
    let counters = [0, 1, 2, 3].map((v) =>
      counterFixture({ id: v, sort_index: v })
    );
    let newOrder = rearrangeCounters(counters, counters[2], 0);
    console.log(newOrder);
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

// test("create counter", async () => {
//   (listCounters as Mock).mockResolvedValue([]);
//   render(<AuthedApp />);
//   const btn = await screen.findByText("Add a counter", {selector: "button"});
//   await userEvent.click(btn);
//   await userEvent.type(await screen.getByLabelText("Name", {selector: "input"}), "my counter",);

//   await userEvent.type(
//     await screen.findByLabelText("Notes"),
//     "special counter"
//   );

//   (listCounters as Mock).mockResolvedValue([
//     counterFixture({ name: "my counter", notes: "special" }),
//   ]);

//   await userEvent.click(await screen.findByText("Submit"));
//   await wait();
//   expect(() => screen.getByLabelText("Name")).toThrow();
//   expect(createCounter).toBeCalled();
//   await screen.findByText("my counter");
//   await screen.findByText("special");
// });

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
