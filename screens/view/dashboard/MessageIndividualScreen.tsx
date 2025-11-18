
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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

  const [checkUser, setCheckUser] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Pagination state for WhatsApp-style loading
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const messagesPageRef = useRef<any>(null); // Store the messages page for pagination

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
  // Show blur when content height exceeds viewport (scrollable content exists)
  const hasScrollableContent = useSharedValue(false);
  const contentHeightRef = useRef(0);
  const viewportHeightRef = useRef(0);
  const prevContentHeightRef = useRef(0); // Track previous content height to detect new messages

  // Function to check if content is scrollable and update blur
  const updateBlurState = () => {
    if (contentHeightRef.current > 0 && viewportHeightRef.current > 0) {
      hasScrollableContent.value = contentHeightRef.current > viewportHeightRef.current;
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      const contentH = event.contentSize.height;
      const viewportH = event.layoutMeasurement.height;
      const currentY = event.contentOffset.y;
      
      // Calculate if we're at the top (viewing oldest messages)
      const maxScrollY = Math.max(0, contentH - viewportH);
      const distanceFromTop = maxScrollY - currentY;
      const isAtTop = distanceFromTop <= 10; // Small threshold for precision
      
      // Show blur only if:
      // 1. Content is scrollable (contentH > viewportH)
      // 2. NOT at top (not viewing oldest messages)
      // Hide blur only when fully scrolled to top
      hasScrollableContent.value = (contentH > viewportH) && !isAtTop;
    },
  });

  const animatedBlurStyle = useAnimatedStyle(() => {
    'worklet';
    // Show blur (opacity = 1) when content is scrollable and not at top
    // Hide blur (opacity = 0) only when fully scrolled to top (oldest messages)
    return { 
      opacity: hasScrollableContent.value ? 1 : 0 
    };
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
        
        // Store userId in state for message comparison
        setCurrentUserId(String(userId));

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
      
        // Convert to string to match Twilio's author format (author is typically userId as string)
        setCheckUser(
          String(
            source === 'chatList'
              ? currentUserIdList
              : apiData?.data?.current_user_id || userId
          )
        );

        // Load all messages initially by fetching all pages
        // Twilio pagination: nextPage() = newer messages, prevPage() = older messages
        let allMessages: any[] = [];
        let currentPage = await convo.getMessages();
        allMessages = [...currentPage.items];
        
        console.log('Initial page loaded:', currentPage.items.length, 'hasPrevPage:', currentPage.hasPrevPage);
        
        // Load all older pages (prevPage gets older messages)
        let pageCount = 1;
        while (currentPage.hasPrevPage) {
          try {
            const prevPage = await currentPage.prevPage();
            if (prevPage && prevPage.items && prevPage.items.length > 0) {
              allMessages = [...allMessages, ...prevPage.items];
              currentPage = prevPage;
              pageCount++;
              console.log(`Loaded older page ${pageCount}:`, prevPage.items.length, 'Total so far:', allMessages.length);
            } else {
              break;
            }
          } catch (error) {
            console.error('Error loading previous page:', error);
            break;
          }
        }
        
        console.log('Total messages loaded initially:', allMessages.length, 'from', pageCount, 'pages');
        
        // Store the last page (oldest messages) for pagination (to load even older messages if needed)
        messagesPageRef.current = currentPage;
        
        // Check if there are more messages to load (older than what we have)
        const hasMore = currentPage.hasPrevPage || false;
        console.log('hasMoreMessages (older than loaded):', hasMore);
        setHasMoreMessages(hasMore);

        const messagesdate = allMessages.map((msg: any) => {
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
        console.log('All messages loaded----------', allMessages.length);
        setMessagesDateTime(messagesdate);
        console.log("checkUser============______",checkUser);
        
        // Sort messages chronologically (newest first for inverted FlatList)
        // Inverted FlatList will display newest at bottom, oldest at top
        const sortedInitialMessages = [...allMessages].sort((a, b) => {
          const timeA = new Date(a.dateCreated || a.timestamp).getTime();
          const timeB = new Date(b.dateCreated || b.timestamp).getTime();
          return timeB - timeA; // Newest first (for inverted list)
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
  // Load older messages (pagination) - WhatsApp style
  // ----------------------------------------------------------
  const loadOlderMessages = useCallback(async () => {
    if (!conversation || !hasMoreMessages || loadingOlderMessages) {
      console.log('loadOlderMessages: Skipping - conversation:', !!conversation, 'hasMoreMessages:', hasMoreMessages, 'loadingOlderMessages:', loadingOlderMessages);
      return;
    }
    
    try {
      setLoadingOlderMessages(true);
      console.log('loadOlderMessages: Loading older messages...');
      
      // Get the previous page of messages
      const prevPage = await messagesPageRef.current?.prevPage();
      
      if (!prevPage || !prevPage.items || prevPage.items.length === 0) {
        console.log('loadOlderMessages: No more messages to load');
        setHasMoreMessages(false);
        setLoadingOlderMessages(false);
        return;
      }
      
      console.log('loadOlderMessages: Loaded', prevPage.items.length, 'older messages');
      
      // Store the new page for next pagination
      messagesPageRef.current = prevPage;
      
      // Check if there are more messages
      setHasMoreMessages(prevPage.hasNextPage || false);
      
      // Get existing message SIDs for deduplication
      setMessages(prev => {
        const existingSids = new Set(prev.map(msg => msg.sid));
        
        // Filter out duplicates from new messages
        const newMessages = prevPage.items.filter((msg: any) => !existingSids.has(msg.sid));
        
        if (newMessages.length === 0) {
          console.log('loadOlderMessages: All messages are duplicates');
          setHasMoreMessages(false);
          return prev; // No new messages, return previous state
        }
        
        console.log('loadOlderMessages: Adding', newMessages.length, 'new messages');
        
        // Combine: existing messages + new older messages
        // With inverted FlatList: newest at bottom (index 0), oldest at top (last index)
        // New older messages should be added to the end of the array (will appear at top after inversion)
        const combined = [...prev, ...newMessages];
        
        // Sort to maintain newest-first order (newest at start, oldest at end)
        const sorted = combined.sort((a, b) => {
          const timeA = new Date(a.dateCreated || a.timestamp).getTime();
          const timeB = new Date(b.dateCreated || b.timestamp).getTime();
          return timeB - timeA; // Newest first
        });
        
        return sorted;
      });
      
      // Scroll position is maintained automatically by FlatList when items are added
      // Inverted FlatList correctly maintains position when appending to end
      
    } catch (error) {
      console.error('Failed to load older messages:', error);
      setHasMoreMessages(false);
    } finally {
      setLoadingOlderMessages(false);
    }
  }, [conversation, hasMoreMessages, loadingOlderMessages]);

  // ----------------------------------------------------------
  // STEP 3: Attach Twilio Message Listener (ONLY ONCE)
  // ----------------------------------------------------------
  useEffect(() => {
    if (!conversation) return;

    const handleNewMessage = async (m: any) => {
      // Get userId from AsyncStorage to compare with message author
      const userId = await AsyncStorage.getItem('userId');
      if (userId && !currentUserId) {
        setCurrentUserId(String(userId));
      }
      
      const messageAuthor = m.author || m.state?.author || m.attributes?.author;
      
      console.log('New Twilio message:', {
        body: m.body,
        author: messageAuthor,
        checkUser: checkUser,
        currentUserId: currentUserId,
        userId: userId,
        isFromMe: String(messageAuthor) === String(checkUser) || String(messageAuthor) === String(currentUserId) || String(messageAuthor) === String(userId),
        messageStructure: {
          hasAuthor: !!m.author,
          hasState: !!m.state,
          hasStateAuthor: !!m.state?.author,
        }
      });
      
      setMessages(prev => {
        if (prev.find(msg => msg.sid === m.sid)) return prev; // dedup
        // Add new message and sort chronologically (newest first for inverted FlatList)
        const updated = [...prev, m];
        return updated.sort((a, b) => {
          const timeA = new Date(a.dateCreated || a.timestamp).getTime();
          const timeB = new Date(b.dateCreated || b.timestamp).getTime();
          return timeB - timeA; // Newest first (for inverted list)
        });
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
    // Filter numbers and number words before sending
    const filteredMessage = filterNumbersAndNumberWords(messageText.trim());
    
    if (!filteredMessage) {
      // Show alert if message becomes empty after filtering
      // Alert.alert('Invalid Message', 'Messages cannot contain numbers or number words.');
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
      const currentUserIdFromApi = createData.data.current_user_id;
      // Convert to string to match Twilio's author format (author is typically userId as string)
      setCheckUser(String(currentUserIdFromApi));
      // Also set currentUserId from AsyncStorage (this is what Twilio uses as identity)
      if (userId) {
        setCurrentUserId(String(userId));
      }
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

      // Set conversation BEFORE sending message so the messageAdded listener is ready
      setConversation(convo);

      // Small delay to ensure the useEffect listener is set up
      // This prevents race condition where message is sent before listener is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Send the pending first message
      // Twilio will trigger messageAdded event which will add the message automatically
      await convo.sendMessage(filteredMessage);
      console.log(
        'First message sent after conversation creation:',
        filteredMessage,
      );

      setMessageText('');
      // Don't manually add message - let Twilio's messageAdded event handle it
      // This ensures the message structure matches Twilio's format and appears correctly
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
    const d = new Date(date);
    
    // Get today's date in local timezone (reset time to midnight for accurate comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Get message date in local timezone (reset time to midnight)
    const messageDate = new Date(d);
    messageDate.setHours(0, 0, 0, 0);

    // Compare dates (year, month, day only)
    if (messageDate.getTime() === today.getTime()) return 'Today';

    if (messageDate.getTime() === yesterday.getTime()) return 'Yesterday';

    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const buildMessageList = (messages: any[]) => {
    // Inverted FlatList: Array[0] appears at BOTTOM, Array[n] appears at TOP
    // We want to display: date_oldest (top), msgs_oldest, date_newest, msgs_newest (bottom)
    // So we need: Array[n] = date_oldest, Array[0] = msgs_newest
    // Structure: [msg_newest, date_newest, ..., msg_oldest, date_oldest]
    // When inverted: [date_oldest, msg_oldest, ..., date_newest, msg_newest] ✓
    
    if (messages.length === 0) return [];

    // Sort messages oldest first for proper date grouping
    const sortedMessages = [...messages].sort((a, b) => {
      const timeA = new Date(a.dateCreated || a.timestamp).getTime();
      const timeB = new Date(b.dateCreated || b.timestamp).getTime();
      return timeA - timeB; // Oldest first
    });

    const grouped: any[] = [];
    let lastDate: string | null = null;

    // Build grouped array in oldest-first order: [date, msgs, date, msgs, ...]
    sortedMessages.forEach((msg, index) => {
      const created = msg.dateCreated || msg.timestamp;
      const dateLabel = formatMessageDate(new Date(created));

      // Add date label when date changes (BEFORE messages of that date)
      if (lastDate !== dateLabel) {
        grouped.push({ 
          type: 'date', 
          date: dateLabel, 
          sid: `date-${dateLabel}-${index}` 
        });
        lastDate = dateLabel;
      }

      // Add message
      grouped.push({ type: 'message', data: msg, sid: msg.sid || `msg-${index}` });
    });

    // Now we have: [date_oldest, msg_oldest, ..., date_newest, msg_newest]
    // Reverse: [date_newest, msg_newest, ..., date_oldest, msg_oldest]
    // When inverted: [date_oldest, msg_oldest, ..., date_newest, msg_newest]
    // Display: date_oldest (top), msg_oldest, ..., date_newest, msg_newest (bottom) ✓
    return grouped.reverse();
  };

  const groupedMessages = React.useMemo(
    () => buildMessageList(messages),
    [messages]
  );

  // Find the newest message index (not date) for adding bottom padding
  // With inverted FlatList and reversed grouped array, newest message is at index 0
  const lastMessageIndex = React.useMemo(() => {
    for (let i = 0; i < groupedMessages.length; i++) {
      if (groupedMessages[i]?.type === "message") {
        return i; // First message in the reversed grouped array is the newest (at bottom after inversion)
      }
    }
    return -1;
  }, [groupedMessages]);

  // Memoize content container style to ensure padding is applied on initial load
  // Include bottom padding that adjusts for keyboard/emoji picker state
  // Input bar is absolutely positioned, but we need minimal padding to ensure last message is visible
  const contentContainerStyle = React.useMemo(() => {
    // KeyboardAvoidingView already handles pushing content up when keyboard opens
    // So we only need minimal padding for the input bar itself, not the full keyboard height
    let paddingBottom = INPUT_BAR_HEIGHT;// Just enough to ensure last message is visible above input bar
    
    if (keyboardVisible && !isEmojiPickerVisible) {
      // Text keyboard is open - KeyboardAvoidingView handles the push
      // We only need padding for the input bar, not the keyboard height
      paddingBottom = INPUT_BAR_HEIGHT;
    } else if (isEmojiPickerVisible) {
      // Emoji picker is visible - KeyboardAvoidingView is disabled, so we need to add emoji picker height
      paddingBottom = EMOJI_PICKER_HEIGHT;
    }
    
    return {
      paddingTop: Platform.OS === 'ios' ? 160 : 150, // Header space at top
      paddingBottom: 0, // Dynamic bottom padding for keyboard/emoji
      flexGrow: 1, // Ensure content takes full space
    };
  }, [keyboardVisible, isEmojiPickerVisible, keyboardHeight, EMOJI_PICKER_HEIGHT]);

  // With inverted FlatList, newest messages are automatically at bottom
  // No need to scroll on initial load - inverted list starts at bottom
  // Blur effect is now based on content height vs viewport, not scroll position

  // Removed: Scroll on keyboard open/close - let KeyboardAvoidingView handle natural adjustment like WhatsApp
  // The marginBottom on last message will adjust automatically via extraData re-render

  // const groupedMessages = buildMessageList(messages);

  console.log('groupedMessages=========', groupedMessages);

  // Calculate header and input bar heights for loader positioning
  const headerTop = Platform.OS === 'ios' ? 50 : 40;
  const headerHeight = 100;
  const headerTotalHeight = headerTop + headerHeight;
  const inputBarHeight = INPUT_BAR_HEIGHT;

  return (
    <ImageBackground source={bgImage} style={{ flex: 1 }} resizeMode="cover">
      <View style={{ flex: 1 }}>
        {initialLoading && (
          <View 
            style={{
              position: 'absolute',
              top: headerTotalHeight,
              bottom: inputBarHeight,
              left: 0,
              right: 0,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 999,
            }}
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
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
              }, 50);
            }
          }}
        >
          <Animated.FlatList
            data={groupedMessages}
            inverted // WhatsApp-style: newest messages at bottom, scroll up to see older
            extraData={[keyboardVisible, isEmojiPickerVisible, lastMessageIndex, lastKeyboardHeight, loadingOlderMessages]} // Force re-render when keyboard/emoji state or keyboard height changes
            keyExtractor={(item, index) => item.sid || item.data?.sid || `item-${index}`}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            scrollEnabled={!isEmojiPickerVisible} // Disable scrolling when emoji keyboard is open
            onEndReached={loadOlderMessages} // Load older messages when scrolling to top (inverted list)
            onEndReachedThreshold={0.3} // Trigger when 30% from top (more sensitive for better UX)
            ListHeaderComponent={
              loadingOlderMessages ? (
                <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              ) : null
            }
            onScrollToIndexFailed={(info) => {
              // Fallback to scrollToEnd if scrollToIndex fails
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
              }, 100);
            }}
            renderItem={({ item, index }) => {
              // Helper function to check if message is from current user
              const isFromCurrentUser = (msg: any) => {
                if (!msg || !msg.data) return false;
                
                // Get author from various possible locations in message structure
                const author = msg.data.author || msg.data.state?.author || msg.data.attributes?.author;
                
                // Compare with both checkUser and currentUserId (as strings)
                const authorStr = String(author || '');
                const checkUserStr = String(checkUser || '');
                const currentUserIdStr = String(currentUserId || '');
                
                // Return true if author matches either checkUser or currentUserId
                return authorStr === checkUserStr || authorStr === currentUserIdStr;
              };
              
              const isLastMessage = index === lastMessageIndex;
              const isMyMessage = isFromCurrentUser(item);
              // Calculate bottom padding for SAME HEIGHT across all three states:
              // 1. Default (no keyboard): INPUT_BAR_HEIGHT + spacing
              // 2. Text keyboard open: INPUT_BAR_HEIGHT + spacing (KeyboardAvoidingView handles keyboard push)
              // 3. Emoji picker visible: INPUT_BAR_HEIGHT + EMOJI_PICKER_HEIGHT + spacing
              // 
              // Key insight: When text keyboard is open, KeyboardAvoidingView already pushes content up by keyboardHeight
              // So we only need INPUT_BAR_HEIGHT + spacing for marginBottom
              // When emoji picker is visible, we need to add EMOJI_PICKER_HEIGHT to match the keyboard height
              // EMOJI_PICKER_HEIGHT should equal keyboardHeight for consistent appearance
              
              // Minimal spacing between last message and input field
              // Input bar is absolutely positioned, so we only need a tiny gap
              const BASE_SPACING = 0; // No extra spacing - input bar handles positioning
              
              let bottomPadding;
              
              if (keyboardVisible && !isEmojiPickerVisible) {
                // Text keyboard is open - KeyboardAvoidingView handles the push
                // No extra spacing needed since input bar is positioned above keyboard
                bottomPadding = BASE_SPACING;
              } else if (isEmojiPickerVisible) {
                // Emoji picker is visible - add emoji picker height
                bottomPadding = EMOJI_PICKER_HEIGHT + BASE_SPACING;
              } else {
                // Default state (no keyboard) - no extra spacing, input bar is absolutely positioned
                bottomPadding = BASE_SPACING;
              }
              
              return (
              <>
               

                {item?.type === "date" ? (
  <View style={{ alignItems: "center", marginVertical: 10 ,paddingTop:60}}>
    <Text  style={{
                        color: '#FFFFFF7A',
                        backgroundColor: '#00000029',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        fontSize: 12,
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
      isMyMessage
        ? styles.rightAlign
        : styles.leftAlign,
      isLastMessage && { marginBottom: bottomPadding },
    ]}
  >
    <View
      style={
        isMyMessage
          ? styles.rightBubbleWrapper
          : styles.leftBubbleWrapper
      }
    >
      {/* Bubble arrow - LEFT */}
      {!isMyMessage && (
        <View
          style={{
            width: 0,
            height: 0,
            borderTopWidth: 8,
            borderTopColor: "transparent",
            borderRightWidth: 9,
            borderRightColor: "#2466c75e",
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
          isMyMessage
            ? styles.rightBubble
            : styles.leftBubble,
        ]}
      >
        <Text allowFontScaling={false} style={styles.messageText}>
          {item?.data?.state?.body || item?.data?.body}
        </Text>
      </View>

      {/* Bubble arrow - RIGHT */}
      {isMyMessage && (
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
            onContentSizeChange={(width, height) => {
              // Update content height and check if scrollable
              const prevHeight = contentHeightRef.current;
              contentHeightRef.current = height;
              updateBlurState();
              
              // If content height increased (new message added), scroll to bottom
              if (height > prevHeight && prevHeight > 0 && flatListRef.current) {
                // New message was added - scroll to show it above keyboard
                InteractionManager.runAfterInteractions(() => {
                  setTimeout(() => {
                    if (flatListRef.current) {
                      try {
                        // For inverted FlatList, scrollToOffset with 0 scrolls to bottom
                        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
                      } catch (err) {
                        // Fallback to scrollToEnd
                        try {
                          flatListRef.current.scrollToEnd({ animated: true });
                        } catch (e) {
                          console.warn('Scroll failed:', e);
                        }
                      }
                    }
                  }, 100);
                });
              }
            }}
            onLayout={(event) => {
              // Update viewport height and check if scrollable
              const { height } = event.nativeEvent.layout;
              viewportHeightRef.current = height;
              updateBlurState();
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
              paddingBottom: Platform.OS === 'ios' ? 10 : (keyboardVisible || isEmojiPickerVisible ? 8 : 34),
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
                        // Blur input to prevent text keyboard from showing
                        textInputRef.current?.blur();
                        setTimeout(() => {
                          console.log('Setting emoji picker visible to true (after keyboard dismiss)');
                          setIsEmojiPickerVisible(true);
                          // Reset flag after delay to allow normal behavior
                          setTimeout(() => {
                            isOpeningEmojiRef.current = false;
                            console.log('Emoji keyboard visible, flag reset');
                          }, 500);
                        }, 300);
                      } else {
                        // No keyboard visible - show emoji keyboard immediately
                        console.log('Setting emoji picker visible to true (no keyboard) - IMMEDIATE');
                        // Set state immediately - no delays
                        setIsEmojiPickerVisible(true);
                        console.log('State set to true, should render emoji picker now');
                        // Blur input after state is set to prevent text keyboard from showing
                        setTimeout(() => {
                          textInputRef.current?.blur();
                        }, 50);
                        // Reset flag after delay to allow normal behavior
                        setTimeout(() => {
                          isOpeningEmojiRef.current = false;
                          console.log('Emoji keyboard visible (no keyboard), flag reset');
                        }, 500);
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
                    }, 300);
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
            {/* Footer spacer - minimal spacing */}
            <View 
              style={{
                height: Platform.OS === 'ios' ? 4 : 4,
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
    maxWidth:'85%'
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
  borderTopLeftRadius: 3,
  borderTopRightRadius: 6,
  borderBottomLeftRadius: 6,
  borderBottomRightRadius: 6,
  },
  rightBubble: {
    backgroundColor: '#0000001F',
     borderTopLeftRadius: 6,
  borderTopRightRadius: 3,
  borderBottomLeftRadius: 6,
  borderBottomRightRadius: 6,
  },
  messageText: {
    fontFamily: 'Urbanist-Medium',
    color: '#FFFFFFE0',
    fontSize: 16,  // before 14,
    lineHeight: 19,
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