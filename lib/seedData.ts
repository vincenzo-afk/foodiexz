// Seed data for restaurants and dishes
export const restaurants = [
  {
    id: "1",
    name: "Spice Junction",
    cuisine: ["Indian", "North Indian", "Mughlai"],
    rating: 4.5,
    deliveryTime: "25-30",
    distance: "2.5 km",
    image: "https://images.unsplash.com/photo-1728910758653-7e990e489cac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjByZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NjIzNTg1NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    priceForTwo: 400,
    offer: "50% OFF up to ₹100",
    isOpen: true,
    totalRatings: "10K+",
    description: "Authentic North Indian cuisine with rich flavors and aromatic spices",
    address: "123 MG Road, Sector 15, New Delhi",
    openTime: "11:00 AM",
    closeTime: "11:00 PM"
  },
  {
    id: "2",
    name: "Dragon Wok",
    cuisine: ["Chinese", "Asian", "Thai"],
    rating: 4.3,
    deliveryTime: "30-35",
    distance: "3.2 km",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwbm9vZGxlc3xlbnwxfHx8fDE3NjIzNjA3NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    priceForTwo: 500,
    offer: "₹125 OFF above ₹249",
    isOpen: true,
    totalRatings: "8.5K+",
    description: "Pan-Asian delights with authentic flavors from across Asia",
    address: "456 Park Street, Connaught Place, Delhi",
    openTime: "12:00 PM",
    closeTime: "11:30 PM"
  },
  {
    id: "3",
    name: "La Bella Italia",
    cuisine: ["Italian", "Pizza", "Pasta"],
    rating: 4.6,
    deliveryTime: "20-25",
    distance: "1.8 km",
    image: "https://images.unsplash.com/photo-1532117472055-4d0734b51f31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3NjIzNDQyNTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    priceForTwo: 600,
    offer: "30% OFF up to ₹150",
    isOpen: true,
    totalRatings: "12K+",
    description: "Italian classics made with love and authentic ingredients",
    address: "789 Khan Market, New Delhi",
    openTime: "11:30 AM",
    closeTime: "12:00 AM"
  },
  {
    id: "4",
    name: "Taco Fiesta",
    cuisine: ["Mexican", "Tex-Mex", "Fast Food"],
    rating: 4.4,
    deliveryTime: "25-30",
    distance: "2.1 km",
    image: "https://images.unsplash.com/photo-1700628785251-2c3c084bec23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwZm9vZCUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzYyMjgzOTI5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    priceForTwo: 450,
    offer: "40% OFF up to ₹80",
    isOpen: true,
    totalRatings: "6K+",
    description: "Spicy and flavorful Mexican street food",
    address: "321 Hauz Khas Village, Delhi",
    openTime: "12:00 PM",
    closeTime: "11:00 PM"
  },
  {
    id: "5",
    name: "Burger Boss",
    cuisine: ["American", "Burgers", "Fast Food"],
    rating: 4.2,
    deliveryTime: "15-20",
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwYnVyZ2VyfGVufDF8fHx8MTc2MjI4MTE5M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    priceForTwo: 350,
    offer: "FREE delivery",
    isOpen: true,
    totalRatings: "15K+",
    description: "Juicy burgers and crispy fries for the ultimate comfort meal",
    address: "567 Cyber Hub, Gurgaon",
    openTime: "10:00 AM",
    closeTime: "12:00 AM"
  },
  {
    id: "6",
    name: "Sushi Nation",
    cuisine: ["Japanese", "Sushi", "Asian"],
    rating: 4.7,
    deliveryTime: "35-40",
    distance: "4.5 km",
    image: "https://images.unsplash.com/photo-1625937751876-4515cd8e78bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHBsYXR0ZXJ8ZW58MXx8fHwxNzYyMjc3MDE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    priceForTwo: 800,
    offer: "20% OFF up to ₹100",
    isOpen: true,
    totalRatings: "5K+",
    description: "Fresh and authentic Japanese sushi experience",
    address: "890 Select City Walk, Saket",
    openTime: "12:30 PM",
    closeTime: "11:00 PM"
  }
];

