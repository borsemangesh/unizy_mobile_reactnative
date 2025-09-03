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
} from 'react-native';


import { loginStyles } from './LoginScreen.style';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

type LoginScreenProps = {
  navigation: any;
};

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);



  const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0);

   const translateY = React.useRef(new Animated.Value(-100)).current;
   const slideUp = React.useRef(new Animated.Value(200)).current;

  useFocusEffect(
    React.useCallback(() => {
 
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();


      Animated.timing(slideUp, {
    toValue: 0, 
    duration: 1000,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  }).start();

      return () => {};
    }, [])
  );


  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const handleLogin = () => {
    // navigation.navigate('Dashboard');
    console.log(`Logging in with ${username} and ${password}`);
    //toggleModal();
  };

  const handleForgetPassword = () =>{    
    navigation.navigate('Reset');
  }

  const handleSignup = () => {
    navigation.navigate('Signup');
    console.log(`Logging in with ${username} and ${password}`);
    //toggleModal();
  };

  const BGAnimationScreen = require('../../../assets/images/BGAnimationScreen.png');

  return (
    <ImageBackground
      source={BGAnimationScreen}
      resizeMode="cover"
      style={[loginStyles.flex_1]}
    >


      <View style={{display: 'flex', flexDirection: 'column',padding: 12,gap: 20,justifyContent: 'space-between',paddingTop: 50,}}>
        <Animated.View style={[loginStyles.topHeader, { transform: [{ translateY: translateY }] }]} >
        

                    {/* <Animated.View style={[Styles.linearGradient, { transform: [{ translateY: slideUp }] }]}
          ></Animated.View> */}
          <TouchableOpacity onPress={() => navigation.goBack()}>
          <View  style={loginStyles.backIconRow} >
              <Image
              source={require('../../../assets/images/back.png')} style={{height: 24, width: 24}}/>
              
            </View>
          </TouchableOpacity>
          <Text style={loginStyles.unizyText}>UniZy</Text>
        <View style={loginStyles.emptyView}></View>
        </Animated.View>
        <Animated.View style={[loginStyles.cardView, { transform: [{ translateY: slideUp }] }]}>
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
          <Text style={loginStyles.forgetPasswordText} onPress={handleForgetPassword}>
            Forgot Password?
          </Text>

          <TouchableOpacity style={loginStyles.loginButton} onPress={handleLogin}>
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
          <TouchableOpacity onPress={handleSignup}>
          <Text style={loginStyles.signupText}>
            Sign up
          </Text>
          </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      
      
      
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'flex-end',          
          flex: 1,
          paddingBottom: 30,
        }}
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
          <Text style={loginStyles.bycountuningAgreementText}>
            and
          </Text>
          <Text style={loginStyles.teamsandConditionText}>
            Privacy Policy
          </Text>
        </View>
       </View> 
    </ImageBackground>
  );
};

export default LoginScreen;
