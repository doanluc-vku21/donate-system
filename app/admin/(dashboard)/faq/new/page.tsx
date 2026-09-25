import Link from 'next/link'

import {
  createFaq,
} from '../actions'

type PageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function NewFaqPage({
  searchParams,
}: PageProps) {
  const query =
    await searchParams

  let errorMessage = ''

  if (
    query.error ===
    'question'
  ) {
    errorMessage =
      'Question is required.'
  } else if (
    query.error ===
    'answer'
  ) {
    errorMessage =
      'Answer is required.'
  } else if (
    query.error
  ) {
    errorMessage =
      query.error
  }

  return (
    <div className="p-5 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin/faq"
          className="text-sm font-medium text-neutral-500"
        >
          ← Back to FAQ
        </Link>

        <h1 className="mt-5 text-3xl font-bold">
          New FAQ
        </h1>

        {errorMessage && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {
              errorMessage
            }
          </div>
        )}

        <form
          action={createFaq}
          className="mt-8 space-y-6"
        >
          <section className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold">
                  Question
                </label>

                <input
                  name="question"
                  required
                  className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Answer
                </label>

                <textarea
                  name="answer"
                  required
                  rows={8}
                  className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Category
                </label>

                <select
                  name="category"
                  className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-4 py-3"
                >
                  <option value="">
                    No category
                  </option>

                  <option value="Donations">
                    Donations
                  </option>

                  <option value="Payments">
                    Payments
                  </option>

                  <option value="Monthly giving">
                    Monthly giving
                  </option>

                  <option value="Campaigns">
                    Campaigns
                  </option>

                  <option value="Privacy">
                    Privacy
                  </option>

                  <option value="Support">
                    Support
                  </option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Sort order
                </label>

                <input
                  type="number"
                  name="sort_order"
                  defaultValue={0}
                  className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Status
                </label>

                <select
                  name="status"
                  defaultValue="published"
                  className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-4 py-3"
                >
                  <option value="published">
                    Published
                  </option>

                  <option value="draft">
                    Draft
                  </option>
                </select>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Link
              href="/admin/faq"
              className="rounded-lg border border-neutral-300 px-5 py-3 text-sm font-semibold"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-lg bg-neutral-950 px-6 py-3 text-sm font-semibold text-white"
            >
              Create FAQ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}