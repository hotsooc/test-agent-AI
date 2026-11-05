import { RiotAccount, RiotRegion, RiotWallet, DailyShopData, DailyShopItem } from '../types/shop'
import { determineTier } from './shopService'
import { FALLBACK_SHOP_SKINS } from '../data/fallbackSkins'

const STORAGE_ACCOUNTS_KEY = 'valorant_riot_accounts'

// Currency UUIDs in Valorant
const CURRENCY_VP = '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741'
const CURRENCY_RAD = 'e59aa87c-4cbf-517a-5983-6e81511be9b7'
const CURRENCY_KC = '85caeeab-4de1-e852-ceb3-8f1742f13f10'

const CLIENT_PLATFORM_BASE64 = btoa(
  JSON.stringify({
    platformType: 'PC',
    platformOS: 'Windows',
    platformOSVersion: '10.0.19042.1.256.64bit',
    platformChipset: 'Unknown',
  }),
)

export const RIOT_AUTH_URL =
  'https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&scope=account%20openid&nonce=1'

let cachedClientVersion = 'release-13.09-shipping-18-5804228'

export async function getRiotClientVersion(): Promise<string> {
  try {
    const res = await fetch('https://valorant-api.com/v1/version')
    if (res.ok) {
      const data = await res.json()
      if (data.data?.riotClientVersion) {
        cachedClientVersion = data.data.riotClientVersion
      }
    }
  } catch {
    // fallback
  }
  return cachedClientVersion
}

