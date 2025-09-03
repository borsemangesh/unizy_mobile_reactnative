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

type SignupScreenProps = {
  navigation: any;
};

const SignupScreen = ({ navigation }: SignupScreenProps) => {
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
  navigation.reset({
    index: 0,
    routes: [{ name: 'LoginScreen' }],
  });
};

  return (
    <ImageBackground
      source={require('../../../assets/images/BGAnimationScreen.png')}
      style={styles.flex_1}
      resizeMode="cover">

        <View style={styles.fullScreenContainer}>
        <View style={styles.backIconRow}>
        
           <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image
                      source={require('../../../assets/images/back.png')}
                      style={{ height: 24, width: 24 }}
                    />
                  </TouchableOpacity>
        </View>

        <Text style={styles.unizyText}>UniZy</Text>
        <View style={styles.emptyView}></View>
      </View>
      
      
      <View style={styles.formContainer}>
        <View style={styles.nameRow}>
          {/* <TextInput
            style={[styles.editText, styles.halfWidth]}
            placeholder="First Name"
            placeholderTextColor="rgba(255, 255, 255, 0.48)"
            value={firstName}
            onChangeText={setFirstName}
          /> */}

      <View style={styles.login_container1}>
          <TextInput
            style={styles.personalEmailID_TextInput}
            placeholder="First Name"
            placeholderTextColor="rgba(255, 255, 255, 0.48)"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>


        <View style={styles.login_container1}>
          <TextInput
            style={styles.personalEmailID_TextInput}
           placeholder="Last Name"
            placeholderTextColor="rgba(255, 255, 255, 0.48)"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

          
          {/* <TextInput
            style={[styles.editText, styles.halfWidth]}
            placeholder="Last Name"
            placeholderTextColor="rgba(255, 255, 255, 0.48)"
            value={lastName}
            onChangeText={setLastName}
          /> */}
        </View>

  <View style={styles.login_container}>
          <TextInput
            style={styles.personalEmailID_TextInput}
            placeholder="Postal Code"
          placeholderTextColor="rgba(255, 255, 255, 0.48)"
          value={postalCode}
          onChangeText={setPostalCode}
          />
        </View>


          <View style={styles.login_container}>
          <TextInput
          style={styles.personalEmailID_TextInput}
         placeholder="Personal Email ID"
          placeholderTextColor="rgba(255, 255, 255, 0.48)"
          value={username}
          onChangeText={setUsername}
          />
        </View>


       {/* <Text style={styles.editText1}>
        { "Important: Use your personal email address for signup.Your university email will be requested separately for student verification."}
        </Text> */}

        <View style={[styles.editText1, { flexDirection: 'row'}]}>
            <Image
                source={require('../../../assets/images/info_icon.png')}
                style={{ width: 20, height: 20, marginRight: 8 }}
                resizeMode="contain"/>
            <Text style={{ color: '#FFFFFF7A', fontFamily: 'Urbanist-Medium', fontSize: 14, flex: 1 }}>
                Important: Use your personal email address for signup. Your university email will be requested separately for student verification.
            </Text>
      </View>

        <View style={styles.password_container}>
                  <TextInput
                    style={styles.password_TextInput}
                     placeholder="Create Password"
                    placeholderTextColor="rgba(255, 255, 255, 0.48)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible}
                  />
        
                  <Image
                    source={require('../../../assets/images/eyeopen.png')}
                    style={styles.eyeIcon}
                  />
                </View>

                 <View style={styles.password_container}>
                  <TextInput
                    style={styles.password_TextInput}
                    placeholder="Confirm Password"
                    placeholderTextColor="rgba(255, 255, 255, 0.48)"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!isConfirmPasswordVisible}
                  />
        
                  <Image
                    source={require('../../../assets/images/eyeopen.png')}
                    style={styles.eyeIcon}
                  />
                </View>


        {/* <View style={styles.passwordContainer}>
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
        </View> */}

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

        {/* <Text style={styles.signupPrompt}>Already have an account? Login</Text> */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.signupPrompt}>Already have an account? </Text>
        <TouchableOpacity onPress={handleLogin}>
        <Text style={styles.signupPrompt1}>Login</Text>
        </TouchableOpacity>
      </View>
        <TouchableOpacity style={styles.signupButton}>
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
   eyeIcon: {
    width: 19,
    height: 19,
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
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  
  },
  loginText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
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
    marginTop: -15,
    flexDirection: 'column',
    alignItems: 'center',
    // borderRadius: 24,
    // backgroundColor: 'rgba(255, 255, 255, 0.06)',


      borderWidth: 0.2,
      borderColor: '#ffffff3d',
      borderRadius: 16,
      backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
      boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
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


  editText: {
    alignItems: 'center',
    color: 'white',
    fontFamily: 'Urbanist-Regular',
    paddingHorizontal: 12,
    fontSize: 14,
    borderRadius: 12,
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
  },

   editText1: {
    //alignItems: 'center',
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
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '400',
  },
   signupPrompt1: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-Semibold',
    fontSize: 14,
    fontWeight: '600',
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

   cardView: {
          padding: 10,
          marginTop: -15,
          width: '90%',
          borderWidth: 0.2,
          gap: 3,
      borderColor: '#ffffff3d',
    borderRadius: 16,
    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.09)',
    
  },

login_container1: {
    display: 'flex',
    width: '48%',
    height: 40,
    gap: 10,
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


   login_container: {
    display: 'flex',
    width: '100%',
    height: 40,
    gap: 10,
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
    width: '95%',
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
    fontStyle: 'normal',

  },

  password_container: {
    display: 'flex',
    width: '100%',
    height: 40,
    alignSelf: 'stretch',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',

    borderWidth: 0.6,
    borderColor: '#ffffff2c',
    marginTop: 6,
  },
  password_TextInput: {
    width: '85%',
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
  },
});

export default SignupScreen;
