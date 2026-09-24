import Link from 'next/link'

type PageProps = {
  searchParams: Promise<{
    session_id?: string
  }>
}

export default async function DonationSuccessPage({
  searchParams,
}: PageProps) {
  const query =
    await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffef9] px-5 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#baf477] text-2xl text-[#173f35]">
          ✓
        </div>

        <h1 className="mt-6 text-4xl font-bold tracking-[-0.04em] text-[#173f35]">
          Thank you for your support.
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-500">
          Your payment has been submitted. We&apos;re confirming your donation.
        </p>

        {query.session_id && (
          <p className="mt-5 break-all text-[10px] text-neutral-300">
            {query.session_id}
          </p>
        )}

        <Link
          href="/campaigns"
          className="mt-8 inline-flex rounded-full bg-[#173f35] px-6 py-3 text-sm font-bold text-white"
        >
          Explore campaigns
        </Link>
      </div>
    </main>
  )
}