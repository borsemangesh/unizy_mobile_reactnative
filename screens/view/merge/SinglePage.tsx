


import { BlurView } from '@react-native-community/blur';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
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
  ToastAndroid,
  Modal,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Styles } from './SinglePage.style';
import { selectlang_styles } from '../SelectLanguage/SelectLanguage.style';
import { getRequest } from '../../utils/API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import BackgroundAnimation from '../Hello/BackgroundAnimation';

const greetings = [
  'Hello', // English
  '你好', // Chinese
  'Hola', // Spanish
  'Bonjour', // French
  'Hallo', // German
  'Ciao', // Italian
  'Olá', // Portuguese
  'Привет', // Russian
  'مرحبا', // Arabic
  'こんにちは', // Japanese
  '안녕하세요', // Korean
  'नमस्ते', // Hindi
  'สวัสดี', // Thai
  'Merhaba', // Turkish
  'Cześć', // Polish
  'السلام علیکم', // Urdu
  'হ্যালো', // Bengali
  'Shalom', // Hebrew
  'Halo', // Malay
];

type Language = {
  code: string;
  name: string;
  flag: any;
};
const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    flag: require('../../../assets/images/English.png'),
  },
  {
    code: 'es',
    name: 'Spanish',
    flag: require('../../../assets/images/Spanish.png'),
  },
  {
    code: 'fr',
    name: 'French',
    flag: require('../../../assets/images/French.png'),
  },
  {
    code: 'sv',
    name: 'Swedish',
    flag: require('../../../assets/images/Swedish.png'),
  },
  {
    code: 'it',
    name: 'Italian',
    flag: require('../../../assets/images/Italian.png'),
  },
  {
    code: 'de',
    name: 'German',
    flag: require('../../../assets/images/German.png'),
  },
  {
    code: 'pt',
    name: 'Portuguese',
    flag: require('../../../assets/images/Portuguese.png'),
  },
];

const { height } = Dimensions.get('window');

