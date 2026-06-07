import { GoogleAuth } from 'google-auth-library'
import { LEVEL_COLORS, WalletLevel, formatSequentialId } from './constants'

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID!
const CLASS_ID = `${ISSUER_ID}.2960-creator-id`

// Parse service account from env (base64-encoded JSON)
function getCredentials() {
  const raw = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON!
  return JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'))
}

function getAuth() {
  const credentials = getCredentials()
  return new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
  })
}

/** Ensure the LoyaltyClass exists (idempotent — call on first pass creation) */
export async function ensureLoyaltyClass() {
  const auth = getAuth()
  const client = await auth.getClient()
  const url = `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${CLASS_ID}`

  // Check if class exists
  try {
    await client.request({ url, method: 'GET' })
    return // already exists
  } catch {
    // doesn't exist, create it
  }

  const loyaltyClass = {
    id: CLASS_ID,
    issuerName: '2960 Agency',
    programName: 'Créateur 2960',
    programLogo: {
      sourceUri: { uri: 'https://www.2960agency.com/images/logo.png' },
      contentDescription: { defaultValue: { language: 'fr', value: '2960 Agency' } },
    },
    reviewStatus: 'UNDER_REVIEW',
    hexBackgroundColor: '#6d0040',
    linksModuleData: {
      uris: [
        { uri: 'https://www.2960agency.com', description: '2960agency.com', id: 'website' },
      ],
    },
  }

  await client.request({
    url: 'https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass',
    method: 'POST',
    data: loyaltyClass,
  })
}

/** Build the save-to-wallet URL for a creator */
export async function buildGoogleWalletUrl(creator: {
  id: number
  sequentialId: number
  batchNumber: number
  handle: string
  level: string
  pointsTotal: number
  creditsRemaining: number
  walletAuthToken: string
}): Promise<string> {
  const credentials = getCredentials()
  const level = (creator.level || 'bronze') as WalletLevel
  const colors = LEVEL_COLORS[level] || LEVEL_COLORS.bronze
  const seqId = formatSequentialId(creator.sequentialId)
  const scanUrl = `https://www.2960agency.com/scan/${creator.walletAuthToken}`

  // Ensure class exists
  await ensureLoyaltyClass()

  const objectId = `${ISSUER_ID}.creator-${creator.id}`

  const loyaltyObject = {
    id: objectId,
    classId: CLASS_ID,
    state: 'ACTIVE',
    accountId: seqId,
    accountName: `@${creator.handle.replace('@', '')}`,
    loyaltyPoints: {
      label: 'Points',
      balance: { int: creator.pointsTotal },
    },
    hexBackgroundColor: colors.hex,
    barcode: {
      type: 'QR_CODE',
      value: scanUrl,
      alternateText: seqId,
    },
    textModulesData: [
      { header: 'Niveau', body: level.charAt(0).toUpperCase() + level.slice(1), id: 'level' },
      { header: 'Crédits', body: `${creator.creditsRemaining} restants`, id: 'credits' },
      ...(creator.batchNumber === 1
        ? [{ header: 'Batch', body: '#01 — Fondateur', id: 'batch' }]
        : []),
    ],
    linksModuleData: {
      uris: [
        { uri: scanUrl, description: 'Page de scan', id: 'scan' },
        { uri: 'https://www.2960agency.com', description: '2960agency.com', id: 'website' },
      ],
    },
  }

  // Sign a JWT containing the object (skinny JWT approach — no need to create object via API first)
  const claims = {
    iss: credentials.client_email,
    aud: 'google',
    origins: ['https://www.2960agency.com'],
    typ: 'savetowallet',
    payload: {
      loyaltyObjects: [loyaltyObject],
    },
  }

  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT', kid: credentials.private_key_id }
  const payload = { ...claims, iat: now }

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url')

  const unsigned = `${encode(header)}.${encode(payload)}`

  // Sign with the service account private key
  const { createSign } = await import('crypto')
  const sign = createSign('RSA-SHA256')
  sign.update(unsigned)
  const signature = sign.sign(credentials.private_key, 'base64url')

  const jwt = `${unsigned}.${signature}`
  return `https://pay.google.com/gp/v/save/${jwt}`
}
