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

const bgImage = require('../../../assets/images/bganimationscreen.png');
const searchIcon = require('../../../assets/images/searchicon.png');
import { useRoute, RouteProp } from '@react-navigation/native';
import SearchListProductCard from '../../utils/SearchListProductCard';
import FilterBottomSheet from '../../utils/component/FilterBottomSheet';

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
};

type ProductDetailsProps = {
  navigation: any;
};

type RootStackParamList = {
  ProductDetails: { category_id: number };
};

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;
const mylistings = require('../../../assets/images/filter_icon.png');

const ProductDetails: React.FC<ProductDetailsProps> = ({ navigation }) => {
  const [featurelist, setFeaturelist] = useState<Feature[]>([]);
  const [search, setSearch] = useState<string>('');
  const route = useRoute<ProductDetailsRouteProp>();
  const { category_id } = route.params;

const [page, setPage] = useState(1);
const [isLoading, setIsLoading] = useState(false);
const [hasMore, setHasMore] = useState(true); // whether more pages exist
const [isFilterVisible, setFilterVisible] = useState(false);

const clickfilter = () => {
  setFilterVisible(true);
};

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
    item.title?.toLowerCase().includes(search.toLowerCase())
  );

//   const renderItem = ({ item, index }: { item: Feature; index: number }) => {
//     const isLastOddItem =
//       filteredFeatures.length % 2 !== 0 &&
//       index === filteredFeatures.length - 1;

//        const productImage = item.thumbnail
//   ? { uri: item.thumbnail }
//   : require('../../../assets/images/drone.png');

//   return (
   
//     <View
//       style={[
//         styles.itemContainer,
//         { flex: isLastOddItem ? 0.5: 0.5, marginRight: isLastOddItem ? 0.5 : 0.5 },
//       ]}
//     >
//          <TouchableOpacity
//       onPress={() =>
//         navigation.navigate('SearchDetails', { id: item.id }) // 👈 pass id here
//       }
//       style={{ flex: 1 }}
//     >
//       <SearchListProductCard
//         tag="University of Warwick"
//         infoTitle={item.title}
//         inforTitlePrice={`£ ${item.price}`}
//         rating={item.isfeatured ? '4.5' : '4.5'}
//         productImage={productImage}
//         bookmark={item.isfeatured}
//       />
      
//     </TouchableOpacity>
//     </View>
//   );
// };

const renderItem = ({ item, index }: { item: Feature; index: number }) => {
  const isLastOddItem =
    filteredFeatures.length % 2 !== 0 &&
    index === filteredFeatures.length - 1;

  const isCircleCategory = item.category_id === 2 || item.category_id === 5;

  // Get initials from title or show "NA" if null/empty
  const getInitials = (text?: string) => {
    // if (!text) return 'NA';
    // const initials = text
    //   .split(' ')
    //   .map(word => word[0]?.toUpperCase())
    //   .slice(0, 2)
    //   .join('');
    return 'NA';
  };

  const productImage = isCircleCategory ? (
    <View
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>
        {getInitials("NA")}
      </Text>
    </View>
  ) : item.thumbnail
  ? { uri: item.thumbnail }
  : require('../../../assets/images/drone.png');

  return (
    <View
      style={[
        styles.itemContainer,
        { flex: isLastOddItem ? 0.5 : 0.5, marginRight: isLastOddItem ? 0.5 : 0.5 },
      ]}
    >
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('SearchDetails', { id: item.id })
        }
        style={{ flex: 1 }}
      >
        <SearchListProductCard
          tag="University of Warwick"
          infoTitle={item.title}
          inforTitlePrice={`£ ${item.price}`}
          rating={item.isfeatured ? '4.5' : '4.5'}
          productImage={productImage} // Circle with initials or image
          bookmark={item.isfeatured}
        />
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
        <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
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

      <FilterBottomSheet
        visible={isFilterVisible}
        onClose={() => setFilterVisible(false)}
      />
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
    borderRadius: 40,
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
