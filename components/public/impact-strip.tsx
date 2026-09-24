type Props = {
  totalRaisedCents: number
  campaignCount: number
  categoryCount: number
  updateCount: number
}

function money(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export default function ImpactStrip({
  totalRaisedCents,
  campaignCount,
  categoryCount,
  updateCount,
}: Props) {
  const items = [
    {
      label: 'Raised for communities',
      value: money(totalRaisedCents),
    },
    {
      label: 'Campaigns',
      value: campaignCount.toLocaleString(),
    },
    {
      label: 'Causes',
      value: categoryCount.toLocaleString(),
    },
    {
      label: 'Progress updates',
      value: updateCount.toLocaleString(),
    },
  ]

  return (
    <section className="px-5 py-10 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 overflow-hidden rounded-2xl border border-[#dfe6dc] bg-white md:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={`p-6 sm:p-8 ${
              index !== 0
                ? 'border-l border-[#e7ece4]'
                : ''
            }`}
          >
            <p className="text-2xl font-bold tracking-tight text-[#173f35] sm:text-3xl">
              {item.value}
            </p>

            <p className="mt-1 text-xs font-medium text-neutral-500 sm:text-sm">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}