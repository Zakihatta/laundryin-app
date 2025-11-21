'use client'

import { useState } from 'react'
import { 
  ShoppingBag, Clock, CheckCircle, Truck, MapPin, 
  ChevronRight, RefreshCcw, Receipt, MessageCircle, Wallet 
} from 'lucide-react'
import Link from 'next/link'
import { createWaLink } from '@/utils/whatsapp'

// --- DEFINISI TIPE DATA ---
interface Order {
  id: string
  status: string
  total_price: number
  weight: number
  created_at: string
  pickup_address: string
  notes: string
  laundry_name: string
  partner_phone?: string | null
  payment_status?: 'paid' | 'unpaid'
}

export default function OrderList({ orders }: { orders: Order[] }) {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

  // Filter Data berdasarkan Tab
  const activeOrders = orders.filter(o => ['pending', 'pickup', 'washing', 'delivery'].includes(o.status))
  const historyOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status))

  const displayOrders = activeTab === 'active' ? activeOrders : historyOrders

  return (
    <div className="max-w-3xl mx-auto">
      
      {/* --- TAB SWITCHER --- */}
      <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 sticky top-24 z-30 mx-4 md:mx-0">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'active' ? 'bg-[#1B32BB] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <RefreshCcw size={16} className={activeTab === 'active' ? 'animate-spin-slow' : ''} />
          Sedang Proses
          <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">{activeOrders.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'history' ? 'bg-[#1B32BB] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Receipt size={16} />
          Riwayat
        </button>
      </div>

      {/* --- EMPTY STATE --- */}
      {displayOrders.length === 0 && (
        <div className="text-center py-20 px-6 bg-white rounded-[2rem] border border-dashed border-gray-300 mx-4 md:mx-0">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="text-gray-300" size={40} />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">
            {activeTab === 'active' ? 'Tidak ada cucian aktif' : 'Belum ada riwayat'}
          </h3>
          {activeTab === 'active' && (
            <Link href="/" className="px-6 py-3 bg-[#1B32BB] text-white rounded-xl font-bold shadow-lg hover:shadow-blue-900/20 transition-all inline-flex items-center gap-2">
              Buat Pesanan Baru <ChevronRight size={16} />
            </Link>
          )}
        </div>
      )}

      {/* --- ORDER LIST --- */}
      <div className="space-y-6 px-4 md:px-0">
        {displayOrders.map((order) => (
          <OrderCard key={order.id} order={order} isHistory={activeTab === 'history'} />
        ))}
      </div>
    </div>
  )
}

// --- SUB COMPONENT: KARTU PESANAN ---
function OrderCard({ order, isHistory }: { order: Order, isHistory: boolean }) {
  
  // Generate Link WA
  const waLink = createWaLink(order.partner_phone, order.id, 'to_partner')

  // Logika Progress Bar (0 - 100%)
  const getProgress = (status: string) => {
    switch (status) {
      case 'pending': return 10
      case 'pickup': return 35
      case 'washing': return 65
      case 'delivery': return 90
      case 'completed': return 100
      default: return 0
    }
  }
  const progress = getProgress(order.status)

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      
      {/* HEADER CARD */}
      <div className="p-6 border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold mb-1 uppercase tracking-wider">
            <ShoppingBag size={12} /> ID: {order.id.slice(0, 8)}
          </div>
          <h3 className="font-bold text-gray-800 text-lg group-hover:text-[#1B32BB] transition-colors">
            {order.laundry_name}
          </h3>
        </div>
        
        {/* HARGA & STATUS BAYAR */}
        <div className="text-right">
          <p className="text-[#1B32BB] font-bold text-lg">Rp {order.total_price.toLocaleString('id-ID')}</p>
          <div className="flex flex-col items-end">
             <p className="text-xs text-gray-400">{order.weight} {order.notes.includes('Kg') ? 'Kg' : 'Unit'}</p>
             
             {/* BADGE STATUS PEMBAYARAN */}
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 flex items-center gap-1 ${
                order.payment_status === 'paid' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-50 text-red-600'
             }`}>
                <Wallet size={10} />
                {order.payment_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
             </span>
          </div>
        </div>
      </div>

      {/* VISUAL TIMELINE (Hanya muncul jika belum riwayat) */}
      {!isHistory && (
        <div className="px-6 py-6 bg-white">
          <div className="relative mb-6">
            {/* Garis Background */}
            <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-100 rounded-full -translate-y-1/2"></div>
            
            {/* Garis Progress Biru */}
            <div 
              className="absolute top-1/2 left-0 h-1.5 bg-[#1B32BB] rounded-full -translate-y-1/2 transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            ></div>

            {/* Icon Steps */}
            <div className="relative flex justify-between w-full">
              <TimelineStep active={progress >= 10} icon={Clock} label="Dipesan" />
              <TimelineStep active={progress >= 35} icon={Truck} label="Jemput" />
              <TimelineStep active={progress >= 65} icon={ShoppingBag} label="Cuci" />
              <TimelineStep active={progress >= 90} icon={CheckCircle} label="Selesai" />
            </div>
          </div>
          
          {/* Status Text */}
          <div className="p-3 bg-blue-50 rounded-xl flex items-start gap-3 border border-blue-100">
             <div className="w-5 h-5 bg-[#1B32BB] rounded-full flex items-center justify-center text-white mt-0.5 animate-pulse">
               <Clock size={12} />
             </div>
             <div>
               <p className="text-sm font-bold text-blue-900">Status Terkini</p>
               <p className="text-xs text-blue-700">
                 {order.status === 'pending' && 'Menunggu konfirmasi mitra laundry.'}
                 {order.status === 'pickup' && 'Kurir sedang menuju lokasi penjemputan.'}
                 {order.status === 'washing' && 'Sedang dalam proses pencucian & penimbangan.'}
                 {order.status === 'delivery' && 'Cucian bersih sedang diantar ke tempat Anda.'}
               </p>
             </div>
          </div>
        </div>
      )}

      {/* FOOTER: ALAMAT & TOMBOL CHAT */}
      <div className="px-6 pb-6 pt-2 space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 text-sm text-gray-600 border border-gray-100">
          <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-xs text-gray-400 uppercase mb-0.5">Lokasi Jemput/Antar</p>
            <p className="line-clamp-2 leading-relaxed">{order.pickup_address}</p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-50">
           <a 
             href={waLink}
             target="_blank"
             rel="noopener noreferrer"
             className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
               order.partner_phone 
                 ? 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200' 
                 : 'bg-gray-100 text-gray-400 cursor-not-allowed'
             }`}
           >
             <MessageCircle size={18} /> 
             {order.partner_phone ? 'Chat Mitra' : 'No HP Mitra Kosong'}
           </a>
        </div>
      </div>

    </div>
  )
}

// --- HELPER COMPONENT ---
interface TimelineStepProps {
  active: boolean;
  icon: React.ElementType;
  label: string;
}

function TimelineStep({ active, icon: Icon, label }: TimelineStepProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 ${
        active ? 'bg-[#1B32BB] border-blue-100 text-white shadow-lg scale-110' : 'bg-white border-gray-100 text-gray-300'
      }`}>
        <Icon size={14} />
      </div>
      <span className={`text-[10px] font-bold transition-colors duration-300 ${active ? 'text-[#1B32BB]' : 'text-gray-300'}`}>
        {label}
      </span>
    </div>
  )
}