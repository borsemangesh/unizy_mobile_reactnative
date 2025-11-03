import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { MAIN_URL } from '../../utils/APIConstant';

type TransactionPropos = {
  navigation: any;
};

interface TransactionItem {
  title: string;
  price: string;
  status: string;
  code?: string;
  seller?: string;
  university?: string;
  viewUrl?: string;
}

interface TransactionSection {
  date: string;
  items: TransactionItem[];
}

const productImage = require('../../../assets/images/producticon.png');
export default function TransactionHistoryScreen(
  navigation: TransactionPropos,
) {
  //  const [selectedTab, setSelectedTab] = useState<'Purchases' | 'Sales' | 'Charges'>('Purchases');
  // const [transactions, setTransactions] = useState<TransactionSection[]>([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchPurchases = async () => {
  //     try {
  //       const token = await AsyncStorage.getItem('userToken');

  //       if (!token) {
  //         console.log('No token found');
  //         return;
  //       }

  //       const url = `${MAIN_URL.baseUrl}transaction/purchase`;

  //       console.log('TRAN_URL:', url);
  //       const response = await fetch(url, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       if (response.status === 401 || response.status === 403) {
  //         handleForceLogout();
  //         return;
  //       }

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }

  //       const json = await response.json();
  //       console.log('JSONTRAN: ',json);

  //       if (json.statusCode === 401 || json.statusCode === 403) {
  //         handleForceLogout();
  //         return;
  //       }

  //       // ✅ Parse and group data for UI
  //       if (json.statusCode === 200 && Array.isArray(json.data)) {
  //         const grouped = json.data.reduce(
  //           (acc: Record<string, TransactionItem[]>, item: any) => {
  //             const date = item.created_at.split('T')[0];
  //             if (!acc[date]) acc[date] = [];
  //             acc[date].push({
  //               title: item.title,
  //               price: `$${item.amount}`,
  //               status: item.order_status,
  //               code: item.payment_status,
  //               seller: item.purchased_from,
  //             });
  //             return acc;
  //           },
  //           {}
  //         );

  //         const formatted: TransactionSection[] = Object.keys(grouped).map(date => ({
  //           date,
  //           items: grouped[date],
  //         }));

  //         setTransactions(formatted);
  //       }
  //     } catch (err) {
  //       console.log('Error fetching purchases:', err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   const handleForceLogout = async () => {
  //     console.log('User inactive or unauthorized — logging out');
  //     await AsyncStorage.clear();
  //     // navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  //   };

  //   fetchPurchases();
  // }, []);

  //  const [selectedTab, setSelectedTab] = useState<'Purchases' | 'Sales' | 'Charges'>('Purchases');
  // const [transactions, setTransactions] = useState<TransactionSection[]>([]);
  // const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Purchases');
  const [transactions, setTransactions] = useState<TransactionSection[]>([]);
  const [loading, setLoading] = useState(true);

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
        } else if (selectedTab === 'Sales') {
          url = `${MAIN_URL.baseUrl}transaction/sales`;
        } else if (selectedTab === 'Charges') {
          url = `${MAIN_URL.baseUrl}transaction/charges`;
        }

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
          // Purchases API response
          const grouped = json.data.reduce(
            (acc: Record<string, TransactionItem[]>, item: any) => {
              const date = item.created_at.split('T')[0];
              if (!acc[date]) acc[date] = [];
              acc[date].push({
                title: item.title,
                price: `$${item.amount}`,
                status: item.order_status,
                code: item.payment_status,
                seller: item.purchased_from,
              });
              return acc;
            },
            {},
          );

          formatted = Object.keys(grouped).map(date => ({
            date,
            items: grouped[date],
          }));
        } else if (selectedTab === 'Sales' && json.data?.sales_history) {
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
        } else if (selectedTab === 'Charges' && json.data?.charges_history) {
          // Charges API response
          formatted = json.data.charges_history.map((section: any) => ({
            date: section.date,
            items: section.transactions.map((item: any) => ({
              title: item.title,
              price: `$${item.listing_fee}`,
              status: item.payment_status,
              code: '', // no code in charges example
              featureId: item.feature_id,
              viewListingUrl: item.view_listing_url,
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
  }, [selectedTab]); // refetch when tab changes

  const handleForceLogout = async () => {
    console.log('User inactive or unauthorized — logging out');
    await AsyncStorage.clear();
    // navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };
  function alert(arg0: string): void {
    throw new Error('Function not implemented.');
  }

  return (
    <View style={{ width: '100%', paddingHorizontal: 16, flex: 1 }}>
      {/* Header */}
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 20,
        }}
      >
        <Text allowFontScaling={false} style={styles.header}>
          Transaction History
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['Purchases', 'Sales', 'Charges'].map((tab: any) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              allowFontScaling={false}
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions */}
      <ScrollView
        style={{ width: '100%', flex: 1 }}
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
                          gap: 10,
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
                        {item.code}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardconstinerdivider} />

                  <Text allowFontScaling={false} style={styles.sellerText}>
                    Purchased from {item.seller}
                  </Text>
                </View>
              ))}
            </View>
          ))
        ) : selectedTab === 'Sales' ? (
          // Sales UI (different layout)
          transactions.map((section, idx) => (
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
                    }}
                  >
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center',gap: 10 }}
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
                    <TouchableOpacity>
                      <Text allowFontScaling={false} style={styles.allDetails}>All Details</Text>
                    </TouchableOpacity>
                  </View>

                  {/* <Text>Total Orders: {item.orders || 'N/A'}</Text> */}
                  <View style={styles.cardconstinerdivider} />
                  <View style={{ flexDirection: 'row',justifyContent: 'space-between'}}>
                    <Text allowFontScaling={false} style={{color: '#FFFFFF',fontFamily: 'Urbanist-SemiBold',}}>Total Order: {item.seller}</Text>
                    <Text  allowFontScaling={false} style={{color: '#FFFFFF',fontFamily: 'Urbanist-SemiBold',}}>Total Earnings: {item.price}</Text>
                    
                  </View>
                </View>
              ))}
            </View>
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
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={styles.imgcontainer}>
                        <Image
                          source={productImage}
                          style={styles.image}
                          resizeMode="cover"
                        />
                      </View>
                      <Text  allowFontScaling={false} style={styles.chargesTitle}>{item.title}</Text>
                    </View>
                    <Text allowFontScaling={false} style={{ color: '#ffffffff', fontFamily: 'Urbanist-SemiBold', }}>View Listing</Text>
                  </View>
                  <View style={styles.cardconstinerdivider} />
                  <Text style={styles.viewListing}>
                    Featured Listing Fee: {item.price}
                  </Text>
                  <TouchableOpacity
                    onPress={() => alert(`View listing for ${item.title}`)}
                  ></TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardconstinerdivider: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(2, 6, 131, 0.26)' : 'rgba(2, 6, 131, 0.26)',
    height: 1,
    borderColor: '#FFFFFF',
    // borderColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)'
  },

  imgcontainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 0.4,
    borderColor: '#ffffff11',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.10) 100%)',
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
  header: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
    // marginBottom: 20,
    paddingTop: 50,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
    // padding: 5,
    marginBottom: 25,
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
    backgroundColor: 'rgba(55, 132, 255, 0.58)',
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
    color: '#DCE3FF',
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 5,
    fontFamily: 'Urbanist-SemiBold',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    gap: 5,
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
    marginTop: 15,
  },
  statusBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Urbanist-SemiBold',
  },
  codeBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  codeText: {
    color: '#fff',
    fontSize: 13,
    letterSpacing: 1,
    fontFamily: 'Urbanist-SemiBold',
  },
  sellerText: {
    color: '#DCE3FF',
    fontSize: 13,
    marginTop: 10,
    fontFamily: 'Urbanist-SemiBold',
  },

  salesCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    gap: 10,
  },
  salesTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
    fontFamily: 'Urbanist-SemiBold',
  },
  allDetails: {
    marginTop: 10,
    color: '#0099ff',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },

  chargesCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    gap: 10,
  },
  chargesTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
    fontFamily: 'Urbanist-SemiBold',
  },
  viewListing: {
    marginTop: 8,
    color: '#00ccff',
    fontWeight: '600',
  },
});
