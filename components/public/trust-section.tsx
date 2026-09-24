export default function TrustSection() {
  const items = [
    {
      title: 'Transparent campaigns',
      description:
        'Campaign goals, planned fund usage and progress are clearly presented.',
    },
    {
      title: 'Secure payments',
      description:
        'Donations are processed through secure payment infrastructure.',
    },
    {
      title: 'Ongoing updates',
      description:
        'Campaign organizers can share progress, milestones and important news.',
    },
  ]

  return (
    <section className="px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[32px] bg-[#173f35] px-7 py-12 sm:px-12 lg:px-16 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b8f06a]">
                Give with confidence
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-white">
                Know more before
                <br />
                you give.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {items.map(
                (item, index) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#b8f06a] text-sm font-bold text-[#173f35]">
                      0{index + 1}
                    </div>

                    <h3 className="font-bold text-white">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-white/60">
                      {item.description}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}