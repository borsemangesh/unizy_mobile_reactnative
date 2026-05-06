import React, { useEffect, useState, useCallback } from 'react';
import { SquircleView } from 'react-native-figma-squircle';
import 'react-native-reanimated';
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
  BackHandler,
} from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
import { useTranslation } from 'react-i18next';
import MyListingCard from '../../utils/MyListingCard';
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';
import { useFocusEffect } from '@react-navigation/native';
import Loader from '../../utils/component/Loader';
import i18n from '../../../localization/i18n';

import COMMONSTYLE from '../../utils/CommonStyle';

import BACK_ICON from '../../../assets/images/backimg.png';

type Feature = {
  avg_rating: string | null | undefined;
  id: number;
  created_by: number;
  category_id: number;
  created_at: any;
  updated_at: string;
  isactive: boolean;
  isfeatured: boolean;
  title: string;
  price: number;
  thumbnail: string;
  university: university;
  category?: { id: number; name: string };
  createdby?: {
    profile?: string | null;
    firstname?: string | null;
    lastname?: string | null;
    university_name?: string | null;
  };
};
type university = {
  id: number;
  name: string;
};

type MyListingProps = {
  navigation: any;
};

 type Category = {
    id: number | null;
    name: string;
};
  
const { width: SCREEN_WIDTH, height:SCREEN_HEIGHT } = Dimensions.get('window');

const MyListing = ({ navigation }: MyListingProps) => {
  const { t } = useTranslation();
  const [featurelist, setFeaturelist] = useState<Feature[]>([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [featureList, setFeatureList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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

  const [categories, setCategories] = useState<Category[]>([
    { id: null, name: t('all') },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<Category>({
    id: null,
    name: t('all'),
  });

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      displayListOfProduct(selectedCategory?.id ?? null, 1, false);
    }, [selectedCategory]),
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
    const backAction = () => {
      navigation.replace('Dashboard', {
        AddScreenBackactiveTab: 'Home',
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

  const displayListOfProduct = async (
    categoryId: number | null,
    pageNum: number,
    isInitialLoad: boolean = false,
  ) => {
    let start = Date.now();

    try {
      if (isInitialLoad) {
        setInitialLoading(true);
      } else {
        setIsLoading(true);
      }

      const pagesize = 10;
      let url = `${MAIN_URL.baseUrl}category/mylisting?page=${pageNum}&pagesize=${pagesize}`;
      if (categoryId) {
        url += `&category_id=${categoryId}`;
      }

      console.log(url);

      const token = await AsyncStorage.getItem('userToken');
      const language_code =
        (await AsyncStorage.getItem('selectedLanguage')) || 'en';

      console.log(token);

      if (!token) {
        if (isInitialLoad) {
          await new Promise(r => setTimeout(r, 1000));
          setInitialLoading(false);
          setIsLoading(false);
        }
        return;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          languagecode: language_code,
        },
      });

      const jsonResponse = await response.json();

      if (jsonResponse.statusCode === 200) {
        if (pageNum === 1) {
          setFeatureList(jsonResponse.data.features);
        } else {
          setFeatureList(prev => [...prev, ...jsonResponse.data.features]);
        }
      } else if (
        jsonResponse.statusCode === 401 ||
        jsonResponse.statusCode === 403
      ) {
        if (isInitialLoad) {
          await new Promise(r => setTimeout(r, 1000));
          setInitialLoading(false);

          setIsLoading(false);
        } else {
          setInitialLoading(false);
          setIsLoading(false);
        }
        navigation.reset({
          index: 0,
          routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
        });
      } else {
        if (isInitialLoad) {
          await new Promise(r => setTimeout(r, 1000));
          setInitialLoading(false);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          setIsLoading(false);
        }
      }
    } catch (err) {
      // console.log('Error:', err);
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
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setInitialLoading(false);
      }
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: Feature; index: number }) => {
      const displayDate = formatDate(item.created_at, t);
      const displayTitle =
        item.title && item.title.trim() !== '' ? item.title : 'Title';
      const displayPrice = item.price != null ? item.price : 0;
      const productImage = item.thumbnail
        ? { uri: item.thumbnail }
        : require('../../../assets/images/drone.png');

      // Get category name from item or find from categories list
      const categoryName =
        item.category?.name ||
        categories.find(cat => cat.id === item.category_id)?.name ||
        '';

      return (
        <View style={[styles.itemContainer]}>
          <MyListingCard
            tag={item.createdby?.university_name || 'University of Warwick'}
            infoTitle={displayTitle}
            inforTitlePrice={`£ ${displayPrice}`}
            rating={displayDate}
            productImage={productImage}
            topRightText={item.isactive ? t('active') : t('inactive')}
            isfeature={item.isfeatured}
            navigation={navigation}
            shareid={item.id}
            catagory_id={item.category_id}
            catagory_name={item.title}
            isactive={item.isactive}
            categoryName={categoryName}
            profilePhoto={item.createdby?.profile || null}
            firstName={item.createdby?.firstname || null}
            lastName={item.createdby?.lastname || null}
            reviews={item.avg_rating}
          />
        </View>
      );
    },
    [categories, navigation],
  );

  const formatDate = (dateString?: string, t?: any) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const day = date.getDate();
    const year = date.getFullYear();
    const lang = i18n.language;

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
  const isEmpty = featureList.length === 0;

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

        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        <Animated.View
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
        <View style={COMMONSTYLE.headerContent} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => {
              console.log('MYLISTSTACK', navigation.getState());
              if (
                navigation.getState().routes[navigation.getState().index]
                  .name === 'MyListing'
              ) {
                navigation.replace('Dashboard', {
                  AddScreenBackactiveTab: 'Home',
                  isNavigate: false,
                });
              }
            }}
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
          <View style={{ width: 280 }}>
            <Text allowFontScaling={false} style={styles.unizyText}>
              {t('My_Listings')}
            </Text>
          </View>
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
        <View style={{ flex: 1, overflow: 'hidden' }}>
          <Animated.FlatList
            data={featureList}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={false}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
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
                paddingTop: Platform.OS === 'ios' ? 120 : 100,
                paddingBottom: isEmpty
                  ? 10
                  : Platform.select({
                      ios: SCREEN_HEIGHT * 0.01,
                      android: SCREEN_HEIGHT * 0.04,
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
              (isLoading || initialLoading) && featurelist.length === 0 ? (
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
              ) : !isLoading && featurelist.length === 0 ? (
                <View
                  style={[
                    styles.emptyWrapper,
                    { justifyContent: 'center', alignItems: 'center', flex: 1 },
                  ]}
                >
                  <View style={styles.emptyContainer}>
                    <Image
                      source={require('../../../assets/images/noproduct.png')}
                      style={styles.emptyImage}
                      resizeMode="contain"
                    />
                    <Text allowFontScaling={false} style={styles.emptyText}>
                      {t('No_Listings_Found')}
                    </Text>
                  </View>
                </View>
              ) : null
            }
          />
        </View>
      </View>
      <NewCustomToastContainer />
      {/* </BackgroundWrapper> */}
    </ImageBackground>
  );
};

export default MyListing;

const styles = StyleSheet.create({
  categoryTabsContainer: {},
  categoryTabsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    padding: 8,
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

  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
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

  backButtonContainer: {
    zIndex: 11,
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
    width: '100%',
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
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.25)',
  },
  tabcard1: {
    minHeight: 38,
    borderWidth: 0.4,
    borderColor: '#ffffff11',
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },

  itemContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 2,
  },
});
