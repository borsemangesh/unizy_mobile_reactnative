import React, { useCallback, useEffect, useState, useRef } from 'react';
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
  ScrollView,
  ActivityIndicator,
  ImageSourcePropType,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';

const bgImage = require('../../../assets/images/backimg.png');
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import SearchListProductCard from '../../utils/SearchListProductCard';
import SearchTutionCard from '../../utils/SearchTutionCard';
import { NewCustomToastContainer, showToast } from '../../utils/component/NewCustomToastManager';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SquircleView } from 'react-native-figma-squircle';


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

type Listing = {
  id: number;
  created_by: number;
  category_id: number;
  created_at: string;
  updated_at: string;
  isactive: boolean;
  isfeatured: boolean;
  feature_title: string;
  price: number;
  thumbnail: string | null;
  profileshowinview: boolean;
  university: {
    id: number;
    name: string;
  } | null;
  createdby: {
    firstname: string;
    lastname: string;
    profile: string | null;
    university_name:string | null;
  };
  isbookmarked: boolean;
};
type university={
  id:number,
  name:string
}



type UserListingProps = {
  navigation: any;
};


type RouteParams = {
  source?: 'chatList' | 'sellerPage';
  members: {
    firstname: string;
    lastname: string;
    id: number;
    profile: string | null;
    university: {id:number,name:string};
  };  
};


const UserListing = ({ navigation }: UserListingProps)  => {
 const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
    const { members } =   route.params;


  const [search, setSearch] = useState<string>('');
    const [page, setPage] = useState(1);
    const pagesize = 10;
    const [featurelist, setFeaturelist] = useState<Listing []>([]);
    //const [allFeatures, setAllFeatures] = useState<Feature[]>([]); // Store all features for filtering
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
    const SCREEN_HEIGHT = Dimensions.get('window').height;
    const insets = useSafeAreaInsets();
    
  const { height: screenHeight } = Dimensions.get('window');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
   const scrollY = useSharedValue(0);
  
   const scrollHandler = useAnimatedScrollHandler({
     onScroll: (event) => {
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
      { id: null, name: 'All' }
    ]);
    const [selectedCategory, setSelectedCategory] = useState<Category>({ id: null, name: 'All' });

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


useFocusEffect(
  useCallback(() => {
    setPage(1);
    displayListOfProduct(selectedCategory?.id ?? null, 1);
  }, [selectedCategory]) 
);

const displayListOfProduct = async (categoryId: number | null, pageNum: number) => {
  try {
    const pagesize = 10;
    let url = `${MAIN_URL.baseUrl}user/user-listing?page=${pageNum}&pagesize=${pagesize}&user_id=${members.id}`;
    let url = `${MAIN_URL.baseUrl}user/user-listing?page=${pageNum}&pagesize=${pagesize}&user_id=${members.id}`;
    //let url = `${MAIN_URL.baseUrl}user/user-listing?user_id=${members.id}`;
    
    if (categoryId) {
      url += `&category_id=${categoryId}`;
    }

    console.log(url)

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
    console.log('API Response:', jsonResponse);
    if (jsonResponse.statusCode === 200) {
      setIsLoading(false);
      if (pageNum === 1) {
        
        setFeaturelist(jsonResponse.data.features);
        
      } else {
        setFeaturelist(prev => [...prev, ...jsonResponse.data.features]);
      }
    } 
    else if(jsonResponse.statusCode === 401 || jsonResponse.statusCode === 403){
          setIsLoading(false);
          navigation.reset({
          index: 0,
          routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
        });
        }
    
    else {
      setIsLoading(false);
      console.log('API Error:', jsonResponse.message);
    }
  } catch (err) {
    setIsLoading(true);
    console.log('Error:', err);
  }
};

const filteredFeatures: Listing[] = featurelist.filter(item =>
  (item.feature_title ?? '').toLowerCase().includes(search.toLowerCase())
);

const handleBookmarkPress = async (productId: number) => {
  try {
    const isCurrentlyBookmarked = bookmarkedIds.includes(productId);
    let updatedBookmarks;

    if (isCurrentlyBookmarked) {
      updatedBookmarks = bookmarkedIds.filter(id => id !== productId);
    } else {
      updatedBookmarks = [...bookmarkedIds, productId];
    }
    setBookmarkedIds(updatedBookmarks);
    await AsyncStorage.setItem('bookmarkedIds', JSON.stringify(updatedBookmarks));

    if (isCurrentlyBookmarked) {
      setFeaturelist(prevList => prevList.filter(item => item.id !== productId));
    }


    setBookmarkedIds(updatedBookmarks);
    await AsyncStorage.setItem('bookmarkedIds', JSON.stringify(updatedBookmarks));

    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;

    const url = MAIN_URL.baseUrl + 'category/list-bookmark';
    console.log(url)
    console.log(productId)
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

    displayListOfProduct(selectedCategory?.id ?? null, 1);

  } catch (error) {
    console.error('Bookmark error:', error);

    setBookmarkedIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }
};


 const renderItem = ({ item, index }: { item: Listing; index: number }) => {

 
  const feature = item;

  const isLastOddItem =
    filteredFeatures.length % 2 !== 0 &&
    index === filteredFeatures.length - 1;

  // Bookmark state
  const isBookmarked = bookmarkedIds.length > 0
    ? bookmarkedIds.includes(feature.id)
    : feature.isbookmarked;

  let showInitials = false;
  let initials = '';
   let productImage: ImageSourcePropType | null = null;

  if (feature.profileshowinview) {
    if (feature.createdby?.profile) {
      productImage = { uri: feature.createdby.profile };
    } else {
      showInitials = true;
      initials = `${feature.createdby?.firstname?.[0] ?? ''}${feature.createdby?.lastname?.[0] ?? ''}`;
    }
  } else {
    productImage = feature.thumbnail
      ? { uri: feature.thumbnail }
      : require('../../../assets/images/drone.png');
  }

  return (
    <View
      style={[
        styles.itemContainer,
        { flex: isLastOddItem ? 0.5 : 0.5, marginRight: 0.5 },
      ]}
    >
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('SearchDetails', {
            id: feature.id,
            name: selectedCategory.name === 'All' ? 'List' : selectedCategory.name,
            from: 'bookmark',
          })
        }
        style={{ flex: 1 }}
      >
        {feature.profileshowinview ? (
          <SearchTutionCard
            tag={feature.createdby.university_name || 'University'}
            infoTitle={feature.feature_title}
            inforTitlePrice={`£ ${feature.price}`}
            rating={'4.5'}
            productImage={feature.createdby?.profile ? { uri: feature.createdby.profile } : undefined}
            bookmark={isBookmarked}
            showInitials={showInitials}
            initialsName={initials}
            isfeature={feature.isfeatured}
            applybookmark={() => handleBookmarkPress(feature.id)}
          />
        ) : (
          <SearchListProductCard
            tag={feature.createdby.university_name || 'University'}
            infoTitle={feature.feature_title}
            inforTitlePrice={`£ ${feature.price}`}
            rating={'4.5'}
            productImage={productImage ?? require('../../../assets/images/drone.png')}
            bookmark={isBookmarked}
            isfeature={feature.isfeatured}
            applybookmark={() => handleBookmarkPress(feature.id)}
          />
        )}
      </TouchableOpacity>
    </View>
  );
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
                   onPress={() => { navigation.goBack();}}
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
                   {members.firstname} Listings
                 </Text>
               </View>


               <Animated.FlatList

                data={filteredFeatures}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}


            renderItem={renderItem}
            ListHeaderComponent={
              <View
                style={styles.categoryTabsContainer}
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
                            style={
                              isSelected ? styles.tabtext : styles.othertext
                            }
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
              { paddingTop: Platform.OS === 'ios' ? 120 : 100 },
            ]}
            onScroll={scrollHandler}
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
               <View style={[styles.emptyWrapper,{minHeight: screenHeight - (Platform.OS === 'ios' ? 225 : 150), }]}>
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
      <NewCustomToastContainer/>
    </ImageBackground>
  );








};

