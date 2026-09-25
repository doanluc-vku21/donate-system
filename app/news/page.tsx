import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

import SiteHeader from '@/components/public/site-header'
import SiteFooter from '@/components/public/site-footer'

export const dynamic =
  'force-dynamic'

function formatDate(
  value: string | null
) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }
  ).format(
    new Date(value)
  )
}

export default async function NewsPage() {
  const supabase =
    await createClient()

  const {
    data,
  } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      category,
      excerpt,
      featured_image_url,
      is_featured,
      published_at
    `)
    .eq(
      'status',
      'published'
    )
    .order(
      'published_at',
      {
        ascending: false,
      }
    )

  const posts =
    data ?? []

  const featured =
    posts.find(
      (post) =>
        post.is_featured
    ) ??
    posts[0]

  const remaining =
    posts.filter(
      (post) =>
        post.id !==
        featured?.id
    )

  return (
    <main className="min-h-screen bg-[#fffdf8]">
      <SiteHeader />

      {/* HERO */}

      <section className="border-b border-neutral-200 px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#477768]">
            The world we share
          </p>

          <h1 className="mt-5 max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.055em] text-[#173f35] sm:text-6xl lg:text-7xl">
            Stories that matter.
            <br />
            People who inspire.
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-neutral-600">
            News, stories and
            context from communities
            facing challenges — and
            the people working to
            create meaningful change.
          </p>
        </div>
      </section>

      {/* LATEST */}

      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#173f35]">
            Latest news
          </h2>

          {featured && (
            <article className="mt-8 grid overflow-hidden rounded-[28px] border border-neutral-200 bg-white lg:grid-cols-2">
              <div className="aspect-[4/3] overflow-hidden bg-neutral-100 lg:aspect-auto">
                {featured.featured_image_url && (
                  <img
                    src={
                      featured.featured_image_url
                    }
                    alt={
                      featured.title
                    }
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                <div className="flex flex-wrap gap-3 text-xs font-semibold text-[#477768]">
                  {featured.category && (
                    <span>
                      {
                        featured.category
                      }
                    </span>
                  )}

                  <span>
                    {formatDate(
                      featured.published_at
                    )}
                  </span>
                </div>

                <h2 className="mt-5 text-3xl font-bold leading-tight tracking-[-0.04em] text-[#173f35] lg:text-4xl">
                  {
                    featured.title
                  }
                </h2>

                {featured.excerpt && (
                  <p className="mt-5 text-sm leading-7 text-neutral-600">
                    {
                      featured.excerpt
                    }
                  </p>
                )}

                <Link
                  href={`/news/${featured.slug}`}
                  className="mt-7 inline-flex w-fit items-center gap-2 text-sm font-bold text-[#173f35]"
                >
                  Read the story
                  <span>→</span>
                </Link>
              </div>
            </article>
          )}

          <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {remaining.map(
              (post) => (
                <article
                  key={
                    post.id
                  }
                >
                  <Link
                    href={`/news/${post.slug}`}
                    className="block overflow-hidden rounded-2xl bg-neutral-100"
                  >
                    <div className="aspect-[16/10]">
                      {post.featured_image_url && (
                        <img
                          src={
                            post.featured_image_url
                          }
                          alt={
                            post.title
                          }
                          className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                        />
                      )}
                    </div>
                  </Link>

                  <div className="mt-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#477768]">
                    {post.category && (
                      <span>
                        {
                          post.category
                        }
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-xl font-bold leading-snug tracking-[-0.025em] text-[#173f35]">
                    <Link
                      href={`/news/${post.slug}`}
                    >
                      {
                        post.title
                      }
                    </Link>
                  </h3>

                  {post.excerpt && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-500">
                      {
                        post.excerpt
                      }
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-neutral-400">
                      {formatDate(
                        post.published_at
                      )}
                    </span>

                    <Link
                      href={`/news/${post.slug}`}
                      className="text-xs font-bold text-[#173f35]"
                    >
                      Read story →
                    </Link>
                  </div>
                </article>
              )
            )}
          </div>

          {posts.length ===
            0 && (
            <div className="mt-10 rounded-2xl border border-dashed p-12 text-center text-neutral-500">
              No stories have been
              published yet.
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}