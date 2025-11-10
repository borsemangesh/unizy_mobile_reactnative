
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  Dimensions,
  Animated,
  Easing,
  FlatList,
} from 'react-native';
import { MAIN_URL } from '../../utils/APIConstant';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import SalesAllDetailsDropdown from '../../utils/component/SalesAllDetailsDropdown';

type TransactionPropos = {
  navigation: any;
};

interface TransactionItem {
  // feature_id: number;
  title: string;
  price: string;
  status: string;
  code?: string;
  seller?: string;
  university?: string;
  viewUrl?: string;
  order_otp: number;
  featureId: number;
}

interface TransactionSection {
  date: string;
  items: TransactionItem[];
}

const productImage = require('../../../assets/images/producticon.png');
const totalEaning = require('../../../assets/images/totalearnings.png');
export default function TransactionHistoryScreen(
  navigation: TransactionPropos,
) {

  const navigation1: NavigationProp<any> = useNavigation();
  const [selectedTab, setSelectedTab] = useState('Purchases');
  const [transactions, setTransactions] = useState<TransactionSection[]>([]);
  const [loading, setLoading] = useState(true);

  const screenWidth = Dimensions.get('window').width;
  const tabsname = ['Purchases', 'Sales', 'Charges'];
  const tabWidth = (screenWidth * 0.9) / tabsname.length;

  const translateX = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;

  const bottomNaviationSlideupAnimation = useRef(
    new Animated.Value(screenHeight),
  ).current;
  const bubbleX = useRef(new Animated.Value(0)).current;

  const [activeTab, setActiveTab] = useState<string>('Purchases');
  const [overallEarning,setOverallEarning] = useState(0);

  const tabs = [{ key: 'Purchases' }, { key: 'Sales' }, { key: 'Charges' }];
  const [isFilterVisible, setFilterVisible] = useState(false);

  useEffect(() => {
    if (activeTab === 'Purchases') {
      bottomNaviationSlideupAnimation.setValue(screenHeight);

      Animated.timing(bottomNaviationSlideupAnimation, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else if (activeTab === 'Sales') {
      bottomNaviationSlideupAnimation.setValue(0);
    }
  }, [activeTab]);

  useEffect(() => {
    const index = ['Purchases', 'Sales', 'Charges'].indexOf(activeTab);
    Animated.spring(bubbleX, {
      toValue: index * tabWidth,
      friction: 6,
      tension: 20,

      useNativeDriver: true,
    }).start();
  }, [activeTab, bubbleX, tabWidth]);

  useEffect(() => {
    const index = ['Purchases', 'Sales', 'Charges'].indexOf(activeTab);
    Animated.spring(bubbleX, {
      toValue: index * tabWidth,
      friction: 6,
      tension: 20,

      useNativeDriver: true,
    }).start();
  }, [activeTab, bubbleX, tabWidth]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          console.log('No token found');
          return;
        }
        let url = '';
        if (selectedTab === 'Purchases') {
          url = `${MAIN_URL.baseUrl}transaction/purchase`;
        }  if (selectedTab === 'Sales') {
          url = `${MAIN_URL.baseUrl}transaction/sales`;
        }  if (selectedTab === 'Charges') {
          url = `${MAIN_URL.baseUrl}transaction/charges`;
        }

        console.log("TokenTransaction: ",token);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          handleForceLogout();
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();

        if (json.statusCode === 401 || json.statusCode === 403) {
          handleForceLogout();
          return;
        }

        // Parse response based on tab
        let formatted: TransactionSection[] = [];

        if (selectedTab === 'Purchases' && Array.isArray(json.data)) {
          formatted = json.data.map((section: any) => ({
            date: section.date,
            items: section.transactions.map((item: any) => ({
              title: item.title,
              price: `$${item.amount}`,
              status: item.order_status,        // Show order status like "Awaiting Delivery"
              code: item.status,                // Payment status (e.g. "succeeded")
              seller: item.purchased_from,      // Who you bought from
              university: item.university_name, // University name
              order_otp: item.order_otp,        // OTP for verification
            })),
          }));
       
        }  if (selectedTab === 'Sales' && json.data?.sales_history) {
          console.log("OverallEarning: ",json.data.total_earning);
          setOverallEarning(json.data.total_earning),
          // Sales API response
          formatted = json.data.sales_history.map((section: any) => ({
            date: section.date,
           
            items: section.transactions.map((item: any) => ({
              title: item.title,
              price: `$${item.amount}`,
              status: item.status,
              code: '', // no code in sales example
              seller: item.sold_to,
              university: item.university_name, // extra data if needed
            })),
          }));
        }  
        // if (selectedTab === 'Charges' && json.data?.charges_history) {
        //   // Charges API response
        //   formatted = json.data.transactions.map((section: any) => ({
        //     date: section.date,
        //     items: section.transactions.map((item: any) => ({
        //       // feature_id: item.feature_id,
        //       title: item.title,
        //       price: `$${item.listing_fee}`,
        //       status: item.payment_status,
        //       code: '', // no code in charges example
        //       featureId: item.feature_id,
        //       viewListingUrl: item.view_listing_url,
        //     })),
        //   }));
        // }
        if (selectedTab === 'Charges' && json.data?.charges_history) {
          formatted = json.data.charges_history.map((section: any) => ({
            date: section.date,
            items: section.transactions.map((item: any) => ({
              title: item.title,
              price: `$${item.listing_fee}`,
              status: item.payment_status,
              code: '',
              featureId: item.feature_id,           // ✅ Correct field name
              viewUrl: item.view_listing_url,       // ✅ Matches your interface
              order_otp: 0,                         // placeholder to satisfy your interface
            })),
          }));
        }

        setTransactions(formatted);
      } catch (err) {
        console.log('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    const handleForceLogout = async () => {
      console.log('User inactive or unauthorized — logging out');
      await AsyncStorage.clear();
      // navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    setLoading(true);
    fetchTransactions();
  }, [selectedTab]); 

  
  return (
    <View style={{ width: '100%', paddingHorizontal: 16 }}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text allowFontScaling={false} style={styles.unizyText}>
            Transaction History
          </Text>
        </View>
      </View>
      <View style={[styles.bottomTabContainer]}>
        <View style={[{ height: 38 }]}>
          <Animated.View
            style={[
              styles.bubble,
              {
                width: tabWidth - 3,
                transform: [{ translateX: bubbleX }],
              },
            ]}
          />
        </View>

        {tabs.map(({ key }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tabItem, { width: tabWidth }]}
            onPress={() => {
              setActiveTab(key as any);
              setSelectedTab(key);
            }}
          >
            <View style={styles.iconWrapper}>
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 14,
                  fontFamily: 'Urbanist-SemiBold',
                  color:
                    key === selectedTab
                      ? '#FFFFFF'
                      : 'rgba(158, 229, 255, 0.91)',
                  lineHeight: 18,
                  letterSpacing: 0.25,
                  textAlign: 'center',
                }}
              >
                {key}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ width: '100%' }}
        showsVerticalScrollIndicator={false}
      >
        {transactions.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#aaa' }}>
            No transactions found.
          </Text>
        ) : selectedTab === 'Purchases' ? (
          // Purchases UI (your current UI)
          transactions.map((section, idx) => (
            <View key={idx} style={styles.section}>
              <Text allowFontScaling={false} style={styles.dateText}>
                {section.date}
              </Text>
              {section.items.map((item, i) => (
                <View key={i} style={styles.card}>
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 12,
                          alignItems: 'center',
                        }}
                      >
                        <View style={styles.imgcontainer}>
                          <Image
                            source={productImage}
                            style={styles.image}
                            resizeMode="cover"
                          />
                        </View>
                        <View>
                          <Text
                            allowFontScaling={false}
                            style={styles.itemTitle}
                          >
                            {item.title}
                          </Text>
                          <Text allowFontScaling={false} style={styles.price}>
                            {item.price}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.statusRow}>
                    <View style={styles.statusBox}>
                      <Text allowFontScaling={false} style={styles.statusText}>
                        {item.status}
                      </Text>
                    </View>
                    <View style={styles.codeBox}>
                      <Text allowFontScaling={false} style={styles.codeText}>
                        {item.order_otp}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardconstinerdivider} />
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <Text style={styles.sellerText}>Purchased from</Text>
                    <Text
                      allowFontScaling={false}
                      style={styles.sellerTextName}
                    >
                      {item.seller} ({item.university})
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        ) : selectedTab === 'Sales' ? (
          // Sales UI (different layout)
          transactions.map((section, idx) => (
            <>
              <View style={styles.chargesCard}>
                {/* <Text>Overall Earnings </Text> */}
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 10,
                    alignItems: 'center',
                    width: '100%'
                  }}
                >
                  <View style={styles.imgcontainer}>
                      <Image
                        source={totalEaning}
                        style={styles.image}
                        resizeMode="cover"
                      />
                    </View>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                      gap: 10,
                      justifyContent: 'space-between',
                      padding: 1
                    }}
                  >
                    
                    <Text allowFontScaling={false} style={styles.Overall_Earnings_value}>
                    Overall Earnings
                    </Text>

                  <Text allowFontScaling={false} style={styles.Overall_Earnings_title}>
                   {`$`+overallEarning}
                  </Text>
                  </View>
                </View>
              </View>
              <View key={idx} style={styles.section}>
                <Text allowFontScaling={false} style={styles.dateText}>
                  {section.date}
                </Text>
                {section.items.map((item, i) => (
                  <View key={i} style={styles.salesCard}>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 10,
                        justifyContent: 'space-between',
                        alignContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          alignSelf: 'center',
                          justifyContent: 'space-between',
                          alignContent: 'center',
                          gap: 12,
                        }}
                      >
                        <View style={styles.imgcontainer}>
                          <Image
                            source={productImage}
                            style={styles.image}
                            resizeMode="cover"
                          />
                        </View>
                        <Text style={styles.salesTitle}>{item.title}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setFilterVisible(true);
                        }}
                      >
                        <Text
                          allowFontScaling={false}
                          style={styles.allDetails}
                        >
                          All Details
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cardconstinerdivider} />
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text
                        allowFontScaling={false}
                        style={{
                          color: '#5cc9f0',
                          fontFamily: 'Urbanist-SemiBold',
                          fontSize: 12,
                        }}
                      >
                        Total Order: {item.seller}
                      </Text>
                      <Text
                        allowFontScaling={false}
                        style={{
                          color: '#5cc9f0',
                          fontFamily: 'Urbanist-SemiBold',
                          fontSize: 12,
                        }}
                      >
                        Total Earnings: {item.price}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ))
        ) : (
          // Charges UI (different layout)
          transactions.map((section, idx) => (
            <View key={idx} style={styles.section}>
              <Text allowFontScaling={false} style={styles.dateText}>
                {section.date}
              </Text>
              {section.items.map((item, i) => (
                <View key={i} style={styles.chargesCard}>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 10,
                      justifyContent: 'space-between',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <View style={styles.imgcontainer}>
                        <Image
                          source={productImage}
                          style={styles.image}
                          resizeMode="cover"
                        />
                      </View>
                      <Text
                        allowFontScaling={false}
                        style={styles.chargesTitle}
                      >
                        {item.title}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        console.log("Fetature ID: "+ item.featureId);
                        navigation1.navigate('ViewListingDetails',{ shareid: item.featureId });
                      }}
                    >
                      <Text
                        allowFontScaling={false}
                        style={{
                          color: '#ffffffff',
                          fontFamily: 'Urbanist-SemiBold',
                          fontSize: 12,
                          marginTop: 10,
                        }}
                      >
                        View Listing
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.cardconstinerdivider} />
                  <Text style={styles.viewListing}>
                    Featured Listing Fee: {item.price}
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
      <SalesAllDetailsDropdown
        catagory_id={5}
        visible={isFilterVisible}
        onClose={() => setFilterVisible(false)} onApply={function (filters: any): void {
          throw new Error('Function not implemented.');
        } } from={0} to={0}        />
    </View>
  );
}

const styles = StyleSheet.create({
  cardconstinerdivider: {
    // marginTop: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderStyle: 'dashed',
    borderBottomWidth: 0.9,
    height: 2,
    // backgroundColor: 'rgba(169, 211, 255, 0.08)',
    borderColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(135, 189, 251, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)',
  },

  imgcontainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    // padding: 8,
    paddingTop: 9,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,

    alignItems: 'center',
    borderWidth: 0.4,
    borderColor: '#ffffff11',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(42, 126, 223, 0.67) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxSizing: 'border-box',
  },
  image: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    // paddingTop: 70,
    paddingHorizontal: 15,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
    // padding: 5,
    marginBottom: 16,
    marginTop: 15,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 25,
  },
  activeTabButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  
    boxShadow:
      '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25),rgba(76, 112, 242, 0.18) inset 0px -1.761px 0px 100px',
  },
  tabText: {
    color: '#DCE3FF',
    fontSize: 15,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  _section: {
    marginBottom: 25,
  },
  get section() {
    return this._section;
  },
  set section(value) {
    this._section = value;
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
    fontFamily: 'Urbanist-SemiBold',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    width: '100%',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Urbanist-SemiBold',
  },
  price: {
    color: '#fff',
    fontSize: 14,
    marginTop: 2,
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },
  unitsBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  unitsText: {
    color: '#fff',
    fontSize: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  header: {
    paddingTop: Platform.OS === 'ios' ? '16%' : 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
     fontFamily: 'Urbanist-SemiBold',
     width: '100%',

  },
  statusBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    // paddingVertical: 5,
    // paddingHorizontal: 10,
    // borderRadius: 8,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 6,
    paddingRight: 6,
    gap:12,
    borderRadius: 4,
    justifyContent:'center'
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    letterSpacing: 0,
  },
  codeBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    height:24,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 6,
    justifyContent:'center'


  },
  codeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 4,
    fontFamily: 'Urbanist-SemiBold',
    
  },
  sellerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    // marginTop: 10,
    fontFamily: 'Urbanist-SemiBold',
  },
  sellerTextName: {
    color: '#52aff1',
    fontSize: 12,
    fontWeight: '600',
    // marginTop: 10,
    fontFamily: 'Urbanist-SemiBold',
  },

  salesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
    marginBottom: 12,
    borderRadius: 18,
    gap: 12,
  },
  salesTitle: {
    fontWeight: '600',
    fontSize: 17,
    color: '#fff',
    marginBottom: 5,
    letterSpacing: 1,
    fontFamily: 'Urbanist-SemiBold',
  },
  allDetails: {
    // marginTop: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 12,
  },

  chargesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
    marginBottom: 12,
    borderRadius: 18,
    gap: 12,
  },
  chargesTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
    fontFamily: 'Urbanist-SemiBold',
  },
  Overall_Earnings_value:{
    fontWeight: '600',
    fontSize: 17,
    color: '#fff',
    marginBottom: 5,
    fontFamily: 'Urbanist-SemiBold',
  },
  Overall_Earnings_title:{
    fontWeight: '600',
    fontSize: 20,
    color: '#fff',
    marginBottom: 5,
    fontFamily: 'Urbanist-SemiBold',
  },
  viewListing: {
    // marginTop: 8,
    color: 'rgba(149, 239, 255, 0.87)',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 12,
  },

  //Tabls

  bottomTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    marginBottom: Platform.OS === 'ios' ? 30 : 30,
    borderRadius: 50,
    alignSelf: 'center',
    padding: 4,
    borderWidth: 0.4,
    margin: 4,
    borderColor: 'transparent',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23), -0.90px -0.80px 1px 0px rgba(255, 255, 255, 0.19)inset, 0.90px 0.80px 0.90px 0px rgba(255, 255, 255, 0.19)inset',
    // backgroundColor: 'rgba(0, 23, 128, 0.49)',
    backgroundColor: 'rgba(40, 55, 149, 0.12)',

    borderEndEndRadius: 50,
    borderStartEndRadius: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomStartRadius: 50,
    // borderBlockStartColor: '#ffffff2e',
    // borderBlockColor: '#ffffff2e',
    // borderTopColor: '#ffffff2e',
    // borderBottomColor: '#ffffff2e',
    // borderLeftColor: '#ffffff2e',
    // borderRightColor: '#ffffff2e',
    boxSizing: 'border-box',
    zIndex: 100,
    marginTop: 20,
  },
  bubble: {
  
    height: '93%',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.18)',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#ffffff2e',
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',
    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
    marginTop: 2,
    marginLeft: 3,
  },

  tabItem: {
    //justifyContent: 'center',
    //alignItems: 'center',
  },
  iconWrapper: {
    height: 50, //
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
});
