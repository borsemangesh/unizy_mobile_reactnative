// import AsyncStorage from '@react-native-async-storage/async-storage';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   Alert,
//   Animated,
//   Dimensions,
//   FlatList,
//   Image,
//   ImageBackground,
//   Keyboard,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import Svg, { ClipPath, Defs, Rect } from 'react-native-svg';
// import { MAIN_URL } from '../../utils/APIConstant';
// import { Client as TwilioChatClient } from '@twilio/conversations';
// import { RouteProp, useRoute } from '@react-navigation/native';
// import EmojiKeyboard from '../emoji/emojiKebord';
// import { InteractionManager } from 'react-native';

// const bgImage = require('../../../assets/images/backimg.png');
// const profileImage = require('../../../assets/images/user.jpg');
// const back = require('../../../assets/images/back.png');
// const smileyhappy = require('../../../assets/images/smileyhappy.png');

// type MessagesIndividualScreenProps = {
//   navigation: any;
// };

// interface chatMeta {
//   author: string | null;
//   body: string | null;
//   createdAt: Date | null;
// }

// // const MessagesIndividualScreen = ({ navigation }: MessagesIndividualScreenProps) => {
// //   // const [photo, setPhoto] = useState<string | null>(null);

// // };

// type RouteParams = {
//   source?: 'chatList' | 'sellerPage';
//   members: {
//     firstname: string;
//     lastname: string;
//     id: number;
//     profile: string | null;
//     universityName: string;
//   };
//   userConvName: string;
//   currentUserIdList: number;

//   sellerData: {
//     featureId: number;
//     firstname: string;
//     lastname: string;
//     profile: string | null;
//     universityName: string;
//   };
// };

// const MessagesIndividualScreen = ({
//   navigation,
// }: MessagesIndividualScreenProps) => {
//   const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
//   const { members, sellerData, userConvName, currentUserIdList, source } =
//     route.params;

//   console.log('Received members:', members);
//   console.log('sellerData----', sellerData?.featureId);
//   console.log('source', source);
//   console.log('convName', userConvName);

//   const [chatMeta, setchatMeta] = useState<chatMeta>({
//     author: '',
//     body: '',
//     createdAt: null,
//   });

//   // const [twilioToken, setTwilioToken] = useState<any>(null);

//   const [chatClient, setChatClient] = useState<any>(null);

//   const [conversation, setConversation] = useState<any>(null);

//   const [messages, setMessages] = useState<any[]>([]);
//   const [messagesDateTime, setMessagesDateTime] = useState<any[]>([]);

//   const [messageText, setMessageText] = useState('');
//   // const [currentUserId, setCurrentUserId] = useState(null);

//   const [checkUser, setCheckUser] = useState(null);

//   const [selectedEmoji, setSelectedEmoji] = useState('...');

//   const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);

//   const { width, height } = Dimensions.get('window');
//   // const keyboardHeight = height * 0.35; // Must match the height defined in styles.emojiPickerContainer
//   const animatedValue = useRef(new Animated.Value(0)).current;
//   const flatListRef = useRef<FlatList>(null);

//   useEffect(() => {
//     Animated.timing(animatedValue, {
//       toValue: isEmojiPickerVisible ? 0 : keyboardHeight,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   }, [isEmojiPickerVisible]);

//   // const handleEmojiPress = () => {
//   //   setIsEmojiPickerVisible(prev => !prev);
//   //   Keyboard.dismiss();
//   // };

//   const handleEmojiSelected = (char: string) => {
//     setMessageText(prevText => prevText + char);
//   };

//   // ----------------------------------------------------------
//   // STEP 1: Get Twilio Token and Initialize Client
//   // ----------------------------------------------------------
//   useEffect(() => {
//     const fetchTwilioToken = async () => {
//       try {
//         const token = await AsyncStorage.getItem('userToken');
//         const userId = await AsyncStorage.getItem('userId');
//         if (!token || !userId) return;

//         const response = await fetch(`${MAIN_URL.baseUrl}twilio/auth-token`, {
//           method: 'GET',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         const data = await response.json();
//         if (!response.ok) throw new Error(data.message);

//         const client = new TwilioChatClient(data.data.token);
//         setChatClient(client);
//       } catch (err) {
//         console.error('Twilio init failed:', err);
//       }
//     };
//     fetchTwilioToken();
//   }, []);

//   // ----------------------------------------------------------
//   // STEP 2: Fetch or Create Conversation
//   // ----------------------------------------------------------
//   useEffect(() => {
//     if (!chatClient) return;

//     let isMounted = true;
//     const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

//     const fetchConversation = async () => {
//       try {
//         const token = await AsyncStorage.getItem('userToken');
//         const userId = await AsyncStorage.getItem('userId');

//         const waitForClientConnection = (client: any) =>
//           new Promise<void>(resolve => {
//             if (client.connectionState === 'connected') return resolve();
//             client.on('connectionStateChanged', (state: string) => {
//               if (state === 'connected') resolve();
//             });
//           });

//         await waitForClientConnection(chatClient);

//         let convName = userConvName;
//         let apiData: any = null;
//         console.log('source000', source);

//         if (source === 'sellerPage') {
//           const url = `${MAIN_URL.baseUrl}twilio/conversation-fetch`;
//           const res = await fetch(url, {
//             method: 'POST',
//             headers: {
//               Authorization: `Bearer ${token}`,
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ feature_id: sellerData.featureId }),
//           });

//           apiData = await res.json();
//           if (res.ok && apiData.data?.conv_name)
//             convName = apiData.data.conv_name;

//           if (apiData.data == null) {
//             console.warn(
//               'Conversation create new conversation:',
//               apiData.message,
//             );
//             return;
//           }
//         }

//         let convo;
//         try {
//           convo = await chatClient.getConversationByUniqueName(convName);
//         } catch {
//           convo = await chatClient.createConversation({ uniqueName: convName });
//         }

//         if (!convo) return;

//         const participants = await convo.getParticipants();
//         const alreadyJoined = participants.some(
//           (p: any) => p.identity === userId,
//         );
//         if (!alreadyJoined) await convo.join();

//         if (!isMounted) return;
//         setConversation(convo);
//         setCheckUser(
//           source === 'chatList'
//             ? currentUserIdList
//             : apiData?.data?.current_user_id || userId,
//         );

//         const messagesPage = await convo.getMessages();

//         const messagesdate = messagesPage.items.map((msg: any) => {
//           const createdAt = msg.dateCreated || msg.timestamp; // fallback if dateCreated missing

//           return {
//             time: new Date(createdAt).toLocaleTimeString([], {
//               hour: '2-digit',
//               minute: '2-digit',
//             }),
//             date: new Date(createdAt).toLocaleDateString('en-IN', {
//               day: '2-digit',
//               month: 'short',
//               year: 'numeric',
//             }),
//           };
//         });

//         console.log('date time masg------', messagesdate);

//         console.log('messagesPage----------', messagesPage.items);
//         setMessagesDateTime(messagesdate);

//         setMessages(messagesPage.items);
//       } catch (err) {
//         console.error('Conversation setup failed:', err);
//       }
//     };

//     fetchConversation();

//     return () => {
//       isMounted = false;
//     };
//   }, [chatClient]);

//   // ----------------------------------------------------------
//   // STEP 3: Attach Twilio Message Listener (ONLY ONCE)
//   // ----------------------------------------------------------
//   useEffect(() => {
//     if (!conversation) return;

//     const handleNewMessage = (m: any) => {
//       console.log('New Twilio message:', m.body);
//       setMessages(prev => {
//         if (prev.find(msg => msg.sid === m.sid)) return prev; // dedup
//         return [...prev, m];
//       });
//     };

//     conversation.on('messageAdded', handleNewMessage);

//     return () => {
//       console.log(' Cleaning Twilio listener');
//       conversation.removeListener('messageAdded', handleNewMessage);
//     };
//   }, [conversation]);

//   // ----------------------------------------------------------
//   // STEP 4: Send Message
//   // ----------------------------------------------------------
//   const handleSendMessage = async () => {
//     // if (!conversation || !messageText.trim()) return;
//     // try {
//     //   await conversation.sendMessage(messageText.trim());
//     //   setMessageText('');
//     // } catch (err) {
//     //   console.error('Send failed:', err);
//     // }

//     if (!messageText.trim()) return;

//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       const userId = await AsyncStorage.getItem('userId');

//       console.log('token', token);

//       if (conversation) {
//         await conversation.sendMessage(messageText.trim());
//         console.log(' Message sent conversation exist:', messageText);
//         setMessageText(''); // clear input after send
//         return;
//       }

//       // Case 2️: Conversation not yet created → create now after first message
//       console.log(' Creating conversation after first message...');

//       const urlCreate = `${MAIN_URL.baseUrl}twilio/conversation-create`;
//       const body = { feature_id: sellerData?.featureId };

//       const createResponse = await fetch(urlCreate, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(body),
//       });

//       const createData = await createResponse.json();
//       console.log('conversation-create response:', createData);

//       if (!createResponse.ok || !createData?.data?.conv_name) {
//         console.error('Failed to create conversation:', createData.message);
//         return;
//       }

//       const convName = createData.data.conv_name;
//       setCheckUser(createData.data.current_user_id);
//       // setCurrentUserId(convName);

//       // Get or create Twilio conversation
//       let convo;
//       try {
//         convo = await chatClient.getConversationByUniqueName(convName);
//         console.log('Found Twilio conversation:', convo.sid);
//       } catch {
//         convo = await chatClient.createConversation({ uniqueName: convName });
//         console.log('Created Twilio conversation:', convo.sid);
//       }

//       // Join conversation
//       try {
//         await convo.join();
//         console.log('Joined new conversation:', convo.sid);
//       } catch (err: any) {
//         if (err.message?.includes('Conflict')) console.log('Already joined.');
//         else console.error('Join failed:', err);
//       }

//       // Send the pending first message
//       await convo.sendMessage(messageText.trim());
//       console.log(
//         'First message sent after conversation creation:',
//         messageText,
//       );

//       setConversation(convo);
//       setMessageText('');
//       setMessages(prev => [
//         ...prev,
//         { body: messageText.trim(), state: { author: userId } },
//       ]);
//     } catch (error) {
//       console.error('Message send failed:', error);
//     }
//   };

//   const getInitials = (firstName = '', lastName = '') =>
//     (firstName?.[0] || '') + (lastName?.[0] || '');

//   const WINDOW_HEIGHT = Dimensions.get('window').height;
//   const INPUT_BAR_HEIGHT = Platform.OS === 'ios' ? 70 : 64; // adjust to your design
//   const EMOJI_PICKER_HEIGHT = Math.round(WINDOW_HEIGHT * 0.35);

