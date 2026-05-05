import AsyncStorage from '@react-native-async-storage/async-storage';

import { createSeedData } from '../data/sampleData.js';
import { normalizeCrmData } from '../utils/dataModelUtils.js';

const STORAGE_KEY = 'top-agents-collaboration:v5';
const LEGACY_KEYS = ['top-agents-collaboration:v4', 'top-agents-collaboration:v3'];

export async function loadCrmData() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);

    if (!saved) {
      for (const key of LEGACY_KEYS) {
        const legacy = await AsyncStorage.getItem(key);
        if (legacy) {
          const migrated = normalizeCrmData(JSON.parse(legacy));
          return { data: migrated, error: null, restoredFromSeed: false };
        }
      }

      return { data: normalizeCrmData(createSeedData()), error: null, restoredFromSeed: true };
    }

    const parsed = JSON.parse(saved);

    if (!parsed || !Array.isArray(parsed.properties) || !Array.isArray(parsed.agents)) {
      throw new Error('Stored CRM data has an invalid shape.');
    }

    return {
      data: {
        ...normalizeCrmData(parsed),
      },
      error: null,
      restoredFromSeed: false,
    };
  } catch (error) {
    return {
      data: normalizeCrmData(createSeedData()),
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
  const data = normalizeCrmData(createSeedData());
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export async function clearCrmData() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
