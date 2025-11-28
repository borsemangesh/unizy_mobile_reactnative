import React, { useCallback, useEffect, useState } from 'react';
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
  StatusBar,
  ActivityIndicator,
  ImageSourcePropType,
  Dimensions,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
import debounce from 'lodash.debounce';


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

const bgImage = require('../../../assets/images/backimg.png');
const searchIcon = require('../../../assets/images/searchicon.png');
import { useRoute, RouteProp } from '@react-navigation/native';
import SearchListProductCard from '../../utils/SearchListProductCard';
import FilterBottomSheet from '../../utils/component/FilterBottomSheet';
import SearchTutionCard from '../../utils/SearchTutionCard';
import { NewCustomToastContainer, showToast } from '../../utils/component/NewCustomToastManager';
import FilterAndroid from '../../utils/component/FilterAndroid';
import { useTranslation } from 'react-i18next';
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
type university = {
  id: number,
  name: string
}

type Feature = {
  avg_rating: string;
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
  profileshowinview: boolean
  createdby: CreatedBy;
  university: university;
  isbookmarked: boolean
};

type SearchPageProps = {
  navigation: any;
};

type RootStackParamList = {
  SearchPage: { category_id: number, category_name: string };
};

type SearchPageRouteProp = RouteProp<RootStackParamList, 'SearchPage'>;
const mylistings = require('../../../assets/images/filter_icon.png');

