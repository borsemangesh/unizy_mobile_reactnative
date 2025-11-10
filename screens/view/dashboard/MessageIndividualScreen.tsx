import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
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
import { Client as TwilioChatClient } from "@twilio/conversations";



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







const MessagesIndividualScreen = ({
  navigation,
}: MessagesIndividualScreenProps) => {




 const [chatMeta, setchatMeta] = useState<chatMeta>({
    author: '',
    body: '',
    createdAt: null,
  });

      const [twilioToken, setTwilioToken] = useState<any>(null);

    const [chatClient, setChatClient] = useState<any>(null);
    
  const [conversation, setConversation] = useState<any>(null);

  const [messages, setMessages] = useState<any[]>([]);
const [messageText, setMessageText] = useState('');
const [currentUserId, setCurrentUserId] = useState(null);


const [checkUser, setCheckUser] = useState(null);



  //------------------- Get data method ------------------------//

  useEffect(() => {
  const fetchUserChatData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');

   
      

      if (!token || !userId) {
        console.warn('Missing token or user ID in AsyncStorage');
        return;
      }

      const url = `${MAIN_URL.baseUrl}twilio/auth-token`;
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
        return;
      }

      const chatData = data.data;


      console.log("chatData",chatData);
      
      const twilioToken = chatData.token;

      console.log("twilioToken",twilioToken);
      

    
      const client = new TwilioChatClient(twilioToken);
      setChatClient(client);

      console.log("client",client);
      
      console.log('client connected:', client.connectionState);

    } catch (error) {
      console.error('Chat setup failed:', error);
    }
  };

  fetchUserChatData();
}, []);




useEffect(() => {
  if (!chatClient) return; // wait until client is ready

  
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const waitForClientConnection = (client: any) => {
    return new Promise<void>((resolve) => {
      if (client.connectionState === "connected") {
        return resolve();
      }
      client.on("connectionStateChanged", (state: string) => {
        console.log("Twilio connection state:", state);
        if (state === "connected") {
          resolve();
        }
      });
    });
  };

  const fetchConversation = async () => {
    try {
      console.log("Fetching conversation using client...");

      //  Wait until Twilio client is connected
      await waitForClientConnection(chatClient);
      console.log(" Twilio client connected — safe to continue");

      //  Fetch conversation info from your backend
      const token = await AsyncStorage.getItem("userToken");
      const userId = await AsyncStorage.getItem("userId");

      const url = `${MAIN_URL.baseUrl}twilio/conversation-fetch`;
      const body = { feature_id: 183 };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        console.warn("Conversation fetch failed:", data.message);
        return;
      }


      console.log("data+++++++++++=",data);

      
      
      const convName = data.data.conv_name;

      setCheckUser(data.data.current_user_id)
      console.log(" Conversation name---:", convName);
      setCurrentUserId(convName);


      // let convo = await chatClient.getConversationByUniqueName(convName).catch(() => null);
      // if (!convo) {
      //   convo = await chatClient.createConversation({ uniqueName: convName });
      //   console.log(" Created new conversation:", convo.sid);
      // }

      // console.log("convo.state:", convo.state);
      
      // if (convo.state?.current !== "joined") {
      //   console.log(" Joining conversation...");
      //      await convo.join();
      //   try {
      //     await convo.join();
      //     console.log(" Joined conversation:", convo.sid);
      //   }
      //    catch (err: any) {    
          
      //     if (err.message?.includes("Conflict")) {
      //       console.log(" Already joined this conversation.");
      //     } else {
      //       console.error(" Join failed:", err);
      //     }
      //   }
      // } else {
      //   console.log("Already joined conversation:", convo.sid);
      // }
     let convo;

      // Step 1: Try fetching existing conversation
      try {
        convo = await chatClient.getConversationByUniqueName(convName);
        // const convo = await chatClient.getConversationBySid(data.data.twilio_conversation_sid);
        // const convo = await chatClient.getConversationBySid(`CH5c508890d712457a9eee0e6de9e396fd`);
 
        console.log(" Found existing conversation:", convo.sid);
      } catch {
        console.log(" No existing conversation found, trying to create...");
      }

      // Step 2: Try to create conversation
      if (!convo) {
        try {
          convo = await chatClient.createConversation({ uniqueName: convName });
          console.log(" Created new conversation:", convo.sid);
        } catch (err: any) {
          console.warn(" Create failed:", err.message);

          if (
            err.message?.includes("Conflict") ||
            err.message?.includes("Forbidden")
          ) {
            console.log("Retrying to fetch conversation after conflict...");
            await delay(2000); // Wait for Twilio sync
            convo = await chatClient.getConversationByUniqueName(convName);
            console.log(" Retrieved conversation after retry:", convo.sid);
          } else {
            throw err;
          }
        }
      }

      if (!convo) {
        console.error(" Could not fetch or create conversation.");
        return;
      }

      // Step 3: Ensure joined
      try {
        const participants = await convo.getParticipants();
        const alreadyJoined = participants.some((p: any) => p.identity === userId);

        if (!alreadyJoined) {
          await convo.join();
          console.log(" Joined conversation:", convo.sid);
        } else {
          console.log(" Already joined:", convo.sid);
        }
      } catch (err: any) {
        if (err.message?.includes("Conflict")) {
          console.log(" Already joined (Conflict).");
        } else {
          console.error(" Join failed:", err);
        }
      }


  
      setConversation(convo);


      const messagesPage = await convo.getMessages();
      console.log(" Loaded messages:", messagesPage.items.length);
      setMessages(messagesPage.items);

      console.log("messagesPage",messagesPage);

       console.log("messagesPage autor",messagesPage.items);


      

 
      const handleNewMessage = (m: any) => {
        console.log(" New message received:", m.body);
        setMessages((prev) => [...prev, m]);
      };

      convo.on("messageAdded", handleNewMessage);


      return () => {
        convo.removeListener("messageAdded", handleNewMessage);
      };
    } catch (error) {
      console.error(" Conversation fetch failed:", error);
    }
  };

  fetchConversation();
}, [chatClient]);

 

