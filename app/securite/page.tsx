import type { Metadata } from 'next';
import PageLegale, { Section } from '@/components/marketing/PageLegale';
import { SOCIETE } from '@/lib/legal/societe';

export const metadata: Metadata = {
  title: 'Sécurité des paiements et des données — TablePlan',
  description:
    'TablePlan ne reçoit ni ne stocke aucune donnée de carte bancaire : les paiements sont traités par Stripe, prestataire certifié PCI DSS niveau 1. Détail des mesures de sécurité.',
  alternates: { canonical: `${SOCIETE.siteUrl}/securite` },
};

export default function Securite() {
  return (
    <PageLegale
      titre="Sécurité des paiements et des données"
      chapeau="Comment vos coordonnées bancaires sont protégées, et pourquoi elles ne transitent jamais par nos serveurs."
    >
      <Section titre="Vos données de carte ne nous sont jamais transmises">
        <p>
          C’est le point essentiel, et il est structurel : <strong>{SOCIETE.marque}
          n’affiche aucun formulaire de carte bancaire</strong>. Lorsque vous souscrivez,
          vous êtes redirigé vers une page de paiement hébergée et servie par{' '}
          <strong>Stripe</strong>. Le numéro de carte, la date d’expiration et le
          cryptogramme sont saisis chez Stripe, sur ses serveurs.
        </p>
        <p>
          Nos serveurs ne reçoivent, ne traitent et ne conservent donc aucune donnée de
          porteur de carte. Nous ne mémorisons qu’un identifiant client opaque fourni par
          Stripe, ainsi que le statut et l’échéance de l’abonnement.
        </p>
      </Section>

      <Section titre="Notre positionnement PCI DSS">
        <p>
          La norme PCI DSS s’applique à tout commerçant acceptant des cartes. Le niveau
          d’exigence dépend de la manière dont les données de carte sont manipulées.
        </p>
        <p>
          En déléguant intégralement la saisie et le traitement à un prestataire certifié,
          {' '}{SOCIETE.nom} relève du périmètre le plus réduit, celui du{' '}
          <strong>questionnaire d’auto-évaluation SAQ A</strong> — celui prévu pour les
          commerçants qui externalisent complètement le paiement.
        </p>
        <p>
          <strong>Stripe Payments Europe, Ltd.</strong> est certifié{' '}
          <strong>PCI DSS niveau 1</strong>, le niveau le plus élevé, audité annuellement
          par un évaluateur qualifié indépendant.
        </p>
      </Section>

      <Section titre="Les mesures que nous appliquons">
        <p>
          Externaliser le paiement ne dispense pas de protéger la page qui y mène : un
          script malveillant injecté sur notre site pourrait rediriger un acheteur vers un
          faux formulaire. Les mesures suivantes visent précisément ce risque.
        </p>
        <ul>
          <li>
            <strong>HTTPS strict.</strong> Tout le trafic est chiffré en TLS, et l’en-tête
            HSTS interdit au navigateur toute connexion non chiffrée pendant deux ans.
          </li>
          <li>
            <strong>Politique de sécurité de contenu.</strong> Seules notre propre origine
            et Stripe peuvent exécuter du script. Aucune autre origine tierce n’est
            autorisée, ce qui neutralise l’injection de script étranger.
          </li>
          <li>
            <strong>Interdiction d’encadrement.</strong> Nos pages ne peuvent être
            affichées dans un cadre externe, parade au détournement de clic.
          </li>
          <li>
            <strong>Aucun traceur tiers.</strong> Ni publicité, ni mesure d’audience
            externe : autant de scripts en moins susceptibles d’être compromis.
          </li>
          <li>
            <strong>Signature des notifications.</strong> Les messages que Stripe nous
            adresse pour signaler un paiement sont vérifiés cryptographiquement. Une
            notification non signée est rejetée : personne ne peut s’octroyer un abonnement
            en imitant Stripe.
          </li>
          <li>
            <strong>Statut d’abonnement non modifiable par le client.</strong> Les colonnes
            de facturation sont en lecture seule pour les comptes connectés ; seul le
            serveur, après vérification auprès de Stripe, peut les écrire.
          </li>
        </ul>
      </Section>

      <Section titre="Sécurité de vos données de projet">
        <ul>
          <li>
            <strong>Cloisonnement au niveau de la base.</strong> Les droits d’accès sont
            appliqués par la base de données elle-même, ligne par ligne, et non par le code
            de l’application. Un compte ne peut lire que les projets qu’il possède ou
            auxquels il a été invité, même en cas de requête forgée.
          </li>
          <li>
            <strong>Liens de partage à jeton.</strong> Chaque lien repose sur un jeton
            aléatoire de 128 bits. Seule son empreinte SHA-256 est enregistrée : le lien
            n’existe nulle part dans nos bases et ne peut pas être reconstitué à partir
            d’elles.
          </li>
          <li>
            <strong>Révocation immédiate.</strong> Supprimer un lien coupe instantanément
            l’accès de toutes les personnes qui l’avaient utilisé.
          </li>
          <li>
            <strong>Hébergement européen.</strong> La base de données est située dans
            l’Union européenne (Irlande).
          </li>
        </ul>
      </Section>

      <Section titre="Signaler une vulnérabilité">
        <p>
          Si vous pensez avoir découvert une faille de sécurité, écrivez à{' '}
          <a href={`mailto:${SOCIETE.email}`}>{SOCIETE.email}</a> en décrivant le problème
          et les étapes permettant de le reproduire. Nous accusons réception sous
          72 heures et vous tenons informé du traitement.
        </p>
        <p>
          Merci de ne pas divulguer publiquement la faille avant qu’un correctif ne soit
          déployé, et de ne pas accéder à des données qui ne vous appartiennent pas.
        </p>
      </Section>
    </PageLegale>
  );
}
