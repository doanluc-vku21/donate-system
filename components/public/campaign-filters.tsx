'use client'

import {
  FormEvent,
  useEffect,
  useState,
} from 'react'

import {
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation'

type Category = {
  id: string
  name: string
  slug: string
}

export default function CampaignFilters({
  categories,
  initialSearch = '',
  initialCategory = '',
}: {
  categories: Category[]
  initialSearch?: string
  initialCategory?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams =
    useSearchParams()

  const [search, setSearch] =
    useState(initialSearch)

  useEffect(() => {
    setSearch(initialSearch)
  }, [initialSearch])

  function buildUrl(
    values: {
      q?: string | null
      category?: string | null
      page?: string | null
    }
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString()
      )

    Object.entries(
      values
    ).forEach(
      ([key, value]) => {
        if (
          !value ||
          value === 'all'
        ) {
          params.delete(key)
        } else {
          params.set(
            key,
            value
          )
        }
      }
    )

    const query =
      params.toString()

    return query
      ? `${pathname}?${query}`
      : pathname
  }

  function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault()

    router.push(
      buildUrl({
        q:
          search.trim() ||
          null,
        page: null,
      })
    )
  }

  function handleCategory(
    categoryId: string
  ) {
    router.push(
      buildUrl({
        category:
          categoryId ===
          'all'
            ? null
            : categoryId,
        page: null,
      })
    )
  }

  function clearFilters() {
    setSearch('')

    router.push(
      pathname
    )
  }

  const hasFilters =
    Boolean(
      initialSearch ||
        initialCategory
    )

  return (
    <div className="space-y-5">
      {/* SEARCH */}

      <form
        onSubmit={
          handleSubmit
        }
        className="flex w-full rounded-full border border-neutral-300 bg-white p-1.5 shadow-sm transition focus-within:border-[#2c755e]"
      >
        <div className="flex min-w-0 flex-1 items-center">
          <span className="pl-4 text-neutral-400">
            ⌕
          </span>

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            type="search"
            placeholder="Search by campaign, location or story..."
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
          />
        </div>

        <button
          type="submit"
          className="shrink-0 rounded-full bg-[#173f35] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#225647]"
        >
          Search
        </button>
      </form>

      {/* CATEGORY */}

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() =>
            handleCategory(
              'all'
            )
          }
          className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
            !initialCategory
              ? 'bg-[#173f35] text-white'
              : 'border border-neutral-200 bg-white text-neutral-600 hover:border-[#173f35]'
          }`}
        >
          All campaigns
        </button>

        {categories.map(
          (category) => {
            const active =
              initialCategory ===
              category.id

            return (
              <button
                type="button"
                key={
                  category.id
                }
                onClick={() =>
                  handleCategory(
                    category.id
                  )
                }
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
                  active
                    ? 'bg-[#173f35] text-white'
                    : 'border border-neutral-200 bg-white text-neutral-600 hover:border-[#173f35]'
                }`}
              >
                {
                  category.name
                }
              </button>
            )
          }
        )}

        {hasFilters && (
          <button
            type="button"
            onClick={
              clearFilters
            }
            className="whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}