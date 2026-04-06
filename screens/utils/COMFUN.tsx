import { Alert, PermissionsAndroid, Platform } from 'react-native';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
export const requestCameraPermission = async () => {
  // ANDROID
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to your camera',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  // iOS
  if (Platform.OS === 'ios') {
    try {
      const status = await check(PERMISSIONS.IOS.CAMERA);

      switch (status) {
        case RESULTS.GRANTED:
          return true;

        case RESULTS.DENIED:
          // User denied previously → we can ask again
          const result = await request(PERMISSIONS.IOS.CAMERA);
          return result === RESULTS.GRANTED;

        case RESULTS.BLOCKED:
          // User selected "Don't Allow" + "Don't ask again"
          Alert.alert(
            'Camera Permission Needed',
            'Camera access is blocked. Please enable it in Settings.',
            [
              { text: 'Open Settings', onPress: () => openSettings() },
              { text: 'Cancel', style: 'cancel' },
            ],
          );
          return false;

        default:
          return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  return true;
};




//   const requestCameraPermission = async () => {
//     // ANDROID
//     if (Platform.OS === 'android') {
//       try {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.CAMERA,
//           {
//             title: 'Camera Permission',
//             message: 'App needs access to your camera',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           },
//         );

//         return granted === PermissionsAndroid.RESULTS.GRANTED;
//       } catch (err) {
//         console.warn(err);
//         return false;
//       }
//     }

//     // iOS
//     if (Platform.OS === 'ios') {
//       try {
//         const status = await check(PERMISSIONS.IOS.CAMERA);

//         switch (status) {
//           case RESULTS.GRANTED:
//             return true;

//           case RESULTS.DENIED:
//             // User denied previously → we can ask again
//             const result = await request(PERMISSIONS.IOS.CAMERA);
//             return result === RESULTS.GRANTED;

//           case RESULTS.BLOCKED:
//             // User selected "Don't Allow" + "Don't ask again"
//             Alert.alert(
//               'Camera Permission Needed',
//               'Camera access is blocked. Please enable it in Settings.',
//               [
//                 { text: 'Open Settings', onPress: () => openSettings() },
//                 { text: 'Cancel', style: 'cancel' },
//               ],
//             );
//             return false;

//           default:
//             return false;
//         }
//       } catch (err) {
//         console.warn(err);
//         return false;
//       }
//     }

//     return true;
//   };