import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import sqlite3 from "sqlite3"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
)
app.use(bodyParser.json())

// Database setup
const db = new sqlite3.Database(join(__dirname, "foodiezx.db"))

// Helper functions
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err)
      else resolve(this)
    })
  })
}

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ error: "No token" })

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (err) {
    res.status(401).json({ error: "Invalid token" })
  }
}

// Initialize database
const initDatabase = async () => {
  try {
    // Users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        dietary_preference TEXT DEFAULT 'all',
        wallet REAL DEFAULT 500,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Addresses table
    await run(`
      CREATE TABLE IF NOT EXISTS addresses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT,
        address TEXT NOT NULL,
        landmark TEXT,
        is_default BOOLEAN DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `)

    // Restaurants table
    await run(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        cuisine TEXT NOT NULL,
        rating REAL,
        delivery_time TEXT,
        distance TEXT,
        image TEXT,
        price_for_two INTEGER,
        offer TEXT,
        is_open BOOLEAN DEFAULT 1,
        total_ratings TEXT,
        description TEXT,
        address TEXT,
        open_time TEXT,
        close_time TEXT
      )
    `)

    // Dishes table
    await run(`
      CREATE TABLE IF NOT EXISTS dishes (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT,
        category TEXT,
        is_veg BOOLEAN,
        rating REAL,
        customizable BOOLEAN DEFAULT 0,
        bestseller BOOLEAN DEFAULT 0,
        FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
      )
    `)

    // Orders table
    await run(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        restaurant_id TEXT NOT NULL,
        restaurant_name TEXT NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'preparing',
        payment_method TEXT,
        tip REAL,
        rating INTEGER,
        review TEXT,
        delivery_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `)

    // Order items table
    await run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        dish_id TEXT NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        FOREIGN KEY(order_id) REFERENCES orders(id)
      )
    `)

    // Offers table
    await run(`
      CREATE TABLE IF NOT EXISTS offers (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        min_order REAL,
        max_discount REAL,
        discount_percent REAL,
        valid_till TEXT
      )
    `)

    // Reviews table
    await run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        restaurant_id TEXT,
        dish_id TEXT,
        rating INTEGER,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `)

    // Notifications table
    await run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT,
        message TEXT,
        type TEXT,
        read BOOLEAN DEFAULT 0,
        link TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `)

    console.log("Database initialized")
    await seedDatabase()
  } catch (err) {
    console.error("Database init error:", err)
  }
}

// Seed database with sample data
const seedDatabase = async () => {
  try {
    const count = await get("SELECT COUNT(*) as count FROM restaurants")
    if (count.count > 0) return

    // 12 restaurants with diverse cuisines
    const restaurants = [
      {
        id: "1",
        name: "Spice Junction",
        cuisine: "Indian,North Indian,Mughlai",
        rating: 4.8,
        deliveryTime: "25-30",
        distance: "2.5 km",
        image:
          "https://images.unsplash.com/photo-1728910758653-7e990e489cac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjByZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NjIzNTg1NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
        priceForTwo: 400,
        offer: "50% OFF up to ₹100",
        isOpen: 1,
        totalRatings: "18.5K",
        description: "Authentic North Indian cuisine with rich flavors and aromatic spices. Family-owned for 15 years.",
        address: "123 MG Road, Sector 15, New Delhi",
        openTime: "11:00 AM",
        closeTime: "11:00 PM",
      },
      {
        id: "2",
        name: "Dragon Wok",
        cuisine: "Chinese,Asian,Thai",
        rating: 4.6,
        deliveryTime: "30-35",
        distance: "3.2 km",
        image:
          "https://images.unsplash.com/photo-1585032226651-759b368d7246?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwbm9vZGxlc3xlbnwxfHx8fDE3NjIzNjA3NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
        priceForTwo: 500,
        offer: "₹125 OFF above ₹249",
        isOpen: 1,
        totalRatings: "14.2K",
        description: "Pan-Asian delights with authentic flavors from across Asia. Specializing in hand-pulled noodles.",
        address: "456 Park Street, Connaught Place, Delhi",
        openTime: "12:00 PM",
        closeTime: "11:30 PM",
      },
      {
        id: "3",
        name: "La Bella Italia",
        cuisine: "Italian,Pizza,Pasta",
        rating: 4.9,
        deliveryTime: "20-25",
        distance: "1.8 km",
        image:
          "https://images.unsplash.com/photo-1532117472055-4d0734b51f31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3NjIzNDQyNTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
        priceForTwo: 600,
        offer: "30% OFF up to ₹150",
        isOpen: 1,
        totalRatings: "22.1K",
        description: "Italian classics made with love and imported ingredients. Award-winning wood-fired pizzas.",
        address: "789 Khan Market, New Delhi",
        openTime: "11:30 AM",
        closeTime: "12:00 AM",
      },
      {
        id: "4",
        name: "Taco Fiesta",
        cuisine: "Mexican,Tex-Mex,Fast Food",
        rating: 4.5,
        deliveryTime: "25-30",
        distance: "2.1 km",
        image:
          "https://images.unsplash.com/photo-1700628785251-2c3c084bec23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwZm9vZCUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzYyMjgzOTI5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        priceForTwo: 450,
        offer: "40% OFF up to ₹80",
        isOpen: 1,
        totalRatings: "11.3K",
        description: "Spicy and flavorful Mexican street food. Fresh ingredients, bold flavors, authentic recipes.",
        address: "321 Hauz Khas Village, Delhi",
        openTime: "12:00 PM",
        closeTime: "11:00 PM",
      },
      {
        id: "5",
        name: "Burger Boss",
        cuisine: "American,Burgers,Fast Food",
        rating: 4.7,
        deliveryTime: "15-20",
        distance: "1.2 km",
        image:
          "https://images.unsplash.com/photo-1550547660-d9450f859349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwYnVyZ2VyfGVufDF8fHx8MTc2MjI4MTE5M3ww&ixlib=rb-4.1.0&q=80&w=1080",
        priceForTwo: 350,
        offer: "FREE delivery",
        isOpen: 1,
        totalRatings: "26.8K",
        description: "Juicy burgers and crispy fries. Premium beef, hand-cut fries, signature sauces.",
        address: "567 Cyber Hub, Gurgaon",
        openTime: "10:00 AM",
        closeTime: "12:00 AM",
      },
      {
        id: "6",
        name: "Sushi Nation",
        cuisine: "Japanese,Sushi,Asian",
        rating: 4.9,
        deliveryTime: "35-40",
        distance: "4.5 km",
        image:
          "https://images.unsplash.com/photo-1625937751876-4515cd8e78bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHBsYXR0ZXJ8ZW58MXx8fHwxNzYyMjc3MDE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
        priceForTwo: 800,
        offer: "20% OFF up to ₹100",
        isOpen: 1,
        totalRatings: "9.7K",
        description: "Fresh and authentic Japanese sushi experience. Premium grade fish, expert chefs.",
        address: "890 Select City Walk, Saket",
        openTime: "12:30 PM",
        closeTime: "11:00 PM",
      },
      {
        id: "7",
        name: "Spice Garden",
        cuisine: "South Indian,Kerala,Seafood",
        rating: 4.6,
        deliveryTime: "28-33",
        distance: "2.8 km",
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3V0aCUyMGluZGlhbiUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzYyMjE3NzUzfDA&ixlib=rb-4.1.0&q=80&w=1080",
        priceForTwo: 380,
        offer: "₹100 OFF above ₹299",
        isOpen: 1,
        totalRatings: "12.4K",
        description: "Authentic South Indian delicacies and fresh seafood. Traditional recipes, modern ambiance.",
        address: "234 Delhi Cantonment, Delhi",
        openTime: "11:00 AM",
        closeTime: "10:30 PM",
      },
      {
        id: "8",
        name: "Thai Paradise",
        cuisine: "Thai,Southeast Asian,Curry",
        rating: 4.7,
        deliveryTime: "32-37",
        distance: "3.5 km",
        image:
          "https://images.unsplash.com/photo-1455619452474-d2be8b1e4e31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGFpJTIwZm9vZHxlbnwxfHx8fDE3NjIyMTc3NTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
        priceForTwo: 520,
        offer: "₹150 OFF above ₹399",
        isOpen: 1,
        totalRatings: "8.9K",
        description: "Authentic Thai cuisine with vibrant flavors. Tom Yum, Pad Thai, Green Curry specialties.",
        address: "567 Greater Kailash, Delhi",
        openTime: "12:30 PM",
        closeTime: "11:00 PM",
      },
      {
        id: "9",
        name: "Sweet Bites Bakery",
        cuisine: "Bakery,Desserts,Cafe",
        rating: 4.8,
        deliveryTime: "10-15",
        distance: "0.8 km",
        image:
          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWtlcnl8ZW58MXx8fHwxNzYyMjE3NzUzfDA&ixlib=rb-4.1.0&q=80&w=1080",
        priceForTwo: 250,
        offer: "Buy 1 Get 1 on Pastries",
        isOpen: 1,
        totalRatings: "19.2K",
        description: "Fresh baked goods, pastries, and artisan coffee. Made daily with premium ingredients.",
        address: "123 Defence Colony, Delhi",
        openTime: "7:00 AM",
        closeTime: "9:00 PM",
      },
      {
        id: "10",
        name: "Grill House",
        cuisine: "BBQ,Grilled,Steakhouse",
        rating: 4.8,
        deliveryTime: "30-35",
        distance: "3.8 km",
        image:
          "https://images.unsplash.com/photo-1544025162-d76694265947?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYnElMjByZXN0YXVyYW50fGVufDF8fHx8MTc2MjIxNzc1M3ww&ixlib=rb-4.1.0&q=80&w=1080",
        priceForTwo: 700,
        offer: "₹200 OFF on orders above ₹599",
        isOpen: 1,
        totalRatings: "7.6K",
        description: "Premium BBQ and grilled meats. Slow-cooked perfection, wood-fired specialty.",
        address: "890 Vasant Kunj, Delhi",
        openTime: "12:00 PM",
        closeTime: "11:30 PM",
      },
      {
        id: "11",
        name: "Vegan Delights",
        cuisine: "Vegan,Vegetarian,Healthy",
        rating: 4.7,
        deliveryTime: "22-27",
        distance: "2.3 km",
        image:
          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdhbiUyMGZvb2R8ZW58MXx8fHwxNzYyMjE3NzUzfDA&ixlib=rb-4.1.0&q=80&w=1080",
        priceForTwo: 380,
        offer: "₹75 OFF above ₹249",
        isOpen: 1,
        totalRatings: "10.3K",
        description: "100% plant-based, healthy and delicious. Certified organic, nutritious bowls.",
        address: "456 Lajpat Nagar, Delhi",
        openTime: "10:00 AM",
        closeTime: "10:00 PM",
      },
      {
        id: "12",
        name: "Fusion Kitchen",
        cuisine: "Fusion,Modern Indian,Contemporary",
        rating: 4.6,
        deliveryTime: "28-33",
        distance: "2.6 km",
        image:
          "https://images.unsplash.com/photo-1547521064-7290893494e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXNpb24lMjBjdWlzaW5lfGVufDF8fHx8MTc2MjIxNzc1M3ww&ixlib=rb-4.1.0&q=80&w=1080",
        priceForTwo: 550,
        offer: "30% OFF up to ₹120",
        isOpen: 1,
        totalRatings: "13.5K",
        description: "Creative fusion of Indian and international cuisines. Modern plating, bold flavors.",
        address: "678 Mehrauli-Gurgaon Road, Gurgaon",
        openTime: "11:30 AM",
        closeTime: "11:00 PM",
      },
    ]

    for (const r of restaurants) {
      await run(
        `INSERT INTO restaurants (id, name, cuisine, rating, delivery_time, distance, image, price_for_two, offer, is_open, total_ratings, description, address, open_time, close_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.id,
          r.name,
          r.cuisine,
          r.rating,
          r.deliveryTime,
          r.distance,
          r.image,
          r.priceForTwo,
          r.offer,
          r.isOpen,
          r.totalRatings,
          r.description,
          r.address,
          r.openTime,
          r.closeTime,
        ],
      )
    }

    const dishes = [
      // Spice Junction dishes
      {
        id: "d1",
        restaurantId: "1",
        name: "Chicken Biryani",
        description: "Aromatic basmati rice cooked with tender chicken",
        price: 299,
        image:
          "https://images.unsplash.com/photo-1666190092689-e3968aa0c32c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ5YW5pJTIwZGlzaHxlbnwxfHx8fDE3NjIzNjA3NzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Main Course",
        isVeg: 0,
        rating: 4.7,
        customizable: 1,
        bestseller: 1,
      },
      {
        id: "d2",
        restaurantId: "1",
        name: "Paneer Tikka",
        description: "Grilled cottage cheese marinated in spices",
        price: 249,
        image:
          "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYW5lZXIlMjB0aWtrYXxlbnwxfHx8fDE3MzIyODA1Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Starters",
        isVeg: 1,
        rating: 4.5,
        customizable: 1,
        bestseller: 0,
      },
      {
        id: "d3",
        restaurantId: "1",
        name: "Butter Chicken",
        description: "Creamy tomato-based curry with tender chicken",
        price: 320,
        image:
          "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXR0ZXIlMjBjaGlja2VufGVufDF8fHx8MTczMjI4MDU3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Main Course",
        isVeg: 0,
        rating: 4.9,
        customizable: 1,
        bestseller: 1,
      },
      {
        id: "d4",
        restaurantId: "1",
        name: "Garlic Naan",
        description: "Soft flatbread topped with garlic and butter",
        price: 60,
        image:
          "https://images.unsplash.com/photo-1600682756729-3c2f6d5e9650?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYWFuJTIwYnJlYWR8ZW58MXx8fHwxNzMyMjgwNTc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Breads",
        isVeg: 1,
        rating: 4.4,
        customizable: 0,
        bestseller: 0,
      },
      {
        id: "d5",
        restaurantId: "1",
        name: "Lamb Rogan Josh",
        description: "Tender lamb in aromatic tomato-based gravy",
        price: 349,
        image:
          "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW1iJTIwY3Vycnl8ZW58MXx8fHwxNzMyMjgwNTc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Main Course",
        isVeg: 0,
        rating: 4.6,
        customizable: 1,
        bestseller: 1,
      },
      // Dragon Wok dishes
      {
        id: "d6",
        restaurantId: "2",
        name: "Hakka Noodles",
        description: "Stir-fried noodles with vegetables and sauces",
        price: 199,
        image:
          "https://images.unsplash.com/photo-1585032226651-759b368d7246?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwbm9vZGxlc3xlbnwxfHx8fDE3NjIzNjA3NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Main Course",
        isVeg: 1,
        rating: 4.6,
        customizable: 1,
        bestseller: 1,
      },
      {
        id: "d7",
        restaurantId: "2",
        name: "Chicken Fried Rice",
        description: "Wok-tossed rice with chicken and vegetables",
        price: 220,
        image:
          "https://images.unsplash.com/photo-1603133872878-684f208fb84b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllZCUyMHJpY2V8ZW58MXx8fHwxNzMyMjgwNTc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Main Course",
        isVeg: 0,
        rating: 4.5,
        customizable: 1,
        bestseller: 1,
      },
      {
        id: "d8",
        restaurantId: "2",
        name: "Chilli Garlic Tofu",
        description: "Crispy tofu in spicy garlic sauce",
        price: 189,
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2Z1fGVufDF8fHx8MTc2MjIxNzc1M3ww&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Mains",
        isVeg: 1,
        rating: 4.3,
        customizable: 1,
        bestseller: 0,
      },
      // La Bella Italia dishes
      {
        id: "d9",
        restaurantId: "3",
        name: "Margherita Pizza",
        description: "Classic pizza with fresh mozzarella and basil",
        price: 349,
        image:
          "https://images.unsplash.com/photo-1544982503-9f984c14501a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMHNsaWNlfGVufDF8fHx8MTc2MjMwOTc0M3ww&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Pizza",
        isVeg: 1,
        rating: 4.8,
        customizable: 1,
        bestseller: 1,
      },
      {
        id: "d10",
        restaurantId: "3",
        name: "Creamy Alfredo Pasta",
        description: "Fettuccine in rich parmesan cream sauce",
        price: 299,
        image:
          "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGRpc2h8ZW58MXx8fHwxNzYyMzM1NzU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Pasta",
        isVeg: 1,
        rating: 4.7,
        customizable: 1,
        bestseller: 1,
      },
      {
        id: "d11",
        restaurantId: "3",
        name: "Pepperoni Passion",
        description: "Loaded pepperoni pizza with extra cheese",
        price: 399,
        image:
          "https://images.unsplash.com/photo-1628840042765-356cda07f4ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXBwZXJvbmklMjBwaXp6YXxlbnwxfHx8fDE3NjIzMDk3NDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Pizza",
        isVeg: 0,
        rating: 4.9,
        customizable: 1,
        bestseller: 1,
      },
      // ... add dishes for other restaurants ...
      {
        id: "d30",
        restaurantId: "9",
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with molten center",
        price: 179,
        image:
          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWtlfGVufDF8fHx8MTc2MjIxNzc1M3ww&ixlib=rb-4.1.0&q=80&w=1080",
        category: "Desserts",
        isVeg: 1,
        rating: 4.9,
        customizable: 0,
        bestseller: 1,
      },
    ]

    for (const d of dishes) {
      await run(
        `INSERT INTO dishes (id, restaurant_id, name, description, price, image, category, is_veg, rating, customizable, bestseller)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          d.id,
          d.restaurantId,
          d.name,
          d.description,
          d.price,
          d.image,
          d.category,
          d.isVeg,
          d.rating,
          d.customizable,
          d.bestseller,
        ],
      )
    }

    const offers = [
      {
        id: "o1",
        code: "FOODIE50",
        description: "50% OFF up to ₹100 on orders above ₹199",
        minOrder: 199,
        maxDiscount: 100,
        discountPercent: 50,
        validTill: "2025-12-31",
      },
      {
        id: "o2",
        code: "WELCOME100",
        description: "Flat ₹100 OFF on first order above ₹299",
        minOrder: 299,
        maxDiscount: 100,
        discountPercent: null,
        validTill: "2025-12-31",
      },
      {
        id: "o3",
        code: "FREEDEL",
        description: "Free delivery on orders above ₹199",
        minOrder: 199,
        maxDiscount: 50,
        discountPercent: null,
        validTill: "2025-12-31",
      },
    ]

    for (const o of offers) {
      await run(
        `INSERT INTO offers (id, code, description, min_order, max_discount, discount_percent, valid_till)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [o.id, o.code, o.description, o.minOrder, o.maxDiscount, o.discountPercent, o.validTill],
      )
    }

    console.log("Database seeded with sample data")
  } catch (err) {
    console.error("Seed error:", err)
  }
}

