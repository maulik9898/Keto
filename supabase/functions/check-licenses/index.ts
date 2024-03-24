import * as postgres from 'https://deno.land/x/postgres@v0.17.0/mod.ts';

// Get the connection string from the environment variable "SUPABASE_DB_URL"
const databaseUrl = Deno.env.get('SUPABASE_DB_URL')!;
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Expose-Headers': '*',
  'Access-Control-Allow-Headers': 'x-license-key',
};
// Create a database pool with three connections that are lazily established
const pool = new postgres.Pool(databaseUrl, 3, true);

async function checkLicenseKey(req: Request): Promise<Response> {
  try {
    // Get the license key from the request headers
    const licenseKey = req.headers.get('x-license-key');

    if (!licenseKey) {
      return new Response('License key not provided', { status: 400 });
    }

    // Grab a connection from the pool
    const connection = await pool.connect();

    try {
      // Run a query to check if the license key exists and is active
      const result = await connection.queryObject`
        SELECT EXISTS (
          SELECT 1 FROM licenses
          WHERE hardware_key = ${licenseKey} AND is_active = true
        ) AS valid
      `;

      const isValid = result.rows[0].valid;

      if (isValid) {
        return new Response('License key is valid', {
          status: 200,
          headers: corsHeaders,
        });
      } else {
        return new Response('License key is invalid or inactive', {
          status: 404,
        });
      }
    } finally {
      // Release the connection back into the pool
      connection.release();
    }
  } catch (err) {
    console.error(err);
    return new Response(String(err?.message ?? err), { status: 500 });
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS' || req.method === "HEAD") {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method === 'GET') {
    return await checkLicenseKey(req);
  } else {
    return new Response('Method not allowed', { status: 405 });
  }
});