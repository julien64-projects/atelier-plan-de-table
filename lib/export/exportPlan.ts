/**
 * Export du plan de salle : rendu du Stage Konva en image haute résolution,
 * puis téléchargement PNG ou génération PDF (jsPDF). Isolé de l'UI.
 *
 * Le plan à l'écran est zoomé/déplacé par l'utilisateur ; à l'export on veut
 * TOUTE la salle, cadrée et à résolution constante. On manipule donc le Stage
 * de façon impérative (échelle + position + taille) le temps de la capture,
 * puis on restaure l'état précédent. Les opérations sont synchrones : le
 * navigateur ne repeint pas l'état intermédiaire.
 */
import type Konva from 'konva';

const MARGE_CM = 20;          // marge autour de la salle sur l'image
const CIBLE_PX = 2600;        // côté le plus long de l'image exportée

/** Capture toute la salle en PNG (data URL), quel que soit le zoom courant. */
export function planEnPNG(
  stage: Konva.Stage,
  salleLargeurCm: number,
  salleHauteurCm: number,
): string {
  const largeurTot = salleLargeurCm + 2 * MARGE_CM;
  const hauteurTot = salleHauteurCm + 2 * MARGE_CM;
  const echelle = CIBLE_PX / Math.max(largeurTot, hauteurTot);

  const prev = {
    scaleX: stage.scaleX(),
    scaleY: stage.scaleY(),
    x: stage.x(),
    y: stage.y(),
    width: stage.width(),
    height: stage.height(),
  };

  stage.scale({ x: echelle, y: echelle });
  stage.position({ x: MARGE_CM * echelle, y: MARGE_CM * echelle });
  stage.width(largeurTot * echelle);
  stage.height(hauteurTot * echelle);
  stage.draw();

  const uri = stage.toDataURL({ mimeType: 'image/png', pixelRatio: 1 });

  // Restauration de la vue interactive
  stage.scale({ x: prev.scaleX, y: prev.scaleY });
  stage.position({ x: prev.x, y: prev.y });
  stage.width(prev.width);
  stage.height(prev.height);
  stage.draw();

  return uri;
}

/** Déclenche le téléchargement d'une data URL sous le nom donné. */
export function telecharger(dataURL: string, nomFichier: string): void {
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = nomFichier;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Génère un PDF A4 contenant le plan, orienté selon la salle, avec un titre.
 * jsPDF est importé dynamiquement (client uniquement).
 */
export async function planEnPDF(
  pngDataURL: string,
  salleLargeurCm: number,
  salleHauteurCm: number,
  titre = 'Plan de table',
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const paysage = salleLargeurCm >= salleHauteurCm;
  const pdf = new jsPDF({ orientation: paysage ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const marge = 12;
  const hautTitre = 14;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text(titre, pageW / 2, marge, { align: 'center' });

  // Zone disponible pour l'image, en respectant le ratio de la salle
  const dispoW = pageW - 2 * marge;
  const dispoH = pageH - 2 * marge - hautTitre;
  const ratioSalle = (salleLargeurCm + 2 * MARGE_CM) / (salleHauteurCm + 2 * MARGE_CM);
  let imgW = dispoW;
  let imgH = imgW / ratioSalle;
  if (imgH > dispoH) {
    imgH = dispoH;
    imgW = imgH * ratioSalle;
  }
  const imgX = (pageW - imgW) / 2;
  const imgY = marge + hautTitre;

  pdf.addImage(pngDataURL, 'PNG', imgX, imgY, imgW, imgH);
  pdf.save(`${titre.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}
