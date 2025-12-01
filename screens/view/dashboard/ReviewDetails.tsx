

import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  FlatList,
  Platform,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  ImageSourcePropType,
  ListRenderItem,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';

const bgImage = require('../../../assets/images/backimg.png');
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';
import StarRating from '../../utils/StarRating';
import ReviewDetailCard from '../../utils/ReviewDetailCard';
import MyReviewCard from '../../utils/MyReviewCard';
import Button from '../../utils/component/Button';
import { InfoToast } from 'react-native-toast-message';
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
import Loader from '../../utils/component/Loader';
import { useTranslation } from 'react-i18next';
import i18n from '../../../localization/i18n';

type ReviewDetailsProps = {
  navigation: any;
};

type RootStackParamList = {
  ReviewDetails: { category_id: number; id: number; purchase: boolean };
};

type ReviewDetailsRouteProp = RouteProp<RootStackParamList, 'ReviewDetails'>;

const ReviewDetails: React.FC<ReviewDetailsProps> = ({ navigation }) => {
  const route = useRoute<ReviewDetailsRouteProp>();
  const { t } = useTranslation();
  const { category_id } = route.params;
  const { id } = route.params;
  const { purchase } = route.params;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
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

  type Category = {
    id: number | null;
    name: string;
  };

  const defaultProfile = require('../../../assets/images/user.jpg');
  const [categories, setCategories] = useState<Category[]>([
      { id: null, name: t('all') },
    ]);
    const [selectedCategory, setSelectedCategory] = useState<Category>({
      id: null,
      name: t('all'),
    });
  const [showButton, setShowButton] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

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

        const matchedCategory = catObjects.find(c => c.id === category_id);
        setSelectedCategory(matchedCategory ?? catObjects[0]);
        if (purchase === true && matchedCategory) {
          setShowButton(true);
        } else {
          setShowButton(false);
        }
      }

      setCategoriesLoaded(true);
    };

    loadCategories();
  }, [category_id, purchase,t]);

  useEffect(() => {
    if (selectedCategory?.id !== category_id) {
      setShowButton(false);
    } else if (purchase === true) {
      setShowButton(true);
    }
  }, [selectedCategory, category_id, purchase]);

  useEffect(() => {
    if (!categoriesLoaded) return;
    fetchReviews();
  }, [selectedCategory, categoriesLoaded]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setInitialLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('userToken');
      console.log(token);
      if (!token) return;
      //const url1 = `${MAIN_URL.baseUrl}category/users/10/reviews`;
      let url1 = '';

      if (selectedCategory?.id === null) {
        url1 = `${MAIN_URL.baseUrl}category/users/reviews`;
      } else {
        url1 = `${MAIN_URL.baseUrl}category/users/reviews/${selectedCategory.id}`;
      }

      console.log(url1);

      const response = await fetch(url1, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
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
      console.log('Review Fetch Error:', error);

      setLoading(false);
      setInitialLoading(false);
    } finally {

      setLoading(false);
      setInitialLoading(false);
    }
  };

  type User = {
    id: string;
    name: string;
    university: string;
    rating: number;
    profileImg: any;
    comment: string;
  };

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

  const renderItem = ({ item }: any) => {
    const displayDate = formatDate(item.date,t);
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
    <ImageBackground source={bgImage} style={styles.background}>
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
            onPress={() => {
              navigation.goBack();
            }}
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

          <Text allowFontScaling={false} style={styles.unizyText}>
            {selectedCategory?.name === 'All'
              ? t('reviews')
              : `${selectedCategory?.name} ${t('reviews')}`}
          </Text>
        </View>

        <Animated.FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingTop: Platform.OS === 'ios' ? 120 : 110,
            paddingBottom: Platform.select({
              ios: height * 0.01,
              android: height * 0.1,
            }),
          }}
          ListHeaderComponent={
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                }}
              >
                {categories.map((cat, index) => {
                  const isSelected = selectedCategory.name === cat.name;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedCategory(cat)}
                      style={isSelected ? styles.tabcard : styles.tabcard1}
                    >
                      <Text
                        allowFontScaling={false}
                        style={isSelected ? styles.tabtext : styles.othertext}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
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
                  {averageRating}
                </Text>

                <StarRating rating={averageRating} starSize={24} />

                <Text allowFontScaling={false} style={styles.reviewcount}>
                  {totalReviews} {t('reviews')}
                </Text>
              </View>

              <View style={styles.innercontainer}>
                <Text allowFontScaling={false} style={styles.mainlabel}>
                  {t('reviews')}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                    {averageRating} ({totalReviews})
                  </Text>
                </View>
              </View>
            </>
          }
          ListEmptyComponent={
            (loading || initialLoading) && users.length === 0 ? (
              <View style={[styles.emptyWrapper, { justifyContent: 'center', flex: 1 }]}>
                <Loader containerStyle={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }} />
              </View>
            ) : !loading && users.length === 0 ? (
              <View style={[styles.emptyWrapper, { justifyContent: 'center', alignItems: 'center', flex: 1, paddingHorizontal: 16 }]}>
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

        {showButton && (
          <Button
            title={t('write_a_review')}
            onPress={() =>
              navigation.navigate('AddReview', {
                category_id: category_id,
                feature_id: id,
              })
            }
          />
        )}
      </View>
      <NewCustomToastContainer />
    </ImageBackground>
  );
};

