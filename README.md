# Bodega Chirinos - Modern Retail POS & Inventory System

A complete, production-ready point-of-sale and inventory management system built for the Venezuelan market with dynamic currency conversion, offline-first architecture, and real-time data synchronization.

## Features

### Core Systems

- **Authentication & Authorization**: Secure session management with Firebase Authentication
- **Exchange Rate Master**: Real-time Tasa del Día (Daily Exchange Rate) management from the admin dashboard with instant system-wide updates
- **Dynamic Pricing**: All prices automatically convert between USD and Bs based on the current exchange rate
- **Point of Sale (POS)**: Full-featured checkout system with multiple payment methods
- **Inventory Management**: Product catalog management with stock tracking, low-stock alerts, and fractional unit support
- **Dashboard & Analytics**: Real-time sales metrics, profit tracking, and business insights
- **Offline-First Architecture**: PWA with IndexedDB sync enables operation without internet connectivity
- **Multi-Payment Support**: Cash (USD/Bs), mobile payments, and wallet transactions

### Technical Features

- **Real-Time Updates**: Firebase Realtime Database with live listeners for exchange rates and transactions
- **Offline Synchronization**: Service Worker + IndexedDB for seamless offline to online sync
- **Production-Ready**: Full input validation (Zod), error handling, and security best practices
- **Responsive Design**: Mobile-first design with full tablet and desktop support
- **Type-Safe**: Full TypeScript with strict type checking throughout

## Architecture

### Database Schema (Firebase Realtime DB)

```
/exchangeRates/current
  - rate: number (Bs per USD)
  - lastUpdatedAt: timestamp
  - lastUpdatedBy: string

/products/{productId}
  - name: string
  - sku: string
  - category: string
  - priceUsd: number
  - costUsd: number
  - quantity: number
  - minStockLevel: number
  - unit: string (unit|kg|liter|meter)
  - isReturnable: boolean

/transactions/{transactionId}
  - items: CartItem[]
  - subtotalUsd: number
  - paymentMethod: string
  - amountReceivedUsd/Bs: number
  - changeUsd/Bs: number
  - exchangeRate: number
  - createdAt: timestamp

/users/{userId}
  - email: string
  - businessName: string
  - role: string (admin|cashier|inventory_manager)
  - createdAt: timestamp
```

### Frontend Architecture

- **Framework**: Next.js 16 with App Router
- **State Management**: React Context + SWR for data fetching
- **UI Components**: shadcn/ui with Tailwind CSS v4
- **Real-Time Sync**: Firebase Realtime Database listeners
- **Offline Support**: IndexedDB + Service Worker
- **Forms**: React Hook Form + Zod validation

## Modules

### Module 1: Authentication System ✅
- Email/password authentication with Firebase
- Session management with tokenization
- Role-based access control (Admin, Cashier, Inventory Manager)
- Secure logout and session expiration

