# Atelier Plan de Table

Application web pour créer des plans de table de mariage/réception, destinée à être
**vendue en SaaS à des wedding planners** qui la partagent ensuite à leurs clients mariés.

## Stack

- **Next.js 16 (App Router) + React + TypeScript**, Tailwind CSS
- **react-konva** (Konva.js) pour le canevas du plan de salle : formes déplaçables,
  zoom/pan, calques, hit-test, export image. Ne JAMAIS revenir à de la manipulation
  manuelle du DOM pour le plan — c'est le rôle de Konva.
- **@dnd-kit/core** pour le glisser-déposer des invités (listes / placement)
- **Supabase** (Postgres + Auth + Realtime + Row-Level Security) pour données,
  comptes et partage planner → mariés
- **jsPDF** pour l'export PDF
- **Stripe** pour l'abonnement (à venir)
- Hébergement **Vercel**

## Conventions

- TypeScript strict. Typer les entités (Project, Guest, Table, Seat, Decor).
- Logique métier pure (géométrie, capacité) isolée dans `lib/` sans dépendance UI,
  testée unitairement.
- Composants React fonctionnels + hooks. Pas de state global lourd : Zustand si besoin.
- Mesures internes en **centimètres**. Affichage en mètres.
- Français dans l'UI et les libellés.

## Modèle de données (Supabase)

```
planner        (id, email, plan_abo)
project        (id, planner_id, couple_names, salle_w_cm, salle_h_cm, theme, accent, accent2)
project_share  (project_id, client_email, role)          -- partage aux mariés (lecture/édition)
guest          (id, project_id, nom, menu, marie, a_confirmer)
table          (id, project_id, nom, shape, diametre_cm|longueur_cm|largeur_cm,
                confort, pos_x, pos_y, rot)
seat           (id, table_id, index, guest_id NULL)
decor          (id, project_id, type, label, pos_x, pos_y, w_cm, h_cm, rot)
version        (id, project_id, label, snapshot_jsonb, created_at)  -- historique
```

RLS : un planner ne voit que ses projets ; un couple invité ne voit que le projet
partagé avec lui, selon `role`.

## Règles métier importantes

- **Géométrie des tables** : `lib/geometry/tableGeometry.js` (déjà écrit et testé).
  Capacité, auto-dimensionnement, empreinte, alerte de dépassement. Standards traiteur :
  espacement par convive plus serré en ronde qu'en table droite. Toujours passer par
  ce moteur, ne pas recalculer ailleurs.
- **Alerte de capacité** : afficher un état ok / plein / dépassement (`etatCapacite`)
  et bloquer ou avertir quand on ajoute un invité au-delà du max.
- **Banquet des mariés** : les mariés sont au centre ; toute insertion de place se
  décale du centre vers l'extérieur (haut au-dessus d'eux, bas en dessous), jamais
  en traversant les mariés.
- **Plan de salle** : à l'échelle réelle en mètres, grille 1 m / 5 m. Distances
  centre-à-centre et aux murs. Contrôle des allées de service (≥ 120 cm).

## Commandes

```bash
npm run dev            # serveur de dev
npm run build          # build de prod
npm test               # tests unitaires (à mettre en place : vitest)
node test/geometry.test.mjs   # tests du moteur géométrie
```

## Garde-fous

- Dépôt : **github.com/Tickly-SAS/tableplan**, transféré le 2026-07-31 depuis le compte
  personnel `julien64-projects`.
- Le dépôt est **PUBLIC**, et c'est un choix contraint : le plan Hobby de Vercel refuse
  les dépôts privés appartenant à une organisation, ce qui supprimerait le déploiement
  automatique. À repasser en privé le jour où Vercel passe en Pro.
- Conséquence directe : **ne JAMAIS commiter de secret**, la moindre clé poussée ici est
  publique et indexable dans la seconde. Clés Supabase/Stripe dans `.env.local` (couvert
  par `.gitignore`, seul `.env.example` est versionné). `NEXT_PUBLIC_` uniquement pour ce
  qui est réellement public. En cas de doute avant un commit :
  `git grep -IE "sk_live_|rk_live_|sb_secret_|whsec_"`.
- Travailler sur une **branche de feature**, commits fréquents, diffs relus.
- **Tests non-négociables** sur toute la logique métier. Les faire tourner et les
  corriger dans chaque tâche, pas après coup.
- Avancer par **petits diffs** : proposer un plan, le faire valider, puis implémenter.
