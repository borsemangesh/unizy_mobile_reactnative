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
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
import { showToast } from '../../utils/toast';
import NewProductCard from '../../utils/NewProductCard';

const bgImage = require('../../../assets/images/bganimationscreen.png');
const searchIcon = require('../../../assets/images/searchicon.png');
import { useRoute, RouteProp } from '@react-navigation/native';
import SearchListProductCard from '../../utils/SearchListProductCard';
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

type ProductDetailsProps = {
  navigation: any;
};


// Define your stack param list (optional but helps with TypeScript)
type RootStackParamList = {
  ProductDetails: { category_id: number }; // name is passed in productId
};

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;
const mylistings = require('../../../assets/images/mylistingicon.png');

const ProductDetails: React.FC<ProductDetailsProps> = ({ navigation }) => {
  const [featurelist, setFeaturelist] = useState<Feature[]>([]);
  const [search, setSearch] = useState<string>('');
  const route = useRoute<ProductDetailsRouteProp>();
  const { category_id } = route.params;

const [page, setPage] = useState(1);
const [isLoading, setIsLoading] = useState(false);
const [hasMore, setHasMore] = useState(true); // whether more pages exist

  useEffect(() => {
    displayListOfProduct();
  }, []);


  const displayListOfProduct = async (pageNum: number = 1) => {
  if (isLoading || !hasMore) return;

  try {
    setIsLoading(true);

    const body = {
      search: search,
      page: pageNum,
      pagesize: 20,
      category_id: category_id,
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

  
  const filteredFeatures: Feature[] = featurelist.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  // Render single item
const renderItem = ({ item, index }: { item: Feature; index: number }) => {
  const isLastOddItem =
    filteredFeatures.length % 2 !== 0 &&
    index === filteredFeatures.length - 1;

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('SearchDetails', { id: item.id }) // 👈 pass id here
      }
      style={{ flex: 1 }}
    >
    <View
      style={[
        styles.itemContainer,
        { flex: isLastOddItem ? 0.5: 0.5, marginRight: isLastOddItem ? 0.5 : 0.5 },
      ]}
    >
      <SearchListProductCard
        tag="University of Warwick"
        infoTitle={item.title}
        inforTitlePrice={`£ ${item.price}`}
        rating={item.isfeatured ? '4.5' : '4.5'}
        productImage={require('../../../assets/images/drone.png')}
        bookmark={item.isfeatured}
      />
    </View>
    </TouchableOpacity>
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
            <Text style={styles.unizyText}>Products</Text>
            <View style={{ width: 30 }} />
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.search_container}>
          <Image source={searchIcon} style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Search"
            placeholderTextColor="#ccc"
            onChangeText={setSearch}
            value={search}
          />
        </View>

      <FlatList
        data={featurelist}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row1}
        contentContainerStyle={styles.listContainer}
        renderItem={renderItem}
        onEndReached={() => displayListOfProduct(page)} // fetch next page
        onEndReachedThreshold={0.5} // adjust when to trigger
        ListFooterComponent={
            isLoading ? <ActivityIndicator size="small" color="#fff" /> : null
          }
          ListEmptyComponent={
            !isLoading ? ( // ✅ only show if not loading
              <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
                No products found
              </Text>
            ) : null
          }
          />
      </View>
    </ImageBackground>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  fullScreenContainer: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
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