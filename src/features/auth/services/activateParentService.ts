import { apiFetch } from '../../../shared/api/apiClient';

export type ActivateParentPayload = {
  firstName: string;
  lastName: string;
  cellNumber: string;
};

export type ActivateParentResponse = {
  ok: boolean;
  message?: string;
  error?: string;
};

export async function activateParentProfile(
  payload: ActivateParentPayload,
  baseUrl = (typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_BACKEND_URL) ||
    'https://<project>.supabase.co',
): Promise<ActivateParentResponse> {
  const res = await apiFetch(`${baseUrl}/functions/v1/api/auth/activate-parent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      cellNumber: payload.cellNumber.trim(),
    }),
    requireAuth: true,
    includeOrgId: false,
  });

  const data = (await res.json().catch(() => undefined)) as ActivateParentResponse | undefined;

  if (!res.ok) {
    const reason = data?.error || `${res.status} ${res.statusText}`;
    throw new Error(reason);
  }

  if (!data?.ok) {
    throw new Error(data?.error || 'Failed to activate parent account.');
  }

  return data;
}
