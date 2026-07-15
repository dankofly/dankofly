import { Language, UserProfile } from '../types';

export interface SubscribePayload {
  email: string;
  language: Language;
  planId: number | null;
  goal: UserProfile['goal'];
  website: string; // Honeypot, bleibt bei echten Nutzern leer
}

export const subscribeService = {
  async subscribe(payload: SubscribePayload): Promise<{ ok: boolean; status: number }> {
    try {
      const r = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return { ok: r.ok, status: r.status };
    } catch {
      return { ok: false, status: 0 };
    }
  },
};
