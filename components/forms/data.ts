import type { Locale } from '@/context/LanguageContext'

export type L = { fr: string; en: string }
export interface Opt { value: string; label: L }

const l = (fr: string, en: string): L => ({ fr, en })

/* ─── Creator: Languages ─── */
export const SPOKEN_LANGUAGES: Opt[] = [
  { value: 'french',     label: l('Français',   'French') },
  { value: 'english',    label: l('Anglais',    'English') },
  { value: 'spanish',    label: l('Espagnol',   'Spanish') },
  { value: 'arabic',     label: l('Arabe',      'Arabic') },
  { value: 'portuguese', label: l('Portugais',  'Portuguese') },
  { value: 'italian',    label: l('Italien',    'Italian') },
  { value: 'german',     label: l('Allemand',   'German') },
  { value: 'other',      label: l('Autre',      'Other') },
]

export const CONTENT_LANGUAGES: Opt[] = [
  { value: 'french',  label: l('Français', 'French') },
  { value: 'english', label: l('Anglais',  'English') },
  { value: 'both',    label: l('Les deux', 'Both') },
  { value: 'other',   label: l('Autre',    'Other') },
]

/* ─── Creator: Location ─── */
export const ARRONDISSEMENTS: Opt[] = Array.from({ length: 20 }, (_, i) => ({
  value: `${i + 1}`,
  label: l(
    `${i + 1}${i === 0 ? 'er' : 'e'}`,
    `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}`,
  ),
}))

export const COLLAB_DISTANCE: Opt[] = [
  { value: 'my_area',  label: l('Mon arrondissement uniquement', 'My arrondissement only') },
  { value: 'nearby',   label: l('Quelques arrondissements proches', 'A few nearby ones') },
  { value: 'all_paris', label: l('Tout Paris', 'All of Paris') },
  { value: 'outside',  label: l('Même en dehors de Paris', 'Outside Paris too') },
]

/* ─── Creator: Food ─── */
export const RESTAURANT_TYPES: Opt[] = [
  { value: 'sushi',        label: l('Sushi / Japonais',      'Sushi / Japanese') },
  { value: 'italian',      label: l('Italien',               'Italian') },
  { value: 'lebanese',     label: l('Libanais',              'Lebanese') },
  { value: 'korean',       label: l('Coréen',                'Korean') },
  { value: 'chinese',      label: l('Chinois',               'Chinese') },
  { value: 'thai',         label: l('Thaï',                  'Thai') },
  { value: 'indian',       label: l('Indien',                'Indian') },
  { value: 'french_bistro', label: l('Français / Bistro',   'French / Bistro') },
  { value: 'brunch',       label: l('Brunch',                'Brunch') },
  { value: 'burgers',      label: l('Burgers',               'Burgers') },
  { value: 'street_food',  label: l('Street food',           'Street food') },
  { value: 'mediterranean', label: l('Méditerranéen',        'Mediterranean') },
  { value: 'healthy',      label: l('Healthy',               'Healthy') },
  { value: 'vegan',        label: l('Vegan / Végétarien',    'Vegan / Vegetarian') },
  { value: 'pastry',       label: l('Pâtisseries / Desserts','Pastries / Desserts') },
  { value: 'everything',   label: l('Je mange de tout',      'I eat everything') },
]

export const DIETARY_RESTRICTIONS: Opt[] = [
  { value: 'halal',       label: l('Halal',        'Halal') },
  { value: 'kosher',      label: l('Casher',       'Kosher') },
  { value: 'vegetarian',  label: l('Végétarien',   'Vegetarian') },
  { value: 'vegan',       label: l('Vegan',        'Vegan') },
  { value: 'gluten_free', label: l('Sans gluten',  'Gluten-free') },
  { value: 'dairy_free',  label: l('Sans lactose', 'Dairy-free') },
  { value: 'none',        label: l('Aucune',       'None') },
]

export const COFFEE_ANSWER: Opt[] = [
  { value: 'yes',       label: l('Oui, beaucoup', 'Yes, a lot') },
  { value: 'sometimes', label: l('Parfois',       'Sometimes') },
  { value: 'not_really', label: l('Pas vraiment', 'Not really') },
]

export const COFFEE_LIKES: Opt[] = [
  { value: 'coffee',   label: l('Café',              'Coffee') },
  { value: 'matcha',   label: l('Matcha',            'Matcha') },
  { value: 'pastries', label: l('Pâtisseries',       'Pastries') },
  { value: 'brunch',   label: l('Brunch',            'Brunch') },
  { value: 'ambiance', label: l('Ambiance',          'Ambiance') },
  { value: 'decor',    label: l('Déco',              'Decor') },
  { value: 'working',  label: l('Y travailler',      'Working there') },
  { value: 'content',  label: l('Créer du contenu',  'Creating content') },
]

