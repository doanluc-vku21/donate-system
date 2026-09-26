import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

type CampaignRelation = {
  id: string
  title: string
  slug: string
}

type DonorRelation = {
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
  is_anonymous: boolean

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

  created_at: string

  campaign:
    | CampaignRelation
    | CampaignRelation[]
    | null

  donor:
    | DonorRelation
    | DonorRelation[]
    | null
}

type Campaign = {
  id: string
  title: string
  slug: string

  goal_amount_cents: number
  raised_amount_cents: number

  currency: string
  status: string

  created_at: string
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

function money(
  cents: number,
  currency = 'USD'
) {
  try {
    return new Intl.NumberFormat(
      'en-US',
      {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }
    ).format(
      cents / 100
    )
  } catch {
    return `$${(
      cents / 100
    ).toLocaleString(
      'en-US'
    )}`
  }
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
  ).format(
    new Date(value)
  )
}

function campaignStatusBadge(
  status: string
) {
  const styles:
    Record<
      string,
      string
    > = {
    draft:
      'bg-neutral-100 text-neutral-600',

    published:
      'bg-green-50 text-green-700',

    paused:
      'bg-amber-50 text-amber-700',

    completed:
      'bg-blue-50 text-blue-700',
  }

  return (
    styles[status] ||
    'bg-neutral-100 text-neutral-600'
  )
}

function getDayKey(
  date: Date
) {
  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      '0'
    ),
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    ),
  ].join('-')
}

