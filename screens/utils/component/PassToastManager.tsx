import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import CustomToast from "./CustomToast";
import PassToast from "./PassToast";

let passshowToastFunc: ((text: string, type?: "success" | "error" | "info") => void) | null = null;

export const PassToastContainer: React.FC = () => {

  const [toasts, setToasts] = useState<{
    id: number;
    text: string;
    type?: "success" | "error" | "info";
  }[]>([]);
  
  const [isToastVisible, setIsToastVisible] = useState(false);

  passshowToastFunc = (text: string, type?: "success" | "error" | "info") => {
    if (isToastVisible) {
      return;
    }

    const id = Date.now();
    setIsToastVisible(true);
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    setIsToastVisible(false); 
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <PassToast
          key={toast.id}
          text={toast.text}
          type={toast.type}
          onHide={() => removeToast(toast.id)}
        />
      ))}
    </View>
  );
};

export const passshowToast = (text: string, type?: "success" | "error" | "info") => {
  passshowToastFunc?.(text, type);
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
