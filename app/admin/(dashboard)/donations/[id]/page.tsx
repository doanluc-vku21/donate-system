import Link from 'next/link'
import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

type Campaign = {
  id: string
  title: string
  slug: string
}

type Donor = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
}

function money(
  cents: number,
  currency: string
) {
  return new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency,
    }
  ).format(cents / 100)
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }
  ).format(new Date(value))
}

function getRelation<T>(
  value:
    | T
    | T[]
    | null
    | undefined
) {
  if (!value) {
    return null
  }

  return Array.isArray(value)
    ? value[0] ?? null
    : value
}

function StatusBadge({
  status,
}: {
  status: string
}) {
  const styles:
    Record<
      string,
      string
    > = {
    paid:
      'bg-green-50 text-green-700',
    failed:
      'bg-red-50 text-red-700',
    refunded:
      'bg-amber-50 text-amber-700',
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        styles[status] ??
        'bg-neutral-100 text-neutral-600'
      }`}
    >
      {status}
    </span>
  )
}

function InfoRow({
  label,
  children,
}: {
  label: string
  children:
    React.ReactNode
}) {
  return (
    <div className="grid gap-1 border-b border-neutral-100 py-4 last:border-0 sm:grid-cols-[180px_1fr]">
      <dt className="text-sm text-neutral-500">
        {label}
      </dt>

      <dd className="min-w-0 text-sm font-medium text-neutral-900">
        {children}
      </dd>
    </div>
  )
}

export default async function DonationDetailPage({
  params,
}: PageProps) {
  const { id } =
    await params

  const supabase =
    await createClient()

  const {
    data,
    error,
  } = await supabase
    .from('donations')
    .select(`
      id,
      campaign_id,
      donor_id,
      display_name,
      message,
      is_anonymous,
      frequency,
      amount_cents,
      fee_amount_cents,
      total_amount_cents,
      currency,
      status,
      stripe_checkout_session_id,
      stripe_payment_intent_id,
      stripe_subscription_id,
      stripe_invoice_id,
      created_at,

      campaign:campaigns (
        id,
        title,
        slug
      ),

      donor:donors (
        id,
        email,
        first_name,
        last_name,
        phone
      )
    `)
    .eq(
      'id',
      id
    )
    .single()

  if (
    error ||
    !data
  ) {
    notFound()
  }

  const campaign =
    getRelation(
      data.campaign as
        | Campaign
        | Campaign[]
        | null
    )

  const donor =
    getRelation(
      data.donor as
        | Donor
        | Donor[]
        | null
    )

  const donorName =
    donor
      ? `${donor.first_name || ''} ${donor.last_name || ''}`.trim()
      : ''

  return (
    <div className="p-5 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* BACK */}

        <Link
          href="/admin/donations"
          className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
        >
          ← Back to Donations
        </Link>

        {/* HEADER */}

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Donation
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-950">
              {money(
                data.amount_cents,
                data.currency
              )}
            </h1>

            <p className="mt-2 font-mono text-xs text-neutral-400">
              {data.id}
            </p>
          </div>

          <StatusBadge
            status={
              data.status
            }
          />
        </div>

        {/* SUMMARY */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Donation
            </p>

            <p className="mt-2 text-2xl font-bold">
              {money(
                data.amount_cents,
                data.currency
              )}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Cover fee
            </p>

            <p className="mt-2 text-2xl font-bold">
              {money(
                data.fee_amount_cents,
                data.currency
              )}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Total charged
            </p>

            <p className="mt-2 text-2xl font-bold">
              {money(
                data.total_amount_cents,
                data.currency
              )}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Frequency
            </p>

            <p className="mt-2 text-lg font-bold">
              {data.frequency ===
              'monthly'
                ? 'Monthly'
                : 'One-time'}
            </p>
          </div>
        </div>

        {/* GRID */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* DONOR */}

          <section className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-bold text-neutral-950">
              Donor
            </h2>

            <dl className="mt-3">
              <InfoRow label="Public name">
                {data.is_anonymous
                  ? 'Anonymous'
                  : data.display_name ||
                    '—'}
              </InfoRow>

              <InfoRow label="Real name">
                {donorName ||
                  '—'}
              </InfoRow>

              <InfoRow label="Email">
                {donor?.email ||
                  '—'}
              </InfoRow>

              <InfoRow label="Phone">
                {donor?.phone ||
                  '—'}
              </InfoRow>

              <InfoRow label="Anonymous">
                {data.is_anonymous
                  ? 'Yes'
                  : 'No'}
              </InfoRow>
            </dl>

            {donor && (
              <Link
                href={`/admin/donors/${donor.id}`}
                className="mt-5 inline-flex rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                View donor
              </Link>
            )}
          </section>

          {/* CAMPAIGN */}

          <section className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-bold text-neutral-950">
              Campaign
            </h2>

            <dl className="mt-3">
              <InfoRow label="Campaign">
                {campaign?.title ||
                  '—'}
              </InfoRow>

              <InfoRow label="Currency">
                {data.currency}
              </InfoRow>

              <InfoRow label="Created">
                {formatDate(
                  data.created_at
                )}
              </InfoRow>
            </dl>

            {campaign && (
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/admin/campaigns/${campaign.id}/edit`}
                  className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                >
                  Edit campaign
                </Link>

                <Link
                  href={`/campaigns/${campaign.slug}`}
                  target="_blank"
                  className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                >
                  View public page ↗
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* MESSAGE */}

        <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-bold text-neutral-950">
            Message of support
          </h2>

          {data.message ? (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-neutral-600">
              {data.message}
            </p>
          ) : (
            <p className="mt-4 text-sm text-neutral-400">
              No message.
            </p>
          )}
        </section>

        {/* STRIPE */}

        <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-bold text-neutral-950">
            Stripe information
          </h2>

          <dl className="mt-3">
            <InfoRow label="Checkout Session">
              <span className="break-all font-mono text-xs">
                {data.stripe_checkout_session_id ||
                  '—'}
              </span>
            </InfoRow>

            <InfoRow label="Payment Intent">
              <span className="break-all font-mono text-xs">
                {data.stripe_payment_intent_id ||
                  '—'}
              </span>
            </InfoRow>

            <InfoRow label="Subscription">
              <span className="break-all font-mono text-xs">
                {data.stripe_subscription_id ||
                  '—'}
              </span>
            </InfoRow>

            <InfoRow label="Invoice">
              <span className="break-all font-mono text-xs">
                {data.stripe_invoice_id ||
                  '—'}
              </span>
            </InfoRow>
          </dl>
        </section>
      </div>
    </div>
  )
}