export default async function AdminDashboardPage() {
  const supabase =
    await createClient()

  // =================================
  // LOAD DATA
  // =================================

  const [
    donationsResult,
    donorCountResult,
    campaignsResult,
    recentResult,
  ] =
    await Promise.all([
      supabase
        .from('donations')
        .select(`
          id,
          campaign_id,
          donor_id,
          display_name,
          is_anonymous,
          frequency,
          amount_cents,
          fee_amount_cents,
          total_amount_cents,
          currency,
          status,
          stripe_subscription_id,
          created_at
        `)
        .eq(
          'status',
          'paid'
        ),

      supabase
        .from('donors')
        .select(
          'id',
          {
            count:
              'exact',
            head: true,
          }
        ),

      supabase
        .from('campaigns')
        .select(`
          id,
          title,
          slug,
          goal_amount_cents,
          raised_amount_cents,
          currency,
          status,
          created_at
        `)
        .order(
          'created_at',
          {
            ascending: false,
          }
        ),

      supabase
        .from('donations')
        .select(`
          id,
          campaign_id,
          donor_id,
          display_name,
          is_anonymous,
          frequency,
          amount_cents,
          fee_amount_cents,
          total_amount_cents,
          currency,
          status,
          stripe_subscription_id,
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
        `)
        .order(
          'created_at',
          {
            ascending: false,
          }
        )
        .limit(8),
    ])

  const paidDonations =
    (donationsResult.data ??
      []) as Donation[]

  const campaigns =
    (campaignsResult.data ??
      []) as Campaign[]

  const recentDonations =
    (recentResult.data ??
      []) as unknown as Donation[]

  const donorCount =
    donorCountResult.count ??
    0

  // =================================
  // BASIC STATS
  // =================================

  const currency =
    paidDonations[0]
      ?.currency ||
    campaigns[0]
      ?.currency ||
    'USD'

  const totalRaised =
    paidDonations.reduce(
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
    paidDonations.reduce(
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

  const activeCampaigns =
    campaigns.filter(
      (campaign) =>
        campaign.status ===
        'published'
    ).length

  const completedCampaigns =
    campaigns.filter(
      (campaign) =>
        campaign.status ===
        'completed'
    ).length

  // =================================
  // MONTHLY DONORS
  // =================================

  const monthlyDonorKeys =
    new Set<string>()

  paidDonations.forEach(
    (donation) => {
      if (
        donation.frequency !==
        'monthly'
      ) {
        return
      }

      /*
       * Ưu tiên donor_id để 1 donor
       * renew nhiều lần vẫn chỉ tính 1.
       *
       * Nếu donor_id không có thì dùng
       * subscription ID.
       */
      const key =
        donation.donor_id ||
        donation.stripe_subscription_id

      if (key) {
        monthlyDonorKeys.add(
          key
        )
      }
    }
  )

  const monthlyDonors =
    monthlyDonorKeys.size

  // =================================
  // THIS MONTH
  // =================================

  const now =
    new Date()

  const monthStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    )

  const thisMonthDonations =
    paidDonations.filter(
      (donation) =>
        new Date(
          donation.created_at
        ) >= monthStart
    )

  const thisMonthRaised =
    thisMonthDonations.reduce(
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

  // =================================
  // LAST 7 DAYS
  // =================================

  const chartDays:
    {
      key: string
      label: string
      amount: number
      count: number
    }[] = []

  for (
    let offset = 6;
    offset >= 0;
    offset--
  ) {
    const day =
      new Date()

    day.setHours(
      0,
      0,
      0,
      0
    )

    day.setDate(
      day.getDate() -
        offset
    )

    chartDays.push({
      key: getDayKey(
        day
      ),

      label:
        new Intl.DateTimeFormat(
          'en-US',
          {
            weekday:
              'short',
          }
        ).format(day),

      amount: 0,
      count: 0,
    })
  }

  paidDonations.forEach(
    (donation) => {
      const date =
        new Date(
          donation.created_at
        )

      const key =
        getDayKey(date)

      const item =
        chartDays.find(
          (day) =>
            day.key ===
            key
        )

      if (!item) {
        return
      }

      item.amount +=
        Number(
          donation.amount_cents ||
            0
        )

      item.count += 1
    }
  )

  const maxChartAmount =
    Math.max(
      ...chartDays.map(
        (day) =>
          day.amount
      ),
      1
    )

  const sevenDayRaised =
    chartDays.reduce(
      (
        total,
        item
      ) =>
        total +
        item.amount,
      0
    )

  // =================================
  // TOP CAMPAIGNS
  // =================================

  const topCampaigns =
    [...campaigns]
      .sort(
        (
          a,
          b
        ) =>
          Number(
            b.raised_amount_cents ||
              0
          ) -
          Number(
            a.raised_amount_cents ||
              0
          )
      )
      .slice(
        0,
        5
      )

  // =================================
  // ERRORS
  // =================================

  const errors = [
    donationsResult.error,
    donorCountResult.error,
    campaignsResult.error,
    recentResult.error,
  ].filter(Boolean)

  return (
    <div className="p-5 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* =========================
            HEADER
        ========================= */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Overview
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-950">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Monitor fundraising,
              donations, donors and
              campaign performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/campaigns/new"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
            >
              + New campaign
            </Link>

            <Link
              href="/admin/updates/new"
              className="inline-flex items-center justify-center rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              + New update
            </Link>
          </div>
        </div>

        {/* =========================
            ERROR
        ========================= */}

        {errors.length >
          0 && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Some dashboard
            information could not
            be loaded. Please
            refresh the page.
          </div>
        )}

        {/* =========================
            PRIMARY KPI
        ========================= */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* TOTAL RAISED */}

          <Link
            href="/admin/donations"
            className="group rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path d="M12 2v20" />
                  <path d="M17 6.5c0-1.9-2.2-3.5-5-3.5S7 4.4 7 6.5 9.1 9.3 12 10s5 1.5 5 4-2.2 4-5 4-5-1.6-5-3.5" />
                </svg>
              </div>

              <span className="text-xs font-medium text-neutral-400 transition group-hover:text-neutral-700">
                View →
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-neutral-500">
              Total raised
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight text-neutral-950">
              {money(
                totalRaised,
                currency
              )}
            </p>

            <p className="mt-2 text-xs text-neutral-400">
              Excludes cover fees
            </p>
          </Link>

          {/* DONATIONS */}

          <Link
            href="/admin/donations"
            className="group rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />

                  <path d="M3 9h18" />
                </svg>
              </div>

              <span className="text-xs font-medium text-neutral-400 transition group-hover:text-neutral-700">
                View →
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-neutral-500">
              Paid donations
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight text-neutral-950">
              {
                paidDonations.length
              }
            </p>

            <p className="mt-2 text-xs text-neutral-400">
              {
                thisMonthDonations.length
              }{' '}
              this month
            </p>
          </Link>

          {/* DONORS */}

          <Link
            href="/admin/donors"
            className="group rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <circle
                    cx="9"
                    cy="8"
                    r="3"
                  />

                  <path d="M3.5 19c.7-3.2 2.6-5 5.5-5s4.8 1.8 5.5 5" />

                  <circle
                    cx="18"
                    cy="9"
                    r="2"
                  />

                  <path d="M16 15c2.5 0 4.1 1.3 4.6 3.5" />
                </svg>
              </div>

              <span className="text-xs font-medium text-neutral-400 transition group-hover:text-neutral-700">
                View →
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-neutral-500">
              Total donors
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight text-neutral-950">
              {
                donorCount
              }
            </p>

            <p className="mt-2 text-xs text-neutral-400">
              Unique donor
              profiles
            </p>
          </Link>

          {/* MONTHLY */}

          <Link
            href="/admin/donations?frequency=monthly"
            className="group rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path d="M20 11a8 8 0 1 0-2.3 5.7" />

                  <path d="M20 4v7h-7" />
                </svg>
              </div>

              <span className="text-xs font-medium text-neutral-400 transition group-hover:text-neutral-700">
                View →
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-neutral-500">
              Monthly donors
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight text-neutral-950">
              {
                monthlyDonors
              }
            </p>

            <p className="mt-2 text-xs text-neutral-400">
              Donors with paid
              monthly contributions
            </p>
          </Link>
        </div>

        {/* =========================
            SECONDARY KPI
        ========================= */}

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              This month
            </p>

            <p className="mt-2 text-xl font-bold text-neutral-950">
              {money(
                thisMonthRaised,
                currency
              )}
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              Campaign
              donations
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Last 7 days
            </p>

            <p className="mt-2 text-xl font-bold text-neutral-950">
              {money(
                sevenDayRaised,
                currency
              )}
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              Recent
              fundraising
            </p>
          </div>

          <Link
            href="/admin/campaigns"
            className="rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Active campaigns
            </p>

            <p className="mt-2 text-xl font-bold text-neutral-950">
              {
                activeCampaigns
              }
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              Currently
              published
            </p>
          </Link>

          <Link
            href="/admin/campaigns"
            className="rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Completed
            </p>

            <p className="mt-2 text-xl font-bold text-neutral-950">
              {
                completedCampaigns
              }
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              Completed
              campaigns
            </p>
          </Link>
        </div>

        {/* =========================
            CHART + CAMPAIGNS
        ========================= */}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          {/* CHART */}

          <section className="rounded-xl border border-neutral-200 bg-white">
            <div className="flex flex-col justify-between gap-3 border-b border-neutral-200 px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-semibold text-neutral-900">
                  Donation
                  activity
                </h2>

                <p className="mt-1 text-xs text-neutral-400">
                  Paid donations
                  during the last 7
                  days
                </p>
              </div>

              <p className="text-sm font-bold text-neutral-900">
                {money(
                  sevenDayRaised,
                  currency
                )}
              </p>
            </div>

            <div className="p-5">
              <div className="flex h-[260px] items-end gap-3 sm:gap-5">
                {chartDays.map(
                  (day) => {
                    const height =
                      day.amount >
                      0
                        ? Math.max(
                            10,
                            Math.round(
                              (day.amount /
                                maxChartAmount) *
                                100
                            )
                          )
                        : 3

                    return (
                      <div
                        key={
                          day.key
                        }
                        className="flex h-full min-w-0 flex-1 flex-col justify-end"
                      >
                        <div className="mb-2 text-center">
                          {day.amount >
                          0 ? (
                            <span className="text-[10px] font-semibold text-neutral-500">
                              {money(
                                day.amount,
                                currency
                              )}
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-300">
                              —
                            </span>
                          )}
                        </div>

                        <div className="flex h-[185px] items-end">
                          <div
                            className={`w-full rounded-t-md ${
                              day.amount >
                              0
                                ? 'bg-neutral-900'
                                : 'bg-neutral-100'
                            }`}
                            style={{
                              height: `${height}%`,
                            }}
                          />
                        </div>

                        <div className="mt-3 text-center">
                          <p className="text-xs font-semibold text-neutral-600">
                            {
                              day.label
                            }
                          </p>

                          <p className="mt-1 text-[10px] text-neutral-400">
                            {
                              day.count
                            }{' '}
                            gifts
                          </p>
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            </div>
          </section>

          {/* QUICK ACTIONS */}

          <section className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-5 py-4">
              <h2 className="font-semibold text-neutral-900">
                Quick actions
              </h2>
            </div>

            <div className="space-y-2 p-4">
              <Link
                href="/admin/campaigns/new"
                className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-black"
              >
                Create campaign

                <span>→</span>
              </Link>

              <Link
                href="/admin/updates/new"
                className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-black"
              >
                Publish update

                <span>→</span>
              </Link>

              <Link
                href="/admin/news/new"
                className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-black"
              >
                Write news article

                <span>→</span>
              </Link>

              <Link
                href="/admin/faq/new"
                className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-black"
              >
                Add FAQ

                <span>→</span>
              </Link>

              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between rounded-lg bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                View website

                <span>↗</span>
              </Link>
            </div>

            <div className="mx-4 mb-4 rounded-lg bg-neutral-50 p-4">
              <p className="text-xs font-medium text-neutral-500">
                Processing
                fees covered
              </p>

              <p className="mt-1 text-lg font-bold text-neutral-900">
                {money(
                  totalFees,
                  currency
                )}
              </p>
            </div>
          </section>
        </div>

        {/* =========================
            RECENT DONATIONS
        ========================= */}

        <section className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h2 className="font-semibold text-neutral-900">
                Recent
                donations
              </h2>

              <p className="mt-1 text-xs text-neutral-400">
                Latest payment
                activity
              </p>
            </div>

            <Link
              href="/admin/donations"
              className="text-sm font-semibold text-neutral-600 hover:text-black"
            >
              View all →
            </Link>
          </div>

          {recentDonations.length ===
          0 ? (
            <div className="py-14 text-center text-sm text-neutral-500">
              No donations yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Donor
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Campaign
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Type
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Date
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentDonations.map(
                    (donation) => {
                      const campaign =
                        getRelation(
                          donation.campaign
                        )

                      const donor =
                        getRelation(
                          donation.donor
                        )

                      const donorName =
                        donation.is_anonymous
                          ? 'Anonymous'
                          : donation.display_name ||
                            `${donor?.first_name || ''} ${donor?.last_name || ''}`.trim() ||
                            'Unknown'

                      return (
                        <tr
                          key={
                            donation.id
                          }
                          className="border-t border-neutral-100 hover:bg-neutral-50"
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-neutral-900">
                              {
                                donorName
                              }
                            </p>

                            {donor &&
                              !donation.is_anonymous && (
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
                              <span className="text-sm text-neutral-400">
                                —
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm font-bold text-neutral-900">
                            {money(
                              donation.amount_cents,
                              donation.currency
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {donation.frequency ===
                            'monthly' ? (
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                Monthly
                              </span>
                            ) : (
                              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                                One-time
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                                donation.status ===
                                'paid'
                                  ? 'bg-green-50 text-green-700'
                                  : donation.status ===
                                    'failed'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}
                            >
                              {
                                donation.status
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-neutral-500">
                            {formatDate(
                              donation.created_at
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/admin/donations/${donation.id}`}
                              className="inline-flex rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700"
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

        {/* =========================
            TOP CAMPAIGNS
        ========================= */}

        <section className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h2 className="font-semibold text-neutral-900">
                Campaign
                performance
              </h2>

              <p className="mt-1 text-xs text-neutral-400">
                Campaigns ranked
                by amount raised
              </p>
            </div>

            <Link
              href="/admin/campaigns"
              className="text-sm font-semibold text-neutral-600 hover:text-black"
            >
              View all →
            </Link>
          </div>

          {topCampaigns.length ===
          0 ? (
            <div className="py-14 text-center text-sm text-neutral-500">
              No campaigns yet.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {topCampaigns.map(
                (
                  campaign,
                  index
                ) => {
                  const goal =
                    Number(
                      campaign.goal_amount_cents ||
                        0
                    )

                  const raised =
                    Number(
                      campaign.raised_amount_cents ||
                        0
                    )

                  const progress =
                    goal > 0
                      ? Math.min(
                          100,
                          Math.max(
                            0,
                            Math.round(
                              (raised /
                                goal) *
                                100
                            )
                          )
                        )
                      : 0

                  return (
                    <div
                      key={
                        campaign.id
                      }
                      className="grid gap-4 px-5 py-5 md:grid-cols-[45px_minmax(0,1fr)_170px_120px] md:items-center"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <Link
                          href={`/admin/campaigns/${campaign.id}/edit`}
                          className="block truncate font-semibold text-neutral-900 hover:underline"
                        >
                          {
                            campaign.title
                          }
                        </Link>

                        <div className="mt-3 h-2 max-w-xl overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-neutral-900"
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>

                        <p className="mt-1 text-xs text-neutral-400">
                          {
                            progress
                          }
                          % funded
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-neutral-900">
                          {money(
                            raised,
                            campaign.currency
                          )}
                        </p>

                        <p className="mt-1 text-xs text-neutral-400">
                          of{' '}
                          {money(
                            goal,
                            campaign.currency
                          )}
                        </p>
                      </div>

                      <div className="md:text-right">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${campaignStatusBadge(
                            campaign.status
                          )}`}
                        >
                          {
                            campaign.status
                          }
                        </span>
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}