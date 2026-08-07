import * as React from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useRole } from '../../../shared/auth/roles';
import { listInvited, listPlansByType, type PracticePlan } from '../services/practicePlanService';

export type TabKey = 'my' | 'invited' | 'prebuilt';

export type PracticePlanRow = {
  readonly id: string;
  readonly name: string;
  readonly updated_at: string; // ISO
};

type TabState = {
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly plans: readonly PracticePlanRow[];
};

type TabsState = Record<TabKey, TabState>;

const EMPTY_TAB_STATE: TabState = {
  isLoading: false,
  error: null,
  plans: [],
};

const INITIAL_TABS_STATE: TabsState = {
  my: EMPTY_TAB_STATE,
  invited: EMPTY_TAB_STATE,
  prebuilt: EMPTY_TAB_STATE,
};

const normalizePlanRows = (plans: PracticePlan[]): PracticePlanRow[] =>
  plans.map((plan) => ({
    id: plan.id,
    name: plan.name?.trim() || 'Untitled plan',
    updated_at: plan.updated_at || plan.created_at || '',
  }));

const getErrorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error && err.message ? err.message : fallback;

const filterAndSortPlans = (
  plans: readonly PracticePlanRow[],
  search: string,
): PracticePlanRow[] => {
  const q = search.trim().toLowerCase();
  const searched = !q ? plans : plans.filter((p) => p.name.toLowerCase().includes(q));

  return [...searched].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
};

export default function usePracticePlansListPage() {
  const { user, orgId: authOrgId, profile, loading: authLoading } = useAuth();
  const userId = user?.id ?? '';
  const orgId = authOrgId?.trim() || null;
  const { isCoach } = useRole(profile?.role);

  const [tab, setTab] = React.useState<TabKey>('my');
  const [search, setSearch] = React.useState('');
  const [tabsState, setTabsState] = React.useState<TabsState>(INITIAL_TABS_STATE);

  const patchTab = (key: TabKey, patch: Partial<TabState>) => {
    setTabsState((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  };

  React.useEffect(() => {
    if (authLoading) return;

    let active = true;

    const fetchTab = async (
      key: TabKey,
      type: 'custom-plans' | 'invited-plans' | 'prebuild',
      filter: { user_id?: string } = {},
    ) => {
      patchTab(key, { isLoading: true, error: null });
      if (!orgId) {
        patchTab(key, {
          plans: [],
          error: 'Missing org_id. Please sign in again.',
          isLoading: false,
        });
        return;
      }

      try {
        const { items } = await listPlansByType({ type, orgId, ...filter });
        if (!active) return;
        patchTab(key, { plans: normalizePlanRows(items), isLoading: false });
      } catch (err: unknown) {
        if (!active) return;
        patchTab(key, {
          plans: [],
          error: getErrorMessage(err, 'Failed to load plans.'),
          isLoading: false,
        });
      }
    };

    void fetchTab('prebuilt', 'prebuild');

    return () => {
      active = false;
    };
  }, [authLoading, orgId]);

  React.useEffect(() => {
    if (authLoading) return;
    if (tab !== 'my') return;

    let active = true;
    patchTab('my', { isLoading: true, error: null });

    if (!userId) {
      patchTab('my', {
        plans: [],
        error: 'Missing user id. Please sign in again.',
        isLoading: false,
      });
      return () => {
        active = false;
      };
    }
    if (!orgId) {
      patchTab('my', {
        plans: [],
        error: 'Missing org_id. Please sign in again.',
        isLoading: false,
      });
      return () => {
        active = false;
      };
    }

    listPlansByType({ type: 'custom', orgId, user_id: userId })
      .then(({ items }) => {
        if (!active) return;
        patchTab('my', { plans: normalizePlanRows(items), isLoading: false });
      })
      .catch((err: unknown) => {
        if (!active) return;
        patchTab('my', {
          plans: [],
          error: getErrorMessage(err, 'Failed to load my plans.'),
          isLoading: false,
        });
      });

    return () => {
      active = false;
    };
  }, [authLoading, tab, userId, orgId]);

  React.useEffect(() => {
    if (authLoading) return;
    if (tab !== 'invited') return;

    let active = true;
    patchTab('invited', { isLoading: true, error: null });

    if (!userId) {
      patchTab('invited', {
        plans: [],
        error: 'Missing user id. Please sign in again.',
        isLoading: false,
      });
      return () => {
        active = false;
      };
    }
    if (!orgId) {
      patchTab('invited', {
        plans: [],
        error: 'Missing org_id. Please sign in again.',
        isLoading: false,
      });
      return () => {
        active = false;
      };
    }

    listInvited({ user_id: userId, orgId })
      .then(({ items }) => {
        if (!active) return;
        patchTab('invited', { plans: normalizePlanRows(items), isLoading: false });
      })
      .catch((err: unknown) => {
        if (!active) return;
        patchTab('invited', {
          plans: [],
          error: getErrorMessage(err, 'Failed to load invited plans.'),
          isLoading: false,
        });
      });

    return () => {
      active = false;
    };
  }, [authLoading, tab, userId, orgId]);

  const activeTabState = tabsState[tab];

  const rows = React.useMemo(
    () => filterAndSortPlans(activeTabState.plans, search),
    [activeTabState.plans, search],
  );

  const activeLoading = authLoading || activeTabState.isLoading;
  const activeError = activeTabState.error;
  const canEdit = tab !== 'prebuilt' && (tab !== 'invited' || isCoach);

  return {
    tab,
    setTab,
    search,
    setSearch,
    rows,
    activeLoading,
    activeError,
    canEdit,
  };
}
