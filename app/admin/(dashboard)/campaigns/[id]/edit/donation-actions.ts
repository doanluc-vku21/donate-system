'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveDonationSettings(
  campaignId: string,
  formData: FormData
) {
  const supabase = await createClient()

  const enableOneTime =
    formData.get('enable_one_time') === 'true'

  const enableMonthly =
    formData.get('enable_monthly') === 'true'

  const allowCustomAmount =
    formData.get('allow_custom_amount') === 'true'

  const allowAnonymous =
    formData.get('allow_anonymous') === 'true'

  const allowCoverFee =
    formData.get('allow_cover_fee') === 'true'

  const minimumRaw = String(
    formData.get('minimum_amount') || ''
  ).trim()

  const defaultFrequency = String(
    formData.get('default_frequency') || 'one_time'
  )

  const minimumAmount = Number(minimumRaw)

  if (
    !minimumRaw ||
    Number.isNaN(minimumAmount) ||
    minimumAmount < 0
  ) {
    throw new Error(
      'Please enter a valid minimum donation amount.'
    )
  }

  if (
    !['one_time', 'monthly'].includes(
      defaultFrequency
    )
  ) {
    throw new Error(
      'Invalid default donation frequency.'
    )
  }

  if (
    !enableOneTime &&
    !enableMonthly
  ) {
    throw new Error(
      'At least one donation frequency must be enabled.'
    )
  }

  let safeDefaultFrequency =
    defaultFrequency

  if (
    safeDefaultFrequency === 'one_time' &&
    !enableOneTime
  ) {
    safeDefaultFrequency =
      'monthly'
  }

  if (
    safeDefaultFrequency === 'monthly' &&
    !enableMonthly
  ) {
    safeDefaultFrequency =
      'one_time'
  }

  const { error } = await supabase
    .from('campaign_donation_settings')
    .upsert(
      {
        campaign_id:
          campaignId,

        enable_one_time:
          enableOneTime,

        enable_monthly:
          enableMonthly,

        allow_custom_amount:
          allowCustomAmount,

        allow_anonymous:
          allowAnonymous,

        allow_cover_fee:
          allowCoverFee,

        minimum_amount_cents:
          Math.round(
            minimumAmount * 100
          ),

        default_frequency:
          safeDefaultFrequency,

        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          'campaign_id',
      }
    )

  if (error) {
    throw new Error(
      error.message
    )
  }

  revalidatePath(
    `/admin/campaigns/${campaignId}/edit`
  )
}

export async function createDonationOption(
  campaignId: string,
  formData: FormData
) {
  const supabase = await createClient()

  const amountRaw = String(
    formData.get('amount') || ''
  ).trim()

  const label = String(
    formData.get('label') || ''
  ).trim()

  const isActive =
    formData.get('is_active') === 'true'

  const isDefault =
    formData.get('is_default') === 'true'

  const amount =
    Number(amountRaw)

  if (
    !amountRaw ||
    Number.isNaN(amount) ||
    amount <= 0
  ) {
    throw new Error(
      'Please enter a valid donation amount.'
    )
  }

  const amountCents =
    Math.round(amount * 100)

  const { data: lastOption } =
    await supabase
      .from(
        'campaign_donation_options'
      )
      .select('sort_order')
      .eq(
        'campaign_id',
        campaignId
      )
      .order('sort_order', {
        ascending: false,
      })
      .limit(1)
      .maybeSingle()

  const sortOrder =
    typeof lastOption?.sort_order ===
    'number'
      ? lastOption.sort_order + 1
      : 0

  if (isDefault) {
    await supabase
      .from(
        'campaign_donation_options'
      )
      .update({
        is_default: false,
      })
      .eq(
        'campaign_id',
        campaignId
      )
  }

  const { error } = await supabase
    .from(
      'campaign_donation_options'
    )
    .insert({
      campaign_id:
        campaignId,

      amount_cents:
        amountCents,

      label:
        label || null,

      is_active:
        isActive,

      is_default:
        isDefault,

      sort_order:
        sortOrder,
    })

  if (error) {
    if (
      error.code === '23505'
    ) {
      throw new Error(
        'This donation amount already exists.'
      )
    }

    throw new Error(
      error.message
    )
  }

  revalidatePath(
    `/admin/campaigns/${campaignId}/edit`
  )
}

export async function updateDonationOption(
  campaignId: string,
  optionId: string,
  formData: FormData
) {
  const supabase = await createClient()

  const amountRaw = String(
    formData.get('amount') || ''
  ).trim()

  const label = String(
    formData.get('label') || ''
  ).trim()

  const isActive =
    formData.get('is_active') === 'true'

  const isDefault =
    formData.get('is_default') === 'true'

  const amount =
    Number(amountRaw)

  if (
    !amountRaw ||
    Number.isNaN(amount) ||
    amount <= 0
  ) {
    throw new Error(
      'Please enter a valid donation amount.'
    )
  }

  if (isDefault) {
    await supabase
      .from(
        'campaign_donation_options'
      )
      .update({
        is_default: false,
      })
      .eq(
        'campaign_id',
        campaignId
      )
      .neq(
        'id',
        optionId
      )
  }

  const { error } = await supabase
    .from(
      'campaign_donation_options'
    )
    .update({
      amount_cents:
        Math.round(
          amount * 100
        ),

      label:
        label || null,

      is_active:
        isActive,

      is_default:
        isDefault,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      'id',
      optionId
    )
    .eq(
      'campaign_id',
      campaignId
    )

  if (error) {
    if (
      error.code === '23505'
    ) {
      throw new Error(
        'This donation amount already exists.'
      )
    }

    throw new Error(
      error.message
    )
  }

  revalidatePath(
    `/admin/campaigns/${campaignId}/edit`
  )
}

export async function deleteDonationOption(
  campaignId: string,
  optionId: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from(
      'campaign_donation_options'
    )
    .delete()
    .eq(
      'id',
      optionId
    )
    .eq(
      'campaign_id',
      campaignId
    )

  if (error) {
    throw new Error(
      error.message
    )
  }

  await normalizeDonationOptions(
    campaignId
  )

  revalidatePath(
    `/admin/campaigns/${campaignId}/edit`
  )
}

export async function reorderDonationOptions(
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
      .from(
        'campaign_donation_options'
      )
      .update({
        sort_order:
          index,
      })
      .eq(
        'id',
        ids[index]
      )
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

async function normalizeDonationOptions(
  campaignId: string
) {
  const supabase = await createClient()

  const { data, error } =
    await supabase
      .from(
        'campaign_donation_options'
      )
      .select('id')
      .eq(
        'campaign_id',
        campaignId
      )
      .order('sort_order', {
        ascending: true,
      })

  if (
    error ||
    !data
  ) {
    return
  }

  for (
    let index = 0;
    index < data.length;
    index++
  ) {
    await supabase
      .from(
        'campaign_donation_options'
      )
      .update({
        sort_order:
          index,
      })
      .eq(
        'id',
        data[index].id
      )
  }
}