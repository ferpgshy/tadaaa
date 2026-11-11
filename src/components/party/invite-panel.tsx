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
  // Discord: "copied" = convite copiado; "manual" = navegador bloqueou a cópia, mostra o texto.
  const [discord, setDiscord] = useState<"idle" | "copied" | "manual">("idle");

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
          {/* Link com o botão de copiar ao lado */}
          <div className="flex w-full items-stretch gap-2">
            <input
              readOnly
              value={url || "…"}
              onFocus={(e) => e.currentTarget.select()}
              aria-label={P.copyLink}
              className="min-w-0 flex-1 truncate rounded-xl bg-field px-3 py-2 font-mono text-sm outline-none focus:bg-sun/20"
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  sfx.good();
                  setTimeout(() => setCopied(false), 1800);
                } catch {
                  /* sem permissão: o campo ao lado fica selecionável para copiar na mão */
                }
              }}
              aria-label={P.copyLink}
              title={P.copyLink}
              className={`pop-sm pressable shrink-0 rounded-xl px-3 font-display text-sm font-bold whitespace-nowrap ${copied ? "bg-lime" : "bg-primary text-on-primary"}`}
            >
              {copied ? `✅ ${P.copied}` : `📋 ${P.copy}`}
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
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
                // O Discord não aceita mensagem pronta por link: copiamos o convite e mostramos
                // um aviso com o botão para abrir o Discord e colar no canal.
                try {
                  await navigator.clipboard.writeText(P.discordText(code, url));
                  setDiscord("copied");
                  sfx.good();
                } catch {
                  setDiscord("manual");
                }
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
          {discord !== "idle" && (
            <div className="pop-sm flex w-full flex-col gap-2 rounded-2xl p-3 text-white" style={{ background: "#5865F2" }} role="status">
              <p className="font-display font-bold">{discord === "copied" ? `✅ ${P.discordCopied}` : P.discordManual}</p>
              <textarea
                readOnly
                value={P.discordText(code, url)}
                onFocus={(e) => e.currentTarget.select()}
                rows={2}
                className="w-full resize-none rounded-lg bg-white/15 p-2 font-mono text-xs text-white outline-none"
              />
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://discord.com/app"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-white px-3 py-1.5 font-display text-sm font-bold"
                  style={{ color: "#5865F2" }}
                >
                  {P.discordOpen} ↗
                </a>
                <button type="button" onClick={() => setDiscord("idle")} className="rounded-lg px-3 py-1.5 text-sm font-bold text-white/90 hover:bg-white/15">
                  {t.profile.close}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
