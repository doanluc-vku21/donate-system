'use client'

import { useState } from 'react'
import { updateCampaign } from './actions'
import GalleryManager from './gallery-manager'
import FeaturedImageManager from './featured-image-manager'
import FundUsageManager from './fund-usage-manager'
import CampaignUpdatesManager from './campaign-updates-manager'
import DonationSettingsManager from './donation-settings-manager'

type Category = {
  id: string
  name: string
}

type Media = {
  id: string
  media_url: string
  storage_path: string
  media_type: string
  alt_text: string | null
  sort_order: number
}

type FundItem = {
  id: string
  title: string
  description: string | null
  amount_cents: number
  sort_order: number
}

type Campaign = {
  id: string

  title: string
  slug: string

  category_id: string | null

  short_description: string | null
  content: string | null

  featured_image_url: string | null
  featured_image_path: string | null

  goal_amount_cents: number
  raised_amount_cents: number

  currency: string
  location: string | null

  status: string
  is_featured: boolean

  start_date: string | null
  end_date: string | null

  published_at: string | null

  created_at: string
  updated_at: string
}
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
type DonationSettings = {
  campaign_id: string
  enable_one_time: boolean
  enable_monthly: boolean
  allow_custom_amount: boolean
  allow_anonymous: boolean
  allow_cover_fee: boolean
  minimum_amount_cents: number
  default_frequency:
    | 'one_time'
    | 'monthly'
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

function toDateTimeLocal(
  value: string | null
) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  const pad = (
    number: number
  ) =>
    number
      .toString()
      .padStart(2, '0')

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`
}

export default function CampaignEditForm({
  campaign,
  categories,
  media,
  fundItems,
  updates,
  donationSettings,
  donationOptions,
}: {
  campaign: Campaign
  categories: Category[]
  media: Media[]
  fundItems: FundItem[]
  updates: CampaignUpdate[]

  donationSettings:
    | DonationSettings
    | null

  donationOptions:
    DonationOption[]
}) {
  const [title, setTitle] =
    useState(
      campaign.title
    )

  const [slug, setSlug] =
    useState(
      campaign.slug
    )

  // Edit campaign:
  // không tự động thay slug khi đổi title
  const [slugTouched, setSlugTouched] =
    useState(true)

  const updateCampaignWithId =
    updateCampaign.bind(
      null,
      campaign.id
    )

  function handleTitleChange(
    value: string
  ) {
    setTitle(value)

    if (!slugTouched) {
      setSlug(
        slugify(value)
      )
    }
  }

  return (
    <form
      action={updateCampaignWithId}
      className="space-y-8"
    >
      {/* =================================
          BASIC INFORMATION
      ================================= */}

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Basic Information
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Update the main campaign information.
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
              defaultValue={
                campaign.category_id ??
                ''
              }
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
              defaultValue={
                campaign.short_description ??
                ''
              }
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
              defaultValue={
                campaign.content ??
                ''
              }
              className="w-full resize-y rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
            />
          </div>
        </div>
      </div>

      {/* =================================
          CAMPAIGN MEDIA
      ================================= */}

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Campaign Media
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Manage featured image and gallery images.
          </p>
        </div>

        <div className="grid gap-8">
          {/* FEATURED IMAGE */}

          <div>
            <label className="mb-3 block text-sm font-medium text-neutral-700">
              Featured Image
            </label>

            <FeaturedImageManager
              campaignId={
                campaign.id
              }
              imageUrl={
                campaign.featured_image_url
              }
              title={
                campaign.title
              }
            />

            <div className="mt-4">
              <input
                name="featured_image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="block w-full cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-700"
              />
            </div>

            <p className="mt-2 text-xs text-neutral-500">
              Upload a new image to replace the current featured image.
            </p>
          </div>

          {/* GALLERY */}

          <div>
            <label className="mb-3 block text-sm font-medium text-neutral-700">
              Campaign Gallery
            </label>

            <GalleryManager
              campaignId={
                campaign.id
              }
              initialMedia={
                media
              }
            />

            <div className="mt-5">
              <input
                name="gallery_images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="block w-full cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-700"
              />
            </div>

            <p className="mt-2 text-xs text-neutral-500">
              New images will be added to the existing gallery.
            </p>
          </div>
        </div>
      </div>

      {/* =================================
          FUNDRAISING
      ================================= */}

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Fundraising
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Set the campaign fundraising goal and currency.
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
              defaultValue={
                campaign.goal_amount_cents /
                100
              }
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
              defaultValue={
                campaign.currency
              }
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
              defaultValue={
                campaign.location ??
                ''
              }
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
            />
          </div>
        </div>
      </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
  <div className="mb-6">
    <h2 className="text-lg font-semibold text-neutral-900">
      Donation Settings
    </h2>

    <p className="mt-1 text-sm text-neutral-500">
      Configure donation frequencies, suggested amounts and donor options for this campaign.
    </p>
  </div>

  <DonationSettingsManager
    campaignId={campaign.id}
    currency={campaign.currency}
    initialSettings={
      donationSettings
    }
    initialOptions={
      donationOptions
    }
  />
</div>
      {/* =================================
          PLANNED USE OF FUNDS
      ================================= */}

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Planned Use of Funds
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Explain how donations for this campaign are expected to be used.
          </p>
        </div>

        <FundUsageManager
          campaignId={
            campaign.id
          }
          goalAmountCents={
            campaign.goal_amount_cents
          }
          currency={
            campaign.currency
          }
          initialItems={
            fundItems
          }
        />
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
  <div className="mb-6">
    <h2 className="text-lg font-semibold text-neutral-900">
      Campaign Updates
    </h2>

    <p className="mt-1 text-sm text-neutral-500">
      Share progress, milestones and news with campaign donors.
    </p>
  </div>

  <CampaignUpdatesManager
    campaignId={campaign.id}
    initialUpdates={updates}
  />
</div>
      {/* =================================
          PUBLISHING
      ================================= */}

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Publishing
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Control campaign visibility and status.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* STATUS */}

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Status
            </label>

            <select
              name="status"
              defaultValue={
                campaign.status
              }
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
                defaultChecked={
                  campaign.is_featured
                }
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
              defaultValue={
                toDateTimeLocal(
                  campaign.start_date
                )
              }
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
              defaultValue={
                toDateTimeLocal(
                  campaign.end_date
                )
              }
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
            />
          </div>
        </div>
      </div>

      {/* =================================
          ACTIONS
      ================================= */}

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
          Save Changes
        </button>
      </div>
    </form>
  )
}