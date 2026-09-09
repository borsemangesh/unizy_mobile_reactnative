import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import notifee from '@notifee/react-native';

import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MAIN_URL } from '../../utils/APIConstant';
import { Client as TwilioChatClient } from '@twilio/conversations';
import { RouteProp, useRoute } from '@react-navigation/native';
import { InteractionManager } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { waitForTwilioReady } from '../../view/emoji/twilioService';
import Loader from '../../utils/component/Loader';

import { useTranslation } from 'react-i18next';
import i18n from '../../../localization/i18n';
import MessageHeaderButton from '../../utils/component/MessageHeaderButton';
import { NewCustomToastContainer,showToast } from '../../utils/component/NewCustomToastManager';
import { getBadgeCount } from '../../utils/BadgeManager';


import  back from '../../../assets/images/back.png';

import BACK_ICON from '../../../assets/images/backimg.png';



type MessagesIndividualScreenProps = {
  navigation: any;
};

type RouteParams = {
  source?: 'chatList' | 'sellerPage';
  members: {
    firstname: string;
    lastname: string;
    id: number;
    profile: string | null;
    isblocked: boolean;
    blocked_you: boolean;
    university: { id: number; name: string };
  };
  userConvName: string;
  currentUserIdList: number;
  getrestriction_applied: boolean,

  sellerData: {
    featureId: number;
    firstname: string;
    lastname: string;
    profile: string | null;
    universityName: { id: number; name: string };
    id: number;
    isblocked: boolean;
    blocked_you: boolean;
  };
  conversationSid: string;
  unreadCount: number,
};

const conversationCache: any = {};
const messageCache: any = {};

const CACHE_KEY_CONVO_PREFIX = 'twilio_convo_';
const CACHE_KEY_MSG_PREFIX = 'twilio_msg_';

