import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BlurView } from '@react-native-community/blur';

type ButtonProps = {
  onPress: () => void;
  title?: string;
};

const Button = ({ onPress, title = 'Click' }: ButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.buttonContainer}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={2}
        // REMOVE fallback color if you want absolutely NO background color
        reducedTransparencyFallbackColor="transparent"
      />
      <Text allowFontScaling={false} style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '95%',
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
    position: 'absolute',
    bottom: (Platform.OS === 'ios'? 16 : 10),
  },
  buttonText: {
    // color: '#000',
    // fontSize: 16,
    // fontWeight: 'bold',
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    opacity: 0.9,
    textShadowColor: 'transparent',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
  },
});

export default Button;
