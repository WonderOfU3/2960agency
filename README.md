# 2960 Agency — MVP

Landing page + signup funnel connecting independent Paris restaurants with local creators.

## Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Database:** Neon (PostgreSQL via @neondatabase/serverless)
- **Email:** Resend
- **Deploy:** Vercel (frontend) + Railway (for future Java Spring Boot backend)

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

```env
DATABASE_URL=postgresql://neondb_owner:...@ep-...neon.tech/neondb?sslmode=require&channel_binding=require
RESEND_API_KEY=re_...
NOTIFY_EMAIL=contact@2960agency.com
NEXT_PUBLIC_APP_URL=https://2960agency.com
```

### 3. Set up the database

Run the SQL schema in your Neon console:

1. Go to [console.neon.tech](https://console.neon.tech)
2. Open your project → SQL Editor
3. Paste the contents of `schema.sql` and run it

### 4. Set up Resend

1. Create account at [resend.com](https://resend.com)
2. Add your domain (`2960agency.com`) and verify DNS
3. Create an API key
4. Add it to `.env.local` as `RESEND_API_KEY`

> Note: Until your domain is verified, you can use `onboarding@resend.dev` as the FROM address for testing. Update `lib/email.ts` → `FROM_EMAIL` temporarily.

### 5. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables in Vercel dashboard (same as `.env.local`)
4. Deploy

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with hero animation + CTAs |
| `/creator` | Creator application form |
| `/business` | Business application form |
| `/creator/success` | Creator confirmation page |
| `/business/success` | Business confirmation page |

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/submit-creator` | POST | Save creator application + send notification email |
| `/api/submit-business` | POST | Save business application + send notification email |

---

## Project Structure

```
app/
  page.tsx                    — Landing page
  creator/page.tsx            — Creator form
  creator/success/page.tsx    — Creator confirmation
  business/page.tsx           — Business form
  business/success/page.tsx   — Business confirmation
  api/
    submit-creator/route.ts   — Creator API endpoint
    submit-business/route.ts  — Business API endpoint

components/
  Navbar.tsx                  — Top nav with lang toggle
  HeroAnimation.tsx           — Cinematic animated background
  ui/
    Button.tsx
    Input.tsx
    Textarea.tsx
    Select.tsx
    MultiSelect.tsx
    FormField.tsx
    FormSection.tsx
  forms/
    CreatorForm.tsx            — Full creator form with conditional logic
    BusinessForm.tsx           — Full business form with conditional logic

context/
  LanguageContext.tsx          — FR/EN language context + all translations

lib/
  db.ts                       — Neon database connection
  email.ts                    — Resend email notifications

schema.sql                    — Database schema (run in Neon console)
```

---

## Phase 2 (after MVP)

- Offer posting by restaurants
- Offer browsing + application by creators
- Matching / acceptance flow
- In-app messaging
- Content delivery confirmation
- Bilateral rating system
- Dashboard for both sides
- Java Spring Boot backend on Railway
- Clerk authentication
- Cloudinary for image/media storage
