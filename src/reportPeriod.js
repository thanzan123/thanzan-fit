const isoDate = (date) => date.toISOString().slice(0, 10);

export function getProgressReportRange(period, today, selectedMonth) {
  const [year, month, day] = today.split('-').map(Number);
  const todayUtc = new Date(Date.UTC(year, month - 1, day));
  if (period === 'week') {
    const start = new Date(todayUtc);
    start.setUTCDate(start.getUTCDate() - 6);
    return { startDate: isoDate(start), endDate: today };
  }
  if (period !== 'month' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(selectedMonth || '')) {
    throw new RangeError('Choose a valid report month.');
  }
  const [reportYear, reportMonth] = selectedMonth.split('-').map(Number);
  if (selectedMonth > today.slice(0, 7)) throw new RangeError('A report month cannot be in the future.');
  const lastDay = new Date(Date.UTC(reportYear, reportMonth, 0)).getUTCDate();
  const isCurrentMonth = selectedMonth === today.slice(0, 7);
  return {
    startDate: `${selectedMonth}-01`,
    endDate: isCurrentMonth ? today : `${selectedMonth}-${String(lastDay).padStart(2, '0')}`,
  };
}
