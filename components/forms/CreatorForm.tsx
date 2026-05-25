'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import {
  FormShell, TextField, TextareaField, PillSelect, RadioCards,
  FileUploadZone, LinkInputs, SectionTitle, HighlightBox, Divider,
  type FileEntry,
} from './ui'
import {
  SPOKEN_LANGUAGES, CONTENT_LANGUAGES, ARRONDISSEMENTS, COLLAB_DISTANCE, COLLAB_AVAILABILITY,
  RESTAURANT_TYPES, COFFEE_ANSWER, COFFEE_LIKES, PHOTOGENIC_ANSWER, WHAT_MATTERS,
  PLACE_TYPE, COLLAB_PREFERENCE, PLATFORMS, PREVIOUS_COLLABS, POSTED_CONTENT,
  CREATOR_NICHE, AUDIENCE_SIZE,
} from './data'
import type { Locale } from '@/context/LanguageContext'

const T: Record<Locale, Record<string, string>> = {
  fr: {
    title: "Rejoins __2960 AGENCY__ en tant que créateur",
    subtitle: "Remplis le formulaire ci-dessous pour postuler. On revient vers toi rapidement.",
    step1: "À propos de toi", step2: "Tes quartiers", step3: "Tes goûts",
    step4: "Tes collabs idéales", step5: "Ton contenu",
    next: "Suivant", prev: "Précédent",
    submit: "Créer mon compte", submitting: "Création en cours…", back: "Retour à l'accueil",
    username: "Nom d'utilisateur", phUsername: "ex: marie_food",
    usernameHint: "Visible par les restaurants — lettres, chiffres et _ uniquement",
    usernameTaken: "Ce nom d'utilisateur est déjà pris",
    usernameChecking: "Vérification…",
    firstName: "Prénom", lastName: "Nom", email: "Adresse e-mail", phone: "Téléphone",
    password: "Mot de passe", passwordHelp: "Minimum 8 caractères",
    tiktok: "TikTok", instagram: "Instagram", city: "Ville",
    languages: "Langues parlées", contentLang: "Langue(s) de création de contenu",
    phFirst: "Ex : Marie", phLast: "Ex : Dupont", phEmail: "marie@exemple.com",
    phPhone: "+33 6 12 34 56 78", phTiktok: "@toncompte", phInsta: "@toncompte",
    phCity: "Ex : Paris, Montréal…",
    arrondissements: "Arrondissements parisiens préférés",
    otherAreas: "Autres quartiers que tu aimes",
    collabDistance: "Jusqu'où irais-tu pour une collab ?",
    collabAvailability: "Disponibilités pour les collabs",
    phAreas: "Ex : Boulogne, Saint-Denis, Vincennes…",
    restaurantTypes: "Types de restaurants que tu aimes",
    otherCuisines: "Autres cuisines que tu aimes",
    dietaryRestrictions: "As-tu des restrictions alimentaires ?",
    phDietary: "Ex : Halal, casher, végétarien, sans gluten…",
    coffeeShops: "Tu aimes les coffee shops ?",
    coffeeLikes: "Qu'est-ce que tu aimes dans un coffee shop ?",
    photogenic: "Si un restaurant a une super bouffe mais n'est pas photogénique, ça te dérange ?",
    whatMatters: "Qu'est-ce qui compte le plus pour toi dans un lieu ?", maxThree: "(max 3)",
    phCuisines: "Ex : Péruvien, Mexicain…",
    placeType: "Quel type de lieu te correspond le mieux ?",
    placesDislike: "Des lieux ou types que tu n'aimes PAS ?",
    dreamPlace: "Un restaurant ou coffee shop à Paris dont tu rêves ?",
    collabPref: "Quand tu fais une collab, tu préfères :",
    platforms: "Tu préfères créer sur :",
    prevCollabs: "As-tu déjà fait des collabs avec des restaurants ou des marques food ?",
    prevCollabsDetail: "Si oui, lesquelles ?",
    phDislike: "Ex : Chaînes, fast food…",
    phDream: "Ex : Café de Flore, Maison Plisson…",
    phDetail: "Ex : Un restaurant de sushi à Paris…",
    niche: "Ta niche",
    audienceSize: "Ton audience (abonnés TikTok ou Instagram)",
    exTitle: "Tes exemples de contenu",
    exSubtitle: "Montre-nous ton style. Tu peux partager des liens vers des vidéos déjà publiées, ou uploader quelques exemples.",
    exMicro: "Pas de minimum d'abonnés. Ce qui compte pour nous, c'est ta créativité, ton style et la qualité de ton contenu.",
    posted: "As-tu déjà du contenu publié sur tes comptes ?",
    links: "Partage jusqu'à 3 liens vers tes meilleures vidéos",
    addLink: "+ Ajouter un lien", phLink: "https://www.instagram.com/reel/… ou https://www.tiktok.com/…",
    upload: "Upload 1 à 3 vidéos d'exemples",
    uploadBtn: "Choisir des fichiers", uploadDrop: "ou glisse-dépose tes vidéos ici",
    uploadFmt: "MP4 ou MOV • 50 Mo max par fichier",
    contentNote: "Quelque chose à ajouter sur ton contenu ?",
    phNote: "Ex : Je débute, je crée du meilleur contenu que ce qui est sur mon profil…",
    req: "Ce champ est requis", invEmail: "Adresse e-mail invalide",
    invUrl: "URL invalide", invDomain: "Utilise un lien Instagram ou TikTok",
    needSocial: "Ajoute au moins TikTok",
    needProof: "Ajoute au moins un lien ou uploade une vidéo",
    acceptCGU: "J'ai lu et j'accepte les Conditions Générales d'Utilisation de 2960 Agency. Je certifie être majeur(e) et utiliser la Plateforme en qualité de créateur indépendant.",
    privacyNotice: "En créant un compte, vous reconnaissez avoir pris connaissance de la",
    privacyLink: "Politique de Confidentialité",
    submitErr: "Une erreur est survenue. Réessaie.",
  },
  en: {
    title: "Join __2960 AGENCY__ as a creator",
    subtitle: "Fill out the form below to apply. We'll get back to you quickly.",
    step1: "About you", step2: "Your areas", step3: "Your tastes",
    step4: "Your ideal collabs", step5: "Your content",
    next: "Next", prev: "Previous",
    submit: "Create my account", submitting: "Creating…", back: "Back to home",
    username: "Username", phUsername: "e.g. marie_food",
    usernameHint: "Visible to restaurants — letters, numbers and _ only",
    usernameTaken: "This username is already taken",
    usernameChecking: "Checking…",
    firstName: "First name", lastName: "Last name", email: "Email address", phone: "Phone",
    password: "Password", passwordHelp: "Minimum 8 characters",
    tiktok: "TikTok", instagram: "Instagram", city: "City",
    languages: "Languages you speak", contentLang: "Language(s) you create content in",
    phFirst: "e.g. Jane", phLast: "e.g. Smith", phEmail: "jane@example.com",
    phPhone: "+1 514 123 4567", phTiktok: "@youraccount", phInsta: "@youraccount",
    phCity: "e.g. Paris, Montreal…",
    arrondissements: "Favorite Paris arrondissements",
    otherAreas: "Other areas you like",
    collabDistance: "How far would you go for a collab?",
    collabAvailability: "Availability for collabs",
    phAreas: "e.g. Boulogne, Saint-Denis…",
    restaurantTypes: "Restaurant types you like", otherCuisines: "Other cuisines you like",
    dietaryRestrictions: "Do you have any dietary restrictions?",
    phDietary: "e.g. Halal, kosher, vegetarian, gluten-free…",
    coffeeShops: "Do you like coffee shops?",
    coffeeLikes: "What do you like in a coffee shop?",
    photogenic: "If a restaurant has amazing food but isn't photogenic, does that bother you?",
    whatMatters: "What matters most to you in a place?", maxThree: "(max 3)",
    phCuisines: "e.g. Peruvian, Mexican…",
    placeType: "What type of place fits you best?",
    placesDislike: "Any places or types you do NOT like?",
    dreamPlace: "A restaurant or coffee shop in Paris you dream of trying?",
    collabPref: "When doing a collab, you prefer:",
    platforms: "You prefer creating on:",
    prevCollabs: "Have you done collabs with restaurants or food brands before?",
    prevCollabsDetail: "If yes, which ones?",
    phDislike: "e.g. Chains, fast food…",
    phDream: "e.g. Café de Flore, Maison Plisson…",
    phDetail: "e.g. A sushi restaurant in Paris…",
    niche: "Your niche",
    audienceSize: "Your audience (TikTok or Instagram followers)",
    exTitle: "Your content examples",
    exSubtitle: "Show us your style. Share links to videos you've already posted, or upload examples.",
    exMicro: "No follower minimum. We care about your creativity, your style, and the quality of your content.",
    posted: "Do you already have content posted on your accounts?",
    links: "Share up to 3 links to your best videos",
    addLink: "+ Add a link", phLink: "https://www.instagram.com/reel/… or https://www.tiktok.com/…",
    upload: "Upload 1 to 3 example videos",
    uploadBtn: "Choose files", uploadDrop: "or drag and drop your videos here",
    uploadFmt: "MP4 or MOV • 50 MB max per file",
    contentNote: "Anything you'd like us to know about your content?",
    phNote: "e.g. I'm just starting, I create better content than what's on my profile…",
    req: "This field is required", invEmail: "Invalid email address",
    invUrl: "Invalid URL", invDomain: "Please use an Instagram or TikTok link",
    needSocial: "TikTok is required",
    needProof: "Add at least one link or upload a video",
    acceptCGU: "I have read and accept the General Terms of Use of 2960 Agency. I certify that I am of legal age and that I am using the Platform as an independent creator.",
    privacyNotice: "By creating an account, you acknowledge having read the",
    privacyLink: "Privacy Policy",
    submitErr: "Something went wrong. Please try again.",
  },
}

