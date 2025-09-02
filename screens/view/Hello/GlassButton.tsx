// import React from 'react';
// import { TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import { BlurView } from '@react-native-community/blur';

// interface GlassButtonProps {
//   title?: string;
//   onPress: () => void;
//   style?: ViewStyle;
// }

// const GlassButton: React.FC<GlassButtonProps> = ({ title = 'Go Back', onPress, style }) => {
//   return (
//     <TouchableOpacity onPress={onPress} style={[styles.wrapper, style]}>
//       {/* Blur background */}
//       <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={10} />

//       {/* Gradient overlay */}
//       <LinearGradient
//         colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={styles.gradient}
//       >
//         <Text style={styles.text}>{title}</Text>
//       </LinearGradient>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   wrapper: {
//     borderRadius: 16,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   gradient: {
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   text: {
//     color: '#002050',
//     fontSize: 16,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
// });

// export default GlassButton;


import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';

interface GlassButtonProps {
  title?: string;
  onPress: () => void;
  style?: ViewStyle;
}

const GlassButton: React.FC<GlassButtonProps> = ({ title = 'Go Back', onPress, style }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.wrapper, style]}>
      {/* Blur background */}
      <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={10} />

      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.7)', 'rgba(255,255,255,0.56)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: 'auto',
    height: 48,
    borderRadius: 100,
    overflow: 'hidden',
    position: 'relative',
  },
  gradient: {
    flex: 1,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 20,
    paddingRight: 20,
    
  },
  text: {
    fontFamily: 'Urbanist',
    fontWeight: '500', // Medium
    fontSize: 17,
    letterSpacing: 1,
    color: '#002050',
    textAlign: 'center',
  },
});

export default GlassButton;
