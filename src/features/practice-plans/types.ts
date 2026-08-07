import type { PracticePlan } from './services/practicePlanService';

export type PracticePlanListTabKey = 'my' | 'invited' | 'prebuilt';

export type PracticePlanRow = {
  readonly id: string;
  readonly name: string;
  readonly updated_at: string; // ISO
};

export type PracticePlanTabState = {
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly plans: readonly PracticePlanRow[];
};

export type PracticePlanTabsState = Record<PracticePlanListTabKey, PracticePlanTabState>;

export type PracticePlanTabLoadContext = {
  readonly orgId: string;
  readonly userId: string;
};

export type PracticePlanTabPolicy = {
  readonly mode: 'eager' | 'lazy';
  readonly needsUserId: boolean;
  readonly load: (ctx: PracticePlanTabLoadContext) => Promise<PracticePlan[]>;
};
