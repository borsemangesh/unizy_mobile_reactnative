// export const LogoutModal = (
//   visible,
//   onClose,
//   onConfirm,
//   title,
//   message,
//   confirmText = 'Confirm',
//   cancelText = 'Cancel',
//   imageSource,
//   loading = false,
// ) => {
//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="fade"
//       onRequestClose={() => onClose}
//     >
//       <TouchableWithoutFeedback onPress={() => onClose}>
//         <View style={styles.overlay}>
//           <BlurView
//             style={[
//               StyleSheet.absoluteFill,
//               {
//                 alignSelf: 'center',
//                 alignItems: 'center',
//                 alignContent: 'center',
//                 justifyContent: 'center',
//               },
//             ]}
//             blurType="light"
//             blurAmount={10}
//             reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
//           />
//           <View
//             style={[
//               StyleSheet.absoluteFill,
//               { backgroundColor: 'rgba(0, 0, 0, 0.32)' },
//             ]}
//           />

//           <View style={styles.popupContainer}>
//             <Image
//               source={require('../../../assets/images/alert_logout.png')}
//               style={styles.logo}
//               resizeMode="contain"
//             />
//             <Text allowFontScaling={false} style={styles.mainheader}>
//               {t('confirm_logout')}
//             </Text>
//             <Text allowFontScaling={false} style={styles.subheader}>
//               {t('logout_message')}
//             </Text>

//             <TouchableOpacity
//               style={styles.loginButton}
//               onPress={async () => {
//                 try {
//                   setLoading(true);
//                   const deviceId = await DeviceInfo.getUniqueId();
//                   const user_id = await AsyncStorage.getItem('userId');

//                   const body = {
//                     device_type: Platform.OS === 'ios' ? 'ios' : 'android',
//                     device_id: deviceId,
//                     user_id: Number(user_id),
//                   };

//                   const response = await fetch(
//                     `${MAIN_URL.baseUrl}user/delete-fcm-token`,
//                     {
//                       method: 'POST',
//                       headers: {
//                         'Content-Type': 'application/json',
//                       },
//                       body: JSON.stringify(body),
//                     },
//                   );

//                   const apiData = await response.json();

//                   if (apiData?.statusCode === 200) {
//                     await AsyncStorage.setItem('userToken', '');
//                     await AsyncStorage.setItem('userData', '');
//                     await AsyncStorage.setItem('userId', '');
//                     await AsyncStorage.setItem('twilio_convo_', '');
//                     await AsyncStorage.setItem('twilio_msg_', '');

//                     try {
//                       await resetTwilioClient();
//                       await clearTwilioCache();
//                       try {
//                         const messaging =
//                           require('@react-native-firebase/messaging').default;
//                         await messaging().deleteToken();
//                         if (__DEV__) {
//                         }
//                       } catch (fcmError) {
//                         console.warn('⚠️ Error deleting FCM token:', fcmError);
//                       }

//                       if (__DEV__) {
//                       }
//                     } catch (clearError) {
//                       console.warn(
//                         '⚠️ Error clearing Twilio data on logout:',
//                         clearError,
//                       );
//                     }

//                     await AsyncStorage.setItem('ISLOGIN', 'false');

//                     navigation.reset({
//                       index: 0,
//                       routes: [
//                         {
//                           name: 'SinglePage',
//                           params: {
//                             resetToLogin: true,
//                             logoutMessage: t(Constant.USER_LOGOUT),
//                           },
//                         },
//                       ],
//                     });
//                     setShowConfirm(false);
//                     // logoutCleanup();
//                   } else {
//                     showToast(t(Constant.LOGOUT_FAIL), 'error');
//                   }
//                 } catch (error) {
//                   console.log('Something went wrong. Try again!');
//                 } finally {
//                   setLoading(false);
//                 }
//               }}
//             >
//               <Text allowFontScaling={false} style={styles.loginText}>
//                 {t('logout')}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.loginButton1}
//               onPress={() => setShowConfirm(false)}
//             >
//               <Text allowFontScaling={false} style={styles.loginText1}>
//                 {t('cancel')}
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {/* </BlurView> */}
//         </View>
//       </TouchableWithoutFeedback>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
// });

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Image,
} from 'react-native';

import { BlurView } from '@react-native-community/blur';

export const CommonConfirmModal = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  imageSource,
  loading = false,
}: any) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="rgba(0,0,0,0.1)"
          />

          <View style={[StyleSheet.absoluteFill, styles.backgroundOverlay]} />

          <TouchableWithoutFeedback>
            <View style={styles.popupContainer}>
              {imageSource && (
                <Image
                  source={imageSource}
                  style={styles.logo}
                  resizeMode="contain"
                />
              )}

              <Text style={styles.mainheader}>{title}</Text>

              <Text style={styles.subheader}>{message}</Text>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={onConfirm}
                disabled={loading}
              >
                <Text style={styles.confirmText}>
                  {loading ? 'Please wait...' : confirmText}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
  popupContainer: {
    width: '85%',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 0,
  },
  mainheader: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  subheader: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 6,
  },
  confirmButton: {
    display: 'flex',
    width: '100%',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    marginTop: 12,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },
  confirmText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    width: '100%',
    },
    cancelButton: {
    display: 'flex',
    width: '100%',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'rgba(170, 169, 176, 0.56)',
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
    },
   cancelText :{
    color: '#FFFFFF7A',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    width: '100%',
  },
});
