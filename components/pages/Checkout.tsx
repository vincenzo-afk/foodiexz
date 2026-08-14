"use client"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, MapPin, Wallet, CreditCard, Banknote, Plus, Check } from "lucide-react"
import { api } from "../../lib/api"
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
    addAddress,
    deleteAddress,
    setDefaultAddress,
    clearCart,
  } = useStore()

  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [tip, setTip] = useState(0)
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({ type: "Home", address: "", landmark: "" })
  const [couponMessage, setCouponMessage] = useState("")
  const [addressList, setAddressList] = useState<Address[]>([])
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) navigate("/auth")
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (user?.addresses) setAddressList(user.addresses)
  }, [user])

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

  const handlePlaceOrder = async () => {
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
      const orderId = await placeOrder({
        restaurantId,
        restaurantName,
        items: cart,
        total,
        paymentMethod,
        deliveryAddress: selectedAddress,
        tip: tip || undefined,
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

  const handleAddAddress = () => {
    if (!newAddress.address.trim()) {
      toast.error("Please enter an address")
      return
    }
    addAddress(newAddress)
    setAddressList((prev) => {
      const updated = [
        ...prev.map((a) => ({ ...a, isDefault: false })),
        {
          ...newAddress,
          id: "ADDR" + Date.now(),
          isDefault: prev.length === 0,
        },
      ]
      return updated
    })
    setNewAddress({ type: "Home", address: "", landmark: "" })
    setShowAddressForm(false)
    toast.success("Address added")
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
                Add one
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
                  onClick={() => {
                    setDefaultAddress(addr.id)
                    setAddressList((prev) =>
                      prev.map((a) => ({ ...a, isDefault: a.id === addr.id })),
                    )
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Set default
                </button>
                <button
                  onClick={() => {
                    deleteAddress(addr.id)
                    setAddressList((prev) => prev.filter((a) => a.id !== addr.id))
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
        <div className="flex gap-2">
          <input
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background uppercase"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <Button variant="outline" onClick={validateCoupon}>
            Apply
          </Button>
        </div>
        {couponMessage && (
          <p
            className={`text-sm mt-2 ${discount > 0 ? "text-green-600" : "text-destructive"}`}
          >
            {couponMessage}
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
            <span>{deliveryFee === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryFee}`}</span>
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
            <div className="flex justify-between text-green-600">
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
