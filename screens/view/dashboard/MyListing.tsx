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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
import { showToast } from '../../utils/toast';

const bgImage = require('../../../assets/images/bganimationscreen.png');
import { useRoute, RouteProp } from '@react-navigation/native';
import SearchListProductCard from '../../utils/SearchListProductCard';
import MyListingCard from '../../utils/MyListingCard';
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';

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
thumbnail: string
};

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
        setFeatureList(jsonResponse.data.features);
      } else {
        setFeatureList(prev => [...prev, ...jsonResponse.data.features]);
      }
    } else {
      setIsLoading(false);
      console.log('API Error:', jsonResponse.message);
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
        tag="University of Warwick"
        infoTitle={displayTitle}
        inforTitlePrice={`£ ${displayPrice}`} 
        rating={displayDate} 
        productImage={productImage}
        topRightText={item.isactive ? 'Active' : 'Inactive'}
        isfeature={item.isfeatured}
       navigation={navigation}
       shareid={item.id}
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
            <TouchableOpacity onPress={() => navigation.replace('Dashboard')}>
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.unizyText}>My Listing</Text>
            <View style={{ width: 30 }} />
          </View>
        </View>

    <View>
     <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 10 }}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        {categories.map((cat, index) => {
          const isSelected = selectedCategory.name === cat.name;
          return (
            <View style={{ paddingVertical: 2 }} key={index}>
              <TouchableOpacity
                onPress={() => setSelectedCategory(cat)}
                style={isSelected ? styles.tabcard : styles.tabcard1}
              >
                <Text style={isSelected ? styles.tabtext : styles.othertext}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
            
       <FlatList
        data={featureList}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
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
            <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
              No products found
            </Text>
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

 tabcard: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
     borderWidth: 0.4,
    borderColor: '#ffffff11',

    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
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
  },
  tabcard1: {
     borderWidth: 0.4,
    borderColor: '#ffffff11',

    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
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
    paddingVertical: 8,
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
    paddingTop: Platform.OS === 'ios' ? 70 : 30,
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
    paddingBottom:40,
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