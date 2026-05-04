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
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { BlurView } from '@react-native-community/blur';
import { MAIN_URL } from '../../utils/APIConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../utils/component/Button';
import {
  NewCustomToastContainer,
  showToast,
} from '../../utils/component/NewCustomToastManager';

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
import { Constant } from '../../utils/Constant';
import { useTranslation } from 'react-i18next';
import i18n from '../../../localization/i18n';
import Loader from '../../utils/component/Loader';
import dayjs from 'dayjs';

import COMMONSTYLE from '../../utils/CommonStyle';
import BACK_ICON from '../../../assets/images/backimg.png';



type EditPreviewDetailedProps = {
  navigation: any;
};

const { width } = Dimensions.get('window');

const profileImg = require('../../../assets/images/user.jpg');

const itemOptions = [
  { id: 1, option_name: 'New' },
  { id: 2, option_name: 'Like new' },
  { id: 3, option_name: 'Used' },
];

interface ImageField {
  id?: number;
  uri: string;
  type?: string;
  name: string;
}
interface FormField {
  value: any;
  alias_name: string | null;
}

const EditPreviewDetailed = ({ navigation }: EditPreviewDetailedProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const closePopup = () => setShowPopup(false);
  const scrollY1 = new Animated.Value(0);
  const { t } = useTranslation();

  const [storedForm, setStoredForm] = useState<any | null>(null);
  const screenWidth = Dimensions.get('window').width;
  const [activeIndex, setActiveIndex] = useState(0);
  const [userMeta, setUserMeta] = useState<UserMeta | null>(null);
  const insets = useSafeAreaInsets(); // Safe area insets
  const [newdate, setnewdate] = useState('');
  const [categoryid, setcategoryid] = useState(0);
  const [fields, setFields] = useState<any[]>([]); // seller fields from API
  const today = new Date();
  const [isLoading, setIsLoading] = useState(false);
  const [apiIsFeatured, setApiIsFeatured] = useState(false);

  // Format as DD-MM-YYYY
  const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}-${today.getFullYear()}`;

  interface Category {
    id: number;
    name: string;
    description: string | null;
    isactive: boolean;
    logo: string | null;
    commission: string | null;
    max_cappund: string | null;
    feature_fee: string | null;
    max_feature_cap: null;
    accommodation_amount: null;
  }

  interface UserMeta {
    firstname: string | null;
    lastname: string | null;
    profile: string | null;
    student_email: string | null;
    university_name: string | null;
    category?: Category | null;
    city?: string | null;
  }

  const flatListRef = useRef(null);
  const { height } = Dimensions.get('window');
  const screenHeight = Dimensions.get('window').height;
  const [slideUp1] = useState(new Animated.Value(0));

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      'worklet';
      scrollY.value = event.contentOffset.y;
    },
  });

  useEffect(() => {
    const loadFeatureStatus = async () => {
      const val = await AsyncStorage.getItem('isfeatured');
      if (val !== null) {
        setApiIsFeatured(JSON.parse(val));
      }
    };
    loadFeatureStatus();
  }, []);

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

  useEffect(() => {
    const fetchStoredData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('formData1');
        const storedValue = await AsyncStorage.getItem('newDate');
        if (storedValue !== null) {
          setnewdate(storedValue);
        } else {
          setnewdate('');
        }
        if (storedData) {
          const parsedData = JSON.parse(storedData);

          setStoredForm(parsedData);
        } else {
        }
      } catch (error) {}
    };

    fetchStoredData();
  }, []);

  useEffect(() => {
    const loadUserMeta = async () => {
      try {
        const metaStr = await AsyncStorage.getItem('userMeta');
        if (metaStr) {
          const meta: UserMeta = JSON.parse(metaStr);
          setUserMeta(meta);
        }
      } catch (error) {}
    };

    loadUserMeta();
  }, []);

  type FormEntry = {
    value: any;
    alias_name: string | null;
  };

  const getValueByAlias = (
    formData: Record<string, FormEntry> | null,
    alias: string,
  ): any => {
    if (!formData) return null;

    const entry = Object.values(formData).find(
      item => item.alias_name === alias,
    ) as FormEntry | undefined;

    if (entry) return entry.value;

    if (formData[alias]) return formData[alias].value;

    return null;
  };

  const formatDateWithDash = (dateString?: string, t?: any) => {
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

    const monthIndex = date.getMonth(); // 0–11
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

  const titleValue = getValueByAlias(storedForm, 'title') || t('no_title');
  //const priceValue = getValueByAlias(storedForm, 'price') || '0';
  const descriptionvalue =
    getValueByAlias(storedForm, 'description') || t('no_des');
  const duration_value = getValueByAlias(storedForm, 'service_duration') || '1';
  const accomodation_amount = parseFloat(
    userMeta?.category?.accommodation_amount ?? '0',
  );

  const onScroll = (event: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    const slideSize = screenWidth;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const language_code =
          (await AsyncStorage.getItem('selectedLanguage')) || 'en';
        const token = await AsyncStorage.getItem('userToken');
        const productId1 = await AsyncStorage.getItem('selectedProductId');
        setcategoryid(Number(productId1));

        const url = `${MAIN_URL.baseUrl}category/listparams/user/${productId1}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            languagecode: language_code,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();

        if (json?.metadata) {
          setUserMeta({
            firstname: json.metadata.firstname ?? null,
            lastname: json.metadata.lastname ?? null,
            profile: json.metadata.profile ?? null,
            student_email: json.metadata.student_email ?? null,
            university_name: json.metadata.university_name ?? null,
            category: json.metadata.category ?? null,
            city: json.metadata.city ?? null,
          });

          await AsyncStorage.setItem(
            'userMeta',
            JSON.stringify({
              firstname: json.metadata.firstname ?? null,
              lastname: json.metadata.lastname ?? null,
              profile: json.metadata.profile ?? null,
              student_email: json.metadata.student_email ?? null,
              university_name: json.metadata.university_name ?? null,
              category: json.metadata.category ?? null,
              city: json.metadata.city ?? null, //
            }),
          );
        }

        if (json?.data) {
          const sellerFields = json.data.filter(
            (item: any) => item.seller === true,
          );
          setFields(sellerFields);
        }
      } catch (err) {
      } finally {
        //setLoading(false);
      }
    };

    fetchFields();
  }, []);

  type ImageField = {
    isNew: any;
    id?: string;
    uri: string;
    name: string;
    type?: string;
  };


  const getCurrentDate = () => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, '0')}-${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}-${today.getFullYear()}`;
  };

  const getInitials = (firstName = '', lastName = '') => {
    const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
    const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
    return f + l || '?';
  };

  const raw = getValueByAlias(storedForm, 'price') ?? '0';
  const priceValue = parseFloat(String(raw)) || 0;

  const commissionPercent = parseFloat(userMeta?.category?.commission ?? '0');
  const maxCap = parseFloat(userMeta?.category?.max_cappund ?? '0');

  const commissionAmount = priceValue * (commissionPercent / 100);
  const calculatedPrice = priceValue + commissionAmount;
  const maxAllowedPrice = priceValue + maxCap;
  const commissionPrice = +Math.min(calculatedPrice, maxAllowedPrice).toFixed(
    2,
  );

  const raw1 = getValueByAlias(storedForm, 'price') ?? '0';
  const priceValue1 = parseFloat(String(raw1)) || 0;

  const commissionPercent1 = parseFloat(userMeta?.category?.feature_fee ?? '0');
  const maxCap1 = parseFloat(userMeta?.category?.max_feature_cap ?? '0');

  const commissionAmount1 = priceValue1 * (commissionPercent1 / 100);
  const calculatedPrice1 = priceValue1 + commissionAmount1;
  const maxAllowedPrice1 = priceValue1 + maxCap1;
  const commissionPrice1 = +Math.min(
    calculatedPrice1,
    maxAllowedPrice1,
  ).toFixed(2);
  const diff1 = commissionPrice1 - priceValue1;

  const priceText =
    userMeta?.category?.id === 2
      ? `£${commissionPrice}/${t('hr')}`
      : userMeta?.category?.id === 4
      ? `£${commissionPrice}/${t('week')}`
      : userMeta?.category?.id === 5
      ? `£${commissionPrice}/${t('session')}`
      : `£${commissionPrice}`;

  const form =
    typeof storedForm === 'string' ? JSON.parse(storedForm) : storedForm;

  // 🔥 FIX: use alias_name instead of hardcoded '13'
  const isToggleOn =
    Object.values(form || {}).find((f: any) => f.alias_name === 'isfeatured')
      ?.value === true;
  

  



    const handleListPress = async () => {
    setIsLoading(true);
    try {
      const storedData = await AsyncStorage.getItem('formData1');
      console.log(storedData);
      if (!storedData) {
        // console.log("⚠️ No form data found");
        return;
      }
     
      const paymentintent_id = await AsyncStorage.getItem('paymentintent_id');
      const formData: Record<string, FormField> = JSON.parse(storedData);

      const token = await AsyncStorage.getItem('userToken');
      const productId = await AsyncStorage.getItem('selectedProductId');
      const shareid = await AsyncStorage.getItem('shareid');

      if (!token) {
        return;
      }

      const imageFields: [string, ImageField[]][] = [];
      const nonImageFields: [
        string,
        { value: any; alias_name: string | null },
      ][] = [];

      Object.entries(formData).forEach(([key, obj]) => {
        const v = obj.value;
        if (Array.isArray(v) && v.length > 0 && v.every(i => i?.uri)) {
          imageFields.push([key, v as ImageField[]]);
        } else {
          nonImageFields.push([key, obj]);
        }
      });

      const dataArray = nonImageFields
        .map(([key, obj]: any) => {
          const value = obj.value;
          const id = Number(key);

          if (!id) return null;

          if (
            value &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            value.startDate &&
            value.endDate
          ) {
            return {
              id,
              param_value: null,
              startDate: value.startDate,
              endDate: value.endDate,
            };
          }

          const payload: any = {
            id,
            param_value: value,
          };

          if (obj.other_text && String(obj.other_text).trim() !== '') {
            payload.other_text = obj.other_text;
          }

          return payload;
        })
        .filter(Boolean);

      // const createPayload = {
      //   category_id: productId,
      //   data: dataArray,
      // };


// const createPayload: any = {
//   category_id: productId,
//   data: dataArray,
//   ...(Number(productId) === 4 && {
//     paymentintent_id,
//     featureamount: maxCap1,
//   }),
// };

const createPayload: any = {
  category_id: productId,
  data: dataArray,
  ...(Number(productId) === 4 && {
    paymentintent_id:
      Number(accomodation_amount) === 0 && Number(maxCap1) === 0
        ? ""
        : paymentintent_id,

    featureamount:
      Number(accomodation_amount) === 0 && Number(maxCap1) === 0
        ? 0
        : maxCap1,
  }),
};


      console.log('Payload: ', createPayload);

      const createRes = await fetch(
        `${MAIN_URL.baseUrl}category/featurelist-update/${shareid}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(createPayload),
        },
      );

      const createJson = await createRes.json();

      if (![200, 201].includes(createRes.status)) {
        showToast(t(createJson?.message || 'Error'), 'error');
        navigation.reset({ index: 0, routes: [{ name: 'MyListing' }] });
        return;
      }

      showToast(t(createJson?.message || 'Success'), 'success');

      const feature_id = createJson?.data?.id;
      if (!feature_id) {
        return;
      }

      let deletedIds: string[] = [];
      const storedDeletedIds = await AsyncStorage.getItem('deletedImageIds');
      console.log(
        'Stored deleted image IDs from AsyncStorage:',
        storedDeletedIds,
      );

      if (storedDeletedIds) {
        deletedIds = JSON.parse(storedDeletedIds);
      }

      const isLocalImage = (uri: string) =>
        uri.startsWith('file://') || uri.startsWith('content://');

      for (const [param_id, images] of imageFields) {
        const newImages = images.filter(
          img => img?.uri && isLocalImage(img.uri),
        );

        //need to maintain the sequence  of images and send to server with same sequence
        const seqimage = images.map((e, index) => {
          return {
            // uri: e.uri,
            type: e.type || 'image/jpeg',
            name: e.name || `image_${Date.now()}.jpg`,
            seqno: index + 1,
          };
        });
        console.log('seqimage', seqimage);

        // if (newImages.length === 0 && deletedIds.length === 0) continue;

        const form = new FormData();

        // append new images
        for (const image of newImages) {
          form.append('files', {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.name || `image_${Date.now()}.jpg`,
          } as any);
        }

        console.log('newImages:', JSON.stringify(newImages, null, 2));

        form.append('feature_id', String(feature_id));
        form.append('param_id', String(param_id));
        form.append('file_seq', JSON.stringify(seqimage));

        // append deleted image IDs
        form.append('deleted_image_ids', JSON.stringify(deletedIds));

        // send API request
        const uploadRes = await fetch(
          `${MAIN_URL.baseUrl}category/featurelist/image-update`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: form,
          },
        );
        console.log('IMAGE_RESPONSE: ', uploadRes);

        const uploadJson = await uploadRes.json();
        const isSuccess = uploadRes.ok;

        showToast(
          t(uploadJson?.message || 'Image upload failed'),
          isSuccess ? 'success' : 'error',
        );

        if (!isSuccess) return;
      }

      await AsyncStorage.removeItem('deletedImageIds');

      setShowPopup(true);

      await AsyncStorage.removeItem('formData1');
      await AsyncStorage.removeItem('deletedImagesId');
    } catch (err) {
      showToast(t(Constant.SOMTHING_WENT_WRONG), 'error');
    } finally {
      setIsLoading(false);
    }
  };



   let isSubmitting = false; // Flag to prevent multiple submissions

  const handlePayment = async () => {
    if (isSubmitting) return;

    isSubmitting = true;

    try {
      // const form =
      //   typeof storedForm === 'string' ? JSON.parse(storedForm) : storedForm;

      // const isFeatured =
      //   form?.['13']?.value === true || form?.['13']?.value === 'true';

      // if (!isFeatured && categoryid === 4 && accomodation_amount > 0) {
      //   navigation.navigate('PaymentScreen', {
      //     amount: isFeatured ? featurePercent: accomodation_amount,
      //     feature_id: 1,
      //     nav: 'add',

      //     onSuccess: async () => {
      //       try {
      //         await handleListPress();
      //       } finally {
      //         isSubmitting = false; // ✅ reset AFTER payment success
      //       }
      //     },

      //     onCancel: () => {
      //       isSubmitting = false; // ✅ reset if user cancels payment
      //     },
      //   });
      // }


      const form =
        typeof storedForm === 'string' ? JSON.parse(storedForm) : storedForm;
      const isToggleOn =
        (
          Object.values(form || {}).find(
            (f: any) => f?.alias_name === 'isfeatured',
          ) as any
        )?.value === true;

      const apiIsFeaturedValue = apiIsFeatured;

      if (categoryid === 4 && maxCap1 > 0 && !apiIsFeaturedValue && isToggleOn) {
        if (apiIsFeaturedValue) {
          return t('update');
        }

        if (!apiIsFeaturedValue && isToggleOn) {
          navigation.navigate('PaymentScreen', {
            amount: maxCap1,
            feature_id: 1,
            nav: 'add',

            onSuccess: async () => {
              try {
                await handleListPress();
                
              } finally {
                isSubmitting = false;
              }
            },

            onCancel: () => {
              isSubmitting = false;
            },
          });
        }
        return t('update');
      } else {
        await handleListPress();
        isSubmitting = false;
      }
    } catch (e) {
      console.log('Error:', e);
      isSubmitting = false;
    }
  };

  return (
    // <BackgroundWrapper>
    <ImageBackground
      source={BACK_ICON}
      style={{ flex: 1, width: '100%', height: '100%' }}
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
            //onPress={() => navigation.replace('EditPreviewThumbnail')}
            onPress={() => {
              navigation.goBack();
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
            {t('preview_details')}
          </Text>
        </View>
        <AnimatedReanimated.ScrollView
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingBottom: height * 0.1 },
          ]}
        >
          <View style={{ marginTop: Platform.OS === 'ios' ? 9 : 12 }}>
            {userMeta?.category?.id === 2 || userMeta?.category?.id === 5 ? (
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
                  style={{ alignItems: 'center', justifyContent: 'center' }}
                >
                  {userMeta?.profile ? (
                    <Image
                      source={{ uri: userMeta?.profile }}
                      style={{
                        width: 180,
                        height: 180,
                        borderRadius: 90,
                      }}
                      resizeMode="cover"
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
                          fontSize: 70,
                          color: '#FFF',
                          fontWeight: '600',
                          textAlign: 'center',
                          fontFamily: 'Urbanist-SemiBold',
                        }}
                      >
                        {`${userMeta?.firstname?.[0] ?? ''}${
                          userMeta?.lastname?.[0] ?? ''
                        }`.toUpperCase() || 'NA'}
                      </Text>
                    </View>
                  )}
                </View>
              </ImageBackground>
            ) : storedForm?.[6]?.value?.length > 1 ? (
              <View>
                <FlatList
                  ref={flatListRef}
                  data={storedForm[6].value}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, index) => index.toString()}
                  onScroll={onScroll}
                  scrollEventThrottle={16}
                  renderItem={({ item }) => (
                    <Image
                      source={{ uri: item.uri }}
                      style={{ width: screenWidth, height: 270 }}
                      resizeMode="cover"
                    />
                  )}
                />

                {/* Custom Step Indicator */}
                <View style={styles.stepIndicatorContainer}>
                  {storedForm[6].value.map((_: any, index: number) => {
                    const isActive = index === activeIndex;
                    return (
                      <View
                        key={index}
                        style={
                          isActive
                            ? styles.activeStepCircle
                            : styles.inactiveStepCircle
                        }
                      />
                    );
                  })}
                </View>
              </View>
            ) : (
              <Image
                source={
                  storedForm?.[6]?.value?.[0]?.uri
                    ? { uri: storedForm[6].value[0].uri }
                    : require('../../../assets/images/drone.png')
                }
                style={{ width: '100%', height: 270 }}
                resizeMode="cover"
              />
            )}
          </View>

          <View style={{ flex: 1, padding: 16 }}>
            <View style={styles.card1}>
              <View style={{ gap: 8 }}>
                <Text allowFontScaling={false} style={styles.QuaddText}>
                  {titleValue}
                </Text>

                <Text allowFontScaling={false} style={styles.priceText}>
                  {priceText}
                </Text>

                {(categoryid === 2 || categoryid === 5) && (
                  <View style={styles.datePosted1}>
                    <Image
                      source={require('../../../assets/images/duration_info.png')}
                      style={{ height: 16, width: 16 }}
                    />
                    <Text allowFontScaling={false} style={styles.datetext1}>
                      {t('service_duration')}:{' '}
                      <Text style={styles.durationValue}>
                        {duration_value} {t('hours')}
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
                <Text allowFontScaling={false} style={styles.productDesHeding}>
                  {t('des')}
                </Text>
                <Text allowFontScaling={false} style={styles.productDesc}>
                  {descriptionvalue}
                </Text>

                <View style={styles.datePosted}>
                  <Image
                    source={require('../../../assets/images/calendar_icon1.png')}
                    style={{ height: 16, width: 16 }}
                  />
                  <Text allowFontScaling={false} style={styles.datetext}>
                    {t('date_posted')}: {formatDateWithDash(newdate, t)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.gap12}>
                {/* <Text allowFontScaling={false} style={styles.productDeatilsHeading}>
                  {userMeta?.category?.id === 3
                    ? t('dish_details')
                    : `${userMeta?.category?.name ? `${userMeta?.category?.name} ` : ''}${t('details')}`}
                </Text> */}

                <Text
                  allowFontScaling={false}
                  style={styles.productDeatilsHeading}
                >
                  {(() => {
                    switch (userMeta?.category?.id) {
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

                <View style={{ gap: 12 }}>
                  {fields.map(field => {
                    const fieldId = field.param.id;

                    const skipAliases = ['title', 'description', 'price'];
                    if (
                      skipAliases.includes(field.param.alias_name ?? '') ||
                      ['Image', 'boolean'].includes(field.param.field_type)
                    )
                      return null;

                    const storedValue = storedForm?.[fieldId]?.value;
                    if (storedValue == null) return null;

                    let displayValues: string[] = [];

                    if (field.param.field_type === 'dropdown') {
                      const storedField = storedForm?.[fieldId];
                      const storedValue = storedField?.value;
                      const otherText = storedField?.other_text ?? null;

                      // if (Array.isArray(storedValue)) {
                      //   displayValues = storedValue
                      //     .map((id: number) => {
                      //       const opt = field.param.options.find(
                      //         (o: any) => Number(o.id) === Number(id)
                      //       );
                      //       if (!opt) return null;

                      //       return otherText
                      //         ? `${opt.option_name} (${otherText})`
                      //         : opt.option_name;
                      //     })
                      //     .filter(Boolean) as string[];
                      // }
                      if (Array.isArray(storedValue)) {
                        displayValues = storedValue
                          .map((id: number) => {
                            const opt = field.param.options.find(
                              (o: any) => Number(o.id) === Number(id),
                            );
                            if (!opt) return null;

                            // ✅ apply text ONLY for "Other"
                            if (opt.is_other && otherText) {
                              return `${opt.option_name} (${otherText})`;
                            }

                            return opt.option_name;
                          })
                          .filter(Boolean) as string[];
                      } else {
                        const opt = field.param.options.find(
                          (o: any) => Number(o.id) === Number(storedValue),
                        );
                        if (opt) {
                          displayValues = [
                            otherText
                              ? `${opt.option_name} (${otherText})`
                              : opt.option_name,
                          ];
                        }
                      }
                    } else if (field.param.field_type === 'date') {
                      const startDate = storedValue?.startDate;
                      const endDate = storedValue?.endDate;

                      if (startDate && endDate) {
                        displayValues = [
                          `${dayjs(startDate).format('DD-MM-YYYY')} - ${dayjs(
                            endDate,
                          ).format('DD-MM-YYYY')}`,
                        ];
                      } else {
                        displayValues = [];
                      }
                    } else if (Array.isArray(storedValue)) {
                      displayValues = storedValue.map(String);
                    } else {
                      displayValues = [String(storedValue)];
                    }

                    return (
                      <View key={fieldId} style={{}}>
                        <Text
                          allowFontScaling={false}
                          style={styles.detailLabel1}
                        >
                          {field.param.field_name}
                        </Text>

                        {field.param.field_type === 'dropdown' ? (
                          <View style={styles.categoryContainer}>
                            {displayValues.map((val, idx) => (
                              <View key={idx} style={styles.categoryTag}>
                                <Text
                                  allowFontScaling={false}
                                  style={styles.catagoryText}
                                >
                                  {val}
                                </Text>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <Text
                            allowFontScaling={false}
                            style={[styles.new, { marginTop: 0 }]}
                          >
                            {displayValues.join(', ')}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
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
                  {userMeta?.profile ? (
                    <Image
                      source={{ uri: userMeta.profile }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={COMMONSTYLE.initialsCircle}>
                      <Text
                        allowFontScaling={false}
                        style={styles.initialsText}
                      >
                        {getInitials(
                          userMeta?.firstname ?? 'Alan',
                          userMeta?.lastname ?? 'Walker',
                        )}
                      </Text>
                    </View>
                  )}

                  <View style={{ width: '80%' }}>
                    <Text allowFontScaling={false} style={styles.userName}>
                      {`${userMeta?.firstname ?? ''} ${
                        userMeta?.lastname ?? ''
                      }`.trim()}
                    </Text>
                    <Text allowFontScaling={false} style={styles.univeritytext}>
                      {userMeta?.university_name || 'University of Warwick,'}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={[styles.univeritytext]}
                    >
                      {userMeta?.city || ''}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row' }}>
                  <View style={styles.bottombutton}>
                    <View
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

                      <Text allowFontScaling={false} style={styles.chattext}>
                        4.5
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.chatcard,
                      {
                        marginLeft: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                      },
                    ]}
                  >
                    <Image
                      source={require('../../../assets/images/message_chat.png')}
                      style={{ height: 16, width: 16, marginRight: 4 }}
                    />
                    <Text allowFontScaling={false} style={styles.chattext}>
                      {t('chat_with_seller')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </AnimatedReanimated.ScrollView>
        <Button
          onPress={handlePayment}
          title={(() => {
            try {
              const form =
                typeof storedForm === 'string'
                  ? JSON.parse(storedForm)
                  : storedForm;
         const isToggleOn =
           (
             Object.values(form || {}).find(
               (f: any) => f?.alias_name === 'isfeatured',
             ) as any
           )?.value === true;
             
              const apiIsFeaturedValue = apiIsFeatured;

              if (categoryid === 4 && maxCap1 > 0) {
                
                if (apiIsFeaturedValue) {
                  return t('update');
                }

               
                if (!apiIsFeaturedValue && isToggleOn) {
                  return `${t('update')} for £${maxCap1.toFixed(2)}`;
                }
                return t('update');
              }

              return t('update');
            } catch (e) {
              return 'Update';
            }
          })()}
        />

        {/* <Button
          onPress={handleListPress}
          title={(() => {
            try {
              const form = typeof storedForm === 'string' ? JSON.parse(storedForm) : storedForm;
              const isFeatured = form?.["13"]?.value === true || form?.["13"]?.value === 'true';
              if (categoryid === Number(4) && accomodation_amount > 0) {
                if (isFeatured) {
                  return `${t('update')} for £${accomodation_amount.toFixed(2)}`;
                } else { 
                  return t('update');
                }
                
              }
              return t('update');
            } catch (e) {

              return 'Update';
            }
            //    try {
            //   const form = typeof storedForm === 'string' ? JSON.parse(storedForm) : storedForm;
            //   const isFeatured = form?.["13"]?.value === true || form?.["13"]?.value === 'true';
            //   if (categoryid === Number(4)  ) {
            //     if (isFeatured && accomodation_amount > 0) {
            //          return `${t('Update')} for £${(accomodation_amount + maxCap1).toFixed(2)}`;;
            //     } else { 
            //       if(!isFeatured  && accomodation_amount > 0) {
            //         return `${t('Update')} for £${accomodation_amount.toFixed(2)}`;
            //       }
            //     }
                

            //   }
              
            //   return t('Update');
            // } catch (e) {
            //   // console.log('Error parsing storedForm:', e);
            //   return 'Update';
            // }
          })()} /> */}

        <Modal
          visible={showPopup}
          transparent
          animationType="fade"
          onRequestClose={closePopup}
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
                <Text
                  allowFontScaling={false}
                  style={{
                    color: 'rgba(255, 255, 255, 0.80)',
                    fontFamily: 'Urbanist-SemiBold',
                    fontSize: 20,
                    fontWeight: '600',
                    fontStyle: 'normal',
                    letterSpacing: -0.4,
                    lineHeight: 28,
                  }}
                >
                  {t('product_update_success')}!
                </Text>
                {/* <Text
                  allowFontScaling={false}
                  style={{
                    color: 'rgba(255, 255, 255, 0.48)',
                    fontFamily: 'Urbanist-Regular',
                    fontSize: 14,
                    fontWeight: '400',
                    fontStyle: 'normal',
                    letterSpacing: -0.28,
                    lineHeight: 19.6,
                    textAlign: 'center',
                  }}
                >
                  {t('product_listed_message')}
                </Text> */}

                <TouchableOpacity
                  style={[styles.loginButton]}
                  onPress={async () => {
                    try {
                      await AsyncStorage.removeItem('formData1');
                      await AsyncStorage.removeItem('selectedProductId');
                      await AsyncStorage.removeItem('isfeatured');

                      navigation.reset({
                        index: 0,
                        routes: [
                          {
                            name: 'MyListing',
                            params: { animation: 'none' },
                          },
                        ],
                      });
                      setShowPopup(false);
                    } catch (err) {}
                  }}
                >
                  <Text allowFontScaling={false} style={styles.loginText}>
                    {t('return_my_listings')}
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </Modal>
      </View>
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <Loader />
        </View>
      )}
      <NewCustomToastContainer />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
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

  datetext1: {
    color: '#9CD6FF',
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: -0.24,
    paddingLeft: 4,
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
    width: Platform.OS === 'ios' ? '100%' : '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 11,
    alignSelf: 'center',
    pointerEvents: 'box-none',
    marginTop: Platform.OS === 'ios' ? 0 : 0,
    marginLeft: 1,
  },
  backButtonContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 11,
    //top: 7,
  },
  // blurButtonWrapper: {
  //   width: 48,
  //   height: 48,
  //   borderRadius: 40,
  //   overflow: 'hidden',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   borderWidth: 0.4,
  //   borderColor: '#ffffff2c',
  //   backgroundColor: 'rgba(255, 255, 255, 0.1)',
  // },

  blurButtonWrapper: {
    width: 48,
    height: 48,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 0.4,
    // borderColor: '#ffffff2c',
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',

    borderWidth: 0.3,
    borderColor: '#ffffff11',

    boxShadow:
      '0 2px 4px 0 rgba(0, 0, 0, 0.23),0px 0.90px 0px 0px rgba(255, 255, 255, 0.11) inset, 0px -0.90px 0px 0px rgba(255, 255, 255, 0.11) inset',
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

  catagoryText: {
    color: '#9CD6FF',
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: -0.24,
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

  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },

  detailLabel1: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
  },

  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
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

  fullScreenContainer: {
    flex: 1,
  },

  loginText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    flexWrap: 'wrap',
    alignSelf: 'center',
    maxWidth: '96%', // ensures wrapping into 2 lines
    width: '100%',
  },

  loginButton: {
    display: 'flex',
    width: '100%',
    height: 52,
    maxHeight: 52,
    justifyContent: 'center',
    // alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    // paddingTop: 6,
    // paddingBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    marginTop: 16,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
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

  scrollContainer: {
    //paddingHorizontal: 20,
    paddingBottom: 80,
    paddingTop: Platform.OS === 'ios' ? 120 : 100,
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
    gap: 3,
  },

  datetext: {
    color: '#9CD6FF',
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: -0.24,
  },

  univeritytext: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    fontWeight: '500',
  },
  userName: {
    position: 'relative',
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.32,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  gap12: {
    gap: 12,
  },

  new: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 20,
  },

  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  productDesc: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 20,
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

  QuaddText: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    //fontStyle: 'normal',
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  priceText: {
    color: '#fff',
    fontFamily: 'Urbanist-Bold',
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: -0.1,
  },
  card1: {
    flexDirection: 'column',
    marginBottom: 6,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    gap: 10,
    marginTop: 6,
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
});

export default EditPreviewDetailed;
