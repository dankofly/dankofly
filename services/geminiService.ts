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

const generateWeeklyPlanInternal = async (user: UserProfile): Promise<WeeklyPlan> => {
  const nutData = getNutData(user.language);
  const nutContext = JSON.stringify(nutData);
  const rdaContext = JSON.stringify(RDA);
  
  const langInstruction = user.language === 'de' 
    ? 'Antworte strikt auf DEUTSCH.' 
    : 'Respond strictly in British ENGLISH.';

  const dailyTotal = user.lifeStage === 'child' ? 35 : 65;
  const brazilLimit = user.lifeStage === 'child' ? 'MAX 3g (ca. 1/2 Paranuss)' : 'MAX 8g (ca. 2 Paranüsse)';

  const prompt = `
    Du bist ein Experte für orthomolekulare Ernährung und "Aktivierte Nüsse".
    Deine Aufgabe ist die Erstellung eines mathematisch präzisen 7-Tage-Wochenplans.
    ${langInstruction}
    
    NUTZERDATEN:
    Ziel: ${user.goal}
    Lebensphase: ${user.lifeStage}
    Tagesbudget: ca. ${dailyTotal}g Nüsse
    
    STRIKTE ALGORITHMUS-REGELN:
    1. REPRODUZIERBARKEIT: Nutze ein festes Protokoll. Gleiche Profile führen zu gleichen Empfehlungen.
    2. 100%-TARGET: JEDER einzelne Tag im Plan muss so zusammengestellt sein, dass rechnerisch mindestens DREI (3) Mikronährstoffe 100% des RDA erreichen.
    3. AUSGEWOGENHEIT: Rotiere die Nüsse über die Woche. Kein Tag darf identisch sein. 
    4. PORTIONSANGABEN: Ersetze den Text "(aktiviert)" durch natürliche Haushalts-Mengenangaben in Klammern hinter dem Gewicht.
       Nutze folgende Richtwerte:
       - Paranüsse: 1 Nuss ≈ 5g
       - Walnüsse: 1 Nusshälfte ≈ 2g
       - Kürbiskerne: 1 Esslöffel (EL) ≈ 10g
       - Mandeln: 1 Nuss ≈ 1.2g
       - Cashews: 1 Nuss ≈ 1.5g
       - Haselnüsse: 1 Nuss ≈ 1g
       - Pekannüsse: 1 Nusshälfte ≈ 2g
       - Pistazien: 1 Nuss ≈ 0.7g
       - Für größere Mengen ab ca. 25-30g: Nutze den Begriff "eine Handvoll" (oder Bruchteile davon, z.B. "halbe Handvoll").
       
       BEISPIEL FORMAT: 
       "5g Paranüsse (1 Nuss)"
       "15g Walnüsse (ca. 7-8 Nusshälften)"
       "10g Kürbiskerne (1 EL)"
       "30g Mandeln (eine Handvoll)"
       "20g Cashewkerne (ca. 14 Nüsse)"
    
    5. BIO-HACK: Gib für jeden Tag einen konkreten Tipp (supplement), welches synthetische Präparat durch diese Mischung heute ersetzt wird.
    
    NÄHRWERT-DATENBANK (RDA & Werte pro 100g):
    RDA: ${rdaContext}
    Nüsse: ${nutContext}

    WICHTIGE LIMITS:
    - Paranüsse (Brazil Nuts): ${brazilLimit} (wegen Selen-Sättigung).
    - Gesamte Tagesmenge darf ${dailyTotal}g nicht signifikant überschreiten.

    FORMAT:
    Gib ein JSON Objekt zurück mit:
    - title: Motivierender Name.
    - strategy: Kurze Erklärung.
    - schedule: Array mit 7 Objekten (day, mix, focus, supplement).
      - mix: Array von Strings, z.B. ["30g Mandeln (eine Handvoll)", "10g Walnüsse (5 Nusshälften)", "5g Paranüsse (1 Nuss)"]
    - summary: Abschlussfazit.
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