import React, { useState, useEffect } from 'react';
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
} from 'react-native';
 
import { loginStyles } from './LoginScreen.style';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import BackgroundAnimation from '../Hello/BackgroundAnimation';

 
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
 
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const handleLogin = () => {
    console.log(`Logging in with ${username} and ${password}`);
  };

  const validateEmail = (text: string) => {
    setUsername(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (text.length === 0) {
      setError("");
    } else if (!emailRegex.test(text)) {
      ToastAndroid.show("Please enter a valid email address", ToastAndroid.SHORT);
    } else {
      setError("");
    }
  };
 
  const backButtonOpacity = React.useRef(new Animated.Value(200)).current;
  const [backDisabled, setBackDisabled] = useState(false);
 
  const handleForgetPassword = () => {
    Animated.timing(backButtonOpacity, {
      toValue: -20, // fade to invisible
      duration: 0,
      useNativeDriver: true,
    }).start(() => {
      // setBackDisabled(true); // disable after animatio
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
          paddingTop: 30,
          zIndex: 1
        }}
      >
        <Animated.View
          style={[
            loginStyles.topHeader,
            { transform: [{ translateY: translateY }] },
          ]}
        >
          <TouchableOpacity onPress={() => clickLanguageListner()}>
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
        <Animated.View style={[loginStyles.cardView, { height: cardHeight }]}>
          <BlurView blurType="light" blurAmount={15} />
 
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
            />
          </View>
 
          <View style={loginStyles.password_container}>
            <TextInput
              style={loginStyles.password_TextInput}
              placeholder={'Password'}
              placeholderTextColor={'rgba(255, 255, 255, 0.48)'}
              value={password}
              onChangeText={passwordText => setPassword(passwordText)}
            />
 
            <Image
              source={require('../../../assets/images/eyeopen.png')}
              style={loginStyles.eyeIcon}
            />
          </View>
          <TouchableOpacity onPress={() => handleForgetPassword()}>
          <Text
            style={loginStyles.forgetPasswordText}
          >
            Forgot Password?
          </Text>
          </TouchableOpacity>
 
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
    </ImageBackground>
  );
};
 
export default LoginScreen;