# HVAC Sales Rep Portal

A Next.js application for managing voice agent demo phone numbers with a sales rep portal and admin panel.

## Quick Start

### 1. Install Dependencies
```bash
cd hvac-portal
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
```
http://localhost:3000
```

### 4. Login Credentials

**Admin:**
- Email: `admin@hvac.local`
- Password: `SalesXf0le8tutter!`

**Sales Rep:** Create via admin panel (default password: `sales123`)

## Features

- Session-based JWT authentication
- Phone pool management (5 Vapi numbers)
- Sales rep dashboard with demo generator
- Admin panel for user management
- Real-time pool status display
- Release mechanism for declined prospects
- Security: Stripe URLs hidden from sales reps

## Deployment to Vercel

1. Connect GitHub repository to Vercel
2. Set environment variables:
   - `VAPI_API_KEY=b472be48-daaa-48c8-a48f-269933de07e8`
   - `ADMIN_PASSWORD=SalesXf0le8tutter!`
   - `STRIPE_SETUP_PAYMENT_URL=https://buy.stripe.com/00w4gygZF88EfPCd0i0RG07`
   - `STRIPE_MONTHLY_SERVICE_URL=https://buy.stripe.com/14A7sK24LcoU1YM2lE0RG08`
3. Deploy

## Architecture

- **Frontend:** Next.js 14 with React
- **Auth:** JWT sessions in HTTP-only cookies
- **State:** In-memory (local), Vercel KV (production)
- **API:** Next.js API routes

## Phone Pool System

5 available Vapi phone numbers that cycle through states:
- `available` - Ready for next demo
- `in-use` - Currently with a sales rep
- `permanent` - Locked to a paying customer
