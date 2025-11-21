import React, { useRef } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Linking } from 'react-native';
import Loader from '../../utils/component/Loader';
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
  const webViewRef = useRef<WebView>(null);
  const navigationHandledRef = useRef(false);

  const handleUrlChange = (navState: any) => {
    const url = navState.url;
    console.log('WebView URL changed:', url);
    
    // Prevent multiple navigation calls
    if (navigationHandledRef.current) {
      return;
    }
    
    if (url.includes('onboarding-complete')) {
      navigationHandledRef.current = true;

      // Stop WebView from loading the redirect URL
      webViewRef.current?.stopLoading();
      // Navigate to complete screen
      navigation.replace('StripeOnboardingComplete');
    } else if (url.includes("onboarding-cancel")) {
      navigationHandledRef.current = true;
     
      webViewRef.current?.stopLoading();
      // Navigate to cancel screen
      navigation.replace('StripeOnboardingCancel');
    }
  };

  // Intercept navigation requests to prevent WebView from loading redirect URLs
  const handleShouldStartLoadWithRequest = (request: any) => {
    const url = request.url;
    // If it's a redirect URL, prevent WebView from loading it
    if (url.includes('onboarding-complete') || url.includes('onboarding-cancel')) {
      handleUrlChange({ url });
      return false; // Prevent WebView from loading this URL
    }
    
    return true; // Allow normal navigation
  };

  return (
    <View style={styles.webViewContainer}>
      <WebView
        ref={webViewRef}
        source={{ uri: onboardingUrl }}
        onNavigationStateChange={handleUrlChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState
        style={styles.webView}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <Loader
              containerStyle={{
                width: 100,
                height: 100,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}
            />
            <Text allowFontScaling={false} style={styles.loadingText}>
              Redirecting to Stripe..
            </Text>
          </View>
        )}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.warn('WebView error: ', nativeEvent);
        // If error occurs on redirect URL, it's expected - we handle it manually
        if (nativeEvent.url && (nativeEvent.url.includes('onboarding-complete') || nativeEvent.url.includes('onboarding-cancel'))) {
          console.log('Expected error on redirect URL, handling navigation manually');
          handleUrlChange({ url: nativeEvent.url });
        }
      }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webViewContainer: {
    flex: 1,
    backgroundColor: '#0C56C4',
    width: '100%',
    height: '100%',
  },
  webView: {
    flex: 1,
    backgroundColor: '#0C56C4',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0C56C4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Urbanist-Medium',
    fontWeight: '500',
  },
});
