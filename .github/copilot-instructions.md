# AI Coding Agent Instructions for 2die4 Nutrition Planner

## Project Overview
This is a React/TypeScript nutrition planning application that generates personalized 7-day activated nut meal plans using Google's Gemini AI. The app targets the 2die4 Live Foods brand, helping users meet nutritional goals through micro-portions of nutrient-dense nuts.

**Key Purpose**: Create deterministic, reproducible weekly nutrition plans where each day reaches 100%+ RDA coverage on at least 3 micronutrients.

---

## Architecture & Data Flow

### Core Components
- **Planner** (`components/Planner.tsx`): Main UI for generating personalized plans
  - Form collects `UserProfile` (age, gender, life stage, goal, weight, duration, language)
  - Implements caching logic: checks DB first by profile hash → generates new plan if needed
  - Displays multi-step progress UI with simulated loading states

- **NutLibrary** (`components/NutLibrary.tsx`): Educational nutrient explorer
  - Interactive nut selector with slider-based gram calculations
  - Shows top 3 micronutrients for selected amount relative to RDA
  - Links directly to 2die4 shop URLs for each nut

- **NutrientChart** (`components/NutrientChart.tsx`): Recharts visualization for nutrient breakdown

### Service Layer
- **geminiService.ts**: Core AI planning logic
  - `generateWeeklyPlan(user)` → Gemini API with strict JSON schema
  - Uses deterministic seed (hash of user profile) for reproducibility
  - **Critical constraint**: Prompt enforces 100%-RDA rule per day with 3+ micronutrients
  - Handles Brazil nut limits (MAX 8g adults, 3g children due to selenium toxicity)
  - Formats portions as household measurements ("1 nut", "1 EL", "eine Handvoll")

- **dbService.ts**: Neon PostgreSQL caching
  - `getProfileHash()`: Creates deterministic hash from user profile fields
  - `savePlan()` & `getLatestPlan()`: Client-side fetch to Netlify functions
  - **Key pattern**: Same profile always returns same plan (reproducibility guarantee)

### Backend
- **netlify/functions/plans.ts**: Serverless DB handler
  - Manages `plans` table: `id`, `created_at`, `profile_hash`, `plan_data` (JSONB)
  - GET with optional `?hash=` param; POST persists new plans
  - Connection string hardcoded (should move to env var)

---

## Data Types & Structure

**UserProfile**: Core input defining meal plan
```typescript
{ age, gender, lifeStage, goal, weight, duration, language }
```

**Nutrients**: Full nutrient map with 16 tracked items
```typescript
energy, protein, carbs, sugar, fat, saturatedFat, 
magnesium, calcium, iron, zinc, potassium, vitaminE, b1, b6, selenium, omega3
```

**WeeklyPlan**: AI-generated output structure
```typescript
{ title, strategy, schedule: DayPlan[], summary }
// DayPlan: { day, mix: string[], focus, supplement }
// mix example: ["30g Mandeln (eine Handvoll)", "10g Walnüsse (5 Nusshälften)"]
```

---

## Critical Patterns & Conventions

### 1. Reproducibility = Core Feature
- Every user input combination maps to one deterministic output
- Same profile hash → same Gemini seed → same weekly plan (temp=0.1)
- This is NOT a bug; it's intentional product design
- Cache by profile hash first before regenerating

### 2. Bilingual System (German/English)
- `APP_CONTENT` in `constants.ts` contains all UI strings
- Gemini prompts switch language: German → "Antworte strikt auf DEUTSCH"
- Daily limits also adjust: children 35g/day, adults 65g/day
- Brazil nut limits hardcoded in prompt: adults 8g, children 3g

### 3. RDA-Based Nutrition Algorithm
- Reference Daily Allowances in `constants.ts` (EU NRV standards)
- AI must hit ≥100% RDA on ≥3 different micronutrients per day
- This drives the nut selection algorithm (rotation, balancing)
- Portions scaled from `nutrientsPer100g` data

