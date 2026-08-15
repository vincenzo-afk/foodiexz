"use client"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import dynamic from "next/dynamic"
import { MapPin, Plus, Check, Trash2, ArrowLeft } from "lucide-react"
import { api } from "../../lib/api"
import { useStore, type Address } from "../../store/useStore"
import { Button } from "../ui/button"
import { toast } from "sonner"

// Leaflet uses browser-only APIs (window/document) — load with ssr:false like the
// order-tracking map.
const AddressMap = dynamic(() => import("../AddressMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[260px] w-full rounded-xl border border-border bg-muted animate-pulse" />
  ),
})

export function Addresses() {
  const { user, isAuthenticated } = useStore()
  const [list, setList] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [form, setForm] = useState({ type: "Home", address: "", landmark: "" })
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      api.getAddresses().then((data) => {
        setList(Array.isArray(data) ? data : user?.addresses || [])
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const handleSave = async () => {
    if (!form.address.trim()) {
      toast.error("Please enter an address")
      return
    }
    if (editing) {
      try {
        await api.updateAddress(editing.id, form)
        setList((prev) =>
          prev.map((a) =>
            a.id === editing.id ? { ...a, ...form } : a,
          ),
        )
        toast.success("Address updated")
      } catch (err: any) {
        toast.error(err?.message || "Failed to update address")
        return
      }
    } else {
      try {
        await api.createAddress({ ...form, lat: pin?.lat, lng: pin?.lng })
        const updated = await api.getAddresses()
        setList(Array.isArray(updated) ? updated : [])
        toast.success("Address added")
      } catch (err: any) {
        toast.error(err?.message || "Failed to add address")
        return
      }
    }
    setForm({ type: "Home", address: "", landmark: "" })
    setPin(null)
    setEditing(null)
    setShowForm(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Please sign in</h1>
        <p className="text-muted-foreground mb-6">Manage your addresses by logging in.</p>
        <Button asChild>
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Link to="/profile" className="p-1 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        Saved Addresses
      </h1>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {list.length} {list.length === 1 ? "address" : "addresses"} saved
        </p>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null)
            setForm({ type: "Home", address: "", landmark: "" })
            setShowForm(true)
          }}
        >
          <Plus className="w-4 h-4" /> Add address
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
          <h2 className="font-medium text-sm">{editing ? "Edit address" : "New address"}</h2>
          <select
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
            value={form.type}
            onChange={(e) => setForm((v) => ({ ...v, type: e.target.value }))}
          >
            <option>Home</option>
            <option>Work</option>
            <option>Other</option>
          </select>
          <input
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
            placeholder="House no., Street, Area, Locality"
            value={form.address}
            onChange={(e) => setForm((v) => ({ ...v, address: e.target.value }))}
          />
          <input
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
            placeholder="Landmark (optional)"
            value={form.landmark}
            onChange={(e) => setForm((v) => ({ ...v, landmark: e.target.value }))}
          />
          <p className="text-xs font-medium text-muted-foreground">Pin your location on the map</p>
          <AddressMap position={pin} onSelect={setPin} />
          {pin && (
            <button
              type="button"
              onClick={() => setPin(null)}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Clear pin
            </button>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowForm(false)
                setEditing(null)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {list.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No saved addresses yet.</p>
        )}
        {list.map((addr) => (
          <div
            key={addr.id}
            className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-sm">
                  {addr.type}
                  {addr.isDefault && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5">
                      Default
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{addr.address}</p>
                {addr.landmark && (
                  <p className="text-xs text-muted-foreground">Near {addr.landmark}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={async () => {
                  try {
                    await api.setDefaultAddress(addr.id)
                    const updated = await api.getAddresses()
                    setList(Array.isArray(updated) ? updated : [])
                    toast.success("Default address updated")
                  } catch (err: any) {
                    toast.error(err?.message || "Failed to update default address")
                  }
                }}
                className="text-xs text-primary hover:underline"
              >
                {addr.isDefault ? (
                  <>
                    <Check className="w-3 h-3 inline mr-1" /> Default
                  </>
                ) : (
                  "Set default"
                )}
              </button>
              <button
                onClick={() => {
                  setEditing(addr)
                  setForm({ type: addr.type || "Home", address: addr.address, landmark: addr.landmark || "" })
                  setShowForm(true)
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.deleteAddress(addr.id)
                    setList((prev) => prev.filter((a) => a.id !== addr.id))
                    toast.success("Address deleted")
                  } catch (err: any) {
                    toast.error(err?.message || "Failed to delete address")
                  }
                }}
                className="text-xs text-destructive hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
