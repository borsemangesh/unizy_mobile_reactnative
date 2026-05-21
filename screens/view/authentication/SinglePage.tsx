import { BlurView } from '@react-native-community/blur';
import {
  RouteProp,
  useFocusEffect,
  useIsFocused,
  useRoute,
} from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Animated,
  Image,
  TouchableOpacity,
  Easing,
  TextInput,
  Dimensions,
  FlatList,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Styles } from './SinglePage.style';
import { selectlang_styles } from '../SelectLanguage/SelectLanguage.style';
import { getRequest } from '../../utils/API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
import {
  changeAppLanguage,
} from '../../../localization/i18n';
import { Language } from '../../utils/Language';
import { greetings } from '../../utils/Greetings';
import { Constant } from '../../utils/Constant';
import BackgroundAnimation_Android from '../Hello/BackgroundAnimation_Android';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import {
  NewCustomToastContainer,
  showToast,
} from '../../utils/component/NewCustomToastManager';
import {
  PassToastContainer,
  passshowToast,
} from '../../utils/component/PassToastManager';
import { resetTwilioClient } from '../emoji/twilioService';
import { clearTwilioCache } from '../dashboard/MessageIndividualScreen';
import DeviceInfo from 'react-native-device-info';

import ImagePicker from 'react-native-image-crop-picker';
import { requestCameraPermission } from '../../utils/COMFUN';

const { height } = Dimensions.get('window');

import BACKGOUND_ANIMATION_ICON from '../../../assets/images/bganimationscreen.png';

import SEARCH_ICON from '../../../assets/images/searchicon.png';
import COMMONSTYLE from '../../utils/CommonStyle';


 



type SinglePageProps = {
  navigation: any;
};
type RootStackParamList = {
  SinglePage: {
    resetToLogin?: boolean;
    logoutMessage: string;
    termandProlicy: boolean;
    forgotPassword: boolean;
    currentScreen: string;
    currentScreenIninner: string;
  };
};
type SinglePageRouteProp = RouteProp<RootStackParamList, 'SinglePage'>;

