import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Platform,
  FlatList,
  TouchableWithoutFeedback,
  TextInput,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { MAIN_URL } from '../../utils/APIConstant';
import { NewCustomToastContainer, showToast } from '../../utils/component/NewCustomToastManager';
import { BlurView } from '@react-native-community/blur';
import DeviceInfo from 'react-native-device-info';
import Loader from '../../utils/component/Loader';
import { Constant } from '../../utils/Constant';
import { resetTwilioClient } from '../../view/emoji/twilioService';
import { clearTwilioCache } from '../dashboard/MessageIndividualScreen';
import { useTranslation } from "react-i18next";
import { IMAGE_URLS } from '../../utils/Style';


 import CITY_ICON from '../../../assets/images/ic_city.png';
    import BUILDING_ICON from '../../../assets/images/buildings.png';
    import SMS_ICON from '../../../assets/images/sms.png';
    import PAYMENT_ICON from '../../../assets/images/payment.png';
    import CART_ICON from '../../../assets/images/cart.png';
    import OK_ICON from '../../../assets/images/ok.png';
    import NOTIFY_ICON from '../../../assets/images/notify.png';
    import CHANGEPASSWORD_ICON from '../../../assets/images/change_password.png';
    import HELP_ICON from '../../../assets/images/helpicon.png';
    import LOGOUT_ICON from '../../../assets/images/logout.png';
    import VERSION_ICON from '../../../assets/images/versionicon.png';
    import NEXTARROW_ICON from '../../../assets/images/nextarrow.png';
import CALENDER_ICON from '../../../assets/images/calendar_icon1.png';
    import DELETENEW_ICON from '../../../assets/images/delete_new.png';
import { Switch } from 'react-native-gesture-handler';
import { CommonConfirmModal } from '../../utils/component/Logout.component';
import COMMONSTYLE from '../../utils/CommonStyle';



const cardData = [
  { id: '1', titleKey: 'payment_methods', image: PAYMENT_ICON },
  { id: '2', titleKey: 'my_orders', image: CART_ICON },
  { id: '3', titleKey: 'reviews', image: OK_ICON },
  { id: '4', titleKey: 'notifications', image: NOTIFY_ICON},
  { id: '5', titleKey: 'change_password', image: CHANGEPASSWORD_ICON },
  { id: '6', titleKey: 'delete_account', image: DELETENEW_ICON },
  { id: '7', titleKey: 'help_support', image: HELP_ICON},
  { id: '8', titleKey: 'logout', image: LOGOUT_ICON},
  { id: '9', titleKey: 'app_version', image: VERSION_ICON },
  
];

