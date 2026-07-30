import type { Metadata } from 'next';
import PageLegale, { Section, Contact } from '@/components/marketing/PageLegale';
import { SOCIETE, TARIF } from '@/lib/legal/societe';

export const metadata: Metadata = {
  title: 'Conditions générales de vente et d’utilisation — TablePlan',
  description:
    'Conditions générales de vente et d’utilisation du service TablePlan édité par Tickly SAS. Abonnement professionnel à 4,90 € HT par mois : durée, résiliation, paiement et responsabilités.',
  alternates: { canonical: `${SOCIETE.siteUrl}/cgv` },
};

export default function CGV() {
  return (
    <PageLegale
      titre="Conditions générales de vente et d’utilisation"
      chapeau={`Les présentes conditions régissent l’accès et l’utilisation du service ${SOCIETE.marque}, édité par ${SOCIETE.nom}. L’abonnement payant est réservé aux professionnels. Toute souscription vaut acceptation pleine et entière.`}
    >
      <Section titre="1. Objet et champ d’application">
        <p>
          {SOCIETE.marque} est un service en ligne (SaaS) permettant de concevoir des plans
          de table pour des réceptions : création d’un plan de salle à l’échelle, placement
          des invités, contrôle de capacité des tables, partage du plan et export en PDF ou
          en image.
        </p>
        <p>
          Conformément à l’article L. 441-1 du code de commerce, les présentes conditions
          constituent le <strong>socle unique de la négociation commerciale</strong>. Elles
          prévalent sur toutes conditions d’achat du client, sauf accord écrit contraire de
          {' '}{SOCIETE.nom}.
        </p>
      </Section>

      <Section titre="2. Qualité de professionnel">
        <p>
          <strong>L’abonnement payant est exclusivement réservé aux professionnels</strong> :
          wedding planners, agences événementielles, traiteurs, lieux de réception et,
          plus largement, toute personne physique ou morale souscrivant pour les besoins de
          son activité professionnelle.
        </p>
        <p>
          En souscrivant, le client déclare agir à des fins professionnelles et garantit
          l’exactitude des informations d’identification et de facturation communiquées,
          notamment sa dénomination sociale et son numéro d’identification à la TVA
          lorsqu’il en dispose.
        </p>
        <p>
          L’<strong>offre gratuite</strong> demeure accessible à toute personne, y compris à
          un particulier organisant sa propre réception. Elle ne donne lieu à aucun
          paiement : seuls les articles relatifs à l’utilisation du service, aux données et
          à la responsabilité lui sont applicables.
        </p>
        <p>
          Les personnes invitées sur un projet au moyen d’un lien privé — notamment les
          mariés — <strong>n’ont jamais à souscrire ni à payer</strong>. Leur accès est
          gratuit et n’est pas affecté par l’état de l’abonnement de la personne qui les a
          invitées.
        </p>
      </Section>

      <Section titre="3. Compte et accès">
        <p>
          L’utilisation du service nécessite la création d’un compte au moyen d’une adresse
          électronique valide et d’un mot de passe. Le client est responsable de la
          confidentialité de ses identifiants et de toute activité effectuée depuis son
          compte.
        </p>
        <p>
          Le titulaire d’un compte peut partager un projet au moyen d’un <strong>lien
          privé</strong>. Toute personne disposant de ce lien accède au projet, en lecture
          ou en modification selon le droit accordé, sans création de compte. Il appartient
          au client de ne transmettre ce lien qu’aux personnes concernées et de le révoquer
          depuis le service lorsqu’il n’a plus lieu d’être.
        </p>
      </Section>

      <Section titre="4. Offre gratuite et abonnement">
        <p>
          Le service comprend une <strong>offre gratuite</strong> permettant de gérer un
          projet, sans limitation de durée et sans saisie de moyen de paiement.
        </p>
        <p>
          L’<strong>abonnement</strong>, au prix de{' '}
          <strong>{TARIF.montantHT} hors taxes {TARIF.periode}</strong>, donne accès à un
          nombre illimité de projets. Les prix s’entendent hors taxes ; la taxe sur la
          valeur ajoutée applicable s’ajoute au taux en vigueur à la date de facturation.
        </p>
        <p>
          Pour les clients professionnels établis dans un autre État membre de l’Union
          européenne et disposant d’un numéro de TVA intracommunautaire valide, la
          facturation est établie hors taxes et la taxe est autoliquidée par le preneur.
        </p>
        <p>
          {SOCIETE.nom} peut modifier ses tarifs. Toute évolution est notifiée par courrier
          électronique au moins trente (30) jours avant sa prise d’effet et ne s’applique
          qu’aux périodes postérieures. Le client qui la refuse peut résilier sans frais
          avant l’échéance concernée.
        </p>
      </Section>

      <Section titre="5. Conditions de règlement">
        <p>
          Le paiement s’effectue par carte bancaire via <strong>Stripe Payments Europe,
          Ltd.</strong>, prestataire certifié PCI DSS niveau 1. Les données de carte sont
          saisies directement sur une page hébergée par Stripe :{' '}
          <strong>elles ne transitent ni ne sont stockées sur les serveurs de {SOCIETE.nom}</strong>.
        </p>
        <p>
          L’abonnement est payable d’avance, à la souscription puis à chaque échéance
          mensuelle. Le <strong>délai de paiement est immédiat</strong>, le prélèvement
          intervenant à la date d’échéance. Les factures sont accessibles à tout moment
          depuis l’espace de facturation du service.
        </p>
        <p>
          <strong>Aucun escompte n’est accordé</strong> en cas de paiement anticipé.
        </p>
        <p>
          Conformément aux articles L. 441-10 et D. 441-5 du code de commerce, tout retard
          de paiement entraîne de plein droit, sans mise en demeure préalable :
        </p>
        <ul>
          <li>
            des <strong>pénalités de retard</strong> calculées au taux appliqué par la
            Banque centrale européenne à son opération de refinancement la plus récente,
            majoré de dix (10) points de pourcentage ;
          </li>
          <li>
            une <strong>indemnité forfaitaire pour frais de recouvrement de 40 €</strong>,
            sans préjudice d’une indemnisation complémentaire sur justification si les
            frais réellement exposés la dépassent.
          </li>
        </ul>
        <p>
          En cas d’échec de prélèvement, l’accès aux fonctions payantes est maintenu
          jusqu’au terme de la période déjà réglée, puis suspendu, sans que les données
          créées soient supprimées.
        </p>
      </Section>

      <Section titre="6. Durée et résiliation">
        <p>
          L’abonnement est conclu pour une durée indéterminée, par périodes mensuelles
          successives reconduites tacitement. Il peut être résilié à tout moment et sans
          motif depuis l’espace de facturation, <strong>sans préavis ni pénalité</strong>.
        </p>
        <p>
          La résiliation prend effet au terme de la période en cours : l’accès aux fonctions
          payantes est conservé jusqu’à cette date, sans reconduction ultérieure. Aucun
          remboursement au prorata n’est effectué pour la période entamée.
        </p>
        <p>
          À l’issue de l’abonnement, le compte bascule automatiquement vers l’offre
          gratuite. Les projets existants restent consultables et modifiables ; seule la
          création de nouveaux projets au-delà du quota gratuit est bloquée.
        </p>
      </Section>

      <Section titre="7. Absence de droit de rétractation">
        <p>
          Le droit de rétractation prévu à l’article L. 221-18 du code de la consommation
          est réservé aux consommateurs. <strong>Il ne s’applique pas</strong> à
          l’abonnement souscrit par un professionnel pour les besoins de son activité.
        </p>
        <p>
          L’extension prévue à l’article L. 221-3 du même code, au bénéfice des
          professionnels employant au plus cinq salariés, suppose que le contrat n’entre
          pas dans le champ de l’activité principale du souscripteur. Un outil de plan de
          table relevant directement de l’activité d’organisation de réceptions, cette
          extension n’a pas vocation à s’appliquer.
        </p>
        <p>
          L’abonnement étant sans engagement de durée et résiliable à tout moment, le client
          peut en tout état de cause y mettre fin avant l’échéance suivante.
        </p>
      </Section>

      <Section titre="8. Disponibilité et évolutions">
        <p>
          {SOCIETE.nom} met en œuvre les moyens raisonnables pour assurer la disponibilité
          du service, sans garantie d’un fonctionnement ininterrompu ni exempt d’erreur. Des
          interruptions peuvent survenir pour maintenance, mise à jour ou pour une cause
          extérieure telle qu’une défaillance d’un prestataire d’hébergement.
        </p>
        <p>
          Le service évolue régulièrement. {SOCIETE.nom} peut modifier ou retirer des
          fonctionnalités ; toute modification substantielle défavorable aux abonnés est
          annoncée par courrier électronique avec un préavis raisonnable, ouvrant droit à
          résiliation sans frais.
        </p>
      </Section>

      <Section titre="9. Données et contenus">
        <p>
          Le client conserve l’entière propriété des contenus qu’il crée. {SOCIETE.nom} ne
          les exploite que pour fournir le service, et ne les cède ni ne les commercialise.
        </p>
        <p>
          Le client peut à tout moment exporter son plan de table en PDF ou en image. En cas
          de fermeture de compte, les données associées sont supprimées dans les conditions
          décrites par la <a href="/confidentialite">politique de confidentialité</a>.
        </p>
        <p>
          Le client est <strong>responsable de traitement</strong> des données personnelles
          de ses invités qu’il saisit dans le service, {SOCIETE.nom} agissant en qualité de
          sous-traitant. Il lui appartient de disposer d’une base légale, d’informer les
          personnes concernées et de ne renseigner que les informations strictement
          nécessaires au placement à table.
        </p>
      </Section>

      <Section titre="10. Responsabilité">
        <p>
          {SOCIETE.nom} est tenue d’une obligation de moyens. Sa responsabilité ne saurait
          être engagée pour les dommages indirects, notamment perte d’exploitation, perte de
          clientèle, perte de données ou préjudice d’image.
        </p>
        <p>
          En tout état de cause, et hors faute lourde ou dolosive, la responsabilité de{' '}
          {SOCIETE.nom} est limitée au montant des sommes effectivement versées par le
          client au cours des douze (12) mois précédant le fait générateur.
        </p>
        <p>
          Le plan de table produit par le service est un outil d’aide à l’organisation. Il
          appartient au client de vérifier la conformité du plan aux contraintes réelles du
          lieu de réception, notamment en matière de sécurité et d’accessibilité.
        </p>
      </Section>

      <Section titre="11. Suspension">
        <p>
          {SOCIETE.nom} peut suspendre ou fermer un compte en cas d’utilisation contraire
          aux présentes conditions, de tentative d’atteinte à la sécurité du service ou de
          défaut de paiement persistant. Sauf urgence ou obligation légale, la suspension
          est précédée d’une mise en demeure restée sans effet pendant quinze (15) jours.
        </p>
      </Section>

      <Section titre="12. Confidentialité et référence commerciale">
        <p>
          Chaque partie s’engage à préserver la confidentialité des informations non
          publiques échangées à l’occasion du contrat.
        </p>
        <p>
          {SOCIETE.nom} ne citera le nom ou le logo du client à titre de référence
          commerciale qu’avec son accord écrit préalable.
        </p>
      </Section>

      <Section titre="13. Droit applicable et différends">
        <p>
          Les présentes conditions sont soumises au droit français. En cas de différend, une
          solution amiable sera recherchée en priorité. Nous écrire : <Contact />.
        </p>
        <p>
          À défaut d’accord dans un délai de trente (30) jours, <strong>compétence expresse
          est attribuée aux tribunaux compétents de Paris</strong>, y compris en cas de
          pluralité de défendeurs, d’appel en garantie ou de procédure d’urgence.
        </p>
      </Section>
    </PageLegale>
  );
}
