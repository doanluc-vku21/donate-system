import Link from 'next/link'
import CampaignProgress from './campaign-progress'

export type PublicCampaign = {
  id: string
  title: string
  slug: string
  short_description: string | null
  featured_image_url: string | null
  goal_amount_cents: number
  raised_amount_cents: number
  currency: string
  location: string | null
  category_id: string | null

  category:
    | {
        id: string
        name: string
        slug: string
      }
    | null
}

function formatMoney(
  cents: number,
  currency: string
) {
  return new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }
  ).format(cents / 100)
}

export default function CampaignCard({
  campaign,
}: {
  campaign: PublicCampaign
}) {
  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="group overflow-hidden rounded-[22px] border border-[#e0e6dd] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#eef0e9]">
        {campaign.featured_image_url ? (
          <img
            src={
              campaign.featured_image_url
            }
            alt={campaign.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            Campaign image
          </div>
        )}

        {campaign.category && (
          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#173f35] shadow-sm backdrop-blur">
            {campaign.category.name}
          </div>
        )}
      </div>

      <div className="p-5">
        {campaign.location && (
          <p className="mb-2 text-xs font-medium text-neutral-400">
            {campaign.location}
          </p>
        )}

        <h3 className="line-clamp-2 text-xl font-bold leading-snug tracking-tight text-[#132f28]">
          {campaign.title}
        </h3>

        {campaign.short_description && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-500">
            {campaign.short_description}
          </p>
        )}

        <div className="mt-5">
          <CampaignProgress
            raisedAmountCents={
              campaign.raised_amount_cents
            }
            goalAmountCents={
              campaign.goal_amount_cents
            }
          />
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-[#173f35]">
              {formatMoney(
                campaign.raised_amount_cents,
                campaign.currency
              )}
            </p>

            <p className="text-xs text-neutral-400">
              raised of{' '}
              {formatMoney(
                campaign.goal_amount_cents,
                campaign.currency
              )}
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef5eb] text-[#173f35] transition group-hover:bg-[#b8f06a]">
            ↗
          </div>
        </div>
      </div>
    </Link>
  )
}