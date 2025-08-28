import React, { ReactNode } from 'react';
import { SafeAreaView, StatusBar, Platform, View, StyleSheet } from 'react-native';

type EdgeToEdgeScreenProps = {
  children: ReactNode;
  backgroundColor?: string; // optional fallback behind gradients
};

export default function EdgeToEdgeScreen({ children, backgroundColor = '#000' }: EdgeToEdgeScreenProps) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.container}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});