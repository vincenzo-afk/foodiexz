import { useStore } from "../store/useStore";
import { Filter, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Slider } from "./ui/slider";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";

const cuisineOptions = [
  "Indian", "Chinese", "Italian", "Mexican", "American", 
  "Japanese", "Thai", "Korean", "Mediterranean"
];

export function FilterPanel() {
  const { filters, setFilters, clearFilters } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);
  
  const hasActiveFilters = filters.rating || filters.priceRange || filters.cuisine.length > 0 || filters.sortBy;
  
  const handleApply = () => {
    setFilters(tempFilters);
    setIsOpen(false);
  };
  
  const handleClear = () => {
    clearFilters();
    setTempFilters({
      rating: null,
      priceRange: null,
      cuisine: [],
      sortBy: null
    });
  };
  
  const toggleCuisine = (cuisine: string) => {
    const updated = tempFilters.cuisine.includes(cuisine)
      ? tempFilters.cuisine.filter(c => c !== cuisine)
      : [...tempFilters.cuisine, cuisine];
    setTempFilters({ ...tempFilters, cuisine: updated });
  };
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative"
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
            !
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2>Filters</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Sort By */}
                <div>
                  <h3 className="mb-3">Sort By</h3>
                  <RadioGroup
                    value={tempFilters.sortBy || ''}
                    onValueChange={(value) => setTempFilters({ ...tempFilters, sortBy: value as any })}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rating" id="sort-rating" />
                        <Label htmlFor="sort-rating" className="cursor-pointer">Highest Rating</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="deliveryTime" id="sort-delivery" />
                        <Label htmlFor="sort-delivery" className="cursor-pointer">Fastest Delivery</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="priceForTwo" id="sort-price" />
                        <Label htmlFor="sort-price" className="cursor-pointer">Price: Low to High</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Rating Filter */}
                <div>
                  <h3 className="mb-3">Minimum Rating</h3>
                  <RadioGroup
                    value={tempFilters.rating?.toString() || ''}
                    onValueChange={(value) => setTempFilters({ ...tempFilters, rating: value ? parseFloat(value) : null })}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="4.5" id="rating-45" />
                        <Label htmlFor="rating-45" className="cursor-pointer">4.5+ ⭐</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="4.0" id="rating-40" />
                        <Label htmlFor="rating-40" className="cursor-pointer">4.0+ ⭐</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3.5" id="rating-35" />
                        <Label htmlFor="rating-35" className="cursor-pointer">3.5+ ⭐</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Price Range */}
                <div>
                  <h3 className="mb-3">Price for Two</h3>
                  <div className="px-2">
                    <Slider
                      min={0}
                      max={1000}
                      step={50}
                      value={tempFilters.priceRange || [0, 1000]}
                      onValueChange={(value) => setTempFilters({ ...tempFilters, priceRange: value as [number, number] })}
                      className="mb-4"
                    />
                    <div className="flex justify-between text-gray-600">
                      <span>₹{tempFilters.priceRange?.[0] || 0}</span>
                      <span>₹{tempFilters.priceRange?.[1] || 1000}</span>
                    </div>
                  </div>
                </div>
                
                {/* Cuisine Filter */}
                <div>
                  <h3 className="mb-3">Cuisine</h3>
                  <div className="space-y-2">
                    {cuisineOptions.map((cuisine) => (
                      <div key={cuisine} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cuisine-${cuisine}`}
                          checked={tempFilters.cuisine.includes(cuisine)}
                          onCheckedChange={() => toggleCuisine(cuisine)}
                        />
                        <Label
                          htmlFor={`cuisine-${cuisine}`}
                          className="cursor-pointer"
                        >
                          {cuisine}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={handleClear}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
