# 2960 Agency - Creator Login System Implementation Guide

## ✅ Phase 1: COMPLETED

### What's Been Implemented

1. **Authentication Infrastructure**
   - ✅ Supabase SSR integration
   - ✅ Password hashing utilities (bcrypt)
   - ✅ Ambassador code generation (nanoid)
   - ✅ Middleware for session management

2. **Database Schema**
   - ✅ `creators` table with auth and profile data
   - ✅ `restaurants` table with offers and photos
   - ✅ `time_slots` table for availability
   - ✅ `bookings` table for reservations
   - ✅ `admins` table for Yara
   - ✅ Referral tracking with automatic triggers
   - ✅ Updated `business_applications` with ambassador code tracking
   - ✅ Views for eligible creators and available restaurants

3. **Form Updates**
   - ✅ Creator form: phone mandatory, password field, ambassador code generation
   - ✅ Business form: ambassador code input at beginning, annual price field
   - ✅ Success pages show ambassador code with copy functionality
   - ✅ Duplicate email checking

4. **Referral System**
   - ✅ Ambassador codes generated and stored
   - ✅ Business form validates codes
   - ✅ Database trigger updates referral count
   - ✅ Auto-marks creators as "eligible" at 5 referrals

5. **Email System (Brevo)**
   - ✅ Welcome email with ambassador code
   - ✅ Account validation email
   - ✅ Booking confirmation emails (creator + Yara)
   - ✅ Business notification includes ambassador code
   - ✅ Beautiful branded HTML templates

---

## 📋 Phase 2: TODO

### 5. Creator Login & Signup Pages

**Files to create:**
- `app/creator/login/page.tsx`
- `app/creator/signup/page.tsx` (or redirect to existing form)
- `components/auth/LoginForm.tsx`

**What to build:**
```tsx
// Login flow:
// 1. Email + password input
// 2. Query creators table for matching email
// 3. Verify password with bcrypt
// 4. Check status:
//    - If 'pending_validation' → show message "Votre compte est en cours de validation"
//    - If 'blocked' → show error
//    - If 'active' → create session and redirect to /creator/dashboard
// 5. Use cookies for session management
```

**Key features:**
- Form validation
- Error handling
- "Forgot password" link (future feature)
- Redirect to dashboard if already logged in

---

### 6. Creator Dashboard

**Files to create:**
- `app/creator/dashboard/page.tsx`
- `components/creator/RestaurantCard.tsx`
- `components/creator/BookingModal.tsx`

**What to build:**

```tsx
// Dashboard features:
// 1. Protected route - check auth session
// 2. Fetch published restaurants from database
// 3. Display as grid of cards with:
//    - Photos carousel (from cloudinary URLs)
//    - Restaurant name, cuisine type
//    - Address
//    - Offer description
//    - Virality bonus (if applicable)
//    - Available time slots
//    - Booking button
// 4. Blur unpublished restaurants (is_published = false)
// 5. Show creator's profile summary
// 6. Show referral stats (how many restaurants signed up with their code)
```

**API Routes to create:**
- `app/api/creator/restaurants/route.ts` - GET published restaurants
- `app/api/creator/profile/route.ts` - GET creator profile

---

### 7. Booking System

**Files to create:**
- `app/api/creator/bookings/route.ts` - POST new booking
- `app/api/creator/bookings/available/route.ts` - GET available slots
- `components/creator/BookingCalendar.tsx`

**Logic to implement:**

```typescript
// Booking rules:
// 1. Max 5 days in advance from today
// 2. Check restaurant's max bookings per week
// 3. Check max bookings per day
// 4. Check max bookings per time slot
// 5. Prevent double booking (same creator, same restaurant, same day)

// Email notifications:
// 1. Send confirmation to creator with details
// 2. Send notification to Yara (contact@2960agency.com)
```

**Email template needed:**
- Booking confirmation (creator)
- New booking notification (Yara)

---

### 8. Admin Dashboard (Yara)

**Files to create:**
- `app/admin/login/page.tsx`
- `app/admin/dashboard/page.tsx`
- `app/admin/creators/page.tsx`
- `app/admin/restaurants/page.tsx`
- `app/admin/restaurants/[id]/page.tsx`
- `components/admin/CreatorsList.tsx`
- `components/admin/RestaurantForm.tsx`

**Admin Features:**

#### 8a. Creator Management
```tsx
// List all creators with:
// - Name, email, status
// - Referral count
// - Reward status (pending/eligible/paid)
// - Actions: Validate, Block, View application

// Actions:
// - Validate creator → status = 'active'
// - Block creator → status = 'blocked'
// - Mark reward as paid → reward_status = 'paid'
```

**API Routes:**
- `app/api/admin/creators/route.ts` - GET all creators
- `app/api/admin/creators/[id]/validate/route.ts` - POST validate
- `app/api/admin/creators/[id]/block/route.ts` - POST block
- `app/api/admin/creators/[id]/reward/route.ts` - POST mark reward paid

#### 8b. Restaurant Management
```tsx
// List all restaurants with:
// - Name, cuisine, city
// - Published status
// - Edit/Delete actions

// Create/Edit Restaurant Form:
// - Name, cuisine type, address, city, arrondissement
// - Photos upload (Cloudinary integration needed)
// - Offer description
// - Virality bonus (optional, in euros)
// - Publish toggle (controls visibility to creators)
// - Link to business application (if applicable)
// - Ambassador code tracking (if referred)

// Time Slots Management:
// - Add/edit/delete time slots
// - Set max bookings per slot
// - Configure max bookings per week/day
```

