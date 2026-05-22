import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// GET: one-click reconfirm from email link
// /api/creator/bookings/reconfirm-link?bookingId=123&token=abc
export async function GET(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get('bookingId')
  const token = req.nextUrl.searchParams.get('token')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://2960agency.com'

  if (!bookingId || !token) {
    return NextResponse.redirect(`${appUrl}/creator/login`)
  }

  try {
    // Verify token matches booking
    const result = await sql`
      SELECT b.id, b.status, b.reconfirmed_at, b.booking_date, b.creator_id
      FROM bookings b
      JOIN conversation_tokens ct ON ct.booking_id = b.id
      WHERE ct.token = ${token} AND b.id = ${parseInt(bookingId)}
    `

    if (result.length === 0) {
      return NextResponse.redirect(`${appUrl}/creator/login?error=booking_not_found`)
    }

    const b = result[0]

    if (b.reconfirmed_at) {
      // Already reconfirmed — redirect to dashboard with success
      return NextResponse.redirect(`${appUrl}/creator/dashboard?reconfirmed=already`)
    }

    if (b.status !== 'confirmed') {
      return NextResponse.redirect(`${appUrl}/creator/dashboard?reconfirmed=invalid_status`)
    }

    // Check timing
    const now = new Date()
    const [y, m, d] = b.booking_date.split('-').map(Number)
    const bookingDate = new Date(y, m - 1, d)
    const daysUntil = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)

    if (daysUntil > 5) {
      return NextResponse.redirect(`${appUrl}/creator/dashboard?reconfirmed=too_early`)
    }

    // Reconfirm
    await sql`UPDATE bookings SET reconfirmed_at = NOW() WHERE id = ${parseInt(bookingId)}`

    return NextResponse.redirect(`${appUrl}/creator/dashboard?reconfirmed=success`)
  } catch (err) {
    console.error('Reconfirm link error:', err)
    return NextResponse.redirect(`${appUrl}/creator/dashboard?reconfirmed=error`)
  }
}
