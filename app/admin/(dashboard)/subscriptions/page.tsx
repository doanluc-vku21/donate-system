import Link from 'next/link'

import {
  createClient,
} from '@/lib/supabase/server'

import {
  resumeSubscription,
  scheduleSubscriptionCancellation,
  syncExistingMonthlySubscriptions,
  syncSubscriptionFromStripe,
} from './actions'

type Campaign = {
  id: string
  title: string
  slug: string
}

type Donor = {
  id: string
  email: string

  first_name:
    | string
    | null

  last_name:
    | string
    | null
}

type Subscription = {
  id: string

  stripe_subscription_id:
    string

  stripe_customer_id:
    | string
    | null

  status: string

  currency: string

  amount_cents: number
  fee_amount_cents: number
  total_amount_cents: number

  cancel_at_period_end:
    boolean

  current_period_start:
    | string
    | null

  current_period_end:
    | string
    | null

  canceled_at:
    | string
    | null

  last_payment_failed_at:
    | string
    | null

  last_failed_invoice_id:
    | string
    | null

  next_payment_attempt:
    | string
    | null

  created_at:
    string

  campaign:
    | Campaign
    | Campaign[]
    | null

  donor:
    | Donor
    | Donor[]
    | null
}

function relation<T>(
  value:
    | T
    | T[]
    | null
) {
  if (!value) {
    return null
  }

  return Array.isArray(
    value
  )
    ? value[0] ??
        null
    : value
}

function money(
  cents: number,
  currency: string
) {
  return new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency,
    }
  ).format(
    cents / 100
  )
}

function date(
  value:
    | string
    | null
) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  ).format(
    new Date(value)
  )
}

function dateTime(
  value:
    | string
    | null
) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }
  ).format(
    new Date(value)
  )
}

