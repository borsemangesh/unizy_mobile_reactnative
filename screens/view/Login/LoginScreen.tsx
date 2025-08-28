import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ImageBackground,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import MyIcon from '../../utils/MyIcon';

type LoginScreen = {
  navigation: any;
};

const LoginScreen = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = () => {
    // Handle login logic here
    console.log(`Logging in with ${username} and ${password}`);
    // navigation.navigate('Home');
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/BGImage.png')}
      style={loginStyles.flex_1}
      resizeMode="cover"
    >
      <Text
        style={{
          fontFamily: 'Monument Extended',
          textAlign: 'center',
          fontSize: 25,
          fontWeight: '400',
          marginTop: 40,
          padding: 16,
          color: '#FFFFFF',
        }}
      >
        UniZy
      </Text>
      <View
        style={{
          width: '90%',
          padding: 16,
          gap: 10,
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 24,
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        <TextInput
          style={loginStyles.editText}
          placeholder={'User name'}
          placeholderTextColor={'rgba(255, 255, 255, 0.48)'}
          value={username}
          onChangeText={usernameText => setUsername(usernameText)}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={loginStyles.editText}
            placeholder={'Password'}
            placeholderTextColor={'rgba(255, 255, 255, 0.48)'}
            value={password}
            onChangeText={passwordText => setPassword(passwordText)}
            />
          <View
            style={{
              position: 'absolute',
              right: 10,
              height: 30,
              width: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MyIcon
              name={isPasswordVisible ? 'visibility-off' : 'visibility'}
              size={15}
              color="#FFFFFF"
              onPress={() => {
                Alert.alert('Hello');
                setIsPasswordVisible(!isPasswordVisible);
              }}
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            width: '100%',
          }}
        >
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.48)',
              fontFamily: 'Urbanist',
              fontSize: 14,
              fontStyle: 'normal',
              fontWeight: 400,
            }}
          >
            Forget Password?
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          style={{
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: 'white',
              borderColor: '#ffffff3d',
              width: '100%',
              padding: 10,
              textAlign: 'center',
              borderWidth: 1,
              borderRadius: 24,
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              boxShadow: '1px 2px 10px 5px rgba(0, 0, 0, 0.14)',
            }}
          >
            Login
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.48)',
            fontFamily: 'Urbanist',
            fontSize: 14,
            fontStyle: 'normal',
            fontWeight: 400,
          }}
        >
          Don't have an account?
        </Text>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <Text
            onPress={() => Alert.alert('Signup')}
            style={{
              color: 'white',
              borderColor: '#ffffff3d',
              padding: 10,
              borderWidth: 1,
              borderRadius: 50,
              backgroundColor:
                'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.11) 0%, rgba(255, 255, 255, 0) 100%)',
              boxShadow: '1px 2px 10px 5px rgba(0, 0, 0, 0.14)',
            }}
          >
            Signup
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flex: 0.9,
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.48)',
              fontFamily: 'Urbanist',
              fontSize: 14,
              fontStyle: 'normal',
              fontWeight: 400,
            }}
          >
            By continuing, you agree to our
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.48)',
              textAlign: 'center',
              fontFamily: 'Urbanist',
              fontSize: 14,
              fontStyle: 'normal',
              fontWeight: 600,
              textDecorationLine: 'underline',
              textDecorationStyle: 'solid',
            }}
          >
            {' '}
            Terms and Conditions
          </Text>
        </View>
        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.48)',
            textAlign: 'center',
            fontFamily: 'Urbanist',
            fontSize: 14,
            fontStyle: 'normal',
            fontWeight: 600,
            textDecorationLine: 'underline',
            textDecorationStyle: 'solid',
          }}
        >
          and Privacy Policy
        </Text>
      </View>
    </ImageBackground>
  );
};

const loginStyles = StyleSheet.create({
  flex_1: {
    flex: 1,
    padding: 1,
    alignItems: 'center',
  },
  login_container: {
    alignItems: 'center',
    boxShadow: 'px 0px 10px 0px rgba(255, 255, 255, 0.15)',
    marginTop: 20,
    flexDirection: 'column',
    padding: 16,
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: '#ffffff15',
    borderWidth: 1,
    borderRadius: '24px',
    margin: 10,
  },
  editText: {
    alignItems: 'center',
    color: 'white',
    fontFamily: 'Urbanist',
    paddingHorizontal: 12,
    fontSize: 14,
    fontStyle: 'normal',
    borderRadius: 12,
    width: '100%',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
  },
  unizy_Text: {
    fontFamily: 'Monument Extended',
    top: 30,
    fontStyle: 'normal',
    lineHeight: 28.8,
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: '400',
    width: '100%',
    textAlign: 'center',
  },
});

export default LoginScreen;
