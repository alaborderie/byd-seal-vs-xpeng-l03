# BYD Seal vs XPENG L03

Comparatif interactif entre la berline électrique BYD Seal et le SUV coupé XPENG L03, pour le marché français, données au 28 octobre 2026.

- [`RECAP.md`](RECAP.md) : le récap complet, chiffres vérifiés et sources.
- [`research/`](research/) : les six rapports bruts (Opus 5.5, Sonnet 5.5, GPT-6.1 Sol, GPT-6.1 Terra, DeepSeek V4.1 Flash, Grok 4.7) et le brief commun.
- [`DESIGN.md`](DESIGN.md) : direction visuelle et chorégraphie des animations.

## Développement

```sh
pnpm install
pnpm dev          # http://localhost:8519
pnpm test         # calcul du road trip et choix du gagnant de chaque critère
pnpm typecheck && pnpm lint
```

Toutes les données vivent dans [`src/data/cars.ts`](src/data/cars.ts). Les composants ne contiennent aucun chiffre en dur : changer une valeur là-bas met à jour le tableau d'affichage, les courses, le road trip et les fiches.

## Servir sur Jarvis (port 8519)

Le site tourne en local, sans déploiement, via un service systemd utilisateur qui sert le build avec `vite preview` :

```sh
pnpm build
cp deploy/byd-seal-vs-xpeng-l03.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now byd-seal-vs-xpeng-l03
```

Le service sert le `dist/` de ce checkout : un build lancé sur une autre branche change le site servi. Après un changement sur `main` : `pnpm build`, puis `systemctl --user restart byd-seal-vs-xpeng-l03`. Le chemin de Node dans l'unité suit la version nvm installée et doit être mis à jour avec elle.

## Vérifier le rendu

```sh
node scripts/shoot.mjs http://localhost:8519 /tmp/shots 1440 900 '0,1800,#match,#road-trip'
node scripts/interact-check.mjs
```

`shoot.mjs` prend des captures à des positions de scroll (un nombre de pixels ou `#section+décalage`) et signale les erreurs console et le débordement horizontal. `interact-check.mjs` change de finition et de destination dans un vrai navigateur et affiche ce que la page calcule.
