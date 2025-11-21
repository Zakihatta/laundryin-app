'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const fullName = formData.get('fullName') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const avatarFile = formData.get('avatar') as File

  let avatarUrl = null

  // 1. Handle Upload Foto (Jika user memilih file baru)
  if (avatarFile && avatarFile.size > 0) {
    const fileName = `${user.id}-${Date.now()}.png`
    
    const { error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(fileName, avatarFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload Error:', uploadError)
      return { error: 'Gagal upload foto. Pastikan ukuran < 2MB.' }
    }

    // Dapatkan URL Publik
    const { data: { publicUrl } } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    avatarUrl = publicUrl
  }

  // 2. Siapkan Data Update
  const updates: {
    full_name: string;
    phone_number: string;
    updated_at: string;
    avatar_url?: string; // Tanda tanya artinya opsional
  } = {
    full_name: fullName,
    phone_number: phoneNumber,
    updated_at: new Date().toISOString(),
  }

  // Hanya update avatar jika ada file baru
  if (avatarUrl) {
    updates.avatar_url = avatarUrl
  }

  // 3. Simpan ke Database
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    return { error: 'Gagal menyimpan profil.' }
  }

  revalidatePath('/profile')
  revalidatePath('/', 'layout') // Refresh navbar agar avatar berubah
  return { success: 'Profil berhasil diperbarui!' }
}