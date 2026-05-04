# CityShop 🛒

CityShop is a comprehensive, dual-role mobile e-commerce platform built with **React Native** and **Supabase**. It provides a seamless experience for both regular customers (shoppers) and shopkeepers (vendors) to interact, manage products, and process orders in real-time.

---

## 🚀 Features

### For Customers (Shoppers)
*   **Secure Authentication:** Sign up, log in, and manage profiles securely via Supabase Auth.
*   **Product Browsing:** Browse a wide variety of products across multiple categories (Electronics, Clothing, Furniture, etc.).
*   **Cart & Wishlist:** Add items to a shopping cart or save them to a wishlist for later.
*   **Checkout & Payments:** Fully integrated checkout flow with **Razorpay** for seamless UPI and card payments.
*   **Order Tracking:** View order history and receive real-time notifications.

### For Shopkeepers (Vendors)
*   **Vendor Dashboard:** A dedicated interface to manage inventory and view store analytics.
*   **Product Management:** Add, edit, and delete products. Upload product images directly to Supabase Storage.
*   **Order Management:** Track incoming orders and manage fulfillment.

### Security & Architecture
*   **Row-Level Security (RLS):** Database operations are strictly scoped; users can only access and modify their own data, and shopkeepers can only manage their own products.
*   **Environment Configuration:** Sensitive keys (Supabase URL, Anon Key, Razorpay Key) are securely managed via `.env` injection (`react-native-dotenv`).
*   **Singleton Pattern:** Global Supabase client instance to prevent memory leaks and redundant network calls.

---

## 🛠️ Technology Stack

*   **Frontend:** React Native, React Navigation
*   **Backend & Database:** Supabase (PostgreSQL)
*   **Authentication:** Supabase Auth (Email & OAuth ready)
*   **Storage:** Supabase Storage Buckets
*   **Payments:** Razorpay Checkout (`react-native-razorpay`)
*   **State Management:** React Context API

---

## 💻 Getting Started

### Prerequisites
Make sure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18 or newer recommended)
*   [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/downloads/) (v17 or newer)
*   [Android Studio](https://developer.android.com/studio) with Android SDK and an Emulator (e.g., Pixel 10 Pro)
*   `adb` added to your system PATH.

### 1. Clone the Repository
```bash
git clone https://github.com/imkk21/cityshop.git
cd cityshop
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your keys:
```env
SUPABASE_URL=https://your-project-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key
RAZORPAY_KEY=your-razorpay-test-key
GOOGLE_WEB_CLIENT_ID=your-google-client-id
```

### 4. Database Setup
A complete SQL restoration script is provided to set up the database schema and security policies.
1. Go to your Supabase project dashboard -> **SQL Editor**.
2. Copy the contents of `supabase_restore.sql` and run it.
3. Go to **Storage** and create two public buckets: `product-images` and `profile-pictures`.

### 5. Run the Application

Start the Metro Bundler:
```bash
npx react-native start --reset-cache
```

In a new terminal window, launch the app on your Android Emulator:
```bash
npx react-native run-android
```

---

## 🔐 Security Notes
*   **Never commit your `.env` file.** It is included in `.gitignore` by default.
*   The `users` table utilizes Supabase Auth for passwords. Never store plaintext passwords in standard database tables.
*   RLS policies must remain enabled in Supabase to secure the application.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📝 License
This project is for educational and portfolio purposes.
