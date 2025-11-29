# 📋 Pre-Deployment Checklist

Complete this checklist before deploying BluePeak to production.

---

## ✅ Code Ready

- [ ] All features tested locally
- [ ] No console errors in browser
- [ ] Calculations verified against Excel sheets
- [ ] PDF exports working
- [ ] Mobile responsive design tested
- [ ] All TODO comments addressed

---

## ✅ Environment Setup

- [ ] Supabase project created
- [ ] Database connection strings obtained:
  - [ ] `DATABASE_URL` (pooling connection)
  - [ ] `DIRECT_URL` (direct connection)
- [ ] Strong `JWT_SECRET` generated (`openssl rand -base64 32`)
- [ ] Environment variables documented

---

## ✅ Git & GitHub

- [ ] Code committed to git
- [ ] GitHub repository created
- [ ] All sensitive files in `.gitignore`:
  - [ ] `.env`
  - [ ] `.env.local`
  - [ ] `.env.production`
- [ ] `.env.example` updated with all required variables
- [ ] Code pushed to GitHub

---

## ✅ Vercel Configuration

- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Environment variables added:
  - [ ] `DATABASE_URL`
  - [ ] `DIRECT_URL`
  - [ ] `JWT_SECRET`
  - [ ] `NEXT_PUBLIC_BASE_PATH`
  - [ ] `NODE_ENV=production`
- [ ] Variables set for all environments (Production, Preview, Development)

---

## ✅ Database

- [ ] Migrations ready (`npx prisma migrate dev`)
- [ ] Migrations will be run on production (`npx prisma migrate deploy`)
- [ ] Seed script tested locally
- [ ] Backup plan in place

---

## ✅ Domain Configuration

Choose ONE option:

### Option A: Subdomain (Recommended)
- [ ] DNS access to bluepeak.pt
- [ ] Subdomain chosen: `calculadora.bluepeak.pt`
- [ ] CNAME record ready to add
- [ ] `NEXT_PUBLIC_BASE_PATH` will be set to `""` (empty)

### Option B: Path-based
- [ ] Main bluepeak.pt website supports proxying/rewrites
- [ ] Proxy configuration prepared
- [ ] `NEXT_PUBLIC_BASE_PATH` set to `/calculadora-investimento-imobiliario`

---

## ✅ Security

- [ ] Strong database password (20+ characters)
- [ ] Strong JWT secret (32+ characters, random)
- [ ] Default user passwords documented for changing after deployment
- [ ] SSL/HTTPS will be enabled (automatic on Vercel)
- [ ] No secrets in code or git history

---

## ✅ Testing Plan

- [ ] Test credentials prepared
- [ ] List of features to verify post-deployment
- [ ] Rollback plan if issues occur

---

## ✅ Documentation

- [ ] Team informed about deployment
- [ ] Login credentials shared securely
- [ ] User guide prepared (if needed)
- [ ] Support plan in place

---

## ✅ Post-Deployment Actions

Plan to do immediately after deployment:

- [ ] Run database migrations
- [ ] Seed database with users
- [ ] Test login with default credentials
- [ ] Change default passwords:
  - [ ] admin@bluepeak.pt
  - [ ] analyst@bluepeak.pt
- [ ] Create real admin users
- [ ] Delete/disable default users (optional)
- [ ] Verify all features work
- [ ] Test PDF exports
- [ ] Test calculations
- [ ] Monitor Vercel logs for errors
- [ ] Monitor Supabase database connections

---

## ✅ Monitoring Setup

- [ ] Vercel Analytics enabled (optional)
- [ ] Error tracking configured (Sentry, etc.) (optional)
- [ ] Database monitoring configured
- [ ] Uptime monitoring setup (optional)

---

## 🎯 Deployment Day

**Timing**: Choose a time when:
- [ ] You have 1-2 hours available
- [ ] Team members are available for testing
- [ ] Not Friday afternoon (in case issues need fixing)

**Communication**:
- [ ] Team notified of deployment window
- [ ] Status updates prepared (Slack/Email/etc.)

---

## 🆘 Emergency Contacts

Document who to contact if:
- DNS issues: ____________________
- Vercel issues: ____________________
- Database issues: ____________________
- Code issues: ____________________

---

## 📝 Deployment Log

Use this to track your deployment:

```
Date: _______________
Time Started: _______________

Checklist Completed: [ ]
Supabase Project ID: _______________
Vercel Project URL: _______________
Final Domain: _______________

Issues Encountered:
1. _____________________
2. _____________________

Resolution:
1. _____________________
2. _____________________

Time Completed: _______________
Status: [ ] Success [ ] Partial [ ] Failed

Notes:
_____________________
_____________________
_____________________
```

---

## ✅ Ready to Deploy?

If all items are checked, you're ready! Follow either:
- **QUICK-DEPLOY.md** for step-by-step fast track
- **DEPLOYMENT.md** for detailed instructions

---

Good luck! 🚀
