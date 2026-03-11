import { useEffect, useCallback } from 'react';
import { requestNotificationPermission, scheduleMedicationNotifications, startNotificationLoop, getPermissionStatus } from '@/lib/notifications';
import { store } from '@/lib/store';

export function useNotifications() {
  useEffect(() => {
    const settings = store.getSettings();
    if (!settings.notifications) return;

    const init = async () => {
      const granted = await requestNotificationPermission();
      if (granted) {
        startNotificationLoop();
      }
    };
    init();
  }, []);

  const reschedule = useCallback(() => {
    scheduleMedicationNotifications();
  }, []);

  return { reschedule, getPermissionStatus };
}
