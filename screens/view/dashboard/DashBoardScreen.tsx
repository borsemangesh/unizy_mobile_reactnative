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
  Linking,
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
import COMMONSTYLE from '../../utils/CommonStyle';
import { wp, hp } from '../../utils/component/responsive';

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

const APP_STORE_URL =
  'https://apps.apple.com/app/idcom.org.unizy';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.unizy';


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
      <TouchableOpacity onPress={handlePress} style={styles.cardTouchable}>
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
    onSetActiveTab: (tab: TabKey) => void;
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
          // const isComplete = await checkOnboardingStatus();
          // if (!isComplete) {
          //   setShowOnboardingPopup(true);
          //   return;
          // }
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
      navigation.navigate('AccountDeatils');
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
  const [featuredListHeight, setFeaturedListHeight] = useState(0);

  // Match bottomTabContainer width (90% of view)
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


const forceLogoutAndUpdate = useCallback(async () => {
  try {
    await AsyncStorage.multiRemove([
      'userToken',
      'bookmarkedIds',
      'categories',
    ]);
  } catch (error) {
    console.log('Logout storage error:', error);
  }

  const storeUrl =
    Platform.OS === 'ios'
      ? APP_STORE_URL
      : PLAY_STORE_URL;

  try {
    await Linking.openURL(storeUrl);
  } catch (error) {
    console.log('Unable to open store:', error);
  }

  navigation.reset({
    index: 0,
    routes: [
      {
        name: 'SinglePage',
        params: {
          resetToLogin: true,
        },
      },
    ],
  });
}, [navigation]);



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
const [isVersionChecking, setIsVersionChecking] = useState(true);
const [showUpdateModal, setShowUpdateModal] = useState(false);
const [isForceUpdate, setIsForceUpdate] = useState(false);

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
  let isMounted = true;

  const compareVersions = (current: string, server: string): number => {
  const toParts = (v: string) =>
    String(v)
      .trim()
      .replace(/[^0-9.]/g, '')
      .split('.')
      .filter(Boolean)
      .map(n => parseInt(n, 10) || 0);

  const a = toParts(current);
  const b = toParts(server);
  const len = Math.max(a.length, b.length);

  for (let i = 0; i < len; i++) {
    const left = a[i] ?? 0;
    const right = b[i] ?? 0;
    if (left > right) return 1; // current newer
    if (left < right) return -1; // current older
  }
  return 0; // same
};

const verifyAppVersion = async () => {
  try {
    const currentVersion = String(DeviceInfo.getVersion()).trim();

    const response = await fetch(
      `${MAIN_URL.baseUrl}user/app-version`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    const result = await response.json();

    console.log('================================');
    console.log('Platform:', Platform.OS);
    console.log('Current App Version:', currentVersion);
    console.log('App Version API Response:', result);
    console.log('================================');

    if (!response.ok || result?.statusCode !== 200) {
      if (isMounted) setIsVersionChecking(false);
      return;
    }

    const platformConfig =
      Platform.OS === 'ios'
        ? result?.data?.app_version?.ios
        : result?.data?.app_version?.android;

    console.log('Platform Config:', platformConfig);

    if (!platformConfig) {
      console.log('Platform config not found');
      if (isMounted) setIsVersionChecking(false);
      return;
    }

    const serverVersion = String(platformConfig?.version ?? '').trim();

    const forceUpdate =
      platformConfig?.force_update === true ||
      platformConfig?.force_update === 'true' ||
      platformConfig?.force_update === 1 ||
      platformConfig?.force_update === '1';

    console.log('Current Version:', currentVersion);
    console.log('Server Version:', serverVersion);
    console.log('Force Update:', forceUpdate);

    if (!serverVersion) {
      if (isMounted) setIsVersionChecking(false);
      return;
    }

    const cmp = compareVersions(currentVersion, serverVersion);
    const isOutdated = cmp < 0; // current < server

    console.log('Version compare result:', cmp, 'Outdated:', isOutdated);

    if (isOutdated) {
      if (isMounted) {
        setIsForceUpdate(forceUpdate);
        setShowUpdateModal(true);
        setIsVersionChecking(false);
      }
      return;
    }

    console.log('App version is up to date');

    if (isMounted) setIsVersionChecking(false);
  } catch (error) {
    console.log('Version check error:', error);
    if (isMounted) setIsVersionChecking(false);
  }
};
  verifyAppVersion();

    sendDeviceTokenToServer();
  return () => {
    isMounted = false;
  };
  }, []);





