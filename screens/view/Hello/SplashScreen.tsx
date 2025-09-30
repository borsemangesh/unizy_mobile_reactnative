import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Platform,
  Animated,
} from "react-native";
import LottieView from "lottie-react-native";
import BackgroundAnimation_Android from "./BackgroundAnimation_Android";
import BackgroundAnimation from "./BackgroundAnimation";
import { Navigation } from "../Navigation";

const { width, height } = Dimensions.get("window");

type SplashScreenProps = {
  onFinish: () => void;
};

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // const fadeAnim = useRef(new Animated.Value(1)).current;

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     Animated.timing(fadeAnim, {
  //       toValue: 0,
  //       duration: 1000,
  //       useNativeDriver: true,
  //     }).start(() => {
  //       console.log("Splash finished");
  //       onFinish(); // trigger the callback to hide splash
  //     });
  //   }, 4100); 

  //   return () => clearTimeout(timeout);
  // }, [fadeAnim, onFinish]);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [animationDone, setAnimationDone] = useState(false);
  const onFinishCalled = useRef(false); // prevent double call

  const handleAnimationFinish = () => {
    setAnimationDone(true);
  };

  useEffect(() => {
    if (animationDone && !onFinishCalled.current) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        if (!onFinishCalled.current) {
          onFinishCalled.current = true;
          onFinish();
        }
      });
    }
  }, [animationDone, fadeAnim, onFinish]);

  return (
    <ImageBackground
      source={require("../../../assets/images/bganimationscreen.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {Platform.OS === "android" ? (
          <BackgroundAnimation_Android />
        ) : (
          <BackgroundAnimation />
        )}
     
          <Animated.View style={[styles.centerContent, { opacity: fadeAnim }]}>
          <LottieView
            source={require("../../../assets/animations/animation.json")}
            autoPlay
            loop={false}
            resizeMode="contain"
            style={{ width, height }}
            onAnimationFinish={handleAnimationFinish}
          />
        </Animated.View>
      </Animated.View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // full screen
    justifyContent: "center",
    alignItems: "center",

    
  },
  centerContent: {
    // flex: 1, // take full screen
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
    // height: '100%'
  },
});

export default SplashScreen;
