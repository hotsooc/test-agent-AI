export interface Ability {
  slot: string;
  displayName: string;
  description: string;
  displayIcon: string | null;
}

export interface Role {
  uuid: string;
  displayName: string;
  description: string;
  displayIcon: string;
}

export interface VoiceLine {
  minDuration: number;
  maxDuration: number;
  mediaList: Array<{
    id: number;
    wave: string;
  }>;
}

export interface Agent {
  uuid: string;
  displayName: string;
  description: string;
  developerName: string;
  characterTags: string[] | null;
  displayIcon: string;
  displayIconSmall: string;
  bustPortrait: string | null;
  fullPortrait: string | null;
  fullPortraitV2: string | null;
  killfeedPortrait: string;
  background: string | null;
  backgroundGradientColors: string[];
  assetPath: string;
  isFullPortraitRightFacing: boolean;
  isPlayableCharacter: boolean;
  isAvailableForTest: boolean;
  isBaseContent: boolean;
  role: Role | null;
  abilities: Ability[] | null;
  voiceLine: VoiceLine | null;
}

export interface Chroma {
  uuid: string;
  displayName: string;
  displayIcon: string | null;
  streamedVideo: string | null;
  assetPath: string;
  swatch: string | null;
}

export interface Level {
  uuid: string;
  displayName: string;
  levelItem: string | null;
  displayIcon: string | null;
  streamedVideo: string | null;
  assetPath: string;
}

export interface Skin {
  uuid: string;
  displayName: string;
  themeUuid: string;
  contentTierUuid: string | null;
  displayIcon: string | null;
  wallpaper: string | null;
  assetPath: string;
  chromas: Chroma[];
  levels: Level[];
}

export interface DamageRange {
  rangeStartMeters: number;
  rangeEndMeters: number;
  headDamage: number;
  bodyDamage: number;
  legDamage: number;
}

export interface WeaponStats {
  fireRate: number;
  magazineSize: number;
  runSpeedMultiplier: number;
  equipTimeSeconds: number;
  reloadTimeSeconds: number;
  firstBulletAccuracy: number;
  shotgunPelletCount: number;
  wallPenetration: string;
  damageRanges: DamageRange[];
}

export interface ShopData {
  cost: number;
  category: string;
  categoryText: string;
}

export interface Weapon {
  uuid: string;
  displayName: string;
  category: string;
  defaultSkinUuid: string;
  displayIcon: string;
  killfeedIcon: string;
  assetPath: string;
  weaponStats: WeaponStats | null;
  shopData: ShopData | null;
  skins: Skin[];
}

export interface MapData {
  uuid: string;
  displayName: string;
  coordinates: string | null;
  displayIcon: string | null;
  listViewIcon: string;
  splash: string;
  assetPath: string;
}
