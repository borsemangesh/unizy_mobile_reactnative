// import React, { useState } from "react";
// import { View, TouchableOpacity, Animated, StyleSheet } from "react-native";

// const ToggleButton = () => {
//   const [isOn, setIsOn] = useState(false);
//   const [animValue] = useState(new Animated.Value(0));

//   const toggleSwitch = () => {
//     setIsOn(!isOn);

//     Animated.timing(animValue, {
//       toValue: isOn ? 0 : 1,
//       duration: 250,
//       useNativeDriver: false,
//     }).start();
//   };


//   const translateX = animValue.interpolate({
//     inputRange: [0, 1],
//     outputRange: [2, 32], 
//   });

//   const backgroundColor = animValue.interpolate({
//     inputRange: [0, 1],
//     outputRange: ["#1a237e", "#0d47a1"],
//   });

//   return (
//     <TouchableOpacity onPress={toggleSwitch} activeOpacity={1}>
//       <Animated.View style={[styles.container, { backgroundColor }]}>
//         <Animated.View
//           style={[
//             styles.circle,
//             {
//               transform: [{ translateX }],
//             },
//           ]}
//         />
//       </Animated.View>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     width: 60,
//     height: 30,
//     borderRadius: 30,
//     justifyContent: "center",
//     padding: 2,
//   },
//   circle: {
//     width: 26,
//     height: 26,
//     borderRadius: 13,
//     backgroundColor: "#5c6bc0", 
//   },
// });

// export default ToggleButton;

// utils/component/ToggleButton.js


// utils/component/ToggleButton.tsx
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
    padding: 2,
    justifyContent: "center",
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
  },
});

export default ToggleButton;

