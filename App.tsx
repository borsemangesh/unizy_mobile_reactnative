
import React, { useEffect } from "react";
import { LogBox, StatusBar, View, StyleSheet, ImageBackground, Platform, PermissionsAndroid, Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Navigation } from "./screens/view/Navigation";
import { enableScreens } from "react-native-screens";
import { StripeProvider } from '@stripe/stripe-react-native';
import { Constant } from "./screens/utils/Constant";
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { navigate } from "./screens/view/navigationRef";
import { handleNotification, navigationReady } from "./screens/utils/NotificationHandler";
import AsyncStorage from '@react-native-async-storage/async-storage';


function App() {
  LogBox.ignoreAllLogs();
  enableScreens();

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let unsubscribeForeground: (() => void) | null = null;

    const initializeNotifications = async () => {
      try {
        
        if (Platform.OS === "ios") {
          const notifeeSettings = await notifee.requestPermission({
            sound: true,
            alert: true,
            badge: true,
          });
          console.log("🔔 iOS Notification permission:", notifeeSettings);

          const token = await messaging().getToken();
          console.log("🔥 FCM Token:", token);
        }

        else {
          const authStatus = await messaging().requestPermission();
          const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            const notifeeSettings = await notifee.requestPermission();
            console.log("🔔 Notifee permission:", notifeeSettings);

          if (enabled) {
            console.log("✅ Notification permission granted");
            const token = await messaging().getToken();
            console.log("🔥 FCM Token:", token);
          } else {
            console.log("❌ Notification permission denied");
          }
        }
      
        if (Platform.OS === 'android') {
          await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
            importance: AndroidImportance.HIGH,
            sound: 'default',
          });
          console.log("✅ Notification channel created");
        }

        unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
          console.log("📩 Foreground Message:", remoteMessage);

          // 🔒 SECURITY: Check if user is logged in before processing notifications
          try {
            const isLogin = await AsyncStorage.getItem('ISLOGIN');
            if (isLogin !== 'true') {
              console.log('⚠️ Ignoring foreground notification - user not logged in');
              return; // Don't show notifications if user is logged out
            }
          } catch (err) {
            console.warn('⚠️ Error checking login status:', err);
            return; // Don't show notification if we can't verify login
          }

          try {
            const title = remoteMessage.notification?.title || remoteMessage.data?.title || "Notification";
            const body = remoteMessage.notification?.body || "";
            
            let rawNotificationData: Record<string, any> = {};
            if (remoteMessage.data?.data) {
              try {
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
            const notificationData: { [key: string]: string } = {};
            Object.keys(rawNotificationData).forEach((key) => {
              const value = rawNotificationData[key];
              if (value !== null && value !== undefined) {
                if (typeof value === 'object') {
                  notificationData[key] = JSON.stringify(value);
                } else {
                  notificationData[key] = String(value);
                }
              }
            });

            console.log("📱 Displaying notification:", { title, body, data: notificationData });

            const notificationConfig: any = {
              title,
              body,
              data: notificationData,
            };

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
              notificationConfig.ios = {
                sound: 'default',
              };
            }
            await notifee.displayNotification(notificationConfig);
          } catch (error) {
            console.error("❌ Error displaying notification:", error);
          }
        });
       

        unsubscribeForeground = notifee.onForegroundEvent(async ({ type, detail }) => {
          if (type === EventType.PRESS) {
            console.log("🟦 Notification tapped in foreground");
            
            // 🔒 SECURITY: Check if user is logged in before handling notification tap
            try {
              const isLogin = await AsyncStorage.getItem('ISLOGIN');
              if (isLogin !== 'true') {
                console.log('⚠️ Ignoring notification tap - user not logged in');
                return; // Don't navigate if user is logged out
              }
            } catch (err) {
              console.warn('⚠️ Error checking login status:', err);
              return;
            }
            
            const notificationData = detail.notification?.data;
            handleNotification(notificationData, false);
          }
        });

        // 🔔 Handle notification when app is opened from closed/background state
        // This handles when user taps notification while app is closed
        messaging().getInitialNotification().then(async (remoteMessage) => {
          if (remoteMessage) {
            console.log("📩 App opened from notification (closed state):", remoteMessage);
            
            // 🔒 SECURITY: Check if user is logged in
            try {
              const isLogin = await AsyncStorage.getItem('ISLOGIN');
              if (isLogin !== 'true') {
                console.log('⚠️ Ignoring initial notification - user not logged in');
                return;
              }
            } catch (err) {
              console.warn('⚠️ Error checking login status:', err);
              return;
            }
            
            // Wait for navigation to be ready
            let attempts = 0;
            while (!navigationReady.isReady && attempts < 20) {
              await new Promise(r => setTimeout(r, 100));
              attempts++;
            }
            
            // Extract notification data
            let notificationData: any = {};
            if (remoteMessage.data?.data) {
              try {
                notificationData = typeof remoteMessage.data.data === 'string' 
                  ? JSON.parse(remoteMessage.data.data) 
                  : remoteMessage.data.data;
              } catch {
                notificationData = remoteMessage.data || {};
              }
            } else {
              notificationData = remoteMessage.data || {};
            }
            
            // Handle navigation after a short delay to ensure app is fully loaded
            setTimeout(() => {
              handleNotification(notificationData, true);
            }, 1000);
          }
        });

        // 🔔 Handle notification when app is opened from background state
        messaging().onNotificationOpenedApp(async (remoteMessage) => {
          console.log("📩 App opened from notification (background state):", remoteMessage);
          
          // 🔒 SECURITY: Check if user is logged in
          try {
            const isLogin = await AsyncStorage.getItem('ISLOGIN');
            if (isLogin !== 'true') {
              console.log('⚠️ Ignoring notification - user not logged in');
              return;
            }
          } catch (err) {
            console.warn('⚠️ Error checking login status:', err);
            return;
          }
          
          // Extract notification data
          let notificationData: any = {};
          if (remoteMessage.data?.data) {
            try {
              notificationData = typeof remoteMessage.data.data === 'string' 
                ? JSON.parse(remoteMessage.data.data) 
                : remoteMessage.data.data;
            } catch {
              notificationData = remoteMessage.data || {};
            }
          } else {
            notificationData = remoteMessage.data || {};
          }
          
          // Handle navigation
          handleNotification(notificationData, true);
        });

      } 
      catch (error) {
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
      
      <ImageBackground
        source={require('../unizy_mobile_reactnative/assets/images/bganimationscreen.png')}
        style={{ flex: 1, width: '100%', height: '100%'}}
        resizeMode="cover"
      >
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <Navigation />
    </SafeAreaProvider>
    </ImageBackground>
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