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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
import { showToast } from '../../utils/toast';
import NewProductCard from '../../utils/ProductCardNew';

const bgImage = require('../../../assets/images/bganimationscreen.png');
const searchIcon = require('../../../assets/images/searchicon.png');

type Feature = {
  id: number;
  title: string;
  price: number;
  isactive: boolean;
  isfeatured: boolean;
};

type ProductDetailsProps = {
  navigation: any;
};

const ProductDetails: React.FC<ProductDetailsProps> = ({ navigation }) => {
  const [featurelist, setFeaturelist] = useState<Feature[]>([]);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    displayListOfProduct();
  }, []);

  // Fetch data from API
  const displayListOfProduct = async () => {
    try {
      const body = {
        search: 'mobile',
        page: 1,
        pagesize: 20,
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

  // Filter features by search
  const filteredFeatures: Feature[] = featurelist.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  // Render single item
  const renderItem = ({ item }: { item: Feature }) => (
    <View style={styles.itemContainer}>
      <NewProductCard
        tag={`ID: ${item.id}`}
        infoTitle={item.title}
        inforTitlePrice={`$${item.price}`}
        rating={item.isfeatured ? 'Featured' : 'Normal'}
        productImage={require('../../../assets/images/drone.png')}
      />
    </View>
  );

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
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
            <Text style={styles.unizyText}>Search</Text>
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

        {/* FlatList */}
        <FlatList
          data={filteredFeatures}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row1}
          contentContainerStyle={styles.listContainer}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
              No products found
            </Text>
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
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
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
    margin: 20,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: { margin: 10, height: 24, width: 24 },
  searchBar: {
    fontSize: 17,
    color: '#fff',
    width: '85%',
    padding: 9,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  itemContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
});