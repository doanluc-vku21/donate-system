'use client'

import {
  useEffect,
  useState,
  useTransition,
} from 'react'

import { useRouter } from 'next/navigation'

import {
  createCampaignUpdate,
  deleteCampaignUpdate,
  deleteCampaignUpdateImage,
  toggleCampaignUpdateStatus,
  updateCampaignUpdate,
} from './update-actions'

type CampaignUpdate = {
  id: string
  title: string
  content: string | null
  image_url: string | null
  image_path: string | null
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
}

function formatDate(
  value: string | null
) {
  if (!value) {
    return 'Not published'
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
  ).format(new Date(value))
}

export default function CampaignUpdatesManager({
  campaignId,
  initialUpdates = [],
}: {
  campaignId: string
  initialUpdates?: CampaignUpdate[]
}) {
  const router = useRouter()

  const [
    updates,
    setUpdates,
  ] = useState<
    CampaignUpdate[]
  >(
    Array.isArray(initialUpdates)
      ? initialUpdates
      : []
  )

  useEffect(() => {
    setUpdates(
      Array.isArray(initialUpdates)
        ? initialUpdates
        : []
    )
  }, [initialUpdates])

  const [
    showCreate,
    setShowCreate,
  ] = useState(false)

  const [
    editingId,
    setEditingId,
  ] = useState<string | null>(
    null
  )

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
    newContent,
    setNewContent,
  ] = useState('')

  const [
    newStatus,
    setNewStatus,
  ] = useState('draft')

  const [
    newImage,
    setNewImage,
  ] = useState<File | null>(
    null
  )

  const [
    editTitle,
    setEditTitle,
  ] = useState('')

  const [
    editContent,
    setEditContent,
  ] = useState('')

  const [
    editStatus,
    setEditStatus,
  ] = useState('draft')

  const [
    editImage,
    setEditImage,
  ] = useState<File | null>(
    null
  )

  function handleCreate() {
    setError('')

    if (!newTitle.trim()) {
      setError(
        'Update title is required.'
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
      'content',
      newContent
    )

    formData.set(
      'status',
      newStatus
    )

    if (newImage) {
      formData.set(
        'image',
        newImage
      )
    }

    startTransition(async () => {
      try {
        await createCampaignUpdate(
          campaignId,
          formData
        )

        setNewTitle('')
        setNewContent('')
        setNewStatus('draft')
        setNewImage(null)
        setShowCreate(false)

        router.refresh()
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to create update.'
        )
      }
    })
  }

  function startEdit(
    update: CampaignUpdate
  ) {
    setEditingId(
      update.id
    )

    setEditTitle(
      update.title
    )

    setEditContent(
      update.content ?? ''
    )

    setEditStatus(
      update.status
    )

    setEditImage(null)
    setError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditImage(null)
    setError('')
  }

  function handleUpdate(
    updateId: string
  ) {
    setError('')

    if (!editTitle.trim()) {
      setError(
        'Update title is required.'
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
      'content',
      editContent
    )

    formData.set(
      'status',
      editStatus
    )

    if (editImage) {
      formData.set(
        'image',
        editImage
      )
    }

    startTransition(async () => {
      try {
        await updateCampaignUpdate(
          campaignId,
          updateId,
          formData
        )

        setEditingId(null)
        setEditImage(null)

        router.refresh()
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to update.'
        )
      }
    })
  }

  function handleDelete(
    updateId: string
  ) {
    const confirmed =
      window.confirm(
        'Delete this campaign update?'
      )

    if (!confirmed) {
      return
    }

    const previous =
      updates

    setUpdates((current) =>
      current.filter(
        (item) =>
          item.id !== updateId
      )
    )

    startTransition(async () => {
      try {
        await deleteCampaignUpdate(
          campaignId,
          updateId
        )

        router.refresh()
      } catch (err) {
        setUpdates(previous)

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to delete update.'
        )
      }
    })
  }

  function handleToggleStatus(
    updateId: string
  ) {
    setError('')

    startTransition(async () => {
      try {
        await toggleCampaignUpdateStatus(
          campaignId,
          updateId
        )

        router.refresh()
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to change status.'
        )
      }
    })
  }

  function handleDeleteImage(
    updateId: string
  ) {
    const confirmed =
      window.confirm(
        'Remove this update image?'
      )

    if (!confirmed) {
      return
    }

    startTransition(async () => {
      try {
        await deleteCampaignUpdateImage(
          campaignId,
          updateId
        )

        router.refresh()
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to remove image.'
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

      {updates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center">
          <p className="font-medium text-neutral-700">
            No campaign updates yet
          </p>

          <p className="mt-1 text-sm text-neutral-500">
            Post progress updates to keep donors informed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map(
            (update) => (
              <div
                key={update.id}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
              >
                {editingId ===
                update.id ? (
                  <div className="space-y-5 p-5">
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
                        className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Update Content
                      </label>

                      <textarea
                        value={
                          editContent
                        }
                        onChange={(e) =>
                          setEditContent(
                            e.target.value
                          )
                        }
                        rows={7}
                        className="w-full rounded-lg border border-neutral-300 px-4 py-3"
                      />
                    </div>

                    {update.image_url && (
                      <div>
                        <p className="mb-2 text-sm font-medium">
                          Current Image
                        </p>

                        <div className="relative max-w-md overflow-hidden rounded-xl border">
                          <img
                            src={
                              update.image_url
                            }
                            alt={
                              update.title
                            }
                            className="w-full object-cover"
                          />

                          <button
                            type="button"
                            disabled={
                              isPending
                            }
                            onClick={() =>
                              handleDeleteImage(
                                update.id
                              )
                            }
                            className="absolute right-2 top-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-600 shadow disabled:opacity-50"
                          >
                            Remove Image
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        {update.image_url
                          ? 'Replace Image'
                          : 'Image'}
                      </label>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) =>
                          setEditImage(
                            e.target
                              .files?.[0] ??
                              null
                          )
                        }
                        className="block w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Status
                      </label>

                      <select
                        value={
                          editStatus
                        }
                        onChange={(e) =>
                          setEditStatus(
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3"
                      >
                        <option value="draft">
                          Draft
                        </option>

                        <option value="published">
                          Published
                        </option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        disabled={
                          isPending
                        }
                        onClick={
                          cancelEdit
                        }
                        className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        disabled={
                          isPending
                        }
                        onClick={() =>
                          handleUpdate(
                            update.id
                          )
                        }
                        className="rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {isPending
                          ? 'Saving...'
                          : 'Save Update'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {update.image_url && (
                      <img
                        src={
                          update.image_url
                        }
                        alt={
                          update.title
                        }
                        className="max-h-72 w-full object-cover"
                      />
                    )}

                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-neutral-950">
                          {update.title}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            update.status ===
                            'published'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {update.status}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-neutral-400">
                        {update.status ===
                        'published'
                          ? `Published ${formatDate(
                              update.published_at
                            )}`
                          : `Created ${formatDate(
                              update.created_at
                            )}`}
                      </p>

                      {update.content && (
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                          {update.content}
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap gap-4 border-t border-neutral-100 pt-4">
                        <button
                          type="button"
                          disabled={
                            isPending
                          }
                          onClick={() =>
                            startEdit(
                              update
                            )
                          }
                          className="text-xs font-semibold text-neutral-600 disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={
                            isPending
                          }
                          onClick={() =>
                            handleToggleStatus(
                              update.id
                            )
                          }
                          className="text-xs font-semibold text-blue-600 disabled:opacity-50"
                        >
                          {update.status ===
                          'published'
                            ? 'Move to Draft'
                            : 'Publish'}
                        </button>

                        <button
                          type="button"
                          disabled={
                            isPending
                          }
                          onClick={() =>
                            handleDelete(
                              update.id
                            )
                          }
                          className="text-xs font-semibold text-red-600 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          )}
        </div>
      )}

      {showCreate ? (
        <div className="space-y-5 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Update Title *
            </label>

            <input
              value={newTitle}
              onChange={(e) =>
                setNewTitle(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Content
            </label>

            <textarea
              value={newContent}
              onChange={(e) =>
                setNewContent(
                  e.target.value
                )
              }
              rows={7}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Image
            </label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) =>
                setNewImage(
                  e.target
                    .files?.[0] ??
                    null
                )
              }
              className="block w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Status
            </label>

            <select
              value={newStatus}
              onChange={(e) =>
                setNewStatus(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3"
            >
              <option value="draft">
                Draft
              </option>

              <option value="published">
                Published
              </option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setShowCreate(false)
                setNewTitle('')
                setNewContent('')
                setNewImage(null)
                setNewStatus('draft')
                setError('')
              }}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
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
                ? 'Creating...'
                : 'Create Update'}
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
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold"
        >
          + Add Campaign Update
        </button>
      )}
    </div>
  )
}