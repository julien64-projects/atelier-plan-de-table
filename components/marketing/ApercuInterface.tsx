/**
 * ApercuInterface.tsx — Reproduction de l'interface en SVG, pour la vitrine.
 *
 * Pourquoi pas une capture d'écran : les plans réels contiennent des noms de
 * vraies personnes, qui n'ont rien à faire dans une page marketing. Un SVG
 * reste par ailleurs net sur écran Retina, pèse quelques kilo-octets, se
 * traduit, s'adapte au thème clair/sombre et reste lisible par les moteurs.
 *
 * Les invités figurés sont fictifs.
 */

const C = {
  fond: 'var(--color-ivory)',
  panneau: 'var(--color-surface)',
  champ: 'var(--color-cream)',
  trait: 'var(--color-line)',
  encre: 'var(--color-ink)',
  attenue: 'var(--color-muted)',
  discret: 'var(--color-faint)',
  accent: 'var(--color-terracotta)',
  rose: 'var(--color-blush)',
  or: 'var(--color-gold)',
  sauge: 'var(--color-sage)',
};

const RONDE_1 = ['Camille', 'Théo', 'Inès', 'Marc', 'Léa', 'Hugo', 'Sarah', 'Paul'];
const RONDE_2 = ['Nora', 'Adrien', 'Jade', 'Louis', 'Emma', 'Sacha'];
const BANQUET = ['Chloé', 'Antoine', 'Manon', 'Les mariés', 'Julie', 'Rémi', 'Alice'];

