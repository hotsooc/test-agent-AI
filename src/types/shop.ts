import { Skin } from './valorant'

export type RiotRegion = 'ap' | 'na' | 'eu' | 'kr'

export interface ShopTier {
  uuid?: string
  name: string
  color: string
  price: number
  badgeBg: string
}

export interface DailyShopItem {
  id: string
  skinUuid: string
  displayName: string
  displayIcon: string
  weaponName: string
  weaponCategory: string
  cost: number
  tier: ShopTier
  skin: Skin
}

export interface DailyShopData {
  date: string // Format: 'YYYY-MM-DD'
  items: DailyShopItem[]
  remainingSeconds: number
  resetTimeISO: string
  isSimulation?: boolean
}

export interface SkinAppearanceRecord {
  skinUuid: string
  skinName: string
  skinIcon: string | null
  weaponName: string
  weaponCategory?: string
  count: number
  lastSeen: string // 'YYYY-MM-DD'
  historyDates: string[]
  accountIds?: string[] // Track which accounts have had this skin
}

export interface RiotWallet {
  vp: number
  rad: number
  kc: number
}

export interface RiotAccount {
  id: string
  label: string // e.g. "Acc Chính", "Acc Smurf 1", "Acc 3"
  username?: string
  password?: string
  region: RiotRegion
  puuid: string
  gameName?: string
  tagLine?: string
  accessToken: string
  idToken?: string
  entitlementsToken: string
  expiresAt?: number
  wallet?: RiotWallet
  shop?: DailyShopData
  lastChecked?: string
  lastError?: string
  status?: 'idle' | 'loading' | 'success' | 'error' | '2fa_required'
}

export interface NotificationSettings {
  enabled: boolean
  lastNotifiedDate?: string
  // ntfy.sh (Fastest & Easiest push notification to iOS/Android phone)
  ntfyEnabled: boolean
  ntfyTopic: string
  // Telegram Bot
  telegramEnabled: boolean
  telegramBotToken: string
  telegramChatId: string
  // Discord Webhook
  discordEnabled: boolean
  discordWebhookUrl: string
  // Browser Push
  browserEnabled: boolean
}
