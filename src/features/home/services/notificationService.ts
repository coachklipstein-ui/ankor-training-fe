import { apiFetch } from '../../../shared/api/apiClient';
import { getOrgId } from '../../../shared/auth/authClient';

const DEFAULT_BASE_URL =
  ((typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_BACKEND_URL) as string) || 'http://localhost:8000';

export type NotificationType =
  | "evaluation_completed"
  | "athlete_joined"
  | "coach_joined"
  | "plan_shared";

export type NotificationItem = {
  id: string;
  title: string;
  description?: string;
  topic: string;
  createdAt: string;
  read: boolean;
  link?: string;
};

export type NotificationRow = {
  id: string;
  org_id?: string | null;
  user_id?: string | null;
  type?: string | null;
  evaluation_id?: string | number | null;
  payload?: Record<string, unknown> | string | null;
  created_at?: string | null;
  read_at?: string | null;
};

type NotificationsListResponse =
  | { ok: true; count?: number; limit?: number; offset?: number; data?: NotificationRow[] }
  | { ok: false; error: string };

type MarkReadResponse =
  | { ok: true; data: NotificationRow }
  | { ok: false; error: string };

type MarkAllReadResponse =
  | { ok: true; count: number }
  | { ok: false; error: string };

function parsePayload(value: NotificationRow['payload']): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === 'object') return value as Record<string, unknown>;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return {};
}

function formatTopic(value?: string | null): string {
  const normalized = (value ?? '').replace(/[_-]+/g, ' ').trim();
  return normalized || 'general';
}

function toTitleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeNotificationItem(row: NotificationRow): NotificationItem {
  const payload = parsePayload(row.payload);

  const rawTitle = payload.title ?? payload.subject ?? payload.name ?? payload.message;
  const title =
    typeof rawTitle === 'string' && rawTitle.trim()
      ? rawTitle.trim()
      : row.type
        ? toTitleCase(formatTopic(row.type))
        : 'Notification';

  const rawDescription = payload.description ?? payload.body ?? payload.details ?? payload.summary;
  const description =
    typeof rawDescription === 'string' && rawDescription.trim() ? rawDescription.trim() : undefined;

  const topic =
    typeof payload.topic === 'string' && payload.topic.trim()
      ? payload.topic.trim()
      : row.type
        ? formatTopic(row.type)
        : 'general';

  const linkFromPayload =
    typeof payload.link === 'string' && payload.link.trim() ? payload.link.trim() : undefined;
  const link = linkFromPayload;

  const createdAt =
    row.created_at ||
    (typeof payload.created_at === 'string' ? payload.created_at : null) ||
    new Date().toISOString();

  const read = Boolean(row.read_at) || false;

  return { id: String(row.id), title, description, topic, createdAt, read, link };
}

/**
 * GET /functions/v1/api/notifications/list
 *
 * Returns normalized NotificationItem[] ready for the bell UI.
 */
export async function listNotifications(opts?: {
  type?: NotificationType | NotificationType[];
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ items: NotificationItem[]; count: number }> {
  const orgId = getOrgId();

  const u = new URLSearchParams();
  if (orgId) u.set('org_id', orgId);
  if (opts?.type) {
    const types = Array.isArray(opts.type) ? opts.type : [opts.type];
    u.set('type', types.join(','));
  }
  if (opts?.unreadOnly) u.set('unread_only', 'true');
  if (Number.isFinite(opts?.limit)) u.set('limit', String(opts.limit));
  if (Number.isFinite(opts?.offset)) u.set('offset', String(opts.offset));

  const qs = u.toString();
  const url =
    qs.length > 0
      ? `${DEFAULT_BASE_URL}/functions/v1/api/notifications/list?${qs}`
      : `${DEFAULT_BASE_URL}/functions/v1/api/notifications/list`;

  const res = await apiFetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    orgId,
  });

  const data = (await res.json().catch(() => undefined)) as NotificationsListResponse | undefined;

  if (!res.ok) {
    throw new Error((data as any)?.error || `${res.status} ${res.statusText}`);
  }
  if (!data?.ok) {
    throw new Error((data as any)?.error || 'Failed to load notifications.');
  }

  const rawItems = (data.data ?? []) as unknown[];
  const items = rawItems.map((row) => normalizeNotificationItem(row as NotificationRow));
  const count = typeof data.count === 'number' ? data.count : items.length;

  return { items, count };
}

/**
 * PATCH /functions/v1/api/notifications/read-all
 */
export async function markAllNotificationsAsRead(): Promise<{ count: number }> {

  const url = `${DEFAULT_BASE_URL}/functions/v1/api/notifications/read-all`;

  const res = await apiFetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    includeOrgId: false,
  });

  const data = (await res.json().catch(() => undefined)) as MarkAllReadResponse | undefined;

  if (!res.ok) {
    throw new Error((data as any)?.error || `${res.status} ${res.statusText}`);
  }
  if (!data?.ok) {
    throw new Error((data as any)?.error || 'Failed to mark all as read.');
  }

  return { count: data.count ?? 0 };
}

/**
 * PATCH /functions/v1/api/notifications/:id/read
 */
export async function markNotificationAsRead(id: string): Promise<NotificationItem> {
  if (!id?.trim()) throw new Error('id is required.');

  const url = `${DEFAULT_BASE_URL}/functions/v1/api/notifications/${encodeURIComponent(id.trim())}/read`;

  const res = await apiFetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    includeOrgId: false,
  });

  const data = (await res.json().catch(() => undefined)) as MarkReadResponse | undefined;

  if (!res.ok) {
    throw new Error((data as any)?.error || `${res.status} ${res.statusText}`);
  }
  if (!data?.ok || !data.data) {
    throw new Error((data as any)?.error || 'Failed to mark notification as read.');
  }

  return normalizeNotificationItem(data.data);
}
