# 🚀 Deploy BluePeak Now - Step by Step

Follow these exact steps to deploy your app in 15 minutes.

---

## ⚠️ FIRST: Reset Your Database Password

You shared your password in chat - reset it now for security:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `kbiwbxoqsdtmaqreiwtw`
3. **Settings** → **Database** → **Reset database password**
4. Generate new password → **Save it securely!**

---

## 📋 Step 1: Get Correct Connection Strings (3 min)

### 1.1 Get DATABASE_URL

1. Still in **Settings** → **Database**
2. Scroll to **Connection string**
3. Click **Transaction** tab
4. Copy the full string - should look like:
   ```
   postgresql://postgres.kbiwbxoqsdtmaqreiwtw:[NEW-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
5. Replace `[NEW-PASSWORD]` with your new password
6. **Save this** - this is `DATABASE_URL`

### 1.2 Get DIRECT_URL

1. Click **Session** tab
2. Copy the full string - should look like:
   ```
   postgresql://postgres.kbiwbxoqsdtmaqreiwtw:[NEW-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```
3. Replace `[NEW-PASSWORD]` with your new password
4. **Save this** - this is `DIRECT_URL`

---

## 🔐 Step 2: Generate JWT Secret (1 min)

Open terminal and run:

```bash
openssl rand -base64 32
```

Copy the output - this is your `JWT_SECRET`

---

## 📝 Step 3: Prepare Your Variables

You should now have these **5 variables**:

```
DATABASE_URL=postgresql://postgres.kbiwbxoqsdtmaqreiwtw:NEW_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.kbiwbxoqsdtmaqreiwtw:NEW_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres

JWT_SECRET=<your-generated-secret>

NEXT_PUBLIC_BASE_PATH=/calculadora-investimento-imobiliario

NODE_ENV=production
```

**Keep these ready** - you'll paste them into Vercel.

---

## 🐙 Step 4: Push to GitHub (3 min)

### 4.1 Initialize Git

```bash
cd /Users/brunosantos/bluepeak-app

# Check if git is already initialized
git status
```

If you see "not a git repository":

```bash
git init
git add .
git commit -m "Initial commit - BluePeak calculator"
```

### 4.2 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `bluepeak-app`
3. **Private** (recommended)
4. **Do NOT** initialize with README (we already have code)
5. Click **Create repository**

### 4.3 Push Code

GitHub will show you commands. Run them:

```bash
git remote add origin https://github.com/YOUR-USERNAME/bluepeak-app.git
git branch -M main
git push -u origin main
```

You'll be asked for credentials:
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your password)
  - If you don't have one: [github.com/settings/tokens](https://github.com/settings/tokens) → Generate new token (classic) → Select "repo" scope

---

## ▲ Step 5: Deploy on Vercel (5 min)

### 5.1 Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub
3. Click **Import** next to your `bluepeak-app` repository
4. Click **Import** again

### 5.2 Configure Project

**Do NOT click Deploy yet!**

1. Expand **Environment Variables**
2. Add each of your 5 variables:

Click **Add** and enter:

**Variable 1:**
- Key: `DATABASE_URL`
- Value: `postgresql://postgres.kbiwbxoqsdtmaqreiwtw:YOUR_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

**Variable 2:**
- Key: `DIRECT_URL`
- Value: `postgresql://postgres.kbiwbxoqsdtmaqreiwtw:YOUR_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`

**Variable 3:**
- Key: `JWT_SECRET`
- Value: `<your-generated-secret>`

**Variable 4:**
- Key: `NEXT_PUBLIC_BASE_PATH`
- Value: `/calculadora-investimento-imobiliario`

**Variable 5:**
- Key: `NODE_ENV`
- Value: `production`

3. Click **Deploy**

### 5.3 Wait for Build

This takes 3-5 minutes. You'll see:
- ✓ Building
- ✓ Deploying
- ✓ Assigning domain

---

## 🗄️ Step 6: Run Database Migrations (2 min)

