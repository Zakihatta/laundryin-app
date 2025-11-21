'use client'

import { useState } from 'react'
import { updateProfile } from './actions'
import { User, Phone, Camera, Save, Loader2, Mail } from 'lucide-react'
import Image from 'next/image'

// Definisikan bentuk data Profile
interface ProfileData {
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
}

interface ProfileFormProps {
  profile: ProfileData | null;
  userEmail: string | undefined;
}

export default function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [preview, setPreview] = useState(profile?.avatar_url)

  // Handle Preview Image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)
    
    const result = await updateProfile(formData)
    
    if (result?.error) {
      setMessage(`❌ ${result.error}`)
    } else {
      setMessage('✅ Profil berhasil disimpan!')
    }
    setIsLoading(false)
  }

  return (
    <form action={handleSubmit} className="-mt-12 relative z-10">
      
      {/* Avatar Upload */}
      <div className="flex justify-center mb-8">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-200 overflow-hidden relative">
            {preview ? (
              <Image 
                src={preview} 
                alt="Avatar" 
                fill 
                className="object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <User size={40} />
              </div>
            )}
          </div>
          
          {/* Tombol Kamera Kecil */}
          <label className="absolute bottom-0 right-0 bg-[#1B32BB] text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-all shadow-md border-2 border-white">
            <Camera size={14} />
            <input 
              name="avatar" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageChange}
            />
          </label>
        </div>
      </div>

      <div className="space-y-5">
        {message && (
          <div className={`p-3 rounded-xl text-sm font-medium text-center ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Read Only Email */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Email (Tidak bisa diubah)</label>
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 cursor-not-allowed">
            <Mail size={18} />
            <span>{userEmail}</span>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Nama Lengkap</label>
          <div className="relative">
            <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input 
              name="fullName" 
              defaultValue={profile?.full_name} 
              type="text" 
              required
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B32BB] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="Nama Anda"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Nomor WhatsApp</label>
          <div className="relative">
            <Phone className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input 
              name="phoneNumber" 
              defaultValue={profile?.phone_number} 
              type="tel" 
              required
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B32BB] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="0812..."
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full mt-4 bg-[#1B32BB] hover:bg-[#14248A] text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : (
            <>
              <Save size={18} /> Simpan Perubahan
            </>
          )}
        </button>
      </div>
    </form>
  )
}