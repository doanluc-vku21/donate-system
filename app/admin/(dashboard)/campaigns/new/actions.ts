'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { uploadCampaignImage } from '@/lib/campaign-media'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createCampaign(formData: FormData) {
  const supabase = await createClient()

  const title = String(formData.get('title') || '').trim()
  const inputSlug = String(formData.get('slug') || '').trim()
  const categoryId = String(formData.get('category_id') || '').trim()

  const shortDescription = String(
    formData.get('short_description') || ''
  ).trim()

  const content = String(formData.get('content') || '').trim()
  const location = String(formData.get('location') || '').trim()
  const currency = String(formData.get('currency') || 'USD').trim()
  const status = String(formData.get('status') || 'draft').trim()

  const isFeatured = formData.get('is_featured') === 'on'

  const startDate = String(formData.get('start_date') || '').trim()
  const endDate = String(formData.get('end_date') || '').trim()

  const goalAmountRaw = String(
    formData.get('goal_amount') || ''
  ).trim()

  const goalAmount = Number(goalAmountRaw)

  const featuredImage = formData.get('featured_image')
  const galleryImages = formData.getAll('gallery_images')

  // =========================
  // VALIDATION
  // =========================

  if (!title) {
    redirect('/admin/campaigns/new?error=title')
  }

  if (
    !goalAmountRaw ||
    Number.isNaN(goalAmount) ||
    goalAmount < 0
  ) {
    redirect('/admin/campaigns/new?error=goal')
  }

  const slug = slugify(inputSlug || title)

  if (!slug) {
    redirect('/admin/campaigns/new?error=slug')
  }

  const goalAmountCents = Math.round(goalAmount * 100)

  // =========================
  // CREATE CAMPAIGN
  // =========================

  const {
    data: campaign,
    error: campaignError,
  } = await supabase
    .from('campaigns')
    .insert({
      title,
      slug,

      category_id: categoryId || null,

      short_description: shortDescription || null,
      content: content || null,

      goal_amount_cents: goalAmountCents,
      raised_amount_cents: 0,

      currency,

      location: location || null,

      status,

      is_featured: isFeatured,

      start_date: startDate || null,
      end_date: endDate || null,

      published_at:
        status === 'published'
          ? new Date().toISOString()
          : null,
    })
    .select('id')
    .single()

  if (campaignError) {
    if (campaignError.code === '23505') {
      redirect(
        '/admin/campaigns/new?error=duplicate-slug'
      )
    }

    redirect(
      `/admin/campaigns/new?error=${encodeURIComponent(
        campaignError.message
      )}`
    )
  }

  if (!campaign) {
    redirect('/admin/campaigns/new?error=create')
  }

  // =========================
  // FEATURED IMAGE
  // =========================

  try {
    if (
      featuredImage instanceof File &&
      featuredImage.size > 0
    ) {
      const uploadedFeatured =
        await uploadCampaignImage(
          supabase,
          campaign.id,
          featuredImage,
          'featured'
        )

      const { error: featuredUpdateError } =
        await supabase
          .from('campaigns')
          .update({
  featured_image_url: uploadedFeatured.url,
  featured_image_path: uploadedFeatured.path,
})
          .eq('id', campaign.id)

      if (featuredUpdateError) {
        throw new Error(
          featuredUpdateError.message
        )
      }
    }

    // =========================
    // GALLERY IMAGES
    // =========================

    let sortOrder = 0

    for (const item of galleryImages) {
      if (
        !(item instanceof File) ||
        item.size === 0
      ) {
        continue
      }

      const uploadedGallery =
        await uploadCampaignImage(
          supabase,
          campaign.id,
          item,
          'gallery'
        )

      const { error: mediaInsertError } =
        await supabase
          .from('campaign_media')
          .insert({
            campaign_id: campaign.id,

            media_url:
              uploadedGallery.url,

            storage_path:
              uploadedGallery.path,

            media_type: 'image',

            alt_text: null,

            sort_order: sortOrder,
          })

      if (mediaInsertError) {
        throw new Error(
          mediaInsertError.message
        )
      }

      sortOrder++
    }
  } catch (uploadError) {
    const message =
      uploadError instanceof Error
        ? uploadError.message
        : 'Failed to upload campaign media.'

    redirect(
      `/admin/campaigns/${campaign.id}/edit?error=${encodeURIComponent(
        message
      )}`
    )
  }

  redirect('/admin/campaigns?created=1')
}