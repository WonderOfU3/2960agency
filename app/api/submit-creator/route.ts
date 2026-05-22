import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sql from '@/lib/db'
import { sendCreatorNotification, sendCreatorWelcome } from '@/lib/email'
import { hashPassword, generateAmbassadorCode } from '@/lib/auth'

const schema = z.object({
  username:            z.string().min(3).regex(/^[a-zA-Z0-9_]+$/),
  firstName:           z.string().min(1),
  lastName:            z.string().min(1),
  email:               z.string().email(),
  phone:               z.string().min(1), // NOW MANDATORY
  password:            z.string().min(8), // NEW: password for login
  tiktok:              z.string().min(1),
  instagram:           z.string().nullable().optional(),
  city:                z.string().min(1),
  languages:           z.array(z.string()).min(1),
  contentLang:         z.array(z.string()).min(1),
  arrondissements:     z.array(z.string()).default([]),
  otherAreas:          z.string().nullable().optional(),
  collabDistance:      z.string().min(1),
  collabAvailability:  z.array(z.string()).default([]),
  restaurantTypes:     z.array(z.string()).min(1),
  otherCuisines:       z.string().nullable().optional(),
  coffeeShops:         z.string().min(1),
  coffeeLikes:         z.array(z.string()).default([]),
  photogenic:          z.string().min(1),
  whatMatters:         z.array(z.string()).min(1),
  placeType:           z.string().min(1),
  placesDislike:       z.string().nullable().optional(),
  dreamPlace:          z.string().nullable().optional(),
  collabPref:          z.string().min(1),
  platforms:           z.array(z.string()).min(1),
  prevCollabs:         z.string().min(1),
  prevCollabsDetail:   z.string().nullable().optional(),
  niche:               z.array(z.string()).min(1),
  audienceSize:        z.string().min(1),
  postedContent:       z.string().min(1),
  contentLinks:        z.array(z.string()).default([]),
  contentNote:         z.string().nullable().optional(),
  fileNames:           z.array(z.string()).default([]),
  cloudinaryUrls:      z.array(z.string()).default([]),
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

    // Check if email already exists
    // Check email not already used in creators OR restaurant_users
    const existingCreator = await sql`SELECT id FROM creators WHERE email = ${d.email}`
    if (existingCreator.length > 0) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cet email' }, { status: 400 })
    }
    const existingResto = await sql`SELECT id FROM restaurant_users WHERE email = ${d.email}`
    if (existingResto.length > 0) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cet email' }, { status: 400 })
    }
    const existingAdmin = await sql`SELECT id FROM admins WHERE email = ${d.email}`
    if (existingAdmin.length > 0) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cet email' }, { status: 400 })
    }

    // Check username uniqueness
    const existingUsername = await sql`SELECT id FROM creators WHERE LOWER(username) = LOWER(${d.username})`
    if (existingUsername.length > 0) {
      return NextResponse.json({ error: 'Ce nom d\'utilisateur est déjà pris' }, { status: 400 })
    }

    const row = {
      first_name:             d.firstName,
      last_name:              d.lastName,
      email:                  d.email,
      phone:                  d.phone,
      tiktok_username:        prefixAt(d.tiktok),
      instagram_username:     prefixAt(d.instagram),
      city:                   d.city,
      languages_spoken:       d.languages,
      content_languages:      d.contentLang,
      favorite_arrondissements: d.arrondissements,
      other_areas:            d.otherAreas || null,
      travel_distance:        d.collabDistance,
      collab_availability:    d.collabAvailability,
      restaurant_types:       d.restaurantTypes,
      other_cuisines:         d.otherCuisines || null,
      likes_coffee_shops:     d.coffeeShops,
      coffee_shop_preferences: d.coffeeLikes,
      photogenic_matters:     d.photogenic,
      top_priorities:         d.whatMatters,
      ideal_place_type:       d.placeType,
      disliked_places:        d.placesDislike || null,
      dream_restaurant:       d.dreamPlace || null,
      collab_preference:      d.collabPref,
      preferred_platforms:    d.platforms,
      has_done_collabs:       d.prevCollabs,
      previous_collabs_detail: d.prevCollabsDetail || null,
      niche:                  d.niche,
      audience_size:          d.audienceSize,
      posted_content:         d.postedContent,
      content_links:          d.contentLinks.filter(l => l.trim()),
      content_note:           d.contentNote || null,
      file_names:             d.fileNames,
      cloudinary_urls:        d.cloudinaryUrls,
      locale:                 d.locale,
    }

    // Insert application first
    const applicationResult = await sql`
      INSERT INTO creator_applications (
        username, first_name, last_name, email, phone,
        tiktok_username, instagram_username, city,
        languages_spoken, content_languages,
        favorite_arrondissements, other_areas, travel_distance, collab_availability,
        restaurant_types, other_cuisines,
        likes_coffee_shops, coffee_shop_preferences,
        photogenic_matters, top_priorities,
        ideal_place_type, disliked_places, dream_restaurant,
        collab_preference, preferred_platforms,
        has_done_collabs, previous_collabs_detail,
        niche, audience_size,
        posted_content, content_links, content_note, file_names, cloudinary_urls,
        locale
      ) VALUES (
        ${d.username}, ${row.first_name}, ${row.last_name}, ${row.email}, ${row.phone},
        ${row.tiktok_username}, ${row.instagram_username}, ${row.city},
        ${row.languages_spoken}, ${row.content_languages},
        ${row.favorite_arrondissements}, ${row.other_areas}, ${row.travel_distance}, ${row.collab_availability},
        ${row.restaurant_types}, ${row.other_cuisines},
        ${row.likes_coffee_shops}, ${row.coffee_shop_preferences},
        ${row.photogenic_matters}, ${row.top_priorities},
        ${row.ideal_place_type}, ${row.disliked_places}, ${row.dream_restaurant},
        ${row.collab_preference}, ${row.preferred_platforms},
        ${row.has_done_collabs}, ${row.previous_collabs_detail},
        ${row.niche}, ${row.audience_size},
        ${row.posted_content}, ${row.content_links}, ${row.content_note}, ${row.file_names}, ${row.cloudinary_urls},
        ${row.locale}
      )
      RETURNING id
    `

    const applicationId = applicationResult[0].id

    // Generate ambassador code and hash password
    const ambassadorCode = generateAmbassadorCode()
    const passwordHash = await hashPassword(d.password)

    // Create creator account (pending validation)
    await sql`
      INSERT INTO creators (
        username, email, password_hash, phone,
        first_name, last_name,
        tiktok_username, instagram_username, city,
        niche,
        ambassador_code, application_id, status
      ) VALUES (
        ${d.username}, ${d.email}, ${passwordHash}, ${d.phone},
        ${d.firstName}, ${d.lastName},
        ${row.tiktok_username}, ${row.instagram_username}, ${d.city},
        ${d.niche},
        ${ambassadorCode}, ${applicationId}, 'pending_validation'
      )
    `

    // Send notification to Yara
    await sendCreatorNotification(row)

    // Send welcome email to creator
    await sendCreatorWelcome({
      firstName: d.firstName,
      email: d.email,
      ambassadorCode: ambassadorCode
    })

    return NextResponse.json({
      success: true,
      ambassadorCode: ambassadorCode
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 })
    }
    console.error('Creator submit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
