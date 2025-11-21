import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  LogOut
} from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Cek login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Ambil data Profile (untuk nama & avatar di sidebar)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Jika user biasa (customer) nyasar ke sini, tendang balik
  if (profile?.role !== 'partner') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full hidden md:flex flex-col z-10">
        {/* Logo Area */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-100">
          <div className="bg-[#1B32BB] p-1.5 rounded-lg">
            <ShoppingBag size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl text-[#1B32BB] tracking-tight">LaundryIn</span>
        </div>

        {/* User Info Kecil (DENGAN AVATAR) */}
        <div className="p-6 pb-2 mb-2">
          <Link href="/profile" className="flex items-center gap-3 p-2 -ml-2 rounded-xl hover:bg-gray-50 transition-all group">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-blue-100 relative overflow-hidden border border-gray-200 group-hover:border-blue-300 shrink-0">
               {profile?.avatar_url ? (
                  <Image 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    fill 
                    className="object-cover"
                  />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#1B32BB] font-bold">
                    {profile?.full_name?.[0] || 'M'}
                  </div>
               )}
            </div>
            
            {/* Nama */}
            <div className="overflow-hidden text-left">
              <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#1B32BB]">{profile?.full_name}</p>
              <p className="text-[10px] text-gray-500 bg-blue-50 text-[#1B32BB] px-2 py-0.5 rounded-full inline-block mt-1">Mitra Partner</p>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-blue-50 hover:text-[#1B32BB] transition-colors">
            <LayoutDashboard size={20} />
            Overview
          </Link>
          <Link href="/dashboard/services" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-blue-50 hover:text-[#1B32BB] transition-colors">
            <ShoppingBag size={20} />
            Layanan & Harga
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-blue-50 hover:text-[#1B32BB] transition-colors">
            <Settings size={20} />
            Pengaturan Toko
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <form action="/auth/signout" method="post"> 
            <button className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors">
              <LogOut size={20} />
              Keluar Aplikasi
            </button>
          </form>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 md:ml-64 p-8">
        {children}
      </main>

    </div>
  )
}