import type { Metadata } from 'next';
import Landing from '@/components/marketing/Landing';

export const metadata: Metadata = {
  title: 'TablePlan — Logiciel de plan de table de mariage en ligne',
  description:
    'TablePlan aide wedding planners et mariés à créer leur plan de table : placement des invités par glisser-déposer, collaboration en temps réel, plan à l’échelle réelle, export PDF. Abonnement 4,90 € HT/mois.',
  keywords: [
    'plan de table mariage',
    'logiciel plan de table',
    'placement des invités',
    'wedding seating chart',
    'wedding planner',
    'plan de salle mariage',
    'seating plan',
  ],
  alternates: { canonical: 'https://atelier-plan-de-table.vercel.app/' },
  openGraph: {
    title: 'TablePlan — Plan de table de mariage en ligne',
    description:
      'Placez vos invités par glisser-déposer, collaborez en temps réel avec les mariés et exportez en PDF. À partir de 4,90 € HT/mois.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'TablePlan',
  },
};

// Données structurées (SEO / GEO) : application logicielle + offre.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'TablePlan',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'Logiciel de plan de table de mariage en ligne : placement des invités par glisser-déposer, collaboration en temps réel entre wedding planner et mariés, plan à l’échelle réelle, export PDF.',
  offers: {
    '@type': 'Offer',
    price: '4.90',
    priceCurrency: 'EUR',
    description: 'Abonnement mensuel, HT',
  },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Landing />
    </>
  );
}
