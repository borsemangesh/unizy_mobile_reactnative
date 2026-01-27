import React, { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';

type ButtonProps = {
  // onPress: () => void;
  title?: ReactNode;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const MessageHeaderButton = ({
  // onPress,
  title = 'Click',
  buttonStyle,
  textStyle,
}: ButtonProps) => {
  return (
    <View
      // onPress={onPress}
      // activeOpacity={0.7}
      style={[styles.buttonContainer, buttonStyle]}
    >
      <View
        style={{
          justifyContent: 'center',
          // height: 48,
          alignItems: 'center',
          borderRadius: 100,
          overflow: 'hidden',
          alignSelf: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,


          backgroundColor: 'rgba(255, 255, 255, 0.56)',
        }}
      >
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={2}
          pointerEvents="none"
          reducedTransparencyFallbackColor="transparent"
        />
        <Text allowFontScaling={false} style={[styles.buttonText, textStyle]}>
          {title}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  buttonText: {
    color: 'rgba(0, 32, 80, 1)',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
    opacity: 0.9,
    lineHeight: 20,
  },
});

export default MessageHeaderButton;
