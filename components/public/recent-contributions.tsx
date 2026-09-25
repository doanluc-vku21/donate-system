type Contribution = {
  id: string
  display_name: string | null
  amount_cents: number
  currency: string
  frequency: 'one_time' | 'monthly'
  message: string | null
  is_anonymous: boolean
  created_at: string
}

function money(
  cents: number,
  currency: string
) {
  return new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency,
      maximumFractionDigits:
        cents % 100 === 0 ? 0 : 2,
    }
  ).format(cents / 100)
}

function formatRelativeDate(
  value: string
) {
  const date = new Date(value)

  const now = new Date()

  const diffMs =
    now.getTime() -
    date.getTime()

  const diffMinutes =
    Math.floor(
      diffMs / 1000 / 60
    )

  if (diffMinutes < 1) {
    return 'Just now'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`
  }

  const diffHours =
    Math.floor(
      diffMinutes / 60
    )

  if (diffHours < 24) {
    return `${diffHours} hr${
      diffHours > 1 ? 's' : ''
    } ago`
  }

  const diffDays =
    Math.floor(
      diffHours / 24
    )

  if (diffDays < 7) {
    return `${diffDays} day${
      diffDays > 1 ? 's' : ''
    } ago`
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  ).format(date)
}

function initials(
  name: string
) {
  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)

  if (parts.length === 0) {
    return 'A'
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 1)
      .toUpperCase()
  }

  return (
    parts[0][0] +
    parts[
      parts.length - 1
    ][0]
  ).toUpperCase()
}

export default function RecentContributions({
  contributions,
}: {
  contributions: Contribution[]
}) {
  if (
    !contributions ||
    contributions.length === 0
  ) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#477768]">
              Community support
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#111]">
              Recent contributions
            </h2>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 bg-[#fbfcfa] px-5 py-8 text-center">
          <p className="text-sm font-medium text-neutral-500">
            Be the first to support
            this campaign.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#477768]">
            Community support
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#111]">
            Recent contributions
          </h2>
        </div>

        <span className="text-xs font-medium text-neutral-400">
          Latest supporters
        </span>
      </div>

      <div className="mt-6 divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
        {contributions.map(
          (contribution) => {
            const name =
              contribution.is_anonymous
                ? 'Anonymous'
                : contribution.display_name ||
                  'Anonymous'

            return (
              <article
                key={contribution.id}
                className="flex gap-4 p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#edf4e7] text-sm font-bold text-[#173f35]">
                  {contribution.is_anonymous
                    ? 'A'
                    : initials(name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#173f35]">
                        {name}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                        <span>
                          {formatRelativeDate(
                            contribution.created_at
                          )}
                        </span>

                        {contribution.frequency ===
                          'monthly' && (
                          <>
                            <span>
                              ·
                            </span>

                            <span className="font-semibold text-[#477768]">
                              Monthly supporter
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-bold text-[#173f35]">
                      {money(
                        contribution.amount_cents,
                        contribution.currency
                      )}
                    </p>
                  </div>

                  {contribution.message && (
                    <p className="mt-3 text-sm leading-6 text-neutral-600">
                      {
                        contribution.message
                      }
                    </p>
                  )}
                </div>
              </article>
            )
          }
        )}
      </div>
    </div>
  )
}