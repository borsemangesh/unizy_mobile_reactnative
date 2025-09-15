import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';

const { width } = Dimensions.get('window');

const ResendPopup = ({ navigation }: any) => {
  const [username, setUsername] = useState<string>('');

  const handleSendResetLink = () => {
    console.log(`Send reset link to ${username}`);
    // Optionally, close the popup or show confirmation
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/BGAnimationScreen.png')}
      style={styles.flex_1}
      resizeMode="cover"
    >
      {/* Overlay to make it feel like popup */}
      <View>
        <View style={styles.popupContainer}>
          <Image
            source={require('../../../assets/images/success_icon.png')} // <-- add your image here
            style={styles.logo}
            resizeMode="contain"/>

          
          <Text style={styles.termsText}>
           A password reset link has been sent to your university email. Please check your inbox (or spam folder) to continue.
          </Text>

          <TouchableOpacity onPress={handleSendResetLink} style={styles.buttonWrapper}>
            {/* <Text style={styles.buttonText}>Back to Login</Text> */}
              <ImageBackground
                source={require('../../../assets/images/login_button.png')}
                style={styles.buttonBackground}
                imageStyle={{ borderRadius: 24 }}>
              <Text style={styles.buttonText}>Back to Login</Text>
            </ImageBackground>

          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  flex_1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent background
  },
   logo: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },
  popupContainer: {
    width: width * 0.85,
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  unizyTitle: {
    fontFamily: 'Monument Extended',
    fontSize: 25,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  resetTitle: {
    fontFamily: 'Urbanist',
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  termsText: {
    color: 'rgba(255,255,255,0.48)',
    fontFamily: 'Urbanist',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 14,
    color: '#FFF',
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },
  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
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
  buttonBackground: {
    width: '100%',
    paddingTop: 6,
    paddingBottom:6,
    paddingRight:20,
    paddingLeft:20,

    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    overflow: 'hidden', // ensures image respects borderRadius
  },
  buttonText: {
    color: '#ffffff',
    fontFamily: 'Urbanist',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default ResendPopup;
