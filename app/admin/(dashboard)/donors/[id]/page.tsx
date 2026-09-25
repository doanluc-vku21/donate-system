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
}

type Donation = {
  id: string
  display_name: string | null

  frequency:
    | 'one_time'
    | 'monthly'

  amount_cents: number
  fee_amount_cents: number
  total_amount_cents: number

  currency: string
  status: string

  stripe_subscription_id:
    | string
    | null

  stripe_invoice_id:
    | string
    | null

  created_at: string

  campaign:
    | Campaign
    | Campaign[]
    | null
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
      month: 'short',
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
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        styles[status] ??
        'bg-neutral-100 text-neutral-600'
      }`}
    >
      {status}
    </span>
  )
}

export default async function DonorDetailPage({
  params,
}: PageProps) {
  const { id } =
    await params

  const supabase =
    await createClient()

  // =========================
  // DONOR
  // =========================

  const {
    data: donor,
    error: donorError,
  } = await supabase
    .from('donors')
    .select(`
      id,
      email,
      first_name,
      last_name,
      phone,
      created_at,
      updated_at
    `)
    .eq(
      'id',
      id
    )
    .single()

  if (
    donorError ||
    !donor
  ) {
    notFound()
  }

  // =========================
  // DONATION HISTORY
  // =========================

  const {
    data: donationData,
    error: donationError,
  } = await supabase
    .from('donations')
    .select(`
      id,
      display_name,
      frequency,
      amount_cents,
      fee_amount_cents,
      total_amount_cents,
      currency,
      status,
      stripe_subscription_id,
      stripe_invoice_id,
      created_at,

      campaign:campaigns (
        id,
        title
      )
    `)
    .eq(
      'donor_id',
      donor.id
    )
    .order(
      'created_at',
      {
        ascending: false,
      }
    )

  const donations =
    (donationData ??
      []) as unknown as Donation[]

  // =========================
  // STATS
  // =========================

  const paid =
    donations.filter(
      (donation) =>
        donation.status ===
        'paid'
    )

  const totalDonated =
    paid.reduce(
      (
        total,
        donation
      ) =>
        total +
        Number(
          donation.amount_cents ||
            0
        ),
      0
    )

  const totalFees =
    paid.reduce(
      (
        total,
        donation
      ) =>
        total +
        Number(
          donation.fee_amount_cents ||
            0
        ),
      0
    )

  const monthlyPayments =
    paid.filter(
      (donation) =>
        donation.frequency ===
        'monthly'
    )

  const subscriptionIds =
    Array.from(
      new Set(
        monthlyPayments
          .map(
            (donation) =>
              donation.stripe_subscription_id
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          )
      )
    )

  const currency =
    paid[0]?.currency ||
    donations[0]?.currency ||
    'USD'

  const name =
    `${donor.first_name || ''} ${donor.last_name || ''}`.trim()

  return (
    <div className="p-5 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* BACK */}

        <Link
          href="/admin/donors"
          className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
        >
          ← Back to Donors
        </Link>

        {/* HEADER */}

        <div className="mt-5">
          <p className="text-sm font-medium text-neutral-500">
            Donor
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-950">
            {name ||
              'Unknown donor'}
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            {donor.email}
          </p>
        </div>

        {/* STATS */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Paid donations
            </p>

            <p className="mt-2 text-3xl font-bold">
              {paid.length}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Total donated
            </p>

            <p className="mt-2 text-3xl font-bold">
              {money(
                totalDonated,
                currency
              )}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Cover fees
            </p>

            <p className="mt-2 text-3xl font-bold">
              {money(
                totalFees,
                currency
              )}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Subscriptions
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                subscriptionIds.length
              }
            </p>
          </div>
        </div>

        {/* CONTACT */}

        <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-bold">
            Contact information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                First name
              </p>

              <p className="mt-2 text-sm font-medium">
                {donor.first_name ||
                  '—'}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Last name
              </p>

              <p className="mt-2 text-sm font-medium">
                {donor.last_name ||
                  '—'}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Email
              </p>

              <p className="mt-2 break-all text-sm font-medium">
                {donor.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Phone
              </p>

              <p className="mt-2 text-sm font-medium">
                {donor.phone ||
                  '—'}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-neutral-100 pt-5">
            <p className="text-xs text-neutral-400">
              Donor since{' '}
              {formatDate(
                donor.created_at
              )}
            </p>
          </div>
        </section>

        {/* ERROR */}

        {donationError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load
            donation history:{' '}
            {
              donationError.message
            }
          </div>
        )}

        {/* DONATION HISTORY */}

        <section className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <h2 className="font-semibold">
              Donation history
            </h2>

            <span className="text-xs text-neutral-400">
              {donations.length}{' '}
              transactions
            </span>
          </div>

          {donations.length ===
          0 ? (
            <div className="py-14 text-center text-sm text-neutral-500">
              No donation history.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Campaign
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Frequency
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Subscription
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Invoice
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Date
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-neutral-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {donations.map(
                    (
                      donation
                    ) => {
                      const campaign =
                        getRelation(
                          donation.campaign
                        )

                      return (
                        <tr
                          key={
                            donation.id
                          }
                          className="border-t border-neutral-100 hover:bg-neutral-50"
                        >
                          <td className="px-5 py-4 text-sm font-medium">
                            {campaign?.title ||
                              '—'}
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-bold">
                              {money(
                                donation.amount_cents,
                                donation.currency
                              )}
                            </p>

                            {donation.fee_amount_cents >
                              0 && (
                              <p className="mt-1 text-xs text-neutral-400">
                                +
                                {money(
                                  donation.fee_amount_cents,
                                  donation.currency
                                )}{' '}
                                fee
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                donation.frequency ===
                                'monthly'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}
                            >
                              {donation.frequency ===
                              'monthly'
                                ? 'Monthly'
                                : 'One-time'}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge
                              status={
                                donation.status
                              }
                            />
                          </td>

                          <td className="max-w-[170px] px-5 py-4">
                            <p className="truncate font-mono text-[10px] text-neutral-400">
                              {donation.stripe_subscription_id ||
                                '—'}
                            </p>
                          </td>

                          <td className="max-w-[170px] px-5 py-4">
                            <p className="truncate font-mono text-[10px] text-neutral-400">
                              {donation.stripe_invoice_id ||
                                '—'}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-neutral-500">
                            {formatDate(
                              donation.created_at
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/admin/donations/${donation.id}`}
                              className="inline-flex rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      )
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}