Once deployed, you need to set up the database.

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project (select the bluepeak-app project)
vercel link

# Run migrations
npx prisma migrate deploy
```

### Option B: Using Local Terminal

```bash
cd /Users/brunosantos/bluepeak-app

# Set environment variable temporarily
DATABASE_URL="postgresql://postgres.kbiwbxoqsdtmaqreiwtw:YOUR_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres" npx prisma migrate deploy
```

---

## 🌱 Step 7: Seed Database (1 min)

Create initial users and sample data:

```bash
# Update your local .env with new Supabase credentials
# Then run:
npm run seed
```

This creates:
- Admin: `admin@bluepeak.pt` / `admin123`
- Analyst: `analyst@bluepeak.pt` / `analyst123`

**⚠️ Change these passwords after first login!**

---

## ✅ Step 8: Test Your Deployment

1. Go to your Vercel dashboard
2. Click on your deployment URL (something like `bluepeak-app.vercel.app`)
3. You should see the login page
4. Login with: `admin@bluepeak.pt` / `admin123`
5. Test creating a deal
6. Test calculations

---

## 🌐 Optional: Custom Domain

### For Subdomain: calculadora.bluepeak.pt

1. In Vercel: **Settings** → **Domains**
2. Add: `calculadora.bluepeak.pt`
3. Vercel shows DNS records to add
4. In your DNS provider (where bluepeak.pt is hosted):
   - Add CNAME record:
     - Name: `calculadora`
     - Value: `cname.vercel-dns.com`
     - TTL: 3600
5. Wait 5-10 minutes for DNS propagation
6. Update environment variable in Vercel:
   - Change `NEXT_PUBLIC_BASE_PATH` to empty: `""`
   - Redeploy (Vercel → Deployments → Three dots → Redeploy)

**Access at**: `https://calculadora.bluepeak.pt`

---

## 🎉 You're Live!

Your app should now be running at:
- Temporary: `https://bluepeak-app.vercel.app`
- Custom: `https://calculadora.bluepeak.pt` (if you set it up)

---

## 🔒 Post-Deployment Security

**Do these NOW**:

1. **Change default passwords**:
   - Login to app
   - Change password for `admin@bluepeak.pt`
   - Change password for `analyst@bluepeak.pt`

2. **Verify environment variables are secret**:
   - Check `.env` is in `.gitignore` ✓
   - Never share credentials again in chat/email

---

## 🐛 If Something Goes Wrong

### Build Failed

Check Vercel logs:
1. Vercel Dashboard → Your Project → Deployments
2. Click failed deployment
3. Check logs

Common fixes:
- Missing environment variable
- Database connection string wrong
- Run `npx prisma generate` locally first

### Can't Login

- Check database migrations ran: `npx prisma migrate deploy`
- Check database was seeded: `npm run seed`
- Verify `JWT_SECRET` is set in Vercel

### Database Connection Error

- Verify `DATABASE_URL` has port **6543** and ends with `?pgbouncer=true`
- Verify `DIRECT_URL` has port **5432**
- Check Supabase project is active
- Verify password is correct

---

## 📞 Need Help?

1. Check Vercel deployment logs
2. Check browser console for errors
3. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting
4. Check [SUPABASE-SETUP.md](./SUPABASE-SETUP.md) for database issues

---

## 🎯 Quick Summary

1. ✅ Reset Supabase password (security)
2. ✅ Get correct DATABASE_URL (Transaction, port 6543)
3. ✅ Get correct DIRECT_URL (Session, port 5432)
4. ✅ Generate JWT_SECRET
5. ✅ Push code to GitHub
6. ✅ Deploy on Vercel with environment variables
7. ✅ Run database migrations
8. ✅ Seed database
9. ✅ Test and change passwords
10. ✅ (Optional) Set up custom domain

**Time**: ~15 minutes

**Cost**: $0 (free tier)

**Result**: Live app analyzing Portuguese real estate deals! 🏠

---

Good luck! 🚀
