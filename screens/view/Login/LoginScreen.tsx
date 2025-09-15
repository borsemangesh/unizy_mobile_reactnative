import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
  ToastAndroid,
  BackHandler,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
 
import { loginStyles } from './LoginScreen.style';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';

 
type LoginScreenProps = {
  navigation: any;
};
 
const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
 
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const slideUp = React.useRef(new Animated.Value(200)).current;
  const cardHeight = React.useRef(new Animated.Value(500)).current; // card height
  const [error, setError] = useState("");
  const [shrink, setShrink] = useState(false);
  const isFocused = useIsFocused();
  const cardTranslateY = useRef(new Animated.Value(0)).current;
  const route = useRoute();
  const isFromReset = true; // static test
  const opacity = React.useRef(new Animated.Value(1)).current;
 const [loading, setLoading] = useState(false);
 const [isEmailValid, setIsEmailValid] = useState(false); // new state
const backButtonOpacity = React.useRef(new Animated.Value(200)).current;
  const [backDisabled, setBackDisabled] = useState(false);
 

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isFocused) {
        BackHandler.exitApp();
        return true; // prevent default
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isFocused]);
 
  if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
 
  useEffect(() => {
    if (
      Platform.OS === 'android' &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);
 
  useFocusEffect(
    React.useCallback(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideUp, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
 
      Animated.sequence([
        Animated.timing(cardHeight, {
          toValue: 250, // shrink target
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.spring(cardHeight, {
          toValue: 255, // overshoot a bit
          friction: 4,
          tension: 120,
          useNativeDriver: false,
        }),
      ]).start();
 
      return () => {
        translateY.stopAnimation();
        slideUp.stopAnimation();
        cardHeight.stopAnimation();
      };
    }, []),
  );




// useFocusEffect(
//     React.useCallback(() => {
//       const runAnimations = async () => {
//         const fromForgot = await AsyncStorage.getItem('fromForgotPassword');

//         if (fromForgot === 'true') {
//           // Coming back from Forgot Password
//           cardTranslateY.setValue(1000); // start below screen
//           await AsyncStorage.removeItem('fromForgotPassword');

//           Animated.timing(cardTranslateY, {
//             toValue: 0,
//             duration: 600,
//             easing: Easing.out(Easing.ease),
//             useNativeDriver: true,
//           }).start();
//         } else {
//           // Initial login animation
//           cardTranslateY.setValue(0); // ensure in place
//         }

//         Animated.parallel([
//           Animated.timing(translateY, {
//             toValue: 0,
//             duration: 600,
//             easing: Easing.out(Easing.ease),
//             useNativeDriver: true,
//           }),
//           Animated.timing(slideUp, {
//             toValue: 0,
//             duration: 600,
//             easing: Easing.out(Easing.ease),
//             useNativeDriver: true,
//           }),
//         ]).start();

//         Animated.sequence([
//           Animated.timing(cardHeight, {
//             toValue: 250,
//             duration: 500,
//             easing: Easing.out(Easing.ease),
//             useNativeDriver: false,
//           }),
//           Animated.spring(cardHeight, {
//             toValue: 255,
//             friction: 4,
//             tension: 120,
//             useNativeDriver: false,
//           }),
//         ]).start();
//       };

//       runAnimations();

//       return () => {
//         translateY.stopAnimation();
//         slideUp.stopAnimation();
//         cardHeight.stopAnimation();
//         cardTranslateY.stopAnimation();
//       };
//     }, [])
//   );



//   useFocusEffect(
//   React.useCallback(() => {
//     const runAnimations = async () => {
//       const fromForgot = await AsyncStorage.getItem('fromForgotPassword');

//       if (fromForgot === 'true') {
//         // Coming back from Forgot Password
//         cardTranslateY.setValue(1000); // start below screen

//         Animated.timing(cardTranslateY, {
//           toValue: 0,
//           duration: 600,
//           easing: Easing.out(Easing.ease),
//           useNativeDriver: true,
//         }).start();

//         // Don't re-run translateY, slideUp, or cardHeight
//         await AsyncStorage.removeItem('fromForgotPassword');
//       } else {
//         // Initial login animation
//         cardTranslateY.setValue(0);

//         Animated.parallel([
//           Animated.timing(translateY, {
//             toValue: 0,
//             duration: 600,
//             easing: Easing.out(Easing.ease),
//             useNativeDriver: true,
//           }),
//           Animated.timing(slideUp, {
//             toValue: 0,
//             duration: 600,
//             easing: Easing.out(Easing.ease),
//             useNativeDriver: true,
//           }),
//         ]).start();

//         Animated.sequence([
//           Animated.timing(cardHeight, {
//             toValue: 250,
//             duration: 500,
//             easing: Easing.out(Easing.ease),
//             useNativeDriver: false,
//           }),
//           Animated.spring(cardHeight, {
//             toValue: 255,
//             friction: 4,
//             tension: 120,
//             useNativeDriver: false,
//           }),
//         ]).start();
//       }
//     };

//     runAnimations();

//     return () => {
//       translateY.stopAnimation();
//       slideUp.stopAnimation();
//       cardHeight.stopAnimation();
//       cardTranslateY.stopAnimation();
//     };
//   }, [])
// );


  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  

  const restoreLanguageAndSignup = async () => {
  try {
    // ---- Language ----
    const savedLang = await AsyncStorage.getItem('selectedLanguage');
    if (savedLang) {
      const parsedLang = JSON.parse(savedLang);
      console.log('Stored language:', parsedLang);
      console.log('Code:', parsedLang.code);
      console.log('Name:', parsedLang.name);
    } else {
      console.log('No language stored yet');
    }

    // ---- Signup Data ----
    const savedSignup = await AsyncStorage.getItem('signupData');
    if (savedSignup) {
      const parsedSignup = JSON.parse(savedSignup);
      console.log('Stored signup data:', parsedSignup);
      console.log('First Name:', parsedSignup.firstName);
      console.log('Last Name:', parsedSignup.lastName);
      console.log('Postal Code:', parsedSignup.postalCode);
      console.log('Username:', parsedSignup.username);
      console.log('Password:', parsedSignup.password);
      console.log('Confirm Password:', parsedSignup.confirmPassword);
    } else {
      console.log('No signup data stored yet');
    }

  } catch (err) {
    console.log('Error reading data from storage', err);
  }
};


  
const handleLogin = async () => {
  if (!username || !password) {
    ToastAndroid.show("Please fill all required fields", ToastAndroid.SHORT);
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(username)) {
    ToastAndroid.show("Please enter a valid email address", ToastAndroid.SHORT);
    return;
  }
  setLoading(true);
  try {
    const response = await fetch(MAIN_URL.baseUrl + 'user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: username,
        password: password,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      setLoading(false)
      //throw new Error(`Login failed: ${errorText}`);
    }

    const result = await response.json(); 
    console.log('Login response:', JSON.stringify(result, null, 2));

    setLoading(false)
    const token = result?.data?.token;
    const user = result?.data?.user;

    if (token && user) {
      // Save token & user
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      ToastAndroid.show("Login successful", ToastAndroid.SHORT);

      // Navigate to Home or Dashboard
      navigation.replace('HomeScreen');
    } else {
      setLoading(false)
      //Alert.alert('Login Failed', 'Invalid credentials or missing token');
    }
  } catch (error: any) {
    setLoading(false)
    console.error('Login error:', error);
    Alert.alert('Error', error.message || 'Something went wrong');
  }
};


// const handleLogin = async () => {
//     if (!username || !password) {
//     ToastAndroid.show("Please fill all required fields", ToastAndroid.SHORT);
//     return;
//   }

//    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(username)) {
//       ToastAndroid.show("Please enter a valid email address", ToastAndroid.SHORT);
//       return;
//     }
  
//   //setLoading(true);

//   try {
//     const response = await fetch(MAIN_URL.baseUrl + 'user/login', { 
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email: username,
//         password: password,
//       }),
//     });

//     if (!response.ok) {
//       // Handle HTTP errors
//       const errorText = await response.text();
//       throw new Error(`Login failed: ${errorText}`);
//     }

//     const data = await response.json();

//     console.log(JSON.stringify(data,null,2))
    
//     // Example: API returns { token, user }
//     if (data.token) {
//       // Save token locally
//       await AsyncStorage.setItem('userToken', data.token);
//       await AsyncStorage.setItem('userData', JSON.stringify(data.user));

//       // Navigate to Home or Dashboard
//       navigation.replace('HomeScreen');
//     } else {
//       Alert.alert('Login Failed', 'Invalid credentials');
//     }
//   } catch (error: any) {
//     console.error('Login error:', error);
//     Alert.alert('Error', error.message || 'Something went wrong');
//   }
// };


  const validateEmail = (text: string) => {
    setUsername(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

   if (text.length === 0) {
    setIsEmailValid(false);
  } else if (!emailRegex.test(text)) {
    setIsEmailValid(false);
    ToastAndroid.show("Please enter a valid email address", ToastAndroid.SHORT);
  } else {
    setIsEmailValid(true);
  }
  };
 
  
  const handleForgetPassword = () => {
    Animated.timing(cardTranslateY, {
      toValue: 1000, // fade to invisible
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      // setBackDisabled(true); // disable after animation
      // navigation.replace('Reset'); // then navigate
      clickResetListner();

      

    });
  };

  const clickResetListner = () =>{
    if (Platform.OS === 'ios') {
      navigation.replace('Reset');
    } else {
      navigation.navigate('Reset');
    }
  }

  const clickSignUpListner = () =>{
    if (Platform.OS === 'ios') {
      navigation.replace('Signup');
    } else {
      navigation.navigate('Signup');
    }
  }

  const clickLanguageListner = () =>{
    if (Platform.OS === 'ios') {
      navigation.replace('LanguagePopup');
    } else {
      navigation.navigate('LanguagePopup');
    }
  }

 
  const BGAnimationScreen = require('../../../assets/images/bganimationscreen.png');
 
  
  return (
    <ImageBackground
      source={BGAnimationScreen}
      resizeMode="cover"
      style={[loginStyles.flex_1]}
    >
     
      <View
        style={{
         
          display: 'flex',
          flexDirection: 'column',
          padding: 12,
          gap: 20,
          justifyContent: 'space-between',
          paddingTop: 60,
          zIndex: 1
        }}
      >
        <Animated.View
          style={[
            loginStyles.topHeader,
            { transform: [{ translateY: translateY }] },
          ]}
        >
          <TouchableOpacity onPress={() => clickLanguageListner}>
            <View style={loginStyles.backIconRow}>
              <Image
                source={require('../../../assets/images/back.png')}
                style={{ height: 24, width: 24 }}
              />
            </View>
          </TouchableOpacity>
          <Text style={loginStyles.unizyText}>UniZy</Text>
          <View style={loginStyles.emptyView}></View>
        </Animated.View>
        <Animated.View style={[loginStyles.cardView, { height: cardHeight}]}>
          <BlurView blurType="light" blurAmount={15} />
           <Animated.View
        style={[
          {
            flex: 1,
            transform: [{ translateY: cardTranslateY }],
          },
        ]}
      >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.76)', 'rgba(255, 255, 255, 0.85)']}
          />
          <View style={loginStyles.login_container}>
            <TextInput
              style={loginStyles.personalEmailID_TextInput}
              placeholder={'Personal Email ID'}
              placeholderTextColor={'rgba(255, 255, 255, 0.48)'}
              value={username}
              onChangeText={usernameText => setUsername(usernameText)}
              //onChangeText={validateEmail}
            />
          </View>
 
          <View style={loginStyles.password_container}>
            <TextInput
              style={loginStyles.password_TextInput}
              placeholder={'Password'}
              placeholderTextColor={'rgba(255, 255, 255, 0.48)'}
              value={password}
              secureTextEntry={!isPasswordVisible}
              onChangeText={passwordText => setPassword(passwordText)}
            />
 
            {/* <Image
              source={require('../../../assets/images/eyeopen.png')}
              style={loginStyles.eyeIcon}
            /> */}
              <TouchableOpacity
                                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                              >
                                <Image
                                  source={
                                    isPasswordVisible
                                      ? require('../../../assets/images/eyeopen.png')
                                      : require('../../../assets/images/eyecross1.png')
                                  }
                                  style={[
                                    loginStyles.eyeIcon,
                                    isPasswordVisible ? loginStyles.eyeIcon : loginStyles.eyeCross,
                                  ]}
                                />
                              </TouchableOpacity>
          </View>
          <Text
            style={loginStyles.forgetPasswordText}
            onPress={handleForgetPassword}
          >
            Forgot Password?
          </Text>
 
          <TouchableOpacity
            style={loginStyles.loginButton}
            onPress={handleLogin}
          >
            <Text style={loginStyles.loginText}>Login</Text>
          </TouchableOpacity>
 
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.48)',
                textAlign: 'center',
                fontFamily: 'Urbanist-Regular',
                fontSize: 14,
                fontWeight: 400,
                lineHeight: 19,
                marginTop: 10,
              }}
            >
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={clickSignUpListner}>
              <Text style={loginStyles.signupText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        </Animated.View>
      </View>
 
      <Animated.View
        style={[
          {
            alignItems: 'center',
            justifyContent: 'flex-end',
            flex: 1,
            paddingBottom: 30,
            transform: [{ translateY: slideUp }],
          },
        ]}
      >
        <View style={loginStyles.teamsandConditionContainer}>
          <Text style={loginStyles.bycountuningAgreementText}>
            By continuing, you agree to our
          </Text>
          <Text style={loginStyles.teamsandConditionText}>
            Terms & Conditions
          </Text>
        </View>
 
        <View style={loginStyles.teamsandConditionContainer}>
          <Text style={loginStyles.bycountuningAgreementText}>and</Text>
          <Text style={loginStyles.teamsandConditionText}>Privacy Policy</Text>
        </View>
      </Animated.View>
      {loading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999, // keep it above everything
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </ImageBackground>
  );

// return(
//   <View style={{
//      }}>
//     <LottieView
//     source={require("../../../assets/animations/BGAnimation.json")}
//     autoPlay
//     loop
//     speed={0.8}
//     resizeMode="cover"
//     style={{
//        width: '100%',
//       height: '100%',opacity: 1,zIndex: 0
//     }}
//     enableMergePathsAndroidForKitKatAndAbove
//     hardwareAccelerationAndroid 
//   />
//   <BlurView
//   style={StyleSheet.absoluteFill}
//   blurType="light"   // options: "xlight", "light", "dark", "regular", "prominent"
//   blurAmount={40}     // intensity similar to blur(6px)
//   reducedTransparencyFallbackColor="white"
// >
//   <View style={{
//     position: 'absolute',
//     height: '100%',
//     width: '100%',
//     zIndex: 1,
//     opacity:1,
//      backgroundColor: 'rgba(0, 0, 255, 0.45)',
//     }}>


// <View style ={styles.flex_1}>


//  <View style={styles.formContainer}>
//           <Animated.View
//             style={{
//               transform: [{ translateY }],
//               opacity,
//               width: '100%',
//             }}
//           >
//             <Text style={styles.resetTitle}>Reset Password</Text>
 
//             <View style={styles.privacyContainer}>
//               <Text style={styles.termsText}>
//                 Enter your personal email address and we’ll send you a link to
//                 reset your password
//               </Text>
//             </View>
 
//             <View style={styles.login_container}>
//               <TextInput
//                 style={[styles.personalEmailID_TextInput,{color:'#fff'}]}
//                 placeholder="Personal Email ID"
//                 placeholderTextColor="rgba(255, 255, 255, 0.48)"
//                 value={username}
//                 maxLength={50}
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//                 autoCorrect={false}
//                 //onChangeText={validateEmail}
//                // onChangeText={usernameText => setUsername(usernameText)}
//               />
//             </View>
 
//             <TouchableOpacity
//               style={styles.loginButton}
             
//             >
//               <Text style={styles.loginText}>Send Reset Link</Text>
//             </TouchableOpacity>
 
//             <TouchableOpacity>
//               <Text style={styles.goBackText}>Go back</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </View>
// </View>
//     </View>
// </BlurView>
// </View>
// )
};

const styles = StyleSheet.create({
  flex_1: {
    flex: 1,
    alignItems: 'center',
    justifyContent:'center'
  },
  blurstyle: {
    backgroundColor: 'transparent',
  },
  topHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
 
  formContainer: {
    width: '90%',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    gap: 10,
    marginTop: -15,
    flexDirection: 'column',
    borderWidth: 0.2,
    borderColor: '#ffffff3d',
    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
    overflow: 'hidden',
  },
 
  resetTitle: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.02 * 17,
    textAlign: 'center',
    color: '#FFF',
    fontWeight: 600,
  },
 
  privacyContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
 
  termsText: {
    color: 'rgba(255,255,255,0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
 
  termsText1: {
    color: 'rgba(255,255,255,0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
 
  login_container: {
    display: 'flex',
    width: '100%',
    height: 40,
    gap: 10,
    marginTop: 16,
    alignSelf: 'stretch',
    borderRadius: 12,
    borderWidth: 0.6,
    borderColor: '#ffffff2c',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
  },
  personalEmailID_TextInput: {
    width: '93%',
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
    fontStyle: 'normal',
  },
 
  loginButton: {
    display: 'flex',
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    marginTop: 16,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },
  loginText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    width: '100%',
  },
 
  goBackText: {
    color: 'rgba(255,255,255,0.48)',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 19.6,
    letterSpacing: 0,
    opacity: 2,
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1,
  },
 
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
 
  
 
  logo: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },
 
  fullScreenContainer: {
    display: 'flex',
    paddingRight: 20,
    paddingLeft: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    flexDirection: 'row',
    paddingTop: 20,
  },
  backIconRow: {
    display: 'flex',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    borderWidth: 0.6,
    borderColor: '#ffffff2c',
  },
  unizyText: {
    color: '#FFFFFF',
    fontFamily: 'MonumentExtended-Regular',
    fontSize: 24,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 120,
    textAlign: 'center',
    flex: 1,
    gap: 10,
    paddingLeft: 24,
  },
  emptyView: {
    display: 'flex',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 40,
    opacity: 0.01,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
  },
});
 
export default LoginScreen;