//   const [keyboardVisible, setKeyboardVisible] = useState(false);
//   const [keyboardHeight, setKeyboardHeight] = useState(0);

//   useEffect(() => {
//     // Keyboard listeners to get keyboard height
//     const showSub = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
//       e => {
//         setKeyboardVisible(true);
//         // use endCoordinates.height for keyboard height
//         const h = (e && e.endCoordinates && e.endCoordinates.height) || 0;
//         setKeyboardHeight(h);
//         // if keyboard opens, close emoji picker
//         if (isEmojiPickerVisible) setIsEmojiPickerVisible(false);
//       },
//     );
//     const hideSub = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
//       () => {
//         setKeyboardVisible(false);
//         setKeyboardHeight(0);
//       },
//     );

//     return () => {
//       showSub.remove();
//       hideSub.remove();
//     };
//   }, [isEmojiPickerVisible, setIsEmojiPickerVisible]);

//   // compute bottom offset for emoji picker:
//   // if keyboard visible, we won't show emoji (we also auto-hide emoji when keyboard opens),
//   // otherwise emoji should be flush with bottom (occupying EMOJI_PICKER_HEIGHT),
//   // and the input bar should sit above it (so input bottom = EMOJI_PICKER_HEIGHT).
//   const emojiBottom = 0; // emoji anchored to bottom
//   const inputBarBottom = keyboardVisible
//     ? 0 // ⬅ LET KeyboardAvoidingView handle this
//     : isEmojiPickerVisible
//     ? EMOJI_PICKER_HEIGHT
//     : 0;

//   // for auto scroll

//   const [extraPadding, setExtraPadding] = useState(48); // gap under last message (px)
//   const [contentHeight, setContentHeight] = useState(0);
//   const [listHeight, setListHeight] = useState(0);

//   useEffect(() => {
//     if (!messages || messages.length === 0) return;

//     // debug logs — remove later
//     console.log(
//       'AUTO-SCROLL: messages:',
//       messages.length,
//       'contentH',
//       contentHeight,
//       'listH',
//       listHeight,
//       'extraPad',
//       extraPadding,
//     );

//     // compute offset: contentHeight - visibleHeight + extraPaddingSpace
//     const bottomSafeArea =
//       INPUT_BAR_HEIGHT +
//       (isEmojiPickerVisible ? EMOJI_PICKER_HEIGHT : 0) +
//       extraPadding;
//     const offset = Math.max(0, contentHeight - listHeight + bottomSafeArea);

//     InteractionManager.runAfterInteractions(() => {
//       // small timeout to let RN apply measurements
//       setTimeout(() => {
//         if (!flatListRef.current) {
//           console.warn('flatListRef not available');
//           return;
//         }
//         try {
//           // scrollToOffset is more deterministic than scrollToEnd here
//           flatListRef.current.scrollToOffset({ offset, animated: true });
//           console.log('AUTO-SCROLL -> scrollToOffset', offset);
//         } catch (err) {
//           console.warn('scrollToOffset failed, fallback to scrollToEnd', err);
//           flatListRef.current.scrollToEnd({ animated: true });
//         }
//       }, 40); // tweak 40ms if needed
//     });
//   }, [messages, contentHeight, listHeight, isEmojiPickerVisible, extraPadding]);

//   //-------------- for set date wise messages -----------------//

//   const formatMessageDate = (date: Date) => {
//     const today = new Date();
//     const yesterday = new Date();
//     yesterday.setDate(today.getDate() - 1);

//     const d = new Date(date);

//     if (d.toDateString() === today.toDateString()) return 'Today';

//     if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

//     return d.toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//     });
//   };

//   const buildMessageList = (messages: any[]) => {
//     let grouped: any[] = [];
//     let lastDate: string | null = null;

//     messages.forEach(msg => {
//       const created = msg.dateCreated || msg.timestamp;
//       const dateLabel = formatMessageDate(new Date(created));

//       if (lastDate !== dateLabel) {
//         grouped.push({ type: 'date', date: dateLabel });
//         lastDate = dateLabel;
//       }

//       grouped.push({ type: 'message', data: msg });
//     });

//     return grouped;
//   };

//   const groupedMessages = buildMessageList(messages);

//   console.log('groupedMessages=========', groupedMessages);

//   return (
//     <ImageBackground source={bgImage} style={{ flex: 1 }} resizeMode="cover">
//       <View style={styles.messageHeader}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Image
//             source={back}
//             resizeMode="contain"
//             style={styles.backIconStyle}
//           />
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}
//           onPress={() => navigation.navigate('UserProfileScreen')}
//         >
//           {/* <Image source={profileImage} style={styles.profileImage} /> */}

//           {source === 'chatList' ? (
//             members?.profile ? (
//               <Image
//                 source={{ uri: members?.profile }}
//                 style={styles.profileImage}
//               />
//             ) : (
//               <View style={styles.initialsCircle}>
//                 <Text allowFontScaling={false} style={styles.initialsText}>
//                   {getInitials(
//                     members?.firstname ?? 'A',
//                     members?.lastname ?? 'W',
//                   )}
//                 </Text>
//               </View>
//             )
//           ) : sellerData?.profile ? (
//             <Image
//               source={{ uri: sellerData?.profile }}
//               style={styles.profileImage}
//             />
//           ) : (
//             <View style={styles.initialsCircle}>
//               <Text allowFontScaling={false} style={styles.initialsText}>
//                 {getInitials(
//                   members?.firstname ?? 'A',
//                   members?.lastname ?? 'W',
//                 )}
//               </Text>
//             </View>
//           )}

//           <View>
//             <Text allowFontScaling={false} style={styles.studentName}>
//               {source === 'chatList'
//                 ? members?.firstname
//                 : sellerData.firstname}{' '}
//               {source === 'chatList' ? members?.lastname : sellerData.lastname}
//             </Text>
//             <Text allowFontScaling={false} style={styles.universityName}>
//               {members?.universityName ? members?.universityName : '-'}
//             </Text>
//           </View>
//         </TouchableOpacity>
//       </View>

//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
//       >
//         <View style={{ flex: 1 }}>
//           <FlatList
//             data={groupedMessages}
//             keyExtractor={item => item.sid}
//             renderItem={({ item }) => (
//               <>
//                 {item.type === 'date' && (
//                   <View style={{ alignItems: 'center', marginVertical: 10 }}>
//                     <Text
//                       style={{
//                         color: '#FFFFFF7A',
//                         backgroundColor: '#00000029',
//                         paddingHorizontal: 8,
//                         paddingVertical: 4,
//                         borderRadius: 6,
//                         fontSize: 10,
//                         fontFamily: 'Urbanist-Medium',
//                         marginVertical: 10,
//                       }}
//                     >
//                       {item.date}
//                     </Text>
//                   </View>
//                 )}
//                 <View
//                   style={[
//                     styles.messageContainer,
//                     item?.data?.state?.author == checkUser
//                       ? styles.rightAlign
//                       : styles.leftAlign,
//                   ]}
//                 >
//                   <View
//                     style={
//                       item?.data?.state?.author === checkUser
//                         ? styles.rightBubbleWrapper
//                         : styles.leftBubbleWrapper
//                     }
//                   >
//                     {item?.data?.state?.author != checkUser && (
//                       <View
//                         style={{
//                           width: 0,
//                           height: 0,
//                           borderTopWidth: 8,
//                           borderTopColor: 'transparent',
//                           borderRightWidth: 9,
//                           borderRightColor: '#FFFFFF1F',
//                           borderBottomWidth: 8,
//                           borderBottomColor: 'transparent',
//                           alignSelf: 'flex-start',
//                           marginRight: 0,
//                           marginTop: 4,
//                         }}
//                       />
//                     )}

//                     <View
//                       style={[
//                         styles.bubble,
//                         item?.data?.state?.author == checkUser
//                           ? styles.rightBubble
//                           : styles.leftBubble,
//                       ]}
//                     >
//                       <Text allowFontScaling={false} style={styles.messageText}>
//                         {item?.data?.state?.body}
//                       </Text>
//                     </View>

//                     {item?.data?.state?.author == checkUser && (
//                       <View
//                         style={{
//                           width: 0,
//                           height: 0,
//                           borderTopWidth: 8,
//                           borderTopColor: 'transparent',
//                           borderLeftWidth: 9,
//                           borderLeftColor: '#0000001F',
//                           borderBottomWidth: 8,
//                           borderBottomColor: 'transparent',
//                           alignSelf: 'flex-start',
//                           marginLeft: 0,
//                           marginTop: 4,
//                         }}
//                       />
//                     )}
//                   </View>
//                 </View>
//               </>
//             )}
//             ref={flatListRef}
//             keyboardShouldPersistTaps="handled"
//             // onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
//             // onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}

//             onContentSizeChange={(w, h) => {
//               // w is width (ignored), h is contentHeight
//               setContentHeight(h);
//             }}
//             // measure FlatList viewport height
//             onLayout={e => {
//               const h = e.nativeEvent.layout.height;
//               setListHeight(h);
//             }}
//             // compute and scroll after layout/content change
//             onScrollEndDrag={() => {
//               /* optional: keep for user interactions */
//             }}
//             contentContainerStyle={{
//               paddingBottom:
//                 INPUT_BAR_HEIGHT +
//                 (isEmojiPickerVisible ? EMOJI_PICKER_HEIGHT : 0) +
//                 extraPadding,
//               paddingTop: 8,
//             }}
//             // contentContainerStyle={{ paddingBottom: INPUT_BAR_HEIGHT + (isEmojiPickerVisible ? EMOJI_PICKER_HEIGHT : 20) }}
//             showsVerticalScrollIndicator={false}
//           />

//           {/* EMOJI PICKER PANEL - anchored to bottom */}
//           {isEmojiPickerVisible && (
//             <View
//               style={{
//                 position: 'absolute',
//                 bottom: emojiBottom,
//                 left: 0,
//                 right: 0,
//                 height: EMOJI_PICKER_HEIGHT,
//                 backgroundColor: '#34478dff',
//                 borderTopLeftRadius: 12,
//                 borderTopRightRadius: 12,
//                 zIndex: 999,
//                 paddingVertical: 10,
//               }}
//             >
//               {/* Your EmojiKeyboard component */}
//               <EmojiKeyboard
//                 onEmojiSelected={emoji => {
//                   // add emoji to text
//                   handleEmojiSelected(emoji);
//                 }}
//               />
//             </View>
//           )}

