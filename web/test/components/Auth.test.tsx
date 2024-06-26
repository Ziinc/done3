import { expect, test, Mock, describe, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render, wait } from "../helpers/utils";
import React from "react";
import userEvent from "@testing-library/user-event";
import Auth from "../../src/components/Auth";

const defaultProps = {
  onRequestReset: vi.fn(),
};
test.todo("Google auth sign in")
// test("sign in", async () => {
//   const mockFn = vi.fn();
//   render(<Auth.Form onSubmit={mockFn} />);
//   await screen.findByText("Forgot your password?");
//   await userEvent.type(await screen.findByLabelText("Email"), "some@email.com");
//   await userEvent.type(await screen.findByLabelText("Password"), "some pass");
//   await userEvent.click(await screen.findByRole("button", { name: "Sign in" }));
//   expect(mockFn).toBeCalled();
// });
