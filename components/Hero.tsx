'use client'

import { useRef, useEffect, useLayoutEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

/* ── 3D geometry ─────────────────────────────────────────── */
interface Pt3 { x: number; y: number; z: number }

function fiboSphere(n: number): Pt3[] {
  const pts: Pt3[] = [], golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const th = golden * i
    pts.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r })
  }
  return pts
}

const CONTINENTS: [number, number][][] = [
  [[49,-125],[60,-140],[70,-160],[72,-130],[70,-90],[60,-65],[48,-55],[45,-67],[42,-70],[30,-82],[25,-80],[18,-90],[15,-90],[15,-105],[20,-105],[32,-117],[38,-123],[49,-125]],
  [[12,-70],[10,-62],[7,-52],[0,-50],[-5,-35],[-10,-37],[-22,-40],[-33,-52],[-42,-63],[-55,-68],[-55,-72],[-46,-75],[-38,-73],[-18,-70],[-15,-76],[-5,-80],[0,-78],[8,-77],[12,-70]],
  [[36,-10],[38,-8],[43,-9],[48,-5],[51,2],[54,-3],[58,-5],[62,5],[71,25],[70,40],[60,40],[56,37],[50,40],[47,35],[44,28],[41,29],[38,24],[35,25],[36,15],[40,15],[44,12],[46,8],[43,3],[36,-5],[36,-10]],
  [[37,-10],[37,10],[32,32],[30,32],[22,37],[12,44],[2,42],[-5,40],[-12,44],[-25,35],[-34,27],[-35,20],[-30,17],[-18,12],[-5,12],[5,10],[5,1],[0,-2],[5,-7],[10,-15],[15,-17],[20,-17],[25,-14],[32,-5],[37,-10]],
  [[42,28],[45,40],[50,40],[55,40],[60,50],[66,60],[70,70],[72,100],[70,140],[65,140],[55,135],[50,140],[45,142],[38,140],[35,132],[30,122],[22,114],[20,110],[12,108],[8,100],[5,104],[1,104],[-8,115],[-8,120],[0,130],[10,125],[20,122],[23,120],[30,105],[28,85],[26,68],[25,62],[22,60],[25,55],[30,48],[32,36],[36,36],[38,28],[42,28]],
  [[32,34],[37,36],[38,44],[35,46],[32,48],[30,48],[25,55],[22,59],[18,52],[13,44],[12,44],[15,40],[22,37],[30,32],[32,34]],
  [[-12,130],[-12,142],[-18,145],[-24,152],[-28,153],[-35,150],[-38,146],[-38,140],[-35,136],[-32,132],[-32,115],[-22,114],[-15,122],[-12,130]],
  [[31,130],[33,131],[35,134],[37,137],[40,140],[43,145],[45,142],[42,140],[38,138],[35,132],[33,129],[31,130]],
  [[50,-6],[51,1],[53,0],[55,-2],[58,-4],[58,-6],[56,-7],[54,-8],[52,-10],[50,-6]],
]

function insidePoly(lat: number, lon: number, poly: [number, number][]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i], [yj, xj] = poly[j]
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi)
      inside = !inside
  }
  return inside
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function continentDots(landN: number, oceanN: number): Pt3[] {
  const rng = mulberry32(42), pts: Pt3[] = []
  let attempts = 0
  while (pts.length < landN && attempts < landN * 40) {
    attempts++
    const lat = (rng() * 2 - 1) * 80, lon = (rng() * 2 - 1) * 180
    for (const poly of CONTINENTS) {
      if (insidePoly(lat, lon, poly)) { pts.push(ll(lat, lon)); break }
    }
  }
  for (const p of fiboSphere(oceanN)) pts.push(p)
  return pts
}

function ll(lat: number, lon: number): Pt3 {
  const la = lat * Math.PI / 180, lo = lon * Math.PI / 180
  return { x: Math.cos(la) * Math.sin(lo), y: -Math.sin(la), z: Math.cos(la) * Math.cos(lo) }
}
function rY(p: Pt3, a: number): Pt3 { const c = Math.cos(a), s = Math.sin(a); return { x: p.x*c - p.z*s, y: p.y, z: p.x*s + p.z*c } }
function rX(p: Pt3, a: number): Pt3 { const c = Math.cos(a), s = Math.sin(a); return { x: p.x, y: p.y*c - p.z*s, z: p.y*s + p.z*c } }

/* ── City pins ───────────────────────────────────────────── */
interface Pin { point: Pt3; phase: number }

