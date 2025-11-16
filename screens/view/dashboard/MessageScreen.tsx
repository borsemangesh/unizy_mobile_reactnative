// import AsyncStorage from '@react-native-async-storage/async-storage';
// import React, { useEffect, useState } from 'react';
// import {
//   FlatList,
//   Image,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { MAIN_URL } from '../../utils/APIConstant';

// type MessageScreenProps = {
//   navigation: any;
// };
// const MessagesScreen = ({ navigation }: MessageScreenProps) => {
//   const searchIcon = require('../../../assets/images/searchicon.png');
//   const [search, setSearch] = useState('');
//   const [studentList, setStudentList] = useState<any>(null);

//   // const chatData = [
//   //   {
//   //     id: '1',
//   //     name: 'Student name',
//   //     message: 'Can you tell me a bit about the co..',
//   //     time: '9:41 AM',
//   //     unreadCount: 1,
//   //     image: require('../../../assets/images/user.jpg'),
//   //   },
//   //   {
//   //     id: '2',
//   //     name: 'Student name',
//   //     message: 'Hi there, can we discuss the timmings for this..',
//   //     time: '8:22 AM',
//   //     unreadCount: 3,
//   //     image: require('../../../assets/images/user.jpg'),
//   //   },
//   //   {
//   //     id: '3',
//   //     name: 'Student name',
//   //     message: 'Hi there, can we discuss the timmings for this..',
//   //     time: 'Yesterday',
//   //     unreadCount: 0,
//   //     image: require('../../../assets/images/user.jpg'),
//   //   },
//   // ];

//   useEffect(() => {
//     const fetchUserChatData = async () => {
//       try {
//         const token = await AsyncStorage.getItem('userToken');
//         const userId = await AsyncStorage.getItem('userId');

//         if (!token || !userId) {
//           console.warn('Missing token or user ID in AsyncStorage');
//           return;
//         }

//         const url = `${MAIN_URL.baseUrl}twilio/mychats`;
//         const response = await fetch(url, {
//           method: 'GET',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         const data = await response.json();

//         if (!response.ok) {
//           console.warn('Token fetch failed:', data.message);
//           return;
//         }

//         console.log('data', data);

//         const UserData = data.data;
//         setStudentList(UserData);

//         console.log('UserData--------------------', UserData);

//         // console.log("chatData",chatData);
//       } catch (error) {
//         console.error('Chat setup failed:', error);
//       }
//     };

//     fetchUserChatData();
//   }, []);

//   const formatTime = (dateString: string) => {
//     // if (!dateString) return "";
//     // const date = new Date(dateString);
//     // return date.toLocaleTimeString([], {
//     //   hour: "2-digit",
//     //   minute: "2-digit",
//     //   hour12: true,
//     // });

//     if (!dateString) return '';

//     const date = new Date(dateString);
//     const today = new Date();

//     // Strip time to compare only the day, month, year
//     const isToday =
//       date.getDate() === today.getDate() &&
//       date.getMonth() === today.getMonth() &&
//       date.getFullYear() === today.getFullYear();

//     if (isToday) {
//       return date.toLocaleTimeString([], {
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true,
//       });
//     } else {
//       return date.toLocaleDateString('en-GB', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric',
//       }); // Example: 29/01/2025
//     }
//   };

//   const getInitials = (firstName = '', lastName = '') => {
//     const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
//     const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
//     return f + l || '?';
//   };

//   return (
//     <View style={{ height: '100%', display: 'flex', flex: 1, width: '100%' }}>
//       <View style={styles.header}>
//         <View style={styles.headerRow}>
//           <Text allowFontScaling={false} style={styles.unizyText}>
//             Messages
//           </Text>
//         </View>
//       </View>

