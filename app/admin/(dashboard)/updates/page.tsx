import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

import {
  deleteSiteUpdate,
} from './actions'

function formatDate(
  value: string | null
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

function formatType(
  value: string
) {
  const map:
    Record<
      string,
      string
    > = {
    campaign_progress:
      'Campaign progress',

    campaign_completed:
      'Campaign completed',

    field_update:
      'Field update',

    thank_you:
      'Thank you',

    general:
      'General',
  }

  return (
    map[value] ??
    value
  )
}

export default async function AdminUpdatesPage() {
  const supabase =
    await createClient()

  const {
    data,
    error,
  } = await supabase
    .from('site_updates')
    .select(`
      id,
      title,
      slug,
      update_type,
      cover_image_url,
      status,
      is_featured,
      published_at,
      created_at,
      campaign:campaigns (
        id,
        title,
        slug
      ),
      media:site_update_media (
        id
      )
    `)
    .order(
      'created_at',
      {
        ascending: false,
      }
    )

  const updates =
    data ?? []

  return (
    <div className="p-5 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Content
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Updates
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Publish campaign
              progress, field reports
              and community updates.
            </p>
          </div>

          <Link
            href="/admin/updates/new"
            className="rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white"
          >
            + New update
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
              Updates
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                updates.length
              }
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-neutral-500">
              Published
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                updates.filter(
                  (item) =>
                    item.status ===
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
                updates.filter(
                  (item) =>
                    item.status ===
                    'draft'
                ).length
              }
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Update
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Type
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Campaign
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Photos
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
                {updates.map(
                  (update) => {
                    const campaign =
                      Array.isArray(
                        update.campaign
                      )
                        ? update
                            .campaign[0]
                        : update.campaign

                    const photoCount =
                      Array.isArray(
                        update.media
                      )
                        ? update.media
                            .length
                        : 0

                    return (
                      <tr
                        key={
                          update.id
                        }
                        className="border-t"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            {update.cover_image_url ? (
                              <img
                                src={
                                  update.cover_image_url
                                }
                                alt=""
                                className="h-14 w-20 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-14 w-20 rounded-lg bg-neutral-100" />
                            )}

                            <div>
                              <div className="flex items-center gap-2">
                                <p className="max-w-[300px] truncate font-semibold">
                                  {
                                    update.title
                                  }
                                </p>

                                {update.is_featured && (
                                  <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                    FEATURED
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-xs text-neutral-400">
                                /updates/
                                {
                                  update.slug
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {formatType(
                            update.update_type
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-600">
                          {campaign?.title ||
                            '—'}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {
                            photoCount
                          }
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              update.status ===
                              'published'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {
                              update.status
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-500">
                          {formatDate(
                            update.published_at
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {update.status ===
                              'published' && (
                              <Link
                                href={`/updates/${update.slug}`}
                                target="_blank"
                                className="rounded-lg border px-3 py-2 text-xs font-semibold"
                              >
                                View
                              </Link>
                            )}

                            <Link
                              href={`/admin/updates/${update.id}/edit`}
                              className="rounded-lg border px-3 py-2 text-xs font-semibold"
                            >
                              Edit
                            </Link>

                            <form
                              action={deleteSiteUpdate.bind(
                                null,
                                update.id
                              )}
                            >
                              <button
                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                              >
                                Delete
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    )
                  }
                )}
              </tbody>
            </table>
          </div>

          {updates.length ===
            0 && (
            <div className="py-16 text-center text-sm text-neutral-500">
              No updates yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}