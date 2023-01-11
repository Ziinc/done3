import { expect, test, Mock, describe, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render, wait } from "../helpers/utils";
import React from "react";
import userEvent from "@testing-library/user-event";
import Auth from "../../src/components/Auth";

const defaultProps = {
  onRequestReset: vi.fn(),
};
test("sign in", async () => {
  const mockFn = vi.fn();
  render(<Auth.Form onSubmit={mockFn} />);
  await screen.findByText("Forgot your password?");
  await userEvent.type(await screen.findByLabelText("Email"), "some@email.com");
  await userEvent.type(await screen.findByLabelText("Password"), "some pass");
  await userEvent.click(await screen.findByRole("button", { name: "Sign in" }));
  expect(mockFn).toBeCalled();
});

test("sign up", async () => {
  const mockFn = vi.fn();
  render(<Auth.Form onSubmit={mockFn} />);
  await screen.findByText("Forgot your password?");

  await userEvent.click(await screen.findByText(/Sign Up/));
  await userEvent.type(await screen.findByLabelText("Email"), "some@email.com");
  await userEvent.type(await screen.findByLabelText("Password"), "some pass");
  await userEvent.click(await screen.findByRole("button", { name: /Sign up/ }));
  await screen.findByText(
    /Confirmation instructions has been sent your e-mail/
  );
  expect(mockFn).toBeCalled();
});

test("reset password request", async () => {
  const mockFn = vi.fn();
  render(<Auth.Form onSubmit={mockFn} />);
  const req = await screen.findByText("Forgot your password?");
  await userEvent.click(req);
  const input = await screen.findByLabelText("Email");
  await userEvent.type(input, "my@email.com");
  await userEvent.click(
    await screen.findByText(/Send reset password instructions/)
  );
  await screen.findByText(
    /Password reset instructions has been sent your e-mail/
  );
  expect(mockFn).toBeCalled();
});

test("reset new password", async () => {
  const mockFn = vi.fn();
  render(<Auth.Form mode={Auth.Mode.UPDATE_PASSWORD} onSubmit={mockFn} />);
  await userEvent.type(await screen.findByLabelText(/Password/), "something");
  const submit = await screen.findByText(/Confirm password change/);
  await userEvent.click(submit);
  expect(mockFn).toBeCalled();
});
