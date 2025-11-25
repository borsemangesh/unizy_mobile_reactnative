import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Platform,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';

import AnimatedReanimated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
// import LinearGradient from 'react-native-linear-gradient';

import MaskedView from '@react-native-masked-view/masked-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
const bgImage = require('../../../assets/images/backimg.png');
import {
  NewCustomToastContainer,
  showToast,
} from '../../utils/component/NewCustomToastManager';
import { BlurView } from '@react-native-community/blur';
import { MAIN_URL } from '../../utils/APIConstant';

import {
  check,
  PERMISSIONS,
  request,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

type changePasswordProps = {
  navigation: any;
};

interface UserMeta {
  current_password: string | null;
  new_password: string | null;
  confirm_password: string | null;
}

const ChangePassword = ({ navigation }: changePasswordProps) => {
  const [userMeta, setUserMeta] = useState<UserMeta>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
const [showNew, setShowNew] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);



  const handlechangePassword = async () => {
  Keyboard.dismiss();

  const { current_password, new_password, confirm_password } = userMeta;




 if (  !current_password?.trim() ||  !new_password?.trim() ||  !confirm_password?.trim()) {
  showToast("All fields are required", "error");
  return;
}


  if (current_password === new_password) {
    showToast("New password must be different from current password", "error");
    return;
  }


const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]|:;"'<>,.?/]).{8,}$/;

if (!passwordRegex.test(new_password.trim())) {
showToast('Min 8 chars: upper, lower, number, symbol.', 'error');
  return;
}


  if (new_password !== confirm_password) {
    showToast("New password and Confirm password do not match", "error");
    return;
  }

  try {
    const token = await AsyncStorage.getItem('userToken');
    const userId = await AsyncStorage.getItem('userId');

    if (!token || !userId) {
      showToast("User authentication is missing.", "error");
      return;
    }

    const url = `${MAIN_URL.baseUrl}user/update-password`;

    const body = {
      current_password,
      new_password,
      confirm_password
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok) {
      showToast(data?.message || "Password updated successfully", "success");

      // Clear fields
      setUserMeta({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });

      navigation.nevigate("EditProfile");
    } else {
      showToast(data?.message || "Failed to update password. Please try again", "error");
    }
  } catch (error) {
    console.error("Error during password update:", error);
    showToast("An unexpected error occurred.", "error");
  }
};

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.unizyText}>
              Change Password
            </Text>
            <View style={{ width: 48 }} />
          </View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 120 : 110 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.blurCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label} allowFontScaling={false}>
                Current Password*
              </Text>
              {/* <TextInput
                value={userMeta.current_password || ''}
                onChangeText={text =>
                  setUserMeta(prev => ({ ...prev, current_password: text }))
                }
                allowFontScaling={false}
                style={styles.input}
                placeholder="Enter Current Password"
                placeholderTextColor="#ccc"
              /> */}


              <View style={{ position: "relative" }}>
  <TextInput
    value={userMeta.current_password || ""}
    secureTextEntry={!showCurrent}
    onChangeText={(text) =>
      setUserMeta((prev) => ({ ...prev, current_password: text }))
    }
    style={styles.input}
    placeholder="Enter Current Password"
    placeholderTextColor="#ccc"
  />

  <TouchableOpacity
    style={styles.eyeButton}
    onPress={() => setShowCurrent(!showCurrent)}
  >
    <Image
      source={
        showCurrent
       ? require("../../../assets/images/eyeopen.png")          
          : require("../../../assets/images/eyecross1.png")
      }
      style={styles.eyeIcon}
    />
  </TouchableOpacity>
</View>

            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label} allowFontScaling={false}>
                New Password*
              </Text>
              {/* <TextInput
                value={userMeta.new_password || ''}
                onChangeText={text =>
                  setUserMeta(prev => ({ ...prev, new_password: text }))
                }
                allowFontScaling={false}
                style={styles.input}
                placeholder="Enter New Password"
                placeholderTextColor="#ccc"
              /> */}


              <View style={{ position: "relative" }}>
  <TextInput
    value={userMeta.new_password || ""}
    secureTextEntry={!showNew}
    onChangeText={(text) =>
      setUserMeta((prev) => ({ ...prev, new_password: text }))
    }
    style={styles.input}
    placeholder="Enter New Password"
    placeholderTextColor="#ccc"
  />

  <TouchableOpacity
    style={styles.eyeButton}
    onPress={() => setShowNew(!showNew)}
  >
    <Image
      source={
        showNew
          ? require("../../../assets/images/eyeopen.png")          
          : require("../../../assets/images/eyecross1.png")
      }
      style={styles.eyeIcon}
    />
  </TouchableOpacity>
