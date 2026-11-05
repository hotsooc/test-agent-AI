import { Weapon, Skin } from '../types/valorant'
import { DailyShopItem, DailyShopData, SkinAppearanceRecord, ShopTier } from '../types/shop'
import { FALLBACK_SHOP_SKINS, TIER_CONFIG } from '../data/fallbackSkins'

const STORAGE_COUNTER_KEY = 'valorant_skin_counter'
const STORAGE_HISTORY_DATES_KEY = 'valorant_shop_history_dates'
const STORAGE_ACCOUNT_HISTORY_KEY = 'valorant_shop_account_history'
const STORAGE_FAVORITES_KEY = 'valorant_favorite_skins'

export function determineTier(skin: Skin): ShopTier {
  const name = skin.displayName.toLowerCase()
  if (name.includes('elderflame') || name.includes('protocol') || name.includes('radiant entertainment')) {
    return TIER_CONFIG.ultra
  }
  if (
    name.includes('kuronami') ||
    name.includes('araxys') ||
    name.includes('prelude') ||
    name.includes('glitchpop') ||
    name.includes('chronovoid') ||
    name.includes('neo frontier') ||
    name.includes('singularity') ||
    name.includes('overdrive') ||
    name.includes('sentinels of light') ||
    name.includes('ruination')
  ) {
    return TIER_CONFIG.exclusive
  }
  if (
    name.includes('prime') ||
    name.includes('reaver') ||
    name.includes('ion') ||
    name.includes('oni') ||
    name.includes('recon') ||
    name.includes('sovereign') ||
    name.includes('magepunk') ||
    name.includes('gaia') ||
    name.includes('forsaken') ||
    name.includes('valiant hero') ||
    name.includes('xenohunter') ||
    name.includes('cryostasis') ||
    name.includes('neptune') ||
    name.includes('origin')
  ) {
    return TIER_CONFIG.premium
  }
  if (
    name.includes('sakura') ||
    name.includes('wasteland') ||
    name.includes('aristocrat') ||
    name.includes('infantry') ||
    name.includes('horizon') ||
    name.includes('silvanus') ||
    name.includes('minima') ||
    name.includes('avalanche') ||
    name.includes('prism')
  ) {
    return TIER_CONFIG.deluxe
  }

  // Fallback based on content tier uuid if available
  if (skin.contentTierUuid) {
    const tierMap: Record<string, ShopTier> = {
      '0cebb8be-46d7-c12a-d306-e9907ab305d3': TIER_CONFIG.deluxe,
      'e046854e-406c-37f4-6607-19a9ba8426fc': TIER_CONFIG.premium,
      '60bca009-4182-7998-dee7-b8a2558dc369': TIER_CONFIG.exclusive,
      '12683d76-48d7-84a3-48e7-8b89328cb048': TIER_CONFIG.ultra,
    }
    if (tierMap[skin.contentTierUuid]) {
      return tierMap[skin.contentTierUuid]
    }
  }

  return TIER_CONFIG.select
}

export function buildEligiblePool(weapons: Weapon[]): DailyShopItem[] {
  if (!weapons || weapons.length === 0) {
    return FALLBACK_SHOP_SKINS
  }

  const pool: DailyShopItem[] = []
  const seenIds = new Set<string>()

  for (const weapon of weapons) {
    if (!weapon.skins) continue
    for (const skin of weapon.skins) {
      if (!skin.displayIcon) continue
      const dName = skin.displayName
      if (dName.startsWith('Standard ') || dName.includes('Random Favorite') || dName === weapon.displayName) {
        continue
      }
      if (seenIds.has(skin.uuid)) continue
      seenIds.add(skin.uuid)

      const tier = determineTier(skin)
      pool.push({
        id: skin.uuid,
        skinUuid: skin.uuid,
        displayName: skin.displayName,
        displayIcon: skin.displayIcon,
        weaponName: weapon.displayName,
        weaponCategory: weapon.category.split('::').pop() || weapon.category,
        cost: tier.price,
        tier,
        skin,
      })
    }
  }

  return pool.length > 0 ? pool : FALLBACK_SHOP_SKINS
}

function stringToSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

function createPrng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function getTodayDateString(offsetDays = 0): string {
  const d = new Date()
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays)
  }
  return d.toISOString().split('T')[0]
}

