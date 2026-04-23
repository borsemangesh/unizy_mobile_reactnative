
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
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';


import { useFocusEffect } from '@react-navigation/native';

import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';

import MyOrderCard from '../../utils/MyOrderCard';
import { SquircleView } from 'react-native-figma-squircle';
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
    isReviewGiven: boolean,

  };
};
type university = {
  id: number,
  name: string
}

type MyOrdersProps = {
  navigation: any;
};




const MyOrders = ({ navigation }: MyOrdersProps) => {
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(1);

  const [featurelist, setFeaturelist] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const { height: screenHeight } = Dimensions.get('window');
  const { height } = Dimensions.get('window');
  const isEmpty = featurelist.length === 0;

    const { t } = useTranslation();

  const [isLoadingMore, setIsLoadingMore] = useState(false);
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

  useEffect(() => {
    const loadBookmarks = async () => {
      const saved = await AsyncStorage.getItem('bookmarkedIds');
      if (saved) setBookmarkedIds(JSON.parse(saved));
    };
    loadBookmarks();
  }, []);
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
    setPage(1);
    displayListOfProduct(selectedCategory?.id ?? null, 1);
  }, [selectedCategory]);


  useFocusEffect(
    useCallback(() => {
      setPage(1);
      displayListOfProduct(selectedCategory?.id ?? null, 1);
    }, [selectedCategory])
  );

  const displayListOfProduct = async (categoryId: number | null, pageNum: number) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      }
      const pagesize = 10;

      let url = `${MAIN_URL.baseUrl}category/myorder-list?page=${pageNum}&pagesize=${pagesize}`;

      if (categoryId) {
        url += `&category_id=${categoryId}`;
      }



      const token = await AsyncStorage.getItem('userToken');
      const language_code = await AsyncStorage.getItem('selectedLanguage') || 'en'
      if (!token) return;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          languagecode: language_code
        },
      });


      const jsonResponse = await response.json();
      console.log("MyOrderUrl", url);
      console.log("MyOrderRes: ",  jsonResponse);

      if (jsonResponse.statusCode === 200) {

        const allItems = jsonResponse?.data?.categories?.flatMap((cat: any) => cat.items) ?? [];
        setIsLoading(false);
        if (pageNum === 1) {
          setFeaturelist(allItems)
        } else {
          setFeaturelist(prev => [...prev, ...allItems]);
        }
      }
      else if (jsonResponse.statusCode === 401 || jsonResponse.statusCode === 403) {
        setIsLoading(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
        });
      }

      else {
        setIsLoading(false);

      }
    } catch (err) {
      setIsLoading(false);

    }
  };

  const filteredFeatures: Feature[] = featurelist.filter(item =>
    (item.featurelist?.title ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);

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


  const formatDate1 = (dateString: string, t?: any) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = date.getDate();
  const year = date.getFullYear();
  const lang = i18n.language; // current language

  // Suffix → only English
  let suffix = "";
  if (lang === "en") {
    if (day % 10 === 1 && day !== 11) suffix = "st";
    else if (day % 10 === 2 && day !== 12) suffix = "nd";
    else if (day % 10 === 3 && day !== 13) suffix = "rd";
    else suffix = "th";
  }

  // Month translation
  const monthIndex = date.getMonth();
  const monthKeys = [
    "jan","feb","mar","apr","may","jun",
    "jul","aug","sep","oct","nov","dec"
  ];

  const monthShort = t ? t(monthKeys[monthIndex]) : monthKeys[monthIndex];

  return `${day}${suffix} ${monthShort} ${year}`;
};


  const groupByDate = (data: any[], t?: any) => {
  const groupedMap: Record<string, any[]> = {};

  
  data.forEach(item => {
    const d = new Date(item.created_at);
    const rawDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;

    const displayDate = formatDate1(item.created_at, t);

  
    if (!groupedMap[rawDate]) {
      groupedMap[rawDate] = [];
    }

    groupedMap[rawDate].push({
      ...item,
      type: 'item',
      displayDate,
      rawDate,
    });
  });
  


  const sortedDates = Object.keys(groupedMap).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const groupedArray: any[] = [];

  sortedDates.forEach(rawDate => {
    const items = groupedMap[rawDate].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
 
    groupedArray.push({
      type: 'date',
      id: `date-${rawDate}`,
      displayDate: items[0].displayDate,
    });
   
    groupedArray.push(...items);
  });

  return groupedArray;
};
  


  const groupedOrders = groupByDate(filteredFeatures,t);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const displayDate = formatDate(item?.created_at,t);
    if (item.type === 'date') {
      return (
        <Text allowFontScaling={false} style={styles.dateHeading}>
          {item.displayDate}
        </Text>
      );
    }

    const productImage =
      item?.featurelist?.thumbnail
        ? { uri: item.featurelist.thumbnail }
        : require('../../../assets/images/drone.png');

    const displayPrice =
      item?.amount != null ? `£${item.amount}` : '$0.00';
    const displayTitle = item?.featurelist?.title ?? 'Title';

    let isPurchase;

    if (item?.order_status === 'Awaiting Delivery') {
      isPurchase = false;
    } else {
      isPurchase = true;
    }

    return (
      <View style={styles.itemContainer}>
        <MyOrderCard
          infoTitle={displayTitle}
          inforTitlePrice={displayPrice}
          productImage={productImage}
          shareid={item.featurelist?.id}
          date={displayDate}
          ispurchase={isPurchase}
          //ispurchase={true}
          navigation={navigation}
          category_id={item?.featurelist?.category_id}
          profileshowinview={item?.featurelist?.profileshowinview}
          createdby={item?.featurelist?.createdby}
          isreviewadded={item?.featurelist?.isReviewGiven}
          onCancel={cancelbody => cancelOreder(cancelbody)}
          cardId={item?.id}
          orederStatus={item?.order_status}
          transaction_id={item?.transaction_id}
        />
      </View>
    );
  };

  const [orederId, setOrederId] = useState(0);
  const cancelOreder = (cancelbody: any) => {
    setOrederId(cancelbody?.orderid);
    setShowDeleteModal(true);
  }

    const [loading, setLoading] = useState<boolean>(false);
    const renderRightContent = () => {
    if (loading) {
      return (
        <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>Loading...</Text>
      );
    }
    }
  
  const handleCancelOrder = async (id: number) => {
    setShowDeleteModal(false);
    let orderId = id;
    console.log('OrederID: ', orderId);

    try {
      // Get user token
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found');
        return;
      }

      // Construct the URL
      const url = `${MAIN_URL.baseUrl}transaction/post-order-cancel`;

      const body = { orderid: orderId };
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const json = await response.json();

      console.log('CanelUrl: ', url);
      console.log('Caneljson: ', json);

      // Handle response status codes
      if (response.status === 200) {
        setLoading(false);
         displayListOfProduct(selectedCategory?.id ?? null, 1);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (json.statusCode === 401 || json.statusCode === 403) {
        // handleForceLogout();
        return;
      }
    } catch (err) {
      console.log('Error fetching sales history:', err);
    } finally {
      setLoading(false);
    }
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
            onPress={() => {
              if (Platform.OS === 'ios') {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.reset({
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
                  });
                }
              } else {
                navigation.goBack();
              }
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
          <View style={{ width: 280 }}>
            <Text
              numberOfLines={2}
              allowFontScaling={false}
              style={styles.unizyText}
            >
              {t('my_orders')}
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

        <Animated.FlatList
          data={groupedOrders}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
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
                          style={isSelected ? styles.tabtext : styles.othertext}
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
                    {t('no_orders_found')}
                  </Text>
                </View>
              </View>
            )
          }
        />
      </View>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            navigation.replace('EditProfile');
          }}
        >
          <View style={styles.overlay}>
            <BlurView
              style={{
                flex: 1,
                alignContent: 'center',
                justifyContent: 'center',
                width: '100%',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.30)',
              }}
              blurType="light"
              blurAmount={2}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
            >
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: 'rgba(0, 0, 0, 0.32)' },
                ]}
              />

              <View style={styles.popupContainer}>
                <Image
                  source={require('../../../assets/images/alerticon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text allowFontScaling={false} style={styles.mainheader1}>
                  {t('confirm_action')}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[styles.mainheader, { marginTop: 10 }]}
                >
                  {t('cancel_order_message_action')}
                </Text>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => {
                    handleCancelOrder(orederId);
                  }}
                >
                  <Text allowFontScaling={false} style={styles.loginText}>
                    {t('yes_cancel')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.loginButton1}
                  onPress={() => {
                    setShowDeleteModal(false);
                  }}
                >
                  <Text allowFontScaling={false} style={styles.loginText1}>
                    {t('cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <NewCustomToastContainer />
      {renderRightContent()}
      {/* </BackgroundWrapper> */}
      </ImageBackground>
  );
};

export default MyOrders;

const styles = StyleSheet.create({
    logo: {
    width: 64,
    height: 64,
    borderRadius: 60,
  },

    mainheader1: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  
  popupContainer: {
    width: '90%',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    overflow: 'hidden',

    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },

  mainheader: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 6,
  },

  loginButton1: {
    display: 'flex',
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'rgba(170, 169, 176, 0.56)',
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
  loginText1: {
    color: '#FFFFFF7A',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    width: '100%',
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

    overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  categoryTabsContainer: { },
  categoryTabsScrollContent: { 
    flexDirection: 'row', 
    alignItems: 'center',
    padding: 6,
    paddingHorizontal: 16,},
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

  blurButtonWrapper: {
    width: 48,
    height: 48,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
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

  dateHeading: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 500,
    marginLeft: 16,
    paddingTop:12
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
  tabtext: {
    color: '#fff', 
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14

  },
  othertext: {
    color: '#ABC7FF',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14
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
    width: '100%',
  },
  
  listContainer: {
    width: '100%',
  },
  itemContainer: {
    flex: 1,
    marginTop: 8,
    paddingHorizontal: 16,

  },
});