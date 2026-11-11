"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeStorage } from "./safe-storage";

export const AVATARS = ["😎", "🤠", "🦊", "🐸", "🐼", "🦄", "👽", "🤖", "🐙", "🦖", "🍕", "🔥"] as const;

type ProfileState = {
  nickname: string;
  avatar: string;
  muted: boolean;
  /** Melhores marcas por chave (ex.: "cronometro-cego:10" -> erro em ms). */
  records: Record<string, number>;
  lastPlayers: string[];
  setProfile: (nickname: string, avatar: string) => void;
  toggleMuted: () => void;
  /** Salva se for melhor (menor). "first" = primeira marca, "better" = bateu o recorde. */
  saveLowerRecord: (key: string, value: number) => "first" | "better" | false;
  setLastPlayers: (players: string[]) => void;
  setMuted: (muted: boolean) => void;
  clearRecords: () => void;
  resetProfile: () => void;
};

export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      nickname: "",
      avatar: AVATARS[0],
      muted: false,
      records: {},
      lastPlayers: [],
      setProfile: (nickname, avatar) => set({ nickname: nickname.trim().slice(0, 24), avatar }),
      toggleMuted: () => set({ muted: !get().muted }),
      saveLowerRecord: (key, value) => {
        const current = get().records[key];
        if (current !== undefined && current <= value) return false;
        set({ records: { ...get().records, [key]: value } });
        return current === undefined ? "first" : "better";
      },
      setLastPlayers: (players) => set({ lastPlayers: players }),
      setMuted: (muted) => set({ muted }),
      clearRecords: () => set({ records: {} }),
      resetProfile: () => set({ nickname: "", avatar: AVATARS[0], lastPlayers: [] }),
    }),
    { name: "partiko-profile", version: 1, storage: safeStorage },
  ),
);
