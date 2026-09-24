'use client'

import {
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'
import CampaignCard, {
  type PublicCampaign,
} from './campaign-card'

type Category = {
  id: string
  name: string
  slug: string
}

export default function CampaignBrowser({
  campaigns,
  categories,
}: {
  campaigns: PublicCampaign[]
  categories: Category[]
}) {
  const [search, setSearch] =
    useState('')

  const [
    categoryId,
    setCategoryId,
  ] = useState('all')

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase()

      return campaigns.filter(
        (campaign) => {
          const matchesCategory =
            categoryId === 'all' ||
            campaign.category_id ===
              categoryId

          const matchesSearch =
            !query ||
            campaign.title
              .toLowerCase()
              .includes(query) ||
            campaign.short_description
              ?.toLowerCase()
              .includes(query) ||
            campaign.location
              ?.toLowerCase()
              .includes(query)

          return (
            matchesCategory &&
            matchesSearch
          )
        }
      )
    }, [
      campaigns,
      categoryId,
      search,
    ])

  return (
    <section
      id="campaigns"
      className="px-5 py-20 lg:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
              Find your next act of kindness
            </p>

            <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-[-0.04em] text-[#142f28] sm:text-5xl">
              A story. A person.
              <br />
              A chance to help.
            </h2>
          </div>

          <div className="w-full lg:max-w-sm">
            <div className="flex rounded-full border border-neutral-300 bg-white p-1">
              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search campaigns..."
                className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm outline-none"
              />

              <button
                type="button"
                className="rounded-full bg-[#173f35] px-5 text-sm font-semibold text-white"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() =>
              setCategoryId('all')
            }
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold ${
              categoryId === 'all'
                ? 'bg-[#173f35] text-white'
                : 'border border-neutral-200 bg-white text-neutral-600'
            }`}
          >
            All campaigns
          </button>

          {categories.map(
            (category) => (
              <button
                type="button"
                key={category.id}
                onClick={() =>
                  setCategoryId(
                    category.id
                  )
                }
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold ${
                  categoryId ===
                  category.id
                    ? 'bg-[#173f35] text-white'
                    : 'border border-neutral-200 bg-white text-neutral-600'
                }`}
              >
                {category.name}
              </button>
            )
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered
              .slice(0, 6)
              .map(
                (campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={
                      campaign
                    }
                  />
                )
              )}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-neutral-300 px-6 py-16 text-center">
            <p className="font-semibold text-neutral-700">
              No campaigns found
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              Try another search or category.
            </p>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/campaigns"
            className="inline-flex rounded-full border border-[#173f35] px-6 py-3 text-sm font-bold text-[#173f35] transition hover:bg-[#173f35] hover:text-white"
          >
            Explore all campaigns →
          </Link>
        </div>
      </div>
    </section>
  )
}