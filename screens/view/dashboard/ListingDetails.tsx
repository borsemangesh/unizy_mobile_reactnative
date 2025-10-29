import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { showToast } from '../../utils/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
import { useRoute } from '@react-navigation/native';
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';
import { useState, useEffect } from 'react';

type ListingDetailsProps = {
  navigation: any;
};
const bgImage = require('../../../assets/images/backimg.png');
const ListingDetails = ({ navigation }: ListingDetailsProps) => {

  const scrollY1 = new Animated.Value(0);
  const route = useRoute();
  //const { shareid } = route.params as { shareid: number };
  const { shareid = 1 } = (route.params as { shareid?: number }) || {}
  const { catagory_id = 0 } = (route.params as { catagory_id?: number }) || {}
   const { catagory_name = '' } = (route.params as { catagory_name?: string }) || {}


  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchDetails = async () => {
      try {
        console.log('shareidListDetails:', shareid, catagory_id);
         const token = await AsyncStorage.getItem('userToken');
        if (!token) return;
        const url = `${MAIN_URL.baseUrl}category/mylisting-details/${shareid}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        const result = await response.json();
        if (response.ok) {
          setData(result.data);
        } else {
          console.error('Error:', result.message || 'Failed to fetch details');
        }
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [shareid]);


  const handleDeactivate = async () => {
  try {
    
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;

    const url2 = `${MAIN_URL.baseUrl}category/feature/active-inactive`;
    const response = await fetch(url2, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify({
        product_id: shareid, 
      }),
    });

    const data1 = await response.json();
    console.log("✅ API Response:", data1);

    if (data1.message) {
      showToast(data1.message, data1.statusCode === 200 ? 'success' : 'error');
    } else {
      showToast("Something went wrong", "error");
    }
    
  } catch (error) {
    console.error("❌ API Error:", error);
    showToast("Failed to update product status",'error');
  }
};
const formatDateWithDash = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
            >
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.unizyText}>
              Listing Details
            </Text>
            <View style={{ width: 48 }} />
          </View>
        </View>

        <View>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            onScroll={Animated.event([
              {
                nativeEvent: { contentOffset: { y: scrollY1 } },
              },
            ])}
            scrollEventThrottle={16}
          >
            <View
              style={{
                gap: 16,
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}
            >
              {/* Card */}
              <View style={styles.card}>
                <View style={{ flexDirection: 'row' }}>
                  <Image
                    source={{
                      uri: data?.list?.profileshowinview
                        ? data?.list?.createdby?.profile
                        : data?.list?.thumbnail,
                    }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <View style={{ marginLeft: 10, gap: 8 }}>
                    <Text
                      allowFontScaling={false}
                      style={styles.productlebleHeader}
                    >
                      {' '}
                      {data?.list?.title}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={styles.productlableprice}
                    >
                      £{data?.list?.price}
                    </Text>
                    <View style={styles.univercitycontainer}>
                      <Text
                        allowFontScaling={false}
                        style={styles.universitylable}
                      >
                        {data?.list?.createdby?.university_name}
                      </Text>
                      <Text allowFontScaling={false} style={styles.datetlable}>
                        {formatDateWithDash(data?.list?.created_at)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cardconstinerdivider} />
                <View style={styles.listingtyperow}>
                  <Text allowFontScaling={false} style={styles.lebleHeader}>
                    Listing Type:
                  </Text>
                  <Text allowFontScaling={false} style={styles.status}>
                    {data?.list?.isfeatured ? 'Featured' : 'Not Featured'}
                  </Text>
                </View>
                <View style={styles.listingtyperow}>
                  <Text allowFontScaling={false} style={styles.lebleHeader}>
                    Listing Status:
                  </Text>
                  <Text allowFontScaling={false} style={styles.status}>
                    {' '}
                    {data?.list?.isactive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>

              <View style={styles.carddivider} />

              {Array.isArray(data?.buyers) &&
                data.buyers.map((buyer: any, index: number) => (
                  <View key={index} style={styles.card}>
                    {/* HEADER */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        justifyContent: buyer.otpverified
                          ? 'space-between'
                          : 'flex-start',
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Image
                          source={require('../../../assets/images/sellerfile.png')}
                          style={{ width: 24, height: 24 }}
                          resizeMode="cover"
                        />
                        <Text
                          allowFontScaling={false}
                          style={styles.sellerHeaderlable}
                        >
                          Sale Details
                        </Text>
                      </View>

                      {/* ✅ STATUS BADGE - only if otpverified */}
                      {buyer.otpverified && (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.18)',
                            paddingHorizontal: 6,
                            paddingVertical: 4,
                            borderRadius: 6,
                            gap: 4,
                          }}
                        >
                          <Text
                            allowFontScaling={false}
                            style={{
                              color: 'rgba(255, 255, 255, 0.88)',
                              fontFamily: 'Urbanist-Regular',
                              fontSize: 12,
                              fontWeight: '600',
                            }}
                          >
                            Completed
                          </Text>
                          <Image
                            source={require('../../../assets/images/tick.png')}
                            style={{ width: 12, height: 12 }}
                            resizeMode="cover"
                          />
                        </View>
                      )}
                    </View>

                    <View style={styles.cardconstinerdivider} />

                    {/* BUYER DETAILS */}
                    <View style={styles.listingtyperow}>
                      <Text allowFontScaling={false} style={styles.lebleHeader}>
                        Buyer Name:
                      </Text>
                      <Text allowFontScaling={false} style={styles.status}>
                        {buyer.firstname} {buyer.lastname}
                      </Text>
                    </View>

                    <View style={styles.listingtyperow}>
                      <Text allowFontScaling={false} style={styles.lebleHeader}>
                        Buyer’s University:
                      </Text>
                      <Text allowFontScaling={false} style={styles.status}>
                        {buyer.university}
                      </Text>
                    </View>

                    <View style={styles.listingtyperow}>
                      <Text allowFontScaling={false} style={styles.lebleHeader}>
                        City:
                      </Text>
                      <Text allowFontScaling={false} style={styles.status}>
                        {buyer.city}
                      </Text>
                    </View>

                    <View style={styles.listingtyperow}>
                      <Text allowFontScaling={false} style={styles.lebleHeader}>
                        Sold On:
                      </Text>
                      <Text allowFontScaling={false} style={styles.status}>
                        {new Date(buyer.date).toLocaleString('en-GB', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </Text>
                    </View>

                    <View style={styles.listingtyperow}>
                      <Text allowFontScaling={false} style={styles.lebleHeader}>
                        Sold For:
                      </Text>
                      <Text allowFontScaling={false} style={styles.status}>
                        ${buyer.price}
                      </Text>
                    </View>

                    <View style={styles.cardconstinerdivider} />

                    {/* 🔢 Enter OTP Button - only if NOT verified */}
                    {!buyer.otpverified && (
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            width: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                          onPress={() =>
                            console.log(`Enter OTP for ${buyer.firstname}`)
                          }
                        >
                          <Text allowFontScaling={false} style={styles.status}>
                            Enter OTP
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.bottomview}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleDeactivate}>
            <Text allowFontScaling={false} style={styles.cancelText}>
              Deactivate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelBtn, { backgroundColor: '#ffffffa7' }]}
            onPress={() => {
              navigation.replace(
                'EditListScreen',
                {
                  productId: catagory_id,
                  productName: catagory_name,
                  shareid: shareid,
                },
                { animation: 'none' },
              );
            }}
          >
            <Text
              allowFontScaling={false}
              style={[styles.cancelText, { color: '#000000' }]}
            >
              Edit Listing
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <NewCustomToastContainer />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  fullScreenContainer: { flex: 1 },
   header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 50,
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

   card: {
   
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    overflow: 'hidden',
    gap: 10,
    width: '100%',
  },
  listingtyperow: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',    
  },
  lebleHeader:{
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.28,
    lineHeight:16,
    fontFamily: 'Urbanist-Medium',
  },
  status: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.28,
    lineHeight:16,
    fontFamily: 'Urbanist-SemiBold',
  },
   image: {
    width: 72,
    height: 76,
    borderRadius: 16,
  },
  univercitycontainer:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productlebleHeader:{
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight:16,
    fontFamily: 'Urbanist-SemiBold',
    paddingTop: 10
  },
  productlableprice:{
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight:16,
    fontFamily: 'Urbanist-SemiBold',

  },
  universitylable:{
    
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight:16,
    fontFamily: 'Urbanist-Medium',

  },
  datetlable:{
    marginLeft: 10,
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight:16,
    fontFamily: 'Urbanist-Medium',


  },
  carddivider:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        width: '90%',
        height: 1.5,
        // backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
        // boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
        borderStyle: 'dashed',
        borderBottomWidth: 1,
        // : 'rgba(255, 255, 255, 0.20)',
        borderBottomColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
        
    },
    cardconstinerdivider:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        width: '100%',
        height: 1.5,
        borderStyle: 'dashed',
        borderBottomWidth: 1,
        borderBottomColor: '#76c1f0ff',
    },
    sellerHeaderlable: {
        color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight:16,
    fontFamily: 'Urbanist-SemiBold',
  
    },
     scrollContainer: {
    paddingBottom: 180,
    // paddingTop: 90,
    // paddingHorizontal: 20,
    paddingHorizontal: 16 ,width: '100%'
  },
  bottomview: {
    position: 'absolute',
    padding: 6,
    width: '100%',
    height: 60,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#5d5c5c14',
    zIndex: 10,
    bottom: 0,
    marginBottom: Platform.OS === 'ios' ? 10 : 20,
  },
   cancelBtn: {
    flex: 1,
    marginRight: 8,
    padding: 12,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    // boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',

    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderBlockStartColor: '#ffffff47',
    borderBlockColor: '#ffffff47',

    borderTopColor: '#ffffff47',
    borderBottomColor: '#ffffff47',
    borderLeftColor: '#ffffff47',
    borderRightColor: '#ffffff47',

    boxSizing: 'border-box',
  },
    cancelText: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0.17,
    lineHeight: 22,
    
  },
});

export default ListingDetails;
