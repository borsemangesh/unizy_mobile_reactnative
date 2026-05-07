import React, {
  JSX,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ImageSourcePropType,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Easing,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from 'react-native';

import AnimatedReanimated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';
import { useTranslation } from 'react-i18next';

import ProductCard from '../../utils/ProductCard';
import messaging from '@react-native-firebase/messaging';
import AnimatedSlideUp from '../../utils/AnimatedSlideUp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
import TutitionCard from '../../utils/TutitionCard';
import ProfileCard from './ProfileCard';
import {
  NewCustomToastContainer,
  showToast,
} from '../../utils/component/NewCustomToastManager';
import {
  ShortCustomToastContainer,
  shortshowToast,
} from '../../utils/component/ShortCustomToastManager';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import MessagesScreen from './MessageScreen';
import { Constant } from '../../utils/Constant';
import TransactionHistoryScreen from './TransactionHistoryScreen';
import { BlurView } from '@react-native-community/blur';
import DeviceInfo from 'react-native-device-info';
import Loader from '../../utils/component/Loader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BACK_ICON from '../../../assets/images/backimg.png';
import CARDBACKGROUD_ICON from '../../../assets/images/cardbg.png';
import mylistings from '../../../assets/images/mylistingicon.png';
import mylistings1 from '../../../assets/images/favourite.png';

import homeIcon from '../../../assets/images/tab1.png';
import searchTabIcon from '../../../assets/images/tab2.png';
import addIcon from '../../../assets/images/tab3.png';
import bookmarkIcon from '../../../assets/images/tab4.png';
import profileIcon from '../../../assets/images/tab5.png';
import homeIcon1 from '../../../assets/images/filled1.png';
import searchTabIcon2 from '../../../assets/images/filled2.png';
import addIcon3 from '../../../assets/images/filled3.png';
import bookmarkIcon4 from '../../../assets/images/filled4.png';
import profileIcon5 from '../../../assets/images/filled5.png';
import SEARCHICON from '../../../assets/images/searchicon.png';
import INFO_ICON from '../../../assets/images/info_icon.png';
import ALERT_ICON from '../../../assets/images/alerticon.png';
import PRODUCTION_ICON from '../../../assets/images/producticon.png';
import NOPRODUCT_ICON from '../../../assets/images/noproduct.png';

// ─── Static tab config (defined once, outside component) ───────────────────────
const TABS = [
  { key: 'Home', icon: homeIcon, activeIcon: homeIcon1 },
  { key: 'Search', icon: searchTabIcon, activeIcon: searchTabIcon2 },
  { key: 'Add', icon: addIcon, activeIcon: addIcon3 },
  { key: 'Bookmark', icon: bookmarkIcon, activeIcon: bookmarkIcon4 },
  { key: 'Profile', icon: profileIcon, activeIcon: profileIcon5 },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// ─── Types ─────────────────────────────────────────────────────────────────────
type Product = {
  id: number;
  name: string;
  icon: ImageSourcePropType;
};

type RootStackParamList = {
  Dashboard: {
    AddScreenBackactiveTab: string;
    isNavigate: boolean;
    loginMessage: string;
    isFirsttimeLogin: boolean;
  };
};
type DashboardRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;

// ─── ProductItem (pure component, no re-render unless props change) ────────────
const ProductItem = React.memo(
  ({ navigation, item }: { navigation: any; item: Product }) => {
    const handlePress = useCallback(() => {
      if (Platform.OS === 'ios') {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'ProductDetails',
              params: { category_id: item.id, category_name: item.name },
            },
          ],
        });
      } else {
        navigation.replace(
          'ProductDetails',
          { category_id: item.id, category_name: item.name },
          { animation: 'none' },
        );
      }
    }, [navigation, item.id, item.name]);

    return (
      <TouchableOpacity onPress={handlePress}>
        <View style={styles.cardContainer}>
          <Image source={item.icon} style={styles.cardIcon} />
          <View style={styles.cardTextWrapper}>
            <Text
              allowFontScaling={false}
              style={styles.cardText}
              numberOfLines={2}
            >
              {item.name}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

// ─── AddScreenContent ──────────────────────────────────────────────────────────
const AddScreenContent = React.memo(
  ({
    navigation,
    products,
    onSetActiveTab,
  }: {
    navigation: any;
    products: any[];
    onSetActiveTab?: (tab: string) => void;
  }) => {
    const [showOnboardingPopup, setShowOnboardingPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const checkOnboardingStatus = useCallback(async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return false;
      try {
        const response = await fetch(
          `${MAIN_URL.baseUrl}transaction/account-detail`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          },
        );
        const result = await response.json();
        if (response.ok && result?.statusCode === 200) {
          return result.data?.stripeAccount?.isboardcomplete === true;
        }
        return false;
      } catch {
        return false;
      }
    }, []);

    const handleProductPress = useCallback(
      async (item: any) => {
        try {
          setLoading(true);
          const isComplete = await checkOnboardingStatus();
          if (!isComplete) {
            setShowOnboardingPopup(true);
            return;
          }
          navigation.replace(
            'AddScreen',
            { productId: item.id, productName: item.name },
            { animation: 'none' },
          );
        } catch {
          setShowOnboardingPopup(true);
        } finally {
          setLoading(false);
        }
      },
      [checkOnboardingStatus, navigation],
    );

    const handleGoToPayment = useCallback(() => {
      setShowOnboardingPopup(false);
      onSetActiveTab?.('Profile');
    }, [onSetActiveTab]);

    const renderItem = useCallback(
      ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => handleProductPress(item)}>
          <View style={styles.card}>
            <ImageBackground
              source={CARDBACKGROUD_ICON}
              style={styles.iconBackground}
            >
              <Image source={item.icon} style={styles.cardIcon1} />
            </ImageBackground>
            <View style={styles.cardTextContainer}>
              <Text allowFontScaling={false} style={styles.cardTitle}>
                {item.name}
              </Text>
              <Text allowFontScaling={false} style={styles.cardDescription}>
                {item.description}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ),
      [handleProductPress],
    );

    const separator = useCallback(() => <View style={styles.separator} />, []);

    if (loading) {
      return (
        <View style={styles.tabContent3}>
          <View style={styles.loaderCenter}>
            <Loader containerStyle={styles.loaderSmall} />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.tabContent3}>
        <Text allowFontScaling={false} style={styles.tabContentText3}>
          {t('List_product')}
        </Text>
        <AnimatedSlideUp>
          <FlatList
            data={products}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            ItemSeparatorComponent={separator}
            contentContainerStyle={styles.flatListContent}
          />
        </AnimatedSlideUp>

        <Modal
          visible={showOnboardingPopup}
          transparent
          animationType="fade"
          onRequestClose={() => setShowOnboardingPopup(false)}
        >
          <TouchableWithoutFeedback
            onPress={() => setShowOnboardingPopup(false)}
          >
            <View style={styles.overlay}>
              <BlurView
                style={styles.blurFull}
                blurType="light"
                blurAmount={10}
                reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
              >
                <View style={[StyleSheet.absoluteFill, styles.overlayDark]} />
                <View style={styles.popupContainer}>
                  <Image
                    source={ALERT_ICON}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                  <Text allowFontScaling={false} style={styles.popupMainHeader}>
                    {t('complete_payment_method')}
                  </Text>
                  <Text allowFontScaling={false} style={styles.popupSubHeader}>
                    {t('complete_onboarding')}
                  </Text>
                  <TouchableOpacity
                    style={styles.popupButton}
                    onPress={handleGoToPayment}
                  >
                    <Text
                      numberOfLines={2}
                      allowFontScaling={false}
                      style={styles.popupButtonText}
                    >
                      {t('go_payments')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    );
  },
);

// ─── Tab content wrappers (stable references, no inline JSX) ──────────────────
const SearchScreenContent = React.memo(
  ({
    navigation,
    onSalesTabChange,
  }: {
    navigation: any;
    onSalesTabChange: (v: boolean) => void;
  }) => (
    <View style={styles.flex1}>
      <TransactionHistoryScreen
        navigation={navigation}
        route={undefined}
        onSalesTabChange={onSalesTabChange}
      />
    </View>
  ),
);

const BookmarkScreenContent = React.memo(
  ({ navigation }: { navigation: any }) => (
    <View style={styles.flex1}>
      <MessagesScreen navigation={navigation} />
    </View>
  ),
);

const ProfileScreenContent = React.memo(
  ({ navigation }: { navigation: any }) => (
    <View style={styles.profileFull}>
      <ProfileCard navigation={navigation} />
    </View>
  ),
);

