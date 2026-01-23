import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BADGE_KEY = 'UNREAD_COUNT';

// Increment badge count by 1
export async function incrementBadge() {
  let count = Number(await AsyncStorage.getItem(BADGE_KEY) || 0);
  count += 1;
  await AsyncStorage.setItem(BADGE_KEY, count.toString());
  await notifee.setBadgeCount(count);
}

// Set badge count to a specific number
export async function setBadgeCount(count: number) {
  await AsyncStorage.setItem(BADGE_KEY, count.toString());
  await notifee.setBadgeCount(count);
}

// Clear badge (e.g., when user reads messages)
export async function clearBadge() {
  await AsyncStorage.setItem(BADGE_KEY, '0');
  await notifee.setBadgeCount(0);
}

// Get current badge count
export async function getBadgeCount() {
  return Number(await AsyncStorage.getItem(BADGE_KEY) || 0);
}
