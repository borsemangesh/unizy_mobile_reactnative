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
  // profile:string | null;
}

const EditProfile = ({ navigation }: EditProfileProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [newphoto, setNewPhoto] = useState<string | null>(null);
  const [userMeta, setUserMeta] = useState<UserMeta>({
    firstname: '',
    lastname: '',
    email: '',
    student_email: '',
    city: '',
    postal_code: '',
    // profile:''
  });

  //------------------- Get data method ------------------------//

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');

        if (!token || !userId) {
          console.warn('Missing token or user ID in AsyncStorage');
          return;
        }

        console.log(token);
        const url = `${MAIN_URL.baseUrl}user/user-profile/${userId}`;
        console.log('url', url);

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
          return;
        }

        if (data.statusCode === 401 || data.statusCode === 403) {
          handleForceLogout();
          return;
        }

        if (response.ok) {
          const user = data.data;
          console.log('user', user);

          setUserMeta({
            firstname: user.firstname ?? null,
            lastname: user.lastname ?? null,
            email: user.email ?? null,
            student_email: user.student_email ?? null,
            city: user.city ?? null,
            postal_code: user.postal_code ?? null,
          });
          setPhoto(user.profile);
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
    };
    const handleForceLogout = async () => {
      console.log('User inactive or unauthorized — logging out');
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
      });
    };

    fetchUserProfile();
  }, []);

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

  //-----------------------Handel validation ---------------------//
  const validateForm = () => {
    const errors = [];
    if (!userMeta.firstname || userMeta.firstname.trim() === '') {
      errors.push('First name is required.');
    }
    if (!userMeta.lastname || userMeta.lastname.trim() === '') {
      errors.push('Last name is required.');
    }
    if (
      !userMeta.email ||
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userMeta.email)
    ) {
      errors.push('Personal Email ID is invalid.');
    }
    if (
      !userMeta.student_email ||
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        userMeta.student_email,
      )
    ) {
      errors.push('Student Email ID is invalid.');
    }
    if (!userMeta.city || userMeta.city.trim() === '') {
      errors.push('City is required.');
    }
    if (!userMeta.postal_code || userMeta.postal_code.trim() === '') {
      errors.push('Postal code is required.');
    }
    return errors;
  };

  // ---------------------  Update data method call -----------------//

  const handleSaveProfile = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      showToast(errors[0], 'error');
      return;
    } else if (!isUpdateDisabled_personal) {
      showToast('Please verify your personal email Id', 'error');
      return;
    } else if (!isUpdateDisabled) {
      showToast('Please verify your student email Id', 'error');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        showToast('User authentication is missing.', 'error');
        return;
      }

      if (newphoto !== null) {
        const uploadSuccess = await handleUploadImage(newphoto);

        if (!uploadSuccess) {
          console.log('Image upload failed — stopping profile update.');
          return;
        }

        showToast('Image uploaded successfully', 'success');
        await new Promise((resolve: any) => {
          setTimeout(resolve, 2000);
        }); // Wait 1.5s so toast stays visible
      }
      const url = `${MAIN_URL.baseUrl}user/profile-edit`;

      const body = {
        firstname: userMeta.firstname,
        lastname: userMeta.lastname,
        email: userMeta.email,
        student_email: userMeta.student_email,
        city: userMeta.city,
        postal_code: userMeta.postal_code,
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

      if (response.ok) {
        showToast(data?.message || 'Profile updated successfully', 'success');
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
        // setTimeout(() => {
        //   // navigation.replace('Dashboard', {
        //   //   AddScreenBackactiveTab: 'Profile',
        //   //   isNavigate: false,
        //   // });

        //   navigation.reset({
        //     index: 0,
        //     routes: [
        //       {
        //         name: 'Dashboard',
        //         params: {
        //           AddScreenBackactiveTab: 'Profile',
        //           isNavigate: false,
        //         }
        //       }
        //     ],
        //   });

        // }, 4500);
      } else {
        showToast(
          data?.message || 'Failed to update profile.Please try again',
          'error',
        );
      }
    } catch (error) {
      console.error('Error during profile update:', error);
      showToast('An unexpected error occurred.', 'error');
    }
  };

  //------------------ image upload functionality ---------------//

  const handleSelectImage = async () => {
    console.log('Choose image');
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;
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
              response => {
                if (response.didCancel) return;
                if (response.assets && response.assets[0].uri) {
                  setPhoto(response.assets[0].uri);
                  setNewPhoto(response.assets[0].uri);
                }
              },
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
              response => {
                if (response.didCancel) return;
                if (response.assets && response.assets[0].uri) {
                  setPhoto(response.assets[0].uri);
                  setNewPhoto(response.assets[0].uri);
                }
              },
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

  const handleUploadImage = async (imageUri: string | null) => {
    try {
      if (!imageUri) return true; // No new image, treat as success

      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      const url = `${MAIN_URL.baseUrl}user/update-profile`;

      if (!token || !userId) {
        showToast('User authentication is missing.', 'error');
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
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        return true;
      } else {
        showToast(
          data?.message || 'Failed to upload image.Please try again',
          'error',
        );
        return false;
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast(
        'Unexpected error occured during upload.Please try again',
        'error',
      );
      return false;
    }
  };

  const handleDeleteImage = async () => {
    try {
      if (newphoto) return true; // No new image, treat as success

      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      const url = `${MAIN_URL.baseUrl}user/delete-profile?userId=${userId}`;
photo
      if (!token || !userId) {
        showToast('User authentication is missing.', 'error');
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
        showToast('Image deleted successfully', 'success');
        return true;
      } else {
        showToast(
          data?.message || 'Failed to delete image.Please try again',
          'error',
        );
        return false;
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast(
        'Unexpected error occured during delete.Please try again',
        'error',
      );
      return false;
    }
  };

  //------------------------- to handel personal email ------------------------//

  // const [emailModalVisible, setEmailModalVisible] = useState(false);
  // const [verificationCode, setVerificationCode] = useState(['', '', '', '']); // One input per digit

  const [otp, setOtp] = useState(['', '', '', '']);

  const [save_otp, setSaveOtp] = useState(0);

  const sendOtp = async (res?: any) => {
    let flag = res;
    console.log('res---------', flag);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('⚠️ Token not found. Cannot upload.');
        return;
      }

      const url = MAIN_URL.baseUrl + 'user/update-email';
      let createPayload;
      if (flag == 'studentEmail') {
        createPayload = {
          student_email: userMeta.student_email,
        };
      } else if (flag == 'personalEmail') {
        createPayload = {
          email: userMeta.email,
        };
      }

      console.log('createPayload', createPayload);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createPayload),
      });

      const data = await res.json();
      console.log('send Otp...........', data);

      if (data?.statusCode === 200) {
        // showToast(data.message, 'success');   change
        setSaveOtp(data.data.otp_id);

        // setShowPopup2(true);
      } else {
        showToast(data?.message, 'error');
      }
    } catch (err) {
      console.error(err);
      // showToast(Constant.SOMTHING_WENT_WRONG, 'error');
    }
  };

  const otpverify = async () => {
    Keyboard.dismiss();

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('⚠️ Token not found. Cannot upload.');
        return;
      }
      const otpValue = otp.join('');

      console.log('otpValue', otpValue);

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
      console.log('OTP Verify Response:', data);

      if (data?.statusCode === 200) {
        setShowPopup1(false);
  
      } else {
        showToast(data?.message, 'error');
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


  const [showPopup1, setShowPopup1] = useState(false);
  const closePopup1 = () => setShowPopup1(false);

  const [emailName, setEmailName] = useState('');

  const inputs = useRef<Array<TextInput | null>>([]);

  const [isUpdateDisabled_personal, setIsUpdateDisabled_personal] =
    useState(true);
  const [isUpdateDisabled, setIsUpdateDisabled] = useState(true);
  const [updateText, setUpdateText] = useState('Update');


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

  const ClickPostalCode = async (postalCode: any) => {
    const cityName = await getCityFromPostalCode(postalCode);

    setUserMeta(prev => ({
      ...prev,
      city: cityName, // Only set city
    }));
  };

  const getCityFromPostalCode = async (postalCode: any) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${postalCode}&format=json&addressdetails=1`,
      );

      const data = await response.json();

      return (
        data[0]?.address?.city ||
        data[0]?.address?.town ||
        data[0]?.address?.village
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  };

    const getInitials = (firstName = '', lastName = '') => {
  const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
  const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
  return (f + l) || '?';
};


  const [typingTimeout, setTypingTimeout] = useState<any>(null);

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
        <View style={styles.headerContent} pointerEvents="box-none">
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
              style={[styles.blurButtonWrapper, animatedButtonStyle]}
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
            Edit Profile
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


            {photo ? (
                        <Image source={{ uri: photo}} style={styles.profilelogo} />
                      ) : (
                        <View style={styles.initialsCircle}>
                          <Text allowFontScaling={false} style={styles.initialsText}>
                            {getInitials(
                              userMeta?.firstname ?? 'A',
                              userMeta?.lastname ?? 'W',
                            )}
                          </Text>
                        </View>
                      )}


                  {/* <Image
                    source={
                      photo
                        ? { uri: photo }
                        : require('../../../assets/images/add1.png')
                    }
                    style={styles.profilelogo}
                    resizeMode="cover"
                  /> */}
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
                  First Name*
                </Text>
                <TextInput
                  value={userMeta.firstname || ''}
                  onChangeText={text =>
                    setUserMeta(prev => ({ ...prev, firstname: text }))
                  }
                  allowFontScaling={false}
                  style={styles.input}
                  placeholder="Enter First Name"
                  placeholderTextColor="#ccc"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label} allowFontScaling={false}>
                  Last Name*
                </Text>
                <TextInput
                  value={userMeta.lastname || ''}
                  onChangeText={text =>
                    setUserMeta(prev => ({ ...prev, lastname: text }))
                  }
                  allowFontScaling={false}
                  style={styles.input}
                  placeholder="Enter Last Name"
                  placeholderTextColor="#ccc"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label} allowFontScaling={false}>
                  Personal Email ID*
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    // paddingHorizontal: 12,
                    minHeight: 44, // or any desired height
                  }}
                >
                  <TextInput
                    style={{
                      flex: 1,
                      color: '#fff',
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
                    value={userMeta.email || ''}
                    onChangeText={text => {
                      setUserMeta(prev => ({ ...prev, email: text }));
                      if (text === initialPersonalEmail) {
                        console.log('condition_true (unchanged)');
                        setIsUpdateDisabled_personal(true);
                      } else {
                        console.log('condition_false (changed)');
                        setIsUpdateDisabled_personal(false);
                      }

                      console.log('text ---', text);
                      console.log('initialEmail ----', initialEmail);
                    }}
                    keyboardType="email-address"
                    placeholder="Enter Email"
                    placeholderTextColor="#ccc"
                  />
                  <TouchableOpacity
                    style={{
                      width: 32, 
                      height: 32,
              
                      backgroundColor: isUpdateDisabled_personal
                        ? '#99999980' // Fallback color for disabled
                        : 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.14) 100%)',
                      boxShadow: isUpdateDisabled_personal
                        ? ''
                        : 'rgba(255, 255, 255, 0.02)inset -1px 10px 5px 10px,rgba(236, 232, 232, 0.3)inset -0.99px -0.88px 0.90px 0px,rgba(236, 232, 232, 0.3)inset 0.99px 0.88px 0.90px 0px',
                      borderColor: isUpdateDisabled_personal ? '' : '#ffffff11',
                      borderRadius: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginEnd: 8,
                      opacity: isUpdateDisabled_personal ? 0.5 : 1,
                    }}
                    disabled={isUpdateDisabled_personal}
                    onPress={() => (
                      setShowPopup1(true),
                      sendOtp('personalEmail'),
                      setEmailName('personalEmail')
                    )}
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
                  Student Email ID*
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    paddingHorizontal: 4,
                    minHeight: 44,
                  }}
                >
                  <TextInput
                    style={{
                      flex: 1,
                      color: '#fff',
                      backgroundColor: 'transparent',
                      borderWidth: 0,
                      borderRadius: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 10,
                      fontFamily: 'Urbanist-Regular',
                      fontSize: 16,
                      fontWeight: 400,
                    }}
                    allowFontScaling={false}
                    value={userMeta.student_email || ''}
                    onChangeText={text => {
                      setUserMeta(prev => ({ ...prev, student_email: text }));

                      if (text === initialEmail) {
                        console.log('condition_true (unchanged)');
                        setIsUpdateDisabled(true);
                      } else {
                        console.log('condition_false (changed)');
                        setIsUpdateDisabled(false);
                      }

                      console.log('text ---', text);
                      console.log('initialEmail ----', initialEmail);
                    }}
                    keyboardType="email-address"
                    placeholder="Enter Student Email"
                    placeholderTextColor="#ccc"
                  />
                  <TouchableOpacity
                    style={{
                      width: 32, 
                      height: 32,
                      backgroundColor: isUpdateDisabled
                        ? '#99999980' 
                        : 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.14) 100%)',
                      boxShadow: isUpdateDisabled
                        ? ''
                        : 'rgba(255, 255, 255, 0.02)inset -1px 10px 5px 10px,rgba(236, 232, 232, 0.3)inset -0.99px -0.88px 0.90px 0px,rgba(236, 232, 232, 0.3)inset 0.99px 0.88px 0.90px 0px',
                      borderColor: isUpdateDisabled ? '' : '#ffffff11',
                      borderRadius: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginEnd: 4,
                      opacity: isUpdateDisabled ? 0.5 : 1,
                    }}
                    disabled={isUpdateDisabled}
                    onPress={() => (
                      setShowPopup1(true),
                      sendOtp('studentEmail'),
                      setEmailName('studentEmail')
                    )}
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
                  Postal Code*
                </Text>
                <TextInput
                  value={userMeta.postal_code || ''}
                  // onChangeText={text => {
                  //   const filteredText = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                  //   if (filteredText.trim().length > 7) return;
                  //   setUserMeta(prev => ({
                  //     ...prev,
                  //     postal_code: filteredText,
                  //   }));
                  //   if (filteredText.trim().length <= 7) {
                  //     ClickPostalCode(filteredText);
                  //   }
                  // }}
                  onChangeText={text => {
                    // Keep only letters + numbers, convert to uppercase
                    const filteredText = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                
                    // Limit length
                    if (filteredText.length > 7) return;
                
                    // Update state
                    setUserMeta(prev => ({
                      ...prev,
                      postal_code: filteredText,
                    }));
                
                    // Clear old timer
                    if (typingTimeout) {
                      clearTimeout(typingTimeout);
                    }
                
                    // Start new 3-sec timer
                    const timeout = setTimeout(() => {
                      if (filteredText.length > 0) {
                        ClickPostalCode(filteredText);
                      }
                    }, 3000); // 3 seconds
                
                    setTypingTimeout(timeout);
                  }}
                  allowFontScaling={false}
                  style={styles.input}
                  keyboardType="default"
                  placeholder="Enter Postal Code"
                  placeholderTextColor="#ccc"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label} allowFontScaling={false}>
                  City*
                </Text>
                <TextInput
                  allowFontScaling={false}
                  value={userMeta.city || ''}
                  onChangeText={text =>
                    setUserMeta(prev => ({ ...prev, city: text }))
                  }
                  style={styles.input}
                  placeholder="Enter City"
                  placeholderTextColor="#ccc"
                />
              </View>
            </View>

            <TouchableOpacity
              style={{
                top: 16,
                marginBottom: 16,
                height: 48,
                borderRadius: 30,
                backgroundColor: 'rgba(255,255,255,0.12)',
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: '#ffffff22',
              }}
              onPress={() => navigation.navigate('ChangePassword')}
            >
              <Text
                style={{
                  color: '#FFFFFF7A',
                  fontSize: 17,
                  fontWeight: '500',
                  fontFamily: 'Urbanist-Medium',
                }}
              >
                Change Password
              </Text>
            </TouchableOpacity>
          </AnimatedReanimated.ScrollView>
        </KeyboardAvoidingView>

        <Button
          title="Save Details"
          onPress={() => {
            handleSaveProfile();
          }}
        />
      </View>
      <NewCustomToastContainer />

      <Modal
        visible={showPopup1}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
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
                  {emailName === 'personalEmail'
                    ? 'Verify Personal Email ID'
                    : 'Verify Student Email ID'}
                </Text>

                <Text allowFontScaling={false} style={styles.subheader}>
                  We have sent a 4-digit code to{' '}
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: 'Urbanist-SemiBold',
                      fontWeight: '400',
                    }}
                  >
                    {emailName === 'personalEmail'
                      ? userMeta.email
                      : userMeta.student_email}
                  </Text>
                </Text>

                <View style={styles.otpContainer}>
                  {[0, 1, 2, 3].map((_, index) => (
                    <TextInput
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
                    Verify
                  </Text>
                </TouchableOpacity>


                <Text
                  allowFontScaling={false}
                  style={[styles.subheader, { marginBottom: 6 }]}
                >
                  Didn’t receive a code?{' '}
                  <Text
                    allowFontScaling={false}
                    style={{ color: '#FFFFFF7A' }}
                    onPress={() => sendOtp(emailName)}
                  >
                    Resend Code
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

              <View style={styles.popupContainer}>
                <Image
                  source={require('../../../assets/images/profile_delete.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text allowFontScaling={false} style={[styles.mainheader,{marginTop: 10}]}>
                  Do you want to delete the profile picture!
                </Text>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={async () => {
                    setShowDeleteModal(false);
                    await handleDeleteImage();
                    setPhoto(null);
                  }}
                >
                  <Text allowFontScaling={false} style={styles.loginText}>
                    Yes, Delete
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.loginButton1}
                  onPress={() => {
                    setShowDeleteModal(false);
                  }}
                >
                  <Text allowFontScaling={false} style={styles.loginText1}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ImageBackground>
  );
};

export default EditProfile;

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
    color: '#fff', 
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
  },
  othertext: {
    color: '#FFFFFF7A', 
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
    paddingTop: Platform.OS === 'ios' ? '15.2%' : 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
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
  },
  row1: {
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
    width: 100,
    height: 100,
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
  },

  inputEmail: {
    flex: 1,
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
  },

  
  updateButton: {
    marginLeft: 38,
    backgroundColor: '#FFFFFF8F',
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

   initialsCircle:{
    backgroundColor: '#8390D4',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  initialsText:{
   color: '#fff',
  fontSize: 36,
  fontWeight:600,
  textAlign: 'center',
  fontFamily: 'Urbanist-SemiBold',
  },
});
