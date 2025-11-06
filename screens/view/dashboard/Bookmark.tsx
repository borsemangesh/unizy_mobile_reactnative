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

type BookmarkProps = {
  navigation: any;
};




const Bookmark = ({ navigation }: BookmarkProps)  => {
  const [search, setSearch] = useState<string>('');
    const [page, setPage] = useState(1);
    const pagesize = 10;
    const [featurelist, setFeaturelist] = useState<Feature[]>([]);  
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
    const SCREEN_HEIGHT = Dimensions.get('window').height;
    const insets = useSafeAreaInsets();

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
   // setIsLoading(true);
    const pagesize = 10;
    
    let url = `${MAIN_URL.baseUrl}category/mybookmark-list?page=${pageNum}&pagesize=${pagesize}`;
    
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
    console.log('API Response:', jsonResponse);
    if (jsonResponse.statusCode === 200) {

      // const features = jsonResponse.data.features;
      // const bookmarkedFeatures = features.filter((f: { featurelist: { isbookmarked: any; }; }) => f.featurelist.isbookmarked);
      setIsLoading(false);
      if (pageNum === 1) {
        
        setFeaturelist(jsonResponse.data.features);
        //setFeaturelist(bookmarkedFeatures)
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

const filteredFeatures: Feature[] = featurelist.filter(item =>
  (item.featurelist?.title ?? '').toLowerCase().includes(search.toLowerCase())
);

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString || dateString.trim() === '') return '01-01-2025';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '01-01-2025';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

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

    // Optional: revert bookmark if API call fails
    setBookmarkedIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }
};


 const renderItem = ({ item, index }: { item: Feature; index: number }) => {
  const isLastOddItem =
    filteredFeatures.length % 2 !== 0 &&
    index === filteredFeatures.length - 1;

  const feature = item.featurelist;

  const isBookmarked = bookmarkedIds.length > 0
  ? bookmarkedIds.includes(item.id)  // after toggles
  : feature.isbookmarked || feature.isbookmarked;

  
   let productImage: ImageSourcePropType | null = null;
    let showInitials = false;
    let initials = '';
  
    if (feature.profileshowinview) {
      if (feature.createdby?.profile) {
        productImage = { uri: feature.createdby.profile };
      } else {
        showInitials = true;
        initials = `${feature.createdby?.firstname?.[0] ?? ''}${feature.createdby?.lastname?.[0] ?? ''}`;
      }
    } else {
      if (feature.thumbnail) {
        productImage = { uri: feature.thumbnail };
      } else {
        productImage = require('../../../assets/images/drone.png');
      }
    }
    

  return (
    <View
      style={[
        styles.itemContainer,
        { flex: isLastOddItem ? 0.5: 0.5, marginRight: isLastOddItem ? 0.5 : 0.5 },
      ]}
    >
       <TouchableOpacity
            onPress={() =>
              navigation.navigate('SearchDetails', { id: feature.id,name: selectedCategory.name === 'All' ? 'List' : selectedCategory.name,from:'bookmark' }) 
            }
            style={{ flex: 1 }}
          >
  
         {feature.profileshowinview ? (
              <SearchTutionCard
                tag={feature.university?.name || 'University of Warwick'}
                infoTitle={feature.title}
                inforTitlePrice={`£ ${feature.price}`}
                rating={feature.isfeatured ? '4.5' : '4.5'}
                productImage={feature.createdby?.profile ? { uri: feature.createdby.profile } : undefined}
                bookmark={feature.isbookmarked}
                //bookmark={isBookmarked}
                showInitials={showInitials}
                initialsName={initials}
                isfeature={feature.isfeatured}
                applybookmark={() => handleBookmarkPress(feature.id)}
                
              />
            ) : (
              <SearchListProductCard
                tag={feature.university?.name || 'University of Warwick'}
                infoTitle={feature.title}
                inforTitlePrice={`£ ${feature.price}`}
                rating={feature.isfeatured ? '4.5' : '4.5'}
                productImage={productImage ?? require('../../../assets/images/drone.png')}
                bookmark={feature.isbookmarked}
                //bookmark={bookmarkedIds.includes(item.id)}
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() =>{navigation.replace('Dashboard',{AddScreenBackactiveTab: 'Home',isNavigate: false})}}>
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.unizyText}>Bookmarks</Text>
            <View style={{ width: 48 }} />
          </View>
        </View>

    <View >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 6 ,}}
       
        contentContainerStyle={{ paddingHorizontal: 16,paddingVertical:10, gap: 4,  }}
            >
          
       {categories.map((cat, index) => {
                 const isSelected = selectedCategory.name === cat.name;
                 return (
                   <View key={index}>
                     <TouchableOpacity
                       onPress={() => setSelectedCategory(cat)}
                       style={isSelected ? styles.tabcard : styles.tabcard1}
                     >
                       <Text allowFontScaling={false} style={isSelected ? styles.tabtext : styles.othertext}>
                         {cat.name}
                       </Text>
                     </TouchableOpacity>
                   </View>
                 );
               })}
        </ScrollView>
        </View>     

        {/* FlatList */}
        <FlatList
          data={filteredFeatures}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          //columnWrapperStyle={styles.row1}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            //marginBottom:1
          }}
          scrollEnabled={filteredFeatures?.length > 0} 
          contentContainerStyle={[
            styles.listContainer,{ paddingBottom: SCREEN_HEIGHT * 0.05 },
            filteredFeatures?.length === 0 && { alignContent:'center',alignSelf:'center' ,width:'90%',height:'90%'}
          ]}
          renderItem={renderItem}
           ListFooterComponent={
            isLoading ? <ActivityIndicator size="small" color="#fff" /> : null
          }
         ListEmptyComponent={
                         !isLoading ? (
                          <View style={styles.emptyWrapper}>
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

export default Bookmark;

const styles = StyleSheet.create({
  
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
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
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
     fontFamily: 'Urbanist-SemiBold',
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
   // paddingBottom:10
      gap:16
 
  },
  row1: {
    // flexDirection: 'row',
    // justifyContent: 'flex-start',
    //paddingBottom:1
  },
  itemContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
});