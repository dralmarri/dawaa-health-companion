import { useEffect, useCallback } from 'react';
import {
  requestNotificationPermission,
  scheduleMedicationNotifications,
  startNotificationLoop,
  getPermissionStatus,
} from '@/lib/notifications';
import { store } from '@/lib/store';
import { App as CapApp } from '@capacitor/app';

export function useNotifications() {
  useEffect(() => {
    const settings = store.getSettings();
    if (!settings.notifications) return;

    const init = async () => {
      const granted = await requestNotificationPermission();
      if (granted) {
        await startNotificationLoop();
      }
    };

    init();

    // Re-schedule when app returns to foreground (e.g. user opens app at night)
    let resumeListener: { remove: () => void } | undefined;
    CapApp.addListener('appStateChange', async ({ isActive }) => {
      if (isActive) {
        const s = store.getSettings();
        if (s.notifications) {
          await scheduleMedicationNotifications();
        }
      }
    }).then(handle => {
      resumeListener = handle;
    }).catch(() => {
      // Web fallback: use visibilitychange
      const handleVisibility = async () => {
        if (document.visibilityState === 'visible') {
          const s = store.getSettings();
          if (s.notifications) {
            await scheduleMedicationNotifications();
          }
        }
      };
      document.addEventListener('visibilitychange', handleVisibility);
      resumeListener = { remove: () => document.removeEventListener('visibilitychange', handleVisibility) };
    });

    return () => {
      resumeListener?.remove();
    };
  }, []);

  const reschedule = useCallback(async () => {
    await scheduleMedicationNotifications();
  }, []);

  return { reschedule, getPermissionStatus };
}
