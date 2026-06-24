// Proxy /api/* requests to the Cloudflare Worker backend
const WORKER_URL = 'https://ga-enterprise-api.womtsi-id.workers.dev';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '/api');
  const targetUrl = WORKER_URL + path + url.search;

  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  return fetch(proxyRequest);
}