export function getStoredRiotAccounts(): RiotAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveStoredRiotAccounts(accounts: RiotAccount[]): void {
  try {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch (err) {
    console.error('Error saving Riot accounts:', err)
  }
}

export function parseJwt(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

/**
 * Phân tích URL redirect từ Riot hoặc chuỗi Access Token
 */
export async function parseRiotRedirectUrlOrToken(
  input: string,
  region: RiotRegion = 'ap',
): Promise<{
  success: boolean
  account?: Partial<RiotAccount>
  error?: string
}> {
  try {
    let text = input.trim()
    if (text.includes('#')) {
      text = text.split('#')[1]
    }
    const params = new URLSearchParams(text)
    const accessToken = params.get('access_token') || (text.startsWith('ey') ? text : '')
    const idToken = params.get('id_token') || ''

    if (!accessToken) {
      return { success: false, error: 'Không tìm thấy Access Token trong link bạn vừa dán.' }
    }

    // 1. Trích xuất PUUID từ id_token hoặc access_token
    let puuid = ''
    if (idToken) {
      const payload = parseJwt(idToken)
      puuid = payload?.sub || ''
    }
    if (!puuid) {
      const payload = parseJwt(accessToken)
      puuid = payload?.sub || ''
    }

    // 2. Lấy Entitlements Token (bắt buộc gửi body: '{}')
    let entitlementsToken = ''
    try {
      const entRes = await fetch('/riot-entitlements/api/token/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: '{}',
      })
      if (entRes.ok) {
        const entData = await entRes.json()
        entitlementsToken = entData.entitlements_token || ''
        if (entData.subject) {
          puuid = entData.subject
        }
      } else {
        console.warn('Lỗi lấy entitlements token status:', entRes.status)
      }
    } catch (e) {
      console.warn('Lỗi kết nối entitlements:', e)
    }

    // 3. Lấy Game Name & Tagline & Canonical PUUID (Userinfo trả về PUUID chuẩn nhất cho Valorant)
    let gameName = ''
    let tagLine = ''
    try {
      const userRes = await fetch('/riot-auth/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (userRes.ok) {
        const userData = await userRes.json()
        if (userData.sub) {
          puuid = userData.sub
        }
        gameName = userData.acct?.game_name || userData.preferred_username || ''
        tagLine = userData.acct?.tag_line || ''
      }
    } catch {
      // optional
    }

    return {
      success: true,
      account: {
        region,
        puuid,
        accessToken,
        idToken,
        entitlementsToken,
        gameName: gameName || 'Riot Player',
        tagLine,
        status: 'success',
      },
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi khi trích xuất Token' }
  }
}

/**
 * Đăng nhập Riot bằng username & password
 */
export async function authenticateRiotUser(
  username: string,
  password: string,
  region: RiotRegion = 'ap',
): Promise<{
  success: boolean
  account?: Partial<RiotAccount>
  requires2fa?: boolean
  error?: string
}> {
  try {
    const initRes = await fetch('/riot-auth/api/v1/authorization', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: 'play-valorant-web-prod',
        nonce: '1',
        redirect_uri: 'https://playvalorant.com/opt_in',
        response_type: 'token id_token',
        scope: 'account openid',
      }),
    })

    if (!initRes.ok) {
      return {
        success: false,
        error:
          'Máy chủ Riot từ chối khởi tạo phiên trực tiếp. Bạn hãy sử dụng phương thức "Web Riot 1-Click" bên cạnh!',
      }
    }

    const authRes = await fetch('/riot-auth/api/v1/authorization', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'auth',
        username,
        password,
        remember: true,
      }),
    })

    const authData = await authRes.json()

    if (authData.type === 'multifactor') {
      return {
        success: false,
        requires2fa: true,
        error: 'Tài khoản yêu cầu mã xác thực 2 lớp (2FA). Hãy sử dụng phương thức đăng nhập Web Riot 1-Click!',
      }
    }

    if (authData.error) {
      if (authData.error === 'auth_failure') {
        return { success: false, error: 'Tên đăng nhập hoặc mật khẩu không đúng.' }
      }
      return { success: false, error: authData.error }
    }

    const redirectUri: string = authData.response?.parameters?.uri || ''
    if (!redirectUri) {
      return { success: false, error: 'Không nhận được Redirect URI từ Riot' }
    }

    const hash = redirectUri.includes('#') ? redirectUri.split('#')[1] : redirectUri
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token') || ''
    const idToken = params.get('id_token') || ''
    const expiresIn = parseInt(params.get('expires_in') || '3600', 10)

    if (!accessToken) {
      return { success: false, error: 'Không trích xuất được Access Token' }
    }

    const jwtPayload = parseJwt(idToken)
    const puuid = jwtPayload?.sub || ''

    let entitlementsToken = ''
    try {
      const entRes = await fetch('/riot-entitlements/api/token/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: '{}',
      })
      if (entRes.ok) {
        const entData = await entRes.json()
        entitlementsToken = entData.entitlements_token || ''
      }
    } catch {
      // optional
    }

    let gameName = ''
    let tagLine = ''
    try {
      const userRes = await fetch('/riot-auth/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (userRes.ok) {
        const userData = await userRes.json()
        gameName = userData.acct?.game_name || userData.preferred_username || username
        tagLine = userData.acct?.tag_line || ''
      }
    } catch {
      // optional
    }

    return {
      success: true,
      account: {
        username,
        region,
        puuid,
        accessToken,
        entitlementsToken,
        gameName: gameName || username,
        tagLine,
        expiresAt: Date.now() + expiresIn * 1000,
        status: 'success',
      },
    }
  } catch {
    return {
      success: false,
      error:
        'Lỗi kết nối tới Riot. Hãy sử dụng phương thức "Web Riot 1-Click" bên cạnh!',
    }
  }
}

/**
 * Lấy số dư ví (VP, Radianite, Kingdom Credits)
 */
export async function fetchRiotWallet(account: RiotAccount): Promise<RiotWallet> {
  if (!account.accessToken || !account.puuid) {
    return { vp: 0, rad: 0, kc: 0 }
  }

  const clientVersion = await getRiotClientVersion()
  const regionsToTry = [account.region, 'ap', 'na', 'eu', 'kr'].filter(
    (v, i, a) => v && a.indexOf(v) === i,
  )

  for (const reg of regionsToTry) {
    const endpoint = `/riot-pd-${reg}/store/v1/wallet/${account.puuid}`
    try {
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          'X-Riot-Entitlements-JWT': account.entitlementsToken,
          'X-Riot-ClientPlatform': CLIENT_PLATFORM_BASE64,
          'X-Riot-ClientVersion': clientVersion,
        },
      })
      if (res.ok) {
        const data = await res.json()
        const balances = data.Balances || {}
        console.log('[Wallet Debug] Riot Balances:', balances)

        const vp = balances[CURRENCY_VP] ?? 0
        const rad =
          balances[CURRENCY_RAD] ??
          balances['e59aa87c-4cbf-517a-5983-6e81511be0b1'] ??
          balances['e594877f-537dee46-95af-d7d87f7b6401'] ??
          0
        const kc =
          balances[CURRENCY_KC] ??
          balances['85ca954a-412c-11e5-9acc-ac2901340a01'] ??
          0

        return { vp, rad, kc }
      } else {
        console.warn(`Wallet fetch on ${reg} returned:`, res.status)
      }
    } catch (e) {
      console.warn(`Wallet fetch exception on ${reg}:`, e)
    }
  }
  return { vp: 0, rad: 0, kc: 0 }
}

