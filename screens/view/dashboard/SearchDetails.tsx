import {
  View,
  Text,
  ImageBackground,
  Platform,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Dimensions,
  FlatList,
  StatusBar,
  TouchableWithoutFeedback,
  BackHandler,
  ImageSourcePropType,
} from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BlurView } from '@react-native-community/blur';
import { useRoute } from '@react-navigation/native';
import { MAIN_URL } from '../../utils/APIConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NewCustomToastContainer,
  showToast,
} from '../../utils/component/NewCustomToastManager';
import PayButton from '../../utils/component/PayButton';
import LinearGradient from 'react-native-linear-gradient';
import {
  ShortCustomToastContainer,
  shortshowToast,
} from '../../utils/component/ShortCustomToastManager';
import ImageViewing from 'react-native-image-viewing';
// import FastImage from 'react-native-fast-image';

import AnimatedReanimated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';
import SelectFoodQuantity from '../../utils/component/SelectFoodQuantity';
import SelectFoodQuantity_IOS from '../../utils/component/SelectFoodQuantity_IOS';
import { Constant } from '../../utils/Constant';
import { useTranslation } from 'react-i18next';
import i18n from '../../../localization/i18n';
import Loader from '../../utils/component/Loader';
import dayjs from 'dayjs';
import React from 'react';
import { STYLES } from '../../utils/Style';

type SearchDetailsProps = {
  navigation: any;
};

const { width } = Dimensions.get('window');

type ParamOption = {
  other_text: any;
  id: number;
  option_id: number;
  option_name: string;
};

type DateRangeValue = {
  startDate?: string;
  endDate?: string;
};

type ParamValue = string | number | number[] | DateRangeValue | null;

type Param = {
  id: number;
  name: string;
  options: ParamOption[] | null;
  field_type: string;
  param_value: ParamValue;
};

