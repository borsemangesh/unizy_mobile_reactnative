import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

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
import { InteractionManager } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
// @ts-ignore - react-native-vector-icons types
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getTwilioClient, waitForTwilioReady } from "../../view/emoji/twilioService";
import Loader from '../../utils/component/Loader';
import { showToast } from '../../utils/toast';


const bgImage = require('../../../assets/images/backimg.png');
const profileImage = require('../../../assets/images/user.jpg');
const back = require('../../../assets/images/back.png');


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
    university: { id: number; name: string };
  };
  userConvName: string;
  currentUserIdList: number;

  sellerData: {
    featureId: number;
    firstname: string;
    lastname: string;
    profile: string | null;
    universityName: { id: number; name: string };
    id: number;
  };
  conversationSid: string;
};

const conversationCache: any = {};
const messageCache: any = {};

const CACHE_KEY_CONVO_PREFIX = "twilio_convo_";
const CACHE_KEY_MSG_PREFIX = "twilio_msg_";

// Track all active Twilio clients for cleanup
const activeTwilioClients = new Set();

/**
 * Clear all Twilio caches (in-memory and AsyncStorage)
 * This should be called on logout to prevent data leakage between users
 */
export const clearTwilioCache = async () => {
  try {
    // Clear in-memory caches
    Object.keys(conversationCache).forEach(key => delete conversationCache[key]);
    Object.keys(messageCache).forEach(key => delete messageCache[key]);
    
    // Clear AsyncStorage caches
    const allKeys = await AsyncStorage.getAllKeys();
    const twilioKeys = allKeys.filter(key => 
      key.startsWith(CACHE_KEY_CONVO_PREFIX) || key.startsWith(CACHE_KEY_MSG_PREFIX)
    );
    
    if (twilioKeys.length > 0) {
      await AsyncStorage.multiRemove(twilioKeys);
      if (__DEV__) {
        console.log(`✅ Cleared ${twilioKeys.length} Twilio cache entries`);
      }
    }
    
    // Reset all active Twilio clients from MessageIndividualScreen
    activeTwilioClients.forEach((client: any) => {
      try {
        if (client && typeof client.removeAllListeners === 'function') {
          client.removeAllListeners();
        }
        if (client && typeof client.shutdown === 'function') {
          client.shutdown().catch(() => {});
        }
      } catch (err) {
        console.warn('Error resetting Twilio client:', err);
      }
    });
    activeTwilioClients.clear();
    
  } catch (err) {
    console.warn('⚠️ Error clearing Twilio cache:', err);
  }
};

const saveJSON = async (key: any, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err: any) {
    // Silent fail - cache is optional
    if (__DEV__) {
      console.warn('Cache save failed:', err.message);
    }
  }
};

const loadJSON = async (key: any) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err: any) {
    // Silent fail - cache is optional
    if (__DEV__) {
      console.warn('Cache load failed:', err.message);
    }
    return null;
  }
};

