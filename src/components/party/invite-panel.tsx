"use client";
/* eslint-disable @next/next/no-img-element -- QR gerado no navegador (data URI) */

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { t } from "@/i18n";
import { sfx } from "@/lib/sfx";

const P = t.party;

/** Convite da sala: código grande, link, QR, WhatsApp e compartilhar do celular. */
export function InvitePanel({ code }: { code: string }) {
  const [url, setUrl] = useState("");
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const [discordOk, setDiscordOk] = useState(false);

  useEffect(() => {
    const link = `${location.origin}/sala/${code}`;
    void QRCode.toDataURL(link, { margin: 1, width: 360, color: { dark: "#1b1035", light: "#ffffff" } }).then((q) => {
      setUrl(link);
      setQr(q);
    });
  }, [code]);

  const text = P.inviteText(code, url);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div className="pop flex flex-col gap-4 rounded-4xl bg-cream p-5 sm:p-6">
      <h2 className="font-display text-2xl font-extrabold">📣 {P.invite}</h2>
      <div className="flex flex-col items-center gap-4">
        <div className="flex shrink-0 flex-col items-center gap-1">
          {qr ? (
            <img src={qr} alt={`QR code da sala ${code}`} width={160} height={160} className="pop-sm aspect-square size-44 shrink-0 rounded-2xl bg-white object-contain p-1.5" />
          ) : (
            <div className="size-44 shrink-0 animate-pulse rounded-2xl bg-field" />
          )}
          <span className="text-xs font-semibold text-ink/70">{P.qrHint}</span>
        </div>
        <div className="flex w-full min-w-0 flex-col items-center gap-3">
          <p className="pop-sm w-fit rounded-2xl bg-sun px-5 py-2 font-mono text-4xl font-bold tracking-[0.25em]" aria-label={`Código ${code.split("").join(" ")}`}>
            {code}
          </p>
          <p className="w-full truncate rounded-xl bg-field px-3 py-2 text-center font-mono text-sm" title={url}>
            {url || "…"}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  sfx.good();
                  setTimeout(() => setCopied(false), 1800);
                } catch {
                  /* sem permissão de área de transferência */
                }
              }}
              className="pop-sm pressable rounded-xl bg-primary px-4 py-2 font-display font-bold text-on-primary"
            >
              {copied ? `✅ ${P.copied}` : `🔗 ${P.copyLink}`}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(text)}`}
              target="_blank"
              rel="noreferrer"
              className="pop-sm pressable rounded-xl bg-lime px-4 py-2 font-display font-bold"
            >
              💬 {P.whatsapp}
            </a>
            <button
              type="button"
              onClick={async () => {
                // O Discord não aceita mensagem pronta por link: copiamos o convite e abrimos o app.
                try {
                  await navigator.clipboard.writeText(P.discordText(code, url));
                  setDiscordOk(true);
                  sfx.good();
                  setTimeout(() => setDiscordOk(false), 4000);
                } catch {
                  /* sem permissão de área de transferência */
                }
                window.open("https://discord.com/app", "_blank", "noopener");
              }}
              className="pop-sm pressable rounded-xl px-4 py-2 font-display font-bold text-white"
              style={{ background: "#5865F2" }}
            >
              🎮 {P.discord}
            </button>
            {canShare && (
              <button
                type="button"
                onClick={() => void navigator.share({ title: "Tadaaa!", text, url }).catch(() => undefined)}
                className="pop-sm pressable rounded-xl bg-cyan px-4 py-2 font-display font-bold"
              >
                📤 {P.share}
              </button>
            )}
          </div>
          {discordOk && (
            <p className="text-center text-sm font-bold text-ink/80" role="status">
              ✅ {P.discordCopied}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
