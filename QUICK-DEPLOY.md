# ⚡ Quick Deploy Checklist

Fast track deployment guide for BluePeak to Vercel + Supabase.

---

## 🎯 Step-by-Step (15 minutes)

### 1️⃣ Supabase Setup (5 min)

1. **Create project**: [supabase.com/dashboard](https://supabase.com/dashboard) → New Project
   - Name: `bluepeak-production`
   - Password: **Save this!**
   - Region: `Europe West (Frankfurt)`

2. **Get connection strings**: Settings → Database → Connection String
   - Copy **"Transaction"** pooling URI → This is `DATABASE_URL`
   - Copy **"Direct"** connection URI → This is `DIRECT_URL`

   Example:
   ```
   DATABASE_URL="postgresql://postgres.abc123:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.abc123:PASSWORD@db.abc123.supabase.co:5432/postgres"
   ```

---

### 2️⃣ GitHub Setup (2 min)

```bash
cd /Users/brunosantos/bluepeak-app

# Initialize and push
git init
git add .
git commit -m "Initial commit"

# Create repo on github.com, then:
git remote add origin https://github.com/YOUR-USERNAME/bluepeak-app.git
git branch -M main
git push -u origin main
```

---

### 3️⃣ Vercel Deployment (5 min)

1. **Import**: [vercel.com/new](https://vercel.com/new) → Import your GitHub repo

2. **Environment Variables**: Add these **BEFORE** deploying:

```env
DATABASE_URL=postgresql://postgres.abc123:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.abc123:PASSWORD@db.abc123.supabase.co:5432/postgres

JWT_SECRET=<run: openssl rand -base64 32>

NEXT_PUBLIC_BASE_PATH=/calculadora-investimento-imobiliario

NODE_ENV=production
```

3. **Deploy**: Click "Deploy" button

---

### 4️⃣ Run Migrations (2 min)

**Option A - Vercel CLI:**
```bash
npm i -g vercel
vercel login
vercel link
npx prisma migrate deploy
```

**Option B - Local:**
```bash
# Copy DIRECT_URL from Vercel env vars
DATABASE_URL="<your-DIRECT_URL>" npx prisma migrate deploy
```

---

### 5️⃣ Seed Database (1 min)

```bash
# Update local .env with Supabase URLs
npm run seed
```

This creates:
- Admin: `admin@bluepeak.pt` / `admin123` ⚠️ Change password after first login!
- Analyst: `analyst@bluepeak.pt` / `analyst123`

---

### 6️⃣ Custom Domain (Optional)

**Subdomain Approach** (Recommended):

1. Vercel: Settings → Domains → Add `calculadora.bluepeak.pt`
2. Your DNS: Add CNAME record:
   - Name: `calculadora`
   - Value: `cname.vercel-dns.com`
3. Vercel env: Change `NEXT_PUBLIC_BASE_PATH` to `""` (empty)
4. Redeploy

**Result**: `https://calculadora.bluepeak.pt`

---

**Path Approach** (Advanced):

Keep `NEXT_PUBLIC_BASE_PATH=/calculadora-investimento-imobiliario`

Configure main bluepeak.pt to proxy:
```json
// vercel.json on main site
{
  "rewrites": [{
    "source": "/calculadora-investimento-imobiliario/:path*",
    "destination": "https://bluepeak-app.vercel.app/calculadora-investimento-imobiliario/:path*"
  }]
}
```

**Result**: `https://bluepeak.pt/calculadora-investimento-imobiliario`

---

## ✅ Verify Deployment

Test at your Vercel URL (e.g., `bluepeak-app.vercel.app`):

- [ ] Login works
- [ ] Dashboard loads
- [ ] Create deal works
- [ ] Create valuation works
- [ ] PDF export works

---

## 🔒 Security Checklist

- [ ] Change default passwords (`admin@bluepeak.pt`, `analyst@bluepeak.pt`)
- [ ] JWT_SECRET is strong (32+ chars)
- [ ] Database password is strong
- [ ] `.env` files are in `.gitignore`
- [ ] SSL/HTTPS is enabled (automatic on Vercel)

---

## 🐛 Quick Fixes

**Build fails?**
```bash
# Add to package.json
"postinstall": "prisma generate"
```

**Can't connect to DB?**
- Check DATABASE_URL is correct (copy-paste from Supabase)
- Use DIRECT_URL for migrations

**Assets not loading?**
- Verify NEXT_PUBLIC_BASE_PATH is set correctly
- Check all images use Next.js Image component

**JWT errors?**
- Regenerate: `openssl rand -base64 32`
- Update in Vercel env vars
- Redeploy

---

## 📊 Cost Estimate

- **Supabase**: Free (up to 500MB database)
- **Vercel**: Free (hobby plan - unlimited personal projects)
- **Total**: $0/month 🎉

Upgrade if you need:
- More database storage → Supabase Pro ($25/mo)
- Team collaboration → Vercel Pro ($20/mo)

---

## 🚀 You're Live!

Your BluePeak calculator is now deployed and ready to analyze Portuguese real estate deals!

**Next steps:**
1. Share URL with team
2. Add your actual BluePeak logo (replace `/public/bluepeak-logo.svg`)
3. Customize default values in Settings
4. Start analyzing deals!

**Need help?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting.
