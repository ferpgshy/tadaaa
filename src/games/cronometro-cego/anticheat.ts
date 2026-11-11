// Antitrapaça do Cronômetro Cego. Não dá para impedir 100% (alguém pode olhar outro aparelho),
// mas dá para deixar trabalhoso e fácil de pegar:
// 1) mãos ocupadas: segura o botão enquanto conta e toca nos alvos que aparecem;
// 2) saiu da tela (trocou de aba/app) durante a contagem: a jogada não vale;
// 3) juiz humano: na sala, o host pode anular;
// 4) "bom demais": acertos quase perfeitos repetidos ganham um selo de suspeito.

export type InvalidReason = "focus" | "targets" | "judge";

/** Quantos alvos pode perder antes de anular a jogada. */
export const MAX_MISSED_TARGETS = 1;

/** Quanto tempo cada alvo fica na tela (ms). */
export const TARGET_LIFETIME_MS = 1400;

/** Teclas usadas nos alvos (no PC dá para acertar o alvo apertando a letra dele). */
export const TARGET_KEYS = ["F", "J", "K", "D", "L", "S"] as const;

export type TargetSpec = {
  id: number;
  /** Quando aparece, em ms desde o começo da contagem. */
  at: number;
  /** Posição em % dentro do palco. */
  x: number;
  y: number;
  key: (typeof TARGET_KEYS)[number];
};

/**
 * Alvos de uma jogada: o primeiro aparece logo depois que o tempo some, depois a cada 1,6 s–2,8 s.
 * Para o alvo de 5 s há poucos; para 60 s, vários. O último nunca aparece em cima do alvo final.
 */
export function targetSchedule(targetS: number, hideAfterS: number, rand: () => number = Math.random): TargetSpec[] {
  const out: TargetSpec[] = [];
  const limit = targetS * 1000 - 900; // não atrapalha o momento de soltar
  let t = Math.max(hideAfterS * 1000, 900) + 300 + rand() * 500;
  let id = 0;
  while (t < limit) {
    out.push({
      id: id++,
      at: Math.round(t),
      x: 12 + rand() * 76,
      y: 14 + rand() * 62,
      key: TARGET_KEYS[Math.floor(rand() * TARGET_KEYS.length)],
    });
    t += 1600 + rand() * 1200;
  }
  return out;
}

/** Jogada que não vale: perdeu alvos demais. */
export function invalidByTargets(missed: number) {
  return missed > MAX_MISSED_TARGETS;
}

/** Erro (ms) abaixo do qual a jogada conta como "quase perfeita" para o selo de suspeito. */
export const SUSPICIOUS_ERR_MS = 15;

/** Suspeito: 2 ou mais jogadas válidas a 15 ms ou menos do alvo. */
export function isSuspicious(validAbsErrors: number[]) {
  return validAbsErrors.filter((e) => e <= SUSPICIOUS_ERR_MS).length >= 2;
}
