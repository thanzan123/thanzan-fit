export function groupPreviousMeals(meals, targetDate, limit = 8) {
  if (!Array.isArray(meals) || !/^\d{4}-\d{2}-\d{2}$/.test(String(targetDate || ''))) return [];
  const groups = new Map();
  for (const entry of meals) {
    const date = String(entry?.date || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date >= targetDate) continue;
    const mealType = String(entry.mealType || 'Meal');
    const key = `${date}\0${mealType}`;
    if (!groups.has(key)) groups.set(key, { date, mealType, items: [], latest: 0 });
    const group = groups.get(key);
    group.items.push(entry);
    group.latest = Math.max(group.latest, Number(entry.createdAt) || 0);
  }
  return [...groups.values()]
    .sort((a, b) => b.date.localeCompare(a.date) || b.latest - a.latest || a.mealType.localeCompare(b.mealType))
    .slice(0, Math.max(0, Math.floor(Number(limit) || 0)))
    .map(group => ({
      ...group,
      kcal: group.items.reduce((sum, item) => sum + (Number(item.kcal) || 0), 0),
      protein: group.items.reduce((sum, item) => sum + (Number(item.p) || 0), 0),
    }));
}

export function cloneMealEntries(entries, targetDate, createId, createdAt = Date.now()) {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error('Choose a logged meal to copy.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(targetDate || ''))) throw new Error('Choose a valid date first.');
  if (typeof createId !== 'function') throw new Error('A new entry ID generator is required.');
  return entries.map((entry, index) => ({
    ...entry,
    id: createId(),
    date: targetDate,
    createdAt: Number(createdAt) + index,
  }));
}
