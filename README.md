# Bolt Food Admin Dashboard

A Next.js admin dashboard for managing the Bolt Food delivery platform.

## Features

- 🏪 **Restaurant Management** - View, add, edit, and toggle restaurant status
- 🍕 **Menu Management** - Manage menu items across all restaurants
- 📦 **Order Tracking** - Monitor and update order statuses in real-time
- 🔥 **Firebase Integration** - Real-time updates with Firestore

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

Create a `.env.local` file and add your Firebase credentials (same as the customer app):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Seed Data (from main app)

Before using the admin dashboard, populate your Firebase database:

```bash
cd ../bolt-food-clone
npm run seed-data
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the admin dashboard.

## Pages

- **Dashboard** (`/`) - Overview and quick stats
- **Restaurants** (`/restaurants`) - Manage all restaurants
- **Menu** (`/menu`) - Manage menu items
- **Orders** (`/orders`) - View and manage orders

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Language**: TypeScript

## Deployment

Deploy to Vercel with one click:

```bash
vercel
```

Make sure to add your Firebase environment variables in the Vercel dashboard.