const activeTwilioClients = new Set();
export const clearTwilioCache = async () => {
  try {
    Object.keys(conversationCache).forEach(
      key => delete conversationCache[key],
    );
    Object.keys(messageCache).forEach(key => delete messageCache[key]);
    const allKeys = await AsyncStorage.getAllKeys();
    const twilioKeys = allKeys.filter(
      key =>
        key.startsWith(CACHE_KEY_CONVO_PREFIX) ||
        key.startsWith(CACHE_KEY_MSG_PREFIX),
    );

    if (twilioKeys.length > 0) {
      await AsyncStorage.multiRemove(twilioKeys);
      if (__DEV__) {
      }
    }
    activeTwilioClients.forEach((client: any) => {
      try {
        if (client && typeof client.removeAllListeners === 'function') {
          client.removeAllListeners();
        }
        if (client && typeof client.shutdown === 'function') {
          client.shutdown().catch(() => { });
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
    if (__DEV__) {
      console.warn('Cache load failed:', err.message);
    }
    return null;
  }
};

const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 15000,
): Promise<Response> => {
  if (typeof AbortController === 'undefined') {
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
  const {
    members,
    sellerData,
    userConvName,
    currentUserIdList,
    source,
    conversationSid,
    unreadCount,
    getrestriction_applied
  } = route.params;

  const chatUser = source === 'sellerPage' ? sellerData : members;
  const [isblock, setisblock] = useState(true);
  const [chatClient, setChatClient] = useState<any>(null);
  const chatClientRef = useRef<any>(null); // Track client for cleanup

  const [conversation, setConversation] = useState<any>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [messagesDateTime, setMessagesDateTime] = useState<any[]>([]);

  const [messageText, setMessageText] = useState('');
  const [checkUser, setCheckUser] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const messagesPageRef = useRef<any>(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [layoutReady, setLayoutReady] = useState(false);
  // Hide list until scrolled to newest — prevents flash of older messages on open
  const [messagesReady, setMessagesReady] = useState(false);
  const initialScrollDoneRef = useRef(false);

  const { width, height } = Dimensions.get('window');
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);
  const loadingFromScrollRef = useRef(false);
  const shouldAutoScrollRef = useRef(true);
  const newestMessageSidRef = useRef<string | null>(null);

  const hasScrollableContent = useSharedValue(false);
  const contentHeightRef = useRef(0);
  const viewportHeightRef = useRef(0);
  const scrollY = useSharedValue(0);
  const { t } = useTranslation();

  const [restriction_applied ,setREstriction_applied ]= useState(true);

  const [otherLastReadIndex, setOtherLastReadIndex] = useState<number | null>(
    null,
  );

  const updateBlurState = () => {
    if (contentHeightRef.current > 0 && viewportHeightRef.current > 0) {
      hasScrollableContent.value =
        contentHeightRef.current > viewportHeightRef.current;
    }
  };

  const animatedBlurStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(scrollY.value, [0, 300], [0, 1], 'clamp');
    return { opacity };
  });

  const HEADER_CONTENT_PADDING = Platform.OS === 'ios' ? 160 : 150;

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // const filterEmailAndLinks = (text: string): string => {
  //   let filtered = text;
  //   const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  // if (emailRegex.test(filtered)) {
  //   showToast(t('email_error'),'error');
  // }

  //   filtered = filtered.replace(emailRegex, '');

  //   const urlRegex = /((https?:\/\/|www\.)[^\s]+)/gi;
  //   filtered = filtered.replace(urlRegex, '');

  //   const domainRegex =
  //     /\b[a-zA-Z0-9-]+\.(com|net|org|in|co|io|gov|edu|info|biz|me|app|dev|ai|uk|us|ca|au|de|fr|jp|cn)\b/gi;
  //   filtered = filtered.replace(domainRegex, '');

  //   return filtered;
  // };

  const filterEmailAndLinks = (text: string): string => {
  let filtered = text;

  const emailRegex =
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;

  const urlRegex =
    /((https?:\/\/|www\.)[^\s]+)/i;

  const domainRegex =
    /\b[a-zA-Z0-9-]+\.(com|net|org|in|co|io|gov|edu|info|biz|me|app|dev|ai|uk|us|ca|au|de|fr|jp|cn)\b/i;

  if (
    emailRegex.test(filtered) ||
    urlRegex.test(filtered) ||
    domainRegex.test(filtered)
  ) {
    Keyboard.dismiss();
    showToast(t('email_error'), 'error');
  }

  // Now remove globally
  filtered = filtered.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '',
  );

  filtered = filtered.replace(
    /((https?:\/\/|www\.)[^\s]+)/gi,
    '',
  );

  filtered = filtered.replace(
    /\b[a-zA-Z0-9-]+\.(com|net|org|in|co|io|gov|edu|info|biz|me|app|dev|ai|uk|us|ca|au|de|fr|jp|cn)\b/gi,
    '',
  );

  return filtered;
};
  const filterNumbersAndNumberWords = (text: string): string => {
    let digitCount = 0;

    let filtered = text.replace(/\d/g, digit => {
      digitCount++;
      return digitCount <= 3 ? digit : '*';
    });

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

    if (numberWordsPattern.test(text)) {
  Keyboard.dismiss();
  showToast(t('email_error'),'error');
  return '';
}

    filtered = filtered.replace(numberWordsPattern, '');

    filtered = filtered.replace(/\s{2,}/g, ' ').trim();
    

    return filtered;
  };

  const applyChatRestrictions = (text: string): string => {
    let filtered = text;

    const restrictionFlag =
      source === 'sellerPage'
        ? restriction_applied:
        getrestriction_applied;

    if (restrictionFlag) {
      filtered = filterNumbersAndNumberWords(filtered);

      filtered = filterEmailAndLinks(filtered);
    }
    return filtered;
  };

  const handleTextChange = (text: string) => {
    setMessageText(text);
  };

  // useEffect(() => {
  //   let isMounted = true;

  //   (async () => {
  //     try {
  //       const token = await AsyncStorage.getItem('userToken');
  //       console.log('TWILIO TOKEN:', token);
  //       if (!token) {
  //         console.warn('Twilio init: No token available');
  //         return;
  //       }
  //       const response = await fetchWithTimeout(
  //         `${MAIN_URL.baseUrl}twilio/auth-token`,
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         },
  //         15000,
  //       );

  //       if (!response.ok) {
  //         const errorData = await response.json().catch(() => ({}));
  //         throw new Error(errorData.message || `HTTP ${response.status}`);
  //       }

  //       const data = await response.json();
  //       console.log('Twilio token responseDATA:', data);

  //       if (!data?.data?.token) {
  //         throw new Error('Invalid token response from server');
  //       }

  //       if (!client) {
  //       const twilio = await new TwilioChatClient(data.data.token);

  //       console.log('Twilio client initialized: ', twilio);

  //       if (!twilio) {
  //         throw new Error('Failed to initialize Twilio client');
  //       }

  //       if (!isMounted) return;

  //       setChatClient(twilio);
  //       chatClientRef.current = twilio;
  //       activeTwilioClients.add(twilio);

  //       setTimeout(() => {
  //         if (twilio && isMounted) {
  //           twilio
  //             .getSubscribedConversations()
  //             .then((list: any) => {
  //               if (list?.items && isMounted) {
  //                 list.items.forEach((c: any) => {
  //                   if (c?.uniqueName) {
  //                     conversationCache[c.uniqueName] = c;
  //                   }
  //                 });
  //               }
  //             })
  //             .catch((err: any) => {
  //               console.warn('Preload conversations failed:', err.message);
  //             });
  //         }
  //       }, 500);
  //     } catch (error: any) {
  //       console.error('Twilio initialization failed:', error.message);
  //       if (error.name === 'AbortError') {
  //         console.error('Twilio token request timed out');
  //       }
  //       if (isMounted) {
  //       }
  //     }
  //   })();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, []);



  let globalChatClient: TwilioChatClient | null = null;  // ✅ singleton
  let isInitializing = false;



  useEffect(() => {
    let isMounted = true;
  
    const initTwilioStr = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return;
  
        const response = await fetch(
          `${MAIN_URL.baseUrl}twilio/auth-token`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("AUTH_TOKEN_API:",`${MAIN_URL.baseUrl}twilio/auth-token`)
  
        if (!response.ok) return;
  
        const data = await response.json();
        if (!data?.data?.token) return;
  
        let client;
  
        // ✅ SINGLETON LOGIC
        if (globalChatClient) {
          client = globalChatClient;
        } else if (!isInitializing) {
          isInitializing = true;
  
          try {
            const newClient = await new TwilioChatClient(data.data.token);
            client = newClient;
            console.log("Twilio client initialized (singleton)");
            if(globalChatClient !== null) {
              globalChatClient.current = client;
            }
          } catch (err) {
            console.log("Twilio init error:", err);
            isInitializing = false;
            throw err;
          }
  
          isInitializing = false;
        } else {
          // ⏳ wait if already initializing
          const waitForClient = () =>
            new Promise((resolve) => {
              const interval = setInterval(() => {
                if (globalChatClient) {
                  clearInterval(interval);
                  resolve(globalChatClient);
                }
              }, 100);
            });
  
          client = await waitForClient();
        }
  
        if (!isMounted) return;
  
        setChatClient(client);
  
      } catch (err) {
        console.warn("Twilio init failed on MessageScreen:", err);
      }
    };
  
    initTwilioStr();
  
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

        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');

        if (!chatClient) {
          throw new Error('Twilio client not initialized');
        }
        try {
          await waitForTwilioReady(chatClient, 15000);
        } catch (readyErr: any) {
          console.error('Twilio connection failed:', readyErr.message);
          throw new Error(`Twilio connection failed: ${readyErr.message}`);
        }

        let convName = userConvName;
        let apiData = null;

        if (source === 'sellerPage') {
          try {
            const res = await fetchWithTimeout(
              `${MAIN_URL.baseUrl}twilio/conversation-fetch`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ feature_id: sellerData.featureId }),
              },
              15000,
            );
            console.log("converstionFetect: ",JSON.stringify({ feature_id: sellerData.featureId,unreadcount: unreadCount }));

            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              throw new Error(errorData.message || `HTTP ${res.status}`);
            }

            apiData = await res.json();
            if (res.ok && apiData.data?.conv_name)
              convName = apiData.data.conv_name;
            console.log("apiData.data.restriction_applied", apiData.data.restriction_applied);
            setREstriction_applied(apiData.data.restriction_applied);

            if (!apiData.data) {
              setInitialLoading(false);
              return;
            }
          } catch (error: any) {
            console.error(
              'Failed to fetch conversation for sellerPage:',
              error.message,
            );
            if (error.name === 'AbortError') {
              console.error('Request timed out');
            }
            setInitialLoading(false);
            return;
          }
        }

        const persistedConvo = await loadJSON(
          CACHE_KEY_CONVO_PREFIX + convName,
        );
        const persistedMsgs = await loadJSON(CACHE_KEY_MSG_PREFIX + convName);

        if (persistedConvo && persistedMsgs) {
          conversationCache[convName] = persistedConvo;
          messageCache[convName] = persistedMsgs;

          setConversation(persistedConvo);
          setCheckUser(
            String(
              source === 'chatList'
                ? currentUserIdList
                : apiData?.data?.current_user_id || userId,
            ),
          );
          setCurrentUserId(String(userId));

          setMessages(
            [...(persistedMsgs || [])].sort(
              (a, b) =>
                new Date(b.dateCreated).getTime() -
                new Date(a.dateCreated).getTime(),
            ),
          );

          setInitialLoading(false);
          return;
        }
        const fetchTwilioFresh = async () => {
          let convo = conversationCache[convName] || null;

          if (!convo && conversationSid) {
            try {
              convo = await chatClient.getConversation(conversationSid);
            } catch (err: any) { }
          }
          if (!convo) {
            try {
              convo = await chatClient.getConversationByUniqueName(convName);
            } catch (err: any) {
              try {
                convo = await chatClient.createConversation({
                  uniqueName: convName,
                });
                // console.log("Created new conversation:", convName);
              } catch (createErr: any) {
                throw new Error(
                  `Failed to create conversation: ${createErr.message}`,
                );
              }
            }
          }

          if (!convo) {
            throw new Error('Failed to get or create conversation');
          }

          conversationCache[convName] = convo;
          try {
            await saveJSON(CACHE_KEY_CONVO_PREFIX + convName, convo);
          } catch (cacheErr: any) {
            console.warn(
              'Failed to save conversation to cache:',
              cacheErr.message,
            );
          }

          try {
            const participants = await convo.getParticipants();
            const alreadyJoined = participants.some(
              (p: any) => p.identity === userId,
            );
            if (!alreadyJoined) {
              await convo.join();
            }
          } catch (joinErr: any) {
            if (
              !joinErr.message?.includes('Conflict') &&
              !joinErr.message?.includes('already')
            ) {
              console.warn('Failed to join conversation:', joinErr.message);
            }
          }

          if (!isMounted) return;
          setConversation(convo);
          setCheckUser(
            String(
              source === 'chatList'
                ? currentUserIdList
                : apiData?.data?.current_user_id || userId,
            ),
          );
          setCurrentUserId(String(userId));
          let page;
          let items: any[] = [];

          try {
            page = await convo.getMessages(20);
            items = Array.isArray(page.items) ? page.items : [];
            messagesPageRef.current = page;

            if (items.length > 0) {
              const newestMessage = items[items.length - 1]; // newest message
              if (newestMessage?.index != null) {
                try {
                  await convo.advanceLastReadMessageIndex(newestMessage.index);
                } catch (err) {
                  console.log('Failed to advance read index on open:', err);
                }
              }
            }
          } catch (msgErr: any) {
            console.error('Failed to load messages:', msgErr.message);
            throw new Error(`Failed to load messages: ${msgErr.message}`);
          }
          markAsRead(convo).catch(err => {
            console.warn('markAsRead failed:', err.message);
          });

          messageCache[convName] = items;
          try {
            await saveJSON(CACHE_KEY_MSG_PREFIX + convName, items);
          } catch (cacheErr: any) {
            console.warn('Failed to save messages to cache:', cacheErr.message);
          }

          setMessages(
            [...items].sort(
              (a, b) =>
                new Date(b.dateCreated).getTime() -
                new Date(a.dateCreated).getTime(),
            ),
          );

          setHasMoreMessages(page.hasPrevPage);
          setInitialLoading(false);
        };

        await fetchTwilioFresh();
      } catch (err: any) {
        console.error('Conversation load failed:', err?.message || err);
        if (err?.message) {
          console.error('Error details:', {
            message: err.message,
            name: err.name,
            stack: err.stack?.substring(0, 200),
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
  const markAsRead = async (conversation: any) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('markAsRead: No token available');
        return;
      }
      const sid =
        typeof conversation === 'string'
          ? conversation
          : conversation?.sid || conversationSid;

      if (!sid) {
        console.warn('markAsRead: No conversation SID available');
        return;
      }

      const url = `${MAIN_URL.baseUrl}twilio/convo-read-update`;

      console.log("convo-read-update: ",url,JSON.stringify({
        twilio_conversation_sid: sid,
        unreadcount: unreadCount
      }));

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
            unreadcount: unreadCount !=0  ? unreadCount : 1
          }),
        },
        10000,
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn(
          'markAsRead API failed:',
          errorData.message || res.statusText,
        );
      }

      let badge = await getBadgeCount();
      if(badge !=0){
        badge = badge - unreadCount
      }
      console.log("badge: ",badge);
      await notifee.setBadgeCount(badge);
    } catch (error: any) {
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
        return [...prev, ...fresh].sort(
          (a, b) =>
            new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime(),
        );
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

    const handleMessageUpdated = ({ message }: any) => {
      setMessages(prev => prev.map(m => (m.sid === message.sid ? message : m)));
    };

    const handleParticipantUpdated = async () => {
      try {
        const participants = await conversation.getParticipants();
        const other = participants.find(
          (p: any) => String(p.identity) !== String(currentUserId),
        );

        if (other) {
          setOtherLastReadIndex(other.lastReadMessageIndex ?? null);
        }
      } catch (e) {
        console.warn('Failed to get participant read index');
      }
    };
    handleParticipantUpdated();
    conversation.on('messageUpdated', handleMessageUpdated);
    conversation.on('participantUpdated', handleParticipantUpdated);

    const handleNewMessage = async (m: any) => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId && !currentUserId) {
        setCurrentUserId(String(userId));
      }

      const messageAuthor = m.author || m.state?.author || m.attributes?.author;

      const isFromMe =
        String(messageAuthor) === String(checkUser) ||
        String(messageAuthor) === String(currentUserId) ||
        String(messageAuthor) === String(userId);

      setMessages(prev => {
        if (prev.find(msg => msg.sid === m.sid)) return prev;
        const updated = [...prev, m].sort((a, b) => {
          const timeA = new Date(a.dateCreated || a.timestamp).getTime();
          const timeB = new Date(b.dateCreated || b.timestamp).getTime();
          return timeB - timeA;
        });

        const convName = conversation.uniqueName;
        messageCache[convName] = updated;
        saveJSON(CACHE_KEY_MSG_PREFIX + convName, updated);

        return updated;
      });

      if (isFromMe) {
        shouldAutoScrollRef.current = true;
        requestAnimationFrame(() => {
          InteractionManager.runAfterInteractions(() => {
            setTimeout(() => {
              flatListRef.current?.scrollToOffset({
                offset: 0,
                animated: true,
              });
            }, 50);
          });
        });
      }
      // If message is from other user → mark as read

      if (String(messageAuthor) !== String(currentUserId)) {
        try {
          await conversation.advanceLastReadMessageIndex(m.index);
        } catch (err) {
          console.log('Failed to advance read index:', err);
        }
      }
    };

    conversation.addListener('messageAdded', handleNewMessage);

    return () => {
      conversation.removeListener('messageAdded', handleNewMessage);
      conversation.removeListener('messageUpdated', handleMessageUpdated);
      conversation.removeListener(
        'participantUpdated',
        handleParticipantUpdated,
      );
      conversation.removeListener('messageAdded', handleNewMessage);
    };
  }, [conversation, checkUser, currentUserId]);

  const getMessageStatus = (msg: any) => {
    if (!msg || msg.index == null) return 'sent';

    const author = msg.author || msg.state?.author || msg.attributes?.author;

    // Only show ticks for my messages
    if (String(author) !== String(currentUserId)) {
      return null;
    }

    if (otherLastReadIndex !== null && msg.index <= otherLastReadIndex) {
      return 'read';
    }

    return 'sent';
  };
  const handleSendMessage = async () => {
    const trimmed = messageText.trim();
    // const filteredMessage = applyChatRestrictions(messageText.trim());
    const filteredMessage = applyChatRestrictions(trimmed);

    if (!trimmed) {
      textInputRef.current?.focus();
      return;
    }

    if (!filteredMessage) {
      setMessageText('');
      textInputRef.current?.focus();
      return;
    }

    // Clear input immediately
    setMessageText('');
    shouldAutoScrollRef.current = true;

    try {
      const [token, userId] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('userId'),
      ]);

      // CASE 1: Conversation already exists
      if (conversation) {
        await conversation.sendMessage(filteredMessage);
        return;
      }

      // CASE 2: Create conversation first
      if (!sellerData?.featureId) {
        console.error('Missing featureId');
        return;
      }


      console.log('=== CREATE CONVERSATION REQUEST ===');
      console.log('URL:', `${MAIN_URL.baseUrl}twilio/conversation-create`);
      console.log('Payload:', JSON.stringify({ feature_id: sellerData.featureId }));

      const createResponse = await fetch(
        `${MAIN_URL.baseUrl}twilio/conversation-create`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ feature_id: sellerData.featureId }),
        },
      );

      const createData = await createResponse.json();

      console.log('createData', createData);

      if (!createResponse.ok || !createData?.data?.conv_name) {
        console.error('Conversation creation failed:', createData.message);
        return;
      }

      const convName = createData.data.conv_name;
      const apiUserId = createData.data.current_user_id;

      setCheckUser(String(apiUserId));

      if (userId) {
        setCurrentUserId(String(userId));
      }

      let convo;
      try {
        convo = await chatClient.getConversationByUniqueName(convName);
      } catch {
        convo = await chatClient.createConversation({ uniqueName: convName });
      }

      try {
        await convo.join();
      } catch (err: any) {
        if (!err.message?.includes('Conflict')) {
          console.error('Join error:', err);
        }
      }

      setConversation(convo);

      await new Promise(resolve => setTimeout(resolve, 50));
      await convo.sendMessage(filteredMessage);
    } catch (error) {
      console.error('Message send failed:', error);
    }
  };

  const getInitials = (firstName = '', lastName = '') =>
    (firstName?.[0] || '') + (lastName?.[0] || '');

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
      // Only keep bottom if user was already following newest — avoids jump to/from old msgs
      if (messagesReady && shouldAutoScrollRef.current) {
        requestAnimationFrame(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        });
      }
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [messagesReady]);

  useEffect(() => {
    if (!initialLoading && !layoutReady) {
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          setLayoutReady(true);
        }, 100);
      });
    }
  }, [initialLoading, layoutReady]);

  const formatMessageDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const messageDate = new Date(d);
    messageDate.setHours(0, 0, 0, 0);

    if (messageDate.getTime() === today.getTime()) {
      // return "Today";
      return t('today');
    }
    if (messageDate.getTime() === yesterday.getTime()) {
      return t('yesterday');
    }
    const day = d.getDate();
    const getSuffix = (n: number) => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };
    const lang = i18n.language;
    const suffix = lang == 'en' ? getSuffix(day) : '';

    const monthIndex = d.getMonth(); // 0–11
    const monthKeys = [
      'jan',
      'feb',
      'mar',
      'apr',
      'may',
      'jun',
      'jul',
      'aug',
      'sep',
      'oct',
      'nov',
      'dec',
    ];

    const monthShort = t ? t(monthKeys[monthIndex]) : monthKeys[monthIndex];
    const year = d.getFullYear();
    return `${day}${suffix} ${monthShort} ${year}`;
  };

  const buildMessageList = (messages: any[]) => {
    if (messages.length === 0) return [];
    const sortedMessages = [...messages].sort((a, b) => {
      const timeA = new Date(a.dateCreated || a.timestamp).getTime();
      const timeB = new Date(b.dateCreated || b.timestamp).getTime();
      return timeA - timeB;
    });

    const grouped: any[] = [];
    let lastDate: string | null = null;
    sortedMessages.forEach((msg, index) => {
      const created = msg.dateCreated || msg.timestamp;
      const dateLabel = formatMessageDate(new Date(created));
      if (lastDate !== dateLabel) {
        grouped.push({
          type: 'date',
          date: dateLabel,
          sid: `date-${dateLabel}-${index}`,
        });
        lastDate = dateLabel;
      }
      grouped.push({
        type: 'message',
        data: msg,
        sid: msg.sid || `msg-${index}`,
      });
    });
    return grouped.reverse();
  };

  const groupedMessages = React.useMemo(
    () => buildMessageList(messages),
    [messages],
  );
  const oldestDateIndex = React.useMemo(() => {
    for (let i = groupedMessages.length - 1; i >= 0; i--) {
      if (groupedMessages[i]?.type === 'date') {
        return i;
      }
    }
    return -1;
  }, [groupedMessages]);
  const lastMessageIndex = React.useMemo(() => {
    for (let i = 0; i < groupedMessages.length; i++) {
      if (groupedMessages[i]?.type === 'message') {
        return i;
      }
    }
    return -1;
  }, [groupedMessages]);
  const contentContainerStyle = React.useMemo(
    () => ({
      // Inverted list: flex-start pins short conversations to the visual bottom (above input)
      paddingTop: 12,
      paddingBottom: HEADER_CONTENT_PADDING,
      flexGrow: 1,
      justifyContent: 'flex-start' as const,
    }),
    [],
  );

  const prevMessagesLengthRef = useRef(messages.length);
  const lastUserMessageRef = useRef<string | null>(null);

  useEffect(() => {
    if (messages.length > 0 && !newestMessageSidRef.current) {
      newestMessageSidRef.current = messages[0]?.sid || null;
    }
  }, [messages.length === 0 ? null : messages[0]?.sid]);

  const scrollToNewest = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated });
    });
  }, []);

  const revealMessagesAtBottom = useCallback(() => {
    if (initialScrollDoneRef.current) {
      setMessagesReady(true);
      setLayoutReady(true);
      return;
    }
    // Snap to newest (inverted offset 0) before making the list visible
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      initialScrollDoneRef.current = true;
      setMessagesReady(true);
      setLayoutReady(true);
    });
  }, []);

  // When loading starts / conversation reloads — hide list again
  useEffect(() => {
    if (initialLoading) {
      initialScrollDoneRef.current = false;
      setMessagesReady(false);
    }
  }, [initialLoading]);

  // After messages load, position at bottom then reveal (no old-message flash)
  useEffect(() => {
    if (initialLoading) return;

    if (messages.length === 0) {
      initialScrollDoneRef.current = true;
      setMessagesReady(true);
      setLayoutReady(true);
      return;
    }

    const t1 = setTimeout(() => {
      revealMessagesAtBottom();
    }, 16);
    const t2 = setTimeout(() => {
      // Safety: always reveal even if FlatList ref was late
      if (!initialScrollDoneRef.current) {
        revealMessagesAtBottom();
      } else {
        setMessagesReady(true);
      }
    }, 120);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [initialLoading, messages.length === 0 ? 0 : 1, revealMessagesAtBottom]);

  useEffect(() => {
    if (
      messages.length > prevMessagesLengthRef.current &&
      messages.length > 0
    ) {
      const lastMessage = messages[0];
      const messageAuthor =
        lastMessage?.author ||
        lastMessage?.state?.author ||
        lastMessage?.attributes?.author;
      const isFromMe =
        String(messageAuthor) === String(checkUser) ||
        String(messageAuthor) === String(currentUserId);

      if (isFromMe && lastMessage?.sid !== lastUserMessageRef.current) {
        lastUserMessageRef.current = lastMessage?.sid || null;
        newestMessageSidRef.current = lastMessage?.sid || null;
        shouldAutoScrollRef.current = true;
        scrollToNewest(true);
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, checkUser, currentUserId, scrollToNewest]);

  const headerTop = Platform.OS === 'ios' ? 50 : 40;
  const headerHeight = 100;

  const isSendDisabled = initialLoading || !messageText.trim();

  const MessageStatusTicks = React.memo(({ message }: any) => {
    const status = getMessageStatus(message);

    if (status === 'sent') {
      return (
        <Image
          source={require('../../../assets/images/single_tick.png')}
          style={[styles.tickIcon, { tintColor: '#999' }]}
        />
      );
    }

    if (status === 'read') {
      return (
        <Image
          source={require('../../../assets/images/double_tick.png')}
          style={[styles.tickIcon, { tintColor: '#4FC3F7' }]}
        />
      );
    }

    return null;
  });

  const renderItem = React.useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const isFromCurrentUser = (msg: any) => {
        if (!msg || !msg.data) return false;
        const author =
          msg.data.author ||
          msg.data.state?.author ||
          msg.data.attributes?.author;
        const authorStr = String(author || '');
        const checkUserStr = String(checkUser || '');
        const currentUserIdStr = String(currentUserId || '');
        return authorStr === checkUserStr || authorStr === currentUserIdStr;
      };

      const isLastMessage = index === lastMessageIndex;
      const isMyMessage = isFromCurrentUser(item);
      const BASE_SPACING = 0;
      const bottomPadding = BASE_SPACING;

      return (
        <>
          {item?.type === 'date' ? (
            <View style={{ alignItems: 'center', marginVertical: 10 }}>
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
                  ? t('loading')
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
                <View
                  style={[
                    styles.bubble,
                    isMyMessage ? styles.rightBubble : styles.leftBubble,
                  ]}
                >
                  <Text allowFontScaling={false} style={styles.messageText}>
                    {item?.data?.state?.body || item?.data?.body}
                  </Text>
                  {isMyMessage && (
                    <View style={styles.tickContainer}>
                      <MessageStatusTicks message={item.data} />
                    </View>
                  )}
                </View>

                {isMyMessage && (
                  <>
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
                  </>
                )}
              </View>
            </View>
          )}
        </>
      );
    },
    [checkUser, currentUserId, lastMessageIndex, otherLastReadIndex],
  );
  return (
    // <BackgroundWrapper>
    <ImageBackground
                  source={BACK_ICON}
                  style={{ flex: 1,width: '100%',
                height: '100%', }}
                  resizeMode="cover"
                >
      <View style={{ flex: 1 }}>
        {(!messagesReady || initialLoading) && (
          <Loader
            containerStyle={{
              position: 'absolute',
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
                  if (Platform.OS === 'ios') {
                    if (navigation.canGoBack()) {
                      navigation.goBack();
                    } else {
                      if (source === 'chatList') {
                        navigation.reset({
                          index: 0,
                          routes: [
                            {
                              name: 'Dashboard',
                              params: {
                                resetToLogin: true,
                                AddScreenBackactiveTab: 'Bookmark',
                                isNavigate: false,
                              },
                            },
                          ],
                        });
                      }
                      navigation.goBack();
                    }
                  } else {
                    if (source === 'sellerPage') {
                      navigation.goBack();
                    } else {
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
                <MessageHeaderButton
                  title={
                    <Text allowFontScaling={false} style={styles.studentName}>
                      {source === 'chatList'
                        ? members?.firstname
                        : sellerData.firstname}{' '}
                      {source === 'chatList'
                        ? members?.lastname
                        : sellerData.lastname}
                    </Text>
                  }
                />
              </View>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('UserProfileScreen', {
                    animation: 'none',
                    members: source == 'chatList' ? members : sellerData,
                  });
                }}
              >
                <ImageBackground
                  source={require('../../../assets/images/profilebutton.png')}
                  style={{
                    height: 48,
                    width: 48,
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
                </ImageBackground>
              </TouchableOpacity>
            </View>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          // Android uses windowSoftInputMode=adjustResize — avoid double-shifting
          enabled={Platform.OS === 'ios'}
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
              inverted
              style={{ flex: 1, opacity: messagesReady ? 1 : 0 }}
              pointerEvents={messagesReady ? 'auto' : 'none'}
              removeClippedSubviews={Platform.OS === 'android'}
              extraData={[lastMessageIndex, loadingOlderMessages, messagesReady]}
              keyExtractor={(item, index) =>
                item.sid || item.data?.sid || `item-${index}`
              }
              maintainVisibleContentPosition={
                !messagesReady || keyboardVisible
                  ? undefined
                  : {
                      minIndexForVisible: 1,
                    }
              }
              onScroll={event => {
                if (!messagesReady) return;
                const offsetY = event.nativeEvent.contentOffset.y;
                const isAtBottom = offsetY <= 10;

                if (isAtBottom && messages.length > 0 && conversation) {
                  const newestMessage = messages[0]; // because list is inverted
                  if (newestMessage?.index != null) {
                    conversation
                      .advanceLastReadMessageIndex(newestMessage.index)
                      .catch(() => { });
                  }
                }

                const contentHeight = event.nativeEvent.contentSize.height;
                const viewportHeight =
                  event.nativeEvent.layoutMeasurement.height;
                scrollY.value = offsetY;
                const maxScrollY = Math.max(0, contentHeight - viewportHeight);
                const distanceFromTop = maxScrollY - offsetY;
                const isAtTop = distanceFromTop <= 10;
                hasScrollableContent.value =
                  contentHeight > viewportHeight && !isAtTop;

                if (offsetY > 30) {
                  shouldAutoScrollRef.current = false;
                } else if (isAtBottom) {
                  shouldAutoScrollRef.current = true;
                }
                const threshold = maxScrollY * 0.25;

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
              scrollEnabled={messagesReady}
              ListHeaderComponent={null}
              onScrollToIndexFailed={() => {
                setTimeout(() => {
                  flatListRef.current?.scrollToOffset({
                    offset: 0,
                    animated: false,
                  });
                }, 100);
              }}
              renderItem={renderItem}
              ref={flatListRef}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              onContentSizeChange={(_width, height) => {
                const prevHeight = contentHeightRef.current;
                contentHeightRef.current = height;
                updateBlurState();

                // First layout after load: pin to newest then reveal
                if (!initialScrollDoneRef.current && !initialLoading && height > 0) {
                  revealMessagesAtBottom();
                  return;
                }

                if (
                  !messagesReady ||
                  loadingFromScrollRef.current ||
                  loadingOlderMessages
                ) {
                  return;
                }
                if (
                  height > prevHeight &&
                  prevHeight > 0 &&
                  flatListRef.current
                ) {
                  const newestMessage =
                    messages.length > 0 ? messages[0] : null;
                  const newestMessageSid = newestMessage?.sid || null;
                  if (newestMessageSid === newestMessageSidRef.current) {
                    return;
                  }
                  newestMessageSidRef.current = newestMessageSid;

                  const messageAuthor =
                    newestMessage?.author ||
                    newestMessage?.state?.author ||
                    newestMessage?.attributes?.author;
                  const isFromMe =
                    String(messageAuthor) === String(checkUser) ||
                    String(messageAuthor) === String(currentUserId);

                  if (isFromMe || shouldAutoScrollRef.current) {
                    if (isFromMe) {
                      shouldAutoScrollRef.current = true;
                    }
                    scrollToNewest(true);
                  }
                }
              }}
              onLayout={event => {
                const { height } = event.nativeEvent.layout;
                viewportHeightRef.current = height;
                updateBlurState();
                if (
                  !initialScrollDoneRef.current &&
                  !initialLoading &&
                  messages.length > 0 &&
                  height > 0
                ) {
                  revealMessagesAtBottom();
                }
              }}
              contentContainerStyle={contentContainerStyle}
              showsVerticalScrollIndicator={false}
            />
            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: Platform.OS === 'ios' ? 0 : 8,
                paddingBottom: Platform.OS === 'ios'
                  ? keyboardVisible
                    ? 8
                    : 30
                  : keyboardVisible
                    ? 8
                    : 34,
                backgroundColor: 'transparent',
              }}
            >
              {chatUser?.blocked_you ? (
                <View style={styles.blockBanner}>
                  <Image
                    source={require('../../../assets/images/block_triangle.png')}
                    style={styles.blockIcon}
                  />
                  <Text style={styles.blockText}>{t('block_info_user')}</Text>
                </View>
              ) : chatUser?.isblocked ? (
                <View style={styles.blockBanner}>
                  <Image
                    source={require('../../../assets/images/block_triangle.png')}
                    style={styles.blockIcon}
                  />
                  <Text style={styles.blockText}>{t('block_info')}</Text>
                </View>
              ) : (
                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <BlurView
                      style={styles.inputBlur}
                      blurType="light"
                      blurAmount={5}
                      reducedTransparencyFallbackColor="#ffffff34"
                    />

                    <TextInput
                      ref={textInputRef}
                      allowFontScaling={false}
                      style={styles.textInput}
                      placeholder={t('message')}
                      placeholderTextColor="#F5F5F5"
                      onChangeText={handleTextChange}
                      value={messageText}
                      cursorColor="#F5F5F5"
                      selectionColor="#F5F5F5"
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleSendMessage}
                    disabled={isSendDisabled}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={[
                      styles.sendButton,
                      { opacity: isSendDisabled ? 0.5 : 1 },
                    ]}
                  >
                    <BlurView
                      style={styles.sendButtonBlur}
                      blurType="light"
                      blurAmount={10}
                      reducedTransparencyFallbackColor="#ffffff66"
                    />

                    <Image
                      source={require('../../../assets/images/sendmessage.png')}
                      style={styles.sendIcon}
                    />
                  </TouchableOpacity>
                </View>
              )}

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
      <NewCustomToastContainer />
      {/* </BackgroundWrapper> */}
      </ImageBackground>
  );
};

export default MessagesIndividualScreen;

const styles = StyleSheet.create({
  tickContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },

  tickIcon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
    marginLeft: 5,
    marginTop: 5,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    borderRadius: 40,
    height: 48,
    paddingHorizontal: 16,
    paddingVertical: 4,
    overflow: 'hidden',
    position: 'relative',
  },

  inputBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
  },

  textInput: {
    flex: 1,
    color: '#fff',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    marginLeft: Platform.OS === 'ios' ? 5 : 0,
  },

  sendButton: {
    marginLeft: 8,
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  sendButtonBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },

  /* ===== Blocked Banner ===== */
  blockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
    padding: 12,
    borderWidth: 0.5,
    borderRadius: 12,
    borderColor: '#ffffff31',
    justifyContent: 'center',
  },

  blockIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
    zIndex: 1,
    marginLeft: 8,
  },

  blockText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    opacity: 0.8,
    paddingLeft: 8,
  },

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
  },

  sendIcon: {
    width: 20,
    height: 20,
  },
 
  backIconStyle: {
    width: 30,
    height: 30,
  },
  studentName: {
    color: 'rgba(0, 30, 80, 1)',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    fontSize: 14,
    // marginBottom: 2,
    // paddingLeft: 16,
    // paddingRight: 16
  },
  
  profileImage: {
    width: 40,
    height: 40,
    margin: 4,
    borderRadius: 100,
  },

  messageContainer: {
    paddingHorizontal: 6,
  },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginVertical: 0,
    maxWidth: '75%',
    flexDirection: 'row',
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
    fontSize: 16,
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
    width: 40,
    height: 40,
    margin: 4,
    borderRadius: 25,
  },
  initialsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
  },

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
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: 48,
    height: 48,
  },
});
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import notifee from '@notifee/react-native';

