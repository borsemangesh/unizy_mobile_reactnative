import LottieView from "lottie-react-native";
import {  StyleSheet  } from "react-native";



const BackgroundAnimation = () => {
  return (
     <LottieView
      source={require("../../../assets/animations/BGAnimation.json")}
      autoPlay
      loop
      resizeMode="cover"
      style={StyleSheet.absoluteFillObject} 
    />
  );
};

export default BackgroundAnimation;