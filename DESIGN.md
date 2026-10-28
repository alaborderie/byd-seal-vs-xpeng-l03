# Design

Direction tirée de `ui-ux-pro-max` (style « Motion-Driven », motif « Hero-Centric », dials variance 6, motion 8, density 3), adaptée à la demande : design clair, accents bleus. L'accent rouge et la police Space Mono proposés par l'outil ont été écartés.

## Principe

Une page, deux camps. La Seal est toujours à gauche, le L03 toujours à droite. Chaque section montre les deux voitures face à face, avec une colonne centrale qui désigne le gagnant de la ligne. Les couleurs aident à reconnaître chaque voiture, mais chaque valeur porte aussi le nom de la voiture ou sa position : la couleur ne porte jamais seule une information.

## Tokens

| Rôle | Valeur |
|---|---|
| Fond | `#F8FAFC` |
| Surface | `#FFFFFF` |
| Texte | `#0F172A` |
| Texte secondaire | `#475569` |
| Bordure | `#E2E8F0` |
| Accent (liens, focus, gagnant) | `#2563EB` |
| Seal | `#1D4ED8` (texte et remplissage) |
| L03 | `#0891B2` (remplissage), `#0E7490` (texte, contraste 5,4:1) |

Typographie : Space Grotesk pour les titres et les chiffres (`tabular-nums`), Inter pour le texte. Les polices sont auto-hébergées via Fontsource, sans appel à Google Fonts.

## Chorégraphie

1. **Hero (300vh, scène épinglée).** Les deux silhouettes partent des bords et roulent vers le centre au rythme du scroll, roues comprises. Le titre s'efface, puis les chiffres clés de chaque voiture apparaissent sous elle, et un badge « VS » se pose entre les deux.
2. **Barre fixe.** Après le hero, une barre en haut garde les sélecteurs de finition de chaque côté. Deux mini-silhouettes y servent d'indicateur de progression : elles se rapprochent du centre à mesure qu'on descend et se touchent au verdict.
3. **Le match.** Diagramme papillon : une ligne par critère, la barre de la Seal pousse vers la gauche, celle du L03 vers la droite, le centre marque le gagnant.
4. **Course 0-100.** Deux couloirs, durée réelle de chaque finition.
5. **Charge 10-80 %.** Deux batteries se remplissent, une minute réelle vaut un quart de seconde.
6. **Road trip.** Paris vers Lyon, Bordeaux, Marseille ou Nice à 130 km/h, avec les mesures d'Automobile Propre. Frise des trajets et des arrêts pour chaque voiture.
7. **Gabarit.** Les deux silhouettes se superposent à l'échelle, cotes à l'appui, puis les volumes de coffre.
8. **Équipements, sécurité, presse, verdict, sources.**

Durées : 200 à 300 ms pour les micro-interactions, 500 à 700 ms pour les entrées de section, montée de 24 px. Les barres utilisent `scaleX`, jamais `width`. Avec `prefers-reduced-motion`, toutes les scènes s'affichent dans leur état final et les courses montrent directement le résultat.

## Responsive

À partir de 1024 px : deux colonnes et la colonne centrale. Sous 768 px : les deux colonnes restent côte à côte pour les chiffres courts, les textes longs passent l'un sous l'autre. Zones cliquables de 44 px minimum, focus visible partout.
