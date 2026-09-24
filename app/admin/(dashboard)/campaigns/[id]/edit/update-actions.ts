'use server'

import { createClient } from '@/lib/supabase/server'
import {
  deleteCampaignImage,
  uploadCampaignImage,
} from '@/lib/campaign-media'
import { revalidatePath } from 'next/cache'

export async function createCampaignUpdate(
  campaignId: string,
  formData: FormData
) {
  const supabase = await createClient()

  const title = String(
    formData.get('title') || ''
  ).trim()

  const content = String(
    formData.get('content') || ''
  ).trim()

  const status = String(
    formData.get('status') || 'draft'
  ).trim()

  const image =
    formData.get('image')

  if (!title) {
    throw new Error(
      'Update title is required.'
    )
  }

  if (
    !['draft', 'published'].includes(
      status
    )
  ) {
    throw new Error(
      'Invalid update status.'
    )
  }

  let imageUrl: string | null =
    null

  let imagePath: string | null =
    null

  // Upload image trước
  if (
    image instanceof File &&
    image.size > 0
  ) {
    const uploaded =
      await uploadCampaignImage(
        supabase,
        campaignId,
        image,
        'updates'
      )

    imageUrl =
      uploaded.url

    imagePath =
      uploaded.path
  }

  const publishedAt =
    status === 'published'
      ? new Date().toISOString()
      : null

  const { error } = await supabase
    .from('campaign_updates')
    .insert({
      campaign_id:
        campaignId,

      title,

      content:
        content || null,

      image_url:
        imageUrl,

      image_path:
        imagePath,

      status,

      published_at:
        publishedAt,
    })

  if (error) {
    // Nếu DB insert fail
    // thì xóa ảnh vừa upload
    if (imagePath) {
      try {
        await deleteCampaignImage(
          supabase,
          imagePath
        )
      } catch {}
    }

    throw new Error(
      error.message
    )
  }

  revalidatePath(
    `/admin/campaigns/${campaignId}/edit`
  )
}

export async function updateCampaignUpdate(
  campaignId: string,
  updateId: string,
  formData: FormData
) {
  const supabase = await createClient()

  const title = String(
    formData.get('title') || ''
  ).trim()

  const content = String(
    formData.get('content') || ''
  ).trim()

  const status = String(
    formData.get('status') || 'draft'
  ).trim()

  const image =
    formData.get('image')

  if (!title) {
    throw new Error(
      'Update title is required.'
    )
  }

  if (
    !['draft', 'published'].includes(
      status
    )
  ) {
    throw new Error(
      'Invalid update status.'
    )
  }

  const {
    data: existing,
    error: existingError,
  } = await supabase
    .from('campaign_updates')
    .select(`
      id,
      status,
      published_at,
      image_url,
      image_path
    `)
    .eq('id', updateId)
    .eq(
      'campaign_id',
      campaignId
    )
    .single()

  if (
    existingError ||
    !existing
  ) {
    throw new Error(
      'Campaign update not found.'
    )
  }

  let imageUrl =
    existing.image_url

  let imagePath =
    existing.image_path

  let uploadedNewPath:
    | string
    | null = null

  // New image
  if (
    image instanceof File &&
    image.size > 0
  ) {
    const uploaded =
      await uploadCampaignImage(
        supabase,
        campaignId,
        image,
        'updates'
      )

    imageUrl =
      uploaded.url

    imagePath =
      uploaded.path

    uploadedNewPath =
      uploaded.path
  }

  let publishedAt =
    existing.published_at

  if (
    status === 'published' &&
    !publishedAt
  ) {
    publishedAt =
      new Date().toISOString()
  }

  if (status === 'draft') {
    publishedAt = null
  }

  const { error } = await supabase
    .from('campaign_updates')
    .update({
      title,

      content:
        content || null,

      image_url:
        imageUrl,

      image_path:
        imagePath,

      status,

      published_at:
        publishedAt,

      updated_at:
        new Date().toISOString(),
    })
    .eq('id', updateId)
    .eq(
      'campaign_id',
      campaignId
    )

  if (error) {
    if (uploadedNewPath) {
      try {
        await deleteCampaignImage(
          supabase,
          uploadedNewPath
        )
      } catch {}
    }

    throw new Error(
      error.message
    )
  }

  // Nếu thay ảnh thành công
  // xóa ảnh cũ
  if (
    uploadedNewPath &&
    existing.image_path &&
    existing.image_path !==
      uploadedNewPath
  ) {
    try {
      await deleteCampaignImage(
        supabase,
        existing.image_path
      )
    } catch (error) {
      console.error(
        'Failed to delete old update image:',
        error
      )
    }
  }

  revalidatePath(
    `/admin/campaigns/${campaignId}/edit`
  )
}