**API Routes:**
- `app/api/admin/restaurants/route.ts` - GET all, POST new
- `app/api/admin/restaurants/[id]/route.ts` - GET one, PUT update, DELETE
- `app/api/admin/restaurants/[id]/publish/route.ts` - POST toggle publish
- `app/api/admin/restaurants/[id]/slots/route.ts` - GET/POST slots

---

### 9. Email Notifications (Brevo) ✅ COMPLETED

**Already implemented in `lib/email.ts`:**

✅ **Creator Welcome Email** - Sent when account is created
- Welcome message with pending validation status
- Ambassador code highlighted
- Referral program explanation (5 restaurants = €100)

✅ **Creator Validation Email** - Send when admin validates account
- Account activated notification
- Login link to dashboard
- Next steps guide

✅ **Booking Confirmation Email** - For when bookings are made
- To creator: beautiful confirmation with restaurant details
- To Yara: notification with all booking info

✅ **Business notification** - Updated to include ambassador code

**Your Brevo setup is already working!** The email templates follow your existing design system (dark background, orange accent, grain texture).

---

## 🗄️ Database Setup Steps

Run these SQL files in your Neon console in order:

1. `schema.sql` (if not already run)
2. `migration_add_collab_availability.sql`
3. `schema_auth_system.sql` ⭐ NEW - Run this now!

**Important:** The default admin password in `schema_auth_system.sql` is a placeholder. After running the migration, update Yara's password:

```sql
-- Generate a proper password hash (use bcrypt with your chosen password)
UPDATE admins 
SET password_hash = 'your_actual_bcrypt_hash_here'
WHERE email = 'contact@2960agency.com';
```

---

## 🔐 Environment Variables

Update your `.env.local`:

```env
# Neon Database (Already configured ✅)
DATABASE_URL=postgresql://...

# Supabase (get from https://app.supabase.com/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Brevo Email (Already configured ✅)
BREVO_API_KEY=your_brevo_key
NOTIFY_EMAIL=contact@2960agency.com

# Optional: App URL for email links
NEXT_PUBLIC_APP_URL=https://2960agency.com
```

---

## 🎨 Design Notes

- Follow existing 2960 Agency branding:
  - Background: `#0c0b09` (black)
  - Primary: `#E8471A` (orange)
  - Font: DM Sans
  - Grain overlay effect
  - Warm glow gradients

- Restaurant cards should match the aesthetic of the existing forms
- Use blur effect for unpublished restaurants (filter: blur(8px), opacity: 0.4)
- Booking calendar should be mobile-friendly

---

## 📱 Image Upload (Cloudinary)

For restaurant photos, you'll need to:

1. Sign up for Cloudinary: https://cloudinary.com
2. Install: `npm install cloudinary`
3. Configure upload preset for unsigned uploads
4. Update restaurant form to upload images
5. Store Cloudinary URLs in `restaurants.photos` array

Example:
```typescript
// Upload to Cloudinary
const uploadPhoto = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'your_preset')
  
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`,
    { method: 'POST', body: formData }
  )
  const data = await res.json()
  return data.secure_url
}
```

---

## 🧪 Testing Checklist

### Creator Flow
- [ ] Creator can fill form with phone + password
- [ ] Ambassador code is generated and shown on success page
- [ ] Creator can copy ambassador code
- [ ] Creator account is created with status 'pending_validation'
- [ ] Creator cannot login until validated
- [ ] After validation, creator can login
- [ ] Dashboard shows only published restaurants
- [ ] Creator can book a slot within 5 days
- [ ] Emails are sent on booking

### Business Flow
- [ ] Business form has ambassador code field at top
- [ ] Valid ambassador code increases creator referral count
- [ ] Invalid code is ignored (no error, just not counted)
- [ ] When creator hits 5 referrals, reward_status = 'eligible'

### Admin Flow
- [ ] Admin can login
- [ ] Can see all creators and validate/block them
- [ ] Can create/edit restaurants
- [ ] Can publish/unpublish restaurants
- [ ] Can configure time slots and limits
- [ ] Can see eligible creators for 100€ reward

---

## 🚀 Deployment Notes

1. Run database migrations in Neon
2. Set up Supabase project (for future auth enhancements)
3. Configure Resend for emails
4. Update environment variables in Vercel
5. Test email delivery in production
6. Update admin password from default

---

## 📊 Future Enhancements

- Analytics dashboard for creators (views, engagement)
- Review system (creators review restaurants)
- Content upload from creators after collab
- Automated reminders before bookings
- Mobile app integration
- Multi-language support expansion
- Payment integration for subscription model
- Advanced availability calendar (recurring slots)

---

## 🐛 Known Issues / Edge Cases

1. **Timezone handling**: Currently using server timezone, may need to explicitly handle Paris timezone
2. **Concurrent bookings**: Race condition possible if two creators book same slot simultaneously - add database constraint
3. **Photo storage**: No deletion mechanism for old photos when updating restaurant
4. **Email rate limits**: Resend has rate limits, consider queueing for high volume

---

## 📝 Notes

- The `@supabase/auth-helpers-nextjs` package is deprecated. Current implementation uses `@supabase/ssr` instead.
- Ambassador code is 8 characters, uppercase alphanumeric
- Referral tracking happens via database trigger, not application code
- Booking limits are per restaurant, configurable in admin panel
- Status can be: pending_validation, active, blocked

