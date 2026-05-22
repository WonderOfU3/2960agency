/** Convert "HH:MM" to minutes since midnight */
export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** Convert minutes since midnight to "HH:MM" */
export function toTimeStr(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Generate 1-hour sub-slots every 30 minutes within a time window */
export function generateSubSlots(startTime: string, endTime: string): { start: string; end: string }[] {
  const slots: { start: string; end: string }[] = []
  const startMin = toMinutes(startTime)
  const endMin = toMinutes(endTime)
  for (let s = startMin; s + 60 <= endMin; s += 30) {
    slots.push({ start: toTimeStr(s), end: toTimeStr(s + 60) })
  }
  return slots
}

/** Check if two time ranges overlap */
export function slotsOverlap(
  aStart: string, aEnd: string,
  bStart: string, bEnd: string
): boolean {
  return toMinutes(aStart) < toMinutes(bEnd) && toMinutes(aEnd) > toMinutes(bStart)
}
