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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
import { showToast } from '../../utils/toast';

const bgImage = require('../../../assets/images/bganimationscreen.png');
import { useRoute, RouteProp } from '@react-navigation/native';
import SearchListProductCard from '../../utils/SearchListProductCard';
import MyListingCard from '../../utils/MyListingCard';
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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Product', 'Tuition', 'Accommodation','Food'];


  //const { category_id } = route.params;

  useEffect(() => {
    displayListOfProduct();
  }, []);

  const displayListOfProduct = async () => {
    try {
      const body = {
        search: search,
        page: 1,
        pagesize: 20,
        category_id:1
      };

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
        showToast(jsonResponse.message);
        setFeaturelist(jsonResponse.data.features);
      }
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const filteredFeatures: Feature[] = featurelist
  .filter((item) =>
    (item.title ?? '').toLowerCase().includes(search.toLowerCase())
  )
  .slice(0, 5); 


const renderItem = ({ item, index }: { item: Feature; index: number }) => {
  const isLastOddItem =
    filteredFeatures.length % 2 !== 0 &&
    index === filteredFeatures.length - 1;

  return (
    <View
      style={[
        styles.itemContainer,
      ]}
    >
      <MyListingCard
        tag="University of Warwick"
        infoTitle={item.title}
        inforTitlePrice={`$ ${item.price}`}
        rating={item.isfeatured ? '4.5' : '4.5'}
        productImage={require('../../../assets/images/drone.png')}
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
                 const isSelected = selectedCategory === cat;
                 return (
                    <View style={{paddingVertical:2}}>
                 <TouchableOpacity
                     key={index}
                     onPress={() => setSelectedCategory(cat)}
                     style={isSelected ? styles.tabcard : styles.tabcard1}
                 >
                     <Text  style={isSelected ? styles.tabtext : styles.othertext}>
                     {cat}
                     </Text>
                 </TouchableOpacity>
                 </View>
                 );
             })}
        </ScrollView>
            

        {/* FlatList */}
        <FlatList
          data={filteredFeatures}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ color: '#fff', textAlign: 'center' }}>
              No products found
            </Text>
          }
        />
        </View>
      </View>
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
    marginLeft: 10,
    marginRight: 20,
    paddingTop: 10,
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