export function getSecondsUntilNextReset(): number {
  const now = new Date()
  const reset = new Date(now)
  reset.setUTCHours(24, 0, 0, 0)
  return Math.max(0, Math.floor((reset.getTime() - now.getTime()) / 1000))
}

export function generateDailyShop(
  dateStr: string,
  eligiblePool: DailyShopItem[],
  isSimulation = false,
): DailyShopData {
  const pool = eligiblePool.length > 0 ? [...eligiblePool] : [...FALLBACK_SHOP_SKINS]
  const seed = stringToSeed(dateStr + '_valorant_daily_store_seed_v2')
  const random = createPrng(seed)

  const items: DailyShopItem[] = []
  const weaponCountMap: Record<string, number> = {}

  // Attempt to select 4 distinct items with weapon variety
  for (let attempt = 0; attempt < 50 && items.length < 4 && pool.length > 0; attempt++) {
    const idx = Math.floor(random() * pool.length)
    const candidate = pool[idx]
    const wCount = weaponCountMap[candidate.weaponName] || 0
    if (wCount < 2 || attempt > 20) {
      items.push(candidate)
      weaponCountMap[candidate.weaponName] = wCount + 1
      pool.splice(idx, 1)
    }
  }

  // Fallback if less than 4
  while (items.length < 4 && pool.length > 0) {
    const idx = Math.floor(random() * pool.length)
    items.push(pool[idx])
    pool.splice(idx, 1)
  }

  const now = new Date()
  const reset = new Date(now)
  reset.setUTCHours(24, 0, 0, 0)

  return {
    date: dateStr,
    items,
    remainingSeconds: getSecondsUntilNextReset(),
    resetTimeISO: reset.toISOString(),
    isSimulation,
  }
}

