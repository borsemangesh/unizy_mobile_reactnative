import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import NewCustomToast from "./NewCustomToast";

let shortshowToastFunc: ((text: string, type?: "success" | "error" | "info") => void) | null = null;

export const ShortCustomToastContainer: React.FC = () => {

  const [toasts, setToasts] = useState<{
    id: number;
    text: string;
    type?: "success" | "error" | "info";
  }[]>([]);
  
  const [isToastVisible, setIsToastVisible] = useState(false);

  shortshowToastFunc = (text: string, type?: "success" | "error" | "info") => {
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
        <NewCustomToast
          key={toast.id}
          text={toast.text}
          type={toast.type}
          onHide={() => removeToast(toast.id)}
        />
      ))}
    </View>
  );
};

export const shortshowToast = (text: string, type?: "success" | "error" | "info") => {
  shortshowToastFunc?.(text, type);
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
