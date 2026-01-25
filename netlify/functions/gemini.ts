import { Handler } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

/**
 * Backend proxy for Gemini API calls
 * Prevents client-side API key exposure and enables backend-side retry logic
 */
export const handler: Handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { prompt, config } = JSON.parse(event.body || '{}');
    
    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing prompt' })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing GEMINI_API_KEY' })
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: config || { temperature: 0.1 }
    });

    if (!response.text) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Empty response from model' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ text: response.text })
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'API request failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
