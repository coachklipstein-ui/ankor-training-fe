import { apiUrl, DEFAULT_BACKEND_URL } from '../../../shared/api/apiUrl';
import { apiFetch } from '../../../shared/api/apiClient';

export type OrganizationListItem = {
  id: string;
  name: string;
  slug: string;
  sport_mode: 'single' | 'multi' | null;
  program_gender: 'boys' | 'girls' | 'coed';
  maxBelowThresholdRatingsAllowed: number | null;
  maxWorkoutReps: number | null;
  sport_id: string | null;
  created_at: string;
  updated_at: string;
};

export type UpdateOrganizationInput = {
  name: string;
  slug: string;
  sport_mode: 'single' | 'multi' | null;
  program_gender: 'boys' | 'girls' | 'coed';
  maxBelowThresholdRatingsAllowed: number | null;
  maxWorkoutReps: number | null;
  sport_id: string | null;
};

type OrganizationsListResponse =
  | {
      ok: true;
      count?: number;
      limit?: number;
      offset?: number;
      data?: OrganizationListItem[];
    }
  | { ok: false; error: string };

type OrganizationResponse = { ok: true; data: OrganizationListItem } | { ok: false; error: string };

export async function listOrganizations(
  baseUrl = DEFAULT_BACKEND_URL,
): Promise<OrganizationListItem[]> {
  const url = apiUrl('org/list', baseUrl);
  const res = await apiFetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    includeOrgId: false,
  });

  const payload = (await res.json().catch(() => undefined)) as
    OrganizationsListResponse | undefined;

  if (!res.ok) {
    throw new Error(
      (payload as { error?: string } | undefined)?.error || `${res.status} ${res.statusText}`,
    );
  }

  if (!payload?.ok) {
    throw new Error(payload?.error || 'Failed to load organizations.');
  }

  return Array.isArray(payload.data) ? payload.data : [];
}

export async function getOrganizationById(
  organizationId: string,
  baseUrl = DEFAULT_BACKEND_URL,
): Promise<OrganizationListItem> {
  const id = organizationId.trim();
  if (!id) {
    throw new Error('Organization id is required.');
  }

  const url = apiUrl(`org/${encodeURIComponent(id)}`, baseUrl);
  const res = await apiFetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    includeOrgId: false,
  });

  const payload = (await res.json().catch(() => undefined)) as OrganizationResponse | undefined;

  if (!res.ok) {
    throw new Error(
      (payload as { error?: string } | undefined)?.error || `${res.status} ${res.statusText}`,
    );
  }

  if (!payload?.ok || !payload.data) {
    throw new Error(payload?.error || 'Failed to load organization.');
  }

  return payload.data;
}

export async function updateOrganization(
  organizationId: string,
  input: UpdateOrganizationInput,
  baseUrl = DEFAULT_BACKEND_URL,
): Promise<OrganizationListItem> {
  const id = organizationId.trim();
  if (!id) {
    throw new Error('Organization id is required.');
  }

  const url = apiUrl(`org/${encodeURIComponent(id)}`, baseUrl);
  const res = await apiFetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    includeOrgId: false,
  });

  const payload = (await res.json().catch(() => undefined)) as OrganizationResponse | undefined;

  if (!res.ok) {
    throw new Error(
      (payload as { error?: string } | undefined)?.error || `${res.status} ${res.statusText}`,
    );
  }

  if (!payload?.ok || !payload.data) {
    throw new Error(payload?.error || 'Failed to update organization.');
  }

  return payload.data;
}
