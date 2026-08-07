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

export const canEditPracticePlanTab = (
  tab: PracticePlanListTabKey,
  isCoach: boolean,
): boolean => tab !== 'prebuilt' && (tab !== 'invited' || isCoach);