export const dishes = [
  // Spice Junction dishes
  {
    id: "d1",
    restaurantId: "1",
    name: "Chicken Biryani",
    description: "Aromatic basmati rice cooked with tender chicken and spices",
    price: 299,
    image: "https://images.unsplash.com/photo-1666190092689-e3968aa0c32c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ5YW5pJTIwZGlzaHxlbnwxfHx8fDE3NjIzNjA3NzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Main Course",
    isVeg: false,
    rating: 4.6,
    customizable: true,
    bestseller: true
  },
  {
    id: "d2",
    restaurantId: "1",
    name: "Paneer Tikka",
    description: "Grilled cottage cheese marinated in spices",
    price: 249,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYW5lZXIlMjB0aWtrYXxlbnwxfHx8fDE3MzIyODA1Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Starters",
    isVeg: true,
    rating: 4.4,
    customizable: true,
    bestseller: false
  },
  {
    id: "d3",
    restaurantId: "1",
    name: "Butter Chicken",
    description: "Creamy tomato-based curry with tender chicken",
    price: 320,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXR0ZXIlMjBjaGlja2VufGVufDF8fHx8MTczMjI4MDU3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Main Course",
    isVeg: false,
    rating: 4.8,
    customizable: true,
    bestseller: true
  },
  {
    id: "d4",
    restaurantId: "1",
    name: "Garlic Naan",
    description: "Soft flatbread topped with garlic and butter",
    price: 60,
    image: "https://images.unsplash.com/photo-1600682756729-3c2f6d5e9650?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYWFuJTIwYnJlYWR8ZW58MXx8fHwxNzMyMjgwNTc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Breads",
    isVeg: true,
    rating: 4.3,
    customizable: false,
    bestseller: false
  },
  
  // Dragon Wok dishes
  {
    id: "d5",
    restaurantId: "2",
    name: "Hakka Noodles",
    description: "Stir-fried noodles with vegetables and sauces",
    price: 199,
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwbm9vZGxlc3xlbnwxfHx8fDE3NjIzNjA3NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Main Course",
    isVeg: true,
    rating: 4.5,
    customizable: true,
    bestseller: true
  },
  {
    id: "d6",
    restaurantId: "2",
    name: "Chicken Fried Rice",
    description: "Wok-tossed rice with chicken and vegetables",
    price: 220,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllZCUyMHJpY2V8ZW58MXx8fHwxNzMyMjgwNTc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Main Course",
    isVeg: false,
    rating: 4.4,
    customizable: true,
    bestseller: false
  },
  {
    id: "d7",
    restaurantId: "2",
    name: "Spring Rolls",
    description: "Crispy rolls filled with vegetables",
    price: 149,
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcHJpbmclMjByb2xsc3xlbnwxfHx8fDE3MzIyODA1Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Starters",
    isVeg: true,
    rating: 4.2,
    customizable: false,
    bestseller: false
  },

  // La Bella Italia dishes
  {
    id: "d8",
    restaurantId: "3",
    name: "Margherita Pizza",
    description: "Classic pizza with fresh mozzarella and basil",
    price: 349,
    image: "https://images.unsplash.com/photo-1544982503-9f984c14501a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMHNsaWNlfGVufDF8fHx8MTc2MjMwOTc0M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Pizza",
    isVeg: true,
    rating: 4.7,
    customizable: true,
    bestseller: true
  },
  {
    id: "d9",
    restaurantId: "3",
    name: "Creamy Alfredo Pasta",
    description: "Fettuccine in rich parmesan cream sauce",
    price: 299,
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGRpc2h8ZW58MXx8fHwxNzYyMzM1NzU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Pasta",
    isVeg: true,
    rating: 4.6,
    customizable: true,
    bestseller: true
  },
  {
    id: "d10",
    restaurantId: "3",
    name: "Tiramisu",
    description: "Classic Italian coffee-flavored dessert",
    price: 179,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aXJhbWlzdXxlbnwxfHx8fDE3MzIyODA1Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Desserts",
    isVeg: true,
    rating: 4.8,
    customizable: false,
    bestseller: false
  },

  // Taco Fiesta dishes
  {
    id: "d11",
    restaurantId: "4",
    name: "Chicken Tacos",
    description: "Three soft tacos with grilled chicken and salsa",
    price: 249,
    image: "https://images.unsplash.com/photo-1599488400918-5f5f96b3f463?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWNvcyUyMG1leGljYW58ZW58MXx8fHwxNzYyMzIxNjAyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Main Course",
    isVeg: false,
    rating: 4.5,
    customizable: true,
    bestseller: true
  },
  {
    id: "d12",
    restaurantId: "4",
    name: "Veggie Burrito Bowl",
    description: "Rice bowl with beans, veggies, and guacamole",
    price: 229,
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJyaXRvJTIwYm93bHxlbnwxfHx8fDE3MzIyODA1Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Main Course",
    isVeg: true,
    rating: 4.4,
    customizable: true,
    bestseller: false
  },

  // Burger Boss dishes
  {
    id: "d13",
    restaurantId: "5",
    name: "Classic Beef Burger",
    description: "Juicy beef patty with cheese and special sauce",
    price: 199,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwYnVyZ2VyfGVufDF8fHx8MTc2MjI4MTE5M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Burgers",
    isVeg: false,
    rating: 4.6,
    customizable: true,
    bestseller: true
  },
  {
    id: "d14",
    restaurantId: "5",
    name: "Crispy Fries",
    description: "Golden crispy french fries with seasoning",
    price: 99,
    image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBmcmllc3xlbnwxfHx8fDE3MzIyODA1Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Sides",
    isVeg: true,
    rating: 4.3,
    customizable: false,
    bestseller: false
  },

  // Sushi Nation dishes
  {
    id: "d15",
    restaurantId: "6",
    name: "California Roll",
    description: "Crab, avocado, and cucumber sushi roll",
    price: 399,
    image: "https://images.unsplash.com/photo-1625937751876-4515cd8e78bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHBsYXR0ZXJ8ZW58MXx8fHwxNzYyMjc3MDE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Sushi",
    isVeg: false,
    rating: 4.7,
    customizable: false,
    bestseller: true
  },
  {
    id: "d16",
    restaurantId: "6",
    name: "Ramen Bowl",
    description: "Japanese noodle soup with pork and soft-boiled egg",
    price: 349,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYW1lbiUyMG5vb2RsZXN8ZW58MXx8fHwxNzYyMzE3Njk0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Main Course",
    isVeg: false,
    rating: 4.8,
    customizable: true,
    bestseller: true
  }
];

export const offers = [
  {
    id: "o1",
    code: "FOODIE50",
    description: "50% OFF up to ₹100 on orders above ₹199",
    minOrder: 199,
    maxDiscount: 100,
    discountPercent: 50,
    validTill: "2025-12-31"
  },
  {
    id: "o2",
    code: "WELCOME100",
    description: "Flat ₹100 OFF on first order above ₹299",
    minOrder: 299,
    maxDiscount: 100,
    discountPercent: null,
    validTill: "2025-12-31"
  },
  {
    id: "o3",
    code: "FREEDEL",
    description: "Free delivery on orders above ₹199",
    minOrder: 199,
    maxDiscount: 50,
    discountPercent: null,
    validTill: "2025-12-31"
  }
];
