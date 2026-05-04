import AsyncStorage from '@react-native-async-storage/async-storage';

import { createSeedData } from '../data/sampleData.js';

const STORAGE_KEY = 'top-agents-collaboration:v2';

export async function loadCrmData() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return { data: createSeedData(), error: null, restoredFromSeed: true };
    }

    const parsed = JSON.parse(saved);

    if (!parsed || !Array.isArray(parsed.properties) || !Array.isArray(parsed.agents)) {
      throw new Error('Stored CRM data has an invalid shape.');
    }

    return { data: parsed, error: null, restoredFromSeed: false };
  } catch (error) {
    return {
      data: createSeedData(),
      error: 'Stored demo data was corrupted, so fresh seed data was loaded.',
      restoredFromSeed: true,
    };
  }
}

export async function saveCrmData(data) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { error: null };
  } catch (error) {
    return { error: 'Demo data could not be saved locally on this device.' };
  }
}

export async function resetCrmData() {
  const data = createSeedData();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export async function clearCrmData() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