//       <View style={styles.chatConainter}>
//         <View style={[styles.search_container]}>
//           <Image source={searchIcon} style={styles.searchIcon} />
//           <TextInput
//             allowFontScaling={false}
//             style={styles.searchBar}
//             placeholder="Search"
//             placeholderTextColor="#ccc"
//             selectionColor={'#fff'}
//             onChangeText={setSearch}
//             value={search}
//             // onFocus={() => navigation.navigate('SearchPage',{ animation: 'none' })}
//           />
//         </View>
//           <ScrollView
//                   contentContainerStyle={{ paddingBottom: 40 }}
//                   style={{ flex: 1 }}
//                   showsVerticalScrollIndicator={false}
//                 >

//         <View style={{ flex: 1 }}>
//           <FlatList
//             data={studentList}
//             keyExtractor={chat => chat.id}
//             renderItem={({ item: chat }) => (
//               <TouchableOpacity
//                 onPress={() => {
//                   navigation.navigate('MessagesIndividualScreen', {
//                     animation: 'none',
//                     members: chat.members,
//                     userConvName: chat.conv_name,
//                     currentUserIdList: chat.current_user_id,
//                     source: 'chatList',
//                   });
//                   // navigation.replace('MessagesIndividualScreen', { animation: 'none' });
//                 }}
//               >
//                 <View>
//                   {/* Chat Row */}
//                   {/* key={index} */}
//                   {/* {studentList?.map((chat: any, index: number) => ( */}
//                   <View style={styles.chatRow}>
//                     {chat.members?.profile ? (
//                       <Image
//                         source={{ uri: chat.members?.profile }}
//                         style={styles.chatImage}
//                       />
//                     ) : (
//                       <View style={styles.initialsCircle}>
//                         <Text
//                           allowFontScaling={false}
//                           style={styles.initialsText}
//                         >
//                           {getInitials(
//                             chat?.members?.firstname ?? 'A',
//                             chat?.members?.lastname ?? 'W',
//                           )}
//                         </Text>
//                       </View>
//                     )}

//                     {/* <Image source={chat.members?.profile}  style={styles.chatImage}  /> */}

//                     <View style={{ flex: 1 }}>
//                       <View
//                         style={{
//                           flexDirection: 'row',
//                           justifyContent: 'space-between',
//                           width: '100%',
//                         }}
//                       >
//                         <Text
//                           allowFontScaling={false}
//                           style={{
//                             fontSize: 16,
//                             fontWeight: '600',
//                             color: '#FFFFFF',
//                             fontFamily: 'Urbanist-SemiBold',
//                           }}
//                         >
//                           {chat?.members?.firstname} {chat?.members?.lastname}
//                         </Text>
//                         <Text
//                           allowFontScaling={false}
//                           style={{
//                             fontSize: 12,
//                             fontWeight: '500',
//                             color: '#FFFFFFA3',
//                             fontFamily: 'Urbanist-Medium',
//                           }}
//                         >
//                           {formatTime(chat?.last_message?.dateCreated)}
//                         </Text>
//                       </View>

//                       <View
//                         style={{
//                           flexDirection: 'row',
//                           justifyContent: 'space-between',
//                           width: '100%',
//                           marginTop: 4,
//                         }}
//                       >
//                         <Text
//                           allowFontScaling={false}
//                           numberOfLines={1}
//                           ellipsizeMode="tail"
//                           style={{
//                             fontSize: 12,
//                             fontWeight: '500',
//                             color: '#FFFFFFE0',
//                             fontFamily: 'Urbanist-Medium',
//                             flex: 1,
//                           }}
//                         >
//                           {chat?.last_message?.body}
//                         </Text>

