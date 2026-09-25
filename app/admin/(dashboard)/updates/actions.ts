'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

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

async function uploadFile(
  file: File,
  folder: string
) {
  const supabase =
    await createClient()

  const extension =
    file.name
      .split('.')
      .pop()
      ?.toLowerCase() ||
    'jpg'

  const path =
    `${folder}/${crypto.randomUUID()}.${extension}`

  const {
    error,
  } = await supabase.storage
    .from('update-media')
    .upload(
      path,
      file,
      {
        cacheControl:
          '31536000',
        upsert: false,
      }
    )

  if (error) {
    throw new Error(
      error.message
    )
  }

  const {
    data,
  } = supabase.storage
    .from('update-media')
    .getPublicUrl(path)

  return {
    path,
    url: data.publicUrl,
  }
}

async function deleteFile(
  path: string | null
) {
  if (!path) {
    return
  }

  const supabase =
    await createClient()

  await supabase.storage
    .from('update-media')
    .remove([path])
}

export async function createSiteUpdate(
  formData: FormData
) {
  const supabase =
    await createClient()

  const title =
    String(
      formData.get(
        'title'
      ) || ''
    ).trim()

  if (!title) {
    redirect(
      '/admin/updates/new?error=title'
    )
  }

  const enteredSlug =
    String(
      formData.get(
        'slug'
      ) || ''
    ).trim()

  const slug =
    slugify(
      enteredSlug ||
        title
    )

  if (!slug) {
    redirect(
      '/admin/updates/new?error=slug'
    )
  }

  const campaignId =
    String(
      formData.get(
        'campaign_id'
      ) || ''
    ).trim()

  const updateType =
    String(
      formData.get(
        'update_type'
      ) ||
        'campaign_progress'
    )

  const excerpt =
    String(
      formData.get(
        'excerpt'
      ) || ''
    ).trim()

  const content =
    String(
      formData.get(
        'content'
      ) || ''
    ).trim()

  const status =
    formData.get(
      'status'
    ) === 'published'
      ? 'published'
      : 'draft'

  const isFeatured =
    formData.get(
      'is_featured'
    ) === 'on'

  let cover:
    | {
        path: string
        url: string
      }
    | null = null

  const coverFile =
    formData.get(
      'cover_image'
    )

  if (
    coverFile instanceof File &&
    coverFile.size > 0
  ) {
    cover =
      await uploadFile(
        coverFile,
        'covers'
      )
  }

  const {
    data: update,
    error,
  } = await supabase
    .from('site_updates')
    .insert({
      campaign_id:
        campaignId ||
        null,

      title,
      slug,

      update_type:
        updateType,

      excerpt:
        excerpt ||
        null,

      content:
        content ||
        null,

      cover_image_url:
        cover?.url ||
        null,

      cover_image_path:
        cover?.path ||
        null,

      status,

      is_featured:
        isFeatured,

      published_at:
        status ===
        'published'
          ? new Date().toISOString()
          : null,
    })
    .select('id')
    .single()

  if (
    error ||
    !update
  ) {
    if (cover?.path) {
      await deleteFile(
        cover.path
      )
    }

    redirect(
      `/admin/updates/new?error=${encodeURIComponent(
        error?.message ||
          'Failed to create update.'
      )}`
    )
  }

  const galleryFiles =
    formData
      .getAll(
        'gallery'
      )
      .filter(
        (
          item
        ): item is File =>
          item instanceof
            File &&
          item.size > 0
      )

  const uploadedGallery: {
    path: string
    url: string
  }[] = []

  try {
    for (
      let index = 0;
      index <
      galleryFiles.length;
      index++
    ) {
      const uploaded =
        await uploadFile(
          galleryFiles[
            index
          ],
          `gallery/${update.id}`
        )

      uploadedGallery.push(
        uploaded
      )

      const {
        error:
          mediaError,
      } =
        await supabase
          .from(
            'site_update_media'
          )
          .insert({
            update_id:
              update.id,

            media_url:
              uploaded.url,

            storage_path:
              uploaded.path,

            sort_order:
              index,
          })

      if (mediaError) {
        throw mediaError
      }
    }
  } catch (error) {
    console.error(
      'Gallery upload error:',
      error
    )
  }

  revalidatePath(
    '/admin/updates'
  )

  revalidatePath(
    '/updates'
  )

  redirect(
    '/admin/updates'
  )
}

