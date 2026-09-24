'use client'

import {
  useEffect,
  useState,
  useTransition,
} from 'react'

import { useRouter } from 'next/navigation'

import {
  createDonationOption,
  deleteDonationOption,
  reorderDonationOptions,
  saveDonationSettings,
  updateDonationOption,
} from './donation-actions'

type DonationSettings = {
  campaign_id: string
  enable_one_time: boolean
  enable_monthly: boolean
  allow_custom_amount: boolean
  allow_anonymous: boolean
  allow_cover_fee: boolean
  minimum_amount_cents: number
  default_frequency: 'one_time' | 'monthly'
  created_at: string
  updated_at: string
}

type DonationOption = {
  id: string
  amount_cents: number
  label: string | null
  is_active: boolean
  is_default: boolean
  sort_order: number
}

function formatMoney(
  cents: number,
  currency: string
) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

export default function DonationSettingsManager({
  campaignId,
  currency,
  initialSettings,
  initialOptions = [],
}: {
  campaignId: string
  currency: string
  initialSettings: DonationSettings | null
  initialOptions?: DonationOption[]
}) {
  const router = useRouter()

  const [enableOneTime, setEnableOneTime] =
    useState(
      initialSettings?.enable_one_time ??
        true
    )

  const [enableMonthly, setEnableMonthly] =
    useState(
      initialSettings?.enable_monthly ??
        true
    )

  const [
    allowCustomAmount,
    setAllowCustomAmount,
  ] = useState(
    initialSettings
      ?.allow_custom_amount ??
      true
  )

  const [
    allowAnonymous,
    setAllowAnonymous,
  ] = useState(
    initialSettings?.allow_anonymous ??
      true
  )

  const [
    allowCoverFee,
    setAllowCoverFee,
  ] = useState(
    initialSettings?.allow_cover_fee ??
      true
  )

  const [
    minimumAmount,
    setMinimumAmount,
  ] = useState(
    String(
      (initialSettings
        ?.minimum_amount_cents ??
        100) / 100
    )
  )

  const [
    defaultFrequency,
    setDefaultFrequency,
  ] = useState<
    'one_time' | 'monthly'
  >(
    initialSettings
      ?.default_frequency ??
      'one_time'
  )

  const [options, setOptions] =
    useState<DonationOption[]>(
      () => {
        const safeOptions =
          Array.isArray(initialOptions)
            ? initialOptions
            : []

        return [...safeOptions].sort(
          (a, b) =>
            a.sort_order -
            b.sort_order
        )
      }
    )

  /*
   * router.refresh() không reload browser.
   * Vì vậy phải sync dữ liệu mới từ Server Component
   * trở lại local state.
   */
  useEffect(() => {
    const safeOptions =
      Array.isArray(initialOptions)
        ? initialOptions
        : []

    setOptions(
      [...safeOptions].sort(
        (a, b) =>
          a.sort_order -
          b.sort_order
      )
    )
  }, [initialOptions])

  const [
    showCreate,
    setShowCreate,
  ] = useState(false)

  const [
    editingId,
    setEditingId,
  ] = useState<string | null>(null)

  const [
    draggedId,
    setDraggedId,
  ] = useState<string | null>(null)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const [
    isPending,
    startTransition,
  ] = useTransition()

  // CREATE OPTION

  const [
    newAmount,
    setNewAmount,
  ] = useState('')

  const [newLabel, setNewLabel] =
    useState('')

  const [newActive, setNewActive] =
    useState(true)

  const [
    newDefault,
    setNewDefault,
  ] = useState(false)

  // EDIT OPTION

  const [
    editAmount,
    setEditAmount,
  ] = useState('')

  const [
    editLabel,
    setEditLabel,
  ] = useState('')

  const [
    editActive,
    setEditActive,
  ] = useState(true)

  const [
    editDefault,
    setEditDefault,
  ] = useState(false)

  // ============================
  // SAVE GENERAL SETTINGS
  // ============================

  function handleSaveSettings() {
    setError('')
    setSuccess('')

    if (
      !enableOneTime &&
      !enableMonthly
    ) {
      setError(
        'At least one donation frequency must be enabled.'
      )
      return
    }

    const minimum =
      Number(minimumAmount)

    if (
      !minimumAmount ||
      Number.isNaN(minimum) ||
      minimum < 0
    ) {
      setError(
        'Please enter a valid minimum donation amount.'
      )
      return
    }

    let safeDefault =
      defaultFrequency

    if (
      safeDefault === 'one_time' &&
      !enableOneTime
    ) {
      safeDefault = 'monthly'
      setDefaultFrequency('monthly')
    }

    if (
      safeDefault === 'monthly' &&
      !enableMonthly
    ) {
      safeDefault = 'one_time'
      setDefaultFrequency(
        'one_time'
      )
    }

    const formData =
      new FormData()

    formData.set(
      'enable_one_time',
      String(enableOneTime)
    )

    formData.set(
      'enable_monthly',
      String(enableMonthly)
    )

    formData.set(
      'allow_custom_amount',
      String(allowCustomAmount)
    )

    formData.set(
      'allow_anonymous',
      String(allowAnonymous)
    )

    formData.set(
      'allow_cover_fee',
      String(allowCoverFee)
    )

    formData.set(
      'minimum_amount',
      minimumAmount
    )

    formData.set(
      'default_frequency',
      safeDefault
    )

    startTransition(async () => {
      try {
        await saveDonationSettings(
          campaignId,
          formData
        )

        setSuccess(
          'Donation settings saved.'
        )

        router.refresh()
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to save donation settings.'
        )
      }
    })
  }

  // ============================
  // CREATE OPTION
  // ============================

  function handleCreateOption() {
    setError('')
    setSuccess('')

    const amount =
      Number(newAmount)

    if (
      !newAmount ||
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      setError(
        'Please enter a valid donation amount.'
      )
      return
    }

    const formData =
      new FormData()

    formData.set(
      'amount',
      newAmount
    )

    formData.set(
      'label',
      newLabel
    )

    formData.set(
      'is_active',
      String(newActive)
    )

    formData.set(
      'is_default',
      String(newDefault)
    )

    startTransition(async () => {
      try {
        await createDonationOption(
          campaignId,
          formData
        )

        setNewAmount('')
        setNewLabel('')
        setNewActive(true)
        setNewDefault(false)
        setShowCreate(false)

        router.refresh()
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to add donation option.'
        )
      }
    })
  }

  // ============================
  // START EDIT
  // ============================

  function startEdit(
    option: DonationOption
  ) {
    setEditingId(option.id)

    setEditAmount(
      String(
        option.amount_cents /
          100
      )
    )

    setEditLabel(
      option.label ?? ''
    )

    setEditActive(
      option.is_active
    )

    setEditDefault(
      option.is_default
    )

    setError('')
    setSuccess('')
  }

  // ============================
  // UPDATE OPTION
  // ============================

  function handleUpdateOption(
    optionId: string
  ) {
    setError('')
    setSuccess('')

    const amount =
      Number(editAmount)

    if (
      !editAmount ||
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      setError(
        'Please enter a valid donation amount.'
      )
      return
    }

    const formData =
      new FormData()

    formData.set(
      'amount',
      editAmount
    )

    formData.set(
      'label',
      editLabel
    )

    formData.set(
      'is_active',
      String(editActive)
    )

    formData.set(
      'is_default',
      String(editDefault)
    )

    startTransition(async () => {
      try {
        await updateDonationOption(
          campaignId,
          optionId,
          formData
        )

        setEditingId(null)

        router.refresh()
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to update donation option.'
        )
      }
    })
  }

  // ============================
  // DELETE OPTION
  // ============================

  function handleDeleteOption(
    optionId: string
  ) {
    const confirmed =
      window.confirm(
        'Delete this donation option?'
      )

    if (!confirmed) {
      return
    }

    const previous = options

    setOptions((current) =>
      current.filter(
        (option) =>
          option.id !== optionId
      )
    )

    setError('')
    setSuccess('')

    startTransition(async () => {
      try {
        await deleteDonationOption(
          campaignId,
          optionId
        )

        router.refresh()
      } catch (err) {
        setOptions(previous)

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to delete donation option.'
        )
      }
    })
  }

  // ============================
  // DRAG DROP
  // ============================

  function handleDrop(
    targetId: string
  ) {
    if (
      !draggedId ||
      draggedId === targetId
    ) {
      return
    }

    const previous = options
    const next = [...options]

    const fromIndex =
      next.findIndex(
        (item) =>
          item.id === draggedId
      )

    const toIndex =
      next.findIndex(
        (item) =>
          item.id === targetId
      )

    if (
      fromIndex === -1 ||
      toIndex === -1
    ) {
      return
    }

    const [moved] =
      next.splice(
        fromIndex,
        1
      )

    next.splice(
      toIndex,
      0,
      moved
    )

    const normalized =
      next.map(
        (item, index) => ({
          ...item,
          sort_order: index,
        })
      )

    setOptions(normalized)
    setDraggedId(null)

    startTransition(async () => {
      try {
        await reorderDonationOptions(
          campaignId,
          normalized.map(
            (item) =>
              item.id
          )
        )

        router.refresh()
      } catch (err) {
        setOptions(previous)

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to reorder donation options.'
        )
      }
    })
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* GENERAL SETTINGS */}

      <div>
        <h3 className="text-sm font-semibold text-neutral-900">
          General Settings
        </h3>

        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 px-4 py-3">
            <input
              type="checkbox"
              checked={enableOneTime}
              onChange={(e) => {
                const checked =
                  e.target.checked

                setEnableOneTime(
                  checked
                )

                if (
                  !checked &&
                  defaultFrequency ===
                    'one_time' &&
                  enableMonthly
                ) {
                  setDefaultFrequency(
                    'monthly'
                  )
                }
              }}
              className="h-4 w-4"
            />

            <div>
              <p className="text-sm font-medium text-neutral-800">
                One-time donations
              </p>

              <p className="text-xs text-neutral-500">
                Allow donors to make a single donation.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 px-4 py-3">
            <input
              type="checkbox"
              checked={enableMonthly}
              onChange={(e) => {
                const checked =
                  e.target.checked

                setEnableMonthly(
                  checked
                )

                if (
                  !checked &&
                  defaultFrequency ===
                    'monthly' &&
                  enableOneTime
                ) {
                  setDefaultFrequency(
                    'one_time'
                  )
                }
              }}
              className="h-4 w-4"
            />

            <div>
              <p className="text-sm font-medium text-neutral-800">
                Monthly donations
              </p>

              <p className="text-xs text-neutral-500">
                Allow recurring monthly donations.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 px-4 py-3">
            <input
              type="checkbox"
              checked={
                allowCustomAmount
              }
              onChange={(e) =>
                setAllowCustomAmount(
                  e.target.checked
                )
              }
              className="h-4 w-4"
            />

            <div>
              <p className="text-sm font-medium text-neutral-800">
                Custom amount
              </p>

              <p className="text-xs text-neutral-500">
                Allow donors to enter their own amount.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 px-4 py-3">
            <input
              type="checkbox"
              checked={
                allowAnonymous
              }
              onChange={(e) =>
                setAllowAnonymous(
                  e.target.checked
                )
              }
              className="h-4 w-4"
            />

            <div>
              <p className="text-sm font-medium text-neutral-800">
                Anonymous donations
              </p>

              <p className="text-xs text-neutral-500">
                Allow donors to hide their public identity.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 px-4 py-3">
            <input
              type="checkbox"
              checked={
                allowCoverFee
              }
              onChange={(e) =>
                setAllowCoverFee(
                  e.target.checked
                )
              }
              className="h-4 w-4"
            />

            <div>
              <p className="text-sm font-medium text-neutral-800">
                Cover processing fee
              </p>

              <p className="text-xs text-neutral-500">
                Let donors optionally contribute toward payment processing costs.
              </p>
            </div>
          </label>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Minimum Donation ({currency})
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={minimumAmount}
              onChange={(e) =>
                setMinimumAmount(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Default Frequency
            </label>

            <select
              value={
                defaultFrequency
              }
              onChange={(e) =>
                setDefaultFrequency(
                  e.target.value as
                    | 'one_time'
                    | 'monthly'
                )
              }
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3"
            >
              {enableOneTime && (
                <option value="one_time">
                  One-time
                </option>
              )}

              {enableMonthly && (
                <option value="monthly">
                  Monthly
                </option>
              )}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={
            handleSaveSettings
          }
          disabled={isPending}
          className="mt-5 rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isPending
            ? 'Saving...'
            : 'Save Donation Settings'}
        </button>
      </div>

      {/* DONATION OPTIONS */}

      <div className="border-t border-neutral-200 pt-8">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            Donation Options
          </h3>

          <p className="mt-1 text-sm text-neutral-500">
            Configure suggested donation amounts shown to donors.
          </p>
        </div>

        {options.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center">
            <p className="font-medium text-neutral-700">
              No donation options yet
            </p>

            <p className="mt-1 text-sm text-neutral-500">
              Add suggested amounts such as $25, $50, $100 and $250.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {options.map(
              (
                option,
                index
              ) => (
                <div
                  key={option.id}
                  draggable={
                    !isPending &&
                    editingId !==
                      option.id
                  }
                  onDragStart={() =>
                    setDraggedId(
                      option.id
                    )
                  }
                  onDragEnd={() =>
                    setDraggedId(
                      null
                    )
                  }
                  onDragOver={(e) =>
                    e.preventDefault()
                  }
                  onDrop={() =>
                    handleDrop(
                      option.id
                    )
                  }
                  className={`rounded-xl border bg-white ${
                    draggedId ===
                    option.id
                      ? 'opacity-50'
                      : 'border-neutral-200'
                  }`}
                >
                  {editingId ===
                  option.id ? (
                    <div className="space-y-4 p-5">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Amount ({currency})
                        </label>

                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={
                            editAmount
                          }
                          onChange={(e) =>
                            setEditAmount(
                              e.target
                                .value
                            )
                          }
                          className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Label
                        </label>

                        <input
                          value={
                            editLabel
                          }
                          onChange={(e) =>
                            setEditLabel(
                              e.target
                                .value
                            )
                          }
                          placeholder="Most popular"
                          className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                        />
                      </div>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={
                            editActive
                          }
                          onChange={(e) =>
                            setEditActive(
                              e.target
                                .checked
                            )
                          }
                        />

                        <span className="text-sm">
                          Active
                        </span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={
                            editDefault
                          }
                          onChange={(e) =>
                            setEditDefault(
                              e.target
                                .checked
                            )
                          }
                        />

                        <span className="text-sm">
                          Default option
                        </span>
                      </label>

                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingId(
                              null
                            )
                          }
                          disabled={
                            isPending
                          }
                          className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateOption(
                              option.id
                            )
                          }
                          disabled={
                            isPending
                          }
                          className="rounded-lg bg-neutral-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          {isPending
                            ? 'Saving...'
                            : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4">
                      <div className="cursor-grab select-none text-neutral-400">
                        ☰
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-bold text-neutral-900">
                            {formatMoney(
                              option.amount_cents,
                              currency
                            )}
                          </span>

                          {option.label && (
                            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                              {option.label}
                            </span>
                          )}

                          {option.is_default && (
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              Default
                            </span>
                          )}

                          {!option.is_active && (
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                              Disabled
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-neutral-400">
                          #{index + 1}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          startEdit(
                            option
                          )
                        }
                        className="text-xs font-semibold text-neutral-600 disabled:opacity-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          handleDeleteOption(
                            option.id
                          )
                        }
                        className="text-xs font-semibold text-red-600 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {showCreate ? (
          <div className="mt-5 space-y-4 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Amount ({currency}) *
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={newAmount}
                onChange={(e) =>
                  setNewAmount(
                    e.target.value
                  )
                }
                placeholder="25"
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Label
              </label>

              <input
                value={newLabel}
                onChange={(e) =>
                  setNewLabel(
                    e.target.value
                  )
                }
                placeholder="Most popular"
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3"
              />
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={newActive}
                onChange={(e) =>
                  setNewActive(
                    e.target.checked
                  )
                }
              />

              <span className="text-sm">
                Active
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={newDefault}
                onChange={(e) =>
                  setNewDefault(
                    e.target.checked
                  )
                }
              />

              <span className="text-sm">
                Default option
              </span>
            </label>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setShowCreate(false)
                  setNewAmount('')
                  setNewLabel('')
                  setNewActive(true)
                  setNewDefault(false)
                  setError('')
                }}
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleCreateOption
                }
                disabled={isPending}
                className="rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isPending
                  ? 'Adding...'
                  : 'Add Option'}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              setShowCreate(true)
            }
            className="mt-5 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            + Add Donation Option
          </button>
        )}
      </div>
    </div>
  )
}