import { BlurView } from '@react-native-community/blur';
import LottieView from 'lottie-react-native';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_SPLASH = 'splash';
const SCREEN_SIGNUP = 'signup';
const SCREEN_LOGIN = 'login';
const SCREEN_LANGUAGE = 'language';

const SCREENS = [SCREEN_SPLASH, SCREEN_SIGNUP, SCREEN_LOGIN, SCREEN_LANGUAGE];

const SCREENS_KEY = [
  { key: SCREEN_SPLASH },
  { key: SCREEN_SIGNUP },
  { key: SCREEN_LOGIN },
  { key: SCREEN_LANGUAGE },
];

const SCREEN_KEYS = [
  SCREEN_SPLASH,
  SCREEN_SIGNUP,
  SCREEN_LOGIN,
  SCREEN_LANGUAGE,
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SinglePage_new = () => {
  const [currentTab, setCurrentTab] = useState(SCREEN_SPLASH);
  const textAndBackOpacity = useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const [textandBackIcon, setTextandBackIcon] = useState(false);

  const animRef = useRef<LottieView>(null);

  const onAnimationFinish = () => {
    console.log('Animation Finished');
  };

  return (
    <>
      <View style={[StyleSheet.absoluteFill]}>
        <LottieView
          source={require('../../../../assets/animations/backgroundanimation3.json')}
          autoPlay
          loop
          resizeMode="cover"
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <SafeAreaView>
        <View style={styles.continer}>
          <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => {
              // translateY.setValue(-100);
              // setSelected(null);
              // setCurrentScreen('language');
            }}
          >
            <Animated.View
              style={{
                opacity: textAndBackOpacity,
                // transform: [
                //   { translateY: textandBackIcon ? translateY : 0 },
                // ],
              }}
            >
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../../assets/images/back.png')}
                  style={{ height: 26, width: 26 }}
                />
              </View>
            </Animated.View>
          </TouchableOpacity>
            <View style={{ width: '72%',alignItems: 'center', justifyContent: 'center'}}>
              <Text style={styles.unizyText}>UniZy</Text>
          </View>
          </View>
          </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  continer: {
    paddingHorizontal: 16,
    height: SCREEN_HEIGHT-60,
  },
  unizyText: {
    fontFamily: 'MonumentExtended-Regular',
    fontSize: 24,
    color: 'white',
    fontWeight: '400',
    fontStyle: 'normal',
    textAlign: 'center',
  },
  backIconRow: {
    borderRadius: 40,
    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    height: 52,
    width: 52,
  

    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row'
  }
});

export default SinglePage_new;
