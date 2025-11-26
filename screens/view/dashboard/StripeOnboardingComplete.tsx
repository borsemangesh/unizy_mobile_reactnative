import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type StripeOnboardingCompleteProps = {
  navigation: any;
};

export default function StripeOnboardingComplete({ navigation }: StripeOnboardingCompleteProps) {
  useEffect(() => {
    console.log("Stripe onboarding completed!");
    AsyncStorage.removeItem('onboardingSuccessPopupShown').then(() => {
      console.log("Navigating to AccountDetails with showSuccess=true");
      navigation.replace("AccountDeatils", { showSuccess: true });
    });
  }, [navigation]);
  
  return (
    <View style={styles.container} />
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    fontSize: 18,
    fontWeight: "600"
  }
});
