
import React, { useEffect } from "react";
import { LogBox, StatusBar, View, StyleSheet, ImageBackground, Platform, PermissionsAndroid, Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Navigation } from "./screens/view/Navigation";
import { enableScreens } from "react-native-screens";
import Toast from "react-native-toast-message";
// import CustomToast from "./screens/view/authentication/CustomToast";
import { StripeProvider } from '@stripe/stripe-react-native';
import { Constant } from "./screens/utils/Constant";
// import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { PERMISSIONS, RESULTS, check, request } from "react-native-permissions";


function App() {
  LogBox.ignoreAllLogs();
  enableScreens();


  const requestAllPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        // Android Permissions
        const location = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        const gallery =
          Platform.Version >= 33
            ? await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
              )
            : await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
              );

        if (
          location === PermissionsAndroid.RESULTS.GRANTED &&
          gallery === PermissionsAndroid.RESULTS.GRANTED
        ) {
          Alert.alert('Success', 'All permissions granted');
        } else {
          Alert.alert('Permission Denied', 'Some permissions are denied');
        }
      } else {
        // // iOS Permissions
        // const loc = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        // const photo = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);

        // if (loc === RESULTS.GRANTED && photo === RESULTS.GRANTED) {
        //   // Alert.alert('Success', 'All permissions granted');
        // } else {
        //   Alert.alert('Permission Denied', 'Some permissions are denied');
        // }

        try {
          // Check current permission status first
          const status = await check(PERMISSIONS.IOS.CAMERA);
          if (status === RESULTS.GRANTED) {
            return true;
          }
          const result = await request(PERMISSIONS.IOS.CAMERA);
    
          if (result === RESULTS.GRANTED) {
            return true; 
          } else if (result === RESULTS.BLOCKED) {
            console.warn('Camera permission is blocked. Please enable it in Settings.');
            return false;
          } else {
            return false; // Denied
          }
        } catch (err) {
          console.warn(err);
          return false;
        }
      }
    } catch (error) {
      console.warn(error);
    }
  };

  // useEffect(() => {
  //   const setupFCM = async () => {
  //     const authStatus = await messaging().requestPermission();
  //     const enabled =
  //       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //       authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //     if (enabled) {
  //       console.log("✅ Notification permission granted");

  //       const token = await messaging().getToken();
  //       console.log("🔥 FCM Token:", token);
  //     } else {
  //       console.log("❌ Notification permission denied");
  //     }
  //   };

  //   // Foreground message listener
  //   const unsubscribe = messaging().onMessage(async remoteMessage => {
  //     console.log("📩 Foreground Message:", remoteMessage);
  //     Toast.show({
  //       type: "info",
  //       text1: remoteMessage.notification?.title,
  //       text2: remoteMessage.notification?.body,
  //     });
  //   });

  //   setupFCM();

  //   return unsubscribe;
  // }, []);


//  useEffect(() => {

//     // const setupNotifications = async () => {
//     //   // Request FCM permission
//     //   const authStatus = await messaging().requestPermission();
//     //   const enabled =
//     //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//     //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//     //   if (enabled) {
//     //     console.log("✅ Notification permission granted");
//     //     const token = await messaging().getToken();
//     //     console.log("🔥 FCM Token:", token);
//     //   } else {
//     //     console.log("❌ Notification permission denied");
//     //   }

//     //   // Request Notifee permission
//     //   await notifee.requestPermission();

//     //   // Create Android Notification channel
//     //   await notifee.createChannel({
//     //     id: 'default',
//     //     name: 'Default Channel',
//     //     importance: AndroidImportance.HIGH,
//     //   });
//     // };

//     // Foreground FCM listener
//     const unsubscribe = messaging().onMessage(async remoteMessage => {
//       console.log("📩 Foreground Message:", remoteMessage);

//       const title = remoteMessage.notification?.title || "Notification";
//       const body = remoteMessage.notification?.body || "";

//       // ✅ Show system notification in foreground
//       await notifee.displayNotification({
//         title,
//         body,
//         android: {
//           channelId: 'default',
//           pressAction: { id: 'default' },
//         },
//       });
//     });

//     setupNotifications();

//     return unsubscribe;
//   }, []);

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