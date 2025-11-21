
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Pressable,
  Dimensions,
  ScrollView,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';

const bgImage = require('../../../assets/images/backimg.png');
const searchIcon = require('../../../assets/images/searchicon.png');
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import SearchListProductCard from '../../utils/SearchListProductCard';
import FilterBottomSheet from '../../utils/component/FilterBottomSheet';
import SearchTutionCard from '../../utils/SearchTutionCard';
import { NewCustomToastContainer, showToast } from '../../utils/component/NewCustomToastManager';
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
import FilterAndroid from '../../utils/component/FilterAndroid';
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
type university={
  id:number,
  name:string
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
  university:university;
  isbookmarked:boolean
};

type ProductDetailsProps = {
  navigation: any;
};

type RootStackParamList = {
  ProductDetails: { category_id: number ,category_name:string};
};

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;
const mylistings = require('../../../assets/images/filter_icon.png');

const ProductDetails: React.FC<ProductDetailsProps> = ({ navigation }) => {
  const [featurelist, setFeaturelist] = useState<Feature[]>([]);
  const [search, setSearch] = useState<string>('');
  const route = useRoute<ProductDetailsRouteProp>();
  const { category_id } = route.params;
  const {category_name} =route.params;

const [page, setPage] = useState(1);
const [isLoading, setIsLoading] = useState(false);
const [initialLoading, setInitialLoading] = useState(true);
const [hasMore, setHasMore] = useState(true); 
const [isFilterVisible, setFilterVisible] = useState(false);
const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
const inputRef = useRef<TextInput>(null);
 const SCREEN_HEIGHT = Dimensions.get('window').height;


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



 const [appliedFilter, setAppliedFilter] = useState<any | null>(null);

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
  setFilterVisible(true);
  setTimeout(() => console.log("Filter open state:", isFilterVisible), 100);
};

function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}
const debouncedSearch = useRef(
  debounce((text: string) => {
    setPage(1);
    setHasMore(true);
    displayListOfProduct(1, text);
  }, 350)
).current;

useFocusEffect(
  useCallback(() => {
    if (appliedFilter) {
      console.log("🔁 Returning with filter active — keeping filter results");
      return;
    }

    console.log("📍 No filter — normal fetch on focus");
    setPage(1);
    setHasMore(true);
    setFeaturelist([]);
    displayListOfProduct(1, search, true);
  }, [appliedFilter])
);
  const displayListOfProduct = async (
  pageNum: number = 1,
  searchText: string = search,
  isInitialLoad: boolean = false,
) => {
  if (isLoading || !hasMore) return;

    let start = Date.now();
    
    try {
      if (isInitialLoad) {
        setInitialLoading(true);
      } else {
        setIsLoading(true);
      }
  
      const body = {
        search: searchText,
        page: pageNum,
        pagesize: 20,
        category_id: category_id,
      };
  
      console.log(body)
  
      const url = MAIN_URL.baseUrl + 'category/feature-list/search';
      console.log(url)
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        if (isInitialLoad) {
          await new Promise(r => setTimeout(r, 1000));
          setInitialLoading(false);
        }
        return;
      }
  
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
      if(jsonResponse.statusCode === 401 || jsonResponse.statusCode === 403){
            if (isInitialLoad) {
              await new Promise(r => setTimeout(r, 1000));
              setInitialLoading(false);
            } else {
              setIsLoading(false);
            }
            navigation.reset({
            index: 0,
            routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
          });
          }
    } catch (err) {
      console.log('Error:', err);
      if (isInitialLoad) {
        await new Promise(r => setTimeout(r, 1000));
        setInitialLoading(false);
      }
    } finally {
      if (isInitialLoad) {
        let elapsed = Date.now() - start;
        let remaining = Math.max(0, 1000 - elapsed);
        await new Promise(r => setTimeout(r, remaining));
        setInitialLoading(false);
      } else {
        setIsLoading(false);
      }
    }
};