//                         {/* {item.unreadCount > 0 && ( */}
//                         <Text
//                           allowFontScaling={false}
//                           style={{
//                             fontSize: 14,
//                             fontWeight: '600',
//                             color: '#FFFFFF',
//                             fontFamily: 'Urbanist-Medium',
//                             backgroundColor: 'rgba(255, 255, 255, 0.14)',
//                             shadowColor: '#000',
//                             shadowOffset: { width: 0, height: 2 },
//                             shadowOpacity: 0.3,
//                             shadowRadius: 3,
//                             padding: 5,
//                             width: 30,
//                             textAlign: 'center',
//                             borderRadius: 100,
//                           }}
//                         >
//                           {chat?.unreadcount}
//                         </Text>
//                         {/* )} */}
//                       </View>
//                     </View>
//                   </View>
//                   {/* ))} */}
//                   {/* Divider Line */}
//                   <View
//                     style={{
//                       height: 1,
//                       backgroundColor: 'rgba(255,255,255,0.2)',
//                       marginTop: 10,
//                       width: '100%',
//                     }}
//                   />
//                 </View>
//               </TouchableOpacity>
//             )}
//           />
//         </View>
//         </ScrollView>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   initialsCircle: {
//     backgroundColor: '#8390D4',
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 12,
//   },
//   initialsText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 600,
//     textAlign: 'center',
//     fontFamily: 'Urbanist-SemiBold',
//   },

