
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  PlatformColor,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MAIN_URL } from '../../utils/APIConstant';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

type MessageScreenProps = {
  navigation: any;
};
const MessagesScreen = ({ navigation }: MessageScreenProps) => {
  const searchIcon = require('../../../assets/images/searchicon.png');
  const [search, setSearch] = useState('');
  const [studentList, setStudentList] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const isInitialMount = useRef(true);
  const { width, height } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const SCREEN_HEIGHT = height;
  const INNER_SCREEN_HEIGHT = height - insets.top - insets.bottom;

  // Animated hooks for blur effect
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      scrollY.value = event.contentOffset.y;
    },
  });

  const fetchUserChatData = async (query: string = "", isInitialLoad: boolean = false) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
    
      if (!token || !userId) {
        console.warn('Missing token or userId');
        if (isInitialLoad) {
          await new Promise(r => setTimeout(r, 1000));
          setInitialLoading(false);
        }
        return;
      }
    
      let start = Date.now();
    
      if (isInitialLoad) setInitialLoading(true);
    
      const url = `${MAIN_URL.baseUrl}twilio/mychats?search=${query}`;
      console.log("twilioURL:", url);
    
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    
      const data = await response.json();
    
      if (!response.ok) {
        console.warn("Fetch failed:", data.message);
      } else {
        setStudentList(data?.data?.result || []);
      }
    
      if (isInitialLoad) {
        let elapsed = Date.now() - start;
        let remaining = Math.max(0, 1000 - elapsed);
        await new Promise(r => setTimeout(r, remaining));
        setInitialLoading(false);
      }
    
    } catch (error) {
      console.error("Chat setup failed:", error);
      if (isInitialLoad) {
        await new Promise(r => setTimeout(r, 1000));
        setInitialLoading(false);
      }
    }
    
  };



  // Load initial data
  useEffect(() => {
    fetchUserChatData('', true);
  }, []);

  // Search with debounce - NO loader
  useEffect(() => {
    // Skip on initial mount - let the initial load handle it
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (search === '') {
      // If search is cleared, reload initial data without showing loader
      fetchUserChatData('', false);
      return;
    }

    const delay = setTimeout(() => {
      fetchUserChatData(search, false);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  // const formatTime = (dateString: string) => {
  //   // if (!dateString) return "";
  //   // const date = new Date(dateString);
  //   // return date.toLocaleTimeString([], {
  //   //   hour: "2-digit",
  //   //   minute: "2-digit",
  //   //   hour12: true,
  //   // });

  //   if (!dateString) return '';

  //   const date = new Date(dateString);
  //   const today = new Date();

  //   // Strip time to compare only the day, month, year
  //   const isToday =
  //     date.getDate() === today.getDate() &&
  //     date.getMonth() === today.getMonth() &&
  //     date.getFullYear() === today.getFullYear();

  //   if (isToday) {
  //     return date.toLocaleTimeString([], {
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       hour12: true,
  //     });
  //   } else {
  //     return date.toLocaleDateString('en-GB', {
  //       day: '2-digit',
  //       month: '2-digit',
  //       year: 'numeric',
  //     }); // Example: 29/01/2025
  //   }
  // };


  const formatTime = (dateString: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const today = new Date();

  // Check for Today
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // ---- Format: 20th Nov 2025 ----
  
  const day = date.getDate();

  // Add ordinal suffix
  const getSuffix = (n: number) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const suffix = getSuffix(day);

  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear();

  return `${day}${suffix} ${month} ${year}`;
};




  const getInitials = (firstName = '', lastName = '') => {
    const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
    const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
    return f + l || '?';
  };

  return (
    <View style={{ flex: 1, width: '100%', height: '100%' }}>
      {initialLoading ? (
        <View 
          style={{ 
            position: 'absolute',
            top: Platform.OS === 'ios' ? '100%' : 320,
            bottom: (Platform.OS === 'ios' ? 0 : 200),
            left: 0,
            right: 0,
            justifyContent: 'center', 
            alignItems: 'center',
            height: (Platform.OS  === 'ios' ? 200 : 0)
          }}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : (
        <FlatList
          data={studentList || []}
          keyExtractor={(item, index) => {
            'worklet';
            return index.toString();
          }}
          ListHeaderComponent={
            <View style={styles.search_container}>
              <Image source={searchIcon} style={styles.searchIcon} />
              <TextInput
                allowFontScaling={false}
                style={styles.searchBar}
                placeholder="Search"
                placeholderTextColor="#ccc"
                selectionColor={'#fff'}
                onChangeText={setSearch}
                value={search}
              />
            </View>
          }
        renderItem={({ item: chat,index  }) => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('MessagesIndividualScreen', {
                animation: 'none',
                members: chat.members,
                userConvName: chat.conv_name,
                currentUserIdList: chat.current_user_id,
                conversationSid: chat.twilio_conversation_sid,
                source: 'chatList',
              });
            }}
          >
            <View>
              <View style={styles.chatRow}>
                {chat.members?.profile ? (
                  <Image
                    source={{ uri: chat.members?.profile }}
                    style={styles.chatImage}
                  />
                ) : (
                  <View style={styles.initialsCircle}>
                    <Text
                      allowFontScaling={false}
                      style={styles.initialsText}
                    >
                      {getInitials(
                        chat?.members?.firstname ?? 'A',
                        chat?.members?.lastname ?? 'W',
                      )}
                    </Text>
                  </View>
                )}
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
                    {chat?.members?.firstname} {chat?.members?.lastname}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: '#FFFFFFA3',
                      fontFamily: 'Urbanist-Medium',
                    }}
                  >
                    {formatTime(chat?.last_message?.dateCreated)}
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
                        fontSize: 12,
                        fontWeight: '500',
                        color: '#FFFFFFE0',
                        fontFamily: 'Urbanist-Medium',
                        flex: 1,
                      }}
                    >
                      {chat?.last_message?.body}
                    </Text>
                    {chat?.unreadcount > 0 && (
                      <Text
                        allowFontScaling={false}
                        style={{
                          fontSize: 10,
                          fontWeight: '600',
                          color: '#FFFFFF',
                          fontFamily: 'Urbanist-Medium',
                          backgroundColor: 'rgba(255, 255, 255, 0.14)',
                          shadowColor: '#000',
                          lineHeight: 20,
                          minHeight: 20,
                          minWidth: 20,
                          textAlign: 'center',
                          borderRadius: 70,
                          alignSelf: 'center',
                        }}
                      >
                        {chat?.unreadcount}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
              {index !== studentList.length - 1 && (
        <View
          style={{
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.2)',
            marginTop: 10,
            width: '100%',
          }}
        />
      )}
            </View>
        </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 250,
          paddingTop: Platform.OS === 'ios' ? 0 : 0,
          paddingHorizontal: 16,
        }}
        ListEmptyComponent={
          !initialLoading && (!studentList || studentList.length === 0) ? (
            <View style={[styles.emptyWrapper, { minHeight: INNER_SCREEN_HEIGHT - (Platform.OS === 'ios' ? 225 : 150) }]}>
              <View style={styles.emptyContainer}>
                <Image
                  source={require('../../../assets/images/noproduct.png')}
                  style={styles.emptyImage}
                  resizeMode="contain"
                />
                <Text allowFontScaling={false} style={styles.emptyText}>
                  No Data Found
                </Text>
              </View>
            </View>
          ) : null
        }
        />
      )}
      {/* {!initialLoading && search !== '' && (!studentList || studentList.length === 0) ? (
        <View
        pointerEvents="none"   
          style={{
          position: 'absolute',
          top: 190,
          left: 0,
          right: 0,
          alignItems: 'center',
          paddingTop: 10,
        }}
        >
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../../assets/images/noproduct.png')}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text allowFontScaling={false} style={styles.emptyText}>
              No Messages found
            </Text>
          </View>
        </View>
      ) : null} */}
    </View>
  );
};

const styles = StyleSheet.create({
  initialsCircle: {
    backgroundColor: '#8390D4',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    // marginRight: 12,
  },
  initialsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
  },

  chatImage: { width: 50, height: 50, borderRadius: 100 },
  chatRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  searchBar: {
    fontFamily: 'Urbanist-Medium',
    marginRight: 5,
    fontWeight: 500,
    fontSize: 17,
    color: '#fff',
    width: '80%',
  },
  search_container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 40,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 15,
    zIndex: 12,
    height: (Platform.OS === 'ios' ? 50 : 0),
    gap: 8,
  },
  searchIcon: {
    padding: Platform.OS === 'ios' ? 0 : 5,
    // margin: 10,
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
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullScreenContainer: {
    flex: 1,
    marginTop: 10,
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: Platform.OS === 'ios' ? '100%' : '100%',
    height: Platform.OS === 'ios' ? 150 : 150,
    zIndex: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    pointerEvents: 'none',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'center',
    zIndex: 11,
    pointerEvents: 'box-none',
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
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    overflow: 'hidden',
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
    fontWeight: 600,
  },
});

export default MessagesScreen;