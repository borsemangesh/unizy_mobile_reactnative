import React, { useRef } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Linking } from 'react-native';
import Loader from '../../utils/component/Loader';
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const handleUrlChange = (navState: any) => {
    const url = navState.url;

    
    if (navigationHandledRef.current) {
      return;
    }
    
    if (url.includes('onboarding-complete')) {
      navigationHandledRef.current = true;

      webViewRef.current?.stopLoading();
      navigation.replace('StripeOnboardingComplete');
    } else if (url.includes("onboarding-cancel")) {
      navigationHandledRef.current = true;
     
      webViewRef.current?.stopLoading();
      navigation.replace('StripeOnboardingCancel');
    }
  };

  const handleShouldStartLoadWithRequest = (request: any) => {
    const url = request.url;
    if (url.includes('onboarding-complete') || url.includes('onboarding-cancel')) {
      handleUrlChange({ url });
      return false; 
    }
    
    return true; 
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0C56C4' }} edges={['top']}>
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
              {t('redirect_stripe')}
            </Text>
          </View>
        )}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.warn('WebView error: ', nativeEvent);
        if (nativeEvent.url && (nativeEvent.url.includes('onboarding-complete') || nativeEvent.url.includes('onboarding-cancel'))) {

          handleUrlChange({ url: nativeEvent.url });
        }
      }}
      />
   </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
