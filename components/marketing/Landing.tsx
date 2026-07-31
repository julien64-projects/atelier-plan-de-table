'use client';

import Link from 'next/link';
import { LangProvider, useLang } from '@/lib/i18n/LangProvider';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { SOCIETE } from '@/lib/legal/societe';
import { FAQ } from '@/lib/marketing/faq';
import ApercuInterface from './ApercuInterface';
import LangToggle from '../ui/LangToggle';

const FEATURES = [
  { icon: '✋', t: 'land.f1.t', d: 'land.f1.d' },
  { icon: '📐', t: 'land.f2.t', d: 'land.f2.d' },
  { icon: '👥', t: 'land.f3.t', d: 'land.f3.d' },
  { icon: '📄', t: 'land.f4.t', d: 'land.f4.d' },
  { icon: '📊', t: 'land.f5.t', d: 'land.f5.d' },
  { icon: '🎨', t: 'land.f6.t', d: 'land.f6.d' },
] as const;

const ETAPES = ['s1', 's2', 's3'] as const;

const LIENS_LEGAUX = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/cgv', label: 'Conditions générales' },
  { href: '/confidentialite', label: 'Confidentialité' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/securite', label: 'Sécurité des paiements' },
] as const;

function Ornement() {
  return (
    <div className="flex items-center justify-center gap-3 text-gold my-4">
      <span className="h-px w-10 bg-gold/50" />
      <span className="text-sm">&#10086;</span>
      <span className="h-px w-10 bg-gold/50" />
    </div>
  );
}

