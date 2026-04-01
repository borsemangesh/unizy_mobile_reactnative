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
  Modal,
  TouchableWithoutFeedback,
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
import { Constant } from '../../utils/Constant';
import { useTranslation } from 'react-i18next';
import { resetTwilioClient } from '../../view/emoji/twilioService';
import { clearTwilioCache } from '../dashboard/MessageIndividualScreen';

import DeviceInfo from 'react-native-device-info';
import Loader from '../../utils/component/Loader';
import COMMONSTYLE from '../../utils/CommonStyle';
import BackgroundWrapper from '../../utils/component/BackgroundWrapper';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { t } = useTranslation();

  const scrollY = useSharedValue(0);
  const [loading, setLoading] = useState(false);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      'worklet';
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedBlurStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(scrollY.value, [0, 100], [0, 1], 'clamp');
    return { opacity };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    'worklet';
    const borderColor = interpolateColor(
      scrollY.value,
      [0, 300],
      ['rgba(255, 255, 255, 0.56)', 'rgba(255, 255, 255, 0.56)'],
    );
    const redOpacity = interpolate(scrollY.value, [0, 300], [0, 0.15], 'clamp');
    return {
      borderColor,
      backgroundColor: `rgba(255, 255, 255, ${redOpacity})`,
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(scrollY.value, [0, 300], [0.8, 1], 'clamp');
    const tintColor = interpolateColor(
      scrollY.value,
      [0, 150],
      ['#FFFFFF', '#002050'],
    );
    return {
      opacity,
      tintColor,
    };
  });
  const handlechangePassword = async () => {
    Keyboard.dismiss();

    const { current_password, new_password, confirm_password } = userMeta;

    if (
      !current_password?.trim() ||
      !new_password?.trim() ||
      !confirm_password?.trim()
    ) {
      showToast(t(Constant.REQUIRED_ALL_FIELDS), 'error');
      return;
    }

    if (current_password === new_password) {
      showToast(t(Constant.NEW_VALID_PASSWORD), 'error');
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]|:;"'<>,.?/]).{8,}$/;

    if (!passwordRegex.test(new_password.trim())) {
      showToast(t(Constant.PASSWORD_VALID), 'error');
      return;
    }

    if (new_password !== confirm_password) {
      showToast(t(Constant.PASSWORDS_DO_NOT_MATCH), 'error');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        showToast(t(Constant.USER_NOT_AUTH), 'error');
        return;
      }

      const url = `${MAIN_URL.baseUrl}user/update-password`;
      const language_code = await AsyncStorage.getItem('selectedLanguage') || 'en'
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          languagecode: language_code
        },
        body: JSON.stringify({
          current_password,
          new_password,
          confirm_password,
        }),
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = {};
      }


      if (response.ok) {
        showToast(t(data?.message) || 'Password updated successfully', 'success');
        await new Promise((resolve: any) => {
          
          setTimeout(resolve, 2000);
        });
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'Dashboard',
                params: {
                  AddScreenBackactiveTab: 'Profile',
                  isNavigate: false,
                },
              },
            ],
          });
        }, 1500);
        setUserMeta({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
      } else {
        showToast(t(data?.message) || 'Failed to update password', 'error');
      }
    } catch (error) {

      showToast(Constant.SOMTHING_WENT_WRONG, 'error');
    }
  };

  const handleForceLogout = async () => {
    setShowDeleteModal(false);
    try {
      setLoading(true)
      const deviceId = await DeviceInfo.getUniqueId();
      const user_id = await AsyncStorage.getItem('userId');

      const body = {
        device_type: (Platform.OS === 'ios') ? 'ios' : 'android',
        device_id: deviceId,
        user_id: Number(user_id),
      };

      const response = await fetch(`${MAIN_URL.baseUrl}user/delete-fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const apiData = await response.json();



      if (apiData?.statusCode === 200) {
        await AsyncStorage.setItem('userToken', '');
        await AsyncStorage.setItem('userData', '');
        await AsyncStorage.setItem('userId', '');
        await AsyncStorage.setItem('twilio_convo_', '');
        await AsyncStorage.setItem('twilio_msg_', '');

        try {
          await resetTwilioClient();
          await clearTwilioCache();
          try {
            const messaging = require('@react-native-firebase/messaging').default;
            await messaging().deleteToken();
            if (__DEV__) {

            }
          } catch (fcmError) {
            console.warn('⚠️ Error deleting FCM token:', fcmError);
          }

          if (__DEV__) {

          }
        } catch (clearError) {
          console.warn('⚠️ Error clearing Twilio data on logout:', clearError);
        }

        await AsyncStorage.setItem('ISLOGIN', 'false');
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'SinglePage',
              params: {
                forgotPassword: true,
                resetToLogin: false,
                currentScreen: 'login',
                currentScreenIninner: 'forgotpassword',
              },
            },
          ],
        });
        setShowConfirm(false);
        // logoutCleanup();
      } else {
        showToast(t(Constant.LOGOUT_FAIL), 'error');
      }
      navigation.reset({
      index: 0,
      routes: [{ name: 'SinglePage', params: { forgotPassword: true, resetToLogin: false, currentScreen: 'login', currentScreenIninner: 'forgotpassword' } }],
    });
    } catch (error) {
      console.log("Something went wrong. Try again!");
    }
    finally {
      setLoading(false);
    }
    // await AsyncStorage.clear();
    // navigation.reset({
    //   index: 0,
    //   routes: [{ name: 'SinglePage', params: { forgotPassword: true, resetToLogin: false, currentScreen: 'login', currentScreenIninner: 'forgotpassword' } }],
    // });
  };

  // if (loading) {
  //   return (
  //     <View style={{ flex: 1 }}>
  //       <Loader />
  //     </View>
  //   );
  // }

  return (
    <BackgroundWrapper>
      <View style={styles.fullScreenContainer}>
        {/* <View style={styles.header}>
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
              {t('change_password')}
            </Text>
            <View style={{ width: 48 }} />
          </View>
        </View> */}


        <View style={COMMONSTYLE.headerContent} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => {
              console.log('navigation.goBack()');
              // navigation.goBack()
              if (Platform.OS === 'ios') {
                if (navigation.canGoBack()) {
                
                  navigation.goBack()
                 
                } else {
                  navigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'Dashboard',
                        params: {
                          AddScreenBackactiveTab: 'Profile',
                          isNavigate: false,
                        },
                      },
                    ],
                  });
                }
              } else {
                navigation.goBack()
              }
              // navigation.reset({
              //   index: 0,
              //   routes: [
              //     {
              //       name: 'Dashboard',
              //       params: {
              //         AddScreenBackactiveTab: 'Profile',
              //         isNavigate: false,
              //       },
              //     },
              //   ],
              // });
            }}
            style={styles.backButtonContainer}
            activeOpacity={0.7}
          >
            <AnimatedReanimated.View
              style={[COMMONSTYLE.blurButtonWrapper]}
            >
              <AnimatedReanimated.View
                style={[
                  StyleSheet.absoluteFill,
                  useAnimatedStyle(() => ({
                    opacity: interpolate(
                      scrollY.value,
                      [0, 30],
                      [1, 0],
                      'clamp',
                    ),
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 40,
                  })),
                ]}
              />

              <AnimatedReanimated.View
                style={[
                  StyleSheet.absoluteFill,
                  useAnimatedStyle(() => ({
                    opacity: interpolate(
                      scrollY.value,
                      [0, 50],
                      [0, 1],
                      'clamp',
                    ),
                  })),
                ]}
              >
                <BlurView
                  style={StyleSheet.absoluteFill}
                  blurType="light"
                  blurAmount={10}
                  reducedTransparencyFallbackColor="transparent"
                />
              </AnimatedReanimated.View>

              {/* Back Icon */}
              <AnimatedReanimated.Image
                source={require('../../../assets/images/back.png')}
                style={[{ height: 24, width: 24 }]}
              />
            </AnimatedReanimated.View>
          </TouchableOpacity>

          <Text allowFontScaling={false} style={styles.unizyText}>
            {t('change_password')}
          </Text>
          <TouchableOpacity
            onPress={() => {
              console.log('navigation.goBack()');
              // navigation.goBack()
              // if (Platform.OS === 'ios') {
              //   if (navigation.canGoBack()) {
                  navigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'Dashboard',
                        params: {
                          AddScreenBackactiveTab: 'Profile',
                          isNavigate: false,
                        },
                      },
                    ],
                  });
                //   navigation.goBack()
                 
                // } else {
                //   navigation.reset({
                //     index: 0,
                //     routes: [
                //       {
                //         name: 'Dashboard',
                //         params: {
                //           AddScreenBackactiveTab: 'Profile',
                //           isNavigate: false,
                //         },
                //       },
                //     ],
                //   });
                // }
              // } else {
              //   navigation.goBack()
              // }
            }}
            style={styles.backButtonContainer}
            activeOpacity={0.7}
          >
            <AnimatedReanimated.View
              style={[styles.blurButtonWrapper_none]}
            >
              <AnimatedReanimated.View
                style={[
                  StyleSheet.absoluteFill,
                  useAnimatedStyle(() => ({
                    opacity: interpolate(
                      scrollY.value,
                      [0, 30],
                      [1, 0],
                      'clamp',
                    ),
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 40,
                  })), { display: 'none' }
                ]}
              />

              <AnimatedReanimated.View
                style={[
                  StyleSheet.absoluteFill,
                  useAnimatedStyle(() => ({
                    opacity: interpolate(
                      scrollY.value,
                      [0, 50],
                      [0, 1],
                      'clamp',
                    ),
                  })), { display: 'none' }
                ]}
              >
                <BlurView
                  style={StyleSheet.absoluteFill}
                  blurType="light"
                  blurAmount={10}
                  reducedTransparencyFallbackColor="transparent"
                />
              </AnimatedReanimated.View>

              {/* Back Icon */}
              <AnimatedReanimated.Image
                source={require('../../../assets/images/back.png')}
                style={[{ height: 24, width: 24, display: 'none' }]}
              />
            </AnimatedReanimated.View>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 120 : 110 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.blurCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label} allowFontScaling={false}>
                {t('current_password')}
              </Text>

              <View style={styles.login_container}>
                <TextInput
                  cursorColor="#F5F5F5"
                  selectionColor="#F5F5F5"
                  value={userMeta.current_password || ''}
                  secureTextEntry={!showCurrent}
                  onChangeText={text =>
                    setUserMeta(prev => ({ ...prev, current_password: text }))
                  }
                  style={styles.input}
                  placeholder={t('enter_current_password')}
                  placeholderTextColor="rgba(255, 255, 255, 0.48)"
                />

                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowCurrent(!showCurrent)}
                >
                  <Image
                    source={
                      showCurrent
                        ? require('../../../assets/images/eyeopen.png')
                        : require('../../../assets/images/eyecross1.png')
                    }
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label} allowFontScaling={false}>
                {t('new_password')}
              </Text>

              <View style={styles.login_container}>
                <TextInput
                  cursorColor="#F5F5F5"
                  selectionColor="#F5F5F5"
                  value={userMeta.new_password || ''}
                  secureTextEntry={!showNew}
                  onChangeText={text =>
                    setUserMeta(prev => ({ ...prev, new_password: text }))
                  }
                  style={styles.input}
                  placeholder={t('enter_new_password')}
                  placeholderTextColor="rgba(255, 255, 255, 0.48)"
                />

                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNew(!showNew)}
                >
                  <Image
                    source={
                      showNew
                        ? require('../../../assets/images/eyeopen.png')
                        : require('../../../assets/images/eyecross1.png')
                    }
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label} allowFontScaling={false}>
                {t('confirm_password')}
              </Text>
              <View style={[styles.login_container]}>
                <TextInput
                  cursorColor="#F5F5F5"
                  selectionColor="#F5F5F5"
                  value={userMeta.confirm_password || ''}
                  secureTextEntry={!showConfirm}
                  onChangeText={text =>
                    setUserMeta(prev => ({ ...prev, confirm_password: text }))
                  }
                  style={styles.input}
                  placeholder={t('enter_confirm_password')}
                  placeholderTextColor="rgba(255, 255, 255, 0.48)"
                />

                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirm(!showConfirm)}
                >
                  <Image
                    source={
                      showConfirm
                        ? require('../../../assets/images/eyeopen.png')
                        : require('../../../assets/images/eyecross1.png')
                    }
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.buttonContainer}
              onPress={() => {
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
                {t('change_password')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {

              setShowDeleteModal(true);
            }}>
              <Text
                allowFontScaling={false}
                style={styles.forgetText}
              >
                {t('forgot_password')}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            navigation.replace('EditProfile');
          }}
        >
          <View style={styles.overlay}>
            <BlurView
              style={{
                flex: 1,
                alignContent: 'center',
                justifyContent: 'center',
                width: '100%',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.30)',
              }}
              blurType="light"
              blurAmount={2}
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
                  source={require('../../../assets/images/alerticon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text allowFontScaling={false} style={styles.mainheader1}>
                  {t('confirm_action')}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[styles.mainheader, { marginTop: 10 }]}
                >
                  {t('action')}
                </Text>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={ () => {
                    handleForceLogout();
                  }}
                >
                  <Text allowFontScaling={false} style={styles.loginText}>
                    {t('yes_proceed')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.loginButton1}
                  onPress={() => {
                    setShowDeleteModal(false);
                  }}
                >
                  <Text allowFontScaling={false} style={styles.loginText1}>
                    {t('cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {loading && (
          <View style={styles.fullLoader}>
            <Loader />
          </View>
        )}
      <NewCustomToastContainer />
    </BackgroundWrapper>
  );
};
export default ChangePassword;

const styles = StyleSheet.create({
  login_container: {
    display: 'flex',
    width: '100%',
    height: 44,
    gap: (Platform.OS === 'ios' ? 10 : 10),
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
  fullLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,  
  },
  blurButtonWrapper_none: {

    width: 48,
    height: 48,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },

  mainheader1: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
 
  backButtonContainer: {
    // position: 'absolute',
    // left: 16,
    zIndex: 11,
  },

  fullScreenContainer: {
    flex: 1,
  },
  
  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    width: 265,
    height: 28,
    opacity: 1,
  },
  
  blurCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    gap: 12,
  },
  inputGroup: {
    height: 64,
  },
  label: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 6,
    opacity: 0.9,
    fontFamily: 'Urbanist-Regular',
    fontWeight: 400,
  },
  input: {
    width: '93%',
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
    fontStyle: 'normal',
    color:"#fff",
  },
  
  logo: {
    width: 64,
    height: 64,
    borderRadius: 60,
  },


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
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
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
    position: 'absolute',
    right: 12,
    top: 8,
    padding: 4,
  },

  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: '#ccc',
  },
});
