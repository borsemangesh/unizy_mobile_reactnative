import React from "react";
import { ImageBackground, Platform, StyleSheet, StatusBar, View } from "react-native";
import BackgroundAnimation from "../Hello/BackgroundAnimation";
import BackgroundAnimation_Android from "../Hello/BackgroundAnimation_Android";

const Temp = () => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/images/bganimationscreen.png")}
        style={styles.background}
        resizeMode="cover"
      >
        {Platform.OS === "android" ? (
          <BackgroundAnimation_Android />
        ) : (
          <BackgroundAnimation />
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

export default Temp;
