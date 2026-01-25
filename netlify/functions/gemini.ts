import { Handler } from '@netlify/functions';
import { GoogleGenAI, Type } from '@google/genai';

const MODEL = 'gemini-3-flash-preview';

/**
 * Backend proxy for Gemini API calls
 * Prevents client-side API key exposure
 */
export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
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

    // Build config with schema support
    const requestConfig: Record<string, unknown> = {
      temperature: config?.temperature ?? 0.1,
    };

    if (config?.seed !== undefined) {
      requestConfig.seed = config.seed;
    }

    if (config?.responseMimeType) {
      requestConfig.responseMimeType = config.responseMimeType;
    }

    // Reconstruct responseSchema with Type enum
    if (config?.responseSchema) {
      requestConfig.responseSchema = reconstructSchema(config.responseSchema);
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

/**
 * Reconstruct schema with proper Type enum values
 */
function reconstructSchema(schema: Record<string, unknown>): Record<string, unknown> {
  const typeMap: Record<string, unknown> = {
    'STRING': Type.STRING,
    'NUMBER': Type.NUMBER,
    'BOOLEAN': Type.BOOLEAN,
    'OBJECT': Type.OBJECT,
    'ARRAY': Type.ARRAY,
  };

  const result: Record<string, unknown> = { ...schema };

  if (typeof schema.type === 'string' && typeMap[schema.type]) {
    result.type = typeMap[schema.type];
  }

  if (schema.properties && typeof schema.properties === 'object') {
    const props: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema.properties as Record<string, unknown>)) {
      props[key] = reconstructSchema(value as Record<string, unknown>);
    }
    result.properties = props;
  }

  if (schema.items && typeof schema.items === 'object') {
    result.items = reconstructSchema(schema.items as Record<string, unknown>);
  }

  return result;
}
