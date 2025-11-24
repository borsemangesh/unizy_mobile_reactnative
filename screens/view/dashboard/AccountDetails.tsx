import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  Keyboard,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { SquircleView } from 'react-native-figma-squircle';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useState, useEffect, useRef, useCallback } from 'react';
import { BlurView } from '@react-native-community/blur';
import { Constant } from '../../utils/Constant';
import Button from '../../utils/component/Button';
import {
  NewCustomToastContainer,
  showToast,
} from '../../utils/component/NewCustomToastManager';
import Loader from '../../utils/component/Loader';

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

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const isFromOnboarding = useRef(false);

  // Debug log to check route params
  useEffect(() => {
    console.log('AccountDetails - Route params:', routeParams);
    console.log('AccountDetails - showSuccess value:', showSuccess);
  }, [routeParams, showSuccess]);

  // Debug log when popup state changes
  useEffect(() => {
    console.log('AccountDetails - showSuccessPopup state:', showSuccessPopup);
  }, [showSuccessPopup]);

  const fetchAccountDetails = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setLoading(false);
        return;
      }
      const url = `${MAIN_URL.baseUrl}transaction/account-detail`;
      console.log('API Account Details URL: ', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const result = await response.json();
      console.log('API Account Details Response: ', result);
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

  // Reset onboarding flag when screen loses focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Reset flag when screen loses focus
        isFromOnboarding.current = false;
      };
    }, []),
  );

  // Helper function to check if bank data is present (indicates onboarding was completed)
  const hasBankData = () => {
    // Check if merchant data exists
    if (!data?.stripeAccount?.merchant) {
      return false;
    }
    
    const merchants = Array.isArray(data.stripeAccount.merchant)
      ? data.stripeAccount.merchant
      : [data.stripeAccount.merchant];
    
    // Check if there's at least one merchant with actual bank details
    // This is the most reliable indicator that onboarding was completed successfully
    const hasActualBankData = merchants.some(
      (bank: any) =>
        bank &&
        (bank.bank_name || bank.last4 || bank.routing_number || bank.account_number),
    );
    
    return hasActualBankData;
  };

  // Show success popup only once when redirected from onboarding AND bank data is present
  useEffect(() => {
    const checkAndShowPopup = async () => {
      // Don't show if not coming from onboarding
      if (!showSuccess) {
        return;
      }

      // Mark that we're coming from onboarding
      isFromOnboarding.current = true;

      // Wait for data to be loaded
      if (loading || !data) {
        console.log('Waiting for data to load...');
        return;
      }

      // Check if bank data is actually present
      const hasData = hasBankData();
      console.log('Bank data check - hasData:', hasData);

      if (!hasData) {
        console.log('No bank data present, not showing popup');
        return;
      }

      // Check if popup was already shown for this session
      const popupShown = await AsyncStorage.getItem(
        'onboardingSuccessPopupShown',
      );
      console.log(
        'Popup check - showSuccess:',
        showSuccess,
        'popupShown:',
        popupShown,
        'hasBankData:',
        hasData,
      );

      // Only show if not already shown and bank data is present
      if ((!popupShown || popupShown !== 'true') && hasData) {
        console.log('Showing success popup - all conditions met');
        setShowSuccessPopup(true);
        // Mark as shown so it won't show again
        await AsyncStorage.setItem('onboardingSuccessPopupShown', 'true');
      } else {
        console.log('Popup already shown previously or no bank data, skipping');
      }
    };

    // Add a small delay to ensure route params and component are ready
    const timer = setTimeout(() => {
      checkAndShowPopup();
    }, 500);

    return () => clearTimeout(timer);
  }, [showSuccess, data, loading]);

  const maskAccountNumber = (last4: string) => {
    if (!last4) return '****';
    return `****${last4}`;
  };

  // Get all primary banks (all banks with default_for_currency: true)
  const getPrimaryBanks = () => {
    if (!data?.stripeAccount?.merchant) return [];
    const merchants = Array.isArray(data.stripeAccount.merchant)
      ? data.stripeAccount.merchant
      : [data.stripeAccount.merchant];
    const primaryBanks = merchants.filter(
      (bank: any) => bank.default_for_currency === true,
    );
    console.log('Primary Banks:', primaryBanks);
    return primaryBanks;
  };

  // Get other banks (all banks without default_for_currency: true)
  const getOtherBanks = () => {
    if (!data?.stripeAccount?.merchant) return [];
    const merchants = Array.isArray(data.stripeAccount.merchant)
      ? data.stripeAccount.merchant
      : [data.stripeAccount.merchant];
    const otherBanks = merchants.filter(
      (bank: any) => !bank.default_for_currency,
    );
    console.log('Other Banks:', otherBanks);
    console.log(
      'Total merchants:',
      merchants.length,
      'Primary banks count:',
      getPrimaryBanks().length,
      'Other banks count:',
      otherBanks.length,
    );
    return otherBanks;
  };

  const handleAddBank = useCallback(async () => {
    try {
      setButtonLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        showToast('Please login to continue', 'error');
        setButtonLoading(false);
        return;
      }

      const url = `${MAIN_URL.baseUrl}transaction/account-onboarding-link`;
      console.log('API Account Link URL: ', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const result = await response.json();
      console.log('API Account Link Response: ', result);
      console.log('Account Link URL from response: ', result.data?.url);

      if (response.ok && result.statusCode === 200) {
        const accountLinkUrl = result.data?.url;

        if (accountLinkUrl) {
          console.log(
            'Navigating to StripeOnboardingScreen with URL:',
            accountLinkUrl,
          );
          // Navigate to StripeOnboardingScreen with the URL (same as onboarding flow)
          navigation.navigate('StripeOnboardingScreen', {
            onboardingUrl: accountLinkUrl,
          });
        } else {
          console.error('Account link URL not found in response data');
          showToast('Account link URL not found in response', 'error');
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

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        {/* Header with Blur only at top */}
        <Animated.View
          style={[styles.headerWrapper, animatedBlurStyle]}
          pointerEvents="none"
        >
          {/* Blur layer only at top with gradient fade */}
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

        {/* Header Content */}
        <View style={styles.headerContent} pointerEvents="box-none">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              // If coming from onboarding or can't go back, navigate to Dashboard
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
                // Reset flag after navigation
                isFromOnboarding.current = false;
              } else {
                // Normal back navigation
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
              {/* Static background (visible when scrollY = 0) */}
              <Animated.View
                style={[StyleSheet.absoluteFill, animatedStaticBackgroundStyle]}
              />

              {/* Blur view fades in as scroll increases */}
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

          <Text allowFontScaling={false} style={styles.unizyText}>
            Bank Details
          </Text>
        </View>

        {loading ? (
          <Loader
            containerStyle={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: Platform.OS === 'ios' ? 120 : 100,
            }}
          />
        ) : (
          <View>
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
              {/* Profile Details Card */}
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
                    Profile Details
                  </Text>
                </View>

                <View style={styles.cardconstinerdivider} />

                <View style={styles.listingtyperow}>
                  <Text allowFontScaling={false} style={styles.lebleHeader}>
                    Name:
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
                    Email:
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

              {/* Primary Bank Section */}
              {getPrimaryBanks().length > 0 && (
                <>
                  {getPrimaryBanks().map((bank: any, index: number) => (
                    <View
                      key={`primary-${index}`}
                      style={{ width: '100%', gap: 16 }}
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
                            Bank Details
                          </Text>
                        </View>

                        <View style={styles.cardconstinerdivider} />

                        <View style={styles.listingtyperow}>
                          <Text
                            allowFontScaling={false}
                            style={styles.lebleHeader}
                          >
                            Bank Name:
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
                            Account Number:
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
                            Sort Code:
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

              {/* Other Banks Section */}
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
                            Bank Details
                          </Text>
                        </View>

                        <View style={styles.cardconstinerdivider} />

                        <View style={styles.listingtyperow}>
                          <Text
                            allowFontScaling={false}
                            style={styles.lebleHeader}
                          >
                            Bank Name:
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
                            Account Number:
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
                            Sort Code:
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
              

              {/* No Bank Details Message */}
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
                        Bank Details
                      </Text>
                    </View>

                    <View style={styles.cardconstinerdivider} />

                    <View style={styles.listingtyperow}>
                      <Text allowFontScaling={false} style={styles.status}>
                        No bank details available. Please add your bank account.
                      </Text>
                    </View>
                  </SquircleView>
                )}
            </View>
          </Animated.ScrollView>
          </View>
        )}

        {/* Fixed Bottom Button */}
        {!loading && (
          <View style={styles.bottomButtonContainer}>
          <Button
            title={
              buttonLoading
                ? 'Loading...'
                : data?.stripeAccount?.isboardcomplete
                ? 'Edit Bank Details'
                : 'Add Bank Details'
            }
            onPress={buttonLoading ? () => {} : handleAddBank}
          />
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
              Account Setup Complete!
            </Text>
            <Text allowFontScaling={false} style={styles.subheader1}>
              Your account has been successfully verified.
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
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <NewCustomToastContainer />
    </ImageBackground>
  );
};
export default AccountDetails;
const styles = StyleSheet.create({
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
    width: Platform.OS === 'ios' ? 393 : '100%',
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
  },
  headerContent: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? '8.5%' : 58,
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
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
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
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    borderBottomColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
  },
  cardconstinerdivider: {
    // display: 'flex',
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    // width: '100%',
    // height: 1.5,
    // borderStyle: 'dashed',
    // borderBottomWidth: 1,
    // borderBottomColor: '#4169B8',
    display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  height: (Platform.OS==='ios'? 2:1.5),
  borderStyle: 'dashed',
  borderBottomWidth:(Platform.OS==='ios'? 0.9:1),
  // backgroundColor: 'rgba(169, 211, 255, 0.08)',
  borderColor: (Platform.OS==='ios'?  'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(186, 218, 255, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)':'#4169B8'),
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
    paddingTop: Platform.OS === 'ios' ? 110 : 90,
    paddingHorizontal: 16,
    width: Platform.OS === 'ios' ? 393 : '100%',
    alignSelf: 'center',
    marginTop: 20,
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
    width: Platform.OS === 'ios' ? 393 : '100%',
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
