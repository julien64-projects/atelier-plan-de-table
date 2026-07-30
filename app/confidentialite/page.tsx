import type { Metadata } from 'next';
import PageLegale, { Section } from '@/components/marketing/PageLegale';
import { SOCIETE, SOUS_TRAITANTS } from '@/lib/legal/societe';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — TablePlan',
  description:
    'Comment TablePlan (Tickly SAS) traite vos données personnelles : données collectées, finalités, bases légales, sous-traitants, durées de conservation et exercice de vos droits RGPD.',
  alternates: { canonical: `${SOCIETE.siteUrl}/confidentialite` },
};

export default function Confidentialite() {
  return (
    <PageLegale
      titre="Politique de confidentialité"
      chapeau="Cette politique décrit les données personnelles traitées par TablePlan, pourquoi elles le sont, combien de temps elles sont conservées et comment exercer vos droits."
    >
      <Section titre="Responsable du traitement">
        <p>
          Le responsable du traitement est <strong>{SOCIETE.nom}</strong>, {SOCIETE.forme},
          dont le siège social est situé {SOCIETE.siege}, immatriculée au RCS de{' '}
          {SOCIETE.rcsVille} sous le numéro {SOCIETE.rcsNumero}.
        </p>
        <p>
          Pour toute question relative à vos données :{' '}
          <a href={`mailto:${SOCIETE.email}`}>{SOCIETE.email}</a>.
        </p>
      </Section>

      <Section titre="Deux rôles distincts">
        <p>
          Il faut distinguer deux situations, car elles n’entraînent pas les mêmes
          responsabilités :
        </p>
        <ul>
          <li>
            <strong>Vos données de compte</strong> (adresse électronique, abonnement) :{' '}
            {SOCIETE.nom} en est <strong>responsable de traitement</strong>.
          </li>
          <li>
            <strong>Les données de vos invités</strong> que vous saisissez dans un projet :
            vous en êtes responsable, {SOCIETE.nom} agit comme{' '}
            <strong>sous-traitant</strong> et ne les traite que pour vous fournir le
            service, sur vos instructions.
          </li>
        </ul>
      </Section>

      <Section titre="Données traitées et finalités">
        <h3>Compte et authentification</h3>
        <p>
          Adresse électronique et mot de passe chiffré. Finalité : créer et sécuriser votre
          accès. Base légale : exécution du contrat.
        </p>

        <h3>Contenu de vos projets</h3>
        <p>
          Noms des invités, éventuelles préférences de menu, regroupements, plan de salle et
          placement. Finalité : fournir la fonction de plan de table. Base légale :
          exécution du contrat.
        </p>
        <p>
          Ces informations sont saisies librement par vous. <strong>N’y renseignez que ce
          qui est nécessaire au placement</strong> : le service n’a besoin ni d’adresses, ni
          de numéros de téléphone, ni d’informations de santé. Une allergie alimentaire est
          une donnée de santé — préférez une mention neutre de menu.
        </p>

        <h3>Accès par lien de partage</h3>
        <p>
          Lorsqu’une personne rejoint un projet par lien privé, un compte anonyme technique
          est créé, sans adresse électronique. Seul le prénom éventuellement saisi est
          conservé, afin d’identifier qui modifie le plan. Base légale : intérêt légitime à
          assurer la traçabilité des modifications partagées.
        </p>

        <h3>Abonnement et facturation</h3>
        <p>
          Identifiant client Stripe, statut et échéance de l’abonnement. Les coordonnées
          bancaires ne sont jamais reçues ni conservées par {SOCIETE.nom} : elles sont
          traitées directement par Stripe. Base légale : exécution du contrat et obligation
          légale comptable.
        </p>

        <h3>Journaux techniques</h3>
        <p>
          Journaux d’accès générés par l’hébergeur (adresse IP, horodatage, page appelée).
          Finalité : sécurité et diagnostic d’incident. Base légale : intérêt légitime.
        </p>
      </Section>

      <Section titre="Ce que nous ne faisons pas">
        <ul>
          <li>Aucune revente ni location de données à des tiers.</li>
          <li>Aucune publicité ciblée, aucun profilage commercial.</li>
          <li>Aucun traceur publicitaire ni outil de mesure d’audience tiers.</li>
          <li>Aucune décision automatisée produisant des effets juridiques à votre égard.</li>
        </ul>
      </Section>

      <Section titre="Destinataires et sous-traitants">
        <p>
          Les données sont accessibles aux personnes habilitées de {SOCIETE.nom} et aux
          prestataires techniques suivants, liés par un accord de sous-traitance conforme à
          l’article 28 du RGPD :
        </p>
        <ul>
          {SOUS_TRAITANTS.map(s => (
            <li key={s.nom}>
              <strong>{s.nom}</strong> — {s.role}. Localisation : {s.pays}. {s.garantie}.
            </li>
          ))}
        </ul>
        <p>
          Les transferts éventuels hors de l’Union européenne sont encadrés par les clauses
          contractuelles types adoptées par la Commission européenne.
        </p>
      </Section>

      <Section titre="Durées de conservation">
        <ul>
          <li><strong>Compte actif</strong> : pendant toute la durée d’utilisation du service.</li>
          <li><strong>Après fermeture du compte</strong> : suppression des projets et des invités sous trente (30) jours.</li>
          <li><strong>Compte inactif</strong> : suppression après trois (3) ans sans connexion, après information préalable par courrier électronique.</li>
          <li><strong>Comptes anonymes de partage</strong> : supprimés en même temps que le lien qui les a créés, ou avec le projet.</li>
          <li><strong>Pièces comptables et factures</strong> : dix (10) ans, en application de l’article L. 123-22 du code de commerce.</li>
          <li><strong>Journaux techniques</strong> : douze (12) mois au maximum.</li>
        </ul>
      </Section>

      <Section titre="Sécurité">
        <p>
          Les échanges sont chiffrés en transit (HTTPS/TLS) et les données au repos le sont
          par l’hébergeur. L’accès aux données de chaque projet est contrôlé au niveau de la
          base de données elle-même, par des règles de sécurité au niveau des lignes : un
          compte ne peut lire que les projets qu’il possède ou auxquels il a été
          expressément invité.
        </p>
        <p>
          Les liens de partage reposent sur un jeton aléatoire de 128 bits dont seule
          l’empreinte cryptographique est stockée : le lien lui-même n’existe nulle part
          dans nos bases et ne peut donc pas être reconstitué.
        </p>
      </Section>

      <Section titre="Vos droits">
        <p>
          Vous disposez des droits d’accès, de rectification, d’effacement, de limitation,
          d’opposition et de portabilité, ainsi que du droit de définir des directives
          relatives au sort de vos données après votre décès.
        </p>
        <p>
          Pour les exercer, écrivez à <a href={`mailto:${SOCIETE.email}`}>{SOCIETE.email}</a>.
          Une réponse vous sera apportée dans un délai d’un mois. Une preuve d’identité
          pourra être demandée en cas de doute raisonnable.
        </p>
        <p>
          Si vous êtes un invité figurant sur un plan de table, adressez votre demande à la
          personne qui organise la réception : c’est elle qui décide des données inscrites.
          Nous la relaierons si vous nous contactez directement.
        </p>
        <p>
          Vous pouvez enfin introduire une réclamation auprès de la Commission nationale de
          l’informatique et des libertés (CNIL), 3 place de Fontenoy, TSA 80715, 75334 Paris
          CEDEX 07 — <a href="https://www.cnil.fr" rel="noopener noreferrer" target="_blank">www.cnil.fr</a>.
        </p>
      </Section>

      <Section titre="Modifications">
        <p>
          Cette politique peut être mise à jour pour tenir compte d’évolutions du service ou
          de la réglementation. Toute modification substantielle sera portée à votre
          connaissance par courrier électronique ou lors de votre prochaine connexion.
        </p>
      </Section>
    </PageLegale>
  );
}
