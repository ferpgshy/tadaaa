import { createJSONStorage } from "zustand/middleware";

/** localStorage quando disponível; memória quando bloqueado (aba anônima, sem cookies...). */
export const safeStorage = createJSONStorage(() => {
  try {
    const probe = "__tadaaa__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    const mem = new Map<string, string>();
    return {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    };
  }
});
