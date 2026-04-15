
import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Text,
  View,
  TouchableOpacity,
  Platform,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Dimensions,

} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
const bgImage = require('../../../assets/images/backimg.png');
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';
import MyReviewCard from '../../utils/MyReviewCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Loader from '../../utils/component/Loader';

import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useTranslation } from 'react-i18next';
import i18n from '../../../localization/i18n';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import BackgroundWrapper from '../../utils/component/BackgroundWrapper';
import { IMAGE_URLS } from '../../utils/Style';

type CreatedBy = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  postal_code: string;
  password: string;
  student_email: string;
  university_name: string | null;
  profile: string;
  reset_password_token: string | null;
  reset_password_expires: string | null;
  isactive: boolean;
  created_at: string;
  updated_at: string;
  role_id: number;
};

type ReviewItem = {
  id: number;
  rating: number;
  review: string;
  created_at: string;
  feature_name: string;
  price: number;
  thumbnail: string;
};


type Feature = {
  id: number;
  added_by: number;
  featurelist_id: number;
  created_at: string;

  featurelist: {
    id: number;
    created_by: number;
    category_id: number;
    created_at: string | null;
    updated_at: string;
    isactive: boolean;
    isfeatured: boolean;
    title: string;
    price: number;
    thumbnail: string;
    profileshowinview: boolean;
    createdby: CreatedBy;
    university: university;
    isbookmarked: boolean;
  };
};
type university = {
  id: number,
  name: string
}

type MyRatingsProps = {
  navigation: any;
};


