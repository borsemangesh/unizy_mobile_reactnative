
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
 import MyIcon from '../../utils/MyIcon';
 import EdgeToEdgeScreen from './EdgeToEdgeScreen';
import { Styles } from './HelloScreen.style'
import { useFocusEffect } from '@react-navigation/native';


type HelloScreenProps = {
  navigation: any;
};

const greetings = [
  'Hello',
  '你好',
  'Hola',
  'Bonjour',
  'Hallo',
  'Ciao',
  'Olá',
  'Привет',
  'مرحبا',
  'こんにちは',
  '안녕하세요',
  'नमस्ते',
  'สวัสดี',
  'Merhaba',
  'Cześć',
  'السلام علیکم',
  'হ্যালো',
  'Shalom', 
  'Halo',
];

 const HelloScreen = ({ navigation }: HelloScreenProps) => {
  const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0);
 
  const unizyTranslateY = React.useRef(new Animated.Value(-100)).current;
 
  const greetingOpacity = React.useRef(new Animated.Value(0)).current;
  const greetingScale = React.useRef(new Animated.Value(0.8)).current;
 
  const animateGreeting = () => {
    greetingOpacity.setValue(0);
    greetingScale.setValue(0.8);
 
    Animated.sequence([
      Animated.parallel([
        Animated.timing(greetingOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(greetingScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(greetingOpacity, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(greetingScale, {
          toValue: 0.8,
          duration: 600,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };
 
  useFocusEffect(
    React.useCallback(() => {
      Animated.timing(unizyTranslateY, {
        toValue: 0,
        duration: 1200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
 
      animateGreeting();
 
      const interval = setInterval(() => {
        setCurrentGreetingIndex(prevIndex =>
          prevIndex + 1 < greetings.length ? prevIndex + 1 : 0
        );
        animateGreeting();
      }, 1800);
 
      return () => clearInterval(interval);
    }, [])
  );

  const clickLanguageListner = () =>{
    if (Platform.OS === 'ios') {
      navigation.replace('LanguagePopup');
    } else {
      navigation.navigate('LanguagePopup');
    }
  }
 
  return (
    // <EdgeToEdgeScreen>
      <ImageBackground
        source={require('../../../assets/images/bganimationscreen.png')}
        style={{ flex: 1, width: '100%', height: '100%'}}
        resizeMode="cover"
      >
        
        <View style={Styles.ScreenLayout}>
          <Animated.Text
            style={[
              Styles.unizyText,
              { transform: [{ translateY: unizyTranslateY }] },
            ]}
          >
            UniZy
          </Animated.Text>
 
          <Animated.Text
            style={[
              Styles.hellowText,
              {
                opacity: greetingOpacity,
                transform: [{ scale: greetingScale }],
              },
            ]}
          >
            {greetings[currentGreetingIndex]}
          </Animated.Text>
 
          <Animated.View style={Styles.linearGradient}>
            {/* <BlurView blurType="light" blurAmount={15} />
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.11)', 'rgba(255, 255, 255, 0.04)']}
            /> */}
            <TouchableOpacity onPress={()=>clickLanguageListner()}>
              <View style={Styles.SelectLanguageContainer}>
                <Image
                  source={require('../../../assets/images/language.png')}
                  style={{ width: 18, height: 18 }}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={Styles.selectlanguageText}>Select Language</Text>
                  <Image
                    source={require('../../../assets/images/right.png')}
                    style={{ width: 24, height: 24 }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ImageBackground>
    // </EdgeToEdgeScreen>
  );
};

export default HelloScreen;