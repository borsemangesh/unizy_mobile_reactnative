
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

   const translateY = React.useRef(new Animated.Value(-100)).current;
   const slideUp = React.useRef(new Animated.Value(200)).current;

  useFocusEffect(
    React.useCallback(() => {
      // reset to first greeting when screen is focused
      setCurrentGreetingIndex(0);

      const interval = setInterval(() => {
        setCurrentGreetingIndex((prevIndex) =>
          prevIndex + 1 < greetings.length ? prevIndex + 1 : 0
        );
      }, 3000);

      Animated.timing(translateY, {
        toValue: 0,
        duration: 1200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();


      Animated.timing(slideUp, {
    toValue: 0, // final position
    duration: 1000,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  }).start();
      return () => clearInterval(interval); // stop when screen unfocused
    }, [])
  );

  return (
    <EdgeToEdgeScreen>
      <ImageBackground
        source={require('../../../assets/images/BGAnimationScreen.png')}
        style={{ flex: 1, width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        <View style={Styles.ScreenLayout}>
          {/* <Text style={Styles.unizyText}>UniZy</Text> */}
          <Animated.Text style={[Styles.unizyText, { transform: [{ translateY }] }]}>
            UniZy
          </Animated.Text>
          <Text style={Styles.hellowText}>{greetings[currentGreetingIndex]}</Text>

          <Animated.View style={[Styles.linearGradient, { transform: [{ translateY: slideUp }] }]}
>
            <BlurView blurType="light" blurAmount={15} />
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.11)', 'rgba(255, 255, 255, 0.04)']}
            />

            <TouchableOpacity onPress={() => navigation.navigate('LanguagePopup')}>
              <View style={Styles.SelectLanguageContainer}>
                <Image source={require('../../../assets/images/language.png')} style={{ width: 18, height: 18 }} />

                <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={Styles.selectlanguageText}>Select Language</Text>
                  <Image source={require('../../../assets/images/right.png')} style={{ width: 24, height: 24 }} />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View >
        </View>
      </ImageBackground>
    </EdgeToEdgeScreen>
  );
};

export default HelloScreen;