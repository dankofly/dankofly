
import { Handler } from '@netlify/functions';
import postgres from 'postgres';

// Load connection string from environment variable (safer than hardcoding)
const getConnectionString = (): string => {
  const connStr = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!connStr) {
    throw new Error('Missing DATABASE_URL or NEON_DATABASE_URL environment variable');
  }
  return connStr;
};

let sql: ReturnType<typeof postgres> | null = null;

const getDb = () => {
  if (!sql) {
    const connectionString = getConnectionString();
    sql = postgres(connectionString);
  }
  return sql;
};

// Ensure the table exists (only runs once per cold start)
let tableEnsured = false;
const ensureTable = async () => {
  if (tableEnsured) return;
  const db = getDb();
  await db`
    CREATE TABLE IF NOT EXISTS plans (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      profile_hash TEXT,
      plan_data JSONB NOT NULL
    )
  `;
  await db`
    CREATE INDEX IF NOT EXISTS idx_plans_profile_hash ON plans(profile_hash)
  `;
  // Render context for shared plan links (duration, lifeStage, language, goal).
  // Legacy rows keep NULL; clients fall back to defaults.
  await db`
    ALTER TABLE plans ADD COLUMN IF NOT EXISTS context JSONB
  `;
  tableEnsured = true;
};

// Older rows were stored double-encoded (JSONB containing a JSON string);
// unwrap so clients always receive the plan object.
const unwrapPlanData = (planData: unknown): unknown => {
  if (typeof planData === 'string') {
    try {
      return JSON.parse(planData);
    } catch {
      return null;
    }
  }
  return planData ?? null;
};

const toEnvelope = (row: { id: number; plan_data: unknown; context: unknown } | undefined) => {
  if (!row) return null;
  const plan = unwrapPlanData(row.plan_data);
  if (!plan) return null;
  return { id: row.id, plan, context: row.context ?? null };
};

export const handler: Handler = async (event) => {
  try {
    const db = getDb();
    await ensureTable();

    if (event.httpMethod === 'POST') {
      let parsed;
      try {
        parsed = JSON.parse(event.body || '{}');
      } catch {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
      }
      const { plan, hash, context } = parsed;
      if (!plan) return { statusCode: 400, body: JSON.stringify({ error: 'Missing plan' }) };

      const [inserted] = await db`
        INSERT INTO plans (profile_hash, plan_data, context)
        VALUES (${hash || null}, ${db.json(plan)}, ${context ? db.json(context) : null})
        RETURNING id
      `;

      return {
        statusCode: 201,
        body: JSON.stringify({ id: inserted.id }),
      };
    }

    if (event.httpMethod === 'GET') {
      const idParam = event.queryStringParameters?.id;
      const hash = event.queryStringParameters?.hash;

      if (idParam) {
        const id = parseInt(idParam, 10);
        if (!Number.isInteger(id) || id <= 0 || String(id) !== idParam.trim()) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Invalid id' }) };
        }
        const rows = await db`
          SELECT id, plan_data, context FROM plans WHERE id = ${id} LIMIT 1
        `;
        const envelope = toEnvelope(rows[0] as any);
        if (!envelope) {
          return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
        }
        return { statusCode: 200, body: JSON.stringify(envelope) };
      }

      let rows;
      if (hash) {
        // Find the most recent plan for this specific user profile
        rows = await db`
          SELECT id, plan_data, context FROM plans
          WHERE profile_hash = ${hash}
          ORDER BY created_at DESC
          LIMIT 1
        `;
      } else {
        // Just get the absolute most recent plan globally
        rows = await db`
          SELECT id, plan_data, context FROM plans
          ORDER BY created_at DESC
          LIMIT 1
        `;
      }

      return {
        statusCode: 200,
        body: JSON.stringify(toEnvelope(rows[0] as any)),
      };
    }

    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  } catch (error: any) {
    console.error('Database Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
