import { NextResponse } from 'next/server';
import {
  stripe,
  supabaseAdmin,
  plannerDepuisRequete,
  origineSite,
} from '@/lib/stripe/server';

export const runtime = 'nodejs';

/**
 * POST /api/stripe/checkout
 * Ouvre une session de paiement pour l'abonnement du planner connecté.
 * Renvoie { url } — le client redirige dessus.
 */
export async function POST(req: Request) {
  const planner = await plannerDepuisRequete(req);
  if (!planner) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const price = process.env.STRIPE_PRICE_ABONNEMENT;
  if (!price) {
    return NextResponse.json(
      { error: 'Tarif non configuré (STRIPE_PRICE_ABONNEMENT).' },
      { status: 500 },
    );
  }

  try {
    const sk = stripe();
    const admin = supabaseAdmin();

    // Réutiliser le client Stripe existant, sinon le planner accumulerait un
    // nouveau customer (et un nouvel abonnement) à chaque tentative de paiement.
    const { data: ligne } = await admin
      .from('planner')
      .select('stripe_customer_id')
      .eq('id', planner.id)
      .single();

    let customerId = ligne?.stripe_customer_id as string | null | undefined;
    if (!customerId) {
      const client = await sk.customers.create({
        email: planner.email,
        metadata: { planner_id: planner.id },
      });
      customerId = client.id;
      await admin
        .from('planner')
        .update({ stripe_customer_id: customerId })
        .eq('id', planner.id);
    }

    const origine = origineSite(req);
    const session = await sk.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price, quantity: 1 }],

      // Carte demandée explicitement. Par défaut Stripe choisit les moyens de
      // paiement selon la configuration du compte ; sur le compte live celle-ci
      // est vide, et la création de session échoue avec « No valid payment
      // method types ». `card` couvre aussi Apple Pay et Google Pay.
      // Retirable le jour où les moyens de paiement dynamiques seront réglés
      // dans le dashboard.
      payment_method_types: ['card'],
      // Le planner_id voyage jusqu'au webhook : c'est lui qui fait le lien
      // entre le paiement et le compte, sans dépendre de l'email.
      subscription_data: { metadata: { planner_id: planner.id } },
      metadata: { planner_id: planner.id },
      success_url: `${origine}/app?abo=ok`,
      cancel_url: `${origine}/app?abo=annule`,
      allow_promotion_codes: true,

      // Vente entre professionnels : on collecte le numéro de TVA et l'adresse
      // de facturation. Le numéro sert à la fois à confirmer la qualité de
      // professionnel et à autoliquider la TVA pour un client établi dans un
      // autre État membre. Sans `customer_update`, Stripe refuse de rattacher
      // ces informations à un client existant.
      tax_id_collection: { enabled: true },
      billing_address_collection: 'required',
      customer_update: { address: 'auto', name: 'auto' },

      custom_text: {
        submit: {
          message:
            'Abonnement réservé aux professionnels. En confirmant, vous déclarez souscrire pour les besoins de votre activité.',
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('[stripe/checkout]', e);
    return NextResponse.json(
      { error: (e as Error).message ?? 'Échec de la création du paiement' },
      { status: 500 },
    );
  }
}
