import type { Metadata } from 'next';
import PageLegale, { Section } from '@/components/marketing/PageLegale';
import { SOCIETE, HEBERGEUR } from '@/lib/legal/societe';

export const metadata: Metadata = {
  title: 'Mentions légales — TablePlan',
  description:
    'Mentions légales de TablePlan, service édité par Tickly SAS : identité de l’éditeur, directeur de la publication, hébergeur et propriété intellectuelle.',
  alternates: { canonical: `${SOCIETE.siteUrl}/mentions-legales` },
};

export default function MentionsLegales() {
  return (
    <PageLegale
      titre="Mentions légales"
      chapeau={`Informations relatives à l’éditeur du site ${SOCIETE.siteUrl.replace('https://', '')} et du service ${SOCIETE.marque}, conformément à l’article 6 III de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique.`}
    >
      <Section titre="Éditeur du site">
        <p>
          Le site et le service <strong>{SOCIETE.marque}</strong> sont édités par :
        </p>
        <ul>
          <li><strong>{SOCIETE.nom}</strong>, {SOCIETE.forme}</li>
          <li>Capital social : {SOCIETE.capital}</li>
          <li>Siège social : {SOCIETE.siege}</li>
          <li>Immatriculée au RCS de {SOCIETE.rcsVille} sous le numéro {SOCIETE.rcsNumero}</li>
          <li>SIREN : {SOCIETE.siren}</li>
          <li>Identifiant européen unique (EUID) : {SOCIETE.euid}</li>
          {SOCIETE.tvaIntracom && <li>TVA intracommunautaire : {SOCIETE.tvaIntracom}</li>}
          <li>Date d’immatriculation : {SOCIETE.immatriculation}</li>
          <li>Contact : <a href={`mailto:${SOCIETE.email}`}>{SOCIETE.email}</a></li>
        </ul>
        <p>
          <strong>{SOCIETE.marque}</strong> est une marque exploitée par {SOCIETE.nom}.
        </p>
      </Section>

      <Section titre="Direction">
        <ul>
          <li>Président : {SOCIETE.president}</li>
          <li>Directeur général : {SOCIETE.directeurGeneral}</li>
          <li>Directeur de la publication : {SOCIETE.directeurPublication}</li>
        </ul>
      </Section>

      <Section titre="Hébergement">
        <p>Le site est hébergé par :</p>
        <ul>
          <li><strong>{HEBERGEUR.nom}</strong></li>
          <li>{HEBERGEUR.adresse}</li>
          <li><a href={HEBERGEUR.site} rel="noopener noreferrer" target="_blank">{HEBERGEUR.site}</a></li>
        </ul>
        <p>
          Les données applicatives (comptes, projets, plans de table) sont hébergées par
          Supabase Inc. sur des serveurs situés dans l’Union européenne. Le détail des
          traitements figure dans la <a href="/confidentialite">politique de confidentialité</a>.
        </p>
      </Section>

      <Section titre="Propriété intellectuelle">
        <p>
          L’ensemble des éléments du site et du service — structure, code, interfaces,
          textes, identité visuelle et marque {SOCIETE.marque} — est protégé par le droit
          de la propriété intellectuelle et demeure la propriété exclusive de {SOCIETE.nom},
          sauf mention contraire.
        </p>
        <p>
          Toute reproduction, représentation, adaptation ou exploitation, totale ou
          partielle, sans autorisation écrite préalable est interdite.
        </p>
        <p>
          Les contenus que vous créez dans le service — listes d’invités, plans de salle,
          projets — <strong>vous appartiennent</strong>. {SOCIETE.nom} n’en acquiert aucun
          droit de propriété et ne les exploite que pour vous fournir le service.
        </p>
      </Section>

      <Section titre="Responsabilité">
        <p>
          {SOCIETE.nom} s’efforce d’assurer l’exactitude des informations publiées sur ce
          site, sans pouvoir en garantir l’exhaustivité ni l’absence d’erreur. Les
          conditions d’utilisation et les limites de responsabilité applicables au service
          sont détaillées dans les <a href="/cgv">conditions générales</a>.
        </p>
      </Section>

      <Section titre="Signalement d’un contenu illicite">
        <p>
          Tout contenu manifestement illicite peut être signalé à l’adresse{' '}
          <a href={`mailto:${SOCIETE.email}`}>{SOCIETE.email}</a>, en précisant l’URL
          concernée et le motif du signalement.
        </p>
      </Section>
    </PageLegale>
  );
}
