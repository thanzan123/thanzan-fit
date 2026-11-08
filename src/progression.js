const rangeFrom = (value) => {
  const match = String(value || '').match(/^\s*(\d+)\s*[–—-]\s*(\d+)\s*(?:reps?)?(?:\s+each side)?\s*$/i);
  if (!match) return null;
  const min = Number(match[1]), max = Number(match[2]);
  return min > 0 && max >= min ? { min, max } : null;
};

const minimumSetsFrom = (value) => {
  const match = String(value || '').match(/^\s*(\d+)/);
  return match ? Math.max(1, Number(match[1])) : null;
};

const formatLoad = (kg, units = 'metric') => `${Number((units === 'imperial' ? kg / 0.45359237 : kg).toFixed(1))} ${units === 'imperial' ? 'lb' : 'kg'}`;

export function getProgressionCue({ guide, session, recoverySignals = [], exerciseRestrictions = '', previousInjuries = '', units = 'metric' }) {
  if (!guide) return { kind: 'neutral', body: 'Choose a guided exercise to see a log-based progression cue.' };
  const repRange = rangeFrom(guide.reps);
  const minSets = minimumSetsFrom(guide.sets);
  if (!repRange || !minSets) return { kind: 'neutral', body: 'This guide does not use a simple rep range, so a rep-based load cue does not apply.' };
  const sets = Array.isArray(session?.sets) ? session.sets.filter(set => Number(set.reps) > 0 && Number(set.kg) >= 0) : [];
  if (!sets.length) return { kind: 'neutral', body: 'No completed-session sets are logged for this exercise yet; a progression cue will appear when there is useful history.' };
  if (String(exerciseRestrictions || '').trim() || String(previousInjuries || '').trim()) {
    return { kind: 'caution', body: 'Your profile includes a saved restriction or injury note. Follow that guidance; this simple log-based cue cannot personalize progression for it.' };
  }
  if (recoverySignals.length) {
    return { kind: 'caution', body: `Today’s recovery check-in flags ${recoverySignals.join(', ')}. Skip load increases today; choose a comfortable effort and stop if anything hurts.` };
  }
  const loads = [...new Set(sets.map(set => Number(set.kg)))];
  const reps = sets.map(set => Number(set.reps));
  const setText = `${sets.length} ${sets.length === 1 ? 'set' : 'sets'} at ${loads.length === 1 ? formatLoad(loads[0], units) : 'varying loads'} · ${reps.join(', ')} reps (guide ${repRange.min}–${repRange.max})`;
  if (sets.length < minSets) {
    return { kind: 'neutral', body: `Latest completed session: ${setText}. The guide starts at ${minSets} sets, so there is not enough logged work for a progression cue yet.` };
  }
  if (loads.length !== 1 || loads[0] <= 0) {
    return { kind: 'neutral', body: `Latest completed session: ${setText}. The mixed or unloaded sets do not support a clear load-progression cue.` };
  }
  if (reps.every(count => count >= repRange.max)) {
    return { kind: 'suggestion', body: `Latest completed session: ${setText}. You reached the top of the guide across your sets; next time, if every rep felt controlled and pain-free, you could consider the smallest available load increase. Repeating this load is fine too.` };
  }
  return { kind: 'steady', body: `Latest completed session: ${setText}. No increase is indicated by this session; use a comfortable load and build controlled reps within the guide’s range.` };
}
