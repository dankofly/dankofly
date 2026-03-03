import { BlogArticle } from '../types';

export const blogService = {
  async getRecentArticles(limit: number = 3): Promise<BlogArticle[]> {
    try {
      const res = await fetch(`/.netlify/functions/blog?limit=${limit}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.articles) ? data.articles : [];
    } catch {
      return [];
    }
  },
};
