import { Handler } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-2.0-flash';

/**
 * Backend proxy for Gemini API calls
 * Prevents client-side API key exposure
 */
export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Missing GEMINI_API_KEY' })
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build simple config without schema (let model return JSON naturally)
    const requestConfig: Record<string, unknown> = {
      temperature: config?.temperature ?? 0.1,
    };

    if (config?.seed !== undefined) {
      requestConfig.seed = config.seed;
    }

    if (config?.responseMimeType) {
      requestConfig.responseMimeType = config.responseMimeType;
    }

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: requestConfig
    });

    if (!response.text) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Empty response from model' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: response.text })
    };
  } catch (error) {
    console.error('Gemini API error:', error);
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
