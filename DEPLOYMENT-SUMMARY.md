# 🎉 BluePeak Deployment Configuration Complete!

Your application is now ready to deploy to **Supabase + Vercel** at `bluepeak.pt/calculadora-investimento-imobiliario`.

---

## ✅ What's Been Configured

### 1. **Next.js Configuration** (`next.config.ts`)
- ✅ Base path support for `/calculadora-investimento-imobiliario`
- ✅ Asset prefix configuration
- ✅ Standalone output for optimized Vercel builds
- ✅ Configurable via `NEXT_PUBLIC_BASE_PATH` environment variable

### 2. **Database Configuration**
- ✅ Prisma schema updated for Supabase
- ✅ Connection pooling support (`DATABASE_URL`)
- ✅ Direct connection for migrations (`DIRECT_URL`)
- ✅ Ready for Supabase PostgreSQL

### 3. **Build Configuration**
- ✅ `postinstall` script added for Prisma client generation
- ✅ `vercel.json` created with build settings
- ✅ Environment variables configured
- ✅ Optimized for Vercel deployment

### 4. **Environment Setup**
- ✅ `.env.example` updated with Supabase connection strings
- ✅ JWT secret configuration
- ✅ Base path environment variable
- ✅ `.gitignore` updated (keeps `.env.example`, ignores `.env`)

### 5. **Documentation Created**
- ✅ **QUICK-DEPLOY.md** - 15-minute deployment guide
- ✅ **DEPLOYMENT.md** - Comprehensive deployment documentation
- ✅ **PRE-DEPLOY-CHECKLIST.md** - Pre-flight verification
- ✅ **README.md** - Updated with deployment links

---

## 🚀 Your Next Steps

### Option 1: Quick Deploy (Recommended - 15 mins)

Follow **[QUICK-DEPLOY.md](./QUICK-DEPLOY.md)**:

1. Create Supabase project (5 min)
2. Push to GitHub (2 min)
3. Deploy on Vercel (5 min)
4. Run migrations (2 min)
5. Seed database (1 min)

### Option 2: Detailed Deploy

Follow **[DEPLOYMENT.md](./DEPLOYMENT.md)** for step-by-step instructions with troubleshooting.

### Option 3: Checklist First

Review **[PRE-DEPLOY-CHECKLIST.md](./PRE-DEPLOY-CHECKLIST.md)** to ensure everything is ready.

---

## 🎯 Deployment Locations

You have **TWO options** for where to deploy:

### Option A: Subdomain (Recommended ⭐)

**URL**: `https://calculadora.bluepeak.pt`

**Why recommended:**
- Simpler setup
- No proxy configuration needed
- Better SEO
- Easier to manage

**Setup:**
1. Set `NEXT_PUBLIC_BASE_PATH=""` (empty) in Vercel
2. Add CNAME in DNS: `calculadora` → `cname.vercel-dns.com`

---

### Option B: Path-based

**URL**: `https://bluepeak.pt/calculadora-investimento-imobiliario`

**When to use:**
- You want all BluePeak tools under one domain
- Your main site can proxy requests
- You prefer path-based organization

**Setup:**
1. Keep `NEXT_PUBLIC_BASE_PATH="/calculadora-investimento-imobiliario"` in Vercel
2. Configure proxy/rewrite on main bluepeak.pt site

---

## 📋 Required Accounts

Make sure you have:

- [ ] **Supabase Account** - [supabase.com](https://supabase.com) (Free tier OK)
- [ ] **Vercel Account** - [vercel.com](https://vercel.com) (Free tier OK)
- [ ] **GitHub Account** - [github.com](https://github.com) (Free)
- [ ] **Access to bluepeak.pt DNS** (for custom domain)

---

## 🔑 Important Information to Gather

Before deploying, you'll need:

### From Supabase:
- [ ] `DATABASE_URL` (Transaction mode - Port 6543)
- [ ] `DIRECT_URL` (Session mode - Port 5432)
- [ ] Database password (save securely!)

**See**: [SUPABASE-SETUP.md](./SUPABASE-SETUP.md) for detailed instructions

### Generate Locally:
- [ ] `JWT_SECRET` - Run: `openssl rand -base64 32`

### From Domain:
- [ ] DNS provider login (for adding CNAME record)

---

## 💰 Cost Estimate

**Total Monthly Cost: $0** (Free tier)

| Service | Plan | Cost |
|---------|------|------|
| Supabase | Free | $0/mo (up to 500MB DB) |
| Vercel | Hobby | $0/mo (unlimited personal projects) |
| **TOTAL** | | **$0/mo** 🎉 |

Upgrade options:
- Supabase Pro: $25/mo (for more storage, backups)
- Vercel Pro: $20/mo (for team features, analytics)

---

## 🛠️ Deployment Workflow

```
1. Create Supabase Project
   ↓
2. Get connection strings
   ↓
3. Push code to GitHub
   ↓
4. Import to Vercel
   ↓
5. Add environment variables
   ↓
6. Deploy (automatic)
   ↓
7. Run database migrations
   ↓
8. Seed database
   ↓
9. Configure custom domain (optional)
   ↓
10. Test & verify
    ↓
11. Change default passwords
    ↓
12. GO LIVE! 🚀
```

---

## 🧪 Testing After Deployment

Once deployed, test these features:

- [ ] Login with default credentials
- [ ] Create new deal
- [ ] Edit deal - verify calculations work
- [ ] Create new valuation
- [ ] Edit valuation - add comparables
- [ ] Export deal to PDF
- [ ] Export valuation to PDF
- [ ] Update settings
- [ ] Test on mobile device
- [ ] Test all two scenarios in deals
- [ ] Verify Portuguese tax calculations (IMT, IS)

---

## 🔒 Security Reminders

**IMMEDIATELY after deployment:**

1. **Change default passwords**:
   - `admin@bluepeak.pt` / `admin123` → Change!
   - `analyst@bluepeak.pt` / `analyst123` → Change!

2. **Verify environment variables**:
   - JWT_SECRET is strong (32+ chars)
   - Database password is strong
   - No secrets in code/git

3. **Check access**:
   - Only authorized users have login credentials
   - Vercel project is private
   - Supabase project is secure

---

## 📞 Support Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)

### Troubleshooting
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
- Review Vercel deployment logs
- Check Supabase database logs
- Browser console for frontend errors

---

## 🎯 Quick Command Reference

```bash
# Generate JWT secret
openssl rand -base64 32

# Install Vercel CLI
npm i -g vercel

# Run migrations on production
DATABASE_URL="your-direct-url" npx prisma migrate deploy

# Seed database
npm run seed

# Test build locally
npm run build
npm start

# View Prisma Studio
npx prisma studio
```

---

## ✨ You're Ready!

Everything is configured and ready to deploy. Choose your deployment path:

1. 🚀 **Fast Track**: [QUICK-DEPLOY.md](./QUICK-DEPLOY.md)
2. 📖 **Detailed Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
3. ✅ **Checklist First**: [PRE-DEPLOY-CHECKLIST.md](./PRE-DEPLOY-CHECKLIST.md)

**Estimated time to deploy**: 15-30 minutes

**Have questions?** Check the troubleshooting sections in the deployment guides.

---

**Good luck with your deployment! 🎉**

---

## 📊 After Deployment

Once live, you can:

1. **Share with your team** - Provide login credentials securely
2. **Start analyzing deals** - Use the Fix & Flip analyzer
3. **Create valuations** - Analyze properties with comparables
4. **Export reports** - Generate professional PDF reports
5. **Customize settings** - Set your default values

---

**Need to update after deployment?**

Just push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically redeploy! 🚀