</View>

            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label} allowFontScaling={false}>
                Confirm Password*
              </Text>
              {/* <TextInput
                allowFontScaling={false}
                value={userMeta.confirm_password || ''}
                onChangeText={text =>
                  setUserMeta(prev => ({ ...prev, confirm_password: text }))
                }
                style={styles.input}
                placeholder="Enter Confirm Password"
                placeholderTextColor="#ccc"
              /> */}


              <View style={{ position: "relative" }}>
  <TextInput
    value={userMeta.confirm_password || ""}
    secureTextEntry={!showConfirm}
    onChangeText={(text) =>
      setUserMeta((prev) => ({ ...prev, confirm_password: text }))
    }
    style={styles.input}
    placeholder="Enter Confirm Password"
    placeholderTextColor="#ccc"
  />

  <TouchableOpacity
    style={styles.eyeButton}
    onPress={() => setShowConfirm(!showConfirm)}
  >
    <Image
      source={
        showConfirm        
          ? require("../../../assets/images/eyeopen.png")          
          : require("../../../assets/images/eyecross1.png")
      }
      style={styles.eyeIcon}
    />
  </TouchableOpacity>
</View>

            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.buttonContainer}
               onPress={()=>{
                    handlechangePassword();
                  }}
            >
              <BlurView
                style={StyleSheet.absoluteFill}
                blurType="light"
                blurAmount={2}
                pointerEvents="none"
                reducedTransparencyFallbackColor="transparent"
              />
              <Text allowFontScaling={false} style={styles.buttonText}>
                Change Password
              </Text>
            </TouchableOpacity>

            <Text
              allowFontScaling={false}
              style={styles.forgetText}
              onPress={() => navigation.goBack()}
            >
              Forgot Password?
            </Text>
          </View>
        </KeyboardAvoidingView>
      </View>
      <NewCustomToastContainer />
    </ImageBackground>
  );
};
export default ChangePassword;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    paddingTop: Platform.OS === 'ios' ? 120 : 100,
  },

  headerWrapper: {
    position: 'absolute',
    top: 0,
    width: Platform.OS === 'ios' ? '100%' : '100%',
    height: Platform.OS === 'ios' ? 180 : 180,
    zIndex: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    pointerEvents: 'none',
  },
  headerContent: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : 60,
    width: Platform.OS === 'ios' ? '100%' : '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 11,
    alignSelf: 'center',
    pointerEvents: 'box-none',
  },
  backButtonContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 11,
    //top: 7,
  },
  blurButtonWrapper: {
    width: 48,
    height: 48,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // fallback tint
  },

  tabcard: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 0.4,
    borderColor: '#ffffff11',

    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.10) 100%)',

    borderEndEndRadius: 10,
    borderStartEndRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomStartRadius: 10,
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',

    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',

    boxSizing: 'border-box',
  },
  tabcard1: {
    borderWidth: 0.4,
    borderColor: '#ffffff11',

    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',

    borderEndEndRadius: 10,
    borderStartEndRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomStartRadius: 10,
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',

    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',

    boxSizing: 'border-box',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  tabtext: {
    color: '#fff', // selected tab text color
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
  },
  othertext: {
    color: '#FFFFFF7A', // unselected tab text color
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
  },

  background: {
    flex: 1,
  },
  fullScreenContainer: {
    flex: 1,
  },
  header: {
    // paddingTop: Platform.OS === 'ios' ? '6%' : 30,
    // paddingBottom: 12,
    // // paddingHorizontal: 16,
    // paddingTop: Platform.OS === 'ios' ? '15.3%' : 50,
    // paddingBottom: 12,
    // paddingHorizontal: 16,
    position: 'absolute',
    top: Platform.OS === 'ios' ? '7.1%' : 50,
    width: Platform.OS === 'ios' ? 393 : '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 11,
    alignSelf: 'center',
    pointerEvents: 'box-none',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIconRow: {
    padding: 12,
    borderRadius: 40,

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    height: 48,
    width: 48,
  },
  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    // marginRight: 12,
    width: 265,
    height: 28,
    opacity: 1,
  },
  search_container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 16,
    borderRadius: 40,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
  },
  searchIcon: {
    margin: 10,
    height: 24,
    width: 24,
  },
  searchBar: {
    fontSize: 17,
    color: '#fff',
    width: '85%',
  },
  listContainer: {
    marginLeft: 10,
    marginRight: 10,
    paddingTop: 10,
    //paddingBottom:80,
  },
  row1: {
    // flexDirection: 'row',
    // justifyContent: 'flex-start',
  },
  itemContainer: {
    flex: 1,
    marginHorizontal: 4,
  },

  container: {
    flex: 1,
    resizeMode: 'cover',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4A80F0',
    padding: 6,
    borderRadius: 18,
  },
  cameraIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
  },
  imageSizeText: {
    color: '#A9C1FF',
    fontSize: 12,
    marginTop: 5,
  },
  blurCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    // padding: 16,
    // marginBottom:16,

    // overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    gap: 12,
  },
  inputGroup: {
    // marginBottom: 14,
    height: 64,
    // paddingHorizontal:8,
    // paddingVertical:12
  },
  label: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 6,
    opacity: 0.9,
    fontFamily: 'Urbanist-Regular',
    fontWeight: 400,
    // marginLeft:10
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    height: 44,
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    fontWeight: 400,

    // width:329
  },
  saveButton: {
    backgroundColor: '#B4C8FF',
    borderRadius: 25,
    marginTop: 28,
    alignItems: 'center',
    paddingVertical: 14,
  },
  saveText: {
    color: '#1E2A78',
    fontWeight: '700',
    fontSize: 16,
  },

  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bigCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: 'rgba(255, 255, 255, 0.02)inset -1px 0px 15px 1px',
    borderWidth: 1,
    borderColor: '#ffffff2c',
  },

  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  profileavatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  profilebigCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: 'rgba(255, 255, 255, 0.02)inset -1px 0px 15px 1px',
    borderWidth: 1,
    borderColor: '#ffffff2c',
  },

  profilelogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  profilecameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.6) 100%)',
  },
  profilecameraIcon: {
    width: 40,
    height: 40,
    marginLeft: -1,
    marginTop: 3,
  },

  updateIcon: {
    width: 16,
    height: 16,
  },

  inputEmail: {
    flex: 1, // THIS PART IS MOST IMPORTANT!!
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 0, // Prevents unwanted expansion
    height: 44,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)', // matches glass effect
    borderRadius: 14,
  },

  inputWithUpdate: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    height: 44,
    // width:329
  },

  updateButton: {
    marginLeft: 38,
    backgroundColor: '#FFFFFF8F', // contrast glass effect
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#222',
    shadowOpacity: 0.17,
    shadowRadius: 5,
    elevation: 2,
    // width: 70,

    width: 90, // Fixed width
    height: 34,
  },
  updateButtonText: {
    color: '#002050',
    fontSize: 14,
    fontFamily: 'Urbanist-SemiBold',
  },

  // -----------------to handle personal email--------------------//
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  popupContainer: {
    width: '90%',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    overflow: 'hidden',

    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },

  mainheader: {
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '500',
    // marginBottom: 10,
    fontSize: 20,

    color: '#fff',
    textAlign: 'center',
  },

  subheader: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 20,
  },

  subheader1: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 6,
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
    backgroundColor: 'rgba(170, 169, 176, 0.56)',
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
  loginText1: {
    color: '#FFFFFF7A',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    width: '100%',
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

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    // width: '100%',
    alignSelf: 'center',
    gap: 8, // works in RN 0.71+, otherwise use marginRight
    marginTop: 16,
    paddingHorizontal: 20,
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
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.29) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.02)inset -1px 0px 15px 1px',
  },

  editcard: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderColor: '#ffffff11',
    borderRadius: 10,
    boxSizing: 'border-box',
    gap: 10,
    width: '20%',

    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.14) 100%)',
    boxShadow:
      'rgba(255, 255, 255, 0.02)inset -1px 10px 5px 10px,rgba(236, 232, 232, 0.3)inset -0.99px -0.88px 0.90px 0px,rgba(236, 232, 232, 0.3)inset 0.99px 0.88px 0.90px 0px',
  },

  edittext: {
    color: '#fff',
    textAlign: 'center',
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonContainer: {
    width: Platform.OS === 'ios' ? '100%' : '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
    alignSelf: 'center',
    // position: 'absolute',
    bottom: Platform.OS === 'ios' ? 0 : 0,
    marginTop: 16,
  },

  buttonText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    opacity: 0.9,
  },

  forgetText: {
    color: '#FFFFFF7A',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: 1,
    opacity: 0.9,
    marginTop: 10,
  },

  eyeButton: {
  position: "absolute",
  right: 12,
  top: 8,
  padding: 4,
},

eyeIcon: {
  width: 20,
  height: 20,
  tintColor: "#ccc",
},

});