interface State {
  username: string; firstName: string; lastName: string; email: string; phone: string; password: string
  tiktok: string; instagram: string; city: string
  languages: string[]; contentLang: string[]
  arrondissements: string[]; otherAreas: string; collabDistance: string; collabAvailability: string[]
  restaurantTypes: string[]; otherCuisines: string; dietaryRestrictions: string
  coffeeShops: string; coffeeLikes: string[]
  photogenic: string; whatMatters: string[]
  placeType: string; placesDislike: string; dreamPlace: string
  collabPref: string; platforms: string[]
  prevCollabs: string; prevCollabsDetail: string
  niche: string[]; audienceSize: string
  postedContent: string; contentLinks: string[]; contentNote: string
  acceptCGU: boolean
}

const INIT: State = {
  username: '', firstName: '', lastName: '', email: '', phone: '', password: '',
  tiktok: '', instagram: '', city: '',
  languages: [], contentLang: [],
  arrondissements: [], otherAreas: '', collabDistance: '', collabAvailability: [],
  restaurantTypes: [], otherCuisines: '', dietaryRestrictions: '',
  coffeeShops: '', coffeeLikes: [],
  photogenic: '', whatMatters: [],
  placeType: '', placesDislike: '', dreamPlace: '',
  collabPref: '', platforms: [],
  prevCollabs: '', prevCollabsDetail: '',
  niche: [], audienceSize: '',
  postedContent: '', contentLinks: [''], contentNote: '',
  acceptCGU: false,
}