const SinglePage = () => {
  const [currentScreen, setCurrentScreen] = useState<
    'hello' | 'language' | 'login'
  >('hello');

  const [currentScreenIninner, setcurrentScreenIninner] = useState<
    'login' | 'signup' | 'forgotpassword' | 'sendOTP' | 'verify' | 'profile'
  >('login');

  //Hello Screen
  const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0);
  const unizyTranslateY = React.useRef(new Animated.Value(-100)).current;
  const greetingOpacity = React.useRef(new Animated.Value(0)).current;
  const greetingScale = React.useRef(new Animated.Value(0.8)).current;
  const slideUp = React.useRef(new Animated.Value(200)).current;

  //Language Screen
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
 
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
 
 
   useEffect(() => {
    (async () => {
      setLoading(true)
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
  en: require('../../../assets/images/English.png'),
  hi: require('../../../assets/images/Indian.png'),
  es: require('../../../assets/images/Spanish.png'),
  fr: require('../../../assets/images/French.png'),
  zh: require('../../../assets/images/China.png'),
  // add others as needed
};
 
const filteredLanguages = languages
  .map(lang => ({
    code: lang.iso_code,
    name: lang.language_name,
    flag: flagMap[lang.iso_code] || require('../../../assets/images/English.png'),
  }))
  .filter(lang => lang.name.toLowerCase().includes(search.toLowerCase()));
 
 
const handleLanguageSelect = async (item:Language) => {
  try {
    // await AsyncStorage.setItem(
    //   'selectedLanguage',
    //   JSON.stringify({ code: item.code, name: item.name })
    // );
     setSelected(item.code);
     setCurrentScreen('login');
     setcurrentScreenIninner('login');
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
  const isFocused = useIsFocused();

  const sendOptinputs = useRef<Array<TextInput | null>>([]);


  const animateGreeting = () => {
    greetingOpacity.setValue(0);
    greetingScale.setValue(0.8);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(greetingOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(greetingScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
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

  const height = Dimensions.get('window');
  const { width } = Dimensions.get('window');

  const screenHeight = Dimensions.get('window').height;

  // Animations
  const opacity = React.useRef(new Animated.Value(0)).current;


  const slideAnim = React.useRef(new Animated.Value(-height)).current;

  const [slideUp1] = useState(new Animated.Value(screenHeight + 500));

  const cardHeight = useRef(new Animated.Value(0)).current; // start collapsed
  const [contentHeight, setContentHeight] = useState(400);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [verifyimageLoaded, setverifyimageLoaded] = useState(false);

  const [showPopup, setShowPopup] = useState(false);

  const resetPasswordtranslateY = React.useRef(
    new Animated.Value(-300),
  ).current;

  const closePopup = () => setShowPopup(false);

  const [contentHeight1, setContentHeight1] = useState(0);

  const [showOtp, setShowOtp] = useState(false);

  const [photo, setPhoto] = useState<string | null>(null);
  const [showButton, setShowButton] = useState(false);
  const scaleY = useRef(new Animated.Value(0)).current;
const [resetusername, resetsetUsername] = useState<string>('');


  const animatedHeight = useRef(new Animated.Value(400)).current; 

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
    if (currentScreen === 'hello') {
      animateGreeting();
    }
    if (currentScreen === 'language') {
      slideUp1.setValue(screenHeight); // start from bottom
      Animated.timing(slideUp1, {
        toValue: 0, // move to top
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    }

    if (currentScreen === 'login') {
        cardHeight.setValue(0);
        slideUp.setValue(100);
        translateY.setValue(-100);
        slideUp1.setValue(screenHeight);
        resetPasswordtranslateY.setValue(-300);

      Animated.timing(slideUp1, {
        toValue: 0, // move to top
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();

      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      Animated.parallel([
        Animated.timing(cardHeight, {
          toValue: contentHeight, // fallback until measured
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false, // height can't use native driver
        }),
        Animated.timing(slideUp, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (currentScreenIninner === 'signup') {
      setImageLoaded(true);
    }
    if (currentScreenIninner === 'verify') {
      setverifyimageLoaded(true);
    }

    if (currentScreenIninner === 'forgotpassword') {
      Animated.parallel([
        Animated.timing(resetPasswordtranslateY, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        // Animated.timing(resetPasswordopacity, {
        //   toValue: 1,
        //   duration: 1000,
        //   easing: Easing.out(Easing.ease),
        //   useNativeDriver: true,
        // }),
      ]).start();
    Animated.parallel([
        Animated.timing(animatedHeight, {
        toValue: contentHeight,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false, // height animation needs false
        }),
        Animated.timing(slideUp, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
        }),
    ]).start();
      
    }
  }, [currentScreen, contentHeight, currentScreenIninner, photo]);

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

      if (currentScreen === 'login' && currentScreenIninner === 'login') {

        cardHeight.setValue(0);
        slideUp.setValue(100);
        translateY.setValue(-100);
        Animated.parallel([
        Animated.timing(translateY, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }),
        Animated.timing(slideUp, {
            toValue: 0,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }),
        ]).start();
    
        Animated.sequence([
        Animated.timing(cardHeight, {
            toValue: 250, // shrink target
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }),
        Animated.spring(cardHeight, {
            toValue: 255, // overshoot a bit
            friction: 4,
            tension: 120,
            useNativeDriver: false,
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
        cardHeight.stopAnimation();
      };
    }, []),
  );

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
        return 0; // fallback
    }
  })();

  //   API Call Reset Password
 //   Reset Password
  const validateEmail = (text: string) => {
    resetsetUsername(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
    if (text.length === 0) {
      setError('');
    } else if (!emailRegex.test(text)) {
      ToastAndroid.show(
        'Please enter a valid email address',
        ToastAndroid.SHORT,
      );
     
    } else {
      setError('');
    }
  };
 
  const handleSendResetLink = () => {
    //console.log(`Send reset link to ${username}`);
    setShowPopup(true);
  };
 
//login
 
const loginapi = async () => {
  if (!username || !password) {
    ToastAndroid.show("Please fill all required fields", ToastAndroid.SHORT);
    return;
  }
 
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(username)) {
    ToastAndroid.show("Please enter a valid email address", ToastAndroid.SHORT);
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
 
    if (!response.ok) {
      const errorText = await response.text();
      setLoading(false)
      //throw new Error(`Login failed: ${errorText}`);
    }
 
    const result = await response.json();
    console.log('Login response:', JSON.stringify(result, null, 2));
 
    setLoading(false)
    const token = result?.data?.token;
    const user = result?.data?.user;
 
    if (token && user) {
      // Save token & user
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
 
      ToastAndroid.show("Login successful", ToastAndroid.SHORT);
      setUsername('')
      setPassword('')
 
      // Navigate to Home or Dashboard
      //navigation.replace('HomeScreen');
    } else {
      setLoading(false)
      ToastAndroid.show('Invalid user Email or Password', ToastAndroid.SHORT);
      //Alert.alert('Login Failed', 'Invalid credentials or missing token');
    }
  } catch (error: any) {
    setLoading(false)
    console.error('Login error:', error);
    //Alert.alert('Error', error.message || 'Something went wrong');
  }
};
 
 
  //signup
 
  const handleSendOTP = async () => {
  if (!firstName || !lastName || !signUpusername || !signUppassword || !confirmPassword) {
    ToastAndroid.show("Please fill all required fields", ToastAndroid.SHORT);
    return;
  }
 
  if (signUppassword !== confirmPassword) {
    ToastAndroid.show("Passwords do not match", ToastAndroid.SHORT);
    return;
  }
 
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(signUpusername)) {
    ToastAndroid.show("Please enter a valid email address", ToastAndroid.SHORT);
    return;
  }
 
  try {
    const body = {
      firstname: firstName,
      lastname: lastName,
      postal_code: postalCode,
      email: signUpusername,
      password: signUppassword,
      confirmPassword: confirmPassword,
    };
 
    console.log('Request body:', JSON.stringify(body, null, 2));
 
 
    const url = MAIN_URL.baseUrl+'user/user-signup'
 
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
      ToastAndroid.show(data.message, ToastAndroid.SHORT);
 
      await AsyncStorage.setItem('tempUserId', data.data.temp_user_id.toString());
       await AsyncStorage.setItem('otp_id', data.data.otp_id.toString());
       await AsyncStorage.setItem('personal_mail_id',signUpusername.toString())

      setCurrentScreen('login');
      setcurrentScreenIninner('sendOTP');
    } else {
      ToastAndroid.show(data.message || 'Signup failed', ToastAndroid.SHORT);
    }
  } catch (err) {
    console.log('Error sending signup request:', err);
    ToastAndroid.show('Failed to send OTP', ToastAndroid.SHORT);
  }
};
 
 
 
//otp
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
 
 
const otpverify = async () => {
 
 
  const otpValue = otp.join('');
 
  if (otpValue.length < 4 || otp.includes('')) {
    ToastAndroid.show("Please enter all 4 digits of the OTP", ToastAndroid.SHORT);
    return;
  }
  try {
    const otp_id = await AsyncStorage.getItem('otp_id');
 
    if (!otp_id) {
      ToastAndroid.show("OTP ID missing. Please request OTP again.", ToastAndroid.SHORT);
      return;
    }
 
    const url = MAIN_URL.baseUrl+'user/signup-otpverify'
 
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
      await AsyncStorage.setItem('temp_user_id', data.data.temp_user_id.toString());
 
      ToastAndroid.show(data.message, ToastAndroid.SHORT);
 
      setCurrentScreen('login');
      setcurrentScreenIninner('verify');
       setShowOtp(false);
      setverifyimageLoaded(true);
 
    } else {
      ToastAndroid.show(data?.message || 'OTP verification failed', ToastAndroid.SHORT);
    }
  }
  catch (err) {
    console.error(err);
    ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
  }
};
 
 
const handleresend = async () => {
 
 
  setOtp(['', '', '', '']);
  try {
    const tempUserId = await AsyncStorage.getItem('tempUserId');
 
    const url1 = MAIN_URL.baseUrl+'user/resend-otp'
 
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
 
      ToastAndroid.show(data.message, ToastAndroid.SHORT);
 
      await AsyncStorage.setItem(
        'tempUserId',
        data.data.temp_user_id.toString()
      );
 
      await AsyncStorage.setItem('otp_id', data.data.otp_id.toString());
 
      console.log('OTP resent successfully:', data.message);
 
 
    } else {
      console.warn('Resend OTP failed:', data?.message || 'Unknown error');
    }
  } catch (err) {
    console.error('Error resending OTP:', err);
  }
};
 
//verify and otp
 
const [verifyusername, setverifyUsername] = useState<string>('');
 
 
const [otp1, setOtp1] = useState(['', '', '', '']);
const verifyinputs = useRef<(TextInput | null)[]>([]);
 
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
  if (!verifyusername) {
    ToastAndroid.show("Please fill all required fields", ToastAndroid.SHORT);
    return;
  }
 
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(verifyusername)) {
    ToastAndroid.show("Please enter a valid email address", ToastAndroid.SHORT);
    return;
  }
 
  try {
 
    const url = MAIN_URL.baseUrl+'user/student-email'
 
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_email: verifyusername,
        temp_user_id: Number(await AsyncStorage.getItem('temp_user_id')) || undefined
      }),
    });
 
    const data = await res.json();
    console.log('Send OTP Response:', data);
 
    if (data?.statusCode === 200) {
      await AsyncStorage.setItem('temp_user_id', data.data.temp_user_id.toString());
      await AsyncStorage.setItem('otp_id', data.data.otp_id.toString());
      await AsyncStorage.setItem('signupUsername', verifyusername);
 
      ToastAndroid.show(data.message, ToastAndroid.SHORT);
      setShowOtp(true);
      //startAnimation();
    } else {
      ToastAndroid.show(data?.message || 'Failed to send OTP', ToastAndroid.SHORT);
    }
  } catch (err) {
    console.error('Error sending OTP:', err);
    ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
  }
};
 
 
  const submitotp = async () => {
  const otpValue = otp1.join('');
 
  if (otpValue.length < 4 || otp1.includes('')) {
    ToastAndroid.show("Please enter all 4 digits of the OTP", ToastAndroid.SHORT);
    return;
  }
 
  try {
    const otp_id = await AsyncStorage.getItem('otp_id');
    if (!otp_id) {
      ToastAndroid.show("OTP ID missing. Please request OTP again.", ToastAndroid.SHORT);
      return;
    }
   
    const url = MAIN_URL.baseUrl+'user/student-otpverify'
 
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
      ToastAndroid.show(data.message, ToastAndroid.SHORT);
 
      if (data?.data) {
        await AsyncStorage.setItem('user_email', data.data.email || '');
        await AsyncStorage.setItem('firstname', data.data.firstname || '');
        await AsyncStorage.setItem('lastname', data.data.lastname || '');
        await AsyncStorage.setItem('student_email', data.data.student_email || '');
 
        if (data?.data?.token?.access_token) {
          await AsyncStorage.setItem('access_token', data.data.token.access_token);
        }
      }
 
      setCurrentScreen('login');
      setcurrentScreenIninner('profile');
 
     
    } else {
      ToastAndroid.show(data?.message || 'OTP verification failed', ToastAndroid.SHORT);
    }
  } catch (err) {
    console.error('Error verifying OTP:', err);
    ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
  }
};
 
