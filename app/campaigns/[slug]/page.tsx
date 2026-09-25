import Link from 'next/link'
import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import SiteHeader from '@/components/public/site-header'
import SiteFooter from '@/components/public/site-footer'
import CampaignGallery from '@/components/public/campaign-gallery'
import CampaignFundUsage from '@/components/public/campaign-fund-usage'
import CampaignUpdates from '@/components/public/campaign-updates'
import DonationPanel from '@/components/public/donation-panel'
import RecentContributions from '@/components/public/recent-contributions'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function CampaignDetailPage({
  params,
}: PageProps) {
  const { slug } =
    await params

  const supabase =
    await createClient()

  // =========================
  // CAMPAIGN
  // =========================

  const {
    data: campaign,
    error: campaignError,
  } = await supabase
    .from('campaigns')
    .select(`
      id,
      title,
      slug,
      short_description,
      content,
      featured_image_url,
      goal_amount_cents,
      raised_amount_cents,
      currency,
      location,
      status,
      is_featured,
      published_at,
      category:categories (
        id,
        name,
        slug
      )
    `)
    .eq(
      'slug',
      slug
    )
    .in(
      'status',
      [
        'published',
        'completed',
      ]
    )
    .single()

  if (
    campaignError ||
    !campaign
  ) {
    notFound()
  }

  // =========================
  // MEDIA
  // =========================

  const {
    data: media,
  } = await supabase
    .from(
      'campaign_media'
    )
    .select(`
      id,
      media_url,
      alt_text,
      sort_order
    `)
    .eq(
      'campaign_id',
      campaign.id
    )
    .order(
      'sort_order',
      {
        ascending: true,
      }
    )

  // =========================
  // FUND USAGE
  // =========================

  const {
    data: fundItems,
  } = await supabase
    .from(
      'campaign_fund_items'
    )
    .select(`
      id,
      title,
      description,
      amount_cents,
      sort_order
    `)
    .eq(
      'campaign_id',
      campaign.id
    )
    .order(
      'sort_order',
      {
        ascending: true,
      }
    )

  // =========================
  // UPDATES
  // =========================

  const {
    data: updates,
  } = await supabase
    .from(
      'campaign_updates'
    )
    .select(`
      id,
      title,
      content,
      image_url,
      published_at,
      created_at
    `)
    .eq(
      'campaign_id',
      campaign.id
    )
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
  // =========================
  // RECENT CONTRIBUTIONS
  // =========================

  const {
    data: contributions,
    error: contributionsError,
  } = await supabase
    .from('donations')
    .select(`
      id,
      display_name,
      amount_cents,
      currency,
      frequency,
      message,
      is_anonymous,
      created_at
    `)
    .eq(
      'campaign_id',
      campaign.id
    )
    .eq(
      'status',
      'paid'
    )
    .order(
      'created_at',
      {
        ascending: false,
      }
    )
    .limit(10)

  if (contributionsError) {
    console.error(
      'Recent contributions error:',
      contributionsError
    )
  }
  // =========================
  // DONATION SETTINGS
  // =========================

  const {
    data: donationSettings,
  } = await supabase
    .from(
      'campaign_donation_settings'
    )
    .select(`
      enable_one_time,
      enable_monthly,
      allow_custom_amount,
      allow_anonymous,
      allow_cover_fee,
      minimum_amount_cents,
      default_frequency
    `)
    .eq(
      'campaign_id',
      campaign.id
    )
    .maybeSingle()

  // =========================
  // DONATION OPTIONS
  // =========================

  const {
    data: donationOptions,
  } = await supabase
    .from(
      'campaign_donation_options'
    )
    .select(`
      id,
      amount_cents,
      label,
      is_active,
      is_default,
      sort_order
    `)
    .eq(
      'campaign_id',
      campaign.id
    )
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

  const category =
    Array.isArray(
      campaign.category
    )
      ? campaign.category[0]
      : campaign.category

  const completed =
    campaign.status ===
    'completed'

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />

      {/* =========================
          TOP
      ========================= */}

      <section className="px-5 pb-10 pt-10 lg:px-8 lg:pt-14">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/campaigns"
            className="text-xs font-semibold text-neutral-400 hover:text-[#173f35]"
          >
            ← Campaigns
          </Link>

          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.02] tracking-[-0.045em] text-[#111] sm:text-5xl">
            {campaign.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#edf4e7] font-bold text-[#173f35]">
              H
            </div>

            <span>
              Organized for this campaign
            </span>

            {category && (
              <>
                <span>·</span>

                <span>
                  {category.name}
                </span>
              </>
            )}

            {campaign.location && (
              <>
                <span>·</span>

                <span>
                  {
                    campaign.location
                  }
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* =========================
          MAIN GRID
      ========================= */}

      <section className="px-5 pb-24 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          {/* LEFT */}

          <div className="min-w-0">
            <CampaignGallery
              featuredImage={
                campaign.featured_image_url
              }
              title={
                campaign.title
              }
              media={
                media ?? []
              }
            />

            {/* STORY */}

            <section className="border-b border-neutral-200 py-9">
              <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#111]">
                The story
              </h2>

              {campaign.short_description && (
                <p className="mt-5 text-base font-medium leading-7 text-neutral-700">
                  {
                    campaign.short_description
                  }
                </p>
              )}

              {campaign.content && (
                <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-neutral-600">
                  {campaign.content}
                </div>
              )}
            </section>

            {/* ORGANIZER PLACEHOLDER */}

            <section className="border-b border-neutral-200 py-9">
              <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#111]">
                Organizer & beneficiary
              </h2>

              <div className="mt-5 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#edf4e7] text-sm font-bold text-[#173f35]">
                  HF
                </div>

                <div>
                  <h3 className="font-bold text-[#173f35]">
                    HopeFund
                  </h3>

                  <p className="mt-1 text-sm text-neutral-500">
                    Organizing this
                    campaign to support
                    the beneficiary.
                  </p>

                  <p className="mt-2 text-xs font-medium text-[#2c755e]">
                    ✓ Verified campaign
                  </p>
                </div>
              </div>
            </section>

            {/* FUND USAGE */}

            {fundItems &&
              fundItems.length >
                0 && (
                <section className="border-b border-neutral-200 py-9">
                  <CampaignFundUsage
                    items={
                      fundItems
                    }
                    currency={
                      campaign.currency
                    }
                    goalAmountCents={
                      campaign.goal_amount_cents
                    }
                  />
                </section>
              )}

            {/* UPDATES */}

            {updates &&
              updates.length >
                0 && (
                <section className="border-b border-neutral-200 py-9">
                  <CampaignUpdates
                    updates={
                      updates
                    }
                  />
                </section>
              )}

            {/* RECENT CONTRIBUTIONS */}

<section className="border-b border-neutral-200 py-9">
  <RecentContributions
    contributions={
      contributions ?? []
    }
  />
</section>

            {/* COMMENTS PLACEHOLDER */}

            <section className="border-b border-neutral-200 py-9">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#111]">
                  Comments
                </h2>

                <span className="text-xs text-neutral-400">
                  Words of support
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-neutral-200 bg-[#fbfcfa] p-5">
                <p className="text-sm font-semibold text-[#173f35]">
                  Thank you for supporting this campaign
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  Your kindness can
                  help make a
                  difference.
                </p>
              </div>
            </section>

            {/* FAQ */}

            <section className="py-9">
              <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#111]">
                Before you contribute
              </h2>

              <div className="mt-5 divide-y divide-neutral-200 border-y border-neutral-200">
                <details>
                  <summary className="cursor-pointer py-5 text-sm font-semibold text-neutral-700">
                    How will my donation be used?
                  </summary>

                  <p className="pb-5 text-sm leading-7 text-neutral-500">
                    Donations support the campaign&apos;s stated goals and planned fund usage shown on this page.
                  </p>
                </details>

                <details>
                  <summary className="cursor-pointer py-5 text-sm font-semibold text-neutral-700">
                    Who is organizing this campaign and who benefits?
                  </summary>

                  <p className="pb-5 text-sm leading-7 text-neutral-500">
                    Organizer and beneficiary details will be displayed here based on the campaign information.
                  </p>
                </details>

                <details>
                  <summary className="cursor-pointer py-5 text-sm font-semibold text-neutral-700">
                    How do I get my receipt?
                  </summary>

                  <p className="pb-5 text-sm leading-7 text-neutral-500">
                    After Stripe integration, donors will receive confirmation and receipt information after successful payment.
                  </p>
                </details>
              </div>
            </section>
          </div>

          {/* RIGHT */}

          <div>
            {completed ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
                <h2 className="text-lg font-bold text-[#173f35]">
                  Campaign completed
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  This campaign is no
                  longer accepting
                  donations.
                </p>
              </div>
            ) : (
             <DonationPanel
  campaignSlug={
    campaign.slug
  }
  campaignTitle={
    campaign.title
  }
  raisedAmountCents={
    campaign.raised_amount_cents
  }
  goalAmountCents={
    campaign.goal_amount_cents
  }
  currency={
    campaign.currency
  }
/>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}