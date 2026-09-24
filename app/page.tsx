import { createClient } from '@/lib/supabase/server'

import SiteHeader from '@/components/public/site-header'
import HomeHero from '@/components/public/home-hero'
import ImpactStrip from '@/components/public/impact-strip'
import CampaignBrowser from '@/components/public/campaign-browser'
import HowItWorks from '@/components/public/how-it-works'
import TrustSection from '@/components/public/trust-section'
import FAQSection from '@/components/public/faq-section'
import SiteFooter from '@/components/public/site-footer'

import type {
  PublicCampaign,
} from '@/components/public/campaign-card'

export default async function HomePage() {
  const supabase =
    await createClient()

  // =========================
  // CAMPAIGNS
  // =========================

  const {
    data: campaignRows,
    error: campaignsError,
  } = await supabase
    .from('campaigns')
    .select(`
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
    `)
    .eq('status', 'published')
    .order('is_featured', {
      ascending: false,
    })
    .order('published_at', {
      ascending: false,
    })
    .limit(12)

  // =========================
  // CATEGORIES
  // =========================

  const {
    data: categories,
  } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      slug
    `)
    .eq('is_active', true)
    .order('sort_order', {
      ascending: true,
    })

  // =========================
  // UPDATE COUNT
  // =========================

  const {
    count: updateCount,
  } = await supabase
    .from('campaign_updates')
    .select(
      'id',
      {
        count: 'exact',
        head: true,
      }
    )
    .eq(
      'status',
      'published'
    )

  const campaigns =
    (campaignRows ??
      []) as unknown as PublicCampaign[]

  const totalRaisedCents =
    campaigns.reduce(
      (
        sum,
        campaign
      ) =>
        sum +
        campaign.raised_amount_cents,
      0
    )

  const featuredImage =
    campaigns.find(
      (campaign) =>
        campaign.featured_image_url
    )?.featured_image_url ??
    null

  return (
    <main className="min-h-screen bg-[#fffdf8]">
      <SiteHeader />

      <HomeHero
        featuredImage={
          featuredImage
        }
      />

      <ImpactStrip
        totalRaisedCents={
          totalRaisedCents
        }
        campaignCount={
          campaigns.length
        }
        categoryCount={
          categories?.length ??
          0
        }
        updateCount={
          updateCount ?? 0
        }
      />

      {campaignsError ? (
        <div className="mx-auto max-w-7xl px-5 py-20 text-center">
          <p className="text-sm text-red-600">
            Failed to load campaigns:
            {' '}
            {
              campaignsError.message
            }
          </p>
        </div>
      ) : (
        <CampaignBrowser
          campaigns={
            campaigns
          }
          categories={
            categories ?? []
          }
        />
      )}

      <HowItWorks />

      <TrustSection />

      <FAQSection />

      <SiteFooter />
    </main>
  )
}