// import {
//   Dimensions,
//   FlatList,
//   Image,
//   ImageBackground,
//   Keyboard,
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { MAIN_URL } from '../../utils/APIConstant';
// import { Client as TwilioChatClient } from '@twilio/conversations';
// import { RouteProp, useRoute } from '@react-navigation/native';
// import { InteractionManager } from 'react-native';
// import { BlurView } from '@react-native-community/blur';
// import LinearGradient from 'react-native-linear-gradient';
// import MaskedView from '@react-native-masked-view/masked-view';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   interpolate,
// } from 'react-native-reanimated';
// import { waitForTwilioReady } from '../../view/emoji/twilioService';
// import Loader from '../../utils/component/Loader';

// import { useTranslation } from 'react-i18next';
// import i18n from '../../../localization/i18n';
// import MessageHeaderButton from '../../utils/component/MessageHeaderButton';
// import { NewCustomToastContainer,showToast } from '../../utils/component/NewCustomToastManager';
// import { getBadgeCount } from '../../utils/BadgeManager';


// import  back from '../../../assets/images/back.png';

// import BACK_ICON from '../../../assets/images/backimg.png';



// type MessagesIndividualScreenProps = {
//   navigation: any;
// };

// type RouteParams = {
//   source?: 'chatList' | 'sellerPage';
//   members: {
//     firstname: string;
//     lastname: string;
//     id: number;
//     profile: string | null;
//     isblocked: boolean;
//     blocked_you: boolean;
//     university: { id: number; name: string };
//   };
//   userConvName: string;
//   currentUserIdList: number;
//   getrestriction_applied: boolean,

