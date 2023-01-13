import { expect, test, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AuthedApp } from "../src/App";

import { increaseCounter, listCounters } from "../src/api/counters";
import userEvent from "@testing-library/user-event";
import { counterFixture } from "./helpers/fixtures";

test("increase counter", async () => {
  (listCounters as Mock).mockResolvedValue([
    counterFixture({ name: "my counter", count: 0 }),
  ]);
  render(<AuthedApp />);
  await screen.findByText(/0/);
  const inc = await screen.findByTitle("Increase 'my counter' by 1");
  (listCounters as Mock).mockResolvedValue([
    counterFixture({ name: "my counter", count: 1 }),
  ]);
  await userEvent.click(inc);
  await screen.findByText(/1/);
  (listCounters as Mock).mockResolvedValue([
    counterFixture({ name: "my counter", count: 2 }),
  ]);
  await userEvent.click(inc);
  await screen.findByText(/2/);
  expect(increaseCounter).toBeCalled();
});

test("context menu - increase", async () => {
  const counter = counterFixture();
  (listCounters as Mock).mockResolvedValue([counter]);
  render(<AuthedApp />);
  expect(increaseCounter).not.toBeCalled();
  await userEvent.pointer({
    target: await screen.findByText(/my counter/),
    keys: "[MouseRight]",
  });
  await userEvent.click(await screen.findByText(/Increase by 5/));
  expect(increaseCounter).toBeCalled();
});