//   chatImage: { width: 50, height: 50, borderRadius: 100 },
//   chatRow: {
//     width: '100%',
//     flexDirection: 'row',
//     gap: 10,
//     marginTop: 10,
//     alignItems: 'center',
//   },
//   chatConainter: {
//     top: 90,
//     minHeight: '100%',
//     width: '100%',
//     paddingHorizontal: 16,
//     gap: 10,
//   },
//   searchBar: {
//     fontFamily: 'Urbanist-Medium',
//     marginLeft: -5,
//     fontWeight: 500,
//     fontSize: 17,
//     color: '#fff',
//     width: '80%',
//   },
//   search_container: {
//     display: 'flex',
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'stretch',
//     borderRadius: 50,
//     boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
//     paddingVertical: 4,
//   },
//   searchIcon: {
//     padding: Platform.OS === 'ios' ? 0 : 5,
//     margin: 10,
//     height: 24,
//     width: 24,
//   },
//   text: {
//     color: 'black',
//     fontSize: 20,
//     fontWeight: '600',
//   },
//   scrollContainer: {
//     paddingHorizontal: 20,
//     paddingBottom: 80,
//     paddingTop: 0,
//   },
//   header: {
//     height: 100,
//     // paddingTop: 40,
//     justifyContent: 'center',
//     position: 'absolute',
//     top: 10,
//     left: 0,
//     right: 0,
//     zIndex: 10,
//     // bottom: 0,
//     overflow: 'hidden',
//   },
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   backBtn: {
//     width: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backIconRow: {
//     padding: 12,
//     borderRadius: 40,
//     backgroundColor:
//       'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
//     boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
//     borderWidth: 0.4,
//     borderColor: '#ffffff2c',
//     height: 48,
//     width: 48,
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backArrow: {
//     fontSize: 26,
//     color: '#fff',
//   },
//   unizyText: {
//     color: '#FFFFFF',
//     fontSize: 20,
//     flex: 1,
//     fontWeight: '600',
//     textAlign: 'center',
//     fontFamily: 'Urbanist-SemiBold',
//   },
// });

// export default MessagesScreen;


import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useRef } from 'react';
import {
  Dimensions,
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
import { MAIN_URL } from '../../utils/APIConstant';
import LottieView from 'lottie-react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
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
        console.warn('Missing token or user ID in AsyncStorage');
        if (isInitialLoad) {
          // Show loader for at least 1 second even on error
          await new Promise(resolve => setTimeout(resolve, 1000));
          setInitialLoading(false);
        }
        return;
      }

      // Only set initial loading on first load
      if (isInitialLoad) {
        setInitialLoading(true);
        // Add a minimum delay to ensure loader is visible
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const url = `${MAIN_URL.baseUrl}twilio/mychats?search=${query}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn('Token fetch failed:', data.message);
        if (isInitialLoad) {
          // Show loader for at least 1 second even on error
          const elapsedTime = 500; // Already waited 500ms
          const remainingTime = Math.max(0, 1000 - elapsedTime);
          if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
          }
          setInitialLoading(false);
        }
        return;
      }

      const UserData = data.data;
      setStudentList(UserData.result);
      
      if (isInitialLoad) {
        // Ensure loader shows for at least 1 second total
        const remainingTime = Math.max(0, 1000 - 500);
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
        setInitialLoading(false);
      }
    } catch (error) {
      console.error('Chat setup failed:', error);
      if (isInitialLoad) {
        // Show loader for at least 1 second even on error
        const elapsedTime = 500; // Already waited 500ms if we got here
        const remainingTime = Math.max(0, 1000 - elapsedTime);
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
        setInitialLoading(false);
      }
    }
  };

    // fetchUserChatData();
  // }, []);

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

  const formatTime = (dateString: string) => {
    // if (!dateString) return "";
    // const date = new Date(dateString);
    // return date.toLocaleTimeString([], {
    //   hour: "2-digit",
    //   minute: "2-digit",
    //   hour12: true,
    // });

    if (!dateString) return '';

    const date = new Date(dateString);
    const today = new Date();

    // Strip time to compare only the day, month, year
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } else {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }); // Example: 29/01/2025
    }
  };

  const getInitials = (firstName = '', lastName = '') => {
    const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
    const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
    return f + l || '?';
  };

  if (initialLoading) {
    return (
      <View 
        style={{
          flex: 1,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: width,
          height: height,
          backgroundColor: '#000069',
          zIndex: 9999,
          elevation: 9999,
        }}
      >
        <LottieView
          source={require('../../../assets/animations/lottielodder.json')}
          autoPlay
          loop
          resizeMode="cover"
          style={{
            width: width,
            height: height,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 100,
            backgroundColor: '#000069',
            zIndex: 10000,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 150,
            height: 100,
            backgroundColor: '#000069',
            zIndex: 10000,
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, width: '100%', height: '100%',paddingHorizontal: 16 }}>
        
      

          <FlatList
            data={studentList || []}
            // keyExtractor={(chat, index) => chat?.id?.toString() || index.toString()}
            // onScroll={scrollHandler}
            keyExtractor={(item, index) => {
            'worklet';
            return index.toString();
          }}
            // scrollEventThrottle={16}
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
            renderItem={({ item: chat }) => (
              <ScrollView style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('MessagesIndividualScreen', {
                    animation: 'none',
                    members: chat.members,
                    userConvName: chat.conv_name,
                    currentUserIdList: chat.current_user_id,
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
                        <Text
                          allowFontScaling={false}
                          style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: '#FFFFFF',
                            fontFamily: 'Urbanist-Medium',
                            backgroundColor: 'rgba(255, 255, 255, 0.14)',
                            shadowColor: '#000',
                             lineHeight: 35,   
                            minHeight:35,
                            minWidth:35,
                            textAlign: 'center',
                            borderRadius: 70,
                            alignSelf:'center'
                          }}
                        >
                          {chat?.unreadcount}
                        </Text>
                      </View>
                    </View>
                  </View>
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
              </ScrollView>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 250,
              paddingTop: Platform.OS === 'ios' ? 120 : 10,
              paddingHorizontal: 16,
            }}
            ListEmptyComponent={
              !initialLoading ? (
                <Text allowFontScaling={false} style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
                  No messages found
                </Text>
              ) : null
            }
          />
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
    marginRight: 12,
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
    marginLeft: -5,
    fontWeight: 500,
    fontSize: 17,
    color: '#fff',
    width: '80%',
  },
  search_container: {
    // position: 'absolute',
    top: Platform.OS === 'ios' ? '5%' : 0,
    // left: 16,
    // right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 40,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    // paddingVertical: 4,
    // paddingHorizontal: 16,
    zIndex: 12,
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
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    minHeight: '80%',
    paddingVertical: 100,
    paddingHorizontal: 30,
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