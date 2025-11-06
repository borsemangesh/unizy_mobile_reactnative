import { useState } from 'react';
import { Image, ImageBackground, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const bgImage = require('../../../assets/images/backimg.png');
const profileImage = require('../../../assets/images/user.jpg');
const back = require('../../../assets/images/back.png');
const smileyhappy = require('../../../assets/images/smileyhappy.png');

type MessagesIndividualScreenProps ={
  navigation: any;
}

const MessagesIndividualScreen = ({navigation}:MessagesIndividualScreenProps) => {



    const [messageText, setMessageText] = useState('');

  return (
    <ImageBackground source={bgImage} style={{ flex: 1 }} resizeMode="cover">
      <View style={styles.messageHeader}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Image
            source={back}
            resizeMode="contain"
            style={styles.backIconStyle}
          />
        </TouchableOpacity>
        <TouchableOpacity style={{flexDirection: 'row',gap: 10, alignItems: 'center',}} onPress={() =>{
            navigation.navigate('UserProfileScreen');
        }}>
        <Image source={profileImage} style={styles.profileImage} />
        <View>
          <Text allowFontScaling={false} style={styles.studentName}>Student Name</Text>
          <Text allowFontScaling={false} style={styles.universityName}>University Name</Text>
        </View>
        </TouchableOpacity>
      </View>

      <View style={styles.messageViewContainer}>
        <ScrollView bounces={true} showsVerticalScrollIndicator={false} contentContainerStyle={styles.chatContainer}>
          <View style={[styles.messageContainer, styles.leftAlign]}>
            <View style={[styles.bubble, styles.leftBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>Heyy!!</Text>
            </View>
            <View style={[styles.bubble, styles.leftBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>
                I saw your listing for the quadcopter drone.
              </Text>
            </View>
            <View style={[styles.bubble, styles.leftBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>
                Can you tell me a bit about the condition? Is it working fine?
              </Text>
            </View>
          </View>

          {/* Receiver Message */}
          <View style={[styles.messageContainer, styles.rightAlign]}>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>Hii!!</Text>
            </View>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>
                Yep, it’s in good condition. Hardly used, and everything works
                perfectly.
              </Text>
            </View>
          </View>


<View style={[styles.messageContainer, styles.rightAlign]}>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>Hii!!</Text>
            </View>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>
                Yep, it’s in good condition. Hardly used, and everything works
                perfectly.
              </Text>
            </View>
          </View>
          <View style={[styles.messageContainer, styles.rightAlign]}>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>Hii!!</Text>
            </View>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>
                Yep, it’s in good condition. Hardly used, and everything works
                perfectly.
              </Text>
            </View>
          </View>
          <View style={[styles.messageContainer, styles.rightAlign]}>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>Hii!!</Text>
            </View>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>
                Yep, it’s in good condition. Hardly used, and everything works
                perfectly.
              </Text>
            </View>
          </View>
          <View style={[styles.messageContainer, styles.rightAlign]}>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>Hii!!</Text>
            </View>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>
                Yep, it’s in good condition. Hardly used, and everything works
                perfectly.
              </Text>
            </View>
          </View>
          <View style={[styles.messageContainer, styles.rightAlign]}>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>Hii!!</Text>
            </View>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>
                Yep, it’s in good condition. Hardly used, and everything works
                perfectly.
              </Text>
            </View>
          </View>
          <View style={[styles.messageContainer, styles.rightAlign]}>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>Hii!!</Text>
            </View>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>
                Yep, it’s in good condition. Hardly used, and everything works
                perfectly.
              </Text>
            </View>
          </View>
          <View style={[styles.messageContainer, styles.rightAlign]}>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>Hii!!</Text>
            </View>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>
                Yep, it’s in good condition. Hardly used, and everything works
                perfectly.
              </Text>
            </View>
          </View>
          <View style={[styles.messageContainer, styles.rightAlign]}>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>Hii!!</Text>
            </View>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>
                Yep, it’s in good condition. Hardly used, and everything works
                perfectly.
              </Text>
            </View>
          </View>
          <View style={[styles.messageContainer, styles.rightAlign]}>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>Hii!!</Text>
            </View>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>
                Yep, it’s in good condition. Hardly used, and everything works
                perfectly.
              </Text>
            </View>
          </View>
          <View style={[styles.messageContainer, styles.rightAlign]}>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>Hii!!</Text>
            </View>
            <View style={[styles.bubble, styles.rightBubble]}>
              <Text allowFontScaling={false} style={styles.messageText}>
                Yep, it’s in good condition. Hardly used, and everything works
                perfectly.
              </Text>
            </View>
          </View>



        </ScrollView>
        
      </View>
      <View style={styles.bottomContainer}>
          <View style={styles.search_container}>
            <Image source={smileyhappy} style={styles.searchIcon} />
            <View style={{height: 20, width: 0.9, backgroundColor: '#ffffff5f'}}/>
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
            <Image source={require('../../../assets/images/sendmessage.png')} style={styles.sendIcon} />
          </View>
        </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  sendIconContainer:{
    // padding: 10,
    // borderRadius: 100,
    // borderWidth: 0.5,
    // borderColor: '#ffffff33',
    //  backgroundColor:
    //   'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.23) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    // boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25), rgba(255, 255, 255, 0.18) inset -1px 0px 5px 1px ',
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
  sendIcon:{

    width: 20,
    height: 20,
  },
  bottomContainer:{
    // position: 'relative',
    // top: 0,
    bottom: (Platform.OS === 'ios' ? 200 : 150),
    // alignContent: 'flex-end'
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 20
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
    padding: (Platform.OS === 'ios'? 0:5),
    margin: 10,
    height: 24,
    width: 24,
  },
  searchBar: {
    fontFamily: 'Urbanist-Medium',
    marginLeft: 5,
    fontWeight: 500,
    fontSize: 17,
    color: '#fff',
    width: '70%',
  },
  universityName:{
    fontSize: 12,
    fontFamily: 'Urbanist-Medium',
    fontWeight: 500,
    color: '#FFFFFF'
  },

  backIconStyle:{
    width: 30,
    height: 30,
    
  },
  studentName:{
    color: '#ffffff',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600,
    fontSize: 16,

  },
  messageHeader:{
    flexDirection: 'row',
    // height: 100,
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 12,
    gap: 10,
    marginTop: (Platform.OS === 'ios'? 50:20),
    
  },
  messageViewContainer:{
    paddingHorizontal: 16,
    width: '100%',
    height: '100%',
    paddingBottom: (Platform.OS === 'ios'? 205:155),
  },
  messagesView:{

    width: '40%',
    minWidth: 'auto',    
    backgroundColor: 'redial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(97, 179, 255, 0.2) 0%, rgba(255, 255, 255, 0.10) 100%)',
    padding: 10,
    borderRadius: 10,
  },
  profileImage:{
    width: 50,
    height:50,
    borderRadius: 100,
  },





  container: {
    flex: 1,
  },
  chatContainer: {
    justifyContent: "flex-start",
  },
  messageContainer: {
    marginBottom: 12,
  },
  bubble: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: "75%",
  },
  leftAlign: {
    alignItems: "flex-start",
  },
  rightAlign: {
    alignItems: "flex-end",
  },
  leftBubble: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  rightBubble: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },


});

export default MessagesIndividualScreen;
