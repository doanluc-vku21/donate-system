import Link from 'next/link'

import SiteHeader from '@/components/public/site-header'
import SiteFooter from '@/components/public/site-footer'

export default function ManageDonationPage() {
  const portalUrl =
    process.env.NEXT_PUBLIC_STRIPE_PORTAL_URL

  return (
    <main className="min-h-screen bg-[#fffdf8]">
      <SiteHeader />

      <section className="px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[30px] border border-neutral-200 bg-white p-8 sm:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
              Monthly giving
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-[-0.045em] text-[#173f35]">
              Manage your monthly donation
            </h1>

            <p className="mt-5 text-sm leading-7 text-neutral-600">
              Use the email address associated with your monthly
              donation to securely access your billing information
              and recurring donation settings.
            </p>

            <div className="mt-8 rounded-2xl bg-[#edf4e7] p-5">
              <p className="font-bold text-[#173f35]">
                In the secure Stripe portal you can:
              </p>

              <div className="mt-4 space-y-2 text-sm text-neutral-600">
                <p>✓ Update your payment method</p>
                <p>✓ View invoices and payment history</p>
                <p>✓ Manage your monthly donation</p>
                <p>✓ Cancel future recurring donations</p>
              </div>
            </div>

            {portalUrl ? (
              <a
                href={portalUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 flex w-full items-center justify-center rounded-full bg-[#173f35] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#215844]"
              >
                Manage monthly donation
              </a>
            ) : (
              <div className="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
                Stripe Customer Portal has not been configured yet.
              </div>
            )}

            <p className="mt-5 text-center text-xs leading-5 text-neutral-400">
              You will be redirected to Stripe&apos;s secure customer
              portal.
            </p>

            <div className="mt-8 border-t border-neutral-200 pt-6 text-center">
              <Link
                href="/contact"
                className="text-sm font-semibold text-[#173f35] hover:underline"
              >
                Need help? Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}