import React, { useState, useEffect } from "react";
import { TouchableOpacity, Animated, StyleSheet } from "react-native";
 
interface ToggleButtonProps {
  value: boolean;                              // current state
  onValueChange: (value: boolean) => void;     // callback when toggled
}
 
const ToggleButton: React.FC<ToggleButtonProps> = ({ value, onValueChange }) => {
  const [animValue] = useState(new Animated.Value(value ? 1 : 0));
 
  // Animate whenever `value` changes
  useEffect(() => {
    Animated.timing(animValue, {
      toValue: value ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [value]);
 
  const toggleSwitch = () => {
    onValueChange(!value);
  };
 
  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 32],
  });
 
  // const backgroundColor = animValue.interpolate({
  //   inputRange: [0, 1],
  //   outputRange: ["#00000029", "#e8eef7ff"],
  // });
  const darkWidth = animValue.interpolate({
  inputRange: [0, 1],
  outputRange: ['50%', '0%'], // dark part shrinks to zero when ON
});
 
  return (
    // <TouchableOpacity onPress={toggleSwitch} activeOpacity={1}>
    //   <Animated.View style={[styles.container, { backgroundColor }]}>
    //     <Animated.View
    //       style={[
    //         styles.circle,
    //         {
    //           transform: [{ translateX }],
    //         },
    //       ]}
    //     />
    //   </Animated.View>
    // </TouchableOpacity>

    <TouchableOpacity onPress={toggleSwitch} activeOpacity={1}>
  <Animated.View style={[styles.container]}>
    {/* Dark Part */}
    <Animated.View
      style={[
        styles.darkPart,
        { width: darkWidth }
      ]}
    />

    {/* Circle */}
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
  // container: {
  //   width: 60,
  //   height: 30,
  //   borderRadius: 30,
  //   padding: 2,
  //   justifyContent: "center",
  // },
  // circle: {
  //   width: 26,
  //   height: 26,
  //   borderRadius: 13,
  //   backgroundColor: "#fff",
  // },


   container: {
    width: 60,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#00000029', // base color (light part)
    overflow: 'hidden',           // so dark part stays inside
  },
  darkPart: {
    ...StyleSheet.absoluteFillObject,
    //backgroundColor: '#00000029',  // dark part
  },
  circle: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white', // circle color
    top: 2,
    left: 2,
  },
});
 
export default ToggleButton;
 