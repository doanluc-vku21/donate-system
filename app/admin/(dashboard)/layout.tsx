import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from './actions'
import AdminSidebar from '@/components/admin/sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white">
          <div className="flex h-20 items-center justify-between px-5 lg:px-8">
            <div>
              <p className="text-sm text-neutral-500">
                Admin Dashboard
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-neutral-800">
                  Administrator
                </p>

                <p className="text-xs text-neutral-500">
                  {user.email}
                </p>
              </div>

              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  )
}