// /**
//  * @format
//  */
// import "./localization/i18n";
// import { AppRegistry } from 'react-native';
// import App from './App';
// import messaging from '@react-native-firebase/messaging';
// import { name as appName } from './app.json';
// import notifee, { EventType } from '@notifee/react-native';
// import { handleNotification } from './screens/utils/NotificationHandler';
// import { setupCrashlytics } from "./screens/utils/crashalaytics/setupCrashlytics";

// import 'react-native-get-random-values';


// setupCrashlytics();
// // 1️⃣ Background FCM handler
// messaging().setBackgroundMessageHandler(async remoteMessage => {


//   const AsyncStorage = require('@react-native-async-storage/async-storage').default;
//   try {
//     const isLogin = await AsyncStorage.getItem('ISLOGIN');
//     if (isLogin !== 'true') {
//       return;
//     }
//   } catch (err) {
//     console.warn('⚠️ Error checking login status:', err);
//     return;
//   }

//   const title = remoteMessage.notification?.title || remoteMessage.data?.title || "Notification";
//   const body = remoteMessage.notification?.body || remoteMessage.data?.body || "";

// if (Platform.OS === 'ios') {
//   // await incrementBadge();
// }


// if (Platform.OS === 'android' && !remoteMessage.notification) {
//   await notifee.displayNotification({
//     title: remoteMessage.data?.title || 'Notification',
//     body: remoteMessage.data?.body || '',
//     android: {
//       channelId: 'default',
//       pressAction: { id: 'default' },
//     },
//     ios:{
//       sound: 'default'
//     }
//   });
// }
// });

// notifee.onBackgroundEvent(async ({ type, detail }) => {
//   if (type === EventType.PRESS) {
    
//     const AsyncStorage = require('@react-native-async-storage/async-storage').default;
//     try {
//       const isLogin = await AsyncStorage.getItem('ISLOGIN');
//       if (isLogin !== 'true') {

//         return;
//       }
//     } catch (err) {
//       console.warn('⚠️ Error checking login status:', err);
//       return;
//     }
    
//     const notificationData = detail.notification?.data;
//     await handleNotification(notificationData, true);
//   }
// });
// AppRegistry.registerComponent(appName, () => App);


// // import "./localization/i18n";
// // import { AppRegistry } from 'react-native';
// // import App from './App';
// // import messaging from '@react-native-firebase/messaging';
// // import { name as appName } from './app.json';
// // import notifee, { EventType } from '@notifee/react-native';
// // import { navigate } from './screens/view/NavigationService';
// // import { handleNotification } from './screens/utils/NotificationHandler';
// // import { setupCrashlytics } from "./screens/utils/crashalaytics/setupCrashlytics";

// // import { incrementBadge } from './screens/utils/badgeHelper';
// // import { decrementBadge } from './screens/utils/badgeHelper';
// // import 'react-native-get-random-values';


// // setupCrashlytics();
// // // 1️⃣ Background FCM handler
// // messaging().setBackgroundMessageHandler(async remoteMessage => {
// // ;

// //   // 🔒 SECURITY: Check if user is logged in before processing notifications
// //   const AsyncStorage = require('@react-native-async-storage/async-storage').default;
// //   try {
// //     const isLogin = await AsyncStorage.getItem('ISLOGIN');
// //     if (isLogin !== 'true') {
// //       // console.log('⚠️ Ignoring background notification - user not logged in');
// //       return; // Don't show notifications if user is logged out
// //     }
// //   } catch (err) {
// //     console.warn('⚠️ Error checking login status:', err);
// //     // If we can't check, don't show notification to be safe
// //     return;
// //   }

// //   const title = remoteMessage.notification?.title || remoteMessage.data?.title || "Notification";
// //   const body = remoteMessage.notification?.body || remoteMessage.data?.body || "";

// //   //  if (remoteMessage.notification) {
// //   //   console.log("⚠ Skipping Notifee (FCM auto-notification exists)");
// //   //   return;
// //   // }

