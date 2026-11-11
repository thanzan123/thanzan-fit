const present = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));

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

  const signals = [];
  if (present(checkin.sleepHours) && Number(checkin.sleepHours) < 6) signals.push('under 6 hours of sleep');
  if (present(checkin.sleepQuality) && Number(checkin.sleepQuality) <= 2) signals.push('low sleep-quality rating');
  if (present(checkin.energy) && Number(checkin.energy) <= 2) signals.push('low energy rating');
  if (present(checkin.soreness) && Number(checkin.soreness) >= 4) signals.push('high soreness rating');
  if (present(checkin.readiness) && Number(checkin.readiness) <= 2) signals.push('low readiness rating');

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
