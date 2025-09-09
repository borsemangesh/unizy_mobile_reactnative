import React, { useState, useEffect,useRef  } from 'react';
import {
  View,
  TextInput,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  StyleSheet,
Dimensions,
Platform,

} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';


type VerifyScreenProps = {
  navigation: any;
  
};
const { width, height } = Dimensions.get('window');


const VerifyScreen = ({ navigation }: VerifyScreenProps) => {
  const [username, setUsername] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

     const inputs = useRef<Array<TextInput | null>>([]);
    
      const handleChange = (text: string, index: number) => {
        if (text && index < inputs.current.length - 1) {
          inputs.current[index + 1]?.focus();
        } else if (!text && index > 0) {
          inputs.current[index - 1]?.focus(); 
        }
      };


const slideAnim = useRef(new Animated.Value(-height)).current; 
const opacity = useRef(new Animated.Value(0)).current;
const containerHeight = useRef(new Animated.Value(400)).current; // start with 400
const translateY = useRef(new Animated.Value(-height)).current
const containerHeight1 = useRef(new Animated.Value(400)).current; // start with 400


useEffect(() => {
  if (imageLoaded && !showOtp) {
  
    Animated.parallel([
        Animated.timing(containerHeight, {
            toValue: 195, // we’ll interpolate this to "auto"
            duration: 400,
            easing: Easing.out(Easing.exp),
            useNativeDriver: false, // height animation can't use native driver
          }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }
}, [imageLoaded, showOtp]);



  // const startAnimation = () => {
   
  //   Animated.timing(translateY, {
  //     toValue: 0,
  //     duration: 1000,
  //     easing: Easing.out(Easing.exp),
  //     useNativeDriver: true,
  //   }).start();
    
  // };

const startAnimation = () => {
  Animated.parallel([
    Animated.timing(containerHeight1, {
      toValue: 325, // shrink height
      duration: 400,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false, // must be false for height
    }),
    Animated.timing(translateY, {
      toValue: 0, // slide in content
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }),
  ]).start();
};


  const sendOtp = () => {
    setShowOtp(true);
    startAnimation();
  };
  const handleSendResetLink = () => {
  
    if (Platform.OS === 'ios') {
      navigation.replace('ProfileScreen');
    } else {
      navigation.navigate('ProfileScreen');
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/BGAnimationScreen.png')}
      style={styles.flex_1}
      resizeMode="cover"
      onLoad={() => setImageLoaded(true)}>
      <View style={styles.fullScreenContainer}>
        <Text style={styles.unizyText}>UniZy</Text>
        <View style={styles.emptyView}></View>
      </View>

      {imageLoaded && !showOtp && (
        <Animated.View style={[styles.formContainer ,{ overflow: 'hidden' ,height:containerHeight}]}>
       <Animated.View
      style={[
        { width: '100%', alignItems: 'center' },
        { transform: [{ translateY: slideAnim }], opacity },
      ]}
    >
            

          <Text style={styles.resetTitle}>Verify University Email ID</Text>
          <View style={styles.login_container}>
            <TextInput
              style={styles.personalEmailID_TextInput}
              placeholder={'University Email ID'}
              placeholderTextColor={'rgba(255, 255, 255, 0.48)'}
              value={username}
              onChangeText={usernameText => setUsername(usernameText)}
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={sendOtp}>
            <Text style={styles.loginText}>Send OTP</Text>
          </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

     {showOtp && (
<Animated.View style={[styles.formContainer, { overflow: 'hidden',height: containerHeight1}]}>
    <Animated.View
      style={[
        { width: '100%', alignItems: 'center' },
        { transform: [{ translateY: translateY }] },
      ]}>

      <Text style={styles.resetTitle}>Verify University Email ID</Text>

      <View style={styles.privacyContainer}>
         <Text style={styles.termsText}>
                  We have sent a 4-digit code to{' '}
                  <Text style={styles.resendText2}>abc@gmail.com</Text>
                </Text>
      </View>

      <View style={styles.otpContainer}>
        {[0, 1, 2, 3].map((_, index) => (
          <TextInput
            key={index}
          ref={(ref) => {
            inputs.current[index] = ref; 
          }}
          style={styles.otpBox}
          keyboardType="number-pad"
          maxLength={1}
          onChangeText={(text) => handleChange(text, index)}
          returnKeyType="next"
          textAlign="center"
          />
        ))}
      </View>
    
      <TouchableOpacity
        style={styles.loginButton1}
        onPress={handleSendResetLink}>
        <Text style={styles.loginText}>Verify & Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ flexDirection: 'row' ,marginTop:6}}>
        <Text style={styles.resendText}>Didn’t receive a code? </Text>
        <Text style={styles.resendText1}>Resend Code</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ flexDirection: 'row' ,marginTop:6}}>
        <Text style={styles.goBackText}>Entered wrong email? </Text>
        <Text style={styles.goBackText1}>Go back</Text>
      </TouchableOpacity>
    </Animated.View>
  </Animated.View>
)}

          <View style={styles.stepIndicatorContainer}>
                                  {[0, 1, 2, 3].map((index) =>
                                    index === 2 ? (
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
                     

    </ImageBackground>
  );
};

   const styles = StyleSheet.create({
     flex_1: {
       flex: 1,
       alignItems: 'center',
     },
   
      resendText2: {
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    fontSize: 14,
    paddingTop:2,
    textAlign: 'center',
    lineHeight: 19.6,
    letterSpacing: 0,
     opacity: 2,
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1,
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
  marginTop: 12,
  gap: 6,
},

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

   otpContainer: {
     flexDirection: 'row',
     justifyContent: 'space-evenly',
     width: '80%',
     alignSelf: 'center',
     gap: 10, 
    marginTop:12
   },
   
   otpBox: {
     width: 48,
     height: 48,
     borderRadius: 12,
     paddingTop: 8,
     paddingRight: 12,
     paddingBottom: 8,
     paddingLeft: 12,
     textAlign: 'center',
     fontSize: 18,
     color: '#fff',
      fontWeight: '600',
      borderWidth: 1,
      borderColor: '#ffffff2c',
      elevation: 0,
      backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.02)inset -1px 0px 15px 1px',  
    
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
       
     },
   
     resetTitle: {
     fontFamily: 'Urbanist-SemiBold',      
     fontSize: 17,                
     lineHeight: 22,        
     letterSpacing: -0.02 * 17,    
     textAlign: 'center',       
     color: '#FFF',
     fontWeight:600
   },
   
     privacyContainer: {
       width: '100%',
       alignItems: 'center',
       marginTop:16
     },
   
     termsText: {
       color: 'rgba(255,255,255,0.48)',
       fontFamily: 'Urbanist-Regular',
       fontSize: 14,
       textAlign: 'center',
       lineHeight: 22,
       paddingHorizontal: 10,
     },
   
     
    login_container: {
        marginTop:16,
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
   
   
      loginButton1: {
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
       borderWidth: 0.5,
       borderColor: '#ffffff2c',
       marginTop: 16,
     },
   
     resendText: {
       color: 'rgba(255,255,255,0.48)',
       fontFamily: 'Urbanist-Regular',
       fontWeight: '400',
       fontSize: 14,
       paddingTop:12,
       textAlign: 'center',
       lineHeight: 19.6,
       letterSpacing: 0,
     },
   
     resendText1: {
       color: 'rgba(255,255,255,0.48)',
       fontFamily: 'Urbanist-SemiBold',
       fontWeight: '600',
       fontSize: 14,
       paddingTop:12,
       textAlign: 'center',
       lineHeight: 19.6,
       letterSpacing: 0,
       opacity: 2,
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1,
     },
   
       goBackText: {
       color: 'rgba(255,255,255,0.48)',
       fontFamily: 'Urbanist-Regular',
       fontWeight: '400',
       fontSize: 14,
       paddingTop:12,
       textAlign: 'center',
       lineHeight: 19.6,
       letterSpacing: 0,
     },
   
       goBackText1: {
       color: 'rgba(255,255,255,0.48)',
       fontFamily: 'Urbanist-SemiBold',
       fontWeight: '600',
       fontSize: 14,
       paddingTop:12,
       textAlign: 'center',
       lineHeight: 19.6,
       letterSpacing: 0,
        opacity: 2,
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1,
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

    paddingTop:20,
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
   }); 


export default VerifyScreen;

