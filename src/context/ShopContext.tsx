import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react'
import {
  DailyShopData,
  DailyShopItem,
  SkinAppearanceRecord,
  NotificationSettings,
  RiotAccount,
} from '../types/shop'
import { getWeapons } from '../api/valorant'
import {
  buildEligiblePool,
  generateDailyShop,
  getTodayDateString,
  getStoredAppearanceCounter,
  recordShopAppearance,
  resetAppearanceCounter,
  simulatePastHistory,
  getStoredFavorites,
  toggleFavorite as toggleFavInStorage,
  getSecondsUntilNextReset,
  exportAllUserData,
  importAllUserData,
} from '../services/shopService'
import {
  getStoredNotificationSettings,
  saveNotificationSettings,
  dispatchShopNotification,
} from '../services/notificationService'
import {
  getStoredRiotAccounts,
  saveStoredRiotAccounts,
  fetchRiotStorefront,
} from '../services/riotAuthService'

interface CountdownState {
  hours: number
  minutes: number
  seconds: number
  formatted: string
}

export interface MatchedAccountFavorite {
  account: RiotAccount
  items: DailyShopItem[]
}

interface ShopContextType {
  dailyShop: DailyShopData | null
  loading: boolean
  eligibleSkins: DailyShopItem[]
  favorites: string[]
  isFavorite: (skinUuid: string) => boolean
  toggleFavorite: (skinUuid: string) => void
  appearanceCounter: Record<string, SkinAppearanceRecord>
  matchedFavorites: DailyShopItem[]
  allMatchedFavorites: MatchedAccountFavorite[]
  notificationSettings: NotificationSettings
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void
  sendTestNotification: (accountName?: string) => Promise<{ success: boolean; details: Record<string, boolean> }>
  simulateDay: (offset: number) => void
  simulatePastDays: (days: number) => void
  resetCounter: () => void
  countdown: CountdownState
  currentDateStr: string
  isSimulation: boolean
  resetToToday: () => void
  // Multi-Account Riot Features
  riotAccounts: RiotAccount[]
  activeAccountId: string
  setActiveAccountId: (id: string) => void
  activeAccount: RiotAccount | null
  saveAccount: (account: RiotAccount) => void
  removeAccount: (id: string) => void
  refreshAccountShop: (id: string) => Promise<void>
  refreshAllAccounts: () => Promise<void>
  isRefreshingAccounts: boolean
  exportData: () => string
  importData: (code: string) => boolean
}

