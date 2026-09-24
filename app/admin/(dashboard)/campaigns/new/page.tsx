import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CampaignForm from './campaign-form'

type Props = {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function NewCampaignPage({
  searchParams,
}: Props) {
  const supabase = await createClient()

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order', {
      ascending: true,
    })

  const params = await searchParams

  let errorMessage = ''

  if (params.error === 'title') {
    errorMessage = 'Campaign title is required.'
  } else if (params.error === 'goal') {
    errorMessage = 'Please enter a valid goal amount.'
  } else if (params.error === 'slug') {
    errorMessage = 'Please enter a valid slug.'
  } else if (params.error === 'duplicate-slug') {
    errorMessage = 'This campaign slug already exists.'
  } else if (params.error) {
    errorMessage = params.error
  }

  return (
    <div className="p-5 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Link
            href="/admin/campaigns"
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
          >
            ← Back to Campaigns
          </Link>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-950">
            Create Campaign
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Create a new fundraising campaign.
          </p>
        </div>

        {categoriesError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load categories: {categoriesError.message}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <CampaignForm categories={categories ?? []} />
      </div>
    </div>
  )
}