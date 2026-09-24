import Link from 'next/link'
import {
  notFound,
  redirect,
} from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import DonorDetailsForm from '@/components/public/donor-details-form'

type PageProps = {
  params: Promise<{
    slug: string
  }>

  searchParams: Promise<{
    amount?: string
    frequency?: string
  }>
}

export default async function DonationDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } =
    await params

  const query =
    await searchParams

  const amountCents =
    Number(query.amount)

  const frequency =
    query.frequency ===
    'monthly'
      ? 'monthly'
      : 'one_time'

  if (
    !Number.isInteger(
      amountCents
    ) ||
    amountCents <= 0
  ) {
    redirect(
      `/campaigns/${slug}/contribute`
    )
  }

  const supabase =
    await createClient()

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
    .eq('slug', slug)
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

  const resolvedSettings =
    settings ?? {
      enable_one_time: true,
      enable_monthly: false,
      allow_custom_amount: true,
      allow_anonymous: true,
      allow_cover_fee: true,
      minimum_amount_cents: 100,
      default_frequency:
        'one_time',
    }

  if (
    amountCents <
    resolvedSettings
      .minimum_amount_cents
  ) {
    redirect(
      `/campaigns/${slug}/contribute`
    )
  }

  if (
    frequency ===
      'monthly' &&
    !resolvedSettings
      .enable_monthly
  ) {
    redirect(
      `/campaigns/${slug}/contribute`
    )
  }

  if (
    frequency ===
      'one_time' &&
    !resolvedSettings
      .enable_one_time
  ) {
    redirect(
      `/campaigns/${slug}/contribute`
    )
  }

  const feePercent =
    Number(
      process.env
        .DONATION_FEE_PERCENT ??
        '2.9'
    )

  const feeFixedCents =
    Number(
      process.env
        .DONATION_FEE_FIXED_CENTS ??
        '30'
    )

  return (
    <main className="min-h-screen bg-[#fffef9] px-5 py-10 sm:py-14">
      <div className="mx-auto max-w-xl">
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

        <div className="mt-9 text-center">
          <Link
            href={`/campaigns/${slug}/contribute`}
            className="text-xs font-semibold text-neutral-400 hover:text-[#173f35]"
          >
            ← Back
          </Link>

          <h1 className="mx-auto mt-5 max-w-lg text-3xl font-bold leading-[1.08] tracking-[-0.035em] text-[#111827]">
            Complete your donation
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
            Supporting{' '}
            <strong>
              {campaign.title}
            </strong>
          </p>
        </div>

        <div className="mt-10">
          <DonorDetailsForm
            campaignId={
              campaign.id
            }
            campaignSlug={
              campaign.slug
            }
            campaignTitle={
              campaign.title
            }
            currency={
              campaign.currency
            }
            amountCents={
              amountCents
            }
            frequency={
              frequency
            }
            allowAnonymous={
              resolvedSettings
                .allow_anonymous
            }
            allowCoverFee={
              resolvedSettings
                .allow_cover_fee
            }
            feePercent={
              Number.isFinite(
                feePercent
              )
                ? feePercent
                : 2.9
            }
            feeFixedCents={
              Number.isFinite(
                feeFixedCents
              )
                ? feeFixedCents
                : 30
            }
          />
        </div>
      </div>
    </main>
  )
}