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
} from 'react-native';

const bgImage = require('../../../assets/images/backimg.png');
import ProductCard from '../../utils/ProductCard';
// import messaging from "@react-native-firebase/messaging";

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
      <Text allowFontScaling={false} style={styles.cardText} numberOfLines={1}>
        {item.name}
      </Text>
    </View>
  </TouchableOpacity>
);
type TransactionScreenProps = {
  navigation: any;
};

const SearchScreenContent = (navigation: TransactionScreenProps) => (
  <View style={styles.tabContent}>
    {/* <Text allowFontScaling={false} style={styles.tabContentText}>🔎 Search Layout</Text> */}
    <TransactionHistoryScreen navigation ={navigation}/>
  </View>
);
type AddScreenContentProps = {
  navigation: any;
};

const AddScreenContent: React.FC<
  AddScreenContentProps & { products: any[] }
> = ({ navigation, products }) => (
  <View style={styles.tabContent3}>
    <Text allowFontScaling={false} style={[styles.tabContentText3,{paddingBottom:16}]}>List Product</Text>
    <AnimatedSlideUp>
      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity       
            onPress={() => {
              navigation.replace('AddScreen', {
                productId: item.id,
                productName: item.name,
              },{ animation: 'none' });
            }}
          >
            <View style={styles.card}>
              <View style={styles.iconBackground}>
                <Image source={item.icon} style={styles.cardIcon1} />
              </View>

              <View style={styles.cardTextContainer}>
                <Text allowFontScaling={false} style={styles.cardTitle}>{item.name}</Text>
                <Text allowFontScaling={false} style={styles.cardDescription}>{item.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </AnimatedSlideUp>
  </View>
);

type ChatProps = {
  navigation: any;
};

const BookmarkScreenContent = ({ navigation }: ChatProps) => (
  <View style={[styles.tabContent]}>
    {/* <Text allowFontScaling={false} style={styles.tabContentText}>🔖 Bookmark Layout</Text> */}
    <MessagesScreen navigation={navigation}/>

  </View>
);

type ProfileScreenContentProps = {
  navigation: any;
};
const ProfileScreenContent = ({ navigation }: ProfileScreenContentProps) => (
  <View style={styles.tabContent}>
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
  //const tabWidth = screenWidth / 5;
  const tabsname = ['Home', 'Search', 'Add', 'Bookmark', 'Profile'];

  const tabWidth = (screenWidth * 0.9) / tabsname.length;

  const bubbleX = useRef(new Animated.Value(0)).current;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<any[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const route = useRoute<DashboardRouteProp>();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { width } = Dimensions.get('window');

const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setIsNav(route.params?.isNavigate);
    // console.log('useEffect_IsNav', isNav,route.params?.isNavigate);
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

    // const fetchFeatures = async () => {
    //   try {
    //     const token = await AsyncStorage.getItem('userToken');
    //     if (!token) return;
    //     const url1 = MAIN_URL.baseUrl + 'category/feature-list';

    //     const res = await fetch(url1, {
    //       headers: { Authorization: `Bearer ${token}` },
    //     });

    //     const json = await res.json();
    //     console.log('✅ Features API response:', json);

    //     if (json.statusCode === 200) {
    //       setFeatures(json.data.features || []);
    //     }
    //   } catch (err) {
    //     console.log('❌ Error fetching features:', err);
    //   }
    // };

    // fetchFeatures();

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
        }
        if(json.statusCode === 401 || json.statusCode === 403){
          navigation.reset({
          index: 0,
          routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
        });
        }
      } catch (err) {
        console.log('❌ Error fetching features:', err);
      }
    };

    fetchFeatures();
  }, [])
);

//  useEffect(() => {
//     sendDeviceTokenToServer();
//   }, []);


//   const sendDeviceTokenToServer = async () => {
//     try {

//     const token = await AsyncStorage.getItem('userToken');
//     if (!token) return;

//     const url1 = MAIN_URL.baseUrl + 'user/devicetoken';
//     console.log('📤 FCM URL:', url1);
//     // const fcmToken = await messaging().getToken();
//     // console.log('📤 FCM fcmToken:', fcmToken);
//     const fcmToken = "";
//     const requestBody = {
//           device_token: fcmToken,
//           device_type  : Platform.OS,
//         };
//     console.log('Body:', JSON.stringify(requestBody));
//     const response = await fetch(url1, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//       body: JSON.stringify(requestBody),
//     });

//     if (response.ok) {
//       console.log('✅ FCM token sent to server successfully');
//     } else {
//       const error = await response.text();
//       console.log('❌ Server error:', error);
//     }
//   } catch (error) {
//     console.error('❌ Error sending token to server:', error);
//   }

