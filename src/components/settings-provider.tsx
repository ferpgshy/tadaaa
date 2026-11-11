"use client";

import { MotionConfig } from "motion/react";
import { useEffect } from "react";
import { applySettings, useSettings } from "@/lib/settings";
import { useHydrated } from "@/lib/use-hydrated";

const reducedMotion = { full: "never", system: "user", off: "always" } as const;

/** Mantém o <html> em dia com as preferências e ajusta as animações do Motion. */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const { theme, textSize, motion, decor } = useSettings();

  useEffect(() => {
    if (!hydrated) return;
    applySettings({ theme, textSize, motion, decor });
    // Cor da barra do navegador no celular acompanha o cabeçalho do tema.
    const header = getComputedStyle(document.documentElement).getPropertyValue("--header").trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", header || "#7b3fe4");
  }, [hydrated, theme, textSize, motion, decor]);

  return <MotionConfig reducedMotion={hydrated ? reducedMotion[motion] : "user"}>{children}</MotionConfig>;
}

/** Roda antes da pintura: aplica o tema salvo e evita piscar o tema padrão. */
export const settingsBootScript = `(function(){try{var s=(JSON.parse(localStorage.getItem("tadaaa-settings")||"{}").state)||{};var d=document.documentElement;d.dataset.theme=s.theme||"auditorio";d.dataset.text=s.textSize||"m";d.dataset.motion=s.motion||"system";d.dataset.decor=s.decor===false?"off":"on";}catch(e){}})();`;
