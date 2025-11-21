import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // 1. Cek apakah user ada session
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // 2. Proses Logout Supabase
    await supabase.auth.signOut()
  }

  // 3. Revalidate agar cache halaman bersih
  revalidatePath('/', 'layout')

  // 4. Redirect ke halaman login
  return NextResponse.redirect(new URL('/login', req.url), {
    status: 302,
  })
}