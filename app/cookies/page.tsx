import type { Metadata } from 'next';
import PageLegale, { Section } from '@/components/marketing/PageLegale';
import { SOCIETE } from '@/lib/legal/societe';

export const metadata: Metadata = {
  title: 'Cookies et stockage local — TablePlan',
  description:
    'TablePlan n’utilise aucun cookie publicitaire ni outil de mesure d’audience. Détail des données strictement nécessaires stockées dans votre navigateur.',
  alternates: { canonical: `${SOCIETE.siteUrl}/cookies` },
};

const ENTREES = [
  {
    cle: 'sb-…-auth-token',
    type: 'Stockage local',
    role: 'Maintient votre session ouverte entre deux visites. Émis par Supabase, notre prestataire d’authentification.',
    duree: 'Jusqu’à la déconnexion ou l’expiration de la session',
  },
  {
    cle: 'apt:lang',
    type: 'Stockage local',
    role: 'Mémorise la langue choisie (français ou anglais).',
    duree: 'Jusqu’à effacement par vos soins',
  },
  {
    cle: 'apt:theme:v1',
    type: 'Stockage local',
    role: 'Mémorise le thème clair ou sombre et vos couleurs personnalisées.',
    duree: 'Jusqu’à effacement par vos soins',
  },
  {
    cle: 'apt:liens:…',
    type: 'Stockage local',
    role: 'Conserve les liens de partage que vous avez créés, afin de pouvoir les recopier depuis cet appareil.',
    duree: 'Jusqu’à révocation du lien ou effacement par vos soins',
  },
  {
    cle: 'apt:projet-rejoint',
    type: 'Stockage local',
    role: 'Retient le projet rejoint via un lien de partage, pour l’ouvrir directement à la visite suivante.',
    duree: 'Jusqu’à effacement par vos soins',
  },
  {
    cle: 'apt:v1:planner, apt:imported',
    type: 'Stockage local',
    role: 'Reprise d’un plan créé avant l’arrivée des comptes en ligne, et marqueur évitant de l’importer deux fois.',
    duree: 'Jusqu’à effacement par vos soins',
  },
] as const;

export default function Cookies() {
  return (
    <PageLegale
      titre="Cookies et stockage local"
      chapeau="TablePlan ne dépose aucun cookie publicitaire, aucun traceur tiers et aucun outil de mesure d’audience. Seules des informations strictement nécessaires au fonctionnement du service sont enregistrées dans votre navigateur."
    >
      <Section titre="Pourquoi aucune bannière de consentement">
        <p>
          Le consentement préalable n’est exigé que pour les traceurs qui ne sont pas
          strictement nécessaires au service demandé — mesure d’audience non exemptée,
          publicité, réseaux sociaux. {SOCIETE.marque} n’en utilise aucun.
        </p>
        <p>
          Les seules informations enregistrées le sont pour vous garder connecté et
          conserver vos préférences d’affichage : elles relèvent de l’exemption prévue à
          l’article 82 de la loi Informatique et Libertés. Une bannière n’aurait ici aucun
          objet, et nous n’en affichons donc pas.
        </p>
        <p>
          Si un outil de mesure d’audience venait à être ajouté, cette page serait mise à
          jour et un mécanisme de consentement conforme serait mis en place au préalable.
        </p>
      </Section>

      <Section titre="Ce qui est enregistré">
        <p>
          Ces éléments sont stockés dans le <strong>stockage local</strong> de votre
          navigateur. Contrairement aux cookies, ils ne sont pas transmis automatiquement à
          chaque requête : ils restent sur votre appareil et ne sont lus que par
          l’application elle-même.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse mt-2">
            <thead>
              <tr className="text-left text-ink border-b border-line">
                <th className="py-2 pr-3 font-medium">Clé</th>
                <th className="py-2 pr-3 font-medium">Rôle</th>
                <th className="py-2 font-medium">Durée</th>
              </tr>
            </thead>
            <tbody>
              {ENTREES.map(e => (
                <tr key={e.cle} className="border-b border-line/60 align-top">
                  <td className="py-2 pr-3 font-mono text-[11px] text-ink whitespace-nowrap">{e.cle}</td>
                  <td className="py-2 pr-3">{e.role}</td>
                  <td className="py-2 whitespace-nowrap">{e.duree}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section titre="Paiement">
        <p>
          Le règlement de l’abonnement s’effectue sur une page hébergée par Stripe, qui
          dépose ses propres cookies nécessaires à la sécurisation de la transaction et à la
          prévention de la fraude. Ces dépôts relèvent de la politique de confidentialité de
          Stripe et interviennent uniquement lorsque vous accédez à la page de paiement.
        </p>
      </Section>

      <Section titre="Comment les effacer">
        <p>
          Vous pouvez supprimer ces informations à tout moment depuis les paramètres de
          confidentialité de votre navigateur, rubrique « données de site » ou « stockage
          local ». La suppression entraîne votre déconnexion et la perte de vos préférences
          d’affichage ; vos projets, eux, sont conservés sur nos serveurs et vous les
          retrouverez à la reconnexion.
        </p>
        <p>
          Un cas mérite attention : effacer le stockage local vous fait perdre la
          possibilité de <strong>recopier</strong> les liens de partage créés depuis cet
          appareil. Les liens déjà transmis continuent de fonctionner ; simplement, ils ne
          pourront plus être réaffichés et il faudra en créer de nouveaux.
        </p>
      </Section>
    </PageLegale>
  );
}
