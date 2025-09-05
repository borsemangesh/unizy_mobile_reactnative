import React, { useEffect, useRef, useState } from 'react';
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
  Dimensions,
  Animated,
  Easing
} from 'react-native';
// import { launchCamera, launchImageLibrary } from "react-native-image-picker";

const { width } = Dimensions.get('window');

type ProfileScreenProps = {
  navigation: any;
};

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  
const [username, setUsername] = useState<string>('');
  const [showPopup, setShowPopup] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

   const translateY = useRef(new Animated.Value(-50)).current; // start above the screen
      const opacity = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0, // move to normal position
          duration: 2000, // slower, smoother
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1, // fade in
          duration: 2000,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]).start();
    }, []);
    

  //  const handleOpenCamera = () => {
  //   launchCamera(
  //     {
  //       mediaType: "photo",
  //       cameraType: "front",
  //       quality: 0.8,
  //     },
  //     (response) => {
  //       if (response.didCancel) return;
  //       if (response.assets && response.assets[0].uri) {
  //         setPhoto(response.assets[0].uri);
  //       }
  //     }
  //   );
  // };

  // const handleOpenGallery = () => {
  //   launchImageLibrary(
  //     {
  //       mediaType: "photo",
  //       quality: 0.8,
  //     },
  //     (response) => {
  //       if (response.didCancel) return;
  //       if (response.assets && response.assets[0].uri) {
  //         setPhoto(response.assets[0].uri);
  //       }
  //     }
  //   );
  // };


  const handleSendResetLink = () => {
    //navigation.navigate('VerifyScreen')
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

  {imageLoaded && (
      <View style={styles.formContainer}>
        <Animated.View
                  style={{
                    transform: [{ translateY }],
                    opacity,
                    width: '100%',
                  }}
                >
        <Text style={styles.resetTitle}>Add a photo</Text>
        <View style={styles.privacyContainer}>
          <Text style={styles.termsText}>Personalize your account with a photo. You can always change it later.</Text>
        </View>

 {/* <View style={styles.avatarContainer}>
  <View style={styles.bigCircle}>
    <Image
      source={require("../../../assets/images/add_photo.png")}
      style={styles.logo}
      resizeMode="contain"
    />
  </View>

<TouchableOpacity style={styles.cameraButton} onPress={handleOpenCamera}>
    <Image
      source={require("../../../assets/images/camera_icon.png")}
      style={styles.cameraIcon}
      resizeMode="contain"
    />
  </TouchableOpacity>
</View> */}



{/* <View style={styles.avatarContainer}>
    <Image
      source={require("../../../assets/images/add_photo.png")}
      style={styles.logo}
      resizeMode="contain"
    />

  <TouchableOpacity style={styles.cameraButton} onPress={handleOpenCamera}>
    <Image
      source={require("../../../assets/images/camera_icon.png")}
      style={styles.cameraIcon}
      resizeMode="contain"
    />
  </TouchableOpacity>
</View> */}

<View style={styles.avatarContainer}>
  <View style={styles.bigCircle}>
    <Image
      source={require("../../../assets/images/add_photo.png")}
      style={styles.logo}
      resizeMode="contain"
    />

    {/* ✅ Camera button inside the circle */}
    <TouchableOpacity style={styles.cameraButton} onPress={handleSendResetLink}>
      <Image
        source={require("../../../assets/images/camera_icon.png")}
        style={styles.cameraIcon}
        resizeMode="contain"
      />
    </TouchableOpacity>
  </View>
</View>

         <TouchableOpacity style={styles.loginButton} onPress={handleSendResetLink}>
            <Text style={styles.loginText}>Continue</Text>
          </TouchableOpacity>
          </Animated.View>
      </View>
       )}
       <View style={styles.stepIndicatorContainer}>
             {[0, 1, 2, 3].map((index) => (
               <View
                 key={index}
                 style={[
                   styles.stepCircle,
                   index === 3 && styles.activeStepCircle, 
                 ]}
               />
             ))}
           </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({

 bigCircle: {
  width: 120,
  height: 120,
  borderRadius: 60,
  alignItems: "center",
  justifyContent: "center",
  position: "relative", // ✅ allows absolute children
},
cameraButton: {
  position: "absolute",
  bottom: 0, // ✅ overlap bottom edge
  right: 0,  // ✅ overlap right edge
  width: 40,
  height: 40,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  elevation: 0, // small shadow for floating look (Android)
},
cameraIcon: {
  width: 36,
  height: 36,
},

  avatarContainer: {
  alignItems: "center",
  justifyContent: "center",
  marginTop: 12,
},
// bigCircle: {
//   width: 120,
//   height: 120,
//   borderRadius: 60,
//   alignItems: "center",
//   justifyContent: "center",
//   position: "relative", // ✅ ensures cameraButton anchors correctly
// },
logo: {
  width: 120,
  height: 120,
},
// cameraButton: {
//   position: "absolute",
//   bottom: 5,
//   right: 1,
//   width: 36,
//   height: 36,
//   borderRadius: 18,
//   alignItems: "center",
//   justifyContent: "center",
// },
// cameraIcon: {
//   width: 36,
//   height: 36,
// },
  flex_1: {
    flex: 1,
    alignItems: 'center',
  },

stepIndicatorContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 20,
  gap: 8, // if your RN version supports it
},

stepCircle: {
  width: 12,
  height: 12,
  borderRadius: 10,
  backgroundColor: 'rgba(255, 255, 255, 0.3)', // inactive circle
},

activeStepCircle: {
  backgroundColor: '#FFFFFF', // active circle
},

otpContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '80%',
  alignSelf: 'center',
  gap: 10, // works in RN 0.71+, otherwise use marginRight

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
  borderWidth: 0.6,
  borderColor: '#ffffff2c',
  elevation: 0,
  backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.11) inset -1px 0px 5px 1px',
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
    fontStyle: 'normal',
    fontWeight: 500,
    letterSpacing: 1,
    width: '100%',
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

export default ProfileScreen;
