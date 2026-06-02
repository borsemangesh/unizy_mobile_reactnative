import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import NewProductCard from '../../utils/NewProductCard';
import PreviewCard from '../../utils/PreviewCard';
import Button from '../../utils/component/Button';
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';
import NewFeatureCard from '../../utils/NewFeatureCard';
import SeperateTutionCard from '../../utils/SeperateTutitionCard';
import NewTutitionCard from '../../utils/NewTutionCard';


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
import { BlurView } from '@react-native-community/blur';
import { useTranslation } from 'react-i18next';

import BACK_ICON from '../../../assets/images/backimg.png';


type PreviewThumbnailProps = {
  navigation: any;
};
type CategoryDetailsType = {
  commission: string; // e.g., "10.00"
  max_cappund: string;
  feature_fee: string;
  max_feature_cap: string;
  feePrecentage: number;
  fixedFee: number;
};

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
  category?: Category | null;
  university_name?: string | null
}

const EditPreviewThumbnail = ({ navigation }: PreviewThumbnailProps) => {
  const [storedForm, setStoredForm] = useState<any | null>(null);
  const [categoryDetails, setCategoryDetails] =
    useState<CategoryDetailsType | null>(null);
  const [uniname, setUniname] = useState<string>(''); // initialize with empty string
  const [categoryId, setCategoryId] = useState<number | null>(null);


  const [fullName, setFullName] = useState('');
  const [initials, setInitials] = useState('');
  const [profile, setProfile] = useState('');
  const [featureitem, setfeatureitem] = useState(false)



  const { height } = Dimensions.get('window');
  const bottomPadding = height * 0.0005;

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
    const opacity = interpolate(scrollY.value, [0, 14], [0, 1], 'clamp');
    return { opacity };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    'worklet';
    const borderColor = interpolateColor(
      scrollY.value,
      [0, 14],
      ['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.56)'],
    );
    const redOpacity = interpolate(scrollY.value, [0, 2], [0, 0.05], 'clamp');
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
        // 1️⃣ Fetch stored form data
        const storedValue = await AsyncStorage.getItem('isfeatured');
        if (storedValue !== null) {
          setfeatureitem(JSON.parse(storedValue));
        } else {
          setfeatureitem(false);
        }
        const storedData = await AsyncStorage.getItem('formData1');
        console.log('DATA', storedData)
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log(parsedData)

          setStoredForm(parsedData);
        } else {
          // console.log('No form data found');
        }

        const storedUserMeta = await AsyncStorage.getItem('userMeta');
        if (storedUserMeta) {
          const parsedUserMeta: UserMeta = JSON.parse(storedUserMeta);
          // console.log('Stored User Meta:', parsedUserMeta);

          setUniname(parsedUserMeta?.university_name ?? '');
          setCategoryId(parsedUserMeta?.category?.id ?? null);
          setProfile(parsedUserMeta?.profile ?? '')

          const full = `${parsedUserMeta?.firstname} ${parsedUserMeta?.lastname}`.trim();
          setFullName(full);

          // Create initials (first letter of each, uppercased)
          const init = `${parsedUserMeta?.firstname?.charAt(0) ?? ''}${parsedUserMeta?.lastname?.charAt(0) ?? ''}`.toUpperCase();
          setInitials(init);


          if (parsedUserMeta.category) {
            const { commission, max_cappund, feature_fee, max_feature_cap, feePrecentage,
  fixedFee, } =
              parsedUserMeta.category;
            setCategoryDetails({
              commission: commission ?? '0',
              max_cappund: max_cappund ?? '0',
              feature_fee: feature_fee ?? '0',
              max_feature_cap: max_feature_cap ?? '0',
              feePrecentage: feePrecentage ?? 0,
              fixedFee: fixedFee ?? 0,
            });
            // console.log('Category Details set:', { commission, max_cappund });
          } else {
            // console.log('No category in userMeta');
          }
        } else {

        }
      } catch (error) {
        // console.log('Error reading stored data: ', error);
      }
    };

    fetchStoredData();
  }, []);

  const { t } = useTranslation();

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

    // fallback if alias_name missing
    if (formData[alias]) return formData[alias].value;

    return null;
  };

  const isFeatured =
    (storedForm || {})[13]?.value === true ||
    (storedForm || {})[13]?.value === 'true' ||
    storedForm?.isfeatured?.value === true ||
    storedForm?.isfeatured?.value === 'true';


  // const isFeatured =   storedForm?.[13]?.value === true ||storedForm?.[13]?.value === 'true';

  // const titleValue = getValueByAlias(storedForm, 'title') || 'No Title';
  // const imageArray = storedForm?.[6]?.value || [];
  // const raw = getValueByAlias(storedForm, 'price') ?? '0';
  // const priceValue = parseFloat(String(raw)) || 0;

  // const commissionPercent = parseFloat(categoryDetails?.commission ?? '0');
  // const maxCap = parseFloat(categoryDetails?.max_cappund ?? '0');

  // const commissionAmount = priceValue * (commissionPercent / 100);
  // const calculatedPrice = priceValue + commissionAmount;
  // const maxAllowedPrice = priceValue + maxCap;
  // const commissionPrice = +Math.min(calculatedPrice, maxAllowedPrice).toFixed(
  //   2,
  // );


  // const raw1 = getValueByAlias(storedForm, 'price') ?? '0';
  // const priceValue1 = parseFloat(String(raw1)) || 0;

  // const commissionPercent1 = parseFloat(categoryDetails?.feature_fee ?? '0');
  // const maxCap1 = parseFloat(categoryDetails?.max_feature_cap ?? '0');

  // const commissionAmount1 = priceValue1 * (commissionPercent1 / 100);
  // const calculatedPrice1 = priceValue1 + commissionAmount1;
  // const maxAllowedPrice1 = priceValue1 + maxCap1;
  // const commissionPrice1 = +Math.min(
  //   calculatedPrice1,
  //   maxAllowedPrice1,
  // ).toFixed(2);

  // const priceText =
  //   categoryId === 2
  //     ? `£${commissionPrice}/${t('hr')}`
  //     : categoryId === 4
  //       ? `£${commissionPrice}/${t('week')}`
  //       : categoryId === 5 ? `£${commissionPrice}/${t('session')}`
  //         : `£${commissionPrice}`;

  // const commission = parseFloat(categoryDetails?.commission ?? '0');
  // const maxCapPound = parseFloat(categoryDetails?.max_cappund ?? '0');

  const titleValue = getValueByAlias(storedForm, 'title') || 'No Title';
  const imageArray = storedForm?.[6]?.value || [];
  const raw = getValueByAlias(storedForm, 'price') ?? '0';
  const priceValue = parseFloat(String(raw)) || 0;

  const commissionPercent = parseFloat(categoryDetails?.commission ?? '0');
  const maxCap = parseFloat(categoryDetails?.max_cappund ?? '0');

  // const commissionAmount = priceValue * (commissionPercent / 100);
  // const calculatedPrice = priceValue + commissionAmount;
  // const maxAllowedPrice = priceValue + maxCap;
  // const commissionPrice = +Math.min(calculatedPrice, maxAllowedPrice).toFixed(
  //   2,
  // );



