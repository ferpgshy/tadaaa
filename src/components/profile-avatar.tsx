"use client";

import { sanitizeAvatar } from "@/lib/avatar";
import { useProfile } from "@/lib/profile";
import { useHydrated } from "@/lib/use-hydrated";
import { Avatar } from "./avatar";

/** Mostra o avatar do perfil: o criado no editor ou, se não houver, o emoji. */
export function ProfileAvatar({ size = 32, className = "" }: { size?: number; className?: string }) {
  const hydrated = useHydrated();
  const { avatar, avatarCustom, nickname } = useProfile();
  const custom = hydrated ? sanitizeAvatar(avatarCustom) : null;

  if (custom) {
    return <Avatar config={custom} size={size} title={nickname || undefined} className={`shrink-0 rounded-[24%] ${className}`} />;
  }
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-[24%] bg-sun ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.6 }}
      aria-hidden
    >
      {hydrated ? avatar : "😎"}
    </span>
  );
}
