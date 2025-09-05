import React, { useState,useEffect,useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Image,
  Animated,
  Easing
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

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
  const [showInfo, setShowInfo] = useState(false);

  const slideAnim = useRef(new Animated.Value(500)).current; // start off-screen (bottom)

 const translateY = useRef(new Animated.Value(50)).current;
const opacity = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.parallel([
    Animated.timing(translateY, {
      toValue: 0,
      duration: 4000,
      easing: Easing.out(Easing.exp), // smoother easing
      useNativeDriver: true,
    }),
    Animated.timing(opacity, {
      toValue: 1,
      duration: 4000,
      easing: Easing.out(Easing.exp), // smoother easing
      useNativeDriver: true,
    }),
  ]).start();
}, []);

  const handleSendOTP = () => {
    navigation.navigate('OTPScreen')
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
        <Text style={styles.unizyText}>UniZy</Text>
        <View style={styles.emptyView}></View>
      </View>
      
      
      <View style={styles.formContainer}>
       
      <Animated.View
          style={{
            transform: [{ translateY }],
            opacity,
            width: '100%',
          }}
        >
        <View style={styles.nameRow}>
    
      <View style={styles.login_container1}>
          <TextInput
            style={styles.personalEmailID_TextInput1}
            placeholder="First Name"
            placeholderTextColor="rgba(255, 255, 255, 0.48)"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>


        <View style={styles.login_container1}>
          <TextInput
            style={styles.personalEmailID_TextInput1}
           placeholder="Last Name"
            placeholderTextColor="rgba(255, 255, 255, 0.48)"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
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

        <View style={styles.password_container}>
          <TextInput
            style={styles.password_TextInput}
            placeholder="Personal Email ID"
            placeholderTextColor="rgba(255, 255, 255, 0.48)"
            value={username}
            onChangeText={setUsername}
          />

          <TouchableOpacity onPress={() => setShowInfo(!showInfo)}>
            <Image
              source={require('../../../assets/images/info_icon.png')}
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        {showInfo && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Important: Use your personal email address for signup. Your university email will be requested separately for student verification.
            </Text>
          </View>
        )}


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

        <TouchableOpacity onPress={handleSendOTP} style={styles.loginButton}>
                          <Text style={styles.loginText}>Send OTP</Text>
          </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginTop:16 }}>
        <Text style={styles.signupPrompt}>Already have an account? </Text>
        <TouchableOpacity onPress={handleLogin}>
        <Text style={styles.signupPrompt1}>Login</Text>
        </TouchableOpacity>
      </View>
     </Animated.View>
      </View>

    <View style={styles.stepIndicatorContainer}>
  {[0, 1, 2, 3].map((index) =>
    index === 0 ? (
      <LinearGradient
        key={index}
        colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0.5)']}
        style={styles.stepCircle}
      
      />
    ) : (
      <View key={index} style={[styles.stepCircle, styles.inactiveStepCircle]} />
    )
  )}
</View>
    {/* <View style={styles.stepIndicatorContainer}>
        {[0, 1, 2, 3].map((index) => (
          <LinearGradient
            key={index}
            colors={
              index === 0
                ? ['#FFFFFF', '#E0E0E0'] // active gradient
                : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)'] // inactive gradient
            }
            style={styles.stepCircle}
          />
        ))}
</View> */}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({

  infoContainer: {
  flexDirection: 'row',
  marginTop: 8,
  paddingLeft:6,
  paddingRight:6,
},
infoText: {
  color: '#FFFFFF7A',
  fontFamily: 'Urbanist-Medium',
  fontSize: 14,
  lineHeight: 20,
  flex: 1,
},

stepCircle: {
  width: 12,
  height: 12,
  borderRadius: 16,
  backgroundColor: 'rgba(255, 255, 255, 0.3)', 
},

activeStepCircle: {
  backgroundColor: '#FFFFFF', 
    width: 12,
    height: 12,
    flexShrink: 0,
    borderColor: '#ffffff4e',
    alignItems: 'center',
    borderRadius: 40,
    justifyContent: 'center',
     boxShadow: '0 0.833px 3.333px 0 rgba(0, 0, 0, 0.25);',
    shadowColor: '0 0.833px 3.333px rgba(0, 0, 0, 0.25)',
},

stepIndicatorContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 20,
  gap: 8,
},

// stepCircle: {
//   width: 12,
//   height: 12,
//   borderRadius: 6,
//   shadowColor: '#000',
//   shadowOffset: { width: 0, height: 1 },
//   shadowOpacity: 0.2,
//   shadowRadius: 1.5,
//   elevation: 2, // Android shadow
// },

// activeStepCircle: {
//   backgroundColor: '#FFFFFF',
//   shadowColor: '#000',
//   shadowOpacity: 0.25,
//   elevation: 2,
// 
  

//},

inactiveStepCircle: {
 backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    width: 12,
    height: 12,
    flexShrink: 0,
    borderColor: '#ffffff4e',
    alignItems: 'center',
    borderRadius: 40,
    justifyContent: 'center',
    boxShadow: '0 0.833px 3.333px 0 rgba(0, 0, 0, 0.25);',
    shadowColor: '0 0.833px 3.333px rgba(0, 0, 0, 0.25)',

},


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

  signupPrompt: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '400',
  },
   signupPrompt1: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
    fontWeight: '600',
    opacity: 2,
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1,
  },


  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingLeft:24
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
    marginTop:16,
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
    personalEmailID_TextInput1: {
    width: '84%',
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
    marginTop: 16,
  },
  password_TextInput: {
    width: '87%',
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
  },
});

export default SignupScreen;
