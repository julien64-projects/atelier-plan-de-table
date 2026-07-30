'use client';

import Link from 'next/link';
import { LangProvider, useLang } from '@/lib/i18n/LangProvider';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { LANGS } from '@/lib/i18n/dictionary';

const FEATURES = [
  { icon: '✋', t: 'land.f1.t', d: 'land.f1.d' },
  { icon: '📐', t: 'land.f2.t', d: 'land.f2.d' },
  { icon: '👥', t: 'land.f3.t', d: 'land.f3.d' },
  { icon: '📄', t: 'land.f4.t', d: 'land.f4.d' },
  { icon: '📊', t: 'land.f5.t', d: 'land.f5.d' },
  { icon: '🎨', t: 'land.f6.t', d: 'land.f6.d' },
] as const;

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-1">
      {LANGS.map(l => (
        <button
          key={l.key}
          onClick={() => setLang(l.key)}
          aria-label={l.label}
          className={`px-1.5 py-0.5 text-sm rounded transition-opacity ${lang === l.key ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`}
        >
          {l.flag}
        </button>
      ))}
    </div>
  );
}

function LandingInner() {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-[var(--background)] text-ink">
      {/* En-tête */}
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-blush font-semibold">TablePlan</span>
        </div>
        <div className="flex items-center gap-4">
          <LangToggle />
          <Link href="/app" className="text-sm text-muted hover:text-ink transition-colors">
            {t('land.nav.login')}
          </Link>
          <Link
            href="/app"
            className="px-4 py-1.5 text-sm rounded-full bg-terracotta text-white hover:bg-terracotta-dark transition-colors"
          >
            {t('land.nav.open')}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-blush font-semibold">{t('land.hero.eyebrow')}</p>
        <div className="flex items-center justify-center gap-3 text-gold my-4">
          <span className="h-px w-10 bg-gold/50" />
          <span className="text-sm">&#10086;</span>
          <span className="h-px w-10 bg-gold/50" />
        </div>
        <h1 className="text-4xl sm:text-6xl leading-tight text-ink font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
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
      </section>

      {/* Fonctionnalités */}
      <section className="max-w-6xl mx-auto px-6 py-8">
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

      {/* Tarif */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-center text-2xl sm:text-3xl text-ink mb-10" style={{ fontFamily: 'var(--font-serif)' }}>
          {t('land.pricing.title')}
        </h2>
        <div className="max-w-sm mx-auto rounded-3xl border border-gold/40 bg-surface p-8 text-center shadow-xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-blush font-semibold">{t('land.pricing.plan')}</p>
          <div className="mt-4 flex items-end justify-center gap-1">
            <span className="text-5xl text-ink" style={{ fontFamily: 'var(--font-serif)' }}>{t('land.pricing.price')}</span>
            <span className="text-sm text-muted mb-1.5">{t('land.pricing.period')}</span>
          </div>
          <ul className="mt-6 space-y-2 text-sm text-muted text-left">
            {['land.pricing.b1', 'land.pricing.b2', 'land.pricing.b3', 'land.pricing.b4'].map(b => (
              <li key={b} className="flex items-center gap-2">
                <span className="text-sage">✓</span>
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
      </section>

      {/* Pied */}
      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-faint">
          <div>
            <span className="text-ink font-medium">TablePlan</span>
            <span className="mx-2">·</span>
            {t('land.footer.tagline')}
          </div>
          <div>© 2026 TablePlan. {t('land.footer.rights')}</div>
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
