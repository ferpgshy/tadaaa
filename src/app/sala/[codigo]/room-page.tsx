"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PartyRoom } from "@/components/party/party-room";
import { t } from "@/i18n";
import { normalizeCode } from "@/lib/party/protocol";

/** Lê o código da URL no navegador (a página em si é estática). */
export function RoomPage() {
  const params = useParams<{ codigo: string }>();
  const code = normalizeCode(params?.codigo ?? "");
  if (!code) {
    return (
      <div className="pop mx-auto flex max-w-lg flex-col items-center gap-4 rounded-4xl bg-cream p-8 text-center">
        <p className="font-display text-xl font-bold">{t.party.invalidCode}</p>
        <Link href="/" className="pop pressable rounded-2xl bg-primary px-6 py-3 font-display font-bold text-on-primary">
          ← {t.notFound.cta}
        </Link>
      </div>
    );
  }
  return <PartyRoom code={code} />;
}
