import Link from 'next/link'

import SiteHeader from '@/components/public/site-header'
import SiteFooter from '@/components/public/site-footer'

export default function PrivacyPage() {
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

            <span>Privacy Policy</span>
          </div>

          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
              Legal
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-[#173f35] sm:text-5xl">
              Privacy Policy
            </h1>

            <p className="mt-4 text-sm text-neutral-400">
              Last updated: September 25, 2026
            </p>
          </div>

          <div className="mt-12 space-y-10 text-[15px] leading-8 text-neutral-600">
            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                1. Introduction
              </h2>

              <p className="mt-3">
                HopeFund respects your privacy and is committed to
                handling personal information responsibly. This
                Privacy Policy explains what information may be
                collected when you use the website, make a donation,
                contact us, or interact with campaign content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                2. Information we collect
              </h2>

              <p className="mt-3">
                Depending on how you use the website, we may collect
                information such as your name, email address, phone
                number, donation amount, donation frequency, campaign
                selected, optional donor message, and whether you
                choose to appear anonymously.
              </p>

              <p className="mt-3">
                We may also collect technical information such as IP
                address, browser type, device information, referring
                page, and basic usage information for security,
                performance, and service improvement purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                3. Payment information
              </h2>

              <p className="mt-3">
                Donation payments are processed through Stripe.
                HopeFund does not directly store full payment card
                numbers, card security codes, or other sensitive card
                credentials entered into Stripe&apos;s payment
                interface.
              </p>

              <p className="mt-3">
                Stripe may collect and process payment and transaction
                information in accordance with its own privacy policy
                and service terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                4. How we use information
              </h2>

              <p className="mt-3">
                We may use personal information to process and record
                donations, send donation confirmations, maintain donor
                records, respond to inquiries, support recurring
                donations, prevent fraud, improve the website, and
                comply with applicable legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                5. Donation confirmations and service emails
              </h2>

              <p className="mt-3">
                When you complete a donation, we may send a
                transactional confirmation email containing details
                such as the campaign, donation amount, payment
                frequency, and confirmation information.
              </p>

              <p className="mt-3">
                Transactional emails are sent for service and payment
                purposes and are separate from optional marketing
                communications.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                6. Anonymous donations
              </h2>

              <p className="mt-3">
                If a campaign allows anonymous giving and you choose
                that option, your public-facing donor name may be
                displayed as anonymous. However, HopeFund and its
                payment providers may still need to retain identifying
                information for payment processing, recordkeeping,
                fraud prevention, or legal purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                7. Service providers
              </h2>

              <p className="mt-3">
                We may use third-party service providers to operate
                parts of the website and donation system. These may
                include payment processors, hosting providers,
                database providers, email delivery services, analytics
                providers, and security services.
              </p>

              <p className="mt-3">
                Current services may include Stripe for payment
                processing, Supabase for application data and storage,
                and Resend for transactional email delivery.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                8. Data retention
              </h2>

              <p className="mt-3">
                Personal and donation-related information may be
                retained for as long as reasonably necessary to
                provide the service, maintain transaction records,
                resolve disputes, support recurring donations, meet
                legal obligations, and protect the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                9. Data security
              </h2>

              <p className="mt-3">
                We use reasonable technical and organizational
                measures designed to protect information against
                unauthorized access, loss, misuse, alteration, or
                disclosure. No online service can guarantee absolute
                security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                10. Your choices
              </h2>

              <p className="mt-3">
                You may contact us to ask questions about personal
                information associated with your use of the service,
                subject to applicable legal, financial, security, and
                recordkeeping requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                11. Third-party links
              </h2>

              <p className="mt-3">
                The website may contain links to third-party websites
                or services. HopeFund is not responsible for the
                privacy practices or content of those third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                12. Changes to this policy
              </h2>

              <p className="mt-3">
                We may update this Privacy Policy from time to time.
                When changes are made, the updated version will be
                posted on this page with a revised last-updated date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#173f35]">
                13. Contact
              </h2>

              <p className="mt-3">
                For privacy-related questions, please contact us
                through the contact information provided on the
                website.
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