const SearchDetails = ({ navigation }: SearchDetailsProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showPopup1, setShowPopup1] = useState(false);
  const closePopup = () => setShowPopup(false);
  const closePopup1 = () => setShowPopup1(false);
  const route = useRoute();
  const { id } = route.params as { id: number };
  const { name } = route.params as { name: string };
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState<any>({});
  const screenWidth = Dimensions.get('window').width;
  const { t } = useTranslation();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [famount, setfamout] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const { height } = Dimensions.get('window');
  const [slideUp1] = useState(new Animated.Value(0));
  const scrollY = useSharedValue(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [viewerState, setViewerState] = useState({
    visible: false,
    index: 0,
  });

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

  const [multiSelectModal, setMultiSelectModal] = useState<{
    visible: boolean;
    ismultilple: boolean;
    fieldId?: number;
    fieldLabel?: string;
  }>({ visible: false, ismultilple: false });

  const [multiSelectOptions, setMultiSelectOptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const language_code =
          (await AsyncStorage.getItem('selectedLanguage')) || 'en';

        const token = await AsyncStorage.getItem('userToken');
        console.log(token);

        if (!token) return;
        const url1 = `${MAIN_URL.baseUrl}category/feature-detail/${id}`;

        console.log(url1);

        const res = await fetch(url1, {
          headers: {
            Authorization: `Bearer ${token}`,
            languagecode: language_code,
          },
        });
        const json = await res.json();
        setDetail(json.data);

        if (res.status === 401 || res.status === 403) {
          handleForceLogout();
          return;
        }

        if (json.statusCode === 401 || json.statusCode === 403) {
          handleForceLogout();
          return;
        }
      } catch (error) {
        console.error('Error fetching details:', error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    const handleForceLogout = async () => {
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
      });
    };
    fetchDetails();
  }, [id]);

  const onScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(index);
  };

  useEffect(() => {
    const backAction = () => {
      navigation.replace('Dashboard', {
        AddScreenBackactiveTab: 'Home',
        isNavigate: false,
      });
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const quantityField = detail?.params?.find(
    (p: { name: string }) => p.name === 'Quantity',
  );

  const maxQty = Number(quantityField?.options?.[0]?.option_name) || 1;

  const quantityOptions = Array.from({ length: maxQty }, (_, i) => ({
    id: i + 1,
    option_name: String(i + 1),
  }));

  const formatDate = (dateString?: string, t?: any) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const day = date.getDate();
    const year = date.getFullYear();
    const lang = i18n.language;

    let suffix = '';
    if (lang === 'en') {
      if (day % 10 === 1 && day !== 11) suffix = 'st';
      else if (day % 10 === 2 && day !== 12) suffix = 'nd';
      else if (day % 10 === 3 && day !== 13) suffix = 'rd';
      else suffix = 'th';
    }

    const monthIndex = date.getMonth();
    const monthKeys = [
      'jan',
      'feb',
      'mar',
      'apr',
      'may',
      'jun',
      'jul',
      'aug',
      'sep',
      'oct',
      'nov',
      'dec',
    ];

    const monthShort = t ? t(monthKeys[monthIndex]) : monthKeys[monthIndex];

    return `${day}${suffix} ${monthShort} ${year}`;
  };

  const handlePay = (overrideAmount?: number) => {
    if (detail?.category?.id === 3 && overrideAmount === undefined) {
      setMultiSelectModal((prev:any) => ({ ...prev, visible: true }));
      return;
    }

    const amountToPay = overrideAmount ?? Number(detail.price).toFixed(2);

    navigation.navigate('PaymentScreen', {
      amount: amountToPay,
      feature_id: id,
      nav: 'purchase',
      onSuccess: async () => {
        await purchaseProduct();
      },
    });
  };

  const renderImage = () => {
    const fallbackImage = require('../../../assets/images/drone.png');

    if (detail?.profileshowinview) {
      const initials = `${detail?.createdby?.firstname?.[0] ?? ''}${detail?.createdby?.lastname?.[0] ?? ''
        }`.toUpperCase();

      return (
        <ImageBackground
          source={require('../../../assets/images/featurebg.png')}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            height: 270,
            width: '100%',
          }}
        >
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {detail?.createdby?.profile ? (
              <Image
                source={{ uri: detail?.createdby?.profile }}
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: 90,
                }}
                resizeMode="cover"
                onError={() => {
                  setImageUri(null);
                }}
              />
            ) : (
              <View
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: 90,
                  backgroundColor: '#8390D4',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 80,
                    color: '#FFF',
                    fontWeight: 600,
                    textAlign: 'center',
                    fontFamily: 'Urbanist-SemiBold',
                  }}
                >
                  {initials || 'NA'}
                </Text>
              </View>
            )}
          </View>
        </ImageBackground>
      );
    }

    if (previewImages.length > 1) {
      return (
        <View>
          <FlatList
            ref={flatListRef}
            data={previewImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_:any, index:any) => index.toString()}
            onScroll={onScroll}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => {
              const imageSource = item?.uri ? { uri: item.uri } : fallbackImage;

              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  disabled={previewImages.length === 0}
                  onPress={() => {
                    console.log('index: ', index);
                    setViewerState({
                      visible: true,
                      index: index,
                    });
                  }}
                >
                  <Image
                    source={imageSource}
                    style={{ width: screenWidth, height: 270 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              );
            }}
          />
          <View style={styles.stepIndicatorContainer}>
            {previewImages.map((_: any, index: number) => (
              <View
                key={index}
                style={
                  index === activeIndex
                    ? styles.activeStepCircle
                    : styles.inactiveStepCircle
                }
              />
            ))}
          </View>
        </View>
      );
    }
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          setViewerState({
            visible: true,
            index: 0,
          });
        }}
      >
        <Image
          source={
            previewImages[0]?.uri
              ? { uri: previewImages[0].uri }
              : fallbackImage
          }
          style={{ width: screenWidth, height: 270 }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const handleBookmarkPress = async (productId: number) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      setDetail((prev: any) =>
        prev ? { ...prev, isbookmarked: !prev.isbookmarked } : prev,
      );

      const isCurrentlyBookmarked = bookmarkedIds.includes(productId);
      const url = MAIN_URL.baseUrl + 'category/list-bookmark';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feature_id: productId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data?.message) {
        shortshowToast(
          t(data.message),
          data.statusCode === 200 ? 'success' : 'error',
        );
      }

      let updatedBookmarks;
      if (isCurrentlyBookmarked) {
        updatedBookmarks = bookmarkedIds.filter((id: number )=> id !== productId);
      } else {
        updatedBookmarks = [...bookmarkedIds, productId];
      }

      setBookmarkedIds(updatedBookmarks);
      await AsyncStorage.setItem(
        'bookmarkedIds',
        JSON.stringify(updatedBookmarks),
      );
    } catch (error) {
      console.error('Bookmark error:', error);

      setDetail((prev: any) =>
        prev ? { ...prev, isbookmarked: !prev.isbookmarked } : prev,
      );
    }
  };

  const getInitials = (firstName = '', lastName = '') => {
    const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
    const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
    return f + l || '?';
  };

  const purchaseProduct = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      return;
    }
    const finalamount = await AsyncStorage.getItem('finalamount');
    const paymentintent_id = await AsyncStorage.getItem('paymentintent_id');
    const quantity = await AsyncStorage.getItem('quantitycount');

    try {
      const createPayload = {
        amount: Number(finalamount),
        feature_id: id,
        payment_id: paymentintent_id,
        ...(detail?.category_id === 3 && { quantity: Number(quantity) }),
      };

      const url = `${MAIN_URL.baseUrl}transaction/post-order-complete`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createPayload),
      });
      const data = await response.json();

      if (response.ok && data?.statusCode === 200) {
        await AsyncStorage.removeItem('finalamount');
        await AsyncStorage.removeItem('quantitycount');

        await AsyncStorage.removeItem('finalamount');
        await AsyncStorage.removeItem('quantitycount');

        await AsyncStorage.setItem(
          'last_order_id',
          data.data?.orderid?.toString() || '',
        );
        await AsyncStorage.setItem(
          'last_transaction_amount',
          data.data?.amount?.toString() || '',
        );
        await AsyncStorage.setItem(
          'order_otp',
          data.data?.order_otp?.toString() || '',
        );

        showToast(t(Constant.PURCHASE_SUCCESS), 'success');
        setTimeout(() => {
          navigation.navigate('BuyerInfo');
        }, 2000);
      } else {
        showToast(
          t(data?.message) || 'Something went wrong.Please try again',
          'error',
        );
        showToast(
          t(data?.message) || 'Something went wrong.Please try again',
          'error',
        );
      }
    } catch (err) {
      console.error('Error :', err);
    }
  };

  const previewImages = useMemo(() => {
    if (detail?.files?.length > 0) {
      return detail.files.map((file: any) => ({
        uri: file.signedurl,
      }));
    }

    return [
      {
        uri: Image.resolveAssetSource(
          require('../../../assets/images/drone.png'),
        ).uri,
      },
    ];
  }, [detail]);

  // useEffect(() => {
  //   previewImages.forEach((image: any) => {
  //     FastImage.preload([{ uri: image.uri }]);
  //   });
  // }, [previewImages]);

  return (
    <>
      <ImageViewerModal
        visible={viewerState.visible}
        index={viewerState.index}
        images={previewImages}
        onClose={() => setViewerState(prev => ({ ...prev, visible: false }))}
        onChangeIndex={(i: any) =>
          setViewerState(prev => ({ ...prev, index: i }))
        }
      />
      <ImageBackground
        source={require('../../../assets/images/backimg.png')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      >
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

          <View style={STYLES.headerContent} pointerEvents="box-none">
            <TouchableOpacity
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.replace('Dashboard', {
                    AddScreenBackactiveTab: 'Home',
                    isNavigate: false,
                  });
                }
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

                <AnimatedReanimated.Image
                  source={require('../../../assets/images/back.png')}
                  style={[{ height: 24, width: 24 }, animatedIconStyle]}
                />
              </AnimatedReanimated.View>
            </TouchableOpacity>

            <Text allowFontScaling={false} style={styles.unizyText}>
              {(() => {
                switch (detail?.category?.id) {
                  case 2:
                    return t('tutoring_service_details');
                  case 3:
                    return `${t('food')} ${t('details')}`;
                  case 4:
                    return `${t('Accomodation')} ${t('details')}`;
                  case 5:
                    return `${t('housekeeping')} ${t('details')}`;
                  default:
                    return `${t('Product')} ${t('details')}`;
                }
              })()}
            </Text>

            <TouchableOpacity
              onPress={() => {
                handleBookmarkPress(id);
              }}
              style={styles.rightButtoContainer}
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
                  source={
                    detail?.isbookmarked
                      ? require('../../../assets/images/favourite_filled.png')
                      : require('../../../assets/images/favourite.png')
                  }
                  style={styles.iconSmall}
                />
              </AnimatedReanimated.View>
            </TouchableOpacity>
          </View>

          <AnimatedReanimated.ScrollView
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            onScroll={scrollHandler}
            contentContainerStyle={[
              styles.scrollContainer,
              {
                paddingBottom:
                  detail?.category?.id === 4
                    ? Platform.OS === 'ios'
                      ? 20
                      : height * 0.01
                    : Platform.OS === 'ios'
                      ? 75
                      : height * 0.07,
              },
            ]}
          >
            <View style={{ marginTop: Platform.OS === 'ios' ? 10 : 0 }}>
              {renderImage()}

              <View style={{ flex: 1, padding: 16 }}>
                <View style={styles.card}>
                  <View style={{}}>
                    {detail && (
                      <>
                        <Text allowFontScaling={false} style={styles.QuaddText}>
                          {detail.title}
                        </Text>
                        <Text allowFontScaling={false} style={styles.priceText}>
                          {detail?.category?.id === 2
                            ? `£${Number(detail?.price ?? 0).toFixed(2)}/${t(
                              'hr',
                            )}`
                            : detail?.category?.id === 4
                              ? `£${Number(detail?.price ?? 0).toFixed(2)}/${t(
                                'week',
                              )}`
                              : detail?.category?.id === 5
                                ? `£${Number(detail?.price ?? 0).toFixed(2)}/${t(
                                  'session',
                                )}`
                                : `£${Number(detail?.price ?? 0).toFixed(2)}`}
                        </Text>
                      </>
                    )}
                    {(detail?.category_id === 2 ||
                      detail?.category_id === 5) && (
                        <View style={styles.datePosted1}>
                          <Image
                            source={require('../../../assets/images/duration_info.png')}
                            style={{ height: 16, width: 16 }}
                          />
                          <Text allowFontScaling={false} style={styles.datetext1}>
                            {t('service_duration')}:{' '}
                            <Text style={styles.durationValue}>
                              {detail?.hours
                                ? `${detail.hours} ${detail.hours > 1 ? t('hours') : t('hour')
                                }`
                                : `1 ${t('hour')}`}
                            </Text>
                          </Text>
                        </View>
                      )}
                  </View>

                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 2,
                      alignSelf: 'stretch',
                    }}
                  >
                    <Text
                      allowFontScaling={false}
                      style={styles.productDesHeding}
                    >
                      {t('des')}
                    </Text>

                    <Text allowFontScaling={false} style={styles.productDesc}>
                      {detail?.description || t('no_description_available')}
                    </Text>

                    <View style={styles.datePosted}>
                      <Image
                        source={require('../../../assets/images/calendar_icon1.png')}
                        style={{ height: 16, width: 16 }}
                      />
                      <Text allowFontScaling={false} style={styles.datetext}>
                        {t('date_posted')}: {formatDate(detail?.created_at, t)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.card}>
                  <View style={styles.gap12}>
                    <Text
                      allowFontScaling={false}
                      style={styles.productDeatilsHeading1}
                    >
                      {(() => {
                        switch (detail?.category?.id) {
                          case 2:
                            return t('tutoring_service_details');
                          case 3:
                            return t('dish_details');
                          case 4:
                            return t('rental_details');
                          case 5:
                            return t('housekeeping_details');
                          default:
                            return t('product_details');
                        }
                      })()}
                    </Text>

                    {detail?.params
                          ?.filter((param: Param) => param.field_type !== 'boolean' && param.id !== 8 && param.id !== 22 && param.id !== 15 && param.id !==32 && param.id !== 58)
                      .map((param: Param) => (
                      <View
                        key={param.id}
                        style={{ marginTop: 4, marginBottom: 0 }}
                      >
                        <Text
                          allowFontScaling={false}
                          style={styles.itemcondition}
                        >
                          {param.name}
                        </Text>

                        {param.options && param.options.length > 0 ? (
                          <View style={styles.categoryContainer}>
                            {param.options
                              .filter(opt => {
                                const selectedValues = (param.param_value || '')
                                  .toString()
                                  .split(',')
                                  .map(v => v.trim());
                                return selectedValues.includes(
                                  (opt.option_id ?? '').toString(),
                                );
                              })
                              .map((opt: ParamOption) => (
                                <View key={opt.id} style={styles.categoryTag}>
                                  <Text
                                    allowFontScaling={false}
                                    style={styles.catagoryText}
                                  >
                                    {opt.other_text
                                      ? `${opt.option_name} (${opt.other_text})`
                                      : opt.option_name}
                                  </Text>
                                </View>
                              ))}
                          </View>
                        ) : param.field_type === 'date' &&
                          typeof param.param_value === 'object' &&
                          param.param_value !== null &&
                          'startDate' in param.param_value &&
                          'endDate' in param.param_value ? (
                          <Text
                            allowFontScaling={false}
                            style={[styles.new, { marginTop: 0 }]}
                          >
                            {param.param_value.startDate &&
                              param.param_value.endDate
                              ? `${dayjs(param.param_value.startDate).format(
                                'DD-MM-YYYY',
                              )} - ${dayjs(param.param_value.endDate).format(
                                'DD-MM-YYYY',
                              )}`
                              : '—'}
                          </Text>
                        ) : (
                          <Text
                            allowFontScaling={false}
                            style={[styles.new, { marginTop: 0 }]}
                          >
                            {String(param.param_value ?? '—')}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.card}>
                  <View style={{ gap: 12 }}>
                    <Text
                      allowFontScaling={false}
                      style={styles.productDeatilsHeading}
                    >
                      {t('seller_details')}
                    </Text>

                    <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                      {detail?.createdby?.profile ? (
                        <Image
                          source={{ uri: detail.createdby.profile }}
                          style={styles.avatar}
                        />
                      ) : (
                        <View style={STYLES.initialsCircle}>
                          <Text
                            allowFontScaling={false}
                            style={styles.initialsText}
                          >
                            {getInitials(
                              detail?.createdby?.firstname ?? 'Alan',
                              detail?.createdby?.lastname ?? 'Walker',
                            )}
                          </Text>
                        </View>
                      )}

                      <View style={{ width: '80%', gap: 0 }}>
                        <Text allowFontScaling={false} style={styles.userName}>
                          {detail?.createdby
                            ? `${detail.createdby.firstname || ''} ${detail.createdby.lastname || ''
                            }`
                            : 'Unknown User'}
                        </Text>

                        <Text
                          allowFontScaling={false}
                          style={styles.univeritytext}
                        >
                          {detail?.university?.name
                            ? `${detail.university.name},`
                            : 'University of Warwick,'}
                        </Text>
                        <Text
                          allowFontScaling={false}
                          style={[styles.univeritytext, { marginTop: 0 }]}
                        >
                          {detail?.createdby?.city || ''}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row' }}>
                      <View style={styles.bottombutton}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('ReviewDetails', {
                              category_id: detail?.category_id,
                              id: detail?.id,
                              purchase: detail?.ispurchased,
                              seller_id: detail?.createdby?.id ?? 1,
                            });
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <Image
                            source={require('../../../assets/images/staricon.png')}
                            style={{ height: 16, width: 16 }}
                          />

                          <Text
                            allowFontScaling={false}
                            style={styles.chattext}
                          >
                            {detail?.avg_rating}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.chatcard,
                          {
                            marginLeft: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                          },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => {
                          if (detail?.category?.chat_with_seller) {
                            navigation.navigate('MessagesIndividualScreen', {
                              animation: 'none',
                              sellerData: {
                                featureId: detail.id,
                                firstname: detail.createdby.firstname,
                                lastname: detail.createdby.lastname,
                                profile: detail.createdby.profile,
                                universityName: detail.university,
                                id: detail.createdby.id,
                                isblocked: detail.blocked_you,
                                blocked_you: detail.blocked_by,
                              },
                              source: 'sellerPage',
                            });
                          } else {
                            setShowPopup(true);
                          }
                        }}
                      >
                        <Image
                          source={require('../../../assets/images/message_chat.png')}
                          style={{ height: 16, width: 16, marginRight: 4 }}
                        />
                        <Text allowFontScaling={false} style={styles.chattext}>
                          {t('chat_with_seller')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                {!detail?.already_reported && (
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('ReportProduct', { feature_id: id });
                    }}
                  >
                    <View style={styles.reportButtonCard}>
                      <Image
                        source={require('../../../assets/images/report.png')}
                        style={{ height: 16, width: 16 }}
                      />
                      <Text
                        style={{
                          color: 'rgba(255, 130, 130, 0.88)',
                          fontFamily: 'Urbanist-SemiBold',
                          fontSize: 14,
                          fontWeight: '600',
                          letterSpacing: -0.28,
                        }}
                      >
                        {t('report_listing')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                {detail?.isreported && (
                  <TouchableOpacity onPress={() => { }}>
                    <View style={styles.reportButtonCard}>
                      <Image
                        source={require('../../../assets/images/report.png')}
                        style={{ height: 16, width: 16 }}
                      />
                      <Text
                        style={{
                          color: 'rgba(255, 130, 130, 0.88)',
                          fontFamily: 'Urbanist-SemiBold',
                          fontSize: 14,
                          fontWeight: '600',
                          letterSpacing: -0.28,
                        }}
                      >
                        {t('report_user_msg')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </AnimatedReanimated.ScrollView>

          {!detail?.isreported && detail?.category?.id !== 4 && (
            <PayButton
              amount={
                detail?.category?.id === 3 ? undefined : Number(detail?.price)
              }
              label={
                detail?.category?.id === 3 ? t('select_quantity') : t('pay')
              }
              onPress={() => handlePay()}
            />
          )}

          {Platform.OS === 'ios' ? (
            <SelectFoodQuantity_IOS
              totalcount={detail?.remaining_quantity}
              options={quantityOptions}
              visible={multiSelectModal.visible}
              price={Number(detail?.price)}
              title={t('choose_quantity')}
              subtitle={t('select_units')}
              selectedValues={formValues[multiSelectModal.fieldId!]?.value}
              onClose={() =>
                setMultiSelectModal(prev => ({ ...prev, visible: false }))
              }
              continueToPay={amount => {
                handlePay(amount);
                setMultiSelectModal(prev => ({ ...prev, visible: false }));
              }}
              onSelect={selectedIds => {
                const quantity = Array.isArray(selectedIds)
                  ? selectedIds[0]
                  : selectedIds;

                setFormValues((prev: any) => ({
                  ...prev,
                  [multiSelectModal.fieldId!]: { value: quantity },
                }));
              }}
            />
          ) : (
            <SelectFoodQuantity
              totalcount={detail?.remaining_quantity}
              options={quantityOptions}
              visible={multiSelectModal.visible}
              price={Number(detail?.price)}
              title={t('choose_quantity')}
              subtitle={t('select_units')}
              selectedValues={formValues[multiSelectModal.fieldId!]?.value}
              onClose={() =>
                setMultiSelectModal((prev: any) => ({ ...prev, visible: false }))
              }
              continueToPay={amount => {
                handlePay(amount);
                setMultiSelectModal((prev: any) => ({ ...prev, visible: false }));
              }}
              onSelect={selectedIds => {
                const quantity = Array.isArray(selectedIds)
                  ? selectedIds[0]
                  : selectedIds;

                setFormValues((prev: any) => ({
                  ...prev,
                  [multiSelectModal.fieldId!]: { value: quantity },
                }));
              }}
            />
          )}

          <Modal
            visible={showPopup}
            transparent
            animationType="fade"
            onRequestClose={closePopup}
          >
            <TouchableWithoutFeedback onPress={closePopup}>
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
                      source={require('../../../assets/images/alerticon.png')}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: 'rgba(255, 255, 255, 0.80)',
                        fontFamily: 'Urbanist-SemiBold',
                        fontSize: 20,
                        fontWeight: '600',
                        letterSpacing: -0.4,
                        lineHeight: 28,
                      }}
                    >
                      {t('complete_your_purchase')}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: 'rgba(255, 255, 255, 0.48)',
                        fontFamily: 'Urbanist-Regular',
                        fontSize: 14,
                        textAlign: 'center',
                        fontWeight: '400',
                        letterSpacing: -0.28,
                        lineHeight: 19.6,
                      }}
                    >
                      {t('chat_service')}
                    </Text>

                    <TouchableOpacity
                      style={styles.loginButton}
                      onPress={() => {
                        setShowPopup(false);
                      }}
                    >
                      <Text allowFontScaling={false} style={styles.loginText}>
                        {t('go_back')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <Modal
            visible={showPopup1}
            transparent
            animationType="fade"
            onRequestClose={closePopup1}
          >
            <TouchableWithoutFeedback
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Dashboard',
                      params: {
                        AddScreenBackactiveTab: 'Home',
                        isNavigate: false,
                      },
                    },
                  ],
                });
                setShowPopup1(false);
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
                      source={require('../../../assets/images/success_icon.png')}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                    <View style={{ width: '100%' }}>
                      <Text
                        allowFontScaling={false}
                        style={{
                          color: 'rgba(255, 255, 255, 0.80)',
                          fontFamily: 'Urbanist-SemiBold',
                          fontSize: 20,
                          fontWeight: '600',
                          letterSpacing: -0.4,
                          textAlign: 'center',
                          lineHeight: 28,
                        }}
                      >
                        {' '}
                        {t('order_placed_success')}!
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.loginButton}
                      onPress={() => {
                        navigation.reset({
                          index: 0,
                          routes: [
                            {
                              name: 'Dashboard',
                              params: {
                                AddScreenBackactiveTab: 'Home',
                                isNavigate: false,
                              },
                            },
                          ],
                        });
                        setShowPopup1(false);
                      }}
                    >
                      <Text allowFontScaling={false} style={styles.loginText}>
                        {t('return_home')}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.loginButton1}
                      onPress={() => {
                        navigation.navigate('MessagesIndividualScreen', {
                          animation: 'none',
                          sellerData: {
                            featureId: detail.id,
                            firstname: detail.createdby.firstname,
                            lastname: detail.createdby.lastname,
                            profile: detail.createdby.profile,
                            universityName: detail.university,
                            id: detail.createdby.id,
                            isblocked: detail.blocked_you,
                            blocked_you: detail.blocked_by,
                          },
                          source: 'sellerPage',
                        });
                        setShowPopup1(false);
                      }}
                    >
                      <Text allowFontScaling={false} style={styles.loginText1}>
                        {t('chat_with_seller')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
        {loading && (
          <View style={styles.fullLoader}>
            <Loader />
          </View>
        )}
        <ShortCustomToastContainer />
        <NewCustomToastContainer />
      </ImageBackground>
    </>
  );
};
interface ImageViewerModalProps {
  visible: boolean;
  index: number;
  images: any[];
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

const ImageViewerModal = React.memo(
  ({
    visible,
    index,
    images,
    onClose,
    onChangeIndex,
  }: ImageViewerModalProps) => {
    return (

      // <ImageViewing
      //   images={images}
      //   imageIndex={index} 
      //   visible={visible}
      //   backgroundColor="black"
      //   animationType="fade"
      //   swipeToCloseEnabled
      //   doubleTapToZoomEnabled
      //   onRequestClose={onClose}
      //   renderImage={({
      //     source,
      //     style,
      //   }: {
      //     source: ImageSourcePropType;
      //     style: any;
      //   }) => (
      //      <Image
      //       source={source}
      //       style={style}
      //       resizeMode="contain"
      //     />
      //   )}
      //   FooterComponent={({ imageIndex }) => (
      //     <View
      //       style={{
      //         position: 'absolute',
      //         bottom: 30,
      //         width: '100%',
      //         alignItems: 'center',
      //       }}
      //     >
      //       <View style={{ flexDirection: 'row', marginBottom: 15 }}>
      //         {images.map((_: any, i: any) => (
      //           <View
      //             key={i}
      //             style={{
      //               width: 8,
      //               height: 8,
      //               borderRadius: 4,
      //               marginHorizontal: 4,
      //               backgroundColor:
      //                 i === imageIndex ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
      //             }}
      //           />
      //         ))}
      //       </View>
      //     </View>
      //   )}
      // />
      <ImageViewing
        images={images}
        imageIndex={index}
        visible={visible}
        backgroundColor="black"
        animationType="fade"
        swipeToCloseEnabled
        doubleTapToZoomEnabled
        onRequestClose={onClose}
        FooterComponent={({ imageIndex }: { imageIndex: number }) => (
          <View
            style={{
              position: 'absolute',
              bottom: 30,
              width: '100%',
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', marginBottom: 15 }}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    marginHorizontal: 4,
                    backgroundColor:
                      i === imageIndex
                        ? '#FFFFFF'
                        : 'rgba(255,255,255,0.4)',
                  }}
                />
              ))}
            </View>
          </View>
        )}
      />

    );
  },
);

