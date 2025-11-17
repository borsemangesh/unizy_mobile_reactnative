import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { FlatList, Image, ImageBackground, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MAIN_URL } from '../../utils/APIConstant';

const bgImage = require('../../../assets/images/backimg.png');
const profileImage = require('../../../assets/images/user.jpg');
const back = require('../../../assets/images/back.png');
const smileyhappy = require('../../../assets/images/smileyhappy.png');
const arrowIcon = require('../../../assets/images/nextarrow.png');


const cardData = [

  { id: '1', title: 'Allen Reviews',  image: require('../../../assets/images/ok.png') },
  { id: '2', title: 'Allen Listings',image: require('../../../assets/images/mylistingicon.png') },
];

type UserProfileScreenProps ={
  navigation: any;
}

const UserProfileScreen = ({navigation}:UserProfileScreenProps) => {

    const [messageText, setMessageText] = useState('');
    const [userList, setUserList] = useState<any>(null);


    useEffect(() => {
    const fetchUserChatData = async (query: string = "") => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');

        if (!token || !userId) {
          console.warn('Missing token or user ID in AsyncStorage');
          return;
        }


      
        const url = `${MAIN_URL.baseUrl}user/info?user_id=${userId}`;
        console.log('url----------',url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        console.log("data",data);
        

        if (!response.ok) {
          console.warn('Token fetch failed:', data.message);
          return;
        }

        console.log('data', data);

        const UserData = data.data;
       setUserList(UserData);

        console.log('UserData--------------------', userList);

        // console.log("chatData",chatData);
      } catch (error) {
        console.error('Chat setup failed:', error);
      }
    };

    fetchUserChatData();
  }, []);

const renderItem = ({ item }: any) => {
      const isLogout = item.title.toLowerCase() === 'logout';
      const isVersion = item.title.toLowerCase() === 'app version';
    
      return (
        <TouchableOpacity
          style={styles.cardContainer}
          onPress={async () => {
           if (item.title === 'Allen Listings') {
              navigation.navigate('UserListing'); 
            } 
            else if (item.title === 'Allen Reviews') {
              navigation.navigate('UserReviews'); 
            } 
          }}
        >
          <Image source={item.image} style={styles.cardImage} />
          <Text allowFontScaling={false}
            style={[
              styles.cardText,
              isLogout && { color: '#FF8282E0' },
            ]}
          >
            {item.title}
          </Text>
          <Image source={arrowIcon} style={styles.cardImage} />
         
        </TouchableOpacity>
      );
    };


 
return (
    <ImageBackground source={bgImage} style={{ flex: 1 }} resizeMode="cover">
     <View style={styles.fullScreenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() =>{
              navigation.goBack();
              // navigation.replace('Dashboard',{AddScreenBackactiveTab: 'Home',isNavigate: false})
              }}>
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.unizyText}>Contact Info</Text>
            <View style={{ width: 48 }} />
          </View>
        </View>

        <View style={styles.container}>
   
      {/* Profile Section */}
      <View style={styles.profileContainer}>
        {userList?.profileUrl ? (
          <Image 
            source={{ uri: userList.profileUrl }}
            style={styles.profileImage}
          />
        ) : (
          <Image 
            source={profileImage}
            style={styles.profileImage}
          />
        )}
        <Text allowFontScaling={false} style={styles.nameText}>
          {userList?.firstname || ''} {userList?.lastname || ''}
        </Text>
        <Text allowFontScaling={false} style={styles.subText}>
          {userList?.university_name 
            ? (userList?.city 
                ? `${userList.university_name}, ${userList.city}`
                : userList.university_name)
            : userList?.city 
              ? userList.city
              : '-'}
        </Text>
      </View>
      <View style={styles.listContainer}>
      <FlatList
        data={cardData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
      </View>
    </View>
    </View>
    </ImageBackground>
  );

};

const styles = StyleSheet.create({
 
  fullScreenContainer: {
    flex: 1
    },
    header: {
      paddingTop: Platform.OS === 'ios' ? 50 : 50,
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
  
       display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
        boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
      borderWidth: 0.4,
      borderColor: '#ffffff2c',
      height: 48,
      width: 48,
    },
    unizyText: {
      color: '#FFFFFF',
      fontSize: 20,
      flex: 1,
      textAlign: 'center',
      fontWeight: '600',
       fontFamily: 'Urbanist-SemiBold',
    },





    listContainer: {
      padding: 16,
      
    },
    cardImage: {
      width: 25,
      height: 25,
     // borderRadius: 25,
      resizeMode:'contain'
    },
    cardText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
       fontFamily: 'Urbanist-SemiBold',
    },

    container: {
      // flex: 1,
      // backgroundColor: '#0047FF', // Gradient-like deep blue
      // alignItems: 'center',
      // paddingTop: 80,
    },
  
    headerText: {
      fontSize: 22,
      color: '#fff',
      fontWeight: '600',
      marginBottom: 40,
    },
    profileContainer: {
      alignItems: 'center',
      // marginBottom: 50,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 15,
    },
    nameText: {
      color: '#fff',
      fontSize: 22,
      fontWeight: '600',
    },
    subText: {
      color: '#DCE3FF',
      fontSize: 15,
      marginTop: 4,
      textAlign: 'center',
    },
    buttonsContainer: {
      width: '100%',
      paddingHorizontal: 16,
    },
    button: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 12,
      paddingVertical: 18,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    buttonText: {
      flex: 1,
      color: '#fff',
      fontSize: 16,
      marginLeft: 10,
    },
    icon: {
      marginRight: 10,
    },

    cardContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.06)',
      borderRadius: 12,
      padding: 12,
      height:50,
      marginTop:6,  
      
    },

});

export default UserProfileScreen;
