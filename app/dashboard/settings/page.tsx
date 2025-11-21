import { createClient } from '@/utils/supabase/server'
import { updateShop } from './actions'
import { Save, Store, MapPin, FileText, Power, Camera } from 'lucide-react'
import Image from 'next/image'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: shop } = await supabase
    .from('laundry_partners')
    .select('*')
    .eq('owner_id', user?.id)
    .single()

  return (
    <div className="max-w-2xl mb-20">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan Toko</h1>
        <p className="text-gray-500">Kelola informasi profil laundry Anda.</p>
      </header>

      <form action={updateShop} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
        
        {/* --- BAGIAN UPLOAD GAMBAR (BARU) --- */}
        <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Foto Toko / Banner</label>
            
            <div className="relative w-full h-48 bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-[#1B32BB] transition-colors group">
                
                {/* Preview Gambar jika ada */}
                {shop.image_url ? (
                    <Image 
                        src={shop.image_url} 
                        alt="Foto Toko" 
                        fill 
                        className="object-cover group-hover:opacity-75 transition-opacity"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <Camera size={32} className="mb-2"/>
                        <span className="text-sm font-medium">Upload Foto Toko</span>
                    </div>
                )}

                {/* Input File Transparan di atasnya */}
                <input 
                    type="file" 
                    name="shopImage" 
                    accept="image/png, image/jpeg, image/jpg"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                {/* Overlay Icon saat hover */}
                <div className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center text-white z-0 pointer-events-none">
                    <Camera size={24} /> <span className="ml-2 text-sm font-bold">Ganti Foto</span>
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">*Format JPG/PNG. Maksimal 2MB. Disarankan gambar landscape.</p>
        </div>


        {/* Status Buka/Tutup (Toggle) */}
        <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-between border border-blue-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${shop.is_open ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
              <Power size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-800">Status Operasional</p>
              <p className="text-xs text-gray-500">{shop.is_open ? 'Toko Sedang BUKA' : 'Toko Sedang TUTUP'}</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="isOpen" className="sr-only peer" defaultChecked={shop.is_open} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B32BB]"></div>
          </label>
        </div>

        {/* Nama */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nama Laundry</label>
          <div className="relative">
            <Store className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input name="name" defaultValue={shop.name} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B32BB] focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Slogan / Deskripsi</label>
          <div className="relative">
            <FileText className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input name="description" defaultValue={shop.description} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B32BB] focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
        </div>

        {/* Alamat */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Alamat Lengkap</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <textarea name="address" rows={3} defaultValue={shop.address} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B32BB] focus:ring-2 focus:ring-blue-100 outline-none transition-all"></textarea>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button className="w-full bg-[#1B32BB] hover:bg-[#14248A] text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
            <Save size={18} /> Simpan Pengaturan
          </button>
        </div>

      </form>
    </div>
  )
}