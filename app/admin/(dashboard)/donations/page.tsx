import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

type PageProps = {
  searchParams: Promise<{
    frequency?: string
    status?: string
    page?: string
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
}

type Donation = {
  id: string
  campaign_id: string
  donor_id: string | null

  display_name: string | null
  message: string | null
  is_anonymous: boolean

  frequency:
    | 'one_time'
    | 'monthly'

  amount_cents: number
  fee_amount_cents: number
  total_amount_cents: number

  currency: string
  status: string

  stripe_checkout_session_id:
    | string
    | null

  stripe_payment_intent_id:
    | string
    | null

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

  donor:
    | Donor
    | Donor[]
    | null
}

const PAGE_SIZE = 20

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
        styles[status] ||
        'bg-neutral-100 text-neutral-600'
      }`}
    >
      {status}
    </span>
  )
}

function FrequencyBadge({
  frequency,
}: {
  frequency: string
}) {
  if (
    frequency ===
    'monthly'
  ) {
    return (
      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
        Monthly
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
      One-time
    </span>
  )
}

function buildPageHref({
  page,
  frequency,
  status,
}: {
  page: number
  frequency?: string
  status?: string
}) {
  const params =
    new URLSearchParams()

  if (frequency) {
    params.set(
      'frequency',
      frequency
    )
  }

  if (status) {
    params.set(
      'status',
      status
    )
  }

  params.set(
    'page',
    String(page)
  )

  return `/admin/donations?${params.toString()}`
}

export default async function DonationsPage({
  searchParams,
}: PageProps) {
  const query =
    await searchParams

  const frequency =
    query.frequency ===
      'one_time' ||
    query.frequency ===
      'monthly'
      ? query.frequency
      : ''

  const status =
    query.status ===
      'paid' ||
    query.status ===
      'failed' ||
    query.status ===
      'refunded'
      ? query.status
      : ''

  const requestedPage =
    Number(query.page)

  const currentPage =
    Number.isInteger(
      requestedPage
    ) &&
    requestedPage > 0
      ? requestedPage
      : 1

  const from =
    (currentPage - 1) *
    PAGE_SIZE

  const to =
    from +
    PAGE_SIZE -
    1

  const supabase =
    await createClient()

  let donationQuery =
    supabase
      .from('donations')
      .select(
        `
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
          last_name
        )
      `,
        {
          count: 'exact',
        }
      )

  if (frequency) {
    donationQuery =
      donationQuery.eq(
        'frequency',
        frequency
      )
  }

  if (status) {
    donationQuery =
      donationQuery.eq(
        'status',
        status
      )
  }

  const {
    data,
    count,
    error,
  } =
    await donationQuery
      .order(
        'created_at',
        {
          ascending: false,
        }
      )
      .range(
        from,
        to
      )

  const donations =
    (data ??
      []) as unknown as Donation[]

  const totalCount =
    count ?? 0

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalCount /
          PAGE_SIZE
      )
    )

  // =========================
  // STATS
  // =========================

  const {
    data: paidDonations,
  } = await supabase
    .from('donations')
    .select(`
      amount_cents,
      fee_amount_cents,
      frequency,
      currency,
      status
    `)
    .eq(
      'status',
      'paid'
    )

  const paid =
    paidDonations ?? []

  const raisedCents =
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

  const feeCents =
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

  const monthlyCount =
    paid.filter(
      (donation) =>
        donation.frequency ===
        'monthly'
    ).length

  const currency =
    paid[0]?.currency ??
    donations[0]?.currency ??
    'USD'

  return (
    <div className="p-5 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div>
          <p className="text-sm font-medium text-neutral-500">
            Fundraising
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-950">
            Donations
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            View successful,
            recurring and failed
            donation transactions.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load
            donations:{' '}
            {error.message}
          </div>
        )}

        {/* STATS */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Paid donations
            </p>

            <p className="mt-2 text-3xl font-bold text-neutral-950">
              {paid.length}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Campaign raised
            </p>

            <p className="mt-2 text-3xl font-bold text-neutral-950">
              {money(
                raisedCents,
                currency
              )}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Cover fees
            </p>

            <p className="mt-2 text-3xl font-bold text-neutral-950">
              {money(
                feeCents,
                currency
              )}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Monthly payments
            </p>

            <p className="mt-2 text-3xl font-bold text-neutral-950">
              {
                monthlyCount
              }
            </p>
          </div>
        </div>

        {/* FILTER */}

        <form
          method="get"
          className="mt-6 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row"
        >
          <select
            name="frequency"
            defaultValue={
              frequency
            }
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none"
          >
            <option value="">
              All frequencies
            </option>

            <option value="one_time">
              One-time
            </option>

            <option value="monthly">
              Monthly
            </option>
          </select>

          <select
            name="status"
            defaultValue={
              status
            }
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none"
          >
            <option value="">
              All statuses
            </option>

            <option value="paid">
              Paid
            </option>

            <option value="failed">
              Failed
            </option>

            <option value="refunded">
              Refunded
            </option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Filter
          </button>

          {(frequency ||
            status) && (
            <Link
              href="/admin/donations"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-600"
            >
              Clear
            </Link>
          )}
        </form>

        {/* TABLE */}

        <div className="mt-5 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <h2 className="font-semibold text-neutral-900">
              Transactions
            </h2>

            <span className="text-xs text-neutral-400">
              {totalCount}{' '}
              records
            </span>
          </div>

          {donations.length ===
          0 ? (
            <div className="py-16 text-center text-sm text-neutral-500">
              No donations
              found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px]">
                <thead className="bg-neutral-50">
                  <tr className="border-b border-neutral-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Donor
                    </th>

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
                      Stripe
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
                      const donor =
                        getRelation(
                          donation.donor
                        )

                      const campaign =
                        getRelation(
                          donation.campaign
                        )

                      return (
                        <tr
                          key={
                            donation.id
                          }
                          className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-neutral-900">
                              {donation.is_anonymous
                                ? 'Anonymous'
                                : donation.display_name ||
                                  '—'}
                            </p>

                            {donor && (
                              <p className="mt-1 text-xs text-neutral-400">
                                {
                                  donor.email
                                }
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {campaign ? (
                              <Link
                                href={`/admin/campaigns/${campaign.id}/edit`}
                                className="text-sm font-medium text-neutral-700 hover:text-black"
                              >
                                {
                                  campaign.title
                                }
                              </Link>
                            ) : (
                              '—'
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-neutral-900">
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
                            <FrequencyBadge
                              frequency={
                                donation.frequency
                              }
                            />
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge
                              status={
                                donation.status
                              }
                            />
                          </td>

                          <td className="px-5 py-4">
                            <div className="max-w-[190px] space-y-1 font-mono text-[10px] text-neutral-400">
                              {donation.stripe_payment_intent_id && (
                                <p className="truncate">
                                  {
                                    donation.stripe_payment_intent_id
                                  }
                                </p>
                              )}

                              {donation.stripe_subscription_id && (
                                <p className="truncate">
                                  {
                                    donation.stripe_subscription_id
                                  }
                                </p>
                              )}

                              {donation.stripe_invoice_id && (
                                <p className="truncate">
                                  {
                                    donation.stripe_invoice_id
                                  }
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-neutral-500">
                            {formatDate(
                              donation.created_at
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/admin/donations/${donation.id}`}
                              className="inline-flex rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-black"
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
        </div>

        {/* PAGINATION */}

        {totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              Page{' '}
              {currentPage} of{' '}
              {totalPages}
            </p>

            <div className="flex gap-2">
              {currentPage >
                1 && (
                <Link
                  href={buildPageHref(
                    {
                      page:
                        currentPage -
                        1,
                      frequency,
                      status,
                    }
                  )}
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold"
                >
                  Previous
                </Link>
              )}

              {currentPage <
                totalPages && (
                <Link
                  href={buildPageHref(
                    {
                      page:
                        currentPage +
                        1,
                      frequency,
                      status,
                    }
                  )}
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}