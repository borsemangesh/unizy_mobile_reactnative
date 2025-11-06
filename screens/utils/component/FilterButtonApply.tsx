import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from '@react-native-community/blur';

type ButtonProps = {
  onPress: () => void;
  title?: string;
  style?: StyleProp<ViewStyle>; // Allow external styles
};

const FilterButtonApply = ({ onPress, title = 'Click', style }: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.buttonContainer, style]} // merge external styles
    >
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={2}
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
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
    alignSelf: 'center',
    marginBottom: 10,
    // position: 'absolute',
    // bottom: Platform.OS === 'ios' ? 16 : 10,
  },
  buttonText: {
    color: 'rgb(0, 32, 80)',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 1,
    opacity: 0.9,
  },
});

export default FilterButtonApply;
