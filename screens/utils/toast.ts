import {Platform, ToastAndroid, Alert} from 'react-native';
import ToastMessage from 'react-native-toast-message';

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  // If you’re using react-native-toast-message for both platforms:
  ToastMessage.show({
    type,
    text1: message,
    position: 'bottom',
    visibilityTime: 2500,
  });
};