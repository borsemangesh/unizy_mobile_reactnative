
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  Keyboard,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
import { useRoute } from '@react-navigation/native';
import {
  NewCustomToastContainer,
  showToast,
} from '../../utils/component/NewCustomToastManager';
import { useState, useEffect, useRef, useCallback } from 'react';
import { BlurView } from '@react-native-community/blur';
import { Constant } from '../../utils/Constant';

import AnimatedReanimated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import ButtonNew from '../../utils/component/ButtonNew';
import Loader from '../../utils/component/Loader';

type ListingDetailsProps = {
  navigation: any;
};
const bgImage = require('../../../assets/images/backimg.png');
const ViewListingDetails = ({ navigation }: ListingDetailsProps) => {
  const [showPopup1, setShowPopup1] = useState(false);
  const closePopup1 = () => setShowPopup1(false);

  const [showPopup2, setShowPopup2] = useState(false);
  const closePopup2 = () => setShowPopup2(false);

  const scrollY1 = new Animated.Value(0);
  const route = useRoute();
  //const { shareid } = route.params as { shareid: number };
  const { shareid = 1 } = (route.params as { shareid?: number }) || {};
  const { catagory_id = 0 } = (route.params as { catagory_id?: number }) || {};
  const { catagory_name = '' } =
    (route.params as { catagory_name?: string }) || {};

  const inputs = useRef<Array<TextInput | null>>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const { height } = Dimensions.get('window');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [price, setprice] = useState('')
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
    const opacity = interpolate(scrollY.value, [0, 300], [0, 1], 'clamp');
    return { opacity };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    'worklet';
    const borderColor = interpolateColor(
      scrollY.value,
      [0, 300],
      ['rgba(255, 255, 255, 0.56)', 'rgba(255, 255, 255, 0.56)'],
    );
    const redOpacity = interpolate(scrollY.value, [0, 100], [0, 0.15], 'clamp');
    return {
      borderColor,
      backgroundColor: `rgba(255, 255, 255, ${redOpacity})`,
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(scrollY.value, [0, 100], [0.8, 1], 'clamp');
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


  const fetchDetails = useCallback(async () => {
    try {
      console.log('shareidListDetails:', shareid, catagory_id);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      const url = `${MAIN_URL.baseUrl}category/mylisting-details/${shareid}`;
      console.log('APIListingDetailsurl: ', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const result = await response.json();
      console.log('APIListingDetailsResponse: ', result);
      if (response.ok) {
        setData(result.data);
      } else {
        console.error('Error:', result.message || 'Failed to fetch details');
      }
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  }, [shareid, catagory_id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleDeactivate = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const url2 = `${MAIN_URL.baseUrl}category/feature/active-inactive`;
      const response = await fetch(url2, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: shareid,
        }),
      });

      const data1 = await response.json();
      console.log('API Response List details:', data1);

      if (data1.message) {
        showToast(
          data1.message,
          data1.statusCode === 200 ? 'success' : 'error',
        );
        // Refresh details so status updates immediately
        await fetchDetails();
      } else {
        showToast(Constant.SOMTHING_WENT_WRONG, 'error');
      }
    } catch (error) {
      console.error('❌ API Error:', error);
    }
  };
  useEffect(() => {
    if (showPopup1) {
      const timer = setTimeout(() => {
        inputs.current[0]?.focus();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [showPopup1]);

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
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('⚠️ Token not found. Cannot upload.');
        setLoading(false);
        return;
      }
      const otpValue = otp.join('');
      const order_id = await AsyncStorage.getItem('last_order_id');

      const url = MAIN_URL.baseUrl + 'transaction/verify-post-order-otp';

      const createPayload = {
        otp: otpValue,
        orderid: selectedOrderId,
      };

      console.log(url);
      console.log(createPayload);

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
        setLoading(false);
        showToast(data.message, 'success');
        setShowPopup2(true);
      } else {
        setLoading(false);
        setShowPopup1(false);
        showToast(data?.message, 'error');
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      showToast(Constant.SOMTHING_WENT_WRONG, 'error');
    }
  };

  const formatDateWithDash = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const day = date.getDate();

    let suffix = "th";
    if (day % 10 === 1 && day !== 11) suffix = "st";
    else if (day % 10 === 2 && day !== 12) suffix = "nd";
    else if (day % 10 === 3 && day !== 13) suffix = "rd";

    const monthShort = date
      .toLocaleString("default", { month: "short" }); // "Nov"

    const year = date.getFullYear();
    return `${day}${suffix} ${monthShort} ${year}`;
  };
  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        <StatusBar translucent
          backgroundColor="transparent"
          barStyle="light-content" />
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
              // overlayColor="rgba(255,255,255,0.05)"
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
        <View style={styles.headerContent} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => { navigation.goBack(); }}
            style={styles.backButtonContainer}
            activeOpacity={0.7} >
            <AnimatedReanimated.View
              style={[styles.blurButtonWrapper, animatedButtonStyle]}>
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
            Listing Details
          </Text>
        </View>

        <AnimatedReanimated.ScrollView
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContainer,
            {
              paddingBottom: Platform.select({
                ios: 90,
                android: height * 0.1,
              })
            },
          ]}>
          <View
            style={{
              gap: 16,
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* Card */}
            <View style={[styles.card, { marginTop: (Platform.OS === 'ios' ? 6 : 10) }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {(() => {
                  // Check if category is housekeeping or tuition
                  const categoryName = data?.list?.category?.name || '';
                  const isProfileCategory = categoryName?.toLowerCase() === 'house keeping' || categoryName?.toLowerCase() === 'tuition';
                  const profilePhoto = data?.list?.createdby?.profile;
                  const firstName = data?.list?.createdby?.firstname;
                  const lastName = data?.list?.createdby?.lastname;

                  // Get initials helper function
                  const getInitials = (first: string | null = '', last: string | null = '') => {
                    const f = first?.trim()?.charAt(0)?.toUpperCase() || '';
                    const l = last?.trim()?.charAt(0)?.toUpperCase() || '';
                    return (f + l) || '?';
                  };

                  // Determine what to show
                  const shouldShowProfile = isProfileCategory && profilePhoto;
                  const shouldShowInitials = isProfileCategory && !profilePhoto;

                  if (shouldShowInitials) {
                    return (
                      <View style={styles.initialsCircle}>
                        <Text allowFontScaling={false} style={styles.initialsText}>
                          {getInitials(firstName, lastName)}
                        </Text>
                      </View>
                    );
                  } else if (shouldShowProfile) {
                    return (
                      <Image
                        source={{ uri: profilePhoto }}
                        style={styles.image}
                        resizeMode="cover"
                      />
                    );
                  } else {
                    return (
                      <Image
                        source={{
                          uri: data?.list?.profileshowinview
                            ? data?.list?.createdby?.profile
                            : data?.list?.thumbnail,
                        }}
                        style={styles.image}
                        resizeMode="cover"
                      />
                    );
                  }
                })()}
                <View style={{ marginLeft: 10, gap: 8 }}>
                  <Text
                    allowFontScaling={false}
                    style={styles.productlebleHeader}
                  >
                    {data?.list?.title}
                  </Text>
                  <View style={styles.rightSection}>
                    <Text allowFontScaling={false} style={styles.productlableprice}>
                      £{data?.list?.price}
                    </Text>
                    <Text allowFontScaling={false} style={styles.datetlable}>
                      {formatDateWithDash(data?.list?.created_at)}
                    </Text>
                  </View>


                  <View style={styles.univercitycontainer}>
                    <Text allowFontScaling={false} style={styles.universitylable}>
                      {data?.list?.createdby?.university_name}
                    </Text>
                  </View>

                </View>
              </View>
              <View style={styles.cardconstinerdivider} />
              <View style={styles.listingtyperow}>
                <Text allowFontScaling={false} style={styles.lebleHeader}>
                  Listing Type:
                </Text>
                <Text allowFontScaling={false} style={styles.status}>
                  {data?.list?.isfeatured ? 'Featured' : 'Regular'}
                </Text>
              </View>
              <View style={styles.listingtyperow}>
                <Text allowFontScaling={false} style={styles.lebleHeader}>
                  Listing Status:
                </Text>
                <Text allowFontScaling={false} style={styles.status}>
                  {' '}
                  {data?.list?.isactive ? 'Active' : 'Inactive'}
                </Text>
              </View>
              {data?.list?.category_id === 3 && data?.list?.isactive && (
                <View style={styles.listingtyperow}>
                  <Text allowFontScaling={false} style={styles.lebleHeader}>
                    Available Units:
                  </Text>

                  <Text allowFontScaling={false} style={styles.status}>
                    {data?.list?.remaining_quantity}
                  </Text>
                </View>
              )}
            </View>

            {/* <View style={styles.carddivider} /> */}
            {Array.isArray(data?.buyers) && data.buyers.length > 0 && (
              <View style={styles.carddivider} />
            )}

            {Array.isArray(data?.buyers) &&
              data.buyers.map((buyer: any, index: number) => (
                <View key={index} style={styles.card}>
                  {/* HEADER */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      justifyContent: buyer.otpverified
                        ? 'space-between'
                        : 'flex-start',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Image
                        source={require('../../../assets/images/sellerfile.png')}
                        style={{ width: 24, height: 24 }}
                        resizeMode="cover"
                      />
                      <Text
                        allowFontScaling={false}
                        style={styles.sellerHeaderlable}
                      >
                        Sale Details
                      </Text>
                    </View>

                    {buyer.otpverified && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.18)',
                          paddingHorizontal: 6,
                          paddingVertical: 4,
                          borderRadius: 6,
                          gap: 4,
                        }}
                      >
                        <Text
                          allowFontScaling={false}
                          style={{
                            color: 'rgba(255, 255, 255, 0.88)',
                            fontFamily: 'Urbanist-Regular',
                            fontSize: 12,
                            fontWeight: '600',
                          }}
                        >
                          Completed
                        </Text>
                        <Image
                          source={require('../../../assets/images/tick.png')}
                          style={{ width: 12, height: 12 }}
                          resizeMode="cover"
                        />
                      </View>
                    )}
                  </View>

                  <View style={styles.cardconstinerdivider} />

                  <View style={styles.listingtyperow}>
                    <Text allowFontScaling={false} style={styles.lebleHeader}>
                      Buyer Name:
                    </Text>
                    <Text allowFontScaling={false} style={styles.status}>
                      {buyer.firstname} {buyer.lastname}
                    </Text>
                  </View>
                  <View style={styles.listingtyperow1}>
                    <Text allowFontScaling={false} style={styles.lebleHeader}>
                      Buyer’s University:
                    </Text>
                    <Text allowFontScaling={false} numberOfLines={0} style={styles.unistatus}>
                      {buyer.university_name}
                    </Text>
                  </View>

                  <View style={styles.listingtyperow}>
                    <Text allowFontScaling={false} style={styles.lebleHeader}>
                      City:
                    </Text>
                    <Text allowFontScaling={false} style={styles.status}>
                      {buyer.city}
                    </Text>
                  </View>

                  <View style={styles.listingtyperow}>
                    <Text allowFontScaling={false} style={styles.lebleHeader}>
                      Sold On:
                    </Text>
                    <Text allowFontScaling={false} style={styles.status}>
                      {new Date(buyer.date).toLocaleString('en-GB', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </Text>
                  </View>

                  {data?.list?.category_id === 3 && (
                    <View style={styles.listingtyperow}>
                      <Text allowFontScaling={false} style={styles.lebleHeader}>
                        Units Purchased:
                      </Text>

                      <Text allowFontScaling={false} style={styles.status}>
                        {buyer?.purchased_quantity ?? 1}
                      </Text>
                    </View>
                  )}

                  <View style={styles.listingtyperow}>
                    <Text allowFontScaling={false} style={styles.lebleHeader}>
                      Sold For:
                    </Text>
                    <Text allowFontScaling={false} style={styles.status}>
                      £{buyer.price}
                    </Text>
                  </View>

                  {!buyer.otpverified && (
                    <View style={styles.cardconstinerdivider} />
                  )}

                  {!buyer.otpverified && (
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          width: '100%',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        //onPress={() => setShowPopup1(true)}
                        onPress={() => {
                          setSelectedOrderId(buyer.orderid);
                          setprice(buyer.originalprice)
                          setShowPopup1(true);
                        }}
                      >
                        <Text allowFontScaling={false} style={styles.status1}>
                          Enter OTP
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
          </View>
        </AnimatedReanimated.ScrollView>

        <Modal
          visible={showPopup1}
          transparent
          animationType="fade"
          onRequestClose={closePopup1}
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

                {loading && (
                  <View style={styles.fullLoader}>
                    {/* <ActivityIndicator size="large" color="#fff" /> */}
                    <Loader />
                  </View>
                )}

                <View style={styles.popupContainer}>
                  <Text allowFontScaling={false} style={styles.mainheader}>
                    Enter Delivery OTP
                  </Text>

                  <Text allowFontScaling={false} style={styles.subheader}>
                    Please enter the 6-digit OTP shared by the buyer to confirm
                    delivery.
                  </Text>

                  <View style={styles.otpContainer}>
                    {[0, 1, 2, 3, 4, 5].map((_, index) => (
                      <TextInput
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
                    onPress={otpverify}>
                    <Text allowFontScaling={false} style={styles.loginText}>Verify</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.loginButton1}
                    onPress={() => {
                      setShowPopup1(false);
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

        <Modal
          visible={showPopup2}
          transparent
          animationType="fade"
          onRequestClose={closePopup2}
        >
          <TouchableWithoutFeedback onPress={() => {
            navigation.goBack();
          }}>
            <View style={styles.overlay}>
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

                <View style={styles.popupContainer}>
                  <Image
                    source={require('../../../assets/images/success_icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                  <Text allowFontScaling={false} style={styles.mainheader}>
                    Order Fulfilled!
                  </Text>
                  <Text allowFontScaling={false} style={styles.subheader1}>
                    Delivery Verified
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={[styles.subheader1, { marginTop: 0 }]}
                  >
                    The payment of £{price} has been transferred to your account.
                  </Text>
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => {
                      navigation.goBack();
                    }}
                  >
                    <Text allowFontScaling={false} style={styles.loginText}>
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal
          visible={showConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowConfirm(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowConfirm(false)}>
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
                    { backgroundColor: 'rgba(0, 0, 0, 0.32)' },
                  ]}
                />

                <View style={styles.popupContainer}>
                  <Image
                    source={require('../../../assets/images/alerticon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                  <Text allowFontScaling={false} style={styles.mainheader}>
                    Deactivate Listing
                  </Text>
                  <Text allowFontScaling={false} style={styles.subheader}>
                    Are you sure you want to deactivate this listing?
                  </Text>

                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={async () => {
                      await handleDeactivate();
                      setShowConfirm(false);
                    }}
                  >
                    <Text allowFontScaling={false} style={styles.loginText}>
                      Deactivate
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.loginButton1}
                    onPress={() => setShowConfirm(false)}
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
      </View>
      <NewCustomToastContainer />
    </ImageBackground>
  );
};


const styles = StyleSheet.create({

  fullLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,   // ensure it appears above modal content
  },
  rightSection: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    //alignItems: 'center',
    width: '89%',
  },
  productlableprice: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight: 16,
    fontFamily: 'Urbanist-SemiBold',
  },

  datetlable: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight: 16,
    fontFamily: 'Urbanist-Medium',
    textAlign: 'right',
    marginLeft: 'auto',
    flexShrink: 1,
    fontSize: 14,
  },
  univercitycontainer: {
    maxWidth: '85%',
  },
  universitylable: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontFamily: 'Urbanist-Medium',
    flexShrink: 1,
    flexWrap: 'wrap',
    width: '100%',
  },
  listingtyperow1: {
    width: '100%',
    // display: 'flex',
    flexDirection: 'row',
    //justifyContent: 'space-between',
  },
  unistatus: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.28,
    lineHeight: 16,
    fontFamily: 'Urbanist-SemiBold',
    //    maxWidth:'70%',
    flex: 1,           // takes remaining space
    textAlign: 'right', // right aligned
    flexWrap: 'wrap',
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
    top: Platform.OS === 'ios' ? '8.5%' : 60,
    width: Platform.OS === 'ios' ? 393 : '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 11,
    alignSelf: 'center',
    pointerEvents: 'box-none',
    marginTop: (Platform.OS === 'ios' ? 0 : 0),
    marginLeft: 1
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


  initialsCircle: {
    backgroundColor: '#8390D4',
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    height: 72,
    borderRadius: 14,
  },
  initialsText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 600,
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    alignSelf: 'center',
    gap: 6, // works in RN 0.71+, otherwise use marginRight
    marginTop: 16,
  },

  otpBox: {
    width: (Platform.OS === 'ios' ? 42 : 48),
    height: (Platform.OS === 'ios' ? 42 : 48),
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

  subheader1: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: -0.28,
    lineHeight: 19.6,
  },

  logo: {
    width: 64,
    height: 64,
    marginBottom: 20,
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

  popupContainer: {
    width: '85%',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    overflow: 'hidden',

    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullScreenContainer: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 50,
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
    //marginTop:17
  },

  card: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    overflow: 'hidden',
    gap: 10,
    width: '100%',
  },
  listingtyperow: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lebleHeader: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.28,
    lineHeight: 16,
    fontFamily: 'Urbanist-Medium',
  },
  status: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.28,
    lineHeight: 16,
    fontFamily: 'Urbanist-SemiBold',
  },
  status1: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.28,
    lineHeight: 16,
    fontFamily: 'Urbanist-SemiBold',
    padding: 10
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 14,
  },
  // univercitycontainer: {
  //   display: 'flex',
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  // },
  productlebleHeader: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight: 16,
    fontFamily: 'Urbanist-SemiBold',
    paddingTop: 10,
  },

  dottext: {
    marginLeft: 10,
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight: 16,
    fontFamily: 'Urbanist-Medium',
    alignSelf: 'center'
  },
  carddivider: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginLeft: 1,
    height: (Platform.OS === 'ios' ? 1.5 : 1.5),
    borderColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderStyle: 'solid',
    borderWidth: (Platform.OS === 'ios' ? 0.9 : 1),
  },
  cardconstinerdivider: {

    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: (Platform.OS === 'ios' ? 2 : 1.5),
    borderStyle: 'dashed',
    borderBottomWidth: (Platform.OS === 'ios' ? 0.9 : 1),
    // backgroundColor: 'rgba(169, 211, 255, 0.08)',
    borderColor: (Platform.OS === 'ios' ? 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(186, 218, 255, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)' : '#4169B8'),

  },
  sellerHeaderlable: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight: 16,
    fontFamily: 'Urbanist-SemiBold',
  },
  // scrollContainer: {
  //   paddingBottom: 180,
  //   // paddingTop: 90,
  //   // paddingHorizontal: 20,
  //   paddingHorizontal: 16,
  //   width: '100%',
  // },

  scrollContainer: {
    //paddingHorizontal: 20,
    paddingBottom: 80,
    paddingTop: Platform.OS === 'ios' ? 120 : 100,
    paddingHorizontal: 16,
  },
  bottomview: {
    position: 'absolute',
    padding: 6,
    width: '95%',
    height: 60,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#5d5c5c14',
    zIndex: 10,
    bottom: (Platform.select({ ios: 10, android: -10 })),
    marginBottom: Platform.OS === 'ios' ? 10 : 20,

  },
  cancelBtn: {
    flex: 1,
    marginRight: 8,
    padding: 12,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    // boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',

    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderBlockStartColor: '#ffffff47',
    borderBlockColor: '#ffffff47',

    borderTopColor: '#ffffff47',
    borderBottomColor: '#ffffff47',
    borderLeftColor: '#ffffff47',
    borderRightColor: '#ffffff47',

    boxSizing: 'border-box',
  },
  cancelText: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0.17,
    lineHeight: 22,
  },
});

export default ViewListingDetails;