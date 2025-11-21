import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import OrderManager from './OrderManager'
import { Wallet, ShoppingBag, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic' 

// --- Action Create Shop (Biarkan Saja) ---
async function createShop(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const name = formData.get('name') as string
  const address = formData.get('address') as string
  const description = formData.get('description') as string
  await supabase.from('laundry_partners').insert({ owner_id: user.id, name, address, description, is_open: true })
  revalidatePath('/dashboard')
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Cek Toko
  const { data: shop } = await supabase
    .from('laundry_partners')
    .select('*')
    .eq('owner_id', user?.id)
    .single()

  if (!shop) {
    // ... (Kode Tampilan Setup Toko SAMA SEPERTI SEBELUMNYA - Salin dari file lama Anda jika perlu) ...
    return (
       <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
             <h1 className="text-2xl font-bold mb-4 text-gray-800">Setup Toko Dulu</h1>
             <form action={createShop} className="space-y-4">
                <input name="name" required placeholder="Nama Laundry" className="w-full p-3 border rounded-xl outline-none focus:border-[#1B32BB]" />
                <textarea name="address" required placeholder="Alamat" className="w-full p-3 border rounded-xl outline-none focus:border-[#1B32BB]" />
                <input name="description" placeholder="Deskripsi Singkat" className="w-full p-3 border rounded-xl outline-none focus:border-[#1B32BB]" />
                <button className="w-full bg-[#1B32BB] text-white p-3 rounded-xl font-bold hover:bg-blue-800 transition-all">Simpan & Buka</button>
             </form>
          </div>
       </div>
    )
  }

  // 2. AMBIL ORDER
  const { data: orders } = await supabase
    .from('orders')
    .select('*, profiles(full_name, phone_number)') // TAMBAHKAN phone_number DI SINI
    .eq('partner_id', shop.id)
    .order('created_at', { ascending: false })

  const totalOrders = orders?.length || 0
  const totalIncome = orders?.reduce((acc, curr) => acc + (curr.status === 'completed' ? curr.total_price : 0), 0) || 0
  const activeOrders = orders?.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length

  return (
    <div>
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Halo, <span className="font-bold text-[#1B32BB]">{shop.name}</span> 👋</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${shop.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {shop.is_open ? 'TOKO BUKA' : 'TOKO TUTUP'}
        </div>
      </header>

      {/* Statistik Cards (Desain Baru) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Card 1: Pendapatan */}
        <div className="bg-gradient-to-br from-[#1B32BB] to-blue-700 p-6 rounded-[2rem] text-white shadow-lg shadow-blue-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center gap-3 mb-4 opacity-90">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><Wallet size={20} /></div>
            <span className="text-sm font-medium">Pendapatan</span>
          </div>
          <p className="text-3xl font-bold">Rp {totalIncome.toLocaleString('id-ID')}</p>
        </div>

        {/* Card 2: Total Order */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"><ShoppingBag size={20} /></div>
              <span className="text-sm font-medium">Total Pesanan</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{totalOrders}</p>
        </div>

        {/* Card 3: Order Aktif */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors"><Activity size={20} /></div>
              <span className="text-sm font-medium">Sedang Proses</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{activeOrders}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-6">Pesanan Masuk</h2>
      
      <OrderManager 
        initialOrders={orders || []} 
        shopId={shop.id} 
      />

    </div>
  )
}