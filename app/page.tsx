import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ShoppingBag, 
  MapPin, 
  Star, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Search,
  Instagram,
  Twitter,
  Facebook,
  Store,
  ReceiptText // Icon baru untuk Pesanan
} from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  
  // 1. Cek User Login & Role
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*') 
      .eq('id', user.id)
      .single()
    
    profile = data

    if (profile?.role === 'partner') redirect('/dashboard')
  }

  // 2. AMBIL DATA LAUNDRY
  const { data: laundries } = await supabase
    .from('laundry_partners')
    .select('*')
    .eq('is_open', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#F3EFE4] font-sans selection:bg-[#1B32BB] selection:text-white">
      
      {/* --- NAVBAR (Sticky & Glass) --- */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-white/40 rounded-full px-6 py-3 shadow-sm flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-[#1B32BB] p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl text-[#1B32BB] tracking-tight">LaundryIn</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#layanan" className="hover:text-[#1B32BB] transition-colors">Layanan</a>
            <a href="#mitra" className="hover:text-[#1B32BB] transition-colors">Cari Laundry</a>
          </div>

          {/* Auth / Profile Area */}
          {user ? (
             <div className="flex items-center gap-3 sm:gap-4">
               
               {/* --- [BARU] TOMBOL PESANAN SAYA --- */}
               <Link 
                 href="/orders" 
                 className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-bold hover:text-[#1B32BB] hover:border-[#1B32BB] transition-all group"
                 title="Riwayat Pesanan"
               >
                 <ReceiptText size={18} className="group-hover:scale-110 transition-transform"/>
                 <span className="hidden sm:inline">Pesanan Saya</span>
               </Link>
               {/* ---------------------------------- */}

               {/* Profil Avatar */}
               <Link href="/profile" className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 group">
                 <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden relative border border-gray-300 group-hover:border-[#1B32BB] transition-colors">
                    {profile?.avatar_url ? (
                      <Image 
                        src={profile.avatar_url} 
                        alt="Profile" 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#1B32BB] text-white font-bold text-sm">
                        {profile?.full_name?.charAt(0) || 'U'}
                      </div>
                    )}
                 </div>
                 <div className="hidden lg:flex flex-col">
                    <span className="text-xs font-bold text-gray-700 group-hover:text-[#1B32BB]">
                      {profile?.full_name?.split(' ')[0] || 'User'}
                    </span>
                    <span className="text-[10px] text-gray-400 leading-none">Pelanggan</span>
                 </div>
               </Link>

               {/* Logout */}
               <form action="/auth/signout" method="post">
                  <button className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all" title="Keluar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                  </button>
               </form>
             </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-[#1B32BB] hidden sm:block">
                Masuk
              </Link>
              <Link href="/login" className="px-6 py-2.5 rounded-full bg-[#1B32BB] text-white font-bold text-xs shadow-lg hover:shadow-blue-900/40 hover:-translate-y-0.5 transition-all">
                Daftar Sekarang
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-[#1B32BB] text-xs font-bold uppercase tracking-wider">
              <Zap size={14} className="fill-current" />
              Solusi Laundry #1 di Indonesia
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-[#1e293b] leading-[1.1] tracking-tight">
              Cuci Bersih, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B32BB] to-purple-600">
                Hidup Santai.
              </span>
            </h1>
            
            <p className="text-lg text-gray-500 max-w-md leading-relaxed">
              Platform penghubung mitra laundry terbaik dengan pakaian kotor Anda. Antar jemput cepat, harga transparan, dan wanginya tahan lama.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#mitra" className="px-8 py-4 rounded-2xl bg-[#1B32BB] text-white font-bold text-center shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-900/30 hover:scale-105 transition-all flex justify-center items-center gap-2">
                Cari Laundry Terdekat <ArrowRight size={18} />
              </a>
              {!user && (
                <Link href="/login" className="px-8 py-4 rounded-2xl bg-white text-[#1B32BB] border border-gray-200 font-bold text-center hover:bg-gray-50 hover:border-blue-200 transition-all">
                  Gabung Mitra
                </Link>
              )}
            </div>

            <div className="flex items-center gap-8 pt-4 border-t border-gray-200/50">
              <div>
                <p className="text-2xl font-bold text-gray-800">10k+</p>
                <p className="text-xs text-gray-500 font-medium">Pengguna Aktif</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">500+</p>
                <p className="text-xs text-gray-500 font-medium">Mitra Laundry</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">4.9</p>
                <p className="text-xs text-gray-500 font-medium">Rating Rata-rata</p>
              </div>
            </div>
          </div>

          <div className="relative h-[500px] hidden lg:block perspective-1000">
            <div className="absolute top-10 right-20 w-72 bg-white p-5 rounded-3xl shadow-2xl border border-white/50 backdrop-blur-sm z-20 animate-[bounce_3s_infinite]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold">Status Pesanan</p>
                  <p className="font-bold text-gray-800">Selesai Dicuci</p>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-full h-full bg-green-500"></div>
              </div>
            </div>

            <div className="absolute top-40 left-10 w-64 bg-white/80 p-5 rounded-3xl shadow-xl border border-white/50 backdrop-blur-md z-10 animate-[pulse_4s_infinite]">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">PROMO</span>
                 <span className="text-xs text-gray-400">Baru saja</span>
               </div>
               <p className="font-bold text-gray-700 text-lg">Diskon 50%</p>
               <p className="text-sm text-gray-500">Khusus pengguna baru LaundryIn.</p>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-br from-[#1B32BB] to-purple-600 rounded-[3rem] rotate-6 shadow-2xl z-0 flex items-center justify-center">
               <div className="w-[400px] h-[400px] border-4 border-white/20 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 2px, transparent 2.5px)', backgroundSize: '20px 20px' }}></div>
                 <ShoppingBag size={180} className="text-white/90 drop-shadow-lg" />
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- FEATURES SECTION --- */}
      <section id="layanan" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Mengapa LaundryIn?</h2>
            <p className="text-gray-500">Kami memastikan pakaian Anda ditangani oleh profesional dengan standar kebersihan tinggi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#1B32BB] mb-6">
                <MapPin size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Mitra Terdekat</h3>
              <p className="text-gray-500 leading-relaxed">Temukan ratusan mitra laundry di sekitar Anda dengan rating terpercaya.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                <Clock size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Tepat Waktu</h3>
              <p className="text-gray-500 leading-relaxed">Estimasi waktu pengerjaan yang akurat. Selesai tepat waktu atau uang kembali.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Jaminan Bersih</h3>
              <p className="text-gray-500 leading-relaxed">Garansi cuci ulang jika pakaian Anda masih kotor atau bau apek.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- LAUNDRY LIST SECTION (REAL DATA) --- */}
      <section id="mitra" className="py-20 px-6 bg-white relative">
         <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#F3EFE4] to-white"></div>

         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Pilih Mitra Laundry</h2>
                <p className="text-gray-500">Mitra laundry yang sedang buka dan siap menerima pesanan.</p>
              </div>
              <div className="relative">
                 <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                 <input type="text" placeholder="Cari nama laundry..." className="pl-12 pr-6 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B32BB] w-full md:w-72 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {(!laundries || laundries.length === 0) && (
                  <div className="col-span-full flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                       <Store size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-600">Belum ada mitra buka</h3>
                    <p className="text-gray-400">Coba kembali lagi nanti.</p>
                  </div>
               )}

               {laundries?.map((shop) => (
                  <Link href={`/laundry/${shop.id}`} key={shop.id} className="group relative bg-white rounded-[2rem] border border-gray-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col h-full">
                     
                     <div className="h-44 relative overflow-hidden bg-gray-100">
                      
                      {/* JIKA ADA IMAGE URL, TAMPILKAN GAMBAR */}
                      {shop.image_url ? (
                          <Image 
                            src={shop.image_url}
                            alt={shop.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                      ) : (
                          /* JIKA TIDAK ADA, TAMPILKAN INISIAL SEPERTI SEBELUMNYA */
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1B32BB]/10 to-purple-500/10"></div>
                            <div className="absolute -bottom-8 left-6 w-20 h-20 bg-white rounded-2xl shadow-md p-1 flex items-center justify-center z-10">
                                <div className="w-full h-full bg-[#1B32BB] rounded-xl flex items-center justify-center text-white font-bold text-2xl uppercase">
                                  {shop.name.substring(0, 2)}
                                </div>
                            </div>
                          </>
                      )}
                        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold shadow-sm">
                           <Star size={12} className="text-yellow-500 fill-yellow-500" />
                           {shop.rating || '5.0'}
                        </div>
                     </div>

                     <div className="p-6 pt-12 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#1B32BB] transition-colors line-clamp-1">{shop.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{shop.description || 'Siap melayani sepenuh hati.'}</p>
                        
                        <div className="space-y-3 mt-auto">
                           <div className="flex items-center gap-2 text-xs text-gray-400">
                              <MapPin size={14} />
                              <span className="truncate">{shop.address || 'Alamat tidak tersedia'}</span>
                           </div>
                           <div className="w-full py-3 bg-gray-50 rounded-xl text-[#1B32BB] font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-[#1B32BB] group-hover:text-white transition-colors">
                              Pesan Sekarang <ArrowRight size={16} />
                           </div>
                        </div>
                     </div>
                  </Link>
               ))}
            </div>
         </div>
      </section>

      {/* --- CTA FOOTER SECTION --- */}
      <section className="py-20 px-6">
         <div className="max-w-5xl mx-auto bg-[#1B32BB] rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden text-white">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500 opacity-20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="relative z-10">
               <h2 className="text-3xl md:text-5xl font-bold mb-6">Siap Mencuci Tanpa Ribet?</h2>
               <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">Bergabunglah dengan ribuan pengguna lain yang telah mempercayakan pakaian mereka pada LaundryIn.</p>
               <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/login" className="px-8 py-4 bg-white text-[#1B32BB] rounded-2xl font-bold shadow-lg hover:bg-gray-50 transition-all">
                     Download Aplikasi
                  </Link>
                  <Link href="#mitra" className="px-8 py-4 bg-[#14248A] text-white border border-white/20 rounded-2xl font-bold hover:bg-[#1B32BB] transition-all">
                     Lihat Mitra
                  </Link>
               </div>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer id="tentang" className="bg-white border-t border-gray-100 pt-16 pb-8 px-6">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
               <div className="flex items-center gap-2 text-[#1B32BB] font-bold text-xl mb-4">
                  <div className="bg-[#1B32BB] p-1.5 rounded-lg">
                     <ShoppingBag size={20} className="text-white" />
                  </div>
                  LaundryIn
               </div>
               <p className="text-gray-500 text-sm leading-relaxed">
                  Platform layanan laundry on-demand nomor #1 di Indonesia. Solusi cerdas untuk pakaian bersih.
               </p>
            </div>
            
            <div>
               <h4 className="font-bold text-gray-800 mb-4">Layanan</h4>
               <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-[#1B32BB]">Cuci Kiloan</a></li>
                  <li><a href="#" className="hover:text-[#1B32BB]">Dry Cleaning</a></li>
                  <li><a href="#" className="hover:text-[#1B32BB]">Cuci Sepatu</a></li>
                  <li><a href="#" className="hover:text-[#1B32BB]">Karpet & Bedcover</a></li>
               </ul>
            </div>

            <div>
               <h4 className="font-bold text-gray-800 mb-4">Perusahaan</h4>
               <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-[#1B32BB]">Tentang Kami</a></li>
                  <li><a href="#" className="hover:text-[#1B32BB]">Karir</a></li>
                  <li><a href="#" className="hover:text-[#1B32BB]">Blog</a></li>
                  <li><a href="#" className="hover:text-[#1B32BB]">Kontak</a></li>
               </ul>
            </div>

            <div>
               <h4 className="font-bold text-gray-800 mb-4">Ikuti Kami</h4>
               <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#1B32BB] hover:text-white transition-all"><Instagram size={18} /></a>
                  <a href="#" className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#1B32BB] hover:text-white transition-all"><Twitter size={18} /></a>
                  <a href="#" className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#1B32BB] hover:text-white transition-all"><Facebook size={18} /></a>
               </div>
            </div>
         </div>

         <div className="max-w-7xl mx-auto border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2025 LaundryIn Corp. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
               <a href="#" className="hover:text-gray-600">Privacy Policy</a>
               <a href="#" className="hover:text-gray-600">Terms of Service</a>
            </div>
         </div>
      </footer>
    </div>
  )
}