/** Sièges disposés en cercle autour d'une table ronde. */
function TableRonde({
  cx, cy, r, noms, nom,
}: { cx: number; cy: number; r: number; noms: string[]; nom: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={C.champ} stroke={C.or} strokeOpacity="0.45" />
      <text x={cx} y={cy + 3} textAnchor="middle" fontSize="7" fill={C.attenue}>{nom}</text>
      {noms.map((n, i) => {
        const a = (i / noms.length) * Math.PI * 2 - Math.PI / 2;
        const sx = cx + Math.cos(a) * (r + 9);
        const sy = cy + Math.sin(a) * (r + 9);
        const tx = cx + Math.cos(a) * (r + 20);
        const ty = cy + Math.sin(a) * (r + 20);
        return (
          <g key={n}>
            <circle cx={sx} cy={sy} r="3.4" fill={C.accent} />
            <text
              x={tx} y={ty + 2} textAnchor="middle" fontSize="5.5" fill={C.attenue}
            >
              {n}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default function ApercuInterface({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-line bg-surface overflow-hidden shadow-2xl ${className}`}>
      {/* Barre de fenêtre */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-line bg-cream">
        <span className="w-2 h-2 rounded-full bg-terracotta/60" />
        <span className="w-2 h-2 rounded-full bg-gold/50" />
        <span className="w-2 h-2 rounded-full bg-sage/50" />
        <span className="ml-3 text-[9px] text-faint tracking-wide">
          TablePlan — Mariage Camille &amp; Théo · Salle 25 × 15 m
        </span>
      </div>

      <svg
        viewBox="0 0 600 330"
        className="w-full h-auto block"
        role="img"
        aria-label="Aperçu de l’interface TablePlan : liste d’invités à gauche, plan de salle à l’échelle à droite avec tables rondes et table d’honneur."
      >
        <rect width="600" height="330" fill={C.fond} />

        {/* ---------- Panneau latéral : liste d'invités ---------- */}
        <rect x="0" y="0" width="150" height="330" fill={C.panneau} />
        <line x1="150" y1="0" x2="150" y2="330" stroke={C.trait} />

        <text x="14" y="24" fontSize="7" fill={C.rose} letterSpacing="1.6">MARIAGE</text>
        <text x="14" y="40" fontSize="15" fill={C.encre} fontFamily="var(--font-serif)">TablePlan</text>
        <line x1="14" y1="52" x2="60" y2="52" stroke={C.or} strokeOpacity="0.5" />

        <text x="14" y="74" fontSize="8" fill={C.encre}>Invités (68)</text>
        <text x="103" y="74" fontSize="7" fill={C.discret}>2 mariés</text>

        {/* Champ de recherche */}
        <rect x="14" y="82" width="122" height="14" rx="3" fill={C.champ} stroke={C.trait} />
        <text x="21" y="92" fontSize="6.5" fill={C.discret}>Rechercher un invité…</text>

        {/* Filtres */}
        {['Tout', 'Non placés', 'Placés'].map((f, i) => (
          <g key={f}>
            <rect
              x={14 + i * 41} y="102" width="38" height="11" rx="5.5"
              fill={i === 0 ? C.accent : 'none'} stroke={i === 0 ? C.accent : C.trait}
            />
            <text
              x={33 + i * 41} y="109.5" textAnchor="middle" fontSize="5.5"
              fill={i === 0 ? '#fff' : C.attenue}
            >
              {f}
            </text>
          </g>
        ))}

        {/* Invités */}
        {[
          { n: 'Camille D.', t: 'Table d’honneur', p: true },
          { n: 'Théo M.', t: 'Table d’honneur', p: true },
          { n: 'Inès B.', t: 'Table 1', p: true },
          { n: 'Marc L.', t: 'Table 1', p: true },
          { n: 'Nora K.', t: 'Table 2', p: true },
          { n: 'Adrien P.', t: 'Table 2', p: true },
          { n: 'Sofia R.', t: '', p: false },
          { n: 'Gabriel T.', t: '', p: false },
        ].map((g, i) => (
          <g key={g.n}>
            <rect x="14" y={122 + i * 19} width="122" height="15" rx="3" fill={C.champ} />
            <circle cx="22" cy={129.5 + i * 19} r="2" fill={g.p ? C.sauge : C.discret} />
            <text x="29" y={132 + i * 19} fontSize="6.5" fill={C.encre}>{g.n}</text>
            <text x="90" y={132 + i * 19} fontSize="5.5" fill={g.p ? C.discret : C.rose}>
              {g.t || 'à placer'}
            </text>
          </g>
        ))}

        {/* Capacité */}
        <rect x="14" y="288" width="122" height="26" rx="4" fill={C.champ} stroke={C.sauge} strokeOpacity="0.4" />
        <circle cx="24" cy="301" r="3.5" fill={C.sauge} />
        <text x="33" y="299" fontSize="6" fill={C.encre}>Capacité respectée</text>
        <text x="33" y="308" fontSize="5.5" fill={C.discret}>66 places · 2 libres</text>

        {/* ---------- Plan de salle ---------- */}
        <rect x="164" y="14" width="422" height="302" rx="6" fill="none" stroke={C.or} strokeOpacity="0.35" />

        {/* Grille au mètre */}
        <g stroke={C.trait} strokeOpacity="0.55">
          {Array.from({ length: 13 }, (_, i) => (
            <line key={`v${i}`} x1={164 + i * 33} y1="14" x2={164 + i * 33} y2="316" />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`h${i}`} x1="164" y1={14 + i * 33} x2="586" y2={14 + i * 33} />
          ))}
        </g>

        {/* Cote de la salle */}
        <text x="375" y="10" textAnchor="middle" fontSize="6" fill={C.discret}>25,00 m</text>

        {/* Table d'honneur */}
        <rect x="230" y="52" width="290" height="26" rx="3" fill={C.champ} stroke={C.or} strokeOpacity="0.5" />
        <text x="375" y="68" textAnchor="middle" fontSize="7" fill={C.attenue}>Table d’honneur</text>
        {BANQUET.map((n, i) => {
          const x = 254 + i * 41;
          const marie = n === 'Les mariés';
          return (
            <g key={n}>
              <circle cx={x} cy="44" r={marie ? 4.6 : 3.6} fill={marie ? C.or : C.accent} />
              <text x={x} y="34" textAnchor="middle" fontSize="5.5" fill={marie ? C.or : C.attenue}>
                {n}
              </text>
            </g>
          );
        })}

        <TableRonde cx={268} cy={186} r={30} noms={RONDE_1} nom="Table 1" />
        <TableRonde cx={432} cy={186} r={26} noms={RONDE_2} nom="Table 2" />

        {/* Décor : piste de danse */}
        <rect x="330" y="252" width="90" height="52" rx="4" fill={C.champ} stroke={C.trait} strokeDasharray="3 2" />
        <text x="375" y="281" textAnchor="middle" fontSize="6.5" fill={C.discret}>Piste de danse</text>

        {/* Contrôle d'allée de service. Placé sous l'axe des tables : à leur
            hauteur, la cote passerait sur les noms des convives assis côté
            allée. */}
        <g>
          <line x1="300" y1="228" x2="402" y2="228" stroke={C.sauge} strokeDasharray="3 2" />
          <circle cx="300" cy="228" r="1.6" fill={C.sauge} />
          <circle cx="402" cy="228" r="1.6" fill={C.sauge} />
          <rect x="326" y="221" width="50" height="12" rx="3" fill={C.fond} />
          <text x="351" y="230" textAnchor="middle" fontSize="6" fill={C.sauge}>allée 145 cm</text>
        </g>

        {/* Boutons flottants, en bas à droite : en haut ils masqueraient les
            derniers convives de la table d'honneur. */}
        <g>
          <rect x="466" y="292" width="46" height="14" rx="7" fill={C.champ} stroke={C.trait} />
          <text x="489" y="301.5" textAnchor="middle" fontSize="6" fill={C.attenue}>EXPORTER</text>
          <rect x="518" y="292" width="56" height="14" rx="7" fill={C.champ} stroke={C.trait} />
          <text x="546" y="301.5" textAnchor="middle" fontSize="6" fill={C.attenue}>PLAN TECHNIQUE</text>
        </g>
      </svg>
    </div>
  );
}