// //   const isFCMAutoNotification =
// //   !!remoteMessage.notification ||
// //   remoteMessage.data?.['google.original_priority'] ||
// //   remoteMessage.data?.['google.delivered_priority'];

// // if (isFCMAutoNotification) {
// //   // console.log("⚠ Auto FCM notification detected — skipping Notifee");
// //   return;
// // }

// //   await incrementBadge();
// //   await notifee.displayNotification({
// //     title,
// //     body,
// //     data: remoteMessage.data,
// //     android: {
// //       channelId: 'default',
// //       sound: 'default',
// //       pressAction: { id: 'default' }
// //     },
// //     ios: {
// //       sound: 'default'
// //     }
// //   });
// // });

// // notifee.onBackgroundEvent(async ({ type, detail }) => {
// //   if (type === EventType.PRESS) {
// //     await decrementBadge();
// //     // 🔒 SECURITY: Check if user is logged in before handling notification tap
// //     const AsyncStorage = require('@react-native-async-storage/async-storage').default;
// //     try {
// //       const isLogin = await AsyncStorage.getItem('ISLOGIN');
// //       if (isLogin !== 'true') {

// //         return; // Don't navigate if user is logged out
// //       }
// //     } catch (err) {
// //       console.warn('⚠️ Error checking login status:', err);
// //       return;
// //     }
    
// //     const notificationData = detail.notification?.data;
// //     await handleNotification(notificationData, true);
// //   }
// // });
// // AppRegistry.registerComponent(appName, () => App);
/**
 * @format
 */
import "./localization/i18n";
import { AppRegistry, Platform } from 'react-native'; // ✅ FIX: Added Platform import
import App from './App';
import messaging from '@react-native-firebase/messaging';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';
import { handleNotification } from './screens/utils/NotificationHandler';
import { setupCrashlytics } from "./screens/utils/crashalaytics/setupCrashlytics";

import 'react-native-get-random-values';

setupCrashlytics();

// 1️⃣ Background FCM handler
messaging().setBackgroundMessageHandler(async remoteMessage => {

  const AsyncStorage = require('@react-native-async-storage/async-storage').default;

  // 🔒 SECURITY: Check if user is logged in before processing
  try {
    const isLogin = await AsyncStorage.getItem('ISLOGIN');
    if (isLogin !== 'true') {
      return;
    }
  } catch (err) {
    console.warn('⚠️ Error checking login status:', err);
    return;
  }

  const title = remoteMessage.notification?.title || remoteMessage.data?.title || "Notification";
  const body = remoteMessage.notification?.body || remoteMessage.data?.body || "";

  // ✅ iOS: Increment badge count for background messages
  if (Platform.OS === 'ios') {
    await notifee.incrementBadgeCount();
  }

  // ✅ Android: Show notification for data-only messages (no notification payload)
  // If remoteMessage.notification exists, FCM already shows it automatically on Android
  if (Platform.OS === 'android' && !remoteMessage.notification) {
    await notifee.displayNotification({
      title: remoteMessage.data?.title || 'Notification',
      body: remoteMessage.data?.body || '',
      android: {
        channelId: 'default',
        pressAction: { id: 'default' },
        importance: require('@notifee/react-native').AndroidImportance.HIGH,
        sound: 'default',
      },
      ios: {
        sound: 'default',
      },
    });
  }
});

// 2️⃣ Background notifee tap handler
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {

    const AsyncStorage = require('@react-native-async-storage/async-storage').default;

    // 🔒 SECURITY: Check if user is logged in
    try {
      const isLogin = await AsyncStorage.getItem('ISLOGIN');
      if (isLogin !== 'true') {
        return;
      }
    } catch (err) {
      console.warn('⚠️ Error checking login status:', err);
      return;
    }

    // ✅ iOS: Decrement badge when notification is tapped
    if (Platform.OS === 'ios') {
      await notifee.decrementBadgeCount();
    }

    const notificationData = detail.notification?.data;
    await handleNotification(notificationData, true);
  }
});

AppRegistry.registerComponent(appName, () => App);