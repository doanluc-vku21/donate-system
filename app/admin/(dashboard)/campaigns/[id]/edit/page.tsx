import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CampaignEditForm from './campaign-edit-form'

type PageProps = {
  params: Promise<{
    id: string
  }>

  searchParams: Promise<{
    error?: string
  }>
}

export default async function EditCampaignPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const query = await searchParams

  const supabase = await createClient()

  // =========================
  // CAMPAIGN
  // =========================

  const campaignResult = await supabase
    .from('campaigns')
    .select(`
      id,
      title,
      slug,
      category_id,
      short_description,
      content,
      featured_image_url,
      featured_image_path,
      goal_amount_cents,
      raised_amount_cents,
      currency,
      location,
      status,
      is_featured,
      start_date,
      end_date,
      published_at,
      created_at,
      updated_at
    `)
    .eq('id', id)
    .single()

  // =========================
  // CATEGORIES
  // =========================

  const categoriesResult = await supabase
    .from('categories')
    .select(`
      id,
      name
    `)
    .eq('is_active', true)
    .order('sort_order', {
      ascending: true,
    })

  // =========================
  // CAMPAIGN MEDIA
  // =========================

  const mediaResult = await supabase
    .from('campaign_media')
    .select(`
      id,
      media_url,
      storage_path,
      media_type,
      alt_text,
      sort_order
    `)
    .eq('campaign_id', id)
    .order('sort_order', {
      ascending: true,
    })

  // =========================
  // FUND USAGE
  // =========================

  const fundItemsResult = await supabase
    .from('campaign_fund_items')
    .select(`
      id,
      title,
      description,
      amount_cents,
      sort_order
    `)
    .eq('campaign_id', id)
    .order('sort_order', {
      ascending: true,
    })
  const updatesResult = await supabase
  .from('campaign_updates')
  .select(`
    id,
    title,
    content,
    image_url,
    image_path,
    status,
    published_at,
    created_at,
    updated_at
  `)
  .eq('campaign_id', id)
  .order('created_at', {
    ascending: false,
  })
  const donationSettingsResult =
  await supabase
    .from(
      'campaign_donation_settings'
    )
    .select(`
      campaign_id,
      enable_one_time,
      enable_monthly,
      allow_custom_amount,
      allow_anonymous,
      allow_cover_fee,
      minimum_amount_cents,
      default_frequency,
      created_at,
      updated_at
    `)
    .eq(
      'campaign_id',
      id
    )
    .maybeSingle()
    const donationOptionsResult =
  await supabase
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
      id
    )
    .order(
      'sort_order',
      {
        ascending: true,
      }
    )
  // =========================
  // DATA
  // =========================
  
  const campaign = campaignResult.data
  const campaignError = campaignResult.error

  const categories = categoriesResult.data
  const categoriesError = categoriesResult.error

  const media = mediaResult.data
  const mediaError = mediaResult.error

  const fundItems = fundItemsResult.data
  const fundItemsError = fundItemsResult.error
  const updates =
  updatesResult.data
  const donationSettings =
  donationSettingsResult.data

const donationSettingsError =
  donationSettingsResult.error

const donationOptions =
  donationOptionsResult.data

const donationOptionsError =
  donationOptionsResult.error

const updatesError =
  updatesResult.error
  // =========================
  // CAMPAIGN NOT FOUND
  // =========================

  if (campaignError || !campaign) {
    notFound()
  }

  // =========================
  // ERROR MESSAGE
  // =========================

  let errorMessage = ''

  if (query.error === 'title') {
    errorMessage =
      'Campaign title is required.'
  } else if (
    query.error === 'goal'
  ) {
    errorMessage =
      'Please enter a valid goal amount.'
  } else if (
    query.error === 'slug'
  ) {
    errorMessage =
      'Please enter a valid slug.'
  } else if (
    query.error === 'duplicate-slug'
  ) {
    errorMessage =
      'This campaign slug already exists.'
  } else if (
    query.error === 'invalid-status'
  ) {
    errorMessage =
      'Invalid campaign status.'
  } else if (query.error) {
    errorMessage = query.error
  }

  return (
    <div className="p-5 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* BACK */}

        <Link
          href="/admin/campaigns"
          className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
        >
          ← Back to Campaigns
        </Link>

        {/* HEADER */}

        <div className="mt-4">
          <p className="text-sm font-medium text-neutral-500">
            Fundraising
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-950">
            Edit Campaign
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Update campaign information, media,
            planned fund usage and publishing status.
          </p>
        </div>

        {/* GENERAL ERROR */}

        {errorMessage && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* CATEGORY ERROR */}

        {categoriesError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load categories:{' '}
            {categoriesError.message}
          </div>
        )}

        {/* MEDIA ERROR */}

        {mediaError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load campaign media:{' '}
            {mediaError.message}
          </div>
        )}

        {/* FUND USAGE ERROR */}

        {fundItemsError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load fund usage:{' '}
            {fundItemsError.message}
          </div>
        )}
        {updatesError && (
  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
    Failed to load campaign updates: {updatesError.message}
  </div>
)}
{donationSettingsError && (
  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
    Failed to load donation settings:{' '}
    {donationSettingsError.message}
  </div>
)}
{donationOptionsError && (
  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
    Failed to load donation options:{' '}
    {donationOptionsError.message}
  </div>
)}

        {/* FORM */}

        <div className="mt-8">
          <CampaignEditForm
  campaign={campaign}
  categories={categories ?? []}
  media={media ?? []}
  fundItems={fundItems ?? []}
  updates={updates ?? []}
  donationSettings={donationSettings}
  donationOptions={donationOptions ?? []}
/>
        </div>
      </div>
    </div>
  )
}