import type { Metadata } from 'next';
import Landing from '@/components/marketing/Landing';
import { FAQ } from '@/lib/marketing/faq';
import { translate } from '@/lib/i18n/dictionary';
import { SOCIETE, TARIF } from '@/lib/legal/societe';

const TITRE = 'TablePlan — Logiciel de plan de table de mariage en ligne';
const DESCRIPTION =
  'Créez votre plan de table de mariage en ligne : plan de salle à l’échelle réelle, placement des invités par glisser-déposer, contrôle de capacité et des allées, partage par lien aux mariés et export PDF. Gratuit pour un projet, puis 4,90 € HT/mois.';

export const metadata: Metadata = {
  metadataBase: new URL(SOCIETE.siteUrl),
  title: TITRE,
  description: DESCRIPTION,
  keywords: [
    'plan de table mariage',
    'logiciel plan de table',
    'plan de salle mariage',
    'placement des invités',
    'plan de table en ligne',
    'wedding seating chart',
    'outil wedding planner',
    'combien de personnes par table ronde',
  ],
  authors: [{ name: SOCIETE.nom }],
  creator: SOCIETE.nom,
  publisher: SOCIETE.nom,
  alternates: {
    canonical: '/',
    languages: { 'fr-FR': '/', 'en-GB': '/' },
  },
  openGraph: {
    title: 'TablePlan — Plan de table de mariage en ligne',
    description:
      'Plan de salle à l’échelle, placement par glisser-déposer, partage aux mariés par lien privé et export PDF. Gratuit pour un projet.',
    type: 'website',
    locale: 'fr_FR',
    siteName: SOCIETE.marque,
    url: SOCIETE.siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TablePlan — Plan de table de mariage en ligne',
    description: 'Plan de salle à l’échelle, placement par glisser-déposer, partage aux mariés, export PDF.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  category: 'technology',
};

/**
 * Données structurées. Trois graphes distincts, tous rattachés par leur @id :
 *
 * - Organization  : identifie l'éditeur (Tickly SAS) — utile pour le
 *   « knowledge graph » et pour que les moteurs génératifs sachent qui édite.
 * - SoftwareApplication : ce qu'est le produit et à quel prix.
 * - FAQPage       : les questions/réponses de la page. Ce sont elles qui
 *   ont le plus de chances d'être citées telles quelles par un assistant,
 *   d'où des réponses chiffrées et autoportantes.
 *
 * Les textes proviennent du dictionnaire : une seule source, donc aucun
 * risque de divergence entre ce que lit l'humain et ce que lit la machine.
 */
function donneesStructurees() {
  const fr = (cle: string) => translate('fr', cle);

  const organisation = {
    '@type': 'Organization',
    '@id': `${SOCIETE.siteUrl}/#organisation`,
    name: SOCIETE.nom,
    legalName: `${SOCIETE.nom} SAS`,
    url: SOCIETE.siteUrl,
    email: SOCIETE.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '47 rue Vivienne',
      postalCode: '75002',
      addressLocality: 'Paris',
      addressCountry: 'FR',
    },
    identifier: [
      { '@type': 'PropertyValue', propertyID: 'SIREN', value: SOCIETE.siren },
      { '@type': 'PropertyValue', propertyID: 'RCS', value: `${SOCIETE.rcsVille} ${SOCIETE.rcsNumero}` },
    ],
  };

  const application = {
    '@type': 'SoftwareApplication',
    '@id': `${SOCIETE.siteUrl}/#application`,
    name: SOCIETE.marque,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Logiciel de plan de table',
    operatingSystem: 'Web (navigateur)',
    url: SOCIETE.siteUrl,
    description: DESCRIPTION,
    inLanguage: ['fr', 'en'],
    publisher: { '@id': `${SOCIETE.siteUrl}/#organisation` },
    featureList: [
      'Plan de salle à l’échelle réelle en mètres',
      'Placement des invités par glisser-déposer',
      'Contrôle automatique de la capacité des tables',
      'Vérification des allées de service (minimum 120 cm)',
      'Partage par lien privé, sans création de compte',
      'Collaboration en temps réel',
      'Export PDF et image',
      'Interface bilingue français / anglais',
    ],
    offers: [
      {
        '@type': 'Offer',
        name: fr('land.pricing.freeplan'),
        price: '0',
        priceCurrency: TARIF.devise,
        description: 'Un projet, sans limite de durée et sans carte bancaire.',
      },
      {
        '@type': 'Offer',
        name: fr('land.pricing.plan'),
        price: TARIF.valeurNumerique,
        priceCurrency: TARIF.devise,
        description: 'Projets illimités. Prix mensuel hors taxes, sans engagement.',
      },
    ],
  };

  const faq = {
    '@type': 'FAQPage',
    '@id': `${SOCIETE.siteUrl}/#faq`,
    mainEntity: FAQ.map(q => ({
      '@type': 'Question',
      name: fr(`land.faq.${q}`),
      acceptedAnswer: { '@type': 'Answer', text: fr(`land.faq.a${q.slice(1)}`) },
    })),
  };

  return { '@context': 'https://schema.org', '@graph': [organisation, application, faq] };
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees()) }}
      />
      <Landing />
    </>
  );
}