// ─── BlurTabBar (extracted to avoid re-render of full screen) ─────────────────
const BlurTabBar = React.memo(() => (
  <>
    {Platform.OS === 'ios' ? (
      <View style={[StyleSheet.absoluteFill, styles.blurRadius25]}>
        <BlurView
          style={[StyleSheet.absoluteFill, styles.blurOverflow]}
          blurType="light"
          blurAmount={1.3}
          reducedTransparencyFallbackColor="rgba(15,21,131,0.8)"
          overlayColor="rgba(15,21,131,0.8)"
        >
          <View style={styles.iosBlurInner} />
        </BlurView>
      </View>
    ) : (
      <View style={[StyleSheet.absoluteFill, styles.blurRadius25]}>
        <BlurView
          style={[StyleSheet.absoluteFill, styles.blurOverflow]}
          blurType="light"
          blurAmount={1.3}
          reducedTransparencyFallbackColor="rgba(15,21,131,0.05)"
          overlayColor="rgba(15,21,131,0.05)"
        >
          <View style={styles.androidBlurInner} />
        </BlurView>
      </View>
    )}
  </>
));

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const DashBoardScreen = ({ navigation }: { navigation: any }) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const route = useRoute<DashboardRouteProp>();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('Home');
  const [products, setProducts] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSalesActive, setIsSalesActive] = useState(false);
  const [isNav, setIsNav] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const tabWidth = useMemo(() => (width * 0.9) / TABS.length, [width]);

  // ── Animated values ──
  const bubbleX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(height)).current;
  const searchBartranslateY = useRef(new Animated.Value(height)).current;
  const categorytranslateY = useRef(new Animated.Value(height)).current;
  const leftItemTranslateX = useRef(new Animated.Value(-300)).current;
  const rightItemTranslateX = useRef(new Animated.Value(300)).current;
  const cardSlideupAnimation = useRef(new Animated.Value(height)).current;
  const bottomNaviationSlideupAnimation = useRef(
    new Animated.Value(height),
  ).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollY = useSharedValue(0);

  // ── Fetch categories ──
  useEffect(() => {
    setIsNav(route.params?.isNavigate);

    if (route.params?.AddScreenBackactiveTab) {
      setActiveTab(route.params.AddScreenBackactiveTab as TabKey);
    }

    const fetchCategories = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;
        const language_code =
          (await AsyncStorage.getItem('selectedLanguage')) || 'en';
        const response = await fetch(MAIN_URL.baseUrl + 'user/category', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            languagecode: language_code,
          },
        });
        const json = await response.json();
        const mapped = json.data
          .filter((cat: any) => cat.isactive)
          .map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            icon: cat.logo
              ? { uri: cat.logo }
              : PRODUCTION_ICON,
          }));
        await AsyncStorage.setItem(
          'categories',
          JSON.stringify(mapped.map((i: any) => ({ id: i.id, name: i.name }))),
        );
        setProducts(mapped);
      } catch (err) {
        console.error('Error fetching categories', err);
      }
    };

    const loadBookmarks = async () => {
      const saved = await AsyncStorage.getItem('bookmarkedIds');
      if (saved) setBookmarkedIds(JSON.parse(saved));
    };

    fetchCategories();
    loadBookmarks();
  }, [route.params?.AddScreenBackactiveTab]);

  // ── Fetch featured listings ──
  useFocusEffect(
    useCallback(() => {
      const fetchFeatures = async () => {
        try {
          const token = await AsyncStorage.getItem('userToken');
          if (!token) return;
          const language_code =
            (await AsyncStorage.getItem('selectedLanguage')) || 'en';
          const res = await fetch(MAIN_URL.baseUrl + 'category/feature-list', {
            headers: {
              Authorization: `Bearer ${token}`,
              languagecode: language_code,
            },
          });
          const json = await res.json();
          if (json.statusCode === 200) {
            setFeatures(json.data.features || []);
          } else if (json.statusCode === 401 || json.statusCode === 403) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
            });
          }
        } catch {
          // silent
        } finally {
          setIsLoading(false);
        }
      };
      fetchFeatures();
    }, [navigation]),
  );

  // ── Send device token ──
  useEffect(() => {
    const sendDeviceTokenToServer = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;
        const deviceId = await DeviceInfo.getUniqueId();
        const fcmToken = await messaging().getToken();
        await fetch(MAIN_URL.baseUrl + 'user/devicetoken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            device_token: fcmToken,
            device_type: Platform.OS,
            device_id: deviceId,
          }),
        });
      } catch (error) {
        console.error('Error sending token:', error);
      }
    };
    sendDeviceTokenToServer();
  }, []);

  // ── Entrance animation ──
  useEffect(() => {
    if (activeTab !== 'Home') return;

    if (route.params?.isNavigate) {
      if (route.params?.isFirsttimeLogin) {
        navigation.setParams({ isFirsttimeLogin: false });
        showToast(
          t(route.params?.loginMessage) || t(Constant.LOGIN_SUCCESSFUL),
          'success',
        );
      }
      setIsNav(false);
      translateY.setValue(-width);
      searchBartranslateY.setValue(-width);
      categorytranslateY.setValue(-width);
      leftItemTranslateX.setValue(-width);
      rightItemTranslateX.setValue(width);
      cardSlideupAnimation.setValue(height);
      bottomNaviationSlideupAnimation.setValue(height);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(searchBartranslateY, {
          toValue: 0,
          duration: 900,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(categorytranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(leftItemTranslateX, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rightItemTranslateX, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bottomNaviationSlideupAnimation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.stagger(
          200,
          [0, 1, 2].map(() =>
            Animated.timing(cardSlideupAnimation, {
              toValue: 0,
              duration: 900,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ),
        ),
      ]).start();
    } else if (route.params?.isNavigate === false) {
      translateY.setValue(0);
      searchBartranslateY.setValue(0);
      categorytranslateY.setValue(0);
      leftItemTranslateX.setValue(0);
      rightItemTranslateX.setValue(0);
      cardSlideupAnimation.setValue(0);
      bottomNaviationSlideupAnimation.setValue(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, route.params?.isNavigate]);

  // ── Bubble animation ──
  useEffect(() => {
    const index = TABS.findIndex(t => t.key === activeTab);
    Animated.spring(bubbleX, {
      toValue: index * tabWidth,
      friction: 6,
      tension: 20,
      useNativeDriver: true,
    }).start();
  }, [activeTab, bubbleX, tabWidth]);

  // ── Scroll handler ──
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      'worklet';
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedBlurStyle = useAnimatedStyle(() => {
    'worklet';
    return { opacity: interpolate(scrollY.value, [0, 300], [0, 9], 'clamp') };
  });

  // ── Bookmark handler ──
  const handleBookmarkPress = useCallback(
    async (productId: number) => {
      // Optimistic update
      setFeatures(prev =>
        prev.map(item =>
          item.id === productId
            ? { ...item, isbookmarked: !item.isbookmarked }
            : item,
        ),
      );
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;
        const language_code =
          (await AsyncStorage.getItem('selectedLanguage')) || 'en';
        const isCurrentlyBookmarked = bookmarkedIds.includes(productId);

        const response = await fetch(
          MAIN_URL.baseUrl + 'category/list-bookmark',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              languagecode: language_code,
            },
            body: JSON.stringify({ feature_id: productId }),
          },
        );
        if (!response.ok) throw new Error('HTTP error');
        const data = await response.json();
        if (data?.message) {
          shortshowToast(
            t(data.message),
            data.statusCode === 200 ? 'success' : 'error',
          );
        }
        const updatedBookmarks = isCurrentlyBookmarked
          ? bookmarkedIds.filter(id => id !== productId)
          : [...bookmarkedIds, productId];
        setBookmarkedIds(updatedBookmarks);
        await AsyncStorage.setItem(
          'bookmarkedIds',
          JSON.stringify(updatedBookmarks),
        );
      } catch {
        // Revert on failure
        setFeatures(prev =>
          prev.map(item =>
            item.id === productId
              ? { ...item, isbookmarked: !item.isbookmarked }
              : item,
          ),
        );
      }
    },
    [bookmarkedIds, t],
  );

  // ── Tab press handler ──
  const handleTabPress = useCallback(
    (key: TabKey) => {
      setIsNav(false);
      navigation.setParams({ isNavigate: false });
      setActiveTab(key);
    },
    [navigation],
  );

  // ── Scroll event for category pager ──
  const onCategoryScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: false,
      }),
    [scrollX],
  );

  const handleScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
    },
    [width],
  );

  // ── Category pages ──
  const categoryPages = useMemo(() => {
    if (products.length <= 6) return null;
    const pages: { left: any[]; right: any[] }[] = [];
    pages.push({ left: products.slice(0, 3), right: products.slice(3, 6) });
    let start = 3;
    while (start + 3 < products.length) {
      pages.push({
        left: products.slice(start, start + 3),
        right: products.slice(start + 3, start + 6),
      });
      start += 3;
    }
    return pages;
  }, [products]);

  // ── renderProducts ──
  const renderProducts = useCallback(() => {
    if (products.length === 0) return null;

    if (products.length <= 6) {
      const isEven = products.length % 2 === 0;
      const rows: JSX.Element[] = [];
      let startIndex = 0;

      if (!isEven) {
        rows.push(
          <Animated.View
            key={products[0].id}
            style={[
              { transform: [{ translateY: categorytranslateY }] },
              { paddingTop: insets.top * 0.1 },
            ]}
          >
            <ProductItem navigation={navigation} item={products[0]} />
          </Animated.View>,
        );
        startIndex = 1;
      }

      for (let i = startIndex; i < products.length; i += 2) {
        const rowItems = products.slice(i, i + 2);
        rows.push(
          <View style={styles.row} key={i}>
            {rowItems.map((item, index) => (
              <Animated.View
                key={item.id}
                style={{
                  flex: 1,
                  paddingTop: 2,
                  transform: [
                    {
                      translateX:
                        index === 0 ? leftItemTranslateX : rightItemTranslateX,
                    },
                  ],
                }}
              >
                <ProductItem navigation={navigation} item={item} />
              </Animated.View>
            ))}
            {rowItems.length === 1 && <View style={styles.flex1} />}
          </View>,
        );
      }
      return <View>{rows}</View>;
    }

    return (
      <View>
        <Animated.ScrollView
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onScroll={onCategoryScroll}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
        >
          {categoryPages!.map((page, pageIndex) => (
            <View key={pageIndex} style={[styles.categoryPage, { width }]}>
              <View style={styles.flex1}>
                {page.left.map(item => (
                  <Animated.View
                    key={item.id}
                    style={{
                      transform: [{ translateY: categorytranslateY }],
                      marginBottom: 4,
                    }}
                  >
                    <ProductItem navigation={navigation} item={item} />
                  </Animated.View>
                ))}
              </View>
              <View style={styles.categoryRightCol}>
                {page.right.map(item => (
                  <Animated.View
                    key={item.id}
                    style={{
                      transform: [{ translateY: categorytranslateY }],
                      marginBottom: 4,
                    }}
                  >
                    <ProductItem navigation={navigation} item={item} />
                  </Animated.View>
                ))}
              </View>
            </View>
          ))}
        </Animated.ScrollView>
        <View style={styles.stepIndicatorContainer}>
          {categoryPages!.map((_, idx) =>
            idx === activeIndex ? (
              <LinearGradient
                key={idx}
                colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0.5)']}
                style={styles.stepCircle}
              />
            ) : (
              <View
                key={idx}
                style={[styles.stepCircle, styles.inactiveStepCircle]}
              />
            ),
          )}
        </View>
      </View>
    );
  }, [
    products,
    categorytranslateY,
    leftItemTranslateX,
    rightItemTranslateX,
    navigation,
    insets.top,
    onCategoryScroll,
    handleScrollEnd,
    categoryPages,
    activeIndex,
    width,
  ]);

  // ── renderHomeContent (memoized) ──
  const homeContent = useMemo(
    () => (
      <>
        
        <View style={styles.productsWrapper}>{renderProducts()}</View>
         
        <Animated.View
          style={[
            { transform: [{ translateY: cardSlideupAnimation }] },
            styles.featuredHeader,
          ]}
        >
          <Text allowFontScaling={false} style={styles.featuredText}>
            {t('Featured_Listings')}
          </Text>
        </Animated.View>
        {isLoading ? (
          <View style={styles.emptyWrapper}>
            <Loader containerStyle={styles.loaderMedium} />
          </View>
        ) : features.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <View style={styles.emptyContainer}>
              <Image
                source={NOPRODUCT_ICON}
                style={styles.emptyImage}
                resizeMode="contain"
              />
              <Text allowFontScaling={false} style={styles.emptyText}>
                {t('No_Listings_Found')}
              </Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={features}
            horizontal
            keyExtractor={item => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            removeClippedSubviews
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={5}
            contentContainerStyle={styles.featuredScroll}
            renderItem={({ item }) => (
              <Animated.View
                style={[
                  { transform: [{ translateY: cardSlideupAnimation }] },
                  styles.featuredCard,
                ]}
              >
                {item.profileshowinview ? (
                  <TutitionCard
                    tag={item.university?.name || 'University of Warwick'}
                    title={item.title}
                    infoTitle={`${item.createdby?.firstname || ''} ${
                      item.createdby?.lastname || ''
                    }`}
                    inforTitlePrice={`£ ${item.price}`}
                    rating={item.avg_rating}
                    productImage={{ uri: item.createdby?.profile }}
                    onBookmarkPress={() => handleBookmarkPress(item.id)}
                    isBookmarked={item.isbookmarked}
                    onpress={() =>
                      navigation.navigate(
                        'SearchDetails',
                        { id: item.id },
                        { animation: 'none' },
                      )
                    }
                  />
                ) : (
                  <ProductCard
                    tag={item.university?.name || 'University of Warwick'}
                    infoTitle={item.title}
                    inforTitlePrice={`£ ${item.price}`}
                    rating={item.avg_rating}
                    productImage={{ uri: item.thumbnail }}
                    onBookmarkPress={() => handleBookmarkPress(item.id)}
                    isBookmarked={item.isbookmarked}
                    onpress={() =>
                      navigation.replace(
                        'SearchDetails',
                        { id: item.id },
                        { animation: 'none' },
                      )
                    }
                  />
                )}
              </Animated.View>
            )}
          />
          // <ScrollView
          //   directionalLockEnabled
          //   style={styles.featuredScroll}
          //   horizontal
          //   showsHorizontalScrollIndicator={false}
          //   showsVerticalScrollIndicator={false}
          // >
          //   {features.map(item => (
          //     <Animated.View
          //       key={item.id}
          //       style={[
          //         { transform: [{ translateY: cardSlideupAnimation }] },
          //         styles.featuredCard,
          //       ]}
          //     >
          //       {item.profileshowinview ? (
          //         <TutitionCard
          //           tag={item.university?.name || 'University of Warwick'}
          //           title={item.title}
          //           infoTitle={`${item.createdby?.firstname || ''} ${
          //             item.createdby?.lastname || ''
          //           }`}
          //           inforTitlePrice={`£ ${item.price}`}
          //           rating={item.avg_rating}
          //           productImage={{ uri: item.createdby?.profile }}
          //           onBookmarkPress={() => handleBookmarkPress(item.id)}
          //           isBookmarked={item.isbookmarked}
          //           onpress={() =>
          //             navigation.navigate(
          //               'SearchDetails',
          //               { id: item.id },
          //               { animation: 'none' },
          //             )
          //           }
          //         />
          //       ) : (
          //         <ProductCard
          //           tag={item.university?.name || 'University of Warwick'}
          //           infoTitle={item.title}
          //           inforTitlePrice={`£ ${item.price}`}
          //           rating={item.avg_rating}
          //           productImage={{ uri: item.thumbnail }}
          //           onBookmarkPress={() => handleBookmarkPress(item.id)}
          //           isBookmarked={item.isbookmarked}
          //           onpress={() =>
          //             navigation.replace(
          //               'SearchDetails',
          //               { id: item.id },
          //               { animation: 'none' },
          //             )
          //           }
          //         />
          //       )}
          //     </Animated.View>
          //   ))}
          // </ScrollView>
        )}
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      renderProducts,
      isLoading,
      features,
      cardSlideupAnimation,
      t,
      handleBookmarkPress,
      navigation,
    ],
  );

  // ── Navigation helpers ──
  const clicklisting = useCallback(() => {
    setIsNav(false);
    navigation.replace('MyListing', { animation: 'none' });
  }, [navigation]);

  const clickbookmark = useCallback(() => {
    setIsNav(false);
    navigation.replace('Bookmark', { animation: 'none' });
  }, [navigation]);

  const onSearchFocus = useCallback(() => {
    if (Platform.OS === 'ios') {
      navigation.replace('SearchPage', {
        animation: 'none',
        from: 'Dashboard',
      });
    } else {
      navigation.navigate('SearchPage', {
        animation: 'none',
        from: 'Dashboard',
      });
    }
  }, [navigation]);

  // ── Scrolled tabs (Search/Profile/Bookmark) ──
  const isScrolledTab =
    activeTab === 'Search' ||
    activeTab === 'Profile' ||
    activeTab === 'Bookmark';

  const tabTitle = useMemo(() => {
    switch (activeTab) {
      case 'Search':
        return t('transaction_history');
      case 'Profile':
        return t('profile');
      case 'Bookmark':
        return t('messages');
      default:
        return null;
    }
  }, [activeTab, t]);

  const scrolledTabContent = useMemo(() => {
    switch (activeTab) {
      case 'Search':
        return (
          <SearchScreenContent
            navigation={navigation}
            onSalesTabChange={setIsSalesActive}
          />
        );
      case 'Profile':
        return <ProfileScreenContent navigation={navigation} />;
      case 'Bookmark':
        return <BookmarkScreenContent navigation={navigation} />;
      default:
        return null;
    }
  }, [activeTab, navigation]);

  return (
    <ImageBackground
      source={BACK_ICON}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.fullScreenContainer}>
        {/* ── Home header ── */}
        {activeTab === 'Home' && (
          <View
            style={[
              styles.header,
              { paddingTop: Platform.OS === 'ios' ? 60 : 40 },
            ]}
          >
            <Animated.View
              style={[
                styles.headerRow,
                { transform: [{ translateY: translateY }] },
              ]}
            >
              <TouchableOpacity onPress={clicklisting}>
                <View style={styles.MylistingsBackground}>
                  <Image source={mylistings} style={styles.iconSmall} />
                </View>
              </TouchableOpacity>
              <Text allowFontScaling={false} style={styles.unizyText}>
                UniZy
              </Text>
              <TouchableOpacity onPress={clickbookmark}>
                <View style={styles.MylistingsBackground}>
                  <Image source={mylistings1} style={styles.iconSmall} />
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[
                styles.search_container,
                { transform: [{ translateY: searchBartranslateY }] },
              ]}
            >
              <Image
                source={SEARCHICON}
                style={styles.searchIcon}
              />
              <TextInput
                selectionColor="#fff"
                cursorColor="#fff"
                style={styles.searchBar}
                placeholder={t('search')}
                placeholderTextColor="#ccc"
                onChangeText={setSearch}
                value={search}
                allowFontScaling={false}
                onFocus={onSearchFocus}
              />
            </Animated.View>
          </View>
        )}

        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          {isScrolledTab ? (
            <View style={styles.flex1}>
              <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
              />
              <AnimatedReanimated.View
                style={[styles.blurHeader, animatedBlurStyle]}
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
                    blurAmount={Platform.OS === 'ios' ? 10 : 45}
                    reducedTransparencyFallbackColor="rgba(255,255,255,0.05)"
                  />
                  <LinearGradient
                    colors={[
                      'rgba(255,255,255,0.45)',
                      'rgba(255,255,255,0.02)',
                      'rgba(255,255,255,0.02)',
                    ]}
                    style={StyleSheet.absoluteFill}
                  />
                </MaskedView>
              </AnimatedReanimated.View>

              <View style={styles.tabTitleContainer}>
                <Text allowFontScaling={false} style={styles.tabTitleText}>
                  {tabTitle}
                </Text>
              </View>

              <AnimatedReanimated.ScrollView
                scrollEventThrottle={16}
                onScroll={scrollHandler}
                style={styles.scrolledTabScroll}
                contentContainerStyle={styles.scrolledTabContent}
                showsVerticalScrollIndicator={false}
              >
                {scrolledTabContent}
              </AnimatedReanimated.ScrollView>
            </View>
          ) : (
            <>
              {activeTab === 'Home' ? (
                homeContent
              ) : activeTab === 'Add' ? (
                <AddScreenContent navigation={navigation} products={products} />
              ) : null}
            </>
          )}
        </KeyboardAvoidingView>

        {/* ── Sales note banner ── */}
        {/* {activeTab === 'Search' && isSalesActive && (
          <View style={styles.textbg}>
            <BlurView
              style={[StyleSheet.absoluteFill, styles.noteBlur]}
              blurType="light"
              blurAmount={1.3}
              reducedTransparencyFallbackColor="rgba(15,21,131,0.05)"
              overlayColor="rgba(15,21,131,0.05)"
            />
            <Image
              source={require('../../../assets/images/info_icon.png')}
              style={styles.infoIcon}
            />
            <View style={styles.flex1}>
              <Text allowFontScaling={false} style={styles.importantText1}>
                {t('note')}
              </Text>
              <Text allowFontScaling={false} style={styles.importantText}>
                {t('complete_orderotp_note')}{' '}
              </Text>
            </View>
          </View>
        )} */}
        {activeTab === 'Search' && isSalesActive && (

          <View style={styles.textbg}>
           {Platform.OS === 'ios' ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { borderRadius: 10, backgroundColor: 'transparent' },
              ]}
            >
              <BlurView
                style={[
                  StyleSheet.absoluteFill,
                  {
                    borderRadius: 10,
                    backgroundColor: 'transparent',
                    overflow: 'hidden',
                  },
                ]}
                blurType="light"
                blurAmount={1.4}
                reducedTransparencyFallbackColor="rgba(15, 21, 131, 0.56)"
                overlayColor="rgba(15, 21 ,131,0.8)"
              >
                <View
                  style={{
                    opacity: Platform.OS === 'ios' ? 0.6 : 0,
                    backgroundColor: 'rgba(0, 3, 65, 0.98)',
                    width: '100%',
                    height: '100%',
                    borderRadius: 10,
                  }}
                ></View>
              </BlurView>
            </View>
          ) : (
            <>
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { borderRadius: 25, backgroundColor: 'transparent' },
                ]}
              >
                <BlurView
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      borderRadius: 25,
                      backgroundColor: 'transparent',
                      overflow: 'hidden',
                    },
                  ]}
                  blurType="light"
                  blurAmount={1.3}
                  reducedTransparencyFallbackColor="rgba(15, 21, 131, 0.05)"
                  overlayColor="rgba(15, 21, 131, 0.05)"
                >
                  <View
                    style={{
                      // opacity: Platform.OS === 'ios' ? 0.4 : 0,
                      // backgroundColor: 'rgba(0, 3, 65, 0.98)',
                      width: '100%',
                      height: '100%',
                      borderRadius: 25,
                    }}
                  ></View>
                </BlurView>
              </View>
            </>
          )}

          <Image
            source={INFO_ICON}
            style={{ width: 16, height: 16, marginRight: 8, marginTop: 2 }}
          />
          <View style={{ flex: 1 }}>
            <Text allowFontScaling={false} style={styles.importantText1}>
              {t('note')}
            </Text>

            <Text allowFontScaling={false} style={styles.importantText}>
              {t('complete_orderotp_note')}{' '}
            </Text>
          </View>
        </View>
        )}

        {/* ── Bottom tab bar ── */}
        <Animated.View
          style={[
            styles.bottomTabContainer,
            { position: 'absolute', bottom: 0 },
            { transform: [{ translateY: bottomNaviationSlideupAnimation }] },
          ]}
        >
          <BlurTabBar />
          <View style={styles.bubbleRow}>
            <Animated.View
              style={[
                styles.bubble,
                { width: tabWidth, transform: [{ translateX: bubbleX }] },
              ]}
            />
          </View>
          {TABS.map(({ key, icon, activeIcon }) => (
            <TouchableOpacity
              key={key}
              style={[styles.tabItem, { width: tabWidth }]}
              onPress={() => handleTabPress(key)}
            >
              <View style={styles.iconWrapper}>
                <Image
                  source={activeTab === key ? activeIcon : icon}
                  style={styles.tabIcon}
                />
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>

      <ShortCustomToastContainer />
      <NewCustomToastContainer />
    </ImageBackground>
  );
};

export default DashBoardScreen;

// ─── Styles ────────────────────────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  profileFull: { flex: 1, height: '100%' },
  background: { flex: 1, width: '100%', height: '100%' },
  fullScreenContainer: { flex: 1, flexDirection: 'column' },

  // Header
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  MylistingsBackground: {
    // height: 49,
    // width: 49,
    // justifyContent: 'center',
    // alignItems: 'center',
    // borderRadius: 100,
    // borderWidth: 0.3,
    // borderColor: '#ffffff11',
    // backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',
    // borderBlockStartColor: '#ffffff2e',
    // borderBlockColor: '#ffffff2e',
    // borderTopColor: '#ffffff2e',
    // borderBottomColor: '#ffffff2e',
    // borderLeftColor: '#ffffff2e',
    // borderRightColor: '#ffffff2e',

    height: 49,
    width: 49,

    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 0.3,
    borderColor: '#ffffff11',

    boxShadow:
      '0 2px 4px 0 rgba(0, 0, 0, 0.23),0px 0.90px 0px 0px rgba(255, 255, 255, 0.11) inset, 0px -0.90px 0px 0px rgba(255, 255, 255, 0.11) inset',
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
  iconSmall: { width: 25, height: 25 },
  unizyText: {
    color: '#FFFFFF',
    fontFamily: 'MonumentExtended-Regular',
    fontSize: 24,
    flex: 1,
    textAlign: 'center',
  },

  // Search
  search_container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 50,
    padding: Platform.OS === 'ios' ? 12 : 0,
    height: 50,
    gap: Platform.OS === 'ios' ? 8 : 0,

    borderColor: '#ffffff11',
    boxShadow:
      '0 2px 4px 0 rgba(0, 0, 0, 0.23),0px 0.90px 0px 0px rgba(255, 255, 255, 0.11) inset, 0px -0.90px 0px 0px rgba(255, 255, 255, 0.11) inset',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',

    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
    boxSizing: 'border-box',
  },
  searchIcon: {
    padding: Platform.OS === 'ios' ? 0 : 5,
    marginLeft: Platform.OS === 'ios' ? 0 : 10,
    marginRight: Platform.OS === 'ios' ? 0 : 6,
    height: 24,
    width: 24,
  },
  searchBar: {
    fontFamily: 'Urbanist-Medium',
    fontWeight: '500',
    fontSize: 17,
    color: '#fff',
    width: '90%',
    height: 40,
  },

  // Products
  productsWrapper: { paddingHorizontal: 12, paddingBottom: 12 },
  row: { flexDirection: 'row', width: '100%' },
  cardTextWrapper: { width: 130, paddingLeft: 9 },
  cardContainer: {
    // height: SH / 13.4,
    // flexDirection: 'row',
    // borderRadius: 15,
    // paddingHorizontal: 12,
    // alignItems: 'center',
    // marginVertical: Platform.OS === 'ios' ? 5 : 5.5,
    // marginHorizontal: Platform.OS === 'ios' ? 5 : 5.5,
    // borderWidth: 0.4,
    // backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',
    // borderTopColor: '#ffffff2e',
    // borderBottomColor: '#ffffff2e',
    // borderLeftColor: '#ffffff2e',
    // borderRightColor: '#ffffff2e',
    // borderColor: '#ffffff11',

    height: SH / 13.4,
    flexDirection: 'row',
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: Platform.OS === 'ios' ? 5 : 5.5,
    marginHorizontal: Platform.OS === 'ios' ? 5 : 5.5,
    borderWidth: 0.4,
    borderColor: '#ffffff11',

    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',

    borderEndEndRadius: 15,
    borderStartEndRadius: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomStartRadius: 15,
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',

    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
    boxSizing: 'border-box',
  },
  cardIcon: { width: 24, height: 24 },
  cardText: {
    color: '#FFF',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
  },

  // Category pager
  categoryPage: { flexDirection: 'row', padding: 10 },
  categoryRightCol: { flex: 1, paddingLeft: 2 },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  stepCircle: {
    width: 12,
    height: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  inactiveStepCircle: { borderColor: '#ffffff4e', borderRadius: 40 },

  // Featured
  featuredHeader: {
    paddingHorizontal: 20,
    paddingTop: SW * 0.01,
    paddingBottom: SW * 0.01,
  },
  featuredText: {
    color: '#FFF',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
  },
  featuredScroll: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 20,
    height: 380,
  },
  featuredCard: { paddingBottom: 12 },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 230,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: Platform.OS === 'ios' ? 290 : 300,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.3,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  emptyImage: { width: 64, height: 64 },
  emptyText: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
  },

  // Scrolled tabs
  blurHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 150 : 120,
    zIndex: 0,
  },
  tabTitleContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : 60,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 0,
  },
  tabTitleText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },
  scrolledTabScroll: { paddingTop: Platform.OS === 'ios' ? 126 : 120 },
  scrolledTabContent: { paddingBottom: 0 },

  // Add screen
  tabContent3: {
    flex: 1,
    padding: Platform.OS === 'ios' ? 16 : 20,
    paddingTop: Platform.OS === 'ios' ? '15.2%' : 50,
  },
  tabContentText3: {
    color: '#fff',
    fontSize: 20,
    marginVertical: 12,
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
  },
  card: {
    height: 94,
    flexDirection: 'row',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    flex: 1,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.14) 100%)',
  },
  cardIcon1: { width: 36, height: 36, resizeMode: 'center' },
  cardTextContainer: { flex: 1 },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    color: '#fff',
  },
  cardDescription: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 6,
    fontFamily: 'Urbanist-Medium',
    fontWeight: '500',
  },
  iconBackground: {
    width: 75,
    height: 62,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  flatListContent: { marginTop: 20 },
  separator: { height: 16 },
  loaderCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderSmall: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderMedium: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom tab
  bottomTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '91.6%',
    marginBottom: 30,
    borderRadius: 50,
    alignSelf: 'center',
    padding: 2,
    borderWidth: 0.4,
    backgroundColor: 'rgba(0,23,128,0.49)',
    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
    borderColor: '#ffffff11',
    zIndex: 100,
  },
  bubbleRow: { height: 48 },
  bubble: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.16)',
    position: 'absolute',
    left: 1,
    right: 1,
    borderWidth: 0.5,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
    borderColor: '#ffffff2e',
  },
  tabItem: {},
  iconWrapper: {
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: { width: 28, height: 28, resizeMode: 'contain' },

  // Blur helpers
  blurRadius25: { borderRadius: 25, backgroundColor: 'transparent' },
  blurOverflow: {
    borderRadius: 25,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  iosBlurInner: {
    opacity: 0.4,
    backgroundColor: 'rgba(0,3,65,0.98)',
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  androidBlurInner: { width: '100%', height: '100%', borderRadius: 25 },

  // Note banner
  // textbg: {
  //   flexDirection: 'row',
  //   alignItems: 'flex-start',
  //   padding: 6,
  //   borderWidth: 0.5,
  //   borderRadius: 10,
  //   borderTopColor: '#ffffff31',
  //   borderBottomColor: '#ffffff31',
  //   borderLeftColor: '#ffffff31',
  //   borderRightColor: '#ffffff31',
  //   borderColor: '#ffffff31',
  //   position: 'absolute',
  //   bottom: Platform.OS === 'ios' ? SH * 0.1 + 8 : SH * 0.1,
  //   left: 16,
  //   right: 16,
  //   zIndex: 999,
  // },
  noteBlur: { borderRadius: 10, overflow: 'hidden' },
  infoIcon: { width: 16, height: 16, marginRight: 8, marginTop: 2 },
  importantText: {
    color: '#FFFFFFCC',
    fontSize: 12,
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    marginBottom: 6,
  },
  importantText1: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Urbanist-Medium',
    fontWeight: '500',
  },

  // Modal
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  blurFull: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
  },
  overlayDark: { backgroundColor: 'rgba(0,0,0,0.32)' },
  popupContainer: {
    width: '85%',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  popupMainHeader: {
    color: 'rgba(255,255,255,0.80)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 28,
    textAlign: 'center',
  },
  popupSubHeader: {
    color: 'rgba(255,255,255,0.80)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 6,
  },
  popupButton: {
    width: '100%',
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.56)',
    marginTop: 20,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },
  popupButtonText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 1,
    width: '100%',
  },
  logo: { width: 64, height: 64, marginBottom: 20 },

  textbg: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    // backgroundColor:
    //   'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(25, 51, 95, 0.94) 0%, rgba(255, 255, 255, 0.10) 100%)',
    // boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
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

    position: 'absolute',
    bottom:
      Platform.OS === 'ios'
        ? Dimensions.get('window').height * 0.1 + 8
        : Dimensions.get('window').height * 0.1,
    left: 16,
    right: 16,
    borderRadius: 10,
    zIndex: 999,
  },
});

