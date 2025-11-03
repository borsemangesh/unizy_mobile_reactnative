import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { BlurView } from "@react-native-community/blur";
import LinearGradient from "react-native-linear-gradient";

const { width } = Dimensions.get("window");

const LiquidGlassCard = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(shimmerAnim, {
//           toValue: 1,
//           duration: 4000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(shimmerAnim, {
//           toValue: 0,
//           duration: 4000,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, [shimmerAnim]);

//   // Shimmer wave movement
//   const translateX = shimmerAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [-width, width],
//   });

  return (
    <View style={styles.container}>
      <BlurView  blurType="light" blurAmount={12} />

      {/* Gradient overlay */}
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.94)", "rgba(255, 255, 255, 1)"]}
        
      />
<Text style={styles.text}>💧 Liquid Glass Effect</Text>
      {/* Shimmer wave */}
      {/* <Animated.View
        style={[
          styles.wave,
          {
            transform: [{ translateX }],
          },
        ]}
      /> */}

      {/* Content */}
      {/* <View style={styles.content}>
        
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "radial-gradient(189.13% 141.42% at 0% 0%, rgba(0, 0, 0, 0.08) 0%, rgba(255, 255, 255, 0.75) 50%, rgba(0, 0, 0, 0.81) 100%)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    margin: 20,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  wave: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.15)",
    opacity: 0.5,
  },
});

export default LiquidGlassCard;