const ShopContext = createContext<ShopContextType | undefined>(undefined)

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) {
    throw new Error('useShop must be used within a ShopProvider')
  }
  return ctx
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [eligibleSkins, setEligibleSkins] = useState<DailyShopItem[]>([])
  const [favorites, setFavorites] = useState<string[]>(() => getStoredFavorites())
  const [appearanceCounter, setAppearanceCounter] = useState<Record<string, SkinAppearanceRecord>>(() =>
    getStoredAppearanceCounter(),
  )
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() =>
    getStoredNotificationSettings(),
  )

  // Riot Accounts state (Supports 3 or more accounts)
  const [riotAccounts, setRiotAccounts] = useState<RiotAccount[]>(() => {
    const saved = getStoredRiotAccounts()
    if (saved && saved.length > 0) return saved
    // Default 3 account slots
    return [
      {
        id: 'acc-1',
        label: 'Tài khoản 1 (Chính)',
        region: 'ap',
        puuid: '',
        accessToken: '',
        entitlementsToken: '',
        status: 'idle',
      },
      {
        id: 'acc-2',
        label: 'Tài khoản 2 (Smurf 1)',
        region: 'ap',
        puuid: '',
        accessToken: '',
        entitlementsToken: '',
        status: 'idle',
      },
      {
        id: 'acc-3',
        label: 'Tài khoản 3 (Smurf 2)',
        region: 'ap',
        puuid: '',
        accessToken: '',
        entitlementsToken: '',
        status: 'idle',
      },
    ]
  })

  const [activeAccountId, setActiveAccountId] = useState<string>('all')
  const [isRefreshingAccounts, setIsRefreshingAccounts] = useState(false)

  const [dayOffset, setDayOffset] = useState<number>(0)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(getSecondsUntilNextReset())

  const notifiedAccountsRef = useRef<Record<string, string>>({})
  const autoFetchedAccountsRef = useRef<Record<string, boolean>>({})

  // 1. Fetch weapons to build pool
  useEffect(() => {
    let active = true
    getWeapons('vi-VN')
      .then((data) => {
        if (active) {
          const pool = buildEligiblePool(data)
          setEligibleSkins(pool)
        }
      })
      .catch(() => {
        if (active) {
          const pool = buildEligiblePool([])
          setEligibleSkins(pool)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  // 2. Countdown timer to reset
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getSecondsUntilNextReset()
      setSecondsRemaining(remaining)
      if (remaining === 0 && dayOffset === 0) {
        setDayOffset(0)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [dayOffset])

  const countdown: CountdownState = useMemo(() => {
    const h = Math.floor(secondsRemaining / 3600)
    const m = Math.floor((secondsRemaining % 3600) / 60)
    const s = secondsRemaining % 60
    const pad = (n: number) => n.toString().padStart(2, '0')
    return {
      hours: h,
      minutes: m,
      seconds: s,
      formatted: `${pad(h)}:${pad(m)}:${pad(s)}`,
    }
  }, [secondsRemaining])

  const currentDateStr = useMemo(() => getTodayDateString(dayOffset), [dayOffset])
  const isSimulation = dayOffset !== 0

  // Active account reference
  const activeAccount = useMemo(() => {
    if (activeAccountId === 'all') {
      return riotAccounts.find((a) => a.puuid && a.accessToken) || riotAccounts[0] || null
    }
    return riotAccounts.find((a) => a.id === activeAccountId) || null
  }, [riotAccounts, activeAccountId])

  // Active daily shop
  const dailyShop = useMemo(() => {
    if (activeAccount?.shop) {
      return activeAccount.shop
    }
    // Fallback daily shop
    return generateDailyShop(currentDateStr, eligibleSkins, isSimulation)
  }, [activeAccount, currentDateStr, eligibleSkins, isSimulation])

  // Refresh single Riot Account Shop
  const refreshAccountShop = useCallback(
    async (accId: string, directAccount?: RiotAccount) => {
      const target = directAccount || riotAccounts.find((a) => a.id === accId)
      if (!target || !target.accessToken) return

      const res = await fetchRiotStorefront(target, eligibleSkins)
      setRiotAccounts((prev) => {
        const next = prev.map((a) => {
          if (a.id === accId) {
            if (res.success && res.shop) {
              return {
                ...a,
                puuid: target.puuid || a.puuid,
                region: target.region || a.region,
                gameName: target.gameName || a.gameName,
                tagLine: target.tagLine || a.tagLine,
                shop: res.shop,
                wallet: res.wallet,
                status: 'success' as const,
                lastChecked: new Date().toLocaleTimeString(),
                lastError: undefined,
              }
            } else {
              return {
                ...a,
                puuid: target.puuid || a.puuid,
                region: target.region || a.region,
                gameName: target.gameName || a.gameName,
                tagLine: target.tagLine || a.tagLine,
                status: 'error' as const,
                lastError: res.error,
              }
            }
          }
          return a
        })
        saveStoredRiotAccounts(next)
        return next
      })

      // Record appearances in counter for this specific account
      if (res.success && res.shop) {
        const { counter } = recordShopAppearance(res.shop.items, currentDateStr, accId)
        setAppearanceCounter({ ...counter })
      }
    },
    [riotAccounts, eligibleSkins, currentDateStr],
  )

  // Refresh all accounts in parallel
  const refreshAllAccounts = useCallback(async () => {
    setIsRefreshingAccounts(true)
    const validAccounts = riotAccounts.filter((a) => a.accessToken)
    await Promise.allSettled(validAccounts.map((a) => refreshAccountShop(a.id)))
    setIsRefreshingAccounts(false)
  }, [riotAccounts, refreshAccountShop])

  // Auto fetch storefront for connected accounts ONCE when eligible pool is loaded (tránh vòng lặp vô tận)
  useEffect(() => {
    if (loading || eligibleSkins.length === 0 || isRefreshingAccounts) return

    const accountsToFetch = riotAccounts.filter(
      (a) => a.accessToken && !a.shop && a.status !== 'error' && !autoFetchedAccountsRef.current[a.id],
    )

    if (accountsToFetch.length > 0) {
      accountsToFetch.forEach((a) => {
        autoFetchedAccountsRef.current[a.id] = true
      })
      refreshAllAccounts()
    }
  }, [loading, eligibleSkins.length, riotAccounts, isRefreshingAccounts, refreshAllAccounts])

  // Auto-poll all 3 accounts every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAllAccounts()
    }, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [refreshAllAccounts])

  // 4. Calculate matched favorites across all accounts
  const allMatchedFavorites: MatchedAccountFavorite[] = useMemo(() => {
    const list: MatchedAccountFavorite[] = []
    for (const acc of riotAccounts) {
      const shopItems = acc.shop?.items || []
      const matched = shopItems.filter((item) => favorites.includes(item.skinUuid))
      if (matched.length > 0) {
        list.push({ account: acc, items: matched })
      }
    }
    return list
  }, [riotAccounts, favorites])

  const matchedFavorites = useMemo(() => {
    if (!dailyShop) return []
    return dailyShop.items.filter((item) => favorites.includes(item.skinUuid))
  }, [dailyShop, favorites])

  // 5. Automatic Phone Notification if ANY of the 3 accounts gets a favorite skin!
  useEffect(() => {
    if (loading || allMatchedFavorites.length === 0 || !notificationSettings.enabled) return
    const today = currentDateStr

    for (const match of allMatchedFavorites) {
      const key = `${match.account.id}_${today}`
      if (notifiedAccountsRef.current[key]) continue

      notifiedAccountsRef.current[key] = today
      const accountLabel = match.account.gameName
        ? `${match.account.label} (${match.account.gameName}#${match.account.tagLine || 'VN'})`
        : match.account.label

      dispatchShopNotification(
        match.items,
        notificationSettings,
        false,
        accountLabel,
        match.account.wallet?.vp,
      ).then(({ success }) => {
        if (success) {
          const updated = { ...notificationSettings, lastNotifiedDate: today }
          setNotificationSettings(updated)
          saveNotificationSettings(updated)
        }
      })
    }
  }, [allMatchedFavorites, currentDateStr, notificationSettings, loading])

  // Save / Update Account
  const saveAccount = useCallback(
    (account: RiotAccount) => {
      setRiotAccounts((prev) => {
        const index = prev.findIndex((a) => a.id === account.id)
        let next: RiotAccount[]
        if (index >= 0) {
          next = [...prev]
          next[index] = account
        } else {
          next = [...prev, account]
        }
        saveStoredRiotAccounts(next)
        return next
      })
      // Fetch shop immediately with the updated account object
      autoFetchedAccountsRef.current[account.id] = true
      if (account.accessToken) {
        refreshAccountShop(account.id, account)
      }
    },
    [refreshAccountShop],
  )

  // Remove Account
  const removeAccount = useCallback((id: string) => {
    setRiotAccounts((prev) => {
      const next = prev.filter((a) => a.id !== id)
      saveStoredRiotAccounts(next)
      return next
    })
  }, [])

  // Toggle Favorite
  const toggleFavoriteHandler = useCallback((skinUuid: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(skinUuid)
      const next = exists ? prev.filter((id) => id !== skinUuid) : [...prev, skinUuid]
      toggleFavInStorage(skinUuid)
      return next
    })
  }, [])

  const isFavoriteHandler = useCallback((skinUuid: string) => favorites.includes(skinUuid), [favorites])

  // Update Notification Settings
  const updateNotificationSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setNotificationSettings((prev) => {
      const updated = { ...prev, ...newSettings }
      saveNotificationSettings(updated)
      return updated
    })
  }, [])

  // Send Test Notification
  const sendTestNotification = useCallback(
    async (accountName?: string) => {
      const sampleItems: DailyShopItem[] =
        matchedFavorites.length > 0
          ? matchedFavorites
          : dailyShop?.items.slice(0, 1) || [
              {
                id: 'test',
                skinUuid: 'test',
                displayName: 'Kuronami Vandal',
                displayIcon:
                  'https://media.valorant-api.com/weaponskins/b0bf255b-4cbe-ff06-8d6c-dcbe9e71ab11/displayicon.png',
                weaponName: 'Vandal',
                weaponCategory: 'Rifle',
                cost: 2375,
                tier: { name: 'Exclusive Edition', color: '#fa9d30', price: 2375, badgeBg: 'rgba(250, 157, 48, 0.2)' },
                skin: {} as any,
              },
            ]
      const label = accountName || activeAccount?.label || 'Tài khoản Chính'
      return await dispatchShopNotification(
        sampleItems,
        notificationSettings,
        true,
        label,
        activeAccount?.wallet?.vp || 1775,
      )
    },
    [matchedFavorites, dailyShop, notificationSettings, activeAccount],
  )

  const simulateDay = useCallback((offset: number) => {
    setDayOffset((prev) => prev + offset)
  }, [])

  const resetToToday = useCallback(() => {
    setDayOffset(0)
  }, [])

  const simulatePastDays = useCallback(
    (days: number) => {
      const updated = simulatePastHistory(days, eligibleSkins)
      setAppearanceCounter({ ...updated })
    },
    [eligibleSkins],
  )

  // Ensure accounts with existing shops have their items recorded for all accounts
  useEffect(() => {
    let anyRecorded = false
    let latestCounter: Record<string, SkinAppearanceRecord> = {}
    for (const acc of riotAccounts) {
      if (acc.shop?.items && acc.shop.items.length > 0) {
        const { counter, isNewDate } = recordShopAppearance(acc.shop.items, currentDateStr, acc.id)
        if (isNewDate) {
          anyRecorded = true
          latestCounter = counter
        }
      }
    }
    if (anyRecorded) {
      setAppearanceCounter({ ...latestCounter })
    }
  }, [riotAccounts, currentDateStr])

  const resetCounter = useCallback(() => {
    resetAppearanceCounter()
    setAppearanceCounter({})
    let lastCounter: Record<string, SkinAppearanceRecord> = {}
    let hasAccShops = false
    for (const acc of riotAccounts) {
      if (acc.shop?.items && acc.shop.items.length > 0) {
        const { counter } = recordShopAppearance(acc.shop.items, currentDateStr, acc.id)
        lastCounter = counter
        hasAccShops = true
      }
    }
    if (hasAccShops) {
      setAppearanceCounter({ ...lastCounter })
    } else if (dailyShop) {
      const { counter } = recordShopAppearance(dailyShop.items, currentDateStr, 'acc-1')
      setAppearanceCounter({ ...counter })
    }
  }, [riotAccounts, dailyShop, currentDateStr])

  const exportData = useCallback(() => {
    return exportAllUserData()
  }, [])

  const importData = useCallback((code: string) => {
    const ok = importAllUserData(code)
    if (ok) {
      setFavorites(getStoredFavorites())
      setRiotAccounts(getStoredRiotAccounts())
      setNotificationSettings(getStoredNotificationSettings())
      setAppearanceCounter(getStoredAppearanceCounter())
    }
    return ok
  }, [])

  // Auto-sync when URL has #sync=...
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('sync=')) {
      const code = hash.split('sync=')[1]?.split('&')[0]
      if (code) {
        importData(code)
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
  }, [importData])

  const value = {
    dailyShop,
    loading,
    eligibleSkins,
    favorites,
    isFavorite: isFavoriteHandler,
    toggleFavorite: toggleFavoriteHandler,
    appearanceCounter,
    matchedFavorites,
    allMatchedFavorites,
    notificationSettings,
    updateNotificationSettings,
    sendTestNotification,
    simulateDay,
    simulatePastDays,
    resetCounter,
    countdown,
    currentDateStr,
    isSimulation,
    resetToToday,
    riotAccounts,
    activeAccountId,
    setActiveAccountId,
    activeAccount,
    saveAccount,
    removeAccount,
    refreshAccountShop,
    refreshAllAccounts,
    isRefreshingAccounts,
    exportData,
    importData,
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}