// import React, { JSX, useCallback, useEffect, useRef, useState } from 'react';
// import {
//   Image,
//   ImageBackground,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
//   ImageSourcePropType,
//   TouchableOpacity,
//   FlatList,
//   Animated,
//   Dimensions,
//   Easing,
//   Platform,
//   KeyboardAvoidingView,
//   StatusBar,
//   Modal,
//   TouchableWithoutFeedback,
//   useWindowDimensions,
// } from 'react-native';

// import AnimatedReanimated, {
//   useSharedValue,
//   useAnimatedScrollHandler,
//   useAnimatedStyle,
//   interpolate,
// } from 'react-native-reanimated';
// import MaskedView from '@react-native-masked-view/masked-view';
// import { useTranslation } from "react-i18next";

// import ProductCard from '../../utils/ProductCard';
// import messaging from "@react-native-firebase/messaging";

// import AnimatedSlideUp from '../../utils/AnimatedSlideUp';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { MAIN_URL } from '../../utils/APIConstant';
// import TutitionCard from '../../utils/TutitionCard';
// import ProfileCard from './ProfileCard';
// import { NewCustomToastContainer, showToast } from '../../utils/component/NewCustomToastManager';

// import { ShortCustomToastContainer,shortshowToast } from '../../utils/component/ShortCustomToastManager';

