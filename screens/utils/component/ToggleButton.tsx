import React, { useState, useEffect } from "react";
import { TouchableOpacity, Animated, StyleSheet } from "react-native";
 
interface ToggleButtonProps {
  value: boolean;                              
  onValueChange: (value: boolean) => void;     
}
 
// const ToggleButton: React.FC<ToggleButtonProps> = ({ value, onValueChange }) => {
//   const [animValue] = useState(new Animated.Value(value ? 1 : 0));
 
//   useEffect(() => {
//     Animated.timing(animValue, {
//       toValue: value ? 1 : 0,
//       duration: 250,
//       useNativeDriver: false,
//     }).start();
//   }, [value]);
 
//   const toggleSwitch = () => {
//     onValueChange(!value);
//   };
 
//   const translateX = animValue.interpolate({
//     inputRange: [0, 1],
//     outputRange: [2, 32],
//   });

//   const darkWidth = animValue.interpolate({
//   inputRange: [0, 1],
//   outputRange: ['50%', '0%'], // dark part shrinks to zero when ON
// });
 
//   return (
  
//     <TouchableOpacity onPress={toggleSwitch} activeOpacity={1}>
//   <Animated.View style={[styles.container]}>
//     {/* Dark Part */}
//     <Animated.View
//       style={[
//         styles.darkPart,
//         { width: darkWidth }
//       ]}
//     />

//     {/* Circle */}
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

//   );
// };
 
// const styles = StyleSheet.create({
  
//    container: {
//     width: 60,
//     height: 30,
//     borderRadius: 30,
//     backgroundColor: '#00000029', 
//     overflow: 'hidden',           
//   },
//   darkPart: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   circle: {
//     position: 'absolute',
//     width: 26,
//     height: 26,
//     borderRadius: 13,
//     backgroundColor: '#38388bff', 
//     top: 2,
//     left: 2,
//   },
// });

const ToggleButton: React.FC<ToggleButtonProps> = ({ value, onValueChange }) => {
  const [animValue] = useState(new Animated.Value(value ? 1 : 0));

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

  // Circle position
  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    //outputRange: [2, 32], 
     outputRange: [2, 52 - 26 - 2], // left padding to right padding

  });

  // Circle color: interpolate from #38388bff -> white
  const circleColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#38388bff', '#ffffff'],
  });

  // Inner background color: transparent -> #38388bff
  const innerBgColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#00000029', '#38388bff'],
  });

  return (
    <TouchableOpacity onPress={toggleSwitch} activeOpacity={1}>
      <Animated.View style={[styles.container, { backgroundColor: innerBgColor }]}>
        {/* Circle */}
        <Animated.View
          style={[
            styles.circle,
            { transform: [{ translateX }], backgroundColor: circleColor },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 52,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    top: 2,
    left: 2,
    
  },
});

 
export default ToggleButton;
 