const handleSendMessage = async () => {
  if (!conversation || !messageText.trim()) return; // prevent empty messages

  try {
    await conversation.sendMessage(messageText.trim());
    console.log(' Message sent:', messageText);

    setMessageText(''); // clear input after send
  } catch (error) {
    console.error('Message send failed:', error);
  }
};





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
          <Image source={profileImage} style={styles.profileImage} />
          <View>
            <Text allowFontScaling={false} style={styles.studentName}>
              Student Name
            </Text>
            <Text allowFontScaling={false} style={styles.universityName}>
              University Name
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.messageViewContainer}>
        <ScrollView
          bounces={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatContainer}
        >
          {/* LEFT MESSAGE WITH TAIL */}
          {/* <View style={[styles.messageContainer, styles.leftAlign]}>
            <View style={styles.leftBubbleWrapper}>
              <Svg
                width="20"
                height="20"
                viewBox="0 0 12 12"
                fill="none"
                style={{
                  top: -22,
                  left: 11,
                  opacity: 1, 
                  transform: [{ scale: 1.1 }], 
                }}
              >
                <Defs>
                  <ClipPath id="clip_left">
                    <Rect
                      width="20"
                      height="20"
                      transform="translate(5.65686) rotate(45)"
                    />
                  </ClipPath>
                </Defs>
                <Rect
                  x="5.65686"
                  width="8"
                  height="8"
                  rx="2"
                  transform="rotate(45 5.65686 0)"
                  fill="rgba(255,255,255,0.15)"
                  clipPath="url(#clip_left)"
                />
              </Svg>

              <View style={[styles.bubble, styles.leftBubble]}>
                <Text allowFontScaling={false} style={styles.messageText}>
                  Heyy!!
                </Text>
              </View>
            </View>       
          </View> */}

          <FlatList
  data={messages}
  keyExtractor={(item) => item.sid}
  renderItem={({ item }) => (

    
    <View
      style={[
        styles.messageContainer,
        item.author.state === checkUser ? styles.rightAlign : styles.leftAlign,
      ]}
    >
      <View
        style={
         item.author.state === checkUser
            ? styles.rightBubbleWrapper
            : styles.leftBubbleWrapper
        }
      >
        <Svg
          width="20"
          height="20"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            top: -22,
            left: item.author.state === checkUser ? -11 : 11,
            opacity: 1,
            transform: [
              { scale: 1.1 },
              { rotate: item.author.state === checkUser ? '180deg' : '0deg' },
            ],
          }}
        >
          <Defs>
            <ClipPath id="clip_bubble">
              <Rect
                width="20"
                height="20"
                transform="translate(5.65686) rotate(45)"
              />
            </ClipPath>
          </Defs>
          <Rect
            x="5.65686"
            width="8"
            height="8"
            rx="2"
            transform="rotate(45 5.65686 0)"
            fill={
              item.author.state === checkUser
                ? 'rgba(0,122,255,0.8)' // blue bubble for sender
                : 'rgba(255,255,255,0.15)' // white bubble for receiver
            }
            clipPath="url(#clip_bubble)"
          />
        </Svg>

        <View
          style={[
            styles.bubble,
           Number(item.author.state) === checkUser
              ? styles.rightBubble
              : styles.leftBubble,
          ]}
        >
          <Text allowFontScaling={false} style={styles.messageText}>
            {item.body}
          </Text>
        </View>
      </View>
    </View>
  )}
