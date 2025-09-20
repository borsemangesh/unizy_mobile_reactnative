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
  KeyboardAvoidingView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Styles } from './SinglePage.style';
import { selectlang_styles } from '../SelectLanguage/SelectLanguage.style';
import { getRequest } from '../../utils/API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { showToast } from '../../utils/toast';
import BackgroundAnimation from '../Hello/BackgroundAnimation';
import { Language } from '../../utils/Language';
import { greetings } from '../../utils/Greetings';
import { Constant } from '../../utils/Constant';
import BackgroundAnimation_Android from '../Hello/BackgroundAnimation_Android';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



const { height } = Dimensions.get('window');

type SinglePageProps = {
  navigation: any;
};

const SinglePage = ({navigation}:SinglePageProps) => {
  const [currentScreen, setCurrentScreen] = useState<
    'hello' | 'language' | 'login'
  >('hello');

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
    zh: require('../../../assets/images/china.png'),
    // add others as needed
  };

  const filteredLanguages = languages
    .map(lang => ({
      id: lang.id,
      code: lang.iso_code,
      name: lang.language_name,
      flag:
        flagMap[lang.iso_code] || require('../../../assets/images/english.png'),
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
        JSON.stringify({id: item.id, code: item.code, name: item.name })
      );
      setSelected(item.code);
      Animated.timing(loginunizyTranslateY, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setTextandBackIcon(true);
        setCurrentScreen('login');
        setcurrentScreenIninner('login');
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
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const { width ,height} = Dimensions.get('window');

  const screenHeight = Dimensions.get('window').height;

  // Animations
  const opacity = React.useRef(new Animated.Value(0)).current;

  const [slideUp1] = useState(new Animated.Value(height + 500));

  const [imageLoaded, setImageLoaded] = useState(false);
  const [verifyimageLoaded, setverifyimageLoaded] = useState(false);

  const [showPopup, setShowPopup] = useState(false);

  const resetPasswordtranslateY = React.useRef(new Animated.Value(-300),).current;
  const setOTPTranslatY = React.useRef(new Animated.Value(height)).current;
  const verifyAndContinyTranslateY1 = React.useRef(new Animated.Value(0)).current;
  const verifyAndContinyTranslateY2 = useRef(new Animated.Value(-100)).current;
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
  resetPasswordtranslateY.setValue(0);
  setOTPTranslatY.setValue(Dimensions.get('window').height);
  verifyAndContinyTranslateY1.setValue(-300);
  verifyAndContinyTranslateY2.setValue(-100);
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
    if (currentScreen === 'hello') {
      animateGreeting();
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
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      Animated.parallel([

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

      Animated.timing(signupTranslateY, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
    if (currentScreenIninner === 'profile') {
     
      Animated.timing(profileTranslateY, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
    if (currentScreenIninner === 'verify') {
      setverifyimageLoaded(true);

      Animated.parallel([
        Animated.timing(verifyAndContinyTranslateY1, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
      Animated.parallel([
        Animated.timing(verifyAndContinyTranslateY2, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
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
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (currentScreenIninner === 'forgotpassword') {
      Animated.parallel([
        Animated.timing(resetPasswordtranslateY, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.ease),
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

      if (currentScreen === 'login' && currentScreenIninner === 'login' || currentScreenIninner === 'signup') {

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
    if (!username1) {
      showToast(Constant.REQUIRED_ALL_FIELDS, 'error');
      return;
    }
   
   
    const emailRegex = /^[^\s@]+@(?!(?:[^\s@]+\.)?(?:ac\.uk|edu)$)[^\s@]+\.[^\s@]+$/i;
  
    if (!emailRegex.test(username1)) {
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
        setUsername1('')
      } else {
        showToast(data.message || Constant.SOMTHING_WENT_WRONG, 'error');
      }
     
    } catch (error) {
      console.error("Error sending reset link:", error);
      showToast(Constant.NETWORK_ERROR_PLEASE_TRY_AGAIN, 'error');
    }
  };

  const loginapi = async () => {
    // navigation.replace('Dashboard');
    if (!username || !password) {
      showToast(Constant.REQUIRED_ALL_FIELDS, 'error');
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
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
        showToast(result?.message || Constant.INVALID_EMAIL_OR_PASSWORD, 'error');
        return;
      }
 
      const token = result?.data?.token;
      const user = result?.data?.user;
  
      if (token && user) {
        setLoading(false)
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
  
        showToast(result?.message || Constant.LOGIN_SUCCESSFUL, 'success'); 
  
        setUsername('');
        setPassword('');
        setIsPasswordVisible(false)
        setTextandBackIcon(false);
        navigation.replace('Dashboard');
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

    setOtp(['','','','']);

    if (!firstName || !lastName || !signUpusername || !signUppassword || !confirmPassword) {
      showToast(Constant.REQUIRED_ALL_FIELDS , 'error');
      return;
    }
    
    if (postalCode.length < 5) {
      showToast("Postal code must be at least 5 characters long.", 'error');
      return;
    }
     const passwordRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(signUppassword)) {
      showToast('Min 8 chars: upper, lower, number, symbol.','error')
    return;
    
    }
    if (signUppassword !== confirmPassword) {
      showToast(Constant.PASSWORDS_DO_NOT_MATCH,'error'); 
      return;
    }

    const emailRegex = /^[^\s@]+@(?!(?:[^\s@]+\.)?(?:ac\.uk|edu)$)[^\s@]+\.[^\s@]+$/i;    
    if (!emailRegex.test(signUpusername)) {
      showToast(Constant.VALID_EMAI_LADDRESS, 'error');
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
        showToast(data.message, 'success');

        await AsyncStorage.setItem('tempUserId', data.data.temp_user_id.toString());
         await AsyncStorage.setItem('otp_id', data.data.otp_id.toString());
         await AsyncStorage.setItem('personal_mail_id',signUpusername.toString())

        // setCurrentScreen('login');
        // setcurrentScreenIninner('sendOTP');
       Animated.timing(loginTranslateY, {
          toValue: Dimensions.get('window').height,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          setCurrentScreen('login');
          setcurrentScreenIninner('sendOTP');
        });
        
        Animated.timing(signupTranslateY, {
          toValue: Dimensions.get('window').height,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(() => {


          // Slide SendOTP screen from top into view
          setOTPTranslatY.setValue(-Dimensions.get('window').height ); // reset position
          
        
          Animated.timing(setOTPTranslatY, {
            toValue: 0,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
            setCurrentScreen('login');
            setcurrentScreenIninner('sendOTP');
          });

        });
      } else {
        showToast(data.message || 'Signup failed', 'error')
      }
    } catch (err) {
      console.log('Error sending signup request:', err);
      showToast(Constant.FAIL_TO_SEND_OTP, 'error');
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

        showToast(data.message, 'success');


        setFirstName('')
        setLastName('')
        setConfirmPassword('')
        setPostalCode('')
        setsignUpUsername('')
        setsignUpPassword('')
        setsignUpIsPasswordVisible(false)
        setIsConfirmPasswordVisible(false)

         
        Animated.timing(setOTPTranslatY, {
          toValue: Dimensions.get('window').height, 
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          
        });
    
        Animated.timing(loginTranslateY, {
          toValue: Dimensions.get('window').height, 
          duration: 1000,
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
    }
    catch (err) {
      console.error(err);
      showToast(Constant.SOMTHING_WENT_WRONG, 'error');
    }
  };


  const handleresend = async () => {


    setOtp(['', '', '', '']);
    try {
      const tempUserId = await AsyncStorage.getItem('tempUserId');

      const url1 = MAIN_URL.baseUrl + 'user/resend-otp'

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
          data.data.temp_user_id.toString()
        );

        await AsyncStorage.setItem('otp_id', data.data.otp_id.toString());

        console.log('OTP resent successfully:', data.message);
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

    setOtp1(['','','','']);
    if (!verifyusername) {
      showToast(Constant.REQUIRED_ALL_FIELDS, 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@(?:[^\s@]+\.)*ac\.uk$/i;
    if (!emailRegex.test(verifyusername)) {
      showToast(Constant.VALID_EMAI_LADDRESS, 'error');
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

        showToast(data.message, 'success');
        // setShowOtp(true);
        //startAnimation();

        Animated.timing(verifyAndContinyTranslateY1, {
          toValue: Dimensions.get('window').height, // move down off screen
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          setShowOtp(true); // now show OTP view
    
          // Immediately reset OTP position above screen
          verifyAndContinyTranslateY2.setValue(-100);
          
    
          // Slide in OTP form (from top to 0)
          Animated.timing(verifyAndContinyTranslateY2, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start();
        });
      } else {
        showToast(data?.message || 'Failed to send OTP', 'error');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      showToast(Constant.SOMTHING_WENT_WRONG,'error');
    }
  };


  const submitotp = async () => {

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
        showToast(data.message, 'success');

        if (data?.data) {
          await AsyncStorage.setItem('user_email', data.data.email || '');
          await AsyncStorage.setItem('firstname', data.data.firstname || '');
          await AsyncStorage.setItem('lastname', data.data.lastname || '');
          await AsyncStorage.setItem('student_email', data.data.student_email || '');

          if (data?.data?.token?.access_token) {
            await AsyncStorage.setItem('access_token', data.data.token.access_token);
          }
        }
        setShowPopup1(false);
        setCurrentScreen('login');
        setcurrentScreenIninner('profile');
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

      setOtp1(['','','','']);
      const url = MAIN_URL.baseUrl + 'user/student-email'

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

        showToast(data.message, 'success');
        setShowOtp(true);
        //startAnimation();
      } else {
        showToast(data?.message || Constant.FAIL_TO_SEND_OTP, 'error');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      showToast(Constant.SOMTHING_WENT_WRONG, 'error');
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

  const loginTranslateY = useRef(
    new Animated.Value(Dimensions.get('window').height),
  ).current;
  const signupTranslateY = useRef(new Animated.Value(Dimensions.get('window').height)).current

  const ClickFPGoBack_slideOutToTop = (onFinish?: () => void) => {
    Animated.timing(resetPasswordtranslateY, {
      toValue: -Dimensions.get('window').height,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      if (onFinish) onFinish();
    });


    Animated.timing(loginTranslateY, {
      toValue: Dimensions.get('window').height, // slide into place
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const goToForgotPassword = () => {
    Animated.timing(textAndBackOpacity, {
      toValue: 0,   // fade out
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    Animated.timing(resetPasswordtranslateY, {
      toValue: -Dimensions.get('window').height,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      
    });
    Animated.timing(loginTranslateY, {
      toValue: Dimensions.get('window').height, // slide down off screen
      duration: 1000,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      
      setTextandBackIcon(false);
      setUsername('');
      setPassword('');
      setIsPasswordVisible(false);
      setCurrentScreen('login');
      setcurrentScreenIninner('forgotpassword');
    });
  };


  const heightAnim = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(Dimensions.get('window').height);
 
  useEffect(() => {
  if (contentHeight > 0) {
    if(currentScreenIninner !== 'signup'){
        Animated.timing(heightAnim, {
              toValue: contentHeight + 30,
              duration: 800,
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
      toValue: -Dimensions.get('window').height,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      if (onFinish) onFinish();
    });

    Animated.timing(signupTranslateY, {
      toValue: Dimensions.get('window').height, 
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

   const ClickBackToSendOTP1 = (onFinish?: () => void) => {
    console.log('ClickBackToSendOTP1', setOTPTranslatY);

  // ✅ Reset OTP screen below the window
  setOTPTranslatY.setValue(Dimensions.get('window').height);

  Animated.parallel([
    // Slide Verify screen up (out)
    Animated.timing(verifyAndContinyTranslateY2, {
      toValue: -Dimensions.get('window').height,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
    // Slide SendOTP screen up from bottom (in)
    Animated.timing(setOTPTranslatY, {
      toValue: Dimensions.get('window').height, // on screen
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
  ]).start(() => {
    setCurrentScreen('login');
    setcurrentScreenIninner('sendOTP');
    if (onFinish) onFinish();
  });
  };


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
              handleResponse
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
              handleResponse
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

  const insets = useSafeAreaInsets();
  
  const uploadImage = async (uri: string) => {
    console.log('Started');
    setLoading(true);
  
    try {
      if (!uri) {
        console.log('No photo selected');
        Alert.alert(Constant.ALERT_MESSAGE_PLEASE_SELECT_AN_IMAGE_FIRST);
        setLoading(false);
        return;
      }
  
      console.log('Photo URI:', uri);
  
      const token = await AsyncStorage.getItem('access_token');
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
  return (
    <ImageBackground
      source={require('../../../assets/images/bganimationscreen.png')}
      style={Styles.container}
      resizeMode="cover"
    >
     {Platform.OS === 'android' ? (
      <BackgroundAnimation_Android />
    ) : (
      <BackgroundAnimation children={undefined}/>
    )}
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // adjust if you have header
    >
      
      {currentScreen === 'hello' && (
        <View style={Styles.ScreenLayout}>
          <Animated.View
            style={[{ transform: [{ translateY: unizyTranslateY }] }, { paddingTop: (Platform.OS === 'ios') ?60: 0}]}
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
            <TouchableOpacity onPress={() => {

              


           
              Animated.parallel([
    // Slide Verify screen up (out)
          Animated.timing(unizyTranslateY, {
            toValue: -Dimensions.get('window').height,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          // Slide SendOTP screen up from bottom (in)
          // Animated.timing(slideUp, {
          //   toValue: -Dimensions.get('window').height, // on screen
          //   duration: 200,
          //   easing: Easing.out(Easing.ease),
          //   useNativeDriver: true,
          // }),
        ]).start(() => {
        });
        setCurrentScreen('language');

            }}>
             
             
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
          <View style={{ height: '100%', padding: 16, paddingBottom: insets.bottom, paddingTop: (Platform.OS === 'ios')? 70 :30}}>
            <Animated.View
              style={[
                selectlang_styles.container,
                { transform: [{ translateY: slideUp1 }] },
              ]}
            >
              <Text style={selectlang_styles.title}>Select Language</Text>

              <View style={selectlang_styles.search_container}>
                <Image
                  source={require('../../../assets/images/searchicon.png')}
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
                            }}
                          >
                            <Image
                              source={item.flag}
                              style={selectlang_styles.flag}
                            />
                            <Text style={selectlang_styles.languageText}>
                              {item.name}
                            </Text>
                          </View>
                          <View>
                            <View style={selectlang_styles.radioButton_round}>
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
         <View style={{paddingTop: (Platform.OS === 'ios')? 80:30,paddingLeft: 16,paddingRight: 16}}>
          {currentScreenIninner === 'login' && (
            <Animated.View style={{
                opacity: textAndBackOpacity,
                transform: [{ translateY: textandBackIcon ? translateY : 0 }],
              }}>

            
                <TouchableOpacity style={{zIndex: 1}} onPress={() => {setCurrentScreen('language');}}>
                  <View style={Styles.backIconRow}>
                    <Image
                      source={require('../../../assets/images/back.png')}
                      style={{ height: 24, width: 24 }}
                    />
                  </View>
                </TouchableOpacity>
              </Animated.View>
          )}

            <Animated.View style={{
                transform: [
                  { translateY: textandBackIcon ? translateY : 0 }
                ]
              }}>
                <Text style={Styles.unizyText}>UniZy</Text>
            </Animated.View>
          
          </View> 
        

          <View style={{ width: '100%', height: '100%', paddingLeft: 16, paddingRight: 16, paddingTop: 16, }} >
            <Animated.View
              style={[Styles.cardView, { height: heightAnim ,}]}>

              <View
                onLayout={e => {
              const { height } = e.nativeEvent.layout;
              setContentHeight(height); // save measured height
            }}
              >

                {currentScreenIninner === 'login' && (
                  <>
                    <Animated.View
                      style={{ transform: [{ translateY: loginTranslateY}] }}
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
                          maxLength={50}
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
                          maxLength={20}
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
                            setTextandBackIcon(false);
                            signupTranslateY.setValue(0);
                            setUsername('')
                            setPassword('')
                            setIsPasswordVisible(false)
                            setCurrentScreen('login');
                            setcurrentScreenIninner('signup');
                            setFirstName('')
                            setLastName('')
                            setPostalCode('')
                            setConfirmPassword('')
                            setsignUpPassword('')
                            setsignUpUsername('')
                            setIsConfirmPasswordVisible(false)
                            setsignUpIsPasswordVisible(false)
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
                              value={username1}
                              maxLength={50}
                              keyboardType="email-address"
                              autoCapitalize="none"
                              autoCorrect={false}
                              onChangeText={usernameText =>
                                setUsername1(usernameText)
                              }
                            />
                          </View>

                          <TouchableOpacity
                            style={Styles.loginButton}
                            onPress={() => {
                              handleSendResetLink();

                            }}
                          >
                            <Text style={Styles.loginText}>Send Reset Link</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => {
                              resetPasswordtranslateY.setValue(0); 
                              ClickFPGoBack_slideOutToTop(() => {
                                Animated.timing(textAndBackOpacity, {
                                  toValue: 1,   // fade in
                                  duration: 500,
                                  useNativeDriver: true,
                                }).start();
                                setUsername1('');
                                // reset for next time
                                setCurrentScreen('login');
                                setcurrentScreenIninner('login');
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
                                <Text style={Styles.termsText1}>
                                  A password reset link has been sent to your
                                  personal email. Please check your inbox (or spam
                                  folder) to continue.
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
                            transform: [{ translateY: signupTranslateY }]
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
                            maxLength={7}
                            //keyboardType="numeric"
                            onChangeText={text => {
                              const alphanumericText = text.replace(/[^a-zA-Z0-9]/g, '');
                               const limitedText = alphanumericText.slice(0, 7);
                               setPostalCode(limitedText);
                            }}
                          />
                        </View>

                        <View style={Styles.password_container}>
                          <TextInput
                            style={Styles.password_TextInput}
                            placeholder="Personal Email ID"
                            placeholderTextColor="rgba(255, 255, 255, 0.48)"
                            value={signUpusername}
                            maxLength={50}
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
                              <Text style={Styles.infoText1}>Important: </Text>
                              Use your personal email address for signup. Your university email will be
                              requested separately for student verification.
                          </Text>
                          </View>
                      )}

                        <View style={Styles.password_container}>
                          <TextInput
                            style={Styles.password_TextInput}
                            placeholder="Create Password"
                            placeholderTextColor="rgba(255, 255, 255, 0.48)"
                            value={signUppassword}
                            maxLength={20}
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
                            maxLength={20}
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
                          onPress={() => {
                            handleSendOTP();
                            setImageLoaded(true);

                          }}
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
                                setConfirmPassword('')
                                setFirstName('')
                                setLastName('')
                                setPostalCode('')
                                setsignUpUsername('')
                                setsignUpPassword('')
                                setsignUpIsPasswordVisible(false)
                                setIsConfirmPasswordVisible(false)
                              }
                            }}
                          >
                            <Text style={Styles.signupPrompt1}>Login</Text>
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
                          style={
                            [
                              {
                                transform: [
                                  { translateY: setOTPTranslatY },
                                  
                                ],
                              },
                            ]
                          }
                        >
                          <View>
                            <Text style={Styles.sendOtpresetTitle}>
                              Verify Personal Email ID
                            </Text>
                            <View style={Styles.sendOtpprivacyContainer}>
                              <Text style={Styles.termsText}>
                                We have sent a 4-digit code to{' '}
                                <Text style={Styles.sendOtpresendText2}>
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
                                  style={Styles.sendOtpotpBox}
                                  keyboardType="number-pad"
                                  maxLength={1}
                                  onChangeText={text => {
                                    const digit = text.replace(/[^0-9]/g, '');
                                    handleChange(digit, index);
                                  }}
                                  value={otp[index]}
                                  returnKeyType="next"
                                  textAlign="center"
                                  secureTextEntry
                                  onKeyPress={({nativeEvent }) =>{
                                    if (nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
                                      inputs.current[index - 1]?.focus();
                                    }
                                  }}  
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
                                  Click_SENDOTP_TO_SIGNUPSCREEN(() => {
                                    setCurrentScreen('login');
                                    setcurrentScreenIninner('signup');
                                     setShowOtp(false);
                                      setverifyimageLoaded(true);
                                  })
                                }}
                              >
                                <Text style={Styles.sendOtpgoBackText1}>
                                  Go back
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
                          style={
                            [
                              {
                                transform: [
                                  { translateY: verifyAndContinyTranslateY1 },
                                ],
                              },
                            ]
                          }
                        >
                          <View>
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
                                onChangeText={usernameText =>
                                  setverifyUsername(usernameText)
                                }
                              />
                            </View>

                            <TouchableOpacity
                              style={Styles.verifyloginButton}
                              onPress={()=>{verifyOTP()}}
                            >
                              <Text style={Styles.loginText}>Send OTP</Text>
                            </TouchableOpacity>
                          </View>
                        </Animated.View>
                      )}

                      {showOtp && (

                        <Animated.View style={[
                          { width: '100%', alignItems: 'center' },
                          {
                            transform: [
                              { translateY: verifyAndContinyTranslateY2 },
                            ],
                          },]}>

                          <View
                            style={[
                              { width: '100%', alignItems: 'center' },

                            ]}
                          >
                            <Text style={Styles.verifyresetTitle}>
                              Verify University Email ID
                            </Text>

                            <View style={Styles.verifyprivacyContainer}>
                              <Text style={Styles.verifytermsText}>
                                We have sent a 4-digit code to{' '}
                                <Text style={Styles.resendText2}>
                                  {verifyusername}
                                </Text>
                              </Text>
                            </View>

                            <View style={Styles.verifyotpContainer}>
                              {[0, 1, 2, 3].map((_, index) => (
                                <TextInput
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
                                  secureTextEntry={true}
                                  onKeyPress={({ nativeEvent }) => {
                                    if (nativeEvent.key === 'Backspace' && otp1[index] === '' && index > 0) {
                                      verifyinputs.current[index - 1]?.focus();
                                    }
                                  }}
                                />
                              ))}
                            </View>

                            <TouchableOpacity
                              style={Styles.verifyloginButton1}
                              onPress={submitotp}
                            >
                              <Text style={Styles.loginText}>
                                Verify & Continue
                              </Text>
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row', marginTop: 6 }}>
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
                              <Text style={Styles.verifyresendText}>
                                Entered wrong email?{' '}
                              </Text>
                              <TouchableOpacity
                                onPress={() => {
                                  ClickBackToSendOTP1(() => {
                                  //   setCurrentScreen('login');
                                  // setcurrentScreenIninner('sendOTP');
                                  })
                                  
                                }}
                              >
                                <Text style={Styles.verifygoBackText1}>
                                  Go back
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
                          style={[{ transform: [{ translateY: profileTranslateY }], opacity },]}>
                          <View>
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
                                  setShowPopup1(true);
                                }}
                              >
                                <Text style={Styles.profilesignupPrompt1}>
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
                                closePopup1();
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
                        style={[Styles.stepCircle, Styles.inactiveStepCircle]}
                      />
                    ),
                  )}
                </View>
              )}
            {/* Teams and codition */}
          </View>


          {(currentScreen === 'login' && currentScreenIninner === 'login' || currentScreenIninner === 'signup') && (

            <Animated.View
              style={[Styles.mainTemsAndConditions, (currentScreenIninner === 'login' || currentScreenIninner === 'signup')
                ? { transform: [{ translateY: slideUp }] }
                : {},
              ]}>
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
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default SinglePage;