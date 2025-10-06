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
  duration = 2500,
}) => {
  const progress = useRef(new Animated.Value(1)).current;

  const colors: Record<string, string> = {
    success: "rgba(34, 139, 34, 0.9)",
    error: "rgba(255, 102, 102, 0.9)",
    info: "rgba(96, 189, 255, 0.9)",
  };

  const bgColor = "rgba(0,0,0,0.85)";
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
    <View style={[styles.toastWrapper, { backgroundColor: bgColor }]}>
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
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    fontSize: 16,
    fontWeight: "500",
  },
  progressBarContainer: {
    height: 3,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginTop: 6,
    overflow: "hidden",
  },
  progressBar: {
    height: 3,
    borderRadius: 2,
  },
});

export default CustomToast;