const handleBookmarkPress = async (productId: number) => {
  try {
    setFeaturelist(prevList =>
      prevList.map(item =>
        item.id === productId
          ? { ...item, isbookmarked: !item.isbookmarked }
          : item
      )
    );
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;

    const url = MAIN_URL.baseUrl + 'category/list-bookmark';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ feature_id: productId }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log('Bookmark response:', data);
    showToast(data.message, data.statusCode === 200 ? 'success' : 'error');

  } catch (error) {
    console.error('Bookmark error:', error);

    // 3️⃣ Revert if API fails
    setFeaturelist(prevList =>
      prevList.map(item =>
        item.id === productId
          ? { ...item, isbookmarked: !item.isbookmarked }
          : item
      )
    );
  }
};

  
  const filteredFeatures: Feature[] = featurelist.filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase())
  );


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
        { flex: isLastOddItem ? 0.5 : 0.5, marginRight: isLastOddItem ? 0.5 : 0.5,paddingHorizontal: 4  },
      ]}
    >



      <TouchableOpacity
        onPress={() =>{
          navigation.navigate('SearchDetails', { id: item.id ,name:category_name},{animation: 'none'})}
          
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
          //bookmark={bookmarkedIds.includes(item.id)} 
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
          //bookmark={bookmarkedIds.includes(item.id)} 
          isfeature={item.isfeatured}
          applybookmark={() => handleBookmarkPress(item.id)}
        />
      )}
      </TouchableOpacity>
    </View>
  );
};

const handleFilterApply = async (filterBody: any) => {
  console.log("Display the Filter apply", filterBody);
  try {
    setAppliedFilter(filterBody); 
    setIsLoading(true);
    setFeaturelist([]); 
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;


    const newFilterBody = {
      ...filterBody,
      page: 1,
      pagesize: 20,
      search: search,
    };

    console.log("NewFilterBody:", newFilterBody);

    setAppliedFilter(newFilterBody);
    

    const url = `${MAIN_URL.baseUrl}category/filter-apply`;

    console.log(url)

    //const url = 'http://65.0.99.229:4320/category/filter-apply';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newFilterBody),
    });

    const jsonResponse = await response.json();
    console.log('Filter Apply Response:', jsonResponse);

    if (jsonResponse.statusCode === 200) {
      const filteredFeatures = jsonResponse.data.features;
      setFeaturelist(filteredFeatures);
      setHasMore(filteredFeatures.length === 20);
      setPage(2);
    }
  } catch (err) {
    console.log('Error applying filters:', err);
  } finally {
    setIsLoading(false);
  }
};

const loadMoreFilteredResults = async () => {
  if (!appliedFilter || isLoading || !hasMore) return;

  try {
    setIsLoading(true);

    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;

    // Create a copy and increment page
    const nextFilterBody = {
      ...appliedFilter,
      page: page, // use the current state page
      search: search,
    };

    const url = `${MAIN_URL.baseUrl}category/filter-apply`;
    console.log('Fetching next filter page:', nextFilterBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nextFilterBody),
    });

    const jsonResponse = await response.json();
    console.log('Next Page Filter Response:', jsonResponse);

    if (jsonResponse.statusCode === 200) {
      const moreFeatures = jsonResponse.data.features || [];
      setFeaturelist(prev => [...prev, ...moreFeatures]);
      setHasMore(moreFeatures.length === 20);
      setPage(prev => prev + 1); // increment for next call
    }
  } catch (err) {
    console.log('Error loading more filtered results:', err);
  } finally {
    setIsLoading(false);
  }
};

