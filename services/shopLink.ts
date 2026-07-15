export const UTM_SOURCE = 'nutriplaner';
export const UTM_MEDIUM = 'referral';

export type UtmCampaign =
  | 'planner-shopping-list'
  | 'planner-cart'
  | 'planner-bundle'
  | 'planner-abo'
  | 'nut-library'
  | 'blog-article'
  | 'footer'
  | 'header-logo';

/**
 * Hängt UTM-Parameter an eine ausgehende Shop-URL.
 * Bestehende Query-Parameter (z. B. ?q= beim Such-Fallback) bleiben erhalten.
 * Nur für http(s)-URLs verwenden, nie für mailto:-Links.
 */
export const withUtm = (url: string, campaign: UtmCampaign): string => {
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source', UTM_SOURCE);
    u.searchParams.set('utm_medium', UTM_MEDIUM);
    u.searchParams.set('utm_campaign', campaign);
    return u.toString();
  } catch {
    return url;
  }
};
