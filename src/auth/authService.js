import { DEMO_ACCOUNTS } from './demoAccounts.js';
import { clearSession, getCurrentUser, restoreSession, saveSession } from './currentSession.js';

export async function login(email, password, users = []) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const account = DEMO_ACCOUNTS.find(
    (item) => item.email.toLowerCase() === normalizedEmail && item.password === password,
  );

  if (!account) {
    return { user: null, error: 'Invalid email or password.' };
  }

  const user = users.find((item) => item.id === account.userId);
  if (!user || user.status === 'inactive' || user.isActive === false) {
    return { user: null, error: 'This demo account is not active.' };
  }

  await saveSession(user);
  return { user, error: null };
}

export async function logout() {
  await clearSession();
}

export { clearSession, getCurrentUser, restoreSession, saveSession };
