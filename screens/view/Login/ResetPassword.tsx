// import React, { useState } from 'react';
// import {
//   View,
//   TextInput,
//   StyleSheet,
//   Text,
//   ImageBackground,
//   TouchableOpacity,
//   Modal,
//   Dimensions,
//   Image,
//   Alert,
// } from 'react-native';
// import { BlurView } from '@react-native-community/blur';
// import LinearGradient from 'react-native-linear-gradient';

// import GlassButton from '../Hello/GlassButton';
// import ResetButton from '../Hello/ResetButton';


// const { width } = Dimensions.get('window');

// const ResetPassword = () => {
//   const [username, setUsername] = useState<string>('');
//   const [showPopup, setShowPopup] = useState(false);

//   const handleSendResetLink = () => {
//     console.log(`Send reset link to ${username}`);
//     setShowPopup(true);
//   };

//   const closePopup = () => setShowPopup(false);

//   return (
//     <ImageBackground
//       source={require('../../../assets/images/BGAnimationScreen.png')}
//       style={styles.flex_1}
//       resizeMode="cover"
//     >
//       <View style={styles.fullScreenContainer}>
//         <Text style={styles.unizyText}>UniZy</Text>
//       </View>

//       <View style={styles.formContainer}>
//         <Text style={styles.resetTitle}>Reset Password</Text>

//         <View style={styles.privacyContainer}>
//           <Text style={styles.termsText}>
//             Enter your personal email address and we’ll send you a link to reset
//             your password
//           </Text>
//         </View>

//         <LinearGradient
//           colors={['rgba(255,255,255,0.20)', 'rgba(255,255,255,0.10)']}
//           style={styles.login_container}
//         >
//           <TextInput
//             style={styles.personalEmailID_TextInput}
//             placeholder={'Personal Email ID'}
//             placeholderTextColor={'rgba(255, 255, 255, 0.48)'}
//             value={username}
//             onChangeText={(usernameText) => setUsername(usernameText)}
//           />
//         </LinearGradient>

//         {/* <TouchableOpacity onPress={handleSendResetLink} style={styles.loginButton}>
//           <Text style={styles.loginText}>Send Reset Link</Text>
//         </TouchableOpacity> */}

//         <ResetButton title="Send Reset Link" onPress={handleSendResetLink} style={styles.loginButton} />


        
//        <TouchableOpacity>
//     <Text style={styles.goBackText}>Go back </Text>
// </TouchableOpacity>
//       </View>
//       <Modal
//         visible={showPopup}
//         transparent
//         animationType="fade"
//         onRequestClose={closePopup}
//       >
//         <View style={styles.overlay}>
//           <BlurView
//             style={StyleSheet.absoluteFill}
//             blurType="dark"
//             blurAmount={15}
//             reducedTransparencyFallbackColor="rgba(0,0,0,0.7)"
//           />
//           <View style={styles.popupContainer}>
//             <Image
//               source={require('../../../assets/images/success_icon.png')}
//               style={styles.logo}
//               resizeMode="contain"
//             />
//             <Text style={styles.termsText}>
//               A password reset link has been sent to your university email.
//               Please check your inbox (or spam folder) to continue.
//             </Text>

//             {/* <TouchableOpacity onPress={closePopup} style={styles.loginButton}>
//               <Text style={styles.loginText}>Back to Login</Text>
//             </TouchableOpacity> */}

//         <GlassButton title="Back to Login" onPress={closePopup} style={styles.loginButton} />

//           </View>
//         </View>
//       </Modal>
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   flex_1: {
//     flex: 1,
//     alignItems: 'center',
//     padding: 16,
//   },

//   fullScreenContainer: {
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginVertical: 20,
//   },
//   unizyText: {
//     color: '#FFFFFF',
//     fontFamily: 'MonumentExtended-Regular',
//     fontSize: 24,
//     fontWeight: '400',
//     textAlign: 'center',
//   },

//   formContainer: {
//     width: '90%',
//     padding: 20,
//     borderRadius: 24,
//     backgroundColor: 'rgba(255,255,255,0.06)',
//     alignItems: 'center',
//   },
//   resetTitle: {
//     fontFamily: 'Urbanist',
//     fontSize: 18,
//     color: '#FFF',
//     textAlign: 'center',
//     fontWeight: '600',
//     marginBottom: 10,
//   },
//   privacyContainer: {
//     width: '100%',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   termsText: {
//     color: 'rgba(255,255,255,0.48)',
//     fontFamily: 'Urbanist',
//     fontSize: 14,
//     textAlign: 'center',
//     lineHeight: 20,
//     paddingVertical: 10,
//   },

//   login_container: {
//     width: '100%',
//     height: 50,
//     borderRadius: 12,
//     justifyContent: 'center',
//     paddingHorizontal: 15,
//     marginVertical: 12,
//   },
//   personalEmailID_TextInput: {
//     width: '100%',
//     fontFamily: 'Urbanist-regular',
//     fontSize: 16,
//     color: '#FFFFFF',
    
//   },

//   loginButton: {
//     width: '100%',

//   },
//   loginText: {
//     color: '#002050',
//     fontFamily: 'Urbanist-regular',
//     fontSize: 17,
//     fontWeight: '600',
//     letterSpacing: 0.5,
//   },

//   goBackWrapper: {
//     width: '100%',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   goBackButton: {
   
//   },
//  goBackText: {
//   color: 'rgba(255,255,255,0.48)',
//   fontFamily: 'Urbanist',
//   fontWeight: '600',
//   fontSize: 14,
//   textAlign: 'center',
//   lineHeight: 19.6,
//   letterSpacing: 0,
//    marginVertical: 12,
// },

//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   popupContainer: {
//     width: width * 0.85,
//     padding: 20,
//     borderRadius: 24,
//     backgroundColor: 'rgba(255, 255, 255, 0.08)',
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.1)',
//     alignItems: 'center',
//   },
//   logo: {
//     width: 64,
//     height: 64,
//     marginBottom: 20,
//   },
// });

