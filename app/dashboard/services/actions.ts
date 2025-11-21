'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- TAMBAH LAYANAN BARU ---
export async function addService(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Ambil User yang sedang login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // 2. Cari ID Toko Laundry milik user ini
  const { data: partner } = await supabase
    .from('laundry_partners')
    .select('id')
    .eq('owner_id', user.id)
    .single()
  
  if (!partner) {
    // PERBAIKAN DI SINI:
    // Jangan "return { error: ... }" karena akan bikin error tipe data di <form>
    // Cukup console.error saja untuk debugging
    console.error("Toko tidak ditemukan")
    return
  }

  // 3. Masukkan Layanan Baru
  const name = formData.get('name') as string
  const price = formData.get('price') as string
  const unit = formData.get('unit') as string
  const duration = formData.get('duration') as string

  const { error } = await supabase.from('services').insert({
    partner_id: partner.id,
    name,
    price: parseInt(price),
    unit,
    duration_hours: parseInt(duration),
    is_active: true
  })

  if (error) {
    console.error("Gagal simpan service:", error)
    return
  }

  revalidatePath('/dashboard/services')
}

// --- HAPUS LAYANAN ---
export async function deleteService(serviceId: string) {
  const supabase = await createClient()
  await supabase.from('services').delete().eq('id', serviceId)
  revalidatePath('/dashboard/services')
}