'use client'

import {
  useState,
  useTransition,
} from 'react'

import {
  deleteFeaturedImage,
} from './actions'

export default function FeaturedImageManager({
  campaignId,
  imageUrl,
  title,
}: {
  campaignId: string
  imageUrl: string | null
  title: string
}) {
  const [
    currentImage,
    setCurrentImage,
  ] = useState(imageUrl)

  const [
    isPending,
    startTransition,
  ] = useTransition()

  function handleDelete() {
    const confirmed =
      window.confirm(
        'Delete the featured image?'
      )

    if (!confirmed) {
      return
    }

    startTransition(
      async () => {
        try {
          await deleteFeaturedImage(
            campaignId
          )

          setCurrentImage(null)
        } catch (error) {
          console.error(error)

          window.alert(
            'Failed to delete featured image.'
          )
        }
      }
    )
  }

  if (!currentImage) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50">
        <p className="text-sm text-neutral-400">
          No featured image
        </p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
      <img
        src={currentImage}
        alt={title}
        className="h-64 w-full object-cover"
      />

      <button
        type="button"
        disabled={isPending}
        onClick={
          handleDelete
        }
        className="absolute right-3 top-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-50"
      >
        {isPending
          ? 'Removing...'
          : 'Delete'}
      </button>
    </div>
  )
}