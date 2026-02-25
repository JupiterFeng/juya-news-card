import { readPublicEnv } from './runtime-env';

type ResolveEndpointOptions = {
  configuredBaseUrl?: string;
  fallbackBaseUrl: string;
  actionPath: string;
  allowCrossOriginApi: boolean;
};

type ResolvedEndpoint = {
  endpoint: string;
  sameOrigin: boolean;
};

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function normalizeActionPath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

function currentOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://localhost';
}

function toBooleanFlag(value: string | undefined): boolean {
  const raw = String(value || '').trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
}

export function isCrossOriginApiAllowed(): boolean {
  return toBooleanFlag(readPublicEnv('VITE_ALLOW_CROSS_ORIGIN_API'));
}

export function isCrossOriginBearerAllowed(): boolean {
  return toBooleanFlag(readPublicEnv('VITE_ALLOW_CROSS_ORIGIN_BEARER'));
}

export function resolveEndpoint(options: ResolveEndpointOptions): ResolvedEndpoint {
  const origin = currentOrigin();
  const baseRaw = options.configuredBaseUrl?.trim() || options.fallbackBaseUrl;
  const base = normalizeBaseUrl(baseRaw);
  const actionPath = normalizeActionPath(options.actionPath);
  const url = new URL(`${base}${actionPath}`, origin);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Unsupported API protocol: ${url.protocol}`);
  }

  const sameOrigin = url.origin === origin;
  if (!sameOrigin && !options.allowCrossOriginApi) {
    throw new Error(
      `Cross-origin API endpoint is blocked by security policy: ${url.origin}. ` +
      'Set VITE_ALLOW_CROSS_ORIGIN_API=true only if you fully trust that endpoint.'
    );
  }

  return { endpoint: url.toString(), sameOrigin };
}

export function resolveBearerToken(rawToken: string, sameOrigin: boolean): string {
  const token = String(rawToken || '').trim();
  if (!token) return '';
  if (sameOrigin) return token;
  if (isCrossOriginBearerAllowed()) return token;
  return '';
}
