"use client"
import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

export interface MapData {
  route: { lat: number; lng: number }[] | null
  restaurant: { lat: number; lng: number; name: string } | null
  delivery: { lat: number; lng: number; address: string } | null
  rider: { lat: number; lng: number } | null
  status: string
}

/** Marker icons for restaurant and delivery points. */
function makeIcon(emoji: string, color: string): L.DivIcon {
  return L.divIcon({
    className: "fx-map-marker",
    html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,.35);border:2px solid #fff"><span style="transform:rotate(45deg);font-size:16px;line-height:1">${emoji}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  })
}

const restaurantIcon = makeIcon("🏪", "oklch(0.55 0.21 29)")
const deliveryIcon = makeIcon("🏠", "oklch(0.65 0.19 45)")

/** Rider bike icon with a subtle pulsing ring. */
function riderIcon(): L.DivIcon {
  return L.divIcon({
    className: "fx-map-rider",
    html: `
      <div style="position:relative;width:40px;height:40px">
        <div style="position:absolute;inset:0;border-radius:50%;background:oklch(0.55 0.21 29/.15);animation:fx-pulse 1.6s ease-out infinite"></div>
        <div style="position:absolute;inset:6px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.4)">
          <span style="font-size:16px">🛵</span>
        </div>
      </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

interface MapProps {
  data: MapData
}

/**
 * Leaflet map showing the delivery route, endpoints and an animated rider.
 * Imported with next/dynamic (ssr:false) so it never renders on the server.
 */
export function Map({ data }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const riderMarkerRef = useRef<L.Marker | null>(null)
  const routeLineRef = useRef<L.Polyline | null>(null)

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([28.6139, 77.209], 13)

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
  }, [])

  // Update endpoints, route and rider whenever data changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const bounds = L.latLngBounds([])

    // Restaurant endpoint
    if (data.restaurant) {
      const r = L.latLng(data.restaurant.lat, data.restaurant.lng)
      bounds.extend(r)
      L.marker(r, { icon: restaurantIcon, zIndexOffset: 50 })
        .bindPopup(`<b>${data.restaurant.name}</b>`)
        .addTo(map)
    }

    // Delivery endpoint (missing coordinates fall back to a central demo point)
    const deliveryLat = data.delivery?.lat ?? 28.6139
    const deliveryLng = data.delivery?.lng ?? 77.209
    if (data.delivery) {
      const d = L.latLng(deliveryLat, deliveryLng)
      bounds.extend(d)
      L.marker(d, { icon: deliveryIcon })
        .bindPopup(`<b>Delivery</b><br/>${data.delivery.address}`)
        .addTo(map)
    }

    // Route polyline (route geometry or straight line fallback)
    const points =
      data.route && data.route.length > 1
        ? data.route
        : data.restaurant && data.delivery
          ? [
              { lat: data.restaurant.lat, lng: data.restaurant.lng },
              { lat: deliveryLat, lng: deliveryLng },
            ]
          : null

    if (routeLineRef.current) {
      routeLineRef.current.remove()
      routeLineRef.current = null
    }
    if (points && points.length > 1) {
      routeLineRef.current = L.polyline(points, {
        color: "oklch(0.55 0.21 29)",
        weight: 5,
        opacity: 0.85,
        dashArray: "8 12",
        lineCap: "round",
      }).addTo(map)
      points.forEach((p) => bounds.extend(L.latLng(p.lat, p.lng)))
    }

    // Rider marker
    if (riderMarkerRef.current) {
      riderMarkerRef.current.remove()
      riderMarkerRef.current = null
    }
    if (data.rider && (data.status === "preparing" || data.status === "on-the-way")) {
      riderMarkerRef.current = L.marker([data.rider.lat, data.rider.lng], {
        icon: riderIcon(),
        zIndexOffset: 100,
      }).addTo(map)
      bounds.extend(L.latLng(data.rider.lat, data.rider.lng))
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border">
      <style>{`
        @keyframes fx-pulse { 0% { transform: scale(.8); opacity:.8 } 100% { transform: scale(1.8); opacity:0 } }
        .fx-map-marker, .fx-map-rider { background:transparent !important; border:none !important; }
        .leaflet-container { background:#e8e6e3; }
      `}</style>
      <div ref={containerRef} className="h-[320px] w-full sm:h-[380px]" />
    </div>
  )
}

export default Map
