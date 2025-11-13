import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

type StripeOnboardingCompleteProps = {
  navigation: any;
};

export default function StripeOnboardingComplete({ navigation }: StripeOnboardingCompleteProps) {

  useEffect(() => {
    console.log("Stripe onboarding completed!");

    setTimeout(() => {
      navigation.navigate("ProfileCard");
    }, 2000);

  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Stripe onboarding completed!</Text>
    </View>
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
