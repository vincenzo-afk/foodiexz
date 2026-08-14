import { Star, Plus, Minus } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useStore } from "../store/useStore";
import { motion } from "motion/react";
import { useState } from "react";

interface Dish {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  rating: number;
  customizable?: boolean;
  bestseller?: boolean;
}

interface DishCardProps {
  dish: Dish;
  restaurantName?: string;
}

export function DishCard({ dish, restaurantName = "Restaurant" }: DishCardProps) {
  const { cart, addToCart, updateQuantity } = useStore();
  const [showCustomize, setShowCustomize] = useState(false);
  
  const cartItem = cart.find(item => item.dishId === dish.id);
  const quantity = cartItem?.quantity || 0;
  
  const handleAdd = () => {
    addToCart({
      dishId: dish.id,
      restaurantId: dish.restaurantId,
      restaurantName: restaurantName,
      name: dish.name,
      price: dish.price,
      image: dish.image,
      isVeg: dish.isVeg
    });
  };
  
  const handleIncrease = () => {
    updateQuantity(dish.id, quantity + 1);
  };
  
  const handleDecrease = () => {
    updateQuantity(dish.id, quantity - 1);
  };
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-2 mb-2">
            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
              dish.isVeg ? 'border-green-600' : 'border-red-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                dish.isVeg ? 'bg-green-600' : 'bg-red-600'
              }`} />
            </div>
            {dish.bestseller && (
              <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded">
                ⭐ Bestseller
              </span>
            )}
          </div>
          
          <h3 className="mb-1">{dish.name}</h3>
          <p className="text-muted-foreground mb-2 line-clamp-2">{dish.description}</p>
          
          <div className="flex items-center gap-3 mb-3">
            <span className="text-foreground">₹{dish.price}</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{dish.rating}</span>
            </div>
          </div>
        </div>
        
        <div className="relative w-28 h-28 flex-shrink-0">
          <ImageWithFallback
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover rounded-lg"
          />
          
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
            {quantity === 0 ? (
              <button
                onClick={handleAdd}
                className="px-6 py-2 bg-white border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition-all shadow-md"
              >
                ADD
              </button>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-3 bg-white border-2 border-orange-500 rounded-lg shadow-md"
              >
                <button
                  onClick={handleDecrease}
                  className="px-3 py-2 text-orange-500 hover:bg-orange-50 transition-colors rounded-l-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-orange-500">{quantity}</span>
                <button
                  onClick={handleIncrease}
                  className="px-3 py-2 text-orange-500 hover:bg-orange-50 transition-colors rounded-r-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {dish.customizable && (
        <p className="text-muted-foreground mt-4 border-t border-border pt-2">
          Customizable
        </p>
      )}
    </div>
  );
}