const resubmitotp = async () =>{
try {
 
    const url = MAIN_URL.baseUrl+'user/student-email'
 
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_email: verifyusername,
        temp_user_id: Number(await AsyncStorage.getItem('temp_user_id')) || undefined
      }),
    });
 
    const data = await res.json();
    console.log('Send OTP Response:', data);
 
    if (data?.statusCode === 200) {
      await AsyncStorage.setItem('temp_user_id', data.data.temp_user_id.toString());
      await AsyncStorage.setItem('otp_id', data.data.otp_id.toString());
     // await AsyncStorage.setItem('signupUsername', username);
 
      ToastAndroid.show(data.message, ToastAndroid.SHORT);
      setShowOtp(true);
      //startAnimation();
    } else {
      ToastAndroid.show(data?.message || 'Failed to send OTP', ToastAndroid.SHORT);
    }
  } catch (err) {
    console.error('Error sending OTP:', err);
    ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
  }
}
//profile
 
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


//   End Api Call Reset Password






// Animations
const loginTranslateY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
const ClickFPGoBack_slideOutToTop = (onFinish?: () => void) => {
  Animated.timing(resetPasswordtranslateY, {
    toValue: -Dimensions.get('window').height, // slide up out of screen
    duration: 1000,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  }).start(() => {
    if (onFinish) onFinish();
  });

  Animated.timing(loginTranslateY, {
      toValue: 0, // slide into place
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
}).start();
};