const COORDS: [number, number][] = [
  [48.86,2.35],[51.51,-0.13],[41.39,2.17],[41.90,12.50],[52.52,13.41],[45.46,9.19],
  [48.21,16.37],[59.33,18.07],[38.72,-9.14],[45.76,4.84],[43.30,5.37],[53.35,-6.26],
  [40.71,-74.01],[34.05,-118.24],[41.88,-87.63],[25.76,-80.19],[43.65,-79.38],
  [19.43,-99.13],[37.77,-122.42],[45.50,-73.57],
  [35.68,139.69],[37.57,126.98],[1.35,103.82],[13.76,100.50],[22.32,114.17],[31.23,121.47],[35.01,135.77],
  [25.20,55.27],[24.71,46.68],[41.01,28.98],
  [-33.93,18.42],[33.59,-7.59],[30.04,31.24],[6.52,3.38],
  [-33.87,151.21],[-36.85,174.76],[-37.81,144.96],
  [-22.91,-43.17],[-23.55,-46.63],[-34.60,-58.38],[4.71,-74.07],
  [55.76,37.62],
]

const ARCS: [number, number][] = [
  [0,1],[0,2],[0,5],[0,9],[0,4],[1,11],[2,3],[3,5],[4,6],[5,6],[7,4],[8,2],[9,10],[10,3],
  [12,14],[12,15],[12,16],[13,18],[14,16],[15,17],[16,19],[12,19],
  [20,21],[20,26],[22,23],[23,24],[24,25],[25,20],
  [0,12],[1,12],[12,20],[13,20],[1,27],[27,22],[0,41],[22,34],[34,36],[20,34],
  [12,37],[15,37],[37,38],[38,39],[39,40],[29,27],[27,28],[29,3],[32,27],[31,0],[30,1],[33,1],[34,35],
  [0,20],[1,22],[12,27],[13,34],[38,1],[27,20],[30,27],[41,20],[39,0],[14,1],
]

/* ── Photo cards ─────────────────────────────────────────── */
interface Card { id: string; fx: number; fy: number; w: number; h: number; rot: number; img: string }

const ALL_CARDS: Card[] = [
  { id:'c1',  fx:-0.28, fy:-0.26, w:160, h:200, rot:-5, img:'/images/card-1.jpg' },
  { id:'c2',  fx: 0.26, fy:-0.30, w:155, h:194, rot: 4, img:'/images/card-2.jpg' },
  { id:'c3',  fx: 0.30, fy:-0.08, w:145, h:207, rot:-3, img:'/images/card-3.jpg' },
  { id:'c4',  fx:-0.32, fy: 0.06, w:150, h:200, rot: 5, img:'/images/card-4.jpg' },
  { id:'c5',  fx: 0.04, fy:-0.34, w:150, h:200, rot: 2, img:'/images/card-5.jpg' },
  { id:'c6',  fx:-0.24, fy: 0.28, w:190, h:142, rot:-4, img:'/images/card-6.jpg' },
  { id:'c7',  fx: 0.28, fy: 0.24, w:140, h:196, rot: 3, img:'/images/card-7.jpg' },
  { id:'c8',  fx:-0.06, fy: 0.32, w:140, h:210, rot:-6, img:'/images/card-8.jpg' },
  { id:'c9',  fx:-0.34, fy:-0.12, w:190, h:142, rot: 3, img:'/images/card-9.jpg' },
  { id:'c10', fx: 0.34, fy: 0.10, w:190, h:142, rot:-5, img:'/images/card-10.jpg' },
  { id:'c11', fx: 0.14, fy: 0.30, w:150, h:200, rot: 4, img:'/images/card-11.jpg' },
  { id:'c12', fx:-0.30, fy: 0.20, w:185, h:139, rot:-2, img:'/images/card-12.jpg' },
]

/* ── Breakpoint config ───────────────────────────────────── */
type BP = 'mobile' | 'tablet' | 'desktop'

interface Cfg {
  globeR: number; landDots: number; oceanDots: number
  pinN: number; cardN: number; end: string
  tilt: number; cardScale: number; posScale: number
}

const CFGS: Record<BP, Cfg> = {
  desktop: { globeR: 380, landDots: 1800, oceanDots: 400, pinN: 42, cardN: 12, end: '+=400%', tilt: -0.35, cardScale: 1,    posScale: 1    },
  tablet:  { globeR: 290, landDots: 1200, oceanDots: 300, pinN: 28, cardN: 8,  end: '+=350%', tilt: -0.30, cardScale: 0.75, posScale: 0.80 },
  mobile:  { globeR: 160, landDots: 700,  oceanDots: 200, pinN: 14, cardN: 12, end: '+=300%', tilt: -0.25, cardScale: 0.55, posScale: 0.60 },
}

