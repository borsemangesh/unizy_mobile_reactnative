import { BlurView } from '@react-native-community/blur';
import { RouteProp, useFocusEffect, useIsFocused, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
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
  PermissionsAndroid,
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
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import BackgroundAnimation from '../Hello/BackgroundAnimation';
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
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

const { height } = Dimensions.get('window');

type SinglePageProps = {
  navigation: any;
};
type RootStackParamList = {
  SinglePage: { resetToLogin?: boolean };
};
type SinglePageRouteProp = RouteProp<RootStackParamList, 'SinglePage'>;

const SinglePage = ({ navigation }: SinglePageProps) => {
  const [currentScreen, setCurrentScreen] = useState<
    'hello' | 'language' | 'login' | 'splashScreen'
  >('splashScreen');

  const [currentScreenIninner, setcurrentScreenIninner] = useState<
    'login' | 'signup' | 'forgotpassword' | 'sendOTP' | 'verify' | 'profile'
  >('login');

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

useEffect(() => {
  if (route.params?.resetToLogin) {
    loginOpacity.setValue(1);
    loginTranslateY.setValue(0);
    setCurrentScreen('login'); 
    setcurrentScreenIninner('login'); 
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
        console.log('Error fetching languages', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

 

  const flagMap: Record<string, any> = {
    en: require('../../../assets/images/english.png'),
    hi: require('../../../assets/images/indian.png'),
    es: require('../../../assets/images/spanish.png'),
    fr: require('../../../assets/images/french.png'),
    'zh-CN': require('../../../assets/images/china.png'),
    // add others as needed
  };

  const filteredLanguages = languages
    .map(lang => ({
      id: lang.id,
      code: lang.iso_code,
      name: lang.language_name,
      flag:lang.logo || require('../../../assets/images/english.png'),
    }))
    .filter(lang => lang.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    if (search.trim() !== '' && filteredLanguages.length === 0) {
      showToast('No results found', 'error');
    }
  }, [search, filteredLanguages]);

  const handleLanguageSelect = async (item: Language) => {
    try {
      loginTranslateY.setValue(0);
      await AsyncStorage.setItem(
        'selectedLanguage',
        JSON.stringify({ id: item.id, code: item.code, name: item.name }),
      );
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
      console.log('Error saving selected language', err);
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

  const resetPasswordtranslateY = React.useRef(
    new Animated.Value(0),
  ).current;
  const restPasswordAnimatied = React.useRef(0);
  const setOTPTranslatY = React.useRef(new Animated.Value(height)).current;
  const verifyAndContinyTranslateY1 = React.useRef(
    new Animated.Value(0),
  ).current;
  const verifyAndContinyTranslateY2 = useRef(new Animated.Value(-200)).current;
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
    verifyAndContinyTranslateY2.setValue(-200);
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
        duration: 1000,
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
    }

    if (currentScreenIninner === 'signup') {
      setImageLoaded(true);

      Animated.timing(signupTranslateY, {
        toValue: 0,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }
    if (currentScreenIninner === 'profile') {
      Animated.timing(profileTranslateY, {
        toValue: 0,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
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
        // Animated.timing(verifyAndContinyTranslateY2, {
        //   toValue: 200,
        //   duration: 500,
        //   easing: Easing.linear,
        //   useNativeDriver: true,
        // }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (currentScreenIninner === 'sendOTP') {
      Animated.parallel([
        Animated.timing(setOTPTranslatY, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (currentScreenIninner === 'forgotpassword') {
      // Animated.parallel([
      //   Animated.timing(resetPasswordtranslateY, {
      //     toValue: 0,
      //     duration: 1000,
      //     easing: Easing.linear,
      //     useNativeDriver: true,
      //   }),
      // ]).start();
    }
  }, [currentScreen, currentScreenIninner, photo]);

  useFocusEffect(
    React.useCallback(() => {
      if (currentScreen === 'hello') {
        // Animated.timing(unizyTranslateY, {
        //   toValue: 0,
        //   duration: 1200,
        //   easing: Easing.out(Easing.ease),
        //   useNativeDriver: true,
        // }).start();
        // Animated.timing(slideUp, {
        //   toValue: 0, // final position
        //   duration: 1000,
        //   easing: Easing.out(Easing.ease),
        //   useNativeDriver: true,
        // }).start();
        // animateGreeting();
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
            duration: 1000,
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
      showToast(Constant.REQUIRED_ALL_FIELDS, 'error');
      return;
    }

    const emailRegex =
      /^[^\s@]+@(?!(?:[^\s@]+\.)?(?:ac\.uk|edu)$)[^\s@]+\.[^\s@]+$/i;

    if (!emailRegex.test(username1.trim())) {
      showToast(Constant.VALID_EMAI_LADDRESS, 'error');
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
        showToast(data.message || Constant.PASSWORD_RESET_LINK_SENT, 'success');
        const toastDuration = 3000;
        setTimeout(() => {
          setShowPopup(true);
        }, toastDuration);
        setUsername1('');
      } else {
        showToast(data.message || Constant.SOMTHING_WENT_WRONG, 'error');
      }
    } catch (error) {
      console.error('Error sending reset link:', error);
      showToast(Constant.NETWORK_ERROR_PLEASE_TRY_AGAIN, 'error');
    }
  };

  const loginapi = async () => {
    if(loading) return
    Keyboard.dismiss();

    if (!username.trim() || !password.trim()) {
      showToast(Constant.REQUIRED_ALL_FIELDS, 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username.trim())) {
      showToast(Constant.VALID_EMAI_LADDRESS, 'error');
      return;
    }

    setLoading(true);

    try {
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
      } catch (err) {
        setLoading(false);
        showToast(Constant.INVALID_SERVER_RESPONSE, 'error');
        return;
      }

      console.log('Login response:', JSON.stringify(result, null, 2));

      if (!response.ok || result?.statusCode !== 200) {
        setLoading(false);
        showToast(
          result?.message || Constant.INVALID_EMAIL_OR_PASSWORD,
          'error',
        );
        return;
      }

      const token = result?.data?.token;
      const user = result?.data?.user;

      if (token && user) {
        setLoading(false);
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        await AsyncStorage.setItem('userId', String(user.id));

        showToast(result?.message || Constant.LOGIN_SUCCESSFUL, 'success');

        setUsername('');
        setPassword('');
        setIsPasswordVisible(false);
        setTextandBackIcon(false);
        await AsyncStorage.setItem('ISLOGIN', 'true');
        navigation.replace('Dashboard',{AddScreenBackactiveTab: 'Home',isNavigate: true});
      } else {
        setLoading(false);
        showToast(Constant.INVALID_USER_DATA_RECEIVED, 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {

    setOtp(['', '', '', '']);

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !signUpusername.trim() ||
      !signUppassword.trim() ||
      !confirmPassword.trim()
    ) {
      showToast(Constant.REQUIRED_ALL_FIELDS, 'error');
      return;
    }

    // if (postalCode.length < 5) {
    //   showToast("Postal code must be at least 5 characters long.", 'error');
    //   return;
    // }
    const emailRegex =
      /^[^\s@]+@(?!(?:[^\s@]+\.)?(?:ac\.uk|edu)$)[^\s@]+\.[^\s@]+$/i;
    if (!emailRegex.test(signUpusername.trim())) {
      showToast(Constant.VALID_EMAI_LADDRESS, 'error');
      return;
    }

    const passwordRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(signUppassword.trim())) {
      showToast('Min 8 chars: upper, lower, number, symbol.', 'error');
      return;
    }
    if (signUppassword.trim() !== confirmPassword.trim()) {
      showToast(Constant.PASSWORDS_DO_NOT_MATCH, 'error');
      return;
    }

    try {
      const body = {
        firstname: firstName,
        lastname: lastName,
        postal_code: '123456',
        email: signUpusername,
        password: signUppassword,
        confirmPassword: confirmPassword,
      };

      console.log('Request body:', JSON.stringify(body, null, 2));

      const url = MAIN_URL.baseUrl + 'user/user-signup';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('API response:', data);

      if (response.status === 201) {
        showToast(data.message, 'success');

        await AsyncStorage.setItem(
          'tempUserId',
          data.data.temp_user_id.toString(),
        );
        await AsyncStorage.setItem('otp_id', data.data.otp_id.toString());
        await AsyncStorage.setItem(
          'personal_mail_id',
          signUpusername.toString(),
        );

        Animated.timing(signupTranslateY, {
            toValue: 300,//Dimensions.get('window').height,
            duration: 350,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
            // Slide SendOTP screen from top into view
            // setOTPTranslatY.setValue(-Dimensions.get('window').height); // reset position
            setOTPTranslatY.setValue(-600);
            Animated.timing(setOTPTranslatY, {
              toValue: 0,
              duration: 250,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }).start(() => {
              setCurrentScreen('login');
              setcurrentScreenIninner('sendOTP');
               setTimeout(() => {
              inputs.current[0]?.focus();
            }, 300);
            });
          });
    
            Animated.timing(loginTranslateY, {
              toValue: 500,//Dimensions.get('window').height,
              duration: 350,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }).start(() => {
              setCurrentScreen('login');
              setcurrentScreenIninner('sendOTP');
            });

        
      } else {
        showToast(data.message || 'Signup failed', 'error');
      }
    } catch (err) {
      console.log('Error sending signup request:', err);
      showToast(Constant.FAIL_TO_SEND_OTP, 'error');
    }
  };

  //otp
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputs = useRef<(TextInput | null)[]>([]);
  // useEffect(() => {
  //   const timer = setTimeout(() => inputs.current[0]?.focus(), 300);
  //   return () => clearTimeout(timer);
  // }, []);
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

  const otpverify = async () => {
    Keyboard.dismiss();
    
    setverifyUsername('');
    const otpValue = otp.join('');

    if (otpValue.length < 4 || otp.includes('')) {
      showToast(Constant.PLEASE_ENTER_ALL_4_DIGITS_OF_THE_OTP, 'error');
      return;
    }
    try {
      const otp_id = await AsyncStorage.getItem('otp_id');

      if (!otp_id) {
        showToast(Constant.OTP_ID_MISSING, 'error');
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
      console.log('OTP Verify Response:', data);

      if (data?.statusCode === 200) {
        showToast(data.message, 'success');
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

        Animated.timing(setOTPTranslatY, {
          toValue: 200,//Dimensions.get('window').height,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(() => {});

        Animated.timing(loginTranslateY, {
          toValue: 200,//Dimensions.get('window').height,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          setCurrentScreen('login');
          setcurrentScreenIninner('verify');
          setShowOtp(false);
          setverifyimageLoaded(true);
        });
      } else {
        showToast(data?.message || Constant.OPT_VERIFICATION_FAILED, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(Constant.SOMTHING_WENT_WRONG, 'error');
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
        showToast(data.message, 'success');

        await AsyncStorage.setItem(
          'tempUserId',
          data.data.temp_user_id.toString(),
        );

        await AsyncStorage.setItem('otp_id', data.data.otp_id.toString());

        console.log('OTP resent successfully:', data.message);
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
      showToast(Constant.REQUIRED_ALL_FIELDS, 'error');
      return;
    }

    const emailParts = verifyusername.split('@');
    if (emailParts.length !== 2) {
      showToast(Constant.VALID_EMAI_LADDRESS, 'error');
      return;
    }

    const domain = '@' + emailParts[1].toLowerCase();

    if (!universityDomains.includes(domain)) {
      showToast(Constant.VALID_EMAI_LADDRESS, 'error');
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
      console.log('Send OTP Response:', data);

      if (data?.statusCode === 200) {
        showToast(data.message, 'success');
        await AsyncStorage.setItem(
          'temp_user_id',
          data.data.temp_user_id.toString(),
        );
        await AsyncStorage.setItem('otp_id', data.data.otp_id.toString());
        await AsyncStorage.setItem('signupUsername', verifyusername);
        

        Animated.timing(verifyAndContinyTranslateY1, {
            toValue: 200,//Dimensions.get('window').height, // move down off screen
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
          });
      } else {
        showToast(data?.message || 'Failed to send OTP', 'error');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      showToast(Constant.SOMTHING_WENT_WRONG, 'error');
    }
  };

  const submitotp = async () => {

   
    Keyboard.dismiss();
    setPhoto('');
    const otpValue = otp1.join('');

    if (otpValue.length < 4 || otp1.includes('')) {
      showToast(Constant.PLEASE_ENTER_ALL_4_DIGITS_OF_THE_OTP, 'error');
      return;
    }

    try {
      const otp_id = await AsyncStorage.getItem('otp_id');
      if (!otp_id) {
        showToast(Constant.OTP_ID_MISSING, 'error');
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
      console.log('Student OTP Verify Response:', data);

      if (data?.statusCode === 200) {
        showToast(data.message, 'success');

        if (data?.data) {
          await AsyncStorage.setItem('user_email', data.data.email || '');
          await AsyncStorage.setItem('firstname', data.data.firstname || '');
          await AsyncStorage.setItem('lastname', data.data.lastname || '');
          await AsyncStorage.setItem(
            'student_email',
            data.data.student_email || '',
          );

          if (data?.data?.token?.access_token) {
            await AsyncStorage.setItem(
              'userToken',
              data.data.token.access_token,
            );
          }
        }
        // setShowPopup1(false);
        // setCurrentScreen('login');
        // setcurrentScreenIninner('profile');
                 // verifyAndContinyTranslateY2.setValue(-200);

    // Slide in OTP form (from top to 0)
    profileTranslateY.setValue(-300);

      Animated.timing(verifyAndContinyTranslateY2, {
        toValue: 300, // slide down off-screen
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(()=>{
    
        setShowPopup1(false);
        setCurrentScreen('login');
        setcurrentScreenIninner('profile');
        Animated.timing(profileTranslateY, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start();
      });
      } else {
        showToast(data?.message || 'OTP verification failed', 'error');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      showToast(Constant.SOMTHING_WENT_WRONG, 'error');
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
      console.log('Send OTP Response:', data);

      if (data?.statusCode === 200) {
        await AsyncStorage.setItem(
          'temp_user_id',
          data.data.temp_user_id.toString(),
        );
        await AsyncStorage.setItem('otp_id', data.data.otp_id.toString());
        // await AsyncStorage.setItem('signupUsername', username);

        showToast(data.message, 'success');
        setShowOtp(true);
        //startAnimation();
        setTimeout(() => {
        verifyinputs.current[0]?.focus();
      }, 200);
      } else {
        showToast(data?.message || Constant.FAIL_TO_SEND_OTP, 'error');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      showToast(Constant.SOMTHING_WENT_WRONG, 'error');
    }
  };
  //profile

  // const requestCameraPermission = async () => {
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
  //   } else {
  //     return true;
  //   }
  // };

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
    } else if (Platform.OS === 'ios') {
      try {
        // Check current permission status first
        const status = await check(PERMISSIONS.IOS.CAMERA);
        if (status === RESULTS.GRANTED) {
          return true;
        }
        const result = await request(PERMISSIONS.IOS.CAMERA);
  
        if (result === RESULTS.GRANTED) {
          return true; 
        } else if (result === RESULTS.BLOCKED) {
          console.warn('Camera permission is blocked. Please enable it in Settings.');
          return false;
        } else {
          return false; // Denied
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    } 
    
    else {
      return true;
    }
  };

  const loginTranslateY = useRef(
    new Animated.Value(0),
  ).current;
  const signupTranslateY = useRef(
    new Animated.Value(Dimensions.get('window').height),
  ).current;


  const ClickFPGoBack_slideOutToTop = (onFinish?: () => void) => {
    Animated.timing(resetPasswordtranslateY, {
      toValue: -300,//-Dimensions.get('window').height,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      
      if (onFinish) onFinish();
    });
    Animated.timing(loginTranslateY, {
      toValue: 300,//Dimensions.get('window').height,
      duration: 100,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
    
  };

  const goToForgotPassword = () => {
    Keyboard.dismiss();
    
    // resetPasswordtranslateY.setValue(Dimensions.get('window').height);
    Animated.parallel([
        // Slide login down
        Animated.timing(loginTranslateY, {
          toValue: 300, // move login view to bottom
          duration: 300, // same duration for both
          easing:  Easing.linear,
          useNativeDriver: true,
        }),
        // Slide reset password up
        Animated.timing(resetPasswordtranslateY, {
          toValue: 0, // slide reset password view to actual position
          duration: 300, // same duration
          // easing: Easing.linear,
          useNativeDriver: true,
        }),
        // Fade out text and back icon (optional)
        Animated.timing(textAndBackOpacity, {   
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        
        setTextandBackIcon(false);
        setUsername('');
        setPassword('');
        setIsPasswordVisible(false);
        setCurrentScreen('login');
        setcurrentScreenIninner('forgotpassword');
      });
   
    
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
        
        // Animated.spring(heightAnim, {
        //     toValue: contentHeight + 30, // overshoot a bit
        //     friction: 100,
        //     tension: 1000,
        //     useNativeDriver: false,
        //   }).start();
      } else {
        Animated.timing(heightAnim, {
          toValue: contentHeight + 30,
          duration: 1000,
          easing: Easing.out(Easing.exp),
          useNativeDriver: false,
        }).start();
        // Animated.spring(heightAnim, {
        //     toValue: contentHeight+ 30, // overshoot a bit
        //     friction: 10,
        //     tension: 1000,
        //     useNativeDriver: false,
        //   }).start();
      }
    }
  }, [contentHeight]);

  const Click_SENDOTP_TO_SIGNUPSCREEN = (onFinish?: () => void) => {
    Animated.timing(setOTPTranslatY, {
      toValue: -400,//-Dimensions.get('window').height,
      duration: 350,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
        
      if (onFinish) onFinish();
    });
    Animated.timing(signupTranslateY, {
        toValue: 400,//Dimensions.get('window').height,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
  };

  const ClickBackToSendOTP1 = (onFinish?: () => void) => {
    Keyboard.dismiss();
  
    Animated.parallel([
      // OTP slides up & fades out
      Animated.timing(verifyAndContinyTranslateY2, {
        toValue: -300,
        duration: 400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    //   Animated.timing(otpOpacity, {
    //     toValue: 0,
    //     duration: 350,
    //     easing: Easing.linear,
    //     useNativeDriver: true,
    //   }),
  
      // Verify Email slides in from bottom & fades in
      Animated.timing(verifyAndContinyTranslateY1, {
        toValue: 0,
        duration: 450,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    //   Animated.timing(verifyOpacity, {
    //     toValue: 1,
    //     duration: 400,
    //     easing: Easing.linear,
    //     useNativeDriver: true,
    //   }),
    ]).start(() => {
      // cleanup & state updates after animation
      setShowOtp(false);
      setverifyimageLoaded(true);
      setCurrentScreen('login');
      setcurrentScreenIninner('verify');
      if (onFinish) onFinish();
    });
  };
  
//   const ClickBackToSendOTP1 = (onFinish?: () => void) => {


//     Keyboard.dismiss();

//     Animated.parallel([
//       // Slide Verify screen up from bottom (IN)
//       Animated.timing(verifyAndContinyTranslateY1, {
//         toValue: 0, // on screen
//         duration: 400,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }),
  
//       // Slide OTP screen up and out (OUT)
//       Animated.timing(verifyAndContinyTranslateY2, {
//         toValue: -300, // move up off-screen
//         duration: 400,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }),
//     ]).start(() => {
//       // After animation, update states
//       setShowOtp(false);
//       setverifyimageLoaded(true);
//       setCurrentScreen('login');
//       setcurrentScreenIninner('verify');
//       if (onFinish) onFinish();
//     });


//     // Keyboard.dismiss();
 
//     // // ✅ Reset OTP screen below the window
//     // // setOTPTranslatY.setValue(Dimensions.get('window').height);
//     // setCurrentScreen('login');
//     // setcurrentScreenIninner('verify');
//     // setverifyimageLoaded(true)
//     // setShowOtp(false);
    
//     // Animated.parallel([
//     //     Animated.timing( verifyAndContinyTranslateY1, {
//     //         toValue: -300,//Dimensions.get('window').height, // on screen
//     //         duration: 300,
//     //         easing: Easing.out(Easing.ease),
//     //         useNativeDriver: true,
//     //       }),
//     //   // Slide Verify screen up (out)
//     //   Animated.timing(verifyAndContinyTranslateY2, {
//     //     toValue: -300,//-Dimensions.get('window').height,
//     //     duration: 400,
//     //     easing: Easing.out(Easing.ease),
//     //     useNativeDriver: true,
//     //   }),
     
     
//     //   // Slide SendOTP screen up from bottom (in)
//     //   Animated.timing(setOTPTranslatY, {
//     //     toValue: 300,//Dimensions.get('window').height, // on screen
//     //     duration: 300,
//     //     easing: Easing.out(Easing.ease),
//     //     useNativeDriver: true,
//     //   }),
//     // ]).start(() => {
  
//     //   if (onFinish) onFinish();
//     // });

//   };

  const handleSelectImage = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const handleResponse = async (response: any) => {
      if (response.didCancel) return;
      if (response.assets && response.assets[0].uri) {
        const uri = response.assets[0].uri;
        setPhoto(uri);

        // Start API call immediately after setting photo
        await uploadImage(uri);
      }
    };

    Alert.alert(
      'Select Option',
      'Choose a source',
      [
        {
          text: 'Camera',
          onPress: () => {
            launchCamera(
              {
                mediaType: 'photo',
                cameraType: 'front',
                quality: 0.8,
              },
              handleResponse,
            );
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            launchImageLibrary(
              {
                mediaType: 'photo',
                quality: 0.8,
              },
              handleResponse,
            );
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  const insets = useSafeAreaInsets();

  const uploadImage = async (uri: string) => {
    setLoading(true);
    try {
      if (!uri) {
        console.log('No photo selected');
        Alert.alert(Constant.ALERT_MESSAGE_PLEASE_SELECT_AN_IMAGE_FIRST);
        setLoading(false);
        return;
      }

      console.log('Photo URI:', uri);

      const token = await AsyncStorage.getItem('userToken');
      console.log('Token retrieved:', token);

      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const url = MAIN_URL.baseUrl + 'user/update-profile';
      console.log('Sending API request…', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      console.log('API result:', result);

      if (response.ok && result?.message) {
        console.log('Upload success');
        showToast(result.message, 'success');

        // setTimeout(() => {
        //   setShowPopup1(true);
        // }, 2000);
      } else {
        console.log('Upload failed');
      }
    } catch (err) {
      console.log('Error:', err);
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
   animRef.current?.pause();
      if (flag === 'true') {
        // User is logged in → navigate to Dashboard
        navigation.replace('Dashboard',{AddScreenBackactiveTab: 'Home',isNavigate: true});
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
  return (
    <ImageBackground
      source={require('../../../assets/images/bganimationscreen.png')}
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
              style={[StyleSheet.absoluteFill]}
              blurType="light" // "light", "dark", "xlight"
              blurAmount={30} // adjust intensity
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
                <LottieView
                  ref={animRef}
                  source={require('../../../assets/animations/animation_new.json')}
                  autoPlay
                  loop={false}
                  resizeMode="contain"
                  style={{ width, height }}
                  onAnimationFinish={handleAnimationFinish}
                />
              {/* </View> */}
            </>
          )}
          {currentScreen === 'hello' && (
            <View style={Styles.ScreenLayout}>
              <Animated.View
                style={[{paddingTop: (Platform.OS === 'ios'? 80: 40)},{ transform: [{ translateY: unizyTranslateY }] }]}
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
                <Text allowFontScaling={false} style={Styles.unizyText}>UniZy</Text>
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
                      // Slide SendOTP screen up from bottom (in)
                      // Animated.timing(slideUp, {
                      //   toValue: -Dimensions.get('window').height, // on screen
                      //   duration: 200,
                      //   easing: Easing.out(Easing.ease),
                      //   useNativeDriver: true,
                      // }),
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
                      <Text allowFontScaling={false} style={Styles.selectlanguageText}>
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
                  <Text allowFontScaling={false} style={selectlang_styles.title}>Select Language</Text>

                  <View style={selectlang_styles.search_container}>
                    <Image
                      source={require('../../../assets/images/searchicon.png')}
                      style={selectlang_styles.searchIcon}
                    />
                    <TextInput
                      allowFontScaling={false}
                      style={selectlang_styles.searchBar}
                      placeholder="Search"
                      selectionColor="white"
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
                      keyExtractor={item => item.code}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={selectlang_styles.languageItem}
                          onPress={() => handleLanguageSelect(item)}
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
                                  minHeight:30
                                }}
                              >
                                {/* <Image
                                  source={item.flag}
                                  style={selectlang_styles.flag}
                                /> */}
                                <Image
                                  source={typeof item.flag === 'string' ? { uri: item.flag } : item.flag} // handle URI or require
                                  style={selectlang_styles.flag}
                                />
                                <Text allowFontScaling={false} style={selectlang_styles.languageText}>
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
                  paddingTop: Platform.OS === 'ios' ? 70 : 40,
                  paddingLeft: 16,
                  paddingRight: 16,
                }}
              >
                {currentScreenIninner === 'login' && (
                  <TouchableOpacity
                    style={{ zIndex: 1000 }}
                    onPress={() => {
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
                  <Text allowFontScaling={false} style={Styles.unizyText}>UniZy</Text>
                </Animated.View>
              </View>

              <View
                style={{
                  width: '100%',
                  height: '100%',
                  paddingLeft: 16,
                  paddingRight: 16,
                  paddingTop: 15,
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
                          style={{ opacity: loginOpacity,
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
                          <View style={Styles.login_container}>
                            <TextInput
                            allowFontScaling={false}
                              style={Styles.personalEmailID_TextInput}
                              placeholder={'Personal Email ID*'}
                              placeholderTextColor={'rgba(255, 255, 255, 0.48)'}
                              value={username}
                              maxLength={50}
                              keyboardType="email-address"
                              autoCapitalize="none"
                              autoCorrect={false}
                              selectionColor="white"
                              autoComplete={Platform.OS === 'ios' ? 'email' : 'username'}
                              textContentType={Platform.OS === 'ios' ? 'emailAddress' : 'username'}
                              onChangeText={usernameText =>
                                setUsername(usernameText)
                              }
                            />
                          </View>

                          <View style={Styles.password_container}>
                            <TextInput
                              allowFontScaling={false}
                              style={Styles.password_TextInput}
                              placeholder={'Password*'}
                              placeholderTextColor={'rgba(255, 255, 255, 0.48)'}
                              value={password}
                              maxLength={20}
                              selectionColor="white"
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
                              goToForgotPassword();
                            }}
                          >
                            Forgot Password?
                          </Text>

                          <TouchableOpacity
                            style={Styles.loginButton}
                            onPress={loginapi}
                          >
                            <Text allowFontScaling={false} style={Styles.sendText}>Login</Text>
                          </TouchableOpacity>

                          <View
                            style={{
                              width: '100%',
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: 5,
                              marginVertical:8
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
                                marginTop: 10,
                              }}
                            >
                              Don't have an account?
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                            
                              Keyboard.dismiss();
                            Animated.timing(textAndBackOpacity, {
                                toValue: 0,
                                duration: 300,
                                useNativeDriver: true,
                              }).start();
                          
                              // Reset initial position and opacity before animation
                              signupTranslateY.setValue(0); // start off-screen
                              signupOpacity.setValue(0); // start invisible
                              loginOpacity.setValue(1); // start visible
                          
                              // Animate slide + fade together
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
                              });
                            }}
                            >
                              <Text allowFontScaling={false} style={Styles.signupText}>Sign up</Text>
                            </TouchableOpacity>
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
                              { gap: 10 },
                              {
                                transform: [
                                  { translateY: resetPasswordtranslateY },
                                ],
                              },
                            ]}
                          >
                            <Text allowFontScaling={false} style={Styles.resetTitle}>
                              Reset Password
                            </Text>
                            <View style={Styles.privacyContainer}>
                              <Text
                                  allowFontScaling={false}
                                  style={[Styles.termsText, { paddingBottom:8 }]}
                                >
                                Enter your personal email address and we’ll send
                                you a link to reset your password
                              </Text>
                            </View>

                            <View style={[Styles.login_container]}>
                              <TextInput
                              allowFontScaling={false}
                                style={[
                                  Styles.personalEmailID_TextInput,
                                  { color: '#fff' },
                                ]}
                                placeholder="Personal Email ID*"
                                placeholderTextColor="rgba(255, 255, 255, 0.48)"
                                value={username1}
                                maxLength={50}
                                selectionColor="white"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete={Platform.OS === 'ios' ? 'email' : 'username'}
                                textContentType={Platform.OS === 'ios' ? 'emailAddress' : 'username'}
                                importantForAutofill="yes"
                                autoCorrect={false}
                                onChangeText={usernameText =>
                                  setUsername1(usernameText)
                                }
                              />
                            </View>

                            <TouchableOpacity
                              style={[Styles.loginButton]}
                              onPress={() => {
                                handleSendResetLink();
                              }}
                            >
                              <Text allowFontScaling={false} style={Styles.sendText}>
                                Send Reset Link
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => {
                                Keyboard.dismiss();
                                resetPasswordtranslateY.setValue(0);
                                ClickFPGoBack_slideOutToTop(() => {
                                  Animated.timing(textAndBackOpacity, {
                                    toValue: 1, // fade in
                                    duration: 250,
                                    useNativeDriver: true,
                                  }).start();
                                  setUsername1('');
                                  // reset for next time
                                  setCurrentScreen('login');
                                  setcurrentScreenIninner('login');
                                });
                              }}
                            >
                              <Text allowFontScaling={false} style={[Styles.goBackText,{color:'rgba(140, 244, 255, 0.7)'}]}>Go Back</Text>
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
                                blurType="dark"
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
                                    { width: width * 0.85}
                                  ]}
                                >
                                  
                                  <Image
                                    source={require('../../../assets/images/success_icon.png')}
                                    style={Styles.logo}
                                    resizeMode="contain"
                                  />
                                  <Text allowFontScaling={false} style={Styles.termsText1}>
                                    A password reset link has been sent to your
                                    personal email. Please check your inbox (or
                                    spam folder) to continue.
                                  </Text>

                                  <TouchableOpacity
                                    style={Styles.loginButton}
                                    onPress={() => {
                                      setShowPopup(false);
                                      setCurrentScreen('login');
                                      setcurrentScreenIninner('login');
                                    }}
                                  >
                                    <Text allowFontScaling={false} style={Styles.loginText}>
                                      Back to Login
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
                            { width: '100%', alignItems: 'center',opacity: signupOpacity},
                            {
                              transform: [{ translateY: signupTranslateY }],
                            },
                          ]}
                        >
                          <View style={Styles.nameRow}>
                            <View style={Styles.login_container1}>
                              <TextInput
                              allowFontScaling={false}
                                style={Styles.personalEmailID_TextInput1}
                                placeholder="First Name*"
                                placeholderTextColor="rgba(255, 255, 255, 0.48)"
                                value={firstName}
                                onChangeText={text =>
                                  /^[A-Za-z ]*$/.test(text) &&
                                  setFirstName(text)
                                }
                                maxLength={20}
                                autoComplete="name-given"        
                                textContentType="givenName"      
                                autoCapitalize="words"        
                                importantForAutofill="yes"  
                                selectionColor="white"
                              />
                            </View>

                            <View style={Styles.login_container1}>
                              <TextInput
                              allowFontScaling={false}
                                style={Styles.personalEmailID_TextInput1}
                                placeholder="Last Name*"
                                placeholderTextColor="rgba(255, 255, 255, 0.48)"
                                value={lastName}
                                selectionColor="white"
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

                          <View style={{ display: 'none' }}>
                            <View
                              style={[
                                Styles.login_container,
                                { display: 'none' },
                              ]}
                            >
                              <TextInput
                              allowFontScaling={false}
                                style={Styles.personalEmailID_TextInput}
                                placeholder="Postal Code"
                                placeholderTextColor="rgba(255, 255, 255, 0.48)"
                                value={postalCode}
                                maxLength={7}
                                //keyboardType="numeric"
                                onChangeText={text => {
                                  const alphanumericText = text.replace(
                                    /[^a-zA-Z0-9]/g,
                                    '',
                                  );
                                  const limitedText = alphanumericText.slice(
                                    0,
                                    7,
                                  );
                                  setPostalCode(limitedText);
                                }}
                              />
                            </View>
                          </View>

                          <View
                            style={[
                              Styles.password_container,
                              { marginTop: 0 },
                            ]}
                          >
                            <TextInput
                            allowFontScaling={false}
                              style={Styles.password_TextInput}
                              placeholder="Personal Email ID*"
                              placeholderTextColor="rgba(255, 255, 255, 0.48)"
                              value={signUpusername}
                              maxLength={50}
                              keyboardType="email-address"
                              autoCapitalize="none"
                              selectionColor="white"
                              autoComplete={Platform.OS === 'ios' ? 'email' : 'username'}
                              textContentType={Platform.OS === 'ios' ? 'emailAddress' : 'username'}
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
                              <Text allowFontScaling={false} style={Styles.infoText}>
                                <Text allowFontScaling={false} style={Styles.infoText1}>
                                  Important:{' '}
                                </Text>
                                Use your personal email address for signup. Your
                                university email will be requested separately
                                for student verification.
                              </Text>
                            </View>
                          )}

                          <View style={Styles.password_container}>
                            <TextInput
                            allowFontScaling={false}
                              style={Styles.password_TextInput}
                              placeholder="Create Password*"
                              placeholderTextColor="rgba(255, 255, 255, 0.48)"
                              value={signUppassword}
                              maxLength={20}
                              selectionColor="white"
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

                          <View style={Styles.password_container}>
                            <TextInput
                            allowFontScaling={false}
                              style={[
                                Styles.password_TextInput,
                                { color: '#fff' },
                              ]}
                              placeholder="Confirm Password*"
                              placeholderTextColor="rgba(255, 255, 255, 0.48)"
                              value={confirmPassword}
                              maxLength={20}
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
                            <Text allowFontScaling={false} style={Styles.sendText}>Send OTP</Text>
                          </TouchableOpacity>

                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginTop: 16,
                              marginBottom:8,
                            }}
                          >
                            <Text allowFontScaling={false} style={Styles.signupPrompt}>
                              Already have an account?{' '}
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
                              <Text allowFontScaling={false} style={Styles.signupPrompt1}>Login</Text>
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
                              <Text allowFontScaling={false} style={Styles.sendOtpresetTitle}>
                                Verify Personal Email ID
                              </Text>
                              <View style={Styles.sendOtpprivacyContainer}>
                                <Text allowFontScaling={false} style={Styles.termsText}>
                                  We have sent a 4-digit code to{' '}
                                  <Text allowFontScaling={false} style={Styles.sendOtpresendText2}>
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
                                    selectionColor="white"
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
                                style={[Styles.sendOtploginButton,{marginTop:16}]}
                                onPress={otpverify}
                              >
                                <Text allowFontScaling={false} style={Styles.sendText}>
                                  Verify & Continue
                                </Text>
                              </TouchableOpacity>

                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'center',
                                  marginTop: 16,
                                }}
                              >
                                <Text allowFontScaling={false} style={Styles.sendOtpresendText}>
                                  Didn’t receive a code?{' '}
                                </Text>
                                <TouchableOpacity onPress={handleresend}>
                                  <Text allowFontScaling={false} style={[Styles.sendOtpresendText1,{color: 'rgba(140, 244, 255, 0.7)'}]}>
                                    Resend Code
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
                                <Text allowFontScaling={false} style={Styles.sendOtpgoBackText}>
                                  Entered wrong email?{' '}
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


                                    // Keyboard.dismiss();
                                    // verifyAndContinyTranslateY1.setValue(-300); // below screen ❌ wrong direction
                                    // verifyAndContinyTranslateY2.setValue(300);  // currently on screen ❌ wrong
                                    // ClickBackToSendOTP1();  // visible
                                    // verifyOpacity.setValue(0);
                                    // otpOpacity.setValue(1);
                                    // Click_SENDOTP_TO_SIGNUPSCREEN(() => {
                                    //   setCurrentScreen('login');
                                    //   setcurrentScreenIninner('signup');
                                    //   setShowOtp(false);
                                    //   setverifyimageLoaded(true);
                                    // });
                                  }}
                                >
                                  <Text allowFontScaling={false} style={[Styles.sendOtpgoBackText1,{color: 'rgba(140, 244, 255, 0.7)'}]}>
                                    Go Back
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
                              <Text allowFontScaling={false} style={Styles.verifyresetTitle}>
                                Verify University Email ID
                              </Text>
                              <View style={Styles.verifylogin_container}>
                                <TextInput
                                allowFontScaling={false}
                                  style={Styles.verifypersonalEmailID_TextInput}
                                  placeholder={'University Email ID*'}
                                  placeholderTextColor={
                                    'rgba(255, 255, 255, 0.48)'
                                  }
                                  value={verifyusername}
                                  maxLength={50}
                                  keyboardType="email-address"
                                  autoCapitalize="none"
                                  selectionColor="white"
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
                                <Text allowFontScaling={false} style={Styles.sendText}>Send OTP</Text>
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
                              <Text allowFontScaling={false} style={Styles.verifyresetTitle}>
                                Verify University Email ID
                              </Text>

                              <View style={Styles.verifyprivacyContainer}>
                                <Text allowFontScaling={false} style={Styles.verifytermsText}>
                                  We have sent a 4-digit code to{' '}
                                  <Text allowFontScaling={false} style={Styles.resendText2}>
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
                                    selectionColor="white"
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
                                <Text allowFontScaling={false} style={Styles.sendText}>
                                  Verify & Continue
                                </Text>
                              </TouchableOpacity>

                              <View
                                style={{ flexDirection: 'row', marginTop: 6 }}
                              >
                                <Text allowFontScaling={false} style={Styles.verifyresendText}>
                                  Didn’t receive a code?{' '}
                                </Text>
                                <TouchableOpacity onPress={resubmitotp}>
                                  <Text allowFontScaling={false} style={[Styles.verifyresendText1,{color: 'rgba(140, 244, 255, 0.7)'}]}>
                                    Resend Code
                                  </Text>
                                </TouchableOpacity>
                              </View>

                              <TouchableOpacity
                                style={{ flexDirection: 'row', marginVertical: 6 }}
                              >
                                <Text allowFontScaling={false} style={Styles.verifyresendText}>
                                  Entered wrong email?{' '}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => {
                                    // verifyAndContinyTranslateY1.setValue(300); // below screen
                                    // verifyAndContinyTranslateY2.setValue(0);
                                    // // setOTPTranslatY.setValue(300);
                                    // ClickBackToSendOTP1(() => {
                                    //   //   setCurrentScreen('login');
                                    //   // setcurrentScreenIninner('sendOTP');
                                    //     setCurrentScreen('login');
                                    //     setcurrentScreenIninner('verify');
                                    //     setverifyimageLoaded(true)
                                    //     setShowOtp(false);
                                    // });



                                    Keyboard.dismiss();
    // Set correct starting positions
    verifyAndContinyTranslateY1.setValue(300);
    verifyAndContinyTranslateY2.setValue(0);

    // Run animation
    Animated.parallel([
      Animated.timing(verifyAndContinyTranslateY1, {
        toValue: 0,
        duration: 400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(verifyAndContinyTranslateY2, {
        toValue: -300,
        duration: 400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowOtp(false);
      setverifyimageLoaded(true);
      setCurrentScreen('login');
      setcurrentScreenIninner('verify');
    });
  

                                  }}
                                >
                                  <Text allowFontScaling={false} style={[Styles.verifygoBackText1,{color: 'rgba(140, 244, 255, 0.7)'}]}>
                                    Go Back
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
                              <Text allowFontScaling={false} style={Styles.profileprofileresetTitle}>
                                Add a Photo
                              </Text>
                              <View style={[Styles.profileprivacyContainer,{marginTop:10}]}>
                                <Text allowFontScaling={false} style={Styles.profiletermsText}>
                                  Personalize your account with a photo. You can
                                  always change it later.
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
                                <Text allowFontScaling={false} style={Styles.profileloginText}>
                                  Continue
                                </Text>
                              </TouchableOpacity>

                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginTop: 16,
                                  marginBottom:8
                                }}
                              >
                                <Text allowFontScaling={false} style={Styles.profilesignupPrompt}>
                                  Want to do it later?{' '}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => {
                                    setShowPopup1(true);
                                  }}
                                >
                                  <Text allowFontScaling={false} style={[Styles.profilesignupPrompt1,{color:'rgba(140, 244, 255, 0.7)'}]}>
                                    Skip
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
                              style={StyleSheet.absoluteFill}
                              blurType="dark"
                              blurAmount={25}
                            />

                            <View
                              style={[
                                StyleSheet.absoluteFill,
                                { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
                              ]}
                            /> */}
                            <BlurView
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
                                Styles.profilepopupContainer,
                                { width: width * 0.85 },
                              ]}
                            >
                              <Image
                                source={require('../../../assets/images/success_icon.png')}
                                style={Styles.profilelogo1}
                                resizeMode="contain"
                              />
                              <Text allowFontScaling={false} style={Styles.profiletermsText2}>
                                Account Created Successfully!
                              </Text>
                              <Text allowFontScaling={false} style={Styles.profiletermsText1}>
                                Welcome to Unizy! Your account has been created
                                and your’re all set to start exploring
                              </Text>
                              <TouchableOpacity
                                style={Styles.profileloginButton}
                                onPress={async () => {
                                  // setCurrentScreen('login');
                                  //setcurrentScreenIninner('login');
                                  closePopup1();
                                  await AsyncStorage.setItem('ISLOGIN', 'true');
                                  navigation.replace('Dashboard',{AddScreenBackactiveTab: 'Home',isNavigate: true});
                                }}
                              >
                                <Text allowFontScaling={false} style={Styles.profileloginText}>
                                  Start Exploring
                                </Text>
                              </TouchableOpacity>
                            </View>
                            </BlurView>
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
                {/* Teams and codition */}
              </View>

              {((currentScreen === 'login' &&
                currentScreenIninner === 'login') ||
                currentScreenIninner === 'signup') && (
                <Animated.View
                  style={[
                    Styles.mainTemsAndConditions,
                    currentScreenIninner === 'login' ||
                    currentScreenIninner === 'signup'
                      ? { transform: [{ translateY: slideUp }] }
                      : {},
                  ]}
                >
                  <View style={Styles.teamsandConditionContainer}>
                    <Text allowFontScaling={false} style={Styles.bycountuningAgreementText}>
                      By continuing, you agree to our
                    </Text>
                    {/* <Text allowFontScaling={false} style={Styles.teamsandConditionText}>
                      Terms & Conditions
                    </Text> */}
                    <View style={{ alignSelf: 'flex-start' }}>
                <Text allowFontScaling={false}  style={Styles.teamsandConditionText}>Terms & Conditions</Text>
                <View style={{ marginLeft:5,height: 1.2, backgroundColor: 'rgba(124, 234, 255, 0.9)', marginTop: 0 }} />
              </View>
                  </View>

                  <View style={[Styles.teamsandConditionContainer,{marginTop:3,paddingBottom:10}]}>
                    <Text allowFontScaling={false} style={Styles.bycountuningAgreementText}>and</Text>
                    {/* <Text allowFontScaling={false} style={Styles.teamsandConditionText}>
                      Privacy Policy
                    </Text> */}
                      <View style={{ alignSelf: 'flex-start' }}>
                <Text allowFontScaling={false}  style={Styles.teamsandConditionText}>Privacy Policy</Text>
                <View style={{ marginLeft:5,height: 1.2, backgroundColor: 'rgba(124, 234, 255, 0.9)', marginTop: 0 }} />
              </View>
                  </View>
                </Animated.View>
              )}
            </>
          )}
        </KeyboardAvoidingView>
      </View>

      <NewCustomToastContainer />
    </ImageBackground>
  );
};

export default SinglePage;