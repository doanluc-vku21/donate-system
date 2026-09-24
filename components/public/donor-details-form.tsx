'use client'

import {
  useMemo,
  useState,
} from 'react'

type Props = {
  campaignId: string
  campaignSlug: string
  campaignTitle: string
  currency: string
  amountCents: number
  frequency:
    | 'one_time'
    | 'monthly'

  allowAnonymous: boolean
  allowCoverFee: boolean

  feePercent: number
  feeFixedCents: number
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
  ).format(cents / 100)
}

function calculateCoverFee(
  amountCents: number,
  percentage: number,
  fixedCents: number
) {
  const rate =
    percentage / 100

  if (
    rate <= 0 &&
    fixedCents <= 0
  ) {
    return 0
  }

  if (rate >= 1) {
    return 0
  }

  const grossTotal =
    (amountCents +
      fixedCents) /
    (1 - rate)

  return Math.max(
    0,
    Math.ceil(
      grossTotal -
        amountCents
    )
  )
}

export default function DonorDetailsForm({
  campaignId,
  campaignSlug,
  campaignTitle,
  currency,
  amountCents,
  frequency,
  allowAnonymous,
  allowCoverFee,
  feePercent,
  feeFixedCents,
}: Props) {
  const [
    firstName,
    setFirstName,
  ] = useState('')

  const [
    lastName,
    setLastName,
  ] = useState('')

  const [email, setEmail] =
    useState('')

  const [phone, setPhone] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [
    anonymous,
    setAnonymous,
  ] = useState(false)

  const [
    coverFee,
    setCoverFee,
  ] = useState(false)

  const [error, setError] =
    useState('')

  const [
    loading,
    setLoading,
  ] = useState(false)

  const feeCents =
    useMemo(
      () =>
        coverFee
          ? calculateCoverFee(
              amountCents,
              feePercent,
              feeFixedCents
            )
          : 0,
      [
        coverFee,
        amountCents,
        feePercent,
        feeFixedCents,
      ]
    )

  const totalCents =
    amountCents +
    feeCents

  async function handleCheckout() {
    setError('')

    if (!firstName.trim()) {
      setError(
        'First name is required.'
      )
      return
    }

    if (!lastName.trim()) {
      setError(
        'Last name is required.'
      )
      return
    }

    if (!email.trim()) {
      setError(
        'Email is required.'
      )
      return
    }

    setLoading(true)

    try {
      const response =
        await fetch(
          '/api/checkout',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                campaignId,
                amountCents,
                frequency,

                donor: {
                  firstName:
                    firstName.trim(),

                  lastName:
                    lastName.trim(),

                  email:
                    email
                      .trim()
                      .toLowerCase(),

                  phone:
                    phone.trim(),

                  message:
                    message.trim(),
                },

                anonymous:
                  allowAnonymous
                    ? anonymous
                    : false,

                coverFee:
                  allowCoverFee
                    ? coverFee
                    : false,
              }),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to start checkout.'
        )
      }

      if (!data.url) {
        throw new Error(
          'Stripe Checkout URL was not returned.'
        )
      }

      window.location.href =
        data.url
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      )

      setLoading(false)
    }
  }

  return (
    <div className="space-y-7">
      {/* SUMMARY */}

      <div className="rounded-2xl bg-[#f4f7ef] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#477768]">
          Your donation
        </p>

        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-bold text-[#173f35]">
              {money(
                amountCents,
                currency
              )}
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              {frequency ===
              'monthly'
                ? 'Monthly donation'
                : 'One-time donation'}
            </p>
          </div>

          <a
            href={`/campaigns/${campaignSlug}/contribute`}
            className="text-xs font-semibold text-[#176344] underline"
          >
            Change
          </a>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* DONOR INFO */}

      <div>
        <h2 className="text-xl font-bold text-[#111827]">
          Your information
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          We&apos;ll use this information for your donation confirmation and receipt.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-700">
              First name *
            </label>

            <input
              value={firstName}
              onChange={(e) =>
                setFirstName(
                  e.target.value
                )
              }
              autoComplete="given-name"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3.5 outline-none focus:border-[#173f35]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-700">
              Last name *
            </label>

            <input
              value={lastName}
              onChange={(e) =>
                setLastName(
                  e.target.value
                )
              }
              autoComplete="family-name"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3.5 outline-none focus:border-[#173f35]"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-neutral-700">
            Email *
          </label>

          <input
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            type="email"
            autoComplete="email"
            className="w-full rounded-xl border border-neutral-300 px-4 py-3.5 outline-none focus:border-[#173f35]"
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-neutral-700">
            Phone
          </label>

          <input
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
              )
            }
            type="tel"
            autoComplete="tel"
            className="w-full rounded-xl border border-neutral-300 px-4 py-3.5 outline-none focus:border-[#173f35]"
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-neutral-700">
            Message of support
          </label>

          <textarea
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            rows={4}
            maxLength={400}
            placeholder="Leave a message for the campaign..."
            className="w-full resize-y rounded-xl border border-neutral-300 px-4 py-3.5 outline-none focus:border-[#173f35]"
          />

          <p className="mt-1 text-right text-xs text-neutral-400">
            {message.length}/400
          </p>
        </div>
      </div>

      {/* ANONYMOUS */}

      {allowAnonymous && (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-4">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) =>
              setAnonymous(
                e.target.checked
              )
            }
            className="mt-1 h-4 w-4"
          />

          <div>
            <p className="text-sm font-semibold text-neutral-800">
              Donate anonymously
            </p>

            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Your name will not appear publicly. Your information is still used privately for payment processing and your receipt.
            </p>
          </div>
        </label>
      )}

      {/* COVER FEE */}

      {allowCoverFee && (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-4">
          <input
            type="checkbox"
            checked={coverFee}
            onChange={(e) =>
              setCoverFee(
                e.target.checked
              )
            }
            className="mt-1 h-4 w-4"
          />

          <div className="flex-1">
            <p className="text-sm font-semibold text-neutral-800">
              Help cover processing costs
            </p>

            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Add approximately{' '}
              <strong>
                {money(
                  calculateCoverFee(
                    amountCents,
                    feePercent,
                    feeFixedCents
                  ),
                  currency
                )}
              </strong>{' '}
              so more of your intended donation can support the campaign.
            </p>
          </div>
        </label>
      )}

      {/* TOTAL */}

      <div className="border-t border-neutral-200 pt-5">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">
              Donation
            </span>

            <span>
              {money(
                amountCents,
                currency
              )}
            </span>
          </div>

          {coverFee && (
            <div className="flex justify-between">
              <span className="text-neutral-500">
                Processing contribution
              </span>

              <span>
                {money(
                  feeCents,
                  currency
                )}
              </span>
            </div>
          )}

          <div className="flex justify-between border-t border-neutral-100 pt-3 text-base font-bold text-[#173f35]">
            <span>
              {frequency ===
              'monthly'
                ? 'Monthly total'
                : 'Total'}
            </span>

            <span>
              {money(
                totalCents,
                currency
              )}
            </span>
          </div>
        </div>
      </div>

      {/* CHECKOUT */}

      <button
        type="button"
        disabled={loading}
        onClick={
          handleCheckout
        }
        className="w-full rounded-full bg-[#baf477] px-6 py-4 text-base font-bold text-[#173f35] transition hover:bg-[#a9e963] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? 'Opening secure checkout...'
          : `Continue to secure checkout`}
      </button>

      <p className="text-center text-xs text-neutral-400">
        🔒 Payment is processed securely by Stripe
      </p>
    </div>
  )
}