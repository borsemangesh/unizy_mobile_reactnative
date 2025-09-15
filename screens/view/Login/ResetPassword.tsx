import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ImageBackground,
  TouchableOpacity,
  Modal,
  Dimensions,
  Image,
  Animated,
  Easing,
  Platform,
  ToastAndroid,
} from 'react-native';
// import { BlurView } from '@react-native-community/blur';
// @ts-ignore
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
 
import GlassButton from '../Hello/GlassButton';
import ResetButton from '../Hello/ResetButton';
 
const { width } = Dimensions.get('window');
 
type RestPasswordScreenProps = {
  navigation: any;
};
 
const ResetPassword = ({ navigation }: RestPasswordScreenProps) => {
  const [username, setUsername] = useState<string>('');
  const [showPopup, setShowPopup] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const translateY = React.useRef(new Animated.Value(-300)).current; // small offset
  const opacity = React.useRef(new Animated.Value(1)).current;
  const slideUp = React.useRef(new Animated.Value(200)).current;
  const [error, setError] = useState("");
  
 
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1000,
 
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
 
  const animateAndGoBack = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -300,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 300,
        duration: 0,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      clickLoginListner(); 
    });
  };

  const clickLoginListner = () =>{
    if (Platform.OS === 'ios') {
      navigation.replace('LoginScreen');
    } else {
      navigation.navigate('LoginScreen');
    }
  }
  const handleSendResetLink = () => {
    console.log(`Send reset link to ${username}`);
    setShowPopup(true);
  };
 
  const handleLogin = () => {
    navigation.replace('LoginScreen');
  };
   const validateEmail = (text: string) => {
      setUsername(text);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
      if (text.length === 0) {
        setError("");
      } else if (!emailRegex.test(text)) {
        //setError("Please enter a valid email address");
        ToastAndroid.show("Please enter a valid email address", ToastAndroid.SHORT);
      } else {
        setError("");
      }
    };
 
  const closePopup = () => setShowPopup(false);
 
  return (
    <ImageBackground
      source={require('../../../assets/images/BGAnimationScreen.png')}
      style={styles.flex_1}
      resizeMode="cover"
      onLoad={() => setImageLoaded(true)}
    >
      <View style={styles.fullScreenContainer}>
        <Animated.View style={{ display: 'none' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View style={styles.backIconRow}>
              <Image
                source={require('../../../assets/images/back.png')}
                style={{ height: 24, width: 24 }}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
 
        <Text style={styles.unizyText}>UniZy</Text>
        <View style={styles.emptyView}></View>
      </View>
 
      {imageLoaded && (
        <View style={styles.formContainer}>
          <Animated.View
            style={{
              transform: [{ translateY }],
              opacity,
              width: '100%',
            }}
          >
            <Text style={styles.resetTitle}>Reset Password</Text>
 
            <View style={styles.privacyContainer}>
              <Text style={styles.termsText}>
                Enter your personal email address and we’ll send you a link to
                reset your password
              </Text>
            </View>
 
            <View style={styles.login_container}>
              <TextInput
                style={[styles.personalEmailID_TextInput,{color:'#fff'}]}
                placeholder="Personal Email ID"
                placeholderTextColor="rgba(255, 255, 255, 0.48)"
                value={username}
                maxLength={50}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={validateEmail}
              />
            </View>
 
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleSendResetLink}
            >
              <Text style={styles.loginText}>Send Reset Link</Text>
            </TouchableOpacity>
 
            <TouchableOpacity onPress={animateAndGoBack}>
              <Text style={styles.goBackText}>Go back</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
 
      <Modal
        visible={showPopup}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.overlay}>
          <BlurView
            style={{
              flex: 1,
              alignContent: 'center',
              justifyContent: 'center',
              width: '100%',
              alignItems: 'center',
            }}
            blurType="dark"
            blurAmount={1000}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
          >
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(0, 0, 0, 0.32)' },
              ]}
            />
 
            <View style={styles.popupContainer}>
              <Image
                source={require('../../../assets/images/success_icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.termsText1}>
                A password reset link has been sent to your university email.
                Please check your inbox (or spam folder) to continue.
              </Text>
 
              <TouchableOpacity
                style={styles.loginButton}
                onPress={clickLoginListner}
              >
                <Text style={styles.loginText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    </ImageBackground>
  );
};
 
const styles = StyleSheet.create({
  flex_1: {
    flex: 1,
    alignItems: 'center',
  },
  blurstyle: {
    backgroundColor: 'transparent',
  },
  topHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
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
    overflow: 'hidden',
  },
 
  resetTitle: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.02 * 17,
    textAlign: 'center',
    color: '#FFF',
    fontWeight: 600,
  },
 
  privacyContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
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
    marginTop: 16,
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
 
  goBackText: {
    color: 'rgba(255,255,255,0.48)',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 12,
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    overflow: 'hidden',
 
    backgroundColor: 'rgba(255,255,255,0.15)',
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
    paddingLeft: 24,
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
 
export default ResetPassword;
 