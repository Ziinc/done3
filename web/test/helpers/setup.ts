import { vi, beforeAll, afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";

vi.mock("../../src/api/counters");
vi.mock("../../src/api/task_lists");
vi.mock("../../src/api/tasks");
vi.mock("../../src/api/notes");

vi.mock("react-beautiful-dnd");

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

window.confirm  = vi.fn().mockReturnValue(true);

// react testing library cleanup
beforeEach(() => {
  cleanup();
});
afterEach(() => {
  cleanup();
});