//           {/* Input Bar - ALWAYS above keyboard or emoji panel */}
//           <View
//             style={{
//               position: 'absolute',
//               left: 0,
//               right: 0,
//               bottom: inputBarBottom,
//               paddingHorizontal: 16,
//               paddingVertical: Platform.OS === 'ios' ? 10 : 8,
//               backgroundColor: 'transparent',
//               zIndex: 1000,
//             }}
//           >
//             <View
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 width: '100%',
//               }}
//             >
//               {/* Input bubble */}
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   flex: 1,
//                   borderRadius: 40,
//                   paddingHorizontal: 16,
//                   paddingVertical: 4,
//                   backgroundColor: '#ffffff66',
//                 }}
//               >
//                 {/* Emoji button */}
//                 <TouchableOpacity
//                   onPress={() => {
//                     // toggle emoji panel
//                     // if keyboard visible, dismiss keyboard first
//                     if (keyboardVisible) {
//                       Keyboard.dismiss();
//                       // small timeout to let keyboard hide before showing emoji panel:
//                       setTimeout(() => setIsEmojiPickerVisible(s => !s), 100);
//                     } else {
//                       setIsEmojiPickerVisible(s => !s);
//                     }
//                   }}
//                   style={{ marginRight: 8 }}
//                 >
//                   <Image
//                     source={smileyhappy}
//                     style={{ width: 24, height: 24, tintColor: '#fff' }}
//                   />
//                 </TouchableOpacity>

//                 <View
//                   style={{
//                     width: 1,
//                     height: 20,
//                     backgroundColor: '#FFFFFF80',
//                     marginHorizontal: 6,
//                   }}
//                 />

//                 {/* Text input */}
//                 <TextInput
//                   allowFontScaling={false}
//                   style={{
//                     flex: 1,
//                     color: '#fff',
//                     fontFamily: 'Urbanist-Medium',
//                     fontSize: 17,
//                   }}
//                   placeholder="Message"
//                   placeholderTextColor="#ccc"
//                   onChangeText={setMessageText}
//                   value={messageText}
//                   onFocus={() => {
//                     // when user focuses, hide emoji picker, show keyboard
//                     setIsEmojiPickerVisible(false);
//                   }}
//                 />
//               </View>

//               {/* Send */}
//               <TouchableOpacity
//                 onPress={handleSendMessage}
//                 style={{
//                   marginLeft: 8,
//                   width: 48,
//                   height: 48,
//                   borderRadius: 24,
//                   backgroundColor: '#ffffff66',
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                 }}
//               >
//                 <Image
//                   source={require('../../../assets/images/sendmessage.png')}
//                   style={{ width: 22, height: 22, tintColor: '#fff' }}
//                 />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </ImageBackground>
//   );
// };

// export default MessagesIndividualScreen;

// const styles = StyleSheet.create({
//   // Bubble wrappers with tails
//   leftBubbleWrapper: {
//     position: 'relative',
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     marginVertical: 4,
//   },
//   rightBubbleWrapper: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     marginVertical: 4,

//     // position: 'relative',
//   },
//   leftTailContainer: {
//     position: 'absolute',
//     left: -8,
//     bottom: 0,
//   },
//   rightTailContainer: {
//     position: 'absolute',
//     right: -8,
//     bottom: 0,
//   },

//   // Original styles
//   sendIconContainer: {
//     padding: 12,
//     borderRadius: 40,
//     backgroundColor:
//       'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
//     boxShadow: 'rgba(255, 255, 255, 0.21) inset -1px 0px 5px 1px',
//     borderWidth: 0.4,
//     borderColor: '#ffffff2c',
//     height: 48,
//     width: 48,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1000,
//   },
//   sendIcon: {
//     width: 20,
//     height: 20,
//   },
//   // bottomContainer: {
//   //   bottom: Platform.OS === 'ios' ? 200 : 100,
//   //   display: 'flex',
//   //   flexDirection: 'row',
//   //   alignItems: 'center',
//   //   gap: 5,
//   //   paddingHorizontal: 20,
//   //   //marginBottom:40
//   // },
//   //   bottomContainer: {
//   //   position: 'absolute',
//   //   bottom: 0,
//   //   left: 0,
//   //   right: 0,
//   //   flexDirection: 'row',
//   //   alignItems: 'center',
//   //   paddingHorizontal: 20,
//   //   paddingVertical: Platform.OS === 'ios' ? 12 : 8,
//   //   backgroundColor: 'rgba(255,255,255,0.15)',
//   //   borderTopWidth: 0.5,
//   //   borderTopColor: '#ffffff3a',
//   // },

//   bottomContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: Platform.OS === 'ios' ? 10 : 8,
//     backgroundColor: 'rgba(255,255,255,0.15)',
//     borderTopWidth: 0.5,
//     borderTopColor: '#ffffff3a',
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
//   searchBar: {
//     fontFamily: 'Urbanist-Medium',
//     marginLeft: 5,
//     fontWeight: '500',
//     fontSize: 17,
//     color: '#fff',
//     width: '70%',
//   },
//   universityName: {
//     fontSize: 12,
//     fontFamily: 'Urbanist-Medium',
//     fontWeight: '500',
//     color: '#FFFFFF',
//   },
//   backIconStyle: {
//     width: 30,
//     height: 30,
//   },
//   studentName: {
//     color: '#ffffff',
//     fontFamily: 'Urbanist-SemiBold',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   messageHeader: {
//     height: 100,
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     paddingHorizontal: 12,
//     gap: 10,
//     marginTop: Platform.OS === 'ios' ? 50 : 20,
//   },
//   messageViewContainer: {
//     paddingHorizontal: 16,
//     width: '100%',
//     height: '100%',
//     paddingBottom: Platform.OS === 'ios' ? 205 : 155,
//   },
//   profileImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 100,
//   },
//   chatContainer: {
//     justifyContent: 'flex-start',
//   },
//   messageContainer: {
//     // marginBottom: 50,
//     paddingHorizontal: 6,
//     // gap: 10,
//   },
//   bubble: {
//     paddingVertical: 8,
//     paddingHorizontal: 10,
//     borderRadius: 6,
//     marginVertical: 0,
//     maxWidth: '75%',
//   },
//   leftAlign: {
//     alignItems: 'flex-start',
//     gap: 6,
//   },
//   rightAlign: {
//     alignItems: 'flex-end',
//     gap: 6,
//   },
//   leftBubble: {
//     backgroundColor: '#FFFFFF1F',
//     borderRadius: 4,
//   },
//   rightBubble: {
//     backgroundColor: '#0000001F',
//     borderRadius: 4,
//   },
//   messageText: {
//     fontFamily: 'Urbanist-Medium',
//     color: '#FFFFFFE0',
//     fontSize: 14,
//     lineHeight: 17,
//     fontWeight: '500',
//     fontStyle: 'normal',
//     letterSpacing: 0,
//     textAlignVertical: 'center',
//     includeFontPadding: false,
//   },

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

//   container: {
//     flex: 1,
//     backgroundColor: '#1E2B63',
//     paddingTop: 50,
//     alignItems: 'center',
//   },
//   headerText: {
//     color: '#FFF',
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   selectedText: {
//     color: '#FFD700',
//     fontSize: 30,
//     marginBottom: 20,
//   },
//   divider: {
//     height: 1,
//     width: '80%',
//     backgroundColor: '#ffffff5f',
//     marginBottom: 20,
//   },

//   emojiItem: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 8,
//   },
//   row: {
//     justifyContent: 'space-around',
//   },
//   emojiButton: {
//     // Adjust these to suit your layout; they ensure the area is clickable
//     paddingHorizontal: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: '100%', // Take up the full height of search_container
//   },
//   mainContainer: {
//     width: '100%',
//     // Make the container stick to the bottom
//     position: 'absolute',
//     //  bottom: -400,
//     // The total height must cover the keyboard height + input bar height
//     // height:  80, // e.g., 80 is the height of your input bar
//     // overflow: 'hidden', // Ensures the keyboard is clipped when off-screen
//   },
// });


import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Animated as RNAnimated } from 'react-native';
import Svg, { ClipPath, Defs, Rect } from 'react-native-svg';
import { MAIN_URL } from '../../utils/APIConstant';
import { Client as TwilioChatClient } from '@twilio/conversations';
import { RouteProp, useRoute } from '@react-navigation/native';
import EmojiKeyboard from '../emoji/emojiKebord';
import { InteractionManager, PanResponder } from 'react-native';
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
// @ts-ignore - react-native-vector-icons types
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const bgImage = require('../../../assets/images/backimg.png');
const profileImage = require('../../../assets/images/user.jpg');
const back = require('../../../assets/images/back.png');
const smileyhappy = require('../../../assets/images/smileyhappy.png');

type MessagesIndividualScreenProps = {
  navigation: any;
};

interface chatMeta {
  author: string | null;
  body: string | null;
  createdAt: Date | null;
}

type RouteParams = {
  source?: 'chatList' | 'sellerPage';
  members: {
    firstname: string;
    lastname: string;
    id: number;
    profile: string | null;
    university: {id:number,name:string};
  };
  userConvName: string;
  currentUserIdList: number;

  sellerData: {
    featureId: number;
    firstname: string;
    lastname: string;
    profile: string | null;
    universityName: string;
  };
};

