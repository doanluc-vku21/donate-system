'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createFundItem(
  campaignId: string,
  formData: FormData
) {
  const supabase = await createClient()

  const title = String(
    formData.get('title') || ''
  ).trim()

  const description = String(
    formData.get('description') || ''
  ).trim()

  const amountRaw = String(
    formData.get('amount') || ''
  ).trim()

  const amount = Number(amountRaw)

  if (!title) {
    throw new Error('Title is required.')
  }

  if (
    !amountRaw ||
    Number.isNaN(amount) ||
    amount < 0
  ) {
    throw new Error('Invalid amount.')
  }

  const amountCents =
    Math.round(amount * 100)

  const { data: lastItem } =
    await supabase
      .from('campaign_fund_items')
      .select('sort_order')
      .eq('campaign_id', campaignId)
      .order('sort_order', {
        ascending: false,
      })
      .limit(1)
      .maybeSingle()

  const sortOrder =
    typeof lastItem?.sort_order === 'number'
      ? lastItem.sort_order + 1
      : 0

  const { error } = await supabase
    .from('campaign_fund_items')
    .insert({
      campaign_id: campaignId,
      title,
      description:
        description || null,
      amount_cents:
        amountCents,
      sort_order:
        sortOrder,
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(
    `/admin/campaigns/${campaignId}/edit`
  )
}

export async function updateFundItem(
  campaignId: string,
  fundItemId: string,
  formData: FormData
) {
  const supabase = await createClient()

  const title = String(
    formData.get('title') || ''
  ).trim()

  const description = String(
    formData.get('description') || ''
  ).trim()

  const amountRaw = String(
    formData.get('amount') || ''
  ).trim()

  const amount = Number(amountRaw)

  if (!title) {
    throw new Error('Title is required.')
  }

  if (
    !amountRaw ||
    Number.isNaN(amount) ||
    amount < 0
  ) {
    throw new Error('Invalid amount.')
  }

  const { error } = await supabase
    .from('campaign_fund_items')
    .update({
      title,

      description:
        description || null,

      amount_cents:
        Math.round(amount * 100),

      updated_at:
        new Date().toISOString(),
    })
    .eq('id', fundItemId)
    .eq(
      'campaign_id',
      campaignId
    )

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(
    `/admin/campaigns/${campaignId}/edit`
  )
}

export async function deleteFundItem(
  campaignId: string,
  fundItemId: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('campaign_fund_items')
    .delete()
    .eq('id', fundItemId)
    .eq(
      'campaign_id',
      campaignId
    )

  if (error) {
    throw new Error(error.message)
  }

  await normalizeFundOrder(
    campaignId
  )

  revalidatePath(
    `/admin/campaigns/${campaignId}/edit`
  )
}

export async function reorderFundItems(
  campaignId: string,
  ids: string[]
) {
  const supabase = await createClient()

  for (
    let index = 0;
    index < ids.length;
    index++
  ) {
    const { error } = await supabase
      .from('campaign_fund_items')
      .update({
        sort_order: index,
      })
      .eq('id', ids[index])
      .eq(
        'campaign_id',
        campaignId
      )

    if (error) {
      throw new Error(error.message)
    }
  }

  revalidatePath(
    `/admin/campaigns/${campaignId}/edit`
  )
}

async function normalizeFundOrder(
  campaignId: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaign_fund_items')
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
      .from('campaign_fund_items')
      .update({
        sort_order: index,
      })
      .eq(
        'id',
        data[index].id
      )
  }
}