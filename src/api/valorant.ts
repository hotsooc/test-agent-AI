import axios from 'axios'
import { Agent, Weapon, MapData } from '../types/valorant'

const BASE_URL = 'https://valorant-api.com/v1'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<unknown>>()
const CACHE_TTL = 5 * 60 * 1000

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T
  }
  cache.delete(key)
  return null
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export const getAgents = (lang: string = 'vi-VN'): Promise<Agent[]> => {
  const cacheKey = `agents_${lang}`
  const cached = getCached<Agent[]>(cacheKey)
  if (cached) return Promise.resolve(cached)

  return axios
    .get(`${BASE_URL}/agents`, {
      params: { language: lang, isPlayableCharacter: true },
    })
    .then((response) => response.data.data)
    .then((data) => {
      setCache(cacheKey, data)
      return data
    })
    .catch((error) => {
      console.error('Lỗi khi tải danh sách đặc vụ:', error)
      throw error
    })
}

export const getWeapons = (lang: string = 'vi-VN'): Promise<Weapon[]> => {
  const cacheKey = `weapons_${lang}`
  const cached = getCached<Weapon[]>(cacheKey)
  if (cached) return Promise.resolve(cached)

  return axios
    .get(`${BASE_URL}/weapons`, {
      params: { language: lang },
    })
    .then((response) => response.data.data)
    .then((data) => {
      setCache(cacheKey, data)
      return data
    })
    .catch((error) => {
      console.error('Lỗi khi tải danh sách vũ khí:', error)
      throw error
    })
}

export const getMaps = (lang: string = 'vi-VN'): Promise<MapData[]> => {
  const cacheKey = `maps_${lang}`
  const cached = getCached<MapData[]>(cacheKey)
  if (cached) return Promise.resolve(cached)

  return axios
    .get(`${BASE_URL}/maps`, {
      params: { language: lang },
    })
    .then((response) => response.data.data)
    .then((data) => {
      setCache(cacheKey, data)
      return data
    })
    .catch((error) => {
      console.error('Lỗi khi tải danh sách bản đồ:', error)
      throw error
    })
}