export const PHOTOGENIC_ANSWER: Opt[] = [
  { value: 'no_problem',  label: l('Pas du tout, la bouffe prime',  'Not at all, food comes first') },
  { value: 'find_a_way',  label: l("Je trouverai un moyen",         "I'll find a way") },
  { value: 'challenge',   label: l("C'est un vrai défi",            "It's a real challenge") },
  { value: 'yes',         label: l('Oui, ça compte pour moi',       'Yes, it matters to me') },
]

export const WHAT_MATTERS: Opt[] = [
  { value: 'food_quality',     label: l('Qualité de la nourriture', 'Food quality') },
  { value: 'aesthetics',       label: l('Esthétique / Déco',        'Aesthetics / Decor') },
  { value: 'originality',      label: l('Originalité',              'Originality') },
  { value: 'trendy',           label: l('Côté tendance',            'Trendy factor') },
  { value: 'value',            label: l('Rapport qualité-prix',     'Value for money') },
  { value: 'ambiance',         label: l('Ambiance',                 'Ambiance') },
  { value: 'service',          label: l('Service',                  'Service') },
  { value: 'content_potential', label: l('Potentiel contenu',       'Content potential') },
]

/* ─── Creator: Collabs ─── */
export const PLACE_TYPE: Opt[] = [
  { value: 'fine_dining',   label: l('Fine dining',                  'Fine dining') },
  { value: 'casual',        label: l('Casual / Décontracté',         'Casual') },
  { value: 'street_food',   label: l('Street food',                  'Street food') },
  { value: 'coffee_brunch', label: l('Coffee / Brunch',              'Coffee / Brunch') },
  { value: 'trendy',        label: l('Trendy / Instagrammable',      'Trendy / Instagrammable') },
  { value: 'hidden_gems',   label: l('Cozy / Pépites cachées',       'Cozy / Hidden gems') },
  { value: 'open',          label: l("Je suis ouvert à tout",        "I'm open to everything") },
]

export const COLLAB_PREFERENCE: Opt[] = [
  { value: 'alone',    label: l("Seul(e)",              'Alone') },
  { value: 'plus_one', label: l("Avec quelqu'un",        'With someone') },
  { value: 'both',     label: l("Les deux me vont",      'Both works') },
]

export const PLATFORMS: Opt[] = [
  { value: 'tiktok',    label: l('TikTok',           'TikTok') },
  { value: 'ig_story',  label: l('Instagram Story',  'Instagram Story') },
  { value: 'ig_reel',   label: l('Instagram Reel',   'Instagram Reel') },
]

export const PREVIOUS_COLLABS: Opt[] = [
  { value: 'yes', label: l('Oui', 'Yes') },
  { value: 'no',  label: l('Non', 'No') },
]

export const POSTED_CONTENT: Opt[] = [
  { value: 'yes',      label: l('Oui', 'Yes') },
  { value: 'no',       label: l('Non', 'No') },
  { value: 'a_little', label: l('Un peu / pas encore beaucoup', 'A little / not much yet') },
]

/* ─── Creator: NEW — Niche ─── */
export const CREATOR_NICHE: Opt[] = [
  { value: 'lifestyle',  label: l('Lifestyle',   'Lifestyle') },
  { value: 'food',       label: l('Food',        'Food') },
  { value: 'sante',      label: l('Santé',       'Health') },
  { value: 'beaute',     label: l('Beauté',      'Beauty') },
  { value: 'voyage',     label: l('Voyage',      'Travel') },
  { value: 'sport',      label: l('Sport',       'Sport') },
  { value: 'mode',       label: l('Mode',        'Fashion') },
  { value: 'tech',       label: l('Tech',        'Tech') },
  { value: 'humour',     label: l('Humour',      'Humour') },
  { value: 'other',      label: l('Autre',       'Other') },
]

/* ─── Creator: NEW — Audience size ─── */
export const AUDIENCE_SIZE: Opt[] = [
  { value: '0_1k',    label: l('0 – 1k',   '0 – 1k') },
  { value: '1k_2k',   label: l('1k – 2k',  '1k – 2k') },
  { value: '2k_5k',   label: l('2k – 5k',  '2k – 5k') },
  { value: '5k_10k',  label: l('5k – 10k', '5k – 10k') },
  { value: '10k_plus', label: l('10k +',   '10k +') },
  { value: '20k_plus', label: l('20k +',   '20k +') },
]

