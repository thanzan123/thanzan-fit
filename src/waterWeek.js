const dateParts = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
};

const localDate = (date) => {
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return shifted.toISOString().slice(0, 10);
};

export function getCalendarWeekDays(selectedDate, today = localDate(new Date())) {
  const selected = dateParts(selectedDate);
  if (!selected) return [];
  const monday = new Date(selected);
  monday.setDate(selected.getDate() - ((selected.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      date: localDate(date),
      day: new Intl.DateTimeFormat('en', { weekday: 'long' }).format(date),
      label: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date),
      isToday: localDate(date) === today,
    };
  });
}
