import {Platform, ToastAndroid, Alert, View, StyleSheet} from 'react-native';
import Toast from 'react-native-toast-message';
import ToastMessage from 'react-native-toast-message';

// export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
//   // If you’re using react-native-toast-message for both platforms:
//   ToastMessage.show({
//     type,
//     text1: message,
//     position: 'bottom',
//     visibilityTime: 2500,
//   });
// };

export type ToastKind = 'success' | 'error' | 'info';


export const showToast = (
  message: string,
  type: ToastKind = 'info'
): void => {
  Toast.show({
    type: 'customToast',
    text1: message,
    position:'bottom',
    visibilityTime: 2500,
    onPress: () => {}, 
    swipeable:false,
    props: {
      type,
      //toastId: Date.now(), // unique id to re-trigger animation
    },
  });
};