# Feuille de route — Atelier Plan de Table

Une phase = idéalement une session Claude Code (`/clear` entre chaque).
Toujours : mode Plan (Shift+Tab ×2) → validation → implémentation → tests → commit.

## Phase 0 — Fondations (types + géométrie)
- [ ] Placer `lib/geometry/tableGeometry.js` et le convertir en `tableGeometry.ts` typé.
- [ ] Mettre en place **vitest** ; porter `test/geometry.test.mjs` et le faire passer.
- [ ] Définir les types du domaine dans `lib/types.ts` (Project, Guest, Table, Seat, Decor).
- [ ] Commit : « fondations : types + moteur géométrie testé ».

## Phase 1 — Canevas plan de salle (react-konva)
- [ ] `components/FloorPlan.tsx` : Stage/Layer Konva, grille métrique 1 m / 5 m, zoom + pan.
- [ ] Tables comme formes Konva (cercle / rectangle) déplaçables, à l'échelle réelle
      via `empreinte()`. Sélection, rotation.
- [ ] Éléments de décor (piste, bar, buffet…) déplaçables/redimensionnables.
- [ ] Distances centre-à-centre et aux murs sur sélection ; alerte allée < 120 cm.
- [ ] Tests + commit.

## Phase 2 — Détail de table & sièges
- [ ] Vue détaillée d'une table (ronde en cercle, banquet vis-à-vis).
- [ ] Ajout/suppression de sièges ; banquet avec décalage centre → extérieur.
- [ ] Tests + commit.

## Phase 3 — Invités & placement (dnd-kit)
- [ ] Liste d'invités centralisée (menus, marié·e, à confirmer), ajout en masse.
- [ ] Glisser un invité vers un siège ; échange ; retour « à placer ».
- [ ] Tests + commit.

## Phase 4 — Capacité : auto-dimensionnement & alertes
- [ ] À la création d'une table, proposer la taille via `dimensionnerPour(n, shape)`.
- [ ] Choix manuel de taille → capacité recalculée en direct.
- [ ] Badge d'état (`etatCapacite`) + avertissement au dépassement.
- [ ] Tests + commit.

## Phase 5 — Persistance Supabase
- [ ] Schéma SQL (tables ci-dessus) + migrations.
- [ ] Auth planner (magic link). Row-Level Security.
- [ ] CRUD projets/tables/invités ; sauvegarde temps réel.
- [ ] Historique de versions (`version.snapshot_jsonb`) + undo/redo.
- [ ] Commit.

## Phase 6 — Partage planner → mariés
- [ ] `project_share` : inviter un couple par e-mail, rôle lecture ou édition.
- [ ] Vue « mariés » simplifiée. RLS testée.
- [ ] Commit.

## Phase 7 — Thèmes & export PDF
- [ ] Thèmes de couleurs (presets + custom), appliqués UI + PDF.
- [ ] Export PDF : couverture, plan de salle à l'échelle, une page par table.
- [ ] Commit.

## Phase 8 — Commercialisation
- [ ] Stripe : abonnement planner, limites par plan.
- [ ] Multi-projet, tableau de bord planner, onboarding.
- [ ] Déploiement Vercel + domaine.

---

### Prompt de démarrage (Phase 0)
> Lis CLAUDE.md, ARCHITECTURE.md et lib/geometry/tableGeometry.js.
> En mode plan, propose la Phase 0 : conversion du moteur en TypeScript typé,
> mise en place de vitest avec les tests portés, et les types du domaine dans
> lib/types.ts. Petits diffs, tests à l'appui. Attends ma validation avant d'implémenter.
