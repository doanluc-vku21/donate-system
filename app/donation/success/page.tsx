import Link from 'next/link'

import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'

import ConfirmationRefresh from './confirmation-refresh'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<{
    session_id?: string
  }>
}

type DonationRow = {
  id: string
  campaign_id: string
  amount_cents: number
  fee_amount_cents: number
  total_amount_cents: number
  currency: string
  frequency:
    | 'one_time'
    | 'monthly'
  status: string
  stripe_checkout_session_id:
    | string
    | null
  stripe_subscription_id:
    | string
    | null
  created_at: string
}

function money(
  cents: number,
  currency: string
) {
  return new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency:
        currency.toUpperCase(),
    }
  ).format(cents / 100)
}

export default async function DonationSuccessPage({
  searchParams,
}: PageProps) {
  const query =
    await searchParams

  const sessionId =
    String(
      query.session_id || ''
    ).trim()

  // =========================
  // MISSING SESSION
  // =========================

  if (!sessionId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffef9] px-5 py-16">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-2xl text-neutral-500">
            !
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-[-0.04em] text-[#173f35]">
            Unable to verify donation
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-500">
            We could not find the Stripe
            checkout session for this
            donation.
          </p>

          <Link
            href="/campaigns"
            className="mt-8 inline-flex rounded-full bg-[#173f35] px-6 py-3 text-sm font-bold text-white"
          >
            Explore campaigns
          </Link>
        </div>
      </main>
    )
  }

  // =========================
  // STRIPE SESSION
  // =========================

  let checkoutSession

  try {
    checkoutSession =
      await stripe.checkout.sessions.retrieve(
        sessionId
      )
  } catch (error) {
    console.error(
      'Unable to retrieve Stripe Checkout Session:',
      error
    )

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffef9] px-5 py-16">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl text-red-500">
            !
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-[-0.04em] text-[#173f35]">
            Unable to verify donation
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-500">
            Your checkout session could
            not be verified. If you were
            charged, your donation may
            still be processing.
          </p>

          <Link
            href="/campaigns"
            className="mt-8 inline-flex rounded-full bg-[#173f35] px-6 py-3 text-sm font-bold text-white"
          >
            Explore campaigns
          </Link>
        </div>
      </main>
    )
  }

  // =========================
  // FIND DONATION
  // =========================

  let donation:
    | DonationRow
    | null = null

  if (
    checkoutSession.mode ===
    'payment'
  ) {
    const {
      data,
      error,
    } = await supabaseAdmin
      .from('donations')
      .select(`
        id,
        campaign_id,
        amount_cents,
        fee_amount_cents,
        total_amount_cents,
        currency,
        frequency,
        status,
        stripe_checkout_session_id,
        stripe_subscription_id,
        created_at
      `)
      .eq(
        'stripe_checkout_session_id',
        checkoutSession.id
      )
      .maybeSingle()

    if (error) {
      console.error(
        'Donation lookup error:',
        error
      )
    }

    donation =
      (data as DonationRow | null) ??
      null
  }

  if (
    checkoutSession.mode ===
    'subscription'
  ) {
    const subscription =
      checkoutSession.subscription

    const subscriptionId =
      typeof subscription ===
      'string'
        ? subscription
        : subscription?.id

    if (subscriptionId) {
      const {
        data,
        error,
      } = await supabaseAdmin
        .from('donations')
        .select(`
          id,
          campaign_id,
          amount_cents,
          fee_amount_cents,
          total_amount_cents,
          currency,
          frequency,
          status,
          stripe_checkout_session_id,
          stripe_subscription_id,
          created_at
        `)
        .eq(
          'stripe_subscription_id',
          subscriptionId
        )
        .eq(
          'status',
          'paid'
        )
        .order(
          'created_at',
          {
            ascending: true,
          }
        )
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error(
          'Monthly donation lookup error:',
          error
        )
      }

      donation =
        (data as DonationRow | null) ??
        null
    }
  }

  // =========================
  // WEBHOOK STILL PROCESSING
  // =========================

  if (!donation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffef9] px-5 py-16">
        <ConfirmationRefresh />

        <div className="w-full max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef4e7] text-2xl text-[#173f35]">
            <span className="animate-pulse">
              •••
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-[-0.04em] text-[#173f35]">
            Confirming your donation...
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-500">
            Stripe has returned you to
            the site. We&apos;re waiting
            for the secure payment
            webhook to finish recording
            your donation.
          </p>

          <p className="mt-5 text-xs text-neutral-400">
            This page will check again
            automatically.
          </p>

          <Link
            href="/campaigns"
            className="mt-8 inline-flex rounded-full border border-[#173f35] px-6 py-3 text-sm font-bold text-[#173f35]"
          >
            Explore campaigns
          </Link>
        </div>
      </main>
    )
  }

  // =========================
  // CAMPAIGN
  // =========================

  const {
    data: campaign,
  } = await supabaseAdmin
    .from('campaigns')
    .select(`
      title,
      slug
    `)
    .eq(
      'id',
      donation.campaign_id
    )
    .maybeSingle()

  // =========================
  // CONFIRMED
  // =========================

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffef9] px-5 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#baf477] text-2xl font-bold text-[#173f35]">
          ✓
        </div>

        <h1 className="mt-6 text-4xl font-bold tracking-[-0.04em] text-[#173f35]">
          Donation confirmed.
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-500">
          Thank you for supporting{' '}
          <strong className="font-semibold text-neutral-700">
            {campaign?.title ??
              'this campaign'}
          </strong>
          .
        </p>

        {/* SUMMARY */}

        <div className="mt-8 rounded-2xl border border-[#e4eadf] bg-white p-6 text-left">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-neutral-500">
              Donation
            </span>

            <span className="font-semibold text-[#173f35]">
              {money(
                donation.amount_cents,
                donation.currency
              )}
            </span>
          </div>

          {donation.fee_amount_cents >
            0 && (
            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="text-sm text-neutral-500">
                Processing contribution
              </span>

              <span className="font-semibold text-neutral-700">
                {money(
                  donation.fee_amount_cents,
                  donation.currency
                )}
              </span>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-4 border-t border-neutral-100 pt-4">
            <span className="text-sm font-semibold text-neutral-700">
              {donation.frequency ===
              'monthly'
                ? 'Monthly total'
                : 'Total'}
            </span>

            <span className="text-lg font-bold text-[#173f35]">
              {money(
                donation.total_amount_cents,
                donation.currency
              )}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="text-sm text-neutral-500">
              Frequency
            </span>

            <span className="text-sm font-semibold text-neutral-700">
              {donation.frequency ===
              'monthly'
                ? 'Monthly'
                : 'One-time'}
            </span>
          </div>
        </div>

        {/* BUTTONS */}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {campaign?.slug && (
            <Link
              href={`/campaigns/${campaign.slug}`}
              className="inline-flex items-center justify-center rounded-full bg-[#173f35] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#215844]"
            >
              Back to campaign
            </Link>
          )}

          <Link
            href="/campaigns"
            className="inline-flex items-center justify-center rounded-full border border-[#173f35] px-6 py-3 text-sm font-bold text-[#173f35]"
          >
            Explore campaigns
          </Link>
        </div>

        <p className="mt-7 text-xs text-neutral-400">
          Payment processed securely by
          Stripe.
        </p>
      </div>
    </main>
  )
}