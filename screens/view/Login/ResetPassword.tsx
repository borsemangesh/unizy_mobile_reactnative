import React, { useState } from 'react';
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
  Alert
} from 'react-native';
import { BlurView } from '@react-native-community/blur';


const { width } = Dimensions.get('window');

const ResetPassword = () => {
  const [username, setUsername] = useState<string>('');
  const [showPopup, setShowPopup] = useState(false); // toggle popup

  const handleSendResetLink = () => {
    console.log(`Send reset link to ${username}`);
    setShowPopup(true); // show popup
  };

  const closePopup = () => setShowPopup(false);

  return (
    <ImageBackground
      source={require('../../../assets/images/BGAnimationScreen.png')}
      style={styles.flex_1}
      resizeMode="cover">

      <View style={styles.formContainer}>
        <Text style={styles.resetTitle}>Reset Password</Text>

        <View style={styles.privacyContainer}>
          <Text style={styles.termsText}>
            Enter your personal email address and we’ll send you a link to reset your password
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Personal Email ID"
          placeholderTextColor="rgba(255, 255, 255, 0.48)"
          value={username}
          onChangeText={setUsername}
        />

        <TouchableOpacity onPress={handleSendResetLink} style={styles.buttonWrapper}>
            <ImageBackground
                      source={require('../../../assets/images/login_button.png')}
                      style={styles.buttonBackground}
                      imageStyle={{ borderRadius: 24 }}>
                      <Text style={styles.buttonText}>Send Reset Link</Text>
                    </ImageBackground>
          {/* <Text style={styles.buttonText}>Send Reset Link</Text> */}
        </TouchableOpacity>

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
                    }}>Go back
                  </Text>
                </TouchableOpacity>
      </View>
      <Modal
        visible={showPopup}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.overlay}>
           <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark" // or 'light' based on design
            blurAmount={15}
            reducedTransparencyFallbackColor="rgba(0,0,0,0.7)"
          />
          <View style={styles.popupContainer}>
            <Image
              source={require('../../../assets/images/success_icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.termsText}>
              A password reset link has been sent to your university email. Please check your inbox (or spam folder) to continue.
            </Text>

            <TouchableOpacity onPress={closePopup} style={styles.buttonWrapper1}>
              <ImageBackground
                source={require('../../../assets/images/login_button.png')}
                style={styles.buttonBackground}
                imageStyle={{ borderRadius: 24 }}>
            <Text style={styles.buttonText}>Back to Login</Text>
            </ImageBackground>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  flex_1: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },

  unizyTitle: {
    fontFamily: 'Monument Extended',
    fontSize: 25,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
   buttonBackground: {
    width: 320,
    height:48,
    paddingTop: 6,
    paddingBottom:6,
    paddingRight:20,
    paddingLeft:20,
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
  formContainer: {
    width: '90%',
    padding: 16,
    alignItems: 'center',
    borderRadius: 24,
     marginTop: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  resetTitle: {
    fontFamily: 'Urbanist',
    fontSize: 17,
    color: '#FFF',
    textAlign: 'center',
  },
  privacyContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 1,
  },
  termsText: {
    color: 'rgba(255,255,255,0.48)',
    fontFamily: 'Urbanist',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  input: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 14,
    color: '#FFF',
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },

   buttonWrapper1: {
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
  // buttonText: {
  //   width: '100%',
  //   padding: 10,
  //   textAlign: 'center',
  //   borderRadius: 24,
  //   fontFamily: 'Urbanist',
  //   fontSize: 14,
  //   color: '#002050',
  //   backgroundColor: 'rgba(255,255,255,0.56)',
  //   borderWidth: 1,
  //   borderColor: '#ffffff3d',
  // },
  goBackText: {
    color: 'rgba(255,255,255,0.48)',
    fontFamily: 'Urbanist',
    fontSize: 14,
    marginTop: 5,
  },

  // Popup styles
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // dim background
  },
  popupContainer: {
  width: width * 0.85,
  padding: 20,
  borderRadius: 24,
  backgroundColor: 'rgba(255, 255, 255, 0.08)', // translucent white
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.)', // subtle border for glass look
  alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },
});

export default ResetPassword;
