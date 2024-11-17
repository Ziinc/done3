import { vi } from "vitest";

export const listTaskLists = vi.fn().mockResolvedValue([]);
export const getTaskList = vi.fn();
export const deleteTaskList = vi.fn();
export const putTaskList = vi.fn();
export const insertTaskList = vi.fn();
export const syncTaskLists = vi.fn();
