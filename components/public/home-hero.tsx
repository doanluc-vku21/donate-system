import Link from 'next/link'

type Props = {
  featuredImage?: string | null
}

export default function HomeHero({
  featuredImage,
}: Props) {
  return (
    <section className="px-5 pt-6 lg:px-8 lg:pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[32px] bg-[#173f35]">
          <div className="grid min-h-[610px] lg:grid-cols-[0.95fr_1.05fr]">
            <div className="flex flex-col justify-center px-7 py-14 sm:px-12 lg:px-16">
              <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-[#b8f06a]" />

                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                  People helping people
                </span>
              </div>

              <h1 className="max-w-xl text-5xl font-bold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-[76px]">
                Small acts.
                <br />

                <span className="text-[#b8f06a]">
                  Real change.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-base leading-7 text-white/70 sm:text-lg">
                Help individuals and families move through difficult moments
                with dignity, transparency and direct community support.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/campaigns"
                  className="rounded-full bg-[#b8f06a] px-6 py-3.5 text-sm font-bold text-[#173f35] transition hover:bg-[#a8e657]"
                >
                  Find a campaign →
                </Link>

                <Link
                  href="/#how-it-works"
                  className="rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  How it works
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/10 pt-6 text-xs text-white/55">
                <span>Secure donations</span>
                <span>Transparent campaigns</span>
                <span>Real updates</span>
              </div>
            </div>

            <div className="relative min-h-[420px] overflow-hidden lg:min-h-full">
              {featuredImage ? (
                <img
                  src={featuredImage}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#e6dcc7] via-[#d8caaa] to-[#9fae8b]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-white/90 p-5 shadow-xl backdrop-blur sm:left-auto sm:max-w-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#56756b]">
                  Community powered
                </p>

                <p className="mt-2 text-lg font-bold leading-snug text-[#173f35]">
                  Every contribution becomes part of someone&apos;s next
                  chapter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}