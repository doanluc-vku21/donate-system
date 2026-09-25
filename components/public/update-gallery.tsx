'use client'

import { useState } from 'react'

type GalleryImage = {
  id: string
  media_url: string
  alt_text: string
}

type UpdateGalleryProps = {
  images: GalleryImage[]
  title: string
}

export default function UpdateGallery({
  images,
  title,
}: UpdateGalleryProps) {
  const [activeIndex, setActiveIndex] =
    useState(0)

  if (
    !Array.isArray(images) ||
    images.length === 0
  ) {
    return null
  }

  const activeImage =
    images[activeIndex]

  function handlePrevious() {
    setActiveIndex(
      (current) =>
        current === 0
          ? images.length - 1
          : current - 1
    )
  }

  function handleNext() {
    setActiveIndex(
      (current) =>
        current === images.length - 1
          ? 0
          : current + 1
    )
  }

  return (
    <div className="space-y-4">
      {/* MAIN IMAGE */}

      <div className="relative overflow-hidden rounded-[30px] bg-[#e7ebdf]">
        <div className="flex min-h-[420px] items-center justify-center sm:min-h-[540px] lg:min-h-[620px]">
          <img
            src={activeImage.media_url}
            alt={
              activeImage.alt_text ||
              title
            }
            className="max-h-[680px] w-full object-contain"
          />
        </div>

        {/* NAVIGATION */}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={
                handlePrevious
              }
              aria-label="Previous image"
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl text-[#173f35] shadow-md transition hover:scale-105"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={
                handleNext
              }
              aria-label="Next image"
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl text-[#173f35] shadow-md transition hover:scale-105"
            >
              ›
            </button>

            {/* COUNTER */}

            <div className="absolute bottom-4 right-4 rounded-full bg-[#173f35]/85 px-3 py-1.5 text-xs font-bold text-white">
              {activeIndex + 1}
              {' / '}
              {images.length}
            </div>
          </>
        )}
      </div>

      {/* THUMBNAILS */}

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map(
            (
              image,
              index
            ) => {
              const active =
                activeIndex ===
                index

              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() =>
                    setActiveIndex(
                      index
                    )
                  }
                  className={`shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    active
                      ? 'border-[#173f35]'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={
                      image.media_url
                    }
                    alt={
                      image.alt_text ||
                      title
                    }
                    className="h-20 w-24 object-cover"
                  />
                </button>
              )
            }
          )}
        </div>
      )}
    </div>
  )
}