export async function deleteCampaignUpdate(
  campaignId: string,
  updateId: string
) {
  const supabase = await createClient()

  const {
    data: update,
    error,
  } = await supabase
    .from('campaign_updates')
    .select(`
      id,
      image_path
    `)
    .eq('id', updateId)
    .eq(
      'campaign_id',
      campaignId
    )
    .single()

  if (
    error ||
    !update
  ) {
    throw new Error(
      'Campaign update not found.'
    )
  }

  const { error: deleteError } =
    await supabase
      .from('campaign_updates')
      .delete()
      .eq('id', updateId)
      .eq(
        'campaign_id',
        campaignId
      )

  if (deleteError) {
    throw new Error(
      deleteError.message
    )
  }

  if (update.image_path) {
    try {
      await deleteCampaignImage(
        supabase,
        update.image_path
      )
    } catch (error) {
      console.error(
        'Failed to delete update image:',
        error
      )
    }
  }

  revalidatePath(
    `/admin/campaigns/${campaignId}/edit`
  )
}

export async function deleteCampaignUpdateImage(
  campaignId: string,
  updateId: string
) {
  const supabase = await createClient()

  const {
    data: update,
    error,
  } = await supabase
    .from('campaign_updates')
    .select(`
      id,
      image_path
    `)
    .eq('id', updateId)
    .eq(
      'campaign_id',
      campaignId
    )
    .single()

  if (
    error ||
    !update
  ) {
    throw new Error(
      'Campaign update not found.'
    )
  }

  if (update.image_path) {
    await deleteCampaignImage(
      supabase,
      update.image_path
    )
  }

  const { error: updateError } =
    await supabase
      .from('campaign_updates')
      .update({
        image_url: null,
        image_path: null,

        updated_at:
          new Date().toISOString(),
      })
      .eq('id', updateId)
      .eq(
        'campaign_id',
        campaignId
      )

  if (updateError) {
    throw new Error(
      updateError.message
    )
  }

  revalidatePath(
    `/admin/campaigns/${campaignId}/edit`
  )
}

export async function toggleCampaignUpdateStatus(
  campaignId: string,
  updateId: string
) {
  const supabase = await createClient()

  const {
    data: update,
    error,
  } = await supabase
    .from('campaign_updates')
    .select(`
      id,
      status,
      published_at
    `)
    .eq('id', updateId)
    .eq(
      'campaign_id',
      campaignId
    )
    .single()

  if (
    error ||
    !update
  ) {
    throw new Error(
      'Campaign update not found.'
    )
  }

  const nextStatus =
    update.status ===
    'published'
      ? 'draft'
      : 'published'

  const publishedAt =
    nextStatus ===
    'published'
      ? update.published_at ??
        new Date().toISOString()
      : null

  const { error: updateError } =
    await supabase
      .from('campaign_updates')
      .update({
        status:
          nextStatus,

        published_at:
          publishedAt,

        updated_at:
          new Date().toISOString(),
      })
      .eq('id', updateId)
      .eq(
        'campaign_id',
        campaignId
      )

  if (updateError) {
    throw new Error(
      updateError.message
    )
  }

  revalidatePath(
    `/admin/campaigns/${campaignId}/edit`
  )
}