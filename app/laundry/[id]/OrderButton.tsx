'use client'

import { useState } from 'react'
import { Truck, X, Loader2, MapPin } from 'lucide-react' // Tambah MapPin
import { createOrder } from './actions'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic' // Import Dynamic

// --- IMPORT MAP SECARA DINAMIS ---
// Ini wajib agar tidak error "window is not defined"
const MapPicker = dynamic(() => import('@/components/MapPicker'), { 
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center text-gray-400">
      <MapPin className="animate-bounce" /> Memuat Peta...
    </div>
  )
})

// ... Interface Service & Props TETAP SAMA ...
interface Service { name: string; price: number; unit: string; }
interface OrderButtonProps { service: Service; partnerId: string; isLoggedIn: boolean; }

export default function OrderButton({ service, partnerId, isLoggedIn }: OrderButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // State Lokasi
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null)
  
  const router = useRouter()

  const handleClick = () => {
    if (!isLoggedIn) { router.push('/login'); return }
    setIsOpen(true)
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    await createOrder(formData)
  }

  return (
    <>
      <button onClick={handleClick} className="w-full py-3 rounded-xl bg-gray-50 text-[#1B32BB] font-bold text-sm hover:bg-[#1B32BB] hover:text-white transition-all flex items-center justify-center gap-2">
        <Truck size={16} /> Pesan Layanan Ini
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 my-8">
            
            <button onClick={() => setIsOpen(false)} type="button" className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 z-10"><X size={20} className="text-gray-500" /></button>

            <h2 className="text-xl font-bold text-gray-800 mb-1">Detail Pesanan</h2>
            <p className="text-sm text-gray-500 mb-6">Layanan: <span className="font-bold text-[#1B32BB]">{service.name}</span></p>

            <form action={handleSubmit} className="space-y-4">
              <input type="hidden" name="partnerId" value={partnerId} />
              <input type="hidden" name="serviceName" value={service.name} />
              <input type="hidden" name="price" value={service.price} />
              
              {/* KOORDINAT TERSEMBUNYI */}
              <input type="hidden" name="latitude" value={coords?.lat || ''} />
              <input type="hidden" name="longitude" value={coords?.lng || ''} />

              {/* --- BAGIAN PETA --- */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Titik Penjemputan</label>
                <MapPicker onLocationSelect={(lat, lng) => setCoords({lat, lng})} />
                {!coords && <p className="text-xs text-red-500 mt-1">* Wajib klik peta untuk tandai lokasi</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Detail Alamat</label>
                <textarea name="address" required rows={2} placeholder="Patokan: Pagar hitam, sebelah warung..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B32BB] outline-none text-sm"></textarea>
              </div>

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

              <div className="pt-4 border-t border-gray-100 mt-4">
                <button type="submit" disabled={isLoading || !coords} className="w-full py-4 bg-[#1B32BB] hover:bg-[#14248A] text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Konfirmasi & Pesan'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  )
}