import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type MessageScreenProps = {
  navigation: any;
};
const MessagesScreen = ({ navigation }: MessageScreenProps) => {
  const searchIcon = require('../../../assets/images/searchicon.png');
  const [search, setSearch] = useState('');
  const [studentList, setStudentList] = useState([]);

  const chatData = [
    {
      id: '1',
      name: 'John Doe',
      message: 'Can you tell me a bit about the co..',
      time: '9:41 AM',
      unreadCount: 1,
      image: require('../../../assets/images/user.jpg'),
    },
    {
      id: '2',
      name: 'Emily Smith',
      message: 'Thanks for your help!',
      time: '8:22 AM',
      unreadCount: 3,
      image: require('../../../assets/images/user.jpg'),
    },
    {
      id: '3',
      name: 'Michael Brown',
      message: 'Let’s catch up later.',
      time: 'Yesterday',
      unreadCount: 0,
      image: require('../../../assets/images/user.jpg'),
    },
  ];

  return (
    <View style={{ height: '100%', display: 'flex', flex: 1, width: '100%' }}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text allowFontScaling={false} style={styles.unizyText}>Messages</Text>
        </View>
      </View>

      <View
        style={{
          top: 90,
          minHeight: '100%',
          width: '100%',
          paddingHorizontal: 16,
          gap: 10,
        }}
      >
        <View style={[styles.search_container]}>
          <Image source={searchIcon} style={styles.searchIcon} />
          <TextInput
          allowFontScaling={false}
            style={styles.searchBar}
            placeholder="Search"
            placeholderTextColor="#ccc"
            selectionColor={'#fff'}
            onChangeText={setSearch}
            value={search}
            // onFocus={() => navigation.navigate('SearchPage',{ animation: 'none' })}
          />
        </View>

        <View style={{ flex: 1 }}>
          <FlatList
            data={chatData}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => {
                navigation.navigate('MessagesIndividualScreen',{ animation: 'none' }); 
                // navigation.replace('MessagesIndividualScreen', { animation: 'none' });
              }}>
                <View>
                  {/* Chat Row */}
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      gap: 10,
                      marginTop: 10,
                      alignItems: 'center',
                    }}
                  >
                    <Image
                      source={item.image}
                      style={{ width: 50, height: 50, borderRadius: 100 }}
                    />

                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          width: '100%',
                        }}
                      >
                        <Text
                        allowFontScaling={false}
                          style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#FFFFFF',
                            fontFamily: 'Urbanist-SemiBold',
                          }}
                        >
                          {item.name}
                        </Text>
                        <Text
                        allowFontScaling={false}
                          style={{
                            fontSize: 14,
                            fontWeight: '500',
                            color: '#FFFFFF',
                            fontFamily: 'Urbanist-SemiBold',
                          }}
                        >
                          {item.time}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          width: '100%',
                          marginTop: 4,
                        }}
                      >
                        <Text
                        allowFontScaling={false}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{
                            fontSize: 15,
                            fontWeight: '500',
                            color: '#FFFFFF',
                            fontFamily: 'Urbanist-Medium',
                            flex: 1,
                          }}
                        >
                          {item.message}
                        </Text>

                        {item.unreadCount > 0 && (
                          <Text
                          allowFontScaling={false}
                            style={{
                              fontSize: 14,
                              fontWeight: '600',
                              color: '#FFFFFF',
                              fontFamily: 'Urbanist-Medium',
                              backgroundColor: 'rgba(255, 255, 255, 0.14)',
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.3,
                              shadowRadius: 3,
                              padding: 5,
                              width: 30,
                              textAlign: 'center',
                              borderRadius: 100,
                            }}
                          >
                            {item.unreadCount}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Divider Line */}
                  <View
                    style={{
                      height: 1,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      marginTop: 10,
                      width: '100%',
                    }}
                  />
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    fontFamily: 'Urbanist-Medium',
    marginLeft: -5,
    fontWeight: 500,
    fontSize: 17,
    color: '#fff',
    width: '80%',
  },
  search_container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 50,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    paddingVertical: 4,
  },
  searchIcon: {
    padding: Platform.OS === 'ios' ? 0 : 5,
    margin: 10,
    height: 24,
    width: 24,
  },
  text: {
    color: 'black',
    fontSize: 20,
    fontWeight: '600',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    paddingTop: 0,
  },
  header: {
    height: 100,
    // paddingTop: 40,
    justifyContent: 'center',
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    zIndex: 10,
    // bottom: 0,
    overflow: 'hidden',
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
  backIconRow: {
    padding: 12,
    borderRadius: 40,
    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    height: 48,
    width: 48,
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 26,
    color: '#fff',
  },
  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
  },
});

export default MessagesScreen;
