# BluePeak Estate & Investments - Setup Guide

Complete internal web application for analyzing Portuguese fix & flip deals and property valuations.

## 🎯 Features

- **Fix & Flip Analyzer**: Comprehensive deal analysis with two scenarios
  - Acquisition costs (IMT, IS, notary fees)
  - Purchase & works financing with interest calculations
  - Holding costs over retention period
  - Sale costs with early repayment penalties
  - ROI, Cash-on-Cash ROI, and annualized returns

- **Valuation by Comparables**: Property valuation tool
  - Comparable properties with adjustments
  - Price per m² calculations
  - Benchmark data from multiple sources
  - Estimated value calculations

- **User Management**: Email/password authentication with role-based access (Analyst, Partner, Admin)
- **Dashboard**: Centralized view of all deals and valuations
- **PDF Export**: Professional PDF reports for deals and valuations
- **Settings**: Customizable default values for calculations

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Git**

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/bluepeak_db"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   NODE_ENV="development"
   ```

3. **Create PostgreSQL database**
   ```bash
   createdb bluepeak_db
   ```

   Or using psql:
   ```sql
   CREATE DATABASE bluepeak_db;
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

6. **Seed the database** (optional - creates sample data)
   ```bash
   npm run seed
   ```

   This creates:
   - Admin user: `admin@bluepeak.pt` / `admin123`
   - Analyst user: `analyst@bluepeak.pt` / `analyst123`
   - Sample fix & flip deal
   - Sample valuation
   - Default settings

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
bluepeak-app/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login page
│   │   └── register/page.tsx       # Registration page
│   ├── dashboard/
│   │   ├── layout.tsx              # Main layout with navigation
│   │   ├── page.tsx                # Dashboard with deals/valuations list
│   │   ├── deals/
│   │   │   ├── new/page.tsx        # Create new deal
│   │   │   └── [id]/page.tsx       # Edit deal (Fix & Flip analyzer)
│   │   ├── valuations/
│   │   │   ├── new/page.tsx        # Create new valuation
│   │   │   └── [id]/page.tsx       # Edit valuation
│   │   └── settings/page.tsx       # Global settings
│   ├── api/
│   │   ├── auth/                   # Authentication endpoints
│   │   ├── deals/                  # Deal CRUD endpoints
│   │   ├── valuations/             # Valuation CRUD endpoints
│   │   └── settings/               # Settings endpoints
│   ├── globals.css                 # Global styles
│   └── page.tsx                    # Root redirect
├── lib/
│   ├── prisma.ts                   # Prisma client
│   ├── auth.ts                     # Authentication utilities
│   └── calculations.ts             # Financial calculation functions
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Seed data script
├── public/
│   └── bluepeak-logo.svg           # BluePeak logo
├── middleware.ts                   # Route protection
├── .env.example                    # Environment variables template
└── package.json                    # Dependencies
```

## 🎨 Branding

The application uses BluePeak brand colors:
- **Light Blue**: `#0B8BEC`
- **Dark Blue**: `#131836`

Logo: Replace `/public/bluepeak-logo.svg` with your actual logo image.

## 🔐 Authentication

### User Roles

- **ANALYST**: Can create and edit own deals/valuations
- **PARTNER**: Can view and comment on all deals/valuations
- **ADMIN**: Full access including user management and approvals

### Default Users (after seeding)

| Email | Password | Role |
|-------|----------|------|
| admin@bluepeak.pt | admin123 | ADMIN |
| analyst@bluepeak.pt | analyst123 | ANALYST |

⚠️ **Important**: Change these passwords in production!

## 📊 Database Schema

Key models:

- **User**: Authentication and user management
- **Deal**: Fix & flip deal analysis (two scenarios)
- **Valuation**: Property valuation by comparables
- **Comparable**: Individual comparable properties
- **Settings**: Global default values
- **Comment**: Comments on deals/valuations

## 🧮 Calculations

The app implements Portuguese real estate financial calculations:

### Fix & Flip Calculations

- **IMT (Property Transfer Tax)**: Based on VPT and property purpose
- **IS (Stamp Duty)**: 0.8% of max(VPT, purchase price)
- **Financing Costs**: Loan calculations with PMT formula
- **Works Budget**: With VAT (6% for ARU zones, 23% otherwise)
- **Holding Costs**: Monthly costs × retention period + interest
- **Sale Costs**: Agency commission + early repayment penalties
- **Taxes**: IRC (corporate) or IRS (individual) on profits
- **ROI Metrics**: Total ROI, Cash-on-Cash ROI, Annualized ROI

### Valuation Calculations

- **Price per m²**: Asking price / area
- **Adjustments**: Negotiation, area, location, age, condition, other
- **Adjusted Price**: Price/m² × (1 + total adjustment)
- **Averages**: Raw and adjusted price/m²
- **Estimated Value**: Recommended price/m² × target area

## 📝 Usage

### Creating a Fix & Flip Deal

1. Click "New Fix & Flip" in the sidebar
2. Fill in basic information (title, address, city)
3. Enter values for both scenarios:
   - Estimated sale price
   - Purchase price and VPT
   - Works budget
   - Financing terms
   - Holding period and monthly costs
4. Review calculated results
5. Save as draft or submit for review
6. Export PDF report

### Creating a Valuation

1. Click "New Valuation" in the sidebar
2. Enter target property details
3. Add comparable properties
4. Adjust each comparable for differences
5. Review average and recommended price/m²
6. Add benchmark data (Idealista, Casafari, etc.)
7. Save and export PDF

## 🏗️ Production Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET` (32+ characters)
3. Configure production PostgreSQL database
4. Set up SSL for database connection

### Build and Run

```bash
# Build for production
npm run build

# Run production server
npm start
```

### Recommended Hosting

- **Vercel**: Easiest deployment for Next.js
- **Railway**: Good for full-stack apps with database
- **AWS/GCP/Azure**: For enterprise deployments

### Database Backups

Set up automated backups for your PostgreSQL database:

```bash
# Manual backup
pg_dump bluepeak_db > backup_$(date +%Y%m%d).sql

# Restore
psql bluepeak_db < backup_YYYYMMDD.sql
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production server
npm run lint         # Run ESLint
npm run seed         # Seed database with sample data
```

### Database Management

```bash
# Create migration
npx prisma migrate dev --name description

# View database in Prisma Studio
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate
```

### Adding New Features

1. Update Prisma schema if needed
2. Run migration: `npx prisma migrate dev`
3. Generate client: `npx prisma generate`
4. Create API routes in `app/api/`
5. Create UI components in `app/dashboard/`
6. Update types and calculations in `lib/`

## 📚 Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Prisma**: ORM for PostgreSQL
- **Tailwind CSS**: Utility-first CSS
- **Jose**: JWT authentication
- **bcryptjs**: Password hashing
- **jsPDF**: PDF generation
- **date-fns**: Date formatting

## 🐛 Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `.env`
- Ensure database exists: `psql -l`

### Prisma Client Errors

```bash
# Regenerate Prisma client
npx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

- Clear Next.js cache: `rm -rf .next`
- Check all dependencies are installed
- Verify Node.js version (18+)

### Authentication Issues

- Verify JWT_SECRET is set in `.env`
- Clear browser cookies
- Check session expiration (7 days)

## 📄 License

Private internal application for BluePeak Estate & Investments.

## 👥 Support

For issues or questions, contact your development team.

---

**Built with ❤️ for BluePeak Estate & Investments**
