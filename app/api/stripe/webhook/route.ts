import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe, supabaseAdmin, champsAbonnement } from '@/lib/stripe/server';

export const runtime = 'nodejs';
// Le corps doit rester brut : la signature Stripe porte sur les octets exacts.
export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/webhook
 *
 * Source de vérité de l'abonnement. Le client ne met JAMAIS à jour son propre
 * statut (la migration 0006 lui retire d'ailleurs le droit d'écrire ces
 * colonnes) : seul Stripe, via cette route, fait foi.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET absent');
    return NextResponse.json({ error: 'Webhook non configuré' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Signature absente' }, { status: 400 });
  }

  const brut = await req.text();
  const sk = stripe();

  let evenement: Stripe.Event;
  try {
    evenement = await sk.webhooks.constructEventAsync(brut, signature, secret);
  } catch (e) {
    // Signature invalide : requête non authentique, on refuse sans rien écrire.
    console.error('[stripe/webhook] signature refusée', (e as Error).message);
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
  }

  try {
    await traiter(evenement, sk);
  } catch (e) {
    // 500 => Stripe réessaiera. Préférable à un 200 qui perdrait l'événement.
    console.error(`[stripe/webhook] échec sur ${evenement.type}`, e);
    return NextResponse.json({ error: 'Traitement échoué' }, { status: 500 });
  }

  return NextResponse.json({ recu: true });
}

async function traiter(evenement: Stripe.Event, sk: Stripe) {
  switch (evenement.type) {
    case 'checkout.session.completed': {
      const session = evenement.data.object as Stripe.Checkout.Session;
      if (!session.subscription) return;
      const sub = await sk.subscriptions.retrieve(
        typeof session.subscription === 'string' ? session.subscription : session.subscription.id,
      );
      await appliquer(sub, plannerIdDe(session.metadata, sub));
      return;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = evenement.data.object as Stripe.Subscription;
      await appliquer(sub, plannerIdDe(sub.metadata, sub));
      return;
    }

    default:
      // Les autres événements ne changent pas l'état d'abonnement.
      return;
  }
}

function plannerIdDe(
  metadata: Stripe.Metadata | null | undefined,
  sub: Stripe.Subscription,
): string | null {
  return (metadata?.planner_id as string | undefined)
    ?? (sub.metadata?.planner_id as string | undefined)
    ?? null;
}

/**
 * Écrit l'état de l'abonnement sur le planner.
 *
 * On cible en priorité le `planner_id` transporté dans les métadonnées, et on
 * retombe sur le client Stripe. Sans ce repli, un abonnement créé depuis le
 * dashboard Stripe (sans métadonnée) ne serait rattaché à personne.
 */
async function appliquer(sub: Stripe.Subscription, plannerId: string | null) {
  const admin = supabaseAdmin();
  const champs = champsAbonnement(sub);
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

  const requete = admin.from('planner').update({ ...champs, stripe_customer_id: customerId });
  const { data, error } = plannerId
    ? await requete.eq('id', plannerId).select('id')
    : await requete.eq('stripe_customer_id', customerId).select('id');

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(
      `Aucun planner pour l'abonnement ${sub.id} (planner_id=${plannerId ?? 'absent'}, customer=${customerId})`,
    );
  }
}
