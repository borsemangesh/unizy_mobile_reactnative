import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import MyIcon from '../../utils/MyIcon';

const SignupScreen = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [username, setUsername] = useState<string>(''); // Personal Email ID
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleSendOTP = () => {
    Alert.alert('OTP Sent', 'An OTP has been sent to your email.');
  };

  const handleLogin = () => {
    // Your login logic here
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/BGAnimationScreen.png')}
      style={styles.flex_1}
      resizeMode="cover">

        <View style={styles.fullScreenContainer}>
        <View style={styles.backIconRow}>
          <MyIcon
            name="keyboard-arrow-left"
            size={24}
            color="#FFFFFF"
            style={{}}
          />
        </View>

        <Text style={styles.unizyText}>UniZy</Text>
        <View style={styles.emptyView}></View>
      </View>
      
      <View style={styles.formContainer}>
        <View style={styles.nameRow}>
          <TextInput
            style={[styles.editText, styles.halfWidth]}
            placeholder="First Name"
            placeholderTextColor="rgba(255, 255, 255, 0.48)"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={[styles.editText, styles.halfWidth]}
            placeholder="Last Name"
            placeholderTextColor="rgba(255, 255, 255, 0.48)"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <TextInput
          style={styles.editText}
          placeholder="Postal Code"
          placeholderTextColor="rgba(255, 255, 255, 0.48)"
          value={postalCode}
          onChangeText={setPostalCode}
        />

        <TextInput
          style={styles.editText}
          placeholder="Personal Email ID"
          placeholderTextColor="rgba(255, 255, 255, 0.48)"
          value={username}
          onChangeText={setUsername}
        />

       {/* <Text style={styles.editText1}>
        { "Important: Use your personal email address for signup.Your university email will be requested separately for student verification."}
        </Text> */}

        <View style={[styles.editText1, { flexDirection: 'row', alignItems: 'center' }]}>
            <Image
                source={require('../../../assets/images/info_icon.png')}
                style={{ width: 20, height: 20, marginRight: 8 }}
                resizeMode="contain"/>
            <Text style={{ color: 'white', fontFamily: 'Urbanist', fontSize: 14, flex: 1 }}>
                Important: Use your personal email address for signup. Your university email will be requested separately for student verification.
            </Text>
            </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.editText}
            placeholder="Create Password"
            placeholderTextColor="rgba(255, 255, 255, 0.48)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
          />
          <View style={styles.eyeIconWrapper}>
            <MyIcon
              name={isPasswordVisible ? 'visibility-off' : 'visibility'}
              size={15}
              color="#FFFFFF"
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            />
          </View>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.editText}
            placeholder="Confirm Password"
            placeholderTextColor="rgba(255, 255, 255, 0.48)"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!isConfirmPasswordVisible}
          />
          <View style={styles.eyeIconWrapper}>
            <MyIcon
              name={isConfirmPasswordVisible ? 'visibility-off' : 'visibility'}
              size={15}
              color="#FFFFFF"
              onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            />
          </View>
        </View>

        {/* <TouchableOpacity onPress={handleSendOTP} style={styles.buttonWrapper}>
          <ImageBackground
            source={require('../../../assets/images/login_button.png')}
            style={styles.buttonBackground}
            imageStyle={{ borderRadius: 24 }}
          >
            <Text style={styles.buttonText}>Send OTP</Text>
          </ImageBackground>
        </TouchableOpacity> */}
        <TouchableOpacity onPress={handleSendOTP} style={styles.loginButton}>
                          <Text style={styles.loginText}>Send OTP</Text>
                        </TouchableOpacity>

        <Text style={styles.signupPrompt}>Already have an account?</Text>
        <TouchableOpacity style={styles.signupButton}>
          <Text onPress={() => Alert.alert('Signup')} style={styles.signupText}>
            Login
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  flex_1: {
    flex: 1,
    padding: 1,
    alignItems: 'center',
  },

  unizyTitle: {
    fontFamily: 'Monument Extended',
    textAlign: 'center',
    fontSize: 25,
    fontWeight: '400',
    marginTop: 40,
    padding: 16,
    color: '#FFFFFF',
  },
    loginButton: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 8,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
  },
  loginText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-regular',
    fontSize: 17,
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: 22,
    letterSpacing: 1,
  },


  formContainer: {
    width: '90%',
    padding: 16,
    gap: 10,
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },

  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },

  halfWidth: {
    width: '48%',
  },

   personalEmailID_TextInput: {
    width: '90%',
    fontFamily: 'Urbanist-regular',
    fontWeight: '400',
    lineHeight: 22,
    fontSize: 17,
  },

  editText: {
    alignItems: 'center',
    color: 'white',
    fontFamily: 'Urbanist',
    paddingHorizontal: 12,
    fontSize: 14,
    borderRadius: 12,
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
  },

   editText1: {
    alignItems: 'center',
    color: 'white',
    fontFamily: 'Urbanist',
    paddingHorizontal: 12,
    fontSize: 14,
    borderRadius: 12,
    width: '100%',
    height: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    paddingVertical:10
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },

  eyeIconWrapper: {
    position: 'absolute',
    right: 10,
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  forgetPasswordContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },

  forgetPasswordText: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist',
    fontSize: 14,
    fontWeight: '400',
  },

  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },

  buttonBackground: {
    width: 320,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    overflow: 'hidden',
  },

  buttonText: {
    color: '#ffffff',
    fontFamily: 'Urbanist',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },

  signupPrompt: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist',
    fontSize: 14,
    fontWeight: '400',
  },

  signupButton: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

   signupButton1: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop:40,
    marginBottom:15
  },
  signupText: {
    color: 'white',
    borderColor: '#ffffff3d',
    padding: 10,
    borderWidth: 1,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.11)',
  },

  footerContainer: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerText: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist',
    fontSize: 14,
    fontWeight: '400',
  },

  linkText: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  fullScreenContainer: {
    display: 'flex',
    paddingRight: 20,
    paddingLeft: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    flexShrink: 0,
    flexDirection: 'row',
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


     // Outer Shadow (bottom-right)
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
opacity: 0.5,
    // Inner Highlight (top-left light)
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",


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

export default SignupScreen;
