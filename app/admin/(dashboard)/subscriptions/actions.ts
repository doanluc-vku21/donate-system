'use server'

import {
  revalidatePath,
} from 'next/cache'

import {
  createClient,
} from '@/lib/supabase/server'

import {
  supabaseAdmin,
} from '@/lib/supabase/admin'

import {
  stripe,
} from '@/lib/stripe'

import {
  syncMonthlySubscription,
} from '@/lib/subscriptions'

async function requireAdmin() {
  const supabase =
    await createClient()

  const {
    data: {
      user,
    },
  } =
    await supabase.auth
      .getUser()

  if (!user) {
    throw new Error(
      'Unauthorized.'
    )
  }

  return user
}

export async function scheduleSubscriptionCancellation(
  subscriptionId: string
) {
  await requireAdmin()

  if (!subscriptionId) {
    throw new Error(
      'Missing subscription ID.'
    )
  }

  const subscription =
    await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end:
          true,
      }
    )

  await syncMonthlySubscription(
    subscription
  )

  revalidatePath(
    '/admin/subscriptions'
  )
}

export async function resumeSubscription(
  subscriptionId: string
) {
  await requireAdmin()

  if (!subscriptionId) {
    throw new Error(
      'Missing subscription ID.'
    )
  }

  const subscription =
    await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end:
          false,
      }
    )

  await syncMonthlySubscription(
    subscription
  )

  revalidatePath(
    '/admin/subscriptions'
  )
}

export async function syncSubscriptionFromStripe(
  subscriptionId: string
) {
  await requireAdmin()

  const subscription =
    await stripe.subscriptions.retrieve(
      subscriptionId
    )

  await syncMonthlySubscription(
    subscription
  )

  revalidatePath(
    '/admin/subscriptions'
  )
}

export async function syncExistingMonthlySubscriptions() {
  await requireAdmin()

  let startingAfter:
    | string
    | undefined

  while (true) {
    const list =
      await stripe.subscriptions.list({
        limit: 100,

        status: 'all',

        ...(startingAfter
          ? {
              starting_after:
                startingAfter,
            }
          : {}),
      })

    for (
      const subscription of
        list.data
    ) {
      if (
        subscription.metadata
          ?.frequency ===
        'monthly'
      ) {
        await syncMonthlySubscription(
          subscription
        )
      }
    }

    if (
      !list.has_more ||
      list.data.length ===
        0
    ) {
      break
    }

    startingAfter =
      list.data[
        list.data.length -
          1
      ].id
  }

  revalidatePath(
    '/admin/subscriptions'
  )
}