const MessagesIndividualScreen = ({
  navigation,
}: MessagesIndividualScreenProps) => {
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const { members, sellerData, userConvName, currentUserIdList, source } =
    route.params;

  console.log('Received members:', members);
  console.log('sellerData----', sellerData?.featureId);
  console.log('source', source);
  console.log('convName', userConvName);

  console.log('currentUserIdList----',currentUserIdList);
  


  // const [twilioToken, setTwilioToken] = useState<any>(null);

  const [chatClient, setChatClient] = useState<any>(null);

  const [conversation, setConversation] = useState<any>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [messagesDateTime, setMessagesDateTime] = useState<any[]>([]);

  const [messageText, setMessageText] = useState('');
  // const [currentUserId, setCurrentUserId] = useState(null);

  const [checkUser, setCheckUser] = useState(null);

  const [selectedEmoji, setSelectedEmoji] = useState('...');

  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [layoutReady, setLayoutReady] = useState(false);
  const [kavKey, setKavKey] = useState(0);

  const { width, height } = Dimensions.get('window');
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);
  const emojiTranslateY = useRef(new RNAnimated.Value(0)).current;

  // Animated hooks for blur effect
  const scrollY = useSharedValue(0);
  const initialScrollY = useRef<number | null>(null); // Track initial scroll position

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      const currentY = event.contentOffset.y;
      
      // Store initial scroll position (when at bottom)
      if (initialScrollY.current === null) {
        initialScrollY.current = currentY;
      }
      
      // Only track upward scroll from initial position
      // If currentY < initialScrollY, user is scrolling up (show blur)
      // If currentY >= initialScrollY, user is at or below initial position (hide blur)
      const scrollUpAmount = initialScrollY.current - currentY;
      scrollY.value = Math.max(0, scrollUpAmount); // Only positive values (scrolling up)
    },
  });

  const animatedBlurStyle = useAnimatedStyle(() => {
    'worklet';
    // Only show blur when scrolling up from bottom (scrollY > 0)
    // Interpolate from 0 to 300px of upward scroll
    const opacity = interpolate(scrollY.value, [0, 300], [0, 1], 'clamp');
    return { opacity };
  });

  // Move constants before they're used
  const WINDOW_HEIGHT = Dimensions.get('window').height;
  const INPUT_BAR_HEIGHT = Platform.OS === 'ios' ? 70 : 64;
  const DEFAULT_EMOJI_HEIGHT = Math.round(WINDOW_HEIGHT * 0.35);
  // Consistent bottom spacing to match keyboard-open appearance
  const BOTTOM_SPACING = Platform.OS === 'ios' ? 0 : 0; // Will be handled by padding

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [lastKeyboardHeight, setLastKeyboardHeight] = useState(0);
  const windowHeightRef = useRef(Dimensions.get('window').height);
  
  // Emoji keyboard height MUST match the device's actual keyboard height
  // Use lastKeyboardHeight (captured when keyboard opens) to match device-specific keyboard height
  // This ensures emoji picker height matches the exact keyboard height on each device
  // If keyboard hasn't been opened yet, use a reasonable default that will be updated when keyboard opens
  const EMOJI_PICKER_HEIGHT = lastKeyboardHeight > 0 
    ? lastKeyboardHeight  // Use actual keyboard height captured from device
    : DEFAULT_EMOJI_HEIGHT; // Fallback until keyboard opens (will be updated automatically)
  
  // Update window height when dimensions change (for keyboard height calculation)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      windowHeightRef.current = window.height;
    });
    return () => subscription?.remove();
  }, []);

  // Disable navigation gestures when emoji keyboard is open
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: !isEmojiPickerVisible,
    });
  }, [isEmojiPickerVisible, navigation]);

  // const [loading, setLoading] = useState(true);

  // Emoji picker - NO ANIMATION, instant appearance/disappearance
  // Set translateY to 0 always for instant show/hide (no bottom-to-top animation)
  useEffect(() => {
    // Always keep translateY at 0 for instant appearance (no animation)
    emojiTranslateY.setValue(0);
  }, [isEmojiPickerVisible, lastKeyboardHeight]);

  // PanResponder for swipe down gesture only - ignores horizontal swipes
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // STRICTLY only respond to vertical downward swipes
        // Completely ignore horizontal swipes (left/right)
        const verticalMovement = Math.abs(gestureState.dy);
        const horizontalMovement = Math.abs(gestureState.dx);
        const isVerticalSwipe = verticalMovement > horizontalMovement;
        const isDownwardSwipe = gestureState.dy > 15; // Minimum threshold
        
        // Only activate if it's clearly a vertical downward swipe
        return isVerticalSwipe && isDownwardSwipe;
      },
      onPanResponderGrant: () => {
        // Gesture started
      },
      onPanResponderMove: (_, gestureState) => {
        // Only move if it's a downward vertical gesture
        // But don't animate - just track for swipe detection
        const isVertical = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        if (isVertical && gestureState.dy > 0) {
          // Track gesture but don't visually move (no animation)
          // The emoji picker stays in place, we just detect the swipe
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Check if it's a valid vertical downward swipe
        const isVertical = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        const shouldClose = isVertical && (gestureState.dy > 50 || gestureState.vy > 0.5);

        if (shouldClose && isEmojiPickerVisible) {
          // Close emoji keyboard instantly (no animation)
          emojiTranslateY.setValue(0);
          setIsEmojiPickerVisible(false);
        } else {
          // Reset to 0 instantly (no animation)
          emojiTranslateY.setValue(0);
        }
      },
    })
  ).current;

  // Auto-focus text input when emoji keyboard closes (except when button is clicked or on initial mount)
  const shouldAutoFocusRef = useRef(true);
  const isInitialMountRef = useRef(true);
  const isOpeningEmojiRef = useRef(false); // Track when we're opening emoji keyboard
  
  useEffect(() => {
    // Skip auto-focus on initial mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    
    // Don't auto-focus if we're in the process of opening emoji keyboard
    if (isOpeningEmojiRef.current) {
      isOpeningEmojiRef.current = false; // Reset flag
      return;
    }
    
    // Only auto-focus if emoji keyboard was just closed (not on initial mount or when opening)
    if (!isEmojiPickerVisible && shouldAutoFocusRef.current) {
      // Emoji keyboard closed - focus text input
      const timer = setTimeout(() => {
        textInputRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
    shouldAutoFocusRef.current = true; // Reset for next time
  }, [isEmojiPickerVisible]);

  // Track cursor position for emoji insertion
  const selectionRef = useRef({ start: 0, end: 0 });

  // Function to filter out numbers and number words
  const filterNumbersAndNumberWords = (text: string): string => {
    // Remove all digits (0-9)
    let filtered = text.replace(/[0-9]/g, '');
    
    // Remove number words (case-insensitive)
    const numberWords = [
      'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
      'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 
      'seventeen', 'eighteen', 'nineteen', 'twenty', 'thirty', 'forty', 'fifty',
      'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'thousand', 'million',
      'billion', 'trillion'
    ];
    
    // Create regex pattern to match number words as whole words
    const numberWordsPattern = new RegExp(
      `\\b(${numberWords.join('|')})\\b`,
      'gi'
    );
    
    // Remove number words, but preserve spaces around them
    // Replace number words with empty string (spaces will remain)
    filtered = filtered.replace(numberWordsPattern, '');
    
    // Only clean up excessive spaces (3+ consecutive spaces) left after removal
    // Preserve single and double spaces that user intentionally types
    filtered = filtered.replace(/\s{3,}/g, '  ');
    
    return filtered;
  };

  // Handle text input change with number filtering
  const handleTextChange = (text: string) => {
    const filteredText = filterNumbersAndNumberWords(text);
    setMessageText(filteredText);
  };

  const handleEmojiSelected = (char: string) => {
    if (char === 'DELETE') {
      // Delete character at cursor position or before cursor
      // Get current text and cursor position BEFORE state update
      const currentText = messageText;
      let { start, end } = selectionRef.current;
      
      // Ensure cursor position is valid and within text bounds
      const textLength = currentText.length;
      if (start < 0) start = 0;
      if (start > textLength) start = textLength;
      if (end < 0) end = 0;
      if (end > textLength) end = textLength;
      if (start > end) {
        const temp = start;
        start = end;
        end = temp;
      }
      
      let newText: string;
      let newCursorPos: number;
      
      if (start === end && start > 0) {
        // Cursor is at a position, delete character before cursor
        // For emojis (which can be 2+ UTF-16 code units), we need to delete the entire emoji
        // Check if the character before cursor is part of a surrogate pair (emoji)
        const charBefore = currentText[start - 1];
        const charCode = charBefore.charCodeAt(0);
        
        // Check if it's a low surrogate (second part of emoji) - range 0xDC00-0xDFFF
        // If it is, check if the character before it is a high surrogate
        if (charCode >= 0xDC00 && charCode <= 0xDFFF && start > 1) {
          const charBefore2 = currentText[start - 2];
          const charCode2 = charBefore2.charCodeAt(0);
          // If previous character is high surrogate, delete both (surrogate pair)
          if (charCode2 >= 0xD800 && charCode2 <= 0xDBFF) {
            newText = currentText.slice(0, start - 2) + currentText.slice(start);
            newCursorPos = start - 2;
          } else {
            // Just a low surrogate without high, delete 1 character
            newText = currentText.slice(0, start - 1) + currentText.slice(start);
            newCursorPos = start - 1;
          }
        } else if (charCode >= 0xD800 && charCode <= 0xDBFF && start > 1) {
          // High surrogate - check if next character is low surrogate
          // If cursor is right after high surrogate, we're in the middle of emoji
          // Delete the high surrogate (1 char) - the low will be handled on next delete
          newText = currentText.slice(0, start - 1) + currentText.slice(start);
          newCursorPos = start - 1;
        } else {
          // Regular character, delete 1 character
          newText = currentText.slice(0, start - 1) + currentText.slice(start);
          newCursorPos = start - 1;
        }
      } else if (start !== end) {
        // Text is selected, delete selected text
        newText = currentText.slice(0, start) + currentText.slice(end);
        newCursorPos = start;
      } else {
        // No cursor position, delete last character (fallback)
        // Check if last character is part of emoji
        if (currentText.length > 0) {
          const lastChar = currentText[currentText.length - 1];
          const charCode = lastChar.charCodeAt(0);
          
          // Check if it's a low surrogate (second part of emoji)
          if (charCode >= 0xDC00 && charCode <= 0xDFFF && currentText.length > 1) {
            const charBefore = currentText[currentText.length - 2];
            const charCode2 = charBefore.charCodeAt(0);
            // If previous character is high surrogate, delete both (surrogate pair)
            if (charCode2 >= 0xD800 && charCode2 <= 0xDBFF) {
              newText = currentText.slice(0, -2);
              newCursorPos = newText.length;
            } else {
              // Just delete the low surrogate
              newText = currentText.slice(0, -1);
              newCursorPos = newText.length;
            }
          } else {
            // Delete last 1 character
            newText = currentText.slice(0, -1);
            newCursorPos = newText.length;
          }
        } else {
          newText = currentText;
          newCursorPos = 0;
        }
      }
      
      // Ensure cursor position is valid
      newCursorPos = Math.max(0, Math.min(newCursorPos, newText.length));
      
      // Update state
      setMessageText(newText);
      
      // Update selectionRef
      selectionRef.current = {
        start: newCursorPos,
        end: newCursorPos,
      };
      
      // Set cursor position after state update
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (textInputRef.current) {
            textInputRef.current.setNativeProps({
              selection: { start: newCursorPos, end: newCursorPos }
            });
            selectionRef.current = {
              start: newCursorPos,
              end: newCursorPos,
            };
          }
        }, 0);
      });
    } else {
      // Insert emoji at cursor position
      // Handle multi-byte emoji characters correctly
      // Get the latest cursor position right before insertion to ensure accuracy
      // This is critical when user moves cursor after opening emoji keyboard
      
      // Ensure emoji is a valid string (handle any encoding issues)
      const emojiChar = String(char);
      
      // Validate emoji is not empty or corrupted
      if (!emojiChar || emojiChar.length === 0) {
        console.warn('Invalid emoji character received:', char);
        return;
      }
      
      // Get current text and cursor position BEFORE state update
      // This ensures we have the most up-to-date values
      const currentText = messageText;
      let { start, end } = selectionRef.current;
      
      // Ensure cursor position is valid and within text bounds
      const textLength = currentText.length;
      if (start < 0) start = 0;
      if (start > textLength) start = textLength;
      if (end < 0) end = 0;
      if (end > textLength) end = textLength;
      if (start > end) {
        const temp = start;
        start = end;
        end = temp;
      }
      
      // Insert emoji at cursor position
      // Use slice to ensure we don't corrupt existing emojis in the text
      const beforeText = currentText.slice(0, start);
      const afterText = currentText.slice(end);
      
      // Build new text by concatenating parts
      const newText = beforeText + emojiChar + afterText;
      
      // Calculate cursor position correctly for emojis
      const emojiCodeUnits = emojiChar.length; // UTF-16 code units
      const newCursorPos = start + emojiCodeUnits;
      
      // Update state with new text
      setMessageText(newText);
      
      // Update selectionRef immediately
      selectionRef.current = {
        start: newCursorPos,
        end: newCursorPos,
      };
      
      // Set cursor position after state update
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (textInputRef.current) {
            const safeCursorPos = Math.min(newCursorPos, newText.length);
            textInputRef.current.setNativeProps({
              selection: { start: safeCursorPos, end: safeCursorPos }
            });
            // Update selectionRef after setting native props
            selectionRef.current = {
              start: safeCursorPos,
              end: safeCursorPos,
            };
          }
        }, 0);
      });
    }
  };

  // ----------------------------------------------------------
  // STEP 1: Get Twilio Token and Initialize Client
  // ----------------------------------------------------------
  useEffect(() => {
    const fetchTwilioToken = async () => {
      try {
        setInitialLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');
        if (!token || !userId) {
          setInitialLoading(false);
          return;
        }

        const response = await fetch(`${MAIN_URL.baseUrl}twilio/auth-token`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (!response.ok) {
          setInitialLoading(false);
          throw new Error(data.message);
        }

      
      // const twillioToken :any = await AsyncStorage.getItem('twillioToken');

      console.log("data",data.data.token);
      
   
        const client = new TwilioChatClient(data.data.token);
        setChatClient(client);
      } catch (err) {
        console.error('Twilio init failed:', err);
        setInitialLoading(false);
      }
    };
    fetchTwilioToken();
  }, []);

  // ----------------------------------------------------------
  // STEP 2: Fetch or Create Conversation
  // ----------------------------------------------------------
  useEffect(() => {

    if (!chatClient) return;

    let isMounted = true;
    // const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const fetchConversation = async () => {
      try {
        //  setLoading(true);  
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');

        const waitForClientConnection = (client: any) =>
          new Promise<void>(resolve => {
            if (client.connectionState === 'connected') return resolve();
            client.on('connectionStateChanged', (state: string) => {
              if (state === 'connected') resolve();
            });
          });

        await waitForClientConnection(chatClient);

        let convName = userConvName;
        let apiData: any = null;
        console.log('source000', source);

        if (source === 'sellerPage') {
          const url = `${MAIN_URL.baseUrl}twilio/conversation-fetch`;
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ feature_id: sellerData.featureId }),
          });

          apiData = await res.json();
          if (res.ok && apiData.data?.conv_name)
            convName = apiData.data.conv_name;

          if (apiData.data == null) {
            console.warn(
              'Conversation create new conversation:',
              apiData.message,
            );
            setInitialLoading(false);
            return;
          }
        }

          console.log("convoppppppppppp",convName);

        let convo;
        try {
          convo = await chatClient.getConversationByUniqueName(convName);
        } catch {
          convo = await chatClient.createConversation({ uniqueName: convName });
        }

        if (!convo) {
          setInitialLoading(false);
          return;
        }

      
        

        const participants = await convo.getParticipants();
        const alreadyJoined = participants.some(
          (p: any) => p.identity === userId,
        );
        if (!alreadyJoined) await convo.join();

        if (!isMounted) return;
        setConversation(convo);
      
        setCheckUser(
          source === 'chatList'
            ? currentUserIdList
            : apiData?.data?.current_user_id || userId,
        );

        const messagesPage = await convo.getMessages();

        const messagesdate = messagesPage.items.map((msg: any) => {
          const createdAt = msg.dateCreated || msg.timestamp; // fallback if dateCreated missing

          return {
            time: new Date(createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            date: new Date(createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
          };
        });

        console.log('date time masg------', messagesdate);

        console.log('messagesPage----------', messagesPage.items);
        setMessagesDateTime(messagesdate);
        console.log("checkUser============______",checkUser);
        
        // Sort messages chronologically (oldest first)
        const sortedInitialMessages = [...messagesPage.items].sort((a, b) => {
          const timeA = new Date(a.dateCreated || a.timestamp).getTime();
          const timeB = new Date(b.dateCreated || b.timestamp).getTime();
          return timeA - timeB; // Oldest first
        });
        setMessages(sortedInitialMessages);
        // Hide loader once messages are loaded
        setInitialLoading(false);
      } catch (err) {
        console.error('Conversation setup failed:', err);
        setInitialLoading(false);
      }
    };

    fetchConversation();

    return () => {
      isMounted = false;
    };
  }, [chatClient]);


 


  // ----------------------------------------------------------
  // STEP 3: Attach Twilio Message Listener (ONLY ONCE)
  // ----------------------------------------------------------
  useEffect(() => {
    if (!conversation) return;

    const handleNewMessage = (m: any) => {
      console.log('New Twilio message:', m.body);
      setMessages(prev => {
        if (prev.find(msg => msg.sid === m.sid)) return prev; // dedup
        // Add new message and sort chronologically (oldest first)
        const updated = [...prev, m];
        return updated.sort((a, b) => {
          const timeA = new Date(a.dateCreated || a.timestamp).getTime();
          const timeB = new Date(b.dateCreated || b.timestamp).getTime();
          return timeA - timeB; // Oldest first
        });
      });
      // Scroll to bottom when new message arrives
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    conversation.on('messageAdded', handleNewMessage);

    return () => {
      console.log(' Cleaning Twilio listener');
      conversation.removeListener('messageAdded', handleNewMessage);
    };
  }, [conversation]);

  // ----------------------------------------------------------
  // STEP 4: Send Message
  // ----------------------------------------------------------
  const handleSendMessage = async () => {
    // Filter numbers and number words before sending
    const filteredMessage = filterNumbersAndNumberWords(messageText.trim());
    
    if (!filteredMessage) {
      // Show alert if message becomes empty after filtering
      Alert.alert('Invalid Message', 'Messages cannot contain numbers or number words.');
      setMessageText(''); // Clear the input
      return;
    }

    if (!messageText.trim()) return;

    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');

      console.log('token', token);

      if (conversation) {
        await conversation.sendMessage(filteredMessage);
        console.log(' Message sent conversation exist:', filteredMessage);
        setMessageText(''); // clear input after send
        return;
      }

      // Case 2️: Conversation not yet created → create now after first message
      console.log(' Creating conversation after first message...');

      const urlCreate = `${MAIN_URL.baseUrl}twilio/conversation-create`;
      const body = { feature_id: sellerData?.featureId };

      const createResponse = await fetch(urlCreate, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const createData = await createResponse.json();
      console.log('conversation-create response:', createData);

      if (!createResponse.ok || !createData?.data?.conv_name) {
        console.error('Failed to create conversation:', createData.message);
        return;
      }

      const convName = createData.data.conv_name;
      setCheckUser(createData.data.current_user_id);
      // setCurrentUserId(convName);

      // Get or create Twilio conversation
      let convo;
      try {
        convo = await chatClient.getConversationByUniqueName(convName);
        console.log('Found Twilio conversation:', convo.sid);
      } catch {
        convo = await chatClient.createConversation({ uniqueName: convName });
        console.log('Created Twilio conversation:', convo.sid);
      }

      // Join conversation
      try {
        await convo.join();
        console.log('Joined new conversation:', convo.sid);
      } catch (err: any) {
        if (err.message?.includes('Conflict')) console.log('Already joined.');
        else console.error('Join failed:', err);
      }

      // Send the pending first message
      await convo.sendMessage(filteredMessage);
      console.log(
        'First message sent after conversation creation:',
        filteredMessage,
      );

      setConversation(convo);
      setMessageText('');
      setMessages(prev => [
        ...prev,
        { body: messageText.trim(), state: { author: userId } },
      ]);
    } catch (error) {
      console.error('Message send failed:', error);
    }
  };

  const getInitials = (firstName = '', lastName = '') =>
    (firstName?.[0] || '') + (lastName?.[0] || '');

  useEffect(() => {
    // Keyboard listeners to get keyboard height
    // On Android, use keyboardDidShow for more reliable height capture (especially on Motorola devices)
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => {
        setKeyboardVisible(true);
        
        // Capture the device's actual keyboard height
        // Try multiple sources for maximum compatibility across devices
        let h = (e && e.endCoordinates && e.endCoordinates.height) || 
                (e && e.startCoordinates && e.startCoordinates.height) || 0;
        
        // On Android, also calculate height from window dimensions change
        // This is more reliable on some devices like Motorola Edge Fusion 60
        if (Platform.OS === 'android') {
          const currentWindowHeight = Dimensions.get('window').height;
          const heightDiff = windowHeightRef.current - currentWindowHeight;
          // If window height decreased significantly, that's likely the keyboard
          // Use the maximum of both methods to ensure accurate height
          if (heightDiff > 100) {
            h = Math.max(h, heightDiff);
            console.log('Keyboard height - event:', (e && e.endCoordinates && e.endCoordinates.height) || 0, 'window diff:', heightDiff, 'using:', h);
          }
          // Update reference for next calculation
          windowHeightRef.current = currentWindowHeight;
        }
        
        setKeyboardHeight(h);
        
        // CRITICAL: Store the keyboard height for emoji keyboard to match device-specific height
        // This ensures emoji picker height matches the exact keyboard height on this device
        // Use the maximum height seen to handle cases where height might change slightly
        if (h > 0) {
          setLastKeyboardHeight(prev => {
            // Use the maximum height to ensure we capture the full keyboard height
            // This is important for devices like Motorola Edge Fusion 60 where height might vary
            const newHeight = Math.max(prev, h);
            if (newHeight !== prev) {
              console.log('Keyboard height captured:', h, 'Max height:', newHeight, 'Device will use this for emoji picker');
            }
            return newHeight;
          });
        }
        
        // On Android, also check height multiple times to ensure we get the final height
        // Some devices (like Motorola Edge Fusion 60) might report height in stages or with slight delays
        if (Platform.OS === 'android' && h > 0) {
          // Check immediately with Keyboard.metrics() for more accurate height
          try {
            const metrics = Keyboard.metrics();
            if (metrics && metrics.height && metrics.height > 0) {
              const metricsHeight = metrics.height;
              setLastKeyboardHeight(prev => {
                // Use the maximum of all methods to ensure accurate height
                const maxHeight = Math.max(prev, h, metricsHeight);
                if (maxHeight !== prev) {
                  console.log('Keyboard height from metrics (immediate):', metricsHeight, 'event:', h, 'Max height:', maxHeight);
                }
                return maxHeight;
              });
            }
          } catch (err) {
            // Keyboard.metrics() might not be available, use event height
            console.log('Keyboard.metrics() not available, using event height:', h);
          }
          
          // First delayed check after 150ms for devices that report height later
          setTimeout(() => {
            try {
              const metrics = Keyboard.metrics();
              if (metrics && metrics.height && metrics.height > 0) {
                const metricsHeight = metrics.height;
                setLastKeyboardHeight(prev => {
                  const maxHeight = Math.max(prev, metricsHeight);
                  if (maxHeight !== prev) {
                    console.log('Keyboard height updated from metrics (150ms):', metricsHeight, 'Max height:', maxHeight);
                  }
                  return maxHeight;
                });
              }
              
              // Also check window dimensions again for final verification
              const currentWindowHeight = Dimensions.get('window').height;
              const heightDiff = windowHeightRef.current - currentWindowHeight;
              if (heightDiff > 100) {
                setLastKeyboardHeight(prev => {
                  const maxHeight = Math.max(prev, heightDiff);
                  if (maxHeight !== prev) {
                    console.log('Keyboard height from window diff (150ms):', heightDiff, 'Max height:', maxHeight);
                  }
                  return maxHeight;
                });
              }
            } catch (err) {
              // Keyboard.metrics() might not be available on all Android versions
            }
          }, 150);
          
          // Final check after 400ms for devices that report height very late (like Motorola Edge Fusion 60)
          setTimeout(() => {
            try {
              const metrics = Keyboard.metrics();
              if (metrics && metrics.height && metrics.height > 0) {
                const metricsHeight = metrics.height;
                setLastKeyboardHeight(prev => {
                  const maxHeight = Math.max(prev, metricsHeight);
                  if (maxHeight !== prev) {
                    console.log('Keyboard height updated from metrics (400ms):', metricsHeight, 'Max height:', maxHeight, 'Device: Motorola Edge Fusion 60');
                  }
                  return maxHeight;
                });
              }
              
              // Final window dimensions check
              const currentWindowHeight = Dimensions.get('window').height;
              const heightDiff = windowHeightRef.current - currentWindowHeight;
              if (heightDiff > 100) {
                setLastKeyboardHeight(prev => {
                  const maxHeight = Math.max(prev, heightDiff);
                  if (maxHeight !== prev) {
                    console.log('Keyboard height from window diff (400ms):', heightDiff, 'Max height:', maxHeight, 'Device: Motorola Edge Fusion 60');
                  }
                  return maxHeight;
                });
              }
            } catch (err) {
              // Keyboard.metrics() might not be available
            }
          }, 400);
        }
        
        // if keyboard opens, close emoji picker
        if (isEmojiPickerVisible) setIsEmojiPickerVisible(false);
      },
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
        
        // Update window height reference when keyboard closes
        // This ensures accurate calculation on next keyboard open
        if (Platform.OS === 'android') {
          setTimeout(() => {
            windowHeightRef.current = Dimensions.get('window').height;
          }, 100);
        }
        
        // Force KeyboardAvoidingView to reset by changing key
        // This ensures padding is fully removed
        setKavKey(prev => prev + 1);
        // Keep lastKeyboardHeight for emoji keyboard sizing
        // No scrolling needed - KeyboardAvoidingView handles natural adjustment
        // FlatList will re-render automatically via extraData prop when keyboardVisible changes
      },
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [isEmojiPickerVisible, setIsEmojiPickerVisible]);
  
  // Force layout recalculation after initial load completes
  useEffect(() => {
    if (!initialLoading && !layoutReady) {
      // Use InteractionManager to ensure layout is ready
      InteractionManager.runAfterInteractions(() => {
        // Small delay to ensure KeyboardAvoidingView has measured layout
        setTimeout(() => {
          setLayoutReady(true);
        }, 100);
      });
    }
  }, [initialLoading, layoutReady]);
  
  // Calculate input bar bottom position
  // When emoji is visible, position above emoji keyboard
  // When text keyboard is visible, KeyboardAvoidingView handles it
  // When neither is visible, add small bottom offset to match keyboard-open spacing
  // KeyboardAvoidingView adds padding when keyboard opens, creating visual space below input bar
  // We add a small offset when closed to match that spacing
  const inputBarBottom = isEmojiPickerVisible 
    ? (lastKeyboardHeight > 0 ? lastKeyboardHeight : EMOJI_PICKER_HEIGHT)
    : (Platform.OS === 'ios' && !keyboardVisible && layoutReady ? 0 : 0); // Small offset to match keyboard-open appearance

  // Removed: Auto-scroll logic - inverted FlatList automatically shows newest messages at bottom
  const [extraPadding] = useState(48); // gap for padding

  //-------------- for set date wise messages -----------------//

  const formatMessageDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const d = new Date(date);

    if (d.toDateString() === today.toDateString()) return 'Today';

    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const buildMessageList = (messages: any[]) => {
    // Sort messages chronologically (oldest first) for normal FlatList
    // This ensures newest messages appear at bottom (oldest at top, newest at bottom)
    const sortedMessages = [...messages].sort((a, b) => {
      const timeA = new Date(a.dateCreated || a.timestamp).getTime();
      const timeB = new Date(b.dateCreated || b.timestamp).getTime();
      return timeA - timeB; // Oldest first
    });

    let grouped: any[] = [];
    let lastDate: string | null = null;

    sortedMessages.forEach((msg, index) => {
      const created = msg.dateCreated || msg.timestamp;
      const dateLabel = formatMessageDate(new Date(created));

      if (lastDate !== dateLabel) {
        grouped.push({ type: 'date', date: dateLabel, sid: `date-${dateLabel}-${index}` });
        lastDate = dateLabel;
      }

      grouped.push({ type: 'message', data: msg, sid: msg.sid || `msg-${index}` });
    });

    return grouped;
  };

  const groupedMessages = React.useMemo(
    () => buildMessageList(messages),
    [messages]
  );

  // Find the last message index (not date) for adding bottom padding
  const lastMessageIndex = React.useMemo(() => {
    for (let i = groupedMessages.length - 1; i >= 0; i--) {
      if (groupedMessages[i]?.type === "message") {
        return i;
      }
    }
    return -1;
  }, [groupedMessages]);

  // Memoize content container style to ensure padding is applied on initial load
  // Include bottom padding that adjusts for keyboard/emoji picker state
  // Since emoji keyboard works when we manually add height, we do the same for text keyboard
  const contentContainerStyle = React.useMemo(() => {
    const BASE_SPACING = 20;
    let paddingBottom = INPUT_BAR_HEIGHT + BASE_SPACING;
    
    if (keyboardVisible && !isEmojiPickerVisible) {
      // Text keyboard is open - add keyboard height to padding
      // This ensures messages are visible above the keyboard (same approach as emoji picker)
      paddingBottom = INPUT_BAR_HEIGHT + keyboardHeight + BASE_SPACING;
    } else if (isEmojiPickerVisible) {
      // Emoji picker is visible - add emoji picker height
      paddingBottom = INPUT_BAR_HEIGHT + EMOJI_PICKER_HEIGHT + BASE_SPACING;
    }
    
    return {
      paddingTop: Platform.OS === 'ios' ? 160 : 150, // Header space at top
      paddingBottom: paddingBottom, // Dynamic bottom padding for keyboard/emoji
      flexGrow: 1, // Ensure content takes full space
    };
  }, [keyboardVisible, isEmojiPickerVisible, keyboardHeight, EMOJI_PICKER_HEIGHT]);

  // Scroll to bottom on initial load only - to show last message
  // Enhanced for smaller/older devices like Realme 2 Pro
  useEffect(() => {
    if (groupedMessages.length > 0 && !initialLoading && flatListRef.current) {
      // Use InteractionManager to ensure layout is complete
      InteractionManager.runAfterInteractions(() => {
        // Multiple scroll attempts with increasing delays for device compatibility
        const scrollToBottom = () => {
          if (flatListRef.current) {
            // Try scrollToEnd first
            flatListRef.current.scrollToEnd({ animated: false });
            
            // Fallback: Try scrollToIndex with last index after a delay
            setTimeout(() => {
              if (flatListRef.current && lastMessageIndex >= 0) {
                try {
                  flatListRef.current.scrollToIndex({ 
                    index: lastMessageIndex, 
                    animated: false,
                    viewPosition: 1 // Position at bottom of viewport
                  });
                } catch (e) {
                  // If scrollToIndex fails, use scrollToEnd as fallback
                  flatListRef.current?.scrollToEnd({ animated: false });
                }
              }
            }, 100);
          }
        };
        
        // Immediate attempt
        scrollToBottom();
        
        // Reset scrollY and initial position when at bottom
        scrollY.value = 0;
        initialScrollY.current = null;
        
        // Additional attempts for slower/smaller devices
        setTimeout(() => {
          scrollToBottom();
          scrollY.value = 0;
          initialScrollY.current = null;
        }, 200);
        setTimeout(() => {
          scrollToBottom();
          scrollY.value = 0;
          initialScrollY.current = null;
        }, 500);
        setTimeout(() => {
          scrollToBottom();
          scrollY.value = 0;
          initialScrollY.current = null;
        }, 800); // Extra delay for Realme 2 Pro
      });
    }
  }, [initialLoading, groupedMessages.length, lastMessageIndex]); // Added dependencies

  // Scroll to bottom when text keyboard opens to ensure last message is visible
  useEffect(() => {
    if (keyboardVisible && !isEmojiPickerVisible && flatListRef.current && groupedMessages.length > 0) {
      // Use InteractionManager to ensure layout is complete
      InteractionManager.runAfterInteractions(() => {
        // Multiple attempts with delays to ensure scroll works on all devices
        const scrollToBottom = () => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
            scrollY.value = 0;
            initialScrollY.current = null;
          }
        };
        
        // Immediate attempt
        scrollToBottom();
        
        // Additional attempts for devices that need more time
        setTimeout(() => scrollToBottom(), 100);
        setTimeout(() => scrollToBottom(), 300);
      });
    }
  }, [keyboardVisible, isEmojiPickerVisible, groupedMessages.length]);

  // Removed: Scroll on keyboard open/close - let KeyboardAvoidingView handle natural adjustment like WhatsApp
  // The marginBottom on last message will adjust automatically via extraData re-render

  // const groupedMessages = buildMessageList(messages);

  console.log('groupedMessages=========', groupedMessages);

  // Show Lottie loader until data is loaded
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
        {/* Overlay to hide watermark - covers bottom area where watermarks typically appear */}
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
        {/* Cover right side if watermark is in bottom-right corner */}
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
    <ImageBackground source={bgImage} style={{ flex: 1 }} resizeMode="cover">
      <View style={{ flex: 1 }}>
        <Animated.View
          style={[styles.headerWrapper, animatedBlurStyle]}
          pointerEvents="none"
        >
          <MaskedView
            style={StyleSheet.absoluteFill}
            maskElement={
              <LinearGradient
                colors={['rgba(0,0,0,1)', 'rgba(0,0,0,0)']}
                locations={[0, 0.8]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            }
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType={Platform.OS === 'ios' ? 'prominent' : 'light'}
              blurAmount={Platform.OS === 'ios' ? 45 : 45}
              overlayColor="rgba(255,255,255,0.05)"
              reducedTransparencyFallbackColor="rgba(255,255,255,0.05)"
            />
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.45)',
                'rgba(255, 255, 255, 0.02)',
                'rgba(255, 255, 255, 0.02)',
              ]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </MaskedView>
        </Animated.View>

        <View style={styles.messageHeader} pointerEvents="box-none">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={back}
              resizeMode="contain"
              style={styles.backIconStyle}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}
            // onPress={() => navigation.navigate('UserProfileScreen')}

             onPress={() => {
              navigation.navigate('UserProfileScreen', {
                animation: 'none',              
                members: members,
                source: 'chatList',
              });
            }}
          >
            {source === 'chatList' ? (
              members?.profile ? (
                <Image
                  source={{ uri: members?.profile }}
            
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.initialsCircle}>
                  <Text allowFontScaling={false} style={styles.initialsText}>
                    {getInitials(
                      members?.firstname ?? 'A',
                      members?.lastname ?? 'W',
                    )}
                  </Text>
                </View>
              )
            ) : sellerData?.profile ? (
              <Image
                source={{ uri: sellerData?.profile }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.initialsCircle}>
                <Text allowFontScaling={false} style={styles.initialsText}>
                  {getInitials(
                    members?.firstname ?? 'A',
                    members?.lastname ?? 'W',
                  )}
                </Text>
              </View>
            )}

            <View >
              <Text allowFontScaling={false} style={styles.studentName}>
                {source === 'chatList'
                  ? members?.firstname
                  : sellerData.firstname}{' '}
                {source === 'chatList' ? members?.lastname : sellerData.lastname}
              </Text>
              <Text allowFontScaling={false} style={styles.universityName} numberOfLines={0}>
                {members?.university?.name ? members?.university.name : '-'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

      <KeyboardAvoidingView
        key={kavKey}
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        enabled={!isEmojiPickerVisible}
      >
        <View 
          style={{ flex: 1 }}
          onLayout={() => {
            // Force layout recalculation on initial mount
            if (!layoutReady && !initialLoading) {
              // Use a small delay to ensure KeyboardAvoidingView has measured
              setTimeout(() => {
                setLayoutReady(true);
                
                // Scroll to bottom when layout is ready (important for smaller devices)
                if (flatListRef.current && groupedMessages.length > 0) {
                  setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: false });
                    // Reset scrollY when at bottom
                    scrollY.value = 0;
                    initialScrollY.current = null;
                  }, 150);
                }
              }, 50);
            }
            
            // Also scroll when layout changes (for device rotation, etc.)
            if (layoutReady && flatListRef.current && groupedMessages.length > 0 && !keyboardVisible) {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
                // Reset scrollY when at bottom
                scrollY.value = 0;
                initialScrollY.current = null;
              }, 100);
            }
          }}
        >
          <Animated.FlatList
            data={groupedMessages}
            extraData={[keyboardVisible, isEmojiPickerVisible, lastMessageIndex, lastKeyboardHeight]} // Force re-render when keyboard/emoji state or keyboard height changes
            keyExtractor={(item, index) => item.sid || item.data?.sid || `item-${index}`}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            scrollEnabled={!isEmojiPickerVisible} // Disable scrolling when emoji keyboard is open
            onScrollToIndexFailed={(info) => {
              // Fallback to scrollToEnd if scrollToIndex fails
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
              }, 100);
            }}
            renderItem={({ item, index }) => {
              const isLastMessage = index === lastMessageIndex;
              // Calculate bottom padding for SAME HEIGHT across all three states:
              // 1. Default (no keyboard): INPUT_BAR_HEIGHT + spacing
              // 2. Text keyboard open: INPUT_BAR_HEIGHT + spacing (KeyboardAvoidingView handles keyboard push)
              // 3. Emoji picker visible: INPUT_BAR_HEIGHT + EMOJI_PICKER_HEIGHT + spacing
              // 
              // Key insight: When text keyboard is open, KeyboardAvoidingView already pushes content up by keyboardHeight
              // So we only need INPUT_BAR_HEIGHT + spacing for marginBottom
              // When emoji picker is visible, we need to add EMOJI_PICKER_HEIGHT to match the keyboard height
              // EMOJI_PICKER_HEIGHT should equal keyboardHeight for consistent appearance
              
              const BASE_SPACING = 20;
              
              let bottomPadding;
              
              if (keyboardVisible && !isEmojiPickerVisible) {
                // Text keyboard is open - KeyboardAvoidingView handles the push
                // We only need input bar + spacing (same as default state)
                bottomPadding = INPUT_BAR_HEIGHT + BASE_SPACING;
              } else if (isEmojiPickerVisible) {
                // Emoji picker is visible - add emoji picker height to match keyboard height
                // EMOJI_PICKER_HEIGHT should equal keyboardHeight for same visual height
                bottomPadding = INPUT_BAR_HEIGHT + EMOJI_PICKER_HEIGHT + BASE_SPACING;
              } else {
                // Default state (no keyboard) - just input bar + spacing
                bottomPadding = INPUT_BAR_HEIGHT + BASE_SPACING;
              }
              
              return (
              <>
               

                {item?.type === "date" ? (
  <View style={{ alignItems: "center", marginVertical: 10 }}>
    <Text  style={{
                        color: '#FFFFFF7A',
                        backgroundColor: '#00000029',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        fontSize: 10,
                        fontFamily: 'Urbanist-Medium',
                        marginVertical: 10,
                      }}>
      {item?.date}
    </Text>
  </View>
) : (
  <View
    style={[
      styles.messageContainer,
      item?.data?.state?.author == checkUser
        ? styles.rightAlign
        : styles.leftAlign,
      isLastMessage && { marginBottom: bottomPadding },
    ]}
  >
    <View
      style={
        item?.data?.state?.author === checkUser
          ? styles.rightBubbleWrapper
          : styles.leftBubbleWrapper
      }
    >
      {/* Bubble arrow - LEFT */}
      {item?.data?.state?.author != checkUser && (
        <View
          style={{
            width: 0,
            height: 0,
            borderTopWidth: 8,
            borderTopColor: "transparent",
            borderRightWidth: 9,
            borderRightColor: "#FFFFFF1F",
            borderBottomWidth: 8,
            borderBottomColor: "transparent",
            alignSelf: "flex-start",
            marginRight: 0,
            marginTop: 4,
          }}
        />
      )}

      {/* Actual Chat Bubble */}
      <View
        style={[
          styles.bubble,
          item?.data?.state?.author == checkUser
            ? styles.rightBubble
            : styles.leftBubble,
        ]}
      >
        <Text allowFontScaling={false} style={styles.messageText}>
          {item?.data?.state?.body}
        </Text>
      </View>

      {/* Bubble arrow - RIGHT */}
      {item?.data?.state?.author == checkUser && (
        <View
          style={{
            width: 0,
            height: 0,
            borderTopWidth: 8,
            borderTopColor: "transparent",
            borderLeftWidth: 9,
            borderLeftColor: "#0000001F",
            borderBottomWidth: 8,
            borderBottomColor: "transparent",
            alignSelf: "flex-start",
            marginLeft: 0,
            marginTop: 4,
          }}
        />
      )}
    </View>
  </View>
)}
              </>
            );
            }}
            ref={flatListRef}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              // Scroll to bottom when content size changes (to show last message)
              if (flatListRef.current && groupedMessages.length > 0) {
                // Use requestAnimationFrame for better timing on all devices
                requestAnimationFrame(() => {
                  setTimeout(() => {
                    if (flatListRef.current) {
                      // Try scrollToEnd
                      flatListRef.current.scrollToEnd({ animated: false });
                      
                      // Reset scrollY when at bottom to prevent blur from showing
                      scrollY.value = 0;
                      // Reset initial scroll position when content changes
                      initialScrollY.current = null;
                      
                      // Fallback for smaller devices
                      setTimeout(() => {
                        if (flatListRef.current && lastMessageIndex >= 0) {
                          try {
                            flatListRef.current.scrollToIndex({ 
                              index: lastMessageIndex, 
                              animated: false,
                              viewPosition: 1
                            });
                            // Reset scrollY after scrollToIndex
                            scrollY.value = 0;
                            initialScrollY.current = null;
                          } catch (e) {
                            flatListRef.current?.scrollToEnd({ animated: false });
                            scrollY.value = 0;
                            initialScrollY.current = null;
                          }
                        }
                      }, 50);
                    }
                  }, 50);
                });
              }
            }}
            contentContainerStyle={contentContainerStyle}
            showsVerticalScrollIndicator={false}
          />

          {/* Touchable overlay to close emoji keyboard when tapping outside */}
          {isEmojiPickerVisible && (
            <Pressable
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: EMOJI_PICKER_HEIGHT + INPUT_BAR_HEIGHT,
                zIndex: 998,
                backgroundColor: 'transparent', // Transparent but still captures taps
              }}
              onPress={() => {
                setIsEmojiPickerVisible(false);
              }}
            />
          )}

          {/* EMOJI PICKER PANEL - instant appearance, no animation */}
          {isEmojiPickerVisible && (
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: EMOJI_PICKER_HEIGHT,
                backgroundColor: '#FFFFFF',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                zIndex: 999,
                // NO transform/translateY - instant appearance
              }}
              {...panResponder.panHandlers}
              // Prevent navigation gestures when emoji keyboard is open
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderTerminationRequest={() => false}
            >
              <View style={{ flex: 1 }}>
                <EmojiKeyboard
                  onEmojiSelected={emoji => {
                    handleEmojiSelected(emoji);
                  }}
                />
              </View>
            </View>
          )}

          {/* Input Bar - ALWAYS above keyboard or emoji panel */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: inputBarBottom,
              paddingHorizontal: 16,
              paddingTop: Platform.OS === 'ios' ? 10 : 8,
              paddingBottom: Platform.OS === 'ios' ? 10 : 8,
              // Footer spacing will be handled by a spacer element below
              backgroundColor: 'transparent',
              zIndex: 1000,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
              }}
            >
              {/* Input bubble */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
                  borderRadius: 40,
                  paddingHorizontal: 16,
                  paddingVertical: 4,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <BlurView
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 40,
                  }}
                  blurType="light"
                  blurAmount={5}
                  reducedTransparencyFallbackColor="#ffffff34"
                />
                {/* Emoji/Keyboard toggle button - WhatsApp style */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    console.log('Emoji button clicked, isEmojiPickerVisible:', isEmojiPickerVisible, 'keyboardVisible:', keyboardVisible);
                    if (isEmojiPickerVisible) {
                      // Currently showing emoji keyboard - switch to text keyboard
                      shouldAutoFocusRef.current = true; // Allow auto-focus
                      isOpeningEmojiRef.current = false; // Not opening emoji
                      setIsEmojiPickerVisible(false);
                      // Focus text input to show keyboard and cursor
                      setTimeout(() => {
                        textInputRef.current?.blur();
                        setTimeout(() => {
                          textInputRef.current?.focus();
                        }, 50);
                      }, 150);
                    } else {
                      // Currently showing text keyboard or no keyboard - switch to emoji keyboard
                      console.log('Opening emoji keyboard...', { keyboardVisible, isEmojiPickerVisible });
                      
                      // Set flags first
                      shouldAutoFocusRef.current = false; // Prevent auto-focus
                      isOpeningEmojiRef.current = true; // Mark that we're opening emoji keyboard
                      
                      if (keyboardVisible) {
                        // Dismiss text keyboard first, then show emoji picker
                        console.log('Dismissing keyboard first...');
                        Keyboard.dismiss();
                        setTimeout(() => {
                          console.log('Setting emoji picker visible to true (after keyboard dismiss)');
                          setIsEmojiPickerVisible(true);
                          // Focus input after emoji picker is shown
                          setTimeout(() => {
                            if (textInputRef.current) {
                              textInputRef.current.focus();
                            }
                            // Reset flag after delay to prevent onFocus from closing emoji
                            setTimeout(() => {
                              isOpeningEmojiRef.current = false;
                              console.log('Emoji keyboard visible, flag reset');
                            }, 600);
                          }, 300);
                        }, 400);
                      } else {
                        // No keyboard visible - show emoji keyboard immediately
                        console.log('Setting emoji picker visible to true (no keyboard) - IMMEDIATE');
                        // Set state immediately - no delays
                        setIsEmojiPickerVisible(true);
                        console.log('State set to true, should render emoji picker now');
                        // Focus input after short delay to keep cursor visible
                        setTimeout(() => {
                          if (textInputRef.current) {
                            textInputRef.current.focus();
                            console.log('Text input focused');
                          }
                          // Reset flag after delay to prevent onFocus from closing emoji
                          setTimeout(() => {
                            isOpeningEmojiRef.current = false;
                            console.log('Emoji keyboard visible (no keyboard), flag reset');
                          }, 600);
                        }, 200);
                      }
                    }
                  }}
                  style={{ marginRight: 8 }}
                >
                  {isEmojiPickerVisible ? (
                    // Show keyboard icon when emoji keyboard is visible (like WhatsApp)
                    <MaterialIcons
                      name="keyboard"
                      size={24}
                      color="#fff"
                    />
                  ) : (
                    // Show smiley icon when text keyboard is visible or no keyboard
                    <Image
                      source={smileyhappy}
                      style={{ width: 24, height: 24, tintColor: '#fff' }}
                    />
                  )}
                </TouchableOpacity>

                <View
                  style={{
                    width: 1,
                    height: 20,
                    backgroundColor: '#FFFFFF80',
                    marginHorizontal: 6,
                  }}
                />

                {/* Text input */}
                <TextInput
                  ref={textInputRef}
                  allowFontScaling={false}
                  style={{
                    flex: 1,
                    color: '#fff',
                    fontFamily: 'Urbanist-Medium',
                    fontSize: 17,
                  }}
                  placeholder="Message"
                  placeholderTextColor="#ccc"
                  onChangeText={handleTextChange}
                  value={messageText}
                  showSoftInputOnFocus={!isEmojiPickerVisible} // Don't show keyboard when emoji picker is visible
                  onSelectionChange={(e) => {
                    // Track cursor position for emoji insertion
                    // Always update to get the latest cursor position
                    // This is critical when user moves cursor, especially with emoji keyboard open
                    const newStart = e.nativeEvent.selection.start;
                    const newEnd = e.nativeEvent.selection.end;
                    
                    // Validate selection is within text bounds
                    const textLength = messageText.length;
                    const safeStart = Math.max(0, Math.min(newStart, textLength));
                    const safeEnd = Math.max(0, Math.min(newEnd, textLength));
                    
                    selectionRef.current = {
                      start: safeStart,
                      end: safeEnd,
                    };
                  }}
                  onFocus={() => {
                    // When user taps on text input, hide emoji keyboard and show text keyboard
                    // This matches WhatsApp behavior - tapping input always shows text keyboard
                    // Add a longer delay to check flags to prevent race conditions when opening emoji
                    setTimeout(() => {
                      // Only close emoji picker if:
                      // 1. Emoji picker is visible
                      // 2. shouldAutoFocusRef is true (user tapped, not programmatic)
                      // 3. We're not in the process of opening emoji keyboard
                      console.log('onFocus triggered:', { isEmojiPickerVisible, shouldAutoFocus: shouldAutoFocusRef.current, isOpeningEmoji: isOpeningEmojiRef.current });
                      if (isEmojiPickerVisible && shouldAutoFocusRef.current && !isOpeningEmojiRef.current) {
                        console.log('Closing emoji picker from onFocus');
                        setIsEmojiPickerVisible(false);
                        // Focus will automatically show keyboard after emoji picker closes
                        // Ensure keyboard shows
                        setTimeout(() => {
                          if (textInputRef.current) {
                            textInputRef.current.focus();
                          }
                        }, 100);
                      } else {
                        console.log('Not closing emoji picker - flags prevent it');
                      }
                    }, 200);
                  }}
                />
              </View>

              {/* Send */}
              <TouchableOpacity
                onPress={handleSendMessage}
                style={{
                  marginLeft: 8,
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  overflow: 'hidden',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <BlurView
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 24,
                  }}
                  blurType="light"
                  blurAmount={10}
                  reducedTransparencyFallbackColor="#ffffff66"
                />
                <Image
                  source={require('../../../assets/images/sendmessage.png')}
                  style={{ width: 22, height: 22, tintColor: '#fff', zIndex: 1 }}
                />
              </TouchableOpacity>
            </View>
            {/* Footer spacer - ensures consistent bottom spacing in all states */}
            <View 
              style={{
                height: Platform.OS === 'ios' ? 10 : 8,
                width: '100%',
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );

};

