# Tadaaa

Jogos de festa e desafios que estão em alta, direto no navegador: **https://playtadaaa.vercel.app**. Sem login: perfil, recordes e preferências ficam salvos no próprio aparelho.

## No ar

- **Cronômetro Cego**: o tempo some da tela e você tenta parar no alvo. Tem modo Solo (com recorde) e Galera (passa o aparelho, com pódio).

## Rodando local

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # testes de lógica (Vitest)
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion · Zustand · Vitest. Textos em `src/i18n` (PT-BR, pronto para outros idiomas). Cada jogo fica em `src/games/<slug>` e é listado em `src/games/catalog.ts`.
