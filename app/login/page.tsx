'use client'

import { useState } from 'react'
import { login, signup } from './actions' // Pastikan path ini benar
import { 
  ShoppingBag, 
  Store, 
  User, 
  Loader2, 
  ArrowRight, 
  Mail, 
  Lock, 
  UserCircle 
} from 'lucide-react'
import clsx from 'clsx'

export default function LoginPage() {
  // --- STATE MANAGEMENT ---
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<'customer' | 'partner'>('customer')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // --- HANDLE SUBMIT ---
  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setErrorMessage(null)

    // CATATAN: Kita TIDAK perlu lagi 'formData.append' manual di sini.
    // Input hidden di HTML bawah akan otomatis mengirimkan role.

    // Pilih Server Action yang sesuai
    const action = mode === 'login' ? login : signup
    
    try {
      const result = await action(formData)
      
      // Jika ada error dari server (misal: email duplikat)
      if (result?.error) {
        setErrorMessage(result.error)
        setIsLoading(false)
      }
      // Jika sukses, redirect ditangani oleh server action (actions.ts)
    } catch (error) {
      setErrorMessage("Terjadi kesalahan jaringan/sistem.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#F3EFE4]">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#1B32BB] opacity-5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#1B32BB] opacity-10 blur-3xl pointer-events-none"></div>

      {/* MAIN CARD */}
      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* --- SISI KIRI (BRANDING - DESKTOP) --- */}
        <div className="hidden md:flex flex-col justify-between bg-[#1B32BB] p-12 text-[#F3EFE4] relative overflow-hidden transition-all duration-500">
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                <ShoppingBag size={24} className="text-white" />
              </div>
              <span className="font-bold text-2xl tracking-wide">LaundryIn</span>
            </div>

            {/* Teks Dinamis */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight">
                {mode === 'login' 
                  ? 'Selamat Datang Kembali!' 
                  : (role === 'customer' ? 'Mulai Hidup Praktis.' : 'Bangun Bisnis Laundry.')}
              </h1>
              <p className="text-blue-200 text-lg leading-relaxed opacity-90">
                {role === 'customer' 
                  ? 'Cucian bersih, wangi, dan rapi diantar jemput langsung ke depan pintu rumah Anda.'
                  : 'Kelola pesanan, atur layanan, dan tingkatkan omzet laundry Anda dengan sistem digital.'}
              </p>
            </div>
          </div>

          {/* Icon Background Besar */}
          <div className="absolute -bottom-12 -right-12 opacity-10 rotate-12 transform transition-transform duration-700 hover:scale-110 hover:rotate-6 pointer-events-none">
             {role === 'customer' ? <ShoppingBag size={300} /> : <Store size={300} />}
          </div>
          
          <div className="relative z-10 text-sm text-blue-300/80 font-medium">
            © 2025 LaundryIn Corp.
          </div>
        </div>

        {/* --- SISI KANAN (FORM INPUT) --- */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white relative">
          
          {/* 1. Role Switcher (Pilih User / Mitra) */}
          <div className="bg-gray-100 p-1.5 rounded-xl mb-8 flex relative">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-300 relative z-10",
                role === 'customer' 
                  ? "bg-white text-[#1B32BB] shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <User size={18} />
              Pelanggan
            </button>
            <button
              type="button"
              onClick={() => setRole('partner')}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-300 relative z-10",
                role === 'partner' 
                  ? "bg-white text-[#1B32BB] shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Store size={18} />
              Mitra Laundry
            </button>
          </div>

          {/* Header Mobile */}
          <div className="md:hidden mb-6">
             <h2 className="text-2xl font-bold text-[#1B32BB] mb-1">
               {mode === 'login' ? 'Masuk Akun' : 'Daftar Baru'}
             </h2>
             <p className="text-gray-500 text-sm">
               Login sebagai: {role === 'customer' ? 'Pelanggan' : 'Mitra'}
             </p>
          </div>

          {/* Alert Error */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="mt-0.5">⚠️</span> 
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 2. FORM UTAMA */}
          <form action={handleSubmit} className="space-y-5">
            
            {/* --- [PENTING] HIDDEN INPUT UNTUK ROLE --- */}
            {/* Ini kuncinya: mengirim nilai state 'role' ke server via form HTML standar */}
            <input type="hidden" name="role" value={role} />
            {/* ----------------------------------------- */}
            
            {/* Input Nama (Hanya Register) */}
            {mode === 'register' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">
                  {role === 'customer' ? 'Nama Lengkap' : 'Nama Laundry'}
                </label>
                <div className="relative group">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1B32BB] transition-colors" size={20} />
                  <input 
                    name="fullName" 
                    type="text" 
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#1B32BB] focus:ring-4 focus:ring-[#1B32BB]/10 transition-all outline-none font-medium text-gray-700 placeholder-gray-400"
                    placeholder={role === 'customer' ? "Contoh: Budi Santoso" : "Contoh: Laundry Bersih Jaya"}
                  />
                </div>
              </div>
            )}

            {/* Input Email */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1B32BB] transition-colors" size={20} />
                <input 
                  name="email" 
                  type="email" 
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#1B32BB] focus:ring-4 focus:ring-[#1B32BB]/10 transition-all outline-none font-medium text-gray-700 placeholder-gray-400"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1B32BB] transition-colors" size={20} />
                <input 
                  name="password" 
                  type="password" 
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#1B32BB] focus:ring-4 focus:ring-[#1B32BB]/10 transition-all outline-none font-medium text-gray-700 placeholder-gray-400"
                  placeholder="••••••••"
                />
              </div>
              {mode === 'login' && (
                <div className="text-right mt-2">
                   <button type="button" className="text-xs text-gray-400 hover:text-[#1B32BB] transition-colors">Lupa password?</button>
                </div>
              )}
            </div>

            {/* Tombol Submit */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1B32BB] hover:bg-[#14248A] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 transform hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          {/* 3. Footer Switcher (Login <-> Register) */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {mode === 'login' ? 'Belum punya akun LaundryIn?' : 'Sudah punya akun?'}
              <button 
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login')
                  setErrorMessage(null)
                }}
                className="ml-2 font-bold text-[#1B32BB] hover:underline outline-none"
              >
                {mode === 'login' ? 'Daftar disini' : 'Login disini'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}