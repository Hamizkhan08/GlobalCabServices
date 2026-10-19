/**
 * Cloudflare Worker: Global Cab Services Reverse Proxy
 * Proxies all requests to the live Python Flask application backend
 * while preserving request paths, query strings, headers, and client IP.
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const backendOrigin = 'https://global-cab-services.vercel.app';

    // Construct backend request URL
    const targetUrl = new URL(url.pathname + url.search, backendOrigin);

    // Forward original client headers while routing to backend host
    const forwardHeaders = new Headers(request.headers);
    forwardHeaders.set('Host', 'global-cab-services.vercel.app');
    forwardHeaders.set('X-Forwarded-Host', url.host);
    forwardHeaders.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

    const proxyRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: forwardHeaders,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
      redirect: 'follow',
    });

    const response = await fetch(proxyRequest);

    // Return the response with proper caching & security headers
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-Powered-By', 'GlobalCabServices-Cloudflare');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
