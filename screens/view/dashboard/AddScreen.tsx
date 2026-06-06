import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  StatusBar,
  BackHandler,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageResizer from 'react-native-image-resizer';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';
import { MAIN_URL } from '../../utils/APIConstant';
import ToggleButton from '../../utils/component/ToggleButton';
import Button from '../../utils/component/Button';
import SelectCatagoryDropdown from '../../utils/component/SelectCatagoryDropdown';
import {
  NewCustomToastContainer,
  showToast,
} from '../../utils/component/NewCustomToastManager';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import { BlurView } from '@react-native-community/blur';
import SelectCatagoryDropdown_IOS from '../../utils/component/SelectCatagoryDropdown_IOS';
import Loader from '../../utils/component/Loader';
import dayjs from 'dayjs';
import {
  NestableScrollContainer,
  NestableDraggableFlatList,
} from 'react-native-draggable-flatlist';

import AnimatedReanimated, {
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  useDerivedValue,
  useAnimatedRef,
  useScrollViewOffset,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Constant } from '../../utils/Constant';
import { useTranslation } from 'react-i18next';
import i18n from '../../../localization/i18n';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getCityFromPostalCode } from '../../utils/geocoding';
import { IMAGE_URLS } from '../../utils/Style';
import BackgroundWrapper from '../../utils/component/BackgroundWrapper';
import COMMONSTYLE from '../../utils/CommonStyle';

import INFO_ICON from '../../../assets/images/info_icon.png';
import DELETE_ICON from '../../../assets/images/delete.png';
import FILEUPLOAD_ICON from '../../../assets/images/fileupload.png';
import BACK_ICON from '../../../assets/images/backimg.png';
import CustomModal from '../../utils/component/CustomModal.modal';

type AddScreenContentProps = {
  navigation: any;
};
type RootStackParamList = {
  AddScreen: { productId: number; productName: string };
  // other screens...
};
type AddScreenRouteProp = RouteProp<RootStackParamList, 'AddScreen'>;

type ImageFile = {
  id: string;
  uri: string;
  name: string;
};

