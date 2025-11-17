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

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[
        styles.buttonContainer,
        { bottom: insets.bottom + 10 } 
      ]}>
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
    //width: "100%",
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
    //bottom: (Platform.OS === 'ios'? 16 : 10),
    left: 16,
    right: 16,
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

// import React from 'react';
// import { StyleSheet, Text, TouchableOpacity } from 'react-native';
// import { BlurView } from '@react-native-community/blur';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';



// const Button = ({ onPress, title = 'Click' }: ButtonProps) => {
//   const insets = useSafeAreaInsets();

//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       activeOpacity={0.7}
//       style={[
//         styles.buttonContainer,
//         { bottom: insets.bottom + 10 } // 👈 Always correct
//       ]}
//     >
//       <BlurView
//         style={StyleSheet.absoluteFill}
//         blurType="light"
//         blurAmount={12}
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
//     height: 48,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 100,
//     overflow: 'hidden',
//     backgroundColor: 'rgba(255,255,255,0.12)',
//     borderWidth: 0.5,
//     borderColor: '#ffffff2c',
//     left: 16,
//     right: 16,
//     position: 'absolute',
//     alignSelf: 'center',
//   },
//   buttonText: {
//     color: '#002050',
//     textAlign: 'center',
//     fontFamily: 'Urbanist-Medium',
//     fontSize: 17,
//     fontWeight: 500,
//     letterSpacing: 1,
//     opacity: 0.9,
//   },
// });

// export default Button;

