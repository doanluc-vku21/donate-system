import Link from 'next/link'

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-[#fffdf8]/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* LOGO */}

        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#173f35] text-lg font-bold text-white">
            H
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight text-[#173f35]">
              HopeFund
            </p>

            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">
              Give with purpose
            </p>
          </div>
        </Link>

        {/* DESKTOP NAV */}

        <nav className="hidden items-center gap-7 lg:flex">
          <Link
            href="/campaigns"
            className="text-sm font-medium text-neutral-700 transition hover:text-[#173f35]"
          >
            Campaigns
          </Link>

          <Link
            href="/news"
            className="text-sm font-medium text-neutral-700 transition hover:text-[#173f35]"
          >
            News
          </Link>

          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-neutral-700 transition hover:text-[#173f35]"
          >
            How It Works
          </Link>

          <Link
            href="/#updates"
            className="text-sm font-medium text-neutral-700 transition hover:text-[#173f35]"
          >
            Updates
          </Link>

          <Link
            href="/about"
            className="text-sm font-medium text-neutral-700 transition hover:text-[#173f35]"
          >
            About
          </Link>

          <Link
            href="/#faq"
            className="text-sm font-medium text-neutral-700 transition hover:text-[#173f35]"
          >
            FAQ
          </Link>
        </nav>

        {/* ACTIONS */}

        <div className="flex items-center gap-3">
          <Link
            href="/campaigns"
            className="hidden rounded-full border border-[#173f35] px-5 py-2.5 text-sm font-semibold text-[#173f35] transition hover:bg-[#173f35] hover:text-white sm:block"
          >
            Explore causes
          </Link>

          <Link
            href="/campaigns"
            className="rounded-full bg-[#b8f06a] px-5 py-2.5 text-sm font-bold text-[#173f35] transition hover:bg-[#a7e457]"
          >
            Donate
          </Link>
        </div>
      </div>
    </header>
  )
}