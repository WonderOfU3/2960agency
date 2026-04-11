import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sql from '@/lib/db'
import { sendBusinessNotification } from '@/lib/email'

const schema = z.object({
  bizName:             z.string().min(1),
  yourName:            z.string().min(1),
  email:               z.string().email(),
  phone:               z.string().min(1),
  instagram:           z.string().nullable().optional(),
  tiktok:              z.string().nullable().optional(),
  website:             z.string().nullable().optional(),
  bizType:             z.string().min(1),
  cuisine:             z.string().min(1),
  address:             z.string().min(1),
  city:                z.string().min(1),
  arrondissement:      z.string().nullable().optional(),
  offer:               z.string().min(1),
  contentWanted:       z.array(z.string()).min(1),
  contentDestination:  z.string().min(1),
  freedom:             z.string().min(1),
  frequency:           z.string().min(1),
  prevCollabs:         z.string().min(1),
  prevDetail:          z.string().nullable().optional(),
  challenge:           z.string().nullable().optional(),
  delivery:            z.string().min(1),
  deliveryCollab:      z.string().min(1),
  bestDays:            z.array(z.string()).min(1),
  bestTimes:           z.array(z.string()).min(1),
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

    const row = {
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
      content_destination:     d.contentDestination,
      creative_freedom:        d.freedom,
      collab_frequency:        d.frequency,
      has_worked_with_creators: d.prevCollabs,
      previous_creator_detail: d.prevDetail || null,
      visibility_challenge:    d.challenge || null,
      offers_delivery:         d.delivery,
      open_to_delivery_collabs: d.deliveryCollab,
      best_days:               d.bestDays,
      best_times:              d.bestTimes,
      heard_about:             d.heardAbout || null,
      locale:                  d.locale,
    }

    await sql`
      INSERT INTO business_applications (
        business_name, owner_name, email, phone,
        instagram_username, tiktok_username, website,
        business_type, cuisine_type, address, city, arrondissement,
        collab_offer, content_wanted, content_destination,
        creative_freedom, collab_frequency,
        has_worked_with_creators, previous_creator_detail, visibility_challenge,
        offers_delivery, open_to_delivery_collabs,
        best_days, best_times, heard_about, locale
      ) VALUES (
        ${row.business_name}, ${row.owner_name}, ${row.email}, ${row.phone},
        ${row.instagram_username}, ${row.tiktok_username}, ${row.website},
        ${row.business_type}, ${row.cuisine_type}, ${row.address}, ${row.city}, ${row.arrondissement},
        ${row.collab_offer}, ${row.content_wanted}, ${row.content_destination},
        ${row.creative_freedom}, ${row.collab_frequency},
        ${row.has_worked_with_creators}, ${row.previous_creator_detail}, ${row.visibility_challenge},
        ${row.offers_delivery}, ${row.open_to_delivery_collabs},
        ${row.best_days}, ${row.best_times}, ${row.heard_about}, ${row.locale}
      )
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
