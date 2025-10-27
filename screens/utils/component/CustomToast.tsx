import { BlurView } from "@react-native-community/blur";
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";

interface CustomToastProps {
  text: string;
  type?: "success" | "error" | "info";
  onHide?: () => void;
  duration?: number;
}

const CustomToast: React.FC<CustomToastProps> = ({
  text,
  type = "info",
  onHide,
  duration = 5000,
}) => {
  const progress = useRef(new Animated.Value(1)).current;

  const colors: Record<string, string> = {
    success: "rgba(34, 139, 34, 0.9)",
    error: "rgba(255, 102, 102, 0.9)",
    info: "rgba(96, 189, 255, 0.9)",
  };

  const bgColor = "rgba(44, 44, 44, 0.02)";
  const textColor = colors[type] ?? colors.info;

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 0,
      duration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => {
      onHide?.();
    });
  }, []);

  return (
    <View style={[StyleSheet.absoluteFillObject,styles.toastWrapper, { backgroundColor: bgColor }]}>
      <BlurView 
       style={[StyleSheet.absoluteFillObject,{ backgroundColor: bgColor,borderRadius: 16 }]}
        blurType="dark"
        blurAmount={100}
        // REMOVE fallback color if you want absolutely NO background color
        reducedTransparencyFallbackColor="rgba(253, 253, 253, 0.1)"
      />
      <Text style={[styles.toastText, { color: textColor }]}>{text}</Text>
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            { backgroundColor: textColor, width: progressWidth },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 16,
    backgroundColor:'rgba(44, 44, 44, 0.02)',
    marginVertical: 8,
    elevation: 5,
    alignSelf: "center",
    position: "relative", // ensures absolute child aligns correctly
    // opacity: 0.1

  },
  toastText: {
    fontSize: 16,
    fontWeight: "500",
    // marginBottom: 3, // ensures text doesn’t touch progress bar
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 1,
    left: 5,
    right:5,
    height: 3,
    backgroundColor: "rgba(44, 44, 44, 0.02)",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",
    alignSelf: 'center',
    alignContent:'center',
    width: 'auto',
    maxWidth: 'auto',
  },
  progressBar: {
    height: 4,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    width: 'auto',
    maxWidth: 'auto',
  },
});

export default CustomToast;