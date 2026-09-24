'use client'

import {
  useState,
  useTransition,
} from 'react'

import {
  deleteGalleryImage,
  reorderGallery,
} from './actions'

type Media = {
  id: string
  media_url: string
  storage_path: string
  media_type: string
  alt_text: string | null
  sort_order: number
}

export default function GalleryManager({
  campaignId,
  initialMedia,
}: {
  campaignId: string
  initialMedia: Media[]
}) {
  const [media, setMedia] =
    useState(
      [...initialMedia].sort(
        (a, b) =>
          a.sort_order -
          b.sort_order
      )
    )

  const [
    draggedId,
    setDraggedId,
  ] = useState<string | null>(
    null
  )

  const [
    isPending,
    startTransition,
  ] = useTransition()

  function handleDragStart(
    id: string
  ) {
    setDraggedId(id)
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

    const next = [...media]

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

    setMedia(normalized)
    setDraggedId(null)

    startTransition(
      async () => {
        await reorderGallery(
          campaignId,
          normalized.map(
            (item) =>
              item.id
          )
        )
      }
    )
  }

  function handleDelete(
    mediaId: string
  ) {
    const confirmed =
      window.confirm(
        'Remove this image from the gallery?'
      )

    if (!confirmed) {
      return
    }

    setMedia((current) =>
      current.filter(
        (item) =>
          item.id !== mediaId
      )
    )

    startTransition(
      async () => {
        try {
          await deleteGalleryImage(
            campaignId,
            mediaId
          )
        } catch (error) {
          console.error(error)
          window.location.reload()
        }
      }
    )
  }

  if (media.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50">
        <p className="text-sm text-neutral-400">
          No gallery images
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-3 text-xs text-neutral-500">
        Drag images to reorder them.
      </p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {media.map(
          (item, index) => (
            <div
              key={item.id}
              draggable={
                !isPending
              }
              onDragStart={() =>
                handleDragStart(
                  item.id
                )
              }
              onDragOver={(
                event
              ) =>
                event.preventDefault()
              }
              onDrop={() =>
                handleDrop(
                  item.id
                )
              }
              className={`group relative cursor-grab overflow-hidden rounded-xl border bg-white transition ${
                draggedId ===
                item.id
                  ? 'scale-[0.98] opacity-50'
                  : 'border-neutral-200'
              }`}
            >
              <img
                src={
                  item.media_url
                }
                alt={
                  item.alt_text ||
                  ''
                }
                draggable={false}
                className="aspect-square w-full object-cover"
              />

              <div className="flex items-center justify-between border-t border-neutral-200 px-3 py-2">
                <span className="text-xs font-medium text-neutral-500">
                  #{index + 1}
                </span>

                <span className="text-xs text-neutral-400">
                  Drag
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleDelete(
                    item.id
                  )
                }
                disabled={
                  isPending
                }
                className="absolute right-2 top-2 rounded-md bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          )
        )}
      </div>

      {isPending && (
        <p className="mt-3 text-xs text-neutral-500">
          Saving gallery changes...
        </p>
      )}
    </div>
  )
}