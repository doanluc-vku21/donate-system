type Props = {
  raisedAmountCents: number
  goalAmountCents: number
}

export default function CampaignProgress({
  raisedAmountCents,
  goalAmountCents,
}: Props) {
  const percentage =
    goalAmountCents > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (raisedAmountCents /
              goalAmountCents) *
              100
          )
        )
      : 0

  return (
    <div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e9eee7]">
        <div
          className="h-full rounded-full bg-[#2c755e] transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-[#173f35]">
          {Math.round(percentage)}%
        </span>

        <span className="text-neutral-400">
          funded
        </span>
      </div>
    </div>
  )
}