import React, { useEffect, useState, useRef } from 'react';
import {
  Image,
  ImageBackground,
  Text,
  View,
  TouchableOpacity,
  Platform,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
  useWindowDimensions,

} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';
import MyReviewCard from '../../utils/MyReviewCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SquircleView } from 'react-native-figma-squircle';

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
import { RouteProp, useRoute } from '@react-navigation/native';
import Loader from '../../utils/component/Loader';
import { useTranslation } from 'react-i18next';
import i18n from '../../../localization/i18n';

import COMMONSTYLE from '../../utils/CommonStyle';

import BACK_ICON from '../../../assets/images/backimg.png';


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
  city?: string;
  university_id?: number;
  stripe_customer_id?: string;
};



type ReviewItem = {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  feature_id: number;
  feature_title: string;
  category_id: number;
  category_name: string;
  thumbnail: string;
  profileshowinview: boolean;
  createdby: CreatedBy;
  price: number
};

type university = {
  id: number,
  name: string
}

type UserReviewsProps = {
  navigation: any;
};

type RouteParams = {
  source?: 'chatList' | 'sellerPage';
  members: {
    firstname: string;
    lastname: string;
    id: number;
    profile: string | null;
    university: { id: number, name: string };
  };
};



const UserReviews = ({ navigation }: UserReviewsProps) => {
  const { width, height } = useWindowDimensions();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const { members } = route.params;

  const [featurelist, setFeaturelist] = useState<ReviewItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pagesize = 10;
  const [featureList, setFeatureList] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const isInitialMount = useRef(true);
  const insets = useSafeAreaInsets(); // Safe area insets
  const { height: screenHeight } = Dimensions.get('window');
  const [totalRecords, setTotalRecords] = useState(0);
  const { t } = useTranslation();
  const isEmpty = featureList.length === 0;

  type Category = {
    id: number | null;
    name: string;
  };
  const [categories, setCategories] = useState<Category[]>([
    { id: null, name: t('all') },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<Category>({
    id: null,
    name: t('all'),
  });
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

  useEffect(() => {
    const loadCategories = async () => {
      const stored = await AsyncStorage.getItem('categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        const catObjects = [
          { id: null, name: t('all') },
          ...parsed.map((cat: any) => ({ id: cat.id, name: cat.name })),
        ];
        setCategories(catObjects);
        setSelectedCategory(catObjects[0]);
      }
    };
    loadCategories();
  }, [t]);


  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }

    setPage(1);
    setFeatureList([]);
    setTotalRecords(0);
    setIsLoadingMore(false);
    displayListOfProduct(selectedCategory?.id ?? null, 1, false);
  }, [selectedCategory]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setPage(1);
      displayListOfProduct(selectedCategory?.id ?? null, 1, true);
    }
  }, []);


  const displayListOfProduct = async (categoryId: number | null, pageNum: number, isInitialLoad: boolean = false) => {
    let start = Date.now();

    try {
      if (isInitialLoad) {
        setInitialLoading(true);
      } else {
        setIsLoading(true);
      }

      const pagesize = 10;
      let url = `${MAIN_URL.baseUrl}user/user-review?page=${pageNum}&pagesize=${pagesize}&user_id=${members.id}`;

      if (categoryId) {
        url += `&category_id=${categoryId}`;
      }


      console.log("REVIEWS: ",url);
      const token = await AsyncStorage.getItem('userToken');
      const language_code = await AsyncStorage.getItem('selectedLanguage') || 'en'
      if (!token) {
        if (isInitialLoad) {
          await new Promise(r => setTimeout(r, 1000));
          setInitialLoading(false);
        }
        return;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          languagecode: language_code
        },
      });

      const jsonResponse = await response.json();

      const reviews: ReviewItem[] = jsonResponse.data?.features ?? [];
      const total = jsonResponse.data?.totalRecords ?? reviews.length;
      setTotalRecords(total);

      if (jsonResponse.statusCode === 200) {
        if (pageNum === 1) {
          setFeatureList(reviews);
          if (isInitialLoad) {
            setInitialLoading(false);
          }
        } else {
          setFeatureList(prev => [...prev, ...reviews]);
        }

      }
      else if (jsonResponse.statusCode === 401 || jsonResponse.statusCode === 403) {
        if (isInitialLoad) {
          await new Promise(r => setTimeout(r, 1000));
          setInitialLoading(false);
        } else {
          setIsLoading(false);
        }
        navigation.reset({
          index: 0,
          routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
        });
      }
      else {
        if (isInitialLoad) {
          await new Promise(r => setTimeout(r, 1000));
          setInitialLoading(false);
        } else {
          setIsLoading(false);
        }
      }

    } catch (err) {

      if (isInitialLoad) {
        await new Promise(r => setTimeout(r, 1000));
        setInitialLoading(false);
      } else {
        setIsLoading(false);
      }
    } finally {
      if (isInitialLoad) {
        let elapsed = Date.now() - start;
        let remaining = Math.max(0, 1000 - elapsed);
        await new Promise(r => setTimeout(r, remaining));
        setInitialLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  };



  const filteredFeatures = featurelist.filter(item =>
    (item.feature_title ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString?: string, t?: any) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const day = date.getDate();
    const year = date.getFullYear();
    const lang = i18n.language;

    let suffix = "";
    if (lang === "en") {
      if (day % 10 === 1 && day !== 11) suffix = "st";
      else if (day % 10 === 2 && day !== 12) suffix = "nd";
      else if (day % 10 === 3 && day !== 13) suffix = "rd";
      else suffix = "th";
    }

    const monthIndex = date.getMonth();
    const monthKeys = [
      "jan", "feb", "mar", "apr", "may", "jun",
      "jul", "aug", "sep", "oct", "nov", "dec"
    ];

    const monthShort = t ? t(monthKeys[monthIndex]) : monthKeys[monthIndex];

    return `${day}${suffix} ${monthShort} ${year}`;
  };


  const renderItem = ({ item, index }: { item: ReviewItem; index: number }) => {
    const isLastOddItem =
      filteredFeatures.length % 2 !== 0 &&
      index === filteredFeatures.length - 1;

    const displayDate = formatDate(item.created_at, t);

    const productImage = item.thumbnail
      ? { uri: item.thumbnail }
      : require('../../../assets/images/drone.png');

    const displayPrice = item.price
    const displayTitle = item.feature_title ?? "Title";
    const rating = item.rating?.toString() ?? "0";
    const comment = item.comment ?? '';

    const createdby = item.createdby ?? null;
    const profileshowinview = item.profileshowinview ?? false;

    return (
      <View
        style={[
          styles.itemContainer,
          isLastOddItem && { marginRight: 'auto' },
        ]}
      >
        <MyReviewCard
          infoTitle={displayTitle}
          inforTitlePrice={displayPrice}
          rating={rating}
          productImage={productImage}
          reviewText={comment}
          shareid={item.id}
          date={displayDate}
          createdby={createdby}
          profileshowinview={profileshowinview}
        />
      </View>
    );
  };


  return (
          <ImageBackground
                 source={BACK_ICON}
                  style={{ flex: 1,width: '100%',
                  height: '100%', }}
                  resizeMode="cover"
            >
    {/* <BackgroundWrapper> */}
      <View style={styles.fullScreenContainer}>
        {initialLoading && featureList.length === 0 && (
          <Loader
            containerStyle={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: Platform.OS === 'ios' ? 600 : 150,
              zIndex: 1000,
              elevation: Platform.OS === 'android' ? 100 : 0,
              pointerEvents: 'none',
            }}
          />
        )}
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

        <View style={[COMMONSTYLE.headerContent,{

                paddingTop: insets.top + height * 0.01,
              },]} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => { navigation.goBack(); }}
            style={styles.backButtonContainer}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[COMMONSTYLE.blurButtonWrapper, animatedButtonStyle]}
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

              {/* Back Icon */}
              <Animated.Image
                source={require('../../../assets/images/back.png')}
                style={[{ height: 24, width: 24 }, animatedIconStyle]}
              />
            </Animated.View>
          </TouchableOpacity>
          <View style={{width: 280}}>
          <Text allowFontScaling={false} style={styles.unizyText}>
            {members.firstname} {t('reviews')}
          </Text>
          </View>

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
          data={featureList}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
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
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryTabsScrollContent}
                nestedScrollEnabled={true}
              >
                {categories.map((cat, index) => {
                  const isSelected = selectedCategory.name === cat.name;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedCategory(cat)}
                      activeOpacity={0.7}
                    >
                      <SquircleView
                        style={isSelected ? styles.tabcard : styles.tabcard1}
                        squircleParams={{
                          cornerSmoothing: 1,
                          cornerRadius: 10,
                          fillColor: isSelected
                            ? 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.10) 100%)'
                            : 'rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        <Text
                          allowFontScaling={false}
                          style={
                            isSelected ? styles.tabtext : styles.othertext
                          }
                        >
                          {cat.name}
                        </Text>
                      </SquircleView>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          }
          contentContainerStyle={[
            styles.listContainer,
            {
              paddingTop: (Platform.OS === 'ios'? 120 : 100),
              paddingBottom: isEmpty
                ? 10                      
                : Platform.select({
                  ios: screenHeight * 0.01,
                  android: screenHeight * 0.04,
                }),
              flexGrow: 0.97,
            },
          ]}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (featureList.length >= totalRecords) return;
            if (isLoadingMore) return;

            setIsLoadingMore(true);
            const nextPage = page + 1;
            setPage(nextPage);
            displayListOfProduct(selectedCategory?.id ?? null, nextPage)
              .finally(() => setIsLoadingMore(false));
          }}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Loader
                  containerStyle={{
                    width: 50,
                    height: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !initialLoading && !isLoading ? (
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
            ) : null
          }
        />

      </View>
      <NewCustomToastContainer />
      {/* </BackgroundWrapper> */}
      </ImageBackground>
  );

};

