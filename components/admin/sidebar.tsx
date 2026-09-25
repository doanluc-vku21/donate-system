'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type MenuItem = {
  name: string
  href: string
  icon: React.ReactNode
}

const overviewItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1"
        />

        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1"
        />

        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1"
        />

        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1"
        />
      </svg>
    ),
  },

  {
    name: 'Campaigns',
    href: '/admin/campaigns',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z" />
      </svg>
    ),
  },
]

const fundraisingItems: MenuItem[] = [
  {
    name: 'Donations',
    href: '/admin/donations',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
        />

        <path d="M3 9h18" />

        <path d="M7 15h3" />
      </svg>
    ),
  },

  {
    name: 'Donors',
    href: '/admin/donors',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <circle
          cx="9"
          cy="8"
          r="3"
        />

        <path d="M3.5 19c.7-3.2 2.6-5 5.5-5s4.8 1.8 5.5 5" />

        <path d="M16 7h5" />

        <path d="M18.5 4.5v5" />
      </svg>
    ),
  },
]

const contentItems: MenuItem[] = [
  {
    name: 'Blog / News',
    href: '/admin/news',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="2"
        />

        <path d="M8 9h8" />

        <path d="M8 13h8" />

        <path d="M8 17h5" />
      </svg>
    ),
  },

  {
    name: 'FAQ',
    href: '/admin/faq',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
        />

        <path d="M9.8 9a2.4 2.4 0 0 1 4.5 1.2c0 1.8-2.3 2-2.3 3.8" />

        <path d="M12 17h.01" />
      </svg>
    ),
  },

  {
    name: 'Updates',
    href: '/admin/updates',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M4 6h16" />

        <path d="M4 12h16" />

        <path d="M4 18h10" />
      </svg>
    ),
  },
]

function AdminMenuLink({
  item,
}: {
  item: MenuItem
}) {
  const pathname =
    usePathname()

  const active =
    item.href === '/admin'
      ? pathname === '/admin'
      : pathname.startsWith(
          item.href
        )

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? 'bg-neutral-900 text-white'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
      }`}
    >
      {item.icon}

      <span>
        {item.name}
      </span>
    </Link>
  )
}

export default function AdminSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-neutral-200 bg-white lg:block">
      {/* BRAND */}

      <div className="flex h-20 items-center border-b border-neutral-200 px-6">
        <Link href="/admin">
          <div className="text-xl font-bold text-neutral-950">
            Donate System
          </div>

          <div className="mt-0.5 text-xs text-neutral-500">
            Administration
          </div>
        </Link>
      </div>

      {/* NAV */}

      <nav className="h-[calc(100vh-5rem)] overflow-y-auto p-4">
        {/* OVERVIEW */}

        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Overview
        </p>

        <div className="space-y-1">
          {overviewItems.map(
            (item) => (
              <AdminMenuLink
                key={item.href}
                item={item}
              />
            )
          )}
        </div>

        {/* FUNDRAISING */}

        <p className="mb-2 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Fundraising
        </p>

        <div className="space-y-1">
          {fundraisingItems.map(
            (item) => (
              <AdminMenuLink
                key={item.href}
                item={item}
              />
            )
          )}
        </div>

        {/* CONTENT */}

        <p className="mb-2 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Content
        </p>

        <div className="space-y-1">
          {contentItems.map(
            (item) => (
              <AdminMenuLink
                key={item.href}
                item={item}
              />
            )
          )}
        </div>

        {/* WEBSITE */}

        <p className="mb-2 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Website
        </p>

        <div className="space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              />

              <path d="M3 12h18" />

              <path d="M12 3a15 15 0 0 1 0 18" />

              <path d="M12 3a15 15 0 0 0 0 18" />
            </svg>

            <span>
              View website
            </span>

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="ml-auto h-4 w-4"
            >
              <path d="M14 5h5v5" />

              <path d="M10 14 19 5" />

              <path d="M19 14v5H5V5h5" />
            </svg>
          </Link>
        </div>
      </nav>
    </aside>
  )
}