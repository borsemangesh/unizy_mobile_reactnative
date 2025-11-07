import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  StyleSheet as RNStyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
const bgImage = require('../../../assets/images/backimg.png');
import MyListingCard from '../../utils/MyListingCard';
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
type Feature = {
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
  };
};
type university = {
  id: number;
  name: string;
};

type MyListingProps = {
  navigation: any;
};
interface AnimatedBlurViewProps {
  scrollY: Animated.Value;
  blurValue: number;
}

// THEN the MyListing component
// REPLACE your entire component with this simplified version

const MyListing = ({ navigation }: MyListingProps) => {
  const [featurelist, setFeaturelist] = useState<Feature[]>([]);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pagesize = 10;
  const [featureList, setFeatureList] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = Dimensions.get('window');

  type Category = {
    id: number | null;
    name: string;
  };

  const scrollY = useRef(new Animated.Value(0)).current;

  const [categories, setCategories] = useState<Category[]>([
    { id: null, name: 'All' },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<Category>({
    id: null,
    name: 'All',
  });

  useFocusEffect(
    useCallback(() => {
      // This will run every time the screen comes into focus
      setPage(1);
      displayListOfProduct(selectedCategory?.id ?? null, 1);

      // Optional cleanup if needed
      return () => {};
    }, []),
  );

  useEffect(() => {
    const loadCategories = async () => {
      const stored = await AsyncStorage.getItem('categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        const catObjects = [
          { id: null, name: 'All' },
          ...parsed.map((cat: any) => ({ id: cat.id, name: cat.name })),
        ];
        setCategories(catObjects);
        setSelectedCategory(catObjects[0]);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    setPage(1);
    displayListOfProduct(selectedCategory?.id ?? null, 1);
  }, [selectedCategory]);

  const displayListOfProduct = async (
    categoryId: number | null,
    pageNum: number,
  ) => {
    try {
      const pagesize = 10;
      let url = `${MAIN_URL.baseUrl}category/mylisting?page=${pageNum}&pagesize=${pagesize}`;
      if (categoryId) {
        url += `&category_id=${categoryId}`;
      }

      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const jsonResponse = await response.json();

      if (jsonResponse.statusCode === 200) {
        setIsLoading(false);
        if (pageNum === 1) {
          setFeatureList(jsonResponse.data.features);
        } else {
          setFeatureList(prev => [...prev, ...jsonResponse.data.features]);
        }
      } else if (
        jsonResponse.statusCode === 401 ||
        jsonResponse.statusCode === 403
      ) {
        setIsLoading(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
        });
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
      console.log('Error:', err);
    }
  };

  const renderItem = ({ item, index }: { item: Feature; index: number }) => {
    const displayDate = formatDate(item.created_at);
    const displayTitle =
      item.title && item.title.trim() !== '' ? item.title : 'Title';
    const displayPrice = item.price != null ? item.price : 0;
    const productImage = item.thumbnail
      ? { uri: item.thumbnail }
      : require('../../../assets/images/drone.png');
    
    // Get category name from item or find from categories list
    const categoryName = item.category?.name || 
      categories.find(cat => cat.id === item.category_id)?.name || 
      '';

    return (
      <View style={[styles.itemContainer]}>
        <MyListingCard
          tag={item.university?.name || 'University of Warwick'}
          infoTitle={displayTitle}
          inforTitlePrice={`£ ${displayPrice}`}
          rating={displayDate}
          productImage={productImage}
          topRightText={item.isactive ? 'Active' : 'Inactive'}
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
        />
      </View>
    );
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString.trim() === '') return '01-01-2025';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '01-01-2025';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />

        {/* Header */}
        <View style={styles.header}>
          {/* Progressive Blur Layer - fades in on scroll, blur starts from bottom */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                opacity: scrollY.interpolate({
                  inputRange: [0, 80],
                  outputRange: [0, 1], // Invisible at top, visible when scrolled
                  extrapolate: 'clamp',
                }),
              },
            ]}
            pointerEvents="none"
          >
            {/* BlurView - matches backdrop-filter: blur(5px) */}
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType={Platform.OS === 'ios' ? 'light' : 'light'}
              blurAmount={5}
              reducedTransparencyFallbackColor="transparent"
            />

            {/* Gradient overlay to fade out blur smoothly from top to bottom */}
            <LinearGradient
              colors={[
                'rgba(0, 50, 150, 0.3)', // Top: More opaque (less blur visible)
                'rgba(0, 50, 150, 0.6)', // Middle: Less opaque
                'transparent', // Bottom: Transparent (full blur visible)
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Header Content - stays on top */}
          <Animated.View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              zIndex: 10,
              position: 'relative',
            }}
          >
            <TouchableOpacity
              onPress={() =>
                navigation.replace('Dashboard', {
                  AddScreenBackactiveTab: 'Home',
                  isNavigate: false,
                })
              }
              style={styles.backButtonContainer}
            >
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>

            <Text allowFontScaling={false} style={styles.unizyText}>My Listings</Text>
          </Animated.View>
        </View>
        {/* List */}
        <View style={{ flex: 1 }}>
          <Animated.FlatList
            data={featureList}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            ListHeaderComponent={
              <View style={styles.categoryTabsContainer}>
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
                      >
                        <View
                          style={isSelected ? styles.tabcard : styles.tabcard1}
                        >
                          <Text
                            allowFontScaling={false}
                            style={isSelected ? styles.tabtext : styles.othertext}
                          >
                            {cat.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            }
            contentContainerStyle={[
              styles.listContainer,
              { paddingTop: Platform.OS === 'ios' ? 100 : 100 },
            ]}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false },
            )}
            scrollEventThrottle={16}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              displayListOfProduct(selectedCategory?.id ?? null, nextPage);
            }}
            ListFooterComponent={
              isLoadingMore ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={{ marginVertical: 12 }}
                />
              ) : null
            }
            ListEmptyComponent={
              !isLoading ? (
                <Text
                  allowFontScaling={false}
                  style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}
                >
                  No Listings Found
                </Text>
              ) : null
            }
          />
        </View>
      </View>
      <NewCustomToastContainer />
    </ImageBackground>
  );
}

