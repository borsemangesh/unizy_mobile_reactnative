
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
        // const authStatus = await messaging().requestPermission();
        // const enabled =
        //   authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        //   authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        // if (enabled) {
        //   console.log("✅ Notification permission granted");
        //   const token = await messaging().getToken();
        //   console.log("🔥 FCM Token:", token);
        // } else {
        //   console.log("❌ Notification permission denied");
        // }

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
       

        // unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
        //   if (type === EventType.PRESS) {
        //     console.log("🟦 Notification tapped in foreground");
        //     console.log("📋 Full detail object:", JSON.stringify(detail, null, 2));
            
        //     let notificationData = detail.notification?.data;

        //     const notif = detail.notification;
        //     const title = notif?.title;
        //     const data = notif?.data; 
                    
        //     console.log('📋 Raw notification data:', notificationData);

        //     if (notificationData) {
        //       try {
        //         const parseValue = (value: any): any => {
        //           if (typeof value === 'string') {
        //             try {
        //               return JSON.parse(value);
        //             } catch {
        //               return value;
        //             }
        //           }
        //           return value;
        //         };



        //         if (title === "Item Sold") {
        //           const featureId = data?.feature_id || null;
        //           console.log("📦 Extracted feature_id:", featureId);

        //           navigate("ViewListingDetails", {
        //             shareid: featureId,
        //             catagory_id: 0,
        //             catagory_name: "",
        //           });

        //           return;
        //         }


        //          else if (notificationData?.title === "Order Completed") {
        //           console.log("🟢 Navigating to TransactionHistory → Sales tab");

        //           navigate('MyOrders',{});
        //           return;
        //         }
        //         else if(notificationData?.title === "New review received"){
        //           navigate('ReviewDetails', {
        //             category_id: 0,id: 0,purchase:false
        //           });
        //         }

        //          else if(notificationData?.title === "Payout Processed"){
        //          navigate('Dashboard',{AddScreenBackactiveTab: 'Search',isNavigate: false});
        //         }
        //         if (typeof notificationData === 'string') {
        //           try {
        //             notificationData = JSON.parse(notificationData);
        //             console.log('📊 Parsed notification data:', notificationData);
        //           } catch (e) {
        //             console.warn('⚠️ Could not parse data as JSON:', e);
        //           }
        //         }

        //         if (notificationData?.data && typeof notificationData.data === 'string') {
        //           try {
        //             notificationData = JSON.parse(notificationData.data);
        //             console.log('📊 Parsed nested data field:', notificationData);
        //           } catch (e) {
        //             console.warn('⚠️ Could not parse nested data as JSON:', e);
        //           }
        //         }

        //         let members = null;
        //         if (notificationData?.members) {
        //           const parsedMembers = parseValue(notificationData.members);
        //           if (Array.isArray(parsedMembers)) {
        //             members = parsedMembers[0];
        //           } else if (typeof parsedMembers === 'object' && parsedMembers !== null) {
        //             members = parsedMembers;
        //           }
        //         }

        //         if (members) {
        //           members = {
        //             id: members.id || 0,
        //             firstname: members.firstname || '',
        //             lastname: members.lastname || '',
        //             profile: members.profile || null,
        //             university: {
        //               id: members.university?.id || 0,
        //               name: members.universityName || members.university?.name || ''
        //             }
        //           };
        //         }

        //         console.log("👤 Transformed members:", members);

        //         const userConvName = notificationData?.userConvName || 
        //                           notificationData?.conv_name || 
        //                           notificationData?.friendlyname || 
        //                           '';
                
        //         let currentUserIdList = 0;
        //         if (notificationData?.current_user_id) {
        //           currentUserIdList = Number(parseValue(notificationData.current_user_id));
        //         } else if (notificationData?.from) {
        //           currentUserIdList = Number(parseValue(notificationData.from)) || 0;
        //         }

        //         // Validate required fields
        //         if (!userConvName) {
        //           console.error("❌ Missing userConvName in notification data");
        //           return;
        //         }

        //         if (!members || !members.firstname) {
        //           console.error("❌ Missing or invalid members data in notification");
        //           return;
        //         }

        //         const params = {
        //           animation: 'none',
        //           members,
        //           userConvName,
        //           currentUserIdList,
        //           source: notificationData?.source ? parseValue(notificationData.source) : 'chatList',
        //         };

        //         console.log('📱 Final navigation params:', JSON.stringify(params, null, 2));

        //         setTimeout(() => {
        //           navigate("MessagesIndividualScreen", params);
        //         }, 1000);
        //       } catch (error) {
        //         console.error("❌ Error handling foreground notification tap:", error);
        //       }
        //     }
        //   }
        // });


        unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
          if (type === EventType.PRESS) {
            console.log("🟦 Notification tapped in foreground");
            const notificationData = detail.notification?.data;
            // Use the centralized handler
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