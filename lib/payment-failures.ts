import Stripe from 'stripe'

import {
  stripe,
} from '@/lib/stripe'

import {
  supabaseAdmin,
} from '@/lib/supabase/admin'

import {
  syncMonthlySubscription,
} from '@/lib/subscriptions'

type SubscriptionMetadata = {
  campaign_id?: string
  donor_email?: string
  frequency?: string
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

/* =========================================================
   GET SUBSCRIPTION ID FROM INVOICE
========================================================= */

export function getInvoiceSubscriptionId(
  invoice: Stripe.Invoice
) {
  const parent =
    invoice.parent

  if (
    !parent ||
    parent.type !==
      'subscription_details'
  ) {
    return null
  }

  const value =
    parent
      .subscription_details
      ?.subscription

  if (!value) {
    return null
  }

  return typeof value ===
    'string'
    ? value
    : value.id
}

/* =========================================================
   PAYMENT FAILED
========================================================= */

export async function handleMonthlyPaymentFailed(
  invoice: Stripe.Invoice
) {
  const subscriptionId =
    getInvoiceSubscriptionId(
      invoice
    )

  if (!subscriptionId) {
    return
  }

  // =========================
  // LOAD SUBSCRIPTION
  // =========================

  const subscription =
    await stripe
      .subscriptions
      .retrieve(
        subscriptionId
      )

  const metadata =
    subscription
      .metadata as SubscriptionMetadata

  // =========================
  // ONLY OUR MONTHLY DONATIONS
  // =========================

  if (
    metadata.frequency !==
    'monthly'
  ) {
    return
  }

  // =========================
  // SYNC STRIPE STATUS
  // =========================

  await syncMonthlySubscription(
    subscription
  )

  // =========================
  // DONOR
  // =========================

  const donorEmail =
    normalizeEmail(
      metadata.donor_email
    )

  let donorId:
    | string
    | null = null

  if (donorEmail) {
    const {
      data: donor,
      error: donorError,
    } =
      await supabaseAdmin
        .from('donors')
        .select('id')
        .eq(
          'email',
          donorEmail
        )
        .maybeSingle()

    if (donorError) {
      throw new Error(
        donorError.message
      )
    }

    donorId =
      donor?.id ??
      null
  }

  // =========================
  // CAMPAIGN
  // =========================

  const campaignId =
    String(
      metadata.campaign_id ||
        ''
    ).trim() ||
    null

  // =========================
  // RETRY DATE
  // =========================

  const nextPaymentAttempt =
    unixToIso(
      invoice
        .next_payment_attempt
    )

  const now =
    new Date()
      .toISOString()

  // =========================
  // STORE / UPDATE FAILURE
  //
  // Stripe có thể retry cùng
  // invoice nhiều lần.
  //
  // stripe_invoice_id unique
  // + upsert => không duplicate.
  // =========================

  const {
    error:
      failureError,
  } =
    await supabaseAdmin
      .from(
        'payment_failures'
      )
      .upsert(
        {
          stripe_invoice_id:
            invoice.id,

          stripe_subscription_id:
            subscriptionId,

          donor_id:
            donorId,

          campaign_id:
            campaignId,

          amount_due_cents:
            Number(
              invoice.amount_due ||
                0
            ),

          currency:
            (
              invoice.currency ||
              'usd'
            ).toUpperCase(),

          attempt_count:
            Number(
              invoice
                .attempt_count ||
                0
            ),

          status:
            'failed',

          next_payment_attempt:
            nextPaymentAttempt,

          failed_at:
            now,

          recovered_at:
            null,

          updated_at:
            now,
        },
        {
          onConflict:
            'stripe_invoice_id',
        }
      )

  if (failureError) {
    throw new Error(
      failureError.message
    )
  }

  // =========================
  // UPDATE MONTHLY SUBSCRIPTION
  // =========================

  const {
    error:
      subscriptionError,
  } =
    await supabaseAdmin
      .from(
        'monthly_subscriptions'
      )
      .update({
        last_payment_failed_at:
          now,

        last_failed_invoice_id:
          invoice.id,

        next_payment_attempt:
          nextPaymentAttempt,

        updated_at:
          now,
      })
      .eq(
        'stripe_subscription_id',
        subscriptionId
      )

  if (
    subscriptionError
  ) {
    throw new Error(
      subscriptionError.message
    )
  }

  console.warn(
    'Monthly payment failed:',
    {
      invoiceId:
        invoice.id,

      subscriptionId,

      attemptCount:
        invoice
          .attempt_count,

      nextPaymentAttempt,
    }
  )
}

/* =========================================================
   PAYMENT RECOVERED
========================================================= */

export async function markMonthlyPaymentRecovered(
  invoice: Stripe.Invoice,
  subscriptionId: string
) {
  const now =
    new Date()
      .toISOString()

  // =========================
  // FAILURE -> RECOVERED
  // =========================

  const {
    error:
      failureError,
  } =
    await supabaseAdmin
      .from(
        'payment_failures'
      )
      .update({
        status:
          'recovered',

        recovered_at:
          now,

        next_payment_attempt:
          null,

        updated_at:
          now,
      })
      .eq(
        'stripe_invoice_id',
        invoice.id
      )
      .eq(
        'status',
        'failed'
      )

  if (failureError) {
    throw new Error(
      failureError.message
    )
  }

  /*
   * Chỉ clear warning nếu
   * invoice vừa paid chính là
   * invoice bị fail gần nhất.
   */

  const {
    error:
      subscriptionError,
  } =
    await supabaseAdmin
      .from(
        'monthly_subscriptions'
      )
      .update({
        last_payment_failed_at:
          null,

        last_failed_invoice_id:
          null,

        next_payment_attempt:
          null,

        updated_at:
          now,
      })
      .eq(
        'stripe_subscription_id',
        subscriptionId
      )
      .eq(
        'last_failed_invoice_id',
        invoice.id
      )

  if (
    subscriptionError
  ) {
    throw new Error(
      subscriptionError.message
    )
  }
}