// import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
// import LinearGradient from 'react-native-linear-gradient';
// import MessagesScreen from './MessageScreen';
// import { Constant } from '../../utils/Constant';
// import TransactionHistoryScreen from './TransactionHistoryScreen';
// import { BlurView } from '@react-native-community/blur';
// import DeviceInfo from 'react-native-device-info';
// import Loader from '../../utils/component/Loader';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { IMAGE_URLS } from '../../utils/Style';
// import BackgroundWrapper from '../../utils/component/BackgroundWrapper';
// import COMMONSTYLE from '../../utils/CommonStyle';

// import BACK_ICON from '../../../assets/images/backimg.png';
// import CARDBACKGROUD_ICON from '../../../assets/images/cardbg.png';
// import mylistings from '../../../assets/images/mylistingicon.png';
// import mylistings1 from '../../../assets/images/favourite.png';

// import searchIcon from '../../../assets/images/searchicon.png';

// // Bottom tab icons
// import homeIcon from '../../../assets/images/tab1.png';
// import searchTabIcon from '../../../assets/images/tab2.png';
// import addIcon from '../../../assets/images/tab3.png';
// import bookmarkIcon from '../../../assets/images/tab4.png';
// import profileIcon from '../../../assets/images/tab5.png';

// import homeIcon1 from '../../../assets/images/filled1.png';
// import searchTabIcon2 from '../../../assets/images/filled2.png';
// import addIcon3 from '../../../assets/images/filled3.png';
// import bookmarkIcon4 from '../../../assets/images/filled4.png';
// import profileIcon5 from '../../../assets/images/filled5.png';

// type Product = {
//   id: number;
//   name: string;
//   icon: ImageSourcePropType;
// };

// type ProductItemProps = {
//   navigation: any;
//   item: Product;
// };

// const ProductItem: React.FC<ProductItemProps> = ({
//   navigation,
//   item,
// }) => (
//   <TouchableOpacity
//     key={item.id}
//     onPress={() => {

//       if (Platform.OS === 'ios') {
//         navigation.reset({
//           index: 0,
//           routes: [{ name: 'ProductDetails', params: { category_id: item.id, category_name: item.name } }],
//         })
//       } else {
//         navigation.replace('ProductDetails', {
//           category_id: item.id,
//           category_name: item.name,
//         }, { animation: 'none' });

//       }
//     }}
//   >
//     <View
//       style={[
//         styles.cardContainer,
//       ]}
//     >
//       <Image source={item.icon} style={styles.cardIcon} />
//       <View style={{
//         width: 130,
//         paddingLeft: 9,
//       }}>
//         <Text allowFontScaling={false} style={styles.cardText} numberOfLines={2}>
//           {item.name}
//         </Text>

//       </View>

//     </View>
//   </TouchableOpacity>
// );
// type TransactionScreenProps = {
//   navigation: any;
//   route: any;
//   onSalesTabChange?: (isSales: boolean) => void;
// };

// const SearchScreenContent = ({ navigation, onSalesTabChange }: TransactionScreenProps) => (
//   <View style={{ flex: 1 }}>
//     {/* <TransactionHistoryScreen navigation={navigation} route={undefined} /> */}
//     <TransactionHistoryScreen
//       navigation={navigation}
//       route={undefined}
//       onSalesTabChange={onSalesTabChange}
//     />
//   </View>
// );
// type AddScreenContentProps = {
//   navigation: any;
//   products: any[];
//   onSetActiveTab?: (tab: string) => void;
// };

// const AddScreenContent: React.FC<AddScreenContentProps> = ({ navigation, products, onSetActiveTab }) => {
//   const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
//   const [showOnboardingPopup, setShowOnboardingPopup] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // useEffect(() => {
//   //   const checkOnboardingStatus = async () => {
//   //     try {
//   //       const token = await AsyncStorage.getItem('userToken');
//   //       if (!token) {
//   //         setLoading(false);
//   //         return;
//   //       }

//   //       const url = `${MAIN_URL.baseUrl}transaction/account-detail`;
//   //       const response = await fetch(url, {
//   //         method: 'GET',
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //           Accept: 'application/json',

//   //         },
//   //       });

//   //       const result = await response.json();

//   //       if (response.ok && result.statusCode === 200) {
//   //         const isComplete = result.data?.stripeAccount?.isboardcomplete === true;
//   //         setIsOnboardingComplete(isComplete);
//   //       } else {
//   //         // If API fails, assume not complete
//   //         setIsOnboardingComplete(false);
//   //       }
//   //     } catch (error) {
//   //       console.error('Error checking onboarding status:', error);
//   //       setIsOnboardingComplete(false);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   checkOnboardingStatus();
//   // }, []);

//   const { t } = useTranslation();

//   // const handleProductPress = (item: any) => {

//   //   if (isOnboardingComplete === false) {

//   //     setShowOnboardingPopup(true);
//   //   } else if (isOnboardingComplete === true) {

//   //     navigation.replace('AddScreen', {
//   //       productId: item.id,
//   //       productName: item.name,
//   //     }, { animation: 'none' });
//   //   }

//   // };

//   const checkOnboardingStatus = async () => {
//   const token = await AsyncStorage.getItem('userToken');
//   if (!token) return false;

//   try {
//     const response = await fetch(
//       `${MAIN_URL.baseUrl}transaction/account-detail`,
//       {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           Accept: 'application/json',
//         },
//       }
//     );

//     const result = await response.json();

//     if (response.ok && result?.statusCode === 200) {
//       return result.data?.stripeAccount?.isboardcomplete === true;
//     }

//     return false;
//   } catch (error) {
//     console.error('Onboarding check failed:', error);
//     return false;
//   }
// };

// const handleProductPress = async (item: any) => {

//     // navigation.replace(
//     //   'AddScreen',
//     //   {
//     //     productId: item.id,
//     //     productName: item.name,
//     //   },
//     //   { animation: 'none' }
//     // );

