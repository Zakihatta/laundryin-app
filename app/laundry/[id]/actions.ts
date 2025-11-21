'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createOrder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const partnerId = formData.get('partnerId') as string
  const serviceName = formData.get('serviceName') as string
  const pricePerUnit = parseFloat(formData.get('price') as string)
  const weight = parseFloat(formData.get('weight') as string)
  const notes = formData.get('notes') as string
  const address = formData.get('address') as string
  
  // --- AMBIL KOORDINAT ---
  const latitude = parseFloat(formData.get('latitude') as string)
  const longitude = parseFloat(formData.get('longitude') as string)

  const totalAmount = pricePerUnit * weight

  const { error } = await supabase.from('orders').insert({
    customer_id: user.id,
    partner_id: partnerId,
    status: 'pending',
    total_price: totalAmount,
    weight: weight,
    pickup_address: address,
    notes: `Layanan: ${serviceName}. ${notes}`,
    // Simpan Koordinat
    latitude: isNaN(latitude) ? null : latitude,
    longitude: isNaN(longitude) ? null : longitude,
  })

  if (error) {
    console.error("Order Error:", error)
    return { error: "Gagal membuat pesanan." }
  }

  revalidatePath('/orders')
  redirect('/orders?success=true')
}