/**
 * Lấy Cửa hàng thật (Storefront) của tài khoản Riot
 */
export async function fetchRiotStorefront(
  account: RiotAccount,
  eligiblePool: DailyShopItem[],
): Promise<{ success: boolean; shop?: DailyShopData; wallet?: RiotWallet; error?: string }> {
  if (!account.accessToken) {
    return { success: false, error: 'Thiếu thông tin Access Token của tài khoản' }
  }

  // 1. Luôn đồng bộ và xác định Canonical PUUID từ userinfo (sửa lỗi 404 do PUUID pairwise)
  try {
    const userRes = await fetch('/riot-auth/userinfo', {
      headers: { Authorization: `Bearer ${account.accessToken}` },
    })
    if (userRes.ok) {
      const userData = await userRes.json()
      if (userData.sub) {
        account.puuid = userData.sub
      }
      if (userData.acct?.game_name || userData.preferred_username) {
        account.gameName = userData.acct?.game_name || userData.preferred_username
      }
      if (userData.acct?.tag_line) {
        account.tagLine = userData.acct?.tag_line
      }
    } else if (userRes.status === 401) {
      return {
        success: false,
        error:
          'Phiên đăng nhập Riot của tài khoản này đã hết hạn. Bạn hãy bấm nút "Kết Nối Acc Này" để làm mới token nhé!',
      }
    }
  } catch (err) {
    console.warn('Lỗi kiểm tra userinfo:', err)
  }

  if (!account.puuid) {
    return { success: false, error: 'Không thể xác định PUUID của tài khoản từ máy chủ Riot' }
  }

  // 2. Đảm bảo có Entitlements Token và cập nhật Subject PUUID chuẩn
  let entitlementsToken = account.entitlementsToken
  try {
    const entRes = await fetch('/riot-entitlements/api/token/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${account.accessToken}`,
      },
      body: '{}',
    })
    if (entRes.ok) {
      const entData = await entRes.json()
      entitlementsToken = entData.entitlements_token || entitlementsToken
      account.entitlementsToken = entitlementsToken
      if (entData.subject) {
        account.puuid = entData.subject
      }
    }
  } catch {
    // ignore
  }

  if (!entitlementsToken) {
    return {
      success: false,
      error: 'Không thể lấy Entitlements Token từ Riot. Vui lòng bấm làm mới hoặc kết nối lại.',
    }
  }

  // 3. Tự động phát hiện Region/Shard chính xác thông qua Riot PAS nếu có idToken
  if (account.idToken) {
    try {
      const pasRes = await fetch('/riot-pas/pas/v1/product/valorant', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${account.accessToken}`,
        },
        body: JSON.stringify({ id_token: account.idToken }),
      })
      if (pasRes.ok) {
        const pasData = await pasRes.json()
        const liveRegion = pasData.affinities?.live
        if (liveRegion && ['ap', 'na', 'eu', 'kr'].includes(liveRegion)) {
          account.region = liveRegion as RiotRegion
        }
      }
    } catch {
      // fallback
    }
  }

  // Chỉ 4 shard hợp lệ tồn tại trong Valorant PVP: ap, na, eu, kr
  const regionsToTry: RiotRegion[] = [account.region, 'ap', 'na', 'eu', 'kr'].filter(
    (v, i, a) => v && a.indexOf(v) === i,
  ) as RiotRegion[]

  const clientVersion = await getRiotClientVersion()
  let lastError = ''
  let successRes: Response | null = null

  // Thử v2 Storefront chuẩn trước, sau đó thử v3 nếu cần
  const attempts: { path: (reg: string) => string; method: string; body?: string }[] = [
    { path: (reg) => `/riot-pd-${reg}/store/v2/storefront/${account.puuid}`, method: 'GET' },
    { path: (reg) => `/riot-pd-${reg}/store/v3/storefront/${account.puuid}`, method: 'POST', body: '{}' },
    { path: (reg) => `/riot-pd-${reg}/store/v3/storefront/${account.puuid}`, method: 'GET' },
    { path: (reg) => `/riot-pd-${reg}/store/v2/storefront/${account.puuid}`, method: 'POST', body: '{}' },
  ]

  for (const reg of regionsToTry) {
    for (const attempt of attempts) {
      const endpoint = attempt.path(reg)
      try {
        const headers: Record<string, string> = {
          Authorization: `Bearer ${account.accessToken}`,
          'X-Riot-Entitlements-JWT': entitlementsToken,
          'X-Riot-ClientPlatform': CLIENT_PLATFORM_BASE64,
          'X-Riot-ClientVersion': clientVersion,
        }
        if (attempt.body) {
          headers['Content-Type'] = 'application/json'
        }

        const res = await fetch(endpoint, {
          method: attempt.method,
          headers,
          ...(attempt.body ? { body: attempt.body } : {}),
        })

        if (res.ok) {
          successRes = res
          account.region = reg
          break
        } else {
          const errText = await res.text().catch(() => '')
          lastError = `Riot (${res.status} ${reg.toUpperCase()}): ${errText || res.statusText}`
          console.warn(`[Storefront Attempt] ${attempt.method} ${endpoint} => ${res.status}:`, errText)
          if (res.status === 401 || res.status === 403) {
            break
          }
        }
      } catch (e: any) {
        lastError = e?.message || 'Lỗi kết nối proxy'
      }
    }
    if (successRes) break
  }

  if (!successRes) {
    return {
      success: false,
      error: `${lastError || 'Lỗi kết nối Riot'}. Vui lòng thử lại hoặc kết nối lại tài khoản!`,
    }
  }

  try {
    const data = await successRes.json()
    const offerUuids: string[] = data.SkinsPanelLayout?.SingleItemOffers || []
    const remainingSeconds: number =
      data.SkinsPanelLayout?.SingleItemOffersRemainingDurationInSeconds || 86400

    const matchedItems: DailyShopItem[] = []

    for (const uuid of offerUuids) {
      let found = eligiblePool.find((item) => {
        if (item.skinUuid === uuid || item.id === uuid) return true
        if (item.skin.levels?.some((l) => l.uuid === uuid)) return true
        return false
      })

      if (!found) {
        found = FALLBACK_SHOP_SKINS.find((item) => {
          if (item.skinUuid === uuid || item.id === uuid) return true
          if (item.skin.levels?.some((l) => l.uuid === uuid)) return true
          return false
        })
      }

      if (found) {
        matchedItems.push(found)
      } else {
        matchedItems.push({
          id: uuid,
          skinUuid: uuid,
          displayName: `Vũ khí đặc biệt (${uuid.slice(0, 8)})`,
          displayIcon:
            'https://media.valorant-api.com/weaponskins/b0bf255b-4cbe-ff06-8d6c-dcbe9e71ab11/displayicon.png',
          weaponName: 'Valorant Arsenal',
          weaponCategory: 'Vũ khí',
          cost: 1775,
          tier: determineTier({ displayName: 'Premium' } as any),
          skin: {
            uuid,
            displayName: `Vũ khí đặc biệt (${uuid.slice(0, 8)})`,
            themeUuid: '',
            contentTierUuid: null,
            displayIcon: null,
            wallpaper: null,
            assetPath: '',
            chromas: [],
            levels: [],
          },
        })
      }
    }

    const now = new Date()
    const resetDate = new Date(now.getTime() + remainingSeconds * 1000)

    const shopData: DailyShopData = {
      date: now.toISOString().split('T')[0],
      items: matchedItems,
      remainingSeconds,
      resetTimeISO: resetDate.toISOString(),
      isSimulation: false,
    }

    const wallet = await fetchRiotWallet(account)

    return { success: true, shop: shopData, wallet }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi khi gọi Riot Storefront API' }
  }
}
