import { BlurView } from '@react-native-community/blur';
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
 import { launchCamera, launchImageLibrary } from "react-native-image-picker";
 import { PermissionsAndroid, Platform } from "react-native";
import LinearGradient from 'react-native-linear-gradient';


const { width } = Dimensions.get('window');

type ProfileScreenProps = {
  navigation: any;
};

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  
  const [showPopup, setShowPopup] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const { width, height } = Dimensions.get('window');
  const [showButton, setShowButton] = useState(false);
  const scaleY = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-height)).current; 
  const closePopup = () => setShowPopup(false);



//added after
const [measuredHeight, setMeasuredHeight] = useState(0);
const [useAutoHeight, setUseAutoHeight] = useState(false);
const cardHeight = useRef(new Animated.Value(250)).current; // initial collapsed height
const [hasExpanded, setHasExpanded] = useState(false);

  const containerHeight = useRef(new Animated.Value(400)).current; // start with 400

    
    // useEffect(() => {
    //   Animated.parallel([
    //     Animated.timing(slideAnim, {
    //       toValue: 0, 
    //       duration: 1000,
    //       easing: Easing.out(Easing.exp),
    //       useNativeDriver: true,
    //     }),
    //     Animated.timing(opacity, {
    //       toValue: 1,
    //       duration: 1000,
    //       easing: Easing.out(Easing.exp),
    //       useNativeDriver: true,
    //     }),
    //   ]).start();
    // }, []);


     useEffect(() => {
    if (imageLoaded && !showPopup) {
      // First: animate container height from 400 → content height
      Animated.timing(containerHeight, {
        toValue: 350, // we’ll interpolate this to "auto"
        duration: 400,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false, // height animation can't use native driver
      }).start(() => {
        // After height anim → run your existing content animation
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [imageLoaded, showPopup]);

 useEffect(() => {
    if (photo) {
      setShowButton(true);
      Animated.timing(scaleY, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowButton(false));
    }
  }, [photo]);

   const handleLogin = () => {
    if (Platform.OS === 'ios') {
      navigation.replace('LoginScreen');
    } else {
      navigation.navigate('LoginScreen');
    }
};

const requestCameraPermission = async () => {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "App needs access to your camera",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    return true;
  }
};


const handleSelectImage = async () => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return;

  Alert.alert(
    "Select Option",
    "Choose a source",
    [
      {
        text: "Camera",
        onPress: () => {
          launchCamera(
            {
              mediaType: "photo",
              cameraType: "front",
              quality: 0.8,
            },
            (response) => {
              if (response.didCancel) return;
              if (response.assets && response.assets[0].uri) {
                setPhoto(response.assets[0].uri);
              }
            }
          );
        },
      },
      {
        text: "Gallery",
        onPress: () => {
          launchImageLibrary(
            {
              mediaType: "photo",
              quality: 0.8,
            },
            (response) => {
              if (response.didCancel) return;
              if (response.assets && response.assets[0].uri) {
                setPhoto(response.assets[0].uri);
              }
            }
          );
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ],
    { cancelable: true }
  );
};


const handlePopup = () => {
    setShowPopup(true);
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



     <Animated.View
        style={[
          styles.formContainer,
          { overflow: 'hidden', height: containerHeight },
        ]}
      >
        <Animated.View
                  style={[
        { width: '100%', alignItems: 'center' },
        { transform: [{ translateY: slideAnim }], opacity },
      ]}
                >
        <Text style={styles.resetTitle}>Add a photo</Text>
        <View style={styles.privacyContainer}>
          <Text style={styles.termsText}>Personalize your account with a photo. You can always change it later.</Text>
        </View>

 

<View style={styles.avatarContainer}>
  <View style={styles.bigCircle}>
    <TouchableOpacity>
      <Image
        source={
          photo
            ? { uri: photo } 
            : require("../../../assets/images/add1.png")
        }
        style={styles.logo}
        resizeMode="cover"
      />
    </TouchableOpacity>

    <TouchableOpacity style={styles.cameraButton} onPress={handleSelectImage}>
      <Image
        source={require("../../../assets/images/new_camera_icon.png")}
        style={styles.cameraIcon}
        resizeMode="contain"
      />
    </TouchableOpacity>
  </View>
</View>

         <TouchableOpacity style={styles.loginButton} onPress={handlePopup}>
            <Text style={styles.loginText}>Continue</Text>
          </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
                      <Text style={styles.signupPrompt}>Want to do it later? </Text>
                      <TouchableOpacity onPress={handleLogin}>
                        <Text style={styles.signupPrompt1}>Skip</Text>
                      </TouchableOpacity>
                    </View>

          </Animated.View>
      </Animated.View>
       )}
    

             <View style={styles.stepIndicatorContainer}>
                        {[0, 1, 2, 3].map((index) =>
                          index === 3 ? (
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
            blurAmount={25}
          />

      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
        ]}
      />

          <View style={styles.popupContainer}>
            <Image
              source={require('../../../assets/images/success_icon.png')}
              style={styles.logo1}
              resizeMode="contain"
            />
            <Text style={styles.termsText2} >
              Account Created Successfully!
            </Text>
            <Text style={styles.termsText1}>
             Welcome to Unizy! Your account has been created and your’re all set to start exploring
            </Text>
             <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginText}>Start Exploring</Text>
                  </TouchableOpacity>
          </View>
          </View>
          </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({

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

     overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.57)',
  },

   logo1: {
    width: 64,
    height: 64,
    marginBottom: 20,
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
  termsText1: {
    color: 'rgba(255,255,255,0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
     marginBottom: 12, 
      opacity: 2,
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1,
  },
  termsText2: {
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
    marginBottom: 12, 
    fontWeight:600,

  },

 bigCircle: {
  width: 120,
  height: 120,
  borderRadius: 60,
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
   boxShadow: 'rgba(255, 255, 255, 0.02)inset -1px 0px 15px 1px',
   borderWidth:1 ,
    borderColor: '#ffffff2c',

  
},
cameraButton: {
  position: "absolute",
  bottom: 0, 
  right: 0, 
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",

},
cameraIcon: {
  width: 40,
  height: 40,
  marginLeft:5,
  marginTop:5,
},

  avatarContainer: {
  alignItems: "center",
  justifyContent: "center",
  marginTop: 12,
},

logo: {
  width: 120,
  height: 120,
  borderRadius: 60
},

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
    opacity: 2,
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1,
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

export default ProfileScreen;
