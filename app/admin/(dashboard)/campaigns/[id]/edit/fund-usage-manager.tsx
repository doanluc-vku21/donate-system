'use client'

import {
  useEffect,
  useState,
  useTransition,
} from 'react'

import { useRouter } from 'next/navigation'

import {
  createFundItem,
  deleteFundItem,
  reorderFundItems,
  updateFundItem,
} from './fund-actions'

type FundItem = {
  id: string
  title: string
  description: string | null
  amount_cents: number
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

export default function FundUsageManager({
  campaignId,
  goalAmountCents,
  currency,
  initialItems = [],
}: {
  campaignId: string
  goalAmountCents: number
  currency: string
  initialItems?: FundItem[]
}) {
  const router = useRouter()

  const [items, setItems] =
    useState<FundItem[]>(() => {
      const safeItems =
        Array.isArray(initialItems)
          ? initialItems
          : []

      return [...safeItems].sort(
        (a, b) =>
          a.sort_order -
          b.sort_order
      )
    })

  useEffect(() => {
    const safeItems =
      Array.isArray(initialItems)
        ? initialItems
        : []

    setItems(
      [...safeItems].sort(
        (a, b) =>
          a.sort_order -
          b.sort_order
      )
    )
  }, [initialItems])

  const [
    showForm,
    setShowForm,
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

  const [
    isPending,
    startTransition,
  ] = useTransition()

  const [
    newTitle,
    setNewTitle,
  ] = useState('')

  const [
    newDescription,
    setNewDescription,
  ] = useState('')

  const [
    newAmount,
    setNewAmount,
  ] = useState('')

  const [
    editTitle,
    setEditTitle,
  ] = useState('')

  const [
    editDescription,
    setEditDescription,
  ] = useState('')

  const [
    editAmount,
    setEditAmount,
  ] = useState('')

  const total =
    items.reduce(
      (sum, item) =>
        sum + item.amount_cents,
      0
    )

  const remaining =
    goalAmountCents - total

  function handleCreate() {
    setError('')

    if (!newTitle.trim()) {
      setError(
        'Fund item title is required.'
      )
      return
    }

    const amount =
      Number(newAmount)

    if (
      !newAmount ||
      Number.isNaN(amount) ||
      amount < 0
    ) {
      setError(
        'Please enter a valid amount.'
      )
      return
    }

    const formData =
      new FormData()

    formData.set(
      'title',
      newTitle
    )

    formData.set(
      'description',
      newDescription
    )

    formData.set(
      'amount',
      newAmount
    )

    startTransition(async () => {
      try {
        await createFundItem(
          campaignId,
          formData
        )

        setNewTitle('')
        setNewDescription('')
        setNewAmount('')
        setShowForm(false)

        router.refresh()
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to add fund item.'
        )
      }
    })
  }

  function startEdit(
    item: FundItem
  ) {
    setEditingId(item.id)

    setEditTitle(
      item.title
    )

    setEditDescription(
      item.description ?? ''
    )

    setEditAmount(
      String(
        item.amount_cents /
          100
      )
    )

    setError('')
  }

  function handleUpdate(
    itemId: string
  ) {
    setError('')

    if (!editTitle.trim()) {
      setError(
        'Fund item title is required.'
      )
      return
    }

    const amount =
      Number(editAmount)

    if (
      !editAmount ||
      Number.isNaN(amount) ||
      amount < 0
    ) {
      setError(
        'Please enter a valid amount.'
      )
      return
    }

    const formData =
      new FormData()

    formData.set(
      'title',
      editTitle
    )

    formData.set(
      'description',
      editDescription
    )

    formData.set(
      'amount',
      editAmount
    )

    startTransition(async () => {
      try {
        await updateFundItem(
          campaignId,
          itemId,
          formData
        )

        setEditingId(null)

        router.refresh()
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to update fund item.'
        )
      }
    })
  }

  function handleDelete(
    itemId: string
  ) {
    const confirmed =
      window.confirm(
        'Remove this fund usage item?'
      )

    if (!confirmed) {
      return
    }

    const previous =
      items

    setItems((current) =>
      current.filter(
        (item) =>
          item.id !== itemId
      )
    )

    setError('')

    startTransition(async () => {
      try {
        await deleteFundItem(
          campaignId,
          itemId
        )

        router.refresh()
      } catch (err) {
        setItems(previous)

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to remove fund item.'
        )
      }
    })
  }

  function handleDrop(
    targetId: string
  ) {
    if (
      !draggedId ||
      draggedId === targetId
    ) {
      return
    }

    const previous =
      items

    const next =
      [...items]

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

    setItems(normalized)
    setDraggedId(null)

    startTransition(async () => {
      try {
        await reorderFundItems(
          campaignId,
          normalized.map(
            (item) =>
              item.id
          )
        )

        router.refresh()
      } catch (err) {
        setItems(previous)

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to reorder fund items.'
        )
      }
    })
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-neutral-50 p-4">
          <p className="text-xs font-medium text-neutral-500">
            Campaign Goal
          </p>

          <p className="mt-1 text-lg font-bold text-neutral-900">
            {formatMoney(
              goalAmountCents,
              currency
            )}
          </p>
        </div>

        <div className="rounded-xl bg-neutral-50 p-4">
          <p className="text-xs font-medium text-neutral-500">
            Planned
          </p>

          <p className="mt-1 text-lg font-bold text-neutral-900">
            {formatMoney(
              total,
              currency
            )}
          </p>
        </div>

        <div className="rounded-xl bg-neutral-50 p-4">
          <p className="text-xs font-medium text-neutral-500">
            Remaining
          </p>

          <p
            className={`mt-1 text-lg font-bold ${
              remaining < 0
                ? 'text-red-600'
                : 'text-neutral-900'
            }`}
          >
            {formatMoney(
              remaining,
              currency
            )}
          </p>
        </div>
      </div>

      {remaining < 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Planned fund usage exceeds the campaign goal.
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center">
          <p className="font-medium text-neutral-700">
            No fund usage items yet
          </p>

          <p className="mt-1 text-sm text-neutral-500">
            Add items to explain how donations will be used.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(
            (item, index) => (
              <div
                key={item.id}
                draggable={
                  !isPending &&
                  editingId !== item.id
                }
                onDragStart={() =>
                  setDraggedId(
                    item.id
                  )
                }
                onDragEnd={() =>
                  setDraggedId(null)
                }
                onDragOver={(e) =>
                  e.preventDefault()
                }
                onDrop={() =>
                  handleDrop(
                    item.id
                  )
                }
                className={`rounded-xl border bg-white transition ${
                  draggedId === item.id
                    ? 'border-neutral-300 opacity-50'
                    : 'border-neutral-200'
                }`}
              >
                {editingId ===
                item.id ? (
                  <div className="space-y-4 p-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Title *
                      </label>

                      <input
                        value={
                          editTitle
                        }
                        onChange={(e) =>
                          setEditTitle(
                            e.target.value
                          )
                        }
                        type="text"
                        className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Description
                      </label>

                      <textarea
                        value={
                          editDescription
                        }
                        onChange={(e) =>
                          setEditDescription(
                            e.target.value
                          )
                        }
                        rows={3}
                        className="w-full resize-y rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Amount ({currency}) *
                      </label>

                      <input
                        value={
                          editAmount
                        }
                        onChange={(e) =>
                          setEditAmount(
                            e.target.value
                          )
                        }
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          setEditingId(
                            null
                          )
                        }
                        className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          handleUpdate(
                            item.id
                          )
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
                  <div className="flex items-start gap-4 p-5">
                    <div className="cursor-grab select-none pt-1 text-lg text-neutral-400">
                      ☰
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                        <div>
                          <p className="font-semibold text-neutral-900">
                            {item.title}
                          </p>

                          {item.description && (
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-neutral-500">
                              {
                                item.description
                              }
                            </p>
                          )}
                        </div>

                        <p className="shrink-0 font-semibold">
                          {formatMoney(
                            item.amount_cents,
                            currency
                          )}
                        </p>
                      </div>

                      <div className="mt-4 flex gap-4">
                        <span className="text-xs text-neutral-400">
                          #{index + 1}
                        </span>

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            startEdit(
                              item
                            )
                          }
                          className="text-xs font-semibold text-neutral-600"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            handleDelete(
                              item.id
                            )
                          }
                          className="text-xs font-semibold text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {showForm ? (
        <div className="space-y-4 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Title *
            </label>

            <input
              value={newTitle}
              onChange={(e) =>
                setNewTitle(
                  e.target.value
                )
              }
              placeholder="Food & Essential Supplies"
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={newDescription}
              onChange={(e) =>
                setNewDescription(
                  e.target.value
                )
              }
              rows={3}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Amount ({currency}) *
            </label>

            <input
              value={newAmount}
              onChange={(e) =>
                setNewAmount(
                  e.target.value
                )
              }
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setShowForm(false)
                setNewTitle('')
                setNewDescription('')
                setNewAmount('')
                setError('')
              }}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={
                handleCreate
              }
              className="rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isPending
                ? 'Adding...'
                : 'Add Item'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            setShowForm(true)
          }
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold"
        >
          + Add Fund Item
        </button>
      )}
    </div>
  )
}