
import React, { useEffect ,useState } from "react";
import { LogBox, StatusBar, View, StyleSheet, ImageBackground, Platform, PermissionsAndroid, Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Navigation } from "./screens/view/Navigation";
import { enableScreens } from "react-native-screens";
import { StripeProvider } from '@stripe/stripe-react-native';
import { Constant } from "./screens/utils/Constant";
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { navigate } from "./screens/view/navigationRef";
import { handleNotification } from "./screens/utils/NotificationHandler";
import { initI18n } from "./localization/i18n";

function App() {
  LogBox.ignoreAllLogs();
  enableScreens();
   const [ready, setReady] = useState(false)
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
    const initialize = async () => {
      await initI18n();   // WAIT for i18n
      setReady(true);
    };
    initialize();
  }, []);
  

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
       

        unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
          if (type === EventType.PRESS) {
            console.log("🟦 Notification tapped in foreground");
            const notificationData = detail.notification?.data;
            handleNotification(notificationData, false);
          }
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