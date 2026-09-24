import Link from 'next/link'
import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import ContributionForm from '@/components/public/contribution-form'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function ContributePage({
  params,
}: PageProps) {
  const { slug } =
    await params

  const supabase =
    await createClient()

  // CAMPAIGN

  const {
    data: campaign,
    error: campaignError,
  } = await supabase
    .from('campaigns')
    .select(`
      id,
      title,
      slug,
      currency,
      status
    `)
    .eq(
      'slug',
      slug
    )
    .eq(
      'status',
      'published'
    )
    .single()

  if (
    campaignError ||
    !campaign
  ) {
    notFound()
  }

  // SETTINGS

  const {
    data: settings,
  } = await supabase
    .from(
      'campaign_donation_settings'
    )
    .select(`
      enable_one_time,
      enable_monthly,
      allow_custom_amount,
      allow_anonymous,
      allow_cover_fee,
      minimum_amount_cents,
      default_frequency
    `)
    .eq(
      'campaign_id',
      campaign.id
    )
    .maybeSingle()

  // OPTIONS

  const {
    data: options,
  } = await supabase
    .from(
      'campaign_donation_options'
    )
    .select(`
      id,
      amount_cents,
      label,
      is_active,
      is_default,
      sort_order
    `)
    .eq(
      'campaign_id',
      campaign.id
    )
    .eq(
      'is_active',
      true
    )
    .order(
      'sort_order',
      {
        ascending: true,
      }
    )

  return (
    <main className="min-h-screen bg-[#fffef9] px-5 py-10 sm:py-14">
      <div className="mx-auto max-w-xl">
        {/* LOGO */}

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xl font-bold text-[#17603f]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#173f35] text-sm text-white">
              H
            </span>

            HopeFund
          </Link>
        </div>

        {/* TITLE */}

        <div className="mt-9 text-center">
          <Link
            href={`/campaigns/${campaign.slug}`}
            className="text-xs font-semibold text-neutral-400 hover:text-[#173f35]"
          >
            ← Back to campaign
          </Link>

          <h1 className="mx-auto mt-5 max-w-lg text-3xl font-bold leading-[1.08] tracking-[-0.035em] text-[#111827] sm:text-4xl">
            {campaign.title}
          </h1>
        </div>

        {/* FORM */}

        <div className="mt-10">
          <ContributionForm
            campaignSlug={
              campaign.slug
            }
            currency={
              campaign.currency
            }
            settings={
              settings
            }
            options={
              options ?? []
            }
          />
        </div>

        {/* LEGAL */}

        <div className="mt-6 border-t border-neutral-200 pt-5 text-center">
          <p className="text-[11px] leading-5 text-neutral-400">
            By continuing, you agree
            to our{' '}
            <Link
              href="/terms"
              className="underline"
            >
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  )
}