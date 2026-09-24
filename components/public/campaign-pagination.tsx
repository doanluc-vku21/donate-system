'use client'

import {
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation'

export default function CampaignPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  const router = useRouter()
  const pathname = usePathname()

  const searchParams =
    useSearchParams()

  if (totalPages <= 1) {
    return null
  }

  function goToPage(
    page: number
  ) {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return
    }

    const params =
      new URLSearchParams(
        searchParams.toString()
      )

    if (page === 1) {
      params.delete('page')
    } else {
      params.set(
        'page',
        String(page)
      )
    }

    const query =
      params.toString()

    router.push(
      query
        ? `${pathname}?${query}`
        : pathname
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function getPages() {
    const pages:
      (
        | number
        | 'ellipsis-left'
        | 'ellipsis-right'
      )[] = []

    if (totalPages <= 7) {
      for (
        let page = 1;
        page <= totalPages;
        page++
      ) {
        pages.push(page)
      }

      return pages
    }

    pages.push(1)

    if (
      currentPage > 4
    ) {
      pages.push(
        'ellipsis-left'
      )
    }

    const start =
      Math.max(
        2,
        currentPage - 1
      )

    const end =
      Math.min(
        totalPages - 1,
        currentPage + 1
      )

    for (
      let page = start;
      page <= end;
      page++
    ) {
      pages.push(page)
    }

    if (
      currentPage <
      totalPages - 3
    ) {
      pages.push(
        'ellipsis-right'
      )
    }

    pages.push(
      totalPages
    )

    return pages
  }

  const pages =
    getPages()

  return (
    <nav
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
      aria-label="Campaign pagination"
    >
      <button
        type="button"
        disabled={
          currentPage <= 1
        }
        onClick={() =>
          goToPage(
            currentPage - 1
          )
        }
        className="flex h-10 items-center justify-center rounded-full border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-600 transition hover:border-[#173f35] disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Previous
      </button>

      {pages.map(
        (page) => {
          if (
            page ===
              'ellipsis-left' ||
            page ===
              'ellipsis-right'
          ) {
            return (
              <span
                key={page}
                className="flex h-10 w-10 items-center justify-center text-sm text-neutral-400"
              >
                …
              </span>
            )
          }

          const active =
            page ===
            currentPage

          return (
            <button
              type="button"
              key={page}
              onClick={() =>
                goToPage(page)
              }
              className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition ${
                active
                  ? 'bg-[#173f35] text-white'
                  : 'border border-neutral-200 bg-white text-neutral-600 hover:border-[#173f35]'
              }`}
            >
              {page}
            </button>
          )
        }
      )}

      <button
        type="button"
        disabled={
          currentPage >=
          totalPages
        }
        onClick={() =>
          goToPage(
            currentPage + 1
          )
        }
        className="flex h-10 items-center justify-center rounded-full border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-600 transition hover:border-[#173f35] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next →
      </button>
    </nav>
  )
}