import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Splash: undefined;
  HelloScreen: undefined;
  // Add other screens here if needed
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const { width, height } = Dimensions.get('window');

type SingleScreenProps = {
  navigation: any;
};

const SplashScreen = ({ onFinish }: { onFinish: () => void })  => {
  // const navigation = useNavigation<NavigationProp>();

  // const handleFinish = () => {
  //   navigation.navigate('SinglePage');
  // };

  useEffect(() => {
    const timer = setTimeout(onFinish, 4200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground
      source={require('../../../assets/images/bganimationscreen.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.centerContent}>
        <LottieView
          source={require('../../../assets/animations/animation.json')}
          autoPlay
          loop={false}
          resizeMode="cover"
          style={{ width, height }}
          onAnimationFinish={onFinish}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default SplashScreen;

//added for ios



// import React, { useEffect } from 'react';
// import { View, StyleSheet,Dimensions, ImageBackground } from 'react-native';
// import LottieView from 'lottie-react-native';
// import BackgroundAnimation from './BackgroundAnimation';


// type SplashScreenProps = {
//   onFinish: () => void;
// };
// const { width, height } = Dimensions.get('window');

// const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
//   // useEffect(() => {
//   //   const timer = setTimeout(() => {
//   //     onFinish();
//   //   }, 4300);
//   //   return () => clearTimeout(timer);
//   // }, [onFinish]);

//   return (
//     <ImageBackground
//       source={require('../../../assets/images/BGAnimationScreen.png')}
//       style={styles.container}
//       resizeMode="cover"
//     >
//       <View style={styles.centerContent}>
//         {/* <BackgroundAnimation /> */}
//         <LottieView
//           source={require('../../../assets/animations/Animation.json')}
//           autoPlay
//           loop={false}
//           resizeMode="cover"  
//           style={{ width, height }}  
//           onAnimationFinish={onFinish}
//         />
//       </View>
//    </ImageBackground> 
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center', 
//     alignItems: 'center',
//   },
//   centerContent: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     flex: 1,
//   },
// });

// export default SplashScreen;
