import { isAdminRole } from '../../../shared/auth/roles';
import type { PracticePlan } from '../services/practicePlanService';
import type { PracticePlanListTabKey, PracticePlanRow } from '../types';

export const normalizePlanRows = (plans: PracticePlan[]): PracticePlanRow[] =>
  plans.map((plan) => ({
    id: plan.id,
    name: plan.name?.trim() || 'Untitled plan',
    updated_at: plan.updated_at || plan.created_at || '',
  }));

export const getErrorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error && err.message ? err.message : fallback;

export const filterAndSortPlans = (
  plans: readonly PracticePlanRow[],
  search: string,
): PracticePlanRow[] => {
  const q = search.trim().toLowerCase();
  const searched = !q ? plans : plans.filter((p) => p.name.toLowerCase().includes(q));

  return [...searched].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
};

export const canViewOrgPracticePlans = (rawRole?: string | null): boolean => isAdminRole(rawRole);

export const canEditPracticePlanTab = (
  tab: PracticePlanListTabKey,
  isCoach: boolean,
): boolean => {
  if (tab === 'prebuilt' || tab === 'org') return false;
  return tab !== 'invited' || isCoach;
};

export const getVisiblePracticePlanTabKeys = (
  rawRole?: string | null,
): PracticePlanListTabKey[] => {
  const keys: PracticePlanListTabKey[] = ['my', 'invited', 'prebuilt'];
  if (canViewOrgPracticePlans(rawRole)) keys.push('org');
  return keys;
};
