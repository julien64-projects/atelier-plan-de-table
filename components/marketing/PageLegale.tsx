import Link from 'next/link';
import type { ReactNode } from 'react';
import { MAJ_LEGALE, SOCIETE } from '@/lib/legal/societe';

/**
 * Gabarit des pages légales. Volontairement sobre et statique (pas de
 * 'use client') : ces pages doivent être lisibles, imprimables et indexables
 * sans dépendre de JavaScript.
 *
 * Elles sont rédigées en français uniquement : ce sont des documents de droit
 * français engageant Tickly SAS, une traduction n'aurait pas valeur
 * contractuelle et créerait un risque d'interprétation.
 */
export default function PageLegale({
  titre,
  chapeau,
  children,
}: {
  titre: string;
  chapeau?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-ink">
      <header className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="text-[10px] uppercase tracking-[0.3em] text-blush font-semibold py-2 pr-2">
          {SOCIETE.marque}
        </Link>
        <Link href="/" className="text-sm text-muted hover:text-ink transition-colors py-2 px-1 -mr-1">
          ← Retour au site
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-20">
        <h1
          className="text-3xl sm:text-4xl leading-tight mt-6"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {titre}
        </h1>
        {chapeau && <p className="mt-4 text-muted leading-relaxed">{chapeau}</p>}
        <p className="mt-3 text-xs text-faint">Dernière mise à jour : {MAJ_LEGALE}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted [&_h2]:text-ink [&_h2]:text-lg [&_h2]:mb-2 [&_h3]:text-ink [&_h3]:text-base [&_h3]:mb-1 [&_strong]:text-ink [&_a]:text-terracotta [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1">
          {children}
        </div>
      </main>

      <footer className="border-t border-line">
        <nav className="max-w-3xl mx-auto px-6 py-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-faint">
          <Link href="/mentions-legales" className="inline-block py-2 hover:text-ink transition-colors">Mentions légales</Link>
          <Link href="/cgv" className="inline-block py-2 hover:text-ink transition-colors">Conditions générales</Link>
          <Link href="/confidentialite" className="inline-block py-2 hover:text-ink transition-colors">Confidentialité</Link>
          <Link href="/cookies" className="inline-block py-2 hover:text-ink transition-colors">Cookies</Link>
          <Link href="/securite" className="inline-block py-2 hover:text-ink transition-colors">Sécurité des paiements</Link>
        </nav>
      </footer>
    </div>
  );
}

/**
 * Point de contact publié.
 *
 * Tant qu'aucune adresse électronique n'est renseignée dans `societe.ts`, on
 * publie l'adresse postale du siège : un moyen de contact reste ainsi
 * disponible, ce que la loi exige, sans exposer de boîte personnelle.
 *
 * Les phrases qui l'utilisent sont toutes construites avec deux points
 * (« Nous écrire : … ») afin de rester correctes dans les deux cas, sans
 * problème d'article contracté.
 */
export function Contact() {
  if (SOCIETE.email) {
    return <a href={`mailto:${SOCIETE.email}`}>{SOCIETE.email}</a>;
  }
  return <span className="text-ink">{SOCIETE.siege}</span>;
}

/** Section titrée, pour homogénéiser la structure des documents. */
export function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section>
      <h2 style={{ fontFamily: 'var(--font-serif)' }}>{titre}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
