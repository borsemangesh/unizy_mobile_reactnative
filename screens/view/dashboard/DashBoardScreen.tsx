import React, { JSX, useCallback, useEffect, useRef, useState } from 'react';
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
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';


import AnimatedReanimated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
// import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

const bgImage = require('../../../assets/images/backimg.png');
import ProductCard from '../../utils/ProductCard';
import messaging from "@react-native-firebase/messaging";

import AnimatedSlideUp from '../../utils/AnimatedSlideUp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Navigation } from '../Navigation';
import { MAIN_URL } from '../../utils/APIConstant';
import TutitionCard from '../../utils/TutitionCard';
import ProfileCard from './ProfileCard';
import { NewCustomToastContainer, showToast } from '../../utils/component/NewCustomToastManager';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import MessagesScreen from './MessageScreen';
import { Constant } from '../../utils/Constant';
import TransactionHistoryScreen from './TransactionHistoryScreen';
import { BlurView } from '@react-native-community/blur';
import BottomNavigation from '../../utils/component/BottomNavigation';
import DeviceInfo from 'react-native-device-info';
import Loader from '../../utils/component/Loader';

const mylistings = require('../../../assets/images/mylistingicon.png');
const mylistings1 = require('../../../assets/images/favourite.png');

const searchIcon = require('../../../assets/images/searchicon.png');
const producticon = require('../../../assets/images/producticon.png');
const foodicon = require('../../../assets/images/fod_icon.png');
const accomicon = require('../../../assets/images/bed_icon.png');
const tuitionicon = require('../../../assets/images/book.png');
const houseicon = require('../../../assets/images/housekeeping.png');

// Bottom tab icons
const homeIcon = require('../../../assets/images/tab1.png');
const searchTabIcon = require('../../../assets/images/tab2.png');
const addIcon = require('../../../assets/images/tab3.png');
const bookmarkIcon = require('../../../assets/images/tab4.png');
const profileIcon = require('../../../assets/images/tab5.png');

const homeIcon1 = require('../../../assets/images/filled1.png');
const searchTabIcon2 = require('../../../assets/images/filled2.png');
const addIcon3 = require('../../../assets/images/filled3.png');
const bookmarkIcon4 = require('../../../assets/images/filled4.png');
const profileIcon5 = require('../../../assets/images/filled5.png');

type Product = {
  id: number;
  name: string;
  icon: ImageSourcePropType;
};

type ProductItemProps = {
  navigation: any;
  item: Product;
};

const iconMap: Record<string, any> = {
  Products: require('../../../assets/images/producticon.png'),
  Product: require('../../../assets/images/producticon.png'), 
  Food: require('../../../assets/images/fod_icon.png'),
  Food2: require('../../../assets/images/fod_icon.png'), 
  Accommodation: require('../../../assets/images/bed_icon.png'),
  Accomodation: require('../../../assets/images/bed_icon.png'), 
  Tuition: require('../../../assets/images/book.png'),
  'House Keeping': require('../../../assets/images/housekeeping.png'),
};



const ProductItem: React.FC<ProductItemProps> = ({
  navigation,
  item,
}) => (
  <TouchableOpacity
    key={item.id}
    onPress={() => {
      navigation.replace('ProductDetails', {
        category_id: item.id,
        category_name: item.name,
      },{ animation: 'none' });
    }}
  >
    <View
      style={[
        styles.cardContainer,
      ]}
    >
      <Image source={item.icon} style={styles.cardIcon} />
      <Text allowFontScaling={false} style={styles.cardText} numberOfLines={0}>
        {item.name}
      </Text>
    </View>
  </TouchableOpacity>
);
type TransactionScreenProps = {
  navigation: any;
};

const SearchScreenContent = ({navigation}: TransactionScreenProps) => (
  <View  style={{flex: 1}}>
    <TransactionHistoryScreen navigation={navigation} route={undefined}/>
  </View>
);
type AddScreenContentProps = {
  navigation: any;
  products: any[];
  onSetActiveTab?: (tab: string) => void;
};

