import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Animated,
  Dimensions,
  Easing,
  Platform,
  FlatList,
} from 'react-native';
import { showToast } from '../../utils/toast';
import { MAIN_URL } from '../../utils/APIConstant';
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';


const bgImage = require('../../../assets/images/bganimationscreen.png');
const profileImg = require('../../../assets/images/user.jpg'); 
const logouticon=require('../../../assets/images/logout.png')

const helpicon=require('../../../assets/images/help.png')
const okicon=require('../../../assets/images/ok.png')

const cardData = [
  { id: '1', title: 'Payment Methods', image: require('../../../assets/images/payment.png') },
  { id: '2', title: 'My Orders', image: require('../../../assets/images/cart.png') },
  { id: '3', title: 'My Reviews', image: require('../../../assets/images/ok.png') },
  { id: '4', title: 'Notifications', image: require('../../../assets/images/notify.png') },
  { id: '5', title: 'Help & Support', image: require('../../../assets/images/help.png') },
  { id: '6', title: 'Logout', image: require('../../../assets/images/logout.png') },
  
];

const arrowIcon = require('../../../assets/images/nextarrow.png');


type ProfileCardContentProps = {
  navigation: any;
};
const ProfileCard = ({ navigation }: ProfileCardContentProps) => {
  
  const screenHeight = Dimensions.get('window').height;
  const [slideUp1] = useState(new Animated.Value(0));

 interface UserMeta {
  firstname: string | null;
  lastname: string | null;
  profile: string | null;
  student_email: string | null;
  email?: string | null;
  university_name?: string | null;
}

const [userMeta, setUserMeta] = useState<UserMeta | null>(null);
const [expanded, setExpanded] = useState(false);
const animatedHeight = useRef(new Animated.Value(0)).current;

useEffect(() => {
  if (expanded) {
    Animated.timing(animatedHeight, {
      toValue: 1,
      duration: 800, 
      useNativeDriver: false,
    }).start();
  }
}, [expanded]);


useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');

        if (!token || !userId) {
          console.warn('Missing token or user ID in AsyncStorage');
          return;
        }

        const url = `${MAIN_URL.baseUrl}user/user-profile/${userId}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          const user = data.data;
          setUserMeta({
            firstname: user.firstname ?? null,
            lastname: user.lastname ?? null,
            profile: user.profile ?? null,
            student_email: user.student_email ?? null,
            email: user.email ?? null,
            university_name: user.university_name ?? null,
          });
        } else {
          console.warn('Failed to fetch user profile:', data?.message || response.status);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

const renderItem = ({ item }: any) => {
  const isLogout = item.title.toLowerCase() === 'logout';

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={async () => {
        if (isLogout) {      
        await AsyncStorage.setItem('ISLOGIN', 'false');
        showToast('User Logout Successfully','success')
        navigation.reset({
          index: 0,
          routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
        });
        } else {
          console.log(item.title, 'pressed');
        }
      }}
    >
      <Image source={item.image} style={styles.cardImage} />
      <Text
        style={[
          styles.cardText,
          isLogout && { color: '#FF8282E0' },
        ]}
      >
        {item.title}
      </Text>
      <Image source={arrowIcon} style={styles.cardArrow} />
    </TouchableOpacity>
  );
};
  const APP_VERSION = '1.0.0'; 

const clickBack = () =>{
    navigation.replace('Dashboard');
  }

return (
   
      <View style={styles.fullScreenContainer}>
        {/* Header */}
        {/* <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => {navigation.navigate('Dashboard')}}
            >
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.unizyText}>Profile</Text>
            <View style={{ width: 30 }} />
          </View>
        </View> */}

        <View style={styles.header}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={clickBack}
        >
          <View style={styles.backIconRow}>
            <Image
              source={require('../../../assets/images/back.png')}
              style={{ height: 24, width: 24 }}
            />
          </View>
        </TouchableOpacity>
        <Text style={styles.unizyText}>Profile</Text>
        <View style={{ width: 30 }} />
      </View>
    </View>


        <View style={{ paddingTop: 120 }}> 
        
             <View style={styles.userRow}>
            <View style={{ width: '20%' }}>
              <Image source={profileImg} style={styles.avatar} />
            </View>
            <View style={{ width: '80%' }}>
              <Text style={styles.userName}>
                {userMeta
                  ? `${userMeta.firstname ?? ''} ${userMeta.lastname ?? ''}`.trim()
                  : 'Loading...'}
              </Text>
              <View style={{ flexDirection: 'column', gap: 6,marginTop:4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image
            source={require('../../../assets/images/buildings.png')}
            style={{ width: 16, height: 16 }}
            />
             <Text style={styles.userSub}>
              {userMeta?.university_name || 'University Name'}
            </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image
            source={require('../../../assets/images/sms.png')}
            style={{ width: 16, height: 16 }}
            />
             <Text style={styles.userSub}>
              {userMeta?.email || 'studentname@gmail.com'}
            </Text>
        </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Image
          source={require('../../../assets/images/sms.png')}
          style={{ width: 16, height: 16 }}
        />
      <Text style={styles.userSub}>
          {userMeta?.student_email || 'studentname@university.ac.uk'}
        </Text>
      </View>
    </View>
    </View>
    </View>   

    <View style={styles.listContainer}>
      <FlatList
        data={cardData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
       <View style={[styles.cardContainer, { justifyContent: 'space-between', paddingHorizontal: 16,marginTop:12 }]}>
        <Text style={styles.cardText}>App Version</Text>
        <Text style={styles.versionText}>{APP_VERSION}</Text>
      </View>  
    </View>  
      
      </View>
      <NewCustomToastContainer/>
      </View>
   
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    
  },
  versionRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 4,
  width: '100%',
  paddingHorizontal: 10, // optional, align with card content
},

versionLabel: {
  color: '#888',
  fontSize: 12,
},


  versionText: {
  position: 'absolute',
  right: 20,
  color: '#fff',
  fontSize: 14,
  fontWeight: '500',
   fontFamily: 'Urbanist-SemiBold',
},
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 12,
    height:50
    
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
  cardArrow: {
    width: 24,
    height: 24,
  },

  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullScreenContainer: {
    flex: 1,
  },
  header: {
    height: 100,
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIconRow: {
    padding: 12,
    borderRadius: 40,
    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    height: 48,
    width: 48,
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
 
  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    paddingTop: 100,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal:16
  },
  productdetails: {
    marginTop: 10,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userName: {
    position: 'relative',
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.32,
  },
  userSub: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
 
});
