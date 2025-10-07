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
  duration = 3500,
}) => {
  const progress = useRef(new Animated.Value(1)).current;

  const colors: Record<string, string> = {
    success: "rgba(34, 139, 34, 0.9)",
    error: "rgba(255, 102, 102, 0.9)",
    info: "rgba(96, 189, 255, 0.9)",
  };

  const bgColor = "rgba(0, 0, 0, 0.81)";
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "rgba(0, 0, 0, 0.9)",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    alignSelf: "center",
    
    position: "relative", // ensures absolute child aligns correctly
  },
  toastText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8, // ensures text doesn’t touch progress bar
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 1,
    left: 5,
    right:5,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
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