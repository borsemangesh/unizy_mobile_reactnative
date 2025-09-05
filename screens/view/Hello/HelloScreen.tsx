
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { Styles } from './HelloScreen.style'
import { useFocusEffect } from '@react-navigation/native';


type HelloScreenProps = {
  navigation: any;
};

const greetings = [
  'Hello', // English
  '你好', // Chinese
  'Hola', // Spanish
  'Bonjour', // French
  'Hallo', // German
  'Ciao', // Italian
  'Olá', // Portuguese
  'Привет', // Russian
  'مرحبا', // Arabic
  'こんにちは', // Japanese
  '안녕하세요', // Korean
  'नमस्ते', // Hindi
  'สวัสดี', // Thai
  'Merhaba', // Turkish
  'Cześć', // Polish
  'السلام علیکم', // Urdu
  'হ্যালো', // Bengali
  'Shalom', // Hebrew
  'Halo', // Malay
];


 const HelloScreen = ({ navigation }: HelloScreenProps) => {
  const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0);
 
  const unizyTranslateY = React.useRef(new Animated.Value(-100)).current;
 
  const greetingOpacity = React.useRef(new Animated.Value(0)).current;
  const greetingScale = React.useRef(new Animated.Value(0.8)).current;
  const slideUp = React.useRef(new Animated.Value(200)).current;

 
  const animateGreeting = () => {
    greetingOpacity.setValue(0);
    greetingScale.setValue(0.9);
 
    Animated.sequence([
      Animated.parallel([
        Animated.timing(greetingOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(greetingScale, {
          toValue: 1,
          friction: 4,
          tension: 1,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(greetingOpacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(greetingScale, {
          toValue: 0.1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };
 
  useFocusEffect(
    React.useCallback(() => {
      // etCurrentGreetingIndex(0);
 
      animateGreeting();
 
      const interval = setInterval(() => {
        setCurrentGreetingIndex(prevIndex =>
          prevIndex + 1 < greetings.length ? prevIndex + 1 : 0
        );

        animateGreeting();
      }, 2000);
 
      return () => clearInterval(interval);
    }, [])
  );

    useFocusEffect(
    React.useCallback(() => {
 
      Animated.timing(unizyTranslateY, {
        toValue: 0,
        duration: 1200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
 
      Animated.timing(slideUp, {
    toValue: 0, 
    duration: 1000,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  }).start();

      return () => clearInterval(0);
    }, [])
  );
 
 
 
  return (
      <ImageBackground
        source={require('../../../assets/images/BGAnimationScreen.png')}
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
 
          <Animated.View  style={[
              Styles.linearGradient,
              { transform: [{ translateY: slideUp }] },
            ]}>
        
            <TouchableOpacity onPress={() => navigation.navigate('LanguagePopup')}>
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
  );
};

export default HelloScreen;