const SearchPage: React.FC<SearchPageProps> = ({ navigation }) => {
  const [featurelist, setFeaturelist] = useState<Feature[]>([]);
  const [search, setSearch] = useState<string>('');
  const route = useRoute<SearchPageRouteProp>();
  const { category_id } = route.params;
  const { category_name } = route.params;

  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const SCREEN_HEIGHT = Dimensions.get('window').height;

  const [isFilterMode, setIsFilterMode] = useState(false);
  const [lastFilterBody, setLastFilterBody] = useState<any>(null);


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

  useEffect(() => {
    const backAction = () => {
      navigation.replace('Dashboard', {
        AddScreenBackactiveTab: 'Home',
        isNavigate: false,
      })
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const clickfilter = () => {
    console.log("Filter PopUp: ", isFilterVisible);
    setFilterVisible(true);
    console.log("Filter PopUpAfter: ", isFilterVisible);
  };



  const displayListOfProduct = async (pageNum: number = 1, query = "") => {
    if (isLoading || !hasMore) return;
    if (!query.trim()) return;
    try {
      setIsLoading(true);

      console.log('CID', category_id)

      const body = {
        search: query,
        page: pageNum,
        pagesize: 20,
        category_id: category_id,
      };

      console.log('📤 Request Body:', JSON.stringify(body, null, 2));

      const url = MAIN_URL.baseUrl + 'category/feature-list/search';
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const jsonResponse = await response.json();
      console.log('API Response:', jsonResponse);

      if (jsonResponse.statusCode === 200) {
        const newFeatures = jsonResponse.data.features;

        if (pageNum === 1) {
          setFeaturelist(newFeatures);
        } else {
          setFeaturelist(prev => [...prev, ...newFeatures]);
        }

        setHasMore(newFeatures.length === 20);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.log('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      setPage(1);
      setHasMore(true);
      displayListOfProduct(1, text);
    }, 500),
    []
  );

  const handleSearchChange = (text: string) => {
    setSearch(text);
    setIsFilterMode(false); 

    if (text.trim().length > 0) {
      debouncedSearch(text);
    } else {
      setFeaturelist([]);
      setHasMore(true);
      setPage(1);
    }
  };


  const handleBookmarkPress = async (productId: number) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const isCurrentlyBookmarked = bookmarkedIds.includes(productId);

      const url = MAIN_URL.baseUrl + 'category/list-bookmark';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
    }
  };

  const { t } = useTranslation();
  

  const filteredFeatures: Feature[] = featurelist.filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase())
  );

  const isEmpty = featurelist.length === 0;

  const renderItem = ({ item, index }: { item: Feature; index: number }) => {
    const isLastOddItem =
      filteredFeatures.length % 2 !== 0 &&
      index === filteredFeatures.length - 1;

    let productImage: ImageSourcePropType | null = null;
    let showInitials = false;
    let initials = '';

    if (item.profileshowinview) {
      if (item.createdby?.profile) {
        productImage = { uri: item.createdby.profile };
      } else {
        showInitials = true;
        initials = `${item.createdby?.firstname?.[0] ?? ''}${item.createdby?.lastname?.[0] ?? ''}`;
      }
    } else {
      if (item.thumbnail) {
        productImage = { uri: item.thumbnail };
      } else {
        productImage = require('../../../assets/images/drone.png');
      }
    }
    return (
      <View
        style={[
          styles.itemContainer,
          { flex: isLastOddItem ? 0.5 : 0.5, marginRight: isLastOddItem ? 0.5 : 0.5 },
        ]}
      >

        <TouchableOpacity
          onPress={() => {
            navigation.navigate('SearchDetails', { id: item.id, name: category_name }, { animation: 'none' })
          }

          }
          style={{ flex: 1 }}
        >
          {item.profileshowinview ? (
            <SearchTutionCard
              tag={item.university?.name || 'University of Warwick'}
              infoTitle={item.title}
              inforTitlePrice={`£ ${item.price}`}
              rating={item.avg_rating}
              showInitials={showInitials}
              initialsName={initials.toUpperCase()}
              productImage={item.createdby?.profile ? { uri: item.createdby.profile } : undefined}
              bookmark={item.isbookmarked}
              isfeature={item.isfeatured}
              applybookmark={() => handleBookmarkPress(item.id)}
            />
          ) : (
            <SearchListProductCard
              tag={item.university?.name || 'University of Warwick'}
              infoTitle={item.title}
              inforTitlePrice={`£ ${item.price}`}
              rating={item.avg_rating}
              productImage={productImage ?? require('../../../assets/images/drone.png')}
              bookmark={item.isbookmarked}
              isfeature={item.isfeatured}
              applybookmark={() => handleBookmarkPress(item.id)}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };



  const handleFilterApply = async (filterBody: any, pageNum: number = 1) => {
    try {
      setIsLoading(true);
      setIsFilterMode(true);
      setLastFilterBody(filterBody);

      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const url = `${MAIN_URL.baseUrl}category/filter-apply`;
      const body = { ...filterBody, page: pageNum, pagesize: 20 };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const jsonResponse = await response.json();
      console.log('Filter Apply Response:', jsonResponse);

      if (jsonResponse.statusCode === 200) {
        const filteredFeatures = jsonResponse.data.features || [];

        if (pageNum === 1) {
          setFeaturelist(filteredFeatures);
        } else {
          setFeaturelist(prev => [...prev, ...filteredFeatures]);
        }

        setHasMore(filteredFeatures.length === 20);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.log('Error applying filters:', err);
    } finally {
      setIsLoading(false);
    }
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
              navigation.replace('Dashboard', {
                AddScreenBackactiveTab: 'Home',
                isNavigate: false,
              });
              // navigation.goBack();
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

              {/* Back Icon */}
              <Animated.Image
                source={require('../../../assets/images/back.png')}
                style={[{ height: 24, width: 24 }, animatedIconStyle]}
              />
            </Animated.View>
          </TouchableOpacity>

          <Text allowFontScaling={false} style={styles.unizyText}>
            {t('search')}
          </Text>
        </View>


        <Animated.FlatList
          data={featurelist}
          renderItem={renderItem}
          numColumns={2}
          showsVerticalScrollIndicator={true}   
          showsHorizontalScrollIndicator={true}
          onEndReachedThreshold={0.5}
          columnWrapperStyle={styles.row1}
          keyExtractor={(item, index) => {
            'worklet';
            return index.toString();
          }}
          ListHeaderComponent={
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 8 }}>
              <View style={styles.search_container}>
                <Image source={searchIcon} style={styles.searchIcon} />
                <TextInput
                  allowFontScaling={false}
                  style={styles.searchBar}
                  placeholder={t('search')}
                  placeholderTextColor="#ccc"
                  value={search}
                  onChangeText={handleSearchChange}
                  returnKeyType="search"
                  selectionColor="white"
                  autoFocus={true}
                  onSubmitEditing={() => {
                    if (search.trim().length > 0) {
                      setPage(1);
                      setHasMore(true);
                      displayListOfProduct(1, search);
                    } else {
                      setFeaturelist([]);
                    }
                  }}
                />
              </View>
              <TouchableOpacity
                onPress={() => {
                  clickfilter();
                }}
              >
                <View style={styles.MylistingsBackground}>
                  <Image source={mylistings} style={styles.iconSmall} />
                </View>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={[
            styles.listContainer,
            { paddingTop: Platform.OS === 'ios' ? 121 : 100, paddingBottom: isEmpty ? 10 : 40, flexGrow: 1 },
          ]}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onEndReached={() => {
            if (isLoading || !hasMore) return;

            if (isFilterMode && lastFilterBody) {
              handleFilterApply(lastFilterBody, page);
            } else if (search.trim().length > 0) {
              displayListOfProduct(page, search);
            }
          }}
          ListEmptyComponent={
            !isLoading ? (
              <View style={[styles.emptyWrapper]}>
                <View style={styles.emptyContainer}>
                  <Image
                    source={require('../../../assets/images/noproduct.png')} // your image
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

      {Platform.OS === 'ios' ? (
        <FilterBottomSheet
          catagory_id={category_id}
          visible={isFilterVisible}
          onClose={() => setFilterVisible(false)}
          onApply={filterBody => handleFilterApply(filterBody)}
          from={0}
          to={0}
        />
      ) : (
        <FilterAndroid
          catagory_id={category_id}
          visible={isFilterVisible}
          onClose={() => setFilterVisible(false)}
          onApply={filterBody => handleFilterApply(filterBody)}
          from={0}
          to={0}
        />
      )}
      <NewCustomToastContainer />
    </ImageBackground>
  );
};


export default SearchPage;

const styles = StyleSheet.create({


  header: {
    position: 'absolute',
    top: 0,
    width: Platform.OS === 'ios' ? 393 : '100%',
    zIndex: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: Platform.OS === 'ios' ? 16 : 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    overflow: 'hidden', 
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
    left: 16,
    zIndex: 11,
    top: 7,
  },

  headerWrapper: {
    position: 'absolute',
    top: 0,
    width: Platform.OS === 'ios' ? 393 : '100%',
    height: Platform.OS === 'ios' ? 180 : 180,
    zIndex: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    pointerEvents: 'none',
  },
  headerContent: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? '6%' : 40,
    width: Platform.OS === 'ios' ? 393 : '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 11,
    alignSelf: 'center',
    pointerEvents: 'box-none',
    marginTop: 2,
    marginLeft: 1
  },

  dateHeading: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 500,
    marginLeft: 12,
    marginTop: 16
  },
  blurButtonWrapper: {
    width: 46,
    height: 46,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
  },


  background: { flex: 1, width: '100%', height: '100%' },
  fullScreenContainer: { flex: 1 },


  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
    paddingHorizontal: 10,
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
    //minHeight:'80%',
    //marginBottom:20,
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
    fontWeight: 600
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIconRow: {
    padding: 12,
    borderRadius: 40,

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    height: 48,
    width: 48,
  },
  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 17
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
    padding: (Platform.OS === 'ios' ? 12 : 0),
    marginTop: (Platform.OS === 'ios' ? 4 : 20),
    height: 50,

    width: '84%',
    gap: (Platform.OS === 'ios' ? 8 : 0)
  },
  searchIcon: {

    padding: (Platform.OS === 'ios' ? 0 : 5),
    marginLeft: (Platform.OS === 'ios' ? 0 : 10),
    marginRight: (Platform.OS === 'ios' ? 0 : 6),
    height: 24,
    width: 24,
  },
  searchBar: {
    fontSize: 17,
    color: '#fff',
    fontFamily: 'Urbanist-Medium',
    fontWeight: 500,
    width: '80%',

  },
  listContainer: {
    marginLeft: 8,
    marginRight: 5,
    paddingTop: 10,

  },
  row1: {

  },
  itemContainer: {
    flex: 1,
    marginHorizontal: 8,
    paddingBottom: 15,
    paddingTop: 10
  },
  ylistingsBackground: {
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
    marginTop: (Platform.OS === 'ios' ? 4 : 20),
  },
  iconSmall: {
    width: 24,
    height: 24,
  },
});