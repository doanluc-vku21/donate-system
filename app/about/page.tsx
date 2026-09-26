import Link from 'next/link'

import SiteHeader from '@/components/public/site-header'
import SiteFooter from '@/components/public/site-footer'

const values = [
  {
    number: '01',
    title: 'Clarity before giving',
    description:
      'Campaigns should clearly explain their purpose, fundraising goal, planned use of funds and progress.',
  },
  {
    number: '02',
    title: 'Respect for donors',
    description:
      'Donors deserve clear information about what they are supporting and how their contribution is processed.',
  },
  {
    number: '03',
    title: 'Updates after support',
    description:
      'Giving should not end at checkout. Campaigns can share progress, milestones and meaningful updates over time.',
  },
]

const transparencyItems = [
  {
    title: 'Campaign goals',
    description:
      'Each campaign can publish a fundraising target and show how much support has been received.',
  },
  {
    title: 'Fund usage',
    description:
      'Campaign pages can explain how funds are expected to be used through a clear funding breakdown.',
  },
  {
    title: 'Donation activity',
    description:
      'Recent contributions and campaign progress help supporters understand ongoing fundraising activity.',
  },
  {
    title: 'Campaign updates',
    description:
      'Organizers can publish progress reports, field updates, completed milestones and thank-you messages.',
  },
  {
    title: 'Secure payments',
    description:
      'Donation payments are processed through Stripe rather than storing payment card details directly on HopeFund.',
  },
  {
    title: 'Donation confirmation',
    description:
      'Successful donations are recorded and donors can receive a confirmation email with their donation details.',
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fffdf8]">
      <SiteHeader />

      {/* =================================
          HERO
      ================================= */}

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
              About
            </span>
          </div>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#477768]">
                About HopeFund
              </p>

              <h1 className="mt-4 max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.055em] text-[#173f35] sm:text-6xl lg:text-7xl">
                Giving should feel
                <br />
                clear, human and
                <br />
                accountable.
              </h1>
            </div>

            <div>
              <p className="max-w-xl text-base leading-8 text-neutral-600">
                HopeFund connects
                people who want to
                help with campaigns
                that need support,
                while making it
                easier to understand
                where donations go
                and what happens
                after people give.
              </p>

              <Link
                href="/campaigns"
                className="mt-7 inline-flex rounded-full bg-[#173f35] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#215844]"
              >
                Explore campaigns
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =================================
          MISSION
      ================================= */}

      <section className="px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
                Our mission
              </p>
            </div>

            <div>
              <h2 className="max-w-4xl text-3xl font-bold leading-tight tracking-[-0.04em] text-[#173f35] sm:text-4xl lg:text-5xl">
                Make meaningful
                support easier to
                understand and easier
                to trust.
              </h2>

              <div className="mt-7 max-w-3xl space-y-5 text-base leading-8 text-neutral-600">
                <p>
                  Fundraising is built
                  on trust. People
                  should be able to
                  understand why a
                  campaign exists,
                  what it hopes to
                  accomplish and how
                  financial support
                  will be used.
                </p>

                <p>
                  HopeFund is designed
                  to make that
                  information easier
                  to see. Campaigns
                  can present their
                  goals, planned use
                  of funds, progress
                  and ongoing updates
                  in one place.
                </p>

                <p>
                  Our goal is to help
                  donors make informed
                  decisions while
                  giving organizers a
                  simple way to share
                  their work and
                  communicate
                  progress.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================
          VALUES
      ================================= */}

      <section className="bg-[#edf4e7] px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
              What guides us
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-[#173f35]">
              Built around
              transparency.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {values.map(
              (item) => (
                <div
                  key={item.number}
                  className="rounded-[24px] bg-white p-7"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b8f06a] text-sm font-bold text-[#173f35]">
                    {item.number}
                  </div>

                  <h3 className="mt-7 text-xl font-bold text-[#173f35]">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-neutral-600">
                    {
                      item.description
                    }
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* =================================
          TRANSPARENCY
      ================================= */}

      <section className="px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
                Transparency
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-[#173f35]">
                What donors can
                expect to see.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-neutral-600">
                HopeFund provides
                tools that help make
                campaign information,
                donation progress and
                ongoing activity more
                visible.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {transparencyItems.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      item.title
                    }
                    className="rounded-[22px] border border-neutral-200 bg-white p-6"
                  >
                    <p className="text-xs font-bold text-[#477768]">
                      0
                      {index +
                        1}
                    </p>

                    <h3 className="mt-4 text-lg font-bold text-[#173f35]">
                      {
                        item.title
                      }
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-neutral-500">
                      {
                        item.description
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =================================
          HOW FUNDS ARE HANDLED
      ================================= */}

      <section className="px-5 pb-16 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-[#173f35]">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-10 lg:p-14">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b8f06a]">
                How giving works
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl">
                Donations are
                processed securely.
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-white/65">
                HopeFund uses Stripe
                to process donation
                payments. Payment card
                information is handled
                by Stripe&apos;s
                payment
                infrastructure
                rather than being
                stored directly by
                HopeFund.
              </p>

              <Link
                href="/how-it-works"
                className="mt-7 inline-flex rounded-full bg-[#b8f06a] px-6 py-3 text-sm font-bold text-[#173f35]"
              >
                See how it works
              </Link>
            </div>

            <div className="border-t border-white/10 p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-14">
              <div className="space-y-7">
                <div>
                  <p className="text-sm font-bold text-white">
                    Donation records
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Successful
                    payments are
                    recorded against
                    the relevant
                    campaign.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Processing costs
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Where enabled,
                    donors may choose
                    to help cover
                    payment
                    processing costs.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Recurring support
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Campaigns that
                    enable monthly
                    giving can receive
                    recurring
                    contributions
                    through Stripe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================
          ORGANIZATION
      ================================= */}

      <section className="border-y border-neutral-200 bg-white px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
                Organization
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-[#173f35]">
                Who operates
                HopeFund.
              </h2>
            </div>

            <div>
              <div className="rounded-[24px] border border-neutral-200 bg-[#fffdf8] p-7 sm:p-8">
                <div className="grid gap-7 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                      Organization name
                    </p>

                    <p className="mt-2 font-semibold text-[#173f35]">
                      HopeFund
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                      Website
                    </p>

                    <p className="mt-2 font-semibold text-[#173f35]">
                      HopeFund
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                      Payment processing
                    </p>

                    <p className="mt-2 font-semibold text-[#173f35]">
                      Stripe
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                      Contact
                    </p>

                    <Link
                      href="/contact"
                      className="mt-2 inline-block font-semibold text-[#173f35] hover:underline"
                    >
                      Contact us
                    </Link>
                  </div>
                </div>

                <div className="mt-7 border-t border-neutral-200 pt-7">
                  <p className="text-sm leading-7 text-neutral-500">
                    Additional legal
                    organization
                    information,
                    registered
                    address and
                    applicable
                    registration
                    details should be
                    added here before
                    production launch.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================
          DONOR TRUST
      ================================= */}

      <section className="px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[24px] border border-neutral-200 bg-white p-7">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#477768]">
                Before giving
              </p>

              <h3 className="mt-3 text-xl font-bold text-[#173f35]">
                Review the campaign
              </h3>

              <p className="mt-3 text-sm leading-7 text-neutral-500">
                Read the story,
                fundraising goal,
                fund usage and
                available campaign
                updates before
                donating.
              </p>
            </div>

            <div className="rounded-[24px] border border-neutral-200 bg-white p-7">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#477768]">
                When giving
              </p>

              <h3 className="mt-3 text-xl font-bold text-[#173f35]">
                Choose what feels
                right
              </h3>

              <p className="mt-3 text-sm leading-7 text-neutral-500">
                Eligible campaigns
                may support one-time
                or monthly donations,
                predefined amounts or
                custom amounts.
              </p>
            </div>

            <div className="rounded-[24px] border border-neutral-200 bg-white p-7">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#477768]">
                After giving
              </p>

              <h3 className="mt-3 text-xl font-bold text-[#173f35]">
                Follow the progress
              </h3>

              <p className="mt-3 text-sm leading-7 text-neutral-500">
                Check campaign and
                site updates to see
                how fundraising and
                field activity
                progress over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =================================
          CTA
      ================================= */}

      <section className="bg-[#edf4e7] px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
              Give with purpose
            </p>

            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.04em] text-[#173f35] sm:text-4xl">
              Explore the campaigns
              that need support.
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/campaigns"
              className="rounded-full bg-[#173f35] px-7 py-3.5 text-sm font-bold text-white"
            >
              Explore campaigns
            </Link>

            <Link
              href="/faq"
              className="rounded-full border border-[#173f35] px-7 py-3.5 text-sm font-bold text-[#173f35]"
            >
              Read FAQ
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}