// import React from 'react';
// import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
// import { BlurView } from '@react-native-community/blur';

// type SaveButtonProps = {
//   onPress: () => void;
//   title?: string;
// };

// const SaveButton = ({ onPress, title = 'Click' }: SaveButtonProps) => {
//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       activeOpacity={0.7}
//       style={styles.buttonContainer}
//     >
//       <BlurView
//         style={StyleSheet.absoluteFill}
//         blurType="light"
//         blurAmount={2}
//         pointerEvents="none"
//         reducedTransparencyFallbackColor="transparent"
//       />
//       <Text allowFontScaling={false} style={styles.buttonText}>
//         {title}
//       </Text>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   buttonContainer: {
//     width: (Platform.OS === 'ios'? '93%' : '93%'),
//     height: 48,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 100,
//     overflow: 'hidden',
//     backgroundColor: 'rgba(255, 255, 255, 0.56)',
//     borderWidth: 0.5,
//     borderColor: '#ffffff2c',
//     alignSelf: 'center',
//     position: 'absolute',
//     bottom: (Platform.OS === 'ios'? 35 : 20),
//     },

//   buttonText: {
//     color: '#002050ff',
//     textAlign: 'center',
//     fontFamily: 'Urbanist-Medium',
//     fontSize: 17,
//     fontWeight: 500,
//     letterSpacing: 1,
//     opacity: 0.9,
//   },
// });

// export default SaveButton;

import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BlurView } from '@react-native-community/blur';

type SaveButtonProps = {
  onPress: () => void;
  title?: string;
  disabled?: boolean;
};

const SaveButton = ({
  onPress,
  title = 'Click',
  disabled = false,
}: SaveButtonProps) => {
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
      style={[
        styles.buttonContainer,
        disabled && styles.disabledButton,
      ]}
    >
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={2}
        pointerEvents="none"
        reducedTransparencyFallbackColor="transparent"
      />

      <Text
        allowFontScaling={false}
        style={[
          styles.buttonText,
          disabled && styles.disabledText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '93%',
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
    bottom: Platform.OS === 'ios' ? 35 : 20,
  },

  disabledButton: {
    opacity: 1,
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

  disabledText: {
    opacity:0.48,
  },
});

export default SaveButton;
