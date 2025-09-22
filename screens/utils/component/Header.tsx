import React from "react"
import { Platform, StyleSheet, Text, View } from "react-native"
import { BlurView } from "@react-native-community/blur"
import LinearGradient from "react-native-linear-gradient"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const Header: React.FC = () => {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      {/* Background layer */}
      {Platform.OS === "ios" ? (
        // iOS: real blur
        <BlurView
          blurType="light" // or "dark" for stronger contrast
          blurAmount={20}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        // Android: gradient fallback
        <LinearGradient
          colors={["rgba(0,30,100,0.7)", "rgba(0,50,150,0.7)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Foreground content */}
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>List Product</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 90, // base height (extra space added via insets)
    zIndex: 10,
    overflow: "hidden",
  },
  headerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
})

export default Header
