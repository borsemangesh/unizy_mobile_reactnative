import React, { JSX, useEffect, useRef, useState } from 'react';
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
} from 'react-native';

const bgImage = require('../../../assets/images/backimg.png');
import ProductCard from '../../utils/ProductCard';

import AnimatedSlideUp from '../../utils/AnimatedSlideUp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Navigation } from '../Navigation';
import { MAIN_URL } from '../../utils/APIConstant';
import TutitionCard from '../../utils/TutitionCard';
import ProfileCard from './ProfileCard';
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';
import { RouteProp, useRoute } from '@react-navigation/native';

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
  fullWidth: boolean;
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
  fullWidth,
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
      <Text style={styles.cardText} numberOfLines={1}>
        {item.name}
      </Text>
    </View>
  </TouchableOpacity>
);

const SearchScreenContent = () => (
  <View style={styles.tabContent}>
    <Text style={styles.tabContentText}>🔎 Search Layout</Text>
  </View>
);
type AddScreenContentProps = {
  navigation: any;
};

const AddScreenContent: React.FC<
  AddScreenContentProps & { products: any[] }
> = ({ navigation, products }) => (
  <View style={styles.tabContent3}>
    <Text style={styles.tabContentText3}>List Product</Text>
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
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </AnimatedSlideUp>
  </View>
);

const BookmarkScreenContent = () => (
  <View style={styles.tabContent}>
    <Text style={styles.tabContentText}>🔖 Bookmark Layout</Text>
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


  useEffect(() => {
    setIsNav(route.params?.isNavigate);
    console.log('useEffect_IsNav', isNav,route.params?.isNavigate);
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

    const fetchFeatures = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;
        const url1 = MAIN_URL.baseUrl + 'category/feature-list';

        const res = await fetch(url1, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        console.log('✅ Features API response:', json);

        if (json.statusCode === 200) {
          setFeatures(json.data.features || []);
        }
      } catch (err) {
        console.log('❌ Error fetching features:', err);
      }
    };

    fetchFeatures();

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
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [activeTab, bubbleX, tabWidth]);

 
  const renderProducts = () => {
    const isEven = products.length % 2 === 0;
    let startIndex = 0;
    const rows: JSX.Element[] = [];

    if (!isEven) {
      rows.push(
        <Animated.View
          style={[
            { width: '100%' }, 
            { transform: [{ translateY: categorytranslateY }] },
          ]}
          key={products[0].id}
        >
          <ProductItem navigation={navigation} item={products[0]} fullWidth />
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
                styles.halfWidth,
                {
                  transform: [
                    {
                      translateX:
                        index === 0 ? leftItemTranslateX : rightItemTranslateX,
                    },
                  ],
                },
              ]}
            >
              <ProductItem
                navigation={navigation}
                item={item}
                fullWidth={false}
              />
            </Animated.View>
          ))}
          {rowItems.length === 1 && <View style={styles.halfWidth} />}
        </View>,
      );
    }
    return rows;
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
              <Text style={styles.featuredText}>Featured Listings</Text>
            </Animated.View>
            <ScrollView
              style={{ paddingHorizontal: 0,marginLeft:8 }}
              horizontal
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
                        navigation.navigate('SearchDetails', { id: item.id },{ animation: 'none' })
                      }}
                    />
                  )}
                </Animated.View>
              ))}
            </ScrollView>
          </>
        );
      case 'Search':
        return <SearchScreenContent />;
      case 'Add':
        return <AddScreenContent navigation={navigation} products={products} />;
      case 'Bookmark':
        return <BookmarkScreenContent />;
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
              { paddingTop: Platform.OS === 'ios' ? 50 : 40 },
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

              <Text style={styles.unizyText}>UniZy</Text>

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
                onFocus={() => navigation.navigate('SearchPage',{ animation: 'none' })}
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
            <View style={{ flex: 1 }}>{renderActiveTabContent()}</View>
          </ScrollView>
        </KeyboardAvoidingView>
        <Animated.View
          style={[
            styles.bottomTabContainer,
            { transform: [{ translateY: bottomNaviationSlideupAnimation }] },
          ]}
        >
          <View style={{ height: 48 }}>
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
                setActiveTab(key as any);
                setIsNav(true);
                navigation.setParams({isNavigate:false})
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
  },
  searchIcon: {
    padding: (Platform.OS === 'ios'? 0:5),
    margin: 10,
    height: 24,
    width: 24,
  },
  searchBar: {
    fontFamily: 'Urbanist-Medium',
    marginLeft: -5,
    fontWeight: 500,
    fontSize: 17,
    color: '#fff',
    width: '80%',
  },

  bottomTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '6%',
    marginBottom: 20,
    borderRadius: 50,
    alignSelf: 'center',
    // position: 'relative',
    paddingHorizontal: 4,
    borderWidth: 0.4,
    padding: 12,
    margin: 4,
    borderColor: '#ffffff11',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',
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
    width: 24,
    height: 24,
    //tintColor: '#fff',
    resizeMode: 'contain',
  },
  bubble: {
    // height: 48,
    height: '88%',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',    
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.18)',

    position: 'absolute',

    justifyContent: 'center',
    alignItems: 'center',
    top: 3,
    left: 3,
    right: 3,
    borderWidth: 0.5,
    borderColor: '#ffffff2e',

    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,

    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',

    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
  },

  activeIconWrapper: {
    // backgroundColor: 'rgba(255,255,255,0.2)', // highlight active tab
  },

  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  fullScreenContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 12,
  },

  header: {
    flexDirection: 'column',
    alignItems: 'center',

    // paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 13,
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
    paddingHorizontal: 12,
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
    height: 56,
    flexDirection: 'row',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    margin: 4,
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
    // flex: 1,
    // justifyContent: 'flex-start',
    width: '100%',
    maxWidth: '100%',
    // maxHeight: '100%',
  },
  halfWidth: {
    flex: 1,
    // maxWidth: '90%',
    // maxHeight: '100%',
    // width: '90%',
    // height: 60,
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
    marginTop: 20,
    marginLeft: 16,
    marginBottom: 20,
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
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
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
    height: 85,
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
    width: 30,
    height: 30,
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

    borderWidth: 1,
    borderColor: '#ffffff2c',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.02)inset -1px 10px 5px 10px',
  },
});