export default MyListing;

const styles = StyleSheet.create({
  categoryTabsContainer: {
    // paddingHorizontal: 16,
    marginBottom: 12,
    width: Platform.OS === 'ios' ? 393 : '100%',

  },
  categoryTabsScrollContent: {
    paddingRight: 16,
  },
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
    boxShadow:
      'rgba(255, 255, 255, 0.02)inset -1px 10px 5px 10px,rgba(236, 232, 232, 0.3)inset -0.99px -0.88px 0.90px 0px,rgba(236, 232, 232, 0.3)inset 0.99px 0.88px 0.90px 0px',
  },
  tabcard1: {
    minHeight: 38,
    borderWidth: 0.4,
    borderColor: '#ffffff',
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
    marginTop: 10,
  },
  // header: {
  //   paddingTop: Platform.OS === 'ios' ? 42 : 50,
  //   paddingBottom: 12,
  //   paddingHorizontal: 16,
  // },
  header: {
    position: 'absolute',
    top: 0,
    width: Platform.OS === 'ios' ? 393 : '100%',
    zIndex: 20,
   paddingTop: Platform.OS === 'ios' ? 50 : 40 ,
    paddingBottom: Platform.OS === 'ios' ? 16 : 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    overflow: 'hidden', // IMPORTANT for MaskedView
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
    left: 0,
    zIndex: 11,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIconRow: {
    width: 48,
    height: 48,
    borderRadius: 40,
    padding: 12,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
  },
  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    width: '100%',
  },
  search_container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 16,
    borderRadius: 40,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
  },
  searchIcon: {
    margin: 10,
    height: 24,
    width: 24,
  },
  searchBar: {
    fontSize: 17,
    color: '#fff',
    width: '85%',
  },
  listContainer: {
    paddingHorizontal: 19,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 40 : 80,
    width: Platform.OS === 'ios' ? 393 : '100%',
    alignSelf: 'center',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  row1: {
    // flexDirection: 'row',
    // justifyContent: 'flex-start',
  },
  itemContainer: {
    width: '100%',
  },
  scrollView: {
    paddingBottom: 20,
  },
})