//   };
  
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

 
  // const renderProducts = () => {
  //   const isEven = products.length % 2 === 0;
  //   let startIndex = 0;
  //   const rows: JSX.Element[] = [];

  //   if (!isEven) {
  //     rows.push(
  //       <Animated.View
  //         style={[
  //           { width: '100%' }, 
  //           { transform: [{ translateY: categorytranslateY }] },
  //         ]}
  //         key={products[0].id}
  //       >
  //         <ProductItem navigation={navigation} item={products[0]} fullWidth />
  //       </Animated.View>,
  //     );
  //     startIndex = 1;
  //   }

  //   for (let i = startIndex; i < products.length; i += 2) {
  //     const rowItems = products.slice(i, i + 2);

  //     rows.push(
  //       <View style={styles.row} key={i}>
  //         {rowItems.map((item, index) => (
  //           <Animated.View
  //             key={item.id}
  //             style={[
  //               styles.halfWidth,
  //               {
  //                 transform: [
  //                   {
  //                     translateX:
  //                       index === 0 ? leftItemTranslateX : rightItemTranslateX,
  //                   },
  //                 ],
  //               },
  //             ]}
  //           >
  //             <ProductItem
  //               navigation={navigation}
  //               item={item}
  //               fullWidth={false}
  //             />
  //           </Animated.View>
  //         ))}
  //         {rowItems.length === 1 && <View style={styles.halfWidth} />}
  //       </View>,
  //     );
  //   }
  //   return rows;
  // };

const [activeIndex, setActiveIndex] = useState(0);
const scrollX = useRef(new Animated.Value(0)).current;

