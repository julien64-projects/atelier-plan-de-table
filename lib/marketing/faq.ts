/**
 * faq.ts — Identifiants des questions de la FAQ.
 *
 * Volontairement hors de Landing.tsx : ce dernier est un module client, et
 * Next transforme TOUTES les exportations d'un module client en références
 * opaques. Un tableau importé depuis un composant serveur y devient un proxy,
 * pas un tableau — d'où un `.map is not a function` au prérendu.
 *
 * La page (serveur) et le composant (client) lisent donc la même liste ici :
 * les questions affichées et celles déclarées dans les données structurées ne
 * peuvent pas diverger.
 */
export const FAQ = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'] as const;