function LandingInner() {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-[var(--background)] text-ink">
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="text-[10px] uppercase tracking-[0.3em] text-blush font-semibold py-2 pr-2 -ml-0.5">
          {SOCIETE.marque}
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <LangToggle />
          {/* « Se connecter » mène au même écran que « Ouvrir l'app » : sur
              téléphone on n'en garde qu'un, sans quoi l'en-tête se replie sur
              deux lignes et double de hauteur. */}
          <Link href="/app" className="hidden sm:inline text-sm text-muted hover:text-ink transition-colors">
            {t('land.nav.login')}
          </Link>
          <Link
            href="/app"
            className="px-4 py-2 text-sm rounded-full bg-terracotta text-white hover:bg-terracotta-dark transition-colors whitespace-nowrap"
          >
            {t('land.nav.open')}
          </Link>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="max-w-4xl mx-auto px-6 pt-14 pb-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-blush font-semibold">{t('land.hero.eyebrow')}</p>
        <Ornement />
        <h1 className="text-4xl sm:text-6xl leading-tight text-ink" style={{ fontFamily: 'var(--font-serif)' }}>
          {t('land.hero.title')}
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
          {t('land.hero.sub')}
        </p>
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/app"
            className="px-7 py-3 rounded-full bg-terracotta text-white font-medium hover:bg-terracotta-dark transition-colors"
          >
            {t('land.hero.cta')}
          </Link>
          <Link
            href="/app"
            className="px-7 py-3 rounded-full border border-line text-muted hover:text-ink hover:border-gold/60 transition-colors"
          >
            {t('land.hero.cta2')}
          </Link>
        </div>
        <p className="mt-4 text-xs text-faint">{t('land.hero.note')}</p>
      </section>

      {/* ---------- Aperçu de l'interface ---------- */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <ApercuInterface />
        <p className="mt-3 text-center text-xs text-faint">{t('land.apercu.legende')}</p>
      </section>

      {/* ---------- Comment ça marche ---------- */}
      <section className="max-w-6xl mx-auto px-6 py-14 border-t border-line">
        <h2 className="text-center text-2xl sm:text-3xl text-ink mb-10" style={{ fontFamily: 'var(--font-serif)' }}>
          {t('land.how.title')}
        </h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {ETAPES.map(s => (
            <li key={s} className="rounded-2xl border border-line bg-surface p-6">
              <h3 className="text-lg text-ink" style={{ fontFamily: 'var(--font-serif)' }}>
                {t(`land.how.${s}.t`)}
              </h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{t(`land.how.${s}.d`)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Fonctionnalités ---------- */}
      <section className="max-w-6xl mx-auto px-6 py-14 border-t border-line">
        <h2 className="text-center text-2xl sm:text-3xl text-ink mb-10" style={{ fontFamily: 'var(--font-serif)' }}>
          {t('land.features.title')}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(f => (
            <div key={f.t} className="rounded-2xl border border-line bg-surface p-6">
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-3 text-lg text-ink">{t(f.t)}</h3>
              <p className="mt-1.5 text-sm text-muted leading-relaxed">{t(f.d)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Deux publics ---------- */}
      <section className="max-w-6xl mx-auto px-6 py-14 border-t border-line">
        <h2 className="text-center text-2xl sm:text-3xl text-ink mb-10" style={{ fontFamily: 'var(--font-serif)' }}>
          {t('land.who.title')}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {(['planner', 'couple'] as const).map(qui => (
            <div key={qui} className="rounded-2xl border border-line bg-surface p-7">
              <h3 className="text-xl text-ink" style={{ fontFamily: 'var(--font-serif)' }}>
                {t(`land.who.${qui}.t`)}
              </h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{t(`land.who.${qui}.d`)}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {['b1', 'b2', 'b3'].map(b => (
                  <li key={b} className="flex gap-2">
                    <span className="text-sage shrink-0">✓</span>
                    {t(`land.who.${qui}.${b}`)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Tarifs ---------- */}
      <section id="tarifs" className="max-w-6xl mx-auto px-6 py-14 border-t border-line">
        <h2 className="text-center text-2xl sm:text-3xl text-ink mb-10" style={{ fontFamily: 'var(--font-serif)' }}>
          {t('land.pricing.title')}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto items-start">
          {/* Gratuit */}
          <div className="rounded-3xl border border-line bg-surface p-8 text-center">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted font-semibold">{t('land.pricing.freeplan')}</p>
            <div className="mt-4 flex items-end justify-center gap-1">
              <span className="text-4xl text-ink" style={{ fontFamily: 'var(--font-serif)' }}>{t('land.pricing.freeprice')}</span>
              <span className="text-sm text-muted mb-1.5">{t('land.pricing.freeperiod')}</span>
            </div>
            <ul className="mt-6 space-y-2 text-sm text-muted text-left">
              {['fb1', 'fb2', 'fb3', 'fb4'].map(b => (
                <li key={b} className="flex gap-2">
                  <span className="text-sage shrink-0">✓</span>
                  {t(`land.pricing.${b}`)}
                </li>
              ))}
            </ul>
            <Link
              href="/app"
              className="mt-7 block w-full px-5 py-3 rounded-full border border-line text-ink hover:border-gold/60 transition-colors"
            >
              {t('land.pricing.freecta')}
            </Link>
          </div>

          {/* Abonnement */}
          <div className="rounded-3xl border border-gold/40 bg-surface p-8 text-center shadow-xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-blush font-semibold">{t('land.pricing.plan')}</p>
            <div className="mt-4 flex items-end justify-center gap-1">
              <span className="text-5xl text-ink" style={{ fontFamily: 'var(--font-serif)' }}>{t('land.pricing.price')}</span>
              <span className="text-sm text-muted mb-1.5">{t('land.pricing.period')}</span>
            </div>
            <ul className="mt-6 space-y-2 text-sm text-muted text-left">
              {['land.pricing.b1', 'land.pricing.b2', 'land.pricing.b3', 'land.pricing.b4'].map(b => (
                <li key={b} className="flex gap-2">
                  <span className="text-sage shrink-0">✓</span>
                  {t(b)}
                </li>
              ))}
            </ul>
            <Link
              href="/app"
              className="mt-7 block w-full px-5 py-3 rounded-full bg-terracotta text-white font-medium hover:bg-terracotta-dark transition-colors"
            >
              {t('land.pricing.cta')}
            </Link>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-faint">{t('land.pricing.note')}</p>
        <p className="mt-1.5 text-center text-xs text-faint max-w-lg mx-auto leading-relaxed">
          {t('land.pricing.pro')}
        </p>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="max-w-3xl mx-auto px-6 py-14 border-t border-line">
        <h2 className="text-center text-2xl sm:text-3xl text-ink mb-10" style={{ fontFamily: 'var(--font-serif)' }}>
          {t('land.faq.title')}
        </h2>
        <div className="space-y-3">
          {FAQ.map(q => (
            // Le rembourrage vertical est porté par <summary>, pas par
            // <details> : c'est lui la zone cliquable, et sur téléphone elle
            // ne faisait que 24 px de haut.
            <details key={q} className="group rounded-2xl border border-line bg-surface px-5">
              <summary className="cursor-pointer list-none flex items-start justify-between gap-4 text-ink py-4">
                <h3 className="text-base leading-snug">{t(`land.faq.${q}`)}</h3>
                <span className="text-gold shrink-0 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-4 -mt-1 text-sm text-muted leading-relaxed">
                {t(`land.faq.a${q.slice(1)}`)}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- Appel final ---------- */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center border-t border-line">
        <Ornement />
        <h2 className="text-2xl sm:text-3xl text-ink" style={{ fontFamily: 'var(--font-serif)' }}>
          {t('land.cta.title')}
        </h2>
        <p className="mt-3 text-muted">{t('land.cta.sub')}</p>
        <Link
          href="/app"
          className="mt-7 inline-block px-8 py-3 rounded-full bg-terracotta text-white font-medium hover:bg-terracotta-dark transition-colors"
        >
          {t('land.hero.cta')}
        </Link>
      </section>

      {/* ---------- Pied de page ---------- */}
      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-10 grid gap-8 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-ink font-medium">{SOCIETE.marque}</p>
            <p className="mt-1 text-faint text-xs leading-relaxed">{t('land.footer.tagline')}</p>
            <p className="mt-3 text-faint text-xs">{t('land.footer.editor')}</p>
          </div>

          <nav>
            <p className="text-[10px] uppercase tracking-[0.2em] text-faint font-semibold">{t('land.footer.product')}</p>
            <ul className="mt-2 space-y-1 text-xs text-muted">
              <li><Link href="/app" className="inline-block py-2 hover:text-ink transition-colors">{t('land.nav.open')}</Link></li>
              <li><Link href="/#tarifs" className="inline-block py-2 hover:text-ink transition-colors">{t('land.pricing.title')}</Link></li>
            </ul>
          </nav>

          <nav>
            <p className="text-[10px] uppercase tracking-[0.2em] text-faint font-semibold">{t('land.footer.legal')}</p>
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {LIENS_LEGAUX.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-block py-2 hover:text-ink transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="border-t border-line">
          <p className="max-w-6xl mx-auto px-6 py-5 text-xs text-faint">
            © {new Date().getFullYear()} {SOCIETE.nom}. {t('land.footer.rights')}
          </p>
        </div>
      </footer>
    </div>
  );
}

/** Page vitrine publique (SEO/GEO). Fournit langue + thème pour ses propres réglages. */
export default function Landing() {
  return (
    <LangProvider>
      <ThemeProvider>
        <LandingInner />
      </ThemeProvider>
    </LangProvider>
  );
}
