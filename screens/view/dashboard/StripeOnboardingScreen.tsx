import React from 'react';
import { ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Linking } from 'react-native';
type RootStackParamList = {
  StripeOnboardingScreen: { onboardingUrl: string };
  StripeOnboardingComplete: undefined;
};

type Props = NativeStackScreenProps<
  RootStackParamList,
  'StripeOnboardingScreen'
>;

export default function StripeOnboardingScreen({ route, navigation }: any) {
  const { onboardingUrl } = route.params;

  const handleUrlChange = (event: any) => {
    const url = event.url;
    console.log(url);
    
    if (url.includes('onboarding-complete')) {
      Linking.openURL(url); // send to app handler
      navigation.replace('StripeOnboardingComplete');
    }
  };

  return (
    <WebView
      source={{ uri: onboardingUrl }}
      onNavigationStateChange={handleUrlChange}
      originWhitelist={['*']}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState
      renderLoading={() => <ActivityIndicator size="large" />}
    />
  );
}
