import { createCanvas } from '@napi-rs/canvas'

/**
 * Generate a monogram avatar for a creator's wallet card.
 * Circle with bordeaux background (#6d0040) and orange initials (#ff6339).
 */
export async function generateMonogramAvatar(handle: string): Promise<Buffer> {
  const initials = handle.replace('@', '').slice(0, 2).toUpperCase()
  const size = 180
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Transparent background
  ctx.clearRect(0, 0, size, size)

  // Circle background — bordeaux
  ctx.fillStyle = '#6d0040'
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  ctx.fill()

  // Initials — orange
  ctx.fillStyle = '#ff6339'
  ctx.font = `bold ${Math.round(size * 0.42)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(initials, size / 2, size / 2)

  return Buffer.from(canvas.toBuffer('image/png'))
}
