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
} from 'react-native';
import ProductCard from '../../utils/ProductCard';

import AnimatedSlideUp from '../../utils/AnimatedSlideUp';
import LinearGradient from 'react-native-linear-gradient';

const mylistings = require('../../../assets/images/new_list_icon.png');
const mylistings1 = require('../../../assets/images/new_bookmark_icon.png');

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
  item: Product;
  fullWidth: boolean;
};



const iconMap: Record<string, any> = {
  Products: require('../../../assets/images/producticon.png'),
  Product: require('../../../assets/images/producticon.png'), // for API name
  Food: require('../../../assets/images/fod_icon.png'),
  Food2: require('../../../assets/images/fod_icon.png'), // match API data
  Accommodation: require('../../../assets/images/bed_icon.png'),
  Accomodation: require('../../../assets/images/bed_icon.png'), // API spelling
  Tuition: require('../../../assets/images/book.png'),
  'House Keeping': require('../../../assets/images/housekeeping.png'),
};



const ProductItem: React.FC<ProductItemProps> = ({ item, fullWidth }) => (
  <View
    style={[
      styles.cardContainer,
      fullWidth ? styles.fullWidth : styles.halfWidth,
    ]}
  >
    <Image source={item.icon} style={styles.cardIcon} />
    <Text
      style={[
        styles.cardText,
        fullWidth && { flexShrink: 1, textAlign: 'left', marginLeft: 8 },
      ]}
      numberOfLines={1}
    >
      {item.name}
    </Text>
  </View>
);


const SearchScreenContent = () => (
  <View style={styles.tabContent}>
    <Text style={styles.tabContentText}>🔎 Search Layout</Text>
  </View>
);
type AddScreenContentProps = {
  navigation: any;
};

const AddScreenContent: React.FC<AddScreenContentProps & { products: any[] }> = ({ navigation, products }) => (
  <View style={styles.tabContent3}>
    <Text style={styles.tabContentText3}>List Product</Text>
    <AnimatedSlideUp>
    
    <View>
      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('AddScreen', {
                productId: item.id,
                name: item.name,
              });
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
      </View>
    </AnimatedSlideUp>
  </View>
);

const BookmarkScreenContent = () => (
  <View style={styles.tabContent}>
    <Text style={styles.tabContentText}>🔖 Bookmark Layout</Text>
  </View>
);
const ProfileScreenContent = () => (
  <View style={styles.tabContent}>
    <Text style={styles.tabContentText}>👤 Profile Layout</Text>
  </View>
);

type DashBoardScreenProps = {
  navigation: any;
};

