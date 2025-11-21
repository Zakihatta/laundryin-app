'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapPin } from 'lucide-react'
import { renderToStaticMarkup } from 'react-dom/server'

// --- CUSTOM ICON MODERN ---
// Kita ubah icon Lucide menjadi icon marker Leaflet
const iconMarkup = renderToStaticMarkup(
  <div className="relative flex items-center justify-center text-[#1B32BB]">
    <MapPin size={40} fill="currentColor" className="drop-shadow-xl" />
    <div className="absolute -bottom-1 w-4 h-1.5 bg-black/20 rounded-full blur-sm"></div>
  </div>
)

const customIcon = new L.DivIcon({
  html: iconMarkup,
  className: 'bg-transparent', // Hapus kotak default
  iconSize: [40, 40],
  iconAnchor: [20, 40], // Ujung bawah pin
})

// --- KOMPONEN PENANGKAP KLIK ---
function LocationMarker({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null)
  
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng)
      onChange(e.latlng.lat, e.latlng.lng)
      map.flyTo(e.latlng, map.getZoom()) // Animasi halus ke titik
    },
    locationfound(e) {
      setPosition(e.latlng)
      onChange(e.latlng.lat, e.latlng.lng)
      map.flyTo(e.latlng, 15)
    },
  })

  // Auto locate saat pertama buka
  useEffect(() => {
    map.locate()
  }, [map])

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  )
}

// --- MAIN COMPONENT ---
export default function MapPicker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  return (
    <div className="h-64 w-full rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner relative z-0">
      <MapContainer 
        center={[-6.2088, 106.8456]} // Default Jakarta
        zoom={13} 
        scrollWheelZoom={false} 
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onChange={onLocationSelect} />
      </MapContainer>
      
      {/* Overlay Text */}
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-gray-600 z-[400] shadow-sm pointer-events-none">
        Klik peta untuk tandai lokasi
      </div>
    </div>
  )
}