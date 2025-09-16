import {
    FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useState } from 'react';
import ProductCard from '../../utils/ProductCard';


const mylistings = require('../../../assets/images/mylistings.png');
const searchIcon = require('../../../assets/images/searchicon.png');
//const BGImag = require('../../../assets/images/bgimage.png');

const producticon = require('../../../assets/images/producticon.png');

const DashBoardScreen = () => {
  const [search, setSearch] = useState('');

  return (
    <ImageBackground
      source={require('../../../assets/images/bganimationscreen.png')}
      style={{ flex: 1, width: '100%', height: '100%' }}
    >
      <View style={dashboardStyles.fullScreenContainer}>
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 12,
            paddingBottom: 12,
            paddingLeft: 16,
            paddingRight: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center',alignContent: 'center' }}>
            <View style={dashboardStyles.MylistingsBackground}>
              <Image source={mylistings} style={{ width: 15, height: 15 }} />
            </View>

            <Text style={dashboardStyles.unizyText}>UniZy</Text>
            <View style={dashboardStyles.emptyView}>
              <View style={dashboardStyles.MylistingsBackground}>
                <Image source={mylistings} style={{ width: 15, height: 15 }} />
              </View>
            </View>
          </View>

          <View style={dashboardStyles.search_container}>
            <Image source={searchIcon} style={dashboardStyles.searchIcon} />
            <TextInput
              style={dashboardStyles.searchBar}
              placeholder="Search"
              placeholderTextColor="#ccc"
              onChangeText={setSearch}
              value={search}
            />
          </View>
        </View>
        <View
          style={{
            paddingTop: 4,
            paddingLeft: 16,
            paddingRight: 16,
            paddingBottom: 12,
            flexDirection: 'column',
          }}
        >
          <View style={dashboardStyles.product_container}>
            <Image source={producticon} style={{ width: 24, height: 24 }} />
            <Text style={dashboardStyles.productText}>Product</Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              paddingTop: 12,
            }}
          >
            <View
              style={{
                flex: 1,
                height: 44,
                flexDirection: 'row',
                borderRadius: 16,
                backgroundColor:
                  'radial-gradient(189.13% 141.42% at 0% 0%, rgba(0, 0, 0, 0.05) 0%, rgba(255, 255, 255, 0.05) 16%, rgba(255, 255, 255, 0.05) 84%, rgba(0, 0, 0, 0.05) 100%)',
                boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
                padding: 12,
                alignItems: 'center',
                margin: 4,
              }}
            >
              <Image source={producticon} style={{ width: 24, height: 24 }} />
              <Text style={dashboardStyles.productText}>Food </Text>
            </View>

            <View
              style={{
                flex: 1,
                height: 44,
                flexDirection: 'row',
                borderRadius: 16,
                backgroundColor:
                  'radial-gradient(189.13% 141.42% at 0% 0%, rgba(0, 0, 0, 0.05) 0%, rgba(255, 255, 255, 0.05) 16%, rgba(255, 255, 255, 0.05) 84%, rgba(0, 0, 0, 0.05) 100%)',
                boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
                padding: 12,
                margin: 8,
                alignItems: 'center',
              }}
            >
              <Image source={producticon} style={{ width: 24, height: 24 }} />
              <Text style={dashboardStyles.productText}>Accommodation</Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <View
              style={{
                flex: 1,
                height: 44,
                flexDirection: 'row',
                borderRadius: 16,
                backgroundColor:
                  'radial-gradient(189.13% 141.42% at 0% 0%, rgba(0, 0, 0, 0.05) 0%, rgba(255, 255, 255, 0.05) 16%, rgba(255, 255, 255, 0.05) 84%, rgba(0, 0, 0, 0.05) 100%)',
                boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
                padding: 12,
                alignItems: 'center',
                margin: 4,
              }}
            >
              <Image source={producticon} style={{ width: 24, height: 24 }} />
              <Text style={dashboardStyles.productText}>Tuition </Text>
            </View>

            <View
              style={{
                flex: 1,
                height: 44,
                flexDirection: 'row',
                borderRadius: 16,
                backgroundColor:
                  'radial-gradient(189.13% 141.42% at 0% 0%, rgba(0, 0, 0, 0.05) 0%, rgba(255, 255, 255, 0.05) 16%, rgba(255, 255, 255, 0.05) 84%, rgba(0, 0, 0, 0.05) 100%)',
                boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
                padding: 12,
                margin: 8,
                alignItems: 'center',
              }}
            >
              <Image source={producticon} style={{ width: 24, height: 24 }} />
              <Text style={dashboardStyles.productText}>House Keeping</Text>
            </View>
          </View>

          <Text
            style={{
              color: '#FFF',
              fontFamily: 'Urbanist-medium',
              fontSize: 17,
              width: '100%',
              fontWeight: 600,
              marginTop: 10,
              letterSpacing: -0.43,
              lineHeight: 22,
            }}
          >
            Featured Listings
          </Text>


            {/* CARD DISPLAY */}
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                <ProductCard />
                <ProductCard />
                <ProductCard />
            </ScrollView>
   
            {/* <View style={{ marginTop: 10 ,
            backgroundColor: 'rgba(0, 0, 0, 0.00)',
                width: '100%',
                padding: 38,

            }}>
                <View style={{
                    backgroundColor:'rgba(0, 0, 0, 0.00)',
                    width:'100%',
                    height:230,                    
                borderWidth: 1,
                borderColor: '#ffffff4e',
                   borderRadius: 34,
                    flexShrink: 0,
                    padding: 10,

                }}>
                    <Text>This </Text>
                </View>
            </View> */}


        </View>
      </View>
    </ImageBackground>
  );
};
export default DashBoardScreen;

const dashboardStyles = StyleSheet.create({
  fullScreenContainer: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
  },
  MylistingsBackground: {
    display: 'flex',
    height: 35,
    width: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
  },
  unizyText: {
    color: '#FFFFFF',
    fontFamily: 'MonumentExtended-Regular',
    fontSize: 24,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 110,
    textAlign: 'center',
    flex: 1,
    gap: 10,
  },
  emptyView: {},
  search_container: {
    display: 'flex',
    height: 44,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 40,
    backgroundColor:
      'radial-gradient(191.71% 141.42% at 0% 0%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.20) 50.44%, rgba(255, 255, 255, 0.20) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
  },
  searchIcon: {
    padding: 5,
    margin: 10,
    height: 16,
    width: 16,
    flexShrink: 0,
  },
  searchBar: {
    fontFamily: 'Urbanist-Medium',
    marginLeft: -5,
  },
  product_container: {
    display: 'flex',
    height: 44,
    flexDirection: 'row',
    borderRadius: 16,
    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(0, 0, 0, 0.05) 0%, rgba(255, 255, 255, 0.05) 16%, rgba(255, 255, 255, 0.05) 84%, rgba(0, 0, 0, 0.05) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    padding: 12,
    alignItems: 'center',
  },
  productText: {
    color: '#FFFFFF',
    fontFamily: 'Urbanist-Medium',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '600',
    letterSpacing: -0.32,
    paddingLeft: 12,
  },

  card: {
    backgroundColor: "linear-gradient(135deg, #1d4ed8, #0ea5e9)", // fallback
    // backgroundColor: "#1e3a8a", // fallback for Android
    borderRadius: 20,
    overflow: "hidden",
    margin: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
});
