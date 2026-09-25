'use server'

import {
  revalidatePath,
} from 'next/cache'

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

function slugify(
  value: string
) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function uploadImage(
  file: File | null,
  oldPath?: string | null
) {
  if (
    !file ||
    file.size === 0
  ) {
    return null
  }

  const supabase =
    await createClient()

  const extension =
    file.name
      .split('.')
      .pop()
      ?.toLowerCase() ||
    'jpg'

  const path =
    `news/${crypto.randomUUID()}.${extension}`

  const {
    error,
  } = await supabase.storage
    .from('blog-media')
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
    .from('blog-media')
    .getPublicUrl(path)

  if (oldPath) {
    await supabase.storage
      .from('blog-media')
      .remove([
        oldPath,
      ])
  }

  return {
    url:
      data.publicUrl,
    path,
  }
}

export async function createNews(
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
      '/admin/news/new?error=title'
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

  const category =
    String(
      formData.get(
        'category'
      ) || ''
    ).trim()

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

  const file =
    formData.get(
      'image'
    )

  const image =
    file instanceof File
      ? await uploadImage(
          file
        )
      : null

  const {
    error,
  } = await supabase
    .from('blog_posts')
    .insert({
      title,
      slug,
      category:
        category ||
        null,

      excerpt:
        excerpt ||
        null,

      content:
        content ||
        null,

      featured_image_url:
        image?.url ||
        null,

      featured_image_path:
        image?.path ||
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

  if (error) {
    redirect(
      `/admin/news/new?error=${encodeURIComponent(
        error.message
      )}`
    )
  }

  revalidatePath(
    '/admin/news'
  )

  revalidatePath(
    '/news'
  )

  redirect(
    '/admin/news'
  )
}

export async function updateNews(
  id: string,
  formData: FormData
) {
  const supabase =
    await createClient()

  const {
    data: current,
  } = await supabase
    .from('blog_posts')
    .select(`
      featured_image_path,
      featured_image_url,
      published_at
    `)
    .eq(
      'id',
      id
    )
    .single()

  if (!current) {
    redirect(
      '/admin/news'
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

  const status =
    formData.get(
      'status'
    ) === 'published'
      ? 'published'
      : 'draft'

  const file =
    formData.get(
      'image'
    )

  const image =
    file instanceof File &&
    file.size > 0
      ? await uploadImage(
          file,
          current.featured_image_path
        )
      : null

  const {
    error,
  } = await supabase
    .from('blog_posts')
    .update({
      title,
      slug,

      category:
        String(
          formData.get(
            'category'
          ) || ''
        ).trim() ||
        null,

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

      featured_image_url:
        image?.url ??
        current.featured_image_url,

      featured_image_path:
        image?.path ??
        current.featured_image_path,

      status,

      is_featured:
        formData.get(
          'is_featured'
        ) === 'on',

      published_at:
        status ===
        'published'
          ? current.published_at ||
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
      `/admin/news/${id}/edit?error=${encodeURIComponent(
        error.message
      )}`
    )
  }

  revalidatePath(
    '/news'
  )

  revalidatePath(
    `/news/${slug}`
  )

  revalidatePath(
    '/admin/news'
  )

  redirect(
    '/admin/news'
  )
}

export async function deleteNews(
  id: string
) {
  const supabase =
    await createClient()

  const {
    data,
  } = await supabase
    .from('blog_posts')
    .select(`
      slug,
      featured_image_path
    `)
    .eq(
      'id',
      id
    )
    .single()

  if (
    data?.featured_image_path
  ) {
    await supabase.storage
      .from('blog-media')
      .remove([
        data.featured_image_path,
      ])
  }

  await supabase
    .from('blog_posts')
    .delete()
    .eq(
      'id',
      id
    )

  revalidatePath(
    '/admin/news'
  )

  revalidatePath(
    '/news'
  )

  if (data?.slug) {
    revalidatePath(
      `/news/${data.slug}`
    )
  }

  redirect(
    '/admin/news'
  )
}