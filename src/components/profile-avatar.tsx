"use client";

import type { AvatarMood } from "@/lib/avatar";
import { useProfile } from "@/lib/profile";
import { useHydrated } from "@/lib/use-hydrated";
import { AvatarImage } from "./avatar-image";

/** Avatar do perfil em qualquer lugar do site (usa as imagens já salvas, sem carregar as ilustrações). */
export function ProfileAvatar({ size = 32, mood = "neutral", className = "" }: { size?: number; mood?: AvatarMood; className?: string }) {
  const hydrated = useHydrated();
  const { avatar, avatarImages, nickname } = useProfile();
  return (
    <AvatarImage
      images={hydrated ? avatarImages : null}
      frame={hydrated ? (avatar?.frame ?? 0) : 0}
      mood={mood}
      size={size}
      alt={nickname || "Avatar"}
      className={className}
    />
  );
}
