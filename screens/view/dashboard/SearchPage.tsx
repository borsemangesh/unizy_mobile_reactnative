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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
import debounce from 'lodash.debounce';

const bgImage = require('../../../assets/images/backimg.png');
const searchIcon = require('../../../assets/images/searchicon.png');
import { useRoute, RouteProp } from '@react-navigation/native';
import SearchListProductCard from '../../utils/SearchListProductCard';
import FilterBottomSheet from '../../utils/component/FilterBottomSheet';
import SearchTutionCard from '../../utils/SearchTutionCard';
import { NewCustomToastContainer, showToast } from '../../utils/component/NewCustomToastManager';
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

type SearchPageProps = {
  navigation: any;
};

type RootStackParamList = {
  SearchPage: { category_id: number ,category_name:string};
};

type SearchPageRouteProp = RouteProp<RootStackParamList, 'SearchPage'>;
const mylistings = require('../../../assets/images/filter_icon.png');

const SearchPage: React.FC<SearchPageProps> = ({ navigation }) => {
  const [featurelist, setFeaturelist] = useState<Feature[]>([]);
  const [search, setSearch] = useState<string>('');
  const route = useRoute<SearchPageRouteProp>();
  const { category_id } = route.params;
  const {category_name} =route.params;

const [page, setPage] = useState(1);
const [isLoading, setIsLoading] = useState(false);
const [hasMore, setHasMore] = useState(true); // whether more pages exist
const [isFilterVisible, setFilterVisible] = useState(false);
const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
 const SCREEN_HEIGHT = Dimensions.get('window').height;
 
  useEffect(() => {
  const loadBookmarks = async () => {
    const saved = await AsyncStorage.getItem('bookmarkedIds');
    if (saved) setBookmarkedIds(JSON.parse(saved));
  };
  loadBookmarks();
}, []);

const clickfilter = () => {
  setFilterVisible(true);
};



  const displayListOfProduct = async (pageNum: number = 1,query = "") => {
  if (isLoading || !hasMore) return;
    if (!query.trim()) return;
  try {
    setIsLoading(true);

    console.log('CID',category_id)

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
    await AsyncStorage.setItem('bookmarkedIds', JSON.stringify(updatedBookmarks)); // persist locally

  } catch (error) {
    console.error('Bookmark error:', error);
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
        { flex: isLastOddItem ? 0.5 : 0.5, marginRight: isLastOddItem ? 0.5 : 0.5 },
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
          rating={item.isfeatured ? '4.5' : '4.5'}
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
          rating={item.isfeatured ? '4.5' : '4.5'}
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

const handleFilterApply = async (filterBody: any) => {
  try {
    setIsLoading(true);

    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;

    const url = `${MAIN_URL.baseUrl}category/filter-apply`;

    //const url = 'http://65.0.99.229:4320/category/filter-apply';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filterBody),
    });

    const jsonResponse = await response.json();
    console.log('Filter Apply Response:', jsonResponse);

    if (jsonResponse.statusCode === 200) {
      const filteredFeatures = jsonResponse.data.features;
      setFeaturelist(filteredFeatures);
      setHasMore(filteredFeatures.length === 20);
      setPage(2);
    }
    if(jsonResponse.statusCode === 401 || jsonResponse.statusCode === 403){
          setIsLoading(false);
          navigation.reset({
          index: 0,
          routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
        });
        }
  } catch (err) {
    console.log('Error applying filters:', err);
  } finally {
    setIsLoading(false);
  }
};


// const handleFilterApply = async (filterBody: any, pageNum: number = 1) => {
//   try {
//     if (isLoading) return;
//     setIsLoading(true);

//     const token = await AsyncStorage.getItem('userToken');
//     if (!token) return;

//     const url = `${MAIN_URL.baseUrl}category/filter-apply`;

//     const body = {
//       ...filterBody,
//       page: pageNum,
//       pagesize: 20,
//     };

//     console.log('Filter Apply Body:', body);

//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(body),
//     });

//     const jsonResponse = await response.json();
//     console.log('Filter Apply Response:', jsonResponse);

//     if (jsonResponse.statusCode === 200) {
//       const filteredFeatures = jsonResponse.data.features || [];

//       if (pageNum === 1) {
//         setFeaturelist(filteredFeatures);
//       } else {
//         setFeaturelist(prev => [...prev, ...filteredFeatures]);
//       }

//       setHasMore(filteredFeatures.length === 20);
//       setPage(prev => prev + 1);
//     } else if (jsonResponse.statusCode === 401 || jsonResponse.statusCode === 403) {
//       navigation.reset({
//         index: 0,
//         routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
//       });
//     }
//   } catch (err) {
//     console.log('Error applying filters:', err);
//   } finally {
//     setIsLoading(false);
//   }
// };


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
            <Text allowFontScaling={false} style={styles.unizyText}>Search</Text>

            <View style={{ width: 48 }} />
          </View>
        </View>

        {/* Search Bar */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16 ,marginVertical:8}}>
          <View style={styles.search_container}>
            <Image source={searchIcon} style={styles.searchIcon} />
           <TextInput
                allowFontScaling={false}
                style={styles.searchBar}
                placeholder="Search"
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

      <FlatList
        data={featurelist}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row1}
        contentContainerStyle={[
            styles.listContainer,{ paddingBottom: SCREEN_HEIGHT * 0.05 },
            featurelist?.length === 0 && { alignContent:'center',alignSelf:'center' ,width:'90%',height:'100%'}
          ]}
        //contentContainerStyle={styles.listContainer}
        renderItem={renderItem}
        onEndReached={() => {
            if (search.trim().length > 0) {
            displayListOfProduct(page, search);
            }
        }}
        onEndReachedThreshold={0.5} 
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

      {/* <FilterBottomSheet
        catagory_id={category_id}
        visible={isFilterVisible}
        onClose={() => setFilterVisible(false)}
      /> */}
      <FilterBottomSheet
        catagory_id={category_id}
        visible={isFilterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={(filterBody) => handleFilterApply(filterBody)} from={0} to={0}
        //onApply={(filterBody) => handleFilterApply(filterBody, 1)}
        //from={0} to={0}
        />
    <NewCustomToastContainer/>
    </ImageBackground>
  );
};

export default SearchPage;

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  fullScreenContainer: { flex: 1 },

  
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
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
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
  },
  search_container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 40,
    minHeight:48,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    width: '84%',
    marginEnd: 8,
  },
  searchIcon: { margin: 10, height: 24, width: 24 },
  searchBar: {
    fontSize: 17,
    color: '#fff',
  },
  listContainer: {
    // marginLeft: 10,
    // marginRight: 10,
    // paddingTop: 10,
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
  },
  iconSmall: {
    width: 24,
    height: 24,
  },
});
