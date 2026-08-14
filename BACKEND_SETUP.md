# FoodiezX Backend Setup Guide

This guide walks you through setting up the backend server for FoodiezX.

## Prerequisites

- Node.js (v16 or higher)
- npm or pnpm

## Installation

### 1. Install Backend Dependencies

Navigate to the server folder and install dependencies:

\`\`\`bash
cd server
npm install
\`\`\`

### 2. Environment Setup

Create a `.env` file in the server folder:

\`\`\`bash
cp .env.example .env
\`\`\`

Update the `.env` file with your configuration:

\`\`\`env
PORT=5000
JWT_SECRET=your-super-secret-key-change-this-in-production
CLIENT_URL=http://localhost:5173
\`\`\`

### 3. Run the Server

Start the backend server:

\`\`\`bash
npm run dev
\`\`\`

The server will start on `http://localhost:5000`. The database will be automatically created and seeded with sample data on first run.

## API Endpoints

### Authentication

- **POST** `/api/auth/signup` - Create new account
- **POST** `/api/auth/login` - Login user

### Restaurants

- **GET** `/api/restaurants` - Get all restaurants
- **GET** `/api/restaurants/:id` - Get restaurant details with dishes

### Dishes

- **GET** `/api/dishes/search?q=query` - Search dishes

### Orders

- **POST** `/api/orders` - Place an order (requires auth)
- **GET** `/api/orders` - Get user's orders (requires auth)
- **GET** `/api/orders/:id` - Get order details (requires auth)

### Offers

- **GET** `/api/offers` - Get all active offers
- **POST** `/api/offers/validate` - Validate coupon code

### User

- **GET** `/api/user` - Get user profile (requires auth)
- **POST** `/api/addresses` - Add delivery address (requires auth)

## Frontend Configuration

Update your frontend `.env` file:

\`\`\`env
VITE_API_URL=http://localhost:5000/api
\`\`\`

Then run the frontend:

\`\`\`bash
npm run dev
\`\`\`

## Database

The app uses SQLite, with the database file stored at `server/foodiezx.db`. 

### Sample Data

The database is automatically seeded with:
- 6 restaurants (Indian, Chinese, Italian, Mexican, American, Japanese)
- 12+ dishes per restaurant
- 3 coupon codes (FOODIE50, WELCOME100, FREEDEL)

### Login Credentials for Testing

After signup, you can immediately login with the same credentials. The system supports any email/password combination.

## Troubleshooting

### Port Already in Use

If port 5000 is already in use, change it in `.env`:

\`\`\`env
PORT=5001
\`\`\`

And update your frontend `.env`:

\`\`\`env
VITE_API_URL=http://localhost:5001/api
\`\`\`

### CORS Errors

Make sure your frontend URL matches `CLIENT_URL` in backend `.env`.

### Database Issues

To reset the database, delete `server/foodiezx.db` and restart the server.

## Production Deployment

Before deploying to production:

1. Change `JWT_SECRET` to a strong random string
2. Update `CLIENT_URL` to your production frontend URL
3. Use a production database (PostgreSQL recommended)
4. Add error logging and monitoring
5. Set `NODE_ENV=production`

## Next Steps

Your app is now ready to use! The frontend will automatically connect to the backend and all mock data has been replaced with real API calls.
