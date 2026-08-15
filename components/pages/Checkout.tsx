"use client"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, MapPin, Wallet, CreditCard, Banknote, Plus, Check } from "lucide-react"
import { api } from "../../lib/api"
import { demoDeliveryAddress as DEMO_DELIVERY } from "../../lib/seedData"
import { useStore, type Address } from "../../store/useStore"
import { Button } from "../ui/button"
import { Confetti } from "../Confetti"
import { toast } from "sonner"

export function Checkout() {
  const navigate = useNavigate()
  const {
    user,
    cart,
    getCartTotal,
    getMultiRestaurantFee,
    isAuthenticated,
    placeOrder,
    updateProfile,
  } = useStore()

  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [tip, setTip] = useState(0)
  const [deliveryNote, setDeliveryNote] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({ type: "Home", address: "", landmark: "", isDefault: false })
  const [couponMessage, setCouponMessage] = useState("")
  const addressList = user?.addresses || []
  const [showConfetti, setShowConfetti] = useState(false)
  const [availableOffers, setAvailableOffers] = useState<any[]>([])
  const [appliedCode, setAppliedCode] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) navigate("/auth")
  }, [isAuthenticated, navigate])

  // Load offers available for the current cart total so customers can pick one in one tap.
  useEffect(() => {
    const total = getCartTotal()
    if (total > 0) {
      api.getOffersForTotal(total).then((data) => {
        if (Array.isArray(data)) setAvailableOffers(data)
      })
    }
  }, [cart, getCartTotal])

  const subtotal = getCartTotal()
  const deliveryFee = subtotal >= 199 ? 0 : 25
  const multiFee = getMultiRestaurantFee()
  const taxes = Math.round(subtotal * 0.05)
  const total = Math.max(subtotal + deliveryFee + multiFee + taxes - discount + tip, 0)

  const selectedAddress =
    addressList.find((a) => a.isDefault) || addressList[0] || null

  const validateCoupon = async () => {
    try {
      const result = await api.validateCoupon(couponCode, subtotal)
      if (result?.valid) {
        setDiscount(result.discount)
        setCouponMessage(result.message)
      } else {
        setDiscount(0)
        setCouponMessage(result?.message || "Invalid coupon code")
      }
    } catch {
      setCouponMessage("Error validating coupon")
    }
  }

  // One-tap selection from offers that already qualify for this cart total.
  const applyOffer = (offer: { code: string; discountAmount: number; description: string }) => {
    setCouponCode(offer.code)
    setDiscount(offer.discountAmount)
    setCouponMessage(offer.discountAmount > 0 ? `₹${offer.discountAmount} off applied (${offer.description})` : "Coupon applied")
    setAppliedCode(offer.code)
  }

  const handlePlaceOrder = async () => {
    if (loading) return
    if (!selectedAddress) {
      toast.error("Please add a delivery address")
      setShowAddressForm(true)
      return
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty")
      return
    }
    setLoading(true)
    try {
      const restaurantId = cart[0].restaurantId
      const restaurantName = cart[0].restaurantName
      // If no user address is saved, fall back to a demo delivery address so
      // tracking can still show a live route in this demo environment.
      const deliveryAddress: Address = selectedAddress
        ? { ...selectedAddress, lat: selectedAddress.lat ?? DEMO_DELIVERY.lat, lng: selectedAddress.lng ?? DEMO_DELIVERY.lng }
        : { id: "ADDR-DEMO", type: "Delivery", address: DEMO_DELIVERY.address, lat: DEMO_DELIVERY.lat, lng: DEMO_DELIVERY.lng, isDefault: true }
      const orderId = await placeOrder({
        restaurantId,
        restaurantName,
        items: cart,
        total,
        paymentMethod,
        deliveryAddress,
        tip: tip || undefined,
        deliveryNote: deliveryNote.trim() || undefined,
        idempotencyKey: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      })
      setShowConfetti(true)
      setTimeout(() => {
        navigate(`/order/${orderId}`)
      }, 1800)
    } catch (err: any) {
      toast.error(err?.message || "Failed to place order")
      setLoading(false)
    }
  }

  const handleAddAddress = async () => {
    if (!newAddress.address.trim()) {
      toast.error("Please enter an address")
      return
    }
    try {
      await api.createAddress({ ...newAddress, isDefault: addressList.length === 0 || newAddress.isDefault })
      const addresses = await api.getAddresses()
      updateProfile({ addresses })
      setNewAddress({ type: "Home", address: "", landmark: "", isDefault: false })
      setShowAddressForm(false)
      toast.success("Address added")
    } catch (err: any) {
      toast.error(err?.message || "Failed to add address")
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {showConfetti && <Confetti />}
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        Checkout
      </h1>

      {/* Delivery address */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Delivery Address
          </h2>
          <button
            onClick={() => setShowAddressForm((v) => !v)}
            className="text-sm text-primary flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add new
          </button>
        </div>

        {showAddressForm && (
          <div className="bg-card border border-border rounded-xl p-4 mb-3 space-y-3">
            <select
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
              value={newAddress.type}
              onChange={(e) => setNewAddress((v) => ({ ...v, type: e.target.value }))}
            >
              <option>Home</option>
              <option>Work</option>
              <option>Other</option>
            </select>
            <input
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
              placeholder="House no., Street, Area, Locality"
              value={newAddress.address}
              onChange={(e) => setNewAddress((v) => ({ ...v, address: e.target.value }))}
            />
            <input
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
              placeholder="Landmark (optional)"
              value={newAddress.landmark}
              onChange={(e) => setNewAddress((v) => ({ ...v, landmark: e.target.value }))}
            />
            <Button size="sm" onClick={handleAddAddress}>
              Save address
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {addressList.length === 0 && !showAddressForm && (
            <p className="text-sm text-muted-foreground">
              No address saved yet.{" "}
              <button
                onClick={() => setShowAddressForm(true)}
                className="text-primary underline"
              >
                Add delivery address
              </button>
            </p>
          )}
          {addressList.map((addr) => (
            <div
              key={addr.id}
              className={`border rounded-xl p-4 flex items-start justify-between gap-3 ${
                selectedAddress?.id === addr.id
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                    selectedAddress?.id === addr.id ? "border-primary" : "border-border"
                  }`}
                >
                  {selectedAddress?.id === addr.id && (
                    <Check className="w-3 h-3 text-primary" />
                  )}
                </div>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    try {
                      await api.setDefaultAddress(addr.id)
                      const addresses = await api.getAddresses()
                      updateProfile({ addresses })
                    } catch (err: any) {
                      toast.error(err?.message || "Failed to set default address")
                    }
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Set default
                </button>
                <button
                  onClick={async () => {
                    try {
                      await api.deleteAddress(addr.id)
                      const addresses = await api.getAddresses()
                      updateProfile({ addresses })
                    } catch (err: any) {
                      toast.error(err?.message || "Failed to delete address")
                    }
                  }}
                  className="text-xs text-destructive hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Payment method */}
      <section className="mb-8">
        <h2 className="font-bold flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4" /> Payment Method
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: "cod", label: "Cash on Delivery", icon: Banknote },
            { id: "wallet", label: "Wallet", icon: Wallet },
            { id: "card", label: "Card / UPI", icon: CreditCard },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setPaymentMethod(id)}
              className={`border rounded-xl p-4 flex items-center gap-3 text-sm font-medium transition-colors ${
                paymentMethod === id
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
        {paymentMethod === "wallet" && (
          <p className="text-xs text-muted-foreground mt-2">
            Wallet balance: ₹{user?.wallet ?? 0}
          </p>
        )}
      </section>

      {/* Delivery instructions */}
      <section className="mb-8">
        <h2 className="font-bold mb-3">Delivery instructions</h2>
        <textarea
          className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background resize-none"
          placeholder="E.g. ring the doorbell twice, leave at the door, call before arriving"
          rows={2}
          value={deliveryNote}
          onChange={(e) => setDeliveryNote(e.target.value)}
        />
      </section>

      {/* Tip */}
      <section className="mb-8">
        <h2 className="font-bold mb-3">Add a tip for the delivery partner</h2>
        <div className="flex gap-2">
          {[0, 20, 30, 50].map((amount) => (
            <button
              key={amount}
              onClick={() => setTip(amount)}
              className={`px-4 py-2 rounded-full border text-sm transition-colors ${
                tip === amount
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {amount === 0 ? "None" : `₹${amount}`}
            </button>
          ))}
        </div>
      </section>

      {/* Coupon */}
      <section className="mb-8">
        <h2 className="font-bold mb-3">Apply Coupon</h2>
        {availableOffers.length > 0 && (
          <div className="space-y-2 mb-3">
            {availableOffers
              .filter((o) => o.discountAmount > 0)
              .map((o) => (
                <button
                  key={o.code}
                  onClick={() => applyOffer(o)}
                  className={`w-full text-left border rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                    appliedCode === o.code
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="flex-1 min-w-0">
                    <span className="font-bold text-sm">{o.code}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5 truncate">{o.description}</span>
                  </span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                    -₹{o.discountAmount}
                  </span>
                </button>
              ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background uppercase"
            placeholder="Or enter another coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          />
          <Button variant="outline" onClick={validateCoupon}>
            Apply
          </Button>
        </div>
        {couponMessage && (
          <p
            className={`text-sm mt-2 ${discount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}
          >
            {couponMessage}
          </p>
        )}
        {availableOffers.length === 0 && subtotal > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            No offers qualify for this order yet — check the{" "}
            <Link to="/offers" className="text-primary underline">Offers page</Link> for upcoming deals.
          </p>
        )}
      </section>

      {/* Bill */}
      <section className="bg-card border border-border rounded-xl p-5 mb-6">
        <h2 className="font-bold mb-4">Bill Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Item Total</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span>{deliveryFee === 0 ? <span className="text-emerald-600 dark:text-emerald-400">FREE</span> : `₹${deliveryFee}`}</span>
          </div>
          {multiFee > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Multi-restaurant fee</span>
              <span>₹{multiFee}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxes & charges</span>
            <span>₹{taxes}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Coupon discount</span>
              <span>-₹{discount}</span>
            </div>
          )}
          {tip > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tip</span>
              <span>₹{tip}</span>
            </div>
          )}
          <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-base">
            <span>To Pay</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      <Button
        size="lg"
        className="w-full rounded-full"
        onClick={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? "Placing order..." : `Pay ₹${total.toFixed(2)}`}
      </Button>
    </div>
  )
}
