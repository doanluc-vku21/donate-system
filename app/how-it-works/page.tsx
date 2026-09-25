import Link from 'next/link'

import SiteHeader from '@/components/public/site-header'
import SiteFooter from '@/components/public/site-footer'

const steps = [
  {
    number: '01',
    eyebrow: 'Discover',
    title: 'Find a campaign that matters to you',
    description:
      'Explore active fundraising campaigns and learn about the people, families and communities behind each story.',
    actionLabel: 'Explore campaigns',
    actionHref: '/campaigns',
  },
  {
    number: '02',
    eyebrow: 'Understand',
    title: 'Read the story and planned use of funds',
    description:
      'Review the campaign story, fundraising goal, organizer information and planned use of funds before deciding whether you want to contribute.',
    actionLabel: 'Browse active campaigns',
    actionHref: '/campaigns',
  },
  {
    number: '03',
    eyebrow: 'Contribute',
    title: 'Choose how much you want to give',
    description:
      'Select a suggested amount or enter a custom donation. When available, you can choose between a one-time contribution and monthly support.',
    actionLabel: 'Start giving',
    actionHref: '/campaigns',
  },
  {
    number: '04',
    eyebrow: 'Checkout',
    title: 'Complete your donation securely',
    description:
      'Enter your donor details and continue to Stripe Checkout. Review the amount and payment information before confirming your contribution.',
    actionLabel: 'Donation help',
    actionHref: '/faq',
  },
  {
    number: '05',
    eyebrow: 'Follow',
    title: 'Stay connected to the impact',
    description:
      'After your donation is confirmed, you can return to the campaign to follow progress, recent contributions and campaign updates.',
    actionLabel: 'View campaigns',
    actionHref: '/campaigns',
  },
]

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#fffdf8]">
      <SiteHeader />

      {/* HERO */}

      <section className="border-b border-neutral-200 px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-xs font-semibold text-neutral-400">
            <Link
              href="/"
              className="transition hover:text-[#173f35]"
            >
              Home
            </Link>

            <span className="mx-2">
              /
            </span>

            <span>
              How it works
            </span>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#477768]">
                A guide to giving
              </p>

              <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.055em] text-[#173f35] sm:text-6xl lg:text-7xl">
                Giving should feel
                clear, simple and
                human.
              </h1>
            </div>

            <div>
              <p className="max-w-xl text-base leading-8 text-neutral-600">
                Understand the campaign,
                choose how you want to
                help and complete your
                donation securely. Here
                is what to expect when
                supporting a HopeFund
                campaign.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/campaigns"
                  className="rounded-full bg-[#173f35] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#215844]"
                >
                  Explore campaigns
                </Link>

                <Link
                  href="/faq"
                  className="rounded-full border border-[#173f35] px-6 py-3 text-sm font-bold text-[#173f35] transition hover:bg-[#173f35] hover:text-white"
                >
                  Get help
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}

      <section className="px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 rounded-[32px] bg-[#edf4e7] p-7 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:p-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
                Before you donate
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#173f35] sm:text-4xl">
                Take a moment to
                understand the need.
              </h2>
            </div>

            <div className="space-y-5 text-sm leading-7 text-neutral-600">
              <p>
                Every campaign should
                explain who needs help,
                what the fundraising goal
                is and how the money is
                expected to be used.
              </p>

              <p>
                You can review the
                campaign story, planned
                fund usage and progress
                before choosing whether
                to contribute.
              </p>

              <p>
                If something is unclear,
                contact the HopeFund team
                before making a payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STEPS */}

      <section className="px-5 pb-20 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
              Step by step
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-[#173f35]">
              How a donation works
            </h2>
          </div>

          <div className="border-t border-neutral-200">
            {steps.map(
              (
                step,
                index
              ) => (
                <article
                  key={
                    step.number
                  }
                  className="grid gap-6 border-b border-neutral-200 py-10 lg:grid-cols-[100px_1fr_220px] lg:items-start lg:py-12"
                >
                  <div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#edf4e7] text-sm font-bold text-[#173f35]">
                      {
                        step.number
                      }
                    </div>
                  </div>

                  <div className="max-w-2xl">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#477768]">
                      {
                        step.eyebrow
                      }
                    </p>

                    <h3 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[#173f35] sm:text-3xl">
                      {
                        step.title
                      }
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-neutral-600">
                      {
                        step.description
                      }
                    </p>
                  </div>

                  <div className="lg:text-right">
                    <Link
                      href={
                        step.actionHref
                      }
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#173f35] transition hover:text-[#2c755e]"
                    >
                      {
                        step.actionLabel
                      }

                      <span>
                        →
                      </span>
                    </Link>
                  </div>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      {/* PAYMENT / SAFETY */}

      <section className="bg-[#173f35] px-5 py-16 text-white lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b8f06a]">
                Secure checkout
              </p>

              <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
                Your payment is
                completed through
                Stripe.
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-white/70">
                HopeFund does not ask
                you to send card numbers
                or sensitive payment
                information through
                email, chat or campaign
                messages.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg">
                  ✓
                </div>

                <h3 className="mt-5 font-bold">
                  Review before paying
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/60">
                  Confirm the donation
                  amount and frequency
                  before completing
                  checkout.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg">
                  ✓
                </div>

                <h3 className="mt-5 font-bold">
                  Keep confirmation
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/60">
                  Keep your payment
                  confirmation if you
                  need help identifying
                  a donation later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ONE-TIME / MONTHLY */}

      <section className="px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-neutral-200 bg-white p-7 sm:p-9">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf4e7] font-bold text-[#173f35]">
                1×
              </div>

              <h3 className="mt-6 text-2xl font-bold text-[#173f35]">
                One-time donation
              </h3>

              <p className="mt-4 text-sm leading-7 text-neutral-600">
                Make a single
                contribution to the
                campaign. Your donation
                is processed once and
                added to the campaign
                total after successful
                payment confirmation.
              </p>
            </div>

            <div className="rounded-[28px] border border-neutral-200 bg-white p-7 sm:p-9">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf4e7] font-bold text-[#173f35]">
                ↻
              </div>

              <h3 className="mt-6 text-2xl font-bold text-[#173f35]">
                Monthly support
              </h3>

              <p className="mt-4 text-sm leading-7 text-neutral-600">
                When a campaign offers
                monthly giving, Stripe
                creates a recurring
                subscription and
                processes future
                payments on the billing
                schedule.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="px-5 pb-20 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-6xl rounded-[32px] bg-[#b8f06a] px-7 py-12 sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
              Ready to help?
            </p>

            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.04em] text-[#173f35] sm:text-4xl">
              Find a campaign and
              support a story that
              matters to you.
            </h2>
          </div>

          <Link
            href="/campaigns"
            className="mt-7 inline-flex shrink-0 rounded-full bg-[#173f35] px-7 py-3.5 text-sm font-bold text-white lg:mt-0"
          >
            Explore campaigns
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}