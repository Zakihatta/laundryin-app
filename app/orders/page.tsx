import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import OrderList from './OrderList'

export default async function OrdersPage() {
  const supabase = await createClient()
  
  // 1. Cek Login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. AMBIL DATA ORDER (Deep Join untuk dapat No HP Mitra)
  // Kita perlu join: orders -> laundry_partners -> profiles (owner) -> phone_number
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      laundry_partners (
        name,
        profiles:owner_id ( phone_number )
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  // 3. Transformasi Data (Flat-kan struktur agar mudah dibaca Client Component)
  // Supabase join kadang mengembalikan array atau object tunggal, kita rapikan di sini.
  const safeOrders = orders?.map(order => {
    const partnerData = Array.isArray(order.laundry_partners) ? order.laundry_partners[0] : order.laundry_partners;
    const partnerProfile = Array.isArray(partnerData?.profiles) ? partnerData.profiles[0] : partnerData?.profiles;

    return {
      ...order,
      laundry_name: partnerData?.name || 'Laundry Partner',
      partner_phone: partnerProfile?.phone_number || null
    }
  }) || []

  return (
    <div className="min-h-screen bg-[#F3EFE4] pb-20">
      
      {/* Header Gradient */}
      <div className="bg-[#1B32BB] pb-24 pt-8 px-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         <div className="max-w-3xl mx-auto relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-blue-100 hover:text-white font-bold text-sm mb-6 transition-colors">
              <ArrowLeft size={18} /> Kembali ke Beranda
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Pesanan Saya</h1>
            <p className="text-blue-200 text-sm">Pantau status cucian dan hubungi mitra di sini.</p>
         </div>
      </div>

      {/* Content Container */}
      <div className="-mt-16 relative z-20 px-4">
         {/* Kita oper data yang sudah dirapikan ke Client Component */}
         <OrderList orders={safeOrders} />
      </div>

    </div>
  )
}