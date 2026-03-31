

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
  ScrollView,
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
import { STYLES } from '../../utils/Style';

type ReviewDetailsProps = {
  navigation: any;
};

type RootStackParamList = {
  ReviewDetails: { seller_id: number,category_id: number; id: number; purchase: boolean };
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

  const seller_id = route.params?.seller_id || 64;

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
  }, [category_id, purchase, t]);

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
      const language_code = await AsyncStorage.getItem('selectedLanguage') || 'en'

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
      if (seller_id) url1 += `?seller_id=${seller_id}`
      console.log(url1)



      const response = await fetch(url1, {
        headers: {
          Authorization: `Bearer ${token}`,
          languagecode: language_code
        },
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

  const { height: screenHeight } = Dimensions.get('window');

  const isEmpty = users.length === 0;
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

  const renderItem = ({ item }: any) => {
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

        <View style={STYLES.headerContent} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            style={styles.backButtonContainer}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[STYLES.blurButtonWrapper, animatedButtonStyle]}
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
          <View style={{ width: 250 }}>
            <Text allowFontScaling={false} style={styles.unizyText}>
              {(() => {
                if (selectedCategory?.name === 'All') {
                  return t('reviews');
                }

                switch (selectedCategory?.id) {
                  case 2:
                    return `${t('Tution')} ${t('reviews')}`;
                  case 3:
                    return `${t('food')} ${t('reviews')}`;
                  case 4:
                    return `${t('Accomodation')} ${t('reviews')}`;
                  case 5:
                    return `${t('housekeeping')} ${t('reviews')}`;
                  default:
                    return `${t('Product')} ${t('reviews')}`;
                }
              })()}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            style={styles.backButtonContainer}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[styles.blurButtonWrapper_none,]}
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
                    borderRadius: 40, display: 'none',
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
                  })), { display: 'none' }
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
                style={[{ height: 24, width: 24, display: 'none' },]}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <Animated.FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          onScroll={scrollHandler}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.listContainer,
            {
              paddingTop: (Platform.OS === 'ios' ? 120 : 100),
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
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryTabsScrollContent}

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
              </View>
            </>
          }
          ListEmptyComponent={
            (loading || initialLoading) && users.length === 0 ? (
              <View style={[styles.emptyWrapper, { justifyContent: 'center', flex: 1 }]}>
                <Loader containerStyle={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }} />
              </View>
            ) : !loading && users.length === 0 ? (
              <View style={[styles.emptyWrapper, { justifyContent: 'center', alignItems: 'center', flex: 1, }]}>
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
  listContainer: {
    // paddingHorizontal: 16,
    width: '100%',
  },

  categoryTabsContainer: {   },
  categoryTabsScrollContent: { flexDirection: 'row', alignItems: 'center',paddingHorizontal: 16,
  padding: 8 },

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
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 18
    // height: '100%',
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
    marginTop: 10,
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

  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },

  backButtonContainer: {
    // position: 'absolute',
    // left: 16,
    zIndex: 11,
    // top: 7,
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
  blurButtonWrapper_none: {
    width: 48,
    height: 48,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 0.4,
    // borderColor: '#ffffff2c',
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemContainer: {
    flex: 1,
    // marginHorizontal: 4,
    paddingHorizontal: 10,
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

  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullScreenContainer: {
    flex: 1,
  },
 
});