const DashBoardScreen = ({ navigation }: DashBoardScreenProps) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<
    'Home' | 'Search' | 'Add' | 'Bookmark' | 'Profile'
  >('Home');

  const screenWidth = Dimensions.get('window').width;
  //const tabWidth = screenWidth / 5;
  const tabsname = ['Home', 'Search', 'Add', 'Bookmark', 'Profile'];

  const tabWidth = (screenWidth * 0.9) / tabsname.length; // match container width = 90%

  const bubbleX = useRef(new Animated.Value(0)).current;




 const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://65.0.99.229:4320/user/category');
        const json = await res.json();
        // Filter only active categories and map to your local icon structure
        const mapped = json.data
          .filter((cat: any) => cat.isactive) // only active
          .map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            icon: iconMap[cat.name] || require('../../../assets/images/producticon.png'), // fallback icon
          })).slice(0,5)
        setProducts(mapped);
      } catch (err) {
        console.error('Error fetching categories', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);




  //Animation For all components variables.
  const screenHeight = Dimensions.get('window').height;
  const translateY = React.useRef(new Animated.Value(screenHeight)).current;
  const searchBartranslateY = React.useRef(
    new Animated.Value(screenHeight),
  ).current;
  const categorytranslateY = React.useRef(
    new Animated.Value(screenHeight),
  ).current;

  const leftItemTranslateX = useRef(new Animated.Value(-300)).current; // from left
  const rightItemTranslateX = useRef(new Animated.Value(300)).current; // from right
  const cardSlideupAnimation = useRef(new Animated.Value(screenHeight)).current;
  const bottomNaviationSlideupAnimation = useRef(
    new Animated.Value(screenHeight),
  ).current;

  useEffect(() => {
    if (activeTab === 'Home') {
      translateY.setValue(-screenWidth);
      searchBartranslateY.setValue(-screenWidth);
      categorytranslateY.setValue(-screenWidth);
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
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      Animated.timing(leftItemTranslateX, {
        toValue: 0,
        duration: 1200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      Animated.timing(rightItemTranslateX, {
        toValue: 0,
        duration: 1200,
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
          duration: 1000,
          delay: i * 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      );
      Animated.stagger(200, animations).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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
            styles.row,
            { transform: [{ translateY: categorytranslateY }] },
          ]}
          key={products[0].id}
        >
          <ProductItem item={products[0]} fullWidth />
        </Animated.View>,
      );
      startIndex = 1;
    }

    for (let i = startIndex; i < products.length; i += 2) {
      i === 0 && rows.push(
      <View style={styles.row} key={i} />);
      const rowItems = products.slice(i, i + 2);
      console.log('RowITEM: ', rowItems);
      rows.push(
        <View style={{ flexDirection: 'row' }} key={i}>
          {rowItems.map((item, index) => (
          <Animated.View
            key={item.id}
            style={[
              index === 0 ? styles.halfWidth : styles.halfWidth, // keep same base width
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
    <ProductItem item={item} fullWidth={false} />
  </Animated.View>
))}
          {rowItems.length === 1 && <View style={styles.halfWidth} />}
        </View>,
      );
    }
    return rows;
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <>
          <TouchableOpacity onPress={() => navigation.navigate('ProductDetails')} >
            <View style={styles.productsWrapper}>{renderProducts()}</View></TouchableOpacity>
             <Animated.View 
              style={{
                    transform: [{ translateY: cardSlideupAnimation }],
                  }}>
                  <Text style={styles.featuredText}>Featured Listings</Text>    
             </Animated.View>
            
            <ScrollView
              style={[{ paddingHorizontal: 6 }]}
              horizontal
              showsHorizontalScrollIndicator={false}>
              {[1, 2, 3].map((_, index) => (
                <Animated.View
                  key={index}
                  style={{
                    transform: [{ translateY: cardSlideupAnimation }],
                    marginRight: 10,
                  }}
                >
                  <ProductCard  
                  tag='University of Warwick' 
                  infoTitle='Quadcopter (Drone)'
                  inforTitlePrice='$10.00'
                  rating='4.5'
                  productImage={require("../../../assets/images/drone.png")}/>
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
        return <ProfileScreenContent />;
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

  return (
    <ImageBackground
      source={require('../../../assets/images/bganimationscreen.png')}
      style={styles.background}
    >
      <View style={styles.fullScreenContainer}>
        {/* Header visible only on Home */}
        {activeTab === 'Home' && (
          <View style={styles.header}>
            <Animated.View
              style={[
                styles.headerRow,
                { transform: [{ translateY: translateY }] },
              ]}
            >
              <View style={styles.MylistingsBackground}>
                <Image source={mylistings} style={styles.iconSmall} />
              </View>

              <Text style={styles.unizyText}>UniZy</Text>

              <View style={styles.emptyView}>
                <View style={styles.MylistingsBackground}>
                  <Image source={mylistings1} style={styles.iconSmall} />
                </View>
              </View>
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
              />
            </Animated.View>
          </View>
        )}

        {/* Main Content */}

        <View style={{ flex: 1 }}>{renderActiveTabContent()}</View>

        {/* Bottom Tab Bar */}
        <Animated.View
          style={[
            styles.bottomTabContainer,
            { transform: [{ translateY: bottomNaviationSlideupAnimation }] },
          ]}
        >
          {/* Bubble background */}
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
              onPress={() => setActiveTab(key as any)}
            >
              <View style={styles.iconWrapper}>
                <Image
                  source={activeTab === key ? activeIcon : icon} // <-- choose icon based on active tab
                  style={styles.tabIcon}
                />
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>
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
    marginTop: 20,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
  },
  searchIcon: {
    padding: 5,
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
  },

  bottomTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    marginBottom: 20,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'center', // center horizontally
    position: 'relative', // important for absolute bubble
    paddingHorizontal: 4,
  },
  tabItem: {
    //justifyContent: 'center',
    //alignItems: 'center',
  },
  iconWrapper: {
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    width: 22,
    height: 22,
    tintColor: '#fff',
    resizeMode: 'contain',
  },
  activeTabIcon: {
    //tintColor: '#ccc',
  },
  bubble: {
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    //borderRadius: 40,
    position: 'absolute',

    justifyContent: 'center', // center icon vertically
    alignItems: 'center',
    //paddingHorizontal: 12,
    //paddingVertical: 8,

    left: 3,
    right: 3,

    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
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
  },

  header: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  MylistingsBackground: {
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
  iconSmall: {
    width: 48,
    height: 48,
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
    marginTop: 2,
  },
  row1: {
    flexDirection: 'row',
    marginTop: 2,
    justifyContent: 'space-between',
  },

  cardContainer: {
    height: 56,
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    margin: 4,
    borderWidth: 0.4,
    borderColor: '#ffffff36',
    borderTopLeftRadius: 16,
    borderBottomRightRadius: 16,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',

    // borderTopColor: '#ffffff79',
    // borderBottomColor: '#ffffff95',
    // borderLeftColor: '#ffffff2f',
    // borderRightColor: '#ffffff2f',
  },


fullWidth: {
  flex: 1,
  justifyContent: 'flex-start',
},
halfWidth: {
  flex: 1, 
  maxWidth: '100%',
  maxHeight: '100%',
  height: 60,
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
    paddingLeft: 12,
    flexShrink: 1,
  },

  featuredText: {
    color: '#FFF',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginLeft: 16,
    marginBottom: 10,
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
  },
  tabContentText3: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600,
  },

  card: {
    height: 85,
    flexDirection: 'row',
    //backgroundColor: '#ffffff20', // semi-transparent for dark bg
    borderRadius: 24,
    padding: 16,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',

    borderWidth: 0.3,
    borderColor: '#ffffff25',
    backgroundColor:
      'rgba(255, 255, 255, 0.06)',
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
    paddingHorizontal: 12,

    borderWidth: 0.9,
    borderColor: '#ffffff2c',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.13)inset',
 
  },
});