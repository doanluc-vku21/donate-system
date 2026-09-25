import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

type PageProps = {
  searchParams: Promise<{
    q?: string
    page?: string
  }>
}

type Donor = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

type Donation = {
  donor_id: string | null
  amount_cents: number
  currency: string
  frequency: string
  status: string
  created_at: string
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
    }
  ).format(new Date(value))
}

function buildHref({
  page,
  q,
}: {
  page: number
  q: string
}) {
  const params =
    new URLSearchParams()

  if (q) {
    params.set(
      'q',
      q
    )
  }

  params.set(
    'page',
    String(page)
  )

  return `/admin/donors?${params.toString()}`
}

export default async function DonorsPage({
  searchParams,
}: PageProps) {
  const query =
    await searchParams

  const q =
    String(
      query.q || ''
    ).trim()

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

  let donorQuery =
    supabase
      .from('donors')
      .select(
        `
        id,
        email,
        first_name,
        last_name,
        phone,
        created_at,
        updated_at
      `,
        {
          count: 'exact',
        }
      )

  if (q) {
    const safeQuery =
      q.replace(
        /[%_,()]/g,
        ''
      )

    donorQuery =
      donorQuery.or(
        `email.ilike.%${safeQuery}%,first_name.ilike.%${safeQuery}%,last_name.ilike.%${safeQuery}%,phone.ilike.%${safeQuery}%`
      )
  }

  const {
    data,
    count,
    error,
  } =
    await donorQuery
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

  const donors =
    (data ??
      []) as Donor[]

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
  // DONATION STATS
  // =========================

  const donorIds =
    donors.map(
      (donor) =>
        donor.id
    )

  let donations:
    Donation[] = []

  if (
    donorIds.length > 0
  ) {
    const {
      data:
        donationData,
    } = await supabase
      .from('donations')
      .select(`
        donor_id,
        amount_cents,
        currency,
        frequency,
        status,
        created_at
      `)
      .in(
        'donor_id',
        donorIds
      )
      .eq(
        'status',
        'paid'
      )

    donations =
      (donationData ??
        []) as Donation[]
  }

  const donorStats =
    new Map<
      string,
      {
        count: number
        total: number
        monthly: boolean
        currency: string
        latest: string | null
      }
    >()

  for (
    const donation of
      donations
  ) {
    if (
      !donation.donor_id
    ) {
      continue
    }

    const current =
      donorStats.get(
        donation.donor_id
      ) ?? {
        count: 0,
        total: 0,
        monthly: false,
        currency:
          donation.currency ||
          'USD',
        latest: null,
      }

    current.count += 1

    current.total +=
      Number(
        donation.amount_cents ||
          0
      )

    if (
      donation.frequency ===
      'monthly'
    ) {
      current.monthly =
        true
    }

    if (
      !current.latest ||
      new Date(
        donation.created_at
      ).getTime() >
        new Date(
          current.latest
        ).getTime()
    ) {
      current.latest =
        donation.created_at
    }

    donorStats.set(
      donation.donor_id,
      current
    )
  }

  return (
    <div className="p-5 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div>
          <p className="text-sm font-medium text-neutral-500">
            Fundraising
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-950">
            Donors
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            View donor contact
            information and donation
            history.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load
            donors:{' '}
            {error.message}
          </div>
        )}

        {/* STATS */}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Total donors
            </p>

            <p className="mt-2 text-3xl font-bold text-neutral-950">
              {totalCount}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Visible page
            </p>

            <p className="mt-2 text-3xl font-bold text-neutral-950">
              {donors.length}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Monthly supporters
            </p>

            <p className="mt-2 text-3xl font-bold text-neutral-950">
              {
                Array.from(
                  donorStats.values()
                ).filter(
                  (stat) =>
                    stat.monthly
                ).length
              }
            </p>
          </div>
        </div>

        {/* SEARCH */}

        <form
          method="get"
          className="mt-6 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:flex-row"
        >
          <input
            name="q"
            defaultValue={q}
            placeholder="Search email, name or phone..."
            className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-700"
          />

          <button
            type="submit"
            className="rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Search
          </button>

          {q && (
            <Link
              href="/admin/donors"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-600"
            >
              Clear
            </Link>
          )}
        </form>

        {/* TABLE */}

        <div className="mt-5 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <h2 className="font-semibold text-neutral-900">
              All donors
            </h2>

            <span className="text-xs text-neutral-400">
              {totalCount}{' '}
              donors
            </span>
          </div>

          {donors.length ===
          0 ? (
            <div className="py-16 text-center text-sm text-neutral-500">
              No donors found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead className="bg-neutral-50">
                  <tr className="border-b border-neutral-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Donor
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Phone
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Donations
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Total donated
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Type
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Joined
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-neutral-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {donors.map(
                    (donor) => {
                      const stat =
                        donorStats.get(
                          donor.id
                        )

                      const name =
                        `${donor.first_name || ''} ${donor.last_name || ''}`.trim()

                      return (
                        <tr
                          key={
                            donor.id
                          }
                          className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-neutral-900">
                              {name ||
                                'Unknown'}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {
                                donor.email
                              }
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-neutral-600">
                            {donor.phone ||
                              '—'}
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-neutral-900">
                            {stat?.count ??
                              0}
                          </td>

                          <td className="px-5 py-4 text-sm font-bold text-neutral-900">
                            {stat
                              ? money(
                                  stat.total,
                                  stat.currency
                                )
                              : '—'}
                          </td>

                          <td className="px-5 py-4">
                            {stat?.monthly ? (
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                Monthly
                              </span>
                            ) : (
                              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                                One-time
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-neutral-500">
                            {formatDate(
                              donor.created_at
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/admin/donors/${donor.id}`}
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
                  href={buildHref(
                    {
                      page:
                        currentPage -
                        1,
                      q,
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
                  href={buildHref(
                    {
                      page:
                        currentPage +
                        1,
                      q,
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