function StatusBadge({
  status,
  cancelAtPeriodEnd,
}: {
  status: string
  cancelAtPeriodEnd:
    boolean
}) {
  if (
    cancelAtPeriodEnd &&
    status !==
      'canceled'
  ) {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        Canceling
      </span>
    )
  }

  const style:
    Record<
      string,
      string
    > = {
    active:
      'bg-green-50 text-green-700',

    trialing:
      'bg-blue-50 text-blue-700',

    past_due:
      'bg-amber-50 text-amber-700',

    unpaid:
      'bg-red-50 text-red-700',

    canceled:
      'bg-neutral-100 text-neutral-600',

    incomplete:
      'bg-orange-50 text-orange-700',

    incomplete_expired:
      'bg-neutral-100 text-neutral-500',

    paused:
      'bg-purple-50 text-purple-700',
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        style[status] ||
        'bg-neutral-100 text-neutral-600'
      }`}
    >
      {status.replace(
        /_/g,
        ' '
      )}
    </span>
  )
}

export default async function SubscriptionsPage() {
  const supabase =
    await createClient()

  const {
    data,
    error,
  } =
    await supabase
      .from(
        'monthly_subscriptions'
      )
      .select(`
        id,

        stripe_subscription_id,
        stripe_customer_id,

        status,
        currency,

        amount_cents,
        fee_amount_cents,
        total_amount_cents,

        cancel_at_period_end,

        current_period_start,
        current_period_end,
        canceled_at,

        last_payment_failed_at,
        last_failed_invoice_id,
        next_payment_attempt,

        created_at,

        campaign:campaigns (
          id,
          title,
          slug
        ),

        donor:donors (
          id,
          email,
          first_name,
          last_name
        )
      `)
      .order(
        'created_at',
        {
          ascending: false,
        }
      )

  const subscriptions =
    (data ??
      []) as unknown as Subscription[]

  const active =
    subscriptions.filter(
      (item) =>
        item.status ===
          'active' &&
        !item
          .cancel_at_period_end &&
        !item
          .last_payment_failed_at
    ).length

  const canceling =
    subscriptions.filter(
      (item) =>
        item
          .cancel_at_period_end &&
        item.status !==
          'canceled'
    ).length

  const canceled =
    subscriptions.filter(
      (item) =>
        item.status ===
        'canceled'
    ).length

  const paymentIssues =
    subscriptions.filter(
      (item) =>
        Boolean(
          item
            .last_payment_failed_at
        ) ||
        item.status ===
          'past_due' ||
        item.status ===
          'unpaid'
    ).length

  return (
    <div className="p-5 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Fundraising
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-950">
              Monthly subscriptions
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Monitor recurring
              donors, payment
              failures, renewal
              periods and
              cancellation status.
            </p>
          </div>

          <form
            action={
              syncExistingMonthlySubscriptions
            }
          >
            <button
              type="submit"
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
            >
              Sync from Stripe
            </button>
          </form>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load
            subscriptions:{' '}
            {error.message}
          </div>
        )}

        {/* PAYMENT ISSUE WARNING */}

        {paymentIssues >
          0 && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-700">
                !
              </div>

              <div>
                <p className="font-bold text-red-800">
                  Payment attention
                  required
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {
                    paymentIssues
                  }{' '}
                  monthly
                  subscription
                  {paymentIssues ===
                  1
                    ? ''
                    : 's'}{' '}
                  currently have a
                  payment issue.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STATS */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Active
            </p>

            <p className="mt-2 text-3xl font-bold">
              {active}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Canceling
            </p>

            <p className="mt-2 text-3xl font-bold">
              {canceling}
            </p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm text-red-600">
              Payment issues
            </p>

            <p className="mt-2 text-3xl font-bold text-red-800">
              {paymentIssues}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Canceled
            </p>

            <p className="mt-2 text-3xl font-bold">
              {canceled}
            </p>
          </div>
        </div>

        {/* TABLE */}

        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <h2 className="font-semibold text-neutral-900">
              Recurring donors
            </h2>

            <span className="text-xs text-neutral-400">
              {
                subscriptions.length
              }{' '}
              subscriptions
            </span>
          </div>

          {subscriptions.length ===
          0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-semibold text-neutral-700">
                No subscriptions
                synced yet.
              </p>

              <p className="mt-2 text-sm text-neutral-500">
                Click Sync from
                Stripe to import
                existing monthly
                subscriptions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1300px]">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Donor
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Campaign
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Monthly
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Billing
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Stripe
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-neutral-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {subscriptions.map(
                    (
                      subscription
                    ) => {
                      const donor =
                        relation(
                          subscription.donor
                        )

                      const campaign =
                        relation(
                          subscription.campaign
                        )

                      const name =
                        `${donor?.first_name || ''} ${donor?.last_name || ''}`.trim()

                      const hasFailure =
                        Boolean(
                          subscription
                            .last_payment_failed_at
                        )

                      return (
                        <tr
                          key={
                            subscription.id
                          }
                          className={`border-t ${
                            hasFailure
                              ? 'border-red-100 bg-red-50/30'
                              : 'border-neutral-100'
                          }`}
                        >
                          {/* DONOR */}

                          <td className="px-5 py-4">
                            <p className="font-semibold text-neutral-900">
                              {name ||
                                'Unknown'}
                            </p>

                            <p className="mt-1 text-xs text-neutral-400">
                              {donor?.email ||
                                '—'}
                            </p>
                          </td>

                          {/* CAMPAIGN */}

                          <td className="px-5 py-4">
                            {campaign ? (
                              <Link
                                href={`/admin/campaigns/${campaign.id}/edit`}
                                className="text-sm font-medium text-neutral-700 hover:text-black"
                              >
                                {
                                  campaign.title
                                }
                              </Link>
                            ) : (
                              <span className="text-sm text-neutral-400">
                                —
                              </span>
                            )}
                          </td>

                          {/* AMOUNT */}

                          <td className="px-5 py-4">
                            <p className="font-bold text-neutral-900">
                              {money(
                                subscription.amount_cents,
                                subscription.currency
                              )}
                            </p>

                            {subscription.fee_amount_cents >
                              0 && (
                              <p className="mt-1 text-xs text-neutral-400">
                                +
                                {money(
                                  subscription.fee_amount_cents,
                                  subscription.currency
                                )}{' '}
                                processing
                              </p>
                            )}
                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">
                            <StatusBadge
                              status={
                                subscription.status
                              }
                              cancelAtPeriodEnd={
                                subscription.cancel_at_period_end
                              }
                            />

                            {hasFailure && (
                              <span className="ml-2 inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                                Payment failed
                              </span>
                            )}
                          </td>

                          {/* BILLING */}

                          <td className="px-5 py-4">
                            {hasFailure ? (
                              <>
                                <p className="text-sm font-semibold text-red-600">
                                  Payment
                                  failed
                                </p>

                                <p className="mt-1 text-xs text-neutral-500">
                                  {
                                    dateTime(
                                      subscription.last_payment_failed_at
                                    )
                                  }
                                </p>

                                {subscription.next_payment_attempt && (
                                  <p className="mt-1 text-xs font-semibold text-amber-600">
                                    Retry:{' '}
                                    {dateTime(
                                      subscription.next_payment_attempt
                                    )}
                                  </p>
                                )}
                              </>
                            ) : (
                              <>
                                <p className="text-sm text-neutral-700">
                                  {subscription.status ===
                                  'canceled'
                                    ? '—'
                                    : date(
                                        subscription.current_period_end
                                      )}
                                </p>

                                {subscription.cancel_at_period_end && (
                                  <p className="mt-1 text-xs text-amber-600">
                                    Ends on
                                    this date
                                  </p>
                                )}
                              </>
                            )}
                          </td>

                          {/* STRIPE */}

                          <td className="px-5 py-4">
                            <p className="max-w-[180px] truncate font-mono text-[10px] text-neutral-400">
                              {
                                subscription.stripe_subscription_id
                              }
                            </p>

                            {subscription.last_failed_invoice_id && (
                              <p className="mt-1 max-w-[180px] truncate font-mono text-[10px] text-red-400">
                                {
                                  subscription.last_failed_invoice_id
                                }
                              </p>
                            )}
                          </td>

                          {/* ACTIONS */}

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <form
                                action={syncSubscriptionFromStripe.bind(
                                  null,
                                  subscription.stripe_subscription_id
                                )}
                              >
                                <button
                                  type="submit"
                                  className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-600"
                                >
                                  Sync
                                </button>
                              </form>

                              {subscription.status !==
                                'canceled' &&
                                subscription.cancel_at_period_end && (
                                  <form
                                    action={resumeSubscription.bind(
                                      null,
                                      subscription.stripe_subscription_id
                                    )}
                                  >
                                    <button
                                      type="submit"
                                      className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700"
                                    >
                                      Keep active
                                    </button>
                                  </form>
                                )}

                              {subscription.status ===
                                'active' &&
                                !subscription.cancel_at_period_end && (
                                  <form
                                    action={scheduleSubscriptionCancellation.bind(
                                      null,
                                      subscription.stripe_subscription_id
                                    )}
                                  >
                                    <button
                                      type="submit"
                                      className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600"
                                    >
                                      Cancel
                                    </button>
                                  </form>
                                )}
                            </div>
                          </td>
                        </tr>
                      )
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}