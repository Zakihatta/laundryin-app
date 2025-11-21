'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { updateOrderStatus, confirmOrderDetails, updatePaymentStatus } from './actions'
import { createWaLink } from '@/utils/whatsapp'
import { 
  ShoppingBag, Truck, CheckCircle, Loader2, MessageCircle, 
  Scale, X, Wallet, MapPin, Navigation 
} from 'lucide-react'

// --- 1. DEFINISI TIPE DATA (INTERFACE LENGKAP) ---
interface Order {
  id: string;
  status: string;
  created_at: string;
  total_price: number;
  weight: number;
  pickup_address: string;
  notes: string;
  payment_status: 'paid' | 'unpaid';
  latitude?: number | null;  // Data Lokasi
  longitude?: number | null; // Data Lokasi
  // Struktur Join Profile
  profiles: { full_name: string; phone_number?: string } | { full_name: string; phone_number?: string }[] | null; 
}

export default function OrderManager({ initialOrders, shopId }: { initialOrders: Order[], shopId: string }) {
  
  // State Data Order
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  
  // State UI (Loading & Modal)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [weighingOrder, setWeighingOrder] = useState<Order | null>(null)
  const [realWeight, setRealWeight] = useState<string>('')

  const router = useRouter()
  const supabase = createClient()

  // --- SYNC DATA AWAL ---
  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  // --- REALTIME LISTENER ⚡ ---
  useEffect(() => {
    const channel = supabase.channel('realtime-orders')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'orders',
          filter: `partner_id=eq.${shopId}`
        },
        (payload) => {
          console.log('⚡ Update Realtime:', payload)
          router.refresh() // Refresh data server component
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router, shopId])

  // --- ACTIONS HANDLERS ---

  // 1. Update Status Biasa (Jemput / Selesai)
  const handleUpdate = async (orderId: string, status: string) => {
    setLoadingId(orderId)
    await updateOrderStatus(orderId, status)
    setLoadingId(null)
  }

  // 2. Toggle Status Bayar
  const handlePaymentToggle = async (orderId: string, currentStatus: string) => {
    // Optimistic Update (Ubah UI dulu biar cepat, server nyusul)
    // Tapi karena kita pakai router.refresh, loading state lebih aman
    setLoadingId(orderId)
    const newStatus = currentStatus === 'paid' ? false : true // false = unpaid
    await updatePaymentStatus(orderId, newStatus)
    setLoadingId(null)
  }

  // 3. Submit Berat Asli (Modal)
  const submitWeighing = async () => {
    if (!weighingOrder || !realWeight) return
    setLoadingId(weighingOrder.id)
    
    await confirmOrderDetails(
      weighingOrder.id, 
      parseFloat(realWeight), 
      weighingOrder.total_price, 
      weighingOrder.weight
    )
    
    setWeighingOrder(null)
    setRealWeight('')
    setLoadingId(null)
  }

  return (
    <div className="space-y-4">
        {orders?.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-dashed text-center text-gray-400 animate-in fade-in">
            <ShoppingBag className="mx-auto text-gray-300 mb-3" size={48} />
            <p>Belum ada pesanan masuk.</p>
          </div>
        ) : (
          orders?.map((order) => {
            // Extract Customer Data dengan Aman
            const customer = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
            const customerName = customer?.full_name || 'Pelanggan';
            const waLink = createWaLink(customer?.phone_number, order.id, 'to_customer');

            return (
              <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row justify-between gap-6 animate-in slide-in-from-bottom-2 duration-500 group hover:border-blue-200 transition-colors">
                
                {/* --- KOLOM KIRI: INFO --- */}
                <div className="flex-1">
                  
                  {/* Baris Atas: Status & Payment */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700 animate-pulse' :
                      order.status === 'washing' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'pickup' ? 'bg-indigo-100 text-indigo-700' :
                      order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      {order.status}
                    </span>

                    {/* Tombol Toggle Bayar */}
                    <button 
                      onClick={() => handlePaymentToggle(order.id, order.payment_status)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 transition-all hover:scale-105 border ${
                        order.payment_status === 'paid' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-red-50 text-red-600 border-red-200'
                      }`}
                    >
                      <Wallet size={10} />
                      {order.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                    </button>
                  </div>
                  
                  {/* Nama & Notes */}
                  <h3 className="font-bold text-lg text-gray-800">{customerName}</h3>
                  <p className="text-sm text-gray-500 mb-4 italic">{order.notes}</p>
                  
                  {/* Detail Keuangan & Alamat */}
                  <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Berat / Qty</p>
                      <p className="font-bold text-gray-800">{order.weight} Kg/Unit</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Total Tagihan</p>
                      <p className="font-bold text-[#1B32BB]">Rp {order.total_price.toLocaleString()}</p>
                    </div>
                    <div className="w-full pt-2 border-t border-gray-200 mt-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Alamat Jemput</p>
                      <div className="flex items-start justify-between gap-2">
                         <p className="text-gray-700 leading-snug text-xs">{order.pickup_address}</p>
                         
                         {/* TOMBOL NAVIGASI MAPS */}
                         {order.latitude && order.longitude && (
                           <a 
                             href={`https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="shrink-0 flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold hover:bg-blue-200 transition-colors"
                           >
                             <Navigation size={10} /> Maps
                           </a>
                         )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- KOLOM KANAN: TOMBOL AKSI --- */}
                <div className="flex flex-row lg:flex-col gap-2 justify-center border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 min-w-[160px]">
                  
                  {/* Tombol WA */}
                  <a 
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                        customer?.phone_number 
                        ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <MessageCircle size={14} /> Chat WA
                  </a>

                  {/* Tombol Loading / Status */}
                  {loadingId === order.id ? (
                    <div className="flex justify-center py-2 text-[#1B32BB]"><Loader2 className="animate-spin" /></div>
                  ) : (
                    <>
                        {/* LOGIKA STATUS FLOW */}
                        {order.status === 'pending' && (
                            <button onClick={() => handleUpdate(order.id, 'pickup')} className="btn-action bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
                              <Truck size={14}/> Jemput
                            </button>
                        )}
                        {order.status === 'pickup' && (
                            // Trigger Modal Timbangan
                            <button onClick={() => { setWeighingOrder(order); setRealWeight(order.weight.toString()) }} className="btn-action bg-purple-50 text-purple-600 hover:bg-purple-100">
                              <Scale size={14}/> Timbang & Cuci
                            </button>
                        )}
                        {(order.status === 'washing') && (
                            <button onClick={() => handleUpdate(order.id, 'completed')} className="btn-action bg-green-50 text-green-600 hover:bg-green-100">
                              <CheckCircle size={14}/> Selesai
                            </button>
                        )}
                    </>
                  )}
                </div>

              </div>
            )
          })
        )}

      {/* --- MODAL POPUP TIMBANGAN --- */}
      {weighingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95">
            
            <button onClick={() => setWeighingOrder(null)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={20}/></button>

            <h3 className="font-bold text-xl text-gray-800 mb-1">Konfirmasi Cucian</h3>
            <p className="text-sm text-gray-500 mb-6">Pastikan berat sudah sesuai timbangan.</p>
            
            <div className="bg-blue-50 p-4 rounded-xl mb-4 text-sm text-blue-800 border border-blue-100">
              <div className="flex justify-between mb-1">
                 <span>Perkiraan Awal:</span>
                 <span className="font-bold">{weighingOrder.weight} Unit</span>
              </div>
              <div className="flex justify-between">
                 <span>Harga Estimasi:</span>
                 <span className="font-bold">Rp {weighingOrder.total_price.toLocaleString()}</span>
              </div>
            </div>

            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Berat / Jumlah Real</label>
            <div className="flex gap-2 mb-6">
              <input 
                type="number" 
                step="0.1"
                value={realWeight}
                onChange={(e) => setRealWeight(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-2xl text-2xl font-bold text-gray-800 focus:border-[#1B32BB] focus:ring-0 outline-none transition-all text-center"
                autoFocus
              />
            </div>

            <button onClick={submitWeighing} className="w-full py-4 bg-[#1B32BB] text-white font-bold rounded-xl hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
              <CheckCircle size={20}/>
              Simpan & Mulai Cuci
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .btn-action {
          @apply w-full px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2;
        }
      `}</style>
    </div>
  )
}