const FALLBACK_BACKEND_URL = 'http://localhost:8000';

const readEnvBackendUrl = (): string | undefined => {
  if (typeof import.meta === 'undefined') return undefined;
  const value = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
    ?.VITE_BACKEND_URL;
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

/** Project root from `VITE_BACKEND_URL`, without a trailing slash. */
export const DEFAULT_BACKEND_URL = (readEnvBackendUrl() ?? FALLBACK_BACKEND_URL).replace(/\/$/, '');

export type ApiUrlQueryValue = string | number | boolean | null | undefined;

export type ApiUrlQuery =
  | string
  | URLSearchParams
  | Readonly<Record<string, ApiUrlQueryValue>>
  | ReadonlyArray<readonly [string, ApiUrlQueryValue]>;

export type ApiUrlOptions = {
  readonly baseUrl?: string;
  readonly query?: ApiUrlQuery;
};

const toQueryString = (query: ApiUrlQuery | undefined): string => {
  if (query == null) return '';

  if (typeof query === 'string') {
    const trimmed = query.trim();
    if (!trimmed) return '';
    return trimmed.replace(/^\?/, '');
  }

  if (query instanceof URLSearchParams) {
    return query.toString();
  }

  const params = new URLSearchParams();
  const entries = Array.isArray(query) ? query : Object.entries(query);

  for (const [key, value] of entries) {
    if (value == null) continue;
    params.set(key, String(value));
  }

  return params.toString();
};

/**
 * Build an edge-function API URL under `/functions/v1/api/...`.
 * Accepts a project root or a base that already ends with `/functions/v1`.
 *
 * @example
 * apiUrl('drills/tags')
 * apiUrl('drills/list', baseUrl)
 * apiUrl('positions/list', { baseUrl, query: qs })
 * apiUrl('evaluations/latest', { query: { org_id: orgId } })
 */
export const apiUrl = (
  path: string,
  baseUrlOrOptions: string | ApiUrlOptions = DEFAULT_BACKEND_URL,
): string => {
  const options: ApiUrlOptions =
    typeof baseUrlOrOptions === 'string'
      ? { baseUrl: baseUrlOrOptions }
      : baseUrlOrOptions;

  const normalizedBase = (options.baseUrl ?? DEFAULT_BACKEND_URL).replace(/\/$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  const root = normalizedBase.endsWith('/functions/v1')
    ? normalizedBase
    : `${normalizedBase}/functions/v1`;
  const url = `${root}/api/${cleanPath}`;
  const query = toQueryString(options.query);

  return query ? `${url}?${query}` : url;
};
