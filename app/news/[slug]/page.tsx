import Link from 'next/link'

import {
  notFound,
} from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import SiteHeader from '@/components/public/site-header'
import SiteFooter from '@/components/public/site-footer'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

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

export default async function NewsDetailPage({
  params,
}: PageProps) {
  const { slug } =
    await params

  const supabase =
    await createClient()

  const {
    data: post,
  } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      category,
      excerpt,
      content,
      featured_image_url,
      published_at
    `)
    .eq(
      'slug',
      slug
    )
    .eq(
      'status',
      'published'
    )
    .single()

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#fffdf8]">
      <SiteHeader />

      <article>
        <header className="px-5 pb-12 pt-16 lg:px-8 lg:pt-24">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/news"
              className="text-sm font-semibold text-[#477768]"
            >
              ← News
            </Link>

            <div className="mt-8 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.12em] text-[#477768]">
              {post.category && (
                <span>
                  {
                    post.category
                  }
                </span>
              )}

              <span>
                {formatDate(
                  post.published_at
                )}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-bold leading-[1.06] tracking-[-0.05em] text-[#173f35] sm:text-5xl lg:text-6xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-7 max-w-3xl text-lg leading-8 text-neutral-600">
                {
                  post.excerpt
                }
              </p>
            )}
          </div>
        </header>

        {post.featured_image_url && (
          <div className="px-5 lg:px-8">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px]">
              <img
                src={
                  post.featured_image_url
                }
                alt={
                  post.title
                }
                className="max-h-[680px] w-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="px-5 py-14 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="whitespace-pre-wrap text-[16px] leading-8 text-neutral-700">
              {
                post.content
              }
            </div>

            <div className="mt-14 border-t border-neutral-200 pt-8">
              <Link
                href="/news"
                className="font-bold text-[#173f35]"
              >
                ← Back to all news
              </Link>
            </div>
          </div>
        </div>
      </article>

      <SiteFooter />
    </main>
  )
}