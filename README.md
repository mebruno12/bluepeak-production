# BluePeak Estate & Investments

Internal web application for analyzing Portuguese fix & flip deals and property valuations.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Edit `.env` and set your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/bluepeak_db"
```

### 3. Create Database
```bash
createdb bluepeak_db
```

### 4. Run Migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Seed Database (Optional)
```bash
npm run seed
```

This creates:
- Admin: `admin@bluepeak.pt` / `admin123`
- Analyst: `analyst@bluepeak.pt` / `analyst123`
- Sample deal and valuation

### 6. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

✅ **Fix & Flip Analyzer**
- Two scenario analysis
- Acquisition costs (IMT, IS, fees)
- Purchase & works financing
- Holding costs
- Sale costs & penalties
- ROI calculations

✅ **Property Valuations**
- Comparable properties analysis
- Automatic adjustments
- Price per m² calculations
- Market benchmarks
- Estimated value ranges

✅ **User Management**
- Email/password authentication
- Role-based access (Analyst, Partner, Admin)

✅ **Dashboard**
- All deals and valuations in one view
- Filters and search
- Status tracking

✅ **PDF Export**
- Professional reports for deals and valuations

✅ **Settings**
- Customizable default values

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- JWT Authentication

## 📚 Documentation

### Local Development
- **[SETUP.md](./SETUP.md)** - Comprehensive local setup, development, and troubleshooting guide

### Database Setup
- **[SUPABASE-SETUP.md](./SUPABASE-SETUP.md)** 🗄️ - Supabase PostgreSQL setup guide (updated for 2024)

### Production Deployment
- **[QUICK-DEPLOY.md](./QUICK-DEPLOY.md)** ⚡ - 15-minute fast track deployment (Supabase + Vercel)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** 📖 - Detailed deployment guide with troubleshooting
- **[PRE-DEPLOY-CHECKLIST.md](./PRE-DEPLOY-CHECKLIST.md)** ✅ - Pre-deployment verification checklist
- **[DEPLOYMENT-SUMMARY.md](./DEPLOYMENT-SUMMARY.md)** 📊 - Configuration overview

### Deployment Target
This app is configured to deploy at: `bluepeak.pt/calculadora-investimento-imobiliario`

Or as a subdomain: `calculadora.bluepeak.pt` (recommended)

## Branding

Colors:
- Light Blue: `#0B8BEC`
- Dark Blue: `#131836`

Replace `/public/bluepeak-logo.svg` with your actual logo.

---

**BluePeak Estate & Investments** - Real Estate Analysis Platform
