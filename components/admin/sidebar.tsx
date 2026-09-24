'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
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
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
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

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-neutral-200 bg-white lg:block">
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

      <nav className="p-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Overview
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
                }`}
              >
                {item.icon}

                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>

        <p className="mb-2 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Fundraising
        </p>

        <div className="space-y-1">
          <div className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-400">
            Donations
          </div>

          <div className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-400">
            Donors
          </div>
        </div>

        <p className="mb-2 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Content
        </p>

        <div className="space-y-1">
          <div className="rounded-lg px-3 py-2.5 text-sm text-neutral-400">
            Blog / News
          </div>

          <div className="rounded-lg px-3 py-2.5 text-sm text-neutral-400">
            Updates
          </div>

          <div className="rounded-lg px-3 py-2.5 text-sm text-neutral-400">
            FAQ
          </div>
        </div>
      </nav>
    </aside>
  )
}