import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const CircleButton = () => {
  return (
    <View style={styles.container}>
      <View style={styles.circleWrapper}>
        {/* Outer conic-like overlay (approximation) */}
        <LinearGradient
          colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)', 'transparent']}
          start={{ x: 0.2, y: 0.2 }}
          end={{ x: 0.8, y: 0.8 }}
          style={[styles.circle, styles.outerGlow]}
        />
        {/* Main button background */}
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.2)',
            'rgba(255,255,255,0.1)',
            'rgba(255,255,255,0.05)',
          ]}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.8, y: 0.9 }}
          style={[styles.circle, styles.innerCircle]}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M14 17L9 12L14 7"
              stroke="white"
              strokeOpacity={0.88}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    //backgroundColor: '#010DA4',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleWrapper: {
    position: 'relative',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  innerCircle: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    //elevation: 4,
  },
  outerGlow: {
    zIndex: 1,
    opacity: 1,
    transform: [{ scale: 1 }],
  },
});

export default CircleButton;
