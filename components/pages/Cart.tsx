"use client"
import { Link } from "react-router-dom"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { useStore } from "../../store/useStore"
import { ImageWithFallback } from "../figma/ImageWithFallback"
import { Button } from "../ui/button"

export function Cart() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getMultiRestaurantFee,
    clearCart,
    isAuthenticated,
  } = useStore()

  const subtotal = getCartTotal()
  const deliveryFee = subtotal > 0 ? (subtotal >= 199 ? 0 : 25) : 0
  const multiFee = getMultiRestaurantFee()
  const taxes = Math.round(subtotal * 0.05)
  const total = subtotal + deliveryFee + multiFee + taxes

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-muted-foreground px-4">
        <ShoppingBag className="w-16 h-16 mb-4 opacity-40" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
        <p className="mb-6">Looks like you haven't added anything yet.</p>
        <Button asChild>
          <Link to="/">Explore restaurants</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Link to="/" className="p-1 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          Cart
          <span className="text-sm font-normal text-muted-foreground">
            ({cart.reduce((s, i) => s + i.quantity, 0)} items)
          </span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-destructive hover:underline"
        >
          Clear cart
        </button>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {cart.map((item) => (
          <div
            key={item.dishId}
            className="flex items-center gap-3 bg-card border border-border rounded-xl p-3"
          >
            <ImageWithFallback
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                    item.isVeg ? "border-green-600" : "border-red-600"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${item.isVeg ? "bg-green-600" : "bg-red-600"}`}
                  />
                </div>
                <h3 className="font-medium">{item.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{item.restaurantName}</p>
                <div className="flex items-center justify-between">
                <span className="font-semibold">₹{item.price}</span>
                <div className="flex items-center gap-3 bg-card border-2 border-primary rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                    className="px-3 py-1.5 text-primary hover:bg-primary/10 rounded-l-lg transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-primary font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                    className="px-3 py-1.5 text-primary hover:bg-primary/10 rounded-r-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => removeFromCart(item.dishId)}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Bill details */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-bold mb-4">Bill Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Item Total</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span>{deliveryFee === 0 && subtotal > 0 ? <span className="text-emerald-600 dark:text-emerald-400">FREE</span> : `₹${deliveryFee}`}</span>
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
          <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-base">
            <span>To Pay</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Button
        size="lg"
        className="w-full mt-6 rounded-full"
        asChild={isAuthenticated}
        disabled={!isAuthenticated}
      >
        {isAuthenticated ? (
          <Link to="/checkout">Proceed to Checkout</Link>
        ) : (
          <Link to="/auth">Sign in to checkout</Link>
        )}
      </Button>
      {!isAuthenticated && (
        <p className="text-center text-sm text-muted-foreground mt-3">
          Please sign in to place an order.
        </p>
      )}
    </div>
  )
}
