import {
  NextRequest,
  NextResponse,
} from 'next/server'

import Stripe from 'stripe'

import {
  stripe,
} from '@/lib/stripe'

import {
  supabaseAdmin,
} from '@/lib/supabase/admin'

import {
  sendDonationConfirmationEmail,
} from '@/lib/donation-email'

import {
  syncMonthlySubscription,
} from '@/lib/subscriptions'

import {
  getInvoiceSubscriptionId,
  handleMonthlyPaymentFailed,
  markMonthlyPaymentRecovered,
} from '@/lib/payment-failures'

export const runtime =
  'nodejs'

type DonationMetadata = {
  campaign_id?: string
  campaign_slug?: string

  donation_amount_cents?: string
  fee_amount_cents?: string

  frequency?:
    | 'one_time'
    | 'monthly'

  anonymous?: string

  donor_first_name?: string
  donor_last_name?: string
  donor_email?: string
  donor_phone?: string
  donor_message?: string
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

function metadataBoolean(
  value?: string
) {
  return value === 'true'
}

/* =========================================================
   DONOR
========================================================= */

async function getOrCreateDonor(
  metadata: DonationMetadata
) {
  const email =
    normalizeEmail(
      metadata.donor_email
    )

  if (!email) {
    throw new Error(
      'Missing donor email.'
    )
  }

  const firstName =
    String(
      metadata
        .donor_first_name ||
        ''
    ).trim()

  const lastName =
    String(
      metadata
        .donor_last_name ||
        ''
    ).trim()

  const phone =
    String(
      metadata
        .donor_phone ||
        ''
    ).trim()

  const {
    data: existing,
    error:
      existingError,
  } =
    await supabaseAdmin
      .from('donors')
      .select(`
        id,
        email
      `)
      .eq(
        'email',
        email
      )
      .maybeSingle()

  if (existingError) {
    throw new Error(
      existingError.message
    )
  }

  if (existing) {
    const {
      error:
        updateError,
    } =
      await supabaseAdmin
        .from('donors')
        .update({
          first_name:
            firstName ||
            null,

          last_name:
            lastName ||
            null,

          phone:
            phone ||
            null,

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          'id',
          existing.id
        )

    if (updateError) {
      throw new Error(
        updateError.message
      )
    }

    return existing.id
  }

  const {
    data: created,
    error:
      createError,
  } =
    await supabaseAdmin
      .from('donors')
      .insert({
        email,

        first_name:
          firstName ||
          null,

        last_name:
          lastName ||
          null,

        phone:
          phone ||
          null,
      })
      .select('id')
      .single()

  if (
    createError ||
    !created
  ) {
    throw new Error(
      createError
        ?.message ||
        'Unable to create donor.'
    )
  }

  return created.id
}

/* =========================================================
   METADATA
========================================================= */

function parseDonationMetadata(
  metadata:
    | Stripe.Metadata
    | null
    | undefined
): DonationMetadata {
  return {
    campaign_id:
      metadata
        ?.campaign_id,

    campaign_slug:
      metadata
        ?.campaign_slug,

    donation_amount_cents:
      metadata
        ?.donation_amount_cents,

    fee_amount_cents:
      metadata
        ?.fee_amount_cents,

    frequency:
      metadata
        ?.frequency as
        | 'one_time'
        | 'monthly'
        | undefined,

    anonymous:
      metadata
        ?.anonymous,

    donor_first_name:
      metadata
        ?.donor_first_name,

    donor_last_name:
      metadata
        ?.donor_last_name,

    donor_email:
      metadata
        ?.donor_email,

    donor_phone:
      metadata
        ?.donor_phone,

    donor_message:
      metadata
        ?.donor_message,
  }
}

function validateMetadata(
  metadata:
    DonationMetadata
) {
  const campaignId =
    String(
      metadata
        .campaign_id ||
        ''
    )

  const amountCents =
    Number(
      metadata
        .donation_amount_cents
    )

  const feeAmountCents =
    Number(
      metadata
        .fee_amount_cents ||
        0
    )

  if (!campaignId) {
    throw new Error(
      'Missing campaign ID.'
    )
  }

  if (
    !Number.isInteger(
      amountCents
    ) ||
    amountCents <= 0
  ) {
    throw new Error(
      'Invalid donation amount.'
    )
  }

  if (
    !Number.isInteger(
      feeAmountCents
    ) ||
    feeAmountCents < 0
  ) {
    throw new Error(
      'Invalid fee amount.'
    )
  }

  return {
    campaignId,
    amountCents,
    feeAmountCents,
  }
}

/* =========================================================
   RAISED
========================================================= */

async function incrementCampaignRaised(
  campaignId: string,
  amountCents: number
) {
  /*
   * Hiện tại:
   *
   * SELECT
   * -> UPDATE
   *
   * Phase 7 sẽ đổi sang
   * PostgreSQL atomic RPC.
   */

  const {
    data: campaign,
    error,
  } =
    await supabaseAdmin
      .from('campaigns')
      .select(
        'raised_amount_cents'
      )
      .eq(
        'id',
        campaignId
      )
      .single()

  if (
    error ||
    !campaign
  ) {
    throw new Error(
      error?.message ||
        'Campaign not found.'
    )
  }

  const current =
    Number(
      campaign
        .raised_amount_cents ||
        0
    )

  const {
    error:
      updateError,
  } =
    await supabaseAdmin
      .from('campaigns')
      .update({
        raised_amount_cents:
          current +
          amountCents,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        'id',
        campaignId
      )

  if (updateError) {
    throw new Error(
      updateError.message
    )
  }
}

/* =========================================================
   CONFIRMATION EMAIL
========================================================= */

async function sendConfirmationForDonation(
  donationId: string
) {
  const {
    data: donation,
    error,
  } =
    await supabaseAdmin
      .from('donations')
      .select(`
        id,

        donor_id,

        amount_cents,
        fee_amount_cents,
        total_amount_cents,

        currency,
        frequency,

        confirmation_email_sent_at,

        created_at,

        campaign:campaigns (
          title,
          slug
        ),

        donor:donors (
          email,
          first_name
        )
      `)
      .eq(
        'id',
        donationId
      )
      .single()

  if (
    error ||
    !donation
  ) {
    throw new Error(
      error?.message ||
        'Donation not found for confirmation email.'
    )
  }

  if (
    donation
      .confirmation_email_sent_at
  ) {
    return
  }

  const donor =
    Array.isArray(
      donation.donor
    )
      ? donation
          .donor[0]
      : donation.donor

  const campaign =
    Array.isArray(
      donation.campaign
    )
      ? donation
          .campaign[0]
      : donation.campaign

  if (
    !donor?.email ||
    !campaign
  ) {
    throw new Error(
      'Donation confirmation data is incomplete.'
    )
  }

  const emailId =
    await sendDonationConfirmationEmail({
      donationId:
        donation.id,

      donorEmail:
        donor.email,

      donorFirstName:
        donor.first_name,

      campaignTitle:
        campaign.title,

      campaignSlug:
        campaign.slug,

      amountCents:
        donation
          .amount_cents,

      feeAmountCents:
        donation
          .fee_amount_cents,

      totalAmountCents:
        donation
          .total_amount_cents,

      currency:
        donation.currency,

      frequency:
        donation.frequency,

      createdAt:
        donation.created_at,
    })

  const {
    error:
      updateError,
  } =
    await supabaseAdmin
      .from('donations')
      .update({
        confirmation_email_sent_at:
          new Date()
            .toISOString(),

        confirmation_email_id:
          emailId,
      })
      .eq(
        'id',
        donation.id
      )

  if (updateError) {
    throw new Error(
      updateError.message
    )
  }
}

/* =========================================================
   CREATE DONATION
========================================================= */

async function createDonation({
  metadata,
  currency,
  checkoutSessionId,
  paymentIntentId,
  subscriptionId,
  invoiceId,
}: {
  metadata:
    DonationMetadata

  currency:
    string

  checkoutSessionId?:
    | string
    | null

  paymentIntentId?:
    | string
    | null

  subscriptionId?:
    | string
    | null

  invoiceId?:
    | string
    | null
}) {
  const {
    campaignId,
    amountCents,
    feeAmountCents,
  } =
    validateMetadata(
      metadata
    )

  // =========================
  // IDEMPOTENCY - INVOICE
  // =========================

  if (invoiceId) {
    const {
      data: existing,
    } =
      await supabaseAdmin
        .from(
          'donations'
        )
        .select('id')
        .eq(
          'stripe_invoice_id',
          invoiceId
        )
        .maybeSingle()

    if (existing) {
      await sendConfirmationForDonation(
        existing.id
      )

      return
    }
  }

  // =========================
  // IDEMPOTENCY - PAYMENT
  // =========================

  if (
    paymentIntentId
  ) {
    const {
      data: existing,
    } =
      await supabaseAdmin
        .from(
          'donations'
        )
        .select('id')
        .eq(
          'stripe_payment_intent_id',
          paymentIntentId
        )
        .maybeSingle()

    if (existing) {
      await sendConfirmationForDonation(
        existing.id
      )

      return
    }
  }

  // =========================
  // DONOR
  // =========================

  const donorId =
    await getOrCreateDonor(
      metadata
    )

  const anonymous =
    metadataBoolean(
      metadata
        .anonymous
    )

  const firstName =
    String(
      metadata
        .donor_first_name ||
        ''
    ).trim()

  const lastName =
    String(
      metadata
        .donor_last_name ||
        ''
    ).trim()

  const displayName =
    anonymous
      ? 'Anonymous'
      : `${firstName} ${lastName}`.trim() ||
        'Anonymous'

  const frequency =
    metadata.frequency ===
    'monthly'
      ? 'monthly'
      : 'one_time'

  // =========================
  // INSERT
  // =========================

  const {
    data: inserted,
    error:
      insertError,
  } =
    await supabaseAdmin
      .from('donations')
      .insert({
        campaign_id:
          campaignId,

        donor_id:
          donorId,

        display_name:
          displayName,

        message:
          String(
            metadata
              .donor_message ||
              ''
          ).trim() ||
          null,

        is_anonymous:
          anonymous,

        frequency,

        amount_cents:
          amountCents,

        fee_amount_cents:
          feeAmountCents,

        total_amount_cents:
          amountCents +
          feeAmountCents,

        currency:
          currency
            .toUpperCase(),

        status:
          'paid',

        stripe_checkout_session_id:
          checkoutSessionId ||
          null,

        stripe_payment_intent_id:
          paymentIntentId ||
          null,

        stripe_subscription_id:
          subscriptionId ||
          null,

        stripe_invoice_id:
          invoiceId ||
          null,
      })
      .select('id')
      .single()

  if (
    insertError ||
    !inserted
  ) {
    if (
      insertError
        ?.code ===
      '23505'
    ) {
      return
    }

    throw new Error(
      insertError
        ?.message ||
        'Unable to create donation.'
    )
  }

  // =========================
  // RAISED
  // =========================

  await incrementCampaignRaised(
    campaignId,
    amountCents
  )

  // =========================
  // EMAIL
  // =========================

  await sendConfirmationForDonation(
    inserted.id
  )
}

/* =========================================================
   ONE-TIME
========================================================= */

async function handleCheckoutCompleted(
  session:
    Stripe.Checkout.Session
) {
  /*
   * Monthly payment được xử lý
   * bằng invoice.paid.
   */

  if (
    session.mode ===
    'subscription'
  ) {
    return
  }

  if (
    session.mode !==
      'payment' ||
    session
      .payment_status !==
      'paid'
  ) {
    return
  }

  const metadata =
    parseDonationMetadata(
      session.metadata
    )

  const paymentIntentId =
    typeof session
      .payment_intent ===
    'string'
      ? session
          .payment_intent
      : session
          .payment_intent
          ?.id ||
        null

  await createDonation({
    metadata,

    currency:
      session.currency ||
      'usd',

    checkoutSessionId:
      session.id,

    paymentIntentId,

    subscriptionId:
      null,

    invoiceId:
      null,
  })
}

/* =========================================================
   MONTHLY INVOICE PAID
========================================================= */

async function handleInvoicePaid(
  invoice:
    Stripe.Invoice
) {
  const subscriptionId =
    getInvoiceSubscriptionId(
      invoice
    )

  /*
   * Không phải subscription invoice.
   */

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

  // =========================
  // ONLY MONTHLY DONATIONS
  // =========================

  const metadata =
    parseDonationMetadata(
      subscription
        .metadata
    )

  if (
    metadata.frequency !==
    'monthly'
  ) {
    return
  }

  // =========================
  // SYNC SUBSCRIPTION
  // =========================

  await syncMonthlySubscription(
    subscription
  )

  // =========================
  // RECOVER PREVIOUS FAILURE
  // =========================

  await markMonthlyPaymentRecovered(
    invoice,
    subscriptionId
  )

  // =========================
  // PAYMENT INTENT
  // =========================

  let paymentIntentId:
    | string
    | null =
    null

  try {
    const invoicePayments =
      await stripe
        .invoicePayments
        .list({
          invoice:
            invoice.id,

          status:
            'paid',
        })

    const paidPayment =
      invoicePayments
        .data
        .find(
          (item) =>
            item.payment
              .type ===
              'payment_intent' &&
            item.payment
              .payment_intent
        )

    const paymentIntent =
      paidPayment
        ?.payment
        .payment_intent

    paymentIntentId =
      typeof paymentIntent ===
      'string'
        ? paymentIntent
        : paymentIntent
            ?.id ||
          null
  } catch (error) {
    console.error(
      'Unable to retrieve invoice payment intent:',
      error
    )
  }

  // =========================
  // CREATE DONATION
  // =========================

  await createDonation({
    metadata,

    currency:
      invoice.currency ||
      subscription
        .currency ||
      'usd',

    checkoutSessionId:
      null,

    paymentIntentId,

    subscriptionId,

    invoiceId:
      invoice.id,
  })
}

/* =========================================================
   SUBSCRIPTION CHANGE
========================================================= */

async function handleSubscriptionChanged(
  subscription:
    Stripe.Subscription
) {
  if (
    subscription
      .metadata
      ?.frequency !==
    'monthly'
  ) {
    return
  }

  await syncMonthlySubscription(
    subscription
  )
}

/* =========================================================
   WEBHOOK
========================================================= */

export async function POST(
  request:
    NextRequest
) {
  const signature =
    request.headers.get(
      'stripe-signature'
    )

  if (!signature) {
    return NextResponse
      .json(
        {
          error:
            'Missing Stripe signature.',
        },
        {
          status: 400,
        }
      )
  }

  const webhookSecret =
    process.env
      .STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse
      .json(
        {
          error:
            'Missing STRIPE_WEBHOOK_SECRET.',
        },
        {
          status: 500,
        }
      )
  }

  let event:
    Stripe.Event

  // =========================
  // VERIFY STRIPE SIGNATURE
  // =========================

  try {
    const body =
      await request.text()

    event =
      stripe
        .webhooks
        .constructEvent(
          body,
          signature,
          webhookSecret
        )
  } catch (error) {
    console.error(
      'Stripe signature error:',
      error
    )

    return NextResponse
      .json(
        {
          error:
            'Invalid webhook signature.',
        },
        {
          status: 400,
        }
      )
  }

  // =========================
  // EVENTS
  // =========================

  try {
    switch (
      event.type
    ) {
      /* -------------------------
         ONE-TIME
      ------------------------- */

      case 'checkout.session.completed': {
        const session =
          event.data
            .object as
            Stripe.Checkout.Session

        await handleCheckoutCompleted(
          session
        )

        break
      }

      /* -------------------------
         MONTHLY PAID
      ------------------------- */

      case 'invoice.paid': {
        const invoice =
          event.data
            .object as
            Stripe.Invoice

        await handleInvoicePaid(
          invoice
        )

        break
      }

      /* -------------------------
         PAYMENT FAILED
      ------------------------- */

      case 'invoice.payment_failed': {
        const invoice =
          event.data
            .object as
            Stripe.Invoice

        await handleMonthlyPaymentFailed(
          invoice
        )

        break
      }

      /* -------------------------
         SUBSCRIPTION CREATED
      ------------------------- */

      case 'customer.subscription.created': {
        const subscription =
          event.data
            .object as
            Stripe.Subscription

        await handleSubscriptionChanged(
          subscription
        )

        break
      }

      /* -------------------------
         SUBSCRIPTION UPDATED
      ------------------------- */

      case 'customer.subscription.updated': {
        const subscription =
          event.data
            .object as
            Stripe.Subscription

        await handleSubscriptionChanged(
          subscription
        )

        break
      }

      /* -------------------------
         SUBSCRIPTION DELETED
      ------------------------- */

      case 'customer.subscription.deleted': {
        const subscription =
          event.data
            .object as
            Stripe.Subscription

        await handleSubscriptionChanged(
          subscription
        )

        break
      }

      default:
        break
    }

    return NextResponse
      .json({
        received: true,
      })
  } catch (error) {
    console.error(
      `Webhook ${event.type} failed:`,
      error
    )

    /*
     * 500 để Stripe retry.
     */

    return NextResponse
      .json(
        {
          error:
            error instanceof
            Error
              ? error.message
              : 'Webhook failed.',
        },
        {
          status: 500,
        }
      )
  }
}