

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
import MyListingCard from '../../utils/MyListingCard';
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Feature = {
id: number,
created_by: number,
category_id: number,
created_at: any,
updated_at: string,
isactive: boolean,
isfeatured: boolean,
title: string,
price: number,
thumbnail: string,
university:university;
};
type university={
  id:number,
  name:string
}

type MyListingProps = {
  navigation: any;
};


const MyListing = ({ navigation }: MyListingProps)  => {
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
    let url = `${MAIN_URL.baseUrl}category/mylisting?page=${pageNum}&pagesize=${pagesize}`;
    if (categoryId) {
      url += `&category_id=${categoryId}`;
    }

    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;


    console.log('URL:', url);
    console.log('Token:', token);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const jsonResponse = await response.json();
    // console.log('API Response:', jsonResponse);

    if (jsonResponse.statusCode === 200) {
      setIsLoading(false);
      if (pageNum === 1) {
        setFeatureList(jsonResponse.data.features);
      } else {
        setFeatureList(prev => [...prev, ...jsonResponse.data.features]);
      }
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

const filteredFeatures: Feature[] = featurelist
  .filter((item) =>
    (item.title ?? '').toLowerCase().includes(search.toLowerCase())
  )

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString || dateString.trim() === '') return '01-01-2025';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '01-01-2025';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const renderItem = ({ item, index }: { item: Feature; index: number }) => {
  const isLastOddItem =
    filteredFeatures.length % 2 !== 0 &&
    index === filteredFeatures.length - 1;
      const displayDate = formatDate(item.created_at);


    const displayTitle =
    item.title && item.title.trim() !== '' ? item.title : 'Title';
    
    const displayPrice = item.price != null ? item.price : 0;


    const productImage = item.thumbnail
  ? { uri: item.thumbnail }
  : require('../../../assets/images/drone.png');

  return (
    <View
      style={[
        styles.itemContainer,
      ]}
    >
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
       catagory_name = {item.title}

      />
    </View>
  );
};



  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.replace('Dashboard',{AddScreenBackactiveTab: 'Home',isNavigate: false})}>
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.unizyText}>My Listings</Text>
            <View style={{ width: 48 }} />
          </View>
        </View>

    <View>
     <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 6 ,}}
       
        contentContainerStyle={{ paddingHorizontal: 16,paddingVertical:10, gap: 4,  }}
      >
        {categories.map((cat, index) => {
          const isSelected = selectedCategory.name === cat.name;
          return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(cat)}
                
              >
                <View style={isSelected ? styles.tabcard : styles.tabcard1} key={index}>

                <Text allowFontScaling={false} style={isSelected ? styles.tabtext : styles.othertext}>
                  {cat.name}
                </Text>

            </View>
              </TouchableOpacity>
          );
        })}
      </ScrollView>
            
       <FlatList
        data={featureList}
        renderItem={renderItem}
        //contentContainerStyle={[styles.listContainer]}
        contentContainerStyle={[
            styles.listContainer,
            featureList?.length === 0 && { alignContent:'center',alignSelf:'center' ,width:'90%',height:'90%'}
          ]}
        keyExtractor={(item, index) => index.toString()}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          const nextPage = page + 1;
          setPage(nextPage);
          displayListOfProduct(selectedCategory?.id ?? null, nextPage);
        }}
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator size="small" color="#fff" style={{ marginVertical: 10 }} />
          ) : null
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
                                      No Listings found
                                    </Text>
                                  </View>
                                  </View>
                                ) : null
                              }
               />
        </View>
      </View>
      <NewCustomToastContainer/>
    </ImageBackground>
  );
};

export default MyListing;

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
     flex: 1,
     marginTop: 10
     },
  header: {
    paddingTop: Platform.OS === 'ios' ? 42 : 50,
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
     marginRight:12,
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
    //paddingBottom:40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 80,

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