//   sellerData: {
//     featureId: number;
//     firstname: string;
//     lastname: string;
//     profile: string | null;
//     universityName: { id: number; name: string };
//     id: number;
//     isblocked: boolean;
//     blocked_you: boolean;
//   };
//   conversationSid: string;
//   unreadCount: number,
// };

// const conversationCache: any = {};
// const messageCache: any = {};

// const CACHE_KEY_CONVO_PREFIX = 'twilio_convo_';
// const CACHE_KEY_MSG_PREFIX = 'twilio_msg_';

// const activeTwilioClients = new Set();
// export const clearTwilioCache = async () => {
//   try {
//     Object.keys(conversationCache).forEach(
//       key => delete conversationCache[key],
//     );
//     Object.keys(messageCache).forEach(key => delete messageCache[key]);
//     const allKeys = await AsyncStorage.getAllKeys();
//     const twilioKeys = allKeys.filter(
//       key =>
//         key.startsWith(CACHE_KEY_CONVO_PREFIX) ||
//         key.startsWith(CACHE_KEY_MSG_PREFIX),
//     );

//     if (twilioKeys.length > 0) {
//       await AsyncStorage.multiRemove(twilioKeys);
//       if (__DEV__) {
//       }
//     }
//     activeTwilioClients.forEach((client: any) => {
//       try {
//         if (client && typeof client.removeAllListeners === 'function') {
//           client.removeAllListeners();
//         }
//         if (client && typeof client.shutdown === 'function') {
//           client.shutdown().catch(() => { });
//         }
//       } catch (err) {
//         console.warn('Error resetting Twilio client:', err);
//       }
//     });
//     activeTwilioClients.clear();
//   } catch (err) {
//     console.warn('⚠️ Error clearing Twilio cache:', err);
//   }
// };

// const saveJSON = async (key: any, value: any) => {
//   try {
//     await AsyncStorage.setItem(key, JSON.stringify(value));
//   } catch (err: any) {
//     if (__DEV__) {
//       console.warn('Cache save failed:', err.message);
//     }
//   }
// };

// const loadJSON = async (key: any) => {
//   try {
//     const raw = await AsyncStorage.getItem(key);
//     return raw ? JSON.parse(raw) : null;
//   } catch (err: any) {
//     if (__DEV__) {
//       console.warn('Cache load failed:', err.message);
//     }
//     return null;
//   }
// };

// const fetchWithTimeout = async (
//   url: string,
//   options: RequestInit = {},
//   timeoutMs: number = 15000,
// ): Promise<Response> => {
//   if (typeof AbortController === 'undefined') {
//     throw new Error('AbortController not available');
//   }

//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

//   try {
//     const response = await fetch(url, {
//       ...options,
//       signal: controller.signal,
//     });
//     clearTimeout(timeoutId);
//     return response;
//   } catch (error: any) {
//     clearTimeout(timeoutId);
//     if (error.name === 'AbortError') {
//       throw new Error(`Request timeout after ${timeoutMs}ms`);
//     }
//     throw error;
//   }
// };

// const MessagesIndividualScreen = ({
//   navigation,
// }: MessagesIndividualScreenProps) => {
//   const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
//   const {
//     members,
//     sellerData,
//     userConvName,
//     currentUserIdList,
//     source,
//     conversationSid,
//     unreadCount,
//     getrestriction_applied
//   } = route.params;

//   const chatUser = source === 'sellerPage' ? sellerData : members;
//   const [isblock, setisblock] = useState(true);
//   const [chatClient, setChatClient] = useState<any>(null);
//   const chatClientRef = useRef<any>(null); // Track client for cleanup

//   const [conversation, setConversation] = useState<any>(null);

//   const [messages, setMessages] = useState<any[]>([]);
//   const [messagesDateTime, setMessagesDateTime] = useState<any[]>([]);

//   const [messageText, setMessageText] = useState('');
//   const [checkUser, setCheckUser] = useState<string | null>(null);
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);

//   const [hasMoreMessages, setHasMoreMessages] = useState(true);
//   const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
//   const messagesPageRef = useRef<any>(null);

//   const [initialLoading, setInitialLoading] = useState(true);
//   const [layoutReady, setLayoutReady] = useState(false);
//   const [kavKey, setKavKey] = useState(0);

//   const { width, height } = Dimensions.get('window');
//   const flatListRef = useRef<FlatList>(null);
//   const textInputRef = useRef<TextInput>(null);
//   const loadingFromScrollRef = useRef(false);
//   const shouldAutoScrollRef = useRef(true);
//   const newestMessageSidRef = useRef<string | null>(null);

//   const hasScrollableContent = useSharedValue(false);
//   const contentHeightRef = useRef(0);
//   const viewportHeightRef = useRef(0);
//   const scrollY = useSharedValue(0);
//   const { t } = useTranslation();

//   const [restriction_applied ,setREstriction_applied ]= useState(true);

//   const [otherLastReadIndex, setOtherLastReadIndex] = useState<number | null>(
//     null,
//   );

//   const updateBlurState = () => {
//     if (contentHeightRef.current > 0 && viewportHeightRef.current > 0) {
//       hasScrollableContent.value =
//         contentHeightRef.current > viewportHeightRef.current;
//     }
//   };

//   const animatedBlurStyle = useAnimatedStyle(() => {
//     'worklet';
//     const opacity = interpolate(scrollY.value, [0, 300], [0, 1], 'clamp');
//     return { opacity };
//   });

//   const INPUT_BAR_HEIGHT = Platform.OS === 'ios' ? 70 : 64;

//   const [keyboardVisible, setKeyboardVisible] = useState(false);
//   const [keyboardHeight, setKeyboardHeight] = useState(0);
//   const windowHeightRef = useRef(Dimensions.get('window').height);
//   const keyboardHeightRef = useRef(0);
//   const keyboardHeightSetRef = useRef(false);
//   useEffect(() => {
//     const subscription = Dimensions.addEventListener('change', ({ window }) => {
//       windowHeightRef.current = window.height;
//     });
//     return () => subscription?.remove();
//   }, []);

//   // const filterEmailAndLinks = (text: string): string => {
//   //   let filtered = text;
//   //   const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

//   // if (emailRegex.test(filtered)) {
//   //   showToast(t('email_error'),'error');
//   // }

//   //   filtered = filtered.replace(emailRegex, '');

//   //   const urlRegex = /((https?:\/\/|www\.)[^\s]+)/gi;
//   //   filtered = filtered.replace(urlRegex, '');

//   //   const domainRegex =
//   //     /\b[a-zA-Z0-9-]+\.(com|net|org|in|co|io|gov|edu|info|biz|me|app|dev|ai|uk|us|ca|au|de|fr|jp|cn)\b/gi;
//   //   filtered = filtered.replace(domainRegex, '');

//   //   return filtered;
//   // };

//   const filterEmailAndLinks = (text: string): string => {
//   let filtered = text;

//   const emailRegex =
//     /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;

//   const urlRegex =
//     /((https?:\/\/|www\.)[^\s]+)/i;

//   const domainRegex =
//     /\b[a-zA-Z0-9-]+\.(com|net|org|in|co|io|gov|edu|info|biz|me|app|dev|ai|uk|us|ca|au|de|fr|jp|cn)\b/i;

//   if (
//     emailRegex.test(filtered) ||
//     urlRegex.test(filtered) ||
//     domainRegex.test(filtered)
//   ) {
//     Keyboard.dismiss();
//     showToast(t('email_error'), 'error');
//   }

//   // Now remove globally
//   filtered = filtered.replace(
//     /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
//     '',
//   );

//   filtered = filtered.replace(
//     /((https?:\/\/|www\.)[^\s]+)/gi,
//     '',
//   );

//   filtered = filtered.replace(
//     /\b[a-zA-Z0-9-]+\.(com|net|org|in|co|io|gov|edu|info|biz|me|app|dev|ai|uk|us|ca|au|de|fr|jp|cn)\b/gi,
//     '',
//   );

//   return filtered;
// };
//   const filterNumbersAndNumberWords = (text: string): string => {
//     let digitCount = 0;

//     let filtered = text.replace(/\d/g, digit => {
//       digitCount++;
//       return digitCount <= 3 ? digit : '*';
//     });

//     const numberWords = [
//       'zero',
//       'one',
//       'two',
//       'three',
//       'four',
//       'five',
//       'six',
//       'seven',
//       'eight',
//       'nine',
//       'ten',
//       'eleven',
//       'twelve',
//       'thirteen',
//       'fourteen',
//       'fifteen',
//       'sixteen',
//       'seventeen',
//       'eighteen',
//       'nineteen',
//       'twenty',
//       'thirty',
//       'forty',
//       'fifty',
//       'sixty',
//       'seventy',
//       'eighty',
//       'ninety',
//       'hundred',
//       'thousand',
//       'million',
//       'billion',
//       'trillion',
//     ];

//     const numberWordsPattern = new RegExp(
//       `\\b(${numberWords.join('|')})\\b`,
//       'gi',
//     );

//     if (numberWordsPattern.test(text)) {
//   Keyboard.dismiss();
//   showToast(t('email_error'),'error');
//   return '';
// }

//     filtered = filtered.replace(numberWordsPattern, '');

//     filtered = filtered.replace(/\s{2,}/g, ' ').trim();
    

//     return filtered;
//   };

//   const applyChatRestrictions = (text: string): string => {
//     let filtered = text;

//     const restrictionFlag =
//       source === 'sellerPage'
//         ? restriction_applied:
//         getrestriction_applied;

//     if (restrictionFlag) {
//       filtered = filterNumbersAndNumberWords(filtered);

//       filtered = filterEmailAndLinks(filtered);
//     }
//     return filtered;
//   };

//   const handleTextChange = (text: string) => {
//     setMessageText(text);
//   };

//   // useEffect(() => {
//   //   let isMounted = true;

//   //   (async () => {
//   //     try {
//   //       const token = await AsyncStorage.getItem('userToken');
//   //       console.log('TWILIO TOKEN:', token);
//   //       if (!token) {
//   //         console.warn('Twilio init: No token available');
//   //         return;
//   //       }
//   //       const response = await fetchWithTimeout(
//   //         `${MAIN_URL.baseUrl}twilio/auth-token`,
//   //         {
//   //           headers: { Authorization: `Bearer ${token}` },
//   //         },
//   //         15000,
//   //       );

//   //       if (!response.ok) {
//   //         const errorData = await response.json().catch(() => ({}));
//   //         throw new Error(errorData.message || `HTTP ${response.status}`);
//   //       }

//   //       const data = await response.json();
//   //       console.log('Twilio token responseDATA:', data);

//   //       if (!data?.data?.token) {
//   //         throw new Error('Invalid token response from server');
//   //       }

//   //       if (!client) {
//   //       const twilio = await new TwilioChatClient(data.data.token);

//   //       console.log('Twilio client initialized: ', twilio);

//   //       if (!twilio) {
//   //         throw new Error('Failed to initialize Twilio client');
//   //       }

//   //       if (!isMounted) return;

//   //       setChatClient(twilio);
//   //       chatClientRef.current = twilio;
//   //       activeTwilioClients.add(twilio);

//   //       setTimeout(() => {
//   //         if (twilio && isMounted) {
//   //           twilio
//   //             .getSubscribedConversations()
//   //             .then((list: any) => {
//   //               if (list?.items && isMounted) {
//   //                 list.items.forEach((c: any) => {
//   //                   if (c?.uniqueName) {
//   //                     conversationCache[c.uniqueName] = c;
//   //                   }
//   //                 });
//   //               }
//   //             })
//   //             .catch((err: any) => {
//   //               console.warn('Preload conversations failed:', err.message);
//   //             });
//   //         }
//   //       }, 500);
//   //     } catch (error: any) {
//   //       console.error('Twilio initialization failed:', error.message);
//   //       if (error.name === 'AbortError') {
//   //         console.error('Twilio token request timed out');
//   //       }
//   //       if (isMounted) {
//   //       }
//   //     }
//   //   })();

