const numericValue = (value, min, max) => {
  if (typeof value === 'boolean' || value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
};

export function getRecoverySignals(checkin) {
  if (!checkin || typeof checkin !== 'object') return [];
  const signals = [];
  const sleepHours = numericValue(checkin.sleepHours, 0, 24);
  const sleepQuality = numericValue(checkin.sleepQuality, 1, 5);
  const energy = numericValue(checkin.energy, 1, 5);
  const soreness = numericValue(checkin.soreness, 1, 5);
  const readiness = numericValue(checkin.readiness, 1, 5);
  if (sleepHours !== null && sleepHours < 6) signals.push('less than 6 hours of sleep');
  if (sleepQuality !== null && sleepQuality <= 2) signals.push('low sleep-quality rating');
  if (energy !== null && energy <= 2) signals.push('low energy rating');
  if (soreness !== null && soreness >= 4) signals.push('high soreness rating');
  if (readiness !== null && readiness <= 2) signals.push('low readiness rating');
  return signals;
}

export function getRecoveryRecommendation(checkin) {
  if (!checkin || typeof checkin !== 'object') return null;

  if (checkin.workoutReadiness === 'rest') {
    return {
      kind: 'rest',
      title: 'Rest is a good option today',
      body: 'You marked that you need rest. Skip strenuous training today; choose comfortable light movement only if it feels okay.',
      signals: ['Marked as needing rest'],
    };
  }

  const signals = getRecoverySignals(checkin).map(signal => signal === 'less than 6 hours of sleep' ? 'under 6 hours of sleep' : signal);

  if (checkin.workoutReadiness === 'unsure') {
    return {
      kind: 'caution',
      title: 'Check in with yourself before training',
      body: signals.length
        ? `You marked that you’re unsure about training and noted ${signals.join(', ')}. Consider an easier session or rest, and adjust based on how you feel.`
        : 'You marked that you’re unsure about training. Start gently and reassess, or choose rest if that feels better.',
      signals: signals.length ? signals : ['Unsure about workout readiness'],
    };
  }

  if (!signals.length) return null;
  const soreness = signals.includes('high soreness rating');
  return {
    kind: 'caution',
    title: soreness ? 'Consider an easier session today' : 'Keep today’s session flexible',
    body: `Your check-in notes ${signals.join(', ')}. Consider a lighter session or rest, and stop any movement that hurts.`,
    signals,
  };
}
