# 🔑 Environment Variables Guide

Quick reference for all environment variables needed for BluePeak deployment.

---

## 📋 Required Variables

You need **5 environment variables** total:

| Variable | Where to Get It | Example |
|----------|----------------|---------|
| `DATABASE_URL` | Supabase (Transaction mode) | `postgresql://postgres.xxx:pass@...pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase (Session mode) | `postgresql://postgres.xxx:pass@...pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | Generate yourself | Run: `openssl rand -base64 32` |
| `NEXT_PUBLIC_BASE_PATH` | Set based on deployment | `/calculadora-investimento-imobiliario` or `""` |
| `NODE_ENV` | Set to production | `production` |

---

## 🗄️ Supabase Connection Strings

### Where to Find Them

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. **Project Settings** (gear icon) → **Database**
4. Scroll to **Connection string** section

### DATABASE_URL (Transaction Mode)

- **Tab**: Transaction
- **Port**: 6543
- **Use for**: Application runtime (Vercel)
- **Format**:
  ```
  postgresql://postgres.xxxxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
  ```

**Example**:
```env
DATABASE_URL="postgresql://postgres.abcdefg123:MyPassword123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### DIRECT_URL (Session Mode)

- **Tab**: Session
- **Port**: 5432
- **Use for**: Database migrations
- **Format**:
  ```
  postgresql://postgres.xxxxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
  ```

**Example**:
```env
DIRECT_URL="postgresql://postgres.abcdefg123:MyPassword123@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
```

**⚠️ Important**: Replace `[PASSWORD]` with your actual Supabase database password!

---

## 🔐 JWT Secret

### Generate It

Run this command:
```bash
openssl rand -base64 32
```

Output example:
```
xK8vN2mP9qR4sT6uV8wX0yZ1aB3cD5eF7gH9iJ0kL2mN4oP6qR8sT0uV2wX4yZ6a
```

### Use It

```env
JWT_SECRET="xK8vN2mP9qR4sT6uV8wX0yZ1aB3cD5eF7gH9iJ0kL2mN4oP6qR8sT0uV2wX4yZ6a"
```

**Requirements**:
- ✅ At least 32 characters
- ✅ Random (use the generator above)
- ✅ Different for dev/production
- ✅ Keep secret (never commit to git)

---

## 🌐 Base Path Configuration

### Option A: Subdomain Deployment (Recommended)

**URL**: `https://calculadora.bluepeak.pt`

```env
NEXT_PUBLIC_BASE_PATH=""
```

Leave **empty** for subdomain deployment.

### Option B: Path-based Deployment

**URL**: `https://bluepeak.pt/calculadora-investimento-imobiliario`

```env
NEXT_PUBLIC_BASE_PATH="/calculadora-investimento-imobiliario"
```

**Note**: Must start with `/`, no trailing slash.

---

## 📝 Complete .env File Examples

### Local Development

```env
# Database - Supabase
DATABASE_URL="postgresql://postgres.abcdefg:MyPass123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.abcdefg:MyPass123@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# Authentication
JWT_SECRET="xK8vN2mP9qR4sT6uV8wX0yZ1aB3cD5eF7gH9iJ0kL2mN4oP6qR8sT0uV2wX4yZ6a"

# Base path (empty for local dev)
NEXT_PUBLIC_BASE_PATH=""

# Environment
NODE_ENV="development"
```

### Vercel Production (Subdomain)

Add these in Vercel → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://postgres.abcdefg:MyPass123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.abcdefg:MyPass123@aws-0-eu-central-1.pooler.supabase.com:5432/postgres

JWT_SECRET=xK8vN2mP9qR4sT6uV8wX0yZ1aB3cD5eF7gH9iJ0kL2mN4oP6qR8sT0uV2wX4yZ6a

NEXT_PUBLIC_BASE_PATH=

NODE_ENV=production
```

**Note**: Leave `NEXT_PUBLIC_BASE_PATH` empty (no value) for subdomain.

### Vercel Production (Path-based)

```env
DATABASE_URL=postgresql://postgres.abcdefg:MyPass123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.abcdefg:MyPass123@aws-0-eu-central-1.pooler.supabase.com:5432/postgres

JWT_SECRET=xK8vN2mP9qR4sT6uV8wX0yZ1aB3cD5eF7gH9iJ0kL2mN4oP6qR8sT0uV2wX4yZ6a

NEXT_PUBLIC_BASE_PATH=/calculadora-investimento-imobiliario

NODE_ENV=production
```

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] `DATABASE_URL` has port **6543** and ends with `?pgbouncer=true`
- [ ] `DIRECT_URL` has port **5432**
- [ ] Both use same password from Supabase
- [ ] `JWT_SECRET` is at least 32 characters
- [ ] `JWT_SECRET` is different from any dev/test secrets
- [ ] `NEXT_PUBLIC_BASE_PATH` matches your deployment choice
- [ ] `NODE_ENV` is set to `production`
- [ ] All secrets are NOT in git (check `.gitignore`)

---

## 🔒 Security Best Practices

### Do's ✅
- ✅ Use strong, generated secrets
- ✅ Different secrets for dev/staging/production
- ✅ Store in `.env` (gitignored)
- ✅ Add to Vercel environment variables
- ✅ Use password manager for backups

### Don'ts ❌
- ❌ Commit `.env` to git
- ❌ Share secrets in Slack/email
- ❌ Use weak or predictable secrets
- ❌ Reuse secrets across projects
- ❌ Include secrets in code

---

## 🐛 Common Issues

### "Connection timeout" or "Can't reach database"

**Problem**: Wrong `DATABASE_URL`

**Fix**:
1. Verify you copied from **Transaction** tab
2. Check port is **6543**
3. Verify password is correct
4. Ensure `?pgbouncer=true` at the end

### "Too many connections"

**Problem**: Using Session mode for app queries

**Fix**:
1. Use Transaction mode (6543) for `DATABASE_URL`
2. Only use Session mode (5432) for `DIRECT_URL`

### "Password authentication failed"

**Problem**: Wrong password in connection string

**Fix**:
1. Check password has no typos
2. Special characters might need URL encoding:
   - `@` → `%40`
   - `#` → `%23`
   - `&` → `%26`
3. Or reset password in Supabase and update everywhere

### "JWT verification failed"

**Problem**: Wrong or changed JWT_SECRET

**Fix**:
1. Ensure `JWT_SECRET` is same across all deployments
2. After changing, users need to re-login
3. Verify it's set in Vercel environment variables

### "Module not found: Can't resolve '@prisma/client'"

**Problem**: Prisma client not generated

**Fix**:
1. Ensure `postinstall` script exists in `package.json`
2. Vercel should run this automatically
3. Manually: `npx prisma generate`

---

## 📞 Getting Help

**Connection String Issues**:
- See [SUPABASE-SETUP.md](./SUPABASE-SETUP.md) for detailed Supabase guide

**Deployment Issues**:
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for troubleshooting

**Quick Deploy**:
- See [QUICK-DEPLOY.md](./QUICK-DEPLOY.md) for step-by-step

---

## 🎯 Quick Copy Template

Use this template for Vercel:

```
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=
NEXT_PUBLIC_BASE_PATH=
NODE_ENV=production
```

Fill in with your actual values (no quotes needed in Vercel UI).

---

**Ready to deploy?** All environment variables documented ✅
