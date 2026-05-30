'use client'

import { useRef, useEffect, useLayoutEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'

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
  // Europe internal
  [0,1],[0,2],[0,5],[1,4],[2,3],
  // US internal
  [12,14],[13,18],[12,16],
  // Asia internal
  [20,21],[22,23],[24,25],
  // Intercontinental — the main routes
  [0,12],[1,12],    // Europe → US
  [0,20],[1,27],    // Europe → Asia/Middle East
  [12,37],          // US → South America
  [27,22],          // Middle East → Asia
  [20,34],          // Asia → Australia
  [31,0],[29,3],    // Africa → Europe
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
  desktop: { globeR: 380, landDots: 2000, oceanDots: 400, pinN: 42, cardN: 12, end: '+=400%', tilt: -0.35, cardScale: 1,    posScale: 1    },
  tablet:  { globeR: 290, landDots: 1400, oceanDots: 300, pinN: 28, cardN: 8,  end: '+=350%', tilt: -0.30, cardScale: 0.75, posScale: 0.80 },
  mobile:  { globeR: 160, landDots: 800,  oceanDots: 150, pinN: 14, cardN: 12, end: '+=300%', tilt: -0.25, cardScale: 0.55, posScale: 0.60 },
}

function getBP(): BP {
  const w = window.innerWidth
  return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop'
}

/* ── Safari / low-perf detection ─────────────────────────── */
function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /Safari/.test(ua) && !/Chrome/.test(ua)
}

