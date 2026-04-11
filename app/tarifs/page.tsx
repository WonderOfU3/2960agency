'use client'

import Link from 'next/link'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { useLanguage } from '@/context/LanguageContext'

/* ── Data ──────────────────────────────────────────────────── */

const PLANS = [
    {
        id: 'free',
        name: 'Sans abonnement',
        nameEn: 'Pay as you go',
        price: '0',
        unit: '€/mois',
        unitEn: '€/month',
        sub: 'puis 35€ / collab',
        subEn: 'then €35 / collab',
        tag: null,
        desc: 'Pour tester ponctuellement ou faire des collabs de temps en temps sans engagement.',
        descEn: 'For occasional collabs with no commitment.',
        bullets: [
            'Accès complet à la plateforme',
            'Publication d\'offres illimitée',
            'Matching avec créateurs',
            'Paiement uniquement si collab complétée',
        ],
        bulletsEn: [
            'Full platform access',
            'Unlimited offer posting',
            'Creator matching',
            'Pay only when a collab is completed',
        ],
        benchmarks: ['1 collab = 35€', '2 collabs = 70€', '4 collabs = 140€'],
        benchmarksEn: ['1 collab = €35', '2 collabs = €70', '4 collabs = €140'],
        cta: 'Commencer gratuitement',
        ctaEn: 'Start for free',
        highlight: false,
        accent: false,
    },
    {
        id: 'basic',
        name: 'Basic',
        nameEn: 'Basic',
        price: '29',
        unit: '€/mois',
        unitEn: '€/month',
        sub: '1 collab incluse, puis 20€/collab',
        subEn: '1 collab included, then €20/collab',
        tag: null,
        desc: 'Pour les établissements qui veulent démarrer sérieusement sans trop s\'engager.',
        descEn: 'For venues that want to start properly without over-committing.',
        bullets: [
            '1 collab incluse / mois',
            '20€ par collab supplémentaire',
            'Tout le socle plateforme',
            'Coût réduit sur les collabs en plus',
        ],
        bulletsEn: [
            '1 collab included / month',
            '€20 per additional collab',
            'Full platform access',
            'Lower cost on extra collabs',
        ],
        benchmarks: ['1 collab = 29€', '2 collabs = 49€', '3 collabs = 69€'],
        benchmarksEn: ['1 collab = €29', '2 collabs = €49', '3 collabs = €69'],
        cta: 'Choisir Basic',
        ctaEn: 'Choose Basic',
        highlight: false,
        accent: false,
    },
    {
        id: 'active',
        name: 'Active',
        nameEn: 'Active',
        price: '69',
        unit: '€/mois',
        unitEn: '€/month',
        sub: '4 collabs incluses, puis 12€/collab',
        subEn: '4 collabs included, then €12/collab',
        tag: 'Le plus populaire',
        tagEn: 'Most popular',
        desc: 'Pour les établissements qui veulent activer plusieurs créateurs chaque mois.',
        descEn: 'For venues that want to activate multiple creators every month.',
        bullets: [
            '4 collabs incluses / mois',
            '12€ par collab supplémentaire',
            'Tout le socle plateforme',
            'Meilleur rapport usage / coût',
        ],
        bulletsEn: [
            '4 collabs included / month',
            '€12 per additional collab',
            'Full platform access',
            'Best usage / cost ratio',
        ],
        benchmarks: ['4 collabs = 69€', '6 collabs = 93€', '8 collabs = 117€'],
        benchmarksEn: ['4 collabs = €69', '6 collabs = €93', '8 collabs = €117'],
        cta: 'Choisir Active',
        ctaEn: 'Choose Active',
        highlight: true,
        accent: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        nameEn: 'Pro',
        price: '119',
        unit: '€/mois',
        unitEn: '€/month',
        sub: 'Collabs illimitées*',
        subEn: 'Unlimited collabs*',
        tag: null,
        desc: 'Pour les établissements qui intègrent les collabs dans leur stratégie régulière.',
        descEn: 'For venues that make creator collabs a core part of their strategy.',
        bullets: [
            'Usage illimité de la plateforme',
            'Collabs illimitées*',
            'Accès aux add-ons premium',
            'Liberté totale, budget prévisible',
        ],
        bulletsEn: [
            'Unlimited platform usage',
            'Unlimited collabs*',
            'Access to premium add-ons',
            'Total freedom, predictable budget',
        ],
        benchmarks: ['9 collabs = 119€', '12 collabs = 119€', '20 collabs = 119€'],
        benchmarksEn: ['9 collabs = €119', '12 collabs = €119', '20 collabs = €119'],
        cta: 'Choisir Pro',
        ctaEn: 'Choose Pro',
        highlight: false,
        accent: true,
    },
]

