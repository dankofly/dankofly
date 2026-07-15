import { Handler } from '@netlify/functions';

const KLAVIYO_API = 'https://a.klaviyo.com';
const KLAVIYO_REVISION = '2024-10-15';
const METRIC_NAME = 'NutriPlan Requested';

const VALID_GOALS = ['balance', 'muscle', 'energy', 'immunity', 'growth_focus', 'keto', 'concentration', 'diet'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-Memory-Rate-Limit (reset bei Cold Start; Honeypot ist die primäre Abwehr)
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60_000;
const requestLog = new Map<string, number[]>();

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const recent = (requestLog.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    requestLog.set(ip, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(ip, recent);
  return false;
};

const klaviyoFetch = async (path: string, apiKey: string, payload: unknown): Promise<Response> => {
  return fetch(`${KLAVIYO_API}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Klaviyo-API-Key ${apiKey}`,
      'revision': KLAVIYO_REVISION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
};

export const handler: Handler = async (event) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://liveactivated.org';
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.KLAVIYO_PRIVATE_KEY_2DIE4;
  const defaultListId = process.env.KLAVIYO_LIST_ID;
  if (!apiKey || !defaultListId) {
    console.error('Missing KLAVIYO_PRIVATE_KEY_2DIE4 or KLAVIYO_LIST_ID env var');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Not configured' }) };
  }

  let body: any;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  // Honeypot: Bots füllen das versteckte Feld, echte Nutzer nie.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || email.length > 254 || !EMAIL_REGEX.test(email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email' }) };
  }

  const language: 'de' | 'en' = body.language === 'en' ? 'en' : 'de';
  const planId = Number.isInteger(body.planId) && body.planId > 0 ? body.planId : null;
  const goal = VALID_GOALS.includes(body.goal) ? body.goal : null;

  const ip = event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || 'unknown';
  if (isRateLimited(ip)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests' }) };
  }

  const listId = (language === 'en' && process.env.KLAVIYO_LIST_ID_EN) || defaultListId;
  const siteUrl = process.env.SITE_URL || 'https://liveactivated.org';
  // Plan-URL ausschließlich serverseitig bauen: nie Client-URLs in Mails übernehmen.
  const planUrl = planId ? `${siteUrl}/${language}/?plan=${planId}` : null;

  try {
    // 1. Profil mit Consent in die Liste (Double-Opt-in steuert Klaviyo)
    const subscribeRes = await klaviyoFetch('/api/profile-subscription-bulk-create-jobs/', apiKey, {
      data: {
        type: 'profile-subscription-bulk-create-job',
        attributes: {
          profiles: {
            data: [{
              type: 'profile',
              attributes: {
                email,
                subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } },
                properties: {
                  nutriplan_language: language,
                  nutriplan_goal: goal,
                  ...(planUrl ? { nutriplan_plan_url: planUrl } : {}),
                },
              },
            }],
          },
        },
        relationships: { list: { data: { type: 'list', id: listId } } },
      },
    });
    if (!subscribeRes.ok) {
      console.error('Klaviyo subscribe failed:', subscribeRes.status, await subscribeRes.text());
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Subscription failed' }) };
    }

    // 2. Event für den Flow (liefert Plan-Link + Rabattcode per Mail)
    const eventRes = await klaviyoFetch('/api/events/', apiKey, {
      data: {
        type: 'event',
        attributes: {
          metric: { data: { type: 'metric', attributes: { name: METRIC_NAME } } },
          profile: { data: { type: 'profile', attributes: { email } } },
          properties: {
            ...(planUrl ? { planUrl } : {}),
            ...(planId ? { planId } : {}),
            ...(goal ? { goal } : {}),
            language,
          },
        },
      },
    });
    if (!eventRes.ok) {
      console.error('Klaviyo event failed:', eventRes.status, await eventRes.text());
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Event failed' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (error: any) {
    console.error('Subscribe error:', error);
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'Upstream error' }) };
  }
};