/* ── Component ───────────────────────────────────────────── */
export default function Hero() {
  const heroRef   = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scrollProg = useRef(0)
  const globeAlpha = useRef({ v: 1 })
  const pinPow     = useRef({ v: 1 })
  const gScale     = useRef({ v: 1 })
  const { t, locale } = useLanguage()
  const { c } = useTheme()
  const [bp, setBp] = useState<BP>(getBP)
  const [choiceType, setChoiceType] = useState<'creator' | 'business' | null>(null)
  const safari = useRef(isSafari())
  const cfg  = CFGS[bp]
  const cards = useMemo(() => ALL_CARDS.slice(0, cfg.cardN), [cfg.cardN])

  useEffect(() => {
    const fn = () => setBp(getBP())
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  /* ── Globe (cobe WebGL) ─────────────────────────────────── */
  useEffect(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    let destroyed = false
    let globeInstance: { destroy: () => void } | null = null
    let retryCount = 0

    function initGlobe() {
      if (destroyed || !cvs) return

      // Wait until canvas has actual dimensions
      const width = cvs.offsetWidth
      if (width < 50) {
        if (retryCount < 20) {
          retryCount++
          setTimeout(initGlobe, 150)
        }
        return
      }

      import('cobe').then((mod) => {
        if (destroyed) return
        const createGlobe = mod.default
        let phi = 0
        const isLt = c.isLight

        const coords = COORDS.slice(0, cfg.pinN)

        const markers = coords.map(([lat, lon]) => ({
          location: [lat, lon] as [number, number],
          size: 0.015,
        }))

        const arcs = ARCS
          .filter(([a, b]) => a < coords.length && b < coords.length)
          .map(([a, b]) => ({
            from: [coords[a][0], coords[a][1]] as [number, number],
            to: [coords[b][0], coords[b][1]] as [number, number],
          }))

        let globe: ReturnType<typeof createGlobe>
        const dpr = safari.current ? 1 : Math.min(window.devicePixelRatio, 2)
        const samples = safari.current ? 10000 : 16000

        try {
          globe = createGlobe(cvs, {
            devicePixelRatio: dpr,
            width: width * 2,
            height: width * 2,
            phi: 0,
            theta: 0.3,
            dark: isLt ? 0 : 1,
            diffuse: isLt ? 1.2 : 0.4,
            mapSamples: samples,
            baseColor: isLt ? [0.93, 0.93, 0.96] : [0.08, 0.07, 0.06],
            mapBrightness: isLt ? 2 : 8,
            markerColor: [1, 0.35, 0.1],
            glowColor: isLt ? [0.95, 0.95, 0.97] : [0.06, 0.05, 0.04],
            markers,
            arcs,
            arcColor: [1, 0.4, 0.12],
            arcWidth: 0.25,
            arcHeight: 0.15,
            markerElevation: 0,
          })
        } catch {
          return // WebGL context lost or unavailable
        }

        let animId: number
        function animate() {
          if (destroyed || !cvs) return
          phi += 0.003
          const w = cvs.offsetWidth
          if (w > 0) {
            try {
              globe.update({
                phi: phi + scrollProg.current * Math.PI * 0.6,
                width: w * 2,
                height: w * 2,
              })
            } catch {
              return // WebGL context lost
            }
          }
          animId = requestAnimationFrame(animate)
        }
        animId = requestAnimationFrame(animate)

        cvs.style.opacity = '1'

        const origDestroy = globe.destroy.bind(globe)
        globeInstance = {
          destroy: () => { cancelAnimationFrame(animId); try { origDestroy() } catch { /* already destroyed */ } }
        }
      })
    }

    // Start after a short delay
    const timer = setTimeout(initGlobe, 200)

    return () => {
      destroyed = true
      clearTimeout(timer)
      if (globeInstance) globeInstance.destroy()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.isLight])
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
              style={{
                width: isM ? '110vw' : isT ? 'min(700px, 90vh)' : 'min(850px, 90vh)',
                height: isM ? '110vw' : isT ? 'min(700px, 90vh)' : 'min(850px, 90vh)',
                left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
          >
            <canvas ref={canvasRef} className="w-full h-full" style={{
              opacity: 0, transition: 'opacity 0.8s',
              filter: 'saturate(1.3) contrast(1.05)',
            }} />
          </div>

          {/* Photo cards */}
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            {cards.map(cd => (
                <div
                    key={cd.id}
                    className="photo-card absolute rounded-xl overflow-hidden"
                    style={{
                      top: '50%', left: '50%',
                      width:  cd.w * cfg.cardScale,
                      height: cd.h * cfg.cardScale,
                      boxShadow: c.isLight ? '0 8px 40px rgba(0,0,0,.15), 0 2px 8px rgba(0,0,0,.08)' : '0 8px 40px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.3)',
                      willChange: 'transform, opacity',
                    }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cd.img} alt="" loading="lazy" decoding="async" draggable={false}
                       className="w-full h-full object-cover select-none" />
                </div>
            ))}
          </div>

          {/* Vignette */}
          <div className="absolute inset-0 z-30 pointer-events-none" style={{
            background: c.isLight
              ? `radial-gradient(ellipse ${isM ? '52% 44%' : '42% 36%'} at 50% 50%, rgba(243,244,247,0.9) 0%, rgba(243,244,247,0.6) 40%, rgba(243,244,247,0.15) 70%, transparent 100%)`
              : `radial-gradient(ellipse ${isM ? '52% 44%' : '42% 36%'} at 50% 50%, rgba(10,10,8,0.82) 0%, rgba(10,10,8,0.45) 40%, rgba(10,10,8,0.08) 70%, transparent 100%)`,
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
              <span style={{ color: c.isLight ? '#333333' : 'rgba(255,255,255,0.55)' }}>{t('hero_title_line2')}</span>
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
              <button
                  onClick={() => setChoiceType('creator')}
                  className="font-dm bg-white text-[#0a0a08] rounded-full uppercase transition-all duration-300 hover:bg-white/90 hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center cursor-pointer"
                  style={{
                    height: isM ? 38 : isT ? 46 : 50,
                    paddingInline: isM ? 20 : 28,
                    fontSize: isM ? 11 : 13, fontWeight: 600, letterSpacing: '0.08em',
                    border: 'none',
                    ...(isM ? { width: '100%', maxWidth: 200 } : {}),
                  }}
              >
                {t('hero_btn_creators')}
              </button>
              <button
                  onClick={() => setChoiceType('business')}
                  className="font-dm text-white rounded-full uppercase transition-all duration-300 hover:bg-white/5 hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center cursor-pointer"
                  style={{
                    height: isM ? 38 : isT ? 46 : 50,
                    paddingInline: isM ? 20 : 28,
                    fontSize: isM ? 11 : 13, fontWeight: 600, letterSpacing: '0.08em',
                    border: `1px solid ${c.isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,.25)'}`,
                    backdropFilter: 'blur(8px)',
                    background: 'transparent',
                    ...(isM ? { width: '100%', maxWidth: 200 } : {}),
                  }}
              >
                {t('hero_btn_businesses')}
              </button>
            </div>

            {/* Choice modal — login or signup */}
            {choiceType && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}
                onClick={() => setChoiceType(null)}>
                <div className="w-full max-w-sm rounded-2xl p-6 animate-fade-in" style={{
                  background: c.isLight ? '#fff' : '#1a1815',
                  border: `1px solid ${c.divider}`,
                  boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                }} onClick={e => e.stopPropagation()}>
                  <h3 className="font-dm text-[18px] font-bold text-center mb-2" style={{ color: c.text }}>
                    {choiceType === 'creator'
                      ? (t('hero_btn_creators'))
                      : (t('hero_btn_businesses'))}
                  </h3>
                  <p className="font-dm text-[13px] text-center mb-6" style={{ color: c.textMuted }}>
                    {locale === 'fr'
                      ? choiceType === 'creator'
                        ? 'Rejoins 2960 Agency et accède aux meilleures collabs de Paris !'
                        : 'Boostez votre visibilité avec des créateurs de contenu locaux !'
                      : choiceType === 'creator'
                        ? 'Join 2960 Agency and access the best collabs in Paris!'
                        : 'Boost your visibility with local content creators!'}
                  </p>

                  <div className="space-y-3">
                    <Link href={choiceType === 'creator' ? '/creator' : '/business'}
                      className="font-dm w-full flex items-center justify-center text-[14px] font-semibold py-3.5 rounded-xl transition-all hover:brightness-110"
                      style={{ background: '#E8471A', color: '#fff', textDecoration: 'none' }}>
                      {locale === 'fr' ? 'Créer mon compte' : 'Create my account'}
                    </Link>
                    <Link href={choiceType === 'creator' ? '/creator/login' : '/restaurant/login'}
                      className="font-dm w-full flex items-center justify-center text-[14px] font-semibold py-3.5 rounded-xl transition-all hover:brightness-110"
                      style={{
                        background: c.isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
                        color: c.isLight ? '#333' : 'rgba(255,255,255,0.7)',
                        textDecoration: 'none',
                        border: `1px solid ${c.divider}`,
                      }}>
                      {locale === 'fr' ? 'J\'ai déjà un compte' : 'I already have an account'}
                    </Link>
                  </div>

                  <button onClick={() => setChoiceType(null)}
                    className="font-dm w-full text-[12px] mt-4 py-2 cursor-pointer transition-all"
                    style={{ color: c.textMuted, background: 'none', border: 'none' }}>
                    {locale === 'fr' ? 'Fermer' : 'Close'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Film grain */}
          <div className="grain-overlay absolute inset-0 z-50 pointer-events-none" />
        </section>

        <div className="bg-[#0a0a08]" style={{ height: 1 }} />
      </div>
  )
}
