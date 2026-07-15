
import { WeeklyPlan, UserProfile, PlanContext, StoredPlan } from '../types';

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
 * Enthält nur Felder, die in den Generierungs-Prompt einfließen. weight/duration ändern den Plan nicht
 * (duration skaliert nur die Einkaufsliste clientseitig) und würden Cache-Treffer unnötig verhindern.
 */
export const getProfileHash = (user: UserProfile): string => {
  const str = JSON.stringify({
    age: user.age,
    gender: user.gender,
    lifeStage: user.lifeStage,
    goal: user.goal,
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

/**
 * Wandelt die Server-Antwort {id, plan, context} in ein StoredPlan um.
 * Antworten ohne gültigen Plan (null, Legacy-Formate) ergeben null.
 */
const toStoredPlan = (data: any): StoredPlan | null => {
  if (!data || typeof data !== 'object' || !data.plan) return null;
  return {
    id: typeof data.id === 'number' ? data.id : null,
    plan: data.plan as WeeklyPlan,
    context: (data.context as PlanContext) ?? null,
  };
};

export const dbService = {
  /**
   * Speichert einen Plan in der Neon-Datenbank mit Retry-Logik.
   * Gibt die neue Row-ID zurück (für Permalinks), null bei Fehler.
   */
  async savePlan(plan: WeeklyPlan, hash: string, context: PlanContext): Promise<number | null> {
    const result = await retryFetch(
      () => fetch('/.netlify/functions/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, hash, context }),
      }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
    ).catch(e => {
      console.error('Failed to save plan after retries:', e);
      return null;
    });

    return typeof result?.id === 'number' ? result.id : null;
  },

  /**
   * Ruft den neuesten Plan für einen Profil-Hash ab.
   */
  async getLatestPlan(hash?: string): Promise<StoredPlan | null> {
    const url = hash ? `/.netlify/functions/plans?hash=${hash}` : '/.netlify/functions/plans';

    const result = await retryFetch(
      () => fetch(url).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
    );

    return toStoredPlan(result);
  },

  /**
   * Ruft einen geteilten Plan über seine ID ab (Permalink). Kein Retry bei 404.
   */
  async getPlanById(id: number): Promise<StoredPlan | null> {
    try {
      const r = await fetch(`/.netlify/functions/plans?id=${id}`);
      if (!r.ok) return null;
      return toStoredPlan(await r.json());
    } catch (e) {
      console.error('Failed to load shared plan:', e);
      return null;
    }
  }
};
