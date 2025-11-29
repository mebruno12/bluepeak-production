# BluePeak Deployment Guide

Complete guide to deploy BluePeak to **bluepeak.pt/calculadora-investimento-imobiliario** using Supabase and Vercel.

---

## 📋 Prerequisites

- GitHub account
- Supabase account (free tier works)
- Vercel account (free tier works)
- Access to bluepeak.pt domain DNS settings

---

## 🗄️ Part 1: Supabase Database Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `bluepeak-production`
   - **Database Password**: Generate a strong password and **SAVE IT SECURELY**
   - **Region**: Choose closest to your users (e.g., `Europe West (Frankfurt)`)
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be created

### Step 2: Get Database Connection Strings

Once your project is ready:

1. Go to **Settings** → **Database** in the left sidebar
2. Scroll down to **Connection string** section
3. **Copy the Connection Pooling URI** (Transaction mode):
   ```
   Format: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
   - Replace `[PASSWORD]` with your database password
   - This is your `DATABASE_URL`

4. **Copy the Direct Connection URI**:
   ```
   Format: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
   - Replace `[PASSWORD]` with your database password
   - This is your `DIRECT_URL` (used for migrations)

### Step 3: Test Local Connection (Optional)

Update your local `.env` file:

```env
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

Test the connection:
```bash
npx prisma db push
```

---

## 🚀 Part 2: Vercel Deployment

### Step 1: Push Code to GitHub

If you haven't already:

```bash
cd /Users/brunosantos/bluepeak-app

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - BluePeak application"

# Create GitHub repository and push
# Go to github.com and create a new repository called "bluepeak-app"
# Then run:
git remote add origin https://github.com/YOUR-USERNAME/bluepeak-app.git
git branch -M main
git push -u origin main
```

### Step 2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. **Import** your GitHub repository (`bluepeak-app`)
4. Click **"Import"**

### Step 3: Configure Environment Variables

Before deploying, add these environment variables:

Click **"Environment Variables"** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `postgresql://postgres.xxxxx:...` | Your Supabase pooling connection string |
| `DIRECT_URL` | `postgresql://postgres.xxxxx:...` | Your Supabase direct connection string |
| `JWT_SECRET` | Generate with `openssl rand -base64 32` | Must be a strong secret |
| `NEXT_PUBLIC_BASE_PATH` | `/calculadora-investimento-imobiliario` | Path for deployment |
| `NODE_ENV` | `production` | Production environment |

**Important**: Make sure to add these for **Production**, **Preview**, and **Development** environments.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (3-5 minutes)
3. Once deployed, you'll get a URL like: `https://bluepeak-app.vercel.app`

### Step 5: Run Database Migrations

After first deployment, you need to run migrations:

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Run migration command
vercel env pull .env.production
npx prisma migrate deploy
```

**Option B: Using Vercel Dashboard**

1. Go to your Vercel project → **Settings** → **Functions**
2. Add a **Deployment Hook** or use Vercel's **Build Command** override:
   ```bash
   npx prisma migrate deploy && npm run build
   ```

### Step 6: Seed the Database (Optional)

Run the seed script to create initial users and sample data:

```bash
# Using your local environment connected to Supabase
npm run seed
```

Or create users manually through the Supabase SQL Editor:

```sql
-- Create admin user (password: admin123)
INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
VALUES (
  'admin-001',
  'Admin User',
  'admin@bluepeak.pt',
  '$2a$10$YourHashedPasswordHere',
  'ADMIN',
  NOW(),
  NOW()
);
```

---

## 🌐 Part 3: Custom Domain Setup (bluepeak.pt)

### Option A: Subdomain Approach (Recommended)

Deploy at: `calculadora.bluepeak.pt`

1. In Vercel project → **Settings** → **Domains**
2. Add domain: `calculadora.bluepeak.pt`
3. Vercel will show DNS records to add
4. In your DNS provider (where bluepeak.pt is hosted):
   - Add a **CNAME** record:
     - **Name**: `calculadora`
     - **Value**: `cname.vercel-dns.com`
     - **TTL**: `3600`

5. Update environment variable in Vercel:
   - Change `NEXT_PUBLIC_BASE_PATH` to empty: `""` (remove the base path)
   - Redeploy

**Access**: `https://calculadora.bluepeak.pt`

### Option B: Path-Based Deployment (Requires Main Site Setup)

Deploy at: `bluepeak.pt/calculadora-investimento-imobiliario`

