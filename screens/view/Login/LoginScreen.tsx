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
} from 'react-native';

import MyIcon from '../../utils/MyIcon';
import { loginStyles } from './LoginScreen.style';

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
    console.log(`Logging in with ${username} and ${password}`);
    toggleModal();
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/BGAnimationScreen.png')}
      style={loginStyles.flex_1}
      resizeMode="cover"
    >
      <View style={loginStyles.fullScreenContainer}>
        <View style={loginStyles.backIconRow}>
          <MyIcon
            name="keyboard-arrow-left"
            size={24}
            color="#FFFFFF"
            style={{}}
          />
        </View>

        <Text style={loginStyles.unizyText}>UniZy</Text>
        <View style={loginStyles.emptyView}></View>
      </View>

      <View style={loginStyles.container}>
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

          <MyIcon
            name={isPasswordVisible ? 'visibility' : 'visibility-off'}
            size={15}
            color="#FFFFFF"
            onPress={() => {
              Alert.alert('Hello');
              setIsPasswordVisible(!isPasswordVisible);
            }}
          />
        </View>
        <Text style={loginStyles.forgetPasswordText}>Forget Password?</Text>

        <TouchableOpacity onPress={handleLogin} style={loginStyles.loginButton}>
          <Text style={loginStyles.loginText}>Login</Text>
        </TouchableOpacity>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.48)',
              textAlign: 'center',
              fontFamily: 'Urbanist-regular',
              fontSize: 14,
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 19,
            }}
          >
            Don't have an account?
          </Text>
          <TouchableOpacity>
            <Text
              onPress={() => Alert.alert('Signup')}
              style={loginStyles.signupText}
            >
              Signup
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
            Terms and Conditions
          </Text>
        </View>

        <Text style={loginStyles.privacyPolicyText}>and Privacy Policy</Text>

        <Modal
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
        </Modal>
      </View>
    </ImageBackground>
  );
};

export default LoginScreen;