// Auth Routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body
    const hashedPassword = await bcryptjs.hash(password, 10)
    const userId = "USER" + Date.now()

    await run(`INSERT INTO users (id, name, email, password, phone) VALUES (?, ?, ?, ?, ?)`, [
      userId,
      name,
      email,
      hashedPassword,
      phone,
    ])

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" })
    res.json({ token, user: { id: userId, name, email, phone, wallet: 500, addresses: [], dietaryPreference: "all" } })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await get("SELECT * FROM users WHERE email = ?", [email])

    if (!user || !(await bcryptjs.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" })

    const addresses = await all("SELECT * FROM addresses WHERE user_id = ?", [user.id])
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        wallet: user.wallet,
        addresses,
        dietaryPreference: user.dietary_preference,
      },
    })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Restaurant Routes
app.get("/api/restaurants", async (req, res) => {
  try {
    const restaurants = await all("SELECT * FROM restaurants")
    const formatted = restaurants.map((r) => ({
      id: r.id,
      name: r.name,
      cuisine: r.cuisine.split(","),
      rating: r.rating,
      deliveryTime: r.delivery_time,
      distance: r.distance,
      image: r.image,
      priceForTwo: r.price_for_two,
      offer: r.offer,
      isOpen: !!r.is_open,
      totalRatings: r.total_ratings,
      description: r.description,
      address: r.address,
    }))
    res.json(formatted)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get("/api/restaurants/:id", async (req, res) => {
  try {
    const restaurant = await get("SELECT * FROM restaurants WHERE id = ?", [req.params.id])
    if (!restaurant) return res.status(404).json({ error: "Not found" })

    const dishes = await all("SELECT * FROM dishes WHERE restaurant_id = ?", [req.params.id])
    res.json({
      ...restaurant,
      cuisine: restaurant.cuisine.split(","),
      isOpen: !!restaurant.is_open,
      priceForTwo: restaurant.price_for_two,
      deliveryTime: restaurant.delivery_time,
      totalRatings: restaurant.total_ratings,
      dishes: dishes.map((d) => ({
        id: d.id,
        restaurantId: d.restaurant_id,
        name: d.name,
        description: d.description,
        price: d.price,
        image: d.image,
        category: d.category,
        isVeg: !!d.is_veg,
        rating: d.rating,
        customizable: !!d.customizable,
        bestseller: !!d.bestseller,
      })),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get("/api/dishes/search", async (req, res) => {
  try {
    const query = `%${req.query.q}%`
    const dishes = await all("SELECT * FROM dishes WHERE name LIKE ? OR description LIKE ?", [query, query])
    res.json(dishes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Orders Routes
app.post("/api/orders", verifyToken, async (req, res) => {
  try {
    const { restaurantId, restaurantName, items, total, paymentMethod, deliveryAddress } = req.body
    const orderId = "ORD" + Date.now()

    await run(
      `INSERT INTO orders (id, user_id, restaurant_id, restaurant_name, total, payment_method, delivery_address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'preparing')`,
      [orderId, req.userId, restaurantId, restaurantName, total, paymentMethod, JSON.stringify(deliveryAddress)],
    )

    for (const item of items) {
      await run(
        `INSERT INTO order_items (id, order_id, dish_id, name, price, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ["ITEM" + Date.now() + Math.random(), orderId, item.dishId, item.name, item.price, item.quantity],
      )
    }

    res.json({ orderId })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.get("/api/orders", verifyToken, async (req, res) => {
  try {
    const orders = await all("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [req.userId])
    const formatted = []

    for (const order of orders) {
      const items = await all("SELECT * FROM order_items WHERE order_id = ?", [order.id])
      formatted.push({
        id: order.id,
        restaurantId: order.restaurant_id,
        restaurantName: order.restaurant_name,
        items: items.map((i) => ({ dishId: i.dish_id, name: i.name, price: i.price, quantity: i.quantity })),
        total: order.total,
        status: order.status,
        createdAt: order.created_at,
        paymentMethod: order.payment_method,
        rating: order.rating,
        review: order.review,
        deliveryAddress: JSON.parse(order.delivery_address),
      })
    }

    res.json(formatted)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get("/api/orders/:id", verifyToken, async (req, res) => {
  try {
    const order = await get("SELECT * FROM orders WHERE id = ? AND user_id = ?", [req.params.id, req.userId])
    if (!order) return res.status(404).json({ error: "Not found" })

    const items = await all("SELECT * FROM order_items WHERE order_id = ?", [req.params.id])
    res.json({
      ...order,
      items,
      deliveryAddress: JSON.parse(order.delivery_address),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Offers Routes
app.get("/api/offers", async (req, res) => {
  try {
    const offers = await all("SELECT * FROM offers")
    res.json(offers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post("/api/offers/validate", async (req, res) => {
  try {
    const { code, orderTotal } = req.body
    const offer = await get("SELECT * FROM offers WHERE code = ?", [code])

    if (!offer) {
      return res.json({ valid: false, message: "Invalid coupon code" })
    }

    if (orderTotal < offer.min_order) {
      return res.json({ valid: false, message: `Minimum order of ₹${offer.min_order} required` })
    }

    let discount = 0
    if (offer.discount_percent) {
      discount = Math.min((orderTotal * offer.discount_percent) / 100, offer.max_discount)
    } else {
      discount = offer.max_discount
    }

    res.json({
      valid: true,
      discount: Math.round(discount),
      message: `₹${Math.round(discount)} saved!`,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Address Management - Update and Delete
app.put("/api/addresses/:id", verifyToken, async (req, res) => {
  try {
    const { type, address, landmark, isDefault } = req.body
    const addressId = req.params.id

    if (isDefault) {
      await run("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [req.userId])
    }

    await run(`UPDATE addresses SET type = ?, address = ?, landmark = ?, is_default = ? WHERE id = ? AND user_id = ?`, [
      type,
      address,
      landmark,
      isDefault ? 1 : 0,
      addressId,
      req.userId,
    ])

    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete("/api/addresses/:id", verifyToken, async (req, res) => {
  try {
    await run("DELETE FROM addresses WHERE id = ? AND user_id = ?", [req.params.id, req.userId])
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put("/api/addresses/:id/default", verifyToken, async (req, res) => {
  try {
    await run("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [req.userId])
    await run("UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?", [req.params.id, req.userId])
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Favorites Management
app.post("/api/favorites/:restaurantId", verifyToken, async (req, res) => {
  try {
    const table = await get("SELECT name FROM sqlite_master WHERE type='table' AND name='favorites'")
    if (!table) {
      await run(`
        CREATE TABLE favorites (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          restaurant_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, restaurant_id),
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `)
    }

    const id = "FAV" + Date.now()
    await run("INSERT OR IGNORE INTO favorites (id, user_id, restaurant_id) VALUES (?, ?, ?)", [
      id,
      req.userId,
      req.params.restaurantId,
    ])
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete("/api/favorites/:restaurantId", verifyToken, async (req, res) => {
  try {
    await run("DELETE FROM favorites WHERE user_id = ? AND restaurant_id = ?", [req.userId, req.params.restaurantId])
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.get("/api/favorites", verifyToken, async (req, res) => {
  try {
    const favorites = await all("SELECT restaurant_id FROM favorites WHERE user_id = ?", [req.userId])
    res.json(favorites.map((f) => f.restaurant_id))
  } catch (err) {
    res.json([])
  }
})

// Search Routes
app.get("/api/restaurants/search", async (req, res) => {
  try {
    const query = `%${req.query.q}%`
    const restaurants = await all(
      "SELECT * FROM restaurants WHERE name LIKE ? OR cuisine LIKE ? OR description LIKE ?",
      [query, query, query],
    )
    const formatted = restaurants.map((r) => ({
      id: r.id,
      name: r.name,
      cuisine: r.cuisine.split(","),
      rating: r.rating,
      deliveryTime: r.delivery_time,
      distance: r.distance,
      image: r.image,
      priceForTwo: r.price_for_two,
      offer: r.offer,
      isOpen: !!r.is_open,
      totalRatings: r.total_ratings,
      description: r.description,
    }))
    res.json(formatted)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get("/api/dishes/search", async (req, res) => {
  try {
    const query = `%${req.query.q}%`
    const dishes = await all(
      "SELECT d.* FROM dishes d JOIN restaurants r ON d.restaurant_id = r.id WHERE d.name LIKE ? OR d.description LIKE ?",
      [query, query],
    )
    const formatted = dishes.map((d) => ({
      id: d.id,
      restaurantId: d.restaurant_id,
      name: d.name,
      description: d.description,
      price: d.price,
      image: d.image,
      category: d.category,
      isVeg: !!d.is_veg,
      rating: d.rating,
      customizable: !!d.customizable,
      bestseller: !!d.bestseller,
    }))
    res.json(formatted)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Reviews & Ratings
app.post("/api/orders/:id/review", verifyToken, async (req, res) => {
  try {
    const { rating, comment } = req.body
    const order = await get("SELECT * FROM orders WHERE id = ? AND user_id = ?", [req.params.id, req.userId])

    if (!order) return res.status(404).json({ error: "Order not found" })

    await run("UPDATE orders SET rating = ?, review = ? WHERE id = ?", [rating, comment, req.params.id])

    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Update Order Status (Admin only - for demo purposes)
app.put("/api/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ["preparing", "on-the-way", "delivered", "cancelled"]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" })
    }

    await run("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Get order status for tracking
app.get("/api/orders/:id/status", async (req, res) => {
  try {
    const order = await get("SELECT id, status, created_at FROM orders WHERE id = ?", [req.params.id])
    if (!order) return res.status(404).json({ error: "Order not found" })

    res.json({
      id: order.id,
      status: order.status,
      createdAt: order.created_at,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

// Initialize and start
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