export default UserListing;

const styles = StyleSheet.create({
categoryTabsContainer: {
  width: '100%',
  marginBottom: 12,
  marginTop: 12,
  paddingLeft: 10,
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
  // position: 'absolute',
  // top: Platform.OS === 'ios' ? '6%' : 40,
  // width: Platform.OS === 'ios' ? 393 : '100%',
  // flexDirection: 'row',
  // alignItems: 'center',
  // justifyContent: 'center',
  // paddingHorizontal: 16,
  // zIndex: 11,
  // alignSelf: 'center',
  // pointerEvents: 'box-none',
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
},

  
    emptyWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width:'100%',
      paddingHorizontal: 10,
      // marginTop: -5
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
  
  //  marginBottom:20,
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
 tabcard: {
  minHeight:38,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
     borderWidth: 0.4,
    borderColor: '#ffffff11',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.10) 100%)',
      borderRadius:10,
    boxShadow: 'rgba(255, 255, 255, 0.02)inset -1px 10px 5px 10px,rgba(236, 232, 232, 0.3)inset -0.99px -0.88px 0.90px 0px,rgba(236, 232, 232, 0.3)inset 0.99px 0.88px 0.90px 0px',  
},
  tabcard1: {
     minHeight:38,
     borderWidth: 0.4,
    borderColor: '#ffffff11',

   // boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
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
    color: '#fff',   // selected tab text color
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize:14

  },
  othertext: {
    color: '#FFFFFF7A',   // unselected tab text color
    fontWeight: '600',
     fontFamily: 'Urbanist-SemiBold',
     fontSize:14
  },

  background: { 
    flex: 1,
     width: '100%',
      height: '100%' },
  fullScreenContainer: {
     flex: 1
     },
  // header: {
  //   paddingTop: Platform.OS === 'ios' ? '15.2%'  : 50,
  //   paddingBottom: 12,
  //   paddingHorizontal: 16,
  // },
  // headerRow: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  // },
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
     fontFamily: 'Urbanist-SemiBold',
     marginTop: 17
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
  searchIcon: { margin: 10, height: 24, width: 24 },
  searchBar: {
    fontSize: 17,
    color: '#fff',
    width: '85%',
  },
  listContainer: {
    marginLeft: 8,
    marginRight: 5,
    paddingTop: 10,
      gap:16,
 
  },
  row1: {
  },
  itemContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
});