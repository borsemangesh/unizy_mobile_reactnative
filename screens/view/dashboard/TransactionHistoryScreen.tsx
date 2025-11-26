
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
} from 'react-native';
import { MAIN_URL } from '../../utils/APIConstant';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import SalesAllDetailsDropdown from '../../utils/component/SalesAllDetailsDropdown';
import SalesAllDetailsDropdown_IOS from '../../utils/component/SalesAllDetailsDropdown_IOS';
import Loader from '../../utils/component/Loader';

type TransactionPropos = {
  navigation: any;
  route: any;
};

interface TransactionItem {
  total_earning: number;
  total_orders: number
  title: string;
  price: string;
  status: string;
  code?: string;
  seller?: string;
  university?: string;
  viewUrl?: string;
  order_otp: number;
  featureId: number;
  category_logo: string;
  feature_idNew: number;
  amount: string;
  purchased_quantity?: number
  category_id: number;
  hours?: number
}

interface TransactionSection {
  date: string;
  total_sales: number;
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

  const { route } = navigation;
  const { issales } = route?.params || {}
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
  const [overallEarning, setOverallEarning] = useState(0);

  const tabs = [{ key: 'Purchases' }, { key: 'Sales' }, { key: 'Charges' }];
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [SalesImageUrl, setSalesImageUrl] = useState('');
  const { height } = Dimensions.get('window');

  useEffect(() => {
    if (issales) {
      setActiveTab('Sales');   // Switch to Sales tab automatically
    }
  }, [issales]);

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
        setLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        console.log(token)
        if (!token) {
          console.log('No token found');
          return;
        }
        let url = '';
        if (selectedTab === 'Purchases') {
          url = `${MAIN_URL.baseUrl}transaction/purchase`;
        } if (selectedTab === 'Sales') {
          url = `${MAIN_URL.baseUrl}transaction/sales`;
        } if (selectedTab === 'Charges') {
          url = `${MAIN_URL.baseUrl}transaction/charges`;
        }

        console.log("TokenTransaction: ", token);
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


        let formatted: TransactionSection[] = [];