### Module 2: Admin Dashboard with Exchange Rate Master ✅
- **CRITICAL**: Manual exchange rate input with real-time global broadcast
- Dashboard statistics (today's revenue, transactions, inventory)
- Real-time profit analytics
- Low stock alerts
- Quick navigation to all system modules

### Module 3: Point of Sale System ✅
- Product search and quick add to cart
- Dynamic pricing (USD↔Bs conversion)
- Multiple payment methods
- Change calculation
- Transaction history with timestamps
- Real-time exchange rate display

### Module 4: Inventory Management ✅
- Product add/edit interface
- Stock quantity management
- Low stock threshold monitoring
- Profit margin calculation
- Returnable container tracking
- Fractional unit support (kg, liter, meter)

### Module 5: Offline PWA & Real-time Sync ✅
- Service Worker registration
- IndexedDB for offline transaction queuing
- Background sync when connection restored
- Offline indicator UI
- Install-to-home-screen capability
- Web app manifest

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Firebase project with Realtime Database enabled
- Firebase Authentication enabled (Email/Password)

### Installation

1. **Clone or download the project**
   ```bash
   pnpm install
   ```

2. **Set up Firebase environment variables**
   
   Create a `.env.local` file with your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Initialize the database**

   Create the initial exchange rate in Firebase:
   ```javascript
   // In Firebase Console or through your app
   /exchangeRates/current
   {
     "rateUsdToBs": 2536.50,
     "rate": 2536.50,
     "lastUpdatedAt": 1676419200000
   }
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open the app**
   - Visit `http://localhost:3000`
   - Create an account or login
   - Access the dashboard

### Default Routes

- `/` - Home (redirects to dashboard if logged in)
- `/login` - Login page
- `/signup` - Account creation
- `/dashboard` - Main admin dashboard
- `/pos` - Point of sale checkout
- `/inventory` - Inventory management
- `/settings` - System settings

## Exchange Rate Master

The Exchange Rate Master is the critical feature of the system:

1. **Located**: Admin Dashboard (prominently displayed)
2. **Purpose**: Set the daily Tasa del Día (USD to Bs rate)
3. **Real-Time Impact**: 
   - POS prices update instantly
   - All calculations use the current rate
   - Affects all connected clients simultaneously
4. **No External Dependencies**: Rate is manually set by admin, no API calls needed

## Usage Guide

### For Admin/Owner

1. **Daily Operations**:
   - Login to dashboard
   - Update exchange rate first thing in morning
   - Monitor sales metrics and inventory status

2. **Inventory Management**:
   - Add products with pricing and stock levels
   - Set minimum stock thresholds
   - Track profit margins

3. **Analytics**:
   - View today's revenue in USD and Bs
   - Track transaction count
   - Monitor low-stock items

### For Cashiers

1. **Process Sales**:
   - Use POS system to add items to cart
   - Display shows both USD and Bs prices
   - Process payments (cash, mobile, wallet)
   - System auto-updates inventory

2. **Offline Support**:
   - If internet goes down, continue processing sales
   - Transactions saved locally
   - Auto-syncs when connection restored

### For Inventory Managers

1. **Stock Management**:
   - View all products and quantities
   - Update stock levels
   - Monitor upcoming low-stock alerts
   - Receive notifications for out-of-stock items

## Offline Capabilities

When offline, the system:
- Caches all previously loaded pages and assets
- Stores pending transactions in IndexedDB
- Shows offline indicator with sync status
- Automatically syncs when connection returns
- Preserves all data integrity

Offline indicator appears when:
- Network connection is lost (red indicator)
- Coming back online (green indicator showing sync)

## Security

- **Firebase Security Rules**: Implement Row-Level Security
- **Password Security**: Firebase handles bcrypt hashing
- **Session Management**: Token-based with expiration
- **Input Validation**: Zod schema validation on all forms
- **Data Protection**: No sensitive data stored in localStorage
- **CORS**: Configured for Firebase APIs

## Performance Optimizations

- **Service Worker Caching**: Network-first strategy for assets
- **Real-Time Listeners**: Only subscribe to needed data
- **IndexedDB**: Efficient offline data persistence
- **Code Splitting**: Lazy loading of route components
- **Image Optimization**: Next.js native image optimization

## Troubleshooting

### Exchange Rate Not Updating
- Check Firebase connection in console
- Verify real-time listener in `use-exchange-rate` hook
- Check browser network tab for Firebase requests

### Offline Transactions Not Syncing
- Check browser IndexedDB in DevTools
- Verify service worker is active (DevTools > Application > Service Workers)
- Manual sync can be triggered by app refresh

### Products Not Appearing in POS
- Verify products are created in Inventory module
- Check Firebase database has products
- Clear browser cache and reload

### Authentication Issues
- Confirm Firebase credentials in .env.local
- Check Firebase console for user creation
- Verify email verification if required

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Future Enhancements

- Multi-location support with branch management
- Advanced reporting and tax compliance
- Customer loyalty program integration
- Supplier management and purchase orders
- Barcode/QR code scanning
- Receipt printing integration
- API for third-party integrations

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review Firebase console for errors
3. Check browser DevTools console logs
4. Verify network connectivity

## License

Built for Bodega Chirinos - Venezuelan Retail Excellence
