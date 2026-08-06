const ROLES = ['admin', 'coach', 'athlete', 'parent'] as const;
export type Role = (typeof ROLES)[number];

export const parseRole = (value?: string | null): Role | null => {
  if (!value) return null;
  const normalized = (value ?? '').trim().toLowerCase();
  return isRole(normalized) ? normalized : null;
};

export const isRole = (value?: string | null): value is Role => {
  if (!value) return false;

  return ROLES.map((role): string => role).includes(value);
};

export const useRole = (raw?: string | null) => {
  const role = parseRole(raw);
  const isAdmin = role === 'admin';
  const isCoach = role === 'coach';
  const isAthlete = role === 'athlete';
  const isParent = role === 'parent';

  return { role, isAdmin, isCoach, isAthlete, isParent };
};

export const isAdminRole = (raw?: string | null) => {
  return parseRole(raw) === 'admin';
};

export const isCoachRole = (raw?: string | null) => {
  return parseRole(raw) === 'coach';
};

export const isAthleteRole = (raw?: string | null) => {
  return parseRole(raw) === 'athlete';
};

export const isParentRole = (raw?: string | null) => {
  return parseRole(raw) === 'parent';
};
