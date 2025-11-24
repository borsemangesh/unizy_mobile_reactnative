/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import messaging from '@react-native-firebase/messaging';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';
import { navigate } from './screens/view/NavigationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1️⃣ Background FCM handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log("📩 Background FCM Message:", remoteMessage);

  const title = remoteMessage.notification?.title || remoteMessage.data?.title || "Notification";
  const body = remoteMessage.notification?.body || remoteMessage.data?.body || "";

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
});


notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log("🟦 Notification tapped in background/quit");

    let notificationData = detail.notification?.data;
    
    console.log('📋 Raw notification data:', notificationData);
    
    try {
      const parseValue = (value) => {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
        return value;
      };

      if (typeof notificationData === 'string') {
        try {
          notificationData = JSON.parse(notificationData);
          console.log('📊 Parsed notification data:', notificationData);
        } catch (e) {
          console.warn('⚠️ Could not parse data as JSON:', e);
        }
      }

      if (notificationData?.data && typeof notificationData.data === 'string') {
        try {
          notificationData = JSON.parse(notificationData.data);
          console.log('📊 Parsed nested data field:', notificationData);
        } catch (e) {
          console.warn('⚠️ Could not parse nested data as JSON:', e);
        }
      }

      let members = null;
      if (notificationData?.members) {
        const parsedMembers = parseValue(notificationData.members);
        if (Array.isArray(parsedMembers)) {
          members = parsedMembers[0];
        } else if (typeof parsedMembers === 'object' && parsedMembers !== null) {
          members = parsedMembers;
        }
      }
      if (members) {
        members = {
          id: members.id || 0,
          firstname: members.firstname || '',
          lastname: members.lastname || '',
          profile: members.profile || null,
          university: {
            id: members.university?.id || 0,
            name: members.universityName || members.university?.name || ''
          }
        };
      }

      console.log("👤 Transformed members:", members);

      const userConvName = notificationData?.userConvName || 
                          notificationData?.conv_name || 
                          notificationData?.friendlyname || 
                          '';
      
      let currentUserIdList = 0;
      if (notificationData?.current_user_id) {
        currentUserIdList = Number(parseValue(notificationData.current_user_id));
      } else if (notificationData?.from) {
        currentUserIdList = Number(parseValue(notificationData.from)) || 0;
      }

      // Extract conversation SID (CRITICAL for fast loading)
      const conversationSid = notificationData?.conversationSid || 
                             notificationData?.twilio_conversation_sid || 
                             notificationData?.sid || 
                             notificationData?.conversation_sid || 
                             '';

      // Extract source
      const source = notificationData?.source ? parseValue(notificationData.source) : 'chatList';

      // Extract sellerData if source is sellerPage
      let sellerData = undefined;
      if (source === 'sellerPage' && notificationData?.sellerData) {
        const parsedSellerData = parseValue(notificationData.sellerData);
        if (parsedSellerData && typeof parsedSellerData === 'object') {
          sellerData = {
            featureId: parsedSellerData.featureId || parsedSellerData.id || 0,
            firstname: parsedSellerData.firstname || '',
            lastname: parsedSellerData.lastname || '',
            profile: parsedSellerData.profile || null,
            universityName: parsedSellerData.universityName || parsedSellerData.university || { id: 0, name: '' },
            id: parsedSellerData.id || 0,
          };
        }
      }

      if (!userConvName) {
        console.error("❌ Missing userConvName in notification data");
        return;
      }

      if (!members || !members.firstname) {
        console.error("❌ Missing or invalid members data in notification");
        return;
      }

      const params = {
        animation: 'none',
        members,
        userConvName,
        currentUserIdList,
        conversationSid, // ✅ ADDED - Critical for fast conversation loading
        source,
        ...(sellerData && { sellerData }), // ✅ ADDED - Only include if exists
      };

      console.log('📱 Final navigation params:', JSON.stringify(params, null, 2));

      // ✅ CRITICAL FIX: Store in AsyncStorage for quit state
      // This ensures navigation happens after app initialization
      // ✅ ALSO: Clear any previous completion flag (new notification = new navigation)
      await AsyncStorage.removeItem('notificationNavigationCompleted');
      await AsyncStorage.setItem('pendingNotificationNavigation', JSON.stringify({
        screen: 'MessagesIndividualScreen',
        params: params,
        timestamp: Date.now(),
      }));

      // Try immediate navigation (works if app is in background)
      setTimeout(() => {
        navigate("MessagesIndividualScreen", params);
      }, 2000); // Increased delay for quit state
    } catch (error) {
      console.error("❌ Error parsing notification data:", error);
    }
  }
});

AppRegistry.registerComponent(appName, () => App);
