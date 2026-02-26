import type {Route} from './+types/services.ph.$';

const API_HOST = 'eu.i.posthog.com';
const ASSET_HOST = 'eu-assets.i.posthog.com';

/**
 * PostHog reverse proxy - forwards requests through /services/ph to bypass ad blockers.
 * Routes /static/* to PostHog's asset server, everything else to the main API.
 */
async function posthogProxy(request: Request) {
  const url = new URL(request.url);
  const hostname = url.pathname.startsWith('/services/ph/static/')
    ? ASSET_HOST
    : API_HOST;

  const newUrl = new URL(url);
  newUrl.protocol = 'https';
  newUrl.hostname = hostname;
  newUrl.port = '443';
  newUrl.pathname = url.pathname.replace(/^\/services\/ph/, '') || '/';

  const headers = new Headers(request.headers);
  headers.set('host', hostname);
  headers.delete('accept-encoding');

  // Preserve client IP for geolocation
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    headers.set('x-forwarded-for', forwardedFor);
  } else {
    headers.delete('x-forwarded-for');
  }

    const response = await fetch(newUrl.toString(), {
    method: request.method,
    headers,
    body: request.body,
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');

  const data = await response.arrayBuffer();
  return new Response(data, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export async function loader({request}: Route.LoaderArgs) {
  return posthogProxy(request);
}

export async function action({request}: Route.ActionArgs) {
  return posthogProxy(request);
}
