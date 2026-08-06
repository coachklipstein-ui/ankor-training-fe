import * as React from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useRole } from '../../../shared/auth/roles';
import {
  listInvited,
  listPlansByType,
  type PracticePlan,
} from '../services/practicePlanService';

export type TabKey = 'my' | 'invited' | 'prebuilt';

export type PracticePlanRow = {
  readonly id: string;
  readonly name: string;
  readonly updated_at: string; // ISO
};

type TabState<T> = Record<TabKey, T>;

const normalizePlanRows = (plans: PracticePlan[]): PracticePlanRow[] =>
  plans.map((plan) => ({
    id: plan.id,
    name: plan.name?.trim() || 'Untitled plan',
    updated_at: plan.updated_at || plan.created_at || '',
  }));

const getErrorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error && err.message ? err.message : fallback;

export default function usePracticePlansListPage() {
  const { user, orgId: authOrgId, profile, loading: authLoading } = useAuth();
  const userId = user?.id ?? '';
  const orgId = authOrgId?.trim() || null;
  const { isCoach } = useRole(profile?.role);

  const [tab, setTab] = React.useState<TabKey>('my');
  const [search, setSearch] = React.useState('');

  const [myPlans, setMyPlans] = React.useState<PracticePlanRow[]>([]);
  const [invitedPlans, setInvitedPlans] = React.useState<PracticePlanRow[]>([]);
  const [prebuiltPlans, setPrebuiltPlans] = React.useState<PracticePlanRow[]>([]);
  const [loadingByTab, setLoadingByTab] = React.useState<TabState<boolean>>({
    my: false,
    invited: false,
    prebuilt: false,
  });
  const [errorByTab, setErrorByTab] = React.useState<TabState<string | null>>({
    my: null,
    invited: null,
    prebuilt: null,
  });

  const setTabLoading = (key: TabKey, value: boolean) => {
    setLoadingByTab((prev) => ({ ...prev, [key]: value }));
  };

  const setTabError = (key: TabKey, value: string | null) => {
    setErrorByTab((prev) => ({ ...prev, [key]: value }));
  };

  const setPlansForTab = (key: TabKey, rows: PracticePlanRow[]) => {
    if (key === 'my') {
      setMyPlans(rows);
    } else if (key === 'invited') {
      setInvitedPlans(rows);
    } else {
      setPrebuiltPlans(rows);
    }
  };

  React.useEffect(() => {
    if (authLoading) return;

    let active = true;

    const fetchTab = async (
      key: TabKey,
      type: 'custom-plans' | 'invited-plans' | 'prebuild',
      filter: { user_id?: string } = {},
    ) => {
      setTabLoading(key, true);
      setTabError(key, null);
      if (!orgId) {
        setPlansForTab(key, []);
        setTabError(key, 'Missing org_id. Please sign in again.');
        setTabLoading(key, false);
        return;
      }

      try {
        const { items } = await listPlansByType({ type, orgId, ...filter });
        if (!active) return;
        setPlansForTab(key, normalizePlanRows(items));
      } catch (err: unknown) {
        if (!active) return;
        setPlansForTab(key, []);
        setTabError(key, getErrorMessage(err, 'Failed to load plans.'));
      } finally {
        if (active) setTabLoading(key, false);
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
    setTabLoading('my', true);
    setTabError('my', null);

    if (!userId) {
      setPlansForTab('my', []);
      setTabError('my', 'Missing user id. Please sign in again.');
      setTabLoading('my', false);
      return () => {
        active = false;
      };
    }
    if (!orgId) {
      setPlansForTab('my', []);
      setTabError('my', 'Missing org_id. Please sign in again.');
      setTabLoading('my', false);
      return () => {
        active = false;
      };
    }

    listPlansByType({ type: 'custom', orgId, user_id: userId })
      .then(({ items }) => {
        if (!active) return;
        setPlansForTab('my', normalizePlanRows(items));
      })
      .catch((err: unknown) => {
        if (!active) return;
        setPlansForTab('my', []);
        setTabError('my', getErrorMessage(err, 'Failed to load my plans.'));
      })
      .finally(() => {
        if (active) setTabLoading('my', false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, tab, userId, orgId]);

  React.useEffect(() => {
    if (authLoading) return;
    if (tab !== 'invited') return;

    let active = true;
    setTabLoading('invited', true);
    setTabError('invited', null);

    if (!userId) {
      setPlansForTab('invited', []);
      setTabError('invited', 'Missing user id. Please sign in again.');
      setTabLoading('invited', false);
      return () => {
        active = false;
      };
    }
    if (!orgId) {
      setPlansForTab('invited', []);
      setTabError('invited', 'Missing org_id. Please sign in again.');
      setTabLoading('invited', false);
      return () => {
        active = false;
      };
    }

    listInvited({ user_id: userId, orgId })
      .then(({ items }) => {
        if (!active) return;
        setPlansForTab('invited', normalizePlanRows(items));
      })
      .catch((err: unknown) => {
        if (!active) return;
        setPlansForTab('invited', []);
        setTabError('invited', getErrorMessage(err, 'Failed to load invited plans.'));
      })
      .finally(() => {
        if (active) setTabLoading('invited', false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, tab, userId, orgId]);

  const rows = React.useMemo(() => {
    const source = tab === 'my' ? myPlans : tab === 'invited' ? invitedPlans : prebuiltPlans;
    const q = search.trim().toLowerCase();

    const searched = !q ? source : source.filter((p) => p.name.toLowerCase().includes(q));

    return [...searched].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
  }, [tab, search, myPlans, invitedPlans, prebuiltPlans]);

  const activeLoading = authLoading || loadingByTab[tab];
  const activeError = errorByTab[tab];
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
