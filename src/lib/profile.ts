"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AvatarConfig } from "./avatar";
import { safeStorage } from "./safe-storage";

export const AVATARS = ["😎", "🤠", "🦊", "🐸", "🐼", "🦄", "👽", "🤖", "🐙", "🦖", "🍕", "🔥"] as const;

type ProfileState = {
  nickname: string;
  avatar: string;
  /** Avatar criado no editor; quando existe, aparece no lugar do emoji. */
  avatarCustom: AvatarConfig | null;
  muted: boolean;
  /** Já passou pelas boas-vindas do primeiro acesso. */
  onboarded: boolean;
  /** Melhores marcas por chave (ex.: "cronometro-cego:10" -> erro em ms). */
  records: Record<string, number>;
  lastPlayers: string[];
  setProfile: (nickname: string, avatar: string) => void;
  toggleMuted: () => void;
  /** Salva se for melhor (menor). "first" = primeira marca, "better" = bateu o recorde. */
  saveLowerRecord: (key: string, value: number) => "first" | "better" | false;
  setLastPlayers: (players: string[]) => void;
  setMuted: (muted: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;
  setAvatarCustom: (cfg: AvatarConfig | null) => void;
  clearRecords: () => void;
  resetProfile: () => void;
};

export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      nickname: "",
      avatar: AVATARS[0],
      avatarCustom: null,
      muted: false,
      onboarded: false,
      records: {},
      lastPlayers: [],
      // Só tira espaços do começo: tirar do fim impediria digitar "Rei do..." no campo.
      setProfile: (nickname, avatar) => set({ nickname: nickname.replace(/^\s+/, "").slice(0, 24), avatar }),
      toggleMuted: () => set({ muted: !get().muted }),
      saveLowerRecord: (key, value) => {
        const current = get().records[key];
        if (current !== undefined && current <= value) return false;
        set({ records: { ...get().records, [key]: value } });
        return current === undefined ? "first" : "better";
      },
      setLastPlayers: (players) => set({ lastPlayers: players }),
      setMuted: (muted) => set({ muted }),
      setOnboarded: (onboarded) => set({ onboarded }),
      setAvatarCustom: (avatarCustom) => set({ avatarCustom }),
      clearRecords: () => set({ records: {} }),
      resetProfile: () => set({ nickname: "", avatar: AVATARS[0], avatarCustom: null, lastPlayers: [], onboarded: false }),
    }),
    { name: "partiko-profile", version: 1, storage: safeStorage },
  ),
);
