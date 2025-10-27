import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import CustomToast from "./CustomToast";

// Global reference to showToast function
let showToastFunc: ((text: string, type?: "success" | "error" | "info") => void) | null = null;

export const NewCustomToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<{
    id: number;
    text: string;
    type?: "success" | "error" | "info";
  }[]>([]);
  const [isToastVisible, setIsToastVisible] = useState(false); // Track if a toast is currently active

  // Global showToast function
  showToastFunc = (text: string, type?: "success" | "error" | "info") => {
    if (isToastVisible) {
      // If a toast is already visible, don't add a new one
      return;
    }

    const id = Date.now();
    setIsToastVisible(true); // Mark the toast as visible
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  // Function to remove toast and reset visibility flag
  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    setIsToastVisible(false); // Reset visibility flag when toast is removed
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <CustomToast
          key={toast.id}
          text={toast.text}
          type={toast.type}
          onHide={() => removeToast(toast.id)}
        />
      ))}
    </View>
  );
};

// Global function to trigger toast
export const showToast = (text: string, type?: "success" | "error" | "info") => {
  showToastFunc?.(text, type);
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 40,
    zIndex: 9999,
    width: "100%",
    pointerEvents: "box-none",
  },
});
