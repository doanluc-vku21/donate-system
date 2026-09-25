import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

import SiteHeader from '@/components/public/site-header'
import SiteFooter from '@/components/public/site-footer'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<{
    q?: string
    type?: string
  }>
}

function formatDate(
  value: string | null
) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }
  ).format(
    new Date(value)
  )
}

function formatType(
  value: string
) {
  const map: Record<
    string,
    string
  > = {
    campaign_progress:
      'Campaign progress',

    campaign_completed:
      'Campaign completed',

    field_update:
      'Field update',

    thank_you:
      'Thank you',

    general:
      'General update',
  }

  return (
    map[value] ??
    value
  )
}

const updateTypes = [
  {
    value: '',
    label: 'All updates',
  },
  {
    value:
      'campaign_progress',
    label:
      'Campaign progress',
  },
  {
    value:
      'campaign_completed',
    label:
      'Completed',
  },
  {
    value:
      'field_update',
    label:
      'From the field',
  },
  {
    value:
      'thank_you',
    label:
      'Thank you',
  },
  {
    value:
      'general',
    label:
      'General',
  },
]

export default async function UpdatesPage({
  searchParams,
}: PageProps) {
  const params =
    await searchParams

  const search =
    String(
      params.q || ''
    ).trim()

  const type =
    String(
      params.type || ''
    ).trim()

  const supabase =
    await createClient()

  let query =
    supabase
      .from('site_updates')
      .select(`
        id,
        campaign_id,
        title,
        slug,
        update_type,
        excerpt,
        cover_image_url,
        status,
        is_featured,
        published_at,
        created_at,

        campaign:campaigns (
          id,
          title,
          slug,
          location
        ),

        media:site_update_media (
          id
        )
      `)
      .eq(
        'status',
        'published'
      )
      .order(
        'published_at',
        {
          ascending: false,
          nullsFirst: false,
        }
      )

  if (type) {
    query =
      query.eq(
        'update_type',
        type
      )
  }

  if (search) {
    const safeSearch =
      search
        .replace(
          /[%_,()]/g,
          ' '
        )
        .trim()

    if (safeSearch) {
      query =
        query.or(
          `title.ilike.%${safeSearch}%,excerpt.ilike.%${safeSearch}%,content.ilike.%${safeSearch}%`
        )
    }
  }

  const {
    data,
    error,
  } = await query

  const updates =
    data ?? []

  const featured =
    updates.find(
      (item) =>
        item.is_featured
    ) ??
    updates[0]

  const remaining =
    updates.filter(
      (item) =>
        item.id !==
        featured?.id
    )

  function getCampaign(
    update: (typeof updates)[number]
  ) {
    return Array.isArray(
      update.campaign
    )
      ? update.campaign[0]
      : update.campaign
  }

  function getPhotoCount(
    update: (typeof updates)[number]
  ) {
    const galleryCount =
      Array.isArray(
        update.media
      )
        ? update.media.length
        : 0

    return (
      galleryCount +
      (update.cover_image_url
        ? 1
        : 0)
    )
  }

  return (
    <main className="min-h-screen bg-[#fffdf8]">
      <SiteHeader />

      {/* =================================
          HERO
      ================================= */}

      <section className="border-b border-neutral-200 px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-xs font-semibold text-neutral-400">
            <Link
              href="/"
              className="transition hover:text-[#173f35]"
            >
              Home
            </Link>

            <span className="mx-2">
              /
            </span>

            <span>
              Updates
            </span>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_0.75fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#477768]">
                From the field
              </p>

              <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.055em] text-[#173f35] sm:text-6xl lg:text-7xl">
                Here&apos;s what
                <br />
                we&apos;re up to.
              </h1>
            </div>

            <div>
              <p className="max-w-xl text-base leading-8 text-neutral-600">
                Follow campaign
                progress, field work,
                completed missions and
                stories from the people
                and communities your
                support is helping.
              </p>

              <a
                href="#latest-updates"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#173f35]"
              >
                See the updates
                <span>↓</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =================================
          INTRO
      ================================= */}

      <section className="px-5 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid overflow-hidden rounded-[32px] bg-[#edf4e7] lg:grid-cols-2">
            <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-14">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
                Work in motion
              </p>

              <h2 className="mt-3 max-w-lg text-3xl font-bold tracking-[-0.04em] text-[#173f35] sm:text-4xl">
                See what happens
                after a campaign
                begins.
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-neutral-600">
                Updates give you a
                closer look at
                campaign progress,
                deliveries, field
                visits, completed work
                and the people behind
                each story.
              </p>
            </div>

            <div className="min-h-[300px] bg-[#dfe8d7]">
              {featured?.cover_image_url ? (
                <img
                  src={
                    featured.cover_image_url
                  }
                  alt={
                    featured.title
                  }
                  className="h-full min-h-[300px] w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[300px] items-center justify-center text-sm font-semibold text-[#477768]">
                  HopeFund Updates
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =================================
          FILTER + SEARCH
      ================================= */}

      <section
        id="latest-updates"
        className="px-5 pb-20 lg:px-8 lg:pb-28"
      >
        <div className="mx-auto max-w-6xl">
          <div className="border-b border-neutral-200 pb-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
                  Latest activity
                </p>

                <h2 className="mt-2 text-4xl font-bold tracking-[-0.045em] text-[#173f35]">
                  Updates from the
                  field.
                </h2>
              </div>

              <form
                action="/updates"
                method="get"
                className="w-full lg:max-w-sm"
              >
                {type && (
                  <input
                    type="hidden"
                    name="type"
                    value={type}
                  />
                )}

                <div className="flex overflow-hidden rounded-full border border-neutral-300 bg-white">
                  <input
                    type="search"
                    name="q"
                    defaultValue={
                      search
                    }
                    placeholder="Search updates..."
                    className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm outline-none"
                  />

                  <button
                    type="submit"
                    className="px-5 text-sm font-bold text-[#173f35]"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* TYPES */}

            <div className="mt-7 flex gap-2 overflow-x-auto pb-2">
              {updateTypes.map(
                (item) => {
                  const active =
                    type ===
                    item.value

                  const href =
                    item.value
                      ? `/updates?type=${item.value}${
                          search
                            ? `&q=${encodeURIComponent(
                                search
                              )}`
                            : ''
                        }`
                      : `/updates${
                          search
                            ? `?q=${encodeURIComponent(
                                search
                              )}`
                            : ''
                        }`

                  return (
                    <Link
                      key={
                        item.label
                      }
                      href={href}
                      className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition ${
                        active
                          ? 'bg-[#173f35] text-white'
                          : 'border border-neutral-300 bg-white text-neutral-600 hover:border-[#173f35] hover:text-[#173f35]'
                      }`}
                    >
                      {
                        item.label
                      }
                    </Link>
                  )
                }
              )}
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              We could not load
              updates right now.
            </div>
          )}

          {/* EMPTY */}

          {!error &&
            updates.length ===
              0 && (
              <div className="mt-10 rounded-[28px] border border-dashed border-neutral-300 bg-white p-12 text-center">
                <p className="text-lg font-bold text-[#173f35]">
                  No updates found.
                </p>

                <p className="mt-2 text-sm text-neutral-500">
                  Try another filter
                  or search term.
                </p>

                <Link
                  href="/updates"
                  className="mt-6 inline-flex rounded-full bg-[#173f35] px-6 py-3 text-sm font-bold text-white"
                >
                  View all updates
                </Link>
              </div>
            )}

          {/* =================================
              FEATURED
          ================================= */}

          {!error &&
            featured &&
            (() => {
              const campaign =
                getCampaign(
                  featured
                )

              const photoCount =
                getPhotoCount(
                  featured
                )

              return (
                <article className="mt-10 overflow-hidden rounded-[30px] border border-neutral-200 bg-white">
                  <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
                    <Link
                      href={`/updates/${featured.slug}`}
                      className="block min-h-[340px] overflow-hidden bg-[#e5eadf] lg:min-h-[510px]"
                    >
                      {featured.cover_image_url ? (
                        <img
                          src={
                            featured.cover_image_url
                          }
                          alt={
                            featured.title
                          }
                          className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-full min-h-[340px] items-center justify-center text-sm font-semibold text-[#477768]">
                          HopeFund
                          Update
                        </div>
                      )}
                    </Link>

                    <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#477768]">
                        <span>
                          {formatType(
                            featured.update_type
                          )}
                        </span>

                        <span className="text-neutral-300">
                          ·
                        </span>

                        <span>
                          HopeFund
                        </span>
                      </div>

                      <h3 className="mt-5 text-3xl font-bold leading-tight tracking-[-0.04em] text-[#173f35] sm:text-4xl">
                        {
                          featured.title
                        }
                      </h3>

                      {featured.excerpt && (
                        <p className="mt-5 text-sm leading-7 text-neutral-600">
                          {
                            featured.excerpt
                          }
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                        <span>
                          {formatDate(
                            featured.published_at ||
                              featured.created_at
                          )}
                        </span>

                        {photoCount >
                          0 && (
                          <>
                            <span>
                              ·
                            </span>

                            <span>
                              {photoCount}{' '}
                              {photoCount ===
                              1
                                ? 'photo'
                                : 'photos'}
                            </span>
                          </>
                        )}
                      </div>

                      {campaign && (
                        <div className="mt-6 rounded-xl bg-[#f5f6f2] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                            Related
                            campaign
                          </p>

                          <Link
                            href={`/campaigns/${campaign.slug}`}
                            className="mt-1 block text-sm font-bold text-[#173f35] hover:underline"
                          >
                            {
                              campaign.title
                            }
                          </Link>
                        </div>
                      )}

                      <Link
                        href={`/updates/${featured.slug}`}
                        className="mt-7 inline-flex w-fit items-center gap-2 text-sm font-bold text-[#173f35]"
                      >
                        Read update

                        <span>
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })()}

          {/* =================================
              UPDATE GRID
          ================================= */}

          {remaining.length >
            0 && (
            <div className="mt-12 grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {remaining.map(
                (update) => {
                  const campaign =
                    getCampaign(
                      update
                    )

                  const photoCount =
                    getPhotoCount(
                      update
                    )

                  return (
                    <article
                      key={
                        update.id
                      }
                      className="group"
                    >
                      <Link
                        href={`/updates/${update.slug}`}
                        className="block overflow-hidden rounded-[22px] bg-[#e5eadf]"
                      >
                        <div className="relative aspect-[4/3]">
                          {update.cover_image_url ? (
                            <img
                              src={
                                update.cover_image_url
                              }
                              alt={
                                update.title
                              }
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-[0.12em] text-[#477768]">
                              HopeFund
                              Update
                            </div>
                          )}

                          {photoCount >
                            1 && (
                            <span className="absolute bottom-3 right-3 rounded-full bg-[#173f35]/85 px-2.5 py-1 text-[10px] font-bold text-white">
                              {
                                photoCount
                              }{' '}
                              photos
                            </span>
                          )}
                        </div>
                      </Link>

                      <div className="mt-5">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#477768]">
                          <span>
                            {formatType(
                              update.update_type
                            )}
                          </span>

                          <span className="text-neutral-300">
                            ·
                          </span>

                          <span>
                            HopeFund
                          </span>
                        </div>

                        <h3 className="mt-3 text-xl font-bold leading-snug tracking-[-0.025em] text-[#173f35]">
                          <Link
                            href={`/updates/${update.slug}`}
                          >
                            {
                              update.title
                            }
                          </Link>
                        </h3>

                        {update.excerpt && (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-500">
                            {
                              update.excerpt
                            }
                          </p>
                        )}

                        {campaign && (
                          <Link
                            href={`/campaigns/${campaign.slug}`}
                            className="mt-4 block text-xs font-semibold text-neutral-400 transition hover:text-[#173f35]"
                          >
                            {
                              campaign.title
                            }
                          </Link>
                        )}

                        <div className="mt-5 flex items-center justify-between gap-4">
                          <span className="text-xs text-neutral-400">
                            {formatDate(
                              update.published_at ||
                                update.created_at
                            )}
                          </span>

                          <Link
                            href={`/updates/${update.slug}`}
                            className="text-xs font-bold text-[#173f35]"
                          >
                            Read update
                            {' →'}
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                }
              )}
            </div>
          )}
        </div>
      </section>

      {/* =================================
          CTA
      ================================= */}

      <section className="bg-[#173f35] px-5 py-16 text-white lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b8f06a]">
              Support the work
            </p>

            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              Help create the next
              story of impact.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">
              Explore active
              campaigns and support
              the people and
              communities behind
              these updates.
            </p>
          </div>

          <Link
            href="/campaigns"
            className="inline-flex w-fit rounded-full bg-[#b8f06a] px-7 py-3.5 text-sm font-bold text-[#173f35]"
          >
            Explore campaigns
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}