//   try {
//     setLoading(true); // optional loader

//     const isComplete = await checkOnboardingStatus();

//     if (!isComplete) {
//       setShowOnboardingPopup(true);
//       return;
//     }

//     navigation.replace(
//       'AddScreen',
//       {
//         productId: item.id,
//         productName: item.name,
//       },
//       { animation: 'none' }
//     );
//   }
//   catch (e) {
//     console.error('Product press error:', e);
//     setShowOnboardingPopup(true); // safe fallback
//   } finally {
//     setLoading(false);
//   }
// };

//   const handleGoToPayment = () => {
//     setShowOnboardingPopup(false);
//     if (onSetActiveTab) {
//       onSetActiveTab('Profile');
//     }
//   };

//   if (loading) {
//     return (
//       <View style={[styles.tabContent3]}>

//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%',  }}>
//           <Loader
//             containerStyle={{
//               width: 50,
//               height: 50,
//               justifyContent: 'center',
//               alignItems: 'center',
//             }}
//           />
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.tabContent3}>
//       <Text allowFontScaling={false} style={[styles.tabContentText3]}>{t('List_product')}</Text>
//       <AnimatedSlideUp>
//         <FlatList
//           data={products}
//           keyExtractor={item => item.id.toString()}
//           renderItem={({ item }) => (
//             <TouchableOpacity
//               onPress={() => handleProductPress(item)}
//             >
//               <View style={styles.card}>

//                 <ImageBackground
//                   source={CARDBACKGROUD_ICON}
//                   style={styles.iconBackground}>

//                   <Image source={item.icon} style={styles.cardIcon1} />

//                 </ImageBackground>

//                 <View style={styles.cardTextContainer}>
//                   <Text allowFontScaling={false} style={styles.cardTitle}>{item.name}</Text>
//                   <Text allowFontScaling={false} style={styles.cardDescription}>{item.description}</Text>
//                 </View>
//               </View>
//             </TouchableOpacity>
//           )}
//           ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
//           contentContainerStyle={{ marginTop: 20 }}
//         />
//       </AnimatedSlideUp>

//       <Modal
//         visible={showOnboardingPopup}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setShowOnboardingPopup(false)}
//       >
//         <TouchableWithoutFeedback onPress={() => setShowOnboardingPopup(false)}>
//           <View style={styles.overlay}>
//             <BlurView
//               style={{
//                 flex: 1,
//                 alignContent: 'center',
//                 justifyContent: 'center',
//                 width: '100%',
//                 alignItems: 'center',
//               }}
//               blurType="light"
//               blurAmount={10}
//               reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
//             >
//               <View
//                 style={[
//                   StyleSheet.absoluteFill,
//                   { backgroundColor: 'rgba(0, 0, 0, 0.32)' },
//                 ]}
//               />

//               <View style={styles.popupContainer}>

//                 <Image
//                   source={require('../../../assets/images/alerticon.png')}
//                   style={styles.logo}
//                   resizeMode="contain"
//                 />
//                 <Text allowFontScaling={false} style={styles.popupMainHeader}>
//                   {t('complete_payment_method')}
//                 </Text>
//                 <Text allowFontScaling={false} style={styles.popupSubHeader}>
//                   {t('complete_onboarding')}
//                 </Text>

//                 <TouchableOpacity
//                   style={styles.popupButton}
//                   onPress={handleGoToPayment}
//                 >
//                   <Text numberOfLines={2} allowFontScaling={false} style={styles.popupButtonText}>
//                     {t('go_payments')}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </BlurView>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
//     </View>
//   );
// };

// type ChatProps = {
//   navigation: any;
// };

// const BookmarkScreenContent = ({ navigation }: ChatProps) => (
//   <View style={{ flex: 1 }}>

//     <MessagesScreen navigation={navigation} />

//   </View>
// );

// type ProfileScreenContentProps = {
//   navigation: any;
// };
// const ProfileScreenContent = ({ navigation }: ProfileScreenContentProps) => (
//   <View style={{ flex: 1 ,height: '100%'}}>
//     <ProfileCard navigation={navigation} />
//   </View>
// );

// type DashBoardScreenProps = {
//   navigation: any;
// };

// type RootStackParamList = {
//   Dashboard: {
//     AddScreenBackactiveTab: string;
//     isNavigate: boolean;
//     loginMessage: string;
//     isFirsttimeLogin: boolean;
//   }
// };
// type DashboardRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;
//   const background = require('../../../assets/images/placeholder_history.png');

// const DashBoardScreen = ({ navigation }: DashBoardScreenProps) => {

//   const { width, height } = useWindowDimensions();
//   const insets = useSafeAreaInsets();

//   const [search, setSearch] = useState('');
//   const [activeTab, setActiveTab] = useState<string>('Home');
//   // const screenWidth = Dimensions.get('window').width;
//   const tabsname = ['Home', 'Search', 'Add', 'Bookmark', 'Profile'];

//   const tabWidth = (width * 0.90) / tabsname.length;

//   const bubbleX = useRef(new Animated.Value(0)).current;

//   const [products, setProducts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [features, setFeatures] = useState<any[]>([]);
//   const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
//   const route = useRoute<DashboardRouteProp>();
//   const [isBookmarked, setIsBookmarked] = useState(false);
//   // const { width } = Dimensions.get('window');

//   const scrollViewRef = useRef<ScrollView>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const [isSalesActive, setIsSalesActive] = useState(false);

//   useEffect(() => {
//     setIsNav(route.params?.isNavigate);

//     if (route.params?.AddScreenBackactiveTab) {
//       setActiveTab(
//         route.params?.AddScreenBackactiveTab as
//         | 'Home'
//         | 'Search'
//         | 'Add'
//         | 'Bookmark'
//         | 'Profile',
//       );
//     }

//     const fetchCategories = async () => {
//       try {
//         const token = await AsyncStorage.getItem('userToken');
//         if (!token) return;
//         const language_code = await AsyncStorage.getItem('selectedLanguage') || 'en'

//         const url2 = MAIN_URL.baseUrl + 'user/category';

//         const response = await fetch(url2, {
//           method: 'GET',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//             languagecode: language_code
//           },
//         });
//         const json = await response.json();

//         const mapped = json.data
//           .filter((cat: any) => cat.isactive)
//           .map((cat: any) => ({
//             id: cat.id,
//             name: cat.name,
//             description: cat.description,
//             icon: cat.logo
//               ? { uri: cat.logo }
//               : require('../../../assets/images/producticon.png'),
//           }));

//         const idNameArray = mapped.map((item: any) => ({
//           id: item.id,
//           name: item.name,
//         }));

//         await AsyncStorage.setItem(
//           'categories',
//           JSON.stringify(idNameArray),
//         );

//         setProducts(mapped);
//       } catch (err) {
//         console.error('Error fetching categories', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCategories();

//     const loadBookmarks = async () => {
//       const saved = await AsyncStorage.getItem('bookmarkedIds');
//       if (saved) setBookmarkedIds(JSON.parse(saved));
//     };
//     loadBookmarks();
//   }, [route.params?.AddScreenBackactiveTab]);

//   useFocusEffect(
//     useCallback(() => {
//       const fetchFeatures = async () => {
//         try {
//           const token = await AsyncStorage.getItem('userToken');
//           const language_code = await AsyncStorage.getItem('selectedLanguage') || 'en'

//           if (!token) return;

//           const url1 = MAIN_URL.baseUrl + 'category/feature-list';

//           console.log(url1)

//           const res = await fetch(url1, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               languagecode: language_code
//             },
//           });

//           const json = await res.json();

//           if (json.statusCode === 200) {
//             setFeatures(json.data.features || []);
//             setIsLoading(false);
//           }
//           if (json.statusCode === 401 || json.statusCode === 403) {
//             navigation.reset({
//               index: 0,
//               routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
//             });
//           }
//         } catch (err) {

//           setIsLoading(false);
//         } finally {
//           setIsLoading(false);
//         }
//       };

//       fetchFeatures();
//     }, [])
//   );

//   useEffect(() => {
//     sendDeviceTokenToServer();
//   }, []);

//   const sendDeviceTokenToServer = async () => {
//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       if (!token) return;
//       const deviceId = await DeviceInfo.getUniqueId();
//       const url1 = MAIN_URL.baseUrl + 'user/devicetoken';

//       const fcmToken = await messaging().getToken();

//       const requestBody = {
//         device_token: fcmToken,
//         device_type: Platform.OS,
//         device_id: deviceId
//       };

//       const response = await fetch(url1, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify(requestBody),
//       });

//       if (response.ok) {

//       } else {

//       }
//     } catch (error) {
//       console.error('❌ Error sending token to server:', error);
//     }

//   };

//   const [isNav, setIsNav] = useState(true);

//   // const screenHeight = Dimensions.get('window').height;
//   const translateY = React.useRef(new Animated.Value(height)).current;
//   const searchBartranslateY = React.useRef(
//     new Animated.Value(height),
//   ).current;
//   const categorytranslateY = React.useRef(
//     new Animated.Value(height),
//   ).current;
//   const leftItemTranslateX = useRef(new Animated.Value(-300)).current;
//   const rightItemTranslateX = useRef(new Animated.Value(300)).current;
//   const cardSlideupAnimation = useRef(new Animated.Value(height)).current;
//   const bottomNaviationSlideupAnimation = useRef(
//     new Animated.Value(height),
//   ).current;

//   useEffect(() => {
//     if (activeTab === 'Home' && route.params?.isNavigate) {

//       if (route.params?.isFirsttimeLogin) {
//         navigation.setParams({ isFirsttimeLogin: false });
//         showToast(t(route.params?.loginMessage) || t(Constant.LOGIN_SUCCESSFUL), 'success');
//       }
//       setIsNav(false);
//       translateY.setValue(-width);
//       searchBartranslateY.setValue(-width);
//       categorytranslateY.setValue(-width);
//       // evenCategorytranslateX.setValue(-screenWidth);
//       leftItemTranslateX.setValue(-width);
//       rightItemTranslateX.setValue(width);
//       cardSlideupAnimation.setValue(height);
//       bottomNaviationSlideupAnimation.setValue(height);
//       Animated.timing(translateY, {
//         toValue: 0,
//         duration: 600,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }).start();

//       // Search bar animation
//       Animated.timing(searchBartranslateY, {
//         toValue: 0,
//         duration: 900,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }).start();

//       // Catagory bar animation categorytranslateY
//       Animated.timing(categorytranslateY, {
//         toValue: 0,
//         duration: 600,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }).start();
//       Animated.timing(leftItemTranslateX, {
//         toValue: 0,
//         duration: 600,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }).start();
//       Animated.timing(rightItemTranslateX, {
//         toValue: 0,
//         duration: 600,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }).start();
//       Animated.timing(bottomNaviationSlideupAnimation, {
//         toValue: 0,
//         duration: 1000,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }).start();

//       const animations = [0, 1, 2].map(i =>
//         Animated.timing(cardSlideupAnimation, {
//           toValue: 0,
//           duration: 900,
//           delay: i * 200,
//           easing: Easing.out(Easing.ease),
//           useNativeDriver: true,
//         }),
//       );
//       Animated.stagger(200, animations).start();
//     } else if (activeTab === 'Home' && route.params?.isNavigate === false) {
//       // No animation: Just reset instantly
//       translateY.setValue(0);
//       searchBartranslateY.setValue(0);
//       categorytranslateY.setValue(0);
//       leftItemTranslateX.setValue(0);
//       rightItemTranslateX.setValue(0);
//       cardSlideupAnimation.setValue(0);
//       bottomNaviationSlideupAnimation.setValue(0);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [activeTab, route.params?.isNavigate]);

//   useEffect(() => {
//     const index = ['Home', 'Search', 'Add', 'Bookmark', 'Profile'].indexOf(
//       activeTab,
//     );
//     Animated.spring(bubbleX, {
//       toValue: index * tabWidth,
//       friction: 6,
//       tension: 20,

//       useNativeDriver: true,
//     }).start();
//   }, [activeTab, bubbleX, tabWidth]);

//   const [activeIndex, setActiveIndex] = useState(0);
//   const scrollX = useRef(new Animated.Value(0)).current;

