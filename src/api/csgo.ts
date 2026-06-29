import axios from 'axios'
import { Agent, Weapon, MapData } from '../types/valorant'
import { PatchNote } from '../data/patchNotes'
import { csgoAgents, csgoWeapons, csgoMaps, csgoPatchNotes } from '../data/csgoData'

const SKINS_URL = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json'
const AGENTS_URL = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/agents.json'
const BASE_WEAPONS_CDN = 'https://images.weserv.nl/?url=https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/weapons/base_weapons'

let cachedWeapons: Weapon[] = []
let cachedAgents: Agent[] = []

const BASE_WEAPONS = [
  {
    id: 'weapon_ak47',
    name: 'AK-47',
    category: 'EWeaponCategory::Rifle',
    cost: 2700,
    categoryText: 'Súng trường',
    displayIcon: `${BASE_WEAPONS_CDN}/weapon_ak47_png.png`,
    magazineSize: 30,
    fireRate: 10,
    wallPenetration: 'High',
    runSpeedMultiplier: 0.85,
    damage: { head: 109, body: 36, leg: 27 }
  },
  {
    id: 'weapon_m4a1',
    name: 'M4A4',
    category: 'EWeaponCategory::Rifle',
    cost: 3100,
    categoryText: 'Súng trường',
    displayIcon: `${BASE_WEAPONS_CDN}/weapon_m4a1_png.png`,
    magazineSize: 30,
    fireRate: 11,
    wallPenetration: 'Medium',
    runSpeedMultiplier: 0.88,
    damage: { head: 92, body: 26, leg: 20 }
  },
  {
    id: 'weapon_m4a1_silencer',
    name: 'M4A1-S',
    category: 'EWeaponCategory::Rifle',
    cost: 2900,
    categoryText: 'Súng trường',
    displayIcon: `${BASE_WEAPONS_CDN}/weapon_m4a1_silencer_png.png`,
    magazineSize: 20,
    fireRate: 10,
    wallPenetration: 'Medium',
    runSpeedMultiplier: 0.88,
    damage: { head: 94, body: 27, leg: 20 }
  },
  {
    id: 'weapon_awp',
    name: 'AWP',
    category: 'EWeaponCategory::Sniper',
    cost: 4750,
    categoryText: 'Súng bắn tỉa',
    displayIcon: `${BASE_WEAPONS_CDN}/weapon_awp_png.png`,
    magazineSize: 5,
    fireRate: 0.89,
    wallPenetration: 'High',
    runSpeedMultiplier: 0.8,
    damage: { head: 459, body: 115, leg: 86 }
  },
  {
    id: 'weapon_deagle',
    name: 'Desert Eagle',
    category: 'EWeaponCategory::Sidearm',
    cost: 700,
    categoryText: 'Súng lục',
    displayIcon: `${BASE_WEAPONS_CDN}/weapon_deagle_png.png`,
    magazineSize: 7,
    fireRate: 4,
    wallPenetration: 'High',
    runSpeedMultiplier: 0.92,
    damage: { head: 140, body: 53, leg: 39 }
  },
  {
    id: 'weapon_glock',
    name: 'Glock-18',
    category: 'EWeaponCategory::Sidearm',
    cost: 200,
    categoryText: 'Súng lục',
    displayIcon: `${BASE_WEAPONS_CDN}/weapon_glock_png.png`,
    magazineSize: 20,
    fireRate: 6.67,
    wallPenetration: 'Low',
    runSpeedMultiplier: 0.96,
    damage: { head: 72, body: 18, leg: 13 }
  },
  {
    id: 'weapon_usp_silencer',
    name: 'USP-S',
    category: 'EWeaponCategory::Sidearm',
    cost: 200,
    categoryText: 'Súng lục',
    displayIcon: `${BASE_WEAPONS_CDN}/weapon_usp_silencer_png.png`,
    magazineSize: 12,
    fireRate: 5.88,
    wallPenetration: 'Low',
    runSpeedMultiplier: 0.96,
    damage: { head: 140, body: 35, leg: 26 }
  },
  {
    id: 'weapon_knife',
    name: 'Karambit Knife',
    category: 'EWeaponCategory::Melee',
    cost: 0,
    categoryText: 'Dao / Cận chiến',
    displayIcon: `${BASE_WEAPONS_CDN}/weapon_knife_png.png`,
    magazineSize: 0,
    fireRate: 0,
    wallPenetration: 'Low',
    runSpeedMultiplier: 1.0,
    damage: null
  }
]

