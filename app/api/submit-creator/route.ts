import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sql from '@/lib/db'
import { sendCreatorNotification } from '@/lib/email'

const schema = z.object({
  firstName:           z.string().min(1),
  lastName:            z.string().min(1),
  email:               z.string().email(),
  phone:               z.string().optional().default(''),
  tiktok:              z.string().min(1),
  instagram:           z.string().nullable().optional(),
  city:                z.string().min(1),
  languages:           z.array(z.string()).min(1),
  contentLang:         z.array(z.string()).min(1),
  arrondissements:     z.array(z.string()).default([]),
  otherAreas:          z.string().nullable().optional(),
  collabDistance:      z.string().min(1),
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
      first_name:             d.firstName,
      last_name:              d.lastName,
      email:                  d.email,
      phone:                  d.phone || null,
      tiktok_username:        prefixAt(d.tiktok),
      instagram_username:     prefixAt(d.instagram),
      city:                   d.city,
      languages_spoken:       d.languages,
      content_languages:      d.contentLang,
      favorite_arrondissements: d.arrondissements,
      other_areas:            d.otherAreas || null,
      travel_distance:        d.collabDistance,
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
      locale:                 d.locale,
    }

    await sql`
      INSERT INTO creator_applications (
        first_name, last_name, email, phone,
        tiktok_username, instagram_username, city,
        languages_spoken, content_languages,
        favorite_arrondissements, other_areas, travel_distance,
        restaurant_types, other_cuisines,
        likes_coffee_shops, coffee_shop_preferences,
        photogenic_matters, top_priorities,
        ideal_place_type, disliked_places, dream_restaurant,
        collab_preference, preferred_platforms,
        has_done_collabs, previous_collabs_detail,
        niche, audience_size,
        posted_content, content_links, content_note, file_names,
        locale
      ) VALUES (
        ${row.first_name}, ${row.last_name}, ${row.email}, ${row.phone},
        ${row.tiktok_username}, ${row.instagram_username}, ${row.city},
        ${row.languages_spoken}, ${row.content_languages},
        ${row.favorite_arrondissements}, ${row.other_areas}, ${row.travel_distance},
        ${row.restaurant_types}, ${row.other_cuisines},
        ${row.likes_coffee_shops}, ${row.coffee_shop_preferences},
        ${row.photogenic_matters}, ${row.top_priorities},
        ${row.ideal_place_type}, ${row.disliked_places}, ${row.dream_restaurant},
        ${row.collab_preference}, ${row.preferred_platforms},
        ${row.has_done_collabs}, ${row.previous_collabs_detail},
        ${row.niche}, ${row.audience_size},
        ${row.posted_content}, ${row.content_links}, ${row.content_note}, ${row.file_names},
        ${row.locale}
      )
    `

    await sendCreatorNotification(row)

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 })
    }
    console.error('Creator submit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
