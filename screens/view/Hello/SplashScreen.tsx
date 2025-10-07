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
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

type SplashScreenProps = {
  navigation: any;
  // onFinish: () => void;
};

const SplashScreen = ({ navigation }: SplashScreenProps) => {
  

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [animationDone, setAnimationDone] = useState(false);
  // const onFinishCalled = useRef(false); 
  const [initialRoute, setInitialRoute] = useState<null | string>(null);

  const handleAnimationFinish = async () => {
  try {
    const flag = await AsyncStorage.getItem('ISLOGIN');
    if (flag === 'true') {
      navigation.replace('Dashboard'); 
    } else {
      navigation.replace('SinglePage');
    }
  } catch (error) {
    console.log('Error reading login status:', error);
    navigation.replace('SinglePage');
  }
};
  
  return (
    <ImageBackground
      source={require("../../../assets/images/bganimationscreen.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <Animated.View style={styles.container}>
        {Platform.OS === "android" ? (
          <BackgroundAnimation_Android />
        ) : (
          <BackgroundAnimation />
        )}
          
          <Animated.View style={[styles.centerContent, { opacity: fadeAnim }]}>
          <LottieView
            source={require("../../../assets/animations/animation_new.json")}
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