//   useEffect(() => {
//   let isMounted = true;

//   const verifyAppVersion = async () => {
//     const isVersionValid = await checkAppVersion();

//     if (!isMounted) return;

//     if (!isVersionValid) {
//       await forceLogoutAndUpdate();
//     }
//   };

//   verifyAppVersion();

//   return () => {
//     isMounted = false;
//   };
// }, [checkAppVersion, forceLogoutAndUpdate]);


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
              styles.categoryFullWidth,
              { transform: [{ translateY: categorytranslateY }] },
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
                style={[
                  styles.categoryHalf,
                  index === 0 && styles.categoryHalfLeft,
                  {
                    transform: [
                      {
                        translateX:
                          index === 0
                            ? leftItemTranslateX
                            : rightItemTranslateX,
                      },
                    ],
                  },
                ]}
              >
                <ProductItem navigation={navigation} item={item} />
              </Animated.View>
            ))}
            {rowItems.length === 1 && <View style={styles.categoryHalf} />}
          </View>,
        );
      }
      return <View style={styles.categoryGrid}>{rows}</View>;
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
              <View style={[styles.categoryHalf, styles.categoryHalfLeft]}>
                {page.left.map(item => (
                  <Animated.View
                    key={item.id}
                    style={[
                      styles.categoryPagedItem,
                      { transform: [{ translateY: categorytranslateY }] },
                    ]}
                  >
                    <ProductItem navigation={navigation} item={item} />
                  </Animated.View>
                ))}
              </View>
              <View style={styles.categoryHalf}>
                {page.right.map(item => (
                  <Animated.View
                    key={item.id}
                    style={[
                      styles.categoryPagedItem,
                      { transform: [{ translateY: categorytranslateY }] },
                    ]}
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
    onCategoryScroll,
    handleScrollEnd,
    categoryPages,
    activeIndex,
    width,
  ]);

  // ── renderHomeContent (memoized) ──
  const homeContent = useMemo(
    () => (
      <View style={styles.homeContent}>
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
            style={styles.featuredList}
            contentContainerStyle={styles.featuredScroll}
            onLayout={e => {
              const next = e.nativeEvent.layout.height;
              if (next > 0 && Math.abs(next - featuredListHeight) > 1) {
                setFeaturedListHeight(next);
              }
            }}
            renderItem={({ item }) => (
              <Animated.View
                style={[
                  { transform: [{ translateY: cardSlideupAnimation }] },
                  styles.featuredCard,
                  featuredListHeight > 0 && { height: featuredListHeight },
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
        )}
      </View>
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
      featuredListHeight,
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
              {

                paddingTop: insets.top + height * 0.01,
              },
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
                <AddScreenContent navigation={navigation} products={products}  onSetActiveTab={setActiveTab} />
              ) : null}
            </>
          )}
        </KeyboardAvoidingView>

        {activeTab === 'Search' && isSalesActive && (

          <View
            style={[
              styles.textbg,
              {
                position: 'absolute',
                bottom: height * 0.1 + height * 0.01,
                left: '4%',
                right: '4%',
                zIndex: 999,
              },
            ]}
          >
           {Platform.OS === 'ios' ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { borderRadius: 10, backgroundColor: 'transparent' },
              ]}
            >
              <BlurView
                style={[StyleSheet.absoluteFill,styles.iosBlur]}
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
              style={styles.infoIcon}
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
            { position: 'absolute', bottom:0 },
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

{/* <Modal
  visible={isForceUpdate}
  transparent
  animationType="fade"
>
  <View style={styles.overlay}>
    <View style={styles.popupContainer}>
      <Image
        source={ALERT_ICON}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text
        allowFontScaling={false}
        style={styles.popupMainHeader}
      >
        Update Required
      </Text>

      <Text
        allowFontScaling={false}
        style={styles.popupSubHeader}
      >
        A new version of UniZy is available.
        Please update the app to continue.
      </Text>

      <TouchableOpacity
        style={styles.popupButton}
        onPress={async () => {
          const storeUrl =
            Platform.OS === 'ios'
              ? APP_STORE_URL
              : PLAY_STORE_URL;

          await Linking.openURL(storeUrl);
        }}
      >
        <Text
          allowFontScaling={false}
          style={styles.popupButtonText}
        >
          Update Now
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal> */}

<Modal
  visible={showUpdateModal}
  transparent
  animationType="fade"
  onRequestClose={() => {
    // Only allow dismiss when update is optional
    if (!isForceUpdate) {
      setShowUpdateModal(false);
    }
  }}
>
  <View style={COMMONSTYLE.overlay}>
    <BlurView
              style={[StyleSheet.absoluteFill, COMMONSTYLE.modelBlur]}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
            />
             <View
                          style={[
                            StyleSheet.absoluteFill,
                            { backgroundColor: 'rgba(0, 0, 0, 0.32)' },
                          ]}
                        />
    <View style={styles.popupContainer}>
      <Image
        source={ALERT_ICON}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text
        allowFontScaling={false}
        style={styles.popupMainHeader}
      >
        {isForceUpdate ? t('update_required') : t('update_available')}
      </Text>

      <Text
        allowFontScaling={false}
        style={styles.popupSubHeader}
      >
        {isForceUpdate
          ? t("newVerstion1")
          : t("newVerstion2")}
      </Text>

      <TouchableOpacity
        style={styles.popupButton}
        onPress={async () => {
          const storeUrl =
            Platform.OS === 'ios'
              ? APP_STORE_URL
              : PLAY_STORE_URL;

          try {
            await Linking.openURL(storeUrl);
          } catch (error) {
            console.log('Unable to open store:', error);
          }
        }}
      >
        <Text
          allowFontScaling={false}
          style={styles.popupButtonText}
        >
          {t("update_now")}
        </Text>
      </TouchableOpacity>

      {!isForceUpdate && (
        <TouchableOpacity
          style={styles.laterButton}
          onPress={() => {
            setShowUpdateModal(false);
          }}
        >
          <Text
            allowFontScaling={false}
            style={styles.laterButtonText}
          >
            Ask Me Later
          </Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
</Modal>



      <ShortCustomToastContainer />
      <NewCustomToastContainer />
    </ImageBackground>
  );
};

export default DashBoardScreen;

// ─── Styles (Figma proportions via % of screen width / height) ─────────────────
// Scales evenly on iPhone 13 / 15 / 16 / 17 — no per-device branches.

const styles = StyleSheet.create({
  laterButton: {
    marginTop: hp(1.8),
    paddingVertical: hp(1.2),
    alignItems: 'center',
    justifyContent: 'center',
  },

  laterButtonText: {
    color: '#FFFFFF',
    fontSize: wp(3.85),
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  askLaterButton: {
    marginTop: hp(1.65),
    paddingVertical: hp(1.2),
    alignItems: 'center',
    justifyContent: 'center',
  },

  askLaterText: {
    color: '#fff',
    fontSize: wp(3.85),
    fontWeight: '500',
  },
  flex1: { flex: 1 },
  profileFull: { flex: 1, height: '100%' },
  background: { flex: 1, width: '100%', height: '100%' },
  fullScreenContainer: { flex: 1, flexDirection: 'column' },

  // Header — Figma: ~5% side inset, circular glass buttons
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: hp(1.9),
    paddingHorizontal: '4.5%',
    paddingBottom: hp(0.5),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  MylistingsBackground: {
    height: wp(12),
    width: wp(12),
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
  iconSmall: { width: wp(5.8), height: wp(5.8) },
  unizyText: {
    color: '#FFFFFF',
    fontFamily: 'MonumentExtended-Regular',
    fontSize: wp(6),
    flex: 1,
    textAlign: 'center',
  },

  // Search — full-width pill
  search_container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 50,
    paddingHorizontal: '3.5%',
    height: hp(5.5),
    gap: wp(2),
    borderWidth: 0.4,
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
    height: wp(5.2),
    width: wp(5.2),
  },
  searchBar: {
    fontFamily: 'Urbanist-Medium',
    fontWeight: '500',
    fontSize: wp(4.2),
    color: '#fff',
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },

  // Category grid — Figma: clear gutters, scales on all iPhones
  productsWrapper: {
    paddingHorizontal: '4.5%',
    paddingTop: hp(1.2),
    paddingBottom: hp(0.6),
  },
  categoryGrid: {
    width: '100%',
  },
  categoryFullWidth: {
    width: '100%',
    marginBottom: hp(1.2),
  },
  categoryHalf: {
    flex: 1,
  },
  // ~3% screen-width gutter between the two columns
  categoryHalfLeft: {
    marginRight: wp(2.3),
  },
  categoryPagedItem: {
    marginBottom: hp(1.2),
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'stretch',
    marginBottom: hp(1.2),
  },
  cardTouchable: {
    width: '100%',
  },
  cardTextWrapper: {
    flex: 1,
    paddingLeft: wp(2.8),
    justifyContent: 'center',
  },
  cardContainer: {
    width: '100%',
    height: hp(7.6),
    flexDirection: 'row',
    borderRadius: wp(4.2),
    paddingHorizontal: wp(3.5),
    alignItems: 'center',
    borderWidth: 0.4,
    borderColor: '#ffffff11',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderEndEndRadius: wp(4.2),
    borderStartEndRadius: wp(4.2),
    borderTopLeftRadius: wp(4.2),
    borderTopRightRadius: wp(4.2),
    borderBottomStartRadius: wp(4.2),
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',
    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
    boxSizing: 'border-box',
  },
  cardIcon: { width: wp(6), height: wp(6), resizeMode: 'contain' },
  cardText: {
    color: '#FFF',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: wp(4.1),
    fontWeight: '600',
  },

  // Category pager (6+ categories)
  categoryPage: {
    flexDirection: 'row',
    paddingHorizontal: '4.5%',
    alignItems: 'flex-start',
  },
  categoryRightCol: {
    flex: 1,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(1.5),
    marginTop: hp(1),
  },
  stepCircle: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(4),
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  inactiveStepCircle: { borderColor: '#ffffff4e', borderRadius: 40 },

  // Featured listings — fills remaining height; sits just above bottom tab
  homeContent: {
    flex: 1,
    // Tab (~5.8%) + margin (~2.5%) + small gap — no empty band under cards
    paddingBottom: hp(10.2),
  },
  featuredHeader: {
    paddingHorizontal: '4.5%',
    paddingTop: hp(0.91),
    paddingBottom: hp(2),
  },
  featuredText: {
    color: '#FFF',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: wp(5),
    fontWeight: '600',
  },
  featuredList: {
    flex: 1,
    marginBottom: hp(0.6)
  },
  featuredScroll: {
    paddingHorizontal: '4.5%',
    paddingBottom: 0,
    alignItems: 'stretch',
  },
  featuredCard: {
    height: '100%',
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '4%',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: hp(34),
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.3,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: wp(6),
    overflow: 'hidden',
    marginBottom: hp(2.2),
  },
  emptyImage: { width: wp(16.5), height: wp(16.5) },
  emptyText: {
    fontSize: wp(5.1),
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
    height: hp(Platform.OS === 'ios' ? 17.5 : 14),
    zIndex: 0,
  },
  tabTitleContainer: {
    position: 'absolute',
    top: hp(Platform.OS === 'ios' ? 8.2 : 7),
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: '4%',
    zIndex: 0,
  },
  tabTitleText: {
    color: '#fff',
    fontSize: wp(5.1),
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },
  scrolledTabScroll: {
    paddingTop: hp(Platform.OS === 'ios' ? 14.8 : 14),
  },
  scrolledTabContent: { paddingBottom: 0 },

  // Add screen
  tabContent3: {
    flex: 1,
    padding: '4%',
    paddingTop: Platform.OS === 'ios' ? '15.2%' : hp(5.9),
  },
  tabContentText3: {
    color: '#fff',
    fontSize: wp(5.1),
    marginVertical: hp(1.4),
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
  },
  card: {
    height: hp(11),
    flexDirection: 'row',
    borderRadius: wp(6),
    paddingHorizontal: '4%',
    paddingVertical: hp(1.8),
    alignItems: 'center',
    flex: 1,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.14) 100%)',
  },
  cardIcon1: { width: wp(9.2), height: wp(9.2), resizeMode: 'center' },
  cardTextContainer: { flex: 1 },
  cardTitle: {
    fontSize: wp(4.35),
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    color: '#fff',
  },
  cardDescription: {
    fontSize: wp(3.6),
    color: '#ccc',
    marginTop: hp(0.7),
    fontFamily: 'Urbanist-Medium',
    fontWeight: '500',
  },
  iconBackground: {
    width: wp(19),
    height: hp(7.3),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
    paddingVertical: hp(0.9),
    overflow: 'hidden',
  },
  flatListContent: { marginTop: hp(2.2) },
  separator: { height: hp(1.8) },
  loaderCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderSmall: {
    width: wp(12.8),
    height: wp(12.8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderMedium: {
    width: wp(25.5),
    height: wp(25.5),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom tab bar — Figma floating glass dock
  bottomTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '92%',
    marginBottom: hp(4),
    borderRadius: 50,
    alignSelf: 'center',
    padding: wp(0.1),
    borderWidth: 0.4,
    backgroundColor: 'rgba(0,23,128,0.49)',
    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
    borderColor: '#ffffff11',
    zIndex: 100,
  },
  bubbleRow: { height: hp(5.8), position: 'absolute', top: 2,left: 2, right: 20,padding: 2 },
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
    height: hp(5.8),
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: { width: wp(7), height: wp(7), resizeMode: 'contain' },

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
  iosBlur: {
    borderRadius: 10,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  infoIcon: {
    width: wp(4.1),
    height: wp(4.1),
    marginRight: wp(2),
    marginTop: hp(0.2),
  },
  importantText: {
    color: '#FFFFFFCC',
    fontSize: wp(3.1),
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    marginBottom: hp(0.7),
  },
  importantText1: {
    color: '#FFFFFF',
    fontSize: wp(3.1),
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
    padding: '5%',
    borderRadius: wp(6),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  popupMainHeader: {
    color: 'rgba(255,255,255,0.80)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: wp(5.1),
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: hp(3.3),
    textAlign: 'center',
  },
  popupSubHeader: {
    color: 'rgba(255,255,255,0.80)',
    fontFamily: 'Urbanist-Regular',
    fontSize: wp(3.6),
    fontWeight: '400',
    textAlign: 'center',
    marginTop: hp(0.7),
  },
  popupButton: {
    width: '100%',
    height: hp(6.8),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.56)',
    marginTop: hp(2.2),
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },
  popupButtonText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: wp(4.5),
    fontWeight: '500',
    letterSpacing: 1,
    width: '100%',
  },
  logo: {
    width: wp(16.5),
    height: wp(16.5),
    marginBottom: hp(2.2),
  },

  textbg: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    padding: wp(1.5),
    borderWidth: 0.5,
    borderEndEndRadius: wp(3),
    borderStartEndRadius: wp(3),
    borderTopLeftRadius: wp(3),
    borderTopRightRadius: wp(3),
    borderBottomStartRadius: wp(3),
    borderBlockStartColor: '#ffffff31',
    borderBlockColor: '#ffffff31',
    borderTopColor: '#ffffff31',
    borderBottomColor: '#ffffff31',
    borderLeftColor: '#ffffff31',
    borderRightColor: '#ffffff31',
    position: 'absolute',
    bottom: hp(10) + (Platform.OS === 'ios' ? hp(0.9) : 0),
    left: '4%',
    right: '4%',
    borderRadius: wp(2.5),
    zIndex: 999,
  },
});