function getBP(): BP {
  const w = window.innerWidth
  return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop'
}

/* ── Component ───────────────────────────────────────────── */
export default function Hero() {
  const heroRef   = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scrollProg = useRef(0)
  const globeAlpha = useRef({ v: 1 })
  const pinPow     = useRef({ v: 1 })
  const gScale     = useRef({ v: 1 })
  const { t } = useLanguage()
  const [bp, setBp] = useState<BP>(getBP)
  const cfg  = CFGS[bp]
  const cards = useMemo(() => ALL_CARDS.slice(0, cfg.cardN), [cfg.cardN])

  useEffect(() => {
    const fn = () => setBp(getBP())
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  /* ── Globe canvas ───────────────────────────────────────── */
  useEffect(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ctx = cvs.getContext('2d')!

    const dpr  = Math.min(window.devicePixelRatio || 1, 2)
    const dots = continentDots(cfg.landDots, cfg.oceanDots)
    const pins: Pin[] = COORDS.slice(0, cfg.pinN).map(([lat, lon], i) => ({
      point: ll(lat, lon), phase: i * 0.71,
    }))

    let cw = 0, ch = 0, animId = 0, elapsed = 0, autoA = 0, lastT = 0

    function resize() {
      const r = cvs!.getBoundingClientRect()
      cw = r.width; ch = r.height
      cvs!.width  = cw * dpr
      cvs!.height = ch * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    function render() {
      const cx = cw / 2, cy = ch / 2
      const R    = cfg.globeR * gScale.current.v
      const tilt = cfg.tilt
      const rot  = autoA + scrollProg.current * Math.PI * 0.6

      ctx.clearRect(0, 0, cw, ch)
      ctx.globalAlpha = globeAlpha.current.v

      /* atmosphere glow */
      const glowR = Math.min(R * 1.4, cw / 2)
      const glow  = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, glowR)
      glow.addColorStop(0,    'rgba(217,79,42,0.14)')
      glow.addColorStop(0.30, 'rgba(217,79,42,0.06)')
      glow.addColorStop(0.60, 'rgba(217,79,42,0.02)')
      glow.addColorStop(1,    'transparent')
      ctx.fillStyle = glow
      ctx.beginPath(); ctx.arc(cx, cy, glowR, 0, Math.PI * 2); ctx.fill()

      /* inner surface */
      const inner = ctx.createRadialGradient(cx, cy, 0, cx, cy, R)
      inner.addColorStop(0,   'rgba(255,255,255,0.012)')
      inner.addColorStop(0.7, 'rgba(255,255,255,0.008)')
      inner.addColorStop(1,   'transparent')
      ctx.fillStyle = inner
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill()

      /* edge ring */
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'
      ctx.lineWidth = 1.2; ctx.stroke()

      /* dots — alpha-bucketed */
      const landCount = cfg.landDots
      const buckets   = new Map<string, [number, number, number][]>()
      for (let di = 0; di < dots.length; di++) {
        const d      = dots[di]
        const p      = rX(rY(d, rot), tilt)
        if (p.z < -0.05) continue
        const px = cx + p.x * R, py = cy + p.y * R
        const isLand = di < landCount
        const a = isLand
            ? Math.max(0, p.z * 0.6 + 0.08)
            : Math.max(0, p.z * 0.25 + 0.02)
        const k  = (Math.round(a * 20) / 20).toFixed(2)
        const sz = isLand
            ? Math.max(0.5, 0.9 + p.z * 0.7)
            : Math.max(0.3, 0.4 + p.z * 0.3)
        if (!buckets.has(k)) buckets.set(k, [])
        buckets.get(k)!.push([px, py, sz])
      }
      for (const [a, pts] of buckets) {
        ctx.fillStyle = `rgba(255,255,255,${a})`
        ctx.beginPath()
        for (const [x, y, s] of pts) { ctx.moveTo(x + s, y); ctx.arc(x, y, s, 0, Math.PI * 2) }
        ctx.fill()
      }

      /* network arcs */
      for (const [ai, bi] of ARCS) {
        if (ai >= pins.length || bi >= pins.length) continue
        const pa = rX(rY(pins[ai].point, rot), tilt)
        const pb = rX(rY(pins[bi].point, rot), tilt)
        if (pa.z < 0.15 || pb.z < 0.15) continue
        const raw = {
          x: (pins[ai].point.x + pins[bi].point.x) / 2,
          y: (pins[ai].point.y + pins[bi].point.y) / 2,
          z: (pins[ai].point.z + pins[bi].point.z) / 2,
        }
        const len  = Math.sqrt(raw.x ** 2 + raw.y ** 2 + raw.z ** 2) || 1
        const lift = 1.2
        const mid  = rX(rY({ x: raw.x/len*lift, y: raw.y/len*lift, z: raw.z/len*lift }, rot), tilt)
        if (mid.z < 0) continue
        ctx.beginPath()
        ctx.moveTo(cx + pa.x * R, cy + pa.y * R)
        ctx.quadraticCurveTo(cx + mid.x * R * lift, cy + mid.y * R * lift, cx + pb.x * R, cy + pb.y * R)
        ctx.strokeStyle = `rgba(217,79,42,${Math.min(pa.z, pb.z) * 0.35})`
        ctx.lineWidth = 1; ctx.stroke()
      }

      /* pins */
      const pw = pinPow.current.v
      for (const pin of pins) {
        const p = rX(rY(pin.point, rot), tilt)
        if (p.z < 0.1) continue
        const px = cx + p.x * R, py = cy + p.y * R, al = p.z

        /* outer glow */
        const gr = 20 * al * pw
        const g  = ctx.createRadialGradient(px, py, 0, px, py, gr)
        g.addColorStop(0,   `rgba(217,79,42,${al * 0.7 * pw})`)
        g.addColorStop(0.5, `rgba(217,79,42,${al * 0.2 * pw})`)
        g.addColorStop(1,   'rgba(217,79,42,0)')
        ctx.beginPath(); ctx.arc(px, py, gr, 0, Math.PI * 2)
        ctx.fillStyle = g; ctx.fill()

        /* pulse dot */
        const pulse = 1 + Math.sin(elapsed * 2.5 + pin.phase) * 0.18
        ctx.beginPath(); ctx.arc(px, py, 4 * pulse * al * Math.min(pw, 1.2), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(217,79,42,${al})`; ctx.fill()

        /* bright center */
        ctx.beginPath(); ctx.arc(px, py, 2 * al, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,180,140,${al})`; ctx.fill()
      }

      ctx.globalAlpha = 1
    }

    function loop(now: number) {
      const dt = lastT ? (now - lastT) / 1000 : 0.016
      lastT = now
      autoA   += 0.09 * dt
      elapsed += dt
      render()
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [bp, cfg])

  /* ── GSAP ScrollTrigger ──────────────────────────────────── */
  useLayoutEffect(() => {
    globeAlpha.current.v = 1
    pinPow.current.v     = 1
    gScale.current.v     = 1

    let gsapCtx: { revert: () => void } | null = null

    const init = async () => {
      const { default: gsap }  = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      gsapCtx = gsap.context(() => {
        gsap.set('.photo-card', { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 })
        gsap.from('.hero-center', { opacity: 0, y: 30, duration: 1.2, delay: 0.3, ease: 'power3.out' })
        gsap.from(canvasRef.current, { opacity: 0, scale: 0.96, duration: 1.6, ease: 'power3.out' })

        const ps = cfg.posScale
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            pin: true, scrub: 1.2,
            start: 'top top', end: cfg.end,
            anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => { scrollProg.current = self.progress },
          },
        })

        tl.to(pinPow.current,     { v: 1.6,  duration: 0.12, ease: 'power1.inOut' }, 0.22)
        tl.to(gScale.current,     { v: 1.06, duration: 0.15, ease: 'power2.inOut' }, 0.22)
        tl.to(globeAlpha.current, { v: 0.45, duration: 0.15, ease: 'power1.inOut' }, 0.32)
        tl.to(pinPow.current,     { v: 0.7,  duration: 0.10 }, 0.38)

        tl.to('.photo-card', {
          x: (i: number) => cards[i].fx * ps * window.innerWidth,
          y: (i: number) => cards[i].fy * ps * window.innerHeight,
          scale: 1, opacity: 1,
          rotation: (i: number) => cards[i].rot,
          stagger: { each: 0.018, from: 'center' },
          duration: 0.25, ease: 'power2.out',
        }, 0.38)

        tl.to('.photo-card', {
          x: (i: number) => cards[i].fx * ps * window.innerWidth  * 1.3,
          y: (i: number) => cards[i].fy * ps * window.innerHeight * 1.3,
          opacity:  (i: number) => i % 3 === 0 ? 0 : 0.6,
          rotation: (i: number) => cards[i].rot + (i % 2 === 0 ? 8 : -8),
          scale:    (i: number) => i % 4 === 0 ? 0.7 : 1.05,
          stagger: 0.008, duration: 0.25, ease: 'none',
        }, 0.70)

        tl.to(globeAlpha.current, { v: 0.18, duration: 0.20, ease: 'power1.inOut' }, 0.72)
        tl.to(gScale.current,     { v: 0.97, duration: 0.20 }, 0.72)

        setTimeout(() => ScrollTrigger.refresh(), 150)
      }, heroRef)
    }

    init()
    return () => { if (gsapCtx) gsapCtx.revert() }
  }, [bp, cfg, cards])

  const isM = bp === 'mobile'
  const isT = bp === 'tablet'

  return (
      <div ref={heroRef}>
        <section
            className="relative h-screen w-full bg-[#0a0a08]"
            style={{ overflow: 'hidden', clipPath: 'inset(0)' }}
        >
          {/* Globe canvas */}
          <div
              className="absolute z-10 pointer-events-none"
              style={isM ? {
                width: '100%', height: '100vw',
                left: 0, top: '50%', transform: 'translateY(-50%)',
              } : {
                inset: 0, width: '100%', height: '100%',
              }}
          >
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          </div>

          {/* Photo cards */}
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            {cards.map(c => (
                <div
                    key={c.id}
                    className="photo-card absolute rounded-xl overflow-hidden"
                    style={{
                      top: '50%', left: '50%',
                      width:  c.w * cfg.cardScale,
                      height: c.h * cfg.cardScale,
                      boxShadow: '0 8px 40px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.3)',
                      willChange: 'transform, opacity',
                    }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.img} alt="" loading="eager" draggable={false}
                       className="w-full h-full object-cover select-none" />
                </div>
            ))}
          </div>

          {/* Vignette */}
          <div className="absolute inset-0 z-30 pointer-events-none" style={{
            background: `radial-gradient(ellipse ${isM ? '52% 44%' : '42% 36%'} at 50% 50%, rgba(10,10,8,0.82) 0%, rgba(10,10,8,0.45) 40%, rgba(10,10,8,0.08) 70%, transparent 100%)`,
          }} />

          {/* Hero content */}
          <div
              className="hero-center absolute inset-0 z-40 flex flex-col items-center justify-center"
              style={{ padding: isM ? '0 20px' : '0 24px' }}
          >
            <h1 className="font-dm text-white text-center" style={{
              fontSize: isM ? '1.35rem' : isT ? '1.85rem' : '2.2rem',
              lineHeight: 1.25, fontWeight: 700,
              maxWidth: isM ? '280px' : isT ? '480px' : '720px',
              letterSpacing: '-0.01em',
            }}>
              {t('hero_title_line1')}{' '}
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>{t('hero_title_line2')}</span>
            </h1>

            <p className="font-dm text-white/55 text-center" style={{
              fontSize: isM ? '0.82rem' : isT ? '0.95rem' : '1.05rem',
              lineHeight: 1.45, fontWeight: 400,
              maxWidth: isM ? '240px' : isT ? '440px' : '540px',
              marginTop: isM ? 10 : 18,
            }}>
              {t('hero_subtitle_line1')}{' '}{t('hero_subtitle_line2')}
            </p>

            <div style={{
              display: 'flex',
              flexDirection: isM ? 'column' : 'row',
              marginTop: isM ? 12 : 28,
              gap: isM ? 8 : 14,
              width: isM ? '100%' : 'auto',
              alignItems: 'center',
            }}>
              <Link
                  href="/creator"
                  className="font-dm bg-white text-[#0a0a08] rounded-full uppercase transition-all duration-300 hover:bg-white/90 hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center"
                  style={{
                    height: isM ? 38 : isT ? 46 : 50,
                    paddingInline: isM ? 20 : 28,
                    fontSize: isM ? 11 : 13, fontWeight: 600, letterSpacing: '0.08em',
                    textDecoration: 'none',
                    ...(isM ? { width: '100%', maxWidth: 200 } : {}),
                  }}
              >
                {t('hero_btn_creators')}
              </Link>
              <Link
                  href="/business"
                  className="font-dm text-white rounded-full uppercase transition-all duration-300 hover:bg-white/5 hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center"
                  style={{
                    height: isM ? 38 : isT ? 46 : 50,
                    paddingInline: isM ? 20 : 28,
                    fontSize: isM ? 11 : 13, fontWeight: 600, letterSpacing: '0.08em',
                    border: '1px solid rgba(255,255,255,.25)',
                    backdropFilter: 'blur(8px)',
                    textDecoration: 'none',
                    ...(isM ? { width: '100%', maxWidth: 200 } : {}),
                  }}
              >
                {t('hero_btn_businesses')}
              </Link>
            </div>
          </div>

          {/* Film grain */}
          <div className="grain-overlay absolute inset-0 z-50 pointer-events-none" />
        </section>

        <div className="bg-[#0a0a08]" style={{ height: 1 }} />
      </div>
  )
}
