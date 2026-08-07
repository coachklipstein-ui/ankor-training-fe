import * as React from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useRole } from '../../../shared/auth/roles';
import { EAGER_PRACTICE_PLAN_TABS, PRACTICE_PLAN_TAB_POLICY } from '../constants/practicePlanTabs';
import type { PracticePlanListTabKey, PracticePlanTabState, PracticePlanTabsState } from '../types';
import {
  canEditPracticePlanTab,
  filterAndSortPlans,
  getErrorMessage,
  getVisiblePracticePlanTabKeys,
  normalizePlanRows,
} from '../utils/practicePlanList';

const EMPTY_TAB_STATE: PracticePlanTabState = {
  isLoading: false,
  error: null,
  plans: [],
};

const INITIAL_TABS_STATE: PracticePlanTabsState = {
  my: EMPTY_TAB_STATE,
  invited: EMPTY_TAB_STATE,
  prebuilt: EMPTY_TAB_STATE,
  org: EMPTY_TAB_STATE,
};

export default function usePracticePlansListPage() {
  const { user, orgId: authOrgId, profile, loading: authLoading } = useAuth();
  const userId = user?.id ?? '';
  const orgId = authOrgId?.trim() || null;
  const { isCoach } = useRole(profile?.role);

  const [tab, setTab] = React.useState<PracticePlanListTabKey>('my');
  const [search, setSearch] = React.useState('');
  const [tabsState, setTabsState] = React.useState<PracticePlanTabsState>(INITIAL_TABS_STATE);

  const visibleTabKeys = React.useMemo(
    () => getVisiblePracticePlanTabKeys(profile?.role),
    [profile?.role],
  );

  React.useEffect(() => {
    if (!visibleTabKeys.includes(tab)) {
      setTab('my');
    }
  }, [tab, visibleTabKeys]);

  const patchTab = React.useCallback(
    (key: PracticePlanListTabKey, patch: Partial<PracticePlanTabState>) => {
      setTabsState((prev) => ({
        ...prev,
        [key]: { ...prev[key], ...patch },
      }));
    },
    [],
  );

  const loadTab = React.useCallback(
    async (key: PracticePlanListTabKey, isActive: () => boolean) => {
      if (!visibleTabKeys.includes(key)) return;

      const policy = PRACTICE_PLAN_TAB_POLICY[key];

      if (!orgId) {
        patchTab(key, {
          plans: [],
          error: 'Missing org_id. Please sign in again.',
          isLoading: false,
        });
        return;
      }

      if (policy.needsUserId && !userId) {
        patchTab(key, {
          plans: [],
          error: 'Missing user id. Please sign in again.',
          isLoading: false,
        });
        return;
      }

      patchTab(key, { isLoading: true, error: null });

      try {
        const items = await policy.load({ orgId, userId });
        if (!isActive()) return;
        patchTab(key, { plans: normalizePlanRows(items), isLoading: false });
      } catch (err: unknown) {
        if (!isActive()) return;
        patchTab(key, {
          plans: [],
          error: getErrorMessage(err, `Failed to load ${key} plans.`),
          isLoading: false,
        });
      }
    },
    [orgId, userId, patchTab, visibleTabKeys],
  );

  React.useEffect(() => {
    if (authLoading) return;

    let alive = true;
    for (const key of EAGER_PRACTICE_PLAN_TABS) {
      if (!visibleTabKeys.includes(key)) continue;
      void loadTab(key, () => alive);
    }

    return () => {
      alive = false;
    };
  }, [authLoading, orgId, loadTab, visibleTabKeys]);

  React.useEffect(() => {
    if (authLoading) return;
    if (PRACTICE_PLAN_TAB_POLICY[tab].mode !== 'lazy') return;
    if (!visibleTabKeys.includes(tab)) return;

    let alive = true;
    void loadTab(tab, () => alive);

    return () => {
      alive = false;
    };
  }, [authLoading, tab, userId, orgId, loadTab, visibleTabKeys]);

  const activeTabState = tabsState[tab];

  const rows = React.useMemo(
    () => filterAndSortPlans(activeTabState.plans, search),
    [activeTabState.plans, search],
  );

  const activeLoading = authLoading || activeTabState.isLoading;
  const activeError = activeTabState.error;
  const canEdit = canEditPracticePlanTab(tab, isCoach);

  return {
    tab,
    setTab,
    search,
    setSearch,
    rows,
    activeLoading,
    activeError,
    canEdit,
    visibleTabKeys,
  };
}
