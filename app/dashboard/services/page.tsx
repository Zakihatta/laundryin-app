import { createClient } from '@/utils/supabase/server'
import { addService, deleteService } from './actions'
import { Plus, Trash2, Package, Clock, Tag } from 'lucide-react'

export default async function ServicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Ambil ID Partner
  const { data: partner } = await supabase
    .from('laundry_partners')
    .select('id')
    .eq('owner_id', user?.id)
    .single()

  // 2. Ambil Daftar Services
  let services = []
  if (partner) {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false })
    services = data || []
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Atur Layanan</h1>
        <p className="text-gray-500">Tentukan harga dan jenis cucian yang Anda terima.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- FORM TAMBAH LAYANAN (KIRI) --- */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6 text-[#1B32BB]">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Plus size={20} />
            </div>
            <h2 className="font-bold">Tambah Baru</h2>
          </div>

          <form action={addService} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nama Layanan</label>
              <input name="name" type="text" required placeholder="Contoh: Cuci Komplit" className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#1B32BB] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Harga (Rp)</label>
                <input name="price" type="number" required placeholder="7000" className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#1B32BB] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Satuan</label>
                <select name="unit" className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#1B32BB] outline-none text-sm">
                  <option value="kg">Per Kg</option>
                  <option value="pcs">Per Potong</option>
                  <option value="meter">Per Meter</option>
                  <option value="set">Per Set</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Estimasi (Jam)</label>
              <input name="duration" type="number" defaultValue={24} required className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#1B32BB] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm" />
              <p className="text-xs text-gray-400 mt-1">Berapa lama cucian selesai?</p>
            </div>

            <button type="submit" className="w-full bg-[#1B32BB] hover:bg-[#14248A] text-white font-bold py-3 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 mt-2">
              Simpan Layanan
            </button>
          </form>
        </div>

        {/* --- DAFTAR LAYANAN (KANAN) --- */}
        <div className="lg:col-span-2 space-y-4">
          {services.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
              <Package className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 font-medium">Belum ada layanan.</p>
              <p className="text-sm text-gray-400">Tambahkan layanan pertama Anda di panel kiri.</p>
            </div>
          ) : (
            services.map((service) => (
              <div key={service.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-blue-200 transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800 text-lg">{service.name}</h3>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Aktif</span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Tag size={14}/> Rp {service.price.toLocaleString('id-ID')} / {service.unit}</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> {service.duration_hours} Jam</span>
                  </div>
                </div>

                {/* Tombol Hapus (Server Action Wrapper) */}
                <form action={deleteService.bind(null, service.id)}>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Hapus Layanan">
                    <Trash2 size={18} />
                  </button>
                </form>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}