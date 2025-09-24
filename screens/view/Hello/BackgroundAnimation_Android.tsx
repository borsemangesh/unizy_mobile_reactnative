import LottieView from "lottie-react-native";
import {  StyleSheet  } from "react-native";
 
 
 
const BackgroundAnimation_Android = () => {
  return (
     <LottieView
      source={require("../../../assets/animations/backgroundanimation3.json")}
      autoPlay
      loop
      resizeMode="cover"
      //style={StyleSheet.absoluteFillObject}
       style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '107%', 
      }}
    />
  );
};
 
export default BackgroundAnimation_Android;