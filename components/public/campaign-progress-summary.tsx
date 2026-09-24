import CampaignProgress from './campaign-progress'

function formatMoney(
  cents: number,
  currency: string
) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export default function CampaignProgressSummary({
  raisedAmountCents,
  goalAmountCents,
  currency,
}: {
  raisedAmountCents: number
  goalAmountCents: number
  currency: string
}) {
  const percentage =
    goalAmountCents > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (raisedAmountCents / goalAmountCents) * 100
          )
        )
      : 0

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#edf4e7]">
          <span className="text-sm font-bold text-[#173f35]">
            {Math.round(percentage)}%
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold tracking-tight text-[#173f35]">
            {formatMoney(
              raisedAmountCents,
              currency
            )}{' '}
            <span className="text-sm font-medium text-neutral-400">
              raised of{' '}
              {formatMoney(
                goalAmountCents,
                currency
              )}
            </span>
          </p>

          <div className="mt-3">
            <CampaignProgress
              raisedAmountCents={
                raisedAmountCents
              }
              goalAmountCents={
                goalAmountCents
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}