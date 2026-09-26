# Quick Start Guide

## What Happens When a Sales Rep Logs In

### 1. Login Page
Rep enters credentials and clicks login.

```
Email: john@hvac.local
Password: sales123
```

### 2. Sales Rep Dashboard
Two-column layout appears:

**LEFT COLUMN:**
- Form to enter prospect name + area code
- "Generate Demo Number" button
- Result: Demo number appears

**RIGHT COLUMN:**
- Phone pool status (available/in-use/permanent)
- Onboarding checklist
- Payment links (hidden)

### 3. Generate Demo
Rep enters:
- Prospect Name: "John Smith"
- Area Code: "708"

System:
- Checks pool for available number
- Marks as "in-use"
- Injects prospect name into Vapi prompt
- Returns phone number

Rep sees:
```
🎉 Demo Ready!
Prospect: John Smith
Area Code: 708

Demo Number:
+1 (708) 550 2484

[Release Demo Button]
```

### 4. Admin Panel
Admin logs in with: `admin@hvac.local` / `SalesXf0le8tutter!`

Can:
- Create new sales rep accounts
- View user list
- See Vapi API key (hidden from reps)
- See Stripe payment links (hidden from reps)

## File Structure

```
hvac-portal/
├── app/
│   ├── api/
│   │   ├── auth/ (login/logout)
│   │   ├── phone/ (get-demo/release-demo/pool-status)
│   │   └── admin/ (users management)
│   ├── admin/ (admin panel)
│   ├── dashboard/ (sales rep dashboard)
│   ├── page.tsx (login)
│   └── layout.tsx
├── lib/
│   ├── auth.ts (JWT session management)
│   └── kv.ts (phone pool + users)
├── .env.local (configuration)
├── package.json
└── README.md
```

## Next Steps

1. ✅ All files created on your computer
2. Run: `npm install` (install dependencies)
3. Run: `npm run dev` (start dev server)
4. Open: `http://localhost:3000`
5. Login with admin credentials
6. Create sales rep account
7. Test the flow

## Environment Variables

Already configured in `.env.local`:
- Vapi API key
- Stripe URLs
- Admin password
- Vercel KV (empty for local development)

## Git & Deployment

When ready to deploy:

```bash
git init
git add .
git commit -m "Initial HVAC portal"
git remote add origin <your-github-repo>
git push -u origin main
```

Then connect to Vercel for deployment.