//   //   return () => {
//   //     isMounted = false;
//   //   };
//   // }, []);



//   let globalChatClient: TwilioChatClient | null = null;  // ✅ singleton
//   let isInitializing = false;



//   useEffect(() => {
//     let isMounted = true;
  
//     const initTwilioStr = async () => {
//       try {
//         const token = await AsyncStorage.getItem("userToken");
//         if (!token) return;
  
//         const response = await fetch(
//           `${MAIN_URL.baseUrl}twilio/auth-token`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         console.log("AUTH_TOKEN_API:",`${MAIN_URL.baseUrl}twilio/auth-token`)
  
//         if (!response.ok) return;
  
//         const data = await response.json();
//         if (!data?.data?.token) return;
  
//         let client;
  
//         // ✅ SINGLETON LOGIC
//         if (globalChatClient) {
//           client = globalChatClient;
//         } else if (!isInitializing) {
//           isInitializing = true;
  
//           try {
//             const newClient = await new TwilioChatClient(data.data.token);
//             client = newClient;
//             console.log("Twilio client initialized (singleton)");
//             if(globalChatClient !== null) {
//               globalChatClient.current = client;
//             }
//           } catch (err) {
//             console.log("Twilio init error:", err);
//             isInitializing = false;
//             throw err;
//           }
  
//           isInitializing = false;
//         } else {
//           // ⏳ wait if already initializing
//           const waitForClient = () =>
//             new Promise((resolve) => {
//               const interval = setInterval(() => {
//                 if (globalChatClient) {
//                   clearInterval(interval);
//                   resolve(globalChatClient);
//                 }
//               }, 100);
//             });
  
//           client = await waitForClient();
//         }
  
//         if (!isMounted) return;
  
//         setChatClient(client);
  
//       } catch (err) {
//         console.warn("Twilio init failed on MessageScreen:", err);
//       }
//     };
  
//     initTwilioStr();
  
//     return () => {
//       isMounted = false;
//     };
//   }, []);


//   useEffect(() => {
//     if (!chatClient) return;

//     let isMounted = true;

//     const loadConversation = async () => {
//       try {
//         setInitialLoading(true);

//         const token = await AsyncStorage.getItem('userToken');
//         const userId = await AsyncStorage.getItem('userId');

//         if (!chatClient) {
//           throw new Error('Twilio client not initialized');
//         }
//         try {
//           await waitForTwilioReady(chatClient, 15000);
//         } catch (readyErr: any) {
//           console.error('Twilio connection failed:', readyErr.message);
//           throw new Error(`Twilio connection failed: ${readyErr.message}`);
//         }

//         let convName = userConvName;
//         let apiData = null;

//         if (source === 'sellerPage') {
//           try {
//             const res = await fetchWithTimeout(
//               `${MAIN_URL.baseUrl}twilio/conversation-fetch`,
//               {
//                 method: 'POST',
//                 headers: {
//                   Authorization: `Bearer ${token}`,
//                   'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ feature_id: sellerData.featureId }),
//               },
//               15000,
//             );
//             console.log("converstionFetect: ",JSON.stringify({ feature_id: sellerData.featureId,unreadcount: unreadCount }));

//             if (!res.ok) {
//               const errorData = await res.json().catch(() => ({}));
//               throw new Error(errorData.message || `HTTP ${res.status}`);
//             }

//             apiData = await res.json();
//             if (res.ok && apiData.data?.conv_name)
//               convName = apiData.data.conv_name;
//             console.log("apiData.data.restriction_applied", apiData.data.restriction_applied);
//             setREstriction_applied(apiData.data.restriction_applied);

//             if (!apiData.data) {
//               setInitialLoading(false);
//               return;
//             }
//           } catch (error: any) {
//             console.error(
//               'Failed to fetch conversation for sellerPage:',
//               error.message,
//             );
//             if (error.name === 'AbortError') {
//               console.error('Request timed out');
//             }
//             setInitialLoading(false);
//             return;
//           }
//         }

//         const persistedConvo = await loadJSON(
//           CACHE_KEY_CONVO_PREFIX + convName,
//         );
//         const persistedMsgs = await loadJSON(CACHE_KEY_MSG_PREFIX + convName);

//         if (persistedConvo && persistedMsgs) {
//           conversationCache[convName] = persistedConvo;
//           messageCache[convName] = persistedMsgs;

//           setConversation(persistedConvo);
//           setCheckUser(
//             String(
//               source === 'chatList'
//                 ? currentUserIdList
//                 : apiData?.data?.current_user_id || userId,
//             ),
//           );
//           setCurrentUserId(String(userId));

//           setMessages(
//             [...(persistedMsgs || [])].sort(
//               (a, b) =>
//                 new Date(b.dateCreated).getTime() -
//                 new Date(a.dateCreated).getTime(),
//             ),
//           );

//           setInitialLoading(false);
//           return;
//         }
//         const fetchTwilioFresh = async () => {
//           let convo = conversationCache[convName] || null;

//           if (!convo && conversationSid) {
//             try {
//               convo = await chatClient.getConversation(conversationSid);
//             } catch (err: any) { }
//           }
//           if (!convo) {
//             try {
//               convo = await chatClient.getConversationByUniqueName(convName);
//             } catch (err: any) {
//               try {
//                 convo = await chatClient.createConversation({
//                   uniqueName: convName,
//                 });
//                 // console.log("Created new conversation:", convName);
//               } catch (createErr: any) {
//                 throw new Error(
//                   `Failed to create conversation: ${createErr.message}`,
//                 );
//               }
//             }
//           }

//           if (!convo) {
//             throw new Error('Failed to get or create conversation');
//           }

//           conversationCache[convName] = convo;
//           try {
//             await saveJSON(CACHE_KEY_CONVO_PREFIX + convName, convo);
//           } catch (cacheErr: any) {
//             console.warn(
//               'Failed to save conversation to cache:',
//               cacheErr.message,
//             );
//           }

//           try {
//             const participants = await convo.getParticipants();
//             const alreadyJoined = participants.some(
//               (p: any) => p.identity === userId,
//             );
//             if (!alreadyJoined) {
//               await convo.join();
//             }
//           } catch (joinErr: any) {
//             if (
//               !joinErr.message?.includes('Conflict') &&
//               !joinErr.message?.includes('already')
//             ) {
//               console.warn('Failed to join conversation:', joinErr.message);
//             }
//           }

//           if (!isMounted) return;
//           setConversation(convo);
//           setCheckUser(
//             String(
//               source === 'chatList'
//                 ? currentUserIdList
//                 : apiData?.data?.current_user_id || userId,
//             ),
//           );
//           setCurrentUserId(String(userId));
//           let page;
//           let items: any[] = [];

//           try {
//             page = await convo.getMessages(20);
//             items = Array.isArray(page.items) ? page.items : [];
//             messagesPageRef.current = page;

//             if (items.length > 0) {
//               const newestMessage = items[items.length - 1]; // newest message
//               if (newestMessage?.index != null) {
//                 try {
//                   await convo.advanceLastReadMessageIndex(newestMessage.index);
//                 } catch (err) {
//                   console.log('Failed to advance read index on open:', err);
//                 }
//               }
//             }
//           } catch (msgErr: any) {
//             console.error('Failed to load messages:', msgErr.message);
//             throw new Error(`Failed to load messages: ${msgErr.message}`);
//           }
//           markAsRead(convo).catch(err => {
//             console.warn('markAsRead failed:', err.message);
//           });

//           messageCache[convName] = items;
//           try {
//             await saveJSON(CACHE_KEY_MSG_PREFIX + convName, items);
//           } catch (cacheErr: any) {
//             console.warn('Failed to save messages to cache:', cacheErr.message);
//           }

//           setMessages(
//             [...items].sort(
//               (a, b) =>
//                 new Date(b.dateCreated).getTime() -
//                 new Date(a.dateCreated).getTime(),
//             ),
//           );

//           setHasMoreMessages(page.hasPrevPage);
//           setInitialLoading(false);
//         };

//         await fetchTwilioFresh();
//       } catch (err: any) {
//         console.error('Conversation load failed:', err?.message || err);
//         if (err?.message) {
//           console.error('Error details:', {
//             message: err.message,
//             name: err.name,
//             stack: err.stack?.substring(0, 200),
//           });
//         }

//         setInitialLoading(false);
//       }
//     };

//     loadConversation();
//     return () => {
//       isMounted = false;
//     };
//   }, [chatClient]);
//   const markAsRead = async (conversation: any) => {
//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       if (!token) {
//         console.warn('markAsRead: No token available');
//         return;
//       }
//       const sid =
//         typeof conversation === 'string'
//           ? conversation
//           : conversation?.sid || conversationSid;

//       if (!sid) {
//         console.warn('markAsRead: No conversation SID available');
//         return;
//       }

//       const url = `${MAIN_URL.baseUrl}twilio/convo-read-update`;

//       console.log("convo-read-update: ",url,JSON.stringify({
//         twilio_conversation_sid: sid,
//         unreadcount: unreadCount
//       }));

//       const res = await fetchWithTimeout(
//         url,
//         {
//           method: 'POST',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             twilio_conversation_sid: sid,
//             unreadcount: unreadCount !=0  ? unreadCount : 1
//           }),
//         },
//         10000,
//       );

//       if (!res.ok) {
//         const errorData = await res.json().catch(() => ({}));
//         console.warn(
//           'markAsRead API failed:',
//           errorData.message || res.statusText,
//         );
//       }

//       let badge = await getBadgeCount();
//       if(badge !=0){
//         badge = badge - unreadCount
//       }
//       console.log("badge: ",badge);
//       await notifee.setBadgeCount(badge);
//     } catch (error: any) {
//       if (error.name !== 'AbortError') {
//         console.warn('markAsRead error:', error.message);
//       }
//     }
//   };

//   const loadOlderMessages = useCallback(async () => {
//     if (!messagesPageRef.current?.hasPrevPage) return;
//     if (loadingOlderMessages) return;

//     setLoadingOlderMessages(true);
//     loadingFromScrollRef.current = true;

//     try {
//       const prevPage = await messagesPageRef.current.prevPage();
//       messagesPageRef.current = prevPage;
//       setMessages(prev => {
//         const existing = new Set(prev.map(m => m.sid));
//         const fresh = prevPage.items.filter((m: any) => !existing.has(m.sid));
//         return [...prev, ...fresh].sort(
//           (a, b) =>
//             new Date(b.dateCreated).getTime() -
//             new Date(a.dateCreated).getTime(),
//         );
//       });
//     } catch (error) {
//       console.error('Failed to load older messages:', error);
//     } finally {
//       setLoadingOlderMessages(false);
//       setTimeout(() => {
//         loadingFromScrollRef.current = false;
//       }, 200);
//     }
//   }, [loadingOlderMessages]);

//   useEffect(() => {
//     if (!conversation) return;

//     const handleMessageUpdated = ({ message }: any) => {
//       setMessages(prev => prev.map(m => (m.sid === message.sid ? message : m)));
//     };

//     const handleParticipantUpdated = async () => {
//       try {
//         const participants = await conversation.getParticipants();
//         const other = participants.find(
//           (p: any) => String(p.identity) !== String(currentUserId),
//         );

//         if (other) {
//           setOtherLastReadIndex(other.lastReadMessageIndex ?? null);
//         }
//       } catch (e) {
//         console.warn('Failed to get participant read index');
//       }
//     };
//     handleParticipantUpdated();
//     conversation.on('messageUpdated', handleMessageUpdated);
//     conversation.on('participantUpdated', handleParticipantUpdated);

//     const handleNewMessage = async (m: any) => {
//       const userId = await AsyncStorage.getItem('userId');
//       if (userId && !currentUserId) {
//         setCurrentUserId(String(userId));
//       }

//       const messageAuthor = m.author || m.state?.author || m.attributes?.author;

//       const isFromMe =
//         String(messageAuthor) === String(checkUser) ||
//         String(messageAuthor) === String(currentUserId) ||
//         String(messageAuthor) === String(userId);

//       setMessages(prev => {
//         if (prev.find(msg => msg.sid === m.sid)) return prev;
//         const updated = [...prev, m].sort((a, b) => {
//           const timeA = new Date(a.dateCreated || a.timestamp).getTime();
//           const timeB = new Date(b.dateCreated || b.timestamp).getTime();
//           return timeB - timeA;
//         });

//         const convName = conversation.uniqueName;
//         messageCache[convName] = updated;
//         saveJSON(CACHE_KEY_MSG_PREFIX + convName, updated);

//         return updated;
//       });

//       if (
//         isFromMe &&
//         !(Platform.OS === 'ios' && isShortContentLockedRef.current)
//       ) {
//         shouldAutoScrollRef.current = true;

//         requestAnimationFrame(() => {
//           requestAnimationFrame(() => {
//             InteractionManager.runAfterInteractions(() => {
//               setTimeout(() => {
//                 if (
//                   flatListRef.current &&
//                   !(Platform.OS === 'ios' && isShortContentLockedRef.current)
//                 ) {
//                   try {
//                     flatListRef.current.scrollToOffset({
//                       offset: 0,
//                       animated: true,
//                     });
//                   } catch (err) {
//                     try {
//                       flatListRef.current.scrollToEnd({ animated: true });
//                     } catch (e) {
//                       console.warn('Scroll failed:', e);
//                     }
//                   }
//                 }
//               }, 600); // Increased delay to wait for keyboard animation
//             });
//           });
//         });
//       }
//       // If message is from other user → mark as read

