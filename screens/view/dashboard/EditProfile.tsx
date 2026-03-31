

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
  ScrollView,
  PermissionsAndroid,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  StatusBar,
  Dimensions,
  Animated,
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
  Asset,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import {
  check,
  PERMISSIONS,
  request,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import Button from '../../utils/component/Button';
import LinearGradient from 'react-native-linear-gradient';
import { Constant } from '../../utils/Constant';
import { useTranslation } from 'react-i18next';
import Loader from '../../utils/component/Loader';
import SaveButton from '../../utils/component/SaveButton';
import { getCityFromPostalCode } from '../../utils/geocoding';
// import { getCityFromPostalCode } from '../../utils/geocoding';
import ImagePicker from 'react-native-image-crop-picker';
import { STYLES } from '../../utils/Style';

type EditProfileProps = {
  navigation: any;
};

interface UserMeta {
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  student_email: string | null;
  city: string | null;
  postal_code: string | null;
  latitude: number;
  longitudes: number;
  // profile:string | null;
}

const EditProfile = ({ navigation }: EditProfileProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [username1, setUsername1] = useState<string>('');
  const [username2, setUsername2] = useState<string>('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [newphoto, setNewPhoto] = useState<string | null>(null);
  const [userMeta, setUserMeta] = useState<UserMeta>({
    firstname: '',
    lastname: '',
    email: '',
    student_email: '',
    city: '',
    postal_code: '',
      latitude: 0 ,
   longitudes: 0
    // profile:''
  });

  const [intialfirstname,setintialfirstname]=useState('');
  const [intiallastname,setinitiallastname]=useState('');

  const [initialProfile, setInitialProfile] = useState<UserMeta | null>(null);

  const [showPopup1, setShowPopup1] = useState(false);
  const closePopup1 = () => setShowPopup1(false);

  const [showPopup2, setShowPopup2] = useState(false);
  const closePopup2 = () => setShowPopup2(false);


  const [showPopup3, setShowPopup3] = useState(false);
  const closePopup3 = () => setShowPopup3(false);

  const [showPopup4, setShowPopup4] = useState(false);
  const closePopup4 = () => setShowPopup4(false);


  const [emailName, setEmailName] = useState('');
  const inputs = useRef<Array<TextInput | null>>([]);
  const inputs1 = useRef<Array<TextInput | null>>([]);
  const [isUpdateDisabled_personal, setIsUpdateDisabled_personal] =
    useState(true);

  const [isUpdateDisabled_student, setIsUpdateDisabled_student] =
    useState(true);

  // const [isUpdateDisabled, setIsUpdateDisabled] = useState(true);
  const [updateText, setUpdateText] = useState('Update');
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [initialEmail, setInitialEmail] = useState(''); // store original email
  const [initialPersonalEmail, setInitialPersonalEmail] = useState(''); // store original email

  const screenHeight = Dimensions.get('window').height;
  const [slideUp1] = useState(new Animated.Value(0));

  const scrollY = useSharedValue(0);

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

  const blurAmount = useDerivedValue(() =>
    interpolate(scrollY.value, [0, 300], [0, 10], 'clamp'),
  );


  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');

        if (!token || !userId) {
          console.warn('Missing token or user ID in AsyncStorage');
          return;
        }


        const url = `${MAIN_URL.baseUrl}user/user-profile/${userId}`;


        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (response.status === 401 || response.status === 403) {
          handleForceLogout();
          setLoading(false)
          return;
        }

        if (data.statusCode === 401 || data.statusCode === 403) {
          handleForceLogout();
          setLoading(false)
          return;
        }

        if (response.ok) {
          const user = data.data;

          setintialfirstname(user.firstname ?? '');
          setinitiallastname(user.lastname ?? '');

          setUserMeta({
            firstname: user.firstname ?? null,
            lastname: user.lastname ?? null,
            email: user.email ?? null,
            student_email: user.student_email ?? null,
            city: user.city ?? null,
            postal_code: user.postal_code ?? null,
           latitude: userMeta.latitude??null ,
           longitudes: userMeta.longitudes,
          });

          const profileSnapshot: UserMeta = {
            firstname: user.firstname ?? '',
            lastname: user.lastname ?? '',
            email: user.email ?? '',
            student_email: user.student_email ?? '',
            city: user.city ?? '',
            postal_code: user.postal_code ?? '',
            latitude: userMeta.latitude??null ,
           longitudes: userMeta.longitudes,
          };
          setUserMeta(profileSnapshot);
          setInitialProfile(profileSnapshot);


          setPhoto(user.profile);
          setOriginalPhoto(user.profile);
          setInitialEmail(user.student_email ?? '');
          setInitialPersonalEmail(user.email ?? '');
        } else {
          console.warn(
            'Failed to fetch user profile:',
            data?.message || response.status,
          );
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
      finally {
        setLoading(false)
      }
    };
    const handleForceLogout = async () => {

      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
      });
    };

    fetchUserProfile();
  }, []);

  const [universityDomains, setUniversityDomains] = useState<string[]>([]);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const url4 = MAIN_URL.baseUrl + 'user/university-list';
        const res = await fetch(url4);
        const json = await res.json();
        if (json?.data) {
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
    if (showPopup2) {
      const timer = setTimeout(() => {
        inputs.current[0]?.focus();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [showPopup2]);

   useEffect(() => {
    if (showPopup4) {
      const timer = setTimeout(() => {
        inputs1.current[0]?.focus();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [showPopup4]);

  const isProfileChanged = () => {
    if (!initialProfile) return false;

    return (
      userMeta.firstname !== initialProfile.firstname ||
      userMeta.lastname !== initialProfile.lastname ||
      userMeta.email !== initialProfile.email ||
      userMeta.student_email !== initialProfile.student_email ||
      userMeta.city !== initialProfile.city ||
      userMeta.postal_code !== initialProfile.postal_code ||
      photo !== originalPhoto
    );
  };

  const requestCameraPermission = async () => {
    // ANDROID
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }

    // iOS
    if (Platform.OS === 'ios') {
      try {
        const status = await check(PERMISSIONS.IOS.CAMERA);

        switch (status) {
          case RESULTS.GRANTED:
            return true;

          case RESULTS.DENIED:
            // User denied previously → we can ask again
            const result = await request(PERMISSIONS.IOS.CAMERA);
            return result === RESULTS.GRANTED;

          case RESULTS.BLOCKED:
            // User selected "Don't Allow" + "Don't ask again"
            Alert.alert(
              'Camera Permission Needed',
              'Camera access is blocked. Please enable it in Settings.',
              [
                { text: 'Open Settings', onPress: () => openSettings() },
                { text: 'Cancel', style: 'cancel' },
              ],
            );
            return false;

          default:
            return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }

    return true;
  };

  const isValidEmail = (email: string) => {
   // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
   const emailRegex =
      /^[^\s@]+@(?!(?:[^\s@]+\.)?(?:ac\.uk|edu)$)[^\s@]+\.[^\s@]+$/i;
    return emailRegex.test(email.trim());
  };

  const validateStudentEmail = (email: string) => {
    if (!email) return false;

    const emailParts = email.split('@');
    if (emailParts.length !== 2) return false;

    const domain = '@' + emailParts[1].trim().toLowerCase();
    return universityDomains.includes(domain);
  };
  const validateForm = () => {
    const errors = [];
    if (!userMeta.firstname || userMeta.firstname.trim() === '') {
      errors.push(t('first_name_req'));
    }
    if (!userMeta.lastname || userMeta.lastname.trim() === '') {
      errors.push(t('last_name_req'));
    }
    // if (
    //   !userMeta.email?.trim() ||
    //   !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userMeta.email.trim())
    // ) {
    //   errors.push(t('personal_req'));
    // }
    // if (
    //   !userMeta.student_email?.trim() ||
    //   !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
    //     userMeta.student_email.trim(),
    //   )
    // ) {
    //   errors.push(t('student_req'));
    // }


    if (!userMeta.email?.trim()) {
      errors.push(t('personal_req'));
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        userMeta.email.trim()
      )
    ) {
      errors.push(t('invalid_email'));
    }


    // if (!userMeta.city || userMeta.city.trim() === '') {
    //   errors.push(t('city_req'));
    // }
    if (!userMeta.postal_code || userMeta.postal_code.trim() === '') {
      errors.push(t('postal_code_req'));
    }
    return errors;
  };

  // ---------------------  Update data method call -----------------//

  const handleSaveProfile = async () => {

    if (!isProfileChanged()) {
      showToast(t('no_changes_detected'), 'info');
      return;
    }
    const errors = validateForm();
    if (errors.length > 0) {
      showToast(errors[0], 'error');
      return;
    }
    // else if (!isUpdateDisabled_personal) {
    //   showToast(t(Constant.VERIFY_PERSONAL_MAIL), 'error');
    //   return;
    // } else if (!isUpdateDisabled) {
    //   showToast(t(Constant.VERIFY_STUDENT_MAIL), 'error');
    //   return;
    // }

    try {
      setLoading(true)
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        showToast(t(Constant.USER_NOT_AUTH), 'error');
        return;
      }
      if (newphoto) {
        const uploadSuccess = await handleUploadImage(newphoto);

        if (!uploadSuccess) {
          setLoading(false);
          return;
        }

        showToast(t(Constant.IMAGE_UPLOAD), 'success');
      }

      // 2️⃣ Delete image ONLY if user REMOVED existing image
      else if (photo === null && originalPhoto !== null) {
        await handleDeleteImage();
      }

      const url = `${MAIN_URL.baseUrl}user/profile-edit`;


      const body = {
        firstname: userMeta.firstname?.trim(),
        lastname: userMeta.lastname?.trim(),
        //email: userMeta.email?.trim(),
        //student_email: userMeta.student_email?.trim(),
        city: userMeta.city?.trim(),
        postal_code: userMeta.postal_code,
        latitude: userMeta.latitude,
        longitudes: userMeta.longitudes,
      };


      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      

      if (data.statusCode === 200) {
        showToast(t(data?.message) || 'Profile updated successfully', 'success');
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
        }, 2500);
      } else {
        showToast(
          t(data?.message) || 'Failed to update profile.Please try again',
          'error',
        );
      }
    } catch (error) {
      console.error('Error during profile update:', error);
      showToast(t(Constant.SOMTHING_WENT_WRONG), 'error');
    }
    finally {
      setLoading(false)
    }
  };


  const handleUploadImage = async (imageUri: string | null) => {
    try {
      if (!imageUri) return true; // No new image, treat as success
      const language_code = await AsyncStorage.getItem('selectedLanguage') || 'en'
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      const url = `${MAIN_URL.baseUrl}user/update-profile`;

      if (!token || !userId) {
        showToast(t(Constant.USER_NOT_AUTH), 'error');
        return false;
      }

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `profile_${userId}.jpg`,
      } as any);

      formData.append('userId', userId);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
          languagecode: language_code
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        return true;
      } else {
        showToast(
          t(data?.message) || 'Failed to upload image.Please try again',
          'error',
        );
        return false;
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast(
        t(Constant.SOMTHING_WENT_WRONG),
        'error',
      );
      return false;
    }
  };


  // const handleSelectImage = async () => {

  //   const hasPermission = await requestCameraPermission();
  //   if (!hasPermission) return;
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
  //             response => {
  //               if (response.didCancel) return;
  //               if (response.assets && response.assets[0].uri) {
  //                 setPhoto(response.assets[0].uri);
  //                 setNewPhoto(response.assets[0].uri);
  //               }
  //             },
  //           );
  //         },
  //       },
  //       {
  //         text: "Gallery",
  //         onPress: () => {
  //           launchImageLibrary(
  //             {
  //               mediaType: 'photo',
  //               quality: 0.8,
  //             },
  //             response => {
  //               if (response.didCancel) return;
  //               if (response.assets && response.assets[0].uri) {
  //                 setPhoto(response.assets[0].uri);
  //                 setNewPhoto(response.assets[0].uri);
  //               }
  //             },
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


  const handleDeleteImage = async () => {
    try {
      if (newphoto) return true; // No new image, treat as success

      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      const url = `${MAIN_URL.baseUrl}user/delete-profile?userId=${userId}`;
      photo
      if (!token || !userId) {
        showToast(t(Constant.USER_NOT_AUTH), 'error');
        return false;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        // body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showToast(t(Constant.IMAGE_DELETE), 'success');
        return true;
      } else {
        showToast(
          t(data?.message) || 'Failed to delete image.Please try again',
          'error',
        );
        return false;
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast(
        t(Constant.SOMTHING_WENT_WRONG),
        'error',
      );
      return false;
    }
  };

  const [otp, setOtp] = useState(['', '', '', '']);

  const [save_otp, setSaveOtp] = useState(0);

  const [otp1, setOtp1] = useState(['', '', '', '']);

  const [save_otp1, setSaveOtp1] = useState(0);

  const sendOtp = async (email?: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const finalEmail = email?.trim();

      if (!finalEmail || !isValidEmail(finalEmail)) {
        showToast(t(Constant.VALID_EMAIL_ADDRESS), 'error');
        setShowPopup1(false)
        return;
      }

      const url = MAIN_URL.baseUrl + 'user/update-email';

      const createPayload = {
        email: finalEmail,
        email_type: 'personal',
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createPayload),
      });

      const data = await res.json();

      if (data?.statusCode === 200) {
        setSaveOtp(data.data.otp_id);
        setShowPopup1(false);
        setShowPopup2(true);
      } else {
        setShowPopup1(false);
        showToast(t(data?.message || 'Something went wrong'), 'error');
      }
    } catch (err) {
      console.error('sendOtp error:', err);
    }
  };

  const sendOtp1 = async (email?: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const finalEmail = email?.trim();

      if (!finalEmail || !validateStudentEmail(finalEmail)) {
        showToast(t(Constant.VALID_UNIVERSITY_EMAIL_ADDRESS), 'error');
        setShowPopup3(false)
        return;
      }

      const url = MAIN_URL.baseUrl + 'user/update-email';

      const createPayload = {
        student_email: finalEmail,
        //email_type: 'university',
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createPayload),
      });

      const data = await res.json();

      if (data?.statusCode === 200) {
        setSaveOtp1(data.data.otp_id);
        setShowPopup3(false);
        setShowPopup4(true);
      } else {
        setShowPopup3(false);
        showToast(t(data?.message || 'Something went wrong'), 'error');
      }
    } catch (err) {
      console.error('sendOtp error:', err);
    }
  };



  const otpverify = async () => {
    Keyboard.dismiss();

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {

        return;
      }
      const otpValue = otp.join('');
      const url = MAIN_URL.baseUrl + 'user/verify-update';
      const createPayload = {
        otp: otpValue,
        otp_id: save_otp,
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createPayload),
      });

      const data = await res.json();

      console.log('data', data);
      if (data?.statusCode === 200) {
        
        showToast(t(data?.message), 'success');
         setUserMeta(prev => ({ ...prev, email: username1 }))
        
        setShowPopup2(false);
        //setIsUpdateDisabled(true)
        //setIsUpdateDisabled_personal(true)
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
        }, 3000);

      } else {
        setShowPopup2(false);
        showToast(t(data?.message), 'error');
      }
    } catch (err) {
      console.error(err);

    }
  };


  const otpverify1 = async () => {
    Keyboard.dismiss();

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {

        return;
      }
      const otpValue = otp1.join('');
      const url = MAIN_URL.baseUrl + 'user/verify-update';
      const createPayload = {
        otp: otpValue,
        otp_id: save_otp1,
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createPayload),
      });

      const data = await res.json();

      console.log('data', data);
      if (data?.statusCode === 200) {
        showToast(t(data?.message), 'success');
        setUserMeta(prev => ({ ...prev, student_email: username2 }))
        setShowPopup4(false);
        //setIsUpdateDisabled(true)
        //setIsUpdateDisabled_personal(true)
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
        }, 3000);

      } else {
        setShowPopup4(false);
        showToast(t(data?.message), 'error');
      }
    } catch (err) {
      console.error(err);

    }
  };


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

    const handleChange1 = (text: string, index: number) => {
    const newOtp = [...otp1];
    newOtp[index] = text;
    setOtp1(newOtp);

    if (text && index < inputs1.current.length - 1) {
      inputs1.current[index + 1]?.focus();
    } else if (!text && index > 0) {
      inputs1.current[index - 1]?.focus();
    }
  };



  


  // const ClickPostalCode = async (postalCode: any) => {
  //   const cityName = await getCityFromPostalCode(postalCode);

  //   setUserMeta(prev => ({
  //     ...prev,
  //     city: cityName, // Only set city
  //   }));
  // };

  // const getCityFromPostalCode = async (postalCode: string) => {
  //   try {
  //     const response = await fetch(
  //       `https://nominatim.openstreetmap.org/search?postalcode=${postalCode}&format=json&addressdetails=1`,
  //       {
  //         headers: {
  //           "User-Agent": "MyAndroidApp/1.0 (contact@myapp.com)",
  //           "Accept-Language": "en-US",
  //         },
  //       }
  //     );

  //     const data = await response.json();
  //     console.log('location data:', data);

  //     if (!data || data.length === 0) return null;

  //     return (
  //       data[0].address.city ||
  //       data[0].address.town ||
  //       data[0].address.village ||
  //       null
  //     );
  //   } catch (error) {

  //     return null;
  //   }
  // };

  // const ClickPostalCode = async (postalCode: string) => {
  //   const cityName = await getCityFromPostalCode(postalCode);

  //   if (!cityName) {
  //     showToast('City not found', 'error');
  //     return;
  //   }

  //   setUserMeta(prev => ({
  //     ...prev,
  //     city: cityName,
  //   }));
  // };


