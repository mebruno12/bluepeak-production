# 🗄️ Supabase Database Setup Guide (2024)

Step-by-step guide to set up your PostgreSQL database on Supabase for BluePeak.

---

## 📋 What You Need

We only need **PostgreSQL connection strings** from Supabase. We're using:
- ✅ Prisma for database access (not Supabase client)
- ✅ Our own JWT authentication (not Supabase Auth)
- ✅ PostgreSQL database only

**You do NOT need**: Supabase API keys, anon keys, or service role keys for this app.

---

## 🚀 Step 1: Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Organization**: Select or create one
   - **Name**: `bluepeak-production` (or your preferred name)
   - **Database Password**: Click "Generate a password" and **SAVE IT SECURELY**
     - ⚠️ You'll need this password for connection strings!
     - Store it in a password manager
   - **Region**: Choose closest to your users
     - Europe: `Europe West (Ireland)` or `Europe Central (Frankfurt)`
     - USA: `East US (North Virginia)`
   - **Pricing Plan**: Free (sufficient for starting)

4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

---

## 🔌 Step 2: Get PostgreSQL Connection Strings

Once your project is ready:

### **Navigate to Connection Strings**

1. In Supabase Dashboard, click your project
2. Go to **Project Settings** (gear icon in bottom left)
3. Click **Database** in the left sidebar
4. Scroll down to **Connection string** section

### **Get DATABASE_URL (Transaction Mode)**

This is for your application (Vercel, serverless environments).

1. In the **Connection string** section, select **Transaction** tab
2. Copy the connection string - it looks like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
3. Replace `[YOUR-PASSWORD]` with your actual database password
4. Notice the port: **6543** (Transaction mode)
5. This is your **DATABASE_URL**

**Example:**
```
DATABASE_URL="postgresql://postgres.abcdefghijk:MySecurePass123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### **Get DIRECT_URL (Session Mode)**

This is for running database migrations.

1. In the same **Connection string** section, select **Session** tab
2. Copy the connection string - it looks like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```
3. Replace `[YOUR-PASSWORD]` with your actual database password
4. Notice the port: **5432** (Session mode)
5. This is your **DIRECT_URL**

**Example:**
```
DIRECT_URL="postgresql://postgres.abcdefghijk:MySecurePass123@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
```

### **Important Differences**

| Mode | Port | Use For | Variable Name |
|------|------|---------|---------------|
| **Transaction** | 6543 | App runtime (Vercel) | `DATABASE_URL` |
| **Session** | 5432 | Migrations | `DIRECT_URL` |

---

## 📝 Step 3: Update Environment Variables

### **For Local Development**

Update your `.env` file:

```bash
# Copy .env.example to .env
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres.YOUR-REF:YOUR-PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres.YOUR-REF:YOUR-PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"

JWT_SECRET="your-generated-secret-here"
```

### **For Vercel (Production)**

When deploying, add these to Vercel environment variables:

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add:
   - `DATABASE_URL` = Transaction mode connection string (port 6543)
   - `DIRECT_URL` = Session mode connection string (port 5432)
   - `JWT_SECRET` = Generated secret (`openssl rand -base64 32`)
   - `NEXT_PUBLIC_BASE_PATH` = `/calculadora-investimento-imobiliario`
   - `NODE_ENV` = `production`

---

## ✅ Step 4: Test Connection

Test your connection strings locally:

```bash
# Test that Prisma can connect
npx prisma db push
```

If successful, you'll see:
```
✔ Generated Prisma Client
✔ Your database is now in sync with your schema
```

If it fails:
- ✗ Check password is correct
- ✗ Check connection string format
- ✗ Verify Supabase project is active
- ✗ Check your IP isn't blocked (Supabase allows all by default)

---

## 🔐 Security Best Practices

### **Database Password**
- ✅ Use the generated password (strong, random)
- ✅ Store in password manager
- ✅ Never commit to git
- ✅ Different passwords for dev/production

### **Connection Strings**
- ✅ Keep in `.env` (gitignored)
- ✅ Never commit to code
- ✅ Use environment variables in production

### **Supabase Dashboard Access**
- ✅ Enable 2FA on your Supabase account
- ✅ Use strong password
- ✅ Limit team access

---

## 📊 Understanding Supabase Connection Modes

Supabase provides different connection modes for different use cases:

