
import { WeeklyPlan, UserProfile } from '../types';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

/**
 * Utility: Retry logic with exponential backoff for network requests
 */
const retryFetch = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delayMs: number = RETRY_DELAY_MS
): Promise<T | null> => {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        const delay = delayMs * Math.pow(2, attempt);
        console.warn(`DB attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('DB max retries exceeded:', lastError?.message);
  return null;
};

/**
 * Erzeugt einen eindeutigen Hash für ein Nutzerprofil.
 * Dies garantiert, dass die Datenbank denselben Plan zurückgibt, wenn dieselben Einstellungen gewählt werden.
 */
export const getProfileHash = (user: UserProfile): string => {
  const str = JSON.stringify({
    age: user.age,
    gender: user.gender,
    lifeStage: user.lifeStage,
    goal: user.goal,
    weight: user.weight,
    duration: user.duration,
    language: user.language
  });
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString();
};

export const dbService = {
  /**
   * Speichert einen Plan in der Neon-Datenbank mit Retry-Logik.
   */
  async savePlan(plan: WeeklyPlan, hash: string): Promise<void> {
    await retryFetch(
      () => fetch('/.netlify/functions/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, hash }),
      }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
    ).catch(e => {
      console.error('Failed to save plan after retries:', e);
    });
  },

  /**
   * Ruft den neuesten Plan mit Retry-Logik ab.
   */
  async getLatestPlan(hash?: string): Promise<WeeklyPlan | null> {
    const url = hash ? `/.netlify/functions/plans?hash=${hash}` : '/.netlify/functions/plans';
    
    const result = await retryFetch(
      () => fetch(url).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
    );
    
    return result as WeeklyPlan | null;
  }
};
