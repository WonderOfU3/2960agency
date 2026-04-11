'use client'

import React, { createContext, useContext, useState } from 'react'

export type Locale = 'fr' | 'en'

export interface TranslationStrings {
  nav_howItWorks: string; nav_pricing: string; nav_contact: string
  nav_login: string; nav_langSwitch: string
  hero_title_line1: string; hero_title_line2: string
  hero_subtitle_line1: string; hero_subtitle_line2: string
  hero_btn_creators: string; hero_btn_businesses: string
  hiw_title: string; hiw_subtitle: string; hiw_intro: string
  hiw_creators_title: string
  hiw_creators_s1_title: string; hiw_creators_s1_desc: string
  hiw_creators_s2_title: string; hiw_creators_s2_desc: string
  hiw_creators_s3_title: string; hiw_creators_s3_desc: string
  hiw_creators_s4_title: string; hiw_creators_s4_desc: string
  hiw_creators_cta: string
  hiw_businesses_title: string
  hiw_businesses_s1_title: string; hiw_businesses_s1_desc: string
  hiw_businesses_s2_title: string; hiw_businesses_s2_desc: string
  hiw_businesses_s3_title: string; hiw_businesses_s3_desc: string
  hiw_businesses_s4_title: string; hiw_businesses_s4_desc: string
  hiw_businesses_cta: string
}

const FR: TranslationStrings = {
  nav_howItWorks: 'Comment ça marche', nav_pricing: 'Tarifs',
  nav_contact: 'Contact', nav_login: 'Connexion', nav_langSwitch: 'ENGLISH',
  hero_title_line1: 'La plateforme qui fait grandir les créateurs',
  hero_title_line2: 'et les adresses qui comptent.',
  hero_subtitle_line1: 'Plus de visibilité, plus de contenu, plus d\u2019opportunités',
  hero_subtitle_line2: 'grâce à des collaborations simples et puissantes.',
  hero_btn_creators: 'Créateurs',
  hero_btn_businesses: 'Entreprises',
  hiw_title: 'Comment ça marche\u00a0?', hiw_subtitle: 'Une plateforme, deux côtés, un même objectif\u00a0: grandir ensemble.', hiw_intro: '',
  hiw_creators_title: 'Pour les créateurs',
  hiw_creators_s1_title: 'Crée ton profil', hiw_creators_s1_desc: 'Ajoute tes réseaux, ton univers et le type de contenu que tu crées.',
  hiw_creators_s2_title: 'Découvre des collaborations', hiw_creators_s2_desc: 'Accède à des opportunités avec des restaurants, coffee shops et autres adresses qui recherchent de la visibilité.',
  hiw_creators_s3_title: 'Postule aux opportunités qui te correspondent', hiw_creators_s3_desc: 'Choisis les collaborations qui matchent avec ton style, ta niche et ton audience.',
  hiw_creators_s4_title: 'Crée, publie, grandis', hiw_creators_s4_desc: 'Réalise la collaboration, développe ton portfolio et fais évoluer ton profil vers plus d\u2019opportunités.',
  hiw_creators_cta: 'Je suis créateur',
  hiw_businesses_title: 'Pour les entreprises',
  hiw_businesses_s1_title: 'Présente ton adresse', hiw_businesses_s1_desc: 'Crée ton profil et montre ton univers, ton lieu et ce que tu recherches.',
  hiw_businesses_s2_title: 'Trouve les bons créateurs', hiw_businesses_s2_desc: 'Découvre des profils adaptés à ton image, ton audience et tes objectifs.',
  hiw_businesses_s3_title: 'Lance des collaborations simplement', hiw_businesses_s3_desc: 'Choisis les profils les plus pertinents et active du contenu plus facilement.',
  hiw_businesses_s4_title: 'Gagne en visibilité', hiw_businesses_s4_desc: 'Obtiens plus de contenu, développe ta présence en ligne et fais découvrir ton adresse à de nouvelles audiences.',
  hiw_businesses_cta: 'Je suis une entreprise',
}

const EN: TranslationStrings = {
  nav_howItWorks: 'How it works', nav_pricing: 'Pricing',
  nav_contact: 'Contact', nav_login: 'Login', nav_langSwitch: 'FRANÇAIS',
  hero_title_line1: 'The platform that grows creators',
  hero_title_line2: 'and the places that matter.',
  hero_subtitle_line1: 'More visibility, more content, more opportunities',
  hero_subtitle_line2: 'through simple and powerful collaborations.',
  hero_btn_creators: 'Creators',
  hero_btn_businesses: 'Businesses',
  hiw_title: 'How it works', hiw_subtitle: 'One platform, two sides, one shared goal: growing together.', hiw_intro: '',
  hiw_creators_title: 'For creators',
  hiw_creators_s1_title: 'Create your profile', hiw_creators_s1_desc: 'Add your socials, your universe, and the type of content you create.',
  hiw_creators_s2_title: 'Discover collaborations', hiw_creators_s2_desc: 'Access opportunities with restaurants, coffee shops, and other venues looking for visibility.',
  hiw_creators_s3_title: 'Apply to the right opportunities', hiw_creators_s3_desc: 'Choose collaborations that match your style, niche, and audience.',
  hiw_creators_s4_title: 'Create, publish, grow', hiw_creators_s4_desc: 'Complete the collaboration, build your portfolio, and unlock more opportunities.',
  hiw_creators_cta: "I'm a creator",
  hiw_businesses_title: 'For businesses',
  hiw_businesses_s1_title: 'Showcase your venue', hiw_businesses_s1_desc: 'Create your profile and show your universe, your place, and what you\'re looking for.',
  hiw_businesses_s2_title: 'Find the right creators', hiw_businesses_s2_desc: 'Discover profiles tailored to your brand, audience, and goals.',
  hiw_businesses_s3_title: 'Launch collaborations easily', hiw_businesses_s3_desc: 'Pick the most relevant profiles and activate content effortlessly.',
  hiw_businesses_s4_title: 'Gain visibility', hiw_businesses_s4_desc: 'Get more content, grow your online presence, and introduce your venue to new audiences.',
  hiw_businesses_cta: "I'm a business",
}

const TRANSLATIONS: Record<Locale, TranslationStrings> = { fr: FR, en: EN }

interface LanguageContextType {
  locale: Locale
  t: (key: keyof TranslationStrings) => string
  toggleLocale: () => void
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'fr', t: (k) => FR[k], toggleLocale: () => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('fr')
  const toggleLocale = () => setLocale(p => p === 'fr' ? 'en' : 'fr')
  const t = (key: keyof TranslationStrings) => TRANSLATIONS[locale][key]
  return (
    <LanguageContext.Provider value={{ locale, t, toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() { return useContext(LanguageContext) }