// Helper function for safe fetch with timeout (production-ready)
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 15000
): Promise<Response> => {
  // AbortController is available in React Native 0.60+
  // For React Native 0.81.0, it's definitely available
  if (typeof AbortController === 'undefined') {
    // Fallback for very old React Native versions (unlikely but safe)
    throw new Error('AbortController not available');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
};

const MessagesIndividualScreen = ({
  navigation,
}: MessagesIndividualScreenProps) => {
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const { members, sellerData, userConvName, currentUserIdList, source, conversationSid } =
    route.params;

  // console.log('Received members:', members);
  // console.log('sellerData----', sellerData?.featureId);
  // console.log('source', source);
  // console.log('convName', userConvName);

  // console.log('currentUserIdList----', currentUserIdList);

  const [chatClient, setChatClient] = useState<any>(null);
  const chatClientRef = useRef<any>(null); // Track client for cleanup

  const [conversation, setConversation] = useState<any>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [messagesDateTime, setMessagesDateTime] = useState<any[]>([]);

  const [messageText, setMessageText] = useState('');
  const [checkUser, setCheckUser] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Pagination state for WhatsApp-style loading
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const messagesPageRef = useRef<any>(null); // Store the messages page for pagination

  const [initialLoading, setInitialLoading] = useState(true);
  const [layoutReady, setLayoutReady] = useState(false);
  const [kavKey, setKavKey] = useState(0);

  const { width, height } = Dimensions.get('window');
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);
  const loadingFromScrollRef = useRef(false);
  const shouldAutoScrollRef = useRef(true);
  const newestMessageSidRef = useRef<string | null>(null); // Track newest message to detect if it changed



  const hasScrollableContent = useSharedValue(false);
  const contentHeightRef = useRef(0);
  const viewportHeightRef = useRef(0);
  const prevContentHeightRef = useRef(0);


  const scrollY = useSharedValue(0);


  const updateBlurState = () => {
    if (contentHeightRef.current > 0 && viewportHeightRef.current > 0) {
      hasScrollableContent.value =
        contentHeightRef.current > viewportHeightRef.current;
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      'worklet';
      const contentH = event.contentSize.height;
      const viewportH = event.layoutMeasurement.height;
      const currentY = event.contentOffset.y;
      scrollY.value = currentY;


      const maxScrollY = Math.max(0, contentH - viewportH);
      const distanceFromTop = maxScrollY - currentY;
      const isAtTop = distanceFromTop <= 10;
      hasScrollableContent.value = contentH > viewportH && !isAtTop;
    },
  });

  const animatedBlurStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(scrollY.value, [0, 300], [0, 1], 'clamp');
    return { opacity };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    'worklet';
    const borderColor = interpolateColor(
      scrollY.value,
      [0, 300],
      ['rgba(255, 255, 255, 0.56)', 'rgba(255, 255, 255, 0.56)'],
    );
    const redOpacity = interpolate(scrollY.value, [0, 300], [0, 0.15], 'clamp');
    return {
      borderColor,
      backgroundColor: `rgba(255, 255, 255, ${redOpacity})`,
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(scrollY.value, [0, 300], [0.8, 1], 'clamp');
    const tintColor = interpolateColor(
      scrollY.value,
      [0, 150],
      ['#FFFFFF', '#002050'],
    );
    return {
      opacity,
      tintColor,
    };
  });

  const blurAmount = useDerivedValue(() => {
    'worklet';
    return interpolate(scrollY.value, [0, 300], [0, 10], 'clamp');
  });

  const animatedStaticBackgroundStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 30],
        [1, 0],
        'clamp',
      ),
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 40,
    };
  });

  const animatedBlurViewStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 50],
        [0, 1],
        'clamp',
      ),
    };
  });

  // Move constants before they're used
  const WINDOW_HEIGHT = Dimensions.get('window').height;
  const INPUT_BAR_HEIGHT = Platform.OS === 'ios' ? 70 : 64;
  const BOTTOM_SPACING = Platform.OS === 'ios' ? 0 : 0;

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const windowHeightRef = useRef(Dimensions.get('window').height);
  const keyboardHeightRef = useRef(0); // Stable ref to prevent shaking
  const keyboardHeightSetRef = useRef(false); // Track if height has been set for this keyboard session

  // Update window height when dimensions change (for keyboard height calculation)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      windowHeightRef.current = window.height;
    });
    return () => subscription?.remove();
  }, []);


  const isInitialMountRef = useRef(true);


  const filterNumbersAndNumberWords = (text: string): string => {
    // Remove all digits (0-9)
    let filtered = text.replace(/[0-9]/g, '');

    const numberWords = [
      'zero',
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
      'eleven',
      'twelve',
      'thirteen',
      'fourteen',
      'fifteen',
      'sixteen',
      'seventeen',
      'eighteen',
      'nineteen',
      'twenty',
      'thirty',
      'forty',
      'fifty',
      'sixty',
      'seventy',
      'eighty',
      'ninety',
      'hundred',
      'thousand',
      'million',
      'billion',
      'trillion',
    ];

    const numberWordsPattern = new RegExp(
      `\\b(${numberWords.join('|')})\\b`,
      'gi',
    );

    filtered = filtered.replace(numberWordsPattern, '');

    filtered = filtered.replace(/\s{3,}/g, '  ');

    return filtered;
  };

  const handleTextChange = (text: string) => {
    const filteredText = filterNumbersAndNumberWords(text);
    setMessageText(filteredText);
  };



  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          console.warn('Twilio init: No token available');
          return;
        }

        // Add timeout for network request (production-safe)
        const response = await fetchWithTimeout(
          `${MAIN_URL.baseUrl}twilio/auth-token`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
          15000
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data?.data?.token) {
          throw new Error('Invalid token response from server');
        }

        const twilio = await new TwilioChatClient(data.data.token);

        console.log(twilio)

        if (!twilio) {
          throw new Error('Failed to initialize Twilio client');
        }

        if (!isMounted) return;

        console.log("Twilio client initialized successfully");
        setChatClient(twilio);
        chatClientRef.current = twilio; // Track for cleanup
        activeTwilioClients.add(twilio); // Add to active clients set

        setTimeout(() => {
          if (twilio && isMounted) {
            twilio.getSubscribedConversations()
              .then((list: any) => {
                if (list?.items && isMounted) {
                  list.items.forEach((c: any) => {
                    if (c?.uniqueName) {
                      conversationCache[c.uniqueName] = c;
                    }
                  });
                }
              })
              .catch((err: any) => {
                console.warn('Preload conversations failed:', err.message);
              });
          }
        }, 500);
      } catch (error: any) {
        console.error('Twilio initialization failed:', error.message);

        // Show user-friendly error in production
        if (error.name === 'AbortError') {
          console.error('Twilio token request timed out');
        }

        // Don't set loading to false if component unmounted
        if (isMounted) {
          // Could show error state here if needed
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);


  useEffect(() => {
    if (!chatClient) return;

    let isMounted = true;

    const loadConversation = async () => {
      try {
        setInitialLoading(true);

        const token = await AsyncStorage.getItem("userToken");
        const userId = await AsyncStorage.getItem("userId");

        if (!chatClient) {
          throw new Error("Twilio client not initialized");
        }

        // Wait for Twilio with timeout - critical for production builds
        try {
          await waitForTwilioReady(chatClient, 15000);
        } catch (readyErr: any) {
          console.error("Twilio connection failed:", readyErr.message);
          throw new Error(`Twilio connection failed: ${readyErr.message}`);
        }

        let convName = userConvName;
        let apiData = null;

        // ---------------------- Handle sellerPage override ----------------------
        if (source === "sellerPage") {
          try {
            const res = await fetchWithTimeout(
              `${MAIN_URL.baseUrl}twilio/conversation-fetch`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ feature_id: sellerData.featureId }),
              },
              15000
            );

            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              throw new Error(errorData.message || `HTTP ${res.status}`);
            }

            apiData = await res.json();
            if (res.ok && apiData.data?.conv_name) convName = apiData.data.conv_name;

            if (!apiData.data) {
              console.warn("Conversation not available for sellerPage");
              setInitialLoading(false);
              return;
            }
          } catch (error: any) {
            console.error("Failed to fetch conversation for sellerPage:", error.message);
            if (error.name === 'AbortError') {
              console.error("Request timed out");
            }
            setInitialLoading(false);
            return;
          }
        }

        // ---------------------- INSTANT OPEN (Persistent Cache) ----------------------
        const persistedConvo = await loadJSON(CACHE_KEY_CONVO_PREFIX + convName);
        const persistedMsgs = await loadJSON(CACHE_KEY_MSG_PREFIX + convName);

        if (persistedConvo && persistedMsgs) {
          conversationCache[convName] = persistedConvo;
          messageCache[convName] = persistedMsgs;

          setConversation(persistedConvo);

          // Set identity BEFORE rendering cached messages
          setCheckUser(
            String(
              source === "chatList"
                ? currentUserIdList
                : apiData?.data?.current_user_id || userId
            )
          );
          setCurrentUserId(String(userId));

          setMessages(
            [...(persistedMsgs || [])].sort((a, b) => (
              new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
            ))
          );

          setInitialLoading(false);
          return;
        }

        // ---------------------- Live Twilio Fresh Fetch ----------------------
        const fetchTwilioFresh = async () => {
          let convo = conversationCache[convName] || null;

          // Fastest: by SID
          if (!convo && conversationSid) {
            try {
              convo = await chatClient.getConversation(conversationSid);
              console.log("Loaded conversation by SID:", conversationSid);
            } catch (err: any) {
              console.warn("Failed to get conversation by SID:", err.message);
            }
          }

          // Fallback: by uniqueName
          if (!convo) {
            try {
              convo = await chatClient.getConversationByUniqueName(convName);
              console.log("Loaded conversation by uniqueName:", convName);
            } catch (err: any) {
              console.warn("Failed to get conversation by uniqueName, creating new:", err.message);
              try {
                convo = await chatClient.createConversation({ uniqueName: convName });
                console.log("Created new conversation:", convName);
              } catch (createErr: any) {
                throw new Error(`Failed to create conversation: ${createErr.message}`);
              }
            }
          }

          if (!convo) {
            throw new Error("Failed to get or create conversation");
          }

          conversationCache[convName] = convo;

          // Save to cache with error handling
          try {
            await saveJSON(CACHE_KEY_CONVO_PREFIX + convName, convo);
          } catch (cacheErr: any) {
            console.warn("Failed to save conversation to cache:", cacheErr.message);
          }

          // Ensure joined with error handling
          try {
            const participants = await convo.getParticipants();
            const alreadyJoined = participants.some((p: any) => p.identity === userId);
            if (!alreadyJoined) {
              await convo.join();
              console.log("Joined conversation:", convName);
            }
          } catch (joinErr: any) {
            // Ignore "already joined" errors
            if (!joinErr.message?.includes("Conflict") && !joinErr.message?.includes("already")) {
              console.warn("Failed to join conversation:", joinErr.message);
            }
          }

          if (!isMounted) return;
          setConversation(convo);

          // ---------------------- SET USER IDENTITY BEFORE LOADING MESSAGES ----------------------
          setCheckUser(
            String(
              source === "chatList"
                ? currentUserIdList
                : apiData?.data?.current_user_id || userId
            )
          );
          setCurrentUserId(String(userId));

          // ---------------------- LOAD ONLY LATEST 20 MESSAGES ----------------------
          let page;
          let items: any[] = [];

          try {
            page = await convo.getMessages(20);
            items = Array.isArray(page.items) ? page.items : [];
            messagesPageRef.current = page;
          } catch (msgErr: any) {
            console.error("Failed to load messages:", msgErr.message);
            throw new Error(`Failed to load messages: ${msgErr.message}`);
          }

          // Fix: Pass conversation object, not SID string
          markAsRead(convo).catch((err) => {
            console.warn("markAsRead failed:", err.message);
          });

          messageCache[convName] = items;

          // Save messages to cache with error handling
          try {
            await saveJSON(CACHE_KEY_MSG_PREFIX + convName, items);
          } catch (cacheErr: any) {
            console.warn("Failed to save messages to cache:", cacheErr.message);
          }

          setMessages(
            [...items].sort((a, b) => (
              new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
            ))
          );

          setHasMoreMessages(page.hasPrevPage);
          setInitialLoading(false);
        };

        await fetchTwilioFresh();
      } catch (err: any) {
        console.error("Conversation load failed:", err?.message || err);

        // More detailed error logging for production debugging
        if (err?.message) {
          console.error("Error details:", {
            message: err.message,
            name: err.name,
            stack: err.stack?.substring(0, 200), // First 200 chars of stack
          });
        }

        setInitialLoading(false);

      }
    };

    loadConversation();
    return () => {
      isMounted = false;
    };
  }, [chatClient]);

  // --- END OF UPDATED USEEFFECT BLOCK ---



  // Removed duplicate messageAdded listener - functionality merged into the main listener below

  ////////////-------------------read count api -------------------//////////

  const markAsRead = async (conversation: any) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('markAsRead: No token available');
        return;
      }

      // Handle both conversation object and SID string
      const sid = typeof conversation === 'string'
        ? conversation
        : conversation?.sid || conversationSid;

      if (!sid) {
        console.warn('markAsRead: No conversation SID available');
        return;
      }

      const url = `${MAIN_URL.baseUrl}twilio/convo-read-update`;

      // Add timeout for production builds (10 second timeout)
      const res = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            twilio_conversation_sid: sid,
          }),
        },
        10000
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn('markAsRead API failed:', errorData.message || res.statusText);
      }
    } catch (error: any) {
      // Silent fail - don't break chat if read status fails
      if (error.name !== 'AbortError') {
        console.warn('markAsRead error:', error.message);
      }
    }
  };

 
  const loadOlderMessages = useCallback(async () => {
    if (!messagesPageRef.current?.hasPrevPage) return;
    if (loadingOlderMessages) return; 

    setLoadingOlderMessages(true);
    loadingFromScrollRef.current = true;

    try {
      const prevPage = await messagesPageRef.current.prevPage();

      messagesPageRef.current = prevPage;

      setMessages(prev => {
        const existing = new Set(prev.map(m => m.sid));
        const fresh = prevPage.items.filter((m: any) => !existing.has(m.sid));
        return [...prev, ...fresh].sort((a, b) => (
          new Date(b.dateCreated).getTime() -
          new Date(a.dateCreated).getTime()
        ));
      });
    } catch (error) {
      console.error('Failed to load older messages:', error);
    } finally {
      setLoadingOlderMessages(false);
      setTimeout(() => {
        loadingFromScrollRef.current = false;
      }, 200);
    }
  }, [loadingOlderMessages]);


 
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
        isFromMe:
          String(messageAuthor) === String(checkUser) ||
          String(messageAuthor) === String(currentUserId) ||
          String(messageAuthor) === String(userId),
        messageStructure: {
          hasAuthor: !!m.author,
          hasState: !!m.state,
          hasStateAuthor: !!m.state?.author,
        },
      });

      const isFromMe =
        String(messageAuthor) === String(checkUser) ||
        String(messageAuthor) === String(currentUserId) ||
        String(messageAuthor) === String(userId);

      setMessages(prev => {
        if (prev.find(msg => msg.sid === m.sid)) return prev; // dedup

        // Add new message and sort chronologically (newest first for inverted FlatList)
        const updated = [...prev, m].sort((a, b) => {
          const timeA = new Date(a.dateCreated || a.timestamp).getTime();
          const timeB = new Date(b.dateCreated || b.timestamp).getTime();
          return timeB - timeA; // Newest first (for inverted list)
        });

        // Update cache (merged from duplicate listener)
        const convName = conversation.uniqueName;
        messageCache[convName] = updated;
        saveJSON(CACHE_KEY_MSG_PREFIX + convName, updated);

        return updated;
      });

      // Scroll to bottom when user's own message is added
      // BUT NOT when content is short and locked on iOS
      if (isFromMe && !(Platform.OS === 'ios' && isShortContentLockedRef.current)) {
        shouldAutoScrollRef.current = true;
        // Use multiple requestAnimationFrame to ensure layout is complete
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            InteractionManager.runAfterInteractions(() => {
              setTimeout(() => {
                if (flatListRef.current && !(Platform.OS === 'ios' && isShortContentLockedRef.current)) {
                  try {
                    flatListRef.current.scrollToOffset({
                      offset: 0,
                      animated: true,
                    });
                  } catch (err) {
                    try {
                      flatListRef.current.scrollToEnd({ animated: true });
                    } catch (e) {
                      console.warn('Scroll failed:', e);
                    }
                  }
                }
              }, 600); // Increased delay to wait for keyboard animation
            });
          });
        });
      }
    };

    conversation.on('messageAdded', handleNewMessage);

    return () => {
      // console.log(' Cleaning Twilio listener');
      conversation.removeListener('messageAdded', handleNewMessage);
    };
  }, [conversation, checkUser, currentUserId]); // Add missing dependencies

  // ----------------------------------------------------------
  // STEP 4: Send Message
  // ----------------------------------------------------------
  const handleSendMessage = async () => {
    // Filter numbers and number words before sending
    const filteredMessage = filterNumbersAndNumberWords(messageText.trim());

    if (!filteredMessage) {
      setMessageText(''); // Clear the input
      return;
    }

    // Clear message text immediately for better perceived performance
    setMessageText('');

    // Reset auto-scroll flag when user sends a message
    shouldAutoScrollRef.current = true;

    try {
      // Parallel AsyncStorage reads for better performance
      const [token, userId] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('userId'),
      ]);

      if (conversation) {
        // Send message - handleNewMessage will handle scrolling automatically
        await conversation.sendMessage(filteredMessage);
        return;
      }

      // Case 2: Conversation not yet created → create now after first message
      if (!sellerData?.featureId) {
        console.error('Missing featureId');
        return;
      }

      const urlCreate = `${MAIN_URL.baseUrl}twilio/conversation-create`;
      const body = { feature_id: sellerData.featureId };

      const createResponse = await fetch(urlCreate, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok || !createData?.data?.conv_name) {
        console.error('Failed to create conversation:', createData.message);
        return;
      }

      const convName = createData.data.conv_name;
      const currentUserIdFromApi = createData.data.current_user_id;

      // Convert to string to match Twilio's author format
      setCheckUser(String(currentUserIdFromApi));

      // Also set currentUserId from AsyncStorage
      if (userId) {
        setCurrentUserId(String(userId));
      }

      // Get or create Twilio conversation
      let convo;
      try {
        convo = await chatClient.getConversationByUniqueName(convName);
      } catch {
        convo = await chatClient.createConversation({ uniqueName: convName });
      }

      // Join conversation
      try {
        await convo.join();
      } catch (err: any) {
        if (!err.message?.includes('Conflict')) {
          console.error('Join failed:', err);
        }
      }

      // Set conversation BEFORE sending message so the messageAdded listener is ready
      setConversation(convo);

      // Reduced delay - 50ms should be enough for React state to update
      // The useEffect listener should be ready by then
      await new Promise(resolve => setTimeout(resolve, 50));

      // Send the pending first message
      // Twilio will trigger messageAdded event which will add the message automatically
      // handleNewMessage will handle scrolling automatically
      await convo.sendMessage(filteredMessage);

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
        let h =
          (e && e.endCoordinates && e.endCoordinates.height) ||
          (e && e.startCoordinates && e.startCoordinates.height) ||
          0;

        // On Android, also calculate height from window dimensions change
        // This is more reliable on some devices like Motorola Edge Fusion 60
        if (Platform.OS === 'android') {
          const currentWindowHeight = Dimensions.get('window').height;
          const heightDiff = windowHeightRef.current - currentWindowHeight;
          // If window height decreased significantly, that's likely the keyboard
          // Use the maximum of both methods to ensure accurate height
          if (heightDiff > 100) {
            h = Math.max(h, heightDiff);
          }
          // Update reference for next calculation
          windowHeightRef.current = currentWindowHeight;
        }

        // On iOS, only update keyboard height once per keyboard session to prevent shaking
        // The keyboardWillShow event can fire multiple times with slightly different heights
        if (Platform.OS === 'ios') {
          // Only update if height hasn't been set yet for this session, or if it's significantly different
          // This prevents micro-adjustments during keyboard animation that cause shaking
          if (!keyboardHeightSetRef.current || (h > 0 && Math.abs(h - keyboardHeightRef.current) > 20)) {
            keyboardHeightRef.current = h;
            setKeyboardHeight(h);
            keyboardHeightSetRef.current = true;
          }
        } else {
          keyboardHeightRef.current = h;
          setKeyboardHeight(h);
        }

      },
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        keyboardHeightRef.current = 0;
        keyboardHeightSetRef.current = false; // Reset flag for next keyboard open
        setKeyboardHeight(0);

        // Update window height reference when keyboard closes
        // This ensures accurate calculation on next keyboard open



        if (Platform.OS === 'android') {
          // setTimeout(() => {
          //   windowHeightRef.current = Dimensions.get('window').height;
            // Force KeyboardAvoidingView to reset on Android to remove extra space
            setKavKey(prev => prev + 1);
          // }, 100);
        }

        

         // Force KeyboardAvoidingView to reset by changing key (only on iOS when needed)
         // This ensures padding is fully removed
         // Only update on iOS to prevent unnecessary re-renders on Android
         if (Platform.OS === 'ios' && !isContentShort) {
           setKavKey(prev => prev + 1);
         }
         // No scrolling needed - KeyboardAvoidingView handles natural adjustment
         // FlatList will re-render automatically via extraData prop when keyboardVisible changes
       },
     );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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


  // Removed: Auto-scroll logic - inverted FlatList automatically shows newest messages at bottom
  const [extraPadding] = useState(48); // gap for padding

  //-------------- for set date wise messages -----------------//

  // const formatMessageDate = (date: Date) => {
  //   const d = new Date(date);
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);
  //   const yesterday = new Date(today);
  //   yesterday.setDate(yesterday.getDate() - 1);
  //   const messageDate = new Date(d);
  //   messageDate.setHours(0, 0, 0, 0);
  //   if (messageDate.getTime() === today.getTime()) return 'Today';
  //   if (messageDate.getTime() === yesterday.getTime()) return 'Yesterday';
  //   return d.toLocaleDateString('en-IN', {
  //     day: '2-digit',
  //     month: 'short',
  //     year: 'numeric',
  //   });
  // };


  // add new date format
  const formatMessageDate = (date: Date) => {
    const d = new Date(date);

    // Today at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Yesterday at midnight
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Message date at midnight
    const messageDate = new Date(d);
    messageDate.setHours(0, 0, 0, 0);

    // Today check
    if (messageDate.getTime() === today.getTime()) {
      return "Today";
    }

    // Yesterday check
    if (messageDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    }

    // Format with suffix (st, nd, rd, th)
    const day = d.getDate();

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

    const month = d.toLocaleString("en-GB", { month: "short" });
    const year = d.getFullYear();

    // Final format: 20th Nov 2025
    return `${day}${suffix} ${month} ${year}`;
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
          sid: `date-${dateLabel}-${index}`,
        });
        lastDate = dateLabel;
      }

      // Add message
      grouped.push({
        type: 'message',
        data: msg,
        sid: msg.sid || `msg-${index}`,
      });
    });

    // Now we have: [date_oldest, msg_oldest, ..., date_newest, msg_newest]
    // Reverse: [date_newest, msg_newest, ..., date_oldest, msg_oldest]
    // When inverted: [date_oldest, msg_oldest, ..., date_newest, msg_newest]
    // Display: date_oldest (top), msg_oldest, ..., date_newest, msg_newest (bottom) ✓
    return grouped.reverse();
  };

  const groupedMessages = React.useMemo(
    () => buildMessageList(messages),
    [messages],
  );

  // Find the index of the oldest date (appears at top in inverted list)
  const oldestDateIndex = React.useMemo(() => {
    for (let i = groupedMessages.length - 1; i >= 0; i--) {
      if (groupedMessages[i]?.type === 'date') {
        return i;
      }
    }
    return -1;
  }, [groupedMessages]);

  // Find the newest message index (not date) for adding bottom padding
  // With inverted FlatList and reversed grouped array, newest message is at index 0
  const lastMessageIndex = React.useMemo(() => {
    for (let i = 0; i < groupedMessages.length; i++) {
      if (groupedMessages[i]?.type === 'message') {
        return i; // First message in the reversed grouped array is the newest (at bottom after inversion)
      }
    }
    return -1;
  }, [groupedMessages]);

  // Memoize content container style to ensure padding is applied on initial load
  // Input bar is absolutely positioned, but we need minimal padding to ensure last message is visible
  const contentContainerStyle = React.useMemo(() => {
    // KeyboardAvoidingView already handles pushing content up when keyboard opens
    // So we only need minimal padding for the input bar itself, not the full keyboard height
    return {
      paddingTop: Platform.OS === 'ios' ? 160 : 150, // Header space at top
      paddingBottom: 0, // Dynamic bottom padding for keyboard
      flexGrow: 1, // Ensure content takes full space
    };
  }, []); // Remove dependencies to prevent re-renders - padding is set dynamically in contentContainerStyle prop


  // Scroll to bottom when user sends a new message
  const prevMessagesLengthRef = useRef(messages.length);
  const lastUserMessageRef = useRef<string | null>(null);

  // Initialize newestMessageSidRef when messages are first loaded
  useEffect(() => {
    if (messages.length > 0 && !newestMessageSidRef.current) {
      newestMessageSidRef.current = messages[0]?.sid || null;
    }
  }, [messages.length === 0 ? null : messages[0]?.sid]);

  useEffect(() => {
    // Check if a new message was added
    if (messages.length > prevMessagesLengthRef.current && messages.length > 0) {
      const lastMessage = messages[0]; // Newest message is first in the array (for inverted list)
      const messageAuthor = lastMessage?.author || lastMessage?.state?.author || lastMessage?.attributes?.author;
      const isFromMe =
        String(messageAuthor) === String(checkUser) ||
        String(messageAuthor) === String(currentUserId);

      // Only scroll if it's a new message from the user (not a duplicate)
      if (isFromMe && lastMessage?.sid !== lastUserMessageRef.current) {
        lastUserMessageRef.current = lastMessage?.sid || null;
        newestMessageSidRef.current = lastMessage?.sid || null; // Update newest message ref
        shouldAutoScrollRef.current = true; // Reset flag for future messages

        // ALWAYS scroll for user's own messages, regardless of previous scroll state
        // Use multiple attempts with increasing delays to ensure it works
        const scrollToBottom = (delay: number) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              InteractionManager.runAfterInteractions(() => {
                setTimeout(() => {
                  if (flatListRef.current) {
                    try {
                      // For inverted FlatList, scrollToOffset with 0 scrolls to bottom
                      flatListRef.current.scrollToOffset({
                        offset: 0,
                        animated: true,
                      });
                    } catch (err) {
                      try {
                        // Fallback to scrollToEnd
                        flatListRef.current.scrollToEnd({ animated: true });
                      } catch (e) {
                        try {
                          // Final fallback to scrollToIndex
                          if (lastMessageIndex >= 0) {
                            flatListRef.current.scrollToIndex({
                              index: lastMessageIndex,
                              animated: true,
                              viewPosition: 1,
                            });
                          }
                        } catch (e2) {
                          console.warn('Scroll failed:', e2);
                        }
                      }
                    }
                  }
                }, delay);
              });
            });
          });
        };

        // Try scrolling multiple times with increasing delays
        // BUT NOT when content is short and locked on iOS
        if (!(Platform.OS === 'ios' && isShortContentLockedRef.current)) {
          scrollToBottom(keyboardVisible ? 300 : 200);
          scrollToBottom(keyboardVisible ? 600 : 400);
          scrollToBottom(keyboardVisible ? 1000 : 700);
        }
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, checkUser, currentUserId, keyboardVisible, lastMessageIndex]);


  // Scroll to bottom on initial load to show latest messages
  useEffect(() => {
    if (!initialLoading && messages.length > 0 && flatListRef.current && !(Platform.OS === 'ios' && isShortContentLockedRef.current)) {
      // Small delay to ensure layout is ready
      setTimeout(() => {
        if (flatListRef.current && !(Platform.OS === 'ios' && isShortContentLockedRef.current)) {
          try {
            flatListRef.current.scrollToOffset({
              offset: 0,
              animated: false, // No animation on initial load
            });
          } catch (err) {
            try {
              flatListRef.current.scrollToEnd({ animated: false });
            } catch (e) {
              // Ignore errors
            }
          }
        }
      }, 100);
    }
  }, [initialLoading, messages.length === 0 ? null : messages[0]?.sid]); // Only trigger when initial loading completes

  // console.log('groupedMessages=========', groupedMessages);

  // Calculate header and input bar heights for loader positioning
  const headerTop = Platform.OS === 'ios' ? 50 : 40;
  const headerHeight = 100;
  const headerTotalHeight = headerTop + headerHeight;
  const inputBarHeight = INPUT_BAR_HEIGHT;

  const isSendDisabled = initialLoading || !messageText.trim();

  const [isContentShort, setIsContentShort] = useState(false);
  const prevIsContentShortRef = useRef(false);
  const scrollToShortContentRef = useRef(false); // Prevent multiple scroll calls
  const contentSizeChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Throttle content size changes
  const isShortContentLockedRef = useRef(false); // Lock position when content is short

  // Calculate input bar bottom position (memoized to prevent shaking)
  // When content is short on iOS, manually position above keyboard
  // Otherwise, KeyboardAvoidingView handles it
  // Use ref value for stability during keyboard animations
  const inputBarBottom = React.useMemo(() => {
    if (Platform.OS === 'ios' && isContentShort && keyboardVisible) {
      // Use the stable ref value to prevent shaking during keyboard animations
      return keyboardHeightRef.current || keyboardHeight;
    }
    return 0;
  }, [Platform.OS, isContentShort, keyboardVisible, keyboardHeight]);

  // Scroll to show messages when keyboard opens with short content on iOS (only once)
  useEffect(() => {
    if (Platform.OS === 'ios' && isContentShort && keyboardVisible && flatListRef.current && messages.length > 0 && !scrollToShortContentRef.current) {
      scrollToShortContentRef.current = true;
      isShortContentLockedRef.current = true; // Lock position immediately to prevent any updates
      // Delay to ensure keyboard animation completes and content size is stable
      const timeoutId = setTimeout(() => {
        if (flatListRef.current && keyboardVisible && isContentShort && isShortContentLockedRef.current) {
          try {
            // For inverted FlatList, scrollToOffset with 0 scrolls to bottom (newest messages)
            flatListRef.current.scrollToOffset({
              offset: 0,
              animated: false, // Use false to prevent animation conflicts and shaking
            });
          } catch (err) {
            try {
              flatListRef.current.scrollToEnd({ animated: false });
            } catch (e) {
              // Ignore errors
            }
          }
        }
      }, 500); // Increased delay to ensure everything is stable
      return () => {
        clearTimeout(timeoutId);
        // Reset flags when keyboard closes or content changes
        if (!keyboardVisible || !isContentShort) {
          scrollToShortContentRef.current = false;
          isShortContentLockedRef.current = false;
        }
      };
    } else if (!keyboardVisible || !isContentShort) {
      scrollToShortContentRef.current = false;
      isShortContentLockedRef.current = false;
    }
  }, [isContentShort, keyboardVisible, messages.length]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (contentSizeChangeTimeoutRef.current) {
        clearTimeout(contentSizeChangeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <ImageBackground source={bgImage} style={{ flex: 1 }} resizeMode="cover">
      <View style={{ flex: 1 }}>
        {initialLoading && (
          <Loader
            containerStyle={{
              position: 'absolute',
              // top: headerTotalHeight,
              left: 0,
              right: 0,
              // bottom: inputBarHeight,
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: Platform.OS === 'ios' ? 0 : 0,
              zIndex: 1000,
              elevation: Platform.OS === 'android' ? 100 : 0,
              pointerEvents: 'none',
            }}
          />
        )}
        {/* Static transparent blur header - 10px height */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType={Platform.OS === 'ios' ? 'prominent' : 'light'}
            blurAmount={Platform.OS === 'ios' ? 45 : 45}
            reducedTransparencyFallbackColor="rgba(255,255,255,0.05)"
          />
        </View>
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
              // overlayColor="rgba(255,255,255,0.05)"
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

        <View style={styles.header} pointerEvents="box-none">
          <View style={styles.headerRow}>
            {/* //-----------------------Add New Header------------------------\\ */}

            {/* //-----------------------Add New Header------------------------\\ */}

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                justifyContent: 'space-between',
                gap: 8,
                paddingHorizontal: 16,
                position: 'absolute',
                paddingTop: Platform.OS === 'ios' ? 0 : 0,
              }}
            >

              <TouchableOpacity
                onPress={() => {
                  console.log('CHATBACK', source);
                  if (Platform.OS === 'ios') {
                    // console.log("source: ", source);
                    if (navigation.canGoBack()) {
                      navigation.goBack();
                    } else {
                      if(source === 'chatList'){
                        navigation.reset({
                          index: 0,
                          routes: [{ name: 'Dashboard', params: { resetToLogin: true,AddScreenBackactiveTab: 'Bookmark',
                          isNavigate: false, } }],
                        });

                      }
                      // navigation.replace('Dashboard', {
                      //   AddScreenBackactiveTab: 'Bookmark',
                      //   isNavigate: false,

                      // });

                      navigation.goBack();

                    }
                   
                  } else {

                    if (source === 'sellerPage') {
                      navigation.goBack();
                    }
                    else {
                      navigation.replace('Dashboard', {
                        AddScreenBackactiveTab: 'Bookmark',
                        isNavigate: false,
                      });
                    }
                  }
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{
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
                    borderRadius: 0,
                  }}
                  blurType="light"
                  blurAmount={10}
                  reducedTransparencyFallbackColor="#ffffff66"
                />
                <Image
                  source={back}
                  resizeMode="contain"
                  style={styles.backIconStyle}
                />
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
                  borderRadius: Platform.OS === 'ios' ? 40 : 40,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
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
                    borderRadius: 30,
                  }}
                  blurType="light"
                  blurAmount={5}
                  reducedTransparencyFallbackColor="#ffffff34"
                />

                {/* //----------------------Add Heder text -----------------------// */}

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    gap: 10,
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    navigation.navigate('UserProfileScreen', {
                      animation: 'none',
                      members: source == 'chatList' ? members : sellerData,
                      // source: 'chatList',
                    });
                  }}
                >
                  {source == 'chatList' ? (
                    members?.profile ? (
                      <Image
                        source={{ uri: members?.profile }}
                        style={styles.profileImage}
                      />
                    ) : (
                      <View style={styles.initialsCircle}>
                        <Text
                          allowFontScaling={false}
                          style={styles.initialsText}
                        >
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
                      <Text
                        allowFontScaling={false}
                        style={styles.initialsText}
                      >
                        {getInitials(
                          sellerData?.firstname ?? 'A',
                          sellerData?.lastname ?? 'W',
                        )}
                      </Text>
                    </View>
                  )}

                  <View>
                    <Text allowFontScaling={false} style={styles.studentName}>
                      {source === 'chatList'
                        ? members?.firstname
                        : sellerData.firstname}{' '}
                      {source === 'chatList'
                        ? members?.lastname
                        : sellerData.lastname}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={styles.universityName}
                      numberOfLines={0}
                    >
                      {source == 'chatList'
                        ? members?.university.name
                        : sellerData?.universityName.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* //-------------------add header text ------------------------//              */}

            {/* Spacer to balance the back button and keep title centered */}
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <KeyboardAvoidingView
          key={kavKey}
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}
          enabled={Platform.OS === 'ios' ? !isContentShort : true}

          
        >
          <View
            style={{ flex: 1 }}
            onLayout={() => {
              if (!layoutReady && !initialLoading) {
                setTimeout(() => {
                  setLayoutReady(true);
                }, 50);
              }
            }}
          >
            <Animated.FlatList
              data={groupedMessages}
              inverted // WhatsApp-style: newest messages at bottom, scroll up to see older
              // onEndReached={loadOlderMessages}            // 🔥 Load older messages
              // onEndReachedThreshold={0.2}                 // 🔥 Trigger earlier (20% before top)
              removeClippedSubviews={Platform.OS === 'ios' && isContentShort && keyboardVisible ? false : true} // Disable clipping when short to prevent layout shifts
              extraData={React.useMemo(() => {
                // When locked, use minimal extraData to prevent re-renders
                if (Platform.OS === 'ios' && isShortContentLockedRef.current) {
                  // Only include essential data when locked
                  return [keyboardVisible, lastMessageIndex];
                }
                return [keyboardVisible, lastMessageIndex, loadingOlderMessages, isContentShort];
              }, [keyboardVisible, lastMessageIndex, loadingOlderMessages, isContentShort])} // Memoize to prevent unnecessary re-renders
              keyExtractor={(item, index) =>
                item.sid || item.data?.sid || `item-${index}`
              }
              // onScroll={scrollHandler}

              maintainVisibleContentPosition={
                // Disable on iOS when content is short to prevent shaking
                Platform.OS === 'ios' && isContentShort
                  ? undefined
                  : {
                      minIndexForVisible: 1,
                    }
              }
              onScroll={event => {
                // Manually update shared values for blur effect
                const offsetY = event.nativeEvent.contentOffset.y;
                const contentHeight = event.nativeEvent.contentSize.height;
                const viewportHeight =
                  event.nativeEvent.layoutMeasurement.height;

                // Update scrollY for blur animation
                scrollY.value = offsetY;

                // Calculate if we're at the top (viewing oldest messages)
                const maxScrollY = Math.max(0, contentHeight - viewportHeight);
                const distanceFromTop = maxScrollY - offsetY;
                const isAtTop = distanceFromTop <= 10;

                // Update hasScrollableContent for blur visibility
                hasScrollableContent.value =
                  contentHeight > viewportHeight && !isAtTop;

                if (offsetY > 30) {
                  shouldAutoScrollRef.current = false;
                }

                // 👇 Load older messages when user reaches 25% from the top
                const threshold = maxScrollY * 0.25; // 25% from top

                if (
                  distanceFromTop <= threshold &&
                  !loadingFromScrollRef.current &&
                  !loadingOlderMessages &&
                  messagesPageRef.current?.hasPrevPage
                ) {
                  loadOlderMessages();
                }
              }}
              scrollEventThrottle={16}
              scrollEnabled={true}
              // onEndReached={loadOlderMessages} // Load older messages when scrolling to top (inverted list)
              // onEndReachedThreshold={0.3} // Trigger when 30% from top (more sensitive for better UX)
              ListHeaderComponent={null}
              // Removed - using date label replacement instead for WhatsApp-style behavior
              onScrollToIndexFailed={info => {
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
                  const author =
                    msg.data.author ||
                    msg.data.state?.author ||
                    msg.data.attributes?.author;

                  // Compare with both checkUser and currentUserId (as strings)
                  const authorStr = String(author || '');
                  const checkUserStr = String(checkUser || '');
                  const currentUserIdStr = String(currentUserId || '');

                  // Return true if author matches either checkUser or currentUserId
                  return (
                    authorStr === checkUserStr || authorStr === currentUserIdStr
                  );
                };

                const isLastMessage = index === lastMessageIndex;
                const isMyMessage = isFromCurrentUser(item);
                // Minimal spacing between last message and input field
                // Input bar is absolutely positioned, so we only need a tiny gap
                const BASE_SPACING = 0; // No extra spacing - input bar handles positioning
                const bottomPadding = BASE_SPACING;

                return (
                  <>
                    {item?.type === 'date' ? (
                      <View
                        style={{ alignItems: 'center', marginVertical: 10 }}
                      >
                        <Text
                          style={{
                            color: '#FFFFFF7A',
                            backgroundColor: '#00000029',
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 6,
                            fontSize: 12,
                            fontFamily: 'Urbanist-Medium',
                            marginVertical: 10,
                          }}
                        >
                          {loadingOlderMessages && index === oldestDateIndex
                            ? 'Loading...'
                            : item?.date}
                        </Text>
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.messageContainer,
                          isMyMessage ? styles.rightAlign : styles.leftAlign,
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
                                borderTopColor: 'transparent',
                                borderRightWidth: 9,
                                borderRightColor: '#2466c75e',
                                borderBottomWidth: 8,
                                borderBottomColor: 'transparent',
                                alignSelf: 'flex-start',
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
                            <Text
                              allowFontScaling={false}
                              style={styles.messageText}
                            >
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
                  </>
                );
              }}
              ref={flatListRef}
              keyboardShouldPersistTaps="handled"
               onContentSizeChange={(width, height) => {
                 // When content is short and locked on iOS, completely skip all updates to prevent shaking
                 if (Platform.OS === 'ios' && isShortContentLockedRef.current) {
                   return; // Skip all processing when locked
                 }

                 // Update content height immediately (needed for calculations)
                 const prevHeight = contentHeightRef.current;
                 contentHeightRef.current = height;
                 updateBlurState();

                 // Throttle isContentShort state updates to prevent shaking
                 if (Platform.OS === 'ios') {
                   if (contentSizeChangeTimeoutRef.current) {
                     clearTimeout(contentSizeChangeTimeoutRef.current);
                   }

                   contentSizeChangeTimeoutRef.current = setTimeout(() => {
                     // Don't update if locked
                     if (isShortContentLockedRef.current) return;
                     
                     const screenHeight = Dimensions.get("window").height;
                     const newIsContentShort = height < screenHeight * 0.7;
                     // Only update state if value changed to prevent unnecessary re-renders and shaking
                     if (newIsContentShort !== prevIsContentShortRef.current) {
                       prevIsContentShortRef.current = newIsContentShort;
                       isShortContentLockedRef.current = newIsContentShort && keyboardVisible;
                       // Use double requestAnimationFrame to batch updates and prevent shaking
                       requestAnimationFrame(() => {
                         requestAnimationFrame(() => {
                           setIsContentShort(newIsContentShort);
                         });
                       });
                     } else if (newIsContentShort && keyboardVisible) {
                       // Keep lock active if still short and keyboard visible
                       isShortContentLockedRef.current = true;
                     }
                   }, 200); // Increased throttle to 200ms to prevent rapid updates
                 }

                 // Do NOT auto-scroll when loading older messages or when content is short on iOS
                 // (short content scrolling is handled by the dedicated useEffect)
                 // Completely prevent any scroll operations when content is short and locked
                 if (loadingFromScrollRef.current || loadingOlderMessages || (Platform.OS === 'ios' && isShortContentLockedRef.current))
                   return;

                // If content height increased (new message added)
                if (
                  height > prevHeight &&
                  prevHeight > 0 &&
                  flatListRef.current
                ) {
                  // Check if the newest message is from the current user
                  const newestMessage =
                    messages.length > 0 ? messages[0] : null;
                  const newestMessageSid = newestMessage?.sid || null;

                  // Only scroll if the newest message actually changed
                  // If newest message didn't change but height increased, it means older messages were added
                  if (newestMessageSid === newestMessageSidRef.current) {
                    // Newest message didn't change - this is older messages being loaded, don't scroll
                    return;
                  }

                  // Update the ref to track the newest message
                  newestMessageSidRef.current = newestMessageSid;

                  const messageAuthor =
                    newestMessage?.author ||
                    newestMessage?.state?.author ||
                    newestMessage?.attributes?.author;
                  const isFromMe =
                    String(messageAuthor) === String(checkUser) ||
                    String(messageAuthor) === String(currentUserId);

                  // Always scroll if it's user's own message, or if shouldAutoScrollRef is true
                  // BUT NOT when content is short and locked on iOS
                  if (!(Platform.OS === 'ios' && isShortContentLockedRef.current) && (isFromMe || shouldAutoScrollRef.current)) {
                    if (isFromMe) {
                      shouldAutoScrollRef.current = true; // Reset flag for user's messages
                    }

                    // New message was added - scroll to show it above keyboard
                    InteractionManager.runAfterInteractions(() => {
                      setTimeout(
                        () => {
                          if (flatListRef.current && !(Platform.OS === 'ios' && isShortContentLockedRef.current)) {
                            try {
                              // For inverted FlatList, scrollToOffset with 0 scrolls to bottom
                              flatListRef.current.scrollToOffset({
                                offset: 0,
                                animated: true,
                              });
                            } catch (err) {
                              // Fallback to scrollToEnd
                              try {
                                flatListRef.current.scrollToEnd({
                                  animated: true,
                                });
                              } catch (e) {
                                console.warn('Scroll failed:', e);
                              }
                            }
                          }
                        },
                        keyboardVisible ? 300 : 200,
                      );
                    });
                  }
                }
              }}
              //               onContentSizeChange={(w, h) => {
              //   const prev = contentHeightRef.current;
              //   contentHeightRef.current = h;

              //   // Do NOT auto-scroll when loading older messages
              //   if (loadingFromScrollRef.current) return;

              //   // New incoming message → scroll to bottom
              //   if (h > prev) {
              //     flatListRef.current?.scrollToOffset({
              //       offset: 0,
              //       animated: true,
              //     });
              //   }
              // }}

              onLayout={event => {
                // Skip layout updates when content is short and locked to prevent shaking
                if (Platform.OS === 'ios' && isShortContentLockedRef.current) {
                  return;
                }
                // Update viewport height and check if scrollable
                const { height } = event.nativeEvent.layout;
                viewportHeightRef.current = height;
                updateBlurState();
              }}
               contentContainerStyle={React.useMemo(() => {
                 // When content is short and locked, use completely stable values - don't recalculate
                 if (Platform.OS === 'ios' && isContentShort && keyboardVisible && isShortContentLockedRef.current) {
                   // Return a completely stable style object - use ref value that was set when locked
                  //  const lockedHeight = keyboardHeightRef.current || 0;
                   return {
                     paddingTop: 80,
                     paddingBottom:  120,
                     flexGrow: 1,
                     justifyContent: 'flex-end',
                   };
                 }
                 
                 return {
                   ...contentContainerStyle,
                   paddingBottom: isContentShort && Platform.OS === 'ios' && keyboardVisible
                     ? (keyboardHeightRef.current || keyboardHeight) + INPUT_BAR_HEIGHT +10
                     : 120,
                   paddingTop: keyboardVisible ? 80 : 105,
                   // Always use flex-end for inverted FlatList to keep newest messages (index 0) visible at bottom
                   justifyContent: 'flex-end',
                 };
               }, [contentContainerStyle, isContentShort, keyboardVisible, keyboardHeight])}
              showsVerticalScrollIndicator={false}
            />


            {/* Input Bar - ALWAYS above keyboard or emoji panel */}
            <View
              style={React.useMemo(() => ({
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: inputBarBottom,
                paddingHorizontal: 16,
                paddingTop: Platform.OS === 'ios' ? 0 : 8,
                paddingBottom:
                  Platform.OS === 'ios'
                    ? isContentShort && keyboardVisible
                      ? 0
                      : keyboardVisible
                        ? 0
                        : 30
                    : keyboardVisible
                      ? 8
                      : 34,
                backgroundColor: 'transparent',
                zIndex: 1000,
              }), [inputBarBottom, isContentShort, keyboardVisible])}
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

                  height: 48,
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
                      borderRadius: 10,
                    }}
                    blurType="light"
                    blurAmount={5}
                    reducedTransparencyFallbackColor="#ffffff34"
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
                      marginLeft: Platform.OS === 'ios' ? 5 : 0,
                    }}
                    placeholder="Message"
                    placeholderTextColor="#ccc"
                    onChangeText={handleTextChange}
                    value={messageText}
                  />
                </View>

                {/* Send */}
                <TouchableOpacity
                  onPress={handleSendMessage}
                  disabled={isSendDisabled}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={{
                    marginLeft: 8,
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    overflow: 'hidden',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    opacity: isSendDisabled ? 0.5 : 1, // 🔥 Disable UI Feedback
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
                    style={{
                      width: 22,
                      height: 22,
                      tintColor: '#fff',
                      zIndex: 1,
                    }}
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
    color: '#FFFFFFE0',
    marginTop: 2,
    minWidth: '70%',
    maxWidth: '86%',

  },
  backIconStyle: {
    width: 30,
    height: 30,
  },
  studentName: {
    color: '#FFFFFFE0',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 2,
  },
  // headerWrapper: {
  //   position: 'absolute',
  //   top: 0,
  //   left: 0,
  //   right: 0,
  //   width: Platform.OS === 'ios' ? '100%' : '100%',
  //   height: Platform.OS === 'ios' ? 150 : 150,
  //   zIndex: 10,
  //   overflow: 'hidden',
  //   alignSelf: 'center',
  //   pointerEvents: 'none',
  // },
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
    fontSize: 16, // before 14,
    lineHeight: 21,
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
    // marginRight: 10,
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

  //------------------------- add for blur ----------------------//
  headerWrapper: {
    position: 'absolute',
    top: 0,
    width: Platform.OS === 'ios' ? '100%' : '100%',
    height: Platform.OS === 'ios' ? 110 : 180,
    zIndex: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    pointerEvents: 'none',
  },

  backButtonContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

  blurButtonWrapper: {
    width: 48,
    height: 48,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? '5%' : 40,
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
    // paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: 48,
    height: 48,
  },

  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },
});