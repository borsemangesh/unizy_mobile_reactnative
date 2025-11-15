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
import { InteractionManager, PanResponder } from 'react-native';
import LottieView from 'lottie-react-native';
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

  const { width, height } = Dimensions.get('window');
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);
  const emojiTranslateY = useRef(new Animated.Value(0)).current;

  // Move constants before they're used
  const WINDOW_HEIGHT = Dimensions.get('window').height;
  const INPUT_BAR_HEIGHT = Platform.OS === 'ios' ? 70 : 64;
  const DEFAULT_EMOJI_HEIGHT = Math.round(WINDOW_HEIGHT * 0.35);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [lastKeyboardHeight, setLastKeyboardHeight] = useState(0);
  
  // Emoji keyboard height will match text keyboard height when available
  const EMOJI_PICKER_HEIGHT = lastKeyboardHeight > 0 ? lastKeyboardHeight : DEFAULT_EMOJI_HEIGHT;

  // Disable navigation gestures when emoji keyboard is open
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: !isEmojiPickerVisible,
    });
  }, [isEmojiPickerVisible, navigation]);

  // const [loading, setLoading] = useState(true);

  // Emoji picker animation - use dynamic height
  useEffect(() => {
    const emojiHeight = lastKeyboardHeight > 0 ? lastKeyboardHeight : EMOJI_PICKER_HEIGHT;
    
    if (isEmojiPickerVisible) {
      // Animate in when becoming visible
      emojiTranslateY.setValue(emojiHeight);
      Animated.spring(emojiTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      // Animate out when hiding
      Animated.spring(emojiTranslateY, {
        toValue: emojiHeight,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
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
        const isVertical = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        if (isVertical && gestureState.dy > 0) {
          emojiTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Check if it's a valid vertical downward swipe
        const isVertical = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        const shouldClose = isVertical && (gestureState.dy > 50 || gestureState.vy > 0.5);

        if (shouldClose && isEmojiPickerVisible) {
          // Close emoji keyboard
          const emojiHeight = lastKeyboardHeight > 0 ? lastKeyboardHeight : EMOJI_PICKER_HEIGHT;
          Animated.spring(emojiTranslateY, {
            toValue: emojiHeight,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start(() => {
            setIsEmojiPickerVisible(false);
          });
        } else {
          // Spring back
          Animated.spring(emojiTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  // Auto-focus text input when emoji keyboard closes (except when button is clicked or on initial mount)
  const shouldAutoFocusRef = useRef(true);
  const isInitialMountRef = useRef(true);
  
  useEffect(() => {
    // Skip auto-focus on initial mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    
    // Only auto-focus if emoji keyboard was just closed (not on initial mount)
    if (!isEmojiPickerVisible && shouldAutoFocusRef.current) {
      // Emoji keyboard closed - focus text input
      const timer = setTimeout(() => {
        textInputRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
    shouldAutoFocusRef.current = true; // Reset for next time
  }, [isEmojiPickerVisible]);

  const handleEmojiSelected = (char: string) => {
    if (char === 'DELETE') {
      // Delete last character
      setMessageText(prevText => prevText.slice(0, -1));
    } else {
      setMessageText(prevText => prevText + char);
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
        

        setMessages(messagesPage.items);
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

    if (!messageText.trim()) return;

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

  useEffect(() => {
    // Keyboard listeners to get keyboard height
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => {
        setKeyboardVisible(true);
        // use endCoordinates.height for keyboard height
        const h = (e && e.endCoordinates && e.endCoordinates.height) || 0;
        setKeyboardHeight(h);
        // Store the keyboard height for emoji keyboard
        if (h > 0) {
          setLastKeyboardHeight(h);
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
        // Keep lastKeyboardHeight for emoji keyboard sizing
      },
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [isEmojiPickerVisible, setIsEmojiPickerVisible]);
  
  // Scroll to end when text keyboard opens to ensure messages are visible
  useEffect(() => {
    if (keyboardVisible && !isEmojiPickerVisible) {
      // When text keyboard opens, scroll to the end to show messages
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [keyboardVisible, isEmojiPickerVisible]);
  
  // Calculate input bar bottom position
  // When emoji is visible, position above emoji keyboard
  // When text keyboard is visible, KeyboardAvoidingView handles it
  // When neither is visible, stay at bottom: 0
  const inputBarBottom = isEmojiPickerVisible 
    ? (lastKeyboardHeight > 0 ? lastKeyboardHeight : EMOJI_PICKER_HEIGHT)
    : 0;

  // for auto scroll

  const [extraPadding, setExtraPadding] = useState(48); // gap under last message (px)
  const [contentHeight, setContentHeight] = useState(0);
  const [listHeight, setListHeight] = useState(0);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    // debug logs — remove later
    console.log(
      'AUTO-SCROLL: messages:',
      messages.length,
      'contentH',
      contentHeight,
      'listH',
      listHeight,
      'extraPad',
      extraPadding,
    );

    // compute offset: contentHeight - visibleHeight + extraPaddingSpace
    const bottomSafeArea =
      INPUT_BAR_HEIGHT +
      (isEmojiPickerVisible ? EMOJI_PICKER_HEIGHT : 0) +
      extraPadding;
    const offset = Math.max(0, contentHeight - listHeight + bottomSafeArea);

    InteractionManager.runAfterInteractions(() => {
      // small timeout to let RN apply measurements
      setTimeout(() => {
        if (!flatListRef.current) {
          console.warn('flatListRef not available');
          return;
        }
        try {
          // scrollToOffset is more deterministic than scrollToEnd here
          flatListRef.current.scrollToOffset({ offset, animated: true });
          console.log('AUTO-SCROLL -> scrollToOffset', offset);
        } catch (err) {
          console.warn('scrollToOffset failed, fallback to scrollToEnd', err);
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 40); // tweak 40ms if needed
    });
  }, [messages, contentHeight, listHeight, isEmojiPickerVisible, extraPadding]);

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
    let grouped: any[] = [];
    let lastDate: string | null = null;

    messages.forEach(msg => {
      const created = msg.dateCreated || msg.timestamp;
      const dateLabel = formatMessageDate(new Date(created));

      if (lastDate !== dateLabel) {
        grouped.push({ type: 'date', date: dateLabel });
        lastDate = dateLabel;
      }

      grouped.push({ type: 'message', data: msg });
    });

    return grouped;
  };

  const groupedMessages = React.useMemo(
    () => buildMessageList(messages),
    [messages]
);

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
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        enabled={!isEmojiPickerVisible}
      >
        <View style={{ flex: 1 }}>
          <FlatList
            data={groupedMessages}
            keyExtractor={item => item.sid}
            renderItem={({ item }) => (
              <>
                {/* {item.type === 'date' && (
                  <View style={{ alignItems: 'center', marginVertical: 10 }}>
                    <Text
                      style={{
                        color: '#FFFFFF7A',
                        backgroundColor: '#00000029',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        fontSize: 10,
                        fontFamily: 'Urbanist-Medium',
                        marginVertical: 10,
                      }}
                    >
                      {item.date}
                    </Text>
                  </View>
                )}
                <View
                  style={[
                    styles.messageContainer,
                    item?.data?.state?.author == checkUser
                      ? styles.rightAlign
                      : styles.leftAlign,
                  ]}
                >
                  <View
                    style={
                      item?.data?.state?.author === checkUser
                        ? styles.rightBubbleWrapper
                        : styles.leftBubbleWrapper
                    }
                  >
                    {item?.data?.state?.author != checkUser && (
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
                          marginRight: -2,
                          marginTop: 4,                   
                        }}
                      />
                    )}

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

                    {item?.data?.state?.author == checkUser && (
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
                </View> */}


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
            marginRight: -2,
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
            )}
            ref={flatListRef}
            keyboardShouldPersistTaps="handled"
            // onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            // onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}

            onContentSizeChange={(w, h) => {
              // w is width (ignored), h is contentHeight
              setContentHeight(h);
            }}
            // measure FlatList viewport height
            onLayout={e => {
              const h = e.nativeEvent.layout.height;
              setListHeight(h);
            }}
            // compute and scroll after layout/content change
            onScrollEndDrag={() => {
              /* optional: keep for user interactions */
            }}
            contentContainerStyle={{
              paddingBottom:
                INPUT_BAR_HEIGHT +
                (isEmojiPickerVisible ? EMOJI_PICKER_HEIGHT : 0) + // Don't add keyboardHeight here - KeyboardAvoidingView handles it
                extraPadding,
              paddingTop: 8,
            }}
            // contentContainerStyle={{ paddingBottom: INPUT_BAR_HEIGHT + (isEmojiPickerVisible ? EMOJI_PICKER_HEIGHT : 20) }}
            showsVerticalScrollIndicator={false}
          />

          {/* EMOJI PICKER PANEL - with swipe gesture */}
          {isEmojiPickerVisible && (
            <Animated.View
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
                transform: [{ translateY: emojiTranslateY }],
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
            </Animated.View>
          )}

          {/* Input Bar - ALWAYS above keyboard or emoji panel */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: inputBarBottom,
              paddingHorizontal: 16,
              paddingVertical: Platform.OS === 'ios' ? 10 : 8,
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
                  backgroundColor: '#ffffff66',
                }}
              >
                {/* Emoji/Keyboard toggle button - WhatsApp style */}
                <TouchableOpacity
                  onPress={() => {
                    if (isEmojiPickerVisible) {
                      // Currently showing emoji keyboard - switch to text keyboard
                      shouldAutoFocusRef.current = true; // Allow auto-focus
                      setIsEmojiPickerVisible(false);
                      // Focus text input to show keyboard and cursor
                      setTimeout(() => {
                        textInputRef.current?.focus();
                      }, 150);
                    } else {
                      // Currently showing text keyboard or no keyboard - switch to emoji keyboard
                      shouldAutoFocusRef.current = false; // Prevent auto-focus
                      if (keyboardVisible) {
                        // Dismiss text keyboard first
                        Keyboard.dismiss();
                        setTimeout(() => {
                          setIsEmojiPickerVisible(true);
                          textInputRef.current?.blur();
                        }, 100);
                      } else {
                        // No keyboard visible - just show emoji keyboard
                        setIsEmojiPickerVisible(true);
                        textInputRef.current?.blur();
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
                  onChangeText={setMessageText}
                  value={messageText}
                  onFocus={() => {
                    // When user taps on text input, hide emoji keyboard and show text keyboard
                    // This matches WhatsApp behavior - tapping input always shows text keyboard
                    if (isEmojiPickerVisible) {
                      setIsEmojiPickerVisible(false);
                    }
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
                  backgroundColor: '#ffffff66',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image
                  source={require('../../../assets/images/sendmessage.png')}
                  style={{ width: 22, height: 22, tintColor: '#fff' }}
                />
              </TouchableOpacity>
            </View>
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
    height: 100,
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