//   const renderProducts = () => {
//     const isEven = products.length % 2 === 0;
//     let startIndex = 0;
//     const rows: JSX.Element[] = [];

//     if (products.length <= 6) {

//       if (!isEven) {
//         rows.push(
//           <Animated.View
//             style={[
//               { transform: [{ translateY: categorytranslateY }] },{paddingTop: insets.top * 0.1},
//             ]}
//             key={products[0].id}
//           >
//             <ProductItem navigation={navigation} item={products[0]} />
//           </Animated.View>,
//         );
//         startIndex = 1;
//       }

//       for (let i = startIndex; i < products.length; i += 2) {
//         const rowItems = products.slice(i, i + 2);
//         rows.push(

//           <View style={styles.row} key={i}>
//             {rowItems.map((item, index) => (
//               <Animated.View
//                 key={item.id}
//                 style={{
//                   flex: 1,paddingTop: 2,
//                   transform: [
//                     {
//                       translateX:
//                         index === 0 ? leftItemTranslateX : rightItemTranslateX,
//                     },
//                   ],
//                 }}
//               >
//                 <ProductItem navigation={navigation} item={item} />
//               </Animated.View>
//             ))}

//             {rowItems.length === 1 && <View style={{ flex: 1 }} />}
//           </View>
//         );
//       }

//       return <View>{rows}</View>;
//     }

//     const createPages = (items: typeof products) => {
//       const pages = [];
//       const pageSize = 6;
//       const overlap = 3;

//       if (items.length <= pageSize) {
//         pages.push({
//           left: items.filter((_, i) => i < 3),
//           right: items.filter((_, i) => i >= 3),
//         });
//         return pages;
//       }

//       pages.push({
//         left: items.slice(0, 3),
//         right: items.slice(3, 6),
//       });

//       let start = 3;
//       while (start + overlap < items.length) {
//         const left = items.slice(start, start + overlap);
//         const right = items.slice(start + overlap, start + overlap + 3);
//         pages.push({ left, right });
//         start += 3;
//       }

//       const lastIndex = start + overlap;
//       if (lastIndex < items.length) {
//         const left = items.slice(start, start + overlap);
//         const right = items.slice(start + overlap);
//         pages.push({ left, right });
//       }

//       return pages;
//     };

//     const pages = createPages(products);

//     let secondPageLeft: typeof products = [];
//     let secondPageRight: typeof products = [];
//     if (products.length > 6) {
//       secondPageLeft = products.slice(3, 6);
//       secondPageRight = products.slice(6);
//     }

//     const rightRows: (typeof products[0] | null)[] = [];
//     if (secondPageRight.length > 0) {
//       const rowsCount = secondPageLeft.length;
//       for (let i = 0; i < rowsCount; i++) {
//         rightRows.push(secondPageRight[i] || null);
//       }
//     }

//     const onScroll = Animated.event(
//       [{ nativeEvent: { contentOffset: { x: scrollX } } }],
//       { useNativeDriver: false }
//     );

//     const handleScrollEnd = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
//       const index = Math.round(e.nativeEvent.contentOffset.x / width);
//       setActiveIndex(index);
//     };

//     return (
//       <View>
//         <Animated.ScrollView
//           horizontal
//           pagingEnabled={false}
//           showsVerticalScrollIndicator={false}
//           showsHorizontalScrollIndicator={false}
//           onScroll={onScroll}
//           onMomentumScrollEnd={handleScrollEnd}
//           scrollEventThrottle={16}
//         >
//           {pages.map((page, pageIndex) => (
//             <View key={pageIndex} style={{ width, flexDirection: 'row', padding: 10 }}>
//               <View style={{ flex: 1 }}>
//                 {page.left.map(item => (
//                   <Animated.View
//                     key={item.id}
//                     style={{ transform: [{ translateY: categorytranslateY }], marginBottom: 4 }}
//                   >
//                     <ProductItem navigation={navigation} item={item} />
//                   </Animated.View>
//                 ))}
//               </View>
//               <View style={{ flex: 1, paddingLeft: 2}}>
//                 {page.right.map(item => (
//                   <Animated.View
//                     key={item.id}
//                     style={{ transform: [{ translateY: categorytranslateY }], marginBottom: 4 }}
//                   >
//                     <ProductItem navigation={navigation} item={item} />
//                   </Animated.View>
//                 ))}
//               </View>
//             </View>
//           ))}
//         </Animated.ScrollView>

//         <View style={styles.stepIndicatorContainer}>
//           {pages.map((_, idx) =>
//             idx === activeIndex ? (
//               <LinearGradient
//                 key={idx}
//                 colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0.5)']}
//                 style={styles.stepCircle}
//               />
//             ) : (
//               <View
//                 key={idx}
//                 style={[styles.stepCircle, styles.inactiveStepCircle]}
//               />
//             )
//           )}
//         </View>
//       </View>
//     );

//   };

//   const handleBookmarkPress = async (productId: number) => {
//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       const language_code = await AsyncStorage.getItem('selectedLanguage') || 'en'
//       if (!token) return;

//       setFeatures(prev =>
//         prev.map(item =>
//           item.id === productId
//             ? { ...item, isbookmarked: !item.isbookmarked }
//             : item
//         )
//       );

//       const isCurrentlyBookmarked = bookmarkedIds.includes(productId);

//       const url = MAIN_URL.baseUrl + 'category/list-bookmark';
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//           languagecode: language_code
//         },
//         body: JSON.stringify({ feature_id: productId }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();

//       if (data?.message) {
//         //showToast(t(data.message), data.statusCode === 200 ? 'success' : 'error');
//         shortshowToast(t(data.message), data.statusCode === 200 ? 'success' : 'error');
//       }

//       let updatedBookmarks;
//       if (isCurrentlyBookmarked) {
//         updatedBookmarks = bookmarkedIds.filter(id => id !== productId);
//       } else {
//         updatedBookmarks = [...bookmarkedIds, productId];
//       }

//       setBookmarkedIds(updatedBookmarks);
//       await AsyncStorage.setItem('bookmarkedIds', JSON.stringify(updatedBookmarks));
//     } catch (error) {
//       console.error('Bookmark error:', error);

//       setFeatures(prev =>
//         prev.map(item =>
//           item.id === productId
//             ? { ...item, isbookmarked: !item.isbookmarked }
//             : item
//         )
//       );
//     }
//   };

//   const renderActiveTabContent = () => {
//     switch (activeTab) {
//       case 'Home':
//         return (
//           <>
//             <View style={styles.productsWrapper}>{renderProducts()}</View>

//             <Animated.View
//               style={[{
//                 transform: [{ translateY: cardSlideupAnimation }],
//               }, { paddingHorizontal: 20, paddingTop: Dimensions.get('window').width *0.01, paddingBottom: Dimensions.get('window').width * 0.01 }]}
//             >
//               <Text allowFontScaling={false} style={styles.featuredText}>
//                 {t('Featured_Listings')}
//               </Text>
//             </Animated.View>
//             {isLoading ? (
//               <View style={styles.emptyWrapper}>
//                 <Loader
//                   containerStyle={{
//                     width: 100,
//                     height: 100,
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                   }}
//                 />
//               </View>
//             ) : features.length === 0 ? (
//               <View style={styles.emptyWrapper}>
//                 <View style={styles.emptyContainer}>
//                   <Image
//                     source={require('../../../assets/images/noproduct.png')}
//                     style={styles.emptyImage}
//                     resizeMode="contain"
//                   />
//                   <Text allowFontScaling={false} style={styles.emptyText}>
//                     {t('No_Listings_Found')}
//                   </Text>
//                 </View>
//               </View>
//             ) : (
//               <ScrollView
//                 directionalLockEnabled
//                 style={{ paddingHorizontal:  10, paddingTop: 6, paddingBottom: 20,height: 380}}
//                 horizontal
//                 showsVerticalScrollIndicator={false}
//                 showsHorizontalScrollIndicator={false}
//               >
//                 {features.map(item => (
//                   <Animated.View
//                     key={item.id}
//                     style={[{ transform: [{ translateY: cardSlideupAnimation }] },{paddingBottom: 12}]}
//                   >
//                     {item.profileshowinview ? (
//                       <TutitionCard
//                         tag={item.university?.name || 'University of Warwick'}
//                         title={item.title}
//                         infoTitle={`${item.createdby?.firstname || ''} ${item.createdby?.lastname || ''
//                           }`}
//                         inforTitlePrice={`£ ${item.price}`}
//                         rating={item.avg_rating}
//                         productImage={{ uri: item.createdby?.profile }}
//                         onBookmarkPress={() => handleBookmarkPress(item.id)}
//                         isBookmarked={item.isbookmarked}
//                         onpress={() => {
//                           navigation.navigate(
//                             'SearchDetails',
//                             { id: item.id },
//                             { animation: 'none' },
//                           );
//                         }}
//                       />
//                     ) : (
//                       <ProductCard
//                         tag={item.university?.name || 'University of Warwick'}
//                         infoTitle={item.title}
//                         inforTitlePrice={`£ ${item.price}`}
//                         rating={item.avg_rating}
//                         productImage={{ uri: item.thumbnail }}
//                         onBookmarkPress={() => handleBookmarkPress(item.id)}
//                         isBookmarked={item.isbookmarked}
//                         onpress={() => {
//                           navigation.replace(
//                             'SearchDetails',
//                             { id: item.id },
//                             { animation: 'none' },
//                           );
//                         }}
//                       />
//                     )}
//                   </Animated.View>
//                 ))}
//               </ScrollView>
//             )}
//           </>
//         );
//       case 'Search': return <SearchScreenContent navigation={navigation} route={""}  onSalesTabChange={(isSales: boolean) => {
//     setIsSalesActive(isSales);
//   }}/>
//       case 'Add':
//         return <AddScreenContent navigation={navigation} products={products} onSetActiveTab={setActiveTab} />;
//       case 'Bookmark':
//         return <BookmarkScreenContent navigation={navigation} />;
//       case 'Profile':
//         return <ProfileScreenContent navigation={navigation} />;
//       default:
//         return null;
//     }
//   };

//   // const tabs = [
//   //   { key: 'Home', icon: IMAGE_URLS.HOME_ICON, activeIcon: IMAGE_URLS.homeIcon1 },
//   //   { key: 'Search', icon: IMAGE_URLS.SEARCJTABICON_ICON, activeIcon: IMAGE_URLS.searchTabIcon2 },
//   //   { key: 'Add', icon: IMAGE_URLS.ADD_ICON, activeIcon: IMAGE_URLS.addIcon3 },
//   //   { key: 'Bookmark', icon: IMAGE_URLS.BOOLMARK_ICON, activeIcon: IMAGE_URLS.bookmarkIcon4 },
//   //   { key: 'Profile', icon: IMAGE_URLS.PROFILE_ICON, activeIcon: IMAGE_URLS.profileIcon5 },
//   // ];

//     const tabs = [
//     { key: 'Home', icon: homeIcon, activeIcon: homeIcon1 },
//     { key: 'Search', icon: searchTabIcon, activeIcon: searchTabIcon2 },
//     { key: 'Add', icon: addIcon, activeIcon: addIcon3 },
//     { key: 'Bookmark', icon: bookmarkIcon, activeIcon: bookmarkIcon4 },
//     { key: 'Profile', icon: profileIcon, activeIcon: profileIcon5 },
//   ];

//   const clickbookmark = () => {
//     setIsNav(false);
//     navigation.replace('Bookmark', { animation: 'none' });
//   };
//   const clicklisting = async () => {
//     setIsNav(false);
//      navigation.replace('MyListing', { animation: 'none' });
//     //  navigation.replace('OnboardingScreen', { animation: 'none' });
//     //  navigation.replace('SellerInfoHomeSearch', { animation: 'none' });
//     //  navigation.replace('MyListingNew', { animation: 'none' });

//   };

//   const scrollY = useSharedValue(0);

//   const scrollHandler = useAnimatedScrollHandler({
//     onScroll: event => {
//       'worklet';
//       scrollY.value = event.contentOffset.y;
//     },
//   });

//   const animatedBlurStyle = useAnimatedStyle(() => {
//     'worklet';
//     const opacity = interpolate(scrollY.value, [0, 300], [0, 9], 'clamp');
//     return { opacity };
//   });

//   const { t } = useTranslation();

