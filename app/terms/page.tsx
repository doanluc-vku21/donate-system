import Link from 'next/link'

import SiteHeader from '@/components/public/site-header'
import SiteFooter from '@/components/public/site-footer'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fffdf8]">
      <SiteHeader />

      <section className="px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-xs font-semibold text-neutral-400">
            <Link
              href="/"
              className="transition hover:text-[#173f35]"
            >
              Home
            </Link>

            <span className="mx-2">/</span>

            <span>Terms</span>
          </div>

          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
              Legal
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-[#173f35] sm:text-5xl">
              Terms of Use
            </h1>

            <p className="mt-4 text-sm text-neutral-400">
              Last updated: September 25, 2026
            </p>
          </div>

          <div className="mt-12 space-y-10 text-[15px] leading-8 text-neutral-600">
            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                1. Acceptance of these terms
              </h2>

              <p className="mt-3">
                By accessing or using HopeFund, you agree to these
                Terms of Use and any policies referenced on the
                website. If you do not agree, you should not use the
                service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                2. Purpose of the service
              </h2>

              <p className="mt-3">
                HopeFund provides tools for presenting fundraising
                campaigns, accepting donations, displaying fundraising
                progress, sharing campaign updates, and providing
                information to donors.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                3. Eligibility
              </h2>

              <p className="mt-3">
                You may use the service only if you are legally able
                to enter into transactions and agreements applicable
                to your use of the website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                4. Donations
              </h2>

              <p className="mt-3">
                When making a donation, you are responsible for
                reviewing the campaign information and confirming the
                amount, donation frequency, and other options before
                completing payment.
              </p>

              <p className="mt-3">
                Donation payments are processed by Stripe or another
                supported payment processor. Additional terms from
                the payment provider may apply.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                5. Recurring donations
              </h2>

              <p className="mt-3">
                If you choose a monthly donation, you authorize
                recurring charges according to the amount and
                frequency shown at checkout until the recurring
                donation is canceled or otherwise ends.
              </p>

              <p className="mt-3">
                Additional information about recurring donations,
                cancellation, and payment handling is provided in the
                Donation Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                6. Campaign information
              </h2>

              <p className="mt-3">
                Campaign pages may contain descriptions, goals,
                budgets, images, updates, and other information
                related to the fundraising effort. Information may
                change as a campaign progresses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                7. Prohibited use
              </h2>

              <p className="mt-3">
                You may not use the website for unlawful activity,
                fraud, abuse, unauthorized access, interference with
                the service, attempts to bypass security controls, or
                any activity that could harm users, campaigns, or the
                platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                8. Intellectual property
              </h2>

              <p className="mt-3">
                Website design, branding, software, text, graphics,
                and other original platform materials may be protected
                by intellectual property laws. Campaign-specific
                content may belong to its respective creator or
                rights holder.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                9. Availability of the service
              </h2>

              <p className="mt-3">
                We may modify, suspend, or temporarily interrupt parts
                of the website for maintenance, security,
                infrastructure changes, or other operational reasons.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                10. Third-party services
              </h2>

              <p className="mt-3">
                HopeFund relies on third-party services such as Stripe,
                hosting providers, database providers, and email
                delivery providers. Those services operate under
                their own terms and policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                11. Disclaimer
              </h2>

              <p className="mt-3">
                Information on the website is provided for
                informational and fundraising purposes. While we aim
                to present information clearly and accurately, the
                service is provided on an as-available basis and may
                contain errors, delays, or interruptions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                12. Limitation of liability
              </h2>

              <p className="mt-3">
                To the extent permitted by applicable law, HopeFund
                and its operators will not be liable for indirect,
                incidental, special, consequential, or similar losses
                arising from use of the service, third-party services,
                or campaign activity.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                13. Changes to these terms
              </h2>

              <p className="mt-3">
                We may update these Terms from time to time. Updated
                terms will be posted on this page with a revised
                last-updated date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                14. Governing law
              </h2>

              <p className="mt-3">
                The governing law and jurisdiction for these Terms
                should be identified before production launch based on
                the legal entity operating HopeFund.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                15. Contact
              </h2>

              <p className="mt-3">
                Questions about these Terms may be submitted through
                the contact information provided on the website.
              </p>

              <Link
                href="/contact"
                className="mt-4 inline-flex font-bold text-[#173f35] hover:underline"
              >
                Contact us →
              </Link>
            </section>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}