export function getStoredAppearanceCounter(): Record<string, SkinAppearanceRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_COUNTER_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function getStoredHistoryDates(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY_DATES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getStoredAccountHistory(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNT_HISTORY_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveStoredAccountHistory(history: Record<string, string[]>): void {
  try {
    localStorage.setItem(STORAGE_ACCOUNT_HISTORY_KEY, JSON.stringify(history))
  } catch (e) {
    console.error(e)
  }
}

export function recordShopAppearance(
  items: DailyShopItem[],
  dateStr: string,
  accountId = 'acc-1',
): { counter: Record<string, SkinAppearanceRecord>; isNewDate: boolean } {
  const accountHistory = getStoredAccountHistory()
  const historyDates = getStoredHistoryDates()
  const counter = getStoredAppearanceCounter()

  const datesForAcc = accountHistory[accountId] || []
  const isNewForAccount = !datesForAcc.includes(dateStr)

  if (isNewForAccount) {
    datesForAcc.push(dateStr)
    accountHistory[accountId] = datesForAcc
    saveStoredAccountHistory(accountHistory)

    if (!historyDates.includes(dateStr)) {
      historyDates.push(dateStr)
      localStorage.setItem(STORAGE_HISTORY_DATES_KEY, JSON.stringify(historyDates))
    }

    for (const item of items) {
      const existing = counter[item.skinUuid] || {
        skinUuid: item.skinUuid,
        skinName: item.displayName,
        skinIcon: item.displayIcon,
        weaponName: item.weaponName,
        weaponCategory: item.weaponCategory,
        count: 0,
        accountCounts: {},
        lastSeen: dateStr,
        historyDates: [],
        accountIds: [],
      }

      existing.count = (existing.count || 0) + 1
      existing.accountCounts = existing.accountCounts || {}
      existing.accountCounts[accountId] = (existing.accountCounts[accountId] || 0) + 1

      existing.accountIds = existing.accountIds || []
      if (!existing.accountIds.includes(accountId)) {
        existing.accountIds.push(accountId)
      }

      existing.lastSeen = dateStr
      if (!existing.historyDates.includes(dateStr)) {
        existing.historyDates.push(dateStr)
      }
      counter[item.skinUuid] = existing
    }

    localStorage.setItem(STORAGE_COUNTER_KEY, JSON.stringify(counter))
  }

  return { counter, isNewDate: isNewForAccount }
}

export function resetAppearanceCounter(): void {
  try {
    localStorage.removeItem(STORAGE_COUNTER_KEY)
    localStorage.removeItem(STORAGE_HISTORY_DATES_KEY)
    localStorage.removeItem(STORAGE_ACCOUNT_HISTORY_KEY)
  } catch (e) {
    console.error(e)
  }
}

export function simulatePastHistory(
  daysCount: number,
  eligiblePool: DailyShopItem[],
): Record<string, SkinAppearanceRecord> {
  const counter = getStoredAppearanceCounter()
  const historyDates = getStoredHistoryDates()
  const accountHistory = getStoredAccountHistory()
  const accountIds = ['acc-1', 'acc-2', 'acc-3']

  for (let i = daysCount; i >= 1; i--) {
    const dateStr = getTodayDateString(-i)
    if (!historyDates.includes(dateStr)) {
      historyDates.push(dateStr)
    }

    for (const accId of accountIds) {
      const datesForAcc = accountHistory[accId] || []
      if (datesForAcc.includes(dateStr)) continue
      datesForAcc.push(dateStr)
      accountHistory[accId] = datesForAcc

      // Random 4 skins for each account
      const shuffled = [...eligiblePool].sort(() => 0.5 - Math.random())
      const picked = shuffled.slice(0, 4)

      for (const item of picked) {
        const existing = counter[item.skinUuid] || {
          skinUuid: item.skinUuid,
          skinName: item.displayName,
          skinIcon: item.displayIcon,
          weaponName: item.weaponName,
          weaponCategory: item.weaponCategory,
          count: 0,
          accountCounts: {},
          lastSeen: dateStr,
          historyDates: [],
          accountIds: [],
        }

        existing.count = (existing.count || 0) + 1
        existing.accountCounts = existing.accountCounts || {}
        existing.accountCounts[accId] = (existing.accountCounts[accId] || 0) + 1

        existing.accountIds = existing.accountIds || []
        if (!existing.accountIds.includes(accId)) {
          existing.accountIds.push(accId)
        }

        existing.lastSeen = dateStr
        if (!existing.historyDates.includes(dateStr)) {
          existing.historyDates.push(dateStr)
        }
        counter[item.skinUuid] = existing
      }
    }
  }

  saveStoredAccountHistory(accountHistory)
  localStorage.setItem(STORAGE_HISTORY_DATES_KEY, JSON.stringify(historyDates))
  localStorage.setItem(STORAGE_COUNTER_KEY, JSON.stringify(counter))
  return counter
}

// Favorites Management
export function getStoredFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_FAVORITES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveFavorites(favorites: string[]): void {
  try {
    localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(favorites))
  } catch (e) {
    console.error(e)
  }
}

export function toggleFavorite(skinUuid: string): string[] {
  const favs = getStoredFavorites()
  const index = favs.indexOf(skinUuid)
  let updated: string[]
  if (index >= 0) {
    updated = favs.filter((id) => id !== skinUuid)
  } else {
    updated = [...favs, skinUuid]
  }
  saveFavorites(updated)
  return updated
}

// Export / Import Data Sync between Local and Web
export function exportAllUserData(): string {
  try {
    const data = {
      favorites: getStoredFavorites(),
      accounts: JSON.parse(localStorage.getItem('valorant_riot_accounts') || '[]'),
      settings: JSON.parse(localStorage.getItem('valorant_notification_settings') || '{}'),
      counter: getStoredAppearanceCounter(),
      accountHistory: getStoredAccountHistory(),
      timestamp: Date.now(),
    }
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))))
  } catch (e) {
    console.error('Export error:', e)
    return ''
  }
}

export function importAllUserData(encoded: string): boolean {
  try {
    let jsonStr = ''
    try {
      jsonStr = decodeURIComponent(escape(atob(encoded.trim())))
    } catch {
      jsonStr = encoded.trim()
    }
    const data = JSON.parse(jsonStr)
    if (data.favorites && Array.isArray(data.favorites)) {
      saveFavorites(data.favorites)
    }
    if (data.accounts && Array.isArray(data.accounts)) {
      localStorage.setItem('valorant_riot_accounts', JSON.stringify(data.accounts))
    }
    if (data.settings && typeof data.settings === 'object') {
      localStorage.setItem('valorant_notification_settings', JSON.stringify(data.settings))
    }
    if (data.counter && typeof data.counter === 'object') {
      localStorage.setItem('valorant_skin_counter', JSON.stringify(data.counter))
    }
    if (data.accountHistory && typeof data.accountHistory === 'object') {
      saveStoredAccountHistory(data.accountHistory)
    }
    return true
  } catch (e) {
    console.error('Import error:', e)
    return false
  }
}


