import Link from 'next/link'

import {
  notFound,
} from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import SiteHeader from '@/components/public/site-header'
import SiteFooter from '@/components/public/site-footer'
import UpdateGallery from '@/components/public/update-gallery'

export const dynamic =
  'force-dynamic'

type PageProps = {
  params: Promise<{
    slug: string
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

export default async function UpdateDetailPage({
  params,
}: PageProps) {
  const { slug } =
    await params

  const supabase =
    await createClient()

  const {
    data: update,
    error,
  } = await supabase
    .from('site_updates')
    .select(`
      id,
      campaign_id,
      title,
      slug,
      update_type,
      excerpt,
      content,
      cover_image_url,
      status,
      is_featured,
      published_at,
      created_at,
      campaign:campaigns (
        id,
        title,
        slug,
        short_description,
        featured_image_url,
        raised_amount_cents,
        goal_amount_cents,
        currency,
        location,
        status
      ),
      media:site_update_media (
        id,
        media_url,
        storage_path,
        alt_text,
        sort_order
      )
    `)
    .eq(
      'slug',
      slug
    )
    .eq(
      'status',
      'published'
    )
    .single()

  if (
    error ||
    !update
  ) {
    notFound()
  }

  const campaign =
    Array.isArray(
      update.campaign
    )
      ? update.campaign[0]
      : update.campaign

  const media =
    Array.isArray(
      update.media
    )
      ? [...update.media].sort(
          (
            a,
            b
          ) =>
            a.sort_order -
            b.sort_order
        )
      : []

  const galleryImages =
    [
      ...(update.cover_image_url
        ? [
            {
              id: 'cover',
              media_url:
                update.cover_image_url,
              alt_text:
                update.title,
            },
          ]
        : []),

      ...media.map(
        (item) => ({
          id: item.id,
          media_url:
            item.media_url,
          alt_text:
            item.alt_text ||
            update.title,
        })
      ),
    ]

  return (
    <main className="min-h-screen bg-[#fffdf8]">
      <SiteHeader />

      {/* =========================
          HEADER
      ========================= */}

      <section className="px-5 pb-10 pt-12 lg:px-8 lg:pb-14 lg:pt-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-xs font-semibold text-neutral-400">
            <Link
              href="/updates"
              className="transition hover:text-[#173f35]"
            >
              Updates
            </Link>

            <span className="mx-2">
              /
            </span>

            <span>
              {
                formatType(
                  update.update_type
                )
              }
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#477768]">
            <span>
              {
                formatType(
                  update.update_type
                )
              }
            </span>

            <span className="text-neutral-300">
              ·
            </span>

            <span>
              {formatDate(
                update.published_at ||
                  update.created_at
              )}
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.04] tracking-[-0.05em] text-[#173f35] sm:text-5xl lg:text-6xl">
            {update.title}
          </h1>

          {update.excerpt && (
            <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-600">
              {
                update.excerpt
              }
            </p>
          )}
        </div>
      </section>

      {/* =========================
          GALLERY
      ========================= */}

      {galleryImages.length >
        0 && (
        <section className="px-5 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <UpdateGallery
              images={
                galleryImages
              }
              title={
                update.title
              }
            />
          </div>
        </section>
      )}

      {/* =========================
          CONTENT
      ========================= */}

      <section className="px-5 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          {/* ARTICLE */}

          <article>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
              Latest update
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[#173f35]">
              {
                update.title
              }
            </h2>

            {update.content ? (
              <div className="mt-7 whitespace-pre-wrap text-base leading-8 text-neutral-700">
                {
                  update.content
                }
              </div>
            ) : (
              <p className="mt-7 text-sm text-neutral-500">
                No additional details
                were provided for this
                update.
              </p>
            )}

            <div className="mt-12 border-t border-neutral-200 pt-7">
              <Link
                href="/updates"
                className="text-sm font-bold text-[#173f35]"
              >
                ← Back to all updates
              </Link>
            </div>
          </article>

          {/* =========================
              RELATED CAMPAIGN
          ========================= */}

          <aside className="lg:sticky lg:top-28">
            {campaign ? (
              <div className="rounded-[24px] border border-neutral-200 bg-white p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#477768]">
                  Related campaign
                </p>

                {campaign.featured_image_url && (
                  <img
                    src={
                      campaign.featured_image_url
                    }
                    alt={
                      campaign.title
                    }
                    className="mt-4 aspect-[16/10] w-full rounded-xl object-cover"
                  />
                )}

                <h3 className="mt-5 text-xl font-bold leading-snug text-[#173f35]">
                  {
                    campaign.title
                  }
                </h3>

                {campaign.location && (
                  <p className="mt-2 text-xs text-neutral-400">
                    {
                      campaign.location
                    }
                  </p>
                )}

                {campaign.short_description && (
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-neutral-500">
                    {
                      campaign.short_description
                    }
                  </p>
                )}

                <Link
                  href={`/campaigns/${campaign.slug}`}
                  className="mt-6 flex w-full items-center justify-center rounded-full bg-[#173f35] px-5 py-3 text-sm font-bold text-white"
                >
                  View campaign
                </Link>

                {campaign.status !==
                  'completed' && (
                  <Link
                    href={`/campaigns/${campaign.slug}/contribute`}
                    className="mt-3 flex w-full items-center justify-center rounded-full bg-[#b8f06a] px-5 py-3 text-sm font-bold text-[#173f35]"
                  >
                    Donate
                  </Link>
                )}
              </div>
            ) : (
              <div className="rounded-[24px] border border-neutral-200 bg-[#edf4e7] p-6">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#477768]">
                  HopeFund update
                </p>

                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  This update is not
                  linked to a specific
                  campaign.
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}