### **1. Transaction Mode (Port 6543)** ← Use for DATABASE_URL
- **Purpose**: Serverless applications (Vercel, AWS Lambda, etc.)
- **Connection Pooling**: Yes (PgBouncer)
- **Max Connections**: Handles many concurrent connections
- **Limitations**:
  - No prepared statements
  - No listening for notifications
  - Some PostgreSQL features limited
- **Best For**: Next.js API routes, Prisma queries from Vercel

### **2. Session Mode (Port 5432)** ← Use for DIRECT_URL
- **Purpose**: Long-lived connections, migrations, admin tasks
- **Connection Pooling**: Yes (with connection limits)
- **Max Connections**: Limited (based on plan)
- **Limitations**: Connection limit on free tier
- **Best For**: Running Prisma migrations, database admin

### **When to Use Each**

| Task | Use |
|------|-----|
| Vercel/Production queries | Transaction (6543) |
| Local development | Either (Session recommended) |
| Running migrations | Session (5432) |
| Database admin (Prisma Studio) | Session (5432) |

---

## 🔧 Troubleshooting

### **Error: Connection timeout**

**Problem**: Can't connect to database

**Solutions**:
1. Check Supabase project is active (not paused)
2. Verify connection string is correct
3. Check password has no special characters that need escaping
4. Try Session mode (port 5432) instead

### **Error: Too many connections**

**Problem**: Free tier connection limit reached

**Solutions**:
1. Use Transaction mode (port 6543) - better pooling
2. Close Prisma Studio when not using
3. Check for connection leaks in code
4. Upgrade Supabase plan if needed

### **Error: Password authentication failed**

**Problem**: Wrong password in connection string

**Solutions**:
1. Reset password in Supabase: Settings → Database → Reset database password
2. Update all connection strings with new password
3. Check for URL encoding issues (special characters)

### **Error: Role "postgres.xxxxx" does not exist**

**Problem**: Wrong connection string format

**Solutions**:
1. Verify you copied the FULL connection string from Supabase
2. Don't manually construct it - copy from dashboard
3. Check the format matches examples above

---

## 📱 Supabase Dashboard Features

While we're only using the PostgreSQL database, Supabase provides:

### **Table Editor**
- View/edit data directly in browser
- Useful for checking seeded data
- Access: Dashboard → Table Editor

### **SQL Editor**
- Run SQL queries
- Useful for manual data fixes
- Access: Dashboard → SQL Editor

### **Database Backups** (Pro plan)
- Automatic daily backups
- Point-in-time recovery
- Free tier: Manual backups only

### **Logs**
- View database query logs
- Monitor slow queries
- Access: Dashboard → Logs

---

## 🎯 Quick Reference

### **What You Need for BluePeak**

```env
# Transaction mode (port 6543) - for app
DATABASE_URL="postgresql://postgres.XXX:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Session mode (port 5432) - for migrations
DIRECT_URL="postgresql://postgres.XXX:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"

# JWT secret (generate yourself)
JWT_SECRET="<run: openssl rand -base64 32>"
```

### **What You DON'T Need**

- ❌ Supabase Anon Key (not using Supabase Auth)
- ❌ Supabase Service Role Key (not using Supabase client)
- ❌ Supabase Project URL/API URL (using direct PostgreSQL)

---

## 🔄 Next Steps

Once you have your connection strings:

1. ✅ Update `.env` locally
2. ✅ Test connection: `npx prisma db push`
3. ✅ Run migrations: `npx prisma migrate dev`
4. ✅ Seed database: `npm run seed`
5. ✅ Add to Vercel environment variables (when deploying)

Continue with: **[QUICK-DEPLOY.md](./QUICK-DEPLOY.md)** Step 3

---

## 💰 Pricing Notes

**Free Tier Includes:**
- 500 MB database
- Unlimited API requests
- 1 GB file storage
- 2 GB bandwidth
- 7-day log retention

**When to Upgrade** ($25/mo Pro):
- Need >500 MB database
- Want daily backups
- Need more connections
- Production workload

For BluePeak's use case, **Free tier is sufficient** for initial deployment and testing.

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] Database password saved securely
- [ ] Transaction mode connection string copied (DATABASE_URL)
- [ ] Session mode connection string copied (DIRECT_URL)
- [ ] Passwords replaced in connection strings
- [ ] Connection tested locally
- [ ] Environment variables documented for Vercel

**You're ready to deploy!** 🚀
