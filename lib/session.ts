import { cookies } from 'next/headers'

interface AdminSession {
  id: number
  email: string
  name: string
  role: 'admin'
  exp: number
}

interface CreatorSession {
  id: number
  email: string
  firstName: string
  lastName: string
  ambassadorCode: string
  role: 'creator'
  exp: number
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  if (!token) return null

  try {
    const data = JSON.parse(Buffer.from(token, 'base64').toString('utf-8')) as AdminSession
    if (data.exp < Date.now()) return null
    if (data.role !== 'admin') return null
    return data
  } catch {
    return null
  }
}

export async function getCreatorSession(): Promise<CreatorSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('creator_session')?.value
  if (!token) return null

  try {
    const data = JSON.parse(Buffer.from(token, 'base64').toString('utf-8')) as CreatorSession
    if (data.exp < Date.now()) return null
    if (data.role !== 'creator') return null
    return data
  } catch {
    return null
  }
}

interface RestaurantSession {
  id: number
  email: string
  ownerName: string
  businessName: string
  restaurantId: number | null
  role: 'restaurant'
  exp: number
}

export async function getRestaurantSession(): Promise<RestaurantSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('restaurant_session')?.value
  if (!token) return null

  try {
    const data = JSON.parse(Buffer.from(token, 'base64').toString('utf-8')) as RestaurantSession
    if (data.exp < Date.now()) return null
    if (data.role !== 'restaurant') return null
    return data
  } catch {
    return null
  }
}
