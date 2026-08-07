import { apiUrl, DEFAULT_BACKEND_URL } from '../../../shared/api/apiUrl';

export type Sport = {
  id: string;
  code: string | null;
  name: string;
};

export type SportsListResponse =
  { ok: true; count?: number; data?: Sport[]; items?: Sport[] } | { ok: false; error: string };

function normalizeSport(raw: any): Sport {
  return {
    id: typeof raw?.id === 'string' ? raw.id : '',
    code: typeof raw?.code === 'string' ? raw.code.trim() || null : null,
    name: typeof raw?.name === 'string' ? raw.name.trim() : '',
  };
}

export async function listSports(
  baseUrl = DEFAULT_BACKEND_URL,
): Promise<{ items: Sport[]; count?: number }> {
  const res = await fetch(apiUrl('sports/list', baseUrl), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const body = (await res.json().catch(() => undefined)) as SportsListResponse | undefined;

  if (!res.ok) {
    throw new Error((body as any)?.error || `${res.status} ${res.statusText}`);
  }
  if (!body?.ok) {
    throw new Error((body as any)?.error || 'Failed to load sports.');
  }

  const rawItems = (body.data ?? (body as any).items ?? []) as unknown[];
  const items = rawItems
    .map((item) => normalizeSport(item))
    .filter((sport) => sport.id && sport.name);

  const countRaw = (body as any)?.count;
  const count =
    typeof countRaw === 'number'
      ? countRaw
      : Number.isFinite(Number(countRaw))
        ? Number(countRaw)
        : undefined;

  return { items, count };
}
