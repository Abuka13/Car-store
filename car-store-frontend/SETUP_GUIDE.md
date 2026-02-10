# AutoAuction Frontend - Quick Setup Guide

## 🚀 What You Get

A complete, production-ready frontend that covers **every single feature** from your backend:

### ✅ Complete Feature Coverage

**Authentication & Authorization**
- ✓ User Registration
- ✓ User Login with JWT tokens
- ✓ Protected routes (auto-redirect to login)
- ✓ Admin-only routes and features

**Car Management**
- ✓ Browse all available cars
- ✓ View car details (brand, model, year, price)
- ✓ Filter by availability and auction status
- ✓ Direct purchase functionality
- ✓ Admin CRUD operations (Create, Read, Update, Delete)

**Auction System**
- ✓ View live auctions with real-time countdown
- ✓ Place bids on active auctions
- ✓ Auto-refresh every 5 seconds
- ✓ Auction status tracking (active/ended)
- ✓ Admin auction management (Create, Edit, Delete)

**Favorites**
- ✓ Add cars to favorites
- ✓ Remove from favorites
- ✓ View all favorite cars
- ✓ Quick purchase from favorites

**Order Management**
- ✓ View order history
- ✓ Track purchase source (auction vs direct)
- ✓ Display car details and prices
- ✓ Chronological ordering

**Admin Dashboard**
- ✓ Comprehensive car inventory management
- ✓ Full auction lifecycle control
- ✓ Tabbed interface for easy navigation
- ✓ Inline editing and deletion
- ✓ Form validation

## 📦 Installation

### Step 1: Extract the Archive
```bash
unzip car-store-frontend.zip
cd car-store-frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- React 18.2.0
- React Router 6.20.0
- Axios 1.6.2
- Lucide React (icons)
- Vite (build tool)

### Step 3: Start Development Server
```bash
npm run dev
```

The app will start at: **http://localhost:3000**

## 🔌 Backend Connection

The frontend is configured to connect to your Go backend at `http://localhost:8080`

**Make sure your backend is running before starting the frontend!**

The frontend uses a proxy configuration in `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

All API calls go through `/api` which proxies to your backend.

## 🎨 Design Features

### Minimalist & Modern
- Clean, spacious layouts
- Monochromatic color scheme (black, white, grays)
- Blue accent color for CTAs
- Smooth animations and transitions
- Card-based UI components

### Professional Typography
- Inter font family
- Hierarchical text sizing
- Proper spacing and alignment

### Responsive Design
- Mobile-first approach
- Adapts to all screen sizes
- Touch-friendly buttons and controls

## 👤 User Accounts

### Creating Admin Account
You'll need to manually set a user's role to 'admin' in your database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### Test Accounts
1. Create a regular user account through the Register page
2. Create an admin account and update the role in the database
3. Test both user flows

## 🧭 Navigation Guide

### Regular User Flow
1. **Register** → Create new account
2. **Login** → Sign in
3. **Cars** → Browse and buy cars directly
4. **Auctions** → View and bid on live auctions
5. **Favorites** → Manage saved cars
6. **Orders** → View purchase history

### Admin Flow
1. **Login** as admin
2. **Admin Dashboard** → Appears in navigation
3. **Cars Tab** → Full CRUD for car inventory
4. **Auctions Tab** → Create and manage auctions

## 🔐 Authentication Flow

1. User registers or logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token automatically added to all API requests
5. On 401 response → auto-redirect to login
6. Logout clears token and user data

## 📱 Pages Overview

### Public Pages
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user signup

### Protected Pages (Require Login)
- **Cars** (`/`) - Main car listings
- **Auctions** (`/auctions`) - Live auction page
- **Favorites** (`/favorites`) - Saved cars
- **Orders** (`/orders`) - Purchase history

### Admin Only
- **Admin** (`/admin`) - Dashboard for management

## 🎯 Key Features Explained

### Real-time Auction Updates
```javascript
// Auto-refreshes every 5 seconds
useEffect(() => {
  const interval = setInterval(loadData, 5000);
  return () => clearInterval(interval);
}, []);
```

### Countdown Timer
Shows time remaining in auctions:
- Days and hours for long auctions
- Hours and minutes for medium
- Minutes only for ending soon

### Favorites Toggle
Heart icon shows filled when car is favorited:
```javascript
<Heart fill={isFavorited ? 'currentColor' : 'none'} />
```

### Admin Protection
Routes check user role:
```javascript
<ProtectedRoute adminOnly>
  <Admin />
