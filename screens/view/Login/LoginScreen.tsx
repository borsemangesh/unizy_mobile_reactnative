import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Modal,
  Button,
  Image,
  StyleSheet,
} from 'react-native';

import MyIcon from '../../utils/MyIcon';
import { loginStyles } from './LoginScreen.style';
import LiquidGlassCard from './LiquidGlassCard';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

type LoginScreenProps = {
  navigation: any;
};

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const handleLogin = () => {
    navigation.navigate('Dashboard');
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
      <View style={loginStyles.fullScreenContainer}>
        <View style={loginStyles.backIconRow}>
          <MyIcon name="keyboard-arrow-left" size={24} color="#FFFFFF" />
        </View>

        <Text style={loginStyles.unizyText}>UniZy</Text>
        <View style={loginStyles.emptyView}></View>
      </View>

      <View style={loginStyles.cardView}>
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
              fontStyle: 'normal',
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
      </View>
      <View
        style={{
          flex: 0.9,
          alignItems: 'center',
          justifyContent: 'flex-end',
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

        {/* <Text style={loginStyles.privacyPolicyText}>and Privacy Policy</Text> */}

        {/* This Daialog is Do further work */}
        {/* <Modal  
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={toggleModal}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 20,
                alignItems: 'center',
                elevation: 5, // Shadow for Android
                shadowColor: '#000', // Shadow for iOS
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}
              >
                Dialog Title
              </Text>
              <Text
                style={{ fontSize: 16, marginBottom: 20, textAlign: 'center' }}
              >
                This is a custom dialog message.
              </Text>
              <Button title="Close" onPress={toggleModal} />
            </View>
          </View>
        </Modal>*/}
       </View> 
    </ImageBackground>
  );
};

export default LoginScreen;
