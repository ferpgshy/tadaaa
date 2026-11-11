import type { Metadata } from "next";
import { Suspense } from "react";
import { RoomPage } from "./room-page";

export const metadata: Metadata = {
  title: "Sala online",
  description: "Entra na sala e joga junto com a galera, cada um no seu celular.",
};

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[2400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 2xl:px-16">
      {/* O código vem da URL só no navegador: a moldura da página é estática e o resto entra em seguida. */}
      <Suspense fallback={<div className="h-96 animate-pulse rounded-4xl bg-field" />}>
        <RoomPage />
      </Suspense>
    </div>
  );
}
