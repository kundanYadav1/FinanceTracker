import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

import { refreshNotifications } from './scheduler';

export const NOTIFICATION_TASK = 'kosh-notification-check';

// Must be defined at module scope so the task exists when the OS wakes the app headlessly.
TaskManager.defineTask(NOTIFICATION_TASK, async () => {
  try {
    await refreshNotifications();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

/** Registers the periodic WorkManager-backed check (about every 12 hours, OS-controlled). */
export async function registerNotificationTask(): Promise<void> {
  try {
    if (await TaskManager.isTaskRegisteredAsync(NOTIFICATION_TASK)) return;
    await BackgroundTask.registerTaskAsync(NOTIFICATION_TASK, { minimumInterval: 12 * 60 });
  } catch (e) {
    console.warn('Could not register notification task', e);
  }
}
