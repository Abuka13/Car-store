# AutoAuction - Car Store Frontend

A modern, minimalist frontend for the car store auction system built with React, featuring real-time bidding, favorites management, and complete admin controls.

## Features

### User Features
- **Authentication**: Secure login and registration
- **Car Browsing**: View all available cars with detailed information
- **Direct Purchase**: Buy cars directly with one click
- **Live Auctions**: Real-time auction listings with countdown timers
- **Bidding System**: Place bids on active auctions
- **Favorites**: Save favorite cars for later viewing
- **Order History**: Track all purchases (direct and auction)

### Admin Features
- **Car Management**: Full CRUD operations for cars
- **Auction Management**: Create, edit, and delete auctions
- **Real-time Updates**: Auto-refresh auction status
- **Dashboard**: Comprehensive overview of inventory and auctions

## Tech Stack

- **React 18** - UI framework
- **React Router 6** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Modern icon library
- **Vite** - Build tool and dev server

## Prerequisites

- Node.js 16+ and npm
- Backend server running on `http://localhost:8080`

## Installation

1. Extract the project:
```bash
unzip car-store-frontend.zip
cd car-store-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Backend Integration

The frontend expects the backend API to be running on `http://localhost:8080` with the following endpoints:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login (returns JWT token)

### Cars
- `GET /cars` - Get all cars
- `GET /cars?id={id}` - Get car by ID
- `POST /cars` - Create car (admin only)
- `PUT /cars?id={id}` - Update car (admin only)
- `DELETE /cars?id={id}` - Delete car (admin only)

### Auctions
- `GET /auctions` - Get all auctions
- `GET /auctions?id={id}` - Get auction by ID
- `POST /auctions` - Create auction (admin only)
- `PUT /auctions?id={id}` - Update auction (admin only)
- `DELETE /auctions?id={id}` - Delete auction (admin only)
- `POST /auctions/bid` - Place bid

### Orders
- `POST /orders/buy?car_id={id}` - Purchase car directly
- `GET /orders/my` - Get user's orders

### Favorites
- `GET /favorites` - Get user's favorites
- `POST /favorites?car_id={id}` - Add to favorites
- `DELETE /favorites?car_id={id}` - Remove from favorites

## Project Structure

```
car-store-frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Navigation header
│   │   └── ProtectedRoute.jsx   # Route protection
│   ├── contexts/
│   │   └── AuthContext.jsx      # Authentication state
│   ├── pages/
│   │   ├── Login.jsx            # Login page
│   │   ├── Register.jsx         # Registration page
│   │   ├── Cars.jsx             # Car listings
│   │   ├── Auctions.jsx         # Live auctions
│   │   ├── Favorites.jsx        # Saved favorites
│   │   ├── Orders.jsx           # Order history
│   │   └── Admin.jsx            # Admin dashboard
│   ├── services/
│   │   └── api.js               # API client
│   ├── styles/
│   │   └── main.css             # Global styles
│   ├── App.jsx                  # Main app component
│   └── main.jsx                 # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## Usage Guide

### For Regular Users

1. **Register/Login**: Create an account or sign in
2. **Browse Cars**: View available cars on the home page
3. **Buy Cars**: Click "Buy Now" on any available car
4. **Join Auctions**: Navigate to Auctions and place bids
5. **Save Favorites**: Click the heart icon to save cars
6. **View Orders**: Check your purchase history in Orders

### For Admins

1. **Access Admin Panel**: Navigate to Admin from the header
2. **Manage Cars**: 
   - Add new cars with the "Add Car" button
   - Edit existing cars with the edit icon
   - Delete cars with the trash icon
3. **Manage Auctions**:
   - Create auctions for available cars
   - Set start/end times and starting prices
   - Edit or delete existing auctions

## Design Philosophy

The UI follows a **minimalist design** approach:

- Clean, spacious layouts with ample whitespace
- Monochromatic color scheme with accent colors
- Subtle animations and transitions
- Mobile-responsive design
- Intuitive navigation and user flows

## Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Environment Configuration

To change the backend URL, modify the `API_BASE_URL` in `src/services/api.js`:

```javascript
const API_BASE_URL = '/api'; // Change this for different backend
```

## Authentication

The app uses JWT tokens stored in localStorage:
- Tokens are automatically added to all authenticated requests
- Users are redirected to login on 401 responses
- Admin-only routes check user role from JWT

## Features in Detail

### Real-time Auction Updates
Auctions page auto-refreshes every 5 seconds to show:
- Current time remaining
- Active/ended status
- Latest bid information

### Favorites System
- Persistent across sessions
- Quick add/remove with heart icon
- Can purchase directly from favorites

### Order Tracking
- Shows purchase source (auction vs direct)
- Displays car details and prices
- Chronological order history

### Admin Dashboard
- Tabbed interface for cars and auctions
- Inline editing and deletion
- Form validation and error handling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of the AutoAuction car store system.
