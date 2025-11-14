import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

type StripeOnboardingCompleteProps = {
  navigation: any;
};

export default function StripeOnboardingComplete({ navigation }: StripeOnboardingCompleteProps) {
  useEffect(() => {
    console.log("Stripe onboarding completed!");
    // Navigate directly to AccountDetails with showSuccess flag
    // The success popup will be shown in AccountDetails page
    navigation.replace("AccountDeatils", { showSuccess: true });
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
