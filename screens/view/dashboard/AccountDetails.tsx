import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { SquircleView } from 'react-native-figma-squircle';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useState, useEffect, useRef, useCallback, act } from 'react';
import { BlurView } from '@react-native-community/blur';
import { Constant } from '../../utils/Constant';
import Button from '../../utils/component/Button';
import {
  NewCustomToastContainer,
  showToast,
} from '../../utils/component/NewCustomToastManager';
import Loader from '../../utils/component/Loader';
import { useTranslation } from 'react-i18next';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';

type AccountDetailsProps = {
  navigation: any;
};
const bgImage = require('../../../assets/images/backimg.png');

const AccountDetails = ({ navigation }: AccountDetailsProps) => {
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

  const animatedStaticBackgroundStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(scrollY.value, [0, 30], [1, 0], 'clamp'),
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 40,
    };
  });

  const animatedBlurViewStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(scrollY.value, [0, 50], [0, 1], 'clamp'),
    };
  });

  const route = useRoute();
  const routeParams = route.params as { showSuccess?: boolean } | undefined;
  const { showSuccess = false } = routeParams || {};
  const [showConfirm1, setShowConfirm1] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const isFromOnboarding = useRef(false);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const { height } = Dimensions.get('window');
  const { t } = useTranslation();
  const tabs = ['Bank', 'Cards'];
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = (screenWidth * 0.9) / tabs.length;

  const [selectedTab, setSelectedTab] = useState<'Bank' | 'Cards'>('Bank');
  const bubbleTranslateX = useSharedValue(0);

  useEffect(() => {
    if (selectedTab !== 'Bank') return;
  }, [selectedTab, routeParams, showSuccess]);

  useEffect(() => {
    if (selectedTab !== 'Bank') return;

  }, [selectedTab, showSuccessPopup]);

  const fetchAccountDetails = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setLoading(false);
        return;
      }
      const url = `${MAIN_URL.baseUrl}transaction/account-detail`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.statusCode === 200) {
        setData(result.data);
      } else {
        console.error(
          'Error:',
          result.message || 'Failed to fetch account details',
        );
        showToast(result.message || 'Failed to fetch account details', 'error');
      }
    } catch (error) {
      console.error('API Error:', error);
      showToast(
        Constant.SOMTHING_WENT_WRONG || 'Something went wrong',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccountDetails();
  }, [fetchAccountDetails]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        isFromOnboarding.current = false;
      };
    }, []),
  );


  useEffect(() => {
    const index = tabs.indexOf(selectedTab);
    bubbleTranslateX.value = withSpring(index * tabWidth, {
      damping: 150,
      stiffness: 320,
    });
  }, [selectedTab]);

  const bubbleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: bubbleTranslateX.value }],
    };
  });

  const hasBankData = () => {
    if (!data?.stripeAccount?.merchant) {
      return false;
    }

    const merchants = Array.isArray(data.stripeAccount.merchant)
      ? data.stripeAccount.merchant
      : [data.stripeAccount.merchant];

    const hasActualBankData = merchants.some(
      (bank: any) =>
        bank &&
        (bank.bank_name || bank.last4 || bank.routing_number || bank.account_number),
    );

    return hasActualBankData;
  };

  useEffect(() => {
    const checkAndShowPopup = async () => {
      if (!showSuccess) {
        return;
      }
      isFromOnboarding.current = true;

      if (loading || !data) {

        return;
      }

      const hasData = hasBankData();
      const popupShown = await AsyncStorage.getItem(
        'onboardingSuccessPopupShown',
      );
      if ((!popupShown || popupShown !== 'true') && hasData) {

        setShowSuccessPopup(true);
        await AsyncStorage.setItem('onboardingSuccessPopupShown', 'true');
      } else {

      }
    };

    const timer = setTimeout(() => {
      checkAndShowPopup();
    }, 500);

    return () => clearTimeout(timer);
  }, [showSuccess, data, loading]);




  const fetchSavedCards = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const url = MAIN_URL.baseUrl + 'transaction/mysaved-cards';
      console.log(url)
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (json?.statusCode === 200) {
        setSavedCards(json?.data || []);
      } else {
        setSavedCards([]);
        showToast(json?.message || 'Failed to fetch cards', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (selectedTab !== 'Cards') return;
    fetchSavedCards();
  }, [selectedTab, fetchSavedCards]);

  const maskAccountNumber = (last4: string) => {
    if (!last4) return '****';
    return `****${last4}`;
  };

  const getPrimaryBanks = () => {
    if (!data?.stripeAccount?.merchant) return [];
    const merchants = Array.isArray(data.stripeAccount.merchant)
      ? data.stripeAccount.merchant
      : [data.stripeAccount.merchant];
    const primaryBanks = merchants.filter(
      (bank: any) => bank.default_for_currency === true,
    );

    return primaryBanks;
  };

  const getOtherBanks = () => {
    if (!data?.stripeAccount?.merchant) return [];
    const merchants = Array.isArray(data.stripeAccount.merchant)
      ? data.stripeAccount.merchant
      : [data.stripeAccount.merchant];
    const otherBanks = merchants.filter(
      (bank: any) => !bank.default_for_currency,
    );
    return otherBanks;
  };

  const handleAddBank = useCallback(async () => {
    try {
      setButtonLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const language_code = await AsyncStorage.getItem('selectedLanguage') || 'en'
      if (!token) {
        showToast(Constant.UNABLE_TO_LOGIN, 'error');
        setButtonLoading(false);
        return;
      }

      const url = `${MAIN_URL.baseUrl}transaction/account-onboarding-link`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          languagecode: language_code
        },
      });

      const result = await response.json();
      ;

      if (response.ok && result.statusCode === 200) {
        const accountLinkUrl = result.data?.url;

        if (accountLinkUrl) {
          navigation.navigate('StripeOnboardingScreen', {
            onboardingUrl: accountLinkUrl,
          });
        } else {
          console.error('Account link URL not found in response data');
          showToast(Constant.INVALID_ACCOUNT_LINK, 'error');
        }
      } else {
        console.error(
          'Error:',
          result.message || 'Failed to fetch account link',
        );
        showToast(result.message || 'Failed to fetch account link', 'error');
      }
    } catch (error) {
      console.error('API Error:', error);
      showToast(
        Constant.SOMTHING_WENT_WRONG || 'Something went wrong',
        'error',
      );
    } finally {
      setButtonLoading(false);
    }
  }, [navigation]);


  const handleAddCard = async () => {
    try {
      setButtonLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const language_code = await AsyncStorage.getItem('selectedLanguage') || 'en'
      if (!token) {
        setButtonLoading(false);
        return;
      }

      const url1 = MAIN_URL.baseUrl + 'transaction/create-setup-intent'
      console.log('➡️ [Create Setup Intent] URL:', url1);

      const res = await fetch(url1, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          languagecode: language_code
        },
      });

      const data = await res.json();
      const apiData = data?.data;
      if (!apiData?.client_secret || !apiData?.ephemeralKey || !apiData?.customer_id) {
        throw new Error("SetupIntent details missing from backend response");
      }

      const setupIntentClientSecret = apiData.client_secret;
      const ephemeralKey = apiData.ephemeralKey;
      const customerId = apiData.customer_id;


      console.log('✅ SetupIntent fields received:', {
        customerId,
        ephemeralKey: ephemeralKey ? 'present' : 'missing',
        setupIntentClientSecret: setupIntentClientSecret ? 'present' : 'missing',
      });

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "Your Company",
        customerId,
        customerEphemeralKeySecret: ephemeralKey,
        setupIntentClientSecret,
      });


      if (initError) {
        showToast(initError.message, "error");
        console.log('❌ initPaymentSheet error:', initError);
        return;
      }
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === "Canceled") return;
        showToast(presentError.message, "error");
        return;
      }
      showToast("Card added successfully ✅", "success");

      navigation.goBack();
    } catch (error: any) {
      showToast(error?.message || "Something went wrong", "error");
    } finally {
      setButtonLoading(false);
    }
  }
  const CardTile = ({ card, onDelete }: any) => {
    const brand = card.brand?.toUpperCase() || '';

    return (
      <View
        style={{
          borderRadius: 22,
          padding: 18,
          marginBottom: 12,
          backgroundColor: 'rgba(255,255,255,0.07)',
          borderWidth: 1,
         boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.25)',
          borderColor: 'rgba(255,255,255,0.12)',
          overflow: 'hidden',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {/* Chip */}
            <Image
              source={require('../../../assets/images/chip.png')}
              style={{
                width: 34,
                height: 26,
                resizeMode: 'contain',
                opacity: 0.95,
                marginRight: 10,
              }}
            />

            {/* Brand */}
            <Text
              style={{
                color: '#fff',
                fontSize: 15,
                fontFamily: 'Urbanist-SemiBold',
                lineHeight: 18, // ✅ keeps text centered
              }}
            >
              {brand}
            </Text>
          </View>

          {/* RIGHT */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => onDelete(card.id)}
              activeOpacity={0.7}
              style={{
                height: 36,
                width: 36,
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <Image
                source={require('../../../assets/images/delete_new.png')}
                style={{ width: 18, height: 18, resizeMode: 'contain', opacity: 0.9 }}
              />
            </TouchableOpacity>
          </View>
        </View>


        {/* Chip + Number */}
        <View style={{ marginTop: 0 }}>

          <Text
            style={{
              fontSize: 22,
              letterSpacing: 2.2,
              color: '#fff',
              fontFamily: 'Urbanist-Bold',
            }}
          >
            •••• •••• •••• {card.last4}
          </Text>
        </View>

        {/* Bottom Row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: 6,
          }}
        >
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontFamily: 'Urbanist-Regular' }}>
              {t('expiry')}
            </Text>

            <Text style={{ color: '#fff', fontSize: 15, marginTop: 3, fontFamily: 'Urbanist-SemiBold' }}>
              {card.exp_month}/{card.exp_year}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const dummyCards =
  savedCards?.length > 0
    ? Array.from({ length: 8 }, (_, i) => ({
        ...savedCards[0],
        id: `${savedCards[0].id}_${i}`,
        last4: `${1000 + i}`,
        isDefault: i === 0,
      }))
    : [];

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <Animated.View
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
        </Animated.View>

        <View style={styles.headerContent} pointerEvents="box-none">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (isFromOnboarding.current || !navigation.canGoBack()) {
                if (Platform.OS === 'ios') {
                  navigation.replace('Dashboard', {
                    AddScreenBackactiveTab: 'Profile',
                    isNavigate: false,
                  });
                } else {
                  navigation.navigate('Dashboard', {
                    AddScreenBackactiveTab: 'Profile',
                    isNavigate: false,
                  });
                }
                isFromOnboarding.current = false;
              } else {
                if (Platform.OS === 'ios') {
                  navigation.replace('Dashboard', {
                    AddScreenBackactiveTab: 'Profile',
                    isNavigate: false,
                  });
                } else {
                  navigation.goBack();
                }
              }
            }}
            style={styles.backButtonContainer}
          >
            <Animated.View
              style={[styles.blurButtonWrapper, animatedButtonStyle]}
            >
              <Animated.View
                style={[StyleSheet.absoluteFill, animatedStaticBackgroundStyle]}
              />
              <Animated.View
                style={[StyleSheet.absoluteFill, animatedBlurViewStyle]}
              >
                <BlurView
                  style={StyleSheet.absoluteFill}
                  blurType="light"
                  blurAmount={10}
                  reducedTransparencyFallbackColor="transparent"
                />
              </Animated.View>

              {/* Back Icon */}
              <Animated.Image
                source={require('../../../assets/images/back.png')}
                style={[{ height: 24, width: 24 }, animatedIconStyle]}
              />
            </Animated.View>
          </TouchableOpacity>

          <View style={{ width: 280 }}>
            <Text allowFontScaling={false} style={styles.unizyText}>
              {t('payment_methods')}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {

            }}
            style={styles.backButtonContainer}
          >
            <Animated.View
              style={[styles.blurButtonWrapper_none]}
            >
              <Animated.View
                style={[StyleSheet.absoluteFill, { display: 'none' }]}
              >
                <BlurView
                  style={StyleSheet.absoluteFill}
                  blurType="light"
                  blurAmount={10}
                  reducedTransparencyFallbackColor="transparent"
                />
              </Animated.View>

              {/* Back Icon */}
              <Animated.Image
                source={require('../../../assets/images/back.png')}
                style={[{ height: 24, width: 24, display: 'none' }]}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* ===== Tabs ===== */}
         <Animated.ScrollView
              contentContainerStyle={{
               paddingBottom: 100, // space for bottom button
                 }}
                 onScroll={scrollHandler}
                     scrollEventThrottle={16}
                 showsVerticalScrollIndicator={false}
                 >
        <View style={styles.bottomTabContainer}>
          <View style={{ height: 38 }}>
            <Animated.View
              style={[
                styles.bubble,
                {
                  width: tabWidth - 2,
                },
                bubbleAnimatedStyle,
              ]}
            />
          </View>

          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, { width: tabWidth }]}
              activeOpacity={0.7}
              onPress={() => setSelectedTab(tab as any)}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Urbanist-SemiBold',
                  color: selectedTab === tab ? '#FFFFFF' : '#89C7FF',
                  textAlign: 'center',
                }}
              >
                {t(tab)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>




        {loading ? (
          <Loader
            containerStyle={{
              // flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: Platform.OS === 'ios' ? 120 : 100,
            }}
          />
        ) : (

            
            <View style={{ flex: 1 }}>
             

            {selectedTab === 'Bank' && (
              <Animated.ScrollView
                contentContainerStyle={styles.scrollContainer}
                onScroll={scrollHandler}
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

                        <SquircleView
                          style={styles.card}
                          squircleParams={{
                            cornerSmoothing: 1,
                            cornerRadius: 24,
                            fillColor: 'rgba(255, 255, 255, 0.06)',
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
                              {t('profile_details')}
                            </Text>
                          </View>

                          <View style={styles.cardconstinerdivider} />

                          <View style={styles.listingtyperow}>
                            <Text allowFontScaling={false} style={styles.lebleHeader}>
                              {t('name')}:
                            </Text>
                            <Text allowFontScaling={false} style={styles.status}>
                              {(() => {
                                const merchants = data?.stripeAccount?.merchant;
                                if (Array.isArray(merchants) && merchants.length > 0) {
                                  return merchants[0]?.name || 'N/A';
                                }
                                return merchants?.name || 'N/A';
                              })()}
                            </Text>
                          </View>

                          <View style={styles.listingtyperow}>
                            <Text allowFontScaling={false} style={styles.lebleHeader}>
                              {t('email')}:
                            </Text>
                            <Text allowFontScaling={false} style={styles.status}>
                              {(() => {
                                const merchants = data?.stripeAccount?.merchant;
                                if (Array.isArray(merchants) && merchants.length > 0) {
                                  return merchants[0]?.email || 'N/A';
                                }
                                return merchants?.email || 'N/A';
                              })()}
                            </Text>
                          </View>
                        </SquircleView>

                        <View style={styles.carddivider} />

                        {getPrimaryBanks().length > 0 && (
                          <>
                            {getPrimaryBanks().map((bank: any, index: number) => (
                              <View

                                style={{ width: '100%', gap: 16 }}
                                key={`primary-${index}`}
                              >
                                <SquircleView
                                  style={styles.card}
                                  squircleParams={{
                                    cornerSmoothing: 1,
                                    cornerRadius: 24,
                                    fillColor: 'rgba(255, 255, 255, 0.06)',
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
                                      {t('bank_details')}
                                    </Text>
                                  </View>

                                  <View style={styles.cardconstinerdivider} />

                                  <View style={styles.listingtyperow}>
                                    <Text
                                      allowFontScaling={false}
                                      style={styles.lebleHeader}
                                    >
                                      {t('bank_name')}:
                                    </Text>
                                    <Text allowFontScaling={false} style={styles.status}>
                                      {bank.bank_name || 'N/A'}
                                    </Text>
                                  </View>

                                  <View style={styles.listingtyperow}>
                                    <Text
                                      allowFontScaling={false}
                                      style={styles.lebleHeader}
                                    >
                                      {t('acc_number')}:
                                    </Text>
                                    <Text allowFontScaling={false} style={styles.status}>
                                      {bank.last4 ? maskAccountNumber(bank.last4) : 'N/A'}
                                    </Text>
                                  </View>

                                  <View style={styles.listingtyperow}>
                                    <Text
                                      allowFontScaling={false}
                                      style={styles.lebleHeader}
                                    >
                                      {t('sort_code')}:
                                    </Text>
                                    <Text allowFontScaling={false} style={styles.status}>
                                      {bank.routing_number || 'N/A'}
                                    </Text>
                                  </View>
                                </SquircleView>
                                {index < getPrimaryBanks().length - 1}
                              </View>
                            ))}
                          </>
                        )}

                        {getOtherBanks().length > 0 && (
                          <>
                            {getPrimaryBanks().length > 0 && (
                              <View style={styles.carddivider} />
                            )}

                            {getOtherBanks().map((bank: any, index: number) => (
                              <View key={index} style={{ width: '100%', gap: 16 }}>
                                <SquircleView
                                  style={styles.card}
                                  squircleParams={{
                                    cornerSmoothing: 1,
                                    cornerRadius: 24,
                                    fillColor: 'rgba(255, 255, 255, 0.06)',
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
                                      {t('bank_details')}
                                    </Text>
                                  </View>

                                  <View style={styles.cardconstinerdivider} />

                                  <View style={styles.listingtyperow}>
                                    <Text
                                      allowFontScaling={false}
                                      style={styles.lebleHeader}
                                    >
                                      {t('bank_name')}:
                                    </Text>
                                    <Text allowFontScaling={false} style={styles.status}>
                                      {bank.bank_name || 'N/A'}
                                    </Text>
                                  </View>

                                  <View style={styles.listingtyperow}>
                                    <Text
                                      allowFontScaling={false}
                                      style={styles.lebleHeader}
                                    >
                                      {t('acc_number')}:
                                    </Text>
                                    <Text allowFontScaling={false} style={styles.status}>
                                      {bank.last4 ? maskAccountNumber(bank.last4) : 'N/A'}
                                    </Text>
                                  </View>

                                  <View style={styles.listingtyperow}>
                                    <Text
                                      allowFontScaling={false}
                                      style={styles.lebleHeader}
                                    >
                                      {t('sort_code')}:
                                    </Text>
                                    <Text allowFontScaling={false} style={styles.status}>
                                      {bank.routing_number || 'N/A'}
                                    </Text>
                                  </View>
                                </SquircleView>
                                {index < getOtherBanks().length - 1 && (
                                  <View style={styles.carddivider} />
                                )}
                              </View>
                            ))}
                          </>
                        )}


                        {getPrimaryBanks().length === 0 &&
                          getOtherBanks().length === 0 && (
                            <SquircleView
                              style={styles.card}
                              squircleParams={{
                                cornerSmoothing: 1,
                                cornerRadius: 24,
                                fillColor: 'rgba(255, 255, 255, 0.06)',
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
                                  {t('bank_details')}
                                </Text>
                              </View>

                              <View style={styles.cardconstinerdivider} />

                              <View style={styles.listingtyperow}>
                                <Text allowFontScaling={false} style={styles.status}>
                                  {t('no_bank')}
                                </Text>
                              </View>
                            </SquircleView>
                          )}
                      </View>
                    {/* </Animated.ScrollView> */}

              </Animated.ScrollView>
            )}


            {selectedTab === "Cards" && (
                <View style={{ flex: 1, paddingHorizontal: 16,paddingVertical:10 ,height: 900,maxHeight: 900}}>
                {loading ? (
                  <ActivityIndicator size="large" color="#fff" />
                ) : savedCards.length === 0 ? (
                  <View style={styles.emptyWrapper}>
                    <View
                      style={[
                        styles.emptyContainer,
                      ]}
                    >
                      <Image
                        source={require('../../../assets/images/noproduct.png')}
                        style={styles.emptyImage}
                        resizeMode="contain"
                      />
                      <Text allowFontScaling={false} style={styles.emptyText}>
                        {t('no_cards_found')}
                      </Text>
                    </View>
                  </View>
                ) : (
                  savedCards.map((card) => (
                    <CardTile
                      key={card.id}
                      card={card}
                      onDelete={() => {
                        setSelectedCardId(card.id);
                        setShowConfirm1(true);
                      }} />      
                  ))
                 
                )}
                   </View> 
                  // </Animated.ScrollView>
            )}
        
              </View>
        )}


        

        </Animated.ScrollView>
        {!loading && (
          <View style={styles.bottomButtonContainer}>
            {selectedTab === 'Bank' ? (
              <Button
                title={
                  buttonLoading
                    ? t('loading')
                    : data?.stripeAccount?.isboardcomplete
                      ? t('edit_bank_details')
                      : t('add_bank_details')
                }
                onPress={buttonLoading ? () => { } : handleAddBank}
              />
            ) : (
              <Button
                title={buttonLoading ? t('loading') : t('add_new_card')}
                onPress={buttonLoading ? () => { } : handleAddCard}
              />
            )}
          </View>
        )}
      </View>

      {/* Success Popup Modal */}
      <Modal
        visible={showSuccessPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessPopup(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSuccessPopup(false)}>
          <View style={styles.overlay}>
            <BlurView
              style={StyleSheet.absoluteFill}
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
            </BlurView>

            <View style={styles.popupContainer}>
              <Image
                source={require('../../../assets/images/success_icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text allowFontScaling={false} style={styles.mainheader}>
                {t('account_setup_success')}!
              </Text>
              <Text allowFontScaling={false} style={styles.subheader1}>
                {t('account_verified')}
              </Text>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={async () => {
                  setShowSuccessPopup(false);
                  // Ensure it's marked as shown
                  await AsyncStorage.setItem(
                    'onboardingSuccessPopupShown',
                    'true',
                  );
                }}
              >
                <Text allowFontScaling={false} style={styles.loginText}>
                  {t('ok')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showConfirm1}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm1(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowConfirm1(false)}>
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

              <View style={styles.popupContainer1}>
                <Image
                  source={require('../../../assets/images/profile_delete.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text allowFontScaling={false} style={styles.mainheader}>
                  {t('delete_card')}
                </Text>
                <Text allowFontScaling={false} style={styles.subheader}>
                  {t('delete_message_card')}
                </Text>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={async () => {
                    try {
                      if (!selectedCardId) return;
                      const token = await AsyncStorage.getItem('userToken');
                      const body = {
                        payment_method_id: selectedCardId,
                      };

                      const response = await fetch(`${MAIN_URL.baseUrl}transaction/delete-card`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify(body),
                      });

                      setShowConfirm1(false);
                      setSelectedCardId(null);


                      fetchSavedCards();
                    } catch (error) {
                      console.log('Delete card failed', error);
                    }
                  }}
                >
                  <Text allowFontScaling={false} style={styles.loginText}>
                    {t('yes_delete')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.loginButton1, { marginTop: Platform.OS === 'ios' ? 10 : 10 }]}
                  onPress={() => setShowConfirm1(false)}
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

      <NewCustomToastContainer />
    </ImageBackground>
  );
};
export default AccountDetails;

const styles = StyleSheet.create({
   categoryTabsScrollContent: { 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingHorizontal: 16,
    padding: 8
   },

  emptyWrapper: {
    // flex: 1,
    width: '100%',
    height: Platform.OS === 'ios' ? '70%' : '75%'
  },
  emptyContainer: {
    // flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 10 : 80,
    
    height: '97%'
  },

  emptyImage: {
    width: 64,
    height: 64,
    marginBottom: 0,
  },
  emptyText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600
  },

  subheader: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 6,
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

  bottomTabContainer: {

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    marginBottom: Platform.OS === 'ios' ? 15 : 15,
    borderRadius: 50,
    alignSelf: 'center',
    borderWidth: 0.4,
    borderColor: 'transparent',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23), -0.90px -0.80px 1px 0px rgba(255, 255, 255, 0.19)inset, 0.90px 0.80px 0.90px 0px rgba(255, 255, 255, 0.19)inset',
    backgroundColor: 'rgba(40, 55, 149, 0.12)',
    borderEndEndRadius: 50,
    borderStartEndRadius: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomStartRadius: 50,
    boxSizing: 'border-box',
    zIndex: 100,
    marginTop: 120,
  },
  bubble: {

    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.18)',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#ffffff2e',
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',
    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
    marginLeft: 2,

  },

  tabItem: {

  },
  iconWrapper: {
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  addButton: {
    height: 52,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#ffffff3a',
  },
  addButtonText: {
    color: '#002050',
    fontSize: 17,
    fontFamily: 'Urbanist-Bold',
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
    zIndex: 11,
  },
  headerContent: {
 
    position: 'absolute',
    top: (Platform.OS === 'ios' ? 60 : 40),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 11,
    alignSelf: 'center',
    pointerEvents: 'box-none',
    justifyContent: 'space-between',
  },
  blurButtonWrapper: {
    width: 48,
    height: 48,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 0.3,
    borderColor: '#ffffff11',

    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23),0px 0.90px 0px 0px rgba(255, 255, 255, 0.11) inset, 0px -0.90px 0px 0px rgba(255, 255, 255, 0.11) inset',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',

    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',

    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
    boxSizing: 'border-box',
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
  background: {
    flex: 1,
  },
  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    width: '100%',
  },
  backIconRow: {
    width: 48,
    height: 48,
    borderRadius: 40,
    padding: 12,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
  },
  fullScreenContainer: {
    flex: 1,
  },
  card: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    gap: 10,
    width: '100%',
    borderRadius: 24,
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
    fontWeight: '500',
    letterSpacing: -0.28,
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
    borderStyle: Platform.OS ==='ios' ? 'solid' : 'dashed',
    borderBottomWidth: Platform.OS ==='ios' ? 2 : 1,
    borderColor: (Platform.OS === 'ios' ? 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(186, 218, 255, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)' : '#4169B8'),

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
  scrollContainer: {
    paddingBottom: 100,
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
    paddingHorizontal: 16,
    width: Platform.OS === 'ios' ? '100%' : '100%',
    alignSelf: 'center',
    marginTop: 6,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 16,
    backgroundColor: 'transparent',
    zIndex: 5,
    width: Platform.OS === 'ios' ? '100%' : '100%',
    alignSelf: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  popupContainer: {
    width: '85%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    zIndex: 1000,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },
  mainheader: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  subheader1: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 6,
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
  loginText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    width: '100%',
  },
  sectionHeader: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  sectionHeaderText: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    letterSpacing: -0.32,
  },
});