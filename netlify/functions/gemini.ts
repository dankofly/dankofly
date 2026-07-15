import { Handler } from '@netlify/functions';

// Preferred path: OpenRouter (OpenAI-compatible API, routes to Gemini models).
// Fallback path: direct Gemini REST API (works only if the Google project has the API enabled).
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.5-flash';

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

interface GenerationConfig {
  temperature?: number;
  responseMimeType?: string;
}

// text === null means failure; status/details carry the error info
interface LlmResult {
  text: string | null;
  status: number;
  details?: unknown;
}

const callOpenRouter = async (
  apiKey: string,
  prompt: string,
  config: GenerationConfig | undefined
): Promise<LlmResult> => {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://liveactivated.org',
      'X-Title': 'Nutriplaner',
    },
    body: JSON.stringify({
      model: process.env.NUTRI_MODEL || DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: config?.temperature ?? 0.1,
      ...(config?.responseMimeType === 'application/json'
        ? { response_format: { type: 'json_object' } }
        : {}),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('OpenRouter API error response:', errorData);
    return { text: null, status: response.status, details: errorData };
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    console.error('OpenRouter empty response:', data);
    return { text: null, status: 500, details: data };
  }
  return { text, status: 200 };
};

const callGeminiDirect = async (
  apiKey: string,
  prompt: string,
  config: GenerationConfig | undefined
): Promise<LlmResult> => {
  const response = await fetch(`${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: config?.temperature ?? 0.1,
        responseMimeType: config?.responseMimeType || 'text/plain',
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Gemini API error response:', errorData);
    return { text: null, status: response.status, details: errorData };
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error('Gemini empty response:', data);
    return { text: null, status: 500, details: data };
  }
  return { text, status: 200 };
};

export const handler: Handler = async (event) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://liveactivated.org';
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { prompt, config } = JSON.parse(event.body || '{}');

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing prompt' })
      };
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!openRouterKey && !geminiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Missing OPENROUTER_API_KEY / GEMINI_API_KEY' })
      };
    }

    const result = openRouterKey
      ? await callOpenRouter(openRouterKey, prompt, config)
      : await callGeminiDirect(geminiKey!, prompt, config);

    if (result.text === null) {
      return {
        statusCode: result.status,
        headers,
        body: JSON.stringify({
          error: 'LLM API request failed',
          details: result.details
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: result.text })
    };
  } catch (error) {
    console.error('LLM proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'API request failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
