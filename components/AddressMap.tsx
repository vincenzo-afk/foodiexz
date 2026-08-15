"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface AddressMapProps {
  /** Current selected pin, if any. */
  position: { lat: number; lng: number } | null
  /** Called when the user taps a new pin location on the map. */
  onSelect: (pos: { lat: number; lng: number }) => void
  /** Human-readable label shown under the pin. */
  label?: string
  className?: string
}

const pinIcon = (color: string) =>
  L.divIcon({
    className: "fx-map-marker",
    html: `<div style="width:38px;height:38px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.4);border:2px solid #fff"><span style="transform:rotate(45deg);font-size:18px;line-height:1">📍</span></div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
  })

const DELHI_CENTER: [number, number] = [28.6139, 77.209]

/**
 * Simple click-to-pin map picker. Tapping places a draggable-feeling pin and
 * reports the coordinates up. Reverse geocoded area name comes from Nominatim
 * (same free OSM infrastructure used elsewhere in the app).
 */
export function AddressMap({ position, onSelect, label, className }: AddressMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const onSelectRef = useRef(onSelect)
  const [area, setArea] = useState(label || "")

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16&addressdetails=1`,
      )
      if (!res.ok) return
      const data = await res.json()
      const a = data?.address || {}
      const name = [
        a.suburb || a.neighbourhood || a.quarter,
        a.city || a.town || a.village || a.state,
      ]
        .filter(Boolean)
        .join(", ")
      if (name) setArea(name)
    } catch {
      // ignore — picker still works without a label
    }
  }, [])

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: true }).setView(
      position ? [position.lat, position.lng] : DELHI_CENTER,
      14,
    )
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)
    L.control.zoom({ position: "bottomright" }).addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep marker / view in sync with position
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }
    if (position) {
      const ll = [position.lat, position.lng] as [number, number]
      markerRef.current = L.marker(ll, {
        icon: pinIcon("oklch(0.55 0.21 29)"),
        draggable: true,
      }).addTo(map)
      markerRef.current.on("dragend", (e) => {
        const t = e.target as L.Marker
        const latlng = t.getLatLng()
        onSelectRef.current({ lat: latlng.lat, lng: latlng.lng })
        reverseGeocode(latlng.lat, latlng.lng)
      })
      map.setView(ll, 15)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, reverseGeocode])

  // Click-to-pin handler
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const onClick = (e: L.LeafletMouseEvent) => {
      onSelectRef.current({ lat: e.latlng.lat, lng: e.latlng.lng })
      reverseGeocode(e.latlng.lat, e.latlng.lng)
    }
    map.on("click", onClick)
    return () => {
      map.off("click", onClick)
    }
  }, [reverseGeocode])

  return (
    <div className={`relative w-full overflow-hidden rounded-xl border border-border ${className || ""}`}>
      <style>{`
        .fx-map-marker { background:transparent !important; border:none !important; }
        .leaflet-container { background:#e8e6e3; }
      `}</style>
      <div ref={containerRef} className="h-[260px] w-full" />
      {area && (
        <div className="absolute bottom-2 left-2 bg-card border border-border rounded-lg px-3 py-1.5 text-xs shadow-sm">
          📍 {area}
        </div>
      )}
      {!position && (
        <div className="absolute bottom-2 right-2 bg-muted/95 rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
          Tap anywhere to set your location
        </div>
      )}
    </div>
  )
}

export default AddressMap
