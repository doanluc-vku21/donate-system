'use server'

import { createClient } from '@/lib/supabase/server'
import {
  deleteCampaignImage,
  uploadCampaignImage,
} from '@/lib/campaign-media'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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

export async function updateCampaign(
  campaignId: string,
  formData: FormData
) {
  const supabase = await createClient()

  const title = String(formData.get('title') || '').trim()
  const inputSlug = String(formData.get('slug') || '').trim()
  const categoryId = String(formData.get('category_id') || '').trim()

  const shortDescription = String(
    formData.get('short_description') || ''
  ).trim()

  const content = String(
    formData.get('content') || ''
  ).trim()

  const location = String(
    formData.get('location') || ''
  ).trim()

  const currency = String(
    formData.get('currency') || 'USD'
  ).trim()

  const status = String(
    formData.get('status') || 'draft'
  ).trim()

  const isFeatured =
    formData.get('is_featured') === 'on'

  const startDate = String(
    formData.get('start_date') || ''
  ).trim()

  const endDate = String(
    formData.get('end_date') || ''
  ).trim()

  const goalAmountRaw = String(
    formData.get('goal_amount') || ''
  ).trim()

  const goalAmount = Number(goalAmountRaw)

  const featuredImage =
    formData.get('featured_image')

  const galleryImages =
    formData.getAll('gallery_images')

  if (!title) {
    redirect(
      `/admin/campaigns/${campaignId}/edit?error=title`
    )
  }

  if (
    !goalAmountRaw ||
    Number.isNaN(goalAmount) ||
    goalAmount < 0
  ) {
    redirect(
      `/admin/campaigns/${campaignId}/edit?error=goal`
    )
  }

  const slug = slugify(inputSlug || title)

  if (!slug) {
    redirect(
      `/admin/campaigns/${campaignId}/edit?error=slug`
    )
  }

  const allowedStatuses = [
    'draft',
    'published',
    'paused',
    'completed',
  ]

  if (!allowedStatuses.includes(status)) {
    redirect(
      `/admin/campaigns/${campaignId}/edit?error=invalid-status`
    )
  }

  const goalAmountCents =
    Math.round(goalAmount * 100)

  const {
    data: existingCampaign,
    error: existingError,
  } = await supabase
    .from('campaigns')
    .select(`
      id,
      published_at,
      featured_image_url,
      featured_image_path
    `)
    .eq('id', campaignId)
    .single()

  if (
    existingError ||
    !existingCampaign
  ) {
    redirect(
      `/admin/campaigns/${campaignId}/edit?error=Campaign not found`
    )
  }

  let publishedAt =
    existingCampaign.published_at

  if (
    status === 'published' &&
    !publishedAt
  ) {
    publishedAt =
      new Date().toISOString()
  }

  const { error: updateError } =
    await supabase
      .from('campaigns')
      .update({
        title,
        slug,
        category_id:
          categoryId || null,
        short_description:
          shortDescription || null,
        content:
          content || null,
        goal_amount_cents:
          goalAmountCents,
        currency,
        location:
          location || null,
        status,
        is_featured:
          isFeatured,
        start_date:
          startDate || null,
        end_date:
          endDate || null,
        published_at:
          publishedAt,
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', campaignId)

  if (updateError) {
    if (
      updateError.code === '23505'
    ) {
      redirect(
        `/admin/campaigns/${campaignId}/edit?error=duplicate-slug`
      )
    }

    redirect(
      `/admin/campaigns/${campaignId}/edit?error=${encodeURIComponent(
        updateError.message
      )}`
    )
  }

  // Replace Featured Image
  if (
    featuredImage instanceof File &&
    featuredImage.size > 0
  ) {
    try {
      const uploaded =
        await uploadCampaignImage(
          supabase,
          campaignId,
          featuredImage,
          'featured'
        )

      const { error } = await supabase
        .from('campaigns')
        .update({
          featured_image_url:
            uploaded.url,
          featured_image_path:
            uploaded.path,
          updated_at:
            new Date().toISOString(),
        })
        .eq('id', campaignId)

      if (error) {
        throw new Error(error.message)
      }

      if (
        existingCampaign.featured_image_path
      ) {
        try {
          await deleteCampaignImage(
            supabase,
            existingCampaign.featured_image_path
          )
        } catch (error) {
          console.error(
            'Failed to remove old featured image:',
            error
          )
        }
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Featured image upload failed.'

      redirect(
        `/admin/campaigns/${campaignId}/edit?error=${encodeURIComponent(
          message
        )}`
      )
    }
  }

  // Find next sort order
  const { data: lastMedia } =
    await supabase
      .from('campaign_media')
      .select('sort_order')
      .eq('campaign_id', campaignId)
      .order('sort_order', {
        ascending: false,
      })
      .limit(1)
      .maybeSingle()

  let sortOrder =
    typeof lastMedia?.sort_order ===
    'number'
      ? lastMedia.sort_order + 1
      : 0

  // Add Gallery Images
  for (const item of galleryImages) {
    if (
      !(item instanceof File) ||
      item.size === 0
    ) {
      continue
    }

    try {
      const uploaded =
        await uploadCampaignImage(
          supabase,
          campaignId,
          item,
          'gallery'
        )

      const { error } =
        await supabase
          .from('campaign_media')
          .insert({
            campaign_id:
              campaignId,
            media_url:
              uploaded.url,
            storage_path:
              uploaded.path,
            media_type:
              'image',
            alt_text:
              null,
            sort_order:
              sortOrder,
          })

      if (error) {
        throw new Error(error.message)
      }

      sortOrder++
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Gallery upload failed.'

      redirect(
        `/admin/campaigns/${campaignId}/edit?error=${encodeURIComponent(
          message
        )}`
      )
    }
  }

  revalidatePath(
    `/admin/campaigns/${campaignId}/edit`
  )

  revalidatePath('/admin/campaigns')

  redirect('/admin/campaigns?updated=1')
}

export async function deleteFeaturedImage(
  campaignId: string
) {
  const supabase =
    await createClient()

  const {
    data: campaign,
    error,
  } = await supabase
    .from('campaigns')
    .select(`
      featured_image_path
    `)
    .eq('id', campaignId)
    .single()

  if (error || !campaign) {
    throw new Error(
      'Campaign not found.'
    )
  }

  if (
    campaign.featured_image_path
  ) {
    await deleteCampaignImage(
      supabase,
      campaign.featured_image_path
    )
  }

  const { error: updateError } =
    await supabase
      .from('campaigns')
      .update({
        featured_image_url: null,
        featured_image_path: null,
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', campaignId)

  if (updateError) {
    throw new Error(
      updateError.message
    )
  }

  revalidatePath(
    `/admin/campaigns/${campaignId}/edit`
  )
}

export async function deleteGalleryImage(
  campaignId: string,
  mediaId: string
) {
  const supabase =
    await createClient()

  const {
    data: media,
    error,
  } = await supabase
    .from('campaign_media')
    .select(`
      id,
      storage_path
    `)
    .eq('id', mediaId)
    .eq(
      'campaign_id',
      campaignId
    )
    .single()

  if (error || !media) {
    throw new Error(
      'Gallery image not found.'
    )
  }

  await deleteCampaignImage(
    supabase,
    media.storage_path
  )

  const { error: deleteError } =
    await supabase
      .from('campaign_media')
      .delete()
      .eq('id', mediaId)
      .eq(
        'campaign_id',
        campaignId
      )

  if (deleteError) {
    throw new Error(
      deleteError.message
    )
  }

  await normalizeGalleryOrder(
    supabase,
    campaignId
  )

  revalidatePath(
    `/admin/campaigns/${campaignId}/edit`
  )
}

export async function reorderGallery(
  campaignId: string,
  ids: string[]
) {
  const supabase =
    await createClient()

  for (
    let index = 0;
    index < ids.length;
    index++
  ) {
    const mediaId = ids[index]

    const { error } =
      await supabase
        .from('campaign_media')
        .update({
          sort_order: index,
        })
        .eq('id', mediaId)
        .eq(
          'campaign_id',
          campaignId
        )

    if (error) {
      throw new Error(
        error.message
      )
    }
  }

  revalidatePath(
    `/admin/campaigns/${campaignId}/edit`
  )
}

async function normalizeGalleryOrder(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  campaignId: string
) {
  const {
    data,
    error,
  } = await supabase
    .from('campaign_media')
    .select('id')
    .eq(
      'campaign_id',
      campaignId
    )
    .order('sort_order', {
      ascending: true,
    })

  if (error || !data) {
    return
  }

  for (
    let index = 0;
    index < data.length;
    index++
  ) {
    await supabase
      .from('campaign_media')
      .update({
        sort_order: index,
      })
      .eq(
        'id',
        data[index].id
      )
  }
}