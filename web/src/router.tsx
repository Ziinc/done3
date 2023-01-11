import { useSyncExternalStore } from "react";
import { BaseLocationHook, Router as BaseRouter, RouterProps } from "wouter";

const currentLocation = () => window.location.hash.replace(/^#/, "") || "/";

export const navigate = (to: string) => {
  window.location.hash = to;
};

export const useHashLocation = () => {
  // `useSyncExternalStore` is available in React 18, or you can use a shim for older versions
  const location = useSyncExternalStore(
    // first argument is a value subscriber: it gives us a callback that we should call
    // whenever the value is changed
    (onChange) => {
      window.addEventListener("hashchange", onChange);
      return () => window.removeEventListener("hashchange", onChange);
    },

    // the second argument is function to get the current value
    () => currentLocation()
  );

  return [location, navigate];
};
export const HashRouter: React.FC<RouterProps> = ({ children, ...props }) => (
  <BaseRouter {...props} hook={useHashLocation as BaseLocationHook}>
    {children}
  </BaseRouter>
);
