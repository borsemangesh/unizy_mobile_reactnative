import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Platform,
} from "react-native";
import LottieView from "lottie-react-native";
import BackgroundAnimation_Android from "./BackgroundAnimation_Android";
import BackgroundAnimation from "./BackgroundAnimation";

const { width, height } = Dimensions.get("window");

type SplashScreenProps = {
  onFinish: () => void;
};

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {

  //Comment while run on IOS
  // useEffect(() => {
  //   const timer = setTimeout(onFinish, 6200);
  //   return () => clearTimeout(timer);
  // }, [onFinish]);

  return (
    <ImageBackground
      source={require("../../../assets/images/bganimationscreen.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={{flex: 1}}>

      {/* Background Layer */}
      {/* <View style={StyleSheet.absoluteFill}>
        {Platform.OS === "android" ? (
          <BackgroundAnimation_Android />
        ) : (
          // <BackgroundAnimation_Android>
          </BackgroundAnimation children={}/>
        )}
      </View> 

      {/* Foreground content */}
       {Platform.OS === 'android' ? (
        <BackgroundAnimation_Android />
      ) : (
        <BackgroundAnimation/>
      )} 
      <View style={styles.centerContent}>
        <LottieView
          source={require("../../../assets/animations/animation.json")}
          autoPlay
          loop={false}
          resizeMode="cover"
          style={{ width, height }}
          // onAnimationFinish={onFinish} //Comment while run on IOS
        />
      </View>
      
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // full screen
    
  },
  centerContent: {
    flex: 1, // take full screen
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SplashScreen;
