import { useIsFocused } from '@react-navigation/native';
import React, { useState,useRef,useEffect } from 'react';
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
  Animated,
  Dimensions,
  Easing,
  LayoutChangeEvent,
  Platform
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

type OTPScreenProps = {
  navigation: any;
};

const OTPScreen = ({ navigation }: OTPScreenProps) => {
  
const [username, setUsername] = useState<string>('');
const [showPopup, setShowPopup] = useState(false);
const [imageLoaded, setImageLoaded] = useState(false);
const { width, height } = Dimensions.get('window');
const [useAutoHeight, setUseAutoHeight] = useState(false);
const translateY = useRef(new Animated.Value(-50)).current;
const cardHeight = useRef(new Animated.Value(500)).current;

  const handleLayout = (e: LayoutChangeEvent) => {
    if (!measuredHeight) {
      setMeasuredHeight(e.nativeEvent.layout.height);
    }
  };

const [measuredHeight, setMeasuredHeight] = useState(0);
const slideAnim = useRef(new Animated.Value(-height)).current;
const opacity = useRef(new Animated.Value(0)).current;
const containerHeight = useRef(new Animated.Value(600)).current; // start with 400
const [isExpanded, setIsExpanded] = useState(false);
const inputs = useRef<Array<TextInput | null>>([]);


const heightAnim = useRef(new Animated.Value(0)).current;
  const animatedHeight = heightAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['40%', '50%', '50%'],
    extrapolate: 'clamp',
  });

  const handleChange = (text: string, index: number) => {
    if (text && index < inputs.current.length - 1) {
      inputs.current[index + 1]?.focus(); 
    } else if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
      Animated.timing(heightAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.bezier(0.42, 0, 0.58, 1), // natural ease
        useNativeDriver: false,
      }).start();
    }, []);


       useEffect(() => {
        if (imageLoaded ) {
          Animated.timing(containerHeight, {
            toValue: 400, 
            duration: 400,
            easing: Easing.out(Easing.exp),
            useNativeDriver: false, 
          })
          .start(() => {
            setIsExpanded(true); 
            Animated.parallel([
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
          });

          Animated.sequence([
                  Animated.timing(cardHeight, {
                    toValue: 400, // shrink target
                    duration: 1000,
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
                cardHeight.stopAnimation();
              };

        }
      }, [imageLoaded]);

const handlesignup = () =>{
  if (Platform.OS === 'ios') {
    navigation.replace('Signup');
  } else {
    navigation.navigate('Signup');
  }

}

  const handleSendResetLink = () => {
    if (Platform.OS === 'ios') {
      navigation.replace('VerifyScreen');
    } else {
      navigation.navigate('VerifyScreen');
    }
  };


return (
    <ImageBackground
      source={require('../../../assets/images/bganimationscreen.png')}
      style={styles.flex_1}
      resizeMode="cover"
      onLoad={() => setImageLoaded(true)}>

   <View style={styles.fullScreenContainer}>
      

        <Text style={styles.unizyText}>UniZy</Text>
        <View style={styles.emptyView}></View>
      </View>

  {imageLoaded && (

 <Animated.View style={[styles.formContainer, { height: animatedHeight }]}>
<Animated.View
         style={[
        { width: '100%', alignItems: 'center' },
        { transform: [{ translateY: slideAnim }], opacity },
      ]}
        >

        <Text style={styles.resetTitle}>Verify Personal Email ID</Text>
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
          onChangeText={(text) => {
            const digit = text.replace(/[^0-9]/g, '');
            handleChange(digit, index);
          }}
          returnKeyType="next"
          textAlign="center"
          secureTextEntry={true}
        />
      ))}
    </View>

         <TouchableOpacity style={styles.loginButton} onPress={handleSendResetLink}>
            <Text style={styles.loginText}>Verify & Continue</Text>
          </TouchableOpacity>

    <TouchableOpacity style={{ flexDirection: 'row',justifyContent:"center",marginTop:16 }}>
      <Text style={styles.resendText}>Didn’t receive a code? </Text>
      <Text style={styles.resendText1}>
        Resend Code
      </Text>
    </TouchableOpacity>

        <TouchableOpacity style={{ flexDirection: 'row' ,justifyContent:"center",marginTop:16}}>
          <Text style={styles.goBackText}>Entered wrong email? </Text>
          <TouchableOpacity onPress={handlesignup}>
           <Text style={styles.goBackText1}>Go back</Text>
           </TouchableOpacity>
        </TouchableOpacity>
</Animated.View>
      </Animated.View>
  )}

    

           <View style={styles.stepIndicatorContainer}>
             {[0, 1, 2, 3].map((index) =>
               index === 1 ? (
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
  width: '70%',
  alignSelf: 'center',
  gap: 6, // works in RN 0.71+, otherwise use marginRight
  marginTop:16
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
      overflow: 'hidden'
   
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
    fontWeight:500,
    letterSpacing: 1,
    width: '100%',
  },


   loginButton1: {
    width: '100%',
    marginBottom: 4, // Increased space below button
  },

  resendText: {
    color: 'rgba(255,255,255,0.48)',
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    fontSize: 14,
    paddingTop:2,
    textAlign: 'center',
    lineHeight: 19.6,
    letterSpacing: 0,
  },

  resendText1: {
    color: 'rgba(255,255,255,0.48)',
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


    goBackText: {
    color: 'rgba(255,255,255,0.48)',
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    fontSize: 14,
    paddingTop:4,
    textAlign: 'center',
    lineHeight: 19.6,
    letterSpacing: 0,
  },

    goBackText1: {
    color: 'rgba(255,255,255,0.48)',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    fontSize: 14,
    paddingTop:4,
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

  popupContainer: {
    width: width * 0.85,
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
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
});

export default OTPScreen;



