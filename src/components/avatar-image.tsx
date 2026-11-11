/* eslint-disable @next/next/no-img-element -- imagem gerada no navegador (data URI), não passa pelo otimizador */
import { frameStyle } from "@/lib/avatar-bg";
import type { AvatarMood } from "@/lib/avatar";
import type { AvatarImages } from "@/lib/profile";

/** Imagem do avatar (com moldura). Sem avatar ainda, mostra uma silhueta neutra. */
export function AvatarImage({
  images,
  frame = 0,
  mood = "neutral",
  size = 40,
  alt = "Avatar",
  className = "",
}: {
  images?: AvatarImages | null;
  frame?: number;
  mood?: AvatarMood;
  size?: number;
  alt?: string;
  className?: string;
}) {
  const src = images?.[mood] ?? images?.neutral;
  const radius = "28%";
  return (
    <span
      className={`inline-grid shrink-0 place-items-center ${className}`}
      style={{ width: size, height: size, borderRadius: radius, ...frameStyle(frame) }}
    >
      {src ? (
        <img src={src} alt={alt} width={size} height={size} className="size-full object-cover" style={{ borderRadius: radius }} draggable={false} />
      ) : (
        <svg viewBox="0 0 64 64" className="size-full" style={{ borderRadius: radius }} role="img" aria-label={alt}>
          <rect width="64" height="64" fill="var(--sun)" />
          <circle cx="32" cy="25" r="11" fill="var(--ink)" opacity="0.55" />
          <path d="M12 60c2-12 10-18 20-18s18 6 20 18z" fill="var(--ink)" opacity="0.55" />
        </svg>
      )}
    </span>
  );
}
