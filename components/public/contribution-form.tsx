'use client'

import {
  useMemo,
  useState,
} from 'react'

import { useRouter } from 'next/navigation'

type DonationSettings = {
  enable_one_time: boolean
  enable_monthly: boolean
  allow_custom_amount: boolean
  allow_anonymous: boolean
  allow_cover_fee: boolean
  minimum_amount_cents: number
  default_frequency:
    | 'one_time'
    | 'monthly'
}

type DonationOption = {
  id: string
  amount_cents: number
  label: string | null
  is_active: boolean
  is_default: boolean
  sort_order: number
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
      maximumFractionDigits:
        cents % 100 === 0
          ? 0
          : 2,
    }
  ).format(cents / 100)
}

export default function ContributionForm({
  campaignSlug,
  currency,
  settings,
  options,
}: {
  campaignSlug: string
  currency: string
  settings: DonationSettings | null
  options: DonationOption[]
}) {
  const router = useRouter()

  const resolvedSettings =
    settings ?? {
      enable_one_time: true,
      enable_monthly: false,
      allow_custom_amount: true,
      allow_anonymous: true,
      allow_cover_fee: true,
      minimum_amount_cents: 100,
      default_frequency:
        'one_time' as const,
    }

  let initialFrequency:
    | 'one_time'
    | 'monthly' =
    resolvedSettings.default_frequency

  if (
    initialFrequency === 'one_time' &&
    !resolvedSettings.enable_one_time
  ) {
    initialFrequency = 'monthly'
  }

  if (
    initialFrequency === 'monthly' &&
    !resolvedSettings.enable_monthly
  ) {
    initialFrequency = 'one_time'
  }

  const [
    frequency,
    setFrequency,
  ] = useState<
    'one_time' | 'monthly'
  >(initialFrequency)

  const [
    selectedAmount,
    setSelectedAmount,
  ] = useState<number | null>(
    null
  )

  const [
    customMode,
    setCustomMode,
  ] = useState(false)

  const [
    customAmount,
    setCustomAmount,
  ] = useState('')

  const activeOptions =
    useMemo(
      () =>
        options
          .filter(
            (option) =>
              option.is_active
          )
          .sort(
            (a, b) =>
              a.sort_order -
              b.sort_order
          ),
      [options]
    )

  const customCents =
    Math.round(
      Number(
        customAmount || 0
      ) * 100
    )

  const amountCents =
    customMode
      ? customCents
      : selectedAmount ?? 0

  const valid =
    amountCents >=
    resolvedSettings.minimum_amount_cents

  function chooseAmount(
    cents: number
  ) {
    setSelectedAmount(cents)

    setCustomMode(false)

    setCustomAmount('')
  }

  function handleContinue() {
    if (!valid) {
      return
    }

    const params =
      new URLSearchParams()

    params.set(
      'amount',
      String(amountCents)
    )

    params.set(
      'frequency',
      frequency
    )

    router.push(
      `/campaigns/${campaignSlug}/contribute/details?${params.toString()}`
    )
  }

  return (
    <div>
      {/* FREQUENCY */}

      {resolvedSettings
        .enable_one_time &&
        resolvedSettings
          .enable_monthly && (
        <div className="mb-7 grid grid-cols-2 rounded-xl bg-[#f4f6f1] p-1">
          <button
            type="button"
            onClick={() =>
              setFrequency(
                'one_time'
              )
            }
            className={`rounded-lg px-4 py-3 text-sm font-semibold ${
              frequency ===
              'one_time'
                ? 'bg-white text-[#173f35] shadow-sm'
                : 'text-neutral-500'
            }`}
          >
            One-time
          </button>

          <button
            type="button"
            onClick={() =>
              setFrequency(
                'monthly'
              )
            }
            className={`rounded-lg px-4 py-3 text-sm font-semibold ${
              frequency ===
              'monthly'
                ? 'bg-white text-[#173f35] shadow-sm'
                : 'text-neutral-500'
            }`}
          >
            Monthly
          </button>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-[#111827]">
          Enter your donation
        </h2>

        <p className="mt-1 text-xs text-[#73839b]">
          {frequency ===
          'monthly'
            ? 'Monthly donation'
            : 'One-time donation'}{' '}
          · {currency}
        </p>
      </div>

      {/* AMOUNTS */}

      {!customMode && (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {activeOptions.map(
            (option) => {
              const selected =
                selectedAmount ===
                option.amount_cents

              return (
                <button
                  type="button"
                  key={
                    option.id
                  }
                  onClick={() =>
                    chooseAmount(
                      option.amount_cents
                    )
                  }
                  className={`relative min-h-[68px] rounded-xl border px-3 py-4 text-center text-lg font-bold transition ${
                    selected
                      ? 'border-[#173f35] bg-[#f1f8ea] text-[#173f35]'
                      : 'border-[#d9dedb] bg-white text-[#111827] hover:border-[#173f35]'
                  }`}
                >
                  {money(
                    option.amount_cents,
                    currency
                  )}

                  {option.label && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#baf477] px-3 py-0.5 text-[9px] font-bold text-[#174d37]">
                      {option.label}
                    </span>
                  )}
                </button>
              )
            }
          )}
        </div>
      )}

      {/* CUSTOM */}

      {resolvedSettings
        .allow_custom_amount && (
        <div className="mt-7 text-center">
          {!customMode ? (
            <button
              type="button"
              onClick={() => {
                setCustomMode(true)

                setSelectedAmount(
                  null
                )
              }}
              className="text-sm font-medium text-[#0e6b4d] underline underline-offset-4"
            >
              Other amounts
            </button>
          ) : (
            <div>
              <label className="mb-2 block text-left text-sm font-semibold text-[#111827]">
                Other amount
              </label>

              <div className="flex rounded-xl border border-[#d9dedb] bg-white focus-within:border-[#173f35]">
                <span className="flex items-center px-4 text-sm font-semibold text-neutral-400">
                  {currency}
                </span>

                <input
                  autoFocus
                  value={
                    customAmount
                  }
                  onChange={(e) =>
                    setCustomAmount(
                      e.target.value
                    )
                  }
                  type="number"
                  min={
                    resolvedSettings.minimum_amount_cents /
                    100
                  }
                  step="0.01"
                  placeholder="Enter amount"
                  className="min-w-0 flex-1 rounded-r-xl py-4 pr-4 text-lg font-semibold outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setCustomMode(
                    false
                  )

                  setCustomAmount(
                    ''
                  )
                }}
                className="mt-3 text-xs text-neutral-500 underline"
              >
                Back to suggested amounts
              </button>
            </div>
          )}
        </div>
      )}

      {/* CONTINUE */}

      <button
        type="button"
        disabled={!valid}
        onClick={
          handleContinue
        }
        className="mt-8 w-full rounded-full bg-[#173f35] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#215844] disabled:cursor-not-allowed disabled:bg-[#edf0f4] disabled:text-[#a6afbd]"
      >
        {valid
          ? `Continue with ${money(
              amountCents,
              currency
            )}`
          : 'Select an amount to continue'}
      </button>

      <p className="mt-5 text-center text-xs text-[#73839b]">
        🔒 Secure payment through Stripe
      </p>
    </div>
  )
}