export const getCsgoAgents = async (_lang: string = 'vi-VN'): Promise<Agent[]> => {
  if (cachedAgents.length > 0) return cachedAgents

  try {
    const res = await axios.get(AGENTS_URL)
    const data = res.data

    const mapped = data.slice(0, 12).map((a: any, idx: number) => {
      const isCT = a.team?.id === 'ct' || a.team?.id === 'both' || idx % 2 === 0
      
      const ctIcon = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23de9b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
      const tIcon = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23ff5500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>`
      
      const smokeIcon = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23de9b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.47 0-.89.09-1.28.26A5.5 5.5 0 0 0 5 13c0 2.2 1.8 4 4 4h8.5Z"/><path d="M6 10a4 4 0 0 1 7.28-2.28c.39-.17.81-.26 1.28-.26 2.46 0 4.5 1.71 4.5 4.5"/></svg>`
      const flashIcon = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23de9b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/><circle cx="12" cy="12" r="4"/></svg>`
      const heIcon = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23de9b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><circle cx="12" cy="12" r="3"/><path d="M12 2v8M12 14v8M7 7l10 10M7 17L17 7"/></svg>`
      const molotovIcon = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23de9b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`

      return {
        uuid: a.id,
        displayName: a.name,
        description: a.description || 'Thông tin biệt kích đặc nhiệm Counter-Strike 2.',
        developerName: 'Valve',
        characterTags: [isCT ? 'CT' : 'T'],
        displayIcon: a.image || '/csgo/cs2_agent_sas.png',
        displayIconSmall: a.image || '/csgo/cs2_agent_sas.png',
        bustPortrait: a.image || '/csgo/cs2_agent_sas.png',
        fullPortrait: a.image || '/csgo/cs2_agent_sas.png',
        fullPortraitV2: a.image || '/csgo/cs2_agent_sas.png',
        killfeedPortrait: a.image || '/csgo/cs2_agent_sas.png',
        background: a.image || '/csgo/cs2_agent_sas.png',
        backgroundGradientColors: isCT ? ['de9b35', '1c2228', '0d1113'] : ['cc5500', '221b1b', '100c0c'],
        assetPath: `csgo/agents/${a.id}`,
        isFullPortraitRightFacing: true,
        isPlayableCharacter: true,
        isAvailableForTest: true,
        isBaseContent: true,
        role: {
          uuid: isCT ? 'role-ct' : 'role-t',
          displayName: isCT ? 'Counter-Terrorist' : 'Terrorist',
          description: isCT ? 'Lực lượng đặc nhiệm chống khủng bố.' : 'Lực lượng khủng bố.',
          displayIcon: isCT ? ctIcon : tIcon,
        },
        abilities: [
          { slot: 'Q', displayName: 'Flashbang', description: 'Mìn choáng phát ánh sáng cực mạnh làm mù tạm thời người chơi.', displayIcon: flashIcon },
          { slot: 'E', displayName: 'HE Grenade', description: 'Lựu đạn nổ gây sát thương diện rộng.', displayIcon: heIcon },
          { slot: 'C', displayName: 'Smoke Grenade', description: 'Lựu đạn khói tạo vùng khói xám cản tầm nhìn.', displayIcon: smokeIcon },
          { slot: 'X', displayName: 'Molotov / Incendiary', description: 'Chai bom xăng gây cháy lan trên mặt đất.', displayIcon: molotovIcon },
        ],
        voiceLine: null,
      }
    })

    cachedAgents = mapped
    return mapped
  } catch (err) {
    console.error('Lỗi khi tải agents CSGO:', err)
    return csgoAgents
  }
}

export const getCsgoWeapons = async (_lang: string = 'vi-VN'): Promise<Weapon[]> => {
  if (cachedWeapons.length > 0) return cachedWeapons

  try {
    const res = await axios.get(SKINS_URL)
    const allSkins = res.data

    const mapped = BASE_WEAPONS.map((base) => {
      const isKnife = base.id === 'weapon_knife'
      const weaponSkins = allSkins.filter((s: any) => {
        if (isKnife) {
          return s.weapon?.id?.includes('knife') || s.weapon?.id?.includes('bayonet')
        }
        return s.weapon?.id === base.id
      })

      const skinsMapped = weaponSkins.map((ws: any) => ({
        uuid: ws.id,
        displayName: ws.name,
        themeUuid: ws.pattern?.id || ws.id,
        contentTierUuid: ws.rarity?.id || 'standard',
        displayIcon: ws.image,
        wallpaper: null,
        assetPath: `csgo/weapons/${base.id}/${ws.id}`,
        chromas: [],
        levels: []
      }))

      return {
        uuid: base.id,
        displayName: base.name,
        category: base.category,
        defaultSkinUuid: `default-${base.id}`,
        displayIcon: base.displayIcon,
        killfeedIcon: base.displayIcon,
        assetPath: `csgo/weapons/${base.id}`,
        weaponStats: base.damage ? {
          fireRate: base.fireRate,
          magazineSize: base.magazineSize,
          runSpeedMultiplier: base.runSpeedMultiplier,
          equipTimeSeconds: 1.0,
          reloadTimeSeconds: 2.5,
          firstBulletAccuracy: 0.8,
          shotgunPelletCount: 1,
          wallPenetration: base.wallPenetration,
          damageRanges: [
            {
              rangeStartMeters: 0,
              rangeEndMeters: 50,
              headDamage: base.damage.head,
              bodyDamage: base.damage.body,
              legDamage: base.damage.leg
            }
          ]
        } : null,
        shopData: {
          cost: base.cost,
          category: base.category.split('::').pop() || '',
          categoryText: base.categoryText
        },
        skins: skinsMapped
      }
    })

    cachedWeapons = mapped
    return mapped
  } catch (err) {
    console.error('Lỗi khi tải vũ khí CSGO:', err)
    return csgoWeapons
  }
}

export const getCsgoMaps = (_lang: string = 'vi-VN'): Promise<MapData[]> => {
  return Promise.resolve(csgoMaps)
}

export const getCsgoUpdates = (_lang: string = 'vi-VN'): Promise<PatchNote[]> => {
  return Promise.resolve(csgoPatchNotes)
}