</ProtectedRoute>
```

## 🛠 Customization

### Change Backend URL
Edit `src/services/api.js`:
```javascript
const API_BASE_URL = '/api'; // Change to your backend URL
```

### Modify Colors
Edit `src/styles/main.css`:
```css
:root {
  --primary: #0a0a0a;      /* Main dark color */
  --accent: #2563eb;       /* Blue accent */
  --success: #22c55e;      /* Green */
  --error: #ef4444;        /* Red */
}
```

### Add New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/Header.jsx`

## 📊 API Endpoints Used

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get token

### Cars
- `GET /cars` - Get all cars
- `GET /cars?id={id}` - Get specific car
- `POST /cars` - Create (admin)
- `PUT /cars?id={id}` - Update (admin)
- `DELETE /cars?id={id}` - Delete (admin)

### Auctions
- `GET /auctions` - Get all auctions
- `POST /auctions` - Create (admin)
- `PUT /auctions?id={id}` - Update (admin)
- `DELETE /auctions?id={id}` - Delete (admin)
- `POST /auctions/bid` - Place bid

### Orders
- `POST /orders/buy?car_id={id}` - Purchase car
- `GET /orders/my` - Get user's orders

### Favorites
- `GET /favorites` - Get user's favorites
- `POST /favorites?car_id={id}` - Add favorite
- `DELETE /favorites?car_id={id}` - Remove favorite

## 🏗 Production Build

```bash
npm run build
```

Output goes to `dist/` directory.

### Deploy to Production
1. Build the project
2. Serve the `dist/` folder with any static server
3. Update `API_BASE_URL` to production backend
4. Configure CORS on backend for frontend domain

## 🐛 Troubleshooting

### "Failed to load data"
- Check backend is running on port 8080
- Verify database is connected
- Check browser console for errors

### "401 Unauthorized"
- Token might be expired
- Try logging out and back in
- Check JWT secret matches between frontend/backend

### "CORS Error"
- Add CORS headers to backend
- Allow origin `http://localhost:3000` in development

### Modal not closing
- Click outside the modal
- Use the X button
- Press Escape key

## 📝 Development Tips

### Hot Reload
Vite provides instant hot module replacement - changes appear immediately without refresh.

### React DevTools
Install React DevTools browser extension for debugging.

### API Testing
Use the Network tab in DevTools to inspect API calls and responses.

### State Inspection
AuthContext provides global access to user state - check it for auth debugging.

## 🎓 Code Structure

```
src/
├── components/       # Reusable UI components
│   ├── Header.jsx       # Navigation bar
│   └── ProtectedRoute.jsx  # Route wrapper
├── contexts/         # React Context providers
│   └── AuthContext.jsx    # Auth state management
├── pages/           # Route components
│   ├── Admin.jsx        # Admin dashboard
│   ├── Auctions.jsx     # Auction listing
│   ├── Cars.jsx         # Car browsing
│   ├── Favorites.jsx    # User favorites
│   ├── Login.jsx        # Login form
│   ├── Orders.jsx       # Order history
│   └── Register.jsx     # Registration
├── services/        # API and utilities
│   └── api.js          # Axios configuration
└── styles/          # CSS files
    └── main.css        # Global styles
```

## ✨ What Makes This Special

1. **100% Feature Coverage** - Every backend endpoint has a frontend interface
2. **Clean Architecture** - Organized, maintainable code structure
3. **Modern Stack** - Latest React patterns and best practices
4. **Production Ready** - Error handling, loading states, validation
5. **Beautiful Design** - Minimalist, professional aesthetic
6. **User Experience** - Intuitive navigation and interactions
7. **Admin Tools** - Complete management dashboard
8. **Real-time Updates** - Live auction countdown and status

## 🚀 Next Steps

1. Install and run the frontend
2. Start your Go backend
3. Create test accounts (user and admin)
4. Add some cars via admin panel
5. Create auctions
6. Test the complete user flow!

---

**Need Help?** Check the main README.md for detailed documentation.
