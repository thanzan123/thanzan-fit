export const getVisibleHistory = (records, showAll = false, limit = 14) => {
  if (!Array.isArray(records)) return [];
  const ordered = [...records].sort((a, b) => String(b?.date || '').localeCompare(String(a?.date || '')));
  return ordered.slice(0, showAll ? ordered.length : Math.max(0, limit));
};
