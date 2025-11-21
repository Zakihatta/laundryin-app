'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login Error:", error.message) // Cek terminal jika error
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // 1. Ambil Data Form
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string

  console.log("Mencoba Register:", { email, fullName, role }) // Debug Log

  // 2. Daftar ke Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    // Kita matikan metadata di sini karena kita akan insert manual
  })

  if (authError) {
    console.error("Auth Error:", authError.message)
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: "Gagal membuat user (No User Data Returned)" }
  }

  console.log("Auth Sukses, User ID:", authData.user.id)

  // 3. INSERT MANUAL ke Tabel Profiles
  // Ini menggantikan Trigger SQL yang error tadi
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id, // PENTING: ID harus sama dengan Auth User
      email: email,
      full_name: fullName,
      role: role === 'partner' ? 'partner' : 'customer', // Validasi sederhana
    })

  if (profileError) {
    console.error("Profile Insert Error:", profileError) // INI YANG KITA CARI
    // Jika gagal insert profile, kita jangan membatalkan register auth, 
    // tapi user mungkin perlu setup ulang nanti. 
    // Untuk sekarang, kita return error agar Anda tahu.
    return { error: "Gagal menyimpan data profil: " + profileError.message }
  }

  console.log("Profile Sukses Disimpan!")
  
  revalidatePath('/', 'layout')
  redirect('/')
}