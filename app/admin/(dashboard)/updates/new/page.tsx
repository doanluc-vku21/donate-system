import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

import {
  createSiteUpdate,
} from '../actions'

type PageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function NewUpdatePage({
  searchParams,
}: PageProps) {
  const query =
    await searchParams

  const supabase =
    await createClient()

  const {
    data: campaigns,
  } = await supabase
    .from('campaigns')
    .select(`
      id,
      title,
      status
    `)
    .order(
      'created_at',
      {
        ascending: false,
      }
    )

  return (
    <div className="p-5 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin/updates"
          className="text-sm font-medium text-neutral-500"
        >
          ← Back to Updates
        </Link>

        <h1 className="mt-5 text-3xl font-bold">
          New Update
        </h1>

        {query.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {
              query.error
            }
          </div>
        )}

        <form
          action={
            createSiteUpdate
          }
          className="mt-8 space-y-6"
        >
          <section className="rounded-xl border bg-white p-6">
            <h2 className="font-bold">
              Update information
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <label className="text-sm font-semibold">
                  Title *
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
                  Related campaign
                </label>

                <select
                  name="campaign_id"
                  className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                >
                  <option value="">
                    No related campaign
                  </option>

                  {(campaigns ??
                    []).map(
                    (
                      campaign
                    ) => (
                      <option
                        key={
                          campaign.id
                        }
                        value={
                          campaign.id
                        }
                      >
                        {
                          campaign.title
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Update type
                </label>

                <select
                  name="update_type"
                  defaultValue="campaign_progress"
                  className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                >
                  <option value="campaign_progress">
                    Campaign progress
                  </option>

                  <option value="campaign_completed">
                    Campaign completed
                  </option>

                  <option value="field_update">
                    Field update
                  </option>

                  <option value="thank_you">
                    Thank you
                  </option>

                  <option value="general">
                    General update
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
                  Full content
                </label>

                <textarea
                  name="content"
                  rows={15}
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-6">
            <h2 className="font-bold">
              Images
            </h2>

            <div className="mt-5">
              <label className="text-sm font-semibold">
                Cover image
              </label>

              <input
                type="file"
                name="cover_image"
                accept="image/jpeg,image/png,image/webp"
                className="mt-2 block w-full"
              />
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold">
                Gallery images
              </label>

              <input
                type="file"
                name="gallery"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="mt-2 block w-full"
              />

              <p className="mt-2 text-xs text-neutral-500">
                You can select
                multiple photos.
              </p>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-6">
            <h2 className="font-bold">
              Publishing
            </h2>

            <select
              name="status"
              defaultValue="draft"
              className="mt-5 w-full rounded-lg border bg-white px-4 py-3"
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
              />

              Featured update
            </label>
          </section>

          <div className="flex justify-end gap-3">
            <Link
              href="/admin/updates"
              className="rounded-lg border px-5 py-3 text-sm font-semibold"
            >
              Cancel
            </Link>

            <button
              className="rounded-lg bg-neutral-950 px-6 py-3 text-sm font-semibold text-white"
            >
              Create update
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}