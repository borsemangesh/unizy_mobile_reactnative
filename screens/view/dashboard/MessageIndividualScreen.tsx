import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { ClipPath, Defs, Rect } from 'react-native-svg';
import { MAIN_URL } from '../../utils/APIConstant';
import { Client as TwilioChatClient } from '@twilio/conversations';
import { RouteProp, useRoute } from '@react-navigation/native';
import EmojiKeyboard from '../emoji/emojiKebord';



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



// const MessagesIndividualScreen = ({ navigation }: MessagesIndividualScreenProps) => {
//   // const [photo, setPhoto] = useState<string | null>(null);

// };

type RouteParams = {
  source?: 'chatList' | 'sellerPage';
  members: {
    firstname: string;
    lastname: string;
    id: number;
    profile: string | null;
    universityName: string;
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

  const [chatMeta, setchatMeta] = useState<chatMeta>({
    author: '',
    body: '',
    createdAt: null,
  });

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


  const { width, height } = Dimensions.get('window');
  const keyboardHeight = height * 0.35; // Must match the height defined in styles.emojiPickerContainer
    const animatedValue = useRef(new Animated.Value(0)).current; 
const flatListRef = useRef<FlatList>(null);


  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isEmojiPickerVisible ? 0 : keyboardHeight,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isEmojiPickerVisible]);

  const handleEmojiPress = () => {
    setIsEmojiPickerVisible(prev => !prev);
    Keyboard.dismiss();
  };

  const handleEmojiSelected = (char: string) => {
    setMessageText(prevText => prevText + char);
  };

  // ----------------------------------------------------------
  // STEP 1: Get Twilio Token and Initialize Client
  // ----------------------------------------------------------
  useEffect(() => {
    const fetchTwilioToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');
        if (!token || !userId) return;

        const response = await fetch(`${MAIN_URL.baseUrl}twilio/auth-token`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        const client = new TwilioChatClient(data.data.token);
        setChatClient(client);
      } catch (err) {
        console.error('Twilio init failed:', err);
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
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const fetchConversation = async () => {
      try {
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
        console.log("source000",source);
        

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
          if (res.ok && apiData.data?.conv_name) convName = apiData.data.conv_name;

             if (apiData.data == null) {
            console.warn('Conversation create new conversation:', apiData.message);
            return;
          }
        }

        let convo;
        try {
          convo = await chatClient.getConversationByUniqueName(convName);
        } catch {
          convo = await chatClient.createConversation({ uniqueName: convName });
        }

        if (!convo) return;

        const participants = await convo.getParticipants();
        const alreadyJoined = participants.some((p: any) => p.identity === userId);
        if (!alreadyJoined) await convo.join();

        if (!isMounted) return;
        setConversation(convo);
        setCheckUser(
          source === 'chatList'
            ? currentUserIdList
            : apiData?.data?.current_user_id || userId,
        );

        const messagesPage = await convo.getMessages();

        const messagesdate = messagesPage.items.map((msg:any) => {
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

console.log("date time masg------",messagesdate);

        console.log("messagesPage----------",messagesPage);
        setMessagesDateTime(messagesdate)
        
        setMessages(messagesPage.items);
      } catch (err) {
        console.error('Conversation setup failed:', err);
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
        return [...prev, m];
      });
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
    // if (!conversation || !messageText.trim()) return;
    // try {
    //   await conversation.sendMessage(messageText.trim());
    //   setMessageText('');
    // } catch (err) {
    //   console.error('Send failed:', err);
    // }

     try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');

      console.log('token', token);

      if (conversation) {
        await conversation.sendMessage(messageText.trim());
        console.log(' Message sent conversation exist:', messageText);
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
      await convo.sendMessage(messageText.trim());
      console.log(
        'First message sent after conversation creation:',
        messageText,
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

  

   

  return (
    <ImageBackground source={bgImage} style={{ flex: 1 }} resizeMode="cover">
      <View style={styles.messageHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={back}
            resizeMode="contain"
            style={styles.backIconStyle}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}
          onPress={() => navigation.navigate('UserProfileScreen')}
        >
          {/* <Image source={profileImage} style={styles.profileImage} /> */}

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

          <View>
            <Text allowFontScaling={false} style={styles.studentName}>
              {source === 'chatList'
                ? members?.firstname
                : sellerData.firstname}{' '}
              {source === 'chatList' ? members?.lastname : sellerData.lastname}
            </Text>
            <Text allowFontScaling={false} style={styles.universityName}>
              {members?.universityName ? members?.universityName : '-'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ flex: 1 }}
      >
        {/* Main Chat Container */}
        <View style={{ flex: 1 }}>
          {/* Chat Messages */}
          {/* <View>{messagesDateTime[0].date}</View> */}
          <FlatList
            data={messages}
            keyExtractor={item => item.sid}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageContainer,
                  item.state.author == checkUser
                    ? styles.rightAlign
                    : styles.leftAlign,
                ]}
              >
                <View
                  style={
                    item.state.author === checkUser
                      ? styles.rightBubbleWrapper
                      : styles.leftBubbleWrapper
                  }
                >
                  {item.state.author != checkUser && (
                    <View
                      style={{
                        width: 0,
                        height: 0,
                        borderTopWidth: 8,
                        borderTopColor: 'transparent',
                        borderRightWidth: 9,
                        borderRightColor: '#FFFFFF1F',
                        borderBottomWidth: 8,
                        borderBottomColor: 'transparent',
                        alignSelf: 'flex-start',
                        marginRight: 0,
                        marginTop: 4,
                      }}
                    />
                  )}

                  <View
                    style={[
                      styles.bubble,
                      item.state.author == checkUser
                        ? styles.rightBubble
                        : styles.leftBubble,
                    ]}
                  >
                    <Text allowFontScaling={false} style={styles.messageText}>
                      {item.body}
                    </Text>
                  </View>

                  {item.state.author == checkUser && (    
                    <View
                      style={{
                        width: 0,
                        height: 0,
                        borderTopWidth: 8,
                        borderTopColor: 'transparent',
                        borderLeftWidth: 9,
                        borderLeftColor: '#0000001F',
                        borderBottomWidth: 8,
                        borderBottomColor: 'transparent',
                        alignSelf: 'flex-start',
                        marginLeft: 0,
                        marginTop: 4,
                      }}
                    />
                  )}
                </View>
              </View>
            )}
            ref={flatListRef}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            contentContainerStyle={{ paddingBottom: 90 }} // space for input
            showsVerticalScrollIndicator={false}
          />

          {/* Emoji Keyboard */}
          {isEmojiPickerVisible && (
            <View
              style={{
                position: 'absolute',
                bottom: 60,
                left: 0,
                right: 0,
                backgroundColor: '#34478dff',
                height: Dimensions.get('window').height * 0.35,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                zIndex: 999,
                paddingVertical: 10,
              }}
            >
              <EmojiKeyboard onEmojiSelected={handleEmojiSelected} />
            </View>
          )}

          {/* <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.15)",
        borderTopWidth: 0.5,
        borderTopColor: "#ffffff3a",
        paddingVertical: Platform.OS === "ios" ? 10 : 8,
        paddingHorizontal: 12,
      }}
    >
     
      <TouchableOpacity
        onPress={handleEmojiPress}
        activeOpacity={0.7}
        style={{   
          padding: 6,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={smileyhappy}
          style={{
            width: 24,
            height: 24,
            tintColor: "#fff",
          }}
        />
      </TouchableOpacity>


      <View
        style={{
          height: 20,
          width: 1,
          backgroundColor: "#ffffff5f",
          marginHorizontal: 10,
        }}
      />

    
      <TextInput
        allowFontScaling={false}
        style={{
          flex: 1,
          color: "#fff",
          fontSize: 16,
          fontFamily: "Urbanist-Medium",
          paddingVertical: Platform.OS === "ios" ? 8 : 4,
        }}
        placeholder="Type a message..."
        placeholderTextColor="#ccc"
        onChangeText={setMessageText}
        value={messageText}
        onFocus={() => setIsEmojiPickerVisible(false)}
      />

   
      <TouchableOpacity
        onPress={handleSendMessage}
        activeOpacity={0.7}
        style={{
          backgroundColor: "rgba(255,255,255,0.25)",
          borderRadius: 50,
          padding: 10,
          marginLeft: 8,
        }}
      >
        <Image
          source={require("../../../assets/images/sendmessage.png")}
          style={{
            width: 22,
            height: 22,
            tintColor: "#fff",
          }}
        />
      </TouchableOpacity>
    </View> */}

          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              paddingVertical: Platform.OS === 'ios' ? 10 : 8,
              paddingHorizontal: 16,
            }}
          >
            {/* Message Input Container */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '85%',
                height: '100%',
                // backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 40,
                paddingHorizontal: 16,
                paddingVertical: 16,
                gap: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.42)',
               
              }}
            >
              {/* Emoji Button */}
              <TouchableOpacity
                onPress={handleEmojiPress}
                activeOpacity={0.7}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 24,
                  height: 24,
                }}
              >
                <Image
                  source={smileyhappy}
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: '#fff',
                  }}
                />
              </TouchableOpacity>

              <View
                style={{
                  width: 1,
                  height: 20,
                  backgroundColor: '#FFFFFF80',
                  marginHorizontal: 6,
                }}
              />

              {/* Text Input */}
              <TextInput
                allowFontScaling={false}
                style={{
                  flex: 1,
                  color: '#fff',
                  fontSize: 16,
                  fontFamily: 'Urbanist-Medium',
                  paddingVertical: 0,
                }}
                placeholder="Message"
                placeholderTextColor="#ccc"
                onChangeText={setMessageText}
                value={messageText}
                onFocus={() => setIsEmojiPickerVisible(false)}
              />
            </View>

            {/* Send Button */}
            <TouchableOpacity
              onPress={handleSendMessage}
              activeOpacity={0.8}
              style={{
                width: 48,
                height: 48,
                borderRadius: 40,
                // backgroundColor: 'rgba(255,255,255,0.25)',
                 backgroundColor: 'rgba(255, 255, 255, 0.36)',
                
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 8,
              }}
            >
              <Image
                source={require('../../../assets/images/sendmessage.png')}
                style={{
                  width: 22,
                  height: 22,
                  tintColor: '#fff',
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  },
  messageHeader: {
    height:100,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 12,
    gap: 10,
    marginTop: Platform.OS === 'ios' ? 50 : 20,
 
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
    // marginBottom: 12,
        paddingHorizontal: 6,
    // gap: 10,
  },
  bubble: {
   paddingVertical:8,
   paddingHorizontal:10,
    borderRadius: 6,
    marginVertical: 0,
    maxWidth: '75%',
  },
  leftAlign: {
    alignItems: 'flex-start',
    gap:6
  },
  rightAlign: {
    alignItems: 'flex-end',
    gap:6
  },
  leftBubble: {
    backgroundColor: '#FFFFFF1F',
     borderRadius:4,
  },
  rightBubble: {
    backgroundColor: '#0000001F',
    borderRadius:4,
    
 
    
  },
  messageText: {
      fontFamily: 'Urbanist-Medium',
    color: '#FFFFFFE0',
    fontSize: 14,
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
