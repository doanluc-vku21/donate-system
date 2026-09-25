import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-[#f3f5f0] px-5 py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xl font-bold text-[#173f35]">
              HopeFund
            </p>

            <p className="mt-4 max-w-xs text-sm leading-6 text-neutral-500">
              Connecting people who want to help with people who need support.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-[#173f35]">
              Explore
            </p>

            <div className="mt-4 space-y-3 text-sm text-neutral-500">
              <Link
                className="block hover:text-[#173f35]"
                href="/campaigns"
              >
                Campaigns
              </Link>

              <Link
                className="block hover:text-[#173f35]"
                href="/how-it-works"
              >
                How It Works
              </Link>

              <Link
                className="block hover:text-[#173f35]"
                href="/#updates"
              >
                Updates
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-[#173f35]">
              Organization
            </p>

            <div className="mt-4 space-y-3 text-sm text-neutral-500">
              <Link
                href="/about"
                className="block"
              >
                About
              </Link>

              <Link
                href="/faq"
                className="block"
              >
                FAQ
              </Link>

              <Link
                href="/contact"
                className="block"
              >
                Contact
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-[#173f35]">
              Legal
            </p>

            <div className="mt-4 space-y-3 text-sm text-neutral-500">
              <Link
                href="/privacy"
                className="block"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="block"
              >
                Terms
              </Link>

              <Link
                href="/donation-policy"
                className="block"
              >
                Donation Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-neutral-200 pt-6 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} HopeFund. All rights reserved.
          </p>

          <p>
            Built for transparent giving.
          </p>
        </div>
      </div>
    </footer>
  )
}