export async function updateSiteUpdate(
  id: string,
  formData: FormData
) {
  const supabase =
    await createClient()

  const {
    data: existing,
  } = await supabase
    .from('site_updates')
    .select(`
      slug,
      cover_image_url,
      cover_image_path,
      published_at
    `)
    .eq(
      'id',
      id
    )
    .single()

  if (!existing) {
    redirect(
      '/admin/updates'
    )
  }

  const title =
    String(
      formData.get(
        'title'
      ) || ''
    ).trim()

  const slug =
    slugify(
      String(
        formData.get(
          'slug'
        ) ||
          title
      )
    )

  const campaignId =
    String(
      formData.get(
        'campaign_id'
      ) || ''
    ).trim()

  const status =
    formData.get(
      'status'
    ) === 'published'
      ? 'published'
      : 'draft'

  let coverUrl =
    existing.cover_image_url

  let coverPath =
    existing.cover_image_path

  const coverFile =
    formData.get(
      'cover_image'
    )

  if (
    coverFile instanceof File &&
    coverFile.size > 0
  ) {
    const uploaded =
      await uploadFile(
        coverFile,
        'covers'
      )

    const oldPath =
      coverPath

    coverUrl =
      uploaded.url

    coverPath =
      uploaded.path

    if (oldPath) {
      await deleteFile(
        oldPath
      )
    }
  }

  const {
    error,
  } = await supabase
    .from('site_updates')
    .update({
      campaign_id:
        campaignId ||
        null,

      title,
      slug,

      update_type:
        String(
          formData.get(
            'update_type'
          ) ||
            'general'
        ),

      excerpt:
        String(
          formData.get(
            'excerpt'
          ) || ''
        ).trim() ||
        null,

      content:
        String(
          formData.get(
            'content'
          ) || ''
        ).trim() ||
        null,

      cover_image_url:
        coverUrl,

      cover_image_path:
        coverPath,

      status,

      is_featured:
        formData.get(
          'is_featured'
        ) === 'on',

      published_at:
        status ===
        'published'
          ? existing.published_at ||
            new Date().toISOString()
          : null,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      'id',
      id
    )

  if (error) {
    redirect(
      `/admin/updates/${id}/edit?error=${encodeURIComponent(
        error.message
      )}`
    )
  }

  const galleryFiles =
    formData
      .getAll(
        'gallery'
      )
      .filter(
        (
          item
        ): item is File =>
          item instanceof
            File &&
          item.size > 0
      )

  if (
    galleryFiles.length >
    0
  ) {
    const {
      count,
    } =
      await supabase
        .from(
          'site_update_media'
        )
        .select('*', {
          count: 'exact',
          head: true,
        })
        .eq(
          'update_id',
          id
        )

    const startIndex =
      count ?? 0

    for (
      let index = 0;
      index <
      galleryFiles.length;
      index++
    ) {
      const uploaded =
        await uploadFile(
          galleryFiles[
            index
          ],
          `gallery/${id}`
        )

      await supabase
        .from(
          'site_update_media'
        )
        .insert({
          update_id: id,

          media_url:
            uploaded.url,

          storage_path:
            uploaded.path,

          sort_order:
            startIndex +
            index,
        })
    }
  }

  revalidatePath(
    '/admin/updates'
  )

  revalidatePath(
    '/updates'
  )

  revalidatePath(
    `/updates/${existing.slug}`
  )

  revalidatePath(
    `/updates/${slug}`
  )

  redirect(
    `/admin/updates/${id}/edit`
  )
}

export async function deleteUpdateMedia(
  updateId: string,
  mediaId: string
) {
  const supabase =
    await createClient()

  const {
    data: media,
  } = await supabase
    .from(
      'site_update_media'
    )
    .select(`
      storage_path
    `)
    .eq(
      'id',
      mediaId
    )
    .eq(
      'update_id',
      updateId
    )
    .single()

  if (!media) {
    return
  }

  await supabase
    .from(
      'site_update_media'
    )
    .delete()
    .eq(
      'id',
      mediaId
    )

  await deleteFile(
    media.storage_path
  )

  revalidatePath(
    `/admin/updates/${updateId}/edit`
  )

  revalidatePath(
    '/updates'
  )
}

export async function deleteSiteUpdate(
  id: string
) {
  const supabase =
    await createClient()

  const {
    data: update,
  } = await supabase
    .from('site_updates')
    .select(`
      slug,
      cover_image_path
    `)
    .eq(
      'id',
      id
    )
    .single()

  const {
    data: media,
  } = await supabase
    .from(
      'site_update_media'
    )
    .select(`
      storage_path
    `)
    .eq(
      'update_id',
      id
    )

  await supabase
    .from('site_updates')
    .delete()
    .eq(
      'id',
      id
    )

  const paths = [
    update?.cover_image_path,
    ...(media ?? []).map(
      (item) =>
        item.storage_path
    ),
  ].filter(
    (
      path
    ): path is string =>
      Boolean(path)
  )

  if (
    paths.length >
    0
  ) {
    await supabase.storage
      .from('update-media')
      .remove(paths)
  }

  revalidatePath(
    '/admin/updates'
  )

  revalidatePath(
    '/updates'
  )

  if (update?.slug) {
    revalidatePath(
      `/updates/${update.slug}`
    )
  }

  redirect(
    '/admin/updates'
  )
}