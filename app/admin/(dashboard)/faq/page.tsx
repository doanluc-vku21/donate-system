import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

import {
  deleteFaq,
} from './actions'

export default async function AdminFaqPage() {
  const supabase =
    await createClient()

  const {
    data,
    error,
  } = await supabase
    .from('faqs')
    .select(`
      id,
      question,
      answer,
      category,
      sort_order,
      status,
      created_at
    `)
    .order(
      'sort_order',
      {
        ascending: true,
      }
    )
    .order(
      'created_at',
      {
        ascending: true,
      }
    )

  const faqs =
    data ?? []

  return (
    <div className="p-5 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Content
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              FAQ
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Manage public
              frequently asked
              questions.
            </p>
          </div>

          <Link
            href="/admin/faq/new"
            className="inline-flex items-center justify-center rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white"
          >
            + New FAQ
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error.message}
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Total
            </p>

            <p className="mt-2 text-3xl font-bold">
              {faqs.length}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Published
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                faqs.filter(
                  (faq) =>
                    faq.status ===
                    'published'
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">
              Drafts
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                faqs.filter(
                  (faq) =>
                    faq.status ===
                    'draft'
                ).length
              }
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {faqs.length ===
          0 ? (
            <div className="py-16 text-center text-sm text-neutral-500">
              No FAQ items yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Order
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Question
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Category
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-neutral-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {faqs.map(
                    (faq) => (
                      <tr
                        key={
                          faq.id
                        }
                        className="border-t border-neutral-100"
                      >
                        <td className="px-5 py-4 text-sm font-semibold text-neutral-500">
                          {
                            faq.sort_order
                          }
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-xl font-semibold text-neutral-900">
                            {
                              faq.question
                            }
                          </p>

                          <p className="mt-1 max-w-xl truncate text-xs text-neutral-400">
                            {
                              faq.answer
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-600">
                          {faq.category ||
                            '—'}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              faq.status ===
                              'published'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {
                              faq.status
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/faq/${faq.id}/edit`}
                              className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold"
                            >
                              Edit
                            </Link>

                            <form
                              action={deleteFaq.bind(
                                null,
                                faq.id
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
          )}
        </div>
      </div>
    </div>
  )
}