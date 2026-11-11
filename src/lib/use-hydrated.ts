import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** true só no cliente, depois da hidratação. Evita diferença entre SSR e localStorage. */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
