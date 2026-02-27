import notifee from '@notifee/react-native';
import { Platform } from 'react-native';

/**
 * Increase badge by 1
 */
export async function incrementBadge() {
  const current = await notifee.getBadgeCount();
  await notifee.setBadgeCount(current + 1);
}

/**
 * Decrease badge by 1 (never below 0)
 */
export async function decrementBadge() {
  const current = await notifee.getBadgeCount();
  const next = Math.max(current - 1, 0);
  await notifee.setBadgeCount(next);
}

/**
 * Clear all badges
 */
export async function resetBadge() {
  await notifee.setBadgeCount(0);
}


export async function updateBadgeFromFCM(remoteMessage: any) {
  if (Platform.OS === 'ios') {
    const badgeCount =
      Number(remoteMessage?.apns?.payload?.aps?.badge || 0);
    await notifee.setBadgeCount(badgeCount);
  }
}