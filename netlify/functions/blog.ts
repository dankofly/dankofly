import { Handler } from '@netlify/functions';

const FEED_URL = 'https://www.2die4livefoods.com/blogs/news.atom';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CachedArticles {
  data: BlogArticle[];
  fetchedAt: number;
}

interface BlogArticle {
  title: string;
  url: string;
  publishedAt: string;
  summary: string;
  imageUrl: string | null;
  author: string;
}

let cache: CachedArticles | null = null;

function extractText(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1].trim() : '';
}

function extractLinkHref(entryXml: string): string {
  const match = entryXml.match(/<link[^>]+href="([^"]+)"[^>]*rel="alternate"/);
  if (match) return match[1];
  const fallback = entryXml.match(/<link[^>]+href="([^"]+)"/);
  return fallback ? fallback[1] : '';
}

function extractImageUrl(html: string): string | null {
  const match = html.match(/<img[^>]+src="([^"]+)"/);
  return match ? match[1] : null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function parseAtomFeed(xml: string, limit: number): BlogArticle[] {
  const entries: BlogArticle[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null && entries.length < limit) {
    const entry = match[1];
    const title = stripHtml(extractText(entry, 'title'));
    const url = extractLinkHref(entry);
    const publishedAt = extractText(entry, 'published');
    const author = extractText(entry, 'name');
    const summaryHtml = extractText(entry, 'summary');
    const contentHtml = extractText(entry, 'content');
    const summary = stripHtml(summaryHtml).slice(0, 200);
    const imageUrl = extractImageUrl(contentHtml) || extractImageUrl(summaryHtml);

    if (title && url) {
      entries.push({ title, url, publishedAt, summary, imageUrl, author });
    }
  }

  return entries;
}

export const handler: Handler = async (event) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://2die4.hypeakz.io';
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const limit = Math.min(parseInt(event.queryStringParameters?.limit || '3', 10) || 3, 10);

  try {
    // Return cached data if still fresh
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ articles: cache.data.slice(0, limit) }),
      };
    }

    const response = await fetch(FEED_URL);
    if (!response.ok) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch blog feed', status: response.status }),
      };
    }

    const xml = await response.text();
    const articles = parseAtomFeed(xml, 10); // Parse up to 10, cache all

    cache = { data: articles, fetchedAt: Date.now() };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ articles: articles.slice(0, limit) }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal error', message: error instanceof Error ? error.message : 'Unknown' }),
    };
  }
};