export default ReviewDetails;

const styles = StyleSheet.create({
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
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
    minHeight: '80%',
    marginTop: 200,
  },
  emptyImage: {
    width: 50,
    height: 50,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600
  },

  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    width: '100%',
    marginTop: 17,
  },

  header: {
    position: 'absolute',
    top: 0,
    width: Platform.OS === 'ios' ? 393 : '100%',
    zIndex: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: Platform.OS === 'ios' ? 16 : 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 0,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    shadowOpacity: 0,
    shadowColor: 'transparent',
    alignSelf: 'center',
    minHeight: Platform.OS === 'ios' ? 80 : 88,
  },
  backButtonContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 11,
    top: 7,
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
  headerContent: {
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

  categoryTabsContainer: {
    width: '100%',
    marginBottom: 12,
    marginTop: 12,
  },

  categoryTabsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
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
  itemContainer: {
    flex: 1,
    marginHorizontal: 4,
  },

  subrating: {
    color: 'rgba(140, 225, 255, 0.9)',
    fontSize: 14,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
  },

  mainlabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },

  sublabel: {
    color: '#FFFFFFA3',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Urbanist-Medium',
  },
  innercontainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payText: {
    color: '#002050',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 1,
    textAlign: 'center',
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

  reviewcount: {
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
    color: '#FFFFFFE0',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600,
    fontSize: 16,
  },

  bottomText: {
    marginTop: 4,
    fontSize: 14,
    color: '#FFFFFFA3',
    fontFamily: 'Urbanist-Medium',
    fontWeight: 500,
  },

  ratingText: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'normal',
    letterSpacing: -0.28,
    color: 'rgba(140, 225, 255, 0.9)',
  },

  initialsCircle: {
    backgroundColor: '#8390D4',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  initialsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    margin: 12,
  },
  productdetails: {
    marginTop: 10,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
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
  userSub: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginTop: 4,
  },
  userSub1: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginTop: 1,
  },

  tabcard: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 0.4,
    borderColor: '#ffffff11',

    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
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

    boxSizing: 'border-box',
  },
  tabcard1: {
    borderWidth: 0.4,
    borderColor: '#ffffff11',

    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
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

    boxSizing: 'border-box',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  tabtext: {
    color: '#fff', // selected tab text color
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
  },
  othertext: {
    color: '#FFFFFF7A', // unselected tab text color
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
  },

  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullScreenContainer: {
    flex: 1,
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
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    height: 48,
    width: 48,
  },
});
