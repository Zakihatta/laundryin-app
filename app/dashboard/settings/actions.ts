'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Definisi Tipe Data Update
interface ShopUpdateData {
  name: string;
  description: string;
  address: string;
  is_open: boolean;
  image_url?: string; // Bersifat opsional (?)
}

export async function updateShop(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const address = formData.get('address') as string
  const isOpen = formData.get('isOpen') === 'on'
  
  // 1. AMBIL FILE GAMBAR
  const imageFile = formData.get('shopImage') as File | null;
  let publicUrl: string | null = null;

  // 2. PROSES UPLOAD
  if (imageFile && imageFile.size > 0) {
      if (imageFile.size > 2 * 1024 * 1024) {
          console.error("File terlalu besar")
          return;
      }

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
          .from('shop-images')
          .upload(filePath, imageFile, { upsert: true });

      if (uploadError) {
          console.error('Gagal upload gambar:', uploadError);
          return;
      }

      const { data: urlData } = supabase.storage
          .from('shop-images')
          .getPublicUrl(filePath);
      
      publicUrl = urlData.publicUrl;
  }

  // 3. SIAPKAN DATA UPDATE (PERBAIKAN DI SINI)
  // Kita buat object dasar dulu tanpa 'any'
  const updateData: ShopUpdateData = {
    name,
    description,
    address,
    is_open: isOpen,
  }

  // Jika ada URL baru, kita masukkan ke object secara manual
  if (publicUrl) {
    updateData.image_url = publicUrl
  }

  // 4. UPDATE KE DATABASE
  const { error } = await supabase
    .from('laundry_partners')
    .update(updateData)
    .eq('owner_id', user.id)

  if (error) {
    console.error("Gagal update toko:", error)
    return 
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  revalidatePath('/')
}