const ADDONS = [
    {
        id: 'assist',
        name: '2960 Assist',
        price: '+249',
        unit: '€/mois',
        unitEn: '€/month',
        total: 'soit 368€/mois avec Pro',
        totalEn: '€368/month with Pro',
        badge: 'Add-on Pro',
        desc: 'Pour les établissements qui veulent utiliser 2960 sans gérer eux-mêmes le suivi.',
        descEn: 'For venues that want to use 2960 without managing the follow-up themselves.',
        bullets: [
            'Aide à sélectionner les bons créateurs',
            'Lancement des collaborations',
            'Suivi des échanges & collabs en cours',
            'Récupération des contenus',
            'Updates via groupe WhatsApp',
        ],
        bulletsEn: [
            'Help selecting the right creators',
            'Collab launch support',
            'Follow-up on exchanges & active collabs',
            'Content retrieval',
            'Updates via WhatsApp group',
        ],
    },
    {
        id: 'managed',
        name: '2960 Managed',
        price: '+399',
        unit: '€/mois',
        unitEn: '€/month',
        total: 'soit 518€/mois avec Pro',
        totalEn: '€518/month with Pro',
        badge: 'Add-on Pro',
        desc: 'Une vraie gestion complète des collaborations et du contenu. Presque "on s\'en occupe pour vous".',
        descEn: 'Full collab and content management. Almost "we handle it for you".',
        bullets: [
            'Tout ce qu\'il y a dans Assist',
            'Sélection proactive des créateurs',
            'Pilotage complet des collabs',
            'Tri & organisation des contenus',
            'Captions et préparation des posts',
            'Programmation des publications',
        ],
        bulletsEn: [
            'Everything in Assist',
            'Proactive creator selection',
            'Full collab management',
            'Content sorting & organization',
            'Captions & post preparation',
            'Publication scheduling',
        ],
    },
]

/* ── Component ─────────────────────────────────────────────── */

