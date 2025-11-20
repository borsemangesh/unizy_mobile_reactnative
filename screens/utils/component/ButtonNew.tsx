import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle, StyleProp, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';

type ButtonProps = {
  onPress: () => void;
  title?: string;
  buttonStyle?: StyleProp<ViewStyle>;  // external button container style
  textStyle?: StyleProp<TextStyle>;    // external text style
};

const ButtonNew = ({ onPress, title = 'Click', buttonStyle, textStyle }: ButtonProps) => {
  return (
   
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.buttonContainer, buttonStyle]} // merge external button styles
    >
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={2}
        pointerEvents="none"
        reducedTransparencyFallbackColor="transparent"
      />
      <View style={{width: '100%', height: '100%', justifyContent: 'center'}}>
      <Text allowFontScaling={false} style={[styles.buttonText, textStyle]}>
        {title}
      </Text>
      </View>
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
    marginBottom: 15,
  },
  buttonText: {
    color: '#002050ff',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 1,
    opacity: 0.9,
  },
});

export default ButtonNew;