/>


          {/* RIGHT MESSAGE WITH TAIL */}
          <View style={[styles.messageContainer, styles.rightAlign]}>
            <View style={styles.rightBubbleWrapper}>
             
              <View style={[styles.bubble, styles.rightBubble]}>
                <Text allowFontScaling={false} style={styles.messageText}>
                  Hii!!
                </Text>
              </View>
               <Svg
                width="20"
                height="20"
                viewBox="0 0 12 12"
                fill="none"
                style={{
                  top: -23,
                  right: 11,
                  opacity: 1, // you can control overall SVG opacity
                  transform: [{ scale: 1.1 }, { rotate: '180deg' }], //  scale or rotate the entire shape
                }}
              >
                <Defs>
                  <ClipPath id="clip_left">
                    <Rect
                      width="20"
                      height="20"
                      transform="translate(5.65686) rotate(45)"
                    />
                  </ClipPath>
                </Defs>
                <Rect
                  x="5.65686"
                  width="8"
                  height="8"
                  rx="2"
                  transform="rotate(45 5.65686 0)"
                  fill="rgba(255, 255, 255, 0.28)"
                  clipPath="url(#clip_left)"
                />
              </Svg>
            </View>

            {/* <View style={[styles.bubble, styles.rightBubble]}>              
              <Text allowFontScaling={false} style={styles.messageText}>
                Yep, it's in good condition. Hardly used, and everything works
                perfectly.
              </Text>
            </View> */}
          </View>

          {/* More right messages */}
          {/* <View style={[styles.messageContainer, styles.rightAlign]}>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>
                Hii!!
              </Text>
            </View>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>
                Yep, it's in good condition. Hardly used, and everything works
                perfectly.
              </Text>
            </View>
          </View> */}
        </ScrollView>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.search_container}>
          <Image source={smileyhappy} style={styles.searchIcon} />
          <View
            style={{ height: 20, width: 0.9, backgroundColor: '#ffffff5f' }}
          />
          <TextInput
            allowFontScaling={false}
            style={styles.searchBar}
            placeholder="Search"
            placeholderTextColor="#ccc"
            onChangeText={setMessageText}
            value={messageText}
          />
        </View>
        <View style={styles.sendIconContainer}>
                <TouchableOpacity
        style={styles.sendIconContainer}
        onPress={handleSendMessage}
        activeOpacity={0.7}
      >
          <Image
            source={require('../../../assets/images/sendmessage.png')}
            style={styles.sendIcon}
          />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default MessagesIndividualScreen;

const styles = StyleSheet.create({
  // Bubble wrappers with tails
  leftBubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  rightBubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
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
  bottomContainer: {
    bottom: Platform.OS === 'ios' ? 200 : 150,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 20,
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
    marginBottom: 12,
  },
  bubble: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: '75%',
  },
  leftAlign: {
    alignItems: 'flex-start',
  },
  rightAlign: {
    alignItems: 'flex-end',
  },
  leftBubble: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  rightBubble: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
});


