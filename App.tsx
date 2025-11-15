
import React, { useEffect } from "react";
import { LogBox, StatusBar, View, StyleSheet, ImageBackground, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Navigation } from "./screens/view/Navigation";
import { enableScreens } from "react-native-screens";
import Toast from "react-native-toast-message";
// import CustomToast from "./screens/view/authentication/CustomToast";
import { StripeProvider } from '@stripe/stripe-react-native';
import { Constant } from "./screens/utils/Constant";
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { navigate } from "./screens/view/NavigationService";


function App() {
  LogBox.ignoreAllLogs();
  enableScreens();

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let unsubscribeForeground: (() => void) | null = null;

    const initializeNotifications = async () => {
      try {
        // Request FCM permission
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log("✅ Notification permission granted");
          const token = await messaging().getToken();
          console.log("🔥 FCM Token:", token);
        } else {
          console.log("❌ Notification permission denied");
        }

        // Request Notifee permission
        const notifeeSettings = await notifee.requestPermission();
        console.log("🔔 Notifee permission:", notifeeSettings);

        // Create Android Notification channel (must be done before displaying notifications)
        if (Platform.OS === 'android') {
          await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
            importance: AndroidImportance.HIGH,
            sound: 'default',
          });
          console.log("✅ Notification channel created");
        }

        // Set up foreground FCM listener AFTER channel is created
        unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
          console.log("📩 Foreground Message:", remoteMessage);

          try {
            const title = remoteMessage.notification?.title || remoteMessage.data?.title || "Notification";
            const body = remoteMessage.notification?.body || "";
            
            // Parse the data.data string if it exists, otherwise use data object
            let rawNotificationData: Record<string, any> = {};
            if (remoteMessage.data?.data) {
              try {
                // If data.data is a string, parse it
                if (typeof remoteMessage.data.data === 'string') {
                  rawNotificationData = JSON.parse(remoteMessage.data.data);
                } else {
                  rawNotificationData = remoteMessage.data.data;
                }
              } catch (e) {
                console.log("Could not parse data.data, using as is");
                rawNotificationData = remoteMessage.data.data;
              }
            } else {
              rawNotificationData = remoteMessage.data || {};
            }

            // ✅ Convert all data values to strings (Notifee requirement)
            // Notifee requires all data values to be strings
            const notificationData: { [key: string]: string } = {};
            Object.keys(rawNotificationData).forEach((key) => {
              const value = rawNotificationData[key];
              if (value !== null && value !== undefined) {
                // Convert to string - handle objects/arrays by stringifying
                if (typeof value === 'object') {
                  notificationData[key] = JSON.stringify(value);
                } else {
                  notificationData[key] = String(value);
                }
              }
            });

            console.log("📱 Displaying notification:", { title, body, data: notificationData });

            // ✅ Show system notification in foreground
            const notificationConfig: any = {
              title,
              body,
              data: notificationData,
            };

            // Add platform-specific config
            if (Platform.OS === 'android') {
              notificationConfig.android = {
                channelId: 'default',
                pressAction: { 
                  id: 'default',
                },
                importance: AndroidImportance.HIGH,
                sound: 'default',
              };
            } else {
              // iOS config
              notificationConfig.ios = {
                sound: 'default',
              };
            }

            const notificationId = await notifee.displayNotification(notificationConfig);
            console.log("✅ Notification displayed successfully with ID:", notificationId);
          } catch (error) {
            console.error("❌ Error displaying notification:", error);
          }
        });

        // ✅ Foreground notification tap handler
        unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
          if (type === EventType.PRESS) {
            console.log("🟦 Notification tapped in foreground");
            
            const data = detail.notification?.data;

            if (data) {
              try {
                // Helper function to parse string values that might be JSON
                const parseValue = (value: any): any => {
                  if (typeof value === 'string') {
                    try {
                      // Try to parse as JSON
                      return JSON.parse(value);
                    } catch {
                      // If not valid JSON, return as string
                      return value;
                    }
                  }
                  return value;
                };

                let members = [];
                if (data?.members) {
                  const parsedMembers = parseValue(data.members);
                  if (Array.isArray(parsedMembers)) {
                    members = parsedMembers;
                  }
                }

                // Map from actual notification payload fields
                // Support both old format (userConvName) and new format (conv_name, friendlyname)
                const userConvName = data?.userConvName || data?.conv_name || data?.friendlyname || '';
                
                // Extract currentUserIdList from various possible fields
                let currentUserIdList = 0;
                if (data?.currentUserIdList) {
                  currentUserIdList = Number(parseValue(data.currentUserIdList));
                } else if (data?.from) {
                  // If from field exists, try to extract user ID
                  currentUserIdList = Number(parseValue(data.from)) || 0;
                }

                const params = {
                  animation: 'none',
                  members,
                  userConvName,
                  currentUserIdList,
                  source: data?.source ? parseValue(data.source) : 'chatList',
                };

                console.log('📱 Navigating with params:', params);
                navigate("MessagesIndividualScreen", params);
              } catch (error) {
                console.error("❌ Error handling foreground notification tap:", error);
              }
            }
          }
        });
      } catch (error) {
        console.error("❌ Error initializing notifications:", error);
      }
    };

    initializeNotifications();

    return () => {
      if (unsubscribe) unsubscribe();
      if (unsubscribeForeground) unsubscribeForeground();
    };
  }, []);

  return (
    <StripeProvider publishableKey={Constant.PUBLIC_KEY}>
      {/* <ImageBackground
        source={require('../unizy_mobile_reactnative/assets/images/bganimationscreen.png')}
        style={{ flex: 1, width: '100%', height: '100%'}}
        resizeMode="cover"
      > */}
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <Navigation />
    </SafeAreaProvider>
    {/* </ImageBackground> */}
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000069",
  },
});

export default App;