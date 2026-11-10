const normalize = value => String(value || '').trim().toLocaleLowerCase();

export function getExerciseEquipmentOptions(items) {
  const options = new Set();
  for (const item of items || []) {
    for (const part of String(item.equipment || '').split(/\s*[·,]\s*/)) {
      const label = part.trim();
      if (label) options.add(label);
    }
  }
  return ['All equipment', ...[...options].sort((a, b) => a.localeCompare(b))];
}

export function filterExerciseGuides(items, { query = '', muscle = 'All muscle groups', equipment = 'All equipment' } = {}) {
  const needle = normalize(query);
  const requestedMuscle = normalize(muscle);
  const requestedEquipment = normalize(equipment);
  return (items || []).filter(item => {
    const matchesMuscle = !requestedMuscle || requestedMuscle === 'all muscle groups' || normalize(String(item.muscle || '').split('·')[0]) === requestedMuscle;
    const matchesEquipment = !requestedEquipment || requestedEquipment === 'all equipment' || normalize(item.equipment).includes(requestedEquipment);
    const searchable = `${item.name || ''} ${item.muscle || ''} ${item.secondary || ''} ${item.equipment || ''}`;
    return matchesMuscle && matchesEquipment && normalize(searchable).includes(needle);
  });
}
