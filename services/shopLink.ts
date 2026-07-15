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

export interface CartLine {
  variantId: string;
  qty: number;
}

export interface CartMapping {
  items: CartLine[];
  missing: string[]; // Namen ohne Varianten-Zuordnung → Einzel-Buttons nutzen
}

/**
 * Mappt Einkaufslisten-Positionen (Grammmengen) auf Shopify-Varianten.
 * Schwellen identisch zur packRecommendation-Logik im Planner:
 * < 80g → 1x 100g, <= 250g → 1x 250g, sonst Nx 250g.
 * Fehlt die bevorzugte Packungsgröße, wird die andere ersatzweise gestückelt.
 */
export const getCartItems = (
  list: { nutId?: string; name: string; amount: number }[],
  variants: Record<string, { variant100g?: string; variant250g?: string }>
): CartMapping => {
  const items: CartLine[] = [];
  const missing: string[] = [];

  for (const entry of list) {
    const v = entry.nutId ? variants[entry.nutId] : undefined;
    if (!v || (!v.variant100g && !v.variant250g)) {
      missing.push(entry.name);
      continue;
    }

    if (entry.amount < 80) {
      if (v.variant100g) items.push({ variantId: v.variant100g, qty: 1 });
      else items.push({ variantId: v.variant250g!, qty: 1 });
    } else if (entry.amount <= 250) {
      if (v.variant250g) items.push({ variantId: v.variant250g, qty: 1 });
      else items.push({ variantId: v.variant100g!, qty: Math.ceil(entry.amount / 100) });
    } else {
      if (v.variant250g) items.push({ variantId: v.variant250g, qty: Math.ceil(entry.amount / 250) });
      else items.push({ variantId: v.variant100g!, qty: Math.ceil(entry.amount / 100) });
    }
  }

  return { items, missing };
};

/**
 * Shopify-Cart-Permalink: legt alle Positionen direkt in den Warenkorb.
 */
export const buildCartPermalink = (items: CartLine[]): string | null => {
  if (items.length === 0) return null;
  const lines = items.map(i => `${i.variantId}:${i.qty}`).join(',');
  return withUtm(`https://www.2die4livefoods.com/cart/${lines}`, 'planner-cart');
};
