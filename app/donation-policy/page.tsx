import Link from 'next/link'

import SiteHeader from '@/components/public/site-header'
import SiteFooter from '@/components/public/site-footer'

export default function DonationPolicyPage() {
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

            <span>Donation Policy</span>
          </div>

          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
              Giving
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-[#173f35] sm:text-5xl">
              Donation Policy
            </h1>

            <p className="mt-4 text-sm text-neutral-400">
              Last updated: September 25, 2026
            </p>
          </div>

          <div className="mt-12 space-y-10 text-[15px] leading-8 text-neutral-600">
            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                1. Overview
              </h2>

              <p className="mt-3">
                This Donation Policy explains how donations made
                through HopeFund are handled, including payment
                processing, recurring donations, processing costs,
                confirmations, and related donation records.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                2. Donation amounts
              </h2>

              <p className="mt-3">
                Campaigns may offer suggested donation amounts and may
                also allow donors to enter a custom amount. Minimum
                donation amounts may apply depending on the campaign.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                3. One-time donations
              </h2>

              <p className="mt-3">
                A one-time donation is charged once at checkout. After
                successful payment, the donation is recorded against
                the selected campaign.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                4. Monthly donations
              </h2>

              <p className="mt-3">
                If monthly giving is enabled for a campaign, donors
                may choose to make a recurring monthly donation.
              </p>

              <p className="mt-3">
                By selecting monthly giving and completing checkout,
                you authorize the payment provider to charge the
                recurring amount according to the monthly schedule
                until the recurring donation is canceled or otherwise
                ends.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                5. Processing cost contribution
              </h2>

              <p className="mt-3">
                Some campaigns may allow donors to voluntarily help
                cover payment processing costs. If selected, the
                additional amount will be shown before checkout and
                included in the total payment.
              </p>

              <p className="mt-3">
                Processing cost contributions are tracked separately
                from the campaign donation amount where applicable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                6. Anonymous donations
              </h2>

              <p className="mt-3">
                Where available, donors may choose to make their
                public contribution anonymous. This affects how the
                donor may be displayed publicly, but it does not
                prevent necessary payment, security, or recordkeeping
                information from being retained privately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                7. Payment processing
              </h2>

              <p className="mt-3">
                Payments are processed through Stripe. Payment
                authorization, settlement, card handling, recurring
                billing, and certain payment-related functions are
                performed through Stripe&apos;s infrastructure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                8. Donation confirmation
              </h2>

              <p className="mt-3">
                When a payment is successfully confirmed, HopeFund
                records the donation and may send a confirmation email
                containing information such as the donation amount,
                campaign, date, frequency, and transaction-related
                details.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                9. Failed payments
              </h2>

              <p className="mt-3">
                If a payment is declined or fails, the donation may
                not be recorded as successfully paid. For recurring
                donations, a future monthly payment may also fail even
                if earlier payments were successful.
              </p>

              <p className="mt-3">
                Additional retry or notification behavior may depend
                on the payment provider and the recurring payment
                configuration.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                10. Cancellations of recurring donations
              </h2>

              <p className="mt-3">
                Donors should be able to request cancellation of
                future recurring donations. Cancellation affects
                future charges and generally does not reverse
                previously completed donations.
              </p>

              <p className="mt-3">
                The exact cancellation method and effective date
                should be confirmed before production launch when the
                recurring donation management workflow is finalized.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                11. Refunds
              </h2>

              <p className="mt-3">
                Donations are generally intended to be final once
                successfully processed. Refund requests may be
                reviewed on a case-by-case basis where appropriate,
                including situations involving duplicate payments,
                processing errors, unauthorized transactions, or other
                exceptional circumstances.
              </p>

              <p className="mt-3">
                Approval of any refund may depend on the circumstances
                of the donation, applicable law, payment provider
                requirements, and the status of the funds.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                12. Currency
              </h2>

              <p className="mt-3">
                Donation amounts are charged in the currency displayed
                at checkout. Currency conversion fees or exchange-rate
                differences may apply if your payment method uses a
                different currency.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                13. Campaign progress
              </h2>

              <p className="mt-3">
                Successfully recorded campaign donations may be
                reflected in the fundraising progress displayed on the
                campaign page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                14. Questions or payment issues
              </h2>

              <p className="mt-3">
                If you believe a donation was duplicated, processed
                incorrectly, or otherwise requires review, please
                contact us with the email address used for the
                donation and any available payment information.
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