import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/layout/dashboard-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is an approved startup owner
  let isApprovedOwner = false
  if (user.user_metadata?.role === 'entrepreneur') {
    const { data: ownership } = await supabase
      .from('startup_owners')
      .select('id, approved')
      .eq('user_id', user.id)
      .eq('approved', true)
      .maybeSingle()

    isApprovedOwner = !!ownership
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <DashboardNav user={user} isApprovedOwner={isApprovedOwner} />

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
