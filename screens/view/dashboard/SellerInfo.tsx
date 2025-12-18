import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import Button from '../../utils/component/Button';
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';

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

type SellerInfoProps = {
  navigation: any;
};
type CategoryDetailsType = {
  commission: string;
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
  university_name?: string | null;
}
type ListItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: any; // ImageSourcePropType also works
};

const SellerInfo = ({ navigation }: SellerInfoProps) => {
  const [storedForm, setStoredForm] = useState<any | null>(null);
  const [categoryDetails, setCategoryDetails] =
    useState<CategoryDetailsType | null>(null);
  const [uniname, setUniname] = useState<string>(''); // initialize with empty string
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [fullName, setFullName] = useState('');
  const [initials, setInitials] = useState('');
  const [profile, setProfile] = useState('');

  const { height } = Dimensions.get('window');

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

  useEffect(() => {
    const fetchStoredData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('formData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);

          setStoredForm(parsedData);
        } else {
          // console.log('No form data found');
        }

        const storedUserMeta = await AsyncStorage.getItem('userMeta');
        if (storedUserMeta) {
          const parsedUserMeta: UserMeta = JSON.parse(storedUserMeta);
          setUniname(parsedUserMeta?.university_name ?? '');
          setCategoryId(parsedUserMeta?.category?.id ?? null);
          setProfile(parsedUserMeta?.profile ?? '');

          const full =
            `${parsedUserMeta?.firstname} ${parsedUserMeta?.lastname}`.trim();
          setFullName(full);
          const init = `${parsedUserMeta?.firstname?.charAt(0) ?? ''}${
            parsedUserMeta?.lastname?.charAt(0) ?? ''
          }`.toUpperCase();
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
          } else {
            // console.log('No category in userMeta');
          }
        } else {
          // console.log('No userMeta found');
        }
      } catch (error) {
        // console.log('Error reading stored data: ', error);
      }
    };

    fetchStoredData();
  }, []);



  const { t } = useTranslation();

  const bgicon = require('../../../assets/images/backimg.png')
  const data = [
    {
      id: '1',
      title: 'sell_title1',
      subtitle: 'sell_info1',
      icon: require('../../../assets/images/list1.png'),
    },
    {
      id: '2',
      title: 'sell_title2',
      subtitle: 'sell_info2',
      icon: require('../../../assets/images/list2.png'),
    },
    {
      id: '3',
      title: 'sell_title3',
      subtitle: 'sell_info3',
      icon: require('../../../assets/images/list3.png'),
    },
    {
      id: '4',
      title: 'sell_title4',
      subtitle: 'sell_info4',
      icon: require('../../../assets/images/list4.png'),
    },
  ];

  const isEmpty = data.length === 0;

  const renderItem = ({ item }: { item: ListItem }) => (

    <View style={styles.itemContainer} >
      <View style={styles.hederRowContainer}>
        <View style={styles.imgHolder}>
          <Image source={item.icon} style={styles.icon} resizeMode="cover" />
        </View>
        <View style={{width:'90%'}}>
            <Text allowFontScaling={false} numberOfLines={2} style={styles.title}>
            {item.id}. {t(item.title)}
            </Text> 
        </View>
        
      </View>
      <View style={styles.textContainer}>
        <Text allowFontScaling={false}  style={styles.subtitle}>{t(item.subtitle)}</Text>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={bgicon}
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

        <AnimatedReanimated.FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.headerContent} pointerEvents="box-none">
              <Text
                numberOfLines={2}
                allowFontScaling={false}
                style={styles.unizyText}
              >
                {t('sell_header')}
              </Text>

            <View style={{ width: '90%'}}>
              <Text
                numberOfLines={2}
                allowFontScaling={false}
                style={styles.unizyText1}
              >
                {t('sell_subheader')}
              </Text>
              </View>
            </View>
          }
          contentContainerStyle={[
            styles.listContainer,
            {
              paddingTop: Platform.OS === 'ios' ? 70 : 70,
              paddingBottom: 100,
              // paddingBottom: isEmpty
              //   ? 10
              //   : Platform.select({
              //       ios: height * 0.05, // ⬅ apply padding when list has data
              //       android: height * 0.04,
              //     }),
              flexGrow: 1,
            },
          ]}
          ListFooterComponent={<View style={{ height: 100 }} />} 
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        />

        <View style={styles.bottomFixed}>
          <View style={styles.textbg}>
            <Image
              source={require('../../../assets/images/info_icon.png')}
              style={{ width: 16, height: 16, marginRight: 8, marginTop: 2 }}
            />
            <View style={{ flex: 1 }}>
              <Text allowFontScaling={false} style={styles.importantText1}>
                {t('important')}
              </Text>
              <Text allowFontScaling={false} style={styles.importantText}>
                {t('sell_note')}
              </Text>
            </View>
          </View>

          <Button
            title={t('sell_button')}
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MyListing'}],
              });
            }}
          />
        </View>
      </View>
      <NewCustomToastContainer />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  imgHolder: {
    width: 44,
    height: 44,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.3,
    borderColor: '#ffffff11',

    boxShadow:
      '0 2px 4px 0 rgba(0, 0, 0, 0.23),0px 0.90px 0px 0px rgba(255, 255, 255, 0.11) inset, 0px -0.90px 0px 0px rgba(255, 255, 255, 0.11) inset',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(208, 208, 208, 0.27) 0%, rgba(255, 255, 255, 0.10) 100%)',

    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',

    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
    boxSizing: 'border-box',
  },
  listContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  backButtonContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 11,
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
    gap: 8,
    alignItems: 'center',
    marginBottom: 16
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
    fontWeight: '700',
    fontFamily: 'Urbanist-SemiBold',
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  unizyText1: {
    color: '#FFFFFFCC',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Urbanist-Medium',
    lineHeight: 22,
    marginTop:8,
    letterSpacing: 0,
  },
  newtext: {
    color: '#fff',
    fontSize: 16,
    marginHorizontal: 6,
    marginVertical: 16,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600,
  },
  newtext1: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600,
    marginHorizontal: 6,
    marginTop: 24,
    marginBottom: 16,
  },
  textbg: {
    overflow: 'hidden',
    alignContent: 'center',
    alignSelf: 'center',
    width: '90%',
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
    marginBottom: 80,
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
  importantNotice: {
    flexDirection: 'row',
    height: 'auto',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.09) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    borderRadius: 8,
    padding: 8,
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

  hederRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemContainer: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  textContainer: {
    // width: '86%'
    paddingLeft: 48,
    marginTop: -12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 24,
    fontFamily: 'Urbanist-SemiBold',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
    fontFamily: 'Urbanist-Medium',
    marginTop: 12,
  },
});

export default SellerInfo;
