import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sql from '@/lib/db'
import { sendBusinessNotification, sendRestoExplainer } from '@/lib/email'
import { hashPassword } from '@/lib/auth'
import { track } from '@/lib/track'

const schema = z.object({
  firstName:  z.string().default(''),
  lastName:   z.string().default(''),
  email:      z.string().email(),
  phone:      z.string().default(''),
  password:   z.string().min(8),
  bizName:    z.string().min(1),
  address:    z.string().default(''),
  referralCode: z.string().optional(),
  locale:     z.string().default('fr'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const d = schema.parse(body)

    // Check email not already used
    const existingUser = await sql`SELECT id FROM restaurant_users WHERE email = ${d.email}`
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cet email' }, { status: 400 })
    }
    const existingCreator = await sql`SELECT id FROM creators WHERE email = ${d.email}`
    if (existingCreator.length > 0) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cet email' }, { status: 400 })
    }
    const existingAdmin = await sql`SELECT id FROM admins WHERE email = ${d.email}`
    if (existingAdmin.length > 0) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cet email' }, { status: 400 })
    }

    const ownerName = (d.firstName.trim() || d.lastName.trim())
      ? `${d.firstName.trim()} ${d.lastName.trim()}`.trim()
      : d.bizName.trim()

    // Validate referral code if provided
    let validatedReferralCode: string | null = null
    if (d.referralCode) {
      const codeCheck = await sql`SELECT ambassador_code FROM creators WHERE ambassador_code = ${d.referralCode.trim().toUpperCase()}`
      if (codeCheck.length > 0) validatedReferralCode = codeCheck[0].ambassador_code
    }

    const row = {
      referred_by_ambassador_code: validatedReferralCode,
      business_name:           d.bizName.trim(),
      owner_name:              ownerName,
      email:                   d.email.trim(),
      phone:                   d.phone.trim() || '',
      instagram_username:      null,
      tiktok_username:         null,
      website:                 null,
      business_type:           'restaurant',
      cuisine_type:            '',
      address:                 d.address.trim(),
      city:                    'Paris',
      arrondissement:          null,
      collab_offer:            'À définir',
      content_wanted:          ['flexible'],
      content_destination:     '',
      creative_freedom:        '',
      collab_frequency:        '2 par semaine',
      has_worked_with_creators: 'no',
      previous_creator_detail: null,
      visibility_challenge:    null,
      offers_delivery:         '',
      open_to_delivery_collabs: '',
      best_days:               [] as string[],
      best_times:              [] as string[],
      heard_about:             null,
      siren:                   null,
      avg_meal_price:          null,
      manual_selection:        false,
      locale:                  d.locale,
    }

    const result = await sql`
      INSERT INTO business_applications (
        referred_by_ambassador_code,
        business_name, owner_name, email, phone,
        instagram_username, tiktok_username, website,
        business_type, cuisine_type, address, city, arrondissement,
        collab_offer, content_wanted, content_destination,
        creative_freedom, collab_frequency,
        has_worked_with_creators, previous_creator_detail, visibility_challenge,
        offers_delivery, open_to_delivery_collabs,
        best_days, best_times, heard_about, siren,
        avg_meal_price, manual_selection, locale
      ) VALUES (
        ${row.referred_by_ambassador_code},
        ${row.business_name}, ${row.owner_name}, ${row.email}, ${row.phone},
        ${row.instagram_username}, ${row.tiktok_username}, ${row.website},
        ${row.business_type}, ${row.cuisine_type}, ${row.address}, ${row.city}, ${row.arrondissement},
        ${row.collab_offer}, ${row.content_wanted}, ${row.content_destination},
        ${row.creative_freedom}, ${row.collab_frequency},
        ${row.has_worked_with_creators}, ${row.previous_creator_detail}, ${row.visibility_challenge},
        ${row.offers_delivery}, ${row.open_to_delivery_collabs},
        ${row.best_days}, ${row.best_times}, ${row.heard_about}, ${row.siren},
        ${row.avg_meal_price}, ${row.manual_selection}, ${row.locale}
      )
      RETURNING id
    `

    const applicationId = result[0].id

    // Create restaurant user account (pending validation)
    const passwordHash = await hashPassword(d.password)
    await sql`
      INSERT INTO restaurant_users (email, password_hash, owner_name, phone, business_name, application_id, status)
      VALUES (${d.email.trim()}, ${passwordHash}, ${ownerName}, ${row.phone}, ${row.business_name}, ${applicationId}, 'pending_validation')
    `

    await sendBusinessNotification(row)

    // C.0 — Send explainer email immediately at candidature
    sendRestoExplainer({ restoName: d.bizName.trim(), email: d.email.trim() }).catch(e => console.error('C.0 explainer email error:', e))

    if (validatedReferralCode) {
      const referrer = await sql`SELECT id FROM creators WHERE ambassador_code = ${validatedReferralCode}`
      if (referrer.length > 0) {
        track({ event: 'resto_ramene_via_code', userId: referrer[0].id, userType: 'creator', metadata: { restaurantEmail: d.email, code: validatedReferralCode } })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 })
    }
    console.error('Business submit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
