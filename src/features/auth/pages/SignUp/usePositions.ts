import React from 'react';
import { listPositions, type Position } from '../../../athletes/services/positionsService';

export const usePositions = () => {
  // Positions
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [positionsLoading, setPositionsLoading] = React.useState(false);
  const [positionsError, setPositionsError] = React.useState<string | null>(null);

  const debugOrgId = (import.meta.env.VITE_DEBUG_ORG_ID as string | undefined)?.trim() || '';

  const positionsAuthHeaders = React.useMemo(() => {
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!anon) return {};
    return { apikey: anon, Authorization: `Bearer ${anon}` };
  }, []);

  React.useEffect(() => {
    let active = true;
    const resolvedOrgId = debugOrgId;

    if (!resolvedOrgId) {
      setPositions([]);
      setPositionsError('Missing org_id for positions.');
      setPositionsLoading(false);
      return () => {
        active = false;
      };
    }

    setPositionsLoading(true);
    setPositionsError(null);

    listPositions({ orgId: resolvedOrgId, limit: 50, offset: 0 }, undefined, {
      requireAuth: false,
      headers: positionsAuthHeaders,
    })
      .then(({ items }) => {
        if (active) setPositions(items);
      })
      .catch((err: any) => {
        if (active) {
          setPositions([]);
          setPositionsError(err?.message || 'Failed to load positions.');
        }
      })
      .finally(() => {
        if (active) setPositionsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debugOrgId, positionsAuthHeaders]);

  const positionOptions = React.useMemo(
    () =>
      [...positions]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p) => ({ label: p.name, value: p.id })),
    [positions],
  );

  const positionHelperText = positionsError
    ? positionsError
    : positionsLoading
      ? 'Loading positions...'
      : positionOptions.length === 0
        ? 'No positions available.'
        : '';

  return {
    positionOptions,
    positionHelperText,
    positionsLoading,
  };
};
