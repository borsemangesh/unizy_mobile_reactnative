import React, { useEffect } from 'react';
import { View, StyleSheet,Dimensions, ImageBackground } from 'react-native';
import LottieView from 'lottie-react-native';

type SplashScreenProps = {
  onFinish: () => void;
};
const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    // fallback timer in case onAnimationFinish doesn't trigger
    const timer = setTimeout(() => {
      onFinish();
    }, 3300);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <ImageBackground
      source={require('../../../assets/images/BGAnimationScreen.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.centerContent}>
        <LottieView
          source={require('../../../assets/animations/Animation.json')}
          autoPlay
          loop={false}
          resizeMode="cover"  
          style={{ width, height }}  
        //   style={{ width: 360, height: 800 }}
          onAnimationFinish={onFinish}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // centers child
    alignItems: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default SplashScreen;
