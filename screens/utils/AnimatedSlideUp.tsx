
import React, { useEffect, useRef, ReactNode } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';

interface AnimatedSlideUpProps {
  children: ReactNode;
  duration?: number;
  offset?: number;
  style?: ViewStyle;
}

const AnimatedSlideUp: React.FC<AnimatedSlideUpProps> = ({
  children,
  duration = 900, // faster overall
  offset = 1000,
  style,
}) => {
  const translateY = useRef(new Animated.Value(offset)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        useNativeDriver: true,
        // smoother start, faster middle, slow end
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration * 0.6, // fade-in slightly faster
        useNativeDriver: true,
      }),
    ]).start();
  }, [duration, offset, opacity, translateY]);

  return (
    <Animated.View
      style={[
        { transform: [{ translateY }], opacity },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedSlideUp;