import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

import {
  deleteNews,
} from './actions'

function formatDate(
  value:
    | string
    | null
) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  ).format(
    new Date(value)
  )
}

export default async function AdminNewsPage() {
  const supabase =
    await createClient()

  const {
    data,
    error,
  } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      category,
      excerpt,
      featured_image_url,
      status,
      is_featured,
      published_at,
      created_at
    `)
    .order(
      'created_at',
      {
        ascending: false,
      }
    )

  const posts =
    data ?? []

  return (
    <div className="p-5 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Content
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              News
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Create and manage
              news articles.
            </p>
          </div>

          <Link
            href="/admin/news/new"
            className="inline-flex items-center justify-center rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white"
          >
            + New article
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {
              error.message
            }
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-neutral-500">
              Articles
            </p>

            <p className="mt-2 text-3xl font-bold">
              {posts.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-neutral-500">
              Published
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                posts.filter(
                  (post) =>
                    post.status ===
                    'published'
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-neutral-500">
              Draft
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                posts.filter(
                  (post) =>
                    post.status ===
                    'draft'
                ).length
              }
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Article
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Category
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Published
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {posts.map(
                  (post) => (
                    <tr
                      key={
                        post.id
                      }
                      className="border-t border-neutral-100"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          {post.featured_image_url ? (
                            <img
                              src={
                                post.featured_image_url
                              }
                              alt=""
                              className="h-14 w-20 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-14 w-20 rounded-lg bg-neutral-100" />
                          )}

                          <div>
                            <div className="flex items-center gap-2">
                              <p className="max-w-[380px] truncate font-semibold">
                                {
                                  post.title
                                }
                              </p>

                              {post.is_featured && (
                                <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                  FEATURED
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-neutral-400">
                              /news/
                              {
                                post.slug
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-600">
                        {post.category ||
                          '—'}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            post.status ===
                            'published'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {
                            post.status
                          }
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-500">
                        {formatDate(
                          post.published_at
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {post.status ===
                            'published' && (
                            <Link
                              href={`/news/${post.slug}`}
                              target="_blank"
                              className="rounded-lg border px-3 py-2 text-xs font-semibold"
                            >
                              View
                            </Link>
                          )}

                          <Link
                            href={`/admin/news/${post.id}/edit`}
                            className="rounded-lg border px-3 py-2 text-xs font-semibold"
                          >
                            Edit
                          </Link>

                          <form
                            action={deleteNews.bind(
                              null,
                              post.id
                            )}
                          >
                            <button
                              type="submit"
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {posts.length ===
            0 && (
            <div className="py-16 text-center text-sm text-neutral-500">
              No news articles
              yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}