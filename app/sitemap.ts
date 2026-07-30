import type { MetadataRoute } from 'next';
import { SOCIETE } from '@/lib/legal/societe';

/**
 * Plan du site. Seules les pages publiques et stables y figurent : /app est
 * derrière authentification et /rejoindre/<token> ne doit surtout pas être
 * indexé (l'URL est le secret d'accès).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const maj = new Date('2026-07-30');

  return [
    { url: `${SOCIETE.siteUrl}/`, lastModified: maj, changeFrequency: 'monthly', priority: 1 },
    { url: `${SOCIETE.siteUrl}/cgv`, lastModified: maj, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SOCIETE.siteUrl}/confidentialite`, lastModified: maj, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SOCIETE.siteUrl}/mentions-legales`, lastModified: maj, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SOCIETE.siteUrl}/cookies`, lastModified: maj, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SOCIETE.siteUrl}/securite`, lastModified: maj, changeFrequency: 'yearly', priority: 0.4 },
  ];
}
