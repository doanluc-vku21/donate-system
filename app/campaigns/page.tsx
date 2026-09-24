import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

import SiteHeader from '@/components/public/site-header'
import SiteFooter from '@/components/public/site-footer'

import CampaignCard, {
  type PublicCampaign,
} from '@/components/public/campaign-card'

import CampaignFilters from '@/components/public/campaign-filters'
import CampaignPagination from '@/components/public/campaign-pagination'

type PageProps = {
  searchParams: Promise<{
    q?: string
    category?: string
    page?: string
  }>
}

const PAGE_SIZE = 9

function normalizeSearch(
  value?: string
) {
  if (!value) {
    return ''
  }

  return value
    .trim()
    .replace(
      /[,%()]/g,
      ' '
    )
    .replace(
      /\s+/g,
      ' '
    )
    .slice(0, 100)
}

export default async function CampaignsPage({
  searchParams,
}: PageProps) {
  const params =
    await searchParams

  const search =
    normalizeSearch(
      params.q
    )

  const categoryId =
    String(
      params.category || ''
    ).trim()

  const requestedPage =
    Number(params.page)

  const currentPage =
    Number.isInteger(
      requestedPage
    ) &&
    requestedPage > 0
      ? requestedPage
      : 1

  const supabase =
    await createClient()

  // =========================
  // CATEGORIES
  // =========================

  const {
    data: categories,
    error: categoriesError,
  } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      slug
    `)
    .eq(
      'is_active',
      true
    )
    .order(
      'sort_order',
      {
        ascending: true,
      }
    )

  // =========================
  // CAMPAIGNS QUERY
  // =========================

  const from =
    (currentPage - 1) *
    PAGE_SIZE

  const to =
    from +
    PAGE_SIZE -
    1

  let campaignQuery =
    supabase
      .from('campaigns')
      .select(
        `
          id,
          title,
          slug,
          short_description,
          featured_image_url,
          goal_amount_cents,
          raised_amount_cents,
          currency,
          location,
          category_id,
          is_featured,
          published_at,
          category:categories (
            id,
            name,
            slug
          )
        `,
        {
          count: 'exact',
        }
      )
      .eq(
        'status',
        'published'
      )

  // CATEGORY FILTER

  if (categoryId) {
    campaignQuery =
      campaignQuery.eq(
        'category_id',
        categoryId
      )
  }

  // SEARCH FILTER

  if (search) {
    const pattern =
      `%${search}%`

    campaignQuery =
      campaignQuery.or(
        [
          `title.ilike.${pattern}`,
          `short_description.ilike.${pattern}`,
          `location.ilike.${pattern}`,
        ].join(',')
      )
  }

  const {
    data: campaignRows,
    count,
    error: campaignsError,
  } = await campaignQuery
    .order(
      'is_featured',
      {
        ascending: false,
      }
    )
    .order(
      'published_at',
      {
        ascending: false,
        nullsFirst: false,
      }
    )
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

  const campaigns =
    (campaignRows ??
      []) as unknown as PublicCampaign[]

  const totalCampaigns =
    count ?? 0

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalCampaigns /
          PAGE_SIZE
      )
    )

  const activeCategory =
    categories?.find(
      (category) =>
        category.id ===
        categoryId
    )

  return (
    <main className="min-h-screen bg-[#fffdf8]">
      <SiteHeader />

      {/* =========================
          HERO
      ========================= */}

      <section className="px-5 pb-12 pt-12 lg:px-8 lg:pb-16 lg:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[30px] bg-[#173f35] px-7 py-12 sm:px-10 lg:px-16 lg:py-16">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.65fr] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b8f06a]">
                  Explore campaigns
                </p>

                <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-[1] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                  Find a cause
                  <br />

                  <span className="text-[#b8f06a]">
                    worth standing behind.
                  </span>
                </h1>
              </div>

              <div>
                <p className="max-w-md text-base leading-7 text-white/65">
                  Discover people,
                  families and
                  communities seeking
                  support. Explore their
                  stories, follow their
                  progress and choose
                  how you want to help.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          CONTENT
      ========================= */}

      <section className="px-5 pb-24 lg:px-8 lg:pb-32">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}

          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#477768]">
                Discover support
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#173f35] sm:text-4xl">
                {activeCategory
                  ? activeCategory.name
                  : search
                    ? 'Search results'
                    : 'All campaigns'}
              </h2>
            </div>

            <p className="text-sm text-neutral-500">
              {totalCampaigns ===
              1
                ? '1 campaign'
                : `${totalCampaigns.toLocaleString()} campaigns`}
            </p>
          </div>

          {/* FILTERS */}

          {!categoriesError && (
            <CampaignFilters
              categories={
                categories ??
                []
              }
              initialSearch={
                search
              }
              initialCategory={
                categoryId
              }
            />
          )}

          {/* CATEGORY ERROR */}

          {categoriesError && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load
              categories:{' '}
              {
                categoriesError.message
              }
            </div>
          )}

          {/* CAMPAIGN ERROR */}

          {campaignsError && (
            <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              Failed to load
              campaigns:{' '}
              {
                campaignsError.message
              }
            </div>
          )}

          {/* ACTIVE SEARCH INFO */}

          {!campaignsError &&
            search && (
              <div className="mt-7 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                <span>
                  Search results for
                </span>

                <span className="rounded-full bg-[#edf4e7] px-3 py-1 font-semibold text-[#173f35]">
                  “{search}”
                </span>
              </div>
            )}

          {/* GRID */}

          {!campaignsError &&
            campaigns.length >
              0 && (
              <>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {campaigns.map(
                    (
                      campaign
                    ) => (
                      <CampaignCard
                        key={
                          campaign.id
                        }
                        campaign={
                          campaign
                        }
                      />
                    )
                  )}
                </div>

                <CampaignPagination
                  currentPage={
                    currentPage
                  }
                  totalPages={
                    totalPages
                  }
                />

                {totalPages >
                  1 && (
                  <p className="mt-5 text-center text-xs text-neutral-400">
                    Page{' '}
                    {
                      currentPage
                    }{' '}
                    of{' '}
                    {
                      totalPages
                    }
                  </p>
                )}
              </>
            )}

          {/* EMPTY */}

          {!campaignsError &&
            campaigns.length ===
              0 && (
              <div className="mt-8 rounded-[28px] border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#edf4e7] text-2xl">
                  ⌕
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#173f35]">
                  No campaigns found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                  We couldn&apos;t find
                  campaigns matching
                  your current search
                  and filters.
                </p>

                <Link
                  href="/campaigns"
                  className="mt-6 inline-flex rounded-full bg-[#173f35] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#225647]"
                >
                  View all campaigns
                </Link>
              </div>
            )}
        </div>
      </section>

      {/* =========================
          CTA
      ========================= */}

      <section className="bg-[#edf4e7] px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 rounded-[28px] bg-white p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#477768]">
              Make a difference
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#173f35] sm:text-4xl">
              Every campaign begins
              with someone&apos;s
              story.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-500">
              Take time to understand
              the need and support a
              campaign that matters to
              you.
            </p>
          </div>

          <Link
            href="/#how-it-works"
            className="shrink-0 self-start rounded-full bg-[#b8f06a] px-6 py-3 text-sm font-bold text-[#173f35] transition hover:bg-[#a8e657] lg:self-auto"
          >
            How donations work →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}