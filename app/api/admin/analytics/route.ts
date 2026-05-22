import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminSession } from '@/lib/session'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    // Total counts
    const [creators, restaurants, bookings, applications] = await Promise.all([
      sql`SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status = 'active')::int as active,
        COUNT(*) FILTER (WHERE status = 'pending_validation')::int as pending,
        COUNT(*) FILTER (WHERE status = 'blocked')::int as blocked
        FROM creators`,
      sql`SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE is_published = true)::int as published
        FROM restaurants`,
      sql`SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status = 'confirmed')::int as confirmed,
        COUNT(*) FILTER (WHERE status = 'completed')::int as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled')::int as cancelled,
        COUNT(*) FILTER (WHERE status = 'pending')::int as pending
        FROM bookings`,
      sql`SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')::int as last_7_days
        FROM business_applications`,
    ])

    // Monthly bookings trend (last 6 months)
    const monthlyBookings = await sql`
      SELECT
        TO_CHAR(booking_date, 'YYYY-MM') as month,
        COUNT(*)::int as count,
        COUNT(*) FILTER (WHERE status = 'completed')::int as completed
      FROM bookings
      WHERE booking_date > NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(booking_date, 'YYYY-MM')
      ORDER BY month ASC
    `

    // Monthly creator signups
    const monthlySignups = await sql`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*)::int as count
      FROM creators
      WHERE created_at > NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month ASC
    `

    // Top restaurants by bookings
    const topRestaurants = await sql`
      SELECT r.name, r.city, COUNT(b.id)::int as booking_count,
        COUNT(b.id) FILTER (WHERE b.status = 'completed')::int as completed_count
      FROM restaurants r
      LEFT JOIN bookings b ON r.id = b.restaurant_id
      GROUP BY r.id, r.name, r.city
      ORDER BY booking_count DESC
      LIMIT 10
    `

    // Top creators by bookings
    const topCreators = await sql`
      SELECT c.first_name, c.last_name, c.tiktok_username,
        COUNT(b.id)::int as booking_count,
        c.referral_count
      FROM creators c
      LEFT JOIN bookings b ON c.id = b.creator_id
      WHERE c.status = 'active'
      GROUP BY c.id, c.first_name, c.last_name, c.tiktok_username, c.referral_count
      ORDER BY booking_count DESC
      LIMIT 10
    `

    // Subscription distribution
    const subscriptions = await sql`
      SELECT
        COALESCE(subscription, 'free') as plan,
        COUNT(*)::int as count
      FROM restaurants
      GROUP BY COALESCE(subscription, 'free')
    `

    // Review stats
    const reviewStats = await sql`
      SELECT
        COUNT(*)::int as total_reviews,
        ROUND(AVG(rating), 1)::float as avg_rating
      FROM reviews
    `

    return NextResponse.json({
      creators: creators[0],
      restaurants: restaurants[0],
      bookings: bookings[0],
      applications: applications[0],
      monthlyBookings,
      monthlySignups,
      topRestaurants,
      topCreators,
      subscriptions,
      reviewStats: reviewStats[0],
    })
  } catch (err) {
    console.error('Analytics error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
