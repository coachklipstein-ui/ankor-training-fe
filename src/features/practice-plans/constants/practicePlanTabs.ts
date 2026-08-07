import type { SvgIconComponent } from '@mui/icons-material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import { listInvited, listPlansByType } from '../services/practicePlanService';
import type {
  PracticePlanListTabKey,
  PracticePlanTabLoadContext,
  PracticePlanTabPolicy,
} from '../types';

export type PracticePlanListTab = {
  readonly label: string;
  readonly icon: SvgIconComponent;
};

export const PRACTICE_PLAN_LIST_TABS: Record<PracticePlanListTabKey, PracticePlanListTab> = {
  my: { label: 'My Plans', icon: LibraryBooksIcon },
  invited: { label: 'Invited', icon: MailOutlineIcon },
  prebuilt: { label: 'Prebuilt Plans', icon: AutoAwesomeMosaicIcon },
};

export const PRACTICE_PLAN_TAB_POLICY = {
  my: {
    mode: 'lazy',
    needsUserId: true,
    load: ({ orgId, userId }: PracticePlanTabLoadContext) =>
      listPlansByType({ type: 'custom', orgId, user_id: userId }).then((r) => r.items),
  },
  invited: {
    mode: 'lazy',
    needsUserId: true,
    load: ({ orgId, userId }: PracticePlanTabLoadContext) =>
      listInvited({ user_id: userId, orgId }).then((r) => r.items),
  },
  prebuilt: {
    mode: 'eager',
    needsUserId: false,
    load: ({ orgId }: PracticePlanTabLoadContext) =>
      listPlansByType({ type: 'prebuild', orgId }).then((r) => r.items),
  },
} as const satisfies Record<PracticePlanListTabKey, PracticePlanTabPolicy>;

export const PRACTICE_PLAN_LIST_TAB_KEYS: PracticePlanListTabKey[] = ['my', 'invited', 'prebuilt'];

export const EAGER_PRACTICE_PLAN_TABS = PRACTICE_PLAN_LIST_TAB_KEYS.filter(
  (key) => PRACTICE_PLAN_TAB_POLICY[key].mode === 'eager',
);