const renderProducts = () => {
  const isEven = products.length % 2 === 0;
  let startIndex = 0;
  const rows: JSX.Element[] = [];

  if (products.length <= 6) {
    // ✅ Old grid layout (no change)
    if (!isEven) {
      rows.push(
        <Animated.View
          style={[
            // { width: '80%' },
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
        // <View style={styles.row} key={i}>
        //   {rowItems.map((item, index) => (
        //     <Animated.View
        //       key={item.id}
        //       style={[
        //         // styles.halfWidth,
        //         {
        //           transform: [
        //             {
        //               translateX:
        //                 index === 0 ? leftItemTranslateX : rightItemTranslateX,
        //             },
        //           ],
        //         },
        //       ]}
        //     >
        //       <ProductItem navigation={navigation} item={item} />
        //     </Animated.View>
        //   ))}
        // </View>

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

  {/* Add empty placeholder if only one item */}
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
    //ref={scrollViewRef}
      horizontal
       pagingEnabled={false} 
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      onScroll={onScroll}
      onMomentumScrollEnd={handleScrollEnd}
      //onScrollEndDrag={handleScrollEndDrag}

      scrollEventThrottle={16}
    >
  {pages.map((page, pageIndex) => (
    <View key={pageIndex} style={{ width, flexDirection: 'row',padding:10,}}>
      {/* Left column */}
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

      {/* Right column */}
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
              {' '}
              <Text allowFontScaling={false} style={styles.featuredText}>Featured Listings</Text>
            </Animated.View>
            <ScrollView
             directionalLockEnabled={true} 
              style={{ paddingHorizontal: 0,marginLeft:8 }}
              horizontal
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              {features.map(item => (
                <Animated.View
                  key={item.id}
                  style={{
                    transform: [{ translateY: cardSlideupAnimation }],
                  }}
                >
                  {item.profileshowinview ? (
                    <TutitionCard
                      tag={item.university?.name || 'University of Warwick'}
                      title={item.title}
                      infoTitle={`${item.createdby?.firstname || ''} ${
                        item.createdby?.lastname || ''
                      }`}
                      inforTitlePrice={`£ ${item.price}`}
                      rating="4.5"
                      productImage={{ uri: item.createdby?.profile }}
                      onBookmarkPress={() => handleBookmarkPress(item.id)}
                      isBookmarked={item.isbookmarked}
                      onpress={() =>{
                        navigation.navigate('SearchDetails', { id: item.id },{ animation: 'none' })
                      }}
                    />
                  ) : (
                    <ProductCard
                      tag={item.university?.name || 'University of Warwick'}
                      infoTitle={item.title}
                      inforTitlePrice={`£ ${item.price}`}
                      rating="4.5"
                      productImage={{ uri: item.thumbnail }}
                      onBookmarkPress={() => handleBookmarkPress(item.id)}
                     isBookmarked={item.isbookmarked}
                      onpress={() =>{
                        navigation.replace('SearchDetails', { id: item.id },{ animation: 'none' })
                      }}
                    />
                  )}
                </Animated.View>
              ))}
            </ScrollView>
          </>
        );
      case 'Search':
        return <SearchScreenContent  navigation={navigation}/>;
      case 'Add':
        return <AddScreenContent navigation={navigation} products={products} />;
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

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        {activeTab === 'Home' && (
          <View
            style={[
              styles.header,
              { paddingTop: Platform.OS === 'ios' ? '12%' : 40 },
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

              <Text allowFontScaling={false} style={styles.unizyText}>UniZy</Text>

              <TouchableOpacity onPress={clickbookmark}>
                <View style={styles.MylistingsBackground}>
                  <Image source={mylistings1} style={styles.iconSmall} />
                </View>
              </TouchableOpacity>
            </Animated.View>
{/* 
            <LiquidGlassView
      style={[
        { width: 200, height: 100, borderRadius: 20 },
        !isLiquidGlassSupported && { backgroundColor: 'rgba(255,255,255,0.5)' }
      ]}
      interactive
      effect="clear"
    >
      <Text style={{ fontWeight: '600' }}>Hello World</Text>
    </LiquidGlassView> */}

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
                onFocus={() => navigation.navigate('SearchPage',{ animation: 'none' ,from: 'Dashboard'})}
              />
            </Animated.View>
          </View>
        )}

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} 
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 10 }} 
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flex: 1,paddingTop: Platform.OS === 'ios' ? 4 : 0 }}>{renderActiveTabContent()}</View>
          </ScrollView>

        </KeyboardAvoidingView>
        
        <Animated.View
          style={[
            styles.bottomTabContainer,{position: 'absolute',bottom: 0},
            { transform: [{ translateY: bottomNaviationSlideupAnimation }] },
          ]}
          >
        
   
            <View style={[StyleSheet.absoluteFill, { borderRadius: 30, backgroundColor: 'transparent'}]}>
            <BlurView
              style={[StyleSheet.absoluteFill, { borderRadius: 30, backgroundColor: 'transparent',}]}
              blurType='light'
              blurAmount={1.3}
              reducedTransparencyFallbackColor="rgba(15, 21 ,131,0.8)"
              overlayColor="rgba(15, 21 ,131,0.8)"
            >
              <View style={{opacity: 0.4, backgroundColor: 'rgba(0, 3, 65, 0.98)', width: '100%', height: '100%',}}></View>

              </BlurView>
          </View>
                    
          
          
          <View style={[{ height: 48, }]}>
           
          
            <Animated.View
              style={[
                styles.bubble,
                {
                  width: tabWidth - 6,
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
    height: 48,
    gap: 8
  },
  searchIcon: {
    padding: (Platform.OS === 'ios'? 0:5),
    margin: (Platform.OS === 'ios'? 0:10),
    height: 24,
    width: 24,
  },
  searchBar: {
    fontFamily: 'Urbanist-Medium',
    // marginLeft: -5,
    fontWeight: 500,
    fontSize: 17,
    color: '#fff',
    width: '80%',
  },

  bottomTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '6.5%',
    //marginBottom: 20,
    marginBottom: Platform.OS === 'ios' ? 30 : 30,    
    borderRadius: 50,
    alignSelf: 'center',
    // position: 'relative',
    padding: 4,
    borderWidth: 0.4,
    //padding: 12,
    margin:4,
    borderColor: '#ffffff11',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor: 'rgba(0, 23, 128, 0.49)',
    // backgroundColor:
    //   'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',
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
    // position: 'absolute',
    // bottom: 0,
  },
  tabItem: {
    //justifyContent: 'center',
    //alignItems: 'center',
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
    //tintColor: '#fff',
    resizeMode: 'contain',
  },
  bubble: {
    //height: 48,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',    
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.18)',
    position: 'absolute',
   
    justifyContent: 'center',
    alignItems: 'center',
    
    left: 3,
    right: 3,
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

    // paddingBottom: 12,
    paddingHorizontal: 16,
    marginVertical:6
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
   // paddingBottom: 13,
  },

  MylistingsBackground: {
    height: 48,
    width: 48,

    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(97, 179, 255, 0.2) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow:
      '0 2px 8px 0 rgba(255, 255, 255, 0.2)inset 0 2px 8px 0 rgba(0, 0, 0, 0.2)',

    borderTopColor: '#ffffff5d',
    borderBottomColor: '#ffffff36',
    borderLeftColor: '#ffffff5d',
    borderRightColor: '#ffffff36',
    borderWidth: 0.3,
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
    //paddingHorizontal: 12,
    marginHorizontal:12
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
    //width: '100%',
   // maxWidth: '100%',
  },
  halfWidth: {
   // flex: 0.48,
   // width:'40%',
    //justifyContent:'flex-start'
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContentText: {
    color: '#fff',
    fontSize: 20,
  },

  //list product tab

  tabContent3: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
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
    //backgroundColor: '#ffffff20', // semi-transparent for dark bg
    borderRadius: 24,
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',

    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.14) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.02) -1px 10px 5px 10px',
  },
  cardIcon1: {
    width: 32.5,
    height: 32.5,
    //marginRight: 12,
    resizeMode: 'contain',
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
    borderRadius: 16, // adjust for rounded square / circle
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    paddingVertical: 8,

    //borderWidth: 0.4,
    borderColor: 'transparent',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.15) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.02)inset -1px 10px 5px 10px,rgba(236, 232, 232, 0.51)inset -0.99px -0.88px 0.90px 0px,rgba(236, 232, 232, 0.51)inset 0.99px 0.88px 0.90px 0px',
  },
});