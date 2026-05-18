export default async (request: Request) => {
  return new Response(JSON.stringify({ 
    message: "Hello from Vercel!", 
    pathname: new URL(request.url).pathname 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};