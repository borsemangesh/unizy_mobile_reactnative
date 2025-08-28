// src/components/Background.tsx

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const BackgroundShape = () => {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Blurred blue circle */}
      <BlurView
        style={[styles.shape, styles.shape1]}
        blurType="light"
        blurAmount={20}
        reducedTransparencyFallbackColor="#0073C1"
      />

      {/* Rotated rectangle */}
      <View style={[styles.shape, styles.shape2]} />

      {/* Gradient ellipse */}
      <LinearGradient
        colors={['#0073C1', '#134B72']}
        style={[styles.shape, styles.shape3]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  shape: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.5,
  },
  shape1: {
    top: -100,
    left: -50,
    width: 300,
    height: 300,
    backgroundColor: '#0073C1',
    transform: [{ rotate: '45deg' }],
  },
  shape2: {
    bottom: -60,
    right: -60,
    width: 250,
    height: 250,
    backgroundColor: '#134B72',
    transform: [{ rotate: '-30deg' }],
  },
  shape3: {
    top: height * 0.3,
    left: width * 0.2,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
});

export default BackgroundShape;
