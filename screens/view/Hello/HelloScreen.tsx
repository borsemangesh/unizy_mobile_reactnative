// import React from 'react';
// import {
//   View,
//   Text,
//   ImageBackground,
//   TouchableOpacity,
//   StatusBar,
// } from 'react-native';
// import { Styles } from './HelloScreen.style'
// import MyIcon from '../../utils/MyIcon';
// import EdgeToEdgeScreen from './EdgeToEdgeScreen';
// import { BlurView } from '@react-native-community/blur';
// import LinearGradient from 'react-native-linear-gradient';


// type HelloScreenProps = {
//   navigation: any;
// };

// const HelloScreen = ({ navigation }: HelloScreenProps) => {
//   return (
//     <EdgeToEdgeScreen>
//       <ImageBackground
//         source={require('../../../assets/images/BGAnimationScreen.png')}
//         style={{flex: 1, width: '100%', height: '100%'}}
//         resizeMode='cover'
//       >
        
//         <View style={Styles.ScreenLayout}>
//           <Text style={Styles.unizyText}>UniZy</Text>
//           <Text style={Styles.hellowText}>hello</Text>
          
//           <View style={Styles.linearGradient}>
//             <BlurView blurType="light" blurAmount={15} />

//         <LinearGradient
//           colors={['rgba(255, 255, 255, 0.11)', 'rgba(255, 255, 255, 0.04)']}
//         />
//             <TouchableOpacity
//               onPress={() => navigation.navigate('LanguagePopup')}
//             >
//               <View style={[Styles.SelectLanguageContainer]}>
//                 <MyIcon
//                   name="language"
//                   size={15}
//                   color="#FFFFFF"
//                   style={{ maringLeft: 12, marginRight: 8 }}
//                 />

//                 <View
//                   style={{
//                     flexDirection: 'row',
//                     flex: 1,
//                     alignItems: 'center',
//                     justifyContent: 'space-between',
//                   }}
//                 >
//                   <Text style={Styles.selectlanguageText}>Select Language</Text>
//                   <MyIcon
//                     name="keyboard-arrow-down"
//                     size={15}
//                     color="rgba(255, 255, 255, 1)"
//                   />
//                 </View>
//               </View>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ImageBackground>
//     </EdgeToEdgeScreen>
//   );
// };

// export default HelloScreen;


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
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

  useFocusEffect(
    React.useCallback(() => {
      // reset to first greeting when screen is focused
      setCurrentGreetingIndex(0);

      const interval = setInterval(() => {
        setCurrentGreetingIndex((prevIndex) =>
          prevIndex + 1 < greetings.length ? prevIndex + 1 : 0
        );
      }, 2000);

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
          <Text style={Styles.unizyText}>UniZy</Text>
          <Text style={Styles.hellowText}>{greetings[currentGreetingIndex]}</Text>

          <View style={Styles.linearGradient}>
            <BlurView blurType="light" blurAmount={15} />
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.11)', 'rgba(255, 255, 255, 0.04)']}
            />

            <TouchableOpacity onPress={() => navigation.navigate('LanguagePopup')}>
              <View style={Styles.SelectLanguageContainer}>
                <MyIcon
                  name="language"
                  size={15}
                  color="#FFFFFF"
                  style={{ marginLeft: 12, marginRight: 8 }}
                />

                <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={Styles.selectlanguageText}>Select Language</Text>
                  <MyIcon
                    name="keyboard-arrow-down"
                    size={15}
                    color="rgba(255, 255, 255, 1)"
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </EdgeToEdgeScreen>
  );
};

export default HelloScreen;