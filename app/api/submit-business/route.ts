import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sql from '@/lib/db'
import { sendBusinessNotification } from '@/lib/email'
import { hashPassword } from '@/lib/auth'

const schema = z.object({
  ambassadorCode:      z.string().nullable().optional(),
  bizName:             z.string().min(1),
  yourName:            z.string().min(1),
  email:               z.string().email(),
  phone:               z.string().min(1),
  password:            z.string().min(8),
  instagram:           z.string().nullable().optional(),
  tiktok:              z.string().nullable().optional(),
  website:             z.string().nullable().optional(),
  bizType:             z.string().min(1),
  cuisine:             z.string().min(1),
  address:             z.string().min(1),
  city:                z.string().min(1),
  arrondissement:      z.string().nullable().optional(),
  offer:               z.string().min(1),
  avgMealPrice:        z.number().nullable().optional(),
  manualSelection:     z.boolean().optional().default(false),
  contentWanted:       z.array(z.string()).min(1),
  contentDestination:  z.string().optional().default(''),
  freedom:             z.string().optional().default(''),
  frequency:           z.string().min(1),
  prevCollabs:         z.string().min(1),
  prevDetail:          z.string().nullable().optional(),
  challenge:           z.string().nullable().optional(),
  delivery:            z.string().optional().default(''),
  deliveryCollab:      z.string().optional().default(''),
  siren:               z.string().nullable().optional(),
  bestDays:            z.array(z.string()).min(1),
  bestTimes:           z.array(z.string()).default([]),
  maxCreatorsWeek:     z.string().nullable().optional(),
  maxCreatorsSlot:     z.string().nullable().optional(),
  heardAbout:          z.string().nullable().optional(),
  locale:              z.string().default('fr'),
})

function prefixAt(h: string | null | undefined): string | null {
  if (!h) return null
  return h.startsWith('@') ? h : `@${h}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const d = schema.parse(body)

    // Just validate the ambassador code exists — referral count only increases when admin accepts
    let validAmbassadorCode: string | null = null
    if (d.ambassadorCode && d.ambassadorCode.trim()) {
      const creatorCheck = await sql`
        SELECT ambassador_code FROM creators WHERE ambassador_code = ${d.ambassadorCode.trim().toUpperCase()}
      `
      if (creatorCheck.length > 0) {
        validAmbassadorCode = creatorCheck[0].ambassador_code
      }
    }

    const row = {
      referred_by_ambassador_code: validAmbassadorCode,
      business_name:           d.bizName,
      owner_name:              d.yourName,
      email:                   d.email,
      phone:                   d.phone,
      instagram_username:      prefixAt(d.instagram),
      tiktok_username:         prefixAt(d.tiktok),
      website:                 d.website || null,
      business_type:           d.bizType,
      cuisine_type:            d.cuisine,
      address:                 d.address,
      city:                    d.city,
      arrondissement:          d.arrondissement || null,
      collab_offer:            d.offer,
      content_wanted:          d.contentWanted,
      content_destination:     d.contentDestination || '',
      creative_freedom:        d.freedom || '',
      collab_frequency:        d.frequency,
      has_worked_with_creators: d.prevCollabs,
      previous_creator_detail: d.prevDetail || null,
      visibility_challenge:    d.challenge || null,
      offers_delivery:         d.delivery || '',
      open_to_delivery_collabs: d.deliveryCollab || '',
      best_days:               d.bestDays,
      best_times:              d.bestTimes,
      heard_about:             d.heardAbout || null,
      siren:                   d.siren || null,
      avg_meal_price:          d.avgMealPrice || null,
      manual_selection:        d.manualSelection || false,
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

    // Check if restaurant user already exists
    // Check email not already used in restaurant_users OR creators
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

    // Create restaurant user account (pending validation)
    const passwordHash = await hashPassword(d.password)
    await sql`
      INSERT INTO restaurant_users (email, password_hash, owner_name, phone, business_name, application_id, status)
      VALUES (${d.email}, ${passwordHash}, ${d.yourName}, ${d.phone}, ${d.bizName}, ${applicationId}, 'pending_validation')
    `

    await sendBusinessNotification(row)

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 })
    }
    console.error('Business submit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
