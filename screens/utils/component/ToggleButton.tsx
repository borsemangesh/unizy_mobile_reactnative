import React, { useState } from "react";
import { View, TouchableOpacity, Animated, StyleSheet } from "react-native";

const ToggleButton = () => {
  const [isOn, setIsOn] = useState(false);
  const [animValue] = useState(new Animated.Value(0));

  const toggleSwitch = () => {
    setIsOn(!isOn);

    Animated.timing(animValue, {
      toValue: isOn ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };


  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 32], 
  });

  const backgroundColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#1a237e", "#0d47a1"],
  });

  return (
    <TouchableOpacity onPress={toggleSwitch} activeOpacity={1}>
      <Animated.View style={[styles.container, { backgroundColor }]}>
        <Animated.View
          style={[
            styles.circle,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 30,
    borderRadius: 30,
    justifyContent: "center",
    padding: 2,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#5c6bc0", 
  },
});

export default ToggleButton;
