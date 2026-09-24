import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type Category = {
  id: string
  name: string
}

type Campaign = {
  id: string
  title: string
  slug: string
  short_description: string | null
  goal_amount_cents: number
  raised_amount_cents: number
  currency: string
  status: string
  is_featured: boolean
  created_at: string
  categories: Category | null
}

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100)
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-neutral-100 text-neutral-700',
    published: 'bg-green-50 text-green-700',
    paused: 'bg-amber-50 text-amber-700',
    completed: 'bg-blue-50 text-blue-700',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        styles[status] || 'bg-neutral-100 text-neutral-600'
      }`}
    >
      {status}
    </span>
  )
}

export default async function CampaignsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      id,
      title,
      slug,
      short_description,
      goal_amount_cents,
      raised_amount_cents,
      currency,
      status,
      is_featured,
      created_at,
      categories (
        id,
        name
      )
    `)
    .order('created_at', {
      ascending: false,
    })

  const campaigns = (data ?? []) as unknown as Campaign[]

  return (
    <div className="p-5 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Fundraising
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-950">
              Campaigns
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Create and manage your fundraising campaigns.
            </p>
          </div>

          <Link
            href="/admin/campaigns/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            <span className="text-lg leading-none">+</span>
            New Campaign
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load campaigns: {error.message}
          </div>
        )}

        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Total Campaigns
            </p>

            <p className="mt-2 text-3xl font-bold text-neutral-950">
              {campaigns.length}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Published
            </p>

            <p className="mt-2 text-3xl font-bold text-neutral-950">
              {
                campaigns.filter(
                  (campaign) => campaign.status === 'published'
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Drafts
            </p>

            <p className="mt-2 text-3xl font-bold text-neutral-950">
              {
                campaigns.filter(
                  (campaign) => campaign.status === 'draft'
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-neutral-950">
              {
                campaigns.filter(
                  (campaign) => campaign.status === 'completed'
                ).length
              }
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="font-semibold text-neutral-900">
              All Campaigns
            </h2>
          </div>

          {campaigns.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-6 w-6 text-neutral-500"
                >
                  <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z" />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-neutral-900">
                No campaigns yet
              </h3>

              <p className="mt-1 max-w-sm text-sm text-neutral-500">
                Create your first fundraising campaign to get started.
              </p>

              <Link
                href="/admin/campaigns/new"
                className="mt-5 rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Create Campaign
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-neutral-50">
                  <tr className="border-b border-neutral-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Campaign
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Category
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Raised
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Goal
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Created
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {campaigns.map((campaign) => {
                    const progress =
                      campaign.goal_amount_cents > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (campaign.raised_amount_cents /
                                campaign.goal_amount_cents) *
                                100
                            )
                          )
                        : 0

                    return (
                      <tr
                        key={campaign.id}
                        className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60"
                      >
                        <td className="px-5 py-4">
                          <div className="max-w-[300px]">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-semibold text-neutral-900">
                                {campaign.title}
                              </p>

                              {campaign.is_featured && (
                                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                                  Featured
                                </span>
                              )}
                            </div>

                            <p className="mt-1 truncate text-xs text-neutral-500">
                              /{campaign.slug}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-600">
                          {campaign.categories?.name || '—'}
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-neutral-900">
                            {formatMoney(
                              campaign.raised_amount_cents,
                              campaign.currency
                            )}
                          </p>

                          <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-neutral-100">
                            <div
                              className="h-full rounded-full bg-neutral-900"
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>

                          <p className="mt-1 text-xs text-neutral-400">
                            {progress}%
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-600">
                          {formatMoney(
                            campaign.goal_amount_cents,
                            campaign.currency
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={campaign.status} />
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-500">
                          {formatDate(campaign.created_at)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/campaigns/${campaign.id}/edit`}
                            className="text-sm font-semibold text-neutral-700 hover:text-black"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}