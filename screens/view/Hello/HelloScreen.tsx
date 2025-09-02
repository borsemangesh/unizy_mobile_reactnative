import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Styles } from './HelloScreen.style'
import MyIcon from '../../utils/MyIcon';
import EdgeToEdgeScreen from './EdgeToEdgeScreen';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';


type HelloScreenProps = {
  navigation: any;
};

const HelloScreen = ({ navigation }: HelloScreenProps) => {
  return (
    <EdgeToEdgeScreen>
      <ImageBackground
        source={require('../../../assets/images/BGAnimationScreen.png')}
        style={{flex: 1, width: '100%', height: '100%'}}
        resizeMode='cover'
      >
        
        <View style={Styles.ScreenLayout}>
          <Text style={Styles.unizyText}>UniZy</Text>
          <Text style={Styles.hellowText}>hello</Text>
          
          <View style={Styles.linearGradient}>
            <BlurView blurType="light" blurAmount={15} />

        <LinearGradient
          colors={['rgba(255, 255, 255, 0.11)', 'rgba(255, 255, 255, 0.04)']}
        />
            <TouchableOpacity
              onPress={() => navigation.navigate('LanguagePopup')}
            >
              <View style={[Styles.SelectLanguageContainer]}>
                <MyIcon
                  name="language"
                  size={15}
                  color="#FFFFFF"
                  style={{ maringLeft: 12, marginRight: 8 }}
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

// import React, { useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   ImageBackground,
//   TouchableOpacity,
//   Animated,
//   Easing,
// } from 'react-native';
// import { Styles } from './HelloScreen.style';
// import MyIcon from '../../utils/MyIcon';
// import EdgeToEdgeScreen from './EdgeToEdgeScreen';

// type HelloScreenProps = {
//   navigation: any;
// };

// const HelloScreen = ({ navigation }: HelloScreenProps) => {
//   const rotateAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(1)).current;

//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.parallel([
//           Animated.timing(rotateAnim, {
//             toValue: 1,
//             duration: 8000,
//             easing: Easing.linear,
//             useNativeDriver: true,
//           }),
//           Animated.timing(scaleAnim, {
//             toValue: 1.1,
//             duration: 8000,
//             easing: Easing.ease,
//             useNativeDriver: true,
//           }),
//         ]),
//         Animated.parallel([
//           Animated.timing(rotateAnim, {
//             toValue: 0,
//             duration: 8000,
//             easing: Easing.linear,
//             useNativeDriver: true,
//           }),
//           Animated.timing(scaleAnim, {
//             toValue: 1,
//             duration: 8000,
//             easing: Easing.ease,
//             useNativeDriver: true,
//           }),
//         ]),
//       ])
//     ).start();
//   }, [rotateAnim, scaleAnim]);

//   const rotate = rotateAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['-5deg', '5deg'], // Small rotation like in video
//   });

//   return (
//     <EdgeToEdgeScreen>
//       <Animated.View
//         style={{
//           flex: 1,
//           transform: [{ rotate }, { scale: scaleAnim }],
//         }}
//       >
//         <ImageBackground
//           source={require('../../../assets/images/BGAnimationScreen.png')}
//           style={{ flex: 1, width: '100%', height: '100%' }}
//           resizeMode="cover"
//         />
//       </Animated.View>

//       {/* Static UI Layer */}
//       <View style={[Styles.ScreenLayout, { position: 'absolute', width: '100%', height: '100%' }]}>
//         <Text style={Styles.unizyText}>UniZy</Text>
//         <Text style={Styles.hellowText}>Hello</Text>

//         <View style={Styles.linearGradient}>
//           <TouchableOpacity onPress={() => navigation.navigate('LanguagePopup')}>
//             <View style={[Styles.SelectLanguageContainer]}>
//               <MyIcon
//                 name="language"
//                 size={15}
//                 color="#FFFFFF"
//                 style={{ marginLeft: 12, marginRight: 8 }}
//               />

//               <View
//                 style={{
//                   flexDirection: 'row',
//                   flex: 1,
//                   alignItems: 'center',
//                   justifyContent: 'space-between',
//                 }}
//               >
//                 <Text style={Styles.selectlanguageText}>Select Language</Text>
//                 <MyIcon
//                   name="keyboard-arrow-down"
//                   size={15}
//                   color="rgba(255, 255, 255, 1)"
//                 />
//               </View>
//             </View>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </EdgeToEdgeScreen>
//   );
// };

// export default HelloScreen;


