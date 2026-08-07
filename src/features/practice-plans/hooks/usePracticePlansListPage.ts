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

type LoadContext = {
  readonly orgId: string;
  readonly userId: string;
};

type TabPolicy = {
  readonly mode: 'eager' | 'lazy';
  readonly needsUserId: boolean;
  readonly load: (ctx: LoadContext) => Promise<PracticePlan[]>;
};

const TAB_CONFIG = {
  my: {
    mode: 'lazy',
    needsUserId: true,
    load: ({ orgId, userId }: LoadContext) =>
      listPlansByType({ type: 'custom', orgId, user_id: userId }).then((r) => r.items),
  },
  invited: {
    mode: 'lazy',
    needsUserId: true,
    load: ({ orgId, userId }: LoadContext) =>
      listInvited({ user_id: userId, orgId }).then((r) => r.items),
  },
  prebuilt: {
    mode: 'eager',
    needsUserId: false,
    load: ({ orgId }: LoadContext) =>
      listPlansByType({ type: 'prebuild', orgId }).then((r) => r.items),
  },
} as const satisfies Record<TabKey, TabPolicy>;

const TAB_KEYS = Object.keys(TAB_CONFIG) as TabKey[];

const EAGER_TABS = TAB_KEYS.filter((key) => TAB_CONFIG[key].mode === 'eager');

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

  const patchTab = React.useCallback((key: TabKey, patch: Partial<TabState>) => {
    setTabsState((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  }, []);

  const loadTab = React.useCallback(
    async (key: TabKey, isActive: () => boolean) => {
      const policy = TAB_CONFIG[key];

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
    [orgId, userId, patchTab],
  );

  React.useEffect(() => {
    if (authLoading) return;

    let alive = true;
    for (const key of EAGER_TABS) {
      void loadTab(key, () => alive);
    }

    return () => {
      alive = false;
    };
  }, [authLoading, orgId, loadTab]);

  React.useEffect(() => {
    if (authLoading) return;
    if (TAB_CONFIG[tab].mode !== 'lazy') return;

    let alive = true;
    void loadTab(tab, () => alive);

    return () => {
      alive = false;
    };
  }, [authLoading, tab, userId, orgId, loadTab]);

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
