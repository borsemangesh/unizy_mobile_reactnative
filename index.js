/**
 * @format
 */
import "./localization/i18n";
import { AppRegistry } from 'react-native';
import App from './App';
import messaging from '@react-native-firebase/messaging';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';
import { navigate } from './screens/view/NavigationService';
import { handleNotification } from './screens/utils/NotificationHandler';
import { setupCrashlytics } from "./screens/utils/crashalaytics/setupCrashlytics";


setupCrashlytics();
// 1️⃣ Background FCM handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
;

  // 🔒 SECURITY: Check if user is logged in before processing notifications
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  try {
    const isLogin = await AsyncStorage.getItem('ISLOGIN');
    if (isLogin !== 'true') {
      // console.log('⚠️ Ignoring background notification - user not logged in');
      return; // Don't show notifications if user is logged out
    }
  } catch (err) {
    console.warn('⚠️ Error checking login status:', err);
    // If we can't check, don't show notification to be safe
    return;
  }

  const title = remoteMessage.notification?.title || remoteMessage.data?.title || "Notification";
  const body = remoteMessage.notification?.body || remoteMessage.data?.body || "";

  //  if (remoteMessage.notification) {
  //   console.log("⚠ Skipping Notifee (FCM auto-notification exists)");
  //   return;
  // }

  const isFCMAutoNotification =
  !!remoteMessage.notification ||
  remoteMessage.data?.['google.original_priority'] ||
  remoteMessage.data?.['google.delivered_priority'];

if (isFCMAutoNotification) {
  // console.log("⚠ Auto FCM notification detected — skipping Notifee");
  return;
}

if (Platform.OS === 'ios') {
  try {
    const currentBadge = await notifee.getBadgeCount();
    await notifee.setBadgeCount(currentBadge + 1);
  } catch (err) {
    console.warn("⚠️ Failed to update iOS badge", err);
  }
}

  // await notifee.displayNotification({
  //   title,
  //   body,
  //   data: remoteMessage.data,
  //   android: {
  //     channelId: 'default',
  //     sound: 'default',
  //     pressAction: { id: 'default' }
  //   },
  //   ios: {
  //     sound: 'default'
  //   }
  // });
  await notifee.displayNotification({
    title,
    body,
    data: remoteMessage.data,
    android: {
      channelId: 'default',
      sound: 'default',
      pressAction: { id: 'default' }
    },
    ios: {
      sound: 'default'
    }
  });

  await incrementBadge();

  await notifee.displayNotification({
    title: remoteMessage.notification?.title || 'Notification',
    body: remoteMessage.notification?.body || '',
    android: { channelId: 'default', pressAction: { id: 'default' }, sound: 'default' },
    ios: { sound: 'default' },
    data: remoteMessage.data,
  });
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {

    // 🔒 SECURITY: Check if user is logged in before handling notification tap
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    try {
      const isLogin = await AsyncStorage.getItem('ISLOGIN');
      if (isLogin !== 'true') {

        return; // Don't navigate if user is logged out
      }
    } catch (err) {
      console.warn('⚠️ Error checking login status:', err);
      return;
    }
    
    const notificationData = detail.notification?.data;
    await handleNotification(notificationData, true);
  }
});
AppRegistry.registerComponent(appName, () => App);
