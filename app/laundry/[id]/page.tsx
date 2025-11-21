import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  MapPin, Star, Clock, ShieldCheck, ArrowLeft, ShoppingBag 
} from 'lucide-react'
import OrderButton from './OrderButton'

const getInitials = (name: string) => name.substring(0, 2).toUpperCase()

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LaundryDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: shop } = await supabase.from('laundry_partners').select('*').eq('id', id).single()
  if (!shop) return notFound()

  const { data: services } = await supabase.from('services').select('*').eq('partner_id', shop.id).eq('is_active', true).order('price', { ascending: true })
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[#F3EFE4] pb-20">
      
      {/* --- HEADER WRAPPER (PENTING: relative tapi TIDAK overflow-hidden di sini) --- */}
      <div className="relative mb-24">
        
        {/* 1. BACKGROUND IMAGE CONTAINER (Ini yang di-overflow hidden agar gambar rapi) */}
        <div className="h-64 md:h-80 bg-gray-900 relative overflow-hidden rounded-b-[2rem] shadow-md">
            {shop.image_url ? (
              <Image 
                src={shop.image_url}
                alt={shop.name}
                fill
                className="object-cover opacity-80"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B32BB] to-blue-400 opacity-80"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Tombol Kembali */}
            <div className="absolute top-6 left-6 z-20">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-bold hover:bg-white/30 transition-all border border-white/10"
              >
                <ArrowLeft size={16} /> Kembali
              </Link>
            </div>
        </div>

        {/* 2. INFO TOKO OVERLAY (Di luar container overflow-hidden agar bisa 'nongol') */}
        <div className="absolute -bottom-16 left-0 w-full px-6 z-30">
          <div className="max-w-4xl mx-auto flex items-end gap-6">
            
            {/* Avatar */}
            <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-2xl rotate-3 hidden md:block shrink-0 relative z-40">
               {shop.image_url ? (
                 <div className="relative w-full h-full rounded-2xl overflow-hidden">
                    <Image src={shop.image_url} alt="Avatar" fill className="object-cover" />
                 </div>
               ) : (
                 <div className="w-full h-full bg-[#F3EFE4] rounded-2xl flex items-center justify-center text-4xl font-bold text-[#1B32BB]">
                   {getInitials(shop.name)}
                 </div>
               )}
            </div>

            {/* Teks Info */}
            <div className="flex-1 mb-0 md:mb-4 pb-0">
               <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-sm">
                 {shop.name}
               </h1>
               
               <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                  <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg shadow-sm text-gray-700 border border-gray-100">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" /> {shop.rating || 5.0}
                  </span>
                  <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg shadow-sm text-gray-600 border border-gray-100">
                    <MapPin size={14} /> <span className="truncate max-w-[200px]">{shop.address}</span>
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm text-white ${
                    shop.is_open ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {shop.is_open ? 'BUKA SEKARANG' : 'TUTUP'}
                  </span>
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-4xl mx-auto px-6 space-y-8">
        
        {/* Deskripsi */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mt-8">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
            <ShieldCheck className="text-[#1B32BB]" size={22}/> Tentang Toko
          </h3>
          <p className="text-gray-500 leading-relaxed">
            {shop.description || "Mitra laundry terpercaya yang siap melayani kebutuhan cuci harian Anda."}
          </p>
        </div>

        {/* Daftar Layanan */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ShoppingBag className="text-[#1B32BB]" /> Pilih Layanan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {services?.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-[2rem] border-2 border-dashed border-gray-200 text-gray-400">
                <ShoppingBag size={48} className="mx-auto mb-3 text-gray-300" />
                <p>Belum ada layanan yang tersedia.</p>
              </div>
            ) : (
              services?.map((service) => (
                <div key={service.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[3rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl text-gray-800 group-hover:text-[#1B32BB] transition-colors">{service.name}</h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1 font-medium bg-gray-50 w-fit px-2 py-1 rounded-lg">
                          <Clock size={12} /> Estimasi {service.duration_hours} Jam
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1B32BB] text-xl">Rp {service.price.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">/ {service.unit}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <OrderButton service={service} partnerId={shop.id} isLoggedIn={!!user} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}