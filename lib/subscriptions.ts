import Stripe from 'stripe'

import { supabaseAdmin } from '@/lib/supabase/admin'

type SubscriptionMetadata = {
  campaign_id?: string
  campaign_slug?: string

  donation_amount_cents?: string
  fee_amount_cents?: string

  frequency?: string

  donor_email?: string
}

function normalizeEmail(
  value?: string | null
) {
  return String(
    value || ''
  )
    .trim()
    .toLowerCase()
}

function unixToIso(
  value?:
    | number
    | null
) {
  if (!value) {
    return null
  }

  return new Date(
    value * 1000
  ).toISOString()
}

export async function syncMonthlySubscription(
  subscription:
    Stripe.Subscription
) {
  const metadata =
    subscription.metadata as
      SubscriptionMetadata

  if (
    metadata.frequency !==
    'monthly'
  ) {
    return
  }

  const campaignId =
    String(
      metadata.campaign_id ||
        ''
    ).trim()

  const donorEmail =
    normalizeEmail(
      metadata.donor_email
    )

  // =========================
  // DONOR
  // =========================

  let donorId:
    | string
    | null = null

  if (donorEmail) {
    const {
      data: donor,
    } = await supabaseAdmin
      .from('donors')
      .select('id')
      .eq(
        'email',
        donorEmail
      )
      .maybeSingle()

    donorId =
      donor?.id ?? null
  }

  // =========================
  // CUSTOMER
  // =========================

  const customer =
    subscription.customer

  const stripeCustomerId =
    typeof customer ===
    'string'
      ? customer
      : customer?.id ||
        null

  // =========================
  // PERIOD
  //
  // Stripe's newer API puts
  // billing period on items.
  // =========================

  const subscriptionItem =
    subscription.items.data[0]

  const currentPeriodStart =
    unixToIso(
      subscriptionItem
        ?.current_period_start
    )

  const currentPeriodEnd =
    unixToIso(
      subscriptionItem
        ?.current_period_end
    )

  // =========================
  // AMOUNTS
  // =========================

  const amountCents =
    Number(
      metadata
        .donation_amount_cents ||
        0
    )

  const feeAmountCents =
    Number(
      metadata
        .fee_amount_cents ||
        0
    )

  const totalAmountCents =
    amountCents +
    feeAmountCents

  const currency =
    (
      subscriptionItem
        ?.price
        ?.currency ||
      subscription.currency ||
      'usd'
    ).toUpperCase()

  // =========================
  // CANCELED DATE
  // =========================

  const canceledAt =
    unixToIso(
      subscription.canceled_at
    )

  // =========================
  // UPSERT
  // =========================

  const {
    error,
  } = await supabaseAdmin
    .from(
      'monthly_subscriptions'
    )
    .upsert(
      {
        stripe_subscription_id:
          subscription.id,

        stripe_customer_id:
          stripeCustomerId,

        donor_id:
          donorId,

        campaign_id:
          campaignId ||
          null,

        status:
          subscription.status,

        currency,

        amount_cents:
          amountCents,

        fee_amount_cents:
          feeAmountCents,

        total_amount_cents:
          totalAmountCents,

        cancel_at_period_end:
          Boolean(
            subscription
              .cancel_at_period_end
          ),

        current_period_start:
          currentPeriodStart,

        current_period_end:
          currentPeriodEnd,

        canceled_at:
          canceledAt,

        updated_at:
          new Date()
            .toISOString(),
      },
      {
        onConflict:
          'stripe_subscription_id',
      }
    )

  if (error) {
    throw new Error(
      error.message
    )
  }
}