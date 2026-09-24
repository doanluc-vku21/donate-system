'use client'

import { useState } from 'react'
import { createCampaign } from './actions'

type Category = {
  id: string
  name: string
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function CampaignForm({
  categories,
}: {
  categories: Category[]
}) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] =
    useState(false)

  function handleTitleChange(value: string) {
    setTitle(value)

    if (!slugTouched) {
      setSlug(slugify(value))
    }
  }

  return (
    <form
      action={createCampaign}
      className="space-y-8"
    >
      {/* =========================
          BASIC INFORMATION
      ========================= */}

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Basic Information
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Main information shown on the
            campaign page.
          </p>
        </div>

        <div className="grid gap-6">
          {/* TITLE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Campaign Title *
            </label>

            <input
              name="title"
              value={title}
              onChange={(e) =>
                handleTitleChange(
                  e.target.value
                )
              }
              type="text"
              required
              placeholder="Help Build a Better Future"
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-900"
            />
          </div>

          {/* SLUG */}

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Slug *
            </label>

            <div className="flex rounded-lg border border-neutral-300 focus-within:border-neutral-900">
              <span className="flex items-center border-r border-neutral-300 bg-neutral-50 px-3 text-sm text-neutral-500">
                /campaigns/
              </span>

              <input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true)

                  setSlug(
                    slugify(
                      e.target.value
                    )
                  )
                }}
                type="text"
                required
                className="min-w-0 flex-1 rounded-r-lg px-4 py-3 outline-none"
              />
            </div>
          </div>

          {/* CATEGORY */}

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Category
            </label>

            <select
              name="category_id"
              defaultValue=""
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-neutral-900"
            >
              <option value="">
                No category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* SHORT DESCRIPTION */}

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Short Description
            </label>

            <textarea
              name="short_description"
              rows={3}
              placeholder="A short summary of the campaign..."
              className="w-full resize-y rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
            />
          </div>

          {/* STORY */}

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Campaign Story
            </label>

            <textarea
              name="content"
              rows={10}
              placeholder="Tell the story behind this campaign..."
              className="w-full resize-y rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
            />
          </div>
        </div>
      </div>

      {/* =========================
          MEDIA
      ========================= */}

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Campaign Media
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Upload a main campaign image and
            optional gallery images.
          </p>
        </div>

        <div className="grid gap-6">
          {/* FEATURED IMAGE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Featured Image
            </label>

            <input
              name="featured_image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block w-full cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-700"
            />

            <p className="mt-2 text-xs text-neutral-500">
              JPG, PNG or WEBP. Maximum
              10MB.
            </p>
          </div>

          {/* GALLERY */}

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Campaign Gallery
            </label>

            <input
              name="gallery_images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="block w-full cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-700"
            />

            <p className="mt-2 text-xs text-neutral-500">
              You can select multiple images
              for the campaign gallery.
            </p>
          </div>
        </div>
      </div>

      {/* =========================
          FUNDRAISING
      ========================= */}

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Fundraising
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Set the fundraising target and
            currency.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* GOAL */}

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Goal Amount *
            </label>

            <input
              name="goal_amount"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="10000"
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
            />
          </div>

          {/* CURRENCY */}

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Currency
            </label>

            <select
              name="currency"
              defaultValue="USD"
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-neutral-900"
            >
              <option value="USD">
                USD
              </option>

              <option value="EUR">
                EUR
              </option>

              <option value="GBP">
                GBP
              </option>

              <option value="AUD">
                AUD
              </option>

              <option value="CAD">
                CAD
              </option>
            </select>
          </div>

          {/* LOCATION */}

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Location
            </label>

            <input
              name="location"
              type="text"
              placeholder="Da Nang, Vietnam"
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
            />
          </div>
        </div>
      </div>

      {/* =========================
          PUBLISHING
      ========================= */}

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Publishing
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* STATUS */}

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Status
            </label>

            <select
              name="status"
              defaultValue="draft"
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-neutral-900"
            >
              <option value="draft">
                Draft
              </option>

              <option value="published">
                Published
              </option>

              <option value="paused">
                Paused
              </option>

              <option value="completed">
                Completed
              </option>
            </select>
          </div>

          {/* FEATURED */}

          <div className="flex items-end">
            <label className="flex h-[50px] w-full cursor-pointer items-center gap-3 rounded-lg border border-neutral-300 px-4">
              <input
                name="is_featured"
                type="checkbox"
                className="h-4 w-4"
              />

              <span className="text-sm font-medium text-neutral-700">
                Featured Campaign
              </span>
            </label>
          </div>

          {/* START DATE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Start Date
            </label>

            <input
              name="start_date"
              type="datetime-local"
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
            />
          </div>

          {/* END DATE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              End Date
            </label>

            <input
              name="end_date"
              type="datetime-local"
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
            />
          </div>
        </div>
      </div>

      {/* =========================
          ACTIONS
      ========================= */}

      <div className="flex justify-end gap-3">
        <a
          href="/admin/campaigns"
          className="rounded-lg border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Cancel
        </a>

        <button
          type="submit"
          className="rounded-lg bg-neutral-950 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Create Campaign
        </button>
      </div>
    </form>
  )
}