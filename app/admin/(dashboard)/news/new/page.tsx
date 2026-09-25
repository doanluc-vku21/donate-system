import Link from 'next/link'

import {
  createNews,
} from '../actions'

type PageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function NewNewsPage({
  searchParams,
}: PageProps) {
  const query =
    await searchParams

  return (
    <div className="p-5 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin/news"
          className="text-sm font-medium text-neutral-500"
        >
          ← Back to News
        </Link>

        <div className="mt-5">
          <p className="text-sm text-neutral-500">
            Content
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            New article
          </h1>
        </div>

        {query.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {query.error ===
            'title'
              ? 'Title is required.'
              : query.error}
          </div>
        )}

        <form
          action={createNews}
          className="mt-8 space-y-6"
        >
          <section className="rounded-xl border bg-white p-6">
            <h2 className="font-bold">
              Article
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <label className="text-sm font-semibold">
                  Title
                </label>

                <input
                  name="title"
                  required
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Slug
                </label>

                <input
                  name="slug"
                  placeholder="Leave empty to generate automatically"
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Category
                </label>

                <select
                  name="category"
                  className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                >
                  <option value="">
                    Select category
                  </option>

                  <option value="Humanitarian aid">
                    Humanitarian aid
                  </option>

                  <option value="Health">
                    Health
                  </option>

                  <option value="Food & water">
                    Food & water
                  </option>

                  <option value="Climate & resilience">
                    Climate & resilience
                  </option>

                  <option value="Education">
                    Education
                  </option>

                  <option value="Displacement">
                    Displacement
                  </option>

                  <option value="Community">
                    Community
                  </option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Short description
                </label>

                <textarea
                  name="excerpt"
                  rows={4}
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
                  className="mt-2 w-full rounded-lg border px-4 py-3 font-mono text-sm"
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-6">
            <h2 className="font-bold">
              Featured image
            </h2>

            <input
              type="file"
              name="image"
              accept="image/*"
              className="mt-5 block w-full text-sm"
            />
          </section>

          <section className="rounded-xl border bg-white p-6">
            <h2 className="font-bold">
              Publishing
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <label className="text-sm font-semibold">
                  Status
                </label>

                <select
                  name="status"
                  defaultValue="draft"
                  className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="published">
                    Published
                  </option>
                </select>
              </div>

              <label className="flex items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  name="is_featured"
                  className="h-4 w-4"
                />

                Feature this article
              </label>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Link
              href="/admin/news"
              className="rounded-lg border px-5 py-3 text-sm font-semibold"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-lg bg-neutral-950 px-6 py-3 text-sm font-semibold text-white"
            >
              Create article
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}