//       if (String(messageAuthor) !== String(currentUserId)) {
//         try {
//           await conversation.advanceLastReadMessageIndex(m.index);
//         } catch (err) {
//           console.log('Failed to advance read index:', err);
//         }
//       }
//     };

//     conversation.addListener('messageAdded', handleNewMessage);

//     return () => {
//       conversation.removeListener('messageAdded', handleNewMessage);
//       conversation.removeListener('messageUpdated', handleMessageUpdated);
//       conversation.removeListener(
//         'participantUpdated',
//         handleParticipantUpdated,
//       );
//       conversation.removeListener('messageAdded', handleNewMessage);
//     };
//   }, [conversation, checkUser, currentUserId]);

//   const getMessageStatus = (msg: any) => {
//     if (!msg || msg.index == null) return 'sent';

//     const author = msg.author || msg.state?.author || msg.attributes?.author;

//     // Only show ticks for my messages
//     if (String(author) !== String(currentUserId)) {
//       return null;
//     }

//     if (otherLastReadIndex !== null && msg.index <= otherLastReadIndex) {
//       return 'read';
//     }

//     return 'sent';
//   };
//   const handleSendMessage = async () => {
//     const trimmed = messageText.trim();
//     // const filteredMessage = applyChatRestrictions(messageText.trim());
//     const filteredMessage = applyChatRestrictions(trimmed);

//     if (!trimmed) {
//       textInputRef.current?.focus();
//       return;
//     }

//     if (!filteredMessage) {
//       setMessageText('');
//       textInputRef.current?.focus();
//       return;
//     }

//     // Clear input immediately
//     setMessageText('');
//     shouldAutoScrollRef.current = true;

//     try {
//       const [token, userId] = await Promise.all([
//         AsyncStorage.getItem('userToken'),
//         AsyncStorage.getItem('userId'),
//       ]);

//       // CASE 1: Conversation already exists
//       if (conversation) {
//         await conversation.sendMessage(filteredMessage);
//         return;
//       }

//       // CASE 2: Create conversation first
//       if (!sellerData?.featureId) {
//         console.error('Missing featureId');
//         return;
//       }


//       console.log('=== CREATE CONVERSATION REQUEST ===');
//       console.log('URL:', `${MAIN_URL.baseUrl}twilio/conversation-create`);
//       console.log('Payload:', JSON.stringify({ feature_id: sellerData.featureId }));

//       const createResponse = await fetch(
//         `${MAIN_URL.baseUrl}twilio/conversation-create`,
//         {
//           method: 'POST',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ feature_id: sellerData.featureId }),
//         },
//       );

//       const createData = await createResponse.json();

//       console.log('createData', createData);

//       if (!createResponse.ok || !createData?.data?.conv_name) {
//         console.error('Conversation creation failed:', createData.message);
//         return;
//       }

//       const convName = createData.data.conv_name;
//       const apiUserId = createData.data.current_user_id;

//       setCheckUser(String(apiUserId));

//       if (userId) {
//         setCurrentUserId(String(userId));
//       }

//       let convo;
//       try {
//         convo = await chatClient.getConversationByUniqueName(convName);
//       } catch {
//         convo = await chatClient.createConversation({ uniqueName: convName });
//       }

//       try {
//         await convo.join();
//       } catch (err: any) {
//         if (!err.message?.includes('Conflict')) {
//           console.error('Join error:', err);
//         }
//       }

//       setConversation(convo);

//       await new Promise(resolve => setTimeout(resolve, 50));
//       await convo.sendMessage(filteredMessage);
//     } catch (error) {
//       console.error('Message send failed:', error);
//     }
//   };

//   const getInitials = (firstName = '', lastName = '') =>
//     (firstName?.[0] || '') + (lastName?.[0] || '');

//   useEffect(() => {
//     const showSub = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
//       e => {
//         setKeyboardVisible(true);
//         let h =
//           (e && e.endCoordinates && e.endCoordinates.height) ||
//           (e && e.startCoordinates && e.startCoordinates.height) ||
//           0;
//         if (Platform.OS === 'android') {
//           const currentWindowHeight = Dimensions.get('window').height;
//           const heightDiff = windowHeightRef.current - currentWindowHeight;
//           if (heightDiff > 100) {
//             h = Math.max(h, heightDiff);
//           }
//           windowHeightRef.current = currentWindowHeight;
//         }
//         if (Platform.OS === 'ios') {
//           if (
//             !keyboardHeightSetRef.current ||
//             (h > 0 && Math.abs(h - keyboardHeightRef.current) > 20)
//           ) {
//             keyboardHeightRef.current = h;
//             setKeyboardHeight(h);
//             keyboardHeightSetRef.current = true;
//           }
//         } else {
//           keyboardHeightRef.current = h;
//           setKeyboardHeight(h);
//         }
//       },
//     );
//     const hideSub = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
//       () => {
//         setKeyboardVisible(false);
//         keyboardHeightRef.current = 0;
//         keyboardHeightSetRef.current = false;
//         setKeyboardHeight(0);
//         if (Platform.OS === 'android') {
//           setKavKey(prev => prev + 1);
//         }
//         if (Platform.OS === 'ios' && !isContentShort) {
//           setKavKey(prev => prev + 1);
//         }
//       },
//     );

//     return () => {
//       showSub.remove();
//       hideSub.remove();
//     };
//   }, []);

//   useEffect(() => {
//     if (!initialLoading && !layoutReady) {
//       InteractionManager.runAfterInteractions(() => {
//         setTimeout(() => {
//           setLayoutReady(true);
//         }, 100);
//       });
//     }
//   }, [initialLoading, layoutReady]);

//   const [extraPadding] = useState(48);
//   const formatMessageDate = (date: Date) => {
//     const d = new Date(date);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);
//     const messageDate = new Date(d);
//     messageDate.setHours(0, 0, 0, 0);

//     if (messageDate.getTime() === today.getTime()) {
//       // return "Today";
//       return t('today');
//     }
//     if (messageDate.getTime() === yesterday.getTime()) {
//       return t('yesterday');
//     }
//     const day = d.getDate();
//     const getSuffix = (n: number) => {
//       if (n > 3 && n < 21) return 'th';
//       switch (n % 10) {
//         case 1:
//           return 'st';
//         case 2:
//           return 'nd';
//         case 3:
//           return 'rd';
//         default:
//           return 'th';
//       }
//     };
//     const lang = i18n.language;
//     const suffix = lang == 'en' ? getSuffix(day) : '';

//     const monthIndex = d.getMonth(); // 0–11
//     const monthKeys = [
//       'jan',
//       'feb',
//       'mar',
//       'apr',
//       'may',
//       'jun',
//       'jul',
//       'aug',
//       'sep',
//       'oct',
//       'nov',
//       'dec',
//     ];

//     const monthShort = t ? t(monthKeys[monthIndex]) : monthKeys[monthIndex];
//     const year = d.getFullYear();
//     return `${day}${suffix} ${monthShort} ${year}`;
//   };

//   const buildMessageList = (messages: any[]) => {
//     if (messages.length === 0) return [];
//     const sortedMessages = [...messages].sort((a, b) => {
//       const timeA = new Date(a.dateCreated || a.timestamp).getTime();
//       const timeB = new Date(b.dateCreated || b.timestamp).getTime();
//       return timeA - timeB;
//     });

//     const grouped: any[] = [];
//     let lastDate: string | null = null;
//     sortedMessages.forEach((msg, index) => {
//       const created = msg.dateCreated || msg.timestamp;
//       const dateLabel = formatMessageDate(new Date(created));
//       if (lastDate !== dateLabel) {
//         grouped.push({
//           type: 'date',
//           date: dateLabel,
//           sid: `date-${dateLabel}-${index}`,
//         });
//         lastDate = dateLabel;
//       }
//       grouped.push({
//         type: 'message',
//         data: msg,
//         sid: msg.sid || `msg-${index}`,
//       });
//     });
//     return grouped.reverse();
//   };

//   const groupedMessages = React.useMemo(
//     () => buildMessageList(messages),
//     [messages],
//   );
//   const oldestDateIndex = React.useMemo(() => {
//     for (let i = groupedMessages.length - 1; i >= 0; i--) {
//       if (groupedMessages[i]?.type === 'date') {
//         return i;
//       }
//     }
//     return -1;
//   }, [groupedMessages]);
//   const lastMessageIndex = React.useMemo(() => {
//     for (let i = 0; i < groupedMessages.length; i++) {
//       if (groupedMessages[i]?.type === 'message') {
//         return i;
//       }
//     }
//     return -1;
//   }, [groupedMessages]);
//   const contentContainerStyle = React.useMemo(() => {
//     return {
//       paddingTop: Platform.OS === 'ios' ? 160 : 150,
//       paddingBottom: 0,
//       flexGrow: 1,
//     };
//   }, []);

//   const prevMessagesLengthRef = useRef(messages.length);
//   const lastUserMessageRef = useRef<string | null>(null);

//   useEffect(() => {
//     if (messages.length > 0 && !newestMessageSidRef.current) {
//       newestMessageSidRef.current = messages[0]?.sid || null;
//     }
//   }, [messages.length === 0 ? null : messages[0]?.sid]);

//   useEffect(() => {
//     if (
//       messages.length > prevMessagesLengthRef.current &&
//       messages.length > 0
//     ) {
//       const lastMessage = messages[0];
//       const messageAuthor =
//         lastMessage?.author ||
//         lastMessage?.state?.author ||
//         lastMessage?.attributes?.author;
//       const isFromMe =
//         String(messageAuthor) === String(checkUser) ||
//         String(messageAuthor) === String(currentUserId);

//       if (isFromMe && lastMessage?.sid !== lastUserMessageRef.current) {
//         lastUserMessageRef.current = lastMessage?.sid || null;
//         newestMessageSidRef.current = lastMessage?.sid || null;
//         shouldAutoScrollRef.current = true;

//         const scrollToBottom = (delay: number) => {
//           requestAnimationFrame(() => {
//             requestAnimationFrame(() => {
//               InteractionManager.runAfterInteractions(() => {
//                 setTimeout(() => {
//                   if (flatListRef.current) {
//                     try {
//                       flatListRef.current.scrollToOffset({
//                         offset: 0,
//                         animated: true,
//                       });
//                     } catch (err) {
//                       try {
//                         flatListRef.current.scrollToEnd({ animated: true });
//                       } catch (e) {
//                         try {
//                           if (lastMessageIndex >= 0) {
//                             flatListRef.current.scrollToIndex({
//                               index: lastMessageIndex,
//                               animated: true,
//                               viewPosition: 1,
//                             });
//                           }
//                         } catch (e2) {
//                           console.warn('Scroll failed:', e2);
//                         }
//                       }
//                     }
//                   }
//                 }, delay);
//               });
//             });
//           });
//         };
//         if (!(Platform.OS === 'ios' && isShortContentLockedRef.current)) {
//           scrollToBottom(keyboardVisible ? 300 : 200);
//           scrollToBottom(keyboardVisible ? 600 : 400);
//           scrollToBottom(keyboardVisible ? 1000 : 700);
//         }
//       }
//     }
//     prevMessagesLengthRef.current = messages.length;
//   }, [messages, checkUser, currentUserId, keyboardVisible, lastMessageIndex]);

//   useEffect(() => {
//     if (
//       !initialLoading &&
//       messages.length > 0 &&
//       flatListRef.current &&
//       !(Platform.OS === 'ios' && isShortContentLockedRef.current)
//     ) {
//       setTimeout(() => {
//         if (
//           flatListRef.current &&
//           !(Platform.OS === 'ios' && isShortContentLockedRef.current)
//         ) {
//           try {
//             flatListRef.current.scrollToOffset({
//               offset: 0,
//               animated: false,
//             });
//           } catch (err) {
//             try {
//               flatListRef.current.scrollToEnd({ animated: false });
//             } catch (e) { }
//           }
//         }
//       }, 100);
//     }
//   }, [initialLoading, messages.length === 0 ? null : messages[0]?.sid]);
//   const headerTop = Platform.OS === 'ios' ? 50 : 40;
//   const headerHeight = 100;

//   const isSendDisabled = initialLoading || !messageText.trim();

//   const [isContentShort, setIsContentShort] = useState(false);
//   const prevIsContentShortRef = useRef(false);
//   const scrollToShortContentRef = useRef(false);
//   const contentSizeChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const isShortContentLockedRef = useRef(false);
//   const inputBarBottom = React.useMemo(() => {
//     if (Platform.OS === 'ios' && isContentShort && keyboardVisible) {
//       return keyboardHeightRef.current || keyboardHeight;
//     }
//     return 0;
//   }, [Platform.OS, isContentShort, keyboardVisible, keyboardHeight]);

