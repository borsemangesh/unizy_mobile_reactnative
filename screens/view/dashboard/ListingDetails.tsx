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
} from 'react-native';
// import { showToast } from '../../utils/toast';
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

type ListingDetailsProps = {
  navigation: any;
};
const bgImage = require('../../../assets/images/backimg.png');
const ListingDetails = ({ navigation }: ListingDetailsProps) => {
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

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '']);

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
        showToast('Something went wrong', 'error');
      }
    } catch (error) {
      console.error('❌ API Error:', error);
      showToast('Failed to update product status', 'error');
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

  const otpverify = async () => {
    Keyboard.dismiss();

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('⚠️ Token not found. Cannot upload.');
        return;
      }
      const otpValue = otp.join('');
      const order_id = await AsyncStorage.getItem('last_order_id');

      // if (!otp_id) {
      //   showToast(Constant.OTP_ID_MISSING, 'error');
      //   return;
      // }

      const url = MAIN_URL.baseUrl + 'transaction/verify-post-order-otp';

      const createPayload = {
        // orderid: 'KX5WHMSX',
        // otp: '123456',
        otp:otpValue,
        orderid:selectedOrderId,
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
        showToast(data.message, 'success');
        setShowPopup2(true);
      } else {
        showToast(data?.message, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(Constant.SOMTHING_WENT_WRONG, 'error');
    }
  };

  const formatDateWithDash = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
            >
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.unizyText}>
              Listing Details
            </Text>
            <View style={{ width: 48 }} />
          </View>
        </View>

        <View>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            onScroll={Animated.event([
              {
                nativeEvent: { contentOffset: { y: scrollY1 } },
              },
            ])}
            scrollEventThrottle={16}
          >
            <View
              style={{
                gap: 16,
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}
            >
              {/* Card */}
              <View style={styles.card}>
                <View style={{ flexDirection: 'row' }}>
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
                      {' '}
                      {data?.list?.title}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={styles.productlableprice}
                    >
                      £{data?.list?.price}
                    </Text>
                    <View style={styles.univercitycontainer}>
                      <Text
                        allowFontScaling={false}
                        style={styles.universitylable}
                      >
                        {data?.list?.createdby?.university_name}
                      </Text>
                      <Text allowFontScaling={false} style={styles.datetlable}>
                        {formatDateWithDash(data?.list?.created_at)}
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
                    {data?.list?.isfeatured ? 'Featured' : 'Not Featured'}
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
              </View>
 
              <View style={styles.carddivider} />
 
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
 
                      {/* ✅ STATUS BADGE - only if otpverified */}
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
 
                    {/* BUYER DETAILS */}
                    <View style={styles.listingtyperow}>
                      <Text allowFontScaling={false} style={styles.lebleHeader}>
                        Buyer Name:
                      </Text>
                      <Text allowFontScaling={false} style={styles.status}>
                        {buyer.firstname} {buyer.lastname}
                      </Text>
                    </View>
 
                    <View style={styles.listingtyperow}>
                      <Text allowFontScaling={false} style={styles.lebleHeader}>
                        Buyer’s University:
                      </Text>
                      <Text allowFontScaling={false} style={styles.status}>
                        {buyer.university}
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
 
                    <View style={styles.listingtyperow}>
                      <Text allowFontScaling={false} style={styles.lebleHeader}>
                        Sold For:
                      </Text>
                      <Text allowFontScaling={false} style={styles.status}>
                        ${buyer.price}
                      </Text>
                    </View>
 
                    <View style={styles.cardconstinerdivider} />
 
                    {/* 🔢 Enter OTP Button - only if NOT verified */}
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
                            setSelectedOrderId(buyer.orderid); // store selected orderid in state
                            setShowPopup1(true);
                          }}
                        >
                          <Text allowFontScaling={false} style={styles.status}>
                            Enter OTP
                          </Text>
                        </TouchableOpacity>
                      </View>

                    )}
                  </View>
                ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.bottomview}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              if (data?.list?.isactive) {
                setShowConfirm(true);
              } else {
                handleDeactivate();
              }
            }}
          >
            <Text allowFontScaling={false} style={styles.cancelText}>
              {data?.list?.isactive ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelBtn, { backgroundColor: '#ffffffa7' }]}
            onPress={() => {
              if (data?.list?.ispurchased) {
                showToast('can not edit', 'error');
                return;
              }
              navigation.replace(
                'EditListScreen',
                {
                  productId: catagory_id,
                  productName: catagory_name,
                  shareid: shareid,
                },
                { animation: 'none' },
              );
            }}
          >
            <Text
              allowFontScaling={false}
              style={[styles.cancelText, { color: '#000000' }]}
            >
              Edit Listing
            </Text>
          </TouchableOpacity>
        </View>

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
                    // onPress={() => {
                    //   setShowPopup2(true);
                    //   }}
                    onPress={otpverify}
                  >
                    <Text allowFontScaling={false} style={styles.loginText}>
                      Verify
                    </Text>
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
                    The payment of $10 has been transferred to your account.
                  </Text>
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => {
                      navigation.replace('Dashboard', {
                        AddScreenBackactiveTab: 'Home',
                        isNavigate: false,
                      });
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

        {/* Confirm Deactivate Modal (only shown when currently active) */}
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

  initialsCircle: {
    backgroundColor: '#8390D4',
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    height: 76,
    borderRadius: 16,
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
    width: (Platform.OS === 'ios' ? 40 : 48),
    height: (Platform.OS === 'ios' ? 40 : 48),
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
  image: {
    width: 72,
    height: 76,
    borderRadius: 16,
  },
  univercitycontainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productlebleHeader: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight: 16,
    fontFamily: 'Urbanist-SemiBold',
    paddingTop: 10,
  },
  productlableprice: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight: 16,
    fontFamily: 'Urbanist-SemiBold',
  },
  universitylable: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight: 16,
    fontFamily: 'Urbanist-Medium',
  },
  datetlable: {
    marginLeft: 10,
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight: 16,
    fontFamily: 'Urbanist-Medium',
  },
  carddivider: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    height: 1.5,
    // backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    // boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    // : 'rgba(255, 255, 255, 0.20)',
    borderBottomColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
  },
  cardconstinerdivider: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 1.5,
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    borderBottomColor: '#4169B8',
  },
  sellerHeaderlable: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight: 16,
    fontFamily: 'Urbanist-SemiBold',
  },
  scrollContainer: {
    paddingBottom: 180,
    // paddingTop: 90,
    // paddingHorizontal: 20,
    paddingHorizontal: 16,
    width: '100%',
  },
  bottomview: {
    position: 'absolute',
    padding: 6,
    width: '100%',
    height: 60,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#5d5c5c14',
    zIndex: 10,
    bottom: (Platform.OS === 'ios' ? 15 : 10),
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

export default ListingDetails;