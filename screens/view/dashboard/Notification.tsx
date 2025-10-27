

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
const bgImage = require('../../../assets/images/backimg.png');
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';
import NotificationCard from '../../utils/NotificationCard';
import { MAIN_URL } from '../../utils/APIConstant';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


type NotificationProps = {
  navigation: any;
};

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

  type Category = {
  id: number | null; 
  name: string;
};


const Notification = ({ navigation }: NotificationProps)  => {

     const [featurelist, setFeaturelist] = useState<Feature[]>([]);
     const [search, setSearch] = useState<string>('');
     const [page, setPage] = useState(1);
     const [isLoadingMore, setIsLoadingMore] = useState(false);
     const pagesize = 10;
     const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
     const [isLoading, setIsLoading] = useState(false);
     const insets = useSafeAreaInsets(); // Safe area insets
     const { height: screenHeight } = Dimensions.get('window');
    const [selectedCategory, setSelectedCategory] = useState<Category>({ id: null, name: 'All' });
const [categories, setCategories] = useState<Category[]>([
  { id: null, name: 'All' }
]);
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

 const [featureList, setFeatureList] = useState<any[]>([]);
    const filteredFeatures: Feature[] = featurelist
  .filter((item) =>
    (item.title ?? '').toLowerCase().includes(search.toLowerCase())
  )

const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  // Determine suffix
  const j = day % 10,
    k = day % 100;
  let suffix = 'th';
  if (j === 1 && k !== 11) suffix = 'st';
  else if (j === 2 && k !== 12) suffix = 'nd';
  else if (j === 3 && k !== 13) suffix = 'rd';

  return `${day}${suffix} ${month} ${year}`;
};

const groupByDate = (data: any[]) => {
  const grouped: { type: string; id: string; displayDate: string; }[] = [];
  let lastDate: string | null = null;

  data.forEach((item: { created_at: string; }) => {
    const displayDate = formatDate(item.created_at);

    if (displayDate !== lastDate) {
      grouped.push({ type: 'date', id: `date-${displayDate}`, displayDate });
      lastDate = displayDate;
    }

    grouped.push({
        ...item, type: 'item',
        id: '',
        displayDate: ''
    });
  });

  return grouped;
};

const groupedList = groupByDate(featureList);

const renderItem = ({ item, index }: { item: any; index: number }) => {
  if (item.type === 'date') {
    return (
      <Text style={styles.dateHeading}>{item.displayDate}</Text>
    );
  }

  const displayPrice = item.price != null ? item.price : 0;
  const productImage = require('../../../assets/images/bellicon.png');

  return (
    <View style={styles.itemContainer}>
      <NotificationCard
        infoTitle="Item Listed Successfully"
        inforTitlePrice={`£ ${displayPrice}`}
        rating="3"
        productImage={productImage}
        reviewText="This drone is awesome! Super easy to fly even though it’s my first one. Totally worth it for the price."
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
            <TouchableOpacity onPress={() => navigation.replace('Dashboard',{AddScreenBackactiveTab: 'Profile',isNavigate: false})}>
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.unizyText}>Notifications</Text>
            <View style={{ width: 48 }} />
          </View>
        </View>

    <View>
   
       
    <FlatList
            data={groupedList}
            renderItem={renderItem}
            contentContainerStyle={[
                 styles.listContainer,
                   {
                   paddingBottom: screenHeight * 0.2 + insets.bottom, 
                    },
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

export default Notification;

const styles = StyleSheet.create({

dateHeading:{
    color:'#fff',
    fontSize:12,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight:500,
    marginLeft:12
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
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
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
  
  listContainer: {
    marginLeft: 10,
    marginRight: 10,
    paddingTop: 10,
    //paddingBottom:80,
  },
  
  itemContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
});