import Link from 'next/link'

import {
  notFound,
} from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import {
  updateNews,
} from '../../actions'

type PageProps = {
  params: Promise<{
    id: string
  }>

  searchParams: Promise<{
    error?: string
  }>
}

export default async function EditNewsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } =
    await params

  const query =
    await searchParams

  const supabase =
    await createClient()

  const {
    data: post,
  } = await supabase
    .from('blog_posts')
    .select('*')
    .eq(
      'id',
      id
    )
    .single()

  if (!post) {
    notFound()
  }

  const action =
    updateNews.bind(
      null,
      id
    )

  return (
    <div className="p-5 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin/news"
          className="text-sm font-medium text-neutral-500"
        >
          ← Back to News
        </Link>

        <h1 className="mt-5 text-3xl font-bold">
          Edit article
        </h1>

        {query.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {
              query.error
            }
          </div>
        )}

        <form
          action={action}
          className="mt-8 space-y-6"
        >
          <section className="rounded-xl border bg-white p-6">
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold">
                  Title
                </label>

                <input
                  name="title"
                  required
                  defaultValue={
                    post.title
                  }
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Slug
                </label>

                <input
                  name="slug"
                  defaultValue={
                    post.slug
                  }
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Category
                </label>

                <input
                  name="category"
                  defaultValue={
                    post.category ||
                    ''
                  }
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Short description
                </label>

                <textarea
                  name="excerpt"
                  rows={4}
                  defaultValue={
                    post.excerpt ||
                    ''
                  }
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Content
                </label>

                <textarea
                  name="content"
                  rows={18}
                  defaultValue={
                    post.content ||
                    ''
                  }
                  className="mt-2 w-full rounded-lg border px-4 py-3 font-mono text-sm"
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-6">
            <h2 className="font-bold">
              Featured image
            </h2>

            {post.featured_image_url && (
              <img
                src={
                  post.featured_image_url
                }
                alt=""
                className="mt-5 max-h-72 w-full rounded-xl object-cover"
              />
            )}

            <input
              type="file"
              name="image"
              accept="image/*"
              className="mt-5 block w-full"
            />
          </section>

          <section className="rounded-xl border bg-white p-6">
            <select
              name="status"
              defaultValue={
                post.status
              }
              className="w-full rounded-lg border bg-white px-4 py-3"
            >
              <option value="draft">
                Draft
              </option>

              <option value="published">
                Published
              </option>
            </select>

            <label className="mt-5 flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={
                  post.is_featured
                }
              />

              Featured article
            </label>
          </section>

          <div className="flex justify-end gap-3">
            <Link
              href="/admin/news"
              className="rounded-lg border px-5 py-3 text-sm font-semibold"
            >
              Cancel
            </Link>

            <button
              className="rounded-lg bg-neutral-950 px-6 py-3 text-sm font-semibold text-white"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}