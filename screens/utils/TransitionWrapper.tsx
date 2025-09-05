import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

type Props = {
  children: React.ReactNode;
};

const TransitionWrapper: React.FC<Props> = ({ children }) => {
  const translateY = useRef(new Animated.Value(600)).current; // start off bottom
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      // forward navigation → animate from top
      translateY.setValue(-600);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    } else {
      // going back → animate out bottom
      Animated.timing(translateY, {
        toValue: 600,
        duration: 400,
        easing: Easing.in(Easing.exp),
        useNativeDriver: true,
      }).start();
    }
  }, [isFocused, translateY]);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default TransitionWrapper;
