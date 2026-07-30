import type { Metadata } from 'next';
import PageLegale, { Section } from '@/components/marketing/PageLegale';
import { SOCIETE, TARIF } from '@/lib/legal/societe';

export const metadata: Metadata = {
  title: 'Conditions générales de vente et d’utilisation — TablePlan',
  description:
    'Conditions générales de vente et d’utilisation du service TablePlan édité par Tickly SAS : abonnement 4,90 € HT par mois, durée, résiliation, rétractation et responsabilités.',
  alternates: { canonical: `${SOCIETE.siteUrl}/cgv` },
};

export default function CGV() {
  return (
    <PageLegale
      titre="Conditions générales de vente et d’utilisation"
      chapeau={`Les présentes conditions régissent l’accès et l’utilisation du service ${SOCIETE.marque}, édité par ${SOCIETE.nom}. Toute souscription vaut acceptation pleine et entière.`}
    >
      <Section titre="1. Objet">
        <p>
          {SOCIETE.marque} est un service en ligne (SaaS) permettant de concevoir des plans
          de table pour des réceptions : création d’un plan de salle à l’échelle, placement
          des invités, contrôle de capacité des tables, partage du plan et export en PDF ou
          en image.
        </p>
        <p>
          Le service s’adresse principalement aux professionnels de l’événementiel
          (wedding planners, traiteurs, lieux de réception) ainsi qu’aux particuliers
          organisant leur propre réception.
        </p>
      </Section>

      <Section titre="2. Compte et accès">
        <p>
          L’utilisation du service nécessite la création d’un compte au moyen d’une adresse
          électronique valide et d’un mot de passe. Vous êtes responsable de la
          confidentialité de vos identifiants et de toute activité effectuée depuis votre
          compte.
        </p>
        <p>
          Le titulaire d’un compte peut partager un projet au moyen d’un <strong>lien
          privé</strong>. Toute personne disposant de ce lien accède au projet, en lecture
          ou en modification selon le droit accordé, sans création de compte. Il vous
          appartient de ne transmettre ce lien qu’aux personnes concernées et de le
          révoquer depuis le service lorsqu’il n’a plus lieu d’être.
        </p>
      </Section>

      <Section titre="3. Offre gratuite et abonnement">
        <p>
          Le service comprend une <strong>offre gratuite</strong> permettant de gérer un
          projet, sans limitation de durée et sans saisie de moyen de paiement.
        </p>
        <p>
          L’<strong>abonnement</strong>, au prix de <strong>{TARIF.montantHT} hors taxes {TARIF.periode}</strong>,
          donne accès à un nombre illimité de projets. La taxe sur la valeur ajoutée
          applicable s’ajoute au prix indiqué, au taux en vigueur à la date de facturation.
        </p>
        <p>
          Les personnes invitées sur un projet par lien privé — notamment les mariés —
          n’ont pas à souscrire d’abonnement : leur accès reste gratuit et n’est pas
          affecté par l’état de l’abonnement de la personne qui les a invitées.
        </p>
      </Section>

      <Section titre="4. Paiement">
        <p>
          Le paiement s’effectue par carte bancaire via <strong>Stripe Payments Europe,
          Ltd.</strong>, prestataire de paiement certifié PCI DSS niveau 1. Les données de
          carte bancaire sont saisies directement sur une page hébergée par Stripe :{' '}
          <strong>elles ne transitent ni ne sont stockées sur les serveurs de {SOCIETE.nom}</strong>.
        </p>
        <p>
          L’abonnement est facturé d’avance, par période mensuelle, et reconduit tacitement
          à chaque échéance jusqu’à résiliation. Les factures sont accessibles à tout moment
          depuis l’espace de facturation du service.
        </p>
        <p>
          En cas d’échec de prélèvement, l’accès aux fonctions payantes est maintenu
          jusqu’au terme de la période déjà réglée. Il est suspendu au-delà, sans que les
          données créées soient supprimées.
        </p>
      </Section>

      <Section titre="5. Durée et résiliation">
        <p>
          L’abonnement est conclu pour une durée indéterminée, par périodes mensuelles
          successives. Il peut être résilié à tout moment et sans motif depuis l’espace de
          facturation.
        </p>
        <p>
          La résiliation prend effet au terme de la période en cours : l’accès aux
          fonctions payantes est conservé jusqu’à cette date, sans reconduction ultérieure.
          Aucun remboursement au prorata n’est effectué pour la période entamée.
        </p>
        <p>
          À l’issue de l’abonnement, le compte bascule automatiquement vers l’offre
          gratuite. Les projets existants restent consultables et modifiables ; seule la
          création de nouveaux projets au-delà du quota gratuit est bloquée.
        </p>
      </Section>

      <Section titre="6. Droit de rétractation">
        <p>
          <strong>Consommateurs.</strong> Conformément à l’article L. 221-18 du code de la
          consommation, vous disposez d’un délai de quatorze (14) jours à compter de la
          souscription pour exercer votre droit de rétractation, sans motif ni pénalité, en
          écrivant à <a href={`mailto:${SOCIETE.email}`}>{SOCIETE.email}</a>.
        </p>
        <p>
          En demandant l’accès immédiat au service, vous sollicitez l’exécution du contrat
          avant la fin de ce délai. Si vous vous rétractez ensuite, vous restez redevable
          du montant correspondant à la période effectivement utilisée, conformément à
          l’article L. 221-25 du même code.
        </p>
        <p>
          <strong>Professionnels.</strong> Le droit de rétractation ne s’applique pas aux
          contrats conclus par un professionnel pour les besoins de son activité, sauf dans
          les cas prévus à l’article L. 221-3 du code de la consommation.
        </p>
      </Section>

      <Section titre="7. Disponibilité et évolutions">
        <p>
          {SOCIETE.nom} met en œuvre les moyens raisonnables pour assurer la disponibilité
          du service, sans garantie d’un fonctionnement ininterrompu ni exempt d’erreur.
          Des interruptions peuvent survenir pour maintenance, mise à jour ou pour une
          cause extérieure telle qu’une défaillance d’un prestataire d’hébergement.
        </p>
        <p>
          Le service évolue régulièrement. {SOCIETE.nom} peut modifier ou retirer des
          fonctionnalités ; toute modification substantielle défavorable aux abonnés est
          annoncée par courrier électronique avec un préavis raisonnable, ouvrant droit à
          résiliation sans frais.
        </p>
      </Section>

      <Section titre="8. Vos données et vos contenus">
        <p>
          Vous conservez l’entière propriété des contenus que vous créez. {SOCIETE.nom} ne
          les exploite que pour fournir le service, et ne les cède ni ne les commercialise.
        </p>
        <p>
          Vous pouvez à tout moment exporter votre plan de table en PDF ou en image. En cas
          de fermeture de compte, les données associées sont supprimées dans les conditions
          décrites par la <a href="/confidentialite">politique de confidentialité</a>.
        </p>
        <p>
          Vous êtes responsable des données personnelles de vos invités que vous saisissez
          dans le service, et notamment de disposer d’une base légale pour les traiter. Il
          est recommandé de n’y renseigner que les informations strictement nécessaires au
          placement à table.
        </p>
      </Section>

      <Section titre="9. Responsabilité">
        <p>
          {SOCIETE.nom} est tenue d’une obligation de moyens. Sa responsabilité ne saurait
          être engagée pour les dommages indirects, notamment perte d’exploitation, perte
          de clientèle ou préjudice d’image.
        </p>
        <p>
          En tout état de cause, et hors faute lourde ou dolosive, la responsabilité de
          {' '}{SOCIETE.nom} est limitée au montant des sommes effectivement versées par
          l’abonné au cours des douze (12) mois précédant le fait générateur.
        </p>
        <p>
          Le plan de table produit par le service est un outil d’aide à l’organisation. Il
          vous appartient de vérifier la conformité du plan aux contraintes réelles du lieu
          de réception, notamment en matière de sécurité et d’accessibilité.
        </p>
      </Section>

      <Section titre="10. Suspension">
        <p>
          {SOCIETE.nom} peut suspendre ou fermer un compte en cas d’utilisation contraire
          aux présentes conditions, de tentative d’atteinte à la sécurité du service ou de
          défaut de paiement persistant. Sauf urgence ou obligation légale, la suspension
          est précédée d’une mise en demeure restée sans effet pendant quinze (15) jours.
        </p>
      </Section>

      <Section titre="11. Droit applicable et différends">
        <p>
          Les présentes conditions sont soumises au droit français. En cas de différend,
          une solution amiable sera recherchée en priorité, en écrivant à{' '}
          <a href={`mailto:${SOCIETE.email}`}>{SOCIETE.email}</a>.
        </p>
        <p>
          <strong>Consommateurs.</strong> Conformément à l’article L. 612-1 du code de la
          consommation, vous pouvez recourir gratuitement à un médiateur de la
          consommation. Vous pouvez également utiliser la plateforme européenne de
          règlement en ligne des litiges.
        </p>
        <p>
          À défaut d’accord, le litige sera porté devant les tribunaux compétents. Pour les
          litiges entre professionnels, compétence est attribuée aux tribunaux du ressort
          du siège social de {SOCIETE.nom}.
        </p>
      </Section>
    </PageLegale>
  );
}