//   return (
//     // <BackgroundWrapper>
//     <ImageBackground
//       source={BACK_ICON}
//       style={{ flex: 1, width: '100%', height: '100%' }}
//       resizeMode="cover"
//     >
//       <View style={styles.fullScreenContainer}>
//         {activeTab === 'Home' && (
//           <View
//             style={[
//               styles.header,
//               {
//                 paddingTop: Platform.OS === 'ios' ? 60 : 40,
//                 gap: 16,
//                 paddingHorizontal: 16,
//               },
//             ]}
//           >
//             <Animated.View
//               style={[
//                 styles.headerRow,
//                 { transform: [{ translateY: translateY }] },
//               ]}
//             >
//               <TouchableOpacity
//                 onPress={() => {
//                   clicklisting();
//                 }}
//               >
//                 <View style={styles.MylistingsBackground}>
//                   <Image
//                     source={mylistings}
//                     style={styles.iconSmall}
//                   />
//                 </View>
//               </TouchableOpacity>

//               <Text allowFontScaling={false} style={styles.unizyText}>
//                 UniZy
//               </Text>

//               <TouchableOpacity onPress={clickbookmark}>
//                 <View style={styles.MylistingsBackground}>
//                   <Image
//                     source={mylistings1}
//                     style={styles.iconSmall}
//                   />
//                 </View>
//               </TouchableOpacity>
//             </Animated.View>

//             <Animated.View
//               style={[
//                 styles.search_container,
//                 { transform: [{ translateY: searchBartranslateY }] },
//               ]}
//             >
//               <Image
//                 source={require('../../../assets/images/searchicon.png')}
//                 style={styles.searchIcon}
//               />
//               <TextInput
//                 selectionColor="#fff"
//                 cursorColor="#fff"
//                 style={styles.searchBar}
//                 placeholder={t('search')}
//                 placeholderTextColor="#ccc"
//                 onChangeText={setSearch}
//                 value={search}
//                 allowFontScaling={false}
//                 onFocus={() => {
//                   if (Platform.OS === 'ios') {
//                     navigation.replace('SearchPage', {
//                       animation: 'none',
//                       from: 'Dashboard',
//                     });
//                   } else {
//                     navigation.navigate('SearchPage', {
//                       animation: 'none',
//                       from: 'Dashboard',
//                     });
//                   }
//                 }}
//               />
//             </Animated.View>
//           </View>
//         )}

//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//           keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
//         >
//           {activeTab === 'Search' ||
//           activeTab === 'Profile' ||
//           activeTab === 'Bookmark' ? (
//             <View style={{ flex: 1 }}>
//               <StatusBar
//                 translucent
//                 backgroundColor="transparent"
//                 barStyle="light-content"
//               />

//               <AnimatedReanimated.View
//                 style={[
//                   {
//                     position: 'absolute',
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     height: Platform.OS === 'ios' ? 150 : 120,
//                     zIndex: 0,
//                   },
//                   animatedBlurStyle,
//                 ]}
//                 pointerEvents="none"
//               >
//                 <MaskedView
//                   style={StyleSheet.absoluteFill}
//                   maskElement={
//                     <LinearGradient
//                       colors={['rgba(0,0,0,1)', 'rgba(0,0,0,0)']}
//                       locations={[0, 0.8]}
//                       start={{ x: 0, y: 0 }}
//                       end={{ x: 0, y: 1 }}
//                       style={StyleSheet.absoluteFill}
//                     />
//                   }
//                 >
//                   <BlurView
//                     style={StyleSheet.absoluteFill}
//                     blurType={Platform.OS === 'ios' ? 'prominent' : 'light'}
//                     blurAmount={Platform.OS === 'ios' ? 10 : 45}
//                     reducedTransparencyFallbackColor="rgba(255,255,255,0.05)"
//                   />
//                   <LinearGradient
//                     colors={[
//                       'rgba(255,255,255,0.45)',
//                       'rgba(255,255,255,0.02)',
//                       'rgba(255,255,255,0.02)',
//                     ]}
//                     style={StyleSheet.absoluteFill}
//                   />
//                 </MaskedView>
//               </AnimatedReanimated.View>
//               <View
//                 style={{
//                   position: 'absolute',
//                   top: Platform.OS === 'ios' ? 70 : 60,
//                   width: '100%',
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   paddingHorizontal: 16,
//                   zIndex: 0,
//                 }}
//               >
//                 <Text
//                   allowFontScaling={false}
//                   style={{
//                     color: '#fff',
//                     fontSize: 20,
//                     fontWeight: '600',
//                     fontFamily: 'Urbanist-SemiBold',
//                   }}
//                 >
//                   {activeTab === 'Search'
//                     ? t('transaction_history')
//                     : activeTab === 'Profile'
//                     ? t('profile')
//                     : activeTab === 'Bookmark'
//                     ? t('messages')
//                     : activeTab === 'Add'
//                     ? t('settings')
//                     : null}
//                 </Text>
//               </View>
//               <AnimatedReanimated.ScrollView
//                 scrollEventThrottle={16}
//                 onScroll={scrollHandler}
//                 style={{
//                   // flex: 1,
//                   paddingTop: Platform.OS === 'ios' ? 126 : 120,
//                 }}
//                 contentContainerStyle={{
//                   paddingBottom: 0,
//                 }}
//                 showsVerticalScrollIndicator={false}
//               >
//                 {activeTab === 'Search' ? (
//                   <SearchScreenContent
//                     navigation={navigation}
//                     route={''}
//                     onSalesTabChange={(isSales: boolean) => {
//                       setIsSalesActive(isSales);
//                     }}
//                   />
//                 ) : activeTab === 'Profile' ? (
//                   <ProfileScreenContent navigation={navigation} />
//                 ) : activeTab === 'Bookmark' ? (
//                   <BookmarkScreenContent navigation={navigation} />
//                 ) : null}
//               </AnimatedReanimated.ScrollView>
//             </View>
//           ) : (
//             // <ScrollView
//             //   style={{ flex: 1}}
//             //   contentContainerStyle={{ paddingBottom: 20 }}
//             //   showsVerticalScrollIndicator={false}

//             // >
//             <>{renderActiveTabContent()}</>
//             // </ScrollView>
//           )}
//         </KeyboardAvoidingView>
//         {activeTab === 'Search' && isSalesActive && (

//           <View style={styles.textbg}>
//            {Platform.OS === 'ios' ? (
//             <View
//               style={[
//                 StyleSheet.absoluteFill,
//                 { borderRadius: 10, backgroundColor: 'transparent' },
//               ]}
//             >
//               <BlurView
//                 style={[
//                   StyleSheet.absoluteFill,
//                   {
//                     borderRadius: 10,
//                     backgroundColor: 'transparent',
//                     overflow: 'hidden',
//                   },
//                 ]}
//                 blurType="light"
//                 blurAmount={1.3}
//                 reducedTransparencyFallbackColor="rgba(15, 21 ,131,0.8)"
//                 overlayColor="rgba(15, 21 ,131,0.8)"
//               >
//                 <View
//                   style={{
//                     opacity: Platform.OS === 'ios' ? 0.4 : 0,
//                     backgroundColor: 'rgba(0, 3, 65, 0.98)',
//                     width: '100%',
//                     height: '100%',
//                     borderRadius: 10,
//                   }}
//                 ></View>
//               </BlurView>
//             </View>
//           ) : (
//             <>
//               <View
//                 style={[
//                   StyleSheet.absoluteFill,
//                   { borderRadius: 25, backgroundColor: 'transparent' },
//                 ]}
//               >
//                 <BlurView
//                   style={[
//                     StyleSheet.absoluteFill,
//                     {
//                       borderRadius: 25,
//                       backgroundColor: 'transparent',
//                       overflow: 'hidden',
//                     },
//                   ]}
//                   blurType="light"
//                   blurAmount={1.3}
//                   reducedTransparencyFallbackColor="rgba(15, 21, 131, 0.05)"
//                   overlayColor="rgba(15, 21, 131, 0.05)"
//                 >
//                   <View
//                     style={{
//                       // opacity: Platform.OS === 'ios' ? 0.4 : 0,
//                       // backgroundColor: 'rgba(0, 3, 65, 0.98)',
//                       width: '100%',
//                       height: '100%',
//                       borderRadius: 25,
//                     }}
//                   ></View>
//                 </BlurView>
//               </View>
//             </>
//           )}

//           <Image
//             source={require('../../../assets/images/info_icon.png')}
//             style={{ width: 16, height: 16, marginRight: 8, marginTop: 2 }}
//           />
//           <View style={{ flex: 1 }}>
//             <Text allowFontScaling={false} style={styles.importantText1}>
//               {t('note')}
//             </Text>

//             <Text allowFontScaling={false} style={styles.importantText}>
//               {t('complete_orderotp_note')}{' '}
//             </Text>
//           </View>
//         </View>
//         )}

//         <Animated.View
//           style={[
//             styles.bottomTabContainer,
//             { position: 'absolute', bottom: 0 },
//             { transform: [{ translateY: bottomNaviationSlideupAnimation }] },
//           ]}
//         >
//           {Platform.OS === 'ios' ? (
//             <View
//               style={[
//                 StyleSheet.absoluteFill,
//                 { borderRadius: 25, backgroundColor: 'transparent' },
//               ]}
//             >
//               <BlurView
//                 style={[
//                   StyleSheet.absoluteFill,
//                   {
//                     borderRadius: 25,
//                     backgroundColor: 'transparent',
//                     overflow: 'hidden',
//                   },
//                 ]}
//                 blurType="light"
//                 blurAmount={1.3}
//                 reducedTransparencyFallbackColor="rgba(15, 21 ,131,0.8)"
//                 overlayColor="rgba(15, 21 ,131,0.8)"
//               >
//                 <View
//                   style={{
//                     opacity: Platform.OS === 'ios' ? 0.4 : 0,
//                     backgroundColor: 'rgba(0, 3, 65, 0.98)',
//                     width: '100%',
//                     height: '100%',
//                     borderRadius: 25,
//                   }}
//                 ></View>
//               </BlurView>
//             </View>
//           ) : (
//             <>
//               <View
//                 style={[
//                   StyleSheet.absoluteFill,
//                   { borderRadius: 25, backgroundColor: 'transparent' },
//                 ]}
//               >
//                 <BlurView
//                   style={[
//                     StyleSheet.absoluteFill,
//                     {
//                       borderRadius: 25,
//                       backgroundColor: 'transparent',
//                       overflow: 'hidden',
//                     },
//                   ]}
//                   blurType="light"
//                   blurAmount={1.3}
//                   reducedTransparencyFallbackColor="rgba(15, 21, 131, 0.05)"
//                   overlayColor="rgba(15, 21, 131, 0.05)"
//                 >
//                   <View
//                     style={{
//                       // opacity: Platform.OS === 'ios' ? 0.4 : 0,
//                       // backgroundColor: 'rgba(0, 3, 65, 0.98)',
//                       width: '100%',
//                       height: '100%',
//                       borderRadius: 25,
//                     }}
//                   ></View>
//                 </BlurView>
//               </View>
//             </>
//           )}

//           <View style={[{ height: 48 }]}>
//             <Animated.View
//               style={[
//                 styles.bubble,
//                 {
//                   width: tabWidth,
//                   transform: [{ translateX: bubbleX }],
//                 },
//               ]}
//             />
//           </View>

//           {tabs.map(({ key, icon, activeIcon }) => (
//             <TouchableOpacity
//               key={key}
//               style={[styles.tabItem, { width: tabWidth }]}
//               onPress={() => {
//                 setIsNav(false);
//                 navigation.setParams({ isNavigate: false });
//                 setActiveTab(key as any);
//               }}
//             >
//               <View style={styles.iconWrapper}>
//                 <Image
//                   source={activeTab === key ? activeIcon : icon}
//                   style={styles.tabIcon}
//                 />
//               </View>
//             </TouchableOpacity>
//           ))}
//         </Animated.View>
//       </View>
//       <ShortCustomToastContainer />
//       <NewCustomToastContainer />
//     </ImageBackground>
//     // </BackgroundWrapper>
//   );
// };
// //
// export default DashBoardScreen;

// const styles = StyleSheet.create({

