import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Switch,
  FlatList,
} from 'react-native';
import ProductCard from '../../utils/ProductCard';
import NewProductCard from '../../utils/NewProductCard';

// assets
const bgImage = require('../../../assets/images/bganimationscreen.png');
const searchIcon = require('../../../assets/images/searchicon.png');

const products = [
  {
    id: '1',
    tag: 'University of Warwick',
    infoTitle: 'Quadcopter (Drone)',
    inforTitlePrice: '$10.00',
    rating: '4.5',
    productImage: require('../../../assets/images/drone.png'),
  },
  {
    id: '2',
    tag: 'MIT',
    infoTitle: 'Rover Bot',
    inforTitlePrice: '$25.00',
    rating: '4.8',
    productImage: require('../../../assets/images/drone.png'),
  },
  {
    id: '3',
    tag: 'Stanford',
    infoTitle: 'Robotic Arm',
    inforTitlePrice: '$15.00',
    rating: '4.7',
    productImage: require('../../../assets/images/drone.png'),
  },
  {
    id: '4',
    tag: 'Harvard',
    infoTitle: 'AI Car',
    inforTitlePrice: '$30.00',
    rating: '4.9',
    productImage: require('../../../assets/images/drone.png'),
  },

];
type ProductDetailsProps = {
  navigation: any;
};


const ProductDetails= ({ navigation }: ProductDetailsProps) => {
  const [featured, setFeatured] = useState(false);

  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(item =>
  item.infoTitle.toLowerCase().includes(search.toLowerCase())
);


  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
          <TouchableOpacity  onPress={() => {
              navigation.replace('Dashboard');
            }}>
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

           {/* <ProductCard
                tag='University of Warwick' 
                infoTitle='Quadcopter (Drone)'
                inforTitlePrice='$10.00'
                rating='4.5'
                productImage={require("../../../assets/images/drone.png")}/> */}

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                numColumns={2} 
                columnWrapperStyle={styles.row1} 
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                    <NewProductCard
                        tag={item.tag}
                        infoTitle={item.infoTitle}
                        inforTitlePrice={item.inforTitlePrice}
                        rating={item.rating}
                        productImage={item.productImage}
                    />
                    </View>
                    )}
    />
            
     
      </View>
    </ImageBackground>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({

  backIconRow: {
    
    display: 'flex',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
      boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    height: 48,
    width: 48,
  },
  listContainer: {
    paddingHorizontal:4,
    paddingBottom: 15,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  itemContainer: {
    flex: 1,
    marginHorizontal:4,
   // width:'50%'
  },

 search_container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 50,
    margin: 20,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
  },
  searchIcon: {
    padding: 5, 
    margin: 10 ,
    height:24,
    width:24
  },
  searchBar: {
    fontFamily: 'Urbanist-Medium',
    marginLeft: -5,
    fontWeight:500,
    fontSize:17,
    color:'#fff'
  },


  textstyle:{
    color:'#fff',
    marginTop:10,
    marginLeft:4,
    fontWeight:400,
    fontSize:12,
    fontFamily: 'Urbanist-Regular',
  },

   row1: {
    flexDirection: 'row',  // put icon and text side by side
  //alignItems: 'center', 
    justifyContent: 'flex-start'// vertically center them
  },
  icon: {
    width: 18,  // adjust as needed
    height: 18,
    marginRight: 6, 
     resizeMode:'contain'
  },
  background: { 
    flex: 1,
    width: '100%',
    height: '100%' },
  fullScreenContainer: {
     flex: 1 
    },
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { 
    fontSize: 26, 
    color: '#fff' 
  },
  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    flex: 1,
    paddingRight:16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    padding:16,
    borderRadius:26,
     backgroundColor: 'rgba(255, 255, 255, 0.06)',

  },
  avatar: { 
    width: 50,
    height: 50,
    borderRadius: 25, 
    marginRight: 12 
    },
  userName: { 
    color: '#fff',
    fontSize: 16, 
    fontWeight: 'bold'
   },
  userSub: { 
    color: '#ccc',
     fontSize: 12
     },

     
  dateText: { 
    color: '#ccc',
     fontSize: 12 
    },
  uploadButton: {
    height: 40,
    gap: 10,
    marginTop:10,
    alignSelf: 'stretch',
    borderRadius: 12,
    borderWidth: 0.6,
    borderColor: '#ffffff2c',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
  },
  uploadIcon: { 
    width: 20, 
    height: 20, 
    marginRight: 8, 
    resizeMode:'contain'
   },
  uploadText: { 
    color: '#fff',
     fontSize: 14 },

    filecard:{
      marginTop:20,
      borderRadius:12,
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderWidth:1,
      borderColor: '#ffffff2c',
      boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
     },

  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    
  },
  fileIcon: {
      width: 28, 
    height: 28,
    resizeMode:'contain',
      marginRight: 8 
    },
  fileName: {
     color: '#fff',
      flex: 1 },
  deleteBtn: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: { 
    width: 28, 
    height: 28,
    resizeMode:'contain'
    },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    marginTop:12,
  },
  categoryTag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  featuredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  featuredLabel: {
     color: '#fff', 
     fontSize: 14 
    },
  importantText: { 
    color: '#ccc',
     fontSize: 12,
      marginBottom: 16 
    },
 

    previewBtn: {
    display: 'flex',
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    marginTop: 10,
    
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },
  previewText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    width: '100%',
  },

  login_container: {
    display: 'flex',
    width: '100%',
    height: 40,
    gap: 10,
    marginBottom:10,
    alignSelf: 'stretch',
    borderRadius: 12,
    borderWidth: 0.6,
    borderColor: '#ffffff2c',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
  },
  personalEmailID_TextInput: {
    width: '93%',
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
    fontStyle: 'normal',
    color:'#fff'
    
  },
});