        if (selectedTab === 'Purchases' && Array.isArray(json.data)) {
          formatted = json.data.map((section: any) => ({
            date: section.date,
            items: section.transactions.map((item: any) => ({
              title: item.title,
              price: `£${item.amount}`,
              status: item.order_status,
              code: item.status,
              seller: item.purchased_from,
              university: item.university_name,
              order_otp: item.order_otp,
              category_logo: item.category_logo,
              purchased_quantity: item.purchased_quantity ?? 0,
              category_id: item.category_id,
              hours: item.hours ?? 0
            })),
          }));

        } if (selectedTab === 'Sales' && json.data?.sales_history) {
          setOverallEarning(json.data.total_earning),
            formatted = json.data.sales_history.map((section: any) => ({

              date: section.date,
              total_sales: section.total_sales,
              items: section.transactions.map((item: any) => ({
                title: item.title,
                price: `£${item.amount}`,
                status: item.status,
                code: '',
                seller: item.sold_to,
                amount: item.amount,
                university: item.university_name,
                category_logo: item.category_logo,
                feature_idNew: item.id,
                featureId: item.id,
                total_sales: item.total_sales,
                total_orders: item.total_orders,
                total_earning: item.total_earning
              })),
            }));
        }
        if (selectedTab === 'Charges' && json.data?.charges_history) {
          formatted = json.data.charges_history.map((section: any) => ({
            date: section.date,
            items: section.transactions.map((item: any) => ({
              title: item.title,
              price: `£${item.listing_fee}`,
              status: item.payment_status,
              code: '',
              featureId: item.feature_id,
              viewUrl: item.view_listing_url,
              order_otp: 0,
              category_logo: item.category_logo,
              feature_idNew: item.feature_id
            })),
          }));
        }
        setLoading(false);
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
    };

    setLoading(true);
    fetchTransactions();
  }, [selectedTab]);

  const getFormattedDate = (dateString: string) => {
    const parts = dateString.split(" ");
    if (parts.length !== 3) return dateString;

    const [dayStr, monthStr, yearStr] = parts;
    const day = parseInt(dayStr);

    if (isNaN(day)) return dateString;

    // Add suffix
    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
          ? "nd"
          : day % 10 === 3 && day !== 13
            ? "rd"
            : "th";

    const shortMonth = monthStr.substring(0, 3);

    return `${day}${suffix} ${shortMonth} ${yearStr}`;
  };
  const [catagoryid, setCatagoryid] = useState(0)

  const [salesData, setSalesData] = useState<any[]>([]);
  const [salesTitle, setSalesTitle] = useState('');
  const background = require('../../../assets/images/placeholder_history.png');

  const fetchSalesHistory = async (catagory_id: number) => {
    try {
      // Get user token
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found');
        return;
      }

      const url = `${MAIN_URL.baseUrl}transaction/sales-history?feature_id=${catagory_id}`;
      console.log('SalesHistory URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        // handleForceLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      console.log("SalesHistory Response:", json);

      if (json.statusCode === 401 || json.statusCode === 403) {
        // handleForceLogout();
        return;
      }
      setSalesData(json);
      setFilterVisible(true);

    } catch (err) {
      console.log('Error fetching sales history:', err);
    } finally {
      setLoading(false);
    }
  };


  const [isSelected, setIsSelected] = useState(false);

  return (
    <View
      style={[
        { flex: 1, marginTop: 11, paddingHorizontal: 16, height: '100%', width: '100%' },
      ]}
    >
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
        {tabs.map(({ key }, index) => (
          <React.Fragment key={key}>
            <TouchableOpacity
              style={[
                styles.tabItem,
                { width: tabWidth, alignItems: 'center' },
              ]}
              onPress={() => {
                setActiveTab(key as any);
                setSelectedTab(key);
                console.log('Key: ', key);
              }}
            >
              <View style={styles.iconWrapper}>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 14,
                    fontFamily: 'Urbanist-SemiBold',
                    color: key === selectedTab ? '#FFFFFF' : '#89C7FF',
                    lineHeight: 18,
                    letterSpacing: 0.25,
                    textAlign: 'center',
                  }}
                >
                  {key}
                </Text>
              </View>
            </TouchableOpacity>

            {key === 'Purchases' &&
              index !== tabs.length - 1 &&
              selectedTab !== 'Purchases' &&
              selectedTab !== 'Sales' && (
                <View
                  style={{
                    position: 'absolute',
                    left: '34%',
                    height: '60%',
                    width: 1,
                    backgroundColor: 'rgba(158, 229, 255, 0.3)',
                    marginHorizontal: 4,
                  }}
                />
              )}

            {key === 'Sales' &&
              index !== tabs.length - 1 &&
              selectedTab !== 'Sales' &&
              selectedTab !== 'Charges' && (
                <View
                  style={{
                    position: 'absolute',
                    right: '34%',
                    height: '60%',
                    width: 1,
                    backgroundColor: 'rgba(158, 229, 255, 0.3)',
                    marginHorizontal: 4,
                  }}
                />
              )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView
        style={{
          width: '100%',
          paddingBottom: Platform.OS === 'ios' ? height * 0.1 : height * 0.24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loaderWrapper}>
            <Loader containerStyle={styles.loaderContainer} />
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <View style={styles.emptyContainer}>
              <Image
                source={require('../../../assets/images/noproduct.png')}
                style={styles.emptyImage}
                resizeMode="contain"
              />
              <Text allowFontScaling={false} style={styles.emptyText}>
                No Transactions Found
              </Text>
            </View>
          </View>
        ) : selectedTab === 'Purchases' ? (
          // Purchases UI (your current UI)
          transactions.map((section, idx) => (
            <View key={idx} style={styles.section}>
              <Text allowFontScaling={false} style={styles.dateText}>
                {getFormattedDate(section.date)}
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
                        <View >
                          <Image source={background} style={styles.imgcontainer} resizeMode="cover" />
                          <Image source={{ uri: item.category_logo }} style={styles.image} resizeMode="cover" />
                        </View>
                        <View style={{ gap: 4 }}>
                          <Text
                            allowFontScaling={false}
                            style={styles.itemTitle}
                          >
                            {item.title.length > 24
                              ? `${item.title.substring(0, 24)}...`
                              : item.title}
                          </Text>
                          <View style={{ flexDirection: 'row', gap: 4, width: '91%', justifyContent: 'space-between' }}>
                            <Text allowFontScaling={false} style={styles.price}>
                              {item.price}
                            </Text>
                            {(item?.category_id === 3 || item?.category_id === 2 || item?.category_id === 5) && (
                              <View style={styles.statusBox}>
                                <Text
                                  allowFontScaling={false}
                                  style={{
                                    color: '#9CD6FF',
                                    fontWeight: '600',
                                    fontSize: 12,
                                    fontFamily: 'Urbanist-SemiBold',
                                  }}
                                >
                                  {item?.category_id === 3
                                    ?
                                    `${item?.purchased_quantity ?? 1} ${(item?.purchased_quantity ?? 1) > 1 ? 'units' : 'unit'
                                    }`
                                    : (item?.category_id === 2 || item?.category_id === 5)
                                      ?
                                      `${item?.hours ?? 1} ${(item?.hours ?? 1) > 1 ? 'hours' : 'hour'
                                      }`
                                      : ''
                                  }
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.statusRow}>
                    <View style={[styles.statusBox]}>
                      <Text allowFontScaling={false} style={styles.statusText}>
                        {item.status}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.codeBox,
                        {
                          height: 28,
                          backgroundColor:
                            item.status !== 'Completed'
                              ? 'rgba(255, 255, 255, 0.06)'
                              : 'rgba(255,255,255,0.15)',
                        },
                      ]}
                    >
                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.codeText,
                          {
                            color:
                              item.status !== 'Completed'
                                ? '#9CD6FF'
                                : 'rgba(255,255,255,0.15)',
                          },
                        ]}
                      >
                        {item.order_otp}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardconstinerdivider} />
                  <Text style={styles.sellerText}>
                    Purchased from{'  '}
                    <Text style={styles.sellerTextName}>
                      {item.seller} ({item.university})
                    </Text>
                  </Text>
                </View>
              ))}
            </View>
          ))
        ) : selectedTab === 'Sales' ? (
          <>
            <View style={styles.chargesCard}>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <View >
                  <Image source={background} style={styles.imgcontainer} resizeMode="cover" />
                  <Image source={totalEaning} style={styles.image} resizeMode="cover" />
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                    gap: 10,
                    justifyContent: 'space-between',
                    padding: 1,
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={styles.Overall_Earnings_value}
                  >
                    Overall Earnings
                  </Text>

                  <Text
                    allowFontScaling={false}
                    style={styles.Overall_Earnings_title}
                  >
                    {`£${Number(overallEarning).toFixed(2)}`}
                  </Text>
                </View>
              </View>
            </View>

            {transactions.map((section, idx) => (
              <View key={idx} style={styles.section}>
                <Text allowFontScaling={false} style={styles.dateText1}>
                  {getFormattedDate(section.date)}
                </Text>

                {section.items.map((item, i) => (
                  <View key={i} style={styles.salesCard}>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 10,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <View >
                          <Image source={background} style={styles.imgcontainer} resizeMode="cover" />
                          <Image source={{ uri: item.category_logo }} style={styles.image} resizeMode="cover" />
                        </View>
                        <Text style={styles.salesTitle}>
                          {item.title.length > 24
                            ? `${item.title.substring(0, 24)}...`
                            : item.title}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          setSalesImageUrl(item.category_logo);
                          console.log('FeatureID: ', item.featureId);
                          setCatagoryid(item.featureId);
                          // setFilterVisible(true);
                          fetchSalesHistory(item.featureId);
                          setSalesTitle(item.title);
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
                          color: '#B2EBFF',
                          fontFamily: 'Urbanist-SemiBold',
                          fontSize: 12,
                        }}
                      >
                        Total Order: {item.total_orders}
                      </Text>
                      <Text
                        allowFontScaling={false}
                        style={{
                          color: '#B2EBFF',
                          fontFamily: 'Urbanist-SemiBold',
                          fontSize: 12,
                        }}
                      >
                        Total Earnings: {item.total_earning}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </>
        ) : (
          transactions.map((section, idx) => (
            <View key={idx} style={styles.section}>
              <Text allowFontScaling={false} style={styles.dateText}>
                {getFormattedDate(section.date)}
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
                      <View >
                        <Image source={background} style={styles.imgcontainer} resizeMode="cover" />
                        <Image source={{ uri: item.category_logo }} style={styles.image} resizeMode="cover" />
                      </View>
                      <Text
                        allowFontScaling={false}
                        style={styles.chargesTitle}
                      >
                        {item.title.length > 24
                          ? `${item.title.substring(0, 24)}...`
                          : item.title}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        console.log('Fetature ID: ' + item.featureId);
                        navigation1.navigate('ViewListingDetails', {
                          shareid: item.featureId,
                        });
                      }}
                    >
                      <Text
                        allowFontScaling={false}
                        style={{
                          color: '#ffffffff',
                          fontFamily: 'Urbanist-SemiBold',
                          fontSize: 12,
                          marginTop: 10,

                          textDecorationLine: 'underline',
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


      {Platform.OS === 'android' ? (
        <>
          <SalesAllDetailsDropdown
            catagory_id={catagoryid}
            visible={isFilterVisible}
            onClose={() => setFilterVisible(false)}
            SalesImageUrl={SalesImageUrl}
            salesDataResponse={salesData}
            dropDowntitle={salesTitle}
          />
        </>
      ) : (
        <>
          <SalesAllDetailsDropdown_IOS
            catagory_id={catagoryid}
            visible={isFilterVisible}
            onClose={() => setFilterVisible(false)}
            SalesImageUrl={SalesImageUrl}
            salesDataResponse={salesData}
            dropDowntitle={salesTitle}
          />

        </>
      )}


    </View>
  );
}

const styles = StyleSheet.create({
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: Platform.OS === 'ios' ? 547 : 300,
    paddingVertical: (Platform.OS === 'ios' ? 0 : 40),
  },
  loaderContainer: {
    width: 100,
    height: 100,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: (Platform.OS === 'ios' ? 570 : 300),
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    overflow: 'hidden',

    minHeight: '100%',

    //  marginBottom:20,


    //  marginBottom:20,
  },
  emptyImage: {
    width: 50,
    height: 50,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600
  },
  // cardconstinerdivider: {
  //   display: 'flex',
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   width: '100%',
  //   borderStyle: 'dashed',
  //   borderBottomWidth: 0.9,
  //   height: 2,
  //   borderColor:
  //     'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(186, 218, 255, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)',
  // },

  cardconstinerdivider: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: (Platform.OS === 'ios' ? 2 : 1.5),
    borderStyle: 'dashed',
    borderBottomWidth: (Platform.OS === 'ios' ? 0.9 : 1),
    // backgroundColor: 'rgba(169, 211, 255, 0.08)',
    borderColor: (Platform.OS === 'ios' ? 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(186, 218, 255, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)' : '#4169B8'),
  },

  imgcontainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    // padding:8,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    borderWidth: 0.4,
    borderColor: '#ffffff11',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxSizing: 'border-box'
  },
  image: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    position: 'absolute',
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  },
  container: {
    flex: 1,
    alignItems: 'center',
    // paddingTop: 70,
    paddingHorizontal: 15,
  },
  activeTabButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',

    boxShadow:
      '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25),rgba(76, 112, 242, 0.18) inset 0px -1.761px 0px 100px',
  },

  _section: {
    marginBottom: 8,
    marginTop: 0,
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
  dateText1: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
    fontFamily: 'Urbanist-SemiBold',
    marginTop: 6
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },
  price: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    marginTop: 2,
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },
  unitsBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
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
    alignItems: 'center',
    gap: 2
  },

  header: {
    paddingTop: Platform.OS === 'ios' ? '19.5%' : 50,
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
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 6,
    paddingRight: 6,
    gap: 12,
    borderRadius: 4,
    justifyContent: 'center',
    height: 20,
  },
  statusText: {
    color: '#9CDDFF',
    fontSize: 12,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 15.6,
  },
  codeBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    height: 24,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 6,
    justifyContent: 'center'
  },
  codeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 4,
    fontFamily: 'Urbanist-SemiBold',
  },
  sellerText: {
    color: 'rgba(255,255,255,0.64)',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },
  sellerTextName: {
    color: '#9CD6FF',
    fontSize: 12,
    fontWeight: '600',
    // marginTop: 10,
    fontFamily: 'Urbanist-SemiBold',
  },
  sellerText_New: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    // marginTop: 10,
    fontFamily: 'Urbanist-SemiBold',
  },

  salesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
    marginBottom: 8,
    borderRadius: 18,
    gap: 12,
  },
  salesTitle: {
    fontWeight: '600',
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    marginTop: 2
  },
  allDetails: {
    // marginTop: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 12,
    textDecorationLine: 'underline', marginTop: 2
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
  Overall_Earnings_value: {
    fontWeight: '600',
    fontSize: 17,
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
  },
  Overall_Earnings_title: {
    fontWeight: '600',
    fontSize: 20,
    color: '#fff',
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
    marginBottom: Platform.OS === 'ios' ? 15 : 15,
    borderRadius: 50,
    alignSelf: 'center',
    // padding: 4,
    borderWidth: 0.4,
    // margin: 4,
    borderColor: 'transparent',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23), -0.90px -0.80px 1px 0px rgba(255, 255, 255, 0.19)inset, 0.90px 0.80px 0.90px 0px rgba(255, 255, 255, 0.19)inset',
    // backgroundColor: 'rgba(0, 23, 128, 0.49)',
    backgroundColor: 'rgba(40, 55, 149, 0.12)',

    borderEndEndRadius: 50,
    borderStartEndRadius: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomStartRadius: 50,
    boxSizing: 'border-box',
    zIndex: 100,
    marginTop: -10,
  },
  bubble: {

    height: 38,//'93%',
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
    // marginTop: 2,
    marginLeft: 2,

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