const handleEndReached = useCallback(() => {

  if (isLoading || !hasMore) return;

  if (appliedFilter) {
    loadMoreFilteredResults();
  } 
  else if (search.trim().length > 0) {
    displayListOfProduct(page, search);
  }
}, [isLoading, hasMore, appliedFilter, search, page]);


  const isEmpty = featurelist.length === 0;

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
              {initialLoading && (
                <Loader
                  containerStyle={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingTop: Platform.OS === 'ios' ? 80 : 100,
                    zIndex: 1000,
                    elevation: Platform.OS === 'android' ? 100 : 0,
                    pointerEvents: 'none',
                  }}
                />
              )}
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
                   onPress={() => navigation.replace('Dashboard',{AddScreenBackactiveTab: 'Home',isNavigate: false})}
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
        
                     {/* Blur view fades in as scroll increases */}
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
        
                 <Text allowFontScaling={false} style={styles.unizyText}>{`${category_name}s`}</Text>
               </View>

        <Animated.FlatList
            data={featurelist}
            keyExtractor={(item, index) => {
              item.id.toString()
              'worklet';
              return index.toString();
            }}
            renderItem={renderItem}
            numColumns={2}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={
              <View
                style={{ flexDirection: 'row', gap: 8,paddingHorizontal:8 }}
              >
                <Pressable
                  style={styles.search_container}
                  onPress={() => inputRef.current?.focus()}
                >
                  <Image source={searchIcon} style={styles.searchIcon} />
                  <TextInput
                    ref={inputRef}
                    allowFontScaling={false}
                    style={styles.searchBar}
                    selectionColor="white"
                    placeholder="Search"
                    placeholderTextColor="#ccc"
                    //onChangeText={setSearch}
                    onChangeText={text => {
                      setSearch(text);
                      debouncedSearch(text);
                    }}
                    value={search}
                  />
                </Pressable>
  
                <View>
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
              </View>
            }
            ListFooterComponent={
              isLoading ? (
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
            contentContainerStyle={[
              styles.listContainer,
              { paddingTop: Platform.OS === 'ios' ? 120 : 100 ,paddingBottom: isEmpty ? 10 : 40,flexGrow:1},
            ]}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            
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
                      No Listings Found
                    </Text>
                  </View>
                </View>
              ) : null
            }
          />
      </View>

      {/* <FilterBottomSheet
        catagory_id={category_id}
        visible={isFilterVisible}
        initialFilters={appliedFilter}
        onClose={() => {
          console.log('Filter Colse click:  ', isFilterVisible);
          setFilterVisible(false);
        }}
        onApply={filterBody => handleFilterApply(filterBody)}
        from={0}
        to={0}
      /> */}

      {Platform.OS === 'ios' ? (
        <FilterBottomSheet
          catagory_id={category_id}
          visible={isFilterVisible}
          initialFilters={appliedFilter}
          onClose={() => {
            console.log('Filter Close click: ', isFilterVisible);
            setFilterVisible(false);
          }}
          onApply={filterBody => handleFilterApply(filterBody)}
          from={0}
          to={0}
        />
      ) : (
        <FilterAndroid
          catagory_id={category_id}
          visible={isFilterVisible}
          initialFilters={appliedFilter}
          onClose={() => {
            console.log('Filter Close click: ', isFilterVisible);
            setFilterVisible(false);
          }}
          onApply={filterBody => handleFilterApply(filterBody)}
          from={0}   
          to={0}     
        />
      )}

      <NewCustomToastContainer />
    </ImageBackground>
  );
};

export default ProductDetails;

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


   categoryTabsContainer: {
    width: '100%',
    marginBottom: 12,
    marginTop: 12,
    paddingLeft: 10
  },
 
  categoryTabsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // fallback tint
  },


   emptyWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width:'100%',
      paddingHorizontal:10
    },

 
   emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width:'100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius:24,
    overflow:'hidden',
    //minHeight:'80%',
  // marginBottom:20,
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
  background: {
     flex: 1, 
     width: '100%',
      height: '100%' 
    },
  fullScreenContainer: { 
    flex: 1,
   },
  // header: {
  //   paddingTop: Platform.OS === 'ios' ? '15.2%'  : 50,
  //   // paddingBottom: 12,
  //   paddingHorizontal: 16,
  // },
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
    //boxShadow: 'rgba(255, 255, 255, 0.12)  inset -1px 0px 5px 1px inset ',

   boxShadow:
      '0 2px 8px 0 rgba(255, 255, 255, 0.2)inset 0 2px 8px 0 rgba(0, 0, 0, 0.2)',
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
    paddingVertical: 4,
    padding: (Platform.OS === 'ios'? 12:0),
    marginTop:(Platform.OS === 'ios' ? 5:20),
    height: 50,
    gap: 8,
    width: '84%',
  },
  searchIcon: { 
    
    padding: (Platform.OS === 'ios'? 0:5),
    margin: (Platform.OS === 'ios'? 0:10),
    height: 24,
    width: 24,
  },
  searchBar: {
    // fontSize: 17,
    // color: '#fff',
    // width: '80%',
    // height: '100%',
    // marginLeft: 8,
    fontSize: 17,
    color: '#fff',
    fontFamily: 'Urbanist-Medium',
    fontWeight: 500,
  },
  listContainer: {
    marginLeft: 8,
    marginRight: 5,
    paddingTop: 10,
    gap:16
  },
  row1: {
    // flexDirection: 'row',
    // justifyContent: 'flex-start',
  },
  itemContainer: {
    flex: 1,
    marginHorizontal: 4,
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
    marginTop: (Platform.OS === 'ios'? 6:20),
  },
  iconSmall: {
    width: 24,
    height: 24,
  },
});