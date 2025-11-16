/**
 * @format
 */

// import { AppRegistry } from 'react-native';
// import App from './App';
// import { name as appName } from './app.json';

// AppRegistry.registerComponent(appName, () => App);


/**
 * @format
 */
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { navigate } from './screens/view/NavigationService';

// 1️⃣ Background FCM handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log("📩 Background FCM Message:", remoteMessage);
});

// 2️⃣ Background notification tap handler
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log("🟦 Notification tapped in background/quit");

    console.log("detailfdjgfjglgldfgh----",detail);
    
    
    // The data field might be a JSON string or an object
    let notificationData = detail.notification?.data;
    
    console.log('📋 Raw notification data:', notificationData);
    
    try {
      // Helper function to parse string values that might be JSON
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

      // Parse the data field if it's a JSON string
      if (typeof notificationData === 'string') {
        try {
          notificationData = JSON.parse(notificationData);
          console.log('📊 Parsed notification data:', notificationData);
        } catch (e) {
          console.warn('⚠️ Could not parse data as JSON:', e);
        }
      }

      // Also check if data itself contains a nested data field
      if (notificationData?.data && typeof notificationData.data === 'string') {
        try {
          notificationData = JSON.parse(notificationData.data);
          console.log('📊 Parsed nested data field:', notificationData);
        } catch (e) {
          console.warn('⚠️ Could not parse nested data as JSON:', e);
        }
      }

      // Extract members - handle both object and array formats
      let members = null;
      if (notificationData?.members) {
        const parsedMembers = parseValue(notificationData.members);
        if (Array.isArray(parsedMembers)) {
          // If array, take the first member (the other user)
          members = parsedMembers[0];
        } else if (typeof parsedMembers === 'object' && parsedMembers !== null) {
          // If object, use it directly
          members = parsedMembers;
        }
      }

      // Transform members to match MessageIndividualScreen RouteParams structure
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

      // Extract conversation name
      const userConvName = notificationData?.userConvName || 
                          notificationData?.conv_name || 
                          notificationData?.friendlyname || 
                          '';
      
      // Extract current user ID
      let currentUserIdList = 0;
      if (notificationData?.current_user_id) {
        currentUserIdList = Number(parseValue(notificationData.current_user_id));
      } else if (notificationData?.from) {
        currentUserIdList = Number(parseValue(notificationData.from)) || 0;
      }

      // Validate required fields
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
        source: notificationData?.source ? parseValue(notificationData.source) : 'chatList',
      };

      console.log('📱 Final navigation params:', JSON.stringify(params, null, 2));

      // Use navigate function which has built-in retry logic
      setTimeout(() => {
        navigate("MessagesIndividualScreen", params);
      }, 1500);
    } catch (error) {
      console.error("❌ Error parsing notification data:", error);
    }
  }
});

AppRegistry.registerComponent(appName, () => App);