const goToForgotPassword = () => {
  Animated.timing(loginTranslateY, {
    toValue: Dimensions.get('window').height, // slide down off screen
    duration: 1000,
    easing: Easing.in(Easing.ease),
    useNativeDriver: true,
  }).start(() => {
    // after animation completes, switch screen
    setcurrentScreenIninner('forgotpassword');
  });
};


  return (
    <ImageBackground
      source={require('../../../assets/images/BGAnimationScreen.png')}
      style={Styles.container}
      resizeMode="cover"
    >
      <BackgroundAnimation/>
      {currentScreen === 'hello' && (
        <View style={Styles.ScreenLayout}>
          <Animated.View
            style={[{ transform: [{ translateY: unizyTranslateY }] }]}
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
            <Text style={Styles.unizyText}>UniZy</Text>
            <View style={Styles.emptyView}></View>
          </Animated.View>

          <Animated.Text
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
            <TouchableOpacity onPress={() => setCurrentScreen('language')}>
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
                  <Text style={Styles.selectlanguageText}>Select Language</Text>
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
          <View style={{ height: '100%', padding: 16, paddingTop: 30 }}>
            <Animated.View
              style={[
                selectlang_styles.container,
                { transform: [{ translateY: slideUp1 }] },
              ]}
            >
              <Text style={selectlang_styles.title}>Select Language</Text>

              <View style={selectlang_styles.search_container}>
                <Image
                  source={require('../../../assets/images/SearchIcon.png')}
                  style={selectlang_styles.searchIcon}
                />
                <TextInput
                  style={selectlang_styles.searchBar}
                  placeholder="Search"
                  placeholderTextColor="#ccc"
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
                    onPress={() => 
                    handleLanguageSelect(item)
                    }>
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
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={item.flag} style={selectlang_styles.flag} />
                            <Text style={selectlang_styles.languageText}>{item.name}</Text>
                        </View>
                        <View>
                            <View style={selectlang_styles.radioButton_round}>
                            <View
                                style={[
                                selectlang_styles.radioButton,
                                selected === item.code && selectlang_styles.radioButtonSelected,
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
          {/* {currentScreenIninner === 'login' && (
            <Animated.View
              style={[
                Styles.NewtopHeader,
                { transform: [{ translateY: translateY }]},
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  setCurrentScreen('language');
                }}
              >
                <View style={[Styles.backIconRow,{}]}>
                  <Image
                    source={require('../../../assets/images/back.png')}
                    style={{ height: 24, width: 24 }}
                  />
                </View>
              </TouchableOpacity>
              <Text style={Styles.unizyText}>UniZy</Text>
              <View style={Styles.emptyView}></View>
            </Animated.View>
          )}

          {currentScreenIninner !== 'login' && (
            <Animated.View
              style={[
                Styles.NewtopHeader,
                // { transform: [{ translateY: translateY }] },
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  setCurrentScreen('language');
                }}
              >
                <View style={[Styles.backIconRow, { display: 'none' }]}>
                  <Image
                    source={require('../../../assets/images/back.png')}
                    style={{ height: 24, width: 24 }}
                  />
                </View>
              </TouchableOpacity>
              <Text style={Styles.notLoginScreenHeader}>UniZy</Text>
              <View style={[Styles.emptyView, { display: 'none' }]}></View>
            </Animated.View>
          )} */}
 <Animated.View
              style={[
                Styles.NewtopHeader,
                { transform: [{ translateY: translateY }]},
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  setCurrentScreen('language');
                }}
              >
                <View style={[Styles.backIconRow,{}]}>
                  <Image
                    source={require('../../../assets/images/back.png')}
                    style={{ height: 24, width: 24 }}
                  />
                </View>
              </TouchableOpacity>
              <Text style={Styles.unizyText}>UniZy</Text>
              <View style={Styles.emptyView}></View>
            </Animated.View>
          <View style={{ width: '100%', paddingLeft: 16, paddingRight: 16 }}>
            <Animated.View
              style={[Styles.cardView, { minHeight: contentHeight }]}
            >
              <View
                // onLayout={e => {
                //         const { height } = e.nativeEvent.layout;
                //         setContentHeight(height); 
                //     }}
                
              >
                {/* Show Login Screen */}
                {currentScreenIninner === 'login' && (
                  <>
                    <Animated.View
                    //   style={{ transform: [{ translateY: loginTranslateY }] }}
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
                          style={Styles.personalEmailID_TextInput}
                          placeholder={'Personal Email ID'}
                          placeholderTextColor={'rgba(255, 255, 255, 0.48)'}
                          value={username}
                          onChangeText={usernameText =>
                            setUsername(usernameText)
                          }
                        />
                      </View>

                      <View style={Styles.password_container}>
                        <TextInput
                          style={Styles.password_TextInput}
                          placeholder={'Password'}
                          placeholderTextColor={'rgba(255, 255, 255, 0.48)'}
                          value={password}
                          onChangeText={passwordText =>
                            setPassword(passwordText)
                          }
                        />
                        <Image
                          source={require('../../../assets/images/eyeopen.png')}
                          style={Styles.eyeIcon}
                        />
                      </View>

                      <Text
                        style={Styles.forgetPasswordText}
                        onPress={() => {
                            goToForgotPassword;
                          setCurrentScreen('login');
                          setcurrentScreenIninner('forgotpassword');
                        }}
                      >
                        Forgot Password?
                      </Text>

                      <TouchableOpacity
                        style={Styles.loginButton}
                        onPress={loginapi}
                      >
                        <Text style={Styles.loginText}>Login</Text>
                      </TouchableOpacity>

                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <Text
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
                            setCurrentScreen('login');
                            setcurrentScreenIninner('signup');
                          }}
                        >
                          <Text style={Styles.signupText}>Sign up</Text>
                        </TouchableOpacity>
                       
                      </View>

                      
                      
                    </Animated.View>
                  </>
                )}

                {currentScreenIninner ===
                  ('forgotpassword' as typeof currentScreenIninner) && (
                  <>
                    <View style={{ width: '100%' }}>
                      <Animated.View style={[{ gap: 10 }, { transform: [{ translateY: resetPasswordtranslateY }] }]}>
                        <Text style={Styles.resetTitle}>Reset Password</Text>
                        <View style={Styles.privacyContainer}>
                          <Text style={Styles.termsText}>
                            Enter your personal email address and we’ll send you
                            a link to reset your password
                          </Text>
                        </View>

                        <View style={Styles.login_container}>
                          <TextInput
                            style={[
                              Styles.personalEmailID_TextInput,
                              { color: '#fff' },
                            ]}
                            placeholder="Personal Email ID"
                            placeholderTextColor="rgba(255, 255, 255, 0.48)"
                            value={resetusername}
                            maxLength={50}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            onChangeText={validateEmail}
                          />
                        </View>

                        <TouchableOpacity
                          style={Styles.loginButton}
                          onPress={() => {
                            handleSendResetLink();
                            setShowPopup(true);
                          }}
                        >
                          <Text style={Styles.loginText}>Send Reset Link</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            ClickFPGoBack_slideOutToTop(() => {
                                setCurrentScreen('login');
                                setcurrentScreenIninner('login');
                                resetPasswordtranslateY.setValue(0); // reset for next time
                            });
                          }}
                        >
                          <Text style={Styles.goBackText}>Go back</Text>
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
                            blurAmount={1000}
                            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
                          >
                            <View
                              style={[
                                StyleSheet.absoluteFill,
                                { backgroundColor: 'rgba(0, 0, 0, 0.32)' },
                              ]}
                            />

                            <View style={[Styles.popupContainer,{width: width * 0.85}]}>
                              <Image
                                source={require('../../../assets/images/success_icon.png')}
                                style={Styles.logo}
                                resizeMode="contain"
                              />
                              <Text style={Styles.termsText1}>
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
                                <Text style={Styles.loginText}>
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
                        { width: '100%', alignItems: 'center' },
                        {
                           // transform: [{ translateY: slideAnim }],
                            //transform: [{ translateY: translateY }],
                            //opacity,
                        },
                      ]}
                    >
                      <View style={Styles.nameRow}>
                        <View style={Styles.login_container1}>
                          <TextInput
                            style={Styles.personalEmailID_TextInput1}
                            placeholder="First Name"
                            placeholderTextColor="rgba(255, 255, 255, 0.48)"
                            value={firstName}
                            onChangeText={text =>
                              /^[A-Za-z ]*$/.test(text) && setFirstName(text)
                            }
                            maxLength={20}
                          />
                        </View>

                        <View style={Styles.login_container1}>
                          <TextInput
                            style={Styles.personalEmailID_TextInput1}
                            placeholder="Last Name"
                            placeholderTextColor="rgba(255, 255, 255, 0.48)"
                            value={lastName}
                            onChangeText={text =>
                              /^[A-Za-z ]*$/.test(text) && setLastName(text)
                            }
                          />
                        </View>
                      </View>

                      <View style={Styles.login_container}>
                        <TextInput
                          style={Styles.personalEmailID_TextInput}
                          placeholder="Postal Code"
                          placeholderTextColor="rgba(255, 255, 255, 0.48)"
                          value={postalCode}
                          maxLength={6}
                          //keyboardType="numeric"
                          onChangeText={text => {
                          const alphanumericText = text.replace(/[^a-zA-Z0-9]/g, '');
                            setPostalCode(alphanumericText);
                          }}
                        />
                      </View>

                      <View style={Styles.password_container}>
                        <TextInput
                          style={Styles.password_TextInput}
                          placeholder="Personal Email ID"
                          placeholderTextColor="rgba(255, 255, 255, 0.48)"
                          value={signUpusername}
                          maxLength={20}
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
                          <Text style={Styles.infoText}>
                            Important: Use your personal email address for
                            signup. Your university email will be requested
                            separately for student verification.
                          </Text>
                        </View>
                      )}

                      <View style={Styles.password_container}>
                        <TextInput
                          style={Styles.password_TextInput}
                          placeholder="Create Password"
                          placeholderTextColor="rgba(255, 255, 255, 0.48)"
                          value={signUppassword}
                          onChangeText={setsignUpPassword}
                          secureTextEntry={!issignUpPasswordVisible}
                        />

                        <TouchableOpacity
                          onPress={() =>
                            setsignUpIsPasswordVisible(!issignUpPasswordVisible)
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
                          style={[Styles.password_TextInput, { color: '#fff' }]}
                          placeholder="Confirm Password"
                          placeholderTextColor="rgba(255, 255, 255, 0.48)"
                          value={confirmPassword}
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
                              isPasswordVisible
                                ? Styles.eyeIcon
                                : Styles.eyeCross,
                            ]}
                          />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        onPress={
                          //setCurrentScreen('login');
                          //setcurrentScreenIninner('sendOTP');
                          handleSendOTP
                        }
                        style={Styles.loginButton}
                      >
                        <Text style={Styles.loginText}>Send OTP</Text>
                      </TouchableOpacity>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginTop: 16,
                        }}
                      >
                        <Text style={Styles.signupPrompt}>
                          Already have an account?{' '}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            {
                              setCurrentScreen('login');
                              setcurrentScreenIninner('login');
                            }
                          }}
                        >
                          <Text style={Styles.signupPrompt1}>Login</Text>
                        </TouchableOpacity>
                      </View>
                      {/* </Animated.View> */}

                      <Animated.View
                        style={[
                          { width: '100%', alignItems: 'center' },
                          { transform: [{ translateY: slideAnim }], opacity },
                        ]}
                      >
                        <View style={Styles.nameRow}>
                          <View style={Styles.login_container1}>
                            <TextInput
                              style={Styles.personalEmailID_TextInput1}
                              placeholder="First Name"
                              placeholderTextColor="rgba(255, 255, 255, 0.48)"
                              value={firstName}
                              onChangeText={text =>
                                /^[A-Za-z ]*$/.test(text) && setFirstName(text)
                              }
                              maxLength={20}
                            />
                          </View>

                          <View style={Styles.login_container1}>
                            <TextInput
                              style={Styles.personalEmailID_TextInput1}
                              placeholder="Last Name"
                              placeholderTextColor="rgba(255, 255, 255, 0.48)"
                              value={lastName}
                              onChangeText={text =>
                                /^[A-Za-z ]*$/.test(text) && setLastName(text)
                              }
                            />
                          </View>
                        </View>

                        <View style={Styles.login_container}>
                          <TextInput
                            style={Styles.personalEmailID_TextInput}
                            placeholder="Postal Code"
                            placeholderTextColor="rgba(255, 255, 255, 0.48)"
                            value={postalCode}
                            maxLength={6}
                          //keyboardType="numeric"
                          onChangeText={text => {
                          const alphanumericText = text.replace(/[^a-zA-Z0-9]/g, '');
                            setPostalCode(alphanumericText);
                          }}
                          />
                        </View>

                        <View style={Styles.password_container}>
                          <TextInput
                            style={Styles.password_TextInput}
                            placeholder="Personal Email ID"
                            placeholderTextColor="rgba(255, 255, 255, 0.48)"
                            value={username}
                            maxLength={20}
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
                            <Text style={Styles.infoText}>
                              Important: Use your personal email address for
                              signup. Your university email will be requested
                              separately for student verification.
                            </Text>
                          </View>
                        )}

                        <View style={Styles.password_container}>
                        <TextInput
                          style={Styles.password_TextInput}
                          placeholder="Create Password"
                          placeholderTextColor="rgba(255, 255, 255, 0.48)"
                          value={signUppassword}
                          onChangeText={setsignUpPassword}
                          secureTextEntry={!issignUpPasswordVisible}
                        />

                        <TouchableOpacity
                          onPress={() =>
                            setsignUpIsPasswordVisible(!issignUpPasswordVisible)
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
                            style={[
                              Styles.password_TextInput,
                              { color: '#fff' },
                            ]}
                            placeholder="Confirm Password"
                            placeholderTextColor="rgba(255, 255, 255, 0.48)"
                            value={confirmPassword}
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
                                isPasswordVisible
                                  ? Styles.eyeIcon
                                  : Styles.eyeCross,
                              ]}
                            />
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                          // onPress={handleSendOTP}
                          style={Styles.loginButton}
                        >
                          <Text style={Styles.loginText}>Send OTP</Text>
                        </TouchableOpacity>

                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: 16,
                          }}
                        >
                          <Text style={Styles.signupPrompt}>
                            Already have an account?{' '}
                          </Text>
                          <TouchableOpacity
                          //  onPress={handleLogin}
                          >
                            <Text style={Styles.signupPrompt1}>Login</Text>
                          </TouchableOpacity>
                        </View>
                      </Animated.View>

                      <View
                        style={{
                          width: '90%',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          flex: 1,
                          paddingBottom: 30,
                        }}
                      >
                        <View style={Styles.teamsandConditionContainer}>
                          <Text style={Styles.bycountuningAgreementText}>
                            By continuing, you agree to our
                          </Text>
                          <Text style={Styles.teamsandConditionText}>
                            Terms & Conditions
                          </Text>
                        </View>

                        <View style={Styles.teamsandConditionContainer}>
                          <Text style={Styles.bycountuningAgreementText}>
                            and
                          </Text>
                          <Text style={Styles.teamsandConditionText}>
                            Privacy Policy
                          </Text>
                        </View>
                      </View>
                    </Animated.View>
                  </>
                )}
                {currentScreenIninner ===
                  ('sendOTP' as typeof currentScreenIninner) && (
                  <>
                    {imageLoaded && (
                      //       <Animated.View
                      //   style={[
                      //     styles.formContainer,
                      //     {
                      //       overflow: "hidden",
                      //       height: isExpanded ? "auto" : containerHeight, // 👈 switch after animation
                      //     },
                      //   ]}
                      // >
                      <Animated.View
                        style={
                          [
                            // Styles.sendOtpformContainer,
                            // { height: animatedHeight }
                          ]
                        }
                      >
                        <Animated.View
                        //    style={[
                        //   { width: '100%', alignItems: 'center' },
                        //   { transform: [{ translateY: slideAnim }], opacity },
                        // ]}
                        >
                          <Text style={Styles.sendOtpresetTitle}>
                            Verify Personal Email ID
                          </Text>
                          <View style={Styles.sendOtpprivacyContainer}>
                            <Text style={Styles.termsText}>
                              We have sent a 4-digit code to{' '}
                              <Text style={Styles.sendOtpresendText2}>{signUpusername}</Text>
                            </Text>
                          </View>

                          <View style={Styles.sendOtpotpContainer}>
                            {[0, 1, 2, 3].map((_, index) => (
                              <TextInput
                                key={index}
                                ref={(ref) => {
                                  inputs.current[index] = ref; 
                                }}
                                style={Styles.sendOtpotpBox}
                                keyboardType="number-pad"
                                maxLength={1}
                                onChangeText={(text) => {
                                const digit = text.replace(/[^0-9]/g, '');
                                  handleChange(digit, index);
                                }}
                                value={otp[index]}
                                returnKeyType="next"
                                textAlign="center"
                                secureTextEntry
                              />
                            ))}
                          </View>

                          <TouchableOpacity
                            style={Styles.sendOtploginButton}
                            onPress={otpverify}
                          >
                            <Text style={Styles.loginText}>
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
                            <Text style={Styles.sendOtpresendText}>
                              Didn’t receive a code?{' '}
                            </Text>
                            <TouchableOpacity onPress={handleresend}>
                                <Text style={Styles.sendOtpresendText1}>
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
                            <Text style={Styles.sendOtpgoBackText}>
                              Entered wrong email?{' '}
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                setCurrentScreen('login');
                                setcurrentScreenIninner('signup');
                              }}
                            >
                              <Text style={Styles.sendOtpgoBackText1}>
                                Go back
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </Animated.View>
                      </Animated.View>
                    )}
                  </>
                )}

                {currentScreenIninner ===
                  ('verify' as typeof currentScreenIninner) && (
                  <>
                    {verifyimageLoaded && !showOtp && (
                      // <Animated.View
                      //   style={[
                      //     styles.formContainer,
                      //     {
                      //       overflow: "hidden",
                      //       height: isExpanded ? "auto" : containerHeight, // 👈 switch after animation
                      //     },
                      //   ]}
                      // >
                      <Animated.View
                        style={
                          [
                            // Styles.verifyformContainer,
                            //    { height: animatedHeight }
                          ]
                        }
                      >
                        <Animated.View
                          style={
                            [
                              // { width: '100%', alignItems: 'center' },
                              // { transform: [{ translateY: slideAnim }], opacity },
                            ]
                          }
                        >
                          <Text style={Styles.verifyresetTitle}>
                            Verify University Email ID
                          </Text>
                          <View style={Styles.verifylogin_container}>
                            <TextInput
                              style={Styles.verifypersonalEmailID_TextInput}
                              placeholder={'University Email ID'}
                              placeholderTextColor={'rgba(255, 255, 255, 0.48)'}
                              value={verifyusername}
                              maxLength={50}
                              keyboardType="email-address"
                              autoCapitalize="none"
                              autoCorrect={false}
                              onChangeText={usernameText => setverifyUsername(usernameText)}
                            />
                          </View>

                          <TouchableOpacity
                            style={Styles.verifyloginButton}
                            onPress={verifyOTP}
                          >
                            <Text style={Styles.loginText}>Send OTP</Text>
                          </TouchableOpacity>
                        </Animated.View>
                      </Animated.View>
                    )}

                    {showOtp && (
                      <Animated.View
                        style={
                          [
                            // Styles.verifyformContainer,
                            // { height: animatedHeight1 }
                          ]
                        }
                      >
                        <Animated.View
                          style={[
                            { width: '100%', alignItems: 'center' },
                            { transform: [{ translateY: translateY }] },
                          ]}
                        >
                          <Text style={Styles.verifyresetTitle}>
                            Verify University Email ID
                          </Text>

                          <View style={Styles.verifyprivacyContainer}>
                            <Text style={Styles.verifytermsText}>
                              We have sent a 4-digit code to{' '}
                              <Text style={Styles.resendText2}>{verifyusername}</Text>
                            </Text>
                          </View>

                          <View style={Styles.verifyotpContainer}>
                            {[0, 1, 2, 3].map((_, index) => (
                              <TextInput
                                key={index}
                                ref={(ref) => {
                                  verifyinputs.current[index] = ref;
                                }}
                                style={Styles.verifyotpBox}
                                keyboardType="number-pad"
                                maxLength={1}
                                onChangeText={(text) => {
                                  const digit = text.replace(/[^0-9]/g, '');
                                  veryfyhandleChange(digit, index);
                                }}
                                value={otp1[index]}  
                                returnKeyType="next"
                                textAlign="center"
                                secureTextEntry={true}
                              />
                            ))}
                          </View>

                          <TouchableOpacity
                            style={Styles.verifyloginButton1}
                            onPress={submitotp}>
                            <Text style={Styles.loginText}>
                              Verify & Continue
                            </Text>
                          </TouchableOpacity>

                          <View
                            style={{ flexDirection: 'row', marginTop: 6 }}
                          >
                            <Text style={Styles.verifyresendText}>
                              Didn’t receive a code?{' '}
                            </Text>
                            <TouchableOpacity onPress={resubmitotp}>
                                <Text style={Styles.verifyresendText1}>
                                Resend Code
                                </Text>
                            </TouchableOpacity>
                          </View>

                          <TouchableOpacity
                            style={{ flexDirection: 'row', marginTop: 6 }}
                          >
                            <Text style={Styles.goBackText}>
                              Entered wrong email?{' '}
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                // handleSendOTP
                                setCurrentScreen('login');
                                setcurrentScreenIninner('sendOTP');
                              }}
                            >
                              <Text style={Styles.verifygoBackText1}>
                                Go back
                              </Text>
                            </TouchableOpacity>
                          </TouchableOpacity>
                        </Animated.View>
                      </Animated.View>
                    )}
                  </>
                )}

                {currentScreenIninner ===
                  ('profile' as typeof currentScreenIninner) && (
                  <>
                    {imageLoaded && (
                      // <Animated.View
                      //   style={[
                      //     styles.formContainer,
                      //     {
                      //       overflow: "hidden",
                      //       height: isExpanded ? "auto" : containerHeight, // 👈 switch after animation
                      //     },
                      //   ]}
                      // >
                      <Animated.View
                        style={
                          [
                            // Styles.profileformContainer,
                            //   { height: animatedHeight }
                          ]
                        }
                      >
                        <Animated.View
                          style={
                            [
                              //   { width: '100%', alignItems: 'center' },
                              //   { transform: [{ translateY: slideAnim }], opacity },
                            ]
                          }
                        >
                          <Text style={Styles.profileprofileresetTitle}>
                            Add a photo
                          </Text>
                          <View style={Styles.profileprivacyContainer}>
                            <Text style={Styles.profiletermsText}>
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
                                onPress={handleSelectImage}>
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
                              setShowPopup(true);
                            }}
                          >
                            <Text style={Styles.profileloginText}>
                              Continue
                            </Text>
                          </TouchableOpacity>

                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginTop: 16,
                            }}
                          >
                            <Text style={Styles.profilesignupPrompt}>
                              Want to do it later?{' '}
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                // handleLogin
                              }}
                            >
                              <Text style={Styles.profilesignupPrompt1}>
                                Skip
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </Animated.View>
                      </Animated.View>
                    )}

                    <Modal
                      visible={showPopup}
                      transparent
                      animationType="fade"
                      onRequestClose={closePopup}
                    >
                      <View style={Styles.profileoverlay}>
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

                        <View style={[Styles.profilepopupContainer,{width: width * 0.85}]}>
                          <Image
                            source={require('../../../assets/images/success_icon.png')}
                            style={Styles.profilelogo1}
                            resizeMode="contain"
                          />
                          <Text style={Styles.profiletermsText2}>
                            Account Created Successfully!
                          </Text>
                          <Text style={Styles.profiletermsText1}>
                            Welcome to Unizy! Your account has been created and
                            your’re all set to start exploring
                          </Text>
                          <TouchableOpacity
                            style={Styles.profileloginButton}
                            onPress={() => {
                              setCurrentScreen('login');
                              setcurrentScreenIninner('login');
                              closePopup();
                            }}
                          >
                            <Text style={Styles.profileloginText}>
                              Start Exploring
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>
                  </>
                )}
              </View>
            </Animated.View>
            {/* Indecator */}
            {currentScreenIninner !== ('login' as typeof currentScreenIninner) 
            &&currentScreenIninner !== ('forgotpassword' as typeof currentScreenIninner)&& (
              <View style={Styles.stepIndicatorContainer}>
                {[0, 1, 2, 3].map(index =>
                  index === stepIndex ? (
                    <LinearGradient
                      key={index}
                      colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0.5)']}
                      style={Styles.stepCircle}
                    />
                  ) : (
                    <View
                      key={index}
                      style={[Styles.stepCircle, Styles.inactiveStepCircle]}
                    />
                  ),
                )}
              </View>
            )}
            {/* Teams and codition */}
     
          
            
        </View>
        {currentScreenIninner === ('login' as typeof currentScreenIninner) ||
        currentScreenIninner === ('forgotpassword' as typeof currentScreenIninner) && (
               <Animated.View
                    style={[
                        {
                        position: 'absolute',
                        bottom: 20, // adjust spacing
                        left: 0,
                        right: 0,
                        alignItems: 'center',
                        transform: [{  translateY:  slideUp }],
                        },
                    ]}
                >
                    <View style={Styles.teamsandConditionContainer}>
                    <Text style={Styles.bycountuningAgreementText}>
                        By continuing, you agree to our
                    </Text>
                    <Text style={Styles.teamsandConditionText}>
                        Terms & Conditions
                    </Text>
                    </View>
            
                    <View style={Styles.teamsandConditionContainer}>
                    <Text style={Styles.bycountuningAgreementText}>and</Text>
                    <Text style={Styles.teamsandConditionText}>Privacy Policy</Text>
                    </View>
                </Animated.View>
            )}
          
        </>
      )}
    </ImageBackground>
  );
};

export default SinglePage;