export default function TarifsPage() {
    const { locale } = useLanguage()
    const fr = locale === 'fr'
    const [hovered, setHovered] = useState<string | null>(null)

    return (
        <div style={{ background: '#0c0b09', minHeight: '100vh' }}>
            <Navbar />

            {/* Top glow */}
            <div className="fixed inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse 60% 35% at 50% -5%, rgba(217,79,42,0.07) 0%, transparent 65%)',
            }} />

            <div className="relative" style={{ paddingTop: 120, paddingBottom: 120 }}>
                <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 20px' }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 72 }}>
                        {/* Trial badge */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: 'rgba(217,79,42,0.08)',
                            border: '1px solid rgba(217,79,42,0.2)',
                            borderRadius: 999, padding: '8px 18px',
                            marginBottom: 28,
                        }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D94F2A' }} />
                            <span className="font-dm" style={{ fontSize: 12, fontWeight: 600, color: '#D94F2A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {fr ? 'Essai de lancement : 30 jours + 3 collabs offertes' : 'Launch offer: 30 days + 3 free collabs'}
              </span>
                        </div>

                        <h1 className="font-dm text-white" style={{
                            fontSize: 'clamp(2rem, 5vw, 3rem)',
                            fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1,
                            marginBottom: 16,
                        }}>
                            {fr ? 'Tarifs simples, sans surprise.' : 'Simple pricing, no surprises.'}
                        </h1>
                        <p className="font-dm" style={{
                            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                            color: 'rgba(255,255,255,0.5)', lineHeight: 1.6,
                            maxWidth: 480, margin: '0 auto',
                        }}>
                            {fr
                                ? 'Commencez gratuitement. Montez en puissance quand vous en avez besoin.'
                                : 'Start for free. Scale up when you need to.'}
                        </p>
                    </div>

                    {/* Plans grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: 16,
                        marginBottom: 80,
                    }}>
                        {PLANS.map(plan => (
                            <div
                                key={plan.id}
                                onMouseEnter={() => setHovered(plan.id)}
                                onMouseLeave={() => setHovered(null)}
                                style={{
                                    background: plan.highlight ? 'rgba(255,255,255,0.04)' : '#191714',
                                    border: plan.highlight
                                        ? '1px solid rgba(255,255,255,0.18)'
                                        : plan.accent
                                            ? '1px solid rgba(217,79,42,0.25)'
                                            : '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: 20,
                                    padding: '28px 24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    transition: 'border-color 0.2s, transform 0.2s',
                                    transform: hovered === plan.id ? 'translateY(-3px)' : 'none',
                                    boxShadow: plan.highlight
                                        ? '0 0 40px rgba(255,255,255,0.04)'
                                        : plan.accent
                                            ? '0 0 40px rgba(217,79,42,0.06)'
                                            : 'none',
                                }}
                            >
                                {/* Tag */}
                                {(plan.tag || plan.tagEn) && (
                                    <div style={{
                                        position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                                        background: '#fff', color: '#0a0a08',
                                        borderRadius: 999, padding: '4px 14px',
                                        fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                                        textTransform: 'uppercase', whiteSpace: 'nowrap',
                                    }} className="font-dm">
                                        {fr ? plan.tag : plan.tagEn}
                                    </div>
                                )}

                                {/* Plan name */}
                                <p className="font-dm" style={{
                                    fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    color: plan.accent ? '#D94F2A' : 'rgba(255,255,255,0.45)',
                                    marginBottom: 16,
                                }}>
                                    {fr ? plan.name : plan.nameEn}
                                </p>

                                {/* Price */}
                                <div style={{ marginBottom: 6 }}>
                  <span className="font-dm text-white" style={{
                      fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1,
                  }}>
                    {plan.price}
                  </span>
                                    <span className="font-dm" style={{
                                        fontSize: 14, color: 'rgba(255,255,255,0.4)', marginLeft: 4,
                                    }}>
                    {fr ? plan.unit : plan.unitEn}
                  </span>
                                </div>

                                <p className="font-dm" style={{
                                    fontSize: 13, color: 'rgba(255,255,255,0.4)',
                                    marginBottom: 24, lineHeight: 1.4,
                                }}>
                                    {fr ? plan.sub : plan.subEn}
                                </p>

                                {/* Divider */}
                                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />

                                {/* Description */}
                                <p className="font-dm" style={{
                                    fontSize: 13, color: 'rgba(255,255,255,0.45)',
                                    marginBottom: 20, lineHeight: 1.6,
                                }}>
                                    {fr ? plan.desc : plan.descEn}
                                </p>

                                {/* Bullets */}
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {(fr ? plan.bullets : plan.bulletsEn).map((b, i) => (
                                        <li key={i} className="font-dm" style={{
                                            fontSize: 13, color: 'rgba(200,195,185,0.7)',
                                            display: 'flex', alignItems: 'flex-start', gap: 10,
                                        }}>
                                            <svg style={{ flexShrink: 0, marginTop: 2 }} width="13" height="13" viewBox="0 0 13 13" fill="none">
                                                <circle cx="6.5" cy="6.5" r="6.5" fill={plan.accent ? 'rgba(217,79,42,0.15)' : 'rgba(255,255,255,0.06)'} />
                                                <path d="M3.5 6.5L5.5 8.5L9 5" stroke={plan.accent ? '#D94F2A' : 'rgba(255,255,255,0.5)'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            {b}
                                        </li>
                                    ))}
                                </ul>

                                {/* Benchmarks */}
                                <div style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 12, padding: '12px 14px',
                                    marginBottom: 24,
                                }}>
                                    <p className="font-dm" style={{
                                        fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
                                        textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
                                        marginBottom: 8,
                                    }}>
                                        {fr ? 'Repères' : 'Examples'}
                                    </p>
                                    {(fr ? plan.benchmarks : plan.benchmarksEn).map((b, i) => (
                                        <p key={i} className="font-dm" style={{
                                            fontSize: 12.5, color: 'rgba(255,255,255,0.45)',
                                            lineHeight: 1.8,
                                        }}>
                                            {b}
                                        </p>
                                    ))}
                                </div>

                                {/* CTA */}
                                <div style={{ marginTop: 'auto' }}>
                                    <Link
                                        href="/business"
                                        className="font-dm"
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            width: '100%', height: 46,
                                            borderRadius: 999,
                                            fontSize: 12, fontWeight: 600,
                                            letterSpacing: '0.07em', textTransform: 'uppercase',
                                            textDecoration: 'none',
                                            transition: 'all 0.2s',
                                            ...(plan.highlight
                                                    ? { background: '#fff', color: '#0a0a08' }
                                                    : plan.accent
                                                        ? { background: '#D94F2A', color: '#fff' }
                                                        : { background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }
                                            ),
                                        }}
                                    >
                                        {fr ? plan.cta : plan.ctaEn}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add-ons header */}
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: 'rgba(252,250,166,0.04)',
                            border: '1px solid rgba(252,250,166,0.1)',
                            borderRadius: 999, padding: '7px 16px',
                            marginBottom: 20,
                        }}>
              <span className="font-dm" style={{
                  fontSize: 11, fontWeight: 600, color: 'rgba(252,250,166,0.6)',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {fr ? 'Réservé aux clients Pro' : 'Pro clients only'}
              </span>
                        </div>
                        <h2 className="font-dm text-white" style={{
                            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                            fontWeight: 700, letterSpacing: '-0.02em',
                            marginBottom: 12,
                        }}>
                            {fr ? 'Add-ons premium' : 'Premium add-ons'}
                        </h2>
                        <p className="font-dm" style={{
                            fontSize: 15, color: 'rgba(255,255,255,0.45)',
                            maxWidth: 440, margin: '0 auto', lineHeight: 1.6,
                        }}>
                            {fr
                                ? 'Vous voulez déléguer ? On s\'en occupe.'
                                : 'Want to delegate? We handle it.'}
                        </p>
                    </div>

                    {/* Add-ons grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: 16,
                        marginBottom: 80,
                    }}>
                        {ADDONS.map(addon => (
                            <div
                                key={addon.id}
                                style={{
                                    background: '#191714',
                                    border: '1px solid rgba(252,250,166,0.08)',
                                    borderRadius: 20,
                                    padding: '32px 28px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                {/* Badge */}
                                <div style={{ marginBottom: 20 }}>
                  <span className="font-dm" style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: 'rgba(252,250,166,0.5)',
                      background: 'rgba(252,250,166,0.06)',
                      border: '1px solid rgba(252,250,166,0.1)',
                      borderRadius: 999, padding: '4px 10px',
                  }}>
                    {addon.badge}
                  </span>
                                </div>

                                <p className="font-dm text-white" style={{
                                    fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 8,
                                }}>
                                    {addon.name}
                                </p>

                                <div style={{ marginBottom: 4 }}>
                  <span className="font-dm text-white" style={{
                      fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1,
                  }}>
                    {addon.price}
                  </span>
                                    <span className="font-dm" style={{
                                        fontSize: 14, color: 'rgba(255,255,255,0.4)', marginLeft: 4,
                                    }}>
                    {fr ? addon.unit : addon.unitEn}
                  </span>
                                </div>

                                <p className="font-dm" style={{
                                    fontSize: 12.5, color: 'rgba(252,250,166,0.4)',
                                    marginBottom: 24,
                                }}>
                                    {fr ? addon.total : addon.totalEn}
                                </p>

                                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />

                                <p className="font-dm" style={{
                                    fontSize: 13.5, color: 'rgba(255,255,255,0.5)',
                                    marginBottom: 24, lineHeight: 1.6,
                                }}>
                                    {fr ? addon.desc : addon.descEn}
                                </p>

                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                                    {(fr ? addon.bullets : addon.bulletsEn).map((b, i) => (
                                        <li key={i} className="font-dm" style={{
                                            fontSize: 13.5, color: 'rgba(200,195,185,0.65)',
                                            display: 'flex', alignItems: 'flex-start', gap: 10,
                                        }}>
                                            <svg style={{ flexShrink: 0, marginTop: 3 }} width="13" height="13" viewBox="0 0 13 13" fill="none">
                                                <circle cx="6.5" cy="6.5" r="6.5" fill="rgba(252,250,166,0.06)" />
                                                <path d="M3.5 6.5L5.5 8.5L9 5" stroke="rgba(252,250,166,0.45)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Footer note + CTA */}
                    <div style={{
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 20, padding: '40px 24px',
                    }}>
                        <p className="font-dm" style={{
                            fontSize: 12, color: 'rgba(255,255,255,0.2)',
                            marginBottom: 28, lineHeight: 1.7,
                        }}>
                            * {fr
                            ? 'Usage illimité dans le cadre d\'un usage raisonnable de la plateforme. Une collab est comptabilisée quand un créateur est sélectionné, la collaboration a bien lieu, et le contenu convenu est livré ou publié.'
                            : 'Unlimited within fair use of the platform. A collab is counted when a creator is selected, the collab takes place, and the agreed content is delivered or published.'}
                        </p>
                        <h3 className="font-dm text-white" style={{
                            fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                            fontWeight: 700, marginBottom: 12,
                        }}>
                            {fr ? 'Prêt à démarrer ?' : 'Ready to start?'}
                        </h3>
                        <p className="font-dm" style={{
                            fontSize: 14, color: 'rgba(255,255,255,0.4)',
                            marginBottom: 28,
                        }}>
                            {fr
                                ? '30 jours d\'essai + 3 collabs offertes pour tout nouvel établissement.'
                                : '30-day trial + 3 free collabs for every new venue.'}
                        </p>
                        <Link
                            href="/business"
                            className="font-dm"
                            style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                height: 50, paddingInline: 36,
                                background: '#D94F2A', color: '#fff',
                                borderRadius: 999,
                                fontSize: 13, fontWeight: 600, letterSpacing: '0.08em',
                                textTransform: 'uppercase', textDecoration: 'none',
                                transition: 'opacity 0.2s',
                            }}
                        >
                            {fr ? 'Inscrire mon restaurant' : 'Register my restaurant'}
                        </Link>
                    </div>

                </div>
            </div>

            {/* Grain */}
            <div className="grain-overlay fixed inset-0 pointer-events-none" style={{ zIndex: 9998 }} />
        </div>
    )
}
