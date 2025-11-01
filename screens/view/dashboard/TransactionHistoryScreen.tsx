import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';


export default function TransactionHistoryScreen() {
  const [selectedTab, setSelectedTab] = useState('Purchases');

  const transactions = [
    {
      date: '3rd January 2025',
      items: [
        {
          title: 'Quadcopter (Drone)',
          price: '$10',
          status: 'Awaiting Delivery',
          code: '921031',
          seller: 'Ryan Scott (University of Warwick)',
          icon: 'cube-outline',
        },
      ],
    },
    {
      date: '2nd January 2025',
      items: [
        {
          title: 'Lunch Box',
          price: '$20',
          status: 'Fulfilled',
          code: '283075',
          seller: 'Ryan Scott (University of Warwick)',
          icon: 'fast-food-outline',
          units: '2 units',
        },
        {
          title: 'Lunch Box',
          price: '$10',
          status: 'Fulfilled',
          code: '563128',
          seller: 'Ryan Scott (University of Warwick)',
          icon: 'fast-food-outline',
          units: '1 unit',
        },
      ],
    },
  ];

  return (
    <View style={{width: '100%',paddingHorizontal: 16}}>
      <View style={{justifyContent: 'center',alignItems: 'center',paddingVertical: 20}}>
        <Text allowFontScaling={false} style={styles.header}>Transaction History</Text>

      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['Purchases', 'Sales', 'Charges'].map(tab => (
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
      <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
        {transactions.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text allowFontScaling={false} style={styles.dateText}>{section.date}</Text>

            {section.items.map((item, i) => (
              <View key={i} style={styles.card}>
                <View style={styles.row}>
                  {/* <Ionicons name={item.icon} size={24} color="#fff" style={{ marginRight: 10 }} /> */}
                  <View style={{ flex: 1 }}>
                    <Text allowFontScaling={false} style={styles.itemTitle}>{item.title}</Text>
                    <Text allowFontScaling={false} style={styles.price}>{item.price}</Text>
                  </View>

                  {/* {item.units && (
                    <View style={styles.unitsBox}>
                      <Text style={styles.unitsText}>{item.units}</Text>
                    </View>
                  )} */}
                </View>

                <View style={styles.statusRow}>
                  <View style={styles.statusBox}>
                    <Text allowFontScaling={false} style={styles.statusText}>{item.status}</Text>
                  </View>
                  <View style={styles.codeBox}>
                    <Text allowFontScaling={false} style={styles.codeText}>{item.code}</Text>
                  </View>
                </View>

                <Text allowFontScaling={false} style={styles.sellerText}>
                  Purchased from {item.seller}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    padding: 5
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 25,
  },
  activeTabButton: {
    backgroundColor: 'rgba(55, 132, 255, 0.58)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25),rgba(76, 112, 242, 0.18) inset 0px -1.761px 0px 100px',
    
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
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  price: {
    color: '#fff',
    fontSize: 14,
    marginTop: 2,
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
  },
  sellerText: {
    color: '#DCE3FF',
    fontSize: 13,
    marginTop: 10,
  },
});