// export default ResetPassword;


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
} from 'react-native';
// import { BlurView } from '@react-native-community/blur';
// @ts-ignore
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';

import GlassButton from '../Hello/GlassButton';
import ResetButton from '../Hello/ResetButton';

const { width } = Dimensions.get('window');

const ResetPassword = () => {
  const [username, setUsername] = useState<string>('');
  const [showPopup, setShowPopup] = useState(false);

  const handleSendResetLink = () => {
    console.log(`Send reset link to ${username}`);
    setShowPopup(true);
  };

  const closePopup = () => setShowPopup(false);

  return (
    <ImageBackground
      source={require('../../../assets/images/BGAnimationScreen.png')}
      style={styles.flex_1}
      resizeMode="cover"
    >
      <View style={styles.fullScreenContainer}>
        <Text style={styles.unizyText}>UniZy</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Reset Password */}
        <Text style={styles.resetTitle}>Reset Password</Text>

        {/* Info Text */}
        <View style={styles.privacyContainer}>
          <Text style={styles.termsText}>
            Enter your personal email address and we’ll send you a link to reset
            your password
          </Text>
        </View>

        {/* Email Input */}
        <LinearGradient
          colors={['rgba(255,255,255,0.20)', 'rgba(255,255,255,0.10)']}
          style={styles.login_container}
        >
          <TextInput
            style={styles.personalEmailID_TextInput}
            placeholder={'Personal Email ID'}
            placeholderTextColor={'rgba(255, 255, 255, 0.48)'}
            value={username}
            onChangeText={(usernameText) => setUsername(usernameText)}
          />
        </LinearGradient>

        {/* Send Reset Link */}
        <ResetButton
          title="Send Reset Link"
          onPress={handleSendResetLink}
          style={styles.loginButton}
        />

        {/* Go Back */}
        <TouchableOpacity>
          <Text style={styles.goBackText}>Go back</Text>
        </TouchableOpacity>
      </View>

      {/* Popup */}
      <Modal
        visible={showPopup}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.overlay}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={15}
            reducedTransparencyFallbackColor="rgba(0,0,0,0.8)"
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
            <GlassButton
              title="Back to Login"
              onPress={closePopup}
              style={styles.loginButton1}
            />
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
  fullScreenContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  unizyText: {
    color: '#FFFFFF',
    fontFamily: 'MonumentExtended-Regular',
    fontSize: 24,
    fontWeight: '400',
    textAlign: 'center',
  },

  formContainer: {
    width: '90%',
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },

  // resetTitle: {
  //   fontFamily: 'Urbanist',
  //   fontSize: 18,
  //   color: '#FFF',
  //   textAlign: 'center',
  //   fontWeight: '600',
  //   marginBottom: 20, // Increased spacing below title
  // },

  resetTitle: {
  fontFamily: 'Urbanist',      // font-family: Urbanist
   fontWeight: 'bold',          // font-style: SemiBold → normal in RN
  fontSize: 17,                 // font-size: 17px
  lineHeight: 17 * 1.4,         // line-height: 140% of font-size
  letterSpacing: -0.02 * 17,    // letter-spacing: -2% of font-size
  textAlign: 'center',          // text-align: center
  color: '#FFF',
  marginBottom: 20,
},

  privacyContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20, // Increased space below info text
  },

  termsText: {
    color: 'rgba(255,255,255,0.48)',
    fontFamily: 'Urbanist-regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },

  termsText1: {
    color: 'rgba(255,255,255,0.48)',
    fontFamily: 'Urbanist-regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
     marginBottom: 20, 
  },

  login_container: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 20, // Increased space below input
  },

  personalEmailID_TextInput: {
    width: '100%',
    fontFamily: 'Urbanist-regular',
    fontSize: 16,
    color: '#FFFFFF',
  },

  loginButton: {
    width: '100%',
    marginBottom: 2, // Increased space below button
  },

   loginButton1: {
    width: '100%',
    marginBottom: 4, // Increased space below button
  },

  goBackText: {
    color: 'rgba(255,255,255,0.48)',
    fontFamily: 'Urbanist',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 19.6,
    letterSpacing: 0,
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
});

export default ResetPassword;

