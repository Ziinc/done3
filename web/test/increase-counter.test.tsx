import { expect, test, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AuthedApp } from "../src/App";

import { getCounts, increaseCounter, listCounters } from "../src/api/counters";
import userEvent from "@testing-library/user-event";
import { counterFixture, countsFixture } from "./helpers/fixtures";

test("increase counter", async () => {
  (listCounters as Mock).mockResolvedValue([
    counterFixture({ name: "my counter" }),
  ]);
  (getCounts as Mock).mockResolvedValue(countsFixture(0));
  render(<AuthedApp />);
  await screen.findByText(/0/);
  const inc = await screen.findByTitle("Increase 'my counter' by 1");
  (getCounts as Mock).mockResolvedValue(countsFixture(1));
  await userEvent.click(inc);
  await screen.findByText(/1/);
  (getCounts as Mock).mockResolvedValue(countsFixture(2));
  await userEvent.click(inc);
  await screen.findByText(/2/);
  expect(increaseCounter).toBeCalled();
});

test("context menu - increase", async () => {
  const counter = counterFixture();
  (listCounters as Mock).mockResolvedValue([counter]);
  (getCounts as Mock).mockResolvedValue(countsFixture());
  render(<AuthedApp />);
  expect(increaseCounter).not.toBeCalled();
  await userEvent.pointer({
    target: await screen.findByText(/my counter/),
    keys: "[MouseRight]",
  });
  await userEvent.click(await screen.findByText(/Increase by 5/));
  expect(increaseCounter).toBeCalled();
});
