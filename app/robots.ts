import type { MetadataRoute } from 'next';
import { SOCIETE } from '@/lib/legal/societe';

/**
 * Règles d'exploration.
 *
 * `/rejoindre/` est interdit d'exploration : l'URL EST le secret d'accès au
 * plan de table. Un lien qui fuiterait dans un index serait un lien ouvert à
 * tous. La page porte déjà `robots: noindex`, ceci en est la seconde barrière.
 *
 * Les robots des moteurs génératifs (GPTBot, ClaudeBot, PerplexityBot…) ne
 * sont pas bloqués : être cité par un assistant quand on demande « comment
 * faire un plan de table » est précisément l'objectif recherché.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/app', '/rejoindre/', '/maries', '/api/'],
      },
    ],
    sitemap: `${SOCIETE.siteUrl}/sitemap.xml`,
    host: SOCIETE.siteUrl,
  };
}