//   const getCityFromPostalCode = async (postalCode: string) => {
//   try {
//     const response = await fetch(
//       `https://nominatim.openstreetmap.org/search?postalcode=${postalCode}&format=json&addressdetails=1`,
//       {
//         headers: {
//           "User-Agent": "MyAndroidApp/1.0 (contact@myapp.com)",
//           "Accept-Language": "en-US",
//         },
//       }
//     );

//     const data = await response.json();
//     console.log("location data:", data);

//     if (!data || data.length === 0) return null;

//     const address = data[0].address;

//     return (
//       address.city ||            // US, some countries
//       address.town ||            // smaller towns
//       address.village ||         // villages
//       address.county ||          // India, UK (like Pune City)
//       address.state_district ||  // fallback
//       null
//     );
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
  // };
  

  const ClickPostalCode = async (postalCode: any) => {
  const location = await getCityFromPostalCode(postalCode);

  if (!location) return;

  setUserMeta(prev => ({
    ...prev,
    city: location.city || '',
    lat: location.lat,
    lon: location.lon,
  }));
};
const getCityFromPostalCode = async (postalCode: string) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${postalCode}&format=json&addressdetails=1`,
      {
        headers: {
          "User-Agent": "MyAndroidApp/1.0 (contact@myapp.com)",
          "Accept-Language": "en-US",
        },
      }
    );

    const data = await response.json();
    console.log("location data:", data);

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
      lat: parseFloat(result.lat),   // ✅ FIX
      lon: parseFloat(result.lon),   // ✅ FIX
    };

  } catch (error) {
    console.error(error);
    return null;
  }
};

  
  const extractAddress = (components: any[]) => {
    const get = (type: string) =>
      components.find(c => c.types.includes(type))?.long_name || null;
  
    return {
      city:
        get('locality') ||
        get('administrative_area_level_3') ||
        get('administrative_area_level_2'),
      state: get('administrative_area_level_1'),
      country: get('country'),
      postalCode: get('postal_code'),
    };
  };
  


  const getInitials = (firstName = '', lastName = '') => {
    const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
    const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
    return (f + l) || '?';
  };


  const [typingTimeout, setTypingTimeout] = useState<any>(null);

  const handleSelectImage = async() => {
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

  const openCamera = () => {
    ImagePicker.openCamera({
      width: 300,
      height: 300,
      cropping: true,
      cropperCircleOverlay: true,
      compressImageQuality: 0.8,
      mediaType: 'photo',
    })
      .then(image => {
        console.log('CROPPED IMAGE:', image);
        console.log('IMAGE PATH:', image.path);

        const imageUri =
          Platform.OS === 'android'
            ? image.path
            : image.path.replace('file://', '');

        setPhoto(imageUri);
        setNewPhoto(imageUri);
      })
      .catch(error => {
        console.log('Camera Error:', error);
      });
  };

  const openGallery = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      cropperCircleOverlay: true,
      compressImageQuality: 0.8,
      compressImageMaxWidth: 1000,
  compressImageMaxHeight: 1000,
      mediaType: 'photo',
                // 🔥 IMPORTANT
      includeExif: false,
      includeBase64: false,
       forceJpg: true,
    })
      .then(image => {
        console.log('CROPPED IMAGE:', image);
        console.log('IMAGE PATH:', image.path);

        const imageUri =
          Platform.OS === 'android'
            ? image.path
            : image.path.replace('file://', '');

        setPhoto(imageUri);
        setNewPhoto(imageUri);
      })
      .catch(error => {
        console.log('Gallery Error:', error);
      });
  };


  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        <AnimatedReanimated.View
          style={[styles.headerWrapper, animatedBlurStyle]}
          pointerEvents="none"
        >
          <MaskedView
            style={StyleSheet.absoluteFill}
            maskElement={
              <LinearGradient
                colors={['rgba(0,0,0,1)', 'rgba(0,0,0,0)']}
                locations={[0, 0.8]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            }
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType={Platform.OS === 'ios' ? 'prominent' : 'light'}
              blurAmount={Platform.OS === 'ios' ? 45 : 45}
              reducedTransparencyFallbackColor="rgba(255,255,255,0.05)"
            />
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.45)',
                'rgba(255, 255, 255, 0.02)',
                'rgba(255, 255, 255, 0.02)',
              ]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </MaskedView>
        </AnimatedReanimated.View>

        {/* Header Content */}
        <View style={STYLES.headerContent} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => {
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
            }}
            style={styles.backButtonContainer}
            activeOpacity={0.7}
          >
            <AnimatedReanimated.View
              style={[STYLES.blurButtonWrapper, animatedButtonStyle]}
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
                style={[{ height: 24, width: 24 }, animatedIconStyle]}
              />
            </AnimatedReanimated.View>
          </TouchableOpacity>

          <Text allowFontScaling={false} style={styles.unizyText}>
            {t('edit')} {t('profile')}
          </Text>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1, marginTop: 0 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <AnimatedReanimated.ScrollView
            scrollEventThrottle={16}
            onScroll={scrollHandler}
            contentContainerStyle={[
              styles.scrollContainer,
              {
                paddingBottom:
                  Platform.OS === 'ios'
                    ? screenHeight * 0.12
                    : screenHeight * 0.1,
              },
            ]}
          >
            <View style={styles.profileavatarContainer}>
              <View style={styles.profilebigCircle}>
                <TouchableOpacity>

                  {photo && (
                    <TouchableOpacity
                      style={styles.profiledeleteButton}
                      onPress={() => setShowDeleteModal(true)}
                    >
                      <Image
                        source={require('../../../assets/images/delprofile.png')}
                        style={styles.profiledeletecameraIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}

                  {loading ? (
                    <View style={styles.initialsCircle}>
                      {/* empty placeholder to avoid flicker */}
                    </View>
                  ) : photo ? (
                    <Image source={{ uri: photo }} style={styles.profilelogo} />
                  ) : (
                    <View style={styles.initialsCircle}>
                      <Text allowFontScaling={false} style={styles.initialsText}>
                        {getInitials(
                          intialfirstname ?? 'A',
                          intiallastname ?? 'A',
                        )}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.profilecameraButton}
                  onPress={() => {
                    handleSelectImage();
                  }}
                >

                  <Image
                    source={require('../../../assets/images/camera_icon.png')}
                    style={styles.profilecameraIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.blurCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label} allowFontScaling={false}>
                  {t('first_name')}
                </Text>
                <TextInput
                  selectionColor='#F5F5F5'
                  cursorColor='#F5F5F5'
                  value={userMeta.firstname || ''}
                  onChangeText={text =>
                    setUserMeta(prev => ({ ...prev, firstname: text }))
                  }
                  allowFontScaling={false}
                  style={styles.input}
                  placeholder={t('enter_first_name')}
                  placeholderTextColor="rgba(255, 255, 255, 0.48)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label} allowFontScaling={false}>
                  {t('last_name')}
                </Text>
                <TextInput
                  selectionColor='#F5F5F5'
                  cursorColor='#F5F5F5'
                  
                  value={userMeta.lastname || ''}
                  onChangeText={text =>
                    setUserMeta(prev => ({ ...prev, lastname: text }))
                  }
                  allowFontScaling={false}
                  style={styles.input}
                  placeholder={t('enter_last_name')}
                  placeholderTextColor="rgba(255, 255, 255, 0.48)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label} allowFontScaling={false}>
                  {t('personal_email_id')}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    minHeight: 44,
                  }}
                >
                  <TextInput
                    selectionColor="#F5F5F5"
                    cursorColor="#F5F5F5"
                    editable={false}
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      borderWidth: 0,
                      borderRadius: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      color: 'rgba(255, 255, 255, 0.58)',
                      fontFamily: 'Urbanist-Regular',
                      fontSize: 16,
                      fontWeight: 400,
                    }}
                    allowFontScaling={false}
                    value={userMeta.email || ''}
                    onChangeText={text => {
                      setUserMeta(prev => ({ ...prev, email: text.trim() }));
                      if (text.trim() === initialPersonalEmail) {

                        setIsUpdateDisabled_personal(true);
                      } else {

                        setIsUpdateDisabled_personal(false);
                      }


                    }}
                    keyboardType="email-address"
                    placeholder={t('enter_personal_email_id')}
                    placeholderTextColor="#ccc"
                  />
                  <TouchableOpacity
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      boxShadow: 'rgba(255, 255, 255, 0.02)inset -1px 10px 5px 10px,rgba(236, 232, 232, 0.3)inset -0.99px -0.88px 0.90px 0px,rgba(236, 232, 232, 0.3)inset 0.99px 0.88px 0.90px 0px',
                      borderColor: '',
                      borderRadius: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginEnd: 8,
                      // opacity: 0.5 
                    }}

                    onPress={() => {
                      const email = userMeta.email || '';

                      if (!isValidEmail(email.trim())) {
                        showToast(t(Constant.VALID_EMAIL_ADDRESS), 'error');
                        return;
                      }
                      setShowPopup1(true);
                      setUsername1('')
                      //sendOtp('personalEmail');
                      setEmailName('personalEmail');
                    }}
                  >
                    <Image
                      source={require('../../../assets/images/editcontained.png')}
                      style={styles.updateIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label} allowFontScaling={false}>
                  {t('university_email_id')}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    minHeight: 44,
                  }}
                >
                  <TextInput
                    selectionColor="#F5F5F5"
                    cursorColor="#F5F5F5"
                    editable={false}
                    style={{
                      flex: 1,
                      color: 'rgba(255, 255, 255, 0.58)',
                      backgroundColor: 'transparent',
                      borderWidth: 0,
                      borderRadius: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      fontFamily: 'Urbanist-Regular',
                      fontSize: 16,
                      fontWeight: 400,
                    }}
                    allowFontScaling={false}

                    value={userMeta.student_email || ''}
                    onChangeText={text => {
                      setUserMeta(prev => ({ ...prev, email: text.trim() }));
                      if (text.trim() === initialEmail) {

                        setIsUpdateDisabled_student(true);
                      } else {

                        setIsUpdateDisabled_student(false);
                      }


                    }}
                    keyboardType="email-address"
                    placeholder={t('enter_student_email_id')}
                    placeholderTextColor="#ccc"
                  />
                  <TouchableOpacity
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      boxShadow: 'rgba(255, 255, 255, 0.02)inset -1px 10px 5px 10px,rgba(236, 232, 232, 0.3)inset -0.99px -0.88px 0.90px 0px,rgba(236, 232, 232, 0.3)inset 0.99px 0.88px 0.90px 0px',
                      borderColor: '',
                      borderRadius: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginEnd: 8,
                      // opacity: 0.5 
                    }}

                    onPress={() => {
                      const email = userMeta.student_email || '';

                      if (!validateStudentEmail(email.trim())) {
                        showToast(t(Constant.VALID_UNIVERSITY_EMAIL_ADDRESS), 'error');
                        return;
                      }
                      setShowPopup3(true);
                      setUsername2('')
                      //sendOtp('personalEmail');
                      setEmailName('personalEmail');
                    }}
                  >
                    <Image
                      source={require('../../../assets/images/editcontained.png')}
                      style={styles.updateIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label} allowFontScaling={false}>
                  {t('postal_code')}*
                </Text>
                <TextInput
                  selectionColor="#F5F5F5"
                  cursorColor="#F5F5F5"
                  value={userMeta.postal_code || ''}
                  onChangeText={text => {
                    const filteredText = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                    if (filteredText.length > 7) return;
                    setUserMeta(prev => ({
                      ...prev,
                      postal_code: filteredText,
                    }));
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
                  allowFontScaling={false}
                  style={styles.input}
                  keyboardType="default"
                  placeholder={t('enter_postal_code')}
                  placeholderTextColor="rgba(255, 255, 255, 0.48)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label} allowFontScaling={false}>
                  {t('city')}
                </Text>
                <TextInput
                  selectionColor="#F5F5F5"
                  cursorColor="#F5F5F5"
                  allowFontScaling={false}
                  value={userMeta.city || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onChangeText={text =>
                    setUserMeta(prev => ({ ...prev, city: text }))
                  }
                  style={[styles.input, { color: 'rgba(255, 255, 255, 0.58)' }]}
                  placeholder={t('city')}
                  placeholderTextColor="#ccc"

                />
              </View>
            </View>

           
          </AnimatedReanimated.ScrollView>
        </KeyboardAvoidingView>


        <SaveButton
          title={t('save_details')}
          onPress={handleSaveProfile}
          disabled={!isProfileChanged()}

        />
      </View>

      <Modal
        visible={showPopup1}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { }}
      >
        <TouchableWithoutFeedback onPress={closePopup1}>
          <View style={styles.overlay}>
            <BlurView
              style={{
                flex: 1,
                alignContent: 'center',
                justifyContent: 'center',
                width: '100%',
                alignItems: 'center',
              }}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
            >
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: 'rgba(0, 0, 0, 0.47)' },
                ]}
              />

              <View style={styles.popupContainer}>
                <Text allowFontScaling={false} style={styles.mainheader}>
                  {t('update_personal_email')}
                </Text>

                <Text allowFontScaling={false} style={styles.notheader}>
                  {t('update_email_info')}
                </Text>

                <View style={[styles.login_container]}>
                  <TextInput
                    allowFontScaling={false}
                    style={[
                      styles.personalEmailID_TextInput,
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
                  style={styles.newloginButton}
                  onPress={() => {
                    //setShowPopup2(true)
                    sendOtp(username1)
                  }
                  }
                >
                  <Text allowFontScaling={false} style={styles.loginText}>
                    {t('send_otp')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.newloginButton1}
                  onPress={() => {
                    setShowPopup1(false)
                  }
                  }
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


      <Modal
        visible={showPopup2}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { }}
      >
        <TouchableWithoutFeedback onPress={closePopup2}>
          <View style={styles.overlay}>
            <BlurView
              style={{
                flex: 1,
                alignContent: 'center',
                justifyContent: 'center',
                width: '100%',
                alignItems: 'center',
              }}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
            >
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: 'rgba(0, 0, 0, 0.47)' },
                ]}
              />

              <View style={styles.popupContainer}>
                <Text allowFontScaling={false} style={styles.mainheader}>
                  {t('verify_personal_email')}
                </Text>

                <Text allowFontScaling={false} style={styles.notheader}>
                  {t('we_sent_code_to')}{' '}
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: '#fff',
                      fontFamily: 'Urbanist-SemiBold',
                      fontWeight: '400',
                    }}
                  >
                    {username1}
                  </Text>
                </Text>

                <View style={styles.otpContainer}>
                  {[0, 1, 2, 3].map((_, index) => (
                    <TextInput
                      selectionColor="#F5F5F5"
                      cursorColor="#F5F5F5"
                      allowFontScaling={false}
                      key={index}
                      ref={ref => {
                        inputs.current[index] = ref;
                      }}
                      style={styles.otpBox}
                      keyboardType="number-pad"
                      maxLength={1}
                      onChangeText={text => {
                        const digit = text.replace(/[^0-9]/g, '');
                        handleChange(digit, index);
                      }}
                      returnKeyType="next"
                      textAlign="center"
                      secureTextEntry={true}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={otpverify}
                >
                  <Text allowFontScaling={false} style={styles.loginText}>
                    {t('verify')}
                  </Text>
                </TouchableOpacity>


                <Text
                  allowFontScaling={false}
                  style={[styles.notheader, { marginBottom: 6 }]}
                >
                  {t('didnt_receive_code')}{' '}
                  <Text
                    allowFontScaling={false}
                    style={styles.notheader1}
                    onPress={() => sendOtp(username1)}
                  >
                    {t('resend_code')}
                  </Text>
                </Text>

                <Text
                  allowFontScaling={false}
                  style={[styles.notheader, { marginBottom: 6 }]}
                >
                  {t('entered_wrong_email')}{' '}
                  <Text
                    allowFontScaling={false}
                    style={styles.notheader1}
                    onPress={() => {
                      setShowPopup2(false)
                      setShowPopup1(true)
                    }
                    }
                  >
                    {t('go_back')}
                  </Text>
                </Text>
              </View>
            </BlurView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>


      <Modal
        visible={showPopup3}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { }}
      >
        <TouchableWithoutFeedback onPress={closePopup3}>
          <View style={styles.overlay}>
            <BlurView
              style={{
                flex: 1,
                alignContent: 'center',
                justifyContent: 'center',
                width: '100%',
                alignItems: 'center',
              }}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
            >
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: 'rgba(0, 0, 0, 0.47)' },
                ]}
              />

              <View style={styles.popupContainer}>
                <Text allowFontScaling={false} style={styles.mainheader}>
                  {t('update_university_email')}
                </Text>

                <Text allowFontScaling={false} style={styles.notheader}>
                  {t('update_email_info1')}
                </Text>

                <View style={[styles.login_container]}>
                  <TextInput
                    allowFontScaling={false}
                    style={[
                      styles.personalEmailID_TextInput,
                      { color: '#fff' },
                    ]}
                    placeholder={t('university_email_id')}
                    placeholderTextColor="rgba(255, 255, 255, 0.48)"
                    value={username2}
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
                      setUsername2(usernameText)
                    }
                  />
                </View>


                <TouchableOpacity
                  style={styles.newloginButton}
                  onPress={() => {
                    //setShowPopup2(true)
                    sendOtp1(username2)
                  }
                  }
                >
                  <Text allowFontScaling={false} style={styles.loginText}>
                    {t('send_otp')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.newloginButton1}
                  onPress={() => {
                    setShowPopup3(false)
                  }
                  }
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


      <Modal
        visible={showPopup4}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { }}
      >
        <TouchableWithoutFeedback onPress={closePopup4}>
          <View style={styles.overlay}>
            <BlurView
              style={{
                flex: 1,
                alignContent: 'center',
                justifyContent: 'center',
                width: '100%',
                alignItems: 'center',
              }}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
            >
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: 'rgba(0, 0, 0, 0.47)' },
                ]}
              />

              <View style={styles.popupContainer}>
                <Text allowFontScaling={false} style={styles.mainheader}>
                  {t('verify_university_email')}
                </Text>

                <Text allowFontScaling={false} style={styles.notheader}>
                  {t('we_sent_code_to')}{' '}
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: '#fff',
                      fontFamily: 'Urbanist-SemiBold',
                      fontWeight: '400',
                    }}
                  >
                    {username2}
                  </Text>
                </Text>

                <View style={styles.otpContainer}>
                  {[0, 1, 2, 3].map((_, index) => (
                    <TextInput
                      selectionColor="#F5F5F5"
                      cursorColor="#F5F5F5"
                      allowFontScaling={false}
                      key={index}
                      ref={ref => {
                        inputs1.current[index] = ref;
                      }}
                      style={styles.otpBox}
                      keyboardType="number-pad"
                      maxLength={1}
                      onChangeText={text => {
                        const digit = text.replace(/[^0-9]/g, '');
                        handleChange1(digit, index);
                      }}
                      returnKeyType="next"
                      textAlign="center"
                      secureTextEntry={true}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={otpverify1}
                >
                  <Text allowFontScaling={false} style={styles.loginText}>
                    {t('verify')}
                  </Text>
                </TouchableOpacity>


                <Text
                  allowFontScaling={false}
                  style={[styles.notheader, { marginBottom: 6 }]}
                >
                  {t('didnt_receive_code')}{' '}
                  <Text
                    allowFontScaling={false}
                    style={styles.notheader1}
                    onPress={() => sendOtp1(username2)}
                  >
                    {t('resend_code')}
                  </Text>
                </Text>

                <Text
                  allowFontScaling={false}
                  style={[styles.notheader, { marginBottom: 6 }]}
                >
                  {t('entered_wrong_email')}{' '}
                  <Text
                    allowFontScaling={false}
                    style={styles.notheader1}
                    onPress={() => {
                      setShowPopup4(false)
                      setShowPopup3(true)
                    }
                    }
                  >
                    {t('go_back')}
                  </Text>
                </Text>
              </View>
            </BlurView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>



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

              <View style={[styles.popupContainer, { gap: 3 }]}>
                <Image
                  source={require('../../../assets/images/profile_delete.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text allowFontScaling={false} style={styles.mainheader1}>
                  {t('remove_profile')}
                </Text>
                <Text allowFontScaling={false} style={styles.subheader2}>
                  {t('are_you_sure')}
                </Text>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={async () => {
                    setShowDeleteModal(false);
                    setPhoto(null);
                    setNewPhoto(null);
                  }}
                >
                  <Text allowFontScaling={false} style={styles.loginText}>
                    {t('yes_remove')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.newloginButton1, { marginTop: 8 }]}
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
        <View style={styles.loaderOverlay}>
          <Loader />
        </View>
      )}
      <NewCustomToastContainer />
    </ImageBackground>
  );
};

export default EditProfile;

const styles = StyleSheet.create({



  newloginButton: {
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
    marginTop: 20,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },

  newloginButton1: {
    display: 'flex',
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'rgba(145, 142, 163, 0.56)',
    marginTop: 12,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',


  },



  login_container: {
    marginTop: 16,
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
  personalEmailID_TextInput: {
    width: '93%',
    //padding:12,
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
    fontStyle: 'normal',
    color: "#fff",

  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  subheader2: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 6,
  },

  mainheader1: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
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
 
  backButtonContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 11,
    //top: 7,
  },


  background: {
    flex: 1,
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
  
  logo: {
    width: 64,
    height: 64,
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
  profiledeleteButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.6) 100%)',
  },
  profilecameraIcon: {
    width: 40,
    height: 40,
    marginLeft: -1,
    marginTop: 3,
  },

  profiledeletecameraIcon: {
    width: 20,
    height: 20,
  },
  updateIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff'
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

    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },

  mainheader: {
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '500',
    // marginBottom: 10,
    fontSize: 20,

    color: '#fff',
    textAlign: 'center',
  },
  notheader: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 20,
  },

  notheader1: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 20,
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
    alignSelf: 'center',
    gap: 8,
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

  initialsCircle: {
    backgroundColor: '#8390D4',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  initialsText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 600,
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
  },
});