const styles = StyleSheet.create({
  fullLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  reportButtonCard: {
    flexDirection: 'row',
    marginBottom: 6,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(236, 154, 154, 0.2)',
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  durationValue: {
    color: '#FFF',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: -0.24,
    paddingLeft: 4,
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
  rightButtoContainer: {
    zIndex: 11,
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

    boxShadow:
      '0 2px 8px 0 rgba(255, 255, 255, 0.2)inset 0 2px 8px 0 rgba(0, 0, 0, 0.2)',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    height: 48,
    width: 48,
  },
  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
  },

  chattext: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'normal',
    letterSpacing: -0.28,
  },
  chatcard: {
    borderRadius: 10,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 'auto',
  },

  bottombutton: {
    borderRadius: 10,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    padding: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  initialsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
  },

  MylistingsBackground: {
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(97, 179, 255, 0.2) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow:
      '0 2px 8px 0 rgba(255, 255, 255, 0.2)inset 0 2px 8px 0 rgba(0, 0, 0, 0.2)',
    borderTopColor: '#ffffff5d',
    borderBottomColor: '#ffffff36',
    borderLeftColor: '#ffffff5d',
    borderRightColor: '#ffffff36',
    borderWidth: 0.3,
  },
  iconSmall: {
    width: 24,
    height: 24,
  },

  stepIndicatorContainer: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },

  stepCircle: {
    width: 12,
    height: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  activeStepCircle: {
    width: 12,
    height: 12,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    borderColor: '#ffffff4e',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3.33,
    elevation: 2,
  },

  inactiveStepCircle: {
    width: 12,
    height: 12,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#ffffff4e',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3.33,
    elevation: 2,
  },

  backBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
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
  termsText1: {
    color: 'rgba(255,255,255,0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },

  popupContainer: {
    width: width * 0.85,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    overflow: 'hidden',

    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  previewText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
  },
  payText: {
    color: '#002050',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 1,
  },
  previewBtn: {
    display: 'flex',
    width: '90%',
    alignSelf: 'center',
    alignContent: 'center',
    paddingHorizontal: 20,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',

    position: 'absolute',
    bottom: 10,
  },

  scrollContainer: {
    paddingBottom: 80,
    paddingTop: Platform.OS === 'ios' ? 110 : 100,
  },

  datePosted: {
    flexDirection: 'row',
    height: 'auto',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.09) 100%)',
    borderRadius: 8,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 6,
    paddingBottom: 6,
    marginTop: 12,
    alignItems: 'center',
    gap: 4,
  },

  datePosted1: {
    flexDirection: 'row',
    height: 'auto',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.09) 100%)',
    borderRadius: 8,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 6,
    paddingBottom: 6,
    marginTop: 8,
    width: 'auto',
    alignSelf: 'flex-start',
  },

  userSub: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: -0.24,
  },
  datetext: {
    color: '#9CD6FF',
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: -0.24,
  },

  datetext1: {
    color: '#9CD6FF',
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: -0.24,
    paddingLeft: 4,
  },

  univeritytext: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 14,
  },
  userName: {
    position: 'relative',
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: -0.32,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    resizeMode: 'cover',
  },
  gap12: {
    gap: 8,
  },
  gap4: {
    gap: 4,
  },
  catagory: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
  },
  new: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 20,
  },
  itemcondition: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  catagoryText: {
    color: '#9CD6FF',
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: -0.24,
  },

  catagoryText1: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 1.3,
    color: '#9CD6FF',
  },
  categoryTag: {
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.10) 100%)',
    color: 'rgba(255, 255, 255, 0.48)',
    borderRadius: 4,
    marginRight: 8,
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 2,
    paddingBottom: 2,
    marginTop: 6,
  },
  productDesHeding: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
  },
  productDesc: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-Medium',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  productDeatilsHeading: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: -0.36,
  },

  productDeatilsHeading1: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: -0.36,
  },
  QuaddText: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  priceText: {
    color: '#fff',
    fontFamily: 'Urbanist-Bold',
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: -0.1,
    paddingTop: 8,
  },
  priceText1: {
    color: '#002050',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: 1,
  },

  card: {
    flexDirection: 'column',
    marginBottom: 6,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
    marginTop: 6,
  },
  h24_w24: {
    width: 24,
    height: 24,
  },

  previewThumbnail: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
});

export default SearchDetails;