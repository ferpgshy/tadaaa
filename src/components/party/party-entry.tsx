"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { t } from "@/i18n";
import { newRoomCode, normalizeCode } from "@/lib/party/protocol";
import { hostKey, myPlayerId } from "@/lib/party/use-party";
import { sfx } from "@/lib/sfx";

const P = t.party;

/** Cria uma sala nova (quem cria vira host) e abre a página dela. */
export function useCreateRoom() {
  const router = useRouter();
  return () => {
    const code = newRoomCode();
    try {
      sessionStorage.setItem(hostKey(code), myPlayerId());
    } catch {
      /* sem sessionStorage: a sala ainda funciona, o host vira quem entrou primeiro */
    }
    sfx.good();
    router.push(`/sala/${code}`);
  };
}

/** Bloco da home: criar sala ou entrar com código. */
export function PartyEntry() {
  const router = useRouter();
  const create = useCreateRoom();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="pop grid gap-5 rounded-4xl bg-cream p-5 sm:p-8 md:grid-cols-2 md:gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-extrabold sm:text-3xl">🌐 {P.create}</h2>
        <p className="text-ink/75">{t.party.onlineHint}: link, QR code ou código para a galera entrar.</p>
        <button type="button" onClick={create} className="pop pressable w-fit rounded-2xl bg-primary px-6 py-3 font-display text-xl font-extrabold text-on-primary">
          ✨ {P.create}
        </button>
      </div>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const c = normalizeCode(code);
          if (!c) {
            setError(P.invalidCode);
            sfx.buzz();
            return;
          }
          router.push(`/sala/${c}`);
        }}
      >
        <h2 className="font-display text-2xl font-extrabold sm:text-3xl">🔑 {P.join}</h2>
        <label className="text-ink/75" htmlFor="room-code">
          {P.joinHint}
        </label>
        <div className="flex gap-2">
          <input
            id="room-code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError("");
            }}
            maxLength={6}
            autoComplete="off"
            autoCapitalize="characters"
            placeholder={P.codePlaceholder}
            aria-invalid={Boolean(error)}
            className="pop-sm w-36 rounded-xl bg-field px-4 py-3 font-mono text-2xl font-bold tracking-[0.2em] uppercase outline-none focus:bg-sun/20"
          />
          <button type="submit" className="pop pressable rounded-2xl bg-cyan px-5 font-display text-lg font-extrabold">
            {P.enter} →
          </button>
        </div>
        {error && <p className="text-sm font-bold text-accent">{error}</p>}
      </form>
    </div>
  );
}
