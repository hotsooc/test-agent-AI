import axios from 'axios';
import { Agent, Weapon, MapData } from '../types/valorant';

const BASE_URL = 'https://valorant-api.com/v1';

export const getAgents = async (lang: string = 'vi-VN'): Promise<Agent[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/agents`, {
      params: {
        language: lang,
        isPlayableCharacter: true,
      },
    });
    console.log('abc: ', response)
    return response.data.data;
  } catch (error) {
    console.error('Lỗi khi tải danh sách đặc vụ:', error);
    throw error;
  }
};

export const getWeapons = async (lang: string = 'vi-VN'): Promise<Weapon[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/weapons`, {
      params: {
        language: lang,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Lỗi khi tải danh sách vũ khí:', error);
    throw error;
  }
};

export const getMaps = async (lang: string = 'vi-VN'): Promise<MapData[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/maps`, {
      params: {
        language: lang,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Lỗi khi tải danh sách bản đồ:', error);
    throw error;
  }
};