const MyRatings = ({ navigation }: MyRatingsProps) => {
  const route = useRoute();
  const [featurelist, setFeaturelist] = useState<Feature[]>([]);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pagesize = 10;
  const [featureList, setFeatureList] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets(); // Safe area insets
  const { height: screenHeight } = Dimensions.get('window');
  const { t } = useTranslation();
  const { height } = Dimensions.get('window');
  const isEmpty = featurelist.length === 0;
  const { shareid = 0 } = (route.params as { shareid?: number }) || {};

  const [reviews, setReviews] = useState<ReviewItem[]>([]);

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


  const selectedCategory = shareid;


  // useEffect(() => {
  //   if (shareid) {
  //     setPage(1);
  //     displayListOfProduct(shareid ?? null, 1);
  //   }
  // }, [shareid]);

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      setReviews([]);
      if (shareid) {
        displayListOfProduct(shareid, 1);
      }
    }, [shareid])
  );
  

  const filteredReviews = reviews.filter(item =>
    item.feature_name.toLowerCase().includes(search.toLowerCase())
  );
  

  const displayListOfProduct = async (featureId: number | null, pageNum: number) => {
    try {
      if (pageNum === 1) setIsLoading(true);
  
      const token = await AsyncStorage.getItem('userToken');
      const language_code =
        (await AsyncStorage.getItem('selectedLanguage')) || 'en';
  
      if (!token || !featureId) return;
  
      const url = `${MAIN_URL.baseUrl}category/review/${featureId}?page=${pageNum}&pagesize=10`;
      console.log('RATING URL:', url);
  
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          languagecode: language_code,
        },
      });
  
      const jsonResponse = await response.json();
      console.log('RATING RESPONSE:', jsonResponse);
  
      if (jsonResponse.statusCode === 200) {
        // setReviews(jsonResponse.data.reviews || []);
        if (pageNum === 1) {
          setReviews(jsonResponse.data.reviews || []);
        } else {
          setReviews(prev => [...prev, ...(jsonResponse.data.reviews || [])]);
        }
      }
    } catch (err) {
      console.error('Review fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  

  const filteredFeatures: Feature[] = featurelist.filter(item =>
    (item.featurelist?.title ?? '').toLowerCase().includes(search.toLowerCase())
  );



  const formatDate = (dateString?: string, t?: any) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const day = date.getDate();
  const year = date.getFullYear();
  const lang = i18n.language; // detect current language

  // ---------- Suffix only for English ----------
  let suffix = "";
  if (lang === "en") {
    if (day % 10 === 1 && day !== 11) suffix = "st";
    else if (day % 10 === 2 && day !== 12) suffix = "nd";
    else if (day % 10 === 3 && day !== 13) suffix = "rd";
    else suffix = "th";
  }

  // ---------- Month translation ----------
  const monthIndex = date.getMonth(); // 0–11
  const monthKeys = [
    "jan","feb","mar","apr","may","jun",
    "jul","aug","sep","oct","nov","dec"
  ];

  const monthShort = t ? t(monthKeys[monthIndex]) : monthKeys[monthIndex];

  return `${day}${suffix} ${monthShort} ${year}`;
};

const renderItem = ({ item, index }: { item: ReviewItem; index: number }) => {
  const displayDate = formatDate(item.created_at, t);

  const productImage = item.thumbnail
    ? { uri: item.thumbnail }
    : require('../../../assets/images/drone.png');

  return (
    <View style={styles.itemContainer}>
      <MyReviewCard
        infoTitle={item.feature_name}
        inforTitlePrice={item.price}
        rating={item.rating.toString()}
        reviewText={item.review}
        productImage={productImage}
        shareid={item.id}
        date={displayDate}
        createdby={null}
        profileshowinview={false}
      />
    </View>
  );
};

  return (
      <ImageBackground
          source={IMAGE_URLS.BACK_ICON}
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
              //  overlayColor="rgba(255,255,255,0.05)"
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
            onPress={() => navigation.goBack()}
            style={styles.backButtonContainer}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[styles.blurButtonWrapper, animatedButtonStyle]}
            >
              <Animated.View
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

              <Animated.View
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
              </Animated.View>

              <Animated.Image
                source={require('../../../assets/images/back.png')}
                style={[{ height: 24, width: 24 }, animatedIconStyle]}
              />
            </Animated.View>
          </TouchableOpacity>

          <Text  numberOfLines={2} allowFontScaling={false} style={styles.unizyText}>
           {t('ratings')} 
          </Text>
         
          <TouchableOpacity
            style={[styles.backButtonContainer]}
            // activeOpacity={0}
          >
            <Animated.View
              style={[styles.blurButtonWrapper_none]}
            >

              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  useAnimatedStyle(() => ({
                    opacity: interpolate(
                      scrollY.value,
                      [0, 0],
                      [0, 0],
                      'clamp',
                    ),
                    backgroundColor: 'transparent',
                    borderRadius: 40,
                  })),{display: 'none'}
                ]}
              />

              {/* Blur view fades in as scroll increases */}
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  useAnimatedStyle(() => ({
                    opacity: interpolate(
                      scrollY.value,
                      [0, 0],
                      [0, 0],
                      'clamp',
                    ),
                  })),{display: 'none'}
                ]}
              >
                
              </Animated.View>

              {/* Back Icon */}
              <Animated.Image
                source={require('../../../assets/images/back.png')}
                style={[{ height: 25, width: 25,display: 'none' }]}
              />
            </Animated.View>
          </TouchableOpacity>

        </View>

        <Animated.FlatList
          data={filteredReviews}
          renderItem={renderItem}
          keyExtractor={(item, index) => {
            'worklet';
            return index.toString();
          }}
          ListHeaderComponent={
            <View
            style={[
              styles.categoryTabsContainer,
              {
                marginHorizontal: -30, 
                paddingHorizontal: 30, 
                overflow: 'visible',
              },
            ]}
            pointerEvents="box-none"
           
          >
             
            </View>
          }
          contentContainerStyle={[
            styles.listContainer,
            {
              paddingTop: (Platform.OS === 'ios'? 120 : 100),
              paddingBottom: isEmpty
                ? 10                      
                : Platform.select({
                  ios: height * 0.01,   // ⬅ apply padding when list has data
                  android: height * 0.04,
                }),
              flexGrow: 1,
            },
          ]}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            // const nextPage = page + 1;
            // setPage(nextPage);
            // displayListOfProduct(shareid?? null, nextPage);
            setPage(prev => {
              const nextPage = prev + 1;
              displayListOfProduct(shareid ?? null, nextPage);
              return nextPage;
            });
          }}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={{ marginVertical: 12 }}
              />
            ) : null
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.loaderWrapper}>
                <Loader containerStyle={styles.loaderContainer} />
              </View>
            ) : (
              <View style={[styles.emptyWrapper]}>
                <View style={styles.emptyContainer}>
                  <Image
                    source={require('../../../assets/images/noproduct.png')}
                    style={styles.emptyImage}
                    resizeMode="contain"
                  />
                  <Text allowFontScaling={false} style={styles.emptyText}>
                   {t('no_reviews_found')}
                  </Text>
                </View>
              </View>
            )
          }
        />

      </View>
      <NewCustomToastContainer />
      {/* </BackgroundWrapper> */}
      </ImageBackground>
  );
};

export default MyRatings;

const styles = StyleSheet.create({
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
 
  backButtonContainer: {
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

  categoryTabsContainer: { },
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
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: Platform.OS === 'ios' ? 400 : 300,
    paddingVertical: 40,
  },
  loaderContainer: {
    width: 100,
    height: 100,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 10
    
  },


  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    overflow: 'hidden',
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
  fullScreenContainer: {
    flex: 1,
  },

  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },
  
  listContainer: {
    width: '100%',
  },
  itemContainer: {
    flex: 1,
    marginHorizontal: 4,
    paddingHorizontal: 16
  },
});