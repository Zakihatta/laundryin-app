'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Update Status Biasa (Jemput, Selesai)
export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = await createClient()
  await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
  revalidatePath('/dashboard')
}

// --- [BARU] KONFIRMASI BERAT & HARGA (Saat masuk proses Cuci) ---
export async function confirmOrderDetails(orderId: string, realWeight: number, currentPrice: number, currentWeight: number) {
  const supabase = await createClient()
  
  // 1. Hitung Harga Satuan (Harga Lama / Berat Lama)
  // Ini cara cerdik tanpa perlu query ke tabel service lagi
  const pricePerUnit = currentPrice / currentWeight
  
  // 2. Hitung Total Baru
  const newTotalPrice = pricePerUnit * realWeight

  // 3. Update Database: Berat Baru, Harga Baru, Status -> 'washing'
  const { error } = await supabase
    .from('orders')
    .update({ 
      weight: realWeight,
      total_price: newTotalPrice,
      status: 'washing' // Otomatis lanjut ke proses cuci
    })
    .eq('id', orderId)

  if (error) console.error('Error confirm:', error)
  revalidatePath('/dashboard')
}

// --- [BARU] UPDATE STATUS PEMBAYARAN ---
export async function updatePaymentStatus(orderId: string, isPaid: boolean) {
  const supabase = await createClient()
  await supabase
    .from('orders')
    .update({ payment_status: isPaid ? 'paid' : 'unpaid' })
    .eq('id', orderId)
    
  revalidatePath('/dashboard')
}