interface UserMeta {
  city: string | null;
  postal_code: string | null;
  latitude: number;
  longitude: number;
  // profile:string | null;
}
const SinglePage = ({ navigation }: SinglePageProps) => {
  const [currentScreen, setCurrentScreen] = useState<
    'hello' | 'language' | 'login' | 'splashScreen'
  >('splashScreen');

  const [currentScreenIninner, setcurrentScreenIninner] = useState<
    'login' | 'signup' | 'forgotpassword' | 'sendOTP' | 'verify' | 'profile'
  >('login');
  const { t } = useTranslation();
  //Hello Screen
  const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0);
  const unizyTranslateY = React.useRef(new Animated.Value(-100)).current;
  const loginunizyTranslateY = React.useRef(new Animated.Value(-100)).current;
  const greetingOpacity = React.useRef(new Animated.Value(0)).current;
  const greetingScale = React.useRef(new Animated.Value(0.8)).current;
  const slideUp = React.useRef(new Animated.Value(200)).current;
  const [username1, setUsername1] = useState<string>('');
  //Language Screen
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const route = useRoute<SinglePageRouteProp>();
  const [isLogout, setIsLogout] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const logoutCleanup = async () => {
    try {
      // Clear AsyncStorage in ONE call (much faster)

      const deviceId = await DeviceInfo.getUniqueId();
      const user_id = await AsyncStorage.getItem('userId');

      const body = {
        device_type: Platform.OS === 'ios' ? 'ios' : 'android',
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
      } else {
        showToast(t(Constant.LOGOUT_FAIL), 'error');
      }

      await AsyncStorage.multiSet([
        ['userToken', ''],
        ['userData', ''],
        ['userId', ''],
        ['twilio_convo_', ''],
        ['twilio_msg_', ''],
        ['ISLOGIN', 'false'],
      ]);

      // Twilio cleanup (don’t block UI)
      resetTwilioClient()?.catch(() => {});
      clearTwilioCache()?.catch(() => {});

      // FCM token delete (optional but safe)
      try {
        const messaging = require('@react-native-firebase/messaging').default;
        await messaging().deleteToken();
      } catch (e) {
        console.warn('⚠️ FCM delete failed:', e);
      }
    } catch (e) {
      console.warn('⚠️ Logout cleanup error:', e);
    }
  };

  useEffect(() => {
    if (route.params?.resetToLogin) {
      setIsLogout(false);
      loginOpacity.setValue(1);
      loginTranslateY.setValue(0);
      setCurrentScreen('login');
      setcurrentScreenIninner('login');
      setTimeout(() => {
        showToast(t(route.params?.logoutMessage), 'success');
      }, 500);

      // InteractionManager.runAfterInteractions(() => {
      //   logoutCleanup();
      // });
    }

    if (route.params?.forgotPassword) {
      loginOpacity.setValue(1);
      loginTranslateY.setValue(0);
      setCurrentScreen('login');
      setcurrentScreenIninner('forgotpassword');
      // showToast(route.params?.logoutMessage,'success')
    }
    if (route.params?.termandProlicy) {
      loginOpacity.setValue(1);
      loginTranslateY.setValue(0);
      setCurrentScreen('login');
      setcurrentScreenIninner('login');
      // showToast(route.params?.logoutMessage,'success')
    }
  }, [route.params]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getRequest('user/language');
        if (res?.data) {
          const sortedLanguages = [...res.data].sort((a, b) => a.id - b.id);
          setLanguages(sortedLanguages);
        }
      } catch (err) {
        // console.log('Error fetching languages', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredLanguages = languages
    .map(lang => ({
      id: lang.id,
      code: lang.iso_code.trim(),
      name: lang.language_name,
      flag: lang.logo || require('../../../assets/images/english.png'),
    }))
    .filter(lang =>
      (lang.name || '').toLowerCase().includes(search.toLowerCase()),
    );

  useEffect(() => {
    if (search.trim() !== '' && filteredLanguages.length === 0) {
      showToast(t(Constant.NO_RESULT_FOUND), 'error');
    }
  }, [search, filteredLanguages]);

  const handleLanguageSelect = async (item: Language) => {
    try {
      loginTranslateY.setValue(0);

      await AsyncStorage.setItem('selectedLanguage', JSON.stringify(item.code));

      await changeAppLanguage(item.code);

      setSelected(item.code);

      Animated.timing(loginunizyTranslateY, {
        toValue: 0,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        loginOpacity.setValue(1);
        setTextandBackIcon(true);
        setCurrentScreen('login');
        setcurrentScreenIninner('login');
        setPassword('');
        setUsername('');
      });
    } catch (err) {
      // console.log('Error saving selected language', err);
    }
  };

  // Login Screen
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [shrink, setShrink] = useState(false);
  const [showPopup1, setShowPopup1] = useState(false);
  const closePopup1 = () => setShowPopup1(false);

  const animateGreeting = () => {
    greetingOpacity.setValue(0);
    greetingScale.setValue(0.8);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(greetingOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(greetingScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(greetingOpacity, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(greetingScale, {
          toValue: 0.8,
          duration: 600,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  //   Signup Screen
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [signUpusername, setsignUpUsername] = useState('');
  const [signUppassword, setsignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signUperror, setsignUpError] = useState('');
  const [issignUpPasswordVisible, setsignUpIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const { width, height } = Dimensions.get('window');

  const screenHeight = Dimensions.get('window').height;

  // Animations
  const opacity = React.useRef(new Animated.Value(0)).current;

  const [slideUp1] = useState(new Animated.Value(height + 500));

  const [imageLoaded, setImageLoaded] = useState(false);
  const [verifyimageLoaded, setverifyimageLoaded] = useState(false);

  const [showPopup, setShowPopup] = useState(false);

  const resetPasswordtranslateY = React.useRef(new Animated.Value(0)).current;
  const restPasswordAnimatied = React.useRef(0);
  const setOTPTranslatY = React.useRef(new Animated.Value(height)).current;
  const verifyAndContinyTranslateY1 = React.useRef(
    new Animated.Value(0),
  ).current;
  const verifyAndContinyTranslateY2 = useRef(new Animated.Value(-400)).current;
  const profileTranslateY = useRef(new Animated.Value(-300)).current;
  const newsendOTPTranslateY = useRef(new Animated.Value(-300)).current;

  const closePopup = () => setShowPopup(false);

  const [showOtp, setShowOtp] = useState(false);

  const [photo, setPhoto] = useState<string | null>(null);
  const [showButton, setShowButton] = useState(false);
  const scaleY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideUp.setValue(100);
    translateY.setValue(-100);
    slideUp1.setValue(screenHeight);
    setOTPTranslatY.setValue(Dimensions.get('window').height);
    verifyAndContinyTranslateY1.setValue(-300);
    verifyAndContinyTranslateY2.setValue(-400);
    newsendOTPTranslateY.setValue(-300);
    profileTranslateY.setValue(-300);
    resetPasswordtranslateY.setValue(0);
  }, []);

  useEffect(() => {
    if (photo) {
      setShowButton(true);
      Animated.timing(scaleY, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => setShowButton(false));
    }

    if (currentScreen === 'language') {
      slideUp1.setValue(screenHeight);
      Animated.timing(slideUp1, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    }

    if (currentScreen === 'login') {
      Animated.timing(slideUp1, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();

      Animated.timing(loginTranslateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();

      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();

      Animated.parallel([
        Animated.timing(slideUp, {
          toValue: 0,
          duration: 600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.sequence([
        Animated.spring(loginTranslateY, {
          toValue: 0, // bounce upward
          friction: 3.5, // lower = bouncier
          tension: 0, // controls snap
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (currentScreenIninner === 'signup') {
      setImageLoaded(true);

      Animated.timing(signupTranslateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();

      Animated.sequence([
        Animated.spring(signupTranslateY, {
          toValue: 0, // bounce upward
          friction: 3.5, // lower = bouncier
          tension: 0, // controls snap
          useNativeDriver: true,
        }),
      ]).start();
    }
    if (currentScreenIninner === 'profile') {
      Animated.timing(profileTranslateY, {
        toValue: 0,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
      Animated.sequence([
        Animated.spring(profileTranslateY, {
          toValue: 0, // bounce upward
          friction: 3.5, // lower = bouncier
          tension: 0, // controls snap
          useNativeDriver: true,
        }),
      ]).start();
    }
    if (currentScreenIninner === 'verify') {
      setverifyimageLoaded(true);

      Animated.parallel([
        Animated.timing(verifyAndContinyTranslateY1, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.parallel([
        Animated.timing(verifyAndContinyTranslateY2, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.sequence([
        Animated.spring(verifyAndContinyTranslateY1, {
          toValue: 0, // bounce upward
          friction: 3.5, // lower = bouncier
          tension: 0, // controls snap
          useNativeDriver: true,
        }),
      ]).start();
      Animated.sequence([
        Animated.spring(verifyAndContinyTranslateY2, {
          toValue: 0, // bounce upward
          friction: 3.5, // lower = bouncier
          tension: 0, // controls snap
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (currentScreenIninner === 'sendOTP') {
      Animated.parallel([
        Animated.timing(setOTPTranslatY, {
          toValue: -800,
          duration: 300,
          easing: Easing.elastic(2),
          useNativeDriver: true,
        }),
      ]).start();
      Animated.sequence([
        Animated.spring(setOTPTranslatY, {
          toValue: 0, // bounce upward
          friction: 3.5, // lower = bouncier
          tension: 0, // controls snap
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (currentScreenIninner === 'forgotpassword') {
      Animated.parallel([
        Animated.timing(resetPasswordtranslateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.elastic(2),
          useNativeDriver: true,
        }),
      ]),
        Animated.sequence([
          Animated.spring(resetPasswordtranslateY, {
            toValue: 0, // bounce upward
            friction: 3.5, // lower = bouncier
            tension: 0, // controls snap
            useNativeDriver: true,
          }),
        ]).start();
    }
  }, [currentScreen, currentScreenIninner, photo]);

  useFocusEffect(
    React.useCallback(() => {
      if (currentScreen === 'hello') {
        Animated.timing(unizyTranslateY, {
          toValue: 0,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
        Animated.timing(slideUp, {
          toValue: 0, // final position
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
        animateGreeting();
      }

      if (
        (currentScreen === 'login' && currentScreenIninner === 'login') ||
        currentScreenIninner === 'signup'
      ) {
        slideUp.setValue(100);
        translateY.setValue(-100);
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 600,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(slideUp, {
            toValue: 0,
            duration: 600,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]).start();
      }

      const interval = setInterval(() => {
        setCurrentGreetingIndex(prevIndex =>
          prevIndex + 1 < greetings.length ? prevIndex + 1 : 0,
        );
        animateGreeting();
      }, 1800);

      return () => {
        clearInterval(interval);
        unizyTranslateY.stopAnimation();
        slideUp.stopAnimation();
        loginunizyTranslateY.stopAnimation();
      };
    }, []),
  );

  const [universityDomains, setUniversityDomains] = useState<string[]>([]);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const url4 = MAIN_URL.baseUrl + 'user/university-list';
        const res = await fetch(url4);
        const json = await res.json();
        if (json?.data) {
          // Extract domain names
          const domains = json.data.map((u: any) =>
            u.domain_name.toLowerCase(),
          );
          setUniversityDomains(domains);
        }
      } catch (err) {
        console.error('Error fetching universities:', err);
      }
    };

    fetchUniversities();
  }, []);

  useEffect(() => {
    if (currentScreenIninner === 'sendOTP') {
      // Small delay ensures animation + render is complete
      const timer = setTimeout(() => {
        inputs.current[0]?.focus();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [currentScreenIninner]);

  useEffect(() => {
    if (currentScreenIninner === 'verify' && showOtp && verifyimageLoaded) {
      const timer = setTimeout(() => {
        verifyinputs.current[0]?.focus();
      }, 300); // wait for animation + render

      return () => clearTimeout(timer);
    }
  }, [currentScreenIninner, showOtp, verifyimageLoaded]);

  const stepIndex = (() => {
    switch (currentScreenIninner) {
      case 'signup':
        return 0;
      case 'sendOTP':
        return 1;
      case 'verify':
        return 2;
      case 'profile':
        return 3;
      default:
        return 0;
    }
  })();

  const handleSendResetLink = async () => {
    Keyboard.dismiss();
    if (!username1.trim()) {
      showToast(t(Constant.REQUIRED_ALL_FIELDS), 'error');
      return;
    }

    const emailRegex =
      /^[^\s@]+@(?!(?:[^\s@]+\.)?(?:ac\.uk|edu)$)[^\s@]+\.[^\s@]+$/i;

    if (!emailRegex.test(username1.trim())) {
      showToast(t(Constant.VALID_EMAIL_ADDRESS), 'error');
      return;
    }

    try {
      const url = MAIN_URL.baseUrl + 'user/forgot-password';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: username1 }),
      });

      const data = await res.json();

      if (res.ok) {
        // Show toast
        // showToast(t(data.message || Constant.PASSWORD_RESET_LINK_SENT, )'success');

        showToast(
          t(data?.message) || t(Constant.PASSWORD_RESET_LINK_SENT),
          'success',
        );
        const toastDuration = 3000;
        setTimeout(() => {
          setShowPopup(true);
        }, toastDuration);
        setUsername1('');
      } else {
        showToast(t(data.message) || t(Constant.SOMTHING_WENT_WRONG), 'error');
      }
    } catch (error) {
      console.error('Error sending reset link:', error);
      showToast(t(Constant.NETWORK_ERROR_PLEASE_TRY_AGAIN), 'error');
    }
  };

  const loginapi = async () => {
    if (loading) return;
    Keyboard.dismiss();

    if (!username.trim() || !password.trim()) {
      showToast(t(Constant.REQUIRED_ALL_FIELDS), 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username.trim())) {
      showToast(t(Constant.VALID_EMAIL_ADDRESS), 'error');
      return;
    }

    setLoading(true);

    try {
      console.log('LOGINUSR: ', MAIN_URL.baseUrl + 'user/login');
      console.log('body',JSON.stringify({
          email: username,
          password: password,
        }))
      const response = await fetch(MAIN_URL.baseUrl + 'user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      });

      let result;
      try {
        result = await response.json();
        console.log('LoginResponse: ', result);
      } catch (err) {
        setLoading(false);
        showToast(t(Constant.INVALID_SERVER_RESPONSE), 'error');
        return;
      }

      if (!response.ok || result?.statusCode !== 200) {
        setLoading(false);
        showToast(
          t(result?.message) || t(Constant.INVALID_EMAIL_OR_PASSWORD),
          'error',
        );
        return;
      }

      const token = result?.data?.token;
      const user = result?.data?.user;
      const stripelivekey = result?.data?.stripelivekey;

      console.log(response);

      if (token && user) {
        setLoading(false);
        await AsyncStorage.setItem('STRIPE_KEY', '');
        await AsyncStorage.setItem(
          'STRIPE_LIVE',
          stripelivekey ? 'true' : 'false',
        );
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        await AsyncStorage.setItem('userId', String(user.id));

        showToast(
          t(result?.message) || t(Constant.LOGIN_SUCCESSFUL),
          'success',
        );

        setUsername('');
        setPassword('');
        setIsPasswordVisible(false);
        setTextandBackIcon(false);
        await AsyncStorage.setItem('ISLOGIN', 'true');
        const onboardingDone = await AsyncStorage.getItem('ISONBOARDING');

        if (onboardingDone === 'true') {
          navigation.replace('Dashboard', {
            AddScreenBackactiveTab: 'Home',
            isNavigate: true,
            loginMessage: result?.message,
            isFirsttimeLogin: false,
          });
        } else {
          navigation.replace('OnboardingScreen');
        }
      } else {
        setLoading(false);
        showToast(t(Constant.INVALID_USER_DATA_RECEIVED), 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clickOnSendOTP = (onFinish?: () => void) => {
    setOTPTranslatY.setValue(-300);
    Animated.timing(signupTranslateY, {
      toValue: 300, //-Dimensions.get('window').height,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      if (onFinish) onFinish();
    });

    Animated.timing(loginTranslateY, {
      toValue: -300, //Dimensions.get('window').height,
      duration: 80,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {});
  };

  const handleSendOTP = async () => {
    setOtp(['', '', '', '']);

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !signUpusername.trim() ||
      !signUppassword.trim() ||
      !confirmPassword.trim() ||
      !userMeta.postal_code?.trim()
    ) {
      showToast(t(Constant.REQUIRED_ALL_FIELDS), 'error');
      return;
    }

    if (!userMeta.postal_code || userMeta.postal_code.trim() === '') {
      showToast(t('postal_code_req'));
      return;
    } 
    if(!userMeta.city || userMeta.city.trim() === '') {
      showToast(t('valid_city'), 'error');
      return;
    }
    const emailRegex =
      /^[^\s@]+@(?!(?:[^\s@]+\.)?(?:ac\.uk|edu)$)[^\s@]+\.[^\s@]+$/i;
    if (!emailRegex.test(signUpusername.trim())) {
      showToast(t(Constant.VALID_EMAIL_ADDRESS), 'error');
      return;
    }

    // const passwordRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]|:;"'<>,.?/]).{8,}$/;
    if (!passwordRegex.test(signUppassword.trim())) {
      // showToast(t(Constant.PASSWORD_VALID), 'error');
      passshowToast(t(Constant.PASSWORD_VALID), 'error');
      return;
    }
    if (signUppassword.trim() !== confirmPassword.trim()) {
      showToast(t(Constant.PASSWORDS_DO_NOT_MATCH), 'error');
      return;
    }

    if (!isChecked) {
      showToast(t(Constant.PLEASE_ACCEPT_TERMS_AND_PRIVACY_POLICY), 'error');
      return;
    }

    try {
      const body = {
        firstname: firstName,
        lastname: lastName,
        postal_code: userMeta.postal_code,
        email: signUpusername,
        password: signUppassword,
        confirmPassword: confirmPassword,
        city: userMeta.city,
        latitude: userMeta.latitude,
        longitude: userMeta.longitude,
      };

      const url = MAIN_URL.baseUrl + 'user/user-signup';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('SignupUrl: ', url);
      console.log('SignupResponse: ', data);
      console.log('SignUpBody:', JSON.stringify(body));

      if (response.status === 201) {
        showToast(t(data.message), 'success');

        await AsyncStorage.setItem(
          'tempUserId',
          data.data.temp_user_id.toString(),
        );
        await AsyncStorage.setItem('otp_id', data.data.otp_id.toString());
        await AsyncStorage.setItem(
          'personal_mail_id',
          signUpusername.toString(),
        );

        clickOnSendOTP(() => {
          setCurrentScreen('login');
          setcurrentScreenIninner('sendOTP');
        });
      } else {
        showToast(t(data.message) || 'Signup failed', 'error');
      }
    } catch (err) {
      showToast(t(Constant.FAIL_TO_SEND_OTP), 'error');
    }
  };

  const [otp, setOtp] = useState(['', '', '', '']);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < inputs.current.length - 1) {
      inputs.current[index + 1]?.focus();
    } else if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const clickOtpVerify = (onFinish?: () => void) => {
    Animated.timing(setOTPTranslatY, {
      toValue: 300, //-Dimensions.get('window').height,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      if (onFinish) onFinish();
    });

    Animated.timing(loginTranslateY, {
      toValue: -300, //Dimensions.get('window').height,
      duration: 80,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  const otpverify = async () => {
    Keyboard.dismiss();

    setverifyUsername('');
    const otpValue = otp.join('');

    if (otpValue.length < 4 || otp.includes('')) {
      showToast(t(Constant.PLEASE_ENTER_ALL_4_DIGITS_OF_THE_OTP), 'error');
      return;
    }
    try {
      const otp_id = await AsyncStorage.getItem('otp_id');

      if (!otp_id) {
        showToast(t(Constant.OTP_ID_MISSING), 'error');
        return;
      }

      const url = MAIN_URL.baseUrl + 'user/signup-otpverify';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otp_id: Number(otp_id),
          otp: otpValue,
        }),
      });

      const data = await res.json();

      if (data?.statusCode === 200) {
        showToast(t(data.message), 'success');
        await AsyncStorage.setItem(
          'temp_user_id',
          data.data.temp_user_id.toString(),
        );

        setFirstName('');
        setLastName('');
        setConfirmPassword('');
        setPostalCode('');
        setsignUpUsername('');
        setsignUpPassword('');
        setsignUpIsPasswordVisible(false);
        setIsConfirmPasswordVisible(false);

        clickOtpVerify(() => {
          setCurrentScreen('login');
          setcurrentScreenIninner('verify');
          setShowOtp(false);
          setverifyimageLoaded(true);
        });
      } else {
        showToast(
          t(data?.message) || t(Constant.OPT_VERIFICATION_FAILED),
          'error',
        );
      }
    } catch (err) {
      console.error(err);
      showToast(t(Constant.SOMTHING_WENT_WRONG), 'error');
    }
  };

  const handleresend = async () => {
    setOtp(['', '', '', '']);
    try {
      const tempUserId = await AsyncStorage.getItem('tempUserId');

      const url1 = MAIN_URL.baseUrl + 'user/resend-otp';

      const response = await fetch(url1, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temp_user_id: Number(tempUserId),
        }),
      });

      const data = await response.json();
      if (response.ok && data?.statusCode === 200) {
        showToast(t(data.message), 'success');

        await AsyncStorage.setItem(
          'tempUserId',
          data.data.temp_user_id.toString(),
        );

        await AsyncStorage.setItem('otp_id', data.data.otp_id.toString());

        setTimeout(() => {
          inputs.current[0]?.focus();
        }, 200);
      } else {
      }
    } catch (err) {
      console.error('Error resending OTP:', err);
    }
  };

  //verify and otp

  const [verifyusername, setverifyUsername] = useState<string>('');

  const [otp1, setOtp1] = useState(['', '', '', '']);
  const verifyinputs = useRef<(TextInput | null)[]>([]);

  // useEffect(()=>{
  //   if(verifyinputs.current[0]){
  //     verifyinputs.current[0].focus();
  //   }
  // })

  const veryfyhandleChange = (text: string, index: number) => {
    const newOtp = [...otp1];
    newOtp[index] = text;
    setOtp1(newOtp);

    if (text && index < verifyinputs.current.length - 1) {
      verifyinputs.current[index + 1]?.focus();
    } else if (!text && index > 0) {
      verifyinputs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async () => {
    Keyboard.dismiss();
    setOtp1(['', '', '', '']);

    if (!verifyusername.trim()) {
      showToast(t(Constant.REQUIRED_ALL_FIELDS), 'error');
      return;
    }

    const emailParts = verifyusername.split('@');
    if (emailParts.length !== 2) {
      showToast(t(Constant.VALID_UNIVERSITY_EMAIL_ADDRESS), 'error');
      return;
    }

    //const domain = '@' + emailParts[1].toLowerCase();
    const domain = '@' + emailParts[1].trim().toLowerCase();

    if (!universityDomains.includes(domain)) {
      showToast(t(Constant.VALID_UNIVERSITY_EMAIL_ADDRESS), 'error');
      return;
    }

    try {
      const url = MAIN_URL.baseUrl + 'user/student-email';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_email: verifyusername,
          temp_user_id:
            Number(await AsyncStorage.getItem('temp_user_id')) || undefined,
        }),
      });

      const data = await res.json();

      if (data?.statusCode === 200) {
        showToast(t(data.message), 'success');
        await AsyncStorage.setItem(
          'temp_user_id',
          data.data.temp_user_id.toString(),
        );
        await AsyncStorage.setItem('otp_id', data.data.otp_id.toString());
        await AsyncStorage.setItem('signupUsername', verifyusername);

        Animated.timing(verifyAndContinyTranslateY1, {
          toValue: 200, //Dimensions.get('window').height, // move down off screen
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          setShowOtp(true);
          verifyAndContinyTranslateY2.setValue(-200);
          Animated.timing(verifyAndContinyTranslateY2, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start();
          setTimeout(() => {
            verifyinputs.current[0]?.focus();
          }, 300);
          Animated.sequence([
            Animated.spring(verifyAndContinyTranslateY2, {
              toValue: 0, // bounce upward
              friction: 3.5, // lower = bouncier
              tension: 0, // controls snap
              useNativeDriver: true,
            }),
          ]).start();
        });
      } else {
        showToast(t(data?.message) || 'Failed to send OTP', 'error');
      }
    } catch (err) {
      showToast(t(Constant.SOMTHING_WENT_WRONG), 'error');
    }
  };

  const clicksubmitotp = (onFinish?: () => void) => {
    profileTranslateY.setValue(-300);
    Animated.timing(verifyAndContinyTranslateY2, {
      toValue: 300, //-Dimensions.get('window').height,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      if (onFinish) onFinish();
    });

    Animated.timing(profileTranslateY, {
      toValue: -300, //Dimensions.get('window').height,
      duration: 80,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  const submitotp = async () => {
    Keyboard.dismiss();
    setPhoto('');
    const otpValue = otp1.join('');

    if (otpValue.length < 4 || otp1.includes('')) {
      showToast(t(Constant.PLEASE_ENTER_ALL_4_DIGITS_OF_THE_OTP), 'error');
      return;
    }

    try {
      const otp_id = await AsyncStorage.getItem('otp_id');
      if (!otp_id) {
        showToast(t(Constant.OTP_ID_MISSING), 'error');
        return;
      }

      const url = MAIN_URL.baseUrl + 'user/student-otpverify';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otp_id: Number(otp_id),
          otp: otpValue,
        }),
      });

      const data = await res.json();

      if (data?.statusCode === 200) {
        showToast(t(data.message), 'success');

        if (data?.data) {
          await AsyncStorage.setItem('user_email', data.data.email || '');
          await AsyncStorage.setItem('firstname', data.data.firstname || '');
          await AsyncStorage.setItem('lastname', data.data.lastname || '');
          await AsyncStorage.setItem('userId', String(data.data.userId));
          await AsyncStorage.setItem(
            'student_email',
            data.data.student_email || '',
          );
          await AsyncStorage.setItem('userId', String(data.data.userId));

          if (data?.data?.token?.access_token) {
            await AsyncStorage.setItem(
              'userToken',
              data.data.token.access_token,
            );
          }
        }

        profileTranslateY.setValue(-300);

        clicksubmitotp(() => {
          setShowPopup1(false);
          setCurrentScreen('login');
          setcurrentScreenIninner('profile');
        });
      } else {
        showToast(t(data?.message) || 'OTP verification failed', 'error');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      showToast(t(Constant.SOMTHING_WENT_WRONG), 'error');
    }
  };

  const resubmitotp = async () => {
    try {
      Keyboard.dismiss();
      setOtp1(['', '', '', '']);
      const url = MAIN_URL.baseUrl + 'user/student-email';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_email: verifyusername,
          temp_user_id:
            Number(await AsyncStorage.getItem('temp_user_id')) || undefined,
        }),
      });

      const data = await res.json();

      if (data?.statusCode === 200) {
        await AsyncStorage.setItem(
          'temp_user_id',
          data.data.temp_user_id.toString(),
        );
        await AsyncStorage.setItem('otp_id', data.data.otp_id.toString());
        // await AsyncStorage.setItem('signupUsername', username);

        showToast(t(data.message), 'success');
        setShowOtp(true);
        //startAnimation();
        setTimeout(() => {
          verifyinputs.current[0]?.focus();
        }, 200);
      } else {
        showToast(t(data?.message) || t(Constant.FAIL_TO_SEND_OTP), 'error');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      showToast(t(Constant.SOMTHING_WENT_WRONG), 'error');
    }
  };
  //profile

  // const requestCameraPermission = async () => {
  //   // ANDROID
  //   if (Platform.OS === 'android') {
  //     try {
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.CAMERA,
  //         {
  //           title: 'Camera Permission',
  //           message: 'App needs access to your camera',
  //           buttonNeutral: 'Ask Me Later',
  //           buttonNegative: 'Cancel',
  //           buttonPositive: 'OK',
  //         },
  //       );

  //       return granted === PermissionsAndroid.RESULTS.GRANTED;
  //     } catch (err) {
  //       console.warn(err);
  //       return false;
  //     }
  //   }

  //   // iOS
  //   if (Platform.OS === 'ios') {
  //     try {
  //       const status = await check(PERMISSIONS.IOS.CAMERA);

  //       switch (status) {
  //         case RESULTS.GRANTED:
  //           return true;

  //         case RESULTS.DENIED:
  //           // User denied previously → we can ask again
  //           const result = await request(PERMISSIONS.IOS.CAMERA);
  //           return result === RESULTS.GRANTED;

  //         case RESULTS.BLOCKED:
  //           // User selected "Don't Allow" + "Don't ask again"
  //           Alert.alert(
  //             'Camera Permission Needed',
  //             'Camera access is blocked. Please enable it in Settings.',
  //             [
  //               { text: 'Open Settings', onPress: () => openSettings() },
  //               { text: 'Cancel', style: 'cancel' },
  //             ],
  //           );
  //           return false;

  //         default:
  //           return false;
  //       }
  //     } catch (err) {
  //       console.warn(err);
  //       return false;
  //     }
  //   }

  //   return true;
  // };

  const loginTranslateY = useRef(new Animated.Value(0)).current;
  const signupTranslateY = useRef(
    new Animated.Value(Dimensions.get('window').height),
  ).current;

  const ClickFPGoBack_slideOutToTop = (onFinish?: () => void) => {
    Animated.timing(resetPasswordtranslateY, {
      toValue: -300, //-Dimensions.get('window').height,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      if (onFinish) onFinish();
    });
    Animated.timing(slideUp, {
      toValue: 50, //-Dimensions.get('window').height,
      duration: 100,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {});
    Animated.timing(loginTranslateY, {
      toValue: 300, //Dimensions.get('window').height,
      duration: 100,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const goToForgotPassword = (onFinish?: () => void) => {
    Animated.timing(loginTranslateY, {
      toValue: 300, //-Dimensions.get('window').height,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      if (onFinish) onFinish();
    });
    Animated.timing(slideUp, {
      toValue: 300, //-Dimensions.get('window').height,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {});
    Animated.timing(resetPasswordtranslateY, {
      toValue: -300, //Dimensions.get('window').height,
      duration: 80,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  const heightAnim = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(
    Dimensions.get('window').height,
  );

  useEffect(() => {
    if (contentHeight > 0) {
      if (currentScreenIninner !== 'signup') {
        Animated.timing(heightAnim, {
          toValue: contentHeight + 30,
          duration: 700,
          easing: Easing.out(Easing.exp),
          useNativeDriver: false,
        }).start();
      } else {
        Animated.timing(heightAnim, {
          toValue: contentHeight + 30,
          duration: 1000,
          easing: Easing.out(Easing.exp),
          useNativeDriver: false,
        }).start();
      }
    }
  }, [contentHeight]);

  const Click_SENDOTP_TO_SIGNUPSCREEN = (onFinish?: () => void) => {
    Animated.timing(setOTPTranslatY, {
      toValue: -400, //-Dimensions.get('window').height,
      duration: 350,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      if (onFinish) onFinish();
    });
    Animated.timing(signupTranslateY, {
      toValue: 400, //Dimensions.get('window').height,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  // const handleSelectImage = async () => {
  //   const hasPermission = await requestCameraPermission();
  //   if (!hasPermission) return;

  //   const handleResponse = async (response: any) => {
  //     if (response.didCancel) return;
  //     if (response.assets && response.assets[0].uri) {
  //       const uri = response.assets[0].uri;
  //       setPhoto(uri);
  //       await uploadImage(uri);
  //     }
  //   };

  //   Alert.alert(
  //     'Select Option',
  //     "Choose a source",
  //     [
  //       {
  //         text: 'Camera',
  //         onPress: () => {
  //           launchCamera(
  //             {
  //               mediaType: 'photo',
  //               cameraType: 'front',
  //               quality: 0.8,
  //             },
  //             handleResponse,
  //           );
  //         },
  //       },
  //       {
  //         text: 'Gallery',
  //         onPress: () => {
  //           launchImageLibrary(
  //             {
  //               mediaType: 'photo',
  //               quality: 0.8,
  //             },
  //             handleResponse,
  //           );
  //         },
  //       },
  //       {
  //         text: 'Cancel',
  //         style: 'cancel',
  //       },
  //     ],
  //     { cancelable: true },
  //   );
  // };

  const handleSelectImage = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    Alert.alert(
      'Select Option',
      'Choose a source',
      [
        {
          text: 'Camera',
          onPress: () => openCamera(),
        },
        {
          text: 'Gallery',
          onPress: () => openGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  const openCamera = async () => {
    try {
      const image = await ImagePicker.openCamera({
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
        mediaType: 'photo',
      });

      const imageUri =
        Platform.OS === 'android'
          ? image.path
          : image.path.replace('file://', '');

      setPhoto(imageUri);

      // ✅ Upload immediately like your original version
      await uploadImage(imageUri);
    } catch (error) {
      console.log('Camera Error:', error);
    }
  };

  const openGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
        mediaType: 'photo',
        forceJpg: true,
        includeExif: false,
        includeBase64: false,
      });

      const imageUri =
        Platform.OS === 'android'
          ? image.path
          : image.path.replace('file://', '');

      setPhoto(imageUri);

      // ✅ Upload immediately like your original version
      await uploadImage(imageUri);
    } catch (error) {
      console.log('Gallery Error:', error);
    }
  };

  const insets = useSafeAreaInsets();

  const uploadImage = async (uri: string) => {
    setLoading(true);
    try {
      if (!uri) {
        Alert.alert(Constant.ALERT_MESSAGE_PLEASE_SELECT_AN_IMAGE_FIRST);
        setLoading(false);
        return;
      }

      const token = await AsyncStorage.getItem('userToken');

      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const url = MAIN_URL.baseUrl + 'user/update-profile';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result?.message) {
        showToast(t(result.message), 'success');

        // setTimeout(() => {
        //   setShowPopup1(true);
        // }, 2000);
      } else {
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const [textandBackIcon, setTextandBackIcon] = useState(false);
  const textAndBackOpacity = useRef(new Animated.Value(1)).current;
  const [initialRoute, setInitialRoute] = useState<null | string>(null);

  const animRef = useRef<LottieView>(null);

  const handleAnimationFinish = () => {
    const checkLoginStatus = async () => {
      const flag = await AsyncStorage.getItem('ISLOGIN');
      if (Platform.OS == 'android') {
        animRef.current?.reset();
        animRef.current?.pause();
      } else {
        animRef.current?.reset();
        // animRef.current?.pause();
      }
      if (flag === 'true') {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Dashboard',
              params: {
                AddScreenBackactiveTab: 'Home',
                isNavigate: true,
                isFirsttimeLogin: false,
              },
            },
          ],
        });
      } else {
        // User is not logged in → show hello screen
        setCurrentScreen('hello');
        setCurrentGreetingIndex(-1); // set greeting index only for hello screen

        Animated.timing(unizyTranslateY, {
          toValue: 0,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
        Animated.timing(slideUp, {
          toValue: 0, // final position
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
        // animateGreeting();
      }
    };

    checkLoginStatus();
  };

  const signupOpacity = useRef(new Animated.Value(0)).current;
  const loginOpacity = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();

  const [typingTimeout, setTypingTimeout] = useState<any>(null);
  const [userMeta, setUserMeta] = useState<UserMeta>({
    city: '',
    postal_code: '',
    latitude: 0,
    longitude: 0,
  });

  const ClickPostalCode = async (postalCode: any) => {
    const location = await getCityFromPostalCode(postalCode);
    if (!location){
      setUserMeta(prev => ({
        ...prev,
        city:   '',
        latitude: 0,
        longitude: 0,
      }));
      return;
    } 

    setUserMeta(prev => ({
      ...prev,
      city: location.city || '',
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  };
  const getCityFromPostalCode = async (postalCode: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${postalCode}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MyAndroidApp/1.0 (contact@myapp.com)',
            'Accept-Language': 'en-US',
          },
        },
      );

      const data = await response.json();
      console.log('location data:', data);

      if (!data || data.length === 0) return null;

      const result = data[0];
      const address = result.address;

      const city =
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        address.state_district ||
        null;

      return {
        city,
        latitude: parseFloat(result.lat), // ✅ FIX
        longitude: parseFloat(result.lon), // ✅ FIX
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  //   const getCityFromPostalCode = async (postalCode: string) => {
  //     try {
  //       const response = await fetch(
  //         `https://nominatim.openstreetmap.org/search?postalcode=${postalCode}&format=json&addressdetails=1`,
  //         {
  //           headers: {
  //             "User-Agent": "MyAndroidApp/1.0 (contact@myapp.com)",
  //             "Accept-Language": "en-US",
  //           },
  //         }
  //       );

  //       const data = await response.json();
  //       console.log("location data:", data);
  //       const result = data[0];

  //       if (!data || data.length === 0) return null;

  //       const address = data[0].address;

  //       return (
  //         address.city ||            // US, some countries
  //         address.town ||            // smaller towns
  //         address.village ||         // villages
  //         address.county ||          // India, UK (like Pune City)
  //         address.state_district ||  // fallback
  //         parseFloat(result.lat) || // ✅ FIX
  //       parseFloat(result.lon)||  // ✅ FIX
  //       null
  //     );

  //   } catch (error) {
  //     console.error(error);
  //     return null;
  //   }
  // };
  return (
    <ImageBackground
      source={BACKGOUND_ANIMATION_ICON}
      style={{ width: '100%', height: '100%' }}
      resizeMode="cover"
    >
      {Platform.OS === 'android' ? (
        <>
          <BackgroundAnimation_Android />
        </>
      ) : (
        <>
          <View style={[StyleSheet.absoluteFill, { opacity: 0.4 }]}>
            <LottieView
              source={require('../../../assets/animations/backgroundanimation3.json')}
              autoPlay
              loop
              resizeMode="cover"
              style={StyleSheet.absoluteFillObject}
            />
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={30}
            />
          </View>
        </>
      )}
      <View
        style={{
          flex: 1,
          paddingTop: Platform.OS === 'ios' ? 0 : 30,
        }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {currentScreen === 'splashScreen' && (
            <>
              {/* <View style={Styles.ScreenLayout}> */}
              {Platform.OS === 'ios' ? (
                <LottieView
                  ref={animRef}
                  source={require('../../../assets/animations/animation_new.json')}
                  autoPlay
                  loop={false}
                  resizeMode="contain"
                  style={{ width, height }}
                  onLayout={() => {
                    animRef.current?.reset();
                    animRef.current?.play();
                  }}
                  onAnimationFinish={handleAnimationFinish}
                />
              ) : (
                <LottieView
                  ref={animRef}
                  source={require('../../../assets/animations/animation_new.json')}
                  autoPlay
                  loop={false}
                  resizeMode="contain"
                  style={{ width, height }}
                  onAnimationFinish={handleAnimationFinish}
                />
              )}

              {/* </View> */}
            </>
          )}
          {currentScreen === 'hello' && (
            <View style={Styles.ScreenLayout}>
              <Animated.View
                style={[
                  { paddingTop: Platform.OS === 'ios' ? 80 : 40 },
                  { transform: [{ translateY: unizyTranslateY }] },
                ]}
              >
                <TouchableOpacity
                  onPress={() => console.log('Back button pressed')}
                >
                  <View style={[Styles.backIconRow, { display: 'none' }]}>
                    <Image
                      source={require('../../../assets/images/back.png')}
                      style={{ height: 24, width: 24 }}
                    />
                  </View>
                </TouchableOpacity>
                <Text allowFontScaling={false} style={Styles.unizyText}>
                  UniZy
                </Text>
                <View style={Styles.emptyView}></View>
              </Animated.View>

              <Animated.Text
                allowFontScaling={false}
                style={[
                  Styles.hellowText,
                  {
                    opacity: greetingOpacity,
                    transform: [{ scale: greetingScale }],
                  },
                ]}
              >
                {greetings[currentGreetingIndex]}
              </Animated.Text>

              <Animated.View
                style={[
                  Styles.linearGradient,
                  { transform: [{ translateY: slideUp }] },
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    Animated.parallel([
                      // Slide Verify screen up (out)
                      Animated.timing(unizyTranslateY, {
                        toValue: -Dimensions.get('window').height,
                        duration: 1000,
                        easing: Easing.linear,
                        useNativeDriver: true,
                      }),
                    ]).start(() => {});
                    setCurrentScreen('language');
                  }}
                >
                  <View style={Styles.SelectLanguageContainer}>
                    <Image
                      source={require('../../../assets/images/language.png')}
                      style={{ width: 18, height: 18 }}
                    />
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text
                        allowFontScaling={false}
                        style={Styles.selectlanguageText}
                      >
                        Select Language
                      </Text>
                      <Image
                        source={require('../../../assets/images/right.png')}
                        style={{ width: 24, height: 24 }}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
          ;
          {currentScreen === 'language' && (
            <>
              <View
                style={{
                  height: '100%',
                  padding: 16,
                  paddingBottom: Platform.OS === 'ios' ? insets.bottom : 20,
                  paddingTop: Platform.OS === 'ios' ? 60 : 20,
                }}
                onLayout={e => {
                  const { height } = e.nativeEvent.layout;
                  setContentHeight(height); // save measured height
                }}
              >
                <Animated.View
                  style={[
                    selectlang_styles.container,
                    { transform: [{ translateY: slideUp1 }] },
                  ]}
                >
                  <Text
                    allowFontScaling={false}
                    style={selectlang_styles.title}
                  >
                    Select Language
                  </Text>

                  <View style={selectlang_styles.search_container}>
                    <Image
                      source={SEARCH_ICON}
                      style={selectlang_styles.searchIcon}
                    />
                    <TextInput
                      allowFontScaling={false}
                      style={selectlang_styles.searchBar}
                      placeholder="Search"
                      selectionColor="#F5F5F5"
                      cursorColor={'#F5F5F5'}
                      //placeholderTextColor="#ccc"
                      placeholderTextColor="rgba(255, 255, 255, 0.72)"
                      onChangeText={setSearch}
                      value={search}
                    />
                  </View>

                  <View style={selectlang_styles.listContainer}>
                    <FlatList
                      contentContainerStyle={selectlang_styles.listContent}
                      style={selectlang_styles.flatListStyle}
                      data={filteredLanguages}
                      //keyExtractor={item => item.code}
                      keyExtractor={item => item.id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={selectlang_styles.languageItem}
                          onPress={() => {
                            handleLanguageSelect(item);
                            slideUp.setValue(100);
                          }}
                        >
                          <View
                            style={{
                              display: 'flex',
                              paddingTop: 10,
                              paddingBottom: 12,
                              flexDirection: 'row',
                              alignItems: 'center',
                              width: '100%',
                            }}
                          >
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  minHeight: 30,
                                }}
                              >
                                {/* <Image
                                  source={
                                    typeof item.flag === 'string'
                                      ? { uri: item.flag }
                                      : item.flag
                                  } // handle URI or require
                                  style={selectlang_styles.flag}
                                /> */}
                                <Text
                                  allowFontScaling={false}
                                  style={selectlang_styles.languageText}
                                >
                                  {item.name}
                                </Text>
                              </View>
                              <View>
                                <View
                                  style={selectlang_styles.radioButton_round}
                                >
                                  <View
                                    style={[
                                      selectlang_styles.radioButton,
                                      selected === item.code &&
                                        selectlang_styles.radioButtonSelected,
                                    ]}
                                  />
                                </View>
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </Animated.View>
              </View>
            </>
          )}
          {currentScreen === 'login' && (
            <>
              <View
                style={{
                  paddingTop: Platform.OS === 'ios' ? '18%' : 40,
                  paddingLeft: Platform.OS === 'ios' ? 16 : 16,
                  paddingRight: Platform.OS === 'ios' ? 16 : 16,
                }}
              >
                {currentScreenIninner === 'login' && (
                  <TouchableOpacity
                    style={{ zIndex: 1000 }}
                    onPress={() => {
                      translateY.setValue(-100);
                      setSelected(null);
                      setCurrentScreen('language');
                    }}
                  >
                    <Animated.View
                      style={{
                        opacity: textAndBackOpacity,
                        transform: [
                          { translateY: textandBackIcon ? translateY : 0 },
                        ],
                      }}
                    >
                      <View style={Styles.backIconRow}>
                        <Image
                          source={require('../../../assets/images/back.png')}
                          style={{ height: 26, width: 26 }}
                        />
                      </View>
                    </Animated.View>
                  </TouchableOpacity>
                )}

                <Animated.View
                  style={{
                    transform: [
                      { translateY: textandBackIcon ? translateY : 0 },
                    ],
                  }}
                >
                  <Text allowFontScaling={false} style={Styles.unizyText}>
                    UniZy
                  </Text>
                </Animated.View>
              </View>

              <View
                style={{
                  width: '100%',
                  height: '100%',
                  paddingLeft: Platform.OS === 'ios' ? 16 : 16,
                  paddingRight: Platform.OS === 'ios' ? 16 : 16,
                  paddingTop: Platform.OS === 'ios' ? 20 : 16,
                }}
              >
                <Animated.View
                  style={[Styles.cardView, { height: heightAnim }]}
                >
                  <View
                    onLayout={e => {
                      const { height } = e.nativeEvent.layout;
                      setContentHeight(height); // save measured height
                    }}
                  >
                    {currentScreenIninner === 'login' && (
                      <>
                        <Animated.View
                          style={{
                            opacity: loginOpacity,
                            transform: [{ translateY: loginTranslateY }],
                          }}
                        >
                          <BlurView blurType="light" blurAmount={15} />
                          <LinearGradient
                            colors={[
                              'rgba(255, 255, 255, 0.76)',
                              'rgba(255, 255, 255, 0.85)',
                            ]}
                          />
                          <View
                            style={{
                              gap: Platform.OS === 'ios' ? 12 : 0,
                              margin: Platform.OS === 'ios' ? 0 : 0,
                            }}
                          >
                            <View style={Styles.login_container}>
                              <TextInput
                                allowFontScaling={false}
                                style={Styles.personalEmailID_TextInput}
                                placeholder={t('personal_email_id')}
                                placeholderTextColor={
                                  'rgba(255, 255, 255, 0.48)'
                                }
                                value={username}
                                maxLength={50}
                                keyboardType={
                                  Platform.OS === 'ios'
                                    ? 'default'
                                    : 'email-address'
                                }
                                autoCapitalize="none"
                                autoCorrect={false}
                                cursorColor={'#F5F5F5'}
                                selectionColor="#F5F5F5"
                                autoComplete={
                                  Platform.OS === 'ios' ? 'email' : 'username'
                                }
                                textContentType={
                                  Platform.OS === 'ios'
                                    ? 'emailAddress'
                                    : 'username'
                                }
                                importantForAutofill="yes"
                                onChangeText={usernameText =>
                                  setUsername(usernameText)
                                }
                              />
                            </View>

                            <View style={Styles.password_container}>
                              <TextInput
                                allowFontScaling={false}
                                style={Styles.password_TextInput}
                                placeholder={t('password')}
                                placeholderTextColor={
                                  'rgba(255, 255, 255, 0.48)'
                                }
                                value={password}
                                maxLength={20}
                                // selectionColor="white"
                                // cursorColor={'#FFFFFF'}
                                cursorColor="#F5F5F5"
                                selectionColor="#F5F5F5"
                                secureTextEntry={!isPasswordVisible}
                                onChangeText={passwordText =>
                                  setPassword(passwordText)
                                }
                              />
                              <TouchableOpacity
                                onPress={() =>
                                  setIsPasswordVisible(!isPasswordVisible)
                                }
                              >
                                <Image
                                  source={
                                    isPasswordVisible
                                      ? require('../../../assets/images/eyeopen.png')
                                      : require('../../../assets/images/eyecross1.png')
                                  }
                                  style={[
                                    Styles.eyeIcon,
                                    isPasswordVisible
                                      ? Styles.eyeIcon
                                      : Styles.eyeCross,
                                  ]}
                                />
                              </TouchableOpacity>
                            </View>

                            <Text
                              allowFontScaling={false}
                              style={Styles.forgetPasswordText}
                              onPress={() => {
                                goToForgotPassword(() => {
                                  setTextandBackIcon(false);
                                  setUsername('');
                                  setPassword('');
                                  setIsPasswordVisible(false);
                                  setCurrentScreen('login');
                                  setcurrentScreenIninner('forgotpassword');
                                });
                              }}
                            >
                              {t('forgot_password')}
                            </Text>
                          </View>

                          <View style={{ gap: Platform.OS === 'ios' ? 20 : 0 }}>
                            <TouchableOpacity
                              style={Styles.loginButton}
                              onPress={loginapi}
                            >
                              <Text
                                allowFontScaling={false}
                                style={Styles.sendText}
                              >
                                {t('login')}
                              </Text>
                            </TouchableOpacity>

                            <View
                              style={{
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 4,
                                marginVertical: Platform.OS === 'ios' ? 0 : 8,
                              }}
                            >
                              <Text
                                allowFontScaling={false}
                                style={{
                                  color: 'rgba(255, 255, 255, 0.48)',
                                  textAlign: 'center',
                                  fontFamily: 'Urbanist-Regular',
                                  fontSize: 14,
                                  fontWeight: 400,
                                  lineHeight: 19,
                                  marginTop: Platform.OS === 'ios' ? 0 : 10,
                                  paddingBottom: Platform.OS === 'ios' ? 9 : 10,
                                }}
                              >
                                {t('dont_have_account')}
                              </Text>
                              <TouchableOpacity
                                onPress={() => {
                                  Keyboard.dismiss();
                                  Animated.timing(textAndBackOpacity, {
                                    toValue: 0,
                                    duration: 300,
                                    useNativeDriver: true,
                                  }).start();
                                  signupTranslateY.setValue(0);
                                  signupOpacity.setValue(0);
                                  loginOpacity.setValue(1);
                                  Animated.parallel([
                                    Animated.spring(signupTranslateY, {
                                      toValue: 0, // slide in
                                      useNativeDriver: true,
                                      friction: 6,
                                      tension: 50,
                                    }),
                                    Animated.timing(signupOpacity, {
                                      toValue: 1,
                                      duration: 200,
                                      easing: Easing.linear,
                                      useNativeDriver: true,
                                    }),
                                    Animated.timing(loginOpacity, {
                                      toValue: 0,
                                      duration: 150,
                                      easing: Easing.linear,
                                      useNativeDriver: true,
                                    }),
                                  ]).start(() => {
                                    setTextandBackIcon(false);
                                    setUsername('');
                                    setPassword('');
                                    setIsPasswordVisible(false);
                                    setCurrentScreen('login');
                                    setcurrentScreenIninner('signup');
                                    setFirstName('');
                                    setLastName('');
                                    setPostalCode('');
                                    setConfirmPassword('');
                                    setsignUpPassword('');
                                    setsignUpUsername('');
                                    setIsConfirmPasswordVisible(false);
                                    setsignUpIsPasswordVisible(false);
                                    setIsChecked(false);
                                    setUserMeta(prev => ({
                                      ...prev,
                                      city: '',
                                      latitude: 0,
                                      longitude: 0,
                                    }));
                                  });
                                }}
                              >
                                <Text
                                  allowFontScaling={false}
                                  style={Styles.signupText}
                                >
                                  {t('sign_up')}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </Animated.View>
                      </>
                    )}

                    {currentScreenIninner ===
                      ('forgotpassword' as typeof currentScreenIninner) && (
                      <>
                        <View style={{ width: '100%' }}>
                          <Animated.View
                            style={[
                              { gap: 16 },
                              {
                                transform: [
                                  { translateY: resetPasswordtranslateY },
                                ],
                              },
                            ]}
                          >
                            <Text
                              allowFontScaling={false}
                              style={Styles.resetTitle}
                            >
                              {t('reset_password')}
                            </Text>
                            <View style={Styles.privacyContainer}>
                              <Text
                                allowFontScaling={false}
                                style={[Styles.termsText, { paddingBottom: 8 }]}
                              >
                                {t('enter_email_to_reset')}
                              </Text>
                            </View>

                            <View style={[Styles.login_container]}>
                              <TextInput
                                allowFontScaling={false}
                                style={[
                                  Styles.personalEmailID_TextInput,
                                  { color: '#fff' },
                                ]}
                                placeholder={t('personal_email_id')}
                                placeholderTextColor="rgba(255, 255, 255, 0.48)"
                                value={username1}
                                maxLength={50}
                                selectionColor="#F5F5F5"
                                cursorColor={'#F5F5F5'}
                                keyboardType={
                                  Platform.OS === 'ios'
                                    ? 'default'
                                    : 'email-address'
                                }
                                autoCapitalize="none"
                                autoComplete={
                                  Platform.OS === 'ios' ? 'email' : 'username'
                                }
                                textContentType={
                                  Platform.OS === 'ios'
                                    ? 'emailAddress'
                                    : 'username'
                                }
                                importantForAutofill="yes"
                                autoCorrect={false}
                                onChangeText={usernameText =>
                                  setUsername1(usernameText)
                                }
                              />
                            </View>

                            <TouchableOpacity
                              style={[Styles.loginButton, { marginTop: 0 }]}
                              onPress={() => {
                                handleSendResetLink();
                              }}
                            >
                              <Text
                                allowFontScaling={false}
                                style={Styles.sendText}
                              >
                                {t('send_reset_link')}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => {
                                Keyboard.dismiss();
                                resetPasswordtranslateY.setValue(0);
                                slideUp.setValue(100);
                                ClickFPGoBack_slideOutToTop(() => {
                                  Animated.timing(textAndBackOpacity, {
                                    toValue: 1,
                                    duration: 250,
                                    useNativeDriver: true,
                                  }).start();
                                  setUsername1('');
                                  setCurrentScreen('login');
                                  setcurrentScreenIninner('login');
                                });
                              }}
                            >
                              <Text
                                allowFontScaling={false}
                                style={[
                                  Styles.goBackText,
                                  { color: 'rgba(140, 244, 255, 0.7)' },
                                ]}
                              >
                                {t('go_back')}
                              </Text>
                            </TouchableOpacity>
                          </Animated.View>
                          <Modal
                            visible={showPopup}
                            transparent
                            animationType="fade"
                            onRequestClose={closePopup}
                          >
                            <View style={Styles.overlay}>
                              <BlurView
                                style={{
                                  flex: 1,
                                  alignContent: 'center',
                                  justifyContent: 'center',
                                  width: '100%',
                                  alignItems: 'center',
                                }}
                                blurType="light"
                                blurAmount={Platform.OS === 'ios' ? 2 : 100}
                                reducedTransparencyFallbackColor={
                                  Platform.OS === 'ios'
                                    ? 'rgba(0, 0, 0, 0.11)'
                                    : 'rgba(0, 0, 0, 0.5)'
                                }
                              >
                                <View
                                  style={[
                                    StyleSheet.absoluteFill,
                                    {
                                      backgroundColor:
                                        Platform.OS === 'ios'
                                          ? 'rgba(0, 0, 0, 0.15)'
                                          : 'rgba(0, 0, 0, 0.32)',
                                    },
                                  ]}
                                />
                                <View
                                  style={[
                                    Styles.popupContainer,
                                    { width: width * 0.85 },
                                  ]}
                                >
                                  <Image
                                    source={require('../../../assets/images/success_icon.png')}
                                    style={Styles.logo}
                                    resizeMode="contain"
                                  />
                                  <Text
                                    allowFontScaling={false}
                                    style={Styles.termsText1}
                                  >
                                    {t('password_reset_link_sent')}
                                  </Text>

                                  <TouchableOpacity
                                    style={Styles.loginButton}
                                    onPress={() => {
                                      setShowPopup(false);
                                      setCurrentScreen('login');
                                      setcurrentScreenIninner('login');
                                    }}
                                  >
                                    <Text
                                      allowFontScaling={false}
                                      style={Styles.loginText}
                                    >
                                      {t('back_to_login')}
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              </BlurView>
                            </View>
                          </Modal>
                        </View>
                      </>
                    )}

                    {currentScreenIninner ===
                      ('signup' as typeof currentScreenIninner) && (
                      <>
                        <Animated.View
                          style={[
                            {
                              width: '100%',
                              alignItems: 'center',
                              opacity: signupOpacity,
                            },
                            {
                              transform: [{ translateY: signupTranslateY }],
                            },
                          ]}
                        >
                          <View style={[Styles.nameRow]}>
                            <View style={Styles.login_container1}>
                              <TextInput
                                allowFontScaling={false}
                                style={Styles.personalEmailID_TextInput1}
                                placeholder={t('first_name')}
                                placeholderTextColor="rgba(255, 255, 255, 0.48)"
                                value={firstName}
                                onChangeText={text =>
                                  /^[A-Za-z ]*$/.test(text) &&
                                  setFirstName(text)
                                }
                                maxLength={20}
                                cursorColor={'#F5F5F5'}
                                autoComplete="name-given"
                                textContentType="givenName"
                                autoCapitalize="words"
                                importantForAutofill="yes"
                                selectionColor="#F5F5F5"
                              />
                            </View>

                            <View style={Styles.login_container1}>
                              <TextInput
                                allowFontScaling={false}
                                style={Styles.personalEmailID_TextInput1}
                                placeholder={t('last_name')}
                                placeholderTextColor="rgba(255, 255, 255, 0.48)"
                                value={lastName}
                                // selectionColor="white"
                                // cursorColor={'#FFFFFF'}
                                cursorColor="#F5F5F5"
                                selectionColor="#F5F5F5"
                                maxLength={20}
                                autoComplete="name-family"
                                textContentType="familyName"
                                importantForAutofill="yes"
                                autoCapitalize="words"
                                onChangeText={text =>
                                  /^[A-Za-z ]*$/.test(text) && setLastName(text)
                                }
                              />
                            </View>
                          </View>

                          <View
                            style={[
                              Styles.login_container,
                              {
                                marginTop: Platform.OS === 'ios' ? 12 : 0,
                                marginBottom: Platform.OS === 'ios' ? 0 : 10,
                              },
                            ]}
                          >
                            <TextInput
                              allowFontScaling={false}
                              style={[
                                Styles.personalEmailID_TextInput,
                                { paddingTop: Platform.OS === 'ios' ? 0 : 10 },
                              ]}
                              placeholder={t('postal_code')}
                              cursorColor={'#FFFFFF'}
                              selectionColor={'#FFFFFF'}
                              placeholderTextColor="rgba(255, 255, 255, 0.48)"
                              value={postalCode}
                              maxLength={7}
                              onChangeText={text => {
                                const filteredText = text
                                  .replace(/[^a-zA-Z0-9]/g, '')
                                  .toUpperCase();
                                if (filteredText.length > 7) return;
                                setUserMeta(prev => ({
                                  ...prev,
                                  postal_code: filteredText,
                                }));
                                setPostalCode(filteredText);
                                if (typingTimeout) {
                                  clearTimeout(typingTimeout);
                                }
                                const timeout = setTimeout(() => {
                                  if (filteredText.length > 0) {
                                    ClickPostalCode(filteredText);
                                  }
                                }, 1000);

                                setTypingTimeout(timeout);
                              }}
                            />
                            <Text
                              style={{
                                position: 'absolute',
                                right: 10,
                                color: 'white',
                              }}
                            >
                              {userMeta?.city}
                            </Text>
                          </View>

                          <View
                            style={[
                              Styles.password_container,
                              { marginTop: Platform.OS === 'ios' ? 12 : 0 },
                            ]}
                          >
                            <TextInput
                              allowFontScaling={false}
                              style={Styles.password_TextInput}
                              placeholder={t('personal_email_id')}
                              placeholderTextColor="rgba(255, 255, 255, 0.48)"
                              value={signUpusername}
                              maxLength={50}
                              cursorColor={'#F5F5F5'}
                              keyboardType="email-address"
                              autoCapitalize="none"
                              selectionColor="white"
                              autoComplete={
                                Platform.OS === 'ios' ? 'email' : 'username'
                              }
                              textContentType={
                                Platform.OS === 'ios'
                                  ? 'emailAddress'
                                  : 'username'
                              }
                              importantForAutofill="yes"
                              autoCorrect={false}
                              onChangeText={text => setsignUpUsername(text)}
                            />
                            <TouchableOpacity
                              onPress={() => setShowInfo(!showInfo)}
                            >
                              <Image
                                source={require('../../../assets/images/info_icon.png')}
                                style={Styles.eyeIcon}
                              />
                            </TouchableOpacity>
                          </View>

                          {showInfo && (
                            <View style={Styles.infoContainer}>
                              <Text
                                allowFontScaling={false}
                                style={Styles.infoText}
                              >
                                <Text
                                  allowFontScaling={false}
                                  style={Styles.infoText1}
                                >
                                  {t('important')}{' '}
                                </Text>
                                {t('use_personal_email_info')}
                              </Text>
                            </View>
                          )}

                          <View
                            style={[
                              Styles.password_container,
                              { marginTop: Platform.OS === 'ios' ? 12 : 12 },
                            ]}
                          >
                            <TextInput
                              allowFontScaling={false}
                              style={Styles.password_TextInput}
                              placeholder={t('create_password')}
                              placeholderTextColor="rgba(255, 255, 255, 0.48)"
                              value={signUppassword}
                              maxLength={20}
                              selectionColor="white"
                              cursorColor={'#F5F5F5'}
                              onChangeText={setsignUpPassword}
                              secureTextEntry={!issignUpPasswordVisible}
                            />

                            <TouchableOpacity
                              onPress={() =>
                                setsignUpIsPasswordVisible(
                                  !issignUpPasswordVisible,
                                )
                              }
                            >
                              <Image
                                source={
                                  issignUpPasswordVisible
                                    ? require('../../../assets/images/eyeopen.png')
                                    : require('../../../assets/images/eyecross1.png')
                                }
                                style={[
                                  Styles.eyeIcon,
                                  issignUpPasswordVisible
                                    ? Styles.eyeIcon
                                    : Styles.eyeCross,
                                ]}
                              />
                            </TouchableOpacity>
                          </View>

                          <View
                            style={[
                              Styles.password_container,
                              { marginTop: Platform.OS === 'ios' ? 12 : 12 },
                            ]}
                          >
                            <TextInput
                              allowFontScaling={false}
                              style={[
                                Styles.password_TextInput,
                                { color: '#fff' },
                              ]}
                              placeholder={t('confirm_password')}
                              placeholderTextColor="rgba(255, 255, 255, 0.48)"
                              value={confirmPassword}
                              maxLength={20}
                              cursorColor={'#F5F5F5'}
                              selectionColor="white"
                              onChangeText={setConfirmPassword}
                              secureTextEntry={!isConfirmPasswordVisible}
                            />

                            <TouchableOpacity
                              onPress={() =>
                                setIsConfirmPasswordVisible(
                                  !isConfirmPasswordVisible,
                                )
                              }
                            >
                              <Image
                                source={
                                  isConfirmPasswordVisible
                                    ? require('../../../assets/images/eyeopen.png')
                                    : require('../../../assets/images/eyecross1.png')
                                }
                                style={[
                                  Styles.eyeIcon,
                                  isConfirmPasswordVisible
                                    ? Styles.eyeIcon
                                    : Styles.eyeCross,
                                ]}
                              />
                            </TouchableOpacity>
                          </View>

                          <TouchableOpacity
                            disabled={loading}
                            onPress={() => {
                              Keyboard.dismiss();
                              handleSendOTP();
                              setImageLoaded(true);
                            }}
                            style={Styles.sendButton}
                          >
                            <Text
                              allowFontScaling={false}
                              style={Styles.sendText}
                            >
                              {t('send_otp')}
                            </Text>
                          </TouchableOpacity>

                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginTop: 16,
                              marginBottom: 8,
                            }}
                          >
                            <Text
                              allowFontScaling={false}
                              style={Styles.signupPrompt}
                            >
                              {t('already_have_account')}{' '}
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                {
                                  Animated.timing(textAndBackOpacity, {
                                    toValue: 1, // fade in
                                    duration: 500,
                                    useNativeDriver: true,
                                  }).start();
                                  Animated.timing(loginOpacity, {
                                    toValue: 1, // fade in
                                    duration: 500,
                                    useNativeDriver: true,
                                  }).start();
                                  // loginOpacity.setValue(1);
                                  setCurrentScreen('login');
                                  setcurrentScreenIninner('login');
                                  setConfirmPassword('');
                                  setFirstName('');
                                  setLastName('');
                                  setPostalCode('');
                                  setsignUpUsername('');
                                  setsignUpPassword('');
                                  setsignUpIsPasswordVisible(false);
                                  setIsConfirmPasswordVisible(false);
                                }
                              }}
                            >
                              <Text
                                allowFontScaling={false}
                                style={Styles.signupPrompt1}
                              >
                                {t('login')}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </Animated.View>
                      </>
                    )}
                    {currentScreenIninner ===
                      ('sendOTP' as typeof currentScreenIninner) && (
                      <>
                        {imageLoaded && (
                          <Animated.View
                            style={[
                              {
                                transform: [{ translateY: setOTPTranslatY }],
                              },
                            ]}
                          >
                            <View>
                              <Text
                                allowFontScaling={false}
                                style={Styles.sendOtpresetTitle}
                              >
                                {t('verify_personal_email')}
                              </Text>
                              <View style={Styles.sendOtpprivacyContainer}>
                                <Text
                                  allowFontScaling={false}
                                  style={Styles.termsText}
                                >
                                  {t('we_sent_code_to')}{' '}
                                  <Text
                                    allowFontScaling={false}
                                    style={Styles.sendOtpresendText2}
                                  >
                                    {signUpusername}
                                  </Text>
                                </Text>
                              </View>

                              <View style={Styles.sendOtpotpContainer}>
                                {[0, 1, 2, 3].map((_, index) => (
                                  <TextInput
                                    key={index}
                                    ref={ref => {
                                      inputs.current[index] = ref;
                                    }}
                                    allowFontScaling={false}
                                    style={Styles.sendOtpotpBox}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    selectionColor="#F5F5F5"
                                    cursorColor={'#F5F5F5'}
                                    onChangeText={text => {
                                      const digit = text.replace(/[^0-9]/g, '');
                                      handleChange(digit, index);
                                    }}
                                    value={otp[index]}
                                    returnKeyType="next"
                                    textAlign="center"
                                    secureTextEntry
                                    onKeyPress={({ nativeEvent }) => {
                                      if (
                                        nativeEvent.key === 'Backspace' &&
                                        otp[index] === '' &&
                                        index > 0
                                      ) {
                                        inputs.current[index - 1]?.focus();
                                      }
                                    }}
                                  />
                                ))}
                              </View>

                              <TouchableOpacity
                                style={[
                                  Styles.sendOtploginButton,
                                  {
                                    marginTop: Platform.OS === 'ios' ? 20 : 16,
                                  },
                                ]}
                                onPress={otpverify}
                              >
                                <Text
                                  allowFontScaling={false}
                                  style={Styles.sendText}
                                >
                                  {t('verify_and_continue')}
                                </Text>
                              </TouchableOpacity>

                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'center',
                                  marginTop: Platform.OS === 'ios' ? 20 : 16,
                                }}
                              >
                                <Text
                                  allowFontScaling={false}
                                  style={Styles.sendOtpresendText}
                                >
                                  {t('didnt_receive_code')}{' '}
                                </Text>
                                <TouchableOpacity onPress={handleresend}>
                                  <Text
                                    allowFontScaling={false}
                                    style={[
                                      Styles.sendOtpresendText1,
                                      { color: 'rgba(140, 244, 255, 0.7)' },
                                    ]}
                                  >
                                    {t('resend_code')}
                                  </Text>
                                </TouchableOpacity>
                              </View>

                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'center',
                                  marginTop: 16,
                                }}
                              >
                                <Text
                                  allowFontScaling={false}
                                  style={Styles.sendOtpgoBackText}
                                >
                                  {t('entered_wrong_email')}{' '}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => {
                                    Keyboard.dismiss();

                                    Animated.parallel([
                                      Animated.timing(signupTranslateY, {
                                        toValue: 300,
                                        duration: 400,
                                        easing: Easing.linear,
                                        useNativeDriver: true,
                                      }),

                                      // Hide sendOTP screen below (optional)
                                      Animated.timing(setOTPTranslatY, {
                                        toValue: -300, // slide out downwards
                                        duration: 400,
                                        easing: Easing.linear,
                                        useNativeDriver: true,
                                      }),
                                    ]).start(() => {
                                      setCurrentScreen('login');
                                      setcurrentScreenIninner('signup');
                                      setShowOtp(false);
                                      setverifyimageLoaded(true);
                                    });
                                  }}
                                >
                                  <Text
                                    allowFontScaling={false}
                                    style={[
                                      Styles.sendOtpgoBackText1,
                                      { color: 'rgba(140, 244, 255, 0.7)' },
                                    ]}
                                  >
                                    {t('go_back')}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </Animated.View>
                        )}
                      </>
                    )}

                    {currentScreenIninner ===
                      ('verify' as typeof currentScreenIninner) && (
                      <>
                        {verifyimageLoaded && !showOtp && (
                          <Animated.View
                            style={[
                              {
                                transform: [
                                  { translateY: verifyAndContinyTranslateY1 },
                                ],
                              },
                            ]}
                          >
                            <View>
                              <Text
                                allowFontScaling={false}
                                style={[
                                  Styles.verifyresetTitle,
                                  {
                                    paddingBottom:
                                      Platform.OS === 'ios' ? 16 : 0,
                                  },
                                ]}
                              >
                                {t('verify_university_email')}
                              </Text>
                              <View style={Styles.verifylogin_container}>
                                <TextInput
                                  allowFontScaling={false}
                                  style={Styles.verifypersonalEmailID_TextInput}
                                  placeholder={t('university_email_id')}
                                  placeholderTextColor={
                                    'rgba(255, 255, 255, 0.48)'
                                  }
                                  value={verifyusername}
                                  maxLength={50}
                                  keyboardType="email-address"
                                  autoCapitalize="none"
                                  selectionColor="#F5F5F5"
                                  cursorColor={'#F5F5F5'}
                                  autoCorrect={false}
                                  autoComplete="email"
                                  textContentType="emailAddress"
                                  onChangeText={usernameText =>
                                    setverifyUsername(usernameText)
                                  }
                                />
                              </View>

                              <TouchableOpacity
                                style={Styles.verifyloginButton}
                                onPress={() => {
                                  verifyOTP();
                                }}
                              >
                                <Text
                                  allowFontScaling={false}
                                  style={Styles.sendText}
                                >
                                  {t('send_otp')}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </Animated.View>
                        )}

                        {showOtp && (
                          <Animated.View
                            style={[
                              { width: '100%', alignItems: 'center' },
                              {
                                transform: [
                                  { translateY: verifyAndContinyTranslateY2 },
                                ],
                              },
                            ]}
                          >
                            <View
                              style={[{ width: '100%', alignItems: 'center' }]}
                            >
                              <Text
                                allowFontScaling={false}
                                style={Styles.verifyresetTitle}
                              >
                                {t('verify_university_email')}
                              </Text>

                              <View style={Styles.verifyprivacyContainer}>
                                <Text
                                  allowFontScaling={false}
                                  style={Styles.verifytermsText}
                                >
                                  {t('we_sent_code_to')}{' '}
                                  <Text
                                    allowFontScaling={false}
                                    style={Styles.resendText2}
                                  >
                                    {verifyusername}
                                  </Text>
                                </Text>
                              </View>

                              <View style={Styles.verifyotpContainer}>
                                {[0, 1, 2, 3].map((_, index) => (
                                  <TextInput
                                    allowFontScaling={false}
                                    key={index}
                                    ref={ref => {
                                      verifyinputs.current[index] = ref;
                                    }}
                                    style={Styles.verifyotpBox}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    onChangeText={text => {
                                      const digit = text.replace(/[^0-9]/g, '');
                                      veryfyhandleChange(digit, index);
                                    }}
                                    value={otp1[index]}
                                    returnKeyType="next"
                                    textAlign="center"
                                    selectionColor="#F5F5F5"
                                    cursorColor={'#F5F5F5'}
                                    secureTextEntry={true}
                                    onKeyPress={({ nativeEvent }) => {
                                      if (
                                        nativeEvent.key === 'Backspace' &&
                                        otp1[index] === '' &&
                                        index > 0
                                      ) {
                                        verifyinputs.current[
                                          index - 1
                                        ]?.focus();
                                      }
                                    }}
                                  />
                                ))}
                              </View>

                              <TouchableOpacity
                                style={Styles.verifyloginButton1}
                                onPress={submitotp}
                              >
                                <Text
                                  allowFontScaling={false}
                                  style={Styles.sendText}
                                >
                                  {t('verify_and_continue')}
                                </Text>
                              </TouchableOpacity>

                              <View
                                style={{ flexDirection: 'row', marginTop: 6 }}
                              >
                                <Text
                                  allowFontScaling={false}
                                  style={Styles.verifyresendText}
                                >
                                  {t('didnt_receive_code')}{' '}
                                </Text>
                                <TouchableOpacity onPress={resubmitotp}>
                                  <Text
                                    allowFontScaling={false}
                                    style={[
                                      Styles.verifyresendText1,
                                      { color: 'rgba(140, 244, 255, 0.7)' },
                                    ]}
                                  >
                                    {t('resend_code')}
                                  </Text>
                                </TouchableOpacity>
                              </View>

                              <TouchableOpacity
                                style={{
                                  flexDirection: 'row',
                                  marginVertical: 6,
                                }}
                              >
                                <Text
                                  allowFontScaling={false}
                                  style={Styles.verifyresendText}
                                >
                                  {t('entered_wrong_email')}{' '}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => {
                                    Keyboard.dismiss();

                                    Animated.timing(
                                      verifyAndContinyTranslateY2,
                                      {
                                        toValue: -200,
                                        duration: 500,
                                        easing: Easing.in(Easing.ease),
                                        useNativeDriver: true,
                                      },
                                    ).start(() => {
                                      setShowOtp(true);
                                      verifyAndContinyTranslateY2.setValue(
                                        -200,
                                      );
                                      Animated.timing(
                                        verifyAndContinyTranslateY1,
                                        {
                                          toValue: -200,
                                          duration: 500,
                                          easing: Easing.out(Easing.ease),
                                          useNativeDriver: true,
                                        },
                                      ).start();
                                      setTimeout(() => {
                                        verifyinputs.current[0]?.focus();
                                      }, 300);
                                      Animated.sequence([
                                        Animated.spring(
                                          verifyAndContinyTranslateY1,
                                          {
                                            toValue: 0, // bounce upward
                                            friction: 3.5, // lower = bouncier
                                            tension: 0, // controls snap
                                            useNativeDriver: true,
                                          },
                                        ),
                                      ]).start();

                                      setShowOtp(false);
                                      setverifyimageLoaded(true);
                                      setCurrentScreen('login');
                                      setcurrentScreenIninner('verify');
                                    });
                                  }}
                                >
                                  <Text
                                    allowFontScaling={false}
                                    style={[
                                      Styles.verifygoBackText1,
                                      { color: 'rgba(140, 244, 255, 0.7)' },
                                    ]}
                                  >
                                    {t('go_back')}
                                  </Text>
                                </TouchableOpacity>
                              </TouchableOpacity>
                            </View>
                          </Animated.View>
                        )}
                      </>
                    )}

                    {currentScreenIninner ===
                      ('profile' as typeof currentScreenIninner) && (
                      <>
                        {imageLoaded && (
                          <Animated.View
                            style={[
                              {
                                transform: [{ translateY: profileTranslateY }],
                                opacity,
                              },
                            ]}
                          >
                            <View>
                              <Text
                                allowFontScaling={false}
                                style={Styles.profileprofileresetTitle}
                              >
                                {t('add_photo')}
                              </Text>
                              <View
                                style={[
                                  Styles.profileprivacyContainer,
                                  {
                                    marginTop: Platform.OS === 'ios' ? 16 : 10,
                                  },
                                ]}
                              >
                                <Text
                                  allowFontScaling={false}
                                  style={Styles.profiletermsText}
                                >
                                  {t('personalize_account')}
                                </Text>
                              </View>

                              <View style={Styles.profileavatarContainer}>
                                <View style={Styles.profilebigCircle}>
                                  <TouchableOpacity>
                                    <Image
                                      source={
                                        photo
                                          ? { uri: photo }
                                          : require('../../../assets/images/add1.png')
                                      }
                                      style={Styles.profilelogo}
                                      resizeMode="cover"
                                    />
                                  </TouchableOpacity>

                                  <TouchableOpacity
                                    style={Styles.profilecameraButton}
                                    onPress={handleSelectImage}
                                  >
                                    <Image
                                      source={require('../../../assets/images/new_camera_icon.png')}
                                      style={Styles.profilecameraIcon}
                                      resizeMode="contain"
                                    />
                                  </TouchableOpacity>
                                </View>
                              </View>

                              <TouchableOpacity
                                style={Styles.profileloginButton}
                                onPress={() => {
                                  setShowPopup1(true);
                                }}
                              >
                                <Text
                                  allowFontScaling={false}
                                  style={Styles.profileloginText}
                                >
                                  {t('continue')}
                                </Text>
                              </TouchableOpacity>

                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginTop: Platform.OS === 'ios' ? 20 : 16,
                                  marginBottom: 8,
                                }}
                              >
                                <Text
                                  allowFontScaling={false}
                                  style={Styles.profilesignupPrompt}
                                >
                                  {t('want_to_do_later')}{' '}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => {
                                    setShowPopup1(true);
                                  }}
                                >
                                  <Text
                                    allowFontScaling={false}
                                    style={[
                                      Styles.profilesignupPrompt1,
                                      { color: 'rgba(140, 244, 255, 0.7)' },
                                    ]}
                                  >
                                    {t('skip')}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </Animated.View>
                        )}

                        <Modal
                          visible={showPopup1}
                          transparent
                          animationType="fade"
                          onRequestClose={closePopup1}
                        >
                          <View style={Styles.profileoverlay}>
                            {/* <BlurView
                              style={{
                                flex: 1,
                                alignContent: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                alignItems: 'center',
                              }}
                              blurType="dark"
                              blurAmount={Platform.OS === 'ios' ? 5 : 100}
                              reducedTransparencyFallbackColor={
                                Platform.OS === 'ios'
                                  ? 'rgba(0, 0, 0, 0.11)'
                                  : 'rgba(0, 0, 0, 0.5)'
                              }
                            > */}
                            <BlurView
                              style={[
                                StyleSheet.absoluteFill,
                                COMMONSTYLE.modelBlur,
                              ]}
                              blurType="light"
                              blurAmount={10}
                              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
                            />
                            <View
                              style={[
                                StyleSheet.absoluteFill,
                                {
                                  backgroundColor:
                                    Platform.OS === 'ios'
                                      ? 'rgba(0, 0, 0, 0.15)'
                                      : 'rgba(0, 0, 0, 0.32)',
                                },
                              ]}
                            />

                            <View
                              style={[
                                Styles.profilepopupContainer,
                                { width: width * 0.85 },
                              ]}
                            >
                              <Image
                                source={require('../../../assets/images/success_icon.png')}
                                style={Styles.profilelogo1}
                                resizeMode="contain"
                              />
                              <Text
                                allowFontScaling={false}
                                style={Styles.profiletermsText2}
                              >
                                {t('account_created_successfully')}
                              </Text>
                              <Text
                                allowFontScaling={false}
                                style={Styles.profiletermsText1}
                              >
                                {t('welcome_to_unizy')}
                              </Text>
                              <TouchableOpacity
                                style={Styles.profileloginButton}
                                onPress={async () => {
                                  closePopup1();
                                  await AsyncStorage.setItem('ISLOGIN', 'true');
                                  await AsyncStorage.setItem(
                                    'ISONBOARDING',
                                    'false',
                                  );
                                  navigation.replace('OnboardingScreen');
                                  // navigation.replace('Dashboard', {
                                  //   AddScreenBackactiveTab: 'Home',
                                  //   isNavigate: true,
                                  // });
                                }}
                              >
                                <Text
                                  allowFontScaling={false}
                                  style={Styles.profileloginText}
                                >
                                  {t('start_exploring')}
                                </Text>
                              </TouchableOpacity>
                            </View>
                            {/* </BlurView> */}
                          </View>
                        </Modal>
                      </>
                    )}
                  </View>
                </Animated.View>

                {/* Indecator */}

                {currentScreenIninner !==
                  ('login' as typeof currentScreenIninner) &&
                  currentScreenIninner !==
                    ('forgotpassword' as typeof currentScreenIninner) && (
                    <View style={Styles.stepIndicatorContainer}>
                      {[0, 1, 2, 3].map(index =>
                        index === stepIndex ? (
                          <LinearGradient
                            key={index}
                            colors={[
                              'rgba(255,255,255,1)',
                              'rgba(255,255,255,0.5)',
                            ]}
                            style={Styles.stepCircle}
                          />
                        ) : (
                          <View
                            key={index}
                            style={[
                              Styles.stepCircle,
                              Styles.inactiveStepCircle,
                            ]}
                          />
                        ),
                      )}
                    </View>
                  )}
              </View>

              {((currentScreen === 'login' &&
                currentScreenIninner === 'login') ||
                currentScreenIninner === 'signup') && (
                <Animated.View
                  style={[
                    Styles.mainTemsAndConditions,
                    (currentScreenIninner === 'login' ||
                      currentScreenIninner === 'signup') && {
                      transform: [{ translateY: slideUp }],
                    },
                  ]}
                >
                  <View
                    style={{
                      paddingHorizontal: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexWrap: 'nowrap',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                      }}
                    >
                      {currentScreenIninner === 'signup' && (
                        <>
                          <TouchableOpacity
                            onPress={() => setIsChecked(!isChecked)} // ✅ toggle
                            style={{ marginRight: 5 }}
                          >
                            {isChecked ? (
                              // ✅ Checked state: show image
                              <Image
                                source={require('../../../assets/images/tickicon.png')}
                                style={{ height: 20, width: 20 }}
                                resizeMode="contain"
                              />
                            ) : (
                              // ✅ Unchecked state: show empty box
                              <View
                                style={{
                                  height: 20,
                                  width: 20,
                                  borderRadius: 5,
                                  borderWidth: 1,
                                  borderColor: '#fff',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  backgroundColor: 'transparent',
                                }}
                              />
                            )}
                          </TouchableOpacity>
                        </>
                      )}

                      {/* ✅ Centered text */}
                      <Text
                        allowFontScaling={false}
                        style={[
                          Styles.bycountuningAgreementText,
                          { textAlign: 'center' },
                        ]}
                      >
                        {t('by_continuing_agree') + ' '}
                        <Text
                          allowFontScaling={false}
                          style={[
                            Styles.teamsandConditionText,
                            { textDecorationLine: 'underline' },
                          ]}
                          onPress={() =>
                            navigation.navigate('TeamsAndCondition')
                          }
                        >
                          {t('terms_and_conditions')}
                        </Text>

                        {` ${t('and')} `}

                        <Text
                          allowFontScaling={false}
                          style={[
                            Styles.teamsandConditionText,
                            { textDecorationLine: 'underline' },
                          ]}
                          onPress={() =>
                            navigation.navigate('PrivacyAndPolicy')
                          }
                        >
                          {t('privacy_policy')}
                        </Text>
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              )}
            </>
          )}
        </KeyboardAvoidingView>
      </View>
      <PassToastContainer />
      <NewCustomToastContainer />
    </ImageBackground>
  );
};

export default SinglePage;