// NEW
const feePercentage = Number(categoryDetails?.feePrecentage ?? 0);

const fixedFee = Number(
  categoryDetails?.fixedFee ?? 0,
);

// Commission
const commissionAmount =
  priceValue * (commissionPercent / 100);

// Apply cap
const cappedCommission =
    Math.min(commissionAmount, maxCap);
   const calculatedPrice = priceValue + commissionAmount;

// Price + commission
const priceAfterCommission =
  priceValue + cappedCommission;

// Fee percentage on original price
const feePercentageAmount =
  priceAfterCommission * (feePercentage / 100);

  // Final Price
  let commissionPrice = 0;
  if (categoryId !== 3) {
    commissionPrice = Number(
      (
        priceAfterCommission +
        feePercentageAmount +
        fixedFee
      ).toFixed(2),
    );
  } else {
    const maxAllowedPrice = priceValue + maxCap;
    commissionPrice = +Math.min(calculatedPrice, maxAllowedPrice).toFixed(
    2,
  );
  }

  
  console.log('priceValue', priceValue);
console.log('commissionPercent', commissionPercent);
console.log('maxCap', maxCap);
console.log('feePercentage', feePercentage);
console.log('fixedFee', fixedFee);
console.log('commissionPrice', commissionPrice);
  ///feature

  const raw1 = getValueByAlias(storedForm, 'price') ?? '0';
  const priceValue1 = parseFloat(String(raw1)) || 0;

  const commissionPercent1 = parseFloat(categoryDetails?.feature_fee ?? '0');
  const maxCap1 = parseFloat(categoryDetails?.max_feature_cap ?? '0');

  const commissionAmount1 = priceValue1 * (commissionPercent1 / 100);
  const calculatedPrice1 = priceValue1 + commissionAmount1;
  const maxAllowedPrice1 = priceValue1 + maxCap1;
  const commissionPrice1 = +Math.min(calculatedPrice1, maxAllowedPrice1).toFixed(2);
  const commission = parseFloat(categoryDetails?.commission ?? '0');
  const maxCapPound = parseFloat(categoryDetails?.max_cappund ?? '0');

  const priceText =
    categoryId === 2
      ? `£${commissionPrice}/${t('hr')}`
      : categoryId === 4
      ? `£${priceValue}/${t('week')}`
      : categoryId === 5
      ? `£${commissionPrice}/${t('session')}`
      : `£${commissionPrice}`;

  if (isFeatured) {
    return (
      // <BackgroundWrapper>
      <ImageBackground
              source={BACK_ICON}
              style={{ flex: 1,width: '100%',
            height: '100%', }}
              resizeMode="cover"
            >
        <View style={styles.fullScreenContainer}>
          <StatusBar
            translucent
            backgroundColor="transparent"
            barStyle="light-content"
          />

          {/* Header with Blur only at top */}
          <AnimatedReanimated.View
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

          {/* Header Content */}
          <View style={styles.headerContent} pointerEvents="box-none">
            <TouchableOpacity
              onPress={() => { navigation.goBack(); }}
              style={styles.backButtonContainer}
              activeOpacity={0.7}
            >
              <AnimatedReanimated.View
                style={[styles.blurButtonWrapper, animatedButtonStyle]}
              >
                {/* Static background (visible when scrollY = 0) */}
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

                {/* Blur view fades in as scroll increases */}
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
              {t('preview_thumbnail')}
            </Text>
          </View>


          <AnimatedReanimated.ScrollView
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: Platform.OS === 'ios' ? 100 : 100,
              paddingBottom: Platform.OS === 'ios' ? 140 : 130
            }}
            onScroll={scrollHandler}
          >
            <View style={styles.productCarddisplay}>
              {storedForm ? (
                <>
                  {categoryId === 2 || categoryId === 5 ? (
                    storedForm[13]?.value === true ||
                      storedForm[13]?.value === 'true' ||
                      storedForm?.isfeatured?.value === true ||
                      storedForm?.isfeatured?.value === 'true' ? (
                      <>
                        <Text
                          allowFontScaling={false}
                          style={styles.newtext}
                        >
                          {t('preview_featured_listing')}
                        </Text>
                        <Text allowFontScaling={false} style={styles.previewDesc}>
                          {t('feature_note')}
                        </Text>
                        <NewTutitionCard
                          tag={uniname}
                          title={titleValue}
                          infoTitle={fullName}
                          inforTitlePrice={priceText}
                          rating={storedForm[12]?.value || '4.5'}
                          productImage={{ uri: profile }}
                          isBookmarked={false}
                        />

                        <Text
                          allowFontScaling={false}
                          style={styles.newtext1}
                        >
                          {t('preview_regular_listing')}
                        </Text>
                        <Text allowFontScaling={false} style={styles.previewDesc}>
                          {t('normal_note')}
                        </Text>
                        <SeperateTutionCard
                          tag={uniname}
                          infoTitle={titleValue}
                          rating={storedForm[12]?.value || '4.5'}
                          inforTitlePrice={priceText}
                          productImage={{ uri: profile }}
                          bookmark={false}
                          showInitials={!profile || profile === null || profile.trim() === ''}
                          isfeature={true} initialsName={initials} />
                      </>
                    ) : (
                      <><Text
                        allowFontScaling={false}
                        style={styles.newtext1}
                      >
                        {t('preview_regular_listing')}
                      </Text><Text allowFontScaling={false} style={styles.previewDesc}>
                          {t('normal_note')}
                        </Text>
                        <SeperateTutionCard
                          tag={uniname}
                          infoTitle={titleValue}
                          rating={storedForm[12]?.value || '4.5'}
                          inforTitlePrice={priceText}
                          productImage={profile ? { uri: profile } : undefined}
                          bookmark={false}
                          showInitials={!profile || profile === null || profile.trim() === ''}
                          isfeature={false} initialsName={initials} /></>
                    )
                  )
                    : storedForm[13]?.value === true ||
                      storedForm[13]?.value === 'true' ||
                      storedForm?.isfeatured?.value === true ||
                      storedForm?.isfeatured?.value === 'true' ? (
                      <>
                        <Text
                          allowFontScaling={false}
                          style={styles.newtext}
                        >
                          {t('preview_featured_listing')}
                        </Text>
                        <Text allowFontScaling={false} style={styles.previewDesc}>
                          {t('feature_note')}
                        </Text>
                        <PreviewCard
                          tag={uniname}
                          infoTitle={titleValue}
                          inforTitlePrice={priceText}
                          rating={storedForm[12]?.value || '4.5'}
                          productImage={
                            imageArray.length > 0
                              ? { uri: imageArray[0].uri }
                              : require('../../../assets/images/drone.png')
                          }
                        />
                        <Text
                          allowFontScaling={false}
                          style={styles.newtext1}
                        >
                          {t('preview_regular_listing')}
                        </Text>
                        <Text allowFontScaling={false} style={styles.previewDesc}>
                          {t('normal_note')}
                        </Text>
                        <NewFeatureCard
                          tag={uniname}
                          infoTitle={titleValue}
                          inforTitlePrice={priceText}
                          rating={storedForm[12]?.value || '4.5'}
                          productImage={
                            imageArray.length > 0
                              ? { uri: imageArray[0].uri }
                              : require('../../../assets/images/drone.png')
                          }
                        />
                      </>
                    ) : (
                      <><Text
                        allowFontScaling={false}
                        style={styles.newtext1}
                      >
                        {t('preview_regular_listing')}
                      </Text><Text allowFontScaling={false} style={styles.previewDesc}>
                          {t('normal_note')}
                        </Text>
                        <NewProductCard
                          tag={uniname}
                          infoTitle={titleValue}
                          inforTitlePrice={priceText}
                          rating={storedForm[12]?.value || '4.5'}
                          productImage={imageArray.length > 0
                            ? { uri: imageArray[0].uri }
                            : require('../../../assets/images/drone.png')} /></>
                    )}
                </>
              ) : (
                <Text
                  allowFontScaling={false}
                  style={{ color: '#fff', textAlign: 'center' }}
                >
                  {t('loading')}
                </Text>
              )}
            </View>

            {categoryId !== 4 && (
              <View style={[styles.textbg]}>
                <Image
                  source={require('../../../assets/images/info_icon.png')}
                  style={{ width: 16, height: 16, marginRight: 8, marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text allowFontScaling={false} style={styles.importantText1}>
                    {t('important')}
                  </Text>
                  <Text allowFontScaling={false} style={styles.importantText}>
                    {t('a')}
                    <Text allowFontScaling={false} style={styles.importantText1}>
                      {' '}
                      {Math.trunc(commission)}%
                    </Text>{' '}
                    {t('commission_or_maximum')}{' '}
                    <Text allowFontScaling={false} style={styles.importantText}>(</Text>
                    <Text allowFontScaling={false} style={styles.importantText}>
                      {t('capped')}{' '}
                    </Text>
                    <Text allowFontScaling={false} style={styles.importantText1}>
                      £{Math.trunc(maxCapPound)}
                    </Text>
                    <Text allowFontScaling={false} style={styles.importantText}>)</Text>

                    {' '}{t('whichever_lower')}
                  </Text>
                </View>
              </View>
            )}
          </AnimatedReanimated.ScrollView >

          <View style={styles.bottomFixed}>
            <Button
              title={t('next')}
              onPress={() => navigation.navigate('EditPreviewDetailed')}
            />
          </View>
        </View>
        <NewCustomToastContainer />
      {/* </BackgroundWrapper> */}
      </ImageBackground>
    );
  }
  return (
   <ImageBackground
                 source={BACK_ICON}
                 style={{ flex: 1,width: '100%',
               height: '100%', }}
                 resizeMode="cover"
               >
    {/* <BackgroundWrapper> */}
      <View style={styles.fullScreenContainer}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        {/* Header with Blur only at top */}
        <AnimatedReanimated.View
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

        {/* Header Content */}
        <View style={styles.headerContent} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => { navigation.goBack(); }}
            style={styles.backButtonContainer}
            activeOpacity={0.7}
          >
            <AnimatedReanimated.View
              style={[styles.blurButtonWrapper, animatedButtonStyle]}
            >
              {/* Static background (visible when scrollY = 0) */}
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

              {/* Blur view fades in as scroll increases */}
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
            {t('preview_thumbnail')}
          </Text>
        </View>


        <AnimatedReanimated.ScrollView
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: Platform.OS === 'ios' ? 100 : 100,
            paddingBottom: 100,
          }}
          onScroll={scrollHandler}
        >
          <View style={styles.productCarddisplay}>
            {storedForm ? (
              <>
                {categoryId === 2 || categoryId === 5 ? (
                  storedForm[13]?.value === true ||
                    storedForm[13]?.value === 'true' ||
                    storedForm?.isfeatured?.value === true ||
                    storedForm?.isfeatured?.value === 'true' ? (
                    <>
                      <Text
                        allowFontScaling={false}
                        style={styles.newtext}
                      >
                        {t('preview_featured_listing')}
                      </Text>
                      <Text allowFontScaling={false} style={styles.previewDesc}>
                        {t('feature_note')}
                      </Text>
                      <NewTutitionCard
                        tag={uniname}
                        title={titleValue}
                        infoTitle={fullName}
                        inforTitlePrice={priceText}
                        rating={storedForm[12]?.value || '4.5'}
                        productImage={{ uri: profile }}
                        isBookmarked={false}
                      />

                      <Text
                        allowFontScaling={false}
                        style={styles.newtext1}
                      >
                        {t('preview_regular_listing')}
                      </Text>
                      <Text allowFontScaling={false} style={styles.previewDesc}>
                        {t('normal_note')}
                      </Text>
                      <SeperateTutionCard
                        tag={uniname}
                        infoTitle={titleValue}
                        rating={storedForm[12]?.value || '4.5'}
                        inforTitlePrice={priceText}
                        productImage={{ uri: profile }}
                        bookmark={false}
                        showInitials={!profile || profile === null || profile.trim() === ''}
                        isfeature={true} initialsName={initials} />
                    </>
                  ) : (
                    <><Text
                      allowFontScaling={false}
                      style={styles.newtext1}
                    >
                      {t('preview_regular_listing')}
                    </Text><Text allowFontScaling={false} style={styles.previewDesc}>
                        {t('normal_note')}
                      </Text>
                      <SeperateTutionCard
                        tag={uniname}
                        infoTitle={titleValue}
                        rating={storedForm[12]?.value || '4.5'}
                        inforTitlePrice={priceText}
                        productImage={profile ? { uri: profile } : undefined}
                        bookmark={false}
                        showInitials={!profile || profile === null || profile.trim() === ''}
                        isfeature={false} initialsName={initials} /></>
                  )
                )
                  : storedForm[13]?.value === true ||
                    storedForm[13]?.value === 'true' ||
                    storedForm?.isfeatured?.value === true ||
                    storedForm?.isfeatured?.value === 'true' ? (
                    <>
                      <Text
                        allowFontScaling={false}
                        style={styles.newtext}
                      >
                        {t('preview_featured_listing')}
                      </Text>
                      <Text allowFontScaling={false} style={styles.previewDesc}>
                        {t('feature_note')}
                      </Text>
                      <PreviewCard
                        tag={uniname}
                        infoTitle={titleValue}
                        inforTitlePrice={priceText}
                        rating={storedForm[12]?.value || '4.5'}
                        productImage={
                          imageArray.length > 0
                            ? { uri: imageArray[0].uri }
                            : require('../../../assets/images/drone.png')
                        }
                      />
                      <Text
                        allowFontScaling={false}
                        style={styles.newtext1}
                      >
                        {t('preview_regular_listing')}
                      </Text>
                      <Text allowFontScaling={false} style={styles.previewDesc}>
                        {t('normal_note')}
                      </Text>
                      <NewFeatureCard
                        tag={uniname}
                        infoTitle={titleValue}
                        inforTitlePrice={priceText}
                        rating={storedForm[12]?.value || '4.5'}
                        productImage={
                          imageArray.length > 0
                            ? { uri: imageArray[0].uri }
                            : require('../../../assets/images/drone.png')
                        }
                      />
                    </>
                  ) : (
                    <><Text
                      allowFontScaling={false}
                      style={styles.newtext1}
                    >
                      {t('preview_regular_listing')}
                    </Text><Text allowFontScaling={false} style={styles.previewDesc}>
                        {t('normal_note')}
                      </Text>
                      <NewProductCard
                        tag={uniname}
                        infoTitle={titleValue}
                        inforTitlePrice={priceText}
                        rating={storedForm[12]?.value || '4.5'}
                        productImage={imageArray.length > 0
                          ? { uri: imageArray[0].uri }
                          : require('../../../assets/images/drone.png')} /></>
                  )}
              </>
            ) : (
              <Text
                allowFontScaling={false}
                style={{ color: '#fff', textAlign: 'center' }}
              >
                {t('loading')}
              </Text>
            )}
          </View>
        </AnimatedReanimated.ScrollView >

        {categoryId !== 4 && (
          <View style={[styles.textbg, { marginBottom: 100 }]}>
            <Image
              source={require('../../../assets/images/info_icon.png')}
              style={{ width: 16, height: 16, marginRight: 8, marginTop: 2 }}
            />
            <View style={{ flex: 1 }}>
              <Text allowFontScaling={false} style={styles.importantText1}>
                {t('important')}
              </Text>
              <Text allowFontScaling={false} style={styles.importantText}>
                {t('a')}
                <Text allowFontScaling={false} style={styles.importantText1}>
                  {' '}
                  {Math.trunc(commission)}%
                </Text>{' '}
                {t('commission_or_maximum')}{' '}
                <Text allowFontScaling={false} style={styles.importantText}>(</Text>
                <Text allowFontScaling={false} style={styles.importantText}>
                  {t('capped')}{' '}
                </Text>
                <Text allowFontScaling={false} style={styles.importantText1}>
                  £{Math.trunc(maxCapPound)}
                </Text>
                <Text allowFontScaling={false} style={styles.importantText}>)</Text>

                {' '}{t('whichever_lower')}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.bottomFixed}>
          <Button
            title={t('next')}
            onPress={() => navigation.navigate('EditPreviewDetailed')}
          />
        </View>
      </View>
      <NewCustomToastContainer />
    {/* </BackgroundWrapper> */}
     </ImageBackground>
  );

};

const styles = StyleSheet.create({
  previewDesc: {
    marginBottom: 10,
    color: '#ccc',
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Urbanist-Medium',
    fontWeight: 500,
    textAlign:'center'
  },

  backButtonContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 11,
  },
 
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
    marginTop: (Platform.OS === 'ios' ? 0 : 0),
    marginLeft: 1
  },

  bottomFixed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
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
  },
  newtext: {
    color: '#fff',
    fontSize: 16,
    marginHorizontal: 6,
    marginVertical: 6,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600,
  },
  newtext1: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600,
    marginHorizontal: 6,
    marginTop: 48,
    marginBottom: 6
  },
  textbg: {
    overflow: 'hidden',
    alignContent: 'center',
    alignSelf: 'center',
    width: '90%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.10) 100%)',
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
    marginTop: 0
  },
  importantText: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 6,
    fontFamily: 'Urbanist-Medium',
    fontWeight: 500,
  },
  importantText1: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 500,
  },

  productCarddisplay: {
    display: 'flex',
    height: '100%',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24
  },

});

export default EditPreviewThumbnail;