
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

// Ensure the table exists
const ensureTable = async () => {
  const db = getDb();
  await db`
    CREATE TABLE IF NOT EXISTS plans (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      profile_hash TEXT,
      plan_data JSONB NOT NULL
    )
  `;
};

export const handler: Handler = async (event) => {
  try {
    const db = getDb();
    await ensureTable();

    if (event.httpMethod === 'POST') {
      const { plan, hash } = JSON.parse(event.body || '{}');
      if (!plan) return { statusCode: 400, body: JSON.stringify({ error: 'Missing plan' }) };

      const [inserted] = await db`
        INSERT INTO plans (profile_hash, plan_data)
        VALUES (${hash || null}, ${JSON.stringify(plan)})
        RETURNING *
      `;

      return {
        statusCode: 201,
        body: JSON.stringify(inserted),
      };
    }

    if (event.httpMethod === 'GET') {
      const hash = event.queryStringParameters?.hash;
      
      let rows;
      if (hash) {
        // Find the most recent plan for this specific user profile
        rows = await db`
          SELECT plan_data FROM plans 
          WHERE profile_hash = ${hash} 
          ORDER BY created_at DESC 
          LIMIT 1
        `;
      } else {
        // Just get the absolute most recent plan globally
        rows = await db`
          SELECT plan_data FROM plans 
          ORDER BY created_at DESC 
          LIMIT 1
        `;
      }

      return {
        statusCode: 200,
        body: JSON.stringify(rows[0]?.plan_data || null),
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