/* ─── Business: Type ─── */
export const BUSINESS_TYPES: Opt[] = [
  { value: 'restaurant',  label: l('Restaurant',                   'Restaurant') },
  { value: 'coffee_shop', label: l('Coffee shop',                  'Coffee shop') },
  { value: 'bar',         label: l('Bar',                          'Bar') },
  { value: 'brunch_spot', label: l('Brunch spot',                  'Brunch spot') },
  { value: 'bakery',      label: l('Boulangerie / Pâtisserie',     'Bakery / Pastry') },
  { value: 'fast_food',   label: l('Fast food / Street food',      'Fast food / Street food') },
  { value: 'other',       label: l('Autre',                        'Other') },
]

/* ─── Business: Collabs ─── */
export const CREATOR_OFFER: Opt[] = [
  { value: 'meal_one',     label: l('Repas offert pour 1',         'Free meal for one') },
  { value: 'meal_two',     label: l('Repas offert pour 2',         'Free meal for two') },
  { value: 'meal_payment', label: l('Repas + rémunération',        'Free meal + payment') },
  { value: 'payment',      label: l('Rémunération uniquement',     'Payment only') },
  { value: 'discuss',      label: l('À discuter',                  "Let's discuss") },
]

export const CONTENT_WANTED: Opt[] = [
  { value: 'tiktok',     label: l('1 vidéo TikTok',   '1 TikTok video') },
  { value: 'ig_reel',    label: l('1 Instagram Reel', '1 Instagram Reel') },
  { value: 'ig_stories', label: l('Instagram Stories','Instagram Stories') },
  { value: 'tiktok_ig',  label: l('TikTok + Instagram','TikTok + Instagram') },
  { value: 'flexible',   label: l('Je suis flexible', "I'm flexible") },
]

/* ─── Business: NEW — Content destination ─── */
export const CONTENT_DESTINATION: Opt[] = [
  { value: 'creator_account', label: l('Sur le compte du créateur', "On the creator's account") },
  { value: 'my_account',      label: l('Sur mon compte',             'On my account') },
  { value: 'both',             label: l('Les deux',                  'Both') },
]

export const CREATIVE_FREEDOM: Opt[] = [
  { value: 'total',      label: l('Liberté totale',        'Total freedom') },
  { value: 'guidelines', label: l('Quelques guidelines',   'Some guidelines') },
  { value: 'precise',    label: l('Brief précis',          'Precise brief') },
  { value: 'discuss',    label: l('À discuter ensemble',   "Let's discuss") },
]

/* ─── Business: UPDATED frequency — removed "quelques fois par an", added "2-3 fois par semaine" ─── */
export const COLLAB_FREQUENCY: Opt[] = [
  { value: 'twice_week',  label: l('2–3 fois par semaine', '2–3 times a week') },
  { value: 'weekly',      label: l('Une fois par semaine', 'Once a week') },
  { value: 'bimonthly',   label: l('2–3 fois par mois',   '2–3 times a month') },
  { value: 'monthly',     label: l('Une fois par mois',   'Once a month') },
  { value: 'as_needed',   label: l('Selon les besoins',   'As needed') },
]

export const BIZ_PREVIOUS_COLLABS: Opt[] = [
  { value: 'yes',   label: l('Oui',                              'Yes') },
  { value: 'no',    label: l('Non',                              'No') },
  { value: 'tried', label: l("J'ai essayé mais ça n'a pas bien marché", "I tried but it didn't work well") },
]

export const YES_NO: Opt[] = [
  { value: 'yes', label: l('Oui', 'Yes') },
  { value: 'no',  label: l('Non', 'No') },
]

export const YES_NO_MAYBE: Opt[] = [
  { value: 'yes',   label: l('Oui',        'Yes') },
  { value: 'no',    label: l('Non',        'No') },
  { value: 'maybe', label: l('Peut-être',  'Maybe') },
]

export const DAYS: Opt[] = [
  { value: 'monday',    label: l('Lundi',    'Monday') },
  { value: 'tuesday',   label: l('Mardi',    'Tuesday') },
  { value: 'wednesday', label: l('Mercredi', 'Wednesday') },
  { value: 'thursday',  label: l('Jeudi',    'Thursday') },
  { value: 'friday',    label: l('Vendredi', 'Friday') },
  { value: 'saturday',  label: l('Samedi',   'Saturday') },
  { value: 'sunday',    label: l('Dimanche', 'Sunday') },
]

export const TIMES: Opt[] = [
  { value: 'lunch',     label: l('Midi',       'Lunch') },
  { value: 'afternoon', label: l('Après-midi', 'Afternoon') },
  { value: 'dinner',    label: l('Soir',       'Dinner') },
  { value: 'flexible',  label: l('Flexible',   'Flexible') },
]

/* Helper to get label for a locale */
export function optLabel(opt: Opt, locale: Locale): string {
  return opt.label[locale]
}
