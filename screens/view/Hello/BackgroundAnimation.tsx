// import { BlurView } from "@react-native-community/blur";
// import LottieView from "lottie-react-native";
// import { ReactNode } from "react";
// import { StyleSheet, View } from "react-native";

import LottieView from "lottie-react-native"

// interface MyWrapper {
//   children?: ReactNode; // ✅ optional
// }

// const BackgroundAnimation: React.FC<MyWrapper> = ({ children }) => {
//   return (
//     <View style={styles.container}>
//       {/* Background Animation */}
//       <View style={StyleSheet.absoluteFill}>
//         <LottieView
//           source={require("../../../assets/animations/backgroundanimation3.json")}
//           autoPlay
//           loop
//           renderMode="AUTOMATIC"
//           resizeMode="cover"
//           style={styles.lottie}
//         />
//       </View>

//       {/* Blur overlay */}
//       <BlurView
//         style={StyleSheet.absoluteFill}
//         blurType="light"
//         blurAmount={55}
//         overlayColor="rgba(255,255,255,0.2)" // ✅ Android safe
//         reducedTransparencyFallbackColor="white"
//       />

//       {/* Foreground content */}
//       <View style={styles.content}>{children}</View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1, // 🔑 ensures full screen
//     backgroundColor: "transparent",
   
//   },
//   lottie: {
//     flex: 1,
//     backgroundColor: "transparent",
//   },
//   content: {
//     flex: 1,
//   },
// });

// export default BackgroundAnimation;
import React from 'react';

import { View, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';

const BackgroundAnimation = () => {
  return (
    <View style={[StyleSheet.absoluteFill,{opacity: 0.4}]}>
      <LottieView
        source={require("../../../assets/animations/backgroundanimation3.json")}
        autoPlay
        loop
        resizeMode="cover"
        style={StyleSheet.absoluteFillObject}
      />
      {/* Blur Overlay */}
      <BlurView
        style={[StyleSheet.absoluteFill]}
        blurType="light"   // "light", "dark", "xlight"
        blurAmount={30}    // adjust intensity
        
      />
      {/* <View style={[StyleSheet.absoluteFillObject,{opacity: 0.1, backgroundColor: 'rgba(255, 255, 255, 0.02)' }]}></View> */}
    </View>
  );
};

export default BackgroundAnimation;
