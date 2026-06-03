import React, { useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import BACK_ICON from '../../../assets/images/backimg.png';
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';

type HelpSupportProps = {
  navigation: any;
};

type MessageType = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

const Whatsapp_chatBoot = ({ navigation }: HelpSupportProps) => {
  const { t } = useTranslation();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: MessageType = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
    };

    setMessages(prev => [...prev, userMessage]);

    const currentMessage = message;
    setMessage('');

      console.log('User Message:', currentMessage);
      console.log('API Endpoint:', 'http://35.154.226.12:4320/twilio/twillio-webhook');
  try {
//   const response = await fetch(
//     'http://35.154.226.12:4320/twilio/twillio-webhook',
//     {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         message: currentMessage,
//       }),
//     },
      //   );
      
      const API_URL = 'http://35.154.226.12:4320/twilio/whatsapp-webhook';

const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: currentMessage,
  }),
});

  const data = await response.json();

  console.log('FULL API RESPONSE =>', data);

  const botMessage: MessageType = {
    id: Date.now().toString() + '_bot',
    text: data?.body || 'No response from bot',
    sender: 'bot',
  };

  console.log('Bot Reply:', data?.body);

  setMessages(prev => [...prev, botMessage]);
} catch (error) {
  console.log('API Error:', error);

  const errorMessage: MessageType = {
    id: Date.now().toString() + '_error',
    text: 'Something went wrong',
    sender: 'bot',
  };

  setMessages(prev => [...prev, errorMessage]);
}
  };

  const renderItem = ({ item }: { item: MessageType }) => {
    const isUser = item.sender === 'user';

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.botMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <ImageBackground
      source={BACK_ICON}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.fullScreenContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={() =>
                  navigation.replace('HelpSupport', {
                    AddScreenBackactiveTab: 'Profile',
                    isNavigate: false,
                  })
                }
              >
                <View style={styles.backIconRow}>
                  <Image
                    source={require('../../../assets/images/back.png')}
                    style={{ height: 24, width: 24 }}
                  />
                </View>
              </TouchableOpacity>

              <Text allowFontScaling={false} style={styles.unizyText}>
                {t('help_support')}
              </Text>

              <View style={{ width: 48 }} />
            </View>
          </View>

          {/* Chat List */}
          <FlatList
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.chatContainer}
          />

          {/* Bottom Input */}
          <View style={styles.inputContainer}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessage}
            >
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>

        <NewCustomToastContainer />
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Whatsapp_chatBoot;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  fullScreenContainer: {
    flex: 1,
    marginTop: 10,
  },

  header: {
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backIconRow: {
    padding: 12,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    width: 48,
    borderWidth: 0.3,
    borderColor: '#ffffff11',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    marginRight: 12,
  },

  chatContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
  },

  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },

  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2C2C2E',
  },

  messageText: {
    color: '#fff',
    fontSize: 16,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#111',
  },

  input: {
    flex: 1,
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },

  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },

  sendText: {
    color: '#fff',
    fontWeight: '600',
  },
});