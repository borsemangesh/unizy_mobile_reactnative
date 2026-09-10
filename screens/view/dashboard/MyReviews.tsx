import React, { useEffect, useState } from 'react';
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
  ActivityIndicator,
  Dimensions,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
const bgImage = require('../../../assets/images/backimg.png');
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';
import MyReviewCard from '../../utils/MyReviewCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SquircleView } from 'react-native-figma-squircle';
import Loader from '../../utils/component/Loader';

import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useTranslation } from 'react-i18next';
import i18n from '../../../localization/i18n';

import COMMONSTYLE from '../../utils/CommonStyle';
import ReviewDetailCard from '../../utils/ReviewDetailCard';
import StarRating from '../../utils/StarRating';
import { useRoute, RouteProp } from '@react-navigation/native';

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
};
type MyReviewsRouteParams = {
  activeTab?: 'Given Reviews' | 'Received Reviews';
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
  id: number;
  name: string;
};

type MyReviewsProps = {
  navigation: any;
};
type User = {
  id: string;
  name: string;
  university: string;
  rating: number;
  profileImg: any;
  comment: string;
};

const MyReviews = ({ navigation }: MyReviewsProps) => {
     const { width, height } = useWindowDimensions();
   

  const [featurelist, setFeaturelist] = useState<Feature[]>([]);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pagesize = 10;
  const [featureList, setFeatureList] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets(); // Safe area insets
  const { height: screenHeight } = Dimensions.get('window');
  const { t } = useTranslation();

  const isEmpty = featurelist.length === 0;
    const route = useRoute<RouteProp<{ params: MyReviewsRouteParams }, 'params'>>();
const initialTab = route?.params?.activeTab ?? 'Given Reviews';
  const [activeTab, setActiveTab] = useState<'Given Reviews' | 'Received Reviews'>(
    initialTab
  );
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const tabs = ['Given Reviews', 'Received Reviews'];
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = (screenWidth * 0.9) / tabs.length;

  // const [selectedTab, setSelectedTab] = useState<'Bank' | 'Cards'>('Bank');
  const bubbleTranslateX = useSharedValue(0);

  type Category = {
    id: number | null;
    name: string;
  };

  useEffect(() => {
  if (route?.params?.activeTab) {
    setActiveTab(route.params.activeTab);
  }
}, [route?.params?.activeTab]);
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

  const [categories, setCategories] = useState<Category[]>([
    { id: null, name: t('all') },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<Category>({
    id: null,
    name: t('all'),
  });

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
    if (activeTab === 'Received Reviews') {
      fetchReviews();
    } else {
      setPage(1);
      displayListOfProduct(selectedCategory?.id ?? null, 1);
    }

    // displayListOfProduct(selectedCategory?.id ?? null, 1);
  }, [selectedCategory, activeTab]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setInitialLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('userToken');
      const language_code =
        (await AsyncStorage.getItem('selectedLanguage')) || 'en';

      if (!token) return;
      //const url1 = `${MAIN_URL.baseUrl}category/users/10/reviews`;
      let url1 = '';

      // if (selectedCategory?.id === null) {
      //   url1 = `${MAIN_URL.baseUrl}category/users/reviews`;
      // } else {
      //   url1 = `${MAIN_URL.baseUrl}category/users/reviews/${selectedCategory.id}`;
      // }
      if (selectedCategory?.id === null) {
        url1 = `${MAIN_URL.baseUrl}category/users/reviews`;
      } else {
        url1 = `${MAIN_URL.baseUrl}category/users/reviews/${selectedCategory.id}`;
      }
      if (userId) url1 += `?seller_id=${userId}`;
      console.log(url1);

      const response = await fetch(url1, {
        headers: {
          Authorization: `Bearer ${token}`,
          languagecode: language_code,
        },
      });

      const result = await response.json();
      console.log('Fetch reviews response status:', url1, result);
      setTotalReviews(result?.data?.totalReviews ?? 0);
      setAverageRating(Number((result?.data?.averageRating ?? 0).toFixed(1)));
      const reviews = result?.data?.reviews ?? [];

      const formattedUsers: User[] = reviews.map((item: any) => ({
        id: item.id.toString(),
        name: item.reviewer_name,
        university: item?.university_name ?? 'Unknown University',
        rating: item.rating,
        userprofile: item?.reviewer_image,
        productimage: item?.feature_image,
        comment: item.comment,
        date: item.created_at,
        featureTitle: item.feature_title,
        categoryName: item.category_name,
        category_id: item.category_id,
        price: item.price,
      }));

      setUsers(formattedUsers);

      setLoading(false);
      setInitialLoading(false);
    } catch (error) {
      setLoading(false);
      setInitialLoading(false);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    const index = tabs.indexOf(activeTab);
    bubbleTranslateX.value = withSpring(index * tabWidth, {
      damping: 150,
      stiffness: 320,
    });
  }, [activeTab]);
  const bubbleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: bubbleTranslateX.value }],
    };
  });

  const displayListOfProduct = async (
    categoryId: number | null,
    pageNum: number,
  ) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      }
      const pagesize = 10;
      let url = `${MAIN_URL.baseUrl}category/myreview?page=${pageNum}&pagesize=${pagesize}`;
      if (categoryId) {
        url += `&category_id=${categoryId}`;
      }

      const token = await AsyncStorage.getItem('userToken');
      const language_code =
        (await AsyncStorage.getItem('selectedLanguage')) || 'en';
      if (!token) return;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          languagecode: language_code,
        },
      });

      const jsonResponse = await response.json();

      const reviews = jsonResponse.data ?? [];
      if (jsonResponse.statusCode === 200) {
        setIsLoading(false);
        setFeatureList(reviews);
      } else if (
        jsonResponse.statusCode === 401 ||
        jsonResponse.statusCode === 403
      ) {
        setIsLoading(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
        });
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
    }
  };

  const filteredFeatures: Feature[] = featurelist.filter(item =>
    (item.featurelist?.title ?? '')
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const formatDate = (dateString?: string, t?: any) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const day = date.getDate();
    const year = date.getFullYear();
    const lang = i18n.language; // detect current language

    // ---------- Suffix only for English ----------
    let suffix = '';
    if (lang === 'en') {
      if (day % 10 === 1 && day !== 11) suffix = 'st';
      else if (day % 10 === 2 && day !== 12) suffix = 'nd';
      else if (day % 10 === 3 && day !== 13) suffix = 'rd';
      else suffix = 'th';
    }

    // ---------- Month translation ----------
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

  const [users, setUsers] = useState<User[]>([]);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isLastOddItem =
      filteredFeatures.length % 2 !== 0 &&
      index === filteredFeatures.length - 1;

    const feature = item?.feature;
    const displayDate = formatDate(item?.created_at, t);

    const productImage = feature?.thumbnail
      ? { uri: feature.thumbnail }
      : require('../../../assets/images/drone.png');

    const displayPrice = feature.price;
    const displayTitle = feature?.title ?? 'Title';
    const rating = item?.rating?.toString() ?? '0';
    const comment = item?.comment ?? '';

    const createdby = feature?.createdby ?? null;
    const profileshowinview =
      feature?.category_id === 2 || feature?.category_id === 5 ? true : false;

    return (
      <View
        style={[styles.itemContainer, isLastOddItem && { marginRight: 'auto' }]}
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

  const renderItem_Reviews = ({ item }: any) => {
    const displayDate = formatDate(item.date, t);
    const displayTitle = item.featureTitle ?? 'Title';

    return (
      <View style={styles.itemContainer}>
        <ReviewDetailCard
          infoTitle={displayTitle}
          inforTitlePrice={`£${item.price ?? ''}`}
          rating={item.rating?.toString() ?? '0'}
          reviewText={item.comment ?? ''}
          shareid={item.id}
          date={displayDate}
          reviewer_name={item.name}
          category_id={item.category_id}
          reviewer_image={item.userprofile}
          feature_image={item.productimage}
        />
      </View>
    );
  };

  return (
    <ImageBackground
      source={BACK_ICON}
      style={{ flex: 1, width: '100%', height: '100%' }}
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

        <View style={[COMMONSTYLE.headerContent,{

                paddingTop: insets.top + height * 0.01,
              },]} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() =>
              
             Platform.OS === 'ios' ?  navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'Dashboard',
                  params: {
                    AddScreenBackactiveTab: 'Profile',
                    isNavigate: false,
                  },
                },
              ],
            }):
              navigation.replace('Dashboard', {
                AddScreenBackactiveTab: 'Profile',
                isNavigate: false,
              })
              
            }
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

              <Animated.Image
                source={require('../../../assets/images/back.png')}
                style={[{ height: 24, width: 24 }, animatedIconStyle]}
              />
            </Animated.View>
          </TouchableOpacity>

          <Text
            numberOfLines={2}
            allowFontScaling={false}
            style={styles.unizyText}
          >
            {t('reviews')}
          </Text>

          <TouchableOpacity
            style={[styles.backButtonContainer]}
            // activeOpacity={0}
          >
            <Animated.View style={[styles.blurButtonWrapper_none]}>
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
                  })),
                  { display: 'none' },
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
                  })),
                  { display: 'none' },
                ]}
              ></Animated.View>

              {/* Back Icon */}
              <Animated.Image
                source={require('../../../assets/images/back.png')}
                style={[{ height: 25, width: 25, display: 'none' }]}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {activeTab === 'Given Reviews' ? (
          <Animated.FlatList
            data={featureList}
            renderItem={
              activeTab === 'Given Reviews' ? renderItem : renderItem_Reviews
            }
            keyExtractor={(item, index) => {
              'worklet';
              return index.toString();
            }}
            ListHeaderComponent={
              <View
                style={styles.categoryTabsContainer}
                pointerEvents="box-none"
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

                  {tabs.map(tab => (
                    <TouchableOpacity
                      key={tab}
                      style={[styles.tabItem, { width: tabWidth }]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedCategory({ id: null, name: t('all') });
                        setActiveTab(tab as any);
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: 'Urbanist-SemiBold',
                          color: activeTab === tab ? '#FFFFFF' : '#89C7FF',
                          textAlign: 'center',
                        }}
                      >
                        {t(tab)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
                          {/* </View> */}
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
                paddingTop: Platform.OS === 'ios' ? 0 : 0,
                paddingBottom: isEmpty
                  ? 10
                  : Platform.select({
                      ios: height * 0.01, // ⬅ apply padding when list has data
                      android: height * 0.04,
                    }),
                flexGrow: 1,
              },
            ]}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              displayListOfProduct(selectedCategory?.id ?? null, nextPage);
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
        ) : (
          <Animated.FlatList
            data={users}
            renderItem={renderItem_Reviews}
            keyExtractor={item => item.id.toString()}
            onScroll={scrollHandler}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            contentContainerStyle={[
              styles.listContainer,
              {
                paddingTop: Platform.OS === 'ios' ? 0 : 0,
                paddingBottom: isEmpty
                  ? 10
                  : Platform.select({
                      ios: height * 0.01,
                      android: height * 0.04,
                    }),
                flexGrow: 1,
              },
            ]}
            ListHeaderComponent={
              <>
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

                    {tabs.map(tab => (
                      <TouchableOpacity
                        key={tab}
                        style={[styles.tabItem, { width: tabWidth }]}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedCategory({ id: null, name: t('all') });
                          setActiveTab(tab as any);
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: 'Urbanist-SemiBold',
                            color: activeTab === tab ? '#FFFFFF' : '#89C7FF',
                            textAlign: 'center',
                          }}
                        >
                          {t(tab)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryTabsScrollContent}
                  >
                    {categories.map((cat, index) => {
                      const isSelected = selectedCategory.name === cat.name;
                      return (
                        <Pressable
                          key={index}
                          onPress={() => setSelectedCategory(cat)}
                        >
                          <SquircleView
                            style={
                              isSelected ? styles.tabcard : styles.tabcard1
                            }
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
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  <View
                    style={{
                      paddingHorizontal: 16,
                      marginBottom: 12,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      allowFontScaling={false}
                      style={{
                        fontSize: 60,
                        fontWeight: '700',
                        color: '#fff',
                        marginBottom: 4,
                      }}
                    >
                      {/* {averageRating} */}
                      {averageRating === 0 ? '-' : averageRating}
                    </Text>

                    <StarRating rating={averageRating} starSize={24} />

                    <Text allowFontScaling={false} style={styles.reviewcount}>
                       {totalReviews === 0 ? '-' : totalReviews} {t('reviews')}
                    </Text>
                  </View>

                  <View style={styles.innercontainer}>
                    <Text allowFontScaling={false} style={styles.mainlabel}>
                      {t('reviews')}
                    </Text>

                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Image
                        source={require('../../../assets/images/staricon.png')}
                        style={{
                          width: 16,
                          height: 16,
                          marginRight: 4,
                          tintColor: 'rgba(140, 225, 255, 0.9)',
                        }}
                      />
                      <Text allowFontScaling={false} style={styles.subrating}>
                        {/* {averageRating} ({totalReviews}) */}
                        {averageRating === 0 ? '-' : averageRating} ({totalReviews === 0 ? '-' : totalReviews})
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            }
            //    ListHeaderComponent={
            //   <View
            //     style={styles.categoryTabsContainer}
            //     pointerEvents="box-none"
            //   >
            //     <ScrollView
            //       horizontal
            //       showsHorizontalScrollIndicator={false}
            //       contentContainerStyle={styles.categoryTabsScrollContent}
            //       nestedScrollEnabled={true}
            //     >
            //       {categories.map((cat, index) => {
            //         const isSelected = selectedCategory.name === cat.name;
            //         return (
            //           <TouchableOpacity
            //             key={index}
            //             onPress={() => setSelectedCategory(cat)}
            //             activeOpacity={0.7}
            //           >
            //             <SquircleView
            //               style={isSelected ? styles.tabcard : styles.tabcard1}
            //               squircleParams={{
            //                 cornerSmoothing: 1,
            //                 cornerRadius: 10,
            //                 fillColor: isSelected
            //                   ? 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.10) 100%)'
            //                   : 'rgba(255, 255, 255, 0.06)',
            //               }}
            //             >
            //               <Text
            //                 allowFontScaling={false}
            //                 style={
            //                   isSelected ? styles.tabtext : styles.othertext
            //                 }
            //               >
            //                 {cat.name}
            //               </Text>
            //               {/* </View> */}
            //             </SquircleView>
            //           </TouchableOpacity>
            //         );
            //       })}
            //     </ScrollView>
            //   </View>
            // }
            ListEmptyComponent={
              (loading || initialLoading) && users.length === 0 ? (
                <View
                  style={[
                    styles.emptyWrapper,
                    { justifyContent: 'center', flex: 1 },
                  ]}
                >
                  <Loader
                    containerStyle={{
                      width: 50,
                      height: 50,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  />
                </View>
              ) : !loading && users.length === 0 ? (
                <View
                  style={[
                    styles.emptyWrapper,
                    {
                      justifyContent: 'center',
                      alignItems: 'center',
                      flex: 1,
                    },
                  ]}
                >
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
        )}
      </View>
      <NewCustomToastContainer />
      {/* </BackgroundWrapper> */}
    </ImageBackground>
  );
};

export default MyReviews;

const styles = StyleSheet.create({
  mainlabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },

  innercontainer: {
    paddingHorizontal: 24,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  reviewcount: {
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
    color: '#FFFFFFE0',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600,
    fontSize: 16,
  },
  subrating: {
    color: 'rgba(140, 225, 255, 0.9)',
    fontSize: 14,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
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
    boxShadow:
      '0 2px 4px 0 rgba(0, 0, 0, 0.23), -0.90px -0.80px 1px 0px rgba(255, 255, 255, 0.19)inset, 0.90px 0.80px 0.90px 0px rgba(255, 255, 255, 0.19)inset',
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
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
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

  categoryTabsContainer: {
    marginHorizontal: -30,
    paddingHorizontal: 30,
    overflow: 'visible',
  },
  categoryTabsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    padding: 8,
  },

  tabcard: {
    minHeight: 38,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 0.4,
    borderColor: 'rgba(255, 255, 255, 0)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.11) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderRadius: 10,
    boxSizing: 'border-box',
    ///boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23),0px 0.90px 0px 0px rgba(255, 255, 255, 0.11) inset, 0px -0.90px 0px 0px rgba(255, 255, 255, 0.11) inset',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.25)',
  },

  tabcard1: {
    minHeight: 38,
    borderWidth: 0.4,
    borderColor: '#ffffff11',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderEndEndRadius: 10,
    borderStartEndRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomStartRadius: 10,
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',
    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
    // boxSizing: 'border-box',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    //boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
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
    paddingTop: 10,
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
  // emptyImage: {
  //   width: 50,
  //   height: 50,
  //   marginBottom: 20,
  // },
  // emptyText: {
  //   fontSize: 20,
  //   color: '#fff',
  //   textAlign: 'center',
  //   fontFamily: 'Urbanist-SemiBold',
  //   fontWeight: 600
  // },

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
    fontWeight: 600,
  },

  tabtext: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
  },
  othertext: {
    color: '#FFFFFF7A',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
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
    paddingHorizontal: 12,
  },
});
