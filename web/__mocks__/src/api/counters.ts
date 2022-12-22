import { vi } from "vitest";
export const listCounters = vi.fn().mockResolvedValue([]);
export const createCounters = vi.fn();
export const updateCounter = vi.fn();
export const deleteCounter = vi.fn();
export const increaseCounter = vi.fn();
