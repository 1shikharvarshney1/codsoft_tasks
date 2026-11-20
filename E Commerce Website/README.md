# NovaStore - Full-Stack MERN E-Commerce Website

A full-stack, production-ready e-commerce web application built using **React**, **Node.js (Express)**, **MongoDB (Mongoose)**, and **Stripe Payment Gateway** in test mode.

---

## 🌟 Key Features

1. **Product Browsing**:
   - Product catalog listing with high-resolution imagery and badge indicators.
   - Dynamic Product Detail page (`/products/:id`) with stock indicators, detailed descriptions, and image galleries.
2. **Advanced Filtering & Search**:
   - Real-time search query matching product titles and descriptions.
   - Dynamic Category filtering populated directly from active inventory.
   - Numerical price range filters (minimum and maximum bounds).
   - Price and rating sorting (`Price: Low to High`, `Price: High to Low`, `Newest Arrivals`, `Highest Rated`).
3. **Shopping Cart**:
   - Real-time cart state management with persistent storage (`localStorage` & MongoDB sync).
   - Add items, increment/decrement quantities, remove items, or clear cart.
   - Instant subtotal, estimated sales tax (8%), and automated free shipping calculations ($50+ orders).
4. **User Authentication**:
   - Secure registration and login using JSON Web Tokens (JWT) and `bcryptjs` password hashing.
   - Role-based authorization (`customer` vs `admin`).
   - Protected client-side routes for checkout and order history.
5. **Checkout & Order Creation**:
   - Multi-step checkout with delivery address forms and real-time order breakdown.
   - Automatic order document creation in MongoDB (`User`, `Product`, `Order`, `Cart`).
   - Automatic inventory deduction upon successful placement.
6. **Stripe Payment Integration**:
   - Stripe Elements integration configured for Stripe Test Mode.
   - Safe client-secret generation via Express `/api/payment/create-payment-intent`.
   - Sandbox mock fallback so you can test end-to-end checkout without a live Stripe key.

---

## 📁 Project Directory Structure

```
├── server/                         # Backend (Node.js & Express)
│   ├── .env.example                # Environment variables template
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── db.js               # MongoDB connection
│       ├── models/
│       │   ├── User.js             # User schema with bcrypt & JWT
│       │   ├── Product.js          # Product schema
│       │   ├── Cart.js             # Cart schema
│       │   └── Order.js            # Order & Shipping schema
│       ├── middleware/
│       │   ├── auth.js             # JWT verification middleware
│       │   └── errorHandler.js     # Centralized error handling
│       ├── controllers/
│       │   ├── authController.js   # Login, registration, profile
│       │   ├── productController.js# Catalog, search, filters
│       │   ├── cartController.js   # Cart management
│       │   ├── orderController.js  # Order creation & history
│       │   └── paymentController.js# Stripe PaymentIntent handler
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── productRoutes.js
│       │   ├── cartRoutes.js
│       │   ├── orderRoutes.js
│       │   └── paymentRoutes.js
│       ├── seed/
│       │   ├── productsData.js     # Realistic sample catalog items
│       │   └── seed.js             # Database seeding runner
│       └── server.js               # Express app bootstrap
│
├── client/                         # Frontend (React & Vite)
│   ├── .env.example                # Frontend environment template
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── index.css               # Modern responsive styling
│       ├── App.jsx                 # Routes & Context providers
│       ├── main.jsx
│       ├── api/
│       │   └── axiosClient.js      # Axios instance with JWT interceptor
│       ├── context/
│       │   ├── AuthContext.jsx     # User authentication state
│       │   └── CartContext.jsx     # Cart operations & totals
│       ├── components/
│       │   ├── Navbar.jsx          # Top navigation with live count badge
│       │   ├── Footer.jsx          # Responsive store footer
│       │   ├── ProductCard.jsx     # Product card with quick add
│       │   ├── ProtectedRoute.jsx  # Auth gate for checkout & orders
│       │   └── StripeCheckoutForm.jsx # Stripe CardElement payment form
│       └── pages/
│           ├── HomePage.jsx        # Browsing, search & sidebar filters
│           ├── ProductDetailPage.jsx # Individual product page
│           ├── CartPage.jsx        # Cart table & summary
│           ├── LoginPage.jsx       # Sign in with 1-click demo fill
│           ├── RegisterPage.jsx    # User registration
│           ├── CheckoutPage.jsx    # Address form + Stripe payment
│           ├── OrderSuccessPage.jsx# Order confirmation receipt
│           └── OrdersPage.jsx      # Order history and delivery status
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher recommended)
- **MongoDB** (Local instance or free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- **Stripe Account** (Optional for testing; test credentials are provided below)

---

### 1. Backend Setup (`/server`)

1. Open your terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Update the values in `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce_db
   JWT_SECRET=super_secret_jwt_key_12345
   JWT_EXPIRES_IN=7d
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   CLIENT_URL=http://localhost:5173
   ```

4. Seed the database with sample products and demo users:
   ```bash
   npm run seed
   ```
   *This populates sample electronics, audio products, accessories, and creates the demo user accounts.*

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:5000`.*

---

### 2. Frontend Setup (`/client`)

1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Values in `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client will start on `http://localhost:5173`.*

---

## 🧪 Demo Credentials & Testing

### Demo Users (Created by `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Customer | `user@example.com` | `password123` |
| Administrator | `admin@example.com` | `adminpassword123` |

*(Tip: On the Login page, click **"Fill Demo Credentials"** to quickly log in with one click).*

### Stripe Test Card Details
Use Stripe's standard test card for checkout:
- **Card Number**: `4242 4242 4242 4242`
- **Expiration Date**: Any future month/year (e.g., `12/28`)
- **CVC**: `123`
- **Postal Code**: Any valid code (e.g., `94105`)

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register user `{ name, email, password }`
- `POST /api/auth/login`: Authenticate `{ email, password }` and obtain JWT
- `GET /api/auth/me`: Get current authenticated user profile *(Protected)*

### Products (`/api/products`)
- `GET /api/products`: List products with query parameters:
  - `?keyword=sony`: Case-insensitive text search
  - `?category=Audio`: Filter by category
  - `?minPrice=50&maxPrice=500`: Price range filter
  - `?sort=price-asc` | `price-desc` | `rating` | `newest`
- `GET /api/products/categories/list`: Get list of unique category strings
- `GET /api/products/:id`: Get single product details

### Shopping Cart (`/api/cart`) *(All Protected)*
- `GET /api/cart`: Retrieve current user's cart
- `POST /api/cart/items`: Add `{ productId, quantity }` to cart
- `PUT /api/cart/items/:productId`: Update item quantity `{ quantity }`
- `DELETE /api/cart/items/:productId`: Remove item from cart
- `DELETE /api/cart`: Clear entire cart

### Orders (`/api/orders`) *(All Protected)*
- `POST /api/orders`: Create new order and deduct product inventory
- `GET /api/orders/myorders`: Get list of orders for the authenticated user
- `GET /api/orders/:id`: Get order by ID
- `PUT /api/orders/:id/pay`: Mark order as paid with payment result

### Payments (`/api/payment`)
- `GET /api/payment/config`: Retrieve Stripe publishable key
- `POST /api/payment/create-payment-intent`: Create Stripe PaymentIntent `{ amount, currency }` *(Protected)*
