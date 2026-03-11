import { store } from './store';
import type { DoseRecord } from '@/types';

/**
 * Check if 2 consecutive doses were missed and trigger escalation
 */
export function checkAndEscalate(): boolean {
  const settings = store.getSettings();
  if (!settings.escalationOnMissed || !settings.emergencyContact) return false;

  const records = store.getDoseRecords();
  if (records.length < 2) return false;

  // Get the last 2 records sorted by date+time (newest first)
  const sorted = [...records].sort((a, b) => {
    const dateA = `${a.date} ${a.scheduledTime}`;
    const dateB = `${b.date} ${b.scheduledTime}`;
    return dateB.localeCompare(dateA);
  });

  const lastTwo = sorted.slice(0, 2);
  const bothMissed = lastTwo.every(r => r.status === 'missed');

  if (!bothMissed) return false;

  // Check if we already escalated for these exact records (avoid repeat)
  const escalationKey = `dawaa_last_escalation`;
  const lastEscalationIds = localStorage.getItem(escalationKey);
  const currentIds = lastTwo.map(r => r.id).sort().join(',');
  if (lastEscalationIds === currentIds) return false;

  // Mark as escalated
  localStorage.setItem(escalationKey, currentIds);

  // Send message
  sendEscalationMessage(lastTwo);
  return true;
}

function sendEscalationMessage(missedDoses: DoseRecord[]) {
  const settings = store.getSettings();
  const contact = settings.emergencyContact;
  if (!contact) return;

  const isArabic = settings.language === 'ar';
  const userName = settings.userName || (isArabic ? 'المستخدم' : 'User');
  const medNames = [...new Set(missedDoses.map(d => d.medicationName))].join(', ');

  const message = isArabic
    ? `⚠️ تنبيه من تطبيق Dawaa+\n\nالسلام عليكم ${contact.name}،\n${userName} فوّت جرعتين متتاليتين من الدواء: ${medNames}.\nيرجى التواصل معه/معها للاطمئنان.\n\n- تطبيق دواء بلس`
    : `⚠️ Alert from Dawaa+\n\nHello ${contact.name},\n${userName} has missed 2 consecutive medication doses: ${medNames}.\nPlease check on them.\n\n- Dawaa+ App`;

  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = contact.phone.replace(/[^\d+]/g, '');
  // Remove leading + for WhatsApp format
  const whatsappPhone = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone;

  let url: string;
  if (contact.method === 'whatsapp') {
    url = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;
  } else {
    url = `sms:${cleanPhone}?body=${encodedMessage}`;
  }

  // Open in new window/tab
  window.open(url, '_blank');
}
