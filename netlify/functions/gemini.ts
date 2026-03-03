import { Handler } from '@netlify/functions';

const MODEL = 'gemini-2.0-flash';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Backend proxy for Gemini API calls
 * Uses direct REST API instead of SDK to avoid bundling issues
 */
export const handler: Handler = async (event) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://2die4.hypeakz.io';
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Missing GEMINI_API_KEY' })
      };
    }

    // Build request body for Gemini REST API
    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: config?.temperature ?? 0.1,
        responseMimeType: config?.responseMimeType || 'text/plain',
      }
    };

    // Call Gemini API directly (key via header to avoid log leakage)
    const response = await fetch(
      `${API_URL}/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error response:', errorData);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: 'Gemini API request failed',
          details: errorData
        })
      };
    }

    const data = await response.json();

    // Extract text from Gemini response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Empty response from model', raw: data })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text })
    };
  } catch (error) {
    console.error('Gemini proxy error:', error);
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
