/**
 * Formats an ISO timestamp for practice-plan headers/lists.
 * Example: "DECEMBER 18, 2025 AT 11:19 AM"
 */
export const formatHeaderTimestamp = (iso: string): string => {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;

    const date = new Intl.DateTimeFormat(undefined, {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    }).format(d);

    const time = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);

    return `${date} at ${time}`.toUpperCase();
  } catch {
    return iso;
  }
};
