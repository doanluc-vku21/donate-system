type CampaignUpdate = {
  id: string
  title: string
  content: string | null
  image_url: string | null
  published_at: string | null
  created_at: string
}

function formatDate(
  value: string | null
) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export default function CampaignUpdates({
  updates,
}: {
  updates: CampaignUpdate[]
}) {
  if (!updates || updates.length === 0) {
    return null
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#477768]">
        From the campaign
      </p>

      <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#111]">
        Campaign updates
      </h2>

      <div className="mt-7 space-y-7">
        {updates.map((update, index) => (
          <article
            key={update.id}
            className="relative pl-7"
          >
            <div className="absolute bottom-0 left-[6px] top-4 w-px bg-neutral-200" />

            <div className="absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-[3px] border-[#edf4e7] bg-[#2c755e]" />

            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              {update.image_url && (
                <img
                  src={update.image_url}
                  alt={update.title}
                  className="max-h-[380px] w-full object-cover"
                />
              )}

              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#edf4e7] px-3 py-1 text-[10px] font-bold text-[#173f35]">
                    Update {updates.length - index}
                  </span>

                  <span className="text-xs text-neutral-400">
                    {formatDate(
                      update.published_at ||
                        update.created_at
                    )}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-[#173f35]">
                  {update.title}
                </h3>

                {update.content && (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-neutral-600">
                    {update.content}
                  </p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}