export default UserReviews;

const styles = StyleSheet.create({

  categoryTabsContainer: {paddingTop: 8 },
  categoryTabsScrollContent: { flexDirection: 'row', alignItems: 'center'  ,paddingHorizontal: 16,padding: 8 },
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
    top: Platform.OS === 'ios' ? '6%' : 40,
    width: Platform.OS === 'ios' ? 393 : '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 11,
    alignSelf: 'center',
    pointerEvents: 'box-none',
  },


  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 9,
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

  tabcard: {
    minHeight: 38,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 0.4,
    borderColor: '#ffffff11',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderRadius: 10,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.25)',
  },
  tabcard1: {
    minHeight: 38,
    borderWidth: 0.4,
    borderColor: '#ffffff11',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',

    borderRadius: 10,
    boxSizing: 'border-box',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    overflow: 'hidden'
  },

  tabtext: {
    color: '#fff',   
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14

  },
  othertext: {
    color: '#FFFFFF7A',  
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14
  },

  fullScreenContainer: {
    flex: 1,
    //marginTop: 10
  },

  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    width: '100%',
  },
  
  listContainer: {
    // marginLeft: 10,
    // marginRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  itemContainer: {
    flex: 1,
    marginHorizontal: 4,
    paddingHorizontal: 16
  },
});