'use client'

import { useState } from 'react'

type Media = {
  id: string
  media_url: string
  alt_text: string | null
  sort_order: number
}

export default function CampaignGallery({
  featuredImage,
  title,
  media,
}: {
  featuredImage: string | null
  title: string
  media: Media[]
}) {
  const images = [
    ...(featuredImage
      ? [
          {
            id: 'featured',
            media_url: featuredImage,
            alt_text: title,
            sort_order: -1,
          },
        ]
      : []),
    ...media,
  ]

  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-[28px] bg-[#edf1e9] text-sm text-neutral-400">
        No campaign image
      </div>
    )
  }

  const activeImage = images[activeIndex]

  function previousImage() {
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    )
  }

  function nextImage() {
    setActiveIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    )
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-[24px] bg-[#edf1e9]">
        <img
          src={activeImage.media_url}
          alt={activeImage.alt_text || title}
          className="aspect-[16/10] w-full object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={previousImage}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-[#173f35] shadow-md transition hover:bg-white"
            >
              ←
            </button>

            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-[#173f35] shadow-md transition hover:bg-white"
            >
              →
            </button>

            <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 overflow-hidden rounded-lg border-2 transition ${
                activeIndex === index
                  ? 'border-[#173f35]'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={image.media_url}
                alt={image.alt_text || title}
                className="h-16 w-20 object-cover sm:h-20 sm:w-24"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}