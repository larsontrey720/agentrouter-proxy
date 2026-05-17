export default async (request: Request) => {
  try {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        },
      });
    }

    // Test route: fetch from httpbin.org
    if (url.pathname.startsWith('/test/')) {
      const targetUrl = 'https://httpbin.org/get';
      const upstream = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'vercel-proxy-test',
        },
      });
      const text = await upstream.text();
      return new Response(text, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Only proxy /v1/ paths
    if (!url.pathname.startsWith('/v1/')) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const targetUrl = `https://agentrouter.org${url.pathname}${url.search}`;

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined;

    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
        'User-Agent': 'codex_cli_rs/0.101.0 (Mac OS 26.0.1; arm64) Apple_Terminal/464',
        Originator: 'codex_cli_rs',
      },
      body,
    });

    const text = await upstream.text();

    return new Response(text, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Unknown error', stack: err.stack }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};