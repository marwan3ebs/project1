import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'top-agents-collaboration:session:v1';

export async function saveSession(user) {
  const session = {
    userId: user.id,
    email: user.email,
    role: user.role,
    savedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function restoreSession() {
  const saved = await AsyncStorage.getItem(SESSION_KEY);
  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    await clearSession();
    return null;
  }
}

export async function getCurrentUser(users = []) {
  const session = await restoreSession();
  if (!session?.userId) {
    return null;
  }
  return users.find((user) => user.id === session.userId) || null;
}