type ProfileCardContentProps = {
  navigation: any;
};
const ProfileCard = ({ navigation }: ProfileCardContentProps) => {

  const [slideUp1] = useState(new Animated.Value(0));
  const [isHidden, setIsHidden] = useState(true);

  const [password, setPassword] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
PAYMENT_ICON
  interface UserMeta {
    firstname: string | null;
    lastname: string | null;
    profile: string | null;
    student_email: string | null;
    email?: string | null;
    university_name?: string | null;
    city?: string | null;
  }

  const [userMeta, setUserMeta] = useState<UserMeta | null>(null);
  const [expanded, setExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirm1, setShowConfirm1] = useState(false);
  const [loading, setLoading] = useState(true);
  const isLoadingRef = useRef(false);



  useEffect(() => {
    if (expanded) {
      Animated.timing(animatedHeight, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
  }, [expanded]);

  const { t } = useTranslation();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');
        const language_code = await AsyncStorage.getItem('selectedLanguage') || 'en'

        if (!token || !userId) {
          console.warn('Missing token or user ID in AsyncStorage');
          return;
        }

        const url = `${MAIN_URL.baseUrl}user/user-profile/${userId}`;
        console.log(url)
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            languagecode: language_code
          },
        });

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
          handleForceLogout();
          return;
        }

        if (data.statusCode === 401 || data.statusCode === 403) {
          handleForceLogout();
          return;
        }

        if (response.ok) {
          const user = data.data;



          setUserMeta({
            firstname: user.firstname ?? null,
            lastname: user.lastname ?? null,
            profile: user.profile ?? null,
            student_email: user.student_email ?? null,
            email: user.email ?? null,
            university_name: user.university_name ?? null,
            city: user.city ?? null,
          });

        } else {
          console.warn('Failed to fetch user profile:', data?.message || response.status);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
      finally {
        setLoading(false);
      }
    };
    const handleForceLogout = async () => {

      setLoading(false);
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
      });
    };

    fetchUserProfile();
  }, []);

  const openStripeOnboarding = async () => {

    if (Platform.OS === 'ios') {
      navigation.replace("AccountDeatils", { showSuccess: true })
    } else {
      navigation.navigate("AccountDeatils", { showSuccess: true })
    }

    // if (isLoadingRef.current) return;
    // isLoadingRef.current = true;
    // //setLoading(true);
    // try {
    //   const token = await AsyncStorage.getItem('userToken');
    //   const url = `${MAIN_URL.baseUrl}transaction/account-detail`;

    //   console.log('API URL:', url);
    //   console.log('Token:', token);

    //   const response = await fetch(url, {
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${token}`,
    //     },
    //   });

    //   console.log('Response status:', response.status);
    //   console.log('Response ok:', response.ok);

    //   //const responseText = await response.text(); // use text() first
    //   //console.log('Raw response:', responseText);

    //   const json = await response.json();

    //   if (json?.statusCode === 200 && json.data.onboardingLink) {
    //     const onboardingLink = json?.data?.onboardingLink;

    //     if (Platform.OS === 'ios') {
    //       navigation.replace("StripeOnboardingScreen", {
    //         onboardingUrl: onboardingLink,
    //       });
    //     } else {
    //       navigation.navigate("StripeOnboardingScreen", {
    //         onboardingUrl: onboardingLink,
    //       });
    //     }


    //   }
    //   else if (json?.data?.stripeAccount?.isboardcomplete) {

    //     if (Platform.OS === 'ios') {
    //       navigation.replace("AccountDeatils", { showSuccess: true })
    //     } else {
    //       navigation.navigate("AccountDeatils", { showSuccess: true })
    //     }
    //   }
    //   else {
    //     console.log(json?.message)
    //     showToast(t(json?.message) || t(Constant.SOMTHING_WENT_WRONG), 'error',);
    //   }
    // } catch (error) {
    //   if (error instanceof Error) {
    //     showToast(t(error.message), 'error',);
    //   } else {
    //     showToast(t(Constant.SOMTHING_WENT_WRONG), 'error');
    //   }
    // }
    // finally {
    //   isLoadingRef.current = false;
    //   //setLoading(false);
    // }
  };

  const navigateToScreen = (screenName: string) => {
    if (Platform.OS === 'ios') {
      navigation.replace(screenName);
    } else {
      navigation.navigate(screenName);
    }
  }

  const openWhatsApp = async () => {
  
    const phoneNumber = '447949500991';
  
    const message =
      'Hello';
  
      // const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(
      //   message,
      // )}`;
  
    const url =
        `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  
    try {
  
      const supported =
        await Linking.canOpenURL(url);
  
      if (supported) {
  
        await Linking.openURL(url);
  
      } else {
  
        Alert.alert(
          'WhatsApp not installed'
        );
      }
  
    } catch (error) {
  
      console.log(error);
  
      Alert.alert(
        'Error opening WhatsApp'
      );
    }
  };

  const handleItem = (item: any) => {
      const isLogout = item.titleKey === 'logout';
    const isDelete = item.titleKey === 'delete_account';
    const isVersion = item.titleKey === 'app_version';
    switch(item.titleKey){
      case 'my_orders': {
        navigateToScreen('MyOrders');
        break;
      }
      case 'reviews': {
        navigateToScreen('MyReviews');
        break;
      }
      case 'help_support': {
        navigation.navigate('HelpSupport');
        // openWhatsApp();
        break;
      }
      case 'notifications': {
        navigateToScreen('Notification');
        break;
      }
      case 'payment_methods': {
        openStripeOnboarding();
        break;
      }
      case 'change_password': {
        navigateToScreen('ChangePassword');
        break;
      }
      case 'logout': {
        setShowConfirm(true);
        break;
      }
      case 'delete_account': {
        setIsPasswordVisible(false)
        setPassword('')
        setShowConfirm1(true);
        break;
      }
      case 'app_version':
        break;
    }
  }

  const renderItem = ({ item }: any) => {
    const isLogout = item.titleKey === 'logout';
    const isDelete = item.titleKey === 'delete_account';
    const isVersion = item.titleKey === 'app_version';
    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={async () => {
          handleItem(item);
        }}
      >
        <Image source={item.image} style={styles.cardImage} />
        <Text allowFontScaling={false}
          style={[
            styles.cardText,
            isLogout && { color: '#FF8282E0' },
          ]}
        >
          {t(item.titleKey)}
        </Text>
        {isVersion ? (
          <Text allowFontScaling={false} style={styles.versionText}>{APP_VERSION}</Text>
        ) : !isLogout || isDelete && (
          <Image source={NEXTARROW_ICON} style={styles.cardArrow} />
        )}
      </TouchableOpacity>
    );
  };
  const APP_VERSION = 'v1.0.0';

  const getInitials = (firstName = '', lastName = '') => {
    const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
    const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
    return (f + l) || '?';
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <Loader />
      </View>
    );
  }
const handleLogout = async () => {
  try {
    setLoading(true);

    const deviceId = await DeviceInfo.getUniqueId();
    const user_id = await AsyncStorage.getItem('userId');

    const body = {
      device_type: Platform.OS === 'ios' ? 'ios' : 'android',
      device_id: deviceId,
      user_id: Number(user_id),
    };

    const response = await fetch(
      `${MAIN_URL.baseUrl}user/delete-fcm-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    const apiData = await response.json();

    if (apiData?.statusCode === 200) {
      await AsyncStorage.multiSet([
        ['userToken', ''],
        ['userData', ''],
        ['userId', ''],
        ['twilio_convo_', ''],
        ['twilio_msg_', ''],
        ['ISLOGIN', 'false'],
      ]);

      await resetTwilioClient();
      await clearTwilioCache();

      const messaging =
        require('@react-native-firebase/messaging').default;

      await messaging().deleteToken();

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'SinglePage',
            params: {
              resetToLogin: true,
              logoutMessage: t(Constant.USER_LOGOUT),
            },
          },
        ],
      });

      setShowConfirm(false);
    } else {
      showToast(t(Constant.LOGOUT_FAIL), 'error');
    }
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};
  return (
    <View style={styles.fullScreenContainer}>
      <View
        style={{
          paddingTop: Platform.OS === 'ios' ? 0 : 0,
          marginHorizontal: 16,
          gap: 24,
        }}
      >
        <View style={styles.userRow}>
          <View style={{ gap: 10 }}>
            {userMeta?.profile ? (
              <Image source={{ uri: userMeta.profile }} style={styles.avatar} />
            ) : (
              <View style={styles.initialsCircle}>
                <Text allowFontScaling={false} style={styles.initialsText}>
                  {getInitials(
                    userMeta?.firstname ?? ' ',
                    userMeta?.lastname ?? ' ',
                  )}
                </Text>
              </View>
            )}
          </View>

          <View style={{}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text allowFontScaling={false} style={styles.userName}>
                {userMeta
                  ? `${userMeta.firstname ?? ''} ${
                      userMeta.lastname ?? ''
                    }`.trim()
                  : t('loading')}
              </Text>
            </View>

            <View style={{ flexDirection: 'column', gap: 6, marginTop: 4 }}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <Image
                  source={BUILDING_ICON}
                  style={{ width: 16, height: 16 }}
                />
                <Text allowFontScaling={false} style={styles.userSub}>
                  {userMeta?.university_name
                    ? userMeta.university_name.length > 21
                      ? userMeta.university_name.slice(0, 21) + '…'
                      : userMeta.university_name
                    : 'University Name'}
                </Text>
              </View>

              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <Image source={SMS_ICON} style={{ width: 16, height: 16 }} />
                <Text allowFontScaling={false} style={styles.userSub}>
                  {userMeta?.email || 'studentname@gmail.com'}
                </Text>
              </View>

              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <Image source={SMS_ICON} style={{ width: 16, height: 16 }} />
                <Text allowFontScaling={false} style={styles.userSub}>
                  {userMeta?.student_email || 'studentname@university.ac.uk'}
                </Text>
              </View>

              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <Image source={CITY_ICON} style={{ width: 16, height: 16 }} />
                <Text allowFontScaling={false} style={styles.userSub}>
                  {userMeta?.city
                    ? userMeta.city.length > 21
                      ? userMeta.city.slice(0, 21) + '…'
                      : userMeta.city
                    : 'University Name'}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            style={{ position: 'absolute', right: 15, top: 14 }}
            onPress={() => {
              navigation.navigate('EditProfile');
            }}
          >
            <View style={styles.editcard}>
              <Text allowFontScaling={false} style={styles.edittext}>
                {t('edit')}
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={cardData}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: Platform.OS === 'ios' ? 10 : 110,
            }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        </View>
      </View>

      <CommonConfirmModal
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleLogout}
        title={t('confirm_logout')}
        message={t('logout_message')}
        confirmText={t('logout')}
        cancelText={t('cancel')}
        imageSource={require('../../../assets/images/alert_logout.png')}
        loading={loading}
      />

      <Modal
        visible={showConfirm1}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm1(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowConfirm1(false)}>
          <View style={COMMONSTYLE.overlay}>
            <BlurView
              style={[StyleSheet.absoluteFill, COMMONSTYLE.modelBlur]}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(0, 0, 0, 0.32)' },
              ]}
            />

            <View style={styles.popupContainer1}>
              <Image
                source={require('../../../assets/images/profile_delete.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text allowFontScaling={false} style={styles.mainheader}>
                {t('delete_account')}
              </Text>
              <Text allowFontScaling={false} style={styles.subheader}>
                {t('delete_message')}
              </Text>

              <View style={styles.password_container}>
                <TextInput
                  allowFontScaling={false}
                  style={styles.password_TextInput}
                  placeholder={t('enter_password')}
                  placeholderTextColor={'rgba(255, 255, 255, 0.48)'}
                  value={password}
                  maxLength={20}
                  selectionColor="#F5F5F5"
                  cursorColor={'#F5F5F5'}
                  secureTextEntry={!isPasswordVisible}
                  onChangeText={passwordText => setPassword(passwordText)}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <Image
                    source={
                      isPasswordVisible
                        ? require('../../../assets/images/eyeopen.png')
                        : require('../../../assets/images/eyecross1.png')
                    }
                    style={[
                      styles.eyeIcon,
                      isPasswordVisible ? styles.eyeIcon : styles.eyeCross,
                    ]}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={async () => {
                  if (!password?.trim()) {
                    setShowConfirm1(false);
                    showToast(t('PLEASE_FILL_ALL_REQUIRED_FIELDS'), 'error');
                    return;
                  }
                  try {
                    setLoading(true);
                    const token = await AsyncStorage.getItem('userToken');
                    const deviceId = await DeviceInfo.getUniqueId();
                    const user_id = await AsyncStorage.getItem('userId');

                    const body = {
                      device_type: Platform.OS === 'ios' ? 'ios' : 'android',
                      device_id: deviceId,
                      user_id: Number(user_id),
                      password: password,
                    };

                    const response = await fetch(
                      `${MAIN_URL.baseUrl}user/account-delete`,
                      {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(body),
                      },
                    );

                    const apiData = await response.json();

                    console.log('delete API Response:', apiData);

                    if (apiData?.statusCode === 200) {
                      await AsyncStorage.setItem('userToken', '');
                      await AsyncStorage.setItem('userData', '');
                      await AsyncStorage.setItem('userId', '');
                      await AsyncStorage.setItem('twilio_convo_', '');
                      await AsyncStorage.setItem('twilio_msg_', '');
                      setShowConfirm1(false);

                      try {
                        await resetTwilioClient();

                        await clearTwilioCache();
                        try {
                          const messaging =
                            require('@react-native-firebase/messaging').default;
                          await messaging().deleteToken();
                          if (__DEV__) {
                          }
                        } catch (fcmError) {
                          console.warn(
                            '⚠️ Error deleting FCM token:',
                            fcmError,
                          );
                        }

                        if (__DEV__) {
                        }
                      } catch (clearError) {
                        console.warn(
                          '⚠️ Error clearing Twilio data on logout:',
                          clearError,
                        );
                      }

                      await AsyncStorage.setItem('ISLOGIN', 'false');

                      navigation.reset({
                        index: 0,
                        routes: [
                          {
                            name: 'SinglePage',
                            params: {
                              resetToLogin: true,
                              logoutMessage: t(Constant.USER_DELETE),
                            },
                          },
                        ],
                      });
                    } else {
                      setShowConfirm1(false);
                      showToast(t(apiData?.message), 'error');
                    }
                  } catch (error) {
                    // console.log("Something went wrong. Try again!");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <Text allowFontScaling={false} style={styles.loginText}>
                  {t('yes_delete')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.loginButton1,
                  { marginTop: Platform.OS === 'ios' ? 10 : 10 },
                ]}
                onPress={() => setShowConfirm1(false)}
              >
                <Text allowFontScaling={false} style={styles.loginText1}>
                  {t('cancel')}
                </Text>
              </TouchableOpacity>
            </View>
            {/* </BlurView> */}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* <NewCustomToastContainer /> */}
    </View>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({

  loaderContainer: {
    height: '100%',width:'100%',flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  eyeIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain'
    // paddingRight: 16,
  },
  eyeCross: {
    width: 24,
    height: 24,
    resizeMode: 'contain'
  },

  password_container: {
    display: 'flex',
    width: '100%',
    height: 44,
    alignSelf: 'stretch',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',

    borderWidth: 0.6,
    borderColor: '#ffffff2c',
    marginTop: (Platform.OS === 'ios' ? 12 : 12),
  },
  password_TextInput: {
    width: '88%',
    paddingLeft: 4,
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
    color: '#fff'
  },

  logo: {
    width: 64,
    height: 64,
    marginBottom: 0,
  },

  // popupContainer: {
  //   width: '85%',
  //   padding: 20,
  //   borderRadius: 24,
  //   borderWidth: 1,
  //   borderColor: 'rgba(255, 255, 255, 0.1)',
  //   alignItems: 'center',
  //   overflow: 'hidden',
  //   backgroundColor: 'rgba(255, 255, 255, 0.04)',
  // },
  popupContainer1: {
    width: '85%',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },

  mainheader: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 28,

  },
  subheader: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 6,
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
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    marginTop: 12,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },

  loginButton1: {
    display: 'flex',
    width: '100%',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'rgba(170, 169, 176, 0.56)',
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },

  editcard: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderColor: '#ffffff11',
    borderRadius: 10,
    boxSizing: 'border-box',
    alignSelf: 'flex-start',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.14) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.02)inset -1px 10px 5px 10px,rgba(236, 232, 232, 0.3)inset -0.99px -0.88px 0.90px 0px,rgba(236, 232, 232, 0.3)inset 0.99px 0.88px 0.90px 0px',

  },

  edittext: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
    color: '#fff',
    fontWeight: 600,
    textAlign: 'center',
  },

  initialsCircle: {
    backgroundColor: '#8390D4',
    alignItems: 'center',
    justifyContent: 'center',
    width: 88,
    height: 88,
    borderRadius: 20,


    marginRight: 12
  },
  initialsText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 600,
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
  },
  listContainer: {
    marginBottom: 100
  },

  versionText: {
    position: 'absolute',
    right: 20,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Urbanist-SemiBold',
  },

  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 12,
    minHeight: 52,
  },
  cardImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain'
  },
  cardText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
  },
  cardArrow: {
    width: 24,
    height: 24,
  },

  fullScreenContainer: {
  },
  
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
  },
 
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    position: 'relative',
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.32,
  },
  userSub: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },

});