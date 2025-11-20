import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from '@react-native-community/blur';

type ButtonProps = {
  onPress: () => void;
  title?: string;
  style?: StyleProp<ViewStyle>;
};

const FilterButton = ({ onPress, title = 'Click', style }: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.buttonContainer, style]}
    >
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={2}
        pointerEvents="none"
        reducedTransparencyFallbackColor="transparent"
      />
      <Text allowFontScaling={false} style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '90%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
    alignSelf: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'rgb(255, 255, 255)',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 1,
    opacity: 0.9,
  },
});

export default FilterButton;
