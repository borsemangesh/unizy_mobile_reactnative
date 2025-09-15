import { BlurView } from "@react-native-community/blur";
import LottieView from "lottie-react-native";
import { ReactNode } from "react";
import {  Platform, StyleSheet, View  } from "react-native";


interface Mywarpter{
  children: ReactNode
}

const BackgroundAnimation:React.FC<Mywarpter> = ({ children }) =>
 {
  return (

    <View style={{flex:1,height: '100%',}}>
    {/* Background Animation */}
    <View style={{position:'absolute', top:0, left:0, right:0, bottom:0,height: '100%',width:'100%'}}>
      {/* <LottieView
        source={require('../../../assets/animations/BackgroundAnimation3.json')}
        autoPlay
        renderMode="AUTOMATIC"
        resizeMode='cover'
        loop
        style={{flex:1, backgroundColor:'transparent'}}
      /> */}
    </View>
   
    {/* Blur & color overlay above animation */}
    {/* <BlurView
      style={[StyleSheet.absoluteFill]}
      blurType="dark"
      blurAmount={55}
      
      reducedTransparencyFallbackColor="white"
    /> */}
    <View style={[StyleSheet.absoluteFill, ]} />
   
    {/* Foreground content */}
    <View style={{flex:1}}>
      {children}
    </View>
  </View>
     
  );
};



export default BackgroundAnimation;