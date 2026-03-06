// import notifee from '@notifee/react-native';
// import { Platform } from 'react-native';

// /**
//  * Increase badge by 1
//  */
// export async function incrementBadge() {
//   const current = await notifee.getBadgeCount();
//   await notifee.setBadgeCount(current + 1);
// }

// /**
//  * Decrease badge by 1 (never below 0)
//  */
// export async function decrementBadge() {
//   const current = await notifee.getBadgeCount();
//   const next = Math.max(current - 1, 0);
//   await notifee.setBadgeCount(next);
// }

// /**
//  * Clear all badges
//  */
// export async function resetBadge() {
//   await notifee.setBadgeCount(0);
// }


// export async function updateBadgeFromFCM(remoteMessage: any) {
//   if (Platform.OS === 'ios') {
//     const badgeCount =
//       Number(remoteMessage?.apns?.payload?.aps?.badge || 0);
//     await notifee.setBadgeCount(badgeCount);
//   }
// }

import notifee from '@notifee/react-native';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BADGE_KEY = 'UNREAD_COUNT';

/**
 * Increment badge by 1.
 * - iOS: uses notifee.setBadgeCount (visible on app icon)
 * - Android: updates AsyncStorage count only (badge shown via notification display)
 */
export async function incrementBadge() {
  try {
    let count = Number((await AsyncStorage.getItem(BADGE_KEY)) || 0);
    count += 1;
    await AsyncStorage.setItem(BADGE_KEY, count.toString());

    if (Platform.OS === 'ios') {
      await notifee.setBadgeCount(count);
    }
  } catch (e) {
    console.warn('incrementBadge error:', e);
  }
}

/**
 * Decrement badge by 1 (never below 0).
 */
export async function decrementBadge() {
  try {
    let count = Number((await AsyncStorage.getItem(BADGE_KEY)) || 0);
    count = Math.max(count - 1, 0);
    await AsyncStorage.setItem(BADGE_KEY, count.toString());

    if (Platform.OS === 'ios') {
      await notifee.setBadgeCount(count);
    }
  } catch (e) {
    console.warn('decrementBadge error:', e);
  }
}

/**
 * Set badge to a specific number.
 */
export async function setBadgeCount(count: number) {
  try {
    const safeCount = Math.max(count, 0);
    await AsyncStorage.setItem(BADGE_KEY, safeCount.toString());

    if (Platform.OS === 'ios') {
      await notifee.setBadgeCount(safeCount);
    }
  } catch (e) {
    console.warn('setBadgeCount error:', e);
  }
}

/**
 * Reset badge to 0 (call when user opens the app or reads all notifications).
 */
export async function resetBadge() {
  try {
    await AsyncStorage.setItem(BADGE_KEY, '0');

    if (Platform.OS === 'ios') {
      await notifee.setBadgeCount(0);
    }
  } catch (e) {
    console.warn('resetBadge error:', e);
  }
}

/**
 * Get current badge count from local storage.
 */
export async function getBadgeCount(): Promise<number> {
  try {
    return Number((await AsyncStorage.getItem(BADGE_KEY)) || 0);
  } catch (e) {
    return 0;
  }
}

/**
 * Called on every incoming FCM message to update the badge.
 *
 * iOS: reads the badge number from the APNs payload sent by your server.
 *      Falls back to incrementing if server doesn't send a badge number.
 *
 * Android: notifee has no badge API — the launcher badge appears automatically
 *          when notifee.displayNotification() is called. We just track the count
 *          in AsyncStorage so your UI can show an in-app unread count if needed.
 */
export async function updateBadgeFromFCM(remoteMessage: any) {
  try {
    if (Platform.OS === 'ios') {
      // Prefer the badge number your server sends in the APNs payload
      const serverBadge = Number(remoteMessage?.apns?.payload?.aps?.badge ?? 0);

      if (serverBadge > 0) {
        // Server is managing the count — trust it
        await AsyncStorage.setItem(BADGE_KEY, serverBadge.toString());
        await notifee.setBadgeCount(serverBadge);
      } else {
        // Server isn't sending a badge number — increment locally
        await incrementBadge();
      }
    } else {
      // Android: just increment local count for in-app UI purposes.
      // The actual launcher badge dot is shown automatically by notifee
      // when displayNotification() is called — no setBadgeCount needed.
      let count = Number((await AsyncStorage.getItem(BADGE_KEY)) || 0);
      count += 1;
      await AsyncStorage.setItem(BADGE_KEY, count.toString());
    }
  } catch (e) {
    console.warn('updateBadgeFromFCM error:', e);
  }
}