//   useEffect(() => {
//     if (
//       Platform.OS === 'ios' &&
//       isContentShort &&
//       keyboardVisible &&
//       flatListRef.current &&
//       messages.length > 0 &&
//       !scrollToShortContentRef.current
//     ) {
//       scrollToShortContentRef.current = true;
//       isShortContentLockedRef.current = false;
//       const timeoutId = setTimeout(() => {
//         if (
//           flatListRef.current &&
//           keyboardVisible &&
//           isContentShort &&
//           isShortContentLockedRef.current
//         ) {
//           try {
//             flatListRef.current.scrollToOffset({
//               offset: 0,
//               animated: false,
//             });
//           } catch (err) {
//             try {
//               flatListRef.current.scrollToEnd({ animated: false });
//             } catch (e) { }
//           }
//         }
//       }, 500);
//       return () => {
//         clearTimeout(timeoutId);
//         if (!keyboardVisible || !isContentShort) {
//           scrollToShortContentRef.current = false;
//           isShortContentLockedRef.current = false;
//         }
//       };
//     } else if (!keyboardVisible || !isContentShort) {
//       scrollToShortContentRef.current = false;
//       isShortContentLockedRef.current = false;
//     }
//   }, [isContentShort, keyboardVisible, messages.length]);
  
//   useEffect(() => {
//     return () => {
//       if (contentSizeChangeTimeoutRef.current) {
//         clearTimeout(contentSizeChangeTimeoutRef.current);
//       }
//     };
//   }, []);

//   const MessageStatusTicks = React.memo(({ message }: any) => {
//     const status = getMessageStatus(message);

//     if (status === 'sent') {
//       return (
//         <Image
//           source={require('../../../assets/images/single_tick.png')}
//           style={[styles.tickIcon, { tintColor: '#999' }]}
//         />
//       );
//     }

//     if (status === 'read') {
//       return (
//         <Image
//           source={require('../../../assets/images/double_tick.png')}
//           style={[styles.tickIcon, { tintColor: '#4FC3F7' }]}
//         />
//       );
//     }

//     return null;
//   });

//   const renderItem = React.useCallback(
//     ({ item, index }: { item: any; index: number }) => {
//       const isFromCurrentUser = (msg: any) => {
//         if (!msg || !msg.data) return false;
//         const author =
//           msg.data.author ||
//           msg.data.state?.author ||
//           msg.data.attributes?.author;
//         const authorStr = String(author || '');
//         const checkUserStr = String(checkUser || '');
//         const currentUserIdStr = String(currentUserId || '');
//         return authorStr === checkUserStr || authorStr === currentUserIdStr;
//       };

//       const isLastMessage = index === lastMessageIndex;
//       const isMyMessage = isFromCurrentUser(item);
//       const BASE_SPACING = 0;
//       const bottomPadding = BASE_SPACING;

//       return (
//         <>
//           {item?.type === 'date' ? (
//             <View style={{ alignItems: 'center', marginVertical: 10 }}>
//               <Text
//                 style={{
//                   color: '#FFFFFF7A',
//                   backgroundColor: '#00000029',
//                   paddingHorizontal: 8,
//                   paddingVertical: 4,
//                   borderRadius: 6,
//                   fontSize: 12,
//                   fontFamily: 'Urbanist-Medium',
//                   marginVertical: 10,
//                 }}
//               >
//                 {loadingOlderMessages && index === oldestDateIndex
//                   ? t('loading')
//                   : item?.date}
//               </Text>
//             </View>
//           ) : (
//             <View
//               style={[
//                 styles.messageContainer,
//                 isMyMessage ? styles.rightAlign : styles.leftAlign,
//                 isLastMessage && { marginBottom: bottomPadding },
//               ]}
//             >
//               <View
//                 style={
//                   isMyMessage
//                     ? styles.rightBubbleWrapper
//                     : styles.leftBubbleWrapper
//                 }
//               >
//                 {!isMyMessage && (
//                   <View
//                     style={{
//                       width: 0,
//                       height: 0,
//                       borderTopWidth: 8,
//                       borderTopColor: 'transparent',
//                       borderRightWidth: 9,
//                       borderRightColor: '#2466c75e',
//                       borderBottomWidth: 8,
//                       borderBottomColor: 'transparent',
//                       alignSelf: 'flex-start',
//                       marginRight: 0,
//                       marginTop: 4,
//                     }}
//                   />
//                 )}
//                 <View
//                   style={[
//                     styles.bubble,
//                     isMyMessage ? styles.rightBubble : styles.leftBubble,
//                   ]}
//                 >
//                   <Text allowFontScaling={false} style={styles.messageText}>
//                     {item?.data?.state?.body || item?.data?.body}
//                   </Text>
//                   {isMyMessage && (
//                     <View style={styles.tickContainer}>
//                       <MessageStatusTicks message={item.data} />
//                     </View>
//                   )}
//                 </View>

//                 {isMyMessage && (
//                   <>
//                     <View
//                       style={{
//                         width: 0,
//                         height: 0,
//                         borderTopWidth: 8,
//                         borderTopColor: 'transparent',
//                         borderLeftWidth: 9,
//                         borderLeftColor: '#0000001F',
//                         borderBottomWidth: 8,
//                         borderBottomColor: 'transparent',
//                         alignSelf: 'flex-start',
//                         marginLeft: 0,
//                         marginTop: 4,
//                       }}
//                     />
//                   </>
//                 )}
//               </View>
//             </View>
//           )}
//         </>
//       );
//     },
//     [checkUser, currentUserId, lastMessageIndex, otherLastReadIndex],
//   );
//   return (
//     // <BackgroundWrapper>
//     <ImageBackground
//                   source={BACK_ICON}
//                   style={{ flex: 1,width: '100%',
//                 height: '100%', }}
//                   resizeMode="cover"
//                 >
//       <View style={{ flex: 1 }}>
//         {initialLoading && (
//           <Loader
//             containerStyle={{
//               position: 'absolute',
//               left: 0,
//               right: 0,
//               // bottom: inputBarHeight,
//               justifyContent: 'center',
//               alignItems: 'center',
//               paddingTop: Platform.OS === 'ios' ? 0 : 0,
//               zIndex: 1000,
//               elevation: Platform.OS === 'android' ? 100 : 0,
//               pointerEvents: 'none',
//             }}
//           />
//         )}
//         <View
//           style={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             zIndex: 1000,
//             overflow: 'hidden',
//             pointerEvents: 'none',
//           }}
//         >
//           <BlurView
//             style={StyleSheet.absoluteFill}
//             blurType={Platform.OS === 'ios' ? 'prominent' : 'light'}
//             blurAmount={Platform.OS === 'ios' ? 45 : 45}
//             reducedTransparencyFallbackColor="rgba(255,255,255,0.05)"
//           />
//         </View>
//         <Animated.View
//           style={[styles.headerWrapper, animatedBlurStyle]}
//           pointerEvents="none"
//         >
//           <MaskedView
//             style={StyleSheet.absoluteFill}
//             maskElement={
//               <LinearGradient
//                 colors={['rgba(0,0,0,1)', 'rgba(0,0,0,0)']}
//                 locations={[0, 0.8]}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 0, y: 1 }}
//                 style={StyleSheet.absoluteFill}
//               />
//             }
//           >
//             <BlurView
//               style={StyleSheet.absoluteFill}
//               blurType={Platform.OS === 'ios' ? 'prominent' : 'light'}
//               blurAmount={Platform.OS === 'ios' ? 45 : 45}
//               // overlayColor="rgba(255,255,255,0.05)"
//               reducedTransparencyFallbackColor="rgba(255,255,255,0.05)"
//             />

//             <LinearGradient
//               colors={[
//                 'rgba(255, 255, 255, 0.45)',
//                 'rgba(255, 255, 255, 0.02)',
//                 'rgba(255, 255, 255, 0.02)',
//               ]}
//               style={StyleSheet.absoluteFill}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 0, y: 1 }}
//             />
//           </MaskedView>
//         </Animated.View>

//         <View style={styles.header} pointerEvents="box-none">
//           <View style={styles.headerRow}>
//             <View
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 width: '100%',
//                 justifyContent: 'space-between',
//                 gap: 8,
//                 paddingHorizontal: 16,
//                 position: 'absolute',
//                 paddingTop: Platform.OS === 'ios' ? 0 : 0,
//               }}
//             >
//               <TouchableOpacity
//                 onPress={() => {
//                   if (Platform.OS === 'ios') {
//                     if (navigation.canGoBack()) {
//                       navigation.goBack();
//                     } else {
//                       if (source === 'chatList') {
//                         navigation.reset({
//                           index: 0,
//                           routes: [
//                             {
//                               name: 'Dashboard',
//                               params: {
//                                 resetToLogin: true,
//                                 AddScreenBackactiveTab: 'Bookmark',
//                                 isNavigate: false,
//                               },
//                             },
//                           ],
//                         });
//                       }
//                       navigation.goBack();
//                     }
//                   } else {
//                     if (source === 'sellerPage') {
//                       navigation.goBack();
//                     } else {
//                       navigation.replace('Dashboard', {
//                         AddScreenBackactiveTab: 'Bookmark',
//                         isNavigate: false,
//                       });
//                     }
//                   }
//                 }}
//                 hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
//                 style={{
//                   width: 48,
//                   height: 48,
//                   borderRadius: 24,
//                   overflow: 'hidden',
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                   position: 'relative',
//                 }}
//               >
//                 <BlurView
//                   style={{
//                     position: 'absolute',
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     bottom: 0,
//                     borderRadius: 0,
//                   }}
//                   blurType="light"
//                   blurAmount={10}
//                   reducedTransparencyFallbackColor="#ffffff66"
//                 />
//                 <Image
//                   source={back}
//                   resizeMode="contain"
//                   style={styles.backIconStyle}
//                 />
//               </TouchableOpacity>
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   flex: 1,
//                   borderRadius: Platform.OS === 'ios' ? 40 : 40,
//                   paddingHorizontal: 12,
//                   paddingVertical: 8,
//                   overflow: 'hidden',
//                   position: 'relative',
//                 }}
//               >
//                 <MessageHeaderButton
//                   title={
//                     <Text allowFontScaling={false} style={styles.studentName}>
//                       {source === 'chatList'
//                         ? members?.firstname
//                         : sellerData.firstname}{' '}
//                       {source === 'chatList'
//                         ? members?.lastname
//                         : sellerData.lastname}
//                     </Text>
//                   }
//                 />
//               </View>
//               <TouchableOpacity
//                 onPress={() => {
//                   navigation.navigate('UserProfileScreen', {
//                     animation: 'none',
//                     members: source == 'chatList' ? members : sellerData,
//                   });
//                 }}
//               >
//                 <ImageBackground
//                   source={require('../../../assets/images/profilebutton.png')}
//                   style={{
//                     height: 48,
//                     width: 48,
//                   }}
//                 >
//                   {source == 'chatList' ? (
//                     members?.profile ? (
//                       <Image
//                         source={{ uri: members?.profile }}
//                         style={styles.profileImage}
//                       />
//                     ) : (
//                       <View style={styles.initialsCircle}>
//                         <Text
//                           allowFontScaling={false}
//                           style={styles.initialsText}
//                         >
//                           {getInitials(
//                             members?.firstname ?? 'A',
//                             members?.lastname ?? 'W',
//                           )}
//                         </Text>
//                       </View>
//                     )
//                   ) : sellerData?.profile ? (
//                     <Image
//                       source={{ uri: sellerData?.profile }}
//                       style={styles.profileImage}
//                     />
//                   ) : (
//                     <View style={styles.initialsCircle}>
//                       <Text
//                         allowFontScaling={false}
//                         style={styles.initialsText}
//                       >
//                         {getInitials(
//                           sellerData?.firstname ?? 'A',
//                           sellerData?.lastname ?? 'W',
//                         )}
//                       </Text>
//                     </View>
//                   )}
//                 </ImageBackground>
//               </TouchableOpacity>
//             </View>
//             <View style={styles.headerSpacer} />
//           </View>
//         </View>

//         <KeyboardAvoidingView
//           key={kavKey}
//           style={{ flex: 1 }}
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}
//           enabled={Platform.OS === 'ios' ? !isContentShort : true}
//         >
//           <View
//             style={{ flex: 1 }}
//             onLayout={() => {
//               if (!layoutReady && !initialLoading) {
//                 setTimeout(() => {
//                   setLayoutReady(true);
//                 }, 50);
//               }
//             }}
//           >
//             <Animated.FlatList
//               data={groupedMessages}
//               inverted
//               removeClippedSubviews={
//                 Platform.OS === 'ios' && isContentShort && keyboardVisible
//                   ? false
//                   : true
//               } // Disable clipping when short to prevent layout shifts
//               extraData={React.useMemo(() => {
//                 if (Platform.OS === 'ios' && isShortContentLockedRef.current) {
//                   return [keyboardVisible, lastMessageIndex];
//                 }
//                 return [
//                   keyboardVisible,
//                   lastMessageIndex,
//                   loadingOlderMessages,
//                   isContentShort,
//                 ];
//               }, [
//                 keyboardVisible,
//                 lastMessageIndex,
//                 loadingOlderMessages,
//                 isContentShort,
//               ])} // Memoize to prevent unnecessary re-renders
//               keyExtractor={(item, index) =>
//                 item.sid || item.data?.sid || `item-${index}`
//               }
//               // maintainVisibleContentPosition={
//               //   Platform.OS === 'ios' && isContentShort
//               //     ? undefined
//               //     : {
//               //       minIndexForVisible: 1,
//               //     }
//               // }
//               maintainVisibleContentPosition={{
//   minIndexForVisible: 1,
// }}