### 4. Environment Setup
- `GEMINI_API_KEY` or `API_KEY` exposed via Vite config
- DB connection string hardcoded in Netlify function (⚠️ security concern)
- `.env.local` required for local dev (Gemini key)

### 5. Component State Management
- Simple `useState` throughout (no Redux/Context)
- Planner loads latest plan on mount via `dbService.getLatestPlan()`
- Results auto-scroll into view when ready

---

## Developer Workflows

### Local Development
```bash
npm install
npm run dev  # Vite dev server on localhost:5173
```

### Build & Deploy
```bash
npm run build  # Optimizes for production
npm run preview  # Local preview of build output
```

### Netlify Deployment
- Auto-deploys from git
- Netlify Functions automatically handle `/netlify/functions/plans.ts`
- Requires env var: `GEMINI_API_KEY` (set in Netlify dashboard)

### Key Files for Common Tasks
- **Add new nut type**: Extend `NUT_DATA_BASE` array in `constants.ts`
- **Modify plan generation logic**: Edit prompt in `geminiService.ts` (careful: affects reproducibility)
- **Change UI strings**: Update `APP_CONTENT` in `constants.ts` (bilingual coverage needed)
- **Adjust RDA values**: Edit `RDA` const in `constants.ts`

---

## Integration Points & Dependencies

### External APIs
- **Google Gemini 3 Flash**: Generates nutrition plans (model hardcoded)
- **Neon PostgreSQL**: Plan caching & history
- **2die4 Shop**: External URLs in `NutProfile.shopUrl`

### Libraries
- **React 18.2** + TypeScript 5.2
- **Vite**: Build tool & dev server
- **Recharts**: Nutrient visualization
- **Lucide-react**: Icon library
- **react-markdown**: Potential use in plan display
- **postgres** (postgresjs): Client for Neon DB

### Deployment
- **Netlify**: Hosting + Serverless Functions
- **Tailwind CSS**: Styling (inferred from class patterns)

---

## Common Pitfalls & Rules

1. **Don't break determinism**: Avoid random seed changes or timestamp-based logic in Gemini prompts
2. **Brazil nut limits**: Always enforce 8g adult / 3g child max in validation
3. **JSON parsing**: Gemini sometimes wraps JSON in markdown backticks—stripping logic exists, maintain it
4. **Error boundaries**: Network calls to Gemini and DB can fail; always have fallback UI
5. **Bilingual consistency**: Any new strings need both DE and EN translations in `APP_CONTENT`
6. **Profile hashing**: Must include all 7 UserProfile fields; order matters for consistency
7. **Input validation**: Always validate `UserProfile` via `validationService.validateUserProfile()` before API calls
8. **Retry logic**: Use `retryWithBackoff()` pattern for Gemini; `retryFetch()` for DB (already implemented)

---

## Recent Security & Stability Improvements (v1.1)

### New Services
- **validationService.ts**: Input validation + sanitization
  - `validateUserProfile()`: Returns array of `ValidationError` objects
  - `sanitizeUserProfile()`: Coerces unsafe input to valid defaults
  - Used in `Planner.tsx` handleSubmit before any API calls

### Backend Proxy
- **netlify/functions/gemini.ts**: Secures API key from client
  - Proxy endpoint for Gemini API calls (use instead of direct client calls)
  - Handles retry logic at backend level
  - Prevents quota abuse from exposed keys

### DB Hardening
- **netlify/functions/plans.ts**: Environment variable support
  - Reads `DATABASE_URL` or `NEON_DATABASE_URL` (no hardcoded credentials)
  - Lazy initialization prevents connection errors at boot
  - Required env var in Netlify dashboard: `DATABASE_URL`

### Error Handling
- **geminiService.ts**: `retryWithBackoff()` utility
  - 3 retries with exponential backoff (1s → 2s → 4s)
  - Wraps `generateWeeklyPlan()` for automatic resilience
- **dbService.ts**: `retryFetch()` utility
  - Same retry pattern for DB operations
  - Silent failures logged but handled gracefully


