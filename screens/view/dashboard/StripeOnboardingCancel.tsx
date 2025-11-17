import React, { useEffect } from 'react';
import { View } from 'react-native';

type StripeOnboardingCancelProps = {
  navigation: any;
};

export default function StripeOnboardingCancel({ navigation }: StripeOnboardingCancelProps) {
  useEffect(() => {
    navigation.navigate("ProfileCard"); // back to profile
  }, []);

  return null; // no UI needed
}
