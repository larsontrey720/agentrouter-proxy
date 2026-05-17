import { Hono } from 'hono';
import { handle } from 'hono/vercel';

const app = new Hono();

app.all('/v1/*', async (c) => {
  const url = new URL(c.req.url);
  const targetUrl = `https://agentrouter.org${url.pathname}${url.search}`;
  
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Missing Authorization header' }, 401);
  }

  try {
    const response = await fetch(targetUrl, {
      method: c.req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'User-Agent': 'codex_cli_rs/0.101.0 (Mac OS 26.0.1; arm64) Apple_Terminal/464',
        'Originator': 'codex_cli_rs',
      },
      body: c.req.method !== 'GET' && c.req.method !== 'HEAD' 
        ? await c.req.text() 
        : undefined,
    });

    const responseText = await response.text();
    return new Response(responseText, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    return c.json({ error: 'Proxy error', details: error.message }, 500);
  }
});

export default handle(app);
