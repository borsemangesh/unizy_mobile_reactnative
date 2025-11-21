import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ProductCard from '../../utils/ProductCard';

import { showToast } from '../../utils/toast';
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

type PreviewThumbnailProps = {
  navigation: any;
};
type CategoryDetailsType = {
  commission: string; // e.g., "10.00"
  max_cappund: string;
  feature_fee: string;
  max_feature_cap: string;
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
}

interface UserMeta {
  firstname: string | null;
  lastname: string | null;
  profile: string | null;
  student_email: string | null;
  category?: Category | null;
  university_name?:string|null
}

const EditPreviewThumbnail = ({ navigation }: PreviewThumbnailProps) => {
  const [storedForm, setStoredForm] = useState<any | null>(null);
  const [categoryDetails, setCategoryDetails] =
    useState<CategoryDetailsType | null>(null);
const [uniname, setUniname] = useState<string>(''); // initialize with empty string
const [categoryId, setCategoryId] = useState<number | null>(null);


const [fullName, setFullName] = useState('');
const [initials, setInitials] = useState('');
const [profile,setProfile] = useState('');
const [featureitem,setfeatureitem] =useState(false)



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
        // 1️⃣ Fetch stored form data
        const storedValue = await AsyncStorage.getItem('isfeatured');
        if (storedValue !== null) {
          setfeatureitem(JSON.parse(storedValue));
        } else {
          setfeatureitem(false);
        }
        const storedData = await AsyncStorage.getItem('formData1');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log('Stored Form Data:', parsedData);
          setStoredForm(parsedData);
        } else {
          console.log('No form data found');
        }

        const storedUserMeta = await AsyncStorage.getItem('userMeta');
        if (storedUserMeta) {
          const parsedUserMeta: UserMeta = JSON.parse(storedUserMeta);
          console.log('Stored User Meta:', parsedUserMeta);

          setUniname(parsedUserMeta?.university_name ?? '');
          setCategoryId(parsedUserMeta?.category?.id ?? null); 
          setProfile(parsedUserMeta?.profile ?? '')

          const full = `${parsedUserMeta?.firstname } ${parsedUserMeta?.lastname}`.trim();
          setFullName(full);

        // Create initials (first letter of each, uppercased)
        const init = `${parsedUserMeta?.firstname?.charAt(0) ?? ''}${parsedUserMeta?.lastname ?.charAt(0) ?? ''}`.toUpperCase();
        setInitials(init);


          if (parsedUserMeta.category) {
            const { commission, max_cappund, feature_fee, max_feature_cap } =
              parsedUserMeta.category;
            setCategoryDetails({
              commission: commission ?? '0',
              max_cappund: max_cappund ?? '0',
              feature_fee: feature_fee ?? '0',
              max_feature_cap: max_feature_cap ?? '0',
            });
            console.log('Category Details set:', { commission, max_cappund });
          } else {
            console.log('No category in userMeta');
          }
        } else {
          console.log('No userMeta found');
        }
      } catch (error) {
        console.log('Error reading stored data: ', error);
      }
    };

    fetchStoredData();
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

    // fallback if alias_name missing
    if (formData[alias]) return formData[alias].value;

    return null;
  };

  const titleValue = getValueByAlias(storedForm, 'title') || 'No Title';
  const imageArray = storedForm?.[6]?.value || [];
  const raw = getValueByAlias(storedForm, 'price') ?? '0';
  const priceValue = parseFloat(String(raw)) || 0;

  const commissionPercent = parseFloat(categoryDetails?.commission ?? '0');
  const maxCap = parseFloat(categoryDetails?.max_cappund ?? '0');

  const commissionAmount = priceValue * (commissionPercent / 100);
  const calculatedPrice = priceValue + commissionAmount;
  const maxAllowedPrice = priceValue + maxCap;
  const commissionPrice = +Math.min(calculatedPrice, maxAllowedPrice).toFixed(
    2,
  );


  const raw1 = getValueByAlias(storedForm, 'price') ?? '0';
  const priceValue1 = parseFloat(String(raw1)) || 0;

  const commissionPercent1 = parseFloat(categoryDetails?.feature_fee ?? '0');
  const maxCap1 = parseFloat(categoryDetails?.max_feature_cap ?? '0');

  const commissionAmount1 = priceValue1 * (commissionPercent1 / 100);
  const calculatedPrice1 = priceValue1 + commissionAmount1;
  const maxAllowedPrice1 = priceValue1 + maxCap1;
  const commissionPrice1 = +Math.min(
    calculatedPrice1,
    maxAllowedPrice1,
  ).toFixed(2);

  //console.log(commisionprice)

  return (
    <ImageBackground
      source={require('../../../assets/images/backimg.png')}
      style={{ width: '100%', height: '100%' }}
      resizeMode="cover"
    >
      <View style={styles.fullScreenContainer}>
        
         {/* <View style={styles.header}>
                      <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => {
                     navigation.goBack();
                  }}>          
                    <View style={styles.backIconRow}>
                      <Image
                         source={require('../../../assets/images/back.png')}
                          style={{ height: 24, width: 24 }}/>
                       </View>
                     </TouchableOpacity>
                   <Text allowFontScaling={false} style={styles.unizyText}>Preview Thumbnail</Text>
                     <View style={{ width: 48 }} />
                     </View>
                   </View> */}

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
             onPress={() => { navigation.goBack();}}
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
          Preview Thumbnail
          </Text>
        </View>

         {/* <ScrollView
            style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: 180, }}
              showsVerticalScrollIndicator={false} > */}

<AnimatedReanimated.ScrollView 
                    scrollEventThrottle={16}
                    onScroll={scrollHandler}
                    contentContainerStyle={[
                      styles.scrollContainer,
                      { paddingBottom:(Platform.OS === 'ios'? 170 :  height * 0.1) }, // 0.05% of screen height
                    ]}>
            <View style={styles.productCarddisplay}>
            {storedForm ? (
              <>
                {categoryId === 2 || categoryId === 5 ? (
                  (!!storedForm[13]?.value === true || featureitem) ? (
                    // 🔹 CASE 1A: Category 2 or 5, Featured = true
                    <>
                      <Text
                        allowFontScaling={false}
                        style={[styles.newtext, { paddingBottom: 6 }]}
                      >
                        Featured Listing Preview
                      </Text>
                      <NewTutitionCard
                        tag={uniname}
                        title={titleValue}
                        infoTitle={fullName}
                        inforTitlePrice={`£${commissionPrice}`}
                        rating={storedForm[12]?.value || '4.5'}
                        productImage={{ uri: profile }}
                        isBookmarked={false}
                      />
          
                      <Text
                        allowFontScaling={false}
                        style={[styles.newtext1, { paddingBottom: (Platform.OS === 'ios'? 0: 6) }]}
                      >
                        Regular Listing Preview
                      </Text>
                      <SeperateTutionCard
                          tag={uniname}
                          infoTitle={titleValue}
                          rating={storedForm[12]?.value || '4.5'}
                          inforTitlePrice={`£${commissionPrice}`}
                          productImage={{ uri: profile }}
                          bookmark={false}
                          showInitials={!profile || profile === null || profile.trim() === ''}
                        isfeature={true} initialsName={initials}            />
                    </>
                  ) : (
                    <SeperateTutionCard
                      tag={uniname}
                          infoTitle={titleValue}
                          rating={storedForm[12]?.value || '4.5'}
                          inforTitlePrice={`£${commissionPrice}`}
                          productImage={profile ? { uri: profile } : undefined}
                          bookmark={false}
                          showInitials={!profile || profile === null || profile.trim() === ''}
                          isfeature={false} initialsName={initials} 
                    />
                  )
                ) :  (!!storedForm[13]?.value === true || featureitem) ? (
                  <>
                    <Text
                      allowFontScaling={false}
                      style={[styles.newtext, { paddingBottom: 6 }]}
                    >
                      Featured Listing Preview
                    </Text>
                    <PreviewCard
                      tag={uniname}
                      infoTitle={titleValue}
                      inforTitlePrice={`£${commissionPrice}`}
                      rating={storedForm[12]?.value || '4.5'}
                      productImage={
                        imageArray.length > 0
                          ? { uri: imageArray[0].uri }
                          : require('../../../assets/images/drone.png')
                      }
                    />
                    <Text
                      allowFontScaling={false}
                      style={[styles.newtext1, { paddingBottom: 6 }]}
                    >
                      Regular Listing Preview
                    </Text>
                    <NewFeatureCard
                      tag={uniname}
                      infoTitle={titleValue}
                      inforTitlePrice={`£${commissionPrice}`}
                      rating={storedForm[12]?.value || '4.5'}
                      productImage={
                        imageArray.length > 0
                          ? { uri: imageArray[0].uri }
                          : require('../../../assets/images/drone.png')
                      }
                    />
                  </>
                ) : (
                  <NewProductCard
                    tag={uniname}
                    infoTitle={titleValue}
                    inforTitlePrice={`£${commissionPrice}`}
                    rating={storedForm[12]?.value || '4.5'}
                    productImage={
                      imageArray.length > 0
                        ? { uri: imageArray[0].uri }
                        : require('../../../assets/images/drone.png')
                    }
                  />
                )}
              </>
            ) : (
              <Text
                allowFontScaling={false}
                style={{ color: '#fff', textAlign: 'center' }}
              >
                Loading...
              </Text>
            )}
          </View>
          </AnimatedReanimated.ScrollView >
          

         
          {/* <TouchableOpacity
            style={styles.nextButton}
            onPress={() => {
              navigation.navigate('EditPreviewDetailed');
            }}
          >
            <Text allowFontScaling={false} style={styles.nextText}>
              Next
            </Text>
          </TouchableOpacity> */}
           <View style={styles.bottomFixed}>

            <View style={styles.textbg}>
             
              <Image
                source={require('../../../assets/images/info_icon.png')}
                style={{ width: 16, height: 16, marginRight: 8, marginTop: 2 }}
              />
              <View style={{ flex: 1 }}>
                <Text allowFontScaling={false} style={styles.importantText1}>
                  Important:
                </Text>
                <Text allowFontScaling={false} style={styles.importantText}>
                  A
                  <Text allowFontScaling={false} style={styles.importantText1}>
                    {' '}
                    {categoryDetails?.commission ?? '0'}%
                  </Text>{' '}
                  commission or a maximum of
                  <Text allowFontScaling={false} style={styles.importantText1}>
                    {' '}
                    £{categoryDetails?.max_cappund ?? '0'}
                  </Text>
                  , whichever is lower, will be added to the entered price.
                </Text>
              </View>
            </View>
            
        <Button
          title="Next"
          onPress={() => navigation.navigate('EditPreviewDetailed')}
        />
      </View>
        </View>
      <NewCustomToastContainer />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
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
    top: Platform.OS === 'ios' ? '8.5%': 60,
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
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    paddingTop: Platform.OS === 'ios' ? 110 : 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

    newtext:{
     color: '#fff',
    fontSize: 16,
    marginHorizontal: 6,
    marginVertical:16,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600,
  },
 newtext1:{
     color: '#fff',
    fontSize: 16,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600,
    marginHorizontal: 6,
    marginTop:24,
    marginBottom:16

  },
 textbg:{
    overflow:'hidden',

  alignContent:'center',
  alignSelf:'center',
  width:'90%',
 flexDirection: 'row',
          alignItems: 'flex-start',
backgroundColor:'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.10) 100%)',
  boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
  padding: 6,
  borderWidth:0.5,
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
  marginBottom:80,

 
            
  },

  bottomFixed: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,

  paddingVertical: 10,
  //paddingHorizontal: 16,
  //borderTopWidth: 0.5,
 // borderTopColor: '#444',
},
 header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
   fullScreenContainer: {
    flex: 1,
    //marginTop: 30,
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
    //boxShadow: 'rgba(255, 255, 255, 0.12)  inset -1px 0px 5px 1px inset ',

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
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },

 
  importantText: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 6,
    fontFamily: 'Urbanist-Medium',
    fontWeight: 500,
  },
  importantText1: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 500,
  },

  h24_w24: {
    width: 24,
    height: 24,
  },
  importantNotice: {
    flexDirection: 'row',
    height: 'auto',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.09) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    borderRadius: 8,
    padding: 8,
  },
  productCarddisplay: {
    display: 'flex',
    height: '100%',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewThumbnail: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  infoContainer: {
    flexDirection: 'row',
    marginTop: 8,
    paddingLeft: 6,
    paddingRight: 6,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-Medium',
    fontWeight: '600',
    fontStyle: 'normal',
    fontSize: 14,
  },
  note: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-Medium',
    fontSize: 14,
  },
  nextButton: {
    display: 'flex',
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
    marginTop: 10,
  },
  nextText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    width: '100%',
  },
});

export default EditPreviewThumbnail;