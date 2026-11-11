"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AvatarConfig, AvatarMood } from "./avatar";
import { safeStorage } from "./safe-storage";

/** Imagens do avatar por expressão (data URIs SVG), geradas ao salvar. */
export type AvatarImages = Partial<Record<AvatarMood, string>>;

type ProfileState = {
  nickname: string;
  /** Avatar ilustrado criado no editor. */
  avatar: AvatarConfig | null;
  avatarImages: AvatarImages | null;
  muted: boolean;
  /** Já passou pelas boas-vindas do primeiro acesso. */
  onboarded: boolean;
  /** Melhores marcas por chave (ex.: "cronometro-cego:10" -> erro em ms). */
  records: Record<string, number>;
  lastPlayers: string[];
  setNickname: (nickname: string) => void;
  setAvatar: (cfg: AvatarConfig | null, images: AvatarImages | null) => void;
  toggleMuted: () => void;
  /** Salva se for melhor (menor). "first" = primeira marca, "better" = bateu o recorde. */
  saveLowerRecord: (key: string, value: number) => "first" | "better" | false;
  setLastPlayers: (players: string[]) => void;
  setMuted: (muted: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;
  clearRecords: () => void;
  resetProfile: () => void;
};

export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      nickname: "",
      avatar: null,
      avatarImages: null,
      muted: false,
      onboarded: false,
      records: {},
      lastPlayers: [],
      // Só tira espaços do começo: tirar do fim impediria digitar "Rei do..." no campo.
      setNickname: (nickname) => set({ nickname: nickname.replace(/^\s+/, "").slice(0, 24) }),
      setAvatar: (avatar, avatarImages) => set({ avatar, avatarImages }),
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
      clearRecords: () => set({ records: {} }),
      resetProfile: () => set({ nickname: "", avatar: null, avatarImages: null, lastPlayers: [], onboarded: false }),
    }),
    {
      name: "partiko-profile",
      version: 3,
      storage: safeStorage,
      // Versões antigas tinham emoji/avatar desenhado à mão: mantém apelido, recordes e preferências.
      migrate: (old) => {
        const o = (old ?? {}) as Record<string, unknown>;
        for (const k of ["avatar", "avatarCustom", "avatar3d"]) delete o[k];
        return { ...o, avatar: null, avatarImages: null } as unknown as ProfileState;
      },
    },
  ),
);
