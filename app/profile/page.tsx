import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Ambil data profil terbaru
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // LOGIKA LINK KEMBALI
  // Jika Mitra -> Ke Dashboard, Jika User -> Ke Home
  const backLink = profile?.role === 'partner' ? '/dashboard' : '/'

  return (
    <div className="min-h-screen bg-[#F3EFE4] p-6 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
        
        {/* Header Background */}
        <div className="h-32 bg-[#1B32BB] relative">
           {/* FIX: Tambahkan z-50 agar tombol berada DI ATAS layer gradient */}
           <Link 
             href={backLink} 
             className="absolute top-6 left-6 text-white/90 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors z-50 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md hover:bg-white/20"
           >
             <ArrowLeft size={18} /> Kembali
           </Link>
           
           {/* Gradient Overlay */}
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-10"></div>
        </div>

        <div className="px-8 pb-8">
           <ProfileForm profile={profile} userEmail={user.email} />
        </div>

      </div>
    </div>
  )
}