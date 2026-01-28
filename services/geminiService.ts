import { getNutData, RDA } from '../constants';
import { UserProfile, WeeklyPlan } from '../types';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const GEMINI_PROXY_URL = '/.netlify/functions/gemini';

/**
 * Utility: Retry logic with exponential backoff
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delayMs: number = RETRY_DELAY_MS
): Promise<T> => {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        const delay = delayMs * Math.pow(2, attempt);
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, lastError.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
};

/**
 * Erzeugt einen deterministischen Seed basierend auf dem Nutzerprofil.
 */
const generateSeed = (user: UserProfile): number => {
  const str = JSON.stringify({
    age: user.age,
    gender: user.gender,
    lifeStage: user.lifeStage,
    goal: user.goal,
    weight: user.weight,
    duration: user.duration,
    language: user.language
  });
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

export const generateWeeklyPlan = async (user: UserProfile): Promise<WeeklyPlan> => {
  return retryWithBackoff(() => generateWeeklyPlanInternal(user));
};

/**
 * Ziel-spezifische Nuss-Präferenzen basierend auf Nährstoffprofilen
 */
const GOAL_NUT_PREFERENCES: Record<string, { primary: string[]; secondary: string[]; rationale: string }> = {
  balance: {
    primary: ['Mandeln', 'Cashewkerne', 'Walnüsse'],
    secondary: ['Haselnüsse', 'Kürbiskerne', 'Paranüsse'],
    rationale: 'Ausgewogene Mischung aller Makro- und Mikronährstoffe für allgemeine Gesundheit'
  },
  energy: {
    primary: ['Cashewkerne', 'Mandeln', 'Haselnüsse'],
    secondary: ['Kürbiskerne', 'Paranüsse'],
    rationale: 'B-Vitamine (B1, B6) und Magnesium für Energiestoffwechsel und Nervenfunktion'
  },
  muscle: {
    primary: ['Kürbiskerne', 'Mandeln', 'Cashewkerne'],
    secondary: ['Pistazien', 'Walnüsse'],
    rationale: 'Hoher Proteingehalt (Kürbiskerne: 30g/100g), Zink und Magnesium für Muskelaufbau'
  },
  immunity: {
    primary: ['Paranüsse', 'Kürbiskerne', 'Mandeln'],
    secondary: ['Cashewkerne', 'Haselnüsse'],
    rationale: 'Selen (Paranüsse), Zink und Vitamin E für Immunfunktion und Zellschutz'
  },
  keto: {
    primary: ['Haselnüsse', 'Pekannüsse', 'Walnüsse'],
    secondary: ['Mandeln', 'Paranüsse'],
    rationale: 'Niedrige Kohlenhydrate (Haselnüsse: 5g/100g), hoher Fettanteil für ketogene Ernährung'
  },
  growth_focus: {
    primary: ['Mandeln', 'Kürbiskerne', 'Cashewkerne'],
    secondary: ['Haselnüsse', 'Walnüsse'],
    rationale: 'Calcium, Protein und Zink für Knochenaufbau und Wachstum bei Kindern'
  },
  concentration: {
    primary: ['Walnüsse', 'Cashewkerne', 'Kürbiskerne'],
    secondary: ['Mandeln', 'Haselnüsse'],
    rationale: 'Omega-3 (Walnüsse: 10g ALA/100g), B-Vitamine und Magnesium für Gehirnfunktion und Konzentration'
  }
};

const generateWeeklyPlanInternal = async (user: UserProfile): Promise<WeeklyPlan> => {
  const nutData = getNutData(user.language);
  const nutContext = JSON.stringify(nutData);
  const rdaContext = JSON.stringify(RDA);

  const langInstruction = user.language === 'de'
    ? 'Antworte strikt auf DEUTSCH.'
    : 'Respond strictly in British ENGLISH.';

  const dailyTotal = user.lifeStage === 'child' ? 35 : 65;
  const brazilLimit = user.lifeStage === 'child' ? 'MAX 3g (ca. 1/2 Paranuss)' : 'MAX 8g (ca. 2 Paranüsse)';

  // Ziel-spezifische Präferenzen
  const goalPrefs = GOAL_NUT_PREFERENCES[user.goal] || GOAL_NUT_PREFERENCES.balance;

  const prompt = `
    Du bist ein Experte für orthomolekulare Ernährung und "Aktivierte Nüsse".
    Deine Aufgabe ist die Erstellung eines evidenzbasierten, reproduzierbaren 7-Tage-Wochenplans.
    ${langInstruction}

    NUTZERDATEN:
    Ziel: ${user.goal}
    Lebensphase: ${user.lifeStage}
    Alter: ${user.age} Jahre
    Geschlecht: ${user.gender}
    Tagesbudget: ca. ${dailyTotal}g Nüsse

    ZIEL-SPEZIFISCHE NUSS-PRÄFERENZEN (STRIKTE VORGABE):
    Primär verwenden: ${goalPrefs.primary.join(', ')}
    Sekundär/ergänzend: ${goalPrefs.secondary.join(', ')}
    Wissenschaftliche Begründung: ${goalPrefs.rationale}

    STRIKTE ALGORITHMUS-REGELN:
    1. REPRODUZIERBARKEIT: Nutze ein deterministisches Protokoll. Gleiche Profile = gleiche Empfehlungen.
       - Tag 1: Fokus auf primäre Nuss 1
       - Tag 2: Fokus auf primäre Nuss 2
       - Tag 3: Fokus auf primäre Nuss 3
       - Tag 4-7: Rotation mit sekundären Nüssen

    2. REALISTISCHE RDA-ZIELE: Bei ${dailyTotal}g Nüssen/Tag sind folgende Ziele erreichbar:
       - Selen: 100%+ RDA (mit 5-8g Paranüssen)
       - Vitamin E: 40-60% RDA (mit 25g Mandeln)
       - Magnesium: 30-50% RDA (mit Kürbiskernen/Cashews)
       - Omega-3 ALA: 50-100%+ RDA (mit Walnüssen)
       - Zink: 25-40% RDA
       Formuliere die Benefits entsprechend REALISTISCH ("liefert einen signifikanten Anteil", nicht "100%").

    3. AUSGEWOGENHEIT: Rotiere die Nüsse über die Woche. Kein Tag darf identisch sein.

    4. PORTIONSANGABEN: Nutze natürliche Haushalts-Mengenangaben:
       - Paranüsse: 1 Nuss ≈ 5g
       - Walnüsse: 1 Nusshälfte ≈ 2g
       - Kürbiskerne: 1 Esslöffel (EL) ≈ 10g
       - Mandeln: 1 Nuss ≈ 1.2g
       - Cashews: 1 Nuss ≈ 1.5g
       - Haselnüsse: 1 Nuss ≈ 1g
       - Pekannüsse: 1 Nusshälfte ≈ 2g
       - Pistazien: 1 Nuss ≈ 0.7g
       - Für größere Mengen ab ca. 25-30g: "eine Handvoll"

       FORMAT: "30g Mandeln (eine Handvoll)", "5g Paranüsse (1 Nuss)"

    5. SUPPLEMENT-ERSATZ: Gib für jeden Tag an, welches synthetische Präparat durch diese Mischung TEILWEISE ersetzt werden kann.
       Formuliere ehrlich: "Trägt zur Deckung des Tagesbedarfs an X bei" statt "Ersetzt X-Supplement vollständig".

    NÄHRWERT-DATENBANK:
    RDA (Erwachsene): ${rdaContext}
    Nüsse (pro 100g): ${nutContext}

    SICHERHEITSLIMITS:
    - Paranüsse: ${brazilLimit} (Selen-Obergrenze beachten)
    - Gesamtmenge: max. ${dailyTotal}g/Tag

    FORMAT (JSON):
    {
      "title": "Motivierender Name passend zum Ziel ${user.goal}",
      "strategy": "Kurze Erklärung der zielspezifischen Strategie",
      "schedule": [
        {
          "day": "Tag 1 - Montag",
          "mix": ["30g Mandeln (eine Handvoll)", "5g Paranüsse (1 Nuss)"],
          "focus": "Kurzer Nährstoff-Fokus",
          "supplement": "Ehrliche Aussage zu Supplement-Ersatz"
        }
      ],
      "summary": "Fazit mit realistischer Einschätzung der Nährstoffversorgung"
    }
  `;

  try {
    const response = await fetch(GEMINI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        config: {
          temperature: 0.1,
          seed: generateSeed(user),
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.text) throw new Error('Empty response from AI model.');

    let jsonText = data.text.trim();
    // Strip markdown if present
    if (jsonText.includes('```')) {
      const match = jsonText.match(/```(?:json)?([\s\S]*?)```/);
      if (match) jsonText = match[1].trim();
    }

    try {
      return JSON.parse(jsonText) as WeeklyPlan;
    } catch (parseError) {
      console.error('JSON Parse Error. Content:', jsonText);
      throw new Error('Failed to parse the nutrition plan structure.');
    }
  } catch (error) {
    console.error('Algorithm Error:', error);
    throw error;
  }
};