export default function CreatorForm() {
  const { locale } = useLanguage()
  const router = useRouter()
  const t = T[locale]

  const [step, setStep]             = useState(0)
  const [form, setForm]             = useState<State>(INIT)
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [files, setFiles]           = useState<FileEntry[]>([])

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const set = (k: keyof State, v: string | string[]) => {
    setForm(p => ({ ...p, [k]: v }))
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n })
  }

  const toggle = (k: keyof State, v: string) => {
    setForm(p => {
      const arr = p[k] as string[]
      return { ...p, [k]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] }
    })
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n })
  }

  const toggleMax = (k: keyof State, v: string, max: number) => {
    setForm(p => {
      const arr = p[k] as string[]
      if (arr.includes(v)) return { ...p, [k]: arr.filter(x => x !== v) }
      if (arr.length >= max) return p
      return { ...p, [k]: [...arr, v] }
    })
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n })
  }

  const addFiles = (fl: FileList) => {
    const newFiles: FileEntry[] = []
    for (let i = 0; i < fl.length && files.length + newFiles.length < 3; i++) {
      const f = fl[i]
      if (!f.name.match(/\.(mp4|mov)$/i)) continue
      if (f.size > 50 * 1024 * 1024) continue
      newFiles.push({ file: f, id: crypto.randomUUID(), progress: 0, status: 'idle' })
    }
    setFiles(p => [...p, ...newFiles])
    if (errors.files) setErrors(p => { const n = { ...p }; delete n.files; return n })
  }

  const removeFile = (id: string) => setFiles(p => p.filter(f => f.id !== id))
  const setLink    = (i: number, v: string) => { setForm(p => { const l = [...p.contentLinks]; l[i] = v; return { ...p, contentLinks: l } }); if (errors.contentLinks) setErrors(p => { const n = { ...p }; delete n.contentLinks; return n }) }
  const addLink    = () => setForm(p => ({ ...p, contentLinks: [...p.contentLinks, ''] }))
  const removeLink = (i: number) => setForm(p => ({ ...p, contentLinks: p.contentLinks.filter((_, j) => j !== i) }))

  const showContentFields = form.postedContent !== ''

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {}
    if (s === 0) {
      if (!form.username.trim() || form.username.length < 3) e.username = t.req
      if (!/^[a-zA-Z0-9_]*$/.test(form.username)) e.username = t.usernameHint
      if (!form.firstName.trim()) e.firstName = t.req
      if (!form.lastName.trim())  e.lastName  = t.req
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t.invEmail
      if (!form.phone.trim()) e.phone = t.req
      if (!form.password.trim() || form.password.length < 8) e.password = t.passwordHelp
      if (!form.tiktok.trim()) e.tiktok = t.needSocial
      if (!form.city.trim()) e.city = t.req
      if (form.languages.length === 0) e.languages = t.req
      if (form.contentLang.length === 0) e.contentLang = t.req
    }
    if (s === 1) {
      if (form.arrondissements.length === 0) e.arrondissements = t.req
      if (!form.collabDistance) e.collabDistance = t.req
      if (form.collabAvailability.length === 0) e.collabAvailability = t.req
    }
    if (s === 2) {
      if (form.restaurantTypes.length === 0) e.restaurantTypes = t.req
      if (!form.coffeeShops) e.coffeeShops = t.req
      if (!form.photogenic) e.photogenic = t.req
      if (form.whatMatters.length === 0) e.whatMatters = t.req
    }
    if (s === 3) {
      if (!form.placeType) e.placeType = t.req
      if (!form.collabPref) e.collabPref = t.req
      if (form.platforms.length === 0) e.platforms = t.req
      if (!form.prevCollabs) e.prevCollabs = t.req
    }
    if (s === 4) {
      if (form.niche.length === 0) e.niche = t.req
      if (!form.audienceSize) e.audienceSize = t.req
      if (!form.postedContent) e.postedContent = t.req
      if (form.postedContent === 'yes') {
        if (!form.contentLinks.some(l => l.trim())) e.contentLinks = t.req
      }
      if (form.postedContent === 'no') {
        if (files.length === 0) e.files = t.req
      }
      if (form.postedContent === 'a_little') {
        if (!form.contentLinks.some(l => l.trim()) && files.length === 0) e.contentLinks = t.needProof
      }
      if (!form.acceptCGU) e.acceptCGU = t.req
    }
    setErrors(e)
    if (Object.keys(e).length > 0) {
      setTimeout(() => document.querySelector('[data-e]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
    }
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate(step)) { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) } }
  const prev = () => { setStep(s => s - 1); setErrors({}); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const handleSubmit = async () => {
    if (!validate(step)) return
    setSubmitting(true)
    try {
      // Upload video files to Cloudinary
      const uploadedUrls: string[] = []
      for (const entry of files) {
        const formData = new FormData()
        formData.append('file', entry.file)
        formData.append('folder', '2960agency/creators')
        const upRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (upRes.ok) {
          const { url } = await upRes.json()
          uploadedUrls.push(url)
        }
      }

      const payload = {
        username: form.username.trim().toLowerCase(),
        firstName: form.firstName.trim(), lastName: form.lastName.trim(),
        email: form.email.trim(), phone: form.phone.trim(), password: form.password,
        tiktok: form.tiktok.trim(), instagram: form.instagram.trim() || null,
        city: form.city.trim(), languages: form.languages, contentLang: form.contentLang,
        arrondissements: form.arrondissements, otherAreas: form.otherAreas.trim() || null,
        collabDistance: form.collabDistance, collabAvailability: form.collabAvailability,
        restaurantTypes: form.restaurantTypes, otherCuisines: form.otherCuisines.trim() || null,
        dietaryRestrictions: form.dietaryRestrictions.trim() || null,
        coffeeShops: form.coffeeShops, coffeeLikes: form.coffeeLikes,
        photogenic: form.photogenic, whatMatters: form.whatMatters,
        placeType: form.placeType, placesDislike: form.placesDislike.trim() || null,
        dreamPlace: form.dreamPlace.trim() || null,
        collabPref: form.collabPref, platforms: form.platforms,
        prevCollabs: form.prevCollabs, prevCollabsDetail: form.prevCollabsDetail.trim() || null,
        niche: form.niche, audienceSize: form.audienceSize,
        postedContent: form.postedContent,
        contentLinks: form.contentLinks.filter(l => l.trim()),
        contentNote: form.contentNote.trim() || null,
        fileNames: files.map(f => f.file.name),
        cloudinaryUrls: uploadedUrls,
        locale,
      }
      const res = await fetch('/api/submit-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      if (data.ambassadorCode) {
        localStorage.setItem('creatorAmbassadorCode', data.ambassadorCode)
      }
      router.push('/creator/success')
    } catch {
      setErrors({ submit: t.submitErr })
      setSubmitting(false)
    }
  }

  const steps = [t.step1, t.step2, t.step3, t.step4, t.step5]

  return (
      <FormShell
          title={t.title} subtitle={t.subtitle}
          stepLabels={steps} currentStep={step}
          onNext={next} onPrev={prev} onSubmit={handleSubmit} submitting={submitting}
          nextLabel={t.next} prevLabel={t.prev}
          submitLabel={submitting ? t.submitting : t.submit}
          backHref="/" backLabel={t.back} locale={locale}
      >
        {step === 0 && (
            <div className="form-fields">
              <TextField label={t.username} value={form.username} onChange={v => set('username', v.replace(/[^a-zA-Z0-9_]/g, ''))} placeholder={t.phUsername} error={errors.username} required locale={locale} autoComplete="username" hint={t.usernameHint} />
              <div className="form-grid-2">
                <TextField label={t.firstName} value={form.firstName} onChange={v => set('firstName', v)} placeholder={t.phFirst} error={errors.firstName} required locale={locale} autoComplete="given-name" />
                <TextField label={t.lastName} value={form.lastName} onChange={v => set('lastName', v)} placeholder={t.phLast} error={errors.lastName} required locale={locale} autoComplete="family-name" />
              </div>
              <TextField label={t.email} value={form.email} onChange={v => set('email', v)} placeholder={t.phEmail} error={errors.email} required locale={locale} type="email" autoComplete="email" />
              <div className="form-grid-2">
                <TextField label={t.phone} value={form.phone} onChange={v => set('phone', v)} placeholder={t.phPhone} error={errors.phone} required locale={locale} type="tel" autoComplete="tel" />
                <TextField label={t.password} value={form.password} onChange={v => set('password', v)} placeholder={t.passwordHelp} error={errors.password} required locale={locale} type="password" autoComplete="new-password" />
              </div>
              <Divider />
              <div className="form-grid-2">
                <TextField label={t.tiktok} value={form.tiktok} onChange={v => set('tiktok', v)} placeholder={t.phTiktok} error={errors.tiktok} required locale={locale} prefix="@" />
                <TextField label={t.instagram} value={form.instagram} onChange={v => set('instagram', v)} placeholder={t.phInsta} locale={locale} prefix="@" />
              </div>
              <TextField label={t.city} value={form.city} onChange={v => set('city', v)} placeholder={t.phCity} error={errors.city} required locale={locale} />
              <Divider />
              <PillSelect label={t.languages} options={SPOKEN_LANGUAGES} selected={form.languages} onToggle={v => toggle('languages', v)} error={errors.languages} required locale={locale} />
              <PillSelect label={t.contentLang} options={CONTENT_LANGUAGES} selected={form.contentLang} onToggle={v => toggle('contentLang', v)} error={errors.contentLang} required locale={locale} />
            </div>
        )}

        {step === 1 && (
            <div className="form-fields">
              <PillSelect label={t.arrondissements} options={ARRONDISSEMENTS} selected={form.arrondissements} onToggle={v => toggle('arrondissements', v)} error={errors.arrondissements} required locale={locale} compact />
              <TextField label={t.otherAreas} value={form.otherAreas} onChange={v => set('otherAreas', v)} placeholder={t.phAreas} locale={locale} />
              <RadioCards label={t.collabDistance} options={COLLAB_DISTANCE} selected={form.collabDistance} onChange={v => set('collabDistance', v)} error={errors.collabDistance} required locale={locale} />
              <PillSelect label={t.collabAvailability} options={COLLAB_AVAILABILITY} selected={form.collabAvailability} onToggle={v => toggle('collabAvailability', v)} error={errors.collabAvailability} required locale={locale} />
            </div>
        )}

        {step === 2 && (
            <div className="form-fields">
              <PillSelect label={t.restaurantTypes} options={RESTAURANT_TYPES} selected={form.restaurantTypes} onToggle={v => toggle('restaurantTypes', v)} error={errors.restaurantTypes} required locale={locale} />
              <TextField label={t.otherCuisines} value={form.otherCuisines} onChange={v => set('otherCuisines', v)} placeholder={t.phCuisines} locale={locale} />
              <TextField label={t.dietaryRestrictions} value={form.dietaryRestrictions} onChange={v => set('dietaryRestrictions', v)} placeholder={t.phDietary} locale={locale} />
              <Divider />
              <RadioCards label={t.coffeeShops} options={COFFEE_ANSWER} selected={form.coffeeShops} onChange={v => set('coffeeShops', v)} error={errors.coffeeShops} required locale={locale} />
              {form.coffeeShops && form.coffeeShops !== 'not_really' && (
                  <div className="animate-fade-in">
                    <PillSelect label={t.coffeeLikes} options={COFFEE_LIKES} selected={form.coffeeLikes} onToggle={v => toggle('coffeeLikes', v)} locale={locale} />
                  </div>
              )}
              <Divider />
              <RadioCards label={t.photogenic} options={PHOTOGENIC_ANSWER} selected={form.photogenic} onChange={v => set('photogenic', v)} error={errors.photogenic} required locale={locale} />
              <PillSelect label={t.whatMatters} options={WHAT_MATTERS} selected={form.whatMatters} onToggle={v => toggleMax('whatMatters', v, 3)} error={errors.whatMatters} required locale={locale} max={3} maxLabel={t.maxThree} />
            </div>
        )}

        {step === 3 && (
            <div className="form-fields">
              <RadioCards label={t.placeType} options={PLACE_TYPE} selected={form.placeType} onChange={v => set('placeType', v)} error={errors.placeType} required locale={locale} />
              <TextField label={t.placesDislike} value={form.placesDislike} onChange={v => set('placesDislike', v)} placeholder={t.phDislike} locale={locale} />
              <TextField label={t.dreamPlace} value={form.dreamPlace} onChange={v => set('dreamPlace', v)} placeholder={t.phDream} locale={locale} />
              <Divider />
              <RadioCards label={t.collabPref} options={COLLAB_PREFERENCE} selected={form.collabPref} onChange={v => set('collabPref', v)} error={errors.collabPref} required locale={locale} />
              <PillSelect label={t.platforms} options={PLATFORMS} selected={form.platforms} onToggle={v => toggle('platforms', v)} error={errors.platforms} required locale={locale} />
              <Divider />
              <RadioCards label={t.prevCollabs} options={PREVIOUS_COLLABS} selected={form.prevCollabs} onChange={v => set('prevCollabs', v)} error={errors.prevCollabs} required locale={locale} />
              {form.prevCollabs === 'yes' && (
                  <div className="animate-fade-in">
                    <TextField label={t.prevCollabsDetail} value={form.prevCollabsDetail} onChange={v => set('prevCollabsDetail', v)} placeholder={t.phDetail} locale={locale} />
                  </div>
              )}
            </div>
        )}

        {step === 4 && (
            <div className="form-fields">
              <div>
                <SectionTitle>{t.exTitle}</SectionTitle>
                <p className="font-dm text-[#c8c3b8]/40 text-[13px] leading-relaxed" style={{ marginTop: -4, marginBottom: 8 }}>{t.exSubtitle}</p>
              </div>
              <HighlightBox>{t.exMicro}</HighlightBox>
              <Divider />
              <PillSelect label={t.niche} options={CREATOR_NICHE} selected={form.niche} onToggle={v => toggle('niche', v)} error={errors.niche} required locale={locale} />
              <RadioCards label={t.audienceSize} options={AUDIENCE_SIZE} selected={form.audienceSize} onChange={v => set('audienceSize', v)} error={errors.audienceSize} required locale={locale} />
              <Divider />
              <PillSelect label={t.posted} options={POSTED_CONTENT}
                          selected={form.postedContent ? [form.postedContent] : []}
                          onToggle={v => { set('postedContent', v); setErrors(p => { const n = { ...p }; delete n.postedContent; delete n.contentLinks; delete n.files; return n }) }}
                          error={errors.postedContent} required locale={locale} />
              {showContentFields && (
                  <div className="form-fields animate-fade-in">
                    <LinkInputs label={t.links} links={form.contentLinks} onSet={setLink} onAdd={addLink} onRemove={removeLink} required={form.postedContent === 'yes' || form.postedContent === 'a_little'} error={errors.contentLinks} locale={locale} placeholder={t.phLink} addLabel={t.addLink} />
                    <Divider />
                    <FileUploadZone label={t.upload} files={files} onAdd={addFiles} onRemove={removeFile} required={form.postedContent === 'no'} error={errors.files} locale={locale} chooseBtnLabel={t.uploadBtn} dropLabel={t.uploadDrop} formatLabel={t.uploadFmt} />
                    <Divider />
                    <TextareaField label={t.contentNote} value={form.contentNote} onChange={v => set('contentNote', v)} placeholder={t.phNote} locale={locale} rows={2} />
                  </div>
              )}

              <Divider />

              {/* Legal checkbox — always visible on step 4 */}
              <div data-e={errors.acceptCGU ? '' : undefined}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div onClick={() => { setForm(p => ({ ...p, acceptCGU: !p.acceptCGU })); if (errors.acceptCGU) setErrors(p => { const n = { ...p }; delete n.acceptCGU; return n }) }}
                    className="flex items-center justify-center flex-shrink-0 rounded transition-all mt-0.5"
                    style={{
                      width: 20, height: 20,
                      background: form.acceptCGU ? '#E8471A' : 'transparent',
                      border: form.acceptCGU ? '2px solid #E8471A' : `2px solid ${errors.acceptCGU ? 'rgba(217,79,42,0.6)' : 'rgba(128,128,128,0.4)'}`,
                    }}>
                    {form.acceptCGU && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="font-dm text-white/50 text-[12px] leading-relaxed">
                    {t.acceptCGU.split('Conditions Générales d\'Utilisation').length > 1
                      ? <>{t.acceptCGU.split('Conditions Générales d\'Utilisation')[0]}<a href="/legal/cgu-creators" target="_blank" rel="noopener" style={{ color: '#E8471A', textDecoration: 'underline' }}>Conditions G&#233;n&#233;rales d&apos;Utilisation</a>{t.acceptCGU.split('Conditions Générales d\'Utilisation')[1]}</>
                      : <>{t.acceptCGU.split('General Terms of Use')[0]}<a href="/legal/cgu-creators" target="_blank" rel="noopener" style={{ color: '#E8471A', textDecoration: 'underline' }}>General Terms of Use</a>{t.acceptCGU.split('General Terms of Use')[1]}</>
                    }
                    <span className="text-[#D94F2A] ml-1">*</span>
                  </span>
                </label>
                {errors.acceptCGU && <p className="font-dm text-[#D94F2A]/70 text-[11px] mt-1 ml-8">{errors.acceptCGU}</p>}
              </div>

              {/* Privacy notice — always visible on step 4 */}
              <p className="font-dm text-[#c8c3b8]/40 text-[12px] leading-relaxed">
                {t.privacyNotice}{' '}
                <a href="/legal/privacy" target="_blank" rel="noopener" style={{ color: '#E8471A', textDecoration: 'underline' }}>
                  {t.privacyLink}
                </a>.
              </p>
            </div>
        )}

        {errors.submit && (
            <div className="bg-[#D94F2A]/[0.04] border border-[#D94F2A]/10 rounded-xl px-4 py-3 mt-6">
              <p className="font-dm text-[#D94F2A]/70 text-[13px] text-center">{errors.submit}</p>
            </div>
        )}
      </FormShell>
  )
}
