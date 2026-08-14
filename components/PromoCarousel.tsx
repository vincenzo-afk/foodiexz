import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const promos = [
  {
    id: 1,
    title: "50% OFF",
    subtitle: "On your first order",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    code: "FIRST50"
  },
  {
    id: 2,
    title: "Free Delivery",
    subtitle: "On orders above ₹199",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    code: "FREEDEL"
  },
  {
    id: 3,
    title: "₹100 OFF",
    subtitle: "Use code FOODIE100",
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    code: "FOODIE100"
  },
  {
    id: 4,
    title: "Weekend Special",
    subtitle: "Extra 30% OFF",
    background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    code: "WEEKEND30"
  }
];

export function PromoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promos.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, []);
  
  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % promos.length);
  };
  
  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + promos.length) % promos.length);
  };
  
  return (
    <div className="relative h-48 rounded-2xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 p-8 text-white flex flex-col justify-center"
          style={{ background: promos[currentIndex].background }}
        >
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-2 text-white"
          >
            {promos[currentIndex].title}
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/90 mb-4"
          >
            {promos[currentIndex].subtitle}
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex"
          >
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              Code: {promos[currentIndex].code}
            </span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {promos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
