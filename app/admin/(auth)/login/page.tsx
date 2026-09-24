import { login } from './actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type Props = {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function LoginPage({ searchParams }: Props) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/admin')
  }

  const params = await searchParams

  let errorMessage = ''

  if (params.error === 'invalid') {
    errorMessage = 'Email hoặc mật khẩu không đúng.'
  }

  if (params.error === 'missing') {
    errorMessage = 'Vui lòng nhập email và mật khẩu.'
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Admin Login</h1>

        <p className="mt-2 text-sm text-neutral-500">
          Sign in to manage Donate System.
        </p>

        {errorMessage && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form action={login} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-3 font-semibold text-white hover:bg-neutral-800"
          >
            Sign In
          </button>
        </form>
      </div>
    </main>
  )
}