const AddScreenContent: React.FC<AddScreenContentProps> = ({ navigation, products, onSetActiveTab }) => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [showOnboardingPopup, setShowOnboardingPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          setLoading(false);
          return;
        }

        const url = `${MAIN_URL.baseUrl}transaction/account-detail`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        const result = await response.json();
        
        if (response.ok && result.statusCode === 200) {
          const isComplete = result.data?.stripeAccount?.isboardcomplete === true;
          setIsOnboardingComplete(isComplete);
        } else {
          // If API fails, assume not complete
          setIsOnboardingComplete(false);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsOnboardingComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  const handleProductPress = (item: any) => {

    if (isOnboardingComplete === false) {

      setShowOnboardingPopup(true);
    } else if (isOnboardingComplete === true) {

      navigation.replace('AddScreen', {
        productId: item.id,
        productName: item.name,
      }, { animation: 'none' });
    }

  };

  const handleGoToPayment = () => {
    setShowOnboardingPopup(false);
    if (onSetActiveTab) {
      onSetActiveTab('Profile');
    }
  };

  if (loading) {
    return (
      <View style={[styles.tabContent3]}>
        <Text allowFontScaling={false} style={[styles.tabContentText3]}>List Product</Text>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',height: '100%',paddingTop: 300}}>
          <Loader
            containerStyle={{
              width: 50,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tabContent3}>
      <Text allowFontScaling={false} style={[styles.tabContentText3]}>List Product</Text>
      <AnimatedSlideUp>
        <FlatList
          data={products}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity       
              onPress={() => handleProductPress(item)}
            >
              <View style={styles.card}>
               

                 <ImageBackground
                  source={require('../../../assets/images/cardbg.png')} 
                  style={styles.iconBackground}> 

                  <Image source={item.icon} style={styles.cardIcon1} />
                 
                 </ImageBackground> 

                <View style={styles.cardTextContainer}>
                  <Text allowFontScaling={false} style={styles.cardTitle}>{item.name}</Text>
                  <Text allowFontScaling={false} style={styles.cardDescription}>{item.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />} 
          contentContainerStyle={{ marginTop:20 }}
        />
      </AnimatedSlideUp>


      <Modal
        visible={showOnboardingPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOnboardingPopup(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowOnboardingPopup(false)}>
          <View style={styles.overlay}>
            <BlurView
              style={{
                flex: 1,
                alignContent: 'center',
                justifyContent: 'center',
                width: '100%',
                alignItems: 'center',
              }}
              blurType="light"
              blurAmount={10}
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
                <Text allowFontScaling={false} style={styles.popupMainHeader}>
                  Complete Payment Methods
                </Text>
                <Text allowFontScaling={false} style={styles.popupSubHeader}>
                  Please complete your Stripe onboarding process in Payment Methods to add listings.
                </Text>

                <TouchableOpacity
                  style={styles.popupButton}
                  onPress={handleGoToPayment}
                >
                  <Text allowFontScaling={false} style={styles.popupButtonText}>
                    Go to Payment Methods
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

type ChatProps = {
  navigation: any;
};

const BookmarkScreenContent = ({ navigation }: ChatProps) => (
  <View style={{flex: 1}}>

    <MessagesScreen navigation={navigation}/>

  </View>
);

type ProfileScreenContentProps = {
  navigation: any;
};
const ProfileScreenContent = ({ navigation }: ProfileScreenContentProps) => (
  <View style={{flex: 1}}>
    <ProfileCard navigation={navigation} />
  </View>
);

type DashBoardScreenProps = {
  navigation: any;
};

type RootStackParamList = {
  Dashboard: { AddScreenBackactiveTab: string;
        isNavigate: boolean;
        loginMessage: string;    
        isFirsttimeLogin: boolean;   
      }
   };
type DashboardRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;

const DashBoardScreen = ({ navigation }: DashBoardScreenProps) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('Home');
  const screenWidth = Dimensions.get('window').width;
  const tabsname = ['Home', 'Search', 'Add', 'Bookmark', 'Profile'];

  const tabWidth = (screenWidth * 0.90) / tabsname.length;

  const bubbleX = useRef(new Animated.Value(0)).current;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<any[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const route = useRoute<DashboardRouteProp>();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { width } = Dimensions.get('window');

const scrollViewRef = useRef<ScrollView>(null);
const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsNav(route.params?.isNavigate);

    if (route.params?.AddScreenBackactiveTab) {
      setActiveTab(
        route.params?.AddScreenBackactiveTab as
          | 'Home'
          | 'Search'
          | 'Add'
          | 'Bookmark'
          | 'Profile',
      );
    }

    const fetchCategories = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const url2 = MAIN_URL.baseUrl + 'user/category';

        const response = await fetch(url2, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
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
              : require('../../../assets/images/producticon.png'),
          }));

        const idNameArray = mapped.map((item: any) => ({
          id: item.id,
          name: item.name,
        }));

        await AsyncStorage.setItem(
          'categories', 
          JSON.stringify(idNameArray),
        );

        setProducts(mapped);
      } catch (err) {
        console.error('Error fetching categories', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();

    const loadBookmarks = async () => {
      const saved = await AsyncStorage.getItem('bookmarkedIds');
      if (saved) setBookmarkedIds(JSON.parse(saved));
    };
    loadBookmarks();
  }, [route.params?.AddScreenBackactiveTab]);


  useFocusEffect(
  useCallback(() => {
    const fetchFeatures = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const url1 = MAIN_URL.baseUrl + 'category/feature-list';
        console.log("FeatureListingDashboard:",url1);
        const res = await fetch(url1, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        console.log('✅ Features API response:', json);

        if (json.statusCode === 200) {
          setFeatures(json.data.features || []);
          setIsLoading(false);
        }
        if(json.statusCode === 401 || json.statusCode === 403){
          navigation.reset({
          index: 0,
          routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
        });
        }
      } catch (err) {
        console.log('❌ Error fetching features:', err);
        setIsLoading(false);
      }finally {
        setIsLoading(false);
      }
    };

    fetchFeatures();
  }, [])
);

 useEffect(() => {
    sendDeviceTokenToServer();
  }, []);

const sendDeviceTokenToServer = async () => {
    try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;
    const deviceId = await DeviceInfo.getUniqueId();
    const url1 = MAIN_URL.baseUrl + 'user/devicetoken';
    console.log('📤 FCM URL:', url1);
    const fcmToken = await messaging().getToken();
    console.log('📤 FCM fcmToken:', fcmToken);
    const requestBody = {
          device_token: fcmToken,
          device_type  : Platform.OS,
          device_id:deviceId
        };
    console.log('Body:', JSON.stringify(requestBody));
    const response = await fetch(url1, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      console.log('✅ FCM token sent to server successfully');
    } else {
      const error = await response.text();
      console.log('❌ Server error:', error);
    }
  } catch (error) {
    console.error('❌ Error sending token to server:', error);
  }

  };
  
  const [isNav, setIsNav] = useState(true);

  const screenHeight = Dimensions.get('window').height;
  const translateY = React.useRef(new Animated.Value(screenHeight)).current;
  const searchBartranslateY = React.useRef(
    new Animated.Value(screenHeight),
  ).current;
  const categorytranslateY = React.useRef(
    new Animated.Value(screenHeight),
  ).current;
  const leftItemTranslateX = useRef(new Animated.Value(-300)).current; 
  const rightItemTranslateX = useRef(new Animated.Value(300)).current; 
  const cardSlideupAnimation = useRef(new Animated.Value(screenHeight)).current;
  const bottomNaviationSlideupAnimation = useRef(
    new Animated.Value(screenHeight),
  ).current;

  useEffect(() => {
    if (activeTab === 'Home' && route.params?.isNavigate) {
      console.log("isNav: ",isNav)
      if(route.params?.isFirsttimeLogin){
        navigation.setParams({ isFirsttimeLogin: false });
        showToast(route.params?.loginMessage || Constant.LOGIN_SUCCESSFUL, 'success');
      }
      setIsNav(false);
      translateY.setValue(-screenWidth);
      searchBartranslateY.setValue(-screenWidth);
      categorytranslateY.setValue(-screenWidth);
      // evenCategorytranslateX.setValue(-screenWidth);
      leftItemTranslateX.setValue(-screenWidth);
      rightItemTranslateX.setValue(screenWidth);
      cardSlideupAnimation.setValue(screenHeight);
      bottomNaviationSlideupAnimation.setValue(screenHeight);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      // Search bar animation
      Animated.timing(searchBartranslateY, {
        toValue: 0,
        duration: 900,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      // Catagory bar animation categorytranslateY
      Animated.timing(categorytranslateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      Animated.timing(leftItemTranslateX, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      Animated.timing(rightItemTranslateX, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      Animated.timing(bottomNaviationSlideupAnimation, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      const animations = [0, 1, 2].map(i =>
        Animated.timing(cardSlideupAnimation, {
          toValue: 0,
          duration: 900,
          delay: i * 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      );
      Animated.stagger(200, animations).start();
    } else if (activeTab === 'Home' && route.params?.isNavigate === false) {
      // No animation: Just reset instantly
      translateY.setValue(0);
      searchBartranslateY.setValue(0);
      categorytranslateY.setValue(0);
      leftItemTranslateX.setValue(0);
      rightItemTranslateX.setValue(0);
      cardSlideupAnimation.setValue(0);
      bottomNaviationSlideupAnimation.setValue(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab,route.params?.isNavigate]);

  useEffect(() => {
    const index = ['Home', 'Search', 'Add', 'Bookmark', 'Profile'].indexOf(
      activeTab,
    );
    Animated.spring(bubbleX, {
      toValue: index * tabWidth,
      friction: 6,
      tension: 20,
      
      useNativeDriver: true,
    }).start();
  }, [activeTab, bubbleX, tabWidth]);


const [activeIndex, setActiveIndex] = useState(0);
const scrollX = useRef(new Animated.Value(0)).current;

const renderProducts = () => {
  const isEven = products.length % 2 === 0;
  let startIndex = 0;
  const rows: JSX.Element[] = [];

  if (products.length <= 6) {

    if (!isEven) {
      rows.push(
        <Animated.View
          style={[

            { transform: [{ translateY: categorytranslateY }] },
          ]}
          key={products[0].id}
        >
          <ProductItem navigation={navigation} item={products[0]}  />
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


  {rowItems.length === 1 && <View style={{ flex: 1 }} />}
</View>
      );
    }

    return <View>{rows}</View>;
  }

  

const createPages = (items: typeof products) => {
  const pages = [];
  const pageSize = 6;
  const overlap = 3;

  if (items.length <= pageSize) {
    pages.push({
      left: items.filter((_, i) => i < 3),
      right: items.filter((_, i) => i >= 3),
    });
    return pages;
  }

  pages.push({
    left: items.slice(0, 3),
    right: items.slice(3, 6),
  });

  let start = 3;
  while (start + overlap < items.length) {
    const left = items.slice(start, start + overlap); 
    const right = items.slice(start + overlap, start + overlap + 3);
    pages.push({ left, right });
    start += 3;
  }

  const lastIndex = start + overlap;
  if (lastIndex < items.length) {
    const left = items.slice(start, start + overlap);
    const right = items.slice(start + overlap);
    pages.push({ left, right });
  }

  return pages;
};



const pages = createPages(products);
 

let secondPageLeft: typeof products = [];
let secondPageRight: typeof products = [];
if (products.length > 6) {
  secondPageLeft = products.slice(3, 6); 
  secondPageRight = products.slice(6);  
}

const rightRows: (typeof products[0] | null)[] = [];
if (secondPageRight.length > 0) {
  const rowsCount = secondPageLeft.length;
  for (let i = 0; i < rowsCount; i++) {
    rightRows.push(secondPageRight[i] || null);
  }
}
const handleScrollEndDrag = (e: any) => {
  const offsetX = e.nativeEvent.contentOffset.x;
  const index = Math.round(offsetX / width); 
  scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
  setActiveIndex(index);
};

const onScroll = Animated.event(
  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
  { useNativeDriver: false }
);

const handleScrollEnd = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
  const index = Math.round(e.nativeEvent.contentOffset.x / width);
  setActiveIndex(index);
};





return (
  <View>
    <Animated.ScrollView
      horizontal
       pagingEnabled={false} 
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      onScroll={onScroll}
      onMomentumScrollEnd={handleScrollEnd}
      scrollEventThrottle={16}
    >
  {pages.map((page, pageIndex) => (
    <View key={pageIndex} style={{ width, flexDirection: 'row',padding:10,}}>
      <View style={{ flex: 1}}>
        {page.left.map(item => (
          <Animated.View
            key={item.id}
            style={{ transform: [{ translateY: categorytranslateY }], marginBottom: 4 }}
          >
            <ProductItem navigation={navigation} item={item} />
          </Animated.View>
        ))}
      </View>
      <View style={{ flex: 1,paddingLeft:2}}>
        {page.right.map(item => (
          <Animated.View
            key={item.id}
            style={{ transform: [{ translateY: categorytranslateY }], marginBottom: 4 }}
          >
            <ProductItem navigation={navigation} item={item} />
          </Animated.View>
        ))}
      </View>
    </View>
  ))}
</Animated.ScrollView>
    
    <View style={styles.stepIndicatorContainer}>
  {pages.map((_, idx) =>
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
    )
  )}
</View>
  </View>
);

};


 const handleBookmarkPress = async (productId: number) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;

    setFeatures(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, isbookmarked: !item.isbookmarked }
          : item
      )
    );

    const isCurrentlyBookmarked = bookmarkedIds.includes(productId);

    const url = MAIN_URL.baseUrl + 'category/list-bookmark';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ feature_id: productId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Bookmark response:', data);
    if (data?.message) {
      showToast(data.message, data.statusCode === 200 ? 'success' : 'error');
    }

    let updatedBookmarks;
    if (isCurrentlyBookmarked) {
      updatedBookmarks = bookmarkedIds.filter(id => id !== productId);
    } else {
      updatedBookmarks = [...bookmarkedIds, productId];
    }

    setBookmarkedIds(updatedBookmarks);
    await AsyncStorage.setItem('bookmarkedIds', JSON.stringify(updatedBookmarks));
  } catch (error) {
    console.error('Bookmark error:', error);

    setFeatures(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, isbookmarked: !item.isbookmarked }
          : item
      )
    );
  }
};

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'Home':
  return (
    <>
      <View style={styles.productsWrapper}>{renderProducts()}</View>

      <Animated.View
        style={{
          transform: [{ translateY: cardSlideupAnimation }],
        }}
      >
        <Text allowFontScaling={false} style={styles.featuredText}>
          Featured Listings
        </Text>
      </Animated.View>
      {isLoading ? (
        <View style={styles.emptyWrapper}>
          <Loader
            containerStyle={{
              width: 100,
              height: 100,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
        </View>
      ) : features.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../../assets/images/noproduct.png')}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text allowFontScaling={false} style={styles.emptyText}>
              No Listings Found
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView
          directionalLockEnabled
          style={{ paddingHorizontal: 0, marginLeft: 8 }}
          horizontal
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {features.map(item => (
            <Animated.View
              key={item.id}
              style={{ transform: [{ translateY: cardSlideupAnimation }] }}
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
                  onpress={() => {
                    navigation.navigate(
                      'SearchDetails',
                      { id: item.id },
                      { animation: 'none' },
                    );
                  }}
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
                  onpress={() => {
                    navigation.replace(
                      'SearchDetails',
                      { id: item.id },
                      { animation: 'none' },
                    );
                  }}
                />
              )}
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </>
  );
      case 'Search':
        return <SearchScreenContent  navigation={navigation}/>;
      case 'Add':
        return <AddScreenContent navigation={navigation} products={products} onSetActiveTab={setActiveTab} />;
      case 'Bookmark':
        return <BookmarkScreenContent navigation={navigation} />;
      case 'Profile':
        return <ProfileScreenContent navigation={navigation} />;
      default:
        return null;
    }
  };

  const tabs = [
    { key: 'Home', icon: homeIcon, activeIcon: homeIcon1 },
    { key: 'Search', icon: searchTabIcon, activeIcon: searchTabIcon2 },
    { key: 'Add', icon: addIcon, activeIcon: addIcon3 },
    { key: 'Bookmark', icon: bookmarkIcon, activeIcon: bookmarkIcon4 },
    { key: 'Profile', icon: profileIcon, activeIcon: profileIcon5 },
  ];

  const clickbookmark = () => {
    setIsNav(false);
    navigation.replace('Bookmark',{ animation: 'none' }); 
  };
  const clicklisting = async () => {
    setIsNav(false);
    navigation.replace('MyListing',{ animation: 'none' });
  };


  


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




  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        {activeTab === 'Home' && (
          <View
            style={[
              styles.header,
              { paddingTop: Platform.OS === 'ios' ? '13.7%' : 40 },
            ]}
          >
            <Animated.View
              style={[
                styles.headerRow,
                { transform: [{ translateY: translateY }] },
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  clicklisting();
                }}
              >
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
              <Image source={searchIcon} style={styles.searchIcon} />
              <TextInput
                style={styles.searchBar}
                placeholder="Search"
                placeholderTextColor="#ccc"
                onChangeText={setSearch}
                value={search}
                allowFontScaling={false}
                onFocus={() => {
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
                }}
              />
            </Animated.View>
          </View>
        )}

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          {activeTab === 'Search' ||
          activeTab === 'Profile' ||
          activeTab === 'Bookmark' ? (
            <View style={{ flex: 1 }}>
              <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
              />

              <AnimatedReanimated.View
                style={[
                  {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: Platform.OS === 'ios' ? 100 : 120,
                    zIndex: 0,
                  },
                  animatedBlurStyle,
                ]}
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
              <View
                style={{
                  position: 'absolute',
                  top: Platform.OS === 'ios' ? 70 : 60,
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 16,
                  zIndex: 0,
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    color: '#fff',
                    fontSize: 20,
                    fontWeight: '600',
                    fontFamily: 'Urbanist-SemiBold',
                  }}
                >
              
                  {activeTab === 'Search'
                    ? 'Transaction History'
                    : activeTab === 'Profile'
                    ? 'Profile'
                    : activeTab === 'Bookmark'
                    ? 'Messages'
                    : null}
                </Text>
              </View>
              <AnimatedReanimated.ScrollView
                scrollEventThrottle={16}
                onScroll={scrollHandler}
                style={{
                  flex: 1,
                  paddingTop: Platform.OS === 'ios' ? 126 : 120,
                }}
                showsVerticalScrollIndicator={false}
              >
                {activeTab === 'Search' ? (
                  <SearchScreenContent navigation={navigation} />
                ) : activeTab === 'Profile' ? (
                  <ProfileScreenContent navigation={navigation} />
                ) : activeTab === 'Bookmark' ? (
                  <BookmarkScreenContent navigation={navigation} />
                ) : null}
              </AnimatedReanimated.ScrollView>
            </View>
          ) : (
            // other tabs (Home, Add, etc)
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            >
              {renderActiveTabContent()}
            </ScrollView>
          )}
        </KeyboardAvoidingView>


        <Animated.View
          style={[
            styles.bottomTabContainer,
            { position: 'absolute', bottom: 0 },
            { transform: [{ translateY: bottomNaviationSlideupAnimation }] },
          ]}
        >
          {Platform.OS === 'ios' ? (
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
                reducedTransparencyFallbackColor="rgba(15, 21 ,131,0.8)"
                overlayColor="rgba(15, 21 ,131,0.8)"
              >
                <View
                  style={{
                    opacity: Platform.OS === 'ios' ? 0.4 : 0,
                    backgroundColor: 'rgba(0, 3, 65, 0.98)',
                    width: '100%',
                    height: '100%',
                    borderRadius: 25,
                  }}
                ></View>
              </BlurView>
            </View>
          ) : (
            <>
            
            </>
          )}

          <View style={[{ height: 48 }]}>
            <Animated.View
              style={[
                styles.bubble,
                {
                  width: tabWidth ,
                  transform: [{ translateX: bubbleX }],
                },
              ]}
            />
          </View>

          {tabs.map(({ key, icon, activeIcon }) => (
            <TouchableOpacity
              key={key}
              style={[styles.tabItem, { width: tabWidth }]}
              onPress={() => {
                setIsNav(false);
                navigation.setParams({ isNavigate: false });
                setActiveTab(key as any);
              }}
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
      <NewCustomToastContainer />
    </ImageBackground>
  );
};
//
export default DashBoardScreen;

const styles = StyleSheet.create({




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
    top: Platform.OS === 'ios' ? 70 : 60,
    width: Platform.OS === 'ios' ? '100%' : '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 11,
    alignSelf: 'center',
    pointerEvents: 'box-none',
  },
  backButtonContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 11,
    //top: 7,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },





   stepCircle: {
    width: 12,
    height: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  activeStepCircle: {
    backgroundColor: '#FFFFFF',
    width: 12,
    height: 12,
    flexShrink: 0,
    borderColor: '#ffffff4e',
    alignItems: 'center',
    borderRadius: 40,
    justifyContent: 'center',
    boxShadow: '0 0.833px 3.333px 0 rgba(0, 0, 0, 0.25);',
    shadowColor: '0 0.833px 3.333px rgba(0, 0, 0, 0.25)',
  },
  
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12
  },

  inactiveStepCircle: {
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    width: 12,
    height: 12,
    flexShrink: 0,
    borderColor: '#ffffff4e',
    alignItems: 'center',
    borderRadius: 40,
    justifyContent: 'center',
    boxShadow: '0 0.833px 3.333px 0 rgba(0, 0, 0, 0.25);',
    shadowColor: '0 0.833px 3.333px rgba(0, 0, 0, 0.25)',
  },
  search_container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 50,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    paddingVertical: 4,
    padding: (Platform.OS === 'ios'? 12:0),
    marginTop:(Platform.OS === 'ios' ? 16:20),
    height: 50,
    gap:(Platform.OS === 'ios' ? 8:0 )

  },
  searchIcon: {
    padding: (Platform.OS === 'ios'? 0:5),
   marginLeft: (Platform.OS === 'ios' ? 0 : 10),
     marginRight: (Platform.OS === 'ios' ? 0 : 6),
    height: 24,
    width: 24,
  },
  searchBar: {
    fontFamily: 'Urbanist-Medium',
    // marginLeft: -5,
    fontWeight: 500,
    fontSize: 17,
    color: '#fff',
    width: '90%',
    height: 40,
  },

  bottomTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '91.6%',
    marginBottom: Platform.OS === 'ios' ? 30 : 30,    
    borderRadius: 50,
    alignSelf: 'center',
    padding: 2,
    borderWidth: 0.4,
    borderColor: '#ffffff11',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor: 'rgba(0, 23, 128, 0.49)',
  
    borderEndEndRadius: 50,
    borderStartEndRadius: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomStartRadius: 50,
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',
    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',

    boxSizing: 'border-box',
    zIndex: 100,
  },
  tabItem: {
  },
  iconWrapper: {
    height: 50, //
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
    tabIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  bubble: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',    
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.18)',
    position: 'absolute',
   
    justifyContent: 'center',
    alignItems: 'center',
    
    left: 1,
    right: 1,
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
  },

  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  fullScreenContainer: {
    flex: 1,
    flexDirection: 'column',
    // gap: 12,
  },

  header: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical:6
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  MylistingsBackground: {
    height: 49,
    width: 49,

    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(97, 179, 255, 0.2) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow:
      '0 2px 8px 0 rgba(255, 255, 255, 0.2)inset 0 2px 8px 0 rgba(0, 0, 0, 0.2)',
    borderColor: '#ffffff36',
    borderWidth: 0.5,
  },
  iconSmall: {
    width: 25,
    height: 25,
  },
  unizyText: {
    color: '#FFFFFF',
    fontFamily: 'MonumentExtended-Regular',
    fontSize: 24,
    flex: 1,
    textAlign: 'center',
    
  },
  emptyView: {},

  productsWrapper: {
    flexDirection: 'column',
    paddingHorizontal: 12,
    marginHorizontal:1
  },

  row: {
    flexDirection: 'row',
    width: '100%',
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cardContainer: {
    height: 64,
    flexDirection: 'row',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical:19,
    alignItems: 'center',
    marginVertical:(Platform.OS === 'ios' ? 5: 5.5),
    marginHorizontal: (Platform.OS === 'ios' ? 5: 5.5),
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

  fullWidth: {
  },
  halfWidth: {
  
  },
  cardIcon: {
    width: 24,
    height: 24,
  },
  cardText: {
    color: '#FFF',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    paddingLeft: 9,
    flexShrink: 1,
  },

  featuredText: {
    color: '#FFF',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    marginTop: (Platform.OS === 'ios' ? 14 : 20),
    marginLeft: 16,
    marginBottom: (Platform.OS === 'ios' ? 16 : 20),
    paddingHorizontal: 6,
  },

  tabContent: {
    flex: 1,

  },
  tabContentText: {
    color: '#fff',
    fontSize: 20,
  },

  tabContent3: {
    flex: 1,
    padding: (Platform.OS === 'ios' ? 16 :20),
    paddingTop: Platform.OS === 'ios' ? '15.2%'  : 50,

  },
  tabContentText3: {
    color: '#fff',
    fontSize: 20,
    marginVertical: 12,
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600,
  },

  card: {
    height: 94,
    flexDirection: 'row',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical:16,
    alignItems: 'center',
    justifyContent:'center',
    flex:1,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.14) 100%)',
  },
  cardIcon1: {
    width: 36,
    height: 36,
    //marginRight: 12,
    resizeMode: 'center',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 600,
    fontFamily: 'Urbanist-SemiBold',
    color: '#fff',
  },
  cardDescription: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 6,
    fontFamily: 'Urbanist-Medium',
    fontWeight: 500,
  },
  iconBackground: {
    width: 75,
    height: 62,
    borderRadius: 16, 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    paddingVertical: 8,
    borderWidth: 0.4,
    borderColor: 'transparent',
    overflow:'hidden',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.15) 100%)',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.25)',
  },

  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width:'100%',
    paddingLeft:16,
    paddingRight:16,
    minHeight:230
    
  },


 emptyContainer: {
  //flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  width:'100%',
  height: (Platform.OS === 'ios' ? 290 : 300),
  backgroundColor: 'rgba(255, 255, 255, 0.06)',
  borderWidth: 0.3,
  borderColor: 'rgba(255, 255, 255, 0.08)',
  borderRadius:24,
  overflow:'hidden',
  //minHeight:'80%',
 marginBottom:20,
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
  fontWeight:600
},
overlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.5)',
},
popupContainer: {
  width: '85%',
  padding: 20,
  borderRadius: 24,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  alignItems: 'center',
  overflow: 'hidden',
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
},
popupLogo: {
  width: 64,
  height: 64,
  marginBottom: 20,
},
popupMainHeader: {
  color: 'rgba(255, 255, 255, 0.80)',
  fontFamily: 'Urbanist-SemiBold',
  fontSize: 20,
  fontWeight: '600',
  letterSpacing: -0.4,
  lineHeight: 28,
},
popupSubHeader: {
  color: 'rgba(255, 255, 255, 0.80)',
  fontFamily: 'Urbanist-Regular',
  fontSize: 14,
  fontWeight: '400',
  textAlign: 'center',
  marginTop: 6,
},
popupButton: {
  display: 'flex',
  width: '100%',
  height: 52,
  justifyContent: 'center',
  alignItems: 'center',
  gap: 4,
  borderRadius: 100,
  paddingTop: 6,
  paddingBottom: 6,
  backgroundColor: 'rgba(255, 255, 255, 0.56)',
  marginTop: 20,
  borderWidth: 0.5,
  borderColor: '#ffffff2c',
},
popupButtonText: {
  color: '#002050',
  textAlign: 'center',
  fontFamily: 'Urbanist-Medium',
  fontSize: 17,
  fontWeight: 500,
  letterSpacing: 1,
  width: '100%',
},
popupButtonCancel: {
  display: 'flex',
  width: '100%',
  height: 52,
  justifyContent: 'center',
  alignItems: 'center',
  gap: 4,
  borderRadius: 100,
  paddingTop: 6,
  paddingBottom: 6,
  backgroundColor: 'rgba(170, 169, 176, 0.56)',
  marginTop: 8,
  borderWidth: 0.5,
  borderColor: '#ffffff2c',
},
popupButtonTextCancel: {
  color: '#FFFFFF7A',
  textAlign: 'center',
  fontFamily: 'Urbanist-Medium',
  fontSize: 17,
  fontWeight: 500,
  letterSpacing: 1,
  width: '100%',
},
  logo: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },

});