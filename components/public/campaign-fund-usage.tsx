type FundItem = {
  id: string
  title: string
  description: string | null
  amount_cents: number
  sort_order: number
}

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

export default function CampaignFundUsage({
  items,
  currency,
  goalAmountCents,
}: {
  items: FundItem[]
  currency: string
  goalAmountCents: number
}) {
  if (!items || items.length === 0) {
    return null
  }

  const total = items.reduce(
    (sum, item) => sum + item.amount_cents,
    0
  )

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#477768]">
        Transparency
      </p>

      <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#111]">
        Planned use of funds
      </h2>

      <p className="mt-3 text-sm leading-7 text-neutral-500">
        Here&apos;s how this campaign expects contributions to be used.
      </p>

      <div className="mt-6 space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="rounded-xl border border-neutral-200 bg-white p-5"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf4e7] text-xs font-bold text-[#173f35]">
                {String(index + 1).padStart(2, '0')}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-bold text-[#173f35]">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="mt-1 text-sm leading-6 text-neutral-500">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <p className="shrink-0 font-bold text-[#173f35]">
                    {formatMoney(
                      item.amount_cents,
                      currency
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2 rounded-xl bg-[#edf4e7] px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="font-medium text-neutral-600">
          Planned total
        </span>

        <span className="font-bold text-[#173f35]">
          {formatMoney(total, currency)} of{' '}
          {formatMoney(goalAmountCents, currency)}
        </span>
      </div>
    </div>
  )
}