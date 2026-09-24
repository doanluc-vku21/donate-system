import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'campaign-media'

function getExtension(fileName: string) {
  const extension = fileName
    .split('.')
    .pop()
    ?.toLowerCase()

  return extension || 'jpg'
}

export async function uploadCampaignImage(
  supabase: SupabaseClient,
  campaignId: string,
  file: File,
  folder: 'featured' | 'gallery' | 'updates'
) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed.')
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image must be smaller than 10MB.')
  }

  const extension = getExtension(file.name)

  const fileName = `${crypto.randomUUID()}.${extension}`

  const storagePath = `${campaignId}/${folder}/${fileName}`

  const arrayBuffer = await file.arrayBuffer()

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath)

  return {
    url: data.publicUrl,
    path: storagePath,
  }
}

export async function deleteCampaignImage(
  supabase: SupabaseClient,
  storagePath: string
) {
  if (!storagePath) {
    return
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath])

  if (error) {
    throw new Error(error.message)
  }
}