# Riza Fashions

A modern fashion e-commerce platform built with React, Vite, Firebase, and Firestore. Riza Fashions provides a premium shopping experience with user authentication, product management, admin controls, and responsive design.

## Features

### Customer Features

* User Registration & Login
* Firebase Authentication
* User Profile Management
* Product Catalog Browsing
* Category-Based Navigation
* Product Detail Pages
* Shopping Cart
* Wishlist
* Checkout Flow
* Order Tracking
* Responsive Design
* Mobile-Friendly Interface

### Admin Features

* Secure Admin Panel
* Product Management
* Add New Products
* Edit Existing Products
* Delete Products
* Firebase Storage Image Uploads
* Firestore Product Database
* User Management
* Admin Access Control

### Firebase Integration

* Firebase Authentication
* Cloud Firestore Database
* Firebase Storage
* User Data Persistence
* Admin Role Management

---

## Tech Stack

### Frontend

* React.js
* Vite
* React Router
* JavaScript (ES6+)

### Backend & Database

* Firebase Authentication
* Cloud Firestore
* Firebase Storage

### Styling

* CSS3
* Responsive Design
* Modern UI/UX Principles

---

## Project Structure

```bash
src/
├── assets/
├── components/
├── data/
├── services/
├── App.jsx
├── firebase.js
├── main.jsx
└── index.css
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/riza-fashions.git
cd riza-fashions
```

### Install Dependencies

```bash
npm install
```

### Configure Firebase

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

### Start Development Server

```bash
npm run dev
```

Application will run at:

```bash
http://localhost:5173
```

---

## Firebase Setup

### Authentication

Enable:

* Email/Password Authentication
* Google Authentication (Optional)

### Firestore

Create collections:

```text
users
products
orders
```

### Storage

Configure Firebase Storage for product image uploads.

---

## Admin Access

Admin access is controlled through Firestore user records.

Example:

```json
{
  "uid": "USER_UID",
  "email": "admin@example.com",
  "fullName": "Admin User",
  "role": "admin"
}
```

Users without:

```json
"role": "admin"
```

cannot access the admin dashboard.

---

## Available Scripts

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## Future Enhancements

* Google Sign-In
* Order Management System
* Payment Gateway Integration
* Inventory Tracking
* Customer Reviews
* Coupon System
* Analytics Dashboard
* Email Notifications
* Multi-Admin Support

---

## Screenshots

### Home Page

Premium fashion-focused landing page with category navigation.

### Admin Dashboard

Product management, user management, and Firebase integration.

### Authentication

Secure login and registration using Firebase Authentication.

---

## Author

**Jeshika**

Riza Fashions – Premium Women's Fashion E-commerce Platform

---

## License

This project is for educational and commercial development purposes.