export default MessagesIndividualScreen;

const styles = StyleSheet.create({
  // Bubble wrappers with tails
  leftBubbleWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  rightBubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,

    // position: 'relative',
  },
  leftTailContainer: {
    position: 'absolute',
    left: -8,
    bottom: 0,
  },
  rightTailContainer: {
    position: 'absolute',
    right: -8,
    bottom: 0,
  },

  // Original styles
  sendIconContainer: {
    padding: 12,
    borderRadius: 40,
    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.21) inset -1px 0px 5px 1px',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  sendIcon: {
    width: 20,
    height: 20,
  },
  // bottomContainer: {
  //   bottom: Platform.OS === 'ios' ? 200 : 100,
  //   display: 'flex',
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   gap: 5,
  //   paddingHorizontal: 20,
  //   //marginBottom:40
  // },
  //   bottomContainer: {
  //   position: 'absolute',
  //   bottom: 0,
  //   left: 0,
  //   right: 0,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingHorizontal: 20,
  //   paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  //   backgroundColor: 'rgba(255,255,255,0.15)',
  //   borderTopWidth: 0.5,
  //   borderTopColor: '#ffffff3a',
  // },

  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderTopWidth: 0.5,
    borderTopColor: '#ffffff3a',
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
  searchBar: {
    fontFamily: 'Urbanist-Medium',
    marginLeft: 5,
    fontWeight: '500',
    fontSize: 17,
    color: '#fff',
    width: '70%',
  },
  universityName: {
    fontSize: 12,
    fontFamily: 'Urbanist-Medium',
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 2,
    maxWidth:'90%'
  },
  backIconStyle: {
    width: 30,
    height: 30,
  },
  studentName: {
    color: '#ffffff',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 2,
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
  messageHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 12,
    gap: 10,
    zIndex: 11,
    pointerEvents: 'box-none',
  },
  messageViewContainer: {
    paddingHorizontal: 16,
    width: '100%',
    height: '100%',
    paddingBottom: Platform.OS === 'ios' ? 205 : 155,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 100,
  },
  chatContainer: {
    justifyContent: 'flex-start',
  },
  messageContainer: {
    // marginBottom: 50,
    paddingHorizontal: 6,
    // gap: 10,
  },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginVertical: 0,
    maxWidth: '75%',
  },
  leftAlign: {
    alignItems: 'flex-start',
    gap: 6,
  },
  rightAlign: {
    alignItems: 'flex-end',
    gap: 6,
  },
  leftBubble: {
    backgroundColor: '#2466c75e',
    borderRadius: 4,
  },
  rightBubble: {
    backgroundColor: '#0000001F',
    borderRadius: 4,
  },
  messageText: {
    fontFamily: 'Urbanist-Medium',
    color: '#FFFFFFE0',
    fontSize: 16,  // before 14,
    lineHeight: 17,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },

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

  container: {
    flex: 1,
    backgroundColor: '#1E2B63',
    paddingTop: 50,
    alignItems: 'center',
  },
  headerText: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 10,
  },
  selectedText: {
    color: '#FFD700',
    fontSize: 30,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    width: '80%',
    backgroundColor: '#ffffff5f',
    marginBottom: 20,
  },

  emojiItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  row: {
    justifyContent: 'space-around',
  },
  emojiButton: {
    // Adjust these to suit your layout; they ensure the area is clickable
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%', // Take up the full height of search_container
  },
  mainContainer: {
    width: '100%',
    // Make the container stick to the bottom
    position: 'absolute',
    //  bottom: -400,
    // The total height must cover the keyboard height + input bar height
    // height:  80, // e.g., 80 is the height of your input bar
    // overflow: 'hidden', // Ensures the keyboard is clipped when off-screen
  },
});