This requires your main bluepeak.pt website to be configured with rewrites.

**If your main site is on Vercel:**

1. In your main bluepeak.pt project's `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/calculadora-investimento-imobiliario/:path*",
      "destination": "https://bluepeak-app.vercel.app/calculadora-investimento-imobiliario/:path*"
    }
  ]
}
```

**If your main site uses Nginx:**

```nginx
location /calculadora-investimento-imobiliario/ {
    proxy_pass https://bluepeak-app.vercel.app/calculadora-investimento-imobiliario/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Keep** `NEXT_PUBLIC_BASE_PATH=/calculadora-investimento-imobiliario` in Vercel environment variables.

---

## 🔐 Post-Deployment Security

### 1. Change Default Passwords

If you seeded the database, **immediately change** these default passwords:
- `admin@bluepeak.pt` / `admin123`
- `analyst@bluepeak.pt` / `analyst123`

### 2. Enable Row Level Security (RLS) in Supabase (Optional)

For extra security, enable RLS in Supabase:

1. Go to **Authentication** → **Policies** in Supabase
2. Enable RLS for all tables
3. Create policies as needed

### 3. Set Up Automatic Backups

Supabase Pro plan includes daily backups. Free tier backups are available but limited.

For critical data, set up additional backup scripts:

```bash
# Backup script (run daily)
pg_dump $DATABASE_URL > backups/bluepeak_$(date +%Y%m%d).sql
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Application loads at your domain/subdomain
- [ ] Login works with test credentials
- [ ] Dashboard displays correctly
- [ ] Can create new deals
- [ ] Can create new valuations
- [ ] Calculations work correctly
- [ ] PDF export functions
- [ ] Settings page loads
- [ ] Images and assets load properly
- [ ] No console errors in browser
- [ ] Mobile responsive layout works

---

## 🐛 Troubleshooting

### Build Fails on Vercel

**Error: Prisma Client not generated**

Add to `package.json` scripts:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

**Error: Database connection failed**

- Verify `DATABASE_URL` and `DIRECT_URL` are correct
- Check Supabase project is active
- Ensure connection pooling is enabled

### Base Path Issues

**Assets not loading**

Make sure:
- `NEXT_PUBLIC_BASE_PATH` starts with `/` (e.g., `/calculadora-investimento-imobiliario`)
- All internal links use Next.js `<Link>` component (not `<a>` tags)
- Images use Next.js `<Image>` component

**Redirects not working**

Check middleware.ts - it should work with base path automatically.

### Database Migration Issues

**Error: Can't reach database**

Use `DIRECT_URL` for migrations:
```bash
DATABASE_URL=$DIRECT_URL npx prisma migrate deploy
```

### Authentication Issues

**JWT errors**

- Ensure `JWT_SECRET` is the same across all deployments
- Must be at least 32 characters
- Generate new one: `openssl rand -base64 32`

**Users can't login after deployment**

- Verify database was seeded or users were created
- Check password hashing is working
- Verify session cookies are being set (check browser dev tools)

---

## 📊 Monitoring

### Vercel Analytics

Enable in Vercel dashboard:
1. Go to **Analytics** tab
2. Enable **Web Analytics**
3. View metrics: page views, performance, etc.

### Supabase Monitoring

Monitor database health:
1. Supabase Dashboard → **Database** → **Metrics**
2. Watch: Connection count, CPU usage, Memory

### Error Tracking

Consider adding error tracking:
- [Sentry](https://sentry.io) - Error monitoring
- [LogRocket](https://logrocket.com) - Session replay

---

## 🔄 Future Updates

To deploy updates:

```bash
# Make changes to code
git add .
git commit -m "Description of changes"
git push origin main
```

Vercel will automatically deploy the changes.

### Database Schema Updates

When updating the Prisma schema:

```bash
# 1. Create migration locally
npx prisma migrate dev --name description_of_changes

# 2. Commit and push
git add .
git commit -m "Database migration: description"
git push origin main

# 3. Run migration on production
DATABASE_URL=$DIRECT_URL npx prisma migrate deploy
```

---

## 📞 Support

For issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Review browser console for client errors
4. Check Next.js documentation for base path issues

---

## 🎉 Success!

Your BluePeak application should now be live at:
- **Subdomain**: `https://calculadora.bluepeak.pt`
- **Or Path**: `https://bluepeak.pt/calculadora-investimento-imobiliario`

Test it out with the default credentials and start analyzing deals!