const AddScreen = ({ navigation }: AddScreenContentProps) => {
  const [formValues, setFormValues] = useState<any>({});
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const MAX_SIZE_MB = 1;
  const MAX_IMAGES = 5;
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB');
  const displayDate = formattedDate.replace(/\//g, '-');
  const [photo, setPhoto] = useState<string | null>(null);
  const [dateStep, setDateStep] = useState<'start' | 'end'>('start');
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(
    undefined,
  );
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [popupData, setPopupData] = useState({
    title: '',
    message: '',
  });

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [activeDateField, setActiveDateField] = useState<{
    param: any;
    type: 'start' | 'end';
  } | null>(null);

  const [multiSelectModal, setMultiSelectModal] = useState<{
    visible: boolean;
    ismultilple: boolean;
    fieldId?: number;
    fieldLabel?: string;
    placeholder?: string;
  }>({ visible: false, ismultilple: false });

  type UploadedImage = {
    id: string;
    uri: string;
    name: string;
  };
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const [multiSelectOptions, setMultiSelectOptions] = useState<any[]>([]);
  // const [uploadedImages, setUploadedImages] = useState<
  //   { id: string; uri: string; name: string }[]
  // >([]);

  const screenHeight = Dimensions.get('window').height;
  const [slideUp1] = useState(new Animated.Value(0));

  //const scrollY = useSharedValue(0);
  const scrollRef = useAnimatedRef<any>();
  const scrollY = useScrollViewOffset(scrollRef);

  const AnimatedNestableScroll = Animated.createAnimatedComponent(
    NestableScrollContainer,
  );

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
    feePrecentage?: number;
    fixedFee?: number;
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

  const [userMeta, setUserMeta] = useState<UserMeta | null>(null);
  const [featureFee, setFeatureFee] = useState(0);
  const [maxFeatureCap, setMaxFeatureCap] = useState(0);
  const route = useRoute<AddScreenRouteProp>();
  const { productId, productName } = route.params;
  const [accommodation_amount, setaccommodation_amount] = useState(0);

  const [feePrecentage, setfeePrecentage] = useState(0);
  const [fixedFee, setFixedFee] = useState(0);

  const { height } = Dimensions.get('window');
  const bottomPadding = height * 0.0005;

  const [showThumnail, setShowThumnail] = useState(false);

  const [showpopup, setshowpopup] = useState(false);

  const [uri, setUri] = useState('');

  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const isValidPostalCode = (code: string) => {
    const cleaned = code.replace(/\s/g, '');

    // UK format
    const ukRegex = /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/i;

    // India format
    const indiaRegex = /^[1-9][0-9]{5}$/;

    return ukRegex.test(cleaned) || indiaRegex.test(cleaned);
  };

  const renderImageItem = ({ item, drag, isActive }: any) => {
    return (
      <View style={styles.imagelistcard}>
        {' '}
        <TouchableOpacity
          onLongPress={drag}
          onPress={() => {
            setShowThumnail(true);
            setUri(item.uri);
          }}
          disabled={isActive}
          style={[{ opacity: isActive ? 0.7 : 1 }]}
          activeOpacity={0.9}
        >
          {' '}
          <View
            key={item.id}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingRight: 6,
              paddingVertical: 6,
              paddingLeft: 8,
            }}
          >
            {' '}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                flex: 1,
              }}
            >
              {' '}
              <Image
                source={require('../../../assets/images/sixdots.png')}
                style={styles.threedots}
              />{' '}
              <Image
                source={{ uri: item.uri }}
                style={{ width: 32, height: 32, marginRight: 5 }}
              />{' '}
              <Text
                allowFontScaling={false}
                style={[styles.fileName, { flexShrink: 1 }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {' '}
                {item.name}{' '}
              </Text>{' '}
            </View>{' '}
            <TouchableOpacity
              onPress={() =>
                setUploadedImages(prev =>
                  prev.filter(img => img.id !== item.id),
                )
              }
            >
              {' '}
              <Image
                source={DELETE_ICON}
                style={{ width: 38, height: 38, resizeMode: 'contain' }}
              />{' '}
            </TouchableOpacity>{' '}
          </View>{' '}
          {uploadedImages.length > 1 && item !== uploadedImages.length - 1 && (
            <View
              style={{
                height: 1,
                backgroundColor:
                  'radial-gradient(87.5% 87.5% at 17.5% 6.25%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                marginHorizontal: 10,
              }}
            />
          )}{' '}
        </TouchableOpacity>{' '}
      </View>
    );
  };

  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        const language_code =
          (await AsyncStorage.getItem('selectedLanguage')) || 'en';

        const token = await AsyncStorage.getItem('userToken');
        console.log(token);
        if (!token) {
          // console.log('No token found');
          return;
        }

        const url = `${MAIN_URL.baseUrl}category/listparams/user/${productId}`;
        console.log(url);

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
          if (json.metadata.category) {
            // Convert null or undefined to 0
            setFeatureFee(Number(json.metadata.category.feature_fee ?? '0'));
            setMaxFeatureCap(
              Number(json.metadata.category.max_feature_cap ?? '0'),
            );
            setFeatureFee(Number(json.metadata.category.feature_fee ?? '0'));
            setMaxFeatureCap(
              Number(json.metadata.category.max_feature_cap ?? '0'),
            );
            setaccommodation_amount(
              Number(json.metadata.category.accommodation_amount ?? '0'),
            );
            setfeePrecentage(
              Number(json.metadata.category.feePrecentage ?? '0'),
            );
            setFixedFee(Number(json.metadata.category.fixedFee ?? '0'));
          }
          setUserMeta({
            firstname: json.metadata.firstname ?? null,
            lastname: json.metadata.lastname ?? null,
            profile: json.metadata.profile ?? null,
            student_email: json.metadata.student_email ?? null,
            university_name: json.metadata.university_name ?? null,
            category: json.metadata.category ?? null,
            city: json.metadata.city ?? null, //
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
        await AsyncStorage.setItem('selectedProductId', String(productId));

        if (json?.data) {
          const sellerFields = json.data.filter(
            (item: any) => item.seller === true,
          );
          setFields(sellerFields);
        }

        if (response.status === 401 || response.status === 403) {
          //setLoading(false)
          handleForceLogout();
          return;
        }

        if (json.statusCode === 401 || json.statusCode === 403) {
          //setLoading(false)
          handleForceLogout();
          return;
        }
      } catch (err) {
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
    fetchFields();
  }, []);

  const [expanded, setExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  // const AnimatedNestableScrollContainer =
  // Animated.createAnimatedComponent(NestableScrollContainer);

  useEffect(() => {
    if (expanded) {
      Animated.timing(animatedHeight, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
  }, [expanded]);

  useEffect(() => {
    const backAction = () => {
      navigation.replace('Dashboard', {
        AddScreenBackactiveTab: 'Add',
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

  const handleValueChange = (
    fieldId: number,
    aliasName: string | null,
    value: any,
  ) => {
    setFormValues((prev: any) => ({
      ...prev,
      [fieldId]: {
        value: value,
        alias_name: aliasName ?? null,
      },
    }));
  };
  const { t } = useTranslation();
  const handleMultiSelectToggle = (fieldId: number, optionId: number) => {
    const prevSelected: number[] = Array.isArray(formValues[fieldId]?.value)
      ? formValues[fieldId].value
      : [];

    const updated = prevSelected.includes(optionId)
      ? prevSelected.filter(id => id !== optionId)
      : [...prevSelected, optionId];

    setFormValues((prev: any) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        value: updated,
      },
    }));
  };

  const getCurrentDate = (t?: any) => {
    const today = new Date();

    const day = today.getDate();
    const year = today.getFullYear();
    const lang = i18n.language;
    const monthIndex = today.getMonth();
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
    const month = t ? t(monthKeys[monthIndex]) : monthKeys[monthIndex];
    let suffix = '';
    if (lang === 'en') {
      if (day % 10 === 1 && day !== 11) suffix = 'st';
      else if (day % 10 === 2 && day !== 12) suffix = 'nd';
      else if (day % 10 === 3 && day !== 13) suffix = 'rd';
      else suffix = 'th';
    }

    return `${day}${suffix} ${month} ${year}`;
  };

  const pluralizeLabel = (label: string) => {
    if (!label) return '';

    const words = label.trim().split(' ');
    const lastWord = words[words.length - 1];
    if (lastWord.toLowerCase().endsWith('s')) return label;

    let plural = lastWord;

    if (/(ch|sh|x|s|z)$/i.test(lastWord)) {
      plural = lastWord + 'es';
    } else if (/[aeiou]y$/i.test(lastWord)) {
      plural = lastWord + 's';
    } else if (/y$/i.test(lastWord)) {
      plural = lastWord.slice(0, -1) + 'ies';
    } else {
      plural = lastWord + 's';
    }
    words[words.length - 1] = plural;
    return words.join(' ');
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

  const handlePreview = async () => {
    try {
      for (const field of fields) {
        const { id, field_type } = field.param;
        let value = formValues[id]?.value;

        if (field_type.toLowerCase() === 'image') {
          value = uploadedImages;
        }

        if (field.mandatory) {
          if (field_type.toLowerCase() === 'date') {
            const startDate = value?.startDate;
            const endDate = value?.endDate;

            if (!startDate || !endDate) {
              showToast(t('select_both_dates'), 'error');
              return;
            }
          }

          // Check for empty or invalid values
          else if (
            value === undefined ||
            value === null ||
            (typeof value === 'string' && value.trim() === '') ||
            (Array.isArray(value) && value.length === 0)
          ) {
            if (field_type.toLowerCase() === 'image') {
              showToast(
                `${field.param.field_name} ${t(Constant.ARE_MAN)}`,
                'error',
              );
            } else {
              showToast(
                `${field.param.field_name} ${t(Constant.IS_MAN)}`,
                'error',
              );
            }
            return;
          }

          // Additional validation for 0 values
          else if (
            value === 0 ||
            (typeof value === 'string' && value.trim() === '0')
          ) {
            showToast(
              `${t('price_cannot_be_zero')} ${field.param.field_name} `,
              'error',
            );
            return;
          } else if (value < 0.5) {
            showToast(`${t('price_must_be_at_least')}`, 'error');
            return;
          }
        }

        // ✅ POSTCODE VALIDATION
        if (field.param.alias_name?.toLowerCase() === 'postcode') {
          const postcodeValue = formValues[field.param.id]?.value;

          const cityField = fields.find(
            (f: any) => f.param?.alias_name?.toLowerCase() === 'city',
          );

          const selectedCityId = cityField
            ? formValues[cityField.param.id]?.value
            : null;

          if (!postcodeValue || !selectedCityId) {
            showToast(t('valid_city'), 'error');
            return;
          }

          // 🔥 Call API again to verify
          const location = await getCityFromPostalCode(postcodeValue);

          if (!location || !location.city) {
            showToast(t('valid_city'), 'error');
            return;
          }

          const cityOptions = cityField?.param?.options || [];

          const matchedOption = cityOptions.find((opt: any) => {
            const option = opt.option_name?.toLowerCase() || '';
            const input = location.city.toLowerCase();
            return option.includes(input) || input.includes(option);
          });

          // ❌ No match OR mismatch
          if (!matchedOption || matchedOption.id !== selectedCityId) {
            showToast('Postal code does not match selected city', 'error');
            return;
          }
        }
      }

      let computedPrice: number | null = null;

      if (productId === 2 || productId === 5) {
        let priceFieldId: number | null = null;
        let durationFieldId: number | null = null;

        for (const f of fields) {
          if (f.param.alias_name === 'price') priceFieldId = f.param.id;
          if (f.param.alias_name === 'service_duration')
            durationFieldId = f.param.id;
        }

        if (priceFieldId !== null && durationFieldId !== null) {
          let rawPrice = formValues[priceFieldId]?.value || '0';

          rawPrice = String(rawPrice).replace(/[^\d.-]/g, '');

          const priceNumber = parseFloat(rawPrice);

          if (isNaN(priceNumber) || priceNumber > 99999 || priceNumber === 0) {
            showToast(`${t('price_limit')} £99,999`, 'error');
            return;
          }

          const rawDuration = Number(formValues[durationFieldId]?.value || 1);

          computedPrice = priceNumber * rawDuration;

          // Check if the computed price is zero
          if (computedPrice === 0) {
            showToast(t('price_cannot_be_zero'), 'error');
            return;
          }

          if (computedPrice < 0.5) {
            showToast(t('price_must_be_at_least'), 'error');
            return;
          }
        }
      }

      const dataToStore: any = { ...formValues };
      if (computedPrice !== null) {
        for (const f of fields) {
          if (f.param.alias_name === 'price') {
            dataToStore[f.param.id] = {
              value: computedPrice.toString(),
              alias_name: 'price',
            };
          }
        }
      }

      for (const field of fields) {
        if (field.param.field_type.toLowerCase() === 'image') {
          const uploadedForField = uploadedImages.map(img => ({
            id: img.id,
            uri: img.uri,
            name: img.name,
          }));

          dataToStore[field.param.id] = {
            value: uploadedForField,
            alias_name: field.param.alias_name ?? null,
          };
        }

        if (field.param.alias_name === 'price') {
          const priceValue = parseFloat(dataToStore[field.param.id]?.value);
          if (priceValue > 99999 || priceValue === 0) {
            showToast(`${t('price_limit')} £99,999`, 'error');
            return;
          }
        }
      }

      await AsyncStorage.setItem('formData', JSON.stringify(dataToStore));
      navigation.navigate('PreviewThumbnail');
    } catch (error) {
      showToast(t(Constant.DATA_NOT_SAVE), 'error');
    }
  };
  const resizeIfNeeded = async (asset: any) => {
    const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;

    // Sometimes fileSize is missing → resize anyway
    const shouldResize = !asset.fileSize || asset.fileSize > MAX_SIZE;

    if (!shouldResize) {
      return {
        uri: asset.uri,
        name: asset.fileName || 'image.jpg',
      };
    }

    const resized = await ImageResizer.createResizedImage(
      asset.uri,
      1280,
      1280,
      'JPEG',
      70,
    );

    return {
      uri: resized.uri,
      name: resized.name || asset.fileName || 'image.jpg',
    };
  };

  const handleSelectImage = async () => {
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
              { mediaType: 'photo', cameraType: 'front', quality: 1 },
              async response => {
                if (response.didCancel || !response.assets?.length) return;

                const asset = response.assets[0];
                const image = await resizeIfNeeded(asset);

                setUploadedImages(prev => [
                  ...prev,
                  { id: Date.now().toString(), ...image },
                ]);
              },
            );
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            const remainingSlots = MAX_IMAGES - uploadedImages.length;

            if (remainingSlots <= 0) {
              showToast(
                `${t(Constant.MAXIMUM)} ${MAX_IMAGES} ${t(
                  Constant.IMAGE_ALLOWED,
                )}`,
                'error',
              );
              return;
            }

            launchImageLibrary(
              {
                mediaType: 'photo',
                quality: 1,
                selectionLimit: remainingSlots,
              },
              async response => {
                if (response.didCancel || !response.assets) return;

                if (response.assets.length > remainingSlots) {
                  showToast(
                    `${t('you_can_select_only')} ${remainingSlots} ${t(
                      'more_images',
                    )}`,
                    'error',
                  );
                  return;
                }

                const processedImages = await Promise.all(
                  response.assets.map(asset => resizeIfNeeded(asset)),
                );

                setUploadedImages(prev => [
                  ...prev,
                  ...processedImages.map(img => ({
                    id: `${Date.now()}-${Math.random()}`,
                    ...img,
                  })),
                ]);
              },
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };
  const getInitials = (firstName = '', lastName = '') => {
    const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
    const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
    return f + l || '?';
  };

  const renderLabel = (field_name: any, mandatory: any) => (
    <Text allowFontScaling={false} style={styles.textstyle}>
      {field_name}
      {mandatory && <Text style={{ color: '#fff' }}>*</Text>}
    </Text>
  );

  const renderLabel1 = (field_name: any, mandatory: any) => (
    <Text numberOfLines={2} allowFontScaling={false} style={styles.textstyle1}>
      {field_name}
      {mandatory && <Text style={{ color: '#fff' }}>*</Text>}
    </Text>
  );

  const [isCheckbox, setCheckBox] = useState(false);

  const ClickPostalCode = async (postalCode: any) => {
    const location = await getCityFromPostalCode(postalCode);

    if (!location) {
      return;
    }
  };

  const getCityFromPostalCode = async (postalCode: string) => {
    try {
      postalCode = postalCode.replace(/\s+/g, '').toUpperCase();
      postalCode = postalCode.slice(0, -3) + ' ' + postalCode.slice(-3);
      console.log('postalCode:', postalCode);
      console.log(
        'URL: ',
        `https://nominatim.openstreetmap.org/search?postalcode=${postalCode}&format=json&addressdetails=1`,
      );
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${postalCode}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MyAndroidApp/1.0 (contact@myapp.com)',
            'Accept-Language': 'en-US',
          },
        },
      );

      const data = await response.json();
      console.log('location data:', data);

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
        lat: parseFloat(result.lat), // ✅ FIX
        lon: parseFloat(result.lon), // ✅ FIX
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  const renderField = (field: any) => {
    const param = field?.param;
    if (!param) return null;

    const fieldType = param.field_type?.toLowerCase() ?? '';
    const field_ismultilple = param.ismultilple ?? false;
    const field_name = param.field_name ?? '';
    const placeholder = param.placeholder ?? '';
    const id = param.id;
    const options = Array.isArray(param.options) ? param.options : [];

    if (!fieldType || !id) return null;

    switch (fieldType) {
      case 'text': {
        const { param } = field;
        const { field_name, keyboardtype, alias_name, placeholder } = param;

        const rawValue = formValues[param.id]?.value || '';

        const isPriceField = alias_name?.toLowerCase() === 'price';

        const placeholderText = placeholder
          ? placeholder
          : `${t('enter')} ${field_name}`;
        const isPostcodeField = alias_name?.toLowerCase() === 'postcode';

        let rnKeyboardType:
          | 'default'
          | 'numeric'
          | 'email-address'
          | 'phone-pad'
          | 'decimal-pad' = 'default';
        switch (keyboardtype) {
          case 'alpha-numeric':
            rnKeyboardType = 'default';
            break;
          case 'numeric':
            rnKeyboardType = 'numeric';
            break;
          case 'decimal':
            rnKeyboardType = 'decimal-pad';
            break;
          case 'email':
            rnKeyboardType = 'email-address';
            break;
          case 'phone':
            rnKeyboardType = 'phone-pad';
            break;
          default:
            rnKeyboardType = 'default';
        }

        const handlePostalCodeChange = (text: string) => {
          const filteredText = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

          if (filteredText.length > 7) return;

          handleValueChange(param.id, alias_name, filteredText);

          const cityField = fields?.find(
            (f: any) => f.param?.alias_name?.toLowerCase() === 'city',
          );

          if (!cityField) return;

          const stripped = filteredText.replace(/\s/g, '');

          // Reset city if empty
          if (stripped.length === 0) {
            setFormValues((prev: any) => ({
              ...prev,
              [cityField.param.id]: {
                ...prev[cityField.param.id],
                value: null,
              },
            }));
            return;
          }

          // ❌ Invalid format
          if (!isValidPostalCode(filteredText)) {
            return; // don’t spam toast while typing
          }

          if (stripped.length < 5) return;

          if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
          }

          typingTimeout.current = setTimeout(async () => {
            const cityName = await getCityFromPostalCode(filteredText);

            const cityOptions = cityField.param?.options || [];

            // ❌ NO CITY FROM API
            if (!cityName) {
              showToast(t('valid_city'), 'error');

              setFormValues((prev: any) => ({
                ...prev,
                [cityField.param.id]: {
                  ...prev[cityField.param.id],
                  value: null,
                },
              }));

              return;
            }

            const matchedOption = cityOptions.find((opt: any) => {
              const option = opt.option_name?.toLowerCase() || '';
              const input = cityName.city?.toLowerCase() || '';
              return option.includes(input) || input.includes(option);
            });

            // ❌ CITY NOT MATCHED WITH DROPDOWN
            if (!matchedOption) {
              showToast(t('valid_city'), 'error');

              setFormValues((prev: any) => ({
                ...prev,
                [cityField.param.id]: {
                  ...prev[cityField.param.id],
                  value: null,
                },
              }));

              return;
            }

            // ✅ SUCCESS
            setFormValues((prev: any) => ({
              ...prev,
              [cityField.param.id]: {
                ...prev[cityField.param.id],
                value: matchedOption.id,
              },
            }));
          }, 800);
        };

        return (
          <View key={field.id} style={styles.productTextView}>
            {renderLabel(field_name, field.mandatory)}

            <View style={styles.inputWrapper}>
              <TextInput
                allowFontScaling={false}
                style={[
                  styles.personalEmailID_TextInput,
                  styles.login_container,
                  {
                    height: 44,
                    textAlignVertical: 'center',
                    paddingVertical: 0,
                  },
                ]}
                placeholder={placeholderText}
                multiline={false}
                placeholderTextColor="rgba(255, 255, 255, 0.48)"
                keyboardType={rnKeyboardType}
                selectionColor={'#FFFFFF'}
                cursorColor="#FFFFFF"
                value={isPriceField && rawValue ? `£ ${rawValue}` : rawValue}
                onChangeText={text => {
                  let value = text;

                  if (alias_name?.toLowerCase() === 'quantity') {
                    if (value === '0') return;
                  }

                  if (isPriceField) {
                    const cleaned = text.replace(/£\s?/g, '');
                    handleValueChange(param.id, alias_name, cleaned);
                  } else {
                    //handleValueChange(param.id, alias_name, text);

                    // handleValueChange(param.id, alias_name, text);

                    // if (field_name.toLowerCase().includes('postcode')) {
                    //   // Remove all special characters and convert to uppercase
                    //   value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(); // Remove special characters
                    //   if (value.length > 7) return;
                    //   handlePostalCodeChange(value); // Handle the postcode change logic
                    // } else {
                    //   handleValueChange(param.id, alias_name, value); // Otherwise, handle the regular input change
                    // }

                    if (alias_name?.toLowerCase() === 'postcode') {
                      let value = text
                        .replace(/[^a-zA-Z0-9]/g, '')
                        .toUpperCase();
                      if (value.length > 7) return;
                      handlePostalCodeChange(value);
                    } else {
                      handleValueChange(param.id, alias_name, value);
                    }
                  }
                }}
              />

              {field?.info_icon && (
                <TouchableOpacity
                  style={styles.iconWrapper}
                  activeOpacity={0.7}
                  onPress={() => {
                    setPopupData({
                      title: field_name,
                      message: field?.info_text || '',
                    });
                    setshowpopup(true);
                  }}
                >
                  <Image
                    source={require('../../../assets/images/info_icon.png')}
                    style={styles.infoIcon}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      }

      case 'multi-line-text': {
        const { param } = field;
        const { field_name, keyboardtype, alias_name, placeholder } = param;
        // const placeholderText =
        //   alias_name?.toLowerCase() === 'price'
        //     ? `£ ${t('enter')} ${field_name}`
        //     : `${t('enter')} ${field_name}`;
        const placeholderText = placeholder
          ? placeholder
          : `${t('enter')} ${field_name}`;

        let rnKeyboardType:
          | 'default'
          | 'numeric'
          | 'email-address'
          | 'phone-pad'
          | 'decimal-pad' = 'default';
        switch (keyboardtype) {
          case 'alpha-numeric':
            rnKeyboardType = 'default';
            break;
          case 'numeric':
            rnKeyboardType = 'numeric';
            break;
          case 'decimal':
            rnKeyboardType = 'decimal-pad';
            break;
          case 'email':
            rnKeyboardType = 'email-address';
            break;
          case 'phone':
            rnKeyboardType = 'phone-pad';
            break;
          default:
            rnKeyboardType = 'default';
        }

        return (
          <View key={field.id} style={styles.productTextView}>
            {/* <Text style={styles.textstyle}>{field_name}</Text> */}
            {renderLabel(field_name, field.mandatory)}
            <TextInput
              allowFontScaling={false}
              style={[
                styles.personalEmailID_TextInput,
                styles.login_container,
                { textAlign: 'left', textAlignVertical: 'top', height: 100 },
              ]}
              placeholder={placeholderText}
              multiline={true}
              selectionColor={'#F5F5F5F5'}
              cursorColor="#F5F5F5F5"
              placeholderTextColor="rgba(255, 255, 255, 0.48)"
              keyboardType={rnKeyboardType}
              value={formValues[param.id]?.value || ''}
              onChangeText={text =>
                handleValueChange(param.id, alias_name, text)
              }
            />
          </View>
        );
      }

      case 'dropdown':
        return (
          <View key={field.id} style={styles.productTextView}>
            {/* <Text style={styles.textstyle}>{field_name}</Text> */}
            {renderLabel(field_name, field.mandatory)}

            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => {
                setMultiSelectModal({
                  visible: true,
                  ismultilple: !!field.param.ismultilple,
                  fieldId: id,
                  fieldLabel: field.param.field_name,
                  placeholder: field.param.placeholder,
                });
                setMultiSelectOptions(options);
              }}
            >
              <View style={styles.dropdowncard}>
                {(() => {
                  const selectedValue = formValues[id]?.value;

                  const selectedCount = Array.isArray(selectedValue)
                    ? selectedValue.length
                    : selectedValue != null
                    ? 1
                    : 0;

                  return (
                    <Text
                      numberOfLines={2}
                      allowFontScaling={false}
                      style={styles.dropdowntext}
                    >
                      {selectedCount > 0
                        ? `${selectedCount} ${t('selected')}`
                        : `${placeholder}`}
                    </Text>
                  );
                })()}
              </View>

              <Image
                source={require('../../../assets/images/right.png')}
                style={[
                  styles.dropdownIcon,
                  { marginRight: field?.info_icon ? 30 : 0 },
                ]}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <View style={styles.categoryContainer}>
              {options
                .filter((opt: any) => {
                  const value = formValues[id]?.value;
                  if (!value) return false;

                  if (Array.isArray(value)) {
                    return value.includes(opt.id);
                  }
                  return value === opt.id;
                })
                .map((opt: any) => (
                  <View key={opt.id} style={styles.categoryTagWrapper}>
                    <TouchableOpacity
                      onPress={() => {
                        setFormValues((prev: any) => {
                          const currentValue = prev[id]?.value;
                          let updatedValue;

                          if (Array.isArray(currentValue)) {
                            const filtered = currentValue.filter(
                              (v: number) => v !== opt.id,
                            );
                            updatedValue =
                              filtered.length > 0 ? filtered : null;
                          } else {
                            updatedValue = null;
                          }

                          return {
                            ...prev,
                            [id]: {
                              ...prev[id],
                              value: updatedValue,
                              otherText: opt.is_other
                                ? undefined
                                : prev[id]?.otherText,
                            },
                          };
                        });
                      }}
                    >
                      <View style={styles.categoryTagContainer}>
                        <Text
                          allowFontScaling={false}
                          style={styles.categoryTagText}
                        >
                          {opt.option_name}
                          {opt.is_other && formValues[id]?.otherText
                            ? `: ${formValues[id].otherText}`
                            : ''}
                        </Text>

                        <Image
                          source={require('../../../assets/images/new_cross.png')}
                          style={styles.crossIcon}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              {field?.info_icon && (
                <TouchableOpacity
                  style={[
                    styles.iconWrapper,
                    {
                      right: 12,
                      top: -45, // ✅ anchor from top
                      height: 40,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setPopupData({
                      title: field_name,
                      message: field?.info_text || '',
                    });
                    setshowpopup(true);
                  }}
                >
                  <Image
                    source={require('../../../assets/images/info_icon.png')}
                    style={styles.infoIcon}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        );

      case 'image': {
        const { param } = field;
        const { field_name, maxvalue, ismulltiple } = param;

        const handleImageSelect = () => {
          if (uploadedImages.length >= maxvalue) {
            showToast(
              `${t(Constant.MAXIMUM)} ${maxvalue} ${t(Constant.IMAGE_ALLOWED)}`,
            );
            return;
          }
          handleSelectImage();
        };

        return (
          <View key={field.id} style={styles.productTextView}>
            {/* <Text style={styles.textstyle}>{field_name}</Text> */}
            {renderLabel(field_name, field.mandatory)}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleImageSelect}
            >
              <Image source={FILEUPLOAD_ICON} style={styles.uploadIcon} />
              <Text allowFontScaling={false} style={styles.uploadText}>
                {t('upload_images')}
              </Text>
            </TouchableOpacity>
            {uploadedImages.length > 0 && (
              <View
                style={{
                  backgroundColor:
                    'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.10) 100%)',
                  boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.32)',
                  borderRadius: 12,
                  borderWidth: 0.4,
                  borderColor: '#ffffff33',
                  marginTop: 10,
                }}
              >
                <NestableDraggableFlatList<UploadedImage>
                  data={uploadedImages}
                  keyExtractor={item => item.id}
                  renderItem={renderImageItem}
                  autoscrollSpeed={30}
                  onDragEnd={({ data }) => setUploadedImages(data)}
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                  }}
                  containerStyle={{
                    minHeight: Platform.select({
                      ios: 60,
                      android: 60,
                    }),
                  }}
                />
              </View>
            )}
          </View>
        );
      }

      case 'date': {
        const { param } = field;
        const { field_name } = param;

        const value = formValues[param.id]?.value;
        const startDate = value?.startDate;
        const endDate = value?.endDate;

        return (
          <View key={field.id} style={styles.productTextView}>
            {renderLabel(field_name, field.mandatory)}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              {/* FROM DATE */}
              <TouchableOpacity
                style={[styles.pickerContainer, styles.dateBox]}
                onPress={() => {
                  setActiveDateField({ param, type: 'start' });
                  setDatePickerVisible(true);
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.dropdowntext,
                    { color: startDate ? '#fff' : 'rgba(255,255,255,0.6)' },
                  ]}
                >
                  {startDate
                    ? dayjs(startDate).format('DD-MM-YYYY')
                    : t('start_date')}
                </Text>

                <Image
                  source={require('../../../assets/images/calendar_icon.png')}
                  style={styles.calendarIcon}
                />
              </TouchableOpacity>

              {/* TO DATE */}
              <TouchableOpacity
                style={[styles.pickerContainer, styles.dateBox]}
                onPress={() => {
                  setActiveDateField({ param, type: 'end' });
                  setDatePickerVisible(true);
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.dropdowntext,
                    { color: endDate ? '#fff' : 'rgba(255,255,255,0.6)' },
                  ]}
                >
                  {endDate
                    ? dayjs(endDate).format('DD-MM-YYYY')
                    : t('end_date')}
                </Text>

                <Image
                  source={require('../../../assets/images/calendar_icon.png')}
                  style={styles.calendarIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        );
      }

      case 'boolean':
        return (
          <View key={field.id} style={styles.featurecard}>
            <View style={styles.featuredRow}>
              <View style={{ width: '80%' }}>
                {renderLabel1(field.param.field_name, field.mandatory)}
              </View>
              <ToggleButton
                value={!!formValues[field.param.id]?.value}
                onValueChange={val =>
                  handleValueChange(field.param.id, field.param.alias_name, val)
                }
              />
            </View>

            <View style={styles.textbg}>
              <Image
                source={require('../../../assets/images/info_icon.png')}
                style={{ width: 16, height: 16, marginRight: 8, marginTop: 2 }}
              />

              <View style={{ flex: 1 }}>
                {productId !== 4 ? (
                  <>
                    <Text
                      allowFontScaling={false}
                      style={styles.importantText1}
                    >
                      {t('important')}
                    </Text>

                    <Text allowFontScaling={false} style={styles.importantText}>
                      {t('featured_listing_note_1')}{' '}
                      <Text
                        allowFontScaling={false}
                        style={styles.importantText1}
                      >
                        {Math.trunc(featureFee)}%
                      </Text>{' '}
                      {t('featured_listing_fee_percentage')}{' '}
                      <Text
                        allowFontScaling={false}
                        style={styles.importantText}
                      >
                        (
                      </Text>
                      <Text
                        allowFontScaling={false}
                        style={styles.importantText}
                      >
                        {t('capped')}{' '}
                      </Text>
                      <Text
                        allowFontScaling={false}
                        style={styles.importantText1}
                      >
                        £{Math.trunc(maxFeatureCap)}
                      </Text>
                      <Text
                        allowFontScaling={false}
                        style={styles.importantText}
                      >
                        )
                      </Text>{' '}
                      {t('featured_listing_fee_cap')}
                    </Text>
                  </>
                ) : (
                  <View>
                    <Text
                      allowFontScaling={false}
                      style={styles.importantText1}
                    >
                      {t('important')}
                    </Text>

                    <Text allowFontScaling={false} style={styles.importantText}>
                      {t('featured_listing_note_homesearch')}{' '}
                      <Text
                        allowFontScaling={false}
                        style={styles.importantText1}
                      >
                        £{Math.trunc(maxFeatureCap)}
                      </Text>{' '}
                      {t('featured_listing_note_homesearch1')}
                      {t('accoumdationnote_new1')} {feePrecentage}% + £
                      {fixedFee.toFixed(2)} {t('accoumdationnote_new2')}
                      <Text
                        allowFontScaling={false}
                        style={styles.importantText}
                      ></Text>
                      <Text
                        allowFontScaling={false}
                        style={styles.importantText}
                      ></Text>
                      <Text
                        allowFontScaling={false}
                        style={styles.importantText1}
                      />
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const featuredField = fields.find(
    (f: any) => f?.param?.field_type?.toLowerCase() === 'boolean',
  );

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

        <View style={COMMONSTYLE.headerContent} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => {
              navigation.replace('Dashboard', {
                AddScreenBackactiveTab: 'Add',
                isNavigate: false,
              });
            }}
            style={styles.backButtonContainer}
            activeOpacity={0.7}
          >
            <AnimatedReanimated.View
              style={[COMMONSTYLE.blurButtonWrapper, animatedButtonStyle]}
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

          <View style={{ width: Dimensions.get('screen').width * 0.6 }}>
            <Text
              allowFontScaling={false}
              style={styles.unizyText}
              numberOfLines={2}
            >
              {(() => {
                switch (productId) {
                  case 2:
                    return `${t('post_tution')}`;
                  case 3:
                    return `${t('post_food')}`;
                  case 4:
                    return `${t('post_accomodation')}`;
                  case 5:
                    return `${t('post_house_option')}`;
                  default:
                    return `${t('post_product')}`;
                }
              })()}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {}}
            style={styles.backButtonContainer}
            activeOpacity={0.7}
          >
            <AnimatedReanimated.View style={[styles.blurButtonWrapper_none]}>
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
                  { display: 'none' },
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
                  { display: 'none' },
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
                style={[{ height: 24, width: 24, display: 'none' }]}
              />
            </AnimatedReanimated.View>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderWrapper}>
            <Loader containerStyle={styles.loaderContainer} />
          </View>
        ) : (
          <View
            style={{ flex: 1 }}
            //behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
              <NestableScrollContainer
                nestedScrollEnabled
                ref={scrollRef}
                scrollEventThrottle={16}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                // onScroll={scrollHandler}
                contentContainerStyle={[
                  styles.scrollContainer,
                  {
                    paddingBottom:
                      Platform.OS === 'ios' ? height * 0.11 : height * 0.11,
                  }, // 0.05% of screen height
                  {
                    paddingBottom:
                      Platform.OS === 'ios' ? height * 0.11 : height * 0.11,
                  }, // 0.05% of screen height
                ]}
              >
                <View style={styles.userRow}>
                  <View
                    style={{
                      width: '20%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
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
                  </View>

                  <View style={{ width: '80%' }}>
                    <Text allowFontScaling={false} style={styles.userName}>
                      {userMeta
                        ? `${userMeta.firstname ?? ''} ${
                            userMeta.lastname ?? ''
                          }`.trim()
                        : 'Alan Walker'}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        display: 'flex',
                        alignItems: 'stretch',
                      }}
                    >
                      <Text allowFontScaling={false} style={styles.userSub}>
                        {userMeta?.university_name || 'University of Warwick,'}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text allowFontScaling={false} style={styles.userSub2}>
                          {userMeta?.city || 'Coventry'}
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <Image
                            source={require('../../../assets/images/calendar_icon1.png')}
                            style={{ height: 20, width: 20 }}
                          />
                          <Text
                            allowFontScaling={false}
                            style={styles.dateText}
                          >
                            {getCurrentDate(t)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.productdetails}>
                  <Animated.View
                    style={{
                      transform: [{ translateY: slideUp1 }],
                      opacity: slideUp1.interpolate({
                        inputRange: [-screenHeight, 0],
                        outputRange: [0, 1],
                      }),
                    }}
                  >
                    <Text
                      allowFontScaling={false}
                      style={styles.productdetailstext}
                    >
                      {(() => {
                        switch (productId) {
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
                    {fields
                      .filter((f: any) => {
                        const isBoolean =
                          f?.param?.field_type?.toLowerCase() === 'boolean';
                        if (productId === 4) return true;
                        return !isBoolean;
                      })
                      .map((field: any) => renderField(field))}
                  </Animated.View>
                </View>
                {productId !== 4 && featuredField && (
                  <View>{renderField(featuredField)}</View>
                )}

                {productId === 4 && (
                  <View style={[styles.textbg, { marginTop: 12 }]}>
                    <Image
                      source={INFO_ICON}
                      style={{
                        width: 16,
                        height: 16,
                        marginRight: 8,
                        marginTop: 2,
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        allowFontScaling={false}
                        style={styles.importantText1}
                      >
                        {t('important')}
                      </Text>

                      <Text
                        allowFontScaling={false}
                        style={styles.importantText}
                      >
                        {t('fixed_commission')}{' '}
                        <Text style={styles.importantText1}>
                          £{accommodation_amount}
                        </Text>{' '}
                        {t('acc_message')} {t('accoumdationnote_new1')}{' '}
                        {feePrecentage}% + £{fixedFee.toFixed(2)}{' '}
                        {t('accoumdationnote_new2')}
                      </Text>
                    </View>
                  </View>
                )}
              </NestableScrollContainer>
            </KeyboardAvoidingView>
          </View>
        )}
        <Button title={t('preview_details')} onPress={() => handlePreview()} />
      </View>

      {Platform.OS === 'ios' && datePickerVisible && activeDateField && (
        <Modal transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: '#00000066' }}>
            <TouchableWithoutFeedback
              onPress={() => {
                setDatePickerVisible(false);
                setActiveDateField(null);
              }}
            >
              <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>

            <View style={{ backgroundColor: '#fff' }}>
              {/* HEADER */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 12,
                  borderBottomWidth: 0.5,
                  borderColor: '#ddd',
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setDatePickerVisible(false);
                    setActiveDateField(null);
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{ color: '#999', fontSize: 16 }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const currentValue =
                      formValues[activeDateField.param.id]?.value || {};

                    if (activeDateField.type === 'start') {
                      handleValueChange(
                        activeDateField.param.id,
                        activeDateField.param.alias_name ??
                          activeDateField.param.field_name,
                        {
                          startDate: tempDate,
                          endDate:
                            currentValue.endDate &&
                            dayjs(currentValue.endDate).isBefore(tempDate)
                              ? null
                              : currentValue.endDate,
                        },
                      );
                    } else {
                      handleValueChange(
                        activeDateField.param.id,
                        activeDateField.param.alias_name ??
                          activeDateField.param.field_name,
                        {
                          startDate: currentValue.startDate,
                          endDate: tempDate,
                        },
                      );
                    }

                    setDatePickerVisible(false);
                    setActiveDateField(null);
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{ color: '#007AFF', fontSize: 16 }}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                themeVariant="light"
                minimumDate={
                  activeDateField.type === 'end'
                    ? formValues[activeDateField.param.id]?.value?.startDate ??
                      new Date()
                    : new Date()
                }
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setTempDate(selectedDate);
                  }
                }}
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'android' && datePickerVisible && activeDateField && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="calendar"
          minimumDate={
            activeDateField.type === 'end'
              ? formValues[activeDateField.param.id]?.value?.startDate ??
                new Date()
              : new Date()
          }
          onChange={(event, selectedDate) => {
            if (event.type === 'dismissed') {
              setDatePickerVisible(false);
              setActiveDateField(null);
              return;
            }

            if (selectedDate) {
              const currentValue =
                formValues[activeDateField.param.id]?.value || {};

              if (activeDateField.type === 'start') {
                handleValueChange(
                  activeDateField.param.id,
                  activeDateField.param.alias_name ??
                    activeDateField.param.field_name,
                  {
                    startDate: selectedDate,
                    endDate:
                      currentValue.endDate &&
                      dayjs(currentValue.endDate).isBefore(selectedDate)
                        ? null
                        : currentValue.endDate,
                  },
                );
              } else {
                handleValueChange(
                  activeDateField.param.id,
                  activeDateField.param.alias_name ??
                    activeDateField.param.field_name,
                  {
                    startDate: currentValue.startDate,
                    endDate: selectedDate,
                  },
                );
              }
            }
            setDatePickerVisible(false);
            setActiveDateField(null);
          }}
        />
      )}

      <Modal
        visible={showThumnail}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <TouchableWithoutFeedback>
          <View style={styles.overlay}>
            <BlurView
              style={[
                StyleSheet.absoluteFill,
                {
                  alignSelf: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                  justifyContent: 'center',
                },
              ]}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(0, 0, 0, 0.47)' },
              ]}
            />

            <View style={styles.popupContainer}>
              <Image
                source={{ uri: uri }}
                style={{
                  width: '100%',
                  height: 300,
                  paddingLeft: 3,
                  paddingEnd: 3,
                }}
                resizeMode="contain"
              />

              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => {
                  setShowThumnail(false);
                }}
              >
                <Text allowFontScaling={false} style={styles.loginText}>
                  {t('close')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <CustomModal visible={showpopup} onClose={() => setshowpopup(false)}>
        
            <BlurView
              style={[
                StyleSheet.absoluteFill,
                {
                  alignSelf: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                  justifyContent: 'center',
                },
              ]}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(0, 0, 0, 0.32)' },
              ]}
            />

            <View style={styles.popupContainer}>
              <Text allowFontScaling={false} style={styles.popupMainHeader}>
                {popupData.title}
              </Text>
              <Text allowFontScaling={false} style={styles.popupSubHeader}>
                {popupData.message}
              </Text>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => {
                  setshowpopup(false);
                }}
              >
                <Text allowFontScaling={false} style={styles.loginText}>
                  {t('close')}
                </Text>
              </TouchableOpacity>
            </View>
     </CustomModal>

      {/* <Modal
        visible={showpopup}
        transparent
        animationType="fade"
        onRequestClose={() => setshowpopup(false)}
      >
        <TouchableWithoutFeedback onPress={() => setshowpopup(false)}>
          <View style={styles.overlay}>
            <BlurView
              style={[
                StyleSheet.absoluteFill,
                {
                  alignSelf: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                  justifyContent: 'center',
                },
              ]}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(0, 0, 0, 0.32)' },
              ]}
            />

            <View style={styles.popupContainer}>
              <Text allowFontScaling={false} style={styles.popupMainHeader}>
                {popupData.title}
              </Text>
              <Text allowFontScaling={false} style={styles.popupSubHeader}>
                {popupData.message}
              </Text>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => {
                  setshowpopup(false);
                }}
              >
                <Text allowFontScaling={false} style={styles.loginText}>
                  {t('close')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal> */}

    

      {Platform.OS === 'android' ? (
        <>
          <SelectCatagoryDropdown
            options={multiSelectOptions}
            visible={multiSelectModal.visible}
            ismultilple={multiSelectModal?.ismultilple}
            title={multiSelectModal.placeholder}
            subtitle={
              multiSelectModal?.ismultilple
                ? `${t('pick_all')} ${pluralizeLabel(
                    multiSelectModal?.fieldLabel || 'category',
                  )} ${t('best_describe')}`
                : ` ${multiSelectModal?.placeholder || 'category'} ${t(
                    'that_fit_your_listing',
                  )}`
            }
            selectedValues={formValues[multiSelectModal.fieldId!]?.value}
            onClose={() =>
              setMultiSelectModal(prev => ({ ...prev, visible: false }))
            }
            otherTextValue={formValues[multiSelectModal.fieldId!]?.otherText}
            onSelect={(data: any) => {
              setFormValues((prev: any) => ({
                ...prev,
                [multiSelectModal.fieldId!]: {
                  value: data.selected,
                  otherText: data.text,
                },
              }));
            }}
          />
        </>
      ) : (
        <>
          <SelectCatagoryDropdown_IOS
            options={multiSelectOptions}
            visible={multiSelectModal.visible}
            ismultilple={multiSelectModal?.ismultilple}
            title={multiSelectModal.placeholder}
            subtitle={
              multiSelectModal?.ismultilple
                ? `${t('pick_all')} ${pluralizeLabel(
                    multiSelectModal?.fieldLabel || 'category',
                  )} ${t('best_describe')}`
                : ` ${multiSelectModal?.placeholder || 'category'} ${t(
                    'that_fit_your_listing',
                  )}`
            }
            selectedValues={formValues[multiSelectModal.fieldId!]?.value}
            onClose={() =>
              setMultiSelectModal(prev => ({ ...prev, visible: false }))
            }
            otherTextValue={formValues[multiSelectModal.fieldId!]?.otherText}
            onSelect={(data: any) => {
              setFormValues((prev: any) => ({
                ...prev,
                [multiSelectModal.fieldId!]: {
                  value: data.selected,
                  otherText: data.text,
                },
              }));
            }}
          />
        </>
      )}

      <NewCustomToastContainer />
    </ImageBackground>
  );
};

export default AddScreen;

const styles = StyleSheet.create({
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },

  iconWrapper: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoIcon: {
    width: 24,
    height: 24,
  },

  popupMainHeader: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 28,
    textAlign: 'center',
  },
  popupSubHeader: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-Regular',
    ...COMMONSTYLE.FONT_14,
    ...COMMONSTYLE.FONTWEIGHT_400,
    textAlign: 'center',
    marginTop: 6,
  },

  categoryTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderWidth: 0.9,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderBlockEndColor: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9,
    marginRight: 4,
    marginBottom: 4,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.23)',
    maxWidth: '100%',
  },

  categoryTagText: {
    flexShrink: 1,
    maxWidth: '90%',
    ...COMMONSTYLE.FONT_14,
    ...COMMONSTYLE.FONTWEIGHT_500,
    ...COMMONSTYLE.FONTFAMILY_MEDIUM,
    ...COMMONSTYLE.COLOR_FFF,
  },
  crossIcon: {
    width: 16,
    height: 16,
    marginLeft: 6,
  },
  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },

  calendarIcon: {
    width: 18,
    height: 18,
    tintColor: '#fff',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  popupContainer: {
    width: '90%',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    overflow: 'hidden',

    backgroundColor: 'rgba(255, 255, 255, 0.10)',
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

  initialsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
  },
  featurecard: {
    paddingHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },

  dropdownIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFF',
  },
  dropdowncard: {
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    alignSelf: 'center',
  },
  dropdowntext: {
    ...COMMONSTYLE.FONTFAMILY_REGULAR,
    ...COMMONSTYLE.FONTWEIGHT_400,
    ...COMMONSTYLE.FONT_17,
    fontStyle: 'normal',
    color: 'rgba(255, 255, 255, 0.48)',
    includeFontPadding: false,
    flexShrink: 1,
  },

  fullScreenContainer: {
    flex: 1,
  },
  unizyText: {
    ...COMMONSTYLE.FONT_20,
    color: '#FFFFFF',
    // flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    ...COMMONSTYLE.FONTFAMILY_SEMIBOLD,
    width: '70%',
    alignSelf: 'center',
  },

  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 120 : 100,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: Platform.OS === 'ios' ? 9 : 12,
  },
  productdetails: {
    marginTop: 10,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
  },
  userName: {
    position: 'relative',
    color: 'rgba(255, 255, 255, 0.88)',
    ...COMMONSTYLE.FONTFAMILY_SEMIBOLD,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: -0.32,
  },
  userSub: {
    color: 'rgba(255, 255, 255, 0.88)',
    ...COMMONSTYLE.FONTFAMILY_MEDIUM,
    ...COMMONSTYLE.FONTWEIGHT_500,
    fontSize: 12,
    lineHeight: 14,
    marginTop: 4,
  },
  userSub2: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginTop: 1,
  },

  dateText: {
    ...COMMONSTYLE.FONT_14,
    fontWeight: '500',
    lineHeight: 16,
    marginTop: 1,
    color: '#9CD6FF',
    fontFamily: 'Urbanist-SemiBold',
    letterSpacing: -0.24,
  },
  uploadButton: {
    height: 44,
    gap: 2,
    marginTop: 2,
    alignSelf: 'stretch',
    borderRadius: 12,
    borderWidth: 0.9,
    borderColor: '#ffffff33',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
  },
  imagelistcard: {},

  productdetailstext: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'normal',
    letterSpacing: -0.36,
  },

  uploadIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: 'contain',
    mixBlendMode: 'normal',
  },
  uploadText: {
    color: '#ACE3FF',
    ...COMMONSTYLE.FONT_14,
    mixBlendMode: 'normal',
    fontFamily: 'Urbanist-Medium',
    fontWeight: 500,
  },

  fileName: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: -0.32,
    lineHeight: 24,
  },

  threedots: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  textstyle: {
    ...COMMONSTYLE.FONTFAMILY_REGULAR,
    ...COMMONSTYLE.FONTWEIGHT_400,
    ...COMMONSTYLE.FONT_14,
    color: 'rgba(255, 255, 255, 0.80)',
    lineHeight: 16,
    paddingLeft: 4,
  },
  textstyle1: {
    ...COMMONSTYLE.FONTFAMILY_MEDIUM,
    ...COMMONSTYLE.FONTWEIGHT_500,
    ...COMMONSTYLE.FONT_17,
    color: 'rgba(255, 255, 255, 0.80)',
    lineHeight: 22,
    paddingLeft: 4,
  },
  productTextView: {
    gap: 4,
    marginTop: 12,
  },

  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'visible',
  },

  featuredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 4,
    width: '100%',
  },

  textbg: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
    padding: 6,
    borderWidth: 0.5,
    borderEndEndRadius: 12,
    borderStartEndRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomStartRadius: 12,
    borderBlockStartColor: '#ffffff31',
    borderBlockColor: '#ffffff31',
    borderTopColor: '#ffffff31',
    borderBottomColor: '#ffffff31',
    borderLeftColor: '#ffffff31',
    borderRightColor: '#ffffff31',
  },
  importantText: {
    ...COMMONSTYLE.FONTFAMILY_REGULAR,
    ...COMMONSTYLE.FONTWEIGHT_400,
    ...COMMONSTYLE.FONT_12,
    color: '#FFFFFFCC',
    marginBottom: 6,
  },
  importantText1: {
    ...COMMONSTYLE.FONTFAMILY_MEDIUM,
    ...COMMONSTYLE.FONT_12,
    ...COMMONSTYLE.FONTWEIGHT_500,
    color: '#FFFFFF',
  },

  login_container: {
    display: 'flex',
    height: 40,
    gap: 10,
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
    paddingLeft: 12,
  },
  personalEmailID_TextInput: {
    width: '100%',
    ...COMMONSTYLE.FONTFAMILY_REGULAR,
    ...COMMONSTYLE.FONTWEIGHT_400,
    ...COMMONSTYLE.FONT_17,
    lineHeight: 22,
    fontStyle: 'normal',
    color: '#fff',
    minHeight: 40,
  },

  pickerContainer: {
    borderRadius: 12,
    borderWidth: 0.6,
    overflow: 'hidden',
    borderColor: '#ffffff2c',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
    padding: 12,
    height: 44,
    textAlign: 'center',
    flex: 1,
  },
  categoryTagWrapper: {
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },

  loaderContainer: {
    width: 100,
    height: 100,
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: Platform.OS === 'ios' ? 0 : 40,
  },
});