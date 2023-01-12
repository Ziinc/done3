import { render as originalRender, queries } from "@testing-library/react";
import { SWRConfig } from "swr";
const TestWrapper = ({ children }) => {
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        shouldRetryOnError: false,
      }}
    >
      {children}
    </SWRConfig>
  );
};

export const render = (
  ui: Parameters<typeof originalRender>[0],
  options: Parameters<typeof originalRender>[1] = {}
) => originalRender(ui, { wrapper: TestWrapper, ...options });

export const wait = (ms = 500) => new Promise((res) => setTimeout(res, ms));
