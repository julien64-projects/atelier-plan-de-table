# Atelier Plan de Table — passage en produit vendable

## Pourquoi changer de base

Le prototype HTML mono-fichier a atteint ses limites. Les bugs récurrents (noms
superposés, « fantômes » de glisser-déposer) viennent d'un défaut structurel :
tout le rendu et toutes les interactions sont écrits à la main sur le DOM, sans
framework ni moteur de rendu. Chaque nouvelle fonction fragilise l'ensemble.

Pour un outil que tu vas **vendre à des wedding planners**, il faut : des comptes,
du partage planner → mariés, une synchro multi-appareils, de la fiabilité, et un
canevas de plan de salle qui ne « perde » jamais un élément. Cela suppose un vrai
codebase, versionné, développé dans **Claude Code** (que tu utilises déjà).

## Stack recommandée

| Besoin | Choix | Pourquoi |
|---|---|---|
| Interface | **Next.js + React + TypeScript** | Standard, embauchable, typé (moins de bugs) |
| Plan de salle interactif | **react-konva** (canvas Konva.js) | Fait pour ça : formes déplaçables, calques, zoom/pan, hit-test, export image. Élimine par construction les bugs de DOM manuel |
| Glisser-déposer listes | **dnd-kit** | Robuste tactile + souris, gère l'annulation proprement |
| Données + comptes + partage | **Supabase** (Postgres, Auth, Realtime, RLS) | Auth intégrée, synchro temps réel, isolation planner/client via Row-Level Security, sans serveur à gérer |
| Hébergement | **Vercel** | Zéro config avec Next.js |
| Paiement (vendre l'abo) | **Stripe** | Tu le maîtrises déjà côté Phidias |
| Géométrie des tables | `src/geometry/tableGeometry.js` (fourni, testé) | Indépendant du framework, réutilisable tel quel |

## Modèle de données (Supabase)

```
planner        (id, email, plan_abo, …)
project        (id, planner_id, couple_names, salle_w_cm, salle_h_cm, theme, …)
project_share  (project_id, client_email, role)      -- partage aux mariés
guest          (id, project_id, nom, menu, marie, à_confirmer, …)
table          (id, project_id, nom, shape, diametre_cm|longueur_cm|largeur_cm,
                confort, pos_x, pos_y, rot)
seat           (id, table_id, index, guest_id NULL)   -- une place = un siège
decor          (id, project_id, type, label, pos_x, pos_y, w_cm, h_cm, rot)
version        (id, project_id, label, snapshot_jsonb, created_at)  -- historique
```

Row-Level Security : un planner ne voit que ses projets ; un couple invité ne voit
que le projet partagé avec lui, en lecture ou édition selon `role`.

## Fonctions clés à porter (déjà prototypées)

- Plan de salle **à l'échelle en mètres**, grille 1 m / 5 m
- Tables **dimensionnées automatiquement** selon le nombre d'invités (moteur fourni)
- **Alerte de dépassement** de capacité (moteur fourni : `etatCapacite`)
- **Choix manuel** de la taille de table + capacité recalculée
- Distances table↔table et table↔mur, contrôle des allées de service
- Banquet des mariés avec décalage centre → extérieur
- Thèmes, projets multiples, historique/versions, undo/redo
- Export **PDF** (couverture, plan de salle à l'échelle, une page par table)
- Partage **planner → mariés** (lien ou invitation e-mail)

## Démarrage dans Claude Code

```bash
npx create-next-app@latest atelier-plan-de-table --typescript --tailwind --app
cd atelier-plan-de-table
npm i konva react-konva @dnd-kit/core @supabase/supabase-js jspdf
# copier src/geometry/tableGeometry.js (fourni) dans le projet
# ouvrir le dossier dans VS Code puis lancer Claude Code
```

Le moteur de géométrie (`tableGeometry.js`) et ses tests sont prêts : c'est la
première brique métier, elle ne dépend d'aucune techno et se branche telle quelle.
