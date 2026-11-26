import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ButtonProps = {
  onPress: () => void;
  title?: string;
};

const Button = ({ onPress, title = 'Click' }: ButtonProps) => {
  const insets = useSafeAreaInsets();
  const bottom =
    Platform.OS === 'android'
      ? Math.max(insets.bottom, 12) + 10
      : Math.max(insets.bottom, 16) + 8;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.buttonContainer, { bottom }]}
    >
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={2}
        pointerEvents="none"
        reducedTransparencyFallbackColor="transparent"
      />
      <Text allowFontScaling={false} style={styles.buttonText}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: (Platform.OS === 'ios'? '93%' : '93%'),
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
    alignSelf: 'center',
    position: 'absolute',
    },

  buttonText: {
    color: '#002050ff',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    opacity: 0.9,
  },
});

export default Button;