//               onScroll={event => {
//                 const offsetY = event.nativeEvent.contentOffset.y;
//                 const isAtBottom = offsetY <= 10;

//                 if (isAtBottom && messages.length > 0 && conversation) {
//                   const newestMessage = messages[0]; // because list is inverted
//                   if (newestMessage?.index != null) {
//                     conversation
//                       .advanceLastReadMessageIndex(newestMessage.index)
//                       .catch(() => { });
//                   }
//                 }

//                 const contentHeight = event.nativeEvent.contentSize.height;
//                 const viewportHeight =
//                   event.nativeEvent.layoutMeasurement.height;
//                 scrollY.value = offsetY;
//                 const maxScrollY = Math.max(0, contentHeight - viewportHeight);
//                 const distanceFromTop = maxScrollY - offsetY;
//                 const isAtTop = distanceFromTop <= 10;
//                 hasScrollableContent.value =
//                   contentHeight > viewportHeight && !isAtTop;

//                 if (offsetY > 30) {
//                   shouldAutoScrollRef.current = false;
//                 }
//                 const threshold = maxScrollY * 0.25;

//                 if (
//                   distanceFromTop <= threshold &&
//                   !loadingFromScrollRef.current &&
//                   !loadingOlderMessages &&
//                   messagesPageRef.current?.hasPrevPage
//                 ) {
//                   loadOlderMessages();
//                 }
//               }}
//               scrollEventThrottle={16}
//               scrollEnabled={true}
//               ListHeaderComponent={null}
//               onScrollToIndexFailed={() => {
//                 setTimeout(() => {
//                   flatListRef.current?.scrollToEnd({ animated: false });
//                 }, 100);
//               }}
//               renderItem={renderItem}
//               ref={flatListRef}
//               keyboardShouldPersistTaps="handled"
//               onContentSizeChange={(width, height) => {
//                 if (Platform.OS === 'ios' && isShortContentLockedRef.current) {
//                   return;
//                 }
//                 const prevHeight = contentHeightRef.current;
//                 contentHeightRef.current = height;
//                 updateBlurState();
//                 if (Platform.OS === 'ios') {
//                   if (contentSizeChangeTimeoutRef.current) {
//                     clearTimeout(contentSizeChangeTimeoutRef.current);
//                   }

//                   contentSizeChangeTimeoutRef.current = setTimeout(() => {
//                     if (isShortContentLockedRef.current) return;

//                     const screenHeight = Dimensions.get('window').height;
//                     const newIsContentShort = height < screenHeight * 0.7;
//                     if (newIsContentShort !== prevIsContentShortRef.current) {
//                       prevIsContentShortRef.current = newIsContentShort;
//                       isShortContentLockedRef.current =
//                         newIsContentShort && keyboardVisible;
//                       requestAnimationFrame(() => {
//                         requestAnimationFrame(() => {
//                           setIsContentShort(newIsContentShort);
//                         });
//                       });
//                     } else if (newIsContentShort && keyboardVisible) {
//                       isShortContentLockedRef.current = false;
//                     }
//                   }, 200);
//                 }
//                 if (
//                   loadingFromScrollRef.current ||
//                   loadingOlderMessages ||
//                   (Platform.OS === 'ios' && isShortContentLockedRef.current)
//                 )
//                   return;
//                 if (
//                   height > prevHeight &&
//                   prevHeight > 0 &&
//                   flatListRef.current
//                 ) {
//                   const newestMessage =
//                     messages.length > 0 ? messages[0] : null;
//                   const newestMessageSid = newestMessage?.sid || null;
//                   if (newestMessageSid === newestMessageSidRef.current) {
//                     return;
//                   }
//                   newestMessageSidRef.current = newestMessageSid;

//                   const messageAuthor =
//                     newestMessage?.author ||
//                     newestMessage?.state?.author ||
//                     newestMessage?.attributes?.author;
//                   const isFromMe =
//                     String(messageAuthor) === String(checkUser) ||
//                     String(messageAuthor) === String(currentUserId);

//                   if (
//                     !(
//                       Platform.OS === 'ios' && isShortContentLockedRef.current
//                     ) &&
//                     (isFromMe || shouldAutoScrollRef.current)
//                   ) {
//                     if (isFromMe) {
//                       shouldAutoScrollRef.current = true;
//                     }
//                     InteractionManager.runAfterInteractions(() => {
//                       setTimeout(
//                         () => {
//                           if (
//                             flatListRef.current &&
//                             !(
//                               Platform.OS === 'ios' &&
//                               isShortContentLockedRef.current
//                             )
//                           ) {
//                             try {
//                               flatListRef.current.scrollToOffset({
//                                 offset: 0,
//                                 animated: true,
//                               });
//                             } catch (err) {
//                               try {
//                                 flatListRef.current.scrollToEnd({
//                                   animated: true,
//                                 });
//                               } catch (e) {
//                                 console.warn('Scroll failed:', e);
//                               }
//                             }
//                           }
//                         },
//                         keyboardVisible ? 300 : 200,
//                       );
//                     });
//                   }
//                 }
//               }}
//               onLayout={event => {
//                 if (Platform.OS === 'ios' && isShortContentLockedRef.current) {
//                   return;
//                 }
//                 const { height } = event.nativeEvent.layout;
//                 viewportHeightRef.current = height;
//                 updateBlurState();
//               }}
//               contentContainerStyle={React.useMemo(() => {
//                 if (
//                   Platform.OS === 'ios' &&
//                   isContentShort &&
//                   keyboardVisible &&
//                   isShortContentLockedRef.current
//                 ) {
//                   return {
//                     paddingTop: 80,
//                     paddingBottom: 120,
//                     flexGrow: 1,
//                     justifyContent: 'flex-start',
//                   };
//                 }

//                 return {
//                   ...contentContainerStyle,
//                   paddingBottom:
//                     isContentShort && Platform.OS === 'ios' && keyboardVisible
//                       ? (keyboardHeightRef.current || keyboardHeight) +
//                       INPUT_BAR_HEIGHT +
//                       10
//                       : 120,
//                   paddingTop: keyboardVisible ? 80 : 105,
//                   justifyContent: 'flex-start',
//                 };
//               }, [
//                 contentContainerStyle,
//                 isContentShort,
//                 keyboardVisible,
//                 keyboardHeight,
//               ])}
//               showsVerticalScrollIndicator={false}
//             />
//             <View
//               style={React.useMemo(
//                 () => ({
//                   position: 'absolute',
//                   left: 0,
//                   right: 0,
//                   bottom: inputBarBottom,
//                   paddingHorizontal: 16,
//                   paddingTop: Platform.OS === 'ios' ? 0 : 8,
//                   paddingBottom:
//                     Platform.OS === 'ios'
//                       ? isContentShort && keyboardVisible
//                         ? 0
//                         : keyboardVisible
//                           ? 0
//                           : 30
//                       : keyboardVisible
//                         ? 8
//                         : 34,
//                   backgroundColor: 'transparent',
//                   zIndex: 1000,
//                 }),
//                 [inputBarBottom, isContentShort, keyboardVisible],
//               )}
//             >
//               {chatUser?.blocked_you ? (
//                 <View style={styles.blockBanner}>
//                   <Image
//                     source={require('../../../assets/images/block_triangle.png')}
//                     style={styles.blockIcon}
//                   />
//                   <Text style={styles.blockText}>{t('block_info_user')}</Text>
//                 </View>
//               ) : chatUser?.isblocked ? (
//                 <View style={styles.blockBanner}>
//                   <Image
//                     source={require('../../../assets/images/block_triangle.png')}
//                     style={styles.blockIcon}
//                   />
//                   <Text style={styles.blockText}>{t('block_info')}</Text>
//                 </View>
//               ) : (
//                 <View style={styles.inputRow}>
//                   <View style={styles.inputContainer}>
//                     <BlurView
//                       style={styles.inputBlur}
//                       blurType="light"
//                       blurAmount={5}
//                       reducedTransparencyFallbackColor="#ffffff34"
//                     />

//                     <TextInput
//                       ref={textInputRef}
//                       allowFontScaling={false}
//                       style={styles.textInput}
//                       placeholder={t('message')}
//                       placeholderTextColor="#F5F5F5"
//                       onChangeText={handleTextChange}
//                       value={messageText}
//                       cursorColor="#F5F5F5"
//                       selectionColor="#F5F5F5"
//                     />
//                   </View>

//                   <TouchableOpacity
//                     onPress={handleSendMessage}
//                     disabled={isSendDisabled}
//                     hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
//                     style={[
//                       styles.sendButton,
//                       { opacity: isSendDisabled ? 0.5 : 1 },
//                     ]}
//                   >
//                     <BlurView
//                       style={styles.sendButtonBlur}
//                       blurType="light"
//                       blurAmount={10}
//                       reducedTransparencyFallbackColor="#ffffff66"
//                     />

//                     <Image
//                       source={require('../../../assets/images/sendmessage.png')}
//                       style={styles.sendIcon}
//                     />
//                   </TouchableOpacity>
//                 </View>
//               )}

//               <View
//                 style={{
//                   height: Platform.OS === 'ios' ? 4 : 4,
//                   width: '100%',
//                 }}
//               />
//             </View>
//           </View>
//         </KeyboardAvoidingView>
//       </View>
//       <NewCustomToastContainer />
//       {/* </BackgroundWrapper> */}
//       </ImageBackground>
//   );
// };

// export default MessagesIndividualScreen;

// const styles = StyleSheet.create({
//   tickContainer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginTop: 4,
//   },

//   tickIcon: {
//     width: 10,
//     height: 10,
//     resizeMode: 'contain',
//     marginLeft: 5,
//     marginTop: 5,
//   },

//   inputRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '100%',
//   },

//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//     borderRadius: 40,
//     height: 48,
//     paddingHorizontal: 16,
//     paddingVertical: 4,
//     overflow: 'hidden',
//     position: 'relative',
//   },

//   inputBlur: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     borderRadius: 10,
//   },

//   textInput: {
//     flex: 1,
//     color: '#fff',
//     fontFamily: 'Urbanist-Medium',
//     fontSize: 17,
//     marginLeft: Platform.OS === 'ios' ? 5 : 0,
//   },

//   sendButton: {
//     marginLeft: 8,
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     overflow: 'hidden',
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//   },

//   sendButtonBlur: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     borderRadius: 24,
//   },

//   /* ===== Blocked Banner ===== */
//   blockBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '100%',
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.10) 100%)',
//     boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
//     padding: 12,
//     borderWidth: 0.5,
//     borderRadius: 12,
//     borderColor: '#ffffff31',
//     justifyContent: 'center',
//   },

//   blockIcon: {
//     width: 20,
//     height: 20,
//     tintColor: '#fff',
//     zIndex: 1,
//     marginLeft: 8,
//   },

//   blockText: {
//     color: '#fff',
//     fontSize: 16,
//     fontFamily: 'Urbanist-SemiBold',
//     fontWeight: '600',
//     opacity: 0.8,
//     paddingLeft: 8,
//   },

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
//   },

//   sendIcon: {
//     width: 20,
//     height: 20,
//   },
 
//   backIconStyle: {
//     width: 30,
//     height: 30,
//   },
//   studentName: {
//     color: 'rgba(0, 30, 80, 1)',
//     fontFamily: 'Urbanist-SemiBold',
//     fontWeight: '600',
//     fontSize: 14,
//     // marginBottom: 2,
//     // paddingLeft: 16,
//     // paddingRight: 16
//   },
  
//   profileImage: {
//     width: 40,
//     height: 40,
//     margin: 4,
//     borderRadius: 100,
//   },

//   messageContainer: {
//     paddingHorizontal: 6,
//   },
//   bubble: {
//     paddingVertical: 8,
//     paddingHorizontal: 10,
//     borderRadius: 6,
//     marginVertical: 0,
//     maxWidth: '75%',
//     flexDirection: 'row',
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
//     backgroundColor: '#2466c75e',
//     borderTopLeftRadius: 3,
//     borderTopRightRadius: 6,
//     borderBottomLeftRadius: 6,
//     borderBottomRightRadius: 6,
//   },
//   rightBubble: {
//     backgroundColor: '#0000001F',
//     borderTopLeftRadius: 6,
//     borderTopRightRadius: 3,
//     borderBottomLeftRadius: 6,
//     borderBottomRightRadius: 6,
//   },
//   messageText: {
//     fontFamily: 'Urbanist-Medium',
//     color: '#FFFFFFE0',
//     fontSize: 16,
//     lineHeight: 21,
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
//     width: 40,
//     height: 40,
//     margin: 4,
//     borderRadius: 25,
//   },
//   initialsText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 600,
//     textAlign: 'center',
//     fontFamily: 'Urbanist-SemiBold',
//   },

//   headerWrapper: {
//     position: 'absolute',
//     top: 0,
//     width: Platform.OS === 'ios' ? '100%' : '100%',
//     height: Platform.OS === 'ios' ? 110 : 180,
//     zIndex: 10,
//     overflow: 'hidden',
//     alignSelf: 'center',
//     pointerEvents: 'none',
//   },

//   header: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? '5%' : 40,
//     left: 0,
//     right: 0,
//     height: 100,
//     justifyContent: 'center',
//     zIndex: 11,
//     pointerEvents: 'box-none',
//   },
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   headerSpacer: {
//     width: 48,
//     height: 48,
//   },
// });

