'use server'

import {
  revalidatePath,
} from 'next/cache'

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function createFaq(
  formData: FormData
) {
  const supabase =
    await createClient()

  const question =
    String(
      formData.get(
        'question'
      ) || ''
    ).trim()

  const answer =
    String(
      formData.get(
        'answer'
      ) || ''
    ).trim()

  if (!question) {
    redirect(
      '/admin/faq/new?error=question'
    )
  }

  if (!answer) {
    redirect(
      '/admin/faq/new?error=answer'
    )
  }

  const category =
    String(
      formData.get(
        'category'
      ) || ''
    ).trim()

  const sortOrder =
    Number(
      formData.get(
        'sort_order'
      ) || 0
    )

  const status =
    formData.get(
      'status'
    ) === 'draft'
      ? 'draft'
      : 'published'

  const {
    error,
  } = await supabase
    .from('faqs')
    .insert({
      question,
      answer,

      category:
        category || null,

      sort_order:
        Number.isFinite(
          sortOrder
        )
          ? sortOrder
          : 0,

      status,
    })

  if (error) {
    redirect(
      `/admin/faq/new?error=${encodeURIComponent(
        error.message
      )}`
    )
  }

  revalidatePath(
    '/admin/faq'
  )

  revalidatePath(
    '/faq'
  )

  redirect(
    '/admin/faq'
  )
}

export async function updateFaq(
  id: string,
  formData: FormData
) {
  const supabase =
    await createClient()

  const question =
    String(
      formData.get(
        'question'
      ) || ''
    ).trim()

  const answer =
    String(
      formData.get(
        'answer'
      ) || ''
    ).trim()

  if (!question) {
    redirect(
      `/admin/faq/${id}/edit?error=question`
    )
  }

  if (!answer) {
    redirect(
      `/admin/faq/${id}/edit?error=answer`
    )
  }

  const category =
    String(
      formData.get(
        'category'
      ) || ''
    ).trim()

  const sortOrder =
    Number(
      formData.get(
        'sort_order'
      ) || 0
    )

  const status =
    formData.get(
      'status'
    ) === 'draft'
      ? 'draft'
      : 'published'

  const {
    error,
  } = await supabase
    .from('faqs')
    .update({
      question,
      answer,

      category:
        category || null,

      sort_order:
        Number.isFinite(
          sortOrder
        )
          ? sortOrder
          : 0,

      status,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      'id',
      id
    )

  if (error) {
    redirect(
      `/admin/faq/${id}/edit?error=${encodeURIComponent(
        error.message
      )}`
    )
  }

  revalidatePath(
    '/admin/faq'
  )

  revalidatePath(
    '/faq'
  )

  redirect(
    '/admin/faq'
  )
}

export async function deleteFaq(
  id: string
) {
  const supabase =
    await createClient()

  await supabase
    .from('faqs')
    .delete()
    .eq(
      'id',
      id
    )

  revalidatePath(
    '/admin/faq'
  )

  revalidatePath(
    '/faq'
  )

  redirect(
    '/admin/faq'
  )
}