const validTime = value => {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) return false;
  const [hour, minute] = value.split(':').map(Number);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
};

const validDays = new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);

export function validateCustomReminder({ label, time, day = '' } = {}) {
  const cleanLabel = typeof label === 'string' ? label.trim() : '';
  if (!cleanLabel || cleanLabel.length > 60) return { field: 'label', message: 'Use a reminder name from 1 to 60 characters.' };
  if (!validTime(time)) return { field: 'time', message: 'Choose a valid reminder time.' };
  if (day && !validDays.has(day)) return { field: 'day', message: 'Choose a valid weekday or leave it daily.' };
  return null;
}

export function createCustomReminder(reminders, values, idFactory) {
  const error = validateCustomReminder(values);
  if (error) return { reminders: Array.isArray(reminders) ? reminders : [], error };
  if (typeof idFactory !== 'function') return { reminders: Array.isArray(reminders) ? reminders : [], error: { field: 'id', message: 'A unique reminder ID is required.' } };
  const existing = Array.isArray(reminders) ? reminders : [];
  let id = `custom-${idFactory()}`;
  while (existing.some(item => item?.id === id)) id = `custom-${idFactory()}`;
  const reminder = { id, label: values.label.trim(), time: values.time, enabled: false, custom: true, ...(values.day ? { day: values.day } : {}) };
  return { reminders: [...existing, reminder], reminder, error: null };
}

export function removeCustomReminder(reminders, reminderId) {
  return (Array.isArray(reminders) ? reminders : []).filter(item => !(item?.id === reminderId && item.custom === true));
}

export function sendReminderNotifications(reminders, createNotification) {
  if (!Array.isArray(reminders) || typeof createNotification !== 'function') return [];
  const notified = [];
  for (const reminder of reminders) {
    try {
      createNotification(reminder);
      notified.push(reminder.id);
    } catch {
      // Keep failed reminders eligible for the next in-window check.
    }
  }
  return notified;
}
