'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom' // IMPORT PENTING
import { Truck, X, Loader2, MapPin } from 'lucide-react'
import { createOrder } from './actions'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// --- IMPORT MAP ---
const MapPicker = dynamic(() => import('@/components/MapPicker'), { 
  ssr: false,
  loading: () => (
    <div className="h-48 w-full bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center text-gray-400">
      <MapPin className="animate-bounce" /> Memuat Peta...
    </div>
  )
})

interface Service { name: string; price: number; unit: string; }
interface OrderButtonProps { service: Service; partnerId: string; isLoggedIn: boolean; }

export default function OrderButton({ service, partnerId, isLoggedIn }: OrderButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null)
  const [mounted, setMounted] = useState(false) // State untuk cek mounted browser
  
  const router = useRouter()

  // Pastikan kita di browser sebelum pakai Portal
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const handleClick = () => {
    if (!isLoggedIn) { router.push('/login'); return }
    setIsOpen(true)
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    await createOrder(formData)
  }

  // Component Modal yang akan di-portal
  const ModalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      
      {/* Container Modal dengan Scroll Fix */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* HEADER (Fixed) */}
        <div className="flex-shrink-0 p-6 border-b border-gray-100 flex justify-between items-center">
           <div>
             <h2 className="text-xl font-bold text-gray-800">Detail Pesanan</h2>
             <p className="text-xs text-gray-500">Layanan: <span className="font-bold text-[#1B32BB]">{service.name}</span></p>
           </div>
           <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
             <X size={20} className="text-gray-500" />
           </button>
        </div>

        {/* BODY (Scrollable) */}
        <div className="overflow-y-auto p-6 space-y-5">
          <form id="orderForm" action={handleSubmit} className="space-y-5">
            <input type="hidden" name="partnerId" value={partnerId} />
            <input type="hidden" name="serviceName" value={service.name} />
            <input type="hidden" name="price" value={service.price} />
            <input type="hidden" name="latitude" value={coords?.lat || ''} />
            <input type="hidden" name="longitude" value={coords?.lng || ''} />

            {/* Peta */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Titik Penjemputan</label>
              <div className="rounded-2xl overflow-hidden border-2 border-gray-100 relative z-0">
                <MapPicker onLocationSelect={(lat, lng) => setCoords({lat, lng})} />
              </div>
              {!coords && <p className="text-xs text-red-500 mt-1">* Wajib klik peta untuk tandai lokasi</p>}
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Detail Alamat</label>
              <textarea name="address" required rows={2} placeholder="Patokan: Pagar hitam, sebelah warung..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B32BB] outline-none text-sm resize-none"></textarea>
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Berat/Qty ({service.unit})</label>
                  <input name="weight" type="number" step="0.1" min="1" defaultValue="1" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B32BB] outline-none font-bold text-gray-800"/>
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Catatan</label>
                  <input name="notes" type="text" placeholder="Opsional..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B32BB] outline-none text-sm"/>
              </div>
            </div>
          </form>
        </div>

        {/* FOOTER (Fixed) */}
        <div className="flex-shrink-0 p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
          <button 
            type="submit" 
            form="orderForm" 
            disabled={isLoading || !coords} 
            className="w-full py-4 bg-[#1B32BB] hover:bg-[#14248A] text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'Konfirmasi & Pesan'}
          </button>
        </div>

      </div>
    </div>
  )

  return (
    <>
      {/* Tombol Trigger (Tetap di tempatnya) */}
      <button onClick={handleClick} className="w-full py-3 rounded-xl bg-gray-50 text-[#1B32BB] font-bold text-sm hover:bg-[#1B32BB] hover:text-white transition-all flex items-center justify-center gap-2">
        <Truck size={16} /> Pesan Layanan Ini
      </button>

      {/* Portal Modal (Dipindahkan ke Body agar tidak tertutup parent) */}
      {isOpen && mounted && createPortal(ModalContent, document.body)}
    </>
  )
}