//     textbg: {
//     flexDirection: 'row',
//       alignItems: 'flex-start',
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
//     // backgroundColor:
//     //   'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(25, 51, 95, 0.94) 0%, rgba(255, 255, 255, 0.10) 100%)',
//     // boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
//     padding: 6,
//     borderWidth: 0.5,
//     borderEndEndRadius: 12,
//     borderStartEndRadius: 12,
//     borderTopLeftRadius: 12,
//     borderTopRightRadius: 12,
//     borderBottomStartRadius: 12,
//     borderBlockStartColor: '#ffffff31',
//     borderBlockColor: '#ffffff31',
//     borderTopColor: '#ffffff31',
//     borderBottomColor: '#ffffff31',
//     borderLeftColor: '#ffffff31',
//     borderRightColor: '#ffffff31',

//     position: 'absolute',
//     bottom: Platform.OS === 'ios' ? Dimensions.get('window').height * 0.1 +8 :  Dimensions.get('window').height * 0.1,
//   left: 16,
//   right: 16,
//   borderRadius: 10,
//   zIndex: 999,

//   },
//   importantText: {
//     ...COMMONSTYLE.FONTFAMILY_REGULAR,
//     ...COMMONSTYLE.FONTWEIGHT_400,
//     ...COMMONSTYLE.FONT_12,
//     color: '#FFFFFFCC',
//     marginBottom: 6,
//   },
//   importantText1: {
//     ...COMMONSTYLE.FONTFAMILY_MEDIUM,
//     ...COMMONSTYLE.FONT_12,
//     ...COMMONSTYLE.FONTWEIGHT_500,
//     color: '#FFFFFF',
//   },
//   stepCircle: {
//     width: 12,
//     height: 12,
//     borderRadius: 16,
//     backgroundColor: 'rgba(255, 255, 255, 0.3)',
//   },

//   stepIndicatorContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 6,
//     marginTop: 12
//   },

//   inactiveStepCircle: {
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
//     width: 12,
//     height: 12,
//     flexShrink: 0,
//     borderColor: '#ffffff4e',
//     alignItems: 'center',
//     borderRadius: 40,
//     justifyContent: 'center',
//     boxShadow: '0 0.833px 3.333px 0 rgba(0, 0, 0, 0.25);',
//     shadowColor: '0 0.833px 3.333px rgba(0, 0, 0, 0.25)',
//   },
//   search_container: {
//     display: 'flex',
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'stretch',
//     borderRadius: 50,
//     padding: (Platform.OS === 'ios' ? 12 : 0),
//     height: 50,
//     gap: (Platform.OS === 'ios' ? 8 : 0),

//     borderColor: '#ffffff11',
//     boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23),0px 0.90px 0px 0px rgba(255, 255, 255, 0.11) inset, 0px -0.90px 0px 0px rgba(255, 255, 255, 0.11) inset',
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.10) 100%)',
//     borderBlockStartColor: '#ffffff2e',
//     borderBlockColor: '#ffffff2e',

//     borderTopColor: '#ffffff2e',
//     borderBottomColor: '#ffffff2e',
//     borderLeftColor: '#ffffff2e',
//     borderRightColor: '#ffffff2e',
//     boxSizing: 'border-box',

//   },
//   searchIcon: {
//     padding: (Platform.OS === 'ios' ? 0 : 5),
//     marginLeft: (Platform.OS === 'ios' ? 0 : 10),
//     marginRight: (Platform.OS === 'ios' ? 0 : 6),
//     height: 24,
//     width: 24,
//   },
//   searchBar: {
//     fontFamily: 'Urbanist-Medium',
//     // marginLeft: -5,
//     fontWeight: 500,
//     fontSize: 17,
//     color: '#fff',
//     width: '90%',
//     height: 40,
//   },

//   bottomTabContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '91.6%',
//     marginBottom: Platform.OS === 'ios' ? 30 : 30,
//     borderRadius: 50,
//     alignSelf: 'center',
//     padding: 2,
//     borderWidth: 0.4,
//     borderColor: '#ffffff11',
//     boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
//     backgroundColor: 'rgba(0, 23, 128, 0.49)',

//     borderEndEndRadius: 50,
//     borderStartEndRadius: 50,
//     borderTopLeftRadius: 50,
//     borderTopRightRadius: 50,
//     borderBottomStartRadius: 50,
//     borderBlockStartColor: '#ffffff2e',
//     borderBlockColor: '#ffffff2e',
//     borderTopColor: '#ffffff2e',
//     borderBottomColor: '#ffffff2e',
//     borderLeftColor: '#ffffff2e',
//     borderRightColor: '#ffffff2e',

//     boxSizing: 'border-box',
//     zIndex: 100,
//   },
//   tabItem: {
//   },
//   iconWrapper: {
//     height: 50,
//     borderRadius: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   tabIcon: {
//     width: 28,
//     height: 28,
//     resizeMode: 'contain',
//   },
//   bubble: {
//     height: '100%',
//     backgroundColor: 'rgba(255, 255, 255, 0.16)',
//     boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.18)',
//     position: 'absolute',

//     justifyContent: 'center',
//     alignItems: 'center',

//     left: 1,
//     right: 1,
//     borderWidth: 0.5,
//     borderColor: '#ffffff2e',

//     borderTopLeftRadius: 50,
//     borderBottomLeftRadius: 50,
//     borderTopRightRadius: 50,
//     borderBottomRightRadius: 50,

//     borderBlockStartColor: '#ffffff2e',
//     borderBlockColor: '#ffffff2e',

//     borderTopColor: '#ffffff2e',
//     borderBottomColor: '#ffffff2e',
//     borderLeftColor: '#ffffff2e',
//     borderRightColor: '#ffffff2e',
//   },

//   fullScreenContainer: {
//     flex: 1,
//     flexDirection: 'column',
//   },

//   header: {
//     flexDirection: 'column',
//     alignItems: 'center',
//     paddingTop: 16,
//     paddingBottom: 6
//   },
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   MylistingsBackground: {
//     height: 49,
//     width: 49,

//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 100,
//     borderWidth: 0.3,
//     borderColor: '#ffffff11',

//     boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23),0px 0.90px 0px 0px rgba(255, 255, 255, 0.11) inset, 0px -0.90px 0px 0px rgba(255, 255, 255, 0.11) inset',
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',

//     borderBlockStartColor: '#ffffff2e',
//     borderBlockColor: '#ffffff2e',

//     borderTopColor: '#ffffff2e',
//     borderBottomColor: '#ffffff2e',
//     borderLeftColor: '#ffffff2e',
//     borderRightColor: '#ffffff2e',
//     boxSizing: 'border-box',
//   },
//   iconSmall: {
//     width: 25,
//     height: 25,
//   },
//   unizyText: {
//     color: '#FFFFFF',
//     fontFamily: 'MonumentExtended-Regular',
//     fontSize: 24,
//     flex: 1,
//     textAlign: 'center',

//   },

//   productsWrapper: {
//     flexDirection: 'column',
//     // paddingHorizontal: 12,
//     // marginHorizontal:1
//     paddingHorizontal: 12,
//     paddingBottom: 12,
//   },

//   row: {
//     flexDirection: 'row',
//     width: '100%',
//   },

//   cardContainer: {
//     // height: 64,
//     height: Dimensions.get("window").height /13.4,
//     flexDirection: 'row',
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     alignItems: 'center',
//     marginVertical:(Platform.OS === 'ios' ? 5 : 5.5),
//     marginHorizontal: (Platform.OS === 'ios' ? 5 : 5.5),
//     borderWidth: 0.4,
//     borderColor: '#ffffff11',

//     boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',

//     borderEndEndRadius: 15,
//     borderStartEndRadius: 15,
//     borderTopLeftRadius: 15,
//     borderTopRightRadius: 15,
//     borderBottomStartRadius: 15,
//     borderBlockStartColor: '#ffffff2e',
//     borderBlockColor: '#ffffff2e',

//     borderTopColor: '#ffffff2e',
//     borderBottomColor: '#ffffff2e',
//     borderLeftColor: '#ffffff2e',
//     borderRightColor: '#ffffff2e',
//     boxSizing: 'border-box',

//   },

//   cardIcon: {
//     width: 24,
//     height: 24,
//   },
//   cardText: {
//     color: '#FFF',
//     fontFamily: 'Urbanist-SemiBold',
//     fontSize: 16,
//     fontWeight: '600',
//   },

//   featuredText: {
//     color: '#FFF',
//     fontFamily: 'Urbanist-SemiBold',
//     fontSize: 20,
//     fontWeight: '600',
//   },

//   tabContent3: {
//     flex: 1,
//     padding: (Platform.OS === 'ios' ? 16 : 20),
//     paddingTop: Platform.OS === 'ios' ? '15.2%' : 50,

//   },
//   tabContentText3: {
//     color: '#fff',
//     fontSize: 20,
//     marginVertical: 12,
//     textAlign: 'center',
//     fontFamily: 'Urbanist-SemiBold',
//     fontWeight: 600,
//   },

//   card: {
//     height: 94,
//     flexDirection: 'row',
//     borderRadius: 24,
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flex: 1,
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.14) 100%)',
//   },
//   cardIcon1: {
//     width: 36,
//     height: 36,
//     resizeMode: 'center',
//   },
//   cardTextContainer: {
//     flex: 1,
//   },
//   cardTitle: {
//     fontSize: 17,
//     fontWeight: 600,
//     fontFamily: 'Urbanist-SemiBold',
//     color: '#fff',
//   },
//   cardDescription: {
//     fontSize: 14,
//     color: '#ccc',
//     marginTop: 6,
//     fontFamily: 'Urbanist-Medium',
//     fontWeight: 500,
//   },
//   iconBackground: {
//     width: 75,
//     height: 62,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//     paddingVertical: 8,
//     borderWidth: 0.4,
//     borderColor: 'transparent',
//     overflow: 'hidden',
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.15) 100%)',
//     boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.25)',
//   },

//   emptyWrapper: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: '100%',
//     paddingLeft: 16,
//     paddingRight: 16,
//     minHeight: 230

//   },

//   emptyContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: '100%',
//     height: (Platform.OS === 'ios' ? 290 : 300),
//     backgroundColor: 'rgba(255, 255, 255, 0.06)',
//     borderWidth: 0.3,
//     borderColor: 'rgba(255, 255, 255, 0.08)',
//     borderRadius: 24,
//     overflow: 'hidden',
//     marginBottom: 20,
//   },

//    emptyImage: {
//     width: 64,
//     height: 64,
//     marginBottom: 0,
//   },
//   emptyText: {
//     fontSize: 20,
//     color: 'rgba(255, 255, 255, 0.8)',
//     textAlign: 'center',
//     fontFamily: 'Urbanist-SemiBold',
//     fontWeight: 600
//   },
//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   popupContainer: {
//     width: '85%',
//     padding: 20,
//     borderRadius: 24,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.1)',
//     alignItems: 'center',
//     overflow: 'hidden',
//     backgroundColor: 'rgba(255, 255, 255, 0.04)',
//   },

//   popupMainHeader: {
//     color: 'rgba(255, 255, 255, 0.80)',
//     fontFamily: 'Urbanist-SemiBold',
//     fontSize: 20,
//     fontWeight: '600',
//     letterSpacing: -0.4,
//     lineHeight: 28,
//     textAlign: 'center',
//   },
//   popupSubHeader: {
//     color: 'rgba(255, 255, 255, 0.80)',
//     fontFamily: 'Urbanist-Regular',
//     fontSize: 14,
//     fontWeight: '400',
//     textAlign: 'center',
//     marginTop: 6,
//   },
//   popupButton: {
//     display: 'flex',
//     width: '100%',
//     height: 55,
//     maxHeight: 55,
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 4,
//     borderRadius: 100,
//     paddingTop: 6,
//     paddingBottom: 6,
//     backgroundColor: 'rgba(255, 255, 255, 0.56)',
//     marginTop: 20,
//     borderWidth: 0.5,
//     borderColor: '#ffffff2c',
//   },
//   popupButtonText: {
//     color: '#002050',
//     textAlign: 'center',
//     fontFamily: 'Urbanist-Medium',
//     fontSize: 17,
//     fontWeight: 500,
//     letterSpacing: 1,
//     width: '100%',
//   },
//   logo: {
//     width: 64,
//     height: 64,
//     marginBottom: 20,
//   },

// });