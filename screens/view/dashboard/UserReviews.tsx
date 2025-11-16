

import React, { useEffect, useState } from 'react';
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
  Dimensions,

} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
const bgImage = require('../../../assets/images/backimg.png');
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';
import MyReviewCard from '../../utils/MyReviewCard';
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


type Feature = {
  id: number;
  added_by: number;
  featurelist_id: number;
  created_at: string;
 
  featurelist: {
    id: number;
    created_by: number;
    category_id: number;
    created_at: string | null;
    updated_at: string;
    isactive: boolean;
    isfeatured: boolean;
    title: string;
    price: number;
    thumbnail: string;
    profileshowinview:boolean;
    createdby: CreatedBy;
    university:university;
    isbookmarked:boolean;
  };
};
type university={
  id:number,
  name:string
}

type UserReviewsProps = {
  navigation: any;
};


const UserReviews = ({ navigation }: UserReviewsProps)  => {
  const [featurelist, setFeaturelist] = useState<Feature[]>([]);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pagesize = 10;
  const [featureList, setFeatureList] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets(); // Safe area insets
  const { height: screenHeight } = Dimensions.get('window');

  type Category = {
  id: number | null; 
  name: string;
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


const displayListOfProduct = async (categoryId: number | null, pageNum: number) => {
  try {
    const pagesize = 10;
  
    let url = `${MAIN_URL.baseUrl}user/user-review?user_id=64`;
  

    console.log("test",url)
    

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

    console.log("jsonResponse",jsonResponse);
    
    // Extract formattedReviews from the response
    const allReviews = jsonResponse.data?.formattedReviews ?? [];
    
    // Filter by category if categoryId is not null
    let filteredReviews = allReviews;
    if (categoryId !== null) {
      filteredReviews = allReviews.filter((review: any) => review.category_id === categoryId);
    }
    
    if (jsonResponse.statusCode === 200) {
      setIsLoading(false);
      setFeatureList(filteredReviews);
      // if (pageNum === 1) {
      //   //setFeatureList(jsonResponse.data.features);
      //   setFeatureList(reviews);
      // } else {
      //   //setFeatureList(prev => [...prev, ...jsonResponse.data.features]);
      //    setFeatureList(prev => [...prev, ...reviews]);
      // }
    } else if(jsonResponse.statusCode === 401 || jsonResponse.statusCode === 403){
          setIsLoading(false);
          navigation.reset({
          index: 0,
          routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
        });
        }
    
    else {
      setIsLoading(false);
      // console.log('API Error:', jsonResponse.message);
    }
  } catch (err) {
    setIsLoading(false);
    console.log('Error:', err);
  }
};

// Filter reviews by search text and category
const filteredFeatures = featureList.filter((item: any) => {
  const title = item?.feature_title ?? item?.feature?.title ?? '';
  return title.toLowerCase().includes(search.toLowerCase());
});

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString || dateString.trim() === '') return '01-01-2025';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '01-01-2025';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};



const renderItem = ({ item, index }: { item: any; index: number }) => {
  const isLastOddItem =
    filteredFeatures.length % 2 !== 0 &&
    index === filteredFeatures.length - 1;

  // Handle both old structure (item.feature) and new structure (flat item)
  const feature = item?.feature;
  const categoryId = item?.category_id ?? feature?.category_id ?? null;
  const displayDate = formatDate(item?.created_at);

  // Use feature thumbnail if available, otherwise default
  const productImage = feature?.thumbnail
    ? { uri: feature.thumbnail }
    : require('../../../assets/images/drone.png');

  // Use feature price if available, otherwise default
  const displayPrice =
    feature?.price != null ? `£${feature.price}` : '£0.00';
  
  // Use feature title or feature_title from flat structure
  const displayTitle = feature?.title ?? item?.feature_title ?? 'Title';
  const rating = item?.rating?.toString() ?? '0';
  const comment = item?.comment ?? '';

  // Use feature createdby if available, otherwise null
  const createdby = feature?.createdby ?? null;
  
  // profileshowinview based on category_id (2 = Tuition, 5 = ?)
  const profileshowinview =
    categoryId === 2 || categoryId === 5 ? true : false;

  return (
    <View
      style={[
        styles.itemContainer,
        isLastOddItem && { marginRight: 'auto' },
      ]}
    >
      <MyReviewCard
        infoTitle={displayTitle}
        inforTitlePrice={displayPrice}
        rating={rating}
        productImage={productImage}
        reviewText={comment}
        shareid={item.id}
        date={displayDate}
        createdby={createdby}
        profileshowinview={profileshowinview}
       
      />
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
                     overlayColor="rgba(255,255,255,0.05)"
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
                   onPress={() => navigation.goBack()}
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
                   Allen Reviews
                 </Text>
               </View>
          <Animated.FlatList
            data={filteredFeatures}
            renderItem={renderItem}
            keyExtractor={(item, index) => {
              'worklet';
              return index.toString();
            }}
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
                        {/* <View
                          style={isSelected ? styles.tabcard : styles.tabcard1}
                        > */}
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
                          {/* </View> */}
                        </SquircleView>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            }
            contentContainerStyle={[
              styles.listContainer,
              { paddingTop: Platform.OS === 'ios' ? 160 : 100 },
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
               <View style={[styles.emptyWrapper,{minHeight: screenHeight - (Platform.OS === 'ios' ? 160 : 150), }]}>
                          <View style={styles.emptyContainer}>
                            <Image
                              source={require('../../../assets/images/noproduct.png')} // your image
                              style={styles.emptyImage}
                              resizeMode="contain"
                            />
                            <Text allowFontScaling={false} style={styles.emptyText}>
                              No Reviews found
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

export default UserReviews;

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
    top: Platform.OS === 'ios' ? 50 : 40,
    width: Platform.OS === 'ios' ? 393 : '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 11,
    alignSelf: 'center',
    pointerEvents: 'box-none',
  },

   categoryTabsContainer: {
    width: '100%',
    marginBottom: 12,
    marginTop: 12,
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
      width:'100%'
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
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',

    borderRadius:10,
    boxSizing: 'border-box',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    overflow:'hidden'
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
     flex: 1,
     //marginTop: 10
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
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    width: '100%',
    marginTop: 17,
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
    width: 24 
  },
  searchBar: {
    fontSize: 17,
    color: '#fff',
    width: '85%',
  },
  listContainer: {
    marginLeft: 10,
    marginRight: 10,
    paddingTop: 10,
    //paddingBottom:80,
  },
  row1: {
    // flexDirection: 'row',
    // justifyContent: 'flex-start',
  },
  itemContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
});