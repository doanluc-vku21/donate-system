import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

import SiteHeader from '@/components/public/site-header'
import SiteFooter from '@/components/public/site-footer'

export const dynamic = 'force-dynamic'

export default async function FAQPage() {
  const supabase = await createClient()

  const {
    data,
    error,
  } = await supabase
    .from('faqs')
    .select(`
      id,
      question,
      answer,
      category,
      sort_order,
      status,
      created_at
    `)
    .eq('status', 'published')
    .order('sort_order', {
      ascending: true,
    })
    .order('created_at', {
      ascending: true,
    })

  const faqs = data ?? []

  return (
    <main className="min-h-screen bg-[#fffdf8]">
      <SiteHeader />

      {/* =========================
          HERO
      ========================= */}

      <section className="border-b border-neutral-200 px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          {/* BREADCRUMB */}

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
              FAQ
            </span>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#477768]">
                Help center
              </p>

              <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.055em] text-[#173f35] sm:text-6xl lg:text-7xl">
                Before you
                <br />
                contribute.
              </h1>
            </div>

            <div>
              <p className="max-w-lg text-base leading-8 text-neutral-600">
                Answers about campaigns,
                donations, recurring
                support, payments and
                getting help.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/how-it-works"
                  className="rounded-full bg-[#173f35] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#215844]"
                >
                  How it works
                </Link>

                <Link
                  href="/campaigns"
                  className="rounded-full border border-[#173f35] px-6 py-3 text-sm font-bold text-[#173f35] transition hover:bg-[#173f35] hover:text-white"
                >
                  Explore campaigns
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          FAQ CONTENT
      ========================= */}

      <section className="px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* LEFT */}

          <aside>
            <div className="lg:sticky lg:top-28">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
                Questions & answers
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#173f35]">
                Everything you need
                to know before giving.
              </h2>

              <p className="mt-4 text-sm leading-7 text-neutral-500">
                Read through the most
                common questions about
                donations, campaigns
                and payments.
              </p>

              <Link
                href="/how-it-works"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#173f35] transition hover:text-[#2c755e]"
              >
                How donations work

                <span>
                  →
                </span>
              </Link>
            </div>
          </aside>

          {/* RIGHT */}

          <div>
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                We could not load the
                FAQs right now.
              </div>
            )}

            {!error &&
              faqs.length === 0 && (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
                  <p className="font-semibold text-[#173f35]">
                    No FAQs have been
                    published yet.
                  </p>

                  <p className="mt-2 text-sm text-neutral-500">
                    Please check back
                    again later.
                  </p>
                </div>
              )}

            {!error &&
              faqs.length > 0 && (
                <div className="border-t border-neutral-200">
                  {faqs.map(
                    (
                      faq,
                      index
                    ) => (
                      <details
                        key={
                          faq.id
                        }
                        className="group border-b border-neutral-200"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 marker:hidden sm:py-7">
                          <div className="flex min-w-0 items-start gap-4">
                            <span className="mt-0.5 hidden min-w-[28px] text-xs font-bold text-neutral-300 sm:block">
                              {String(
                                index +
                                  1
                              ).padStart(
                                2,
                                '0'
                              )}
                            </span>

                            <div>
                              {faq.category && (
                                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#477768]">
                                  {
                                    faq.category
                                  }
                                </p>
                              )}

                              <h3 className="text-base font-bold leading-6 text-[#173f35] sm:text-lg">
                                {
                                  faq.question
                                }
                              </h3>
                            </div>
                          </div>

                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-xl font-light text-[#173f35] transition duration-200 group-open:rotate-45 group-open:bg-[#edf4e7]">
                            +
                          </span>
                        </summary>

                        <div className="pb-7 sm:pl-11">
                          <p className="max-w-3xl whitespace-pre-wrap text-sm leading-7 text-neutral-600">
                            {
                              faq.answer
                            }
                          </p>
                        </div>
                      </details>
                    )
                  )}
                </div>
              )}
          </div>
        </div>
      </section>

      {/* =========================
          SUPPORT CTA
      ========================= */}

      <section className="px-5 pb-20 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-[#173f35]">
          <div className="grid gap-8 px-7 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1fr_auto] lg:items-center lg:px-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b8f06a]">
                Need more help?
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl">
                Still have a
                question?
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
                If your question is
                related to a payment,
                include the campaign
                name, donor email and
                approximate payment
                date. Never send full
                card information.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-full bg-[#b8f06a] px-6 py-3 text-sm font-bold text-[#173f35] transition hover:bg-[#a7e457]"
              >
                Contact our team
              </Link>

              <Link
                href="/campaigns"
                className="rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                View campaigns
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          QUICK LINKS
      ========================= */}

      <section className="border-t border-neutral-200 bg-[#edf4e7] px-5 py-14 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477768]">
            Helpful links
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/how-it-works"
              className="rounded-2xl bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm"
            >
              <p className="font-bold text-[#173f35]">
                How donations work
              </p>

              <p className="mt-2 text-xs leading-5 text-neutral-500">
                Learn the complete
                contribution process.
              </p>

              <p className="mt-5 text-sm font-bold text-[#173f35]">
                Learn more →
              </p>
            </Link>

            <Link
              href="/campaigns"
              className="rounded-2xl bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm"
            >
              <p className="font-bold text-[#173f35]">
                Campaigns
              </p>

              <p className="mt-2 text-xs leading-5 text-neutral-500">
                Explore current
                fundraising campaigns.
              </p>

              <p className="mt-5 text-sm font-bold text-[#173f35]">
                Explore →
              </p>
            </Link>

            <Link
              href="/donation-policy"
              className="rounded-2xl bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm"
            >
              <p className="font-bold text-[#173f35]">
                Donation policy
              </p>

              <p className="mt-2 text-xs leading-5 text-neutral-500">
                Read information
                related to giving and
                payments.
              </p>

              <p className="mt-5 text-sm font-bold text-[#173f35]">
                Read policy →
              </p>
            </Link>

            <Link
              href="/privacy"
              className="rounded-2xl bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm"
            >
              <p className="font-bold text-[#173f35]">
                Privacy
              </p>

              <p className="mt-2 text-xs leading-5 text-neutral-500">
                Learn how information
                is handled.
              </p>

              <p className="mt-5 text-sm font-bold text-[#173f35]">
                View privacy →
              </p>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}