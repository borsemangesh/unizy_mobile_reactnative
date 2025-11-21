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
  TouchableWithoutFeedback,
} from 'react-native';
import { showToast } from '../../utils/toast';
import { MAIN_URL } from '../../utils/APIConstant';
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';
import { useFocusEffect } from '@react-navigation/native';
import { BlurView } from '@react-native-community/blur';
import DeviceInfo from 'react-native-device-info';


const bgImage = require('../../../assets/images/backimg.png');
const profileImg = require('../../../assets/images/user.jpg'); 
const logouticon=require('../../../assets/images/logout.png')

const helpicon=require('../../../assets/images/help.png')
const okicon=require('../../../assets/images/ok.png')

const cardData = [
  { id: '1', title: 'Payment Methods', image: require('../../../assets/images/payment.png') },
  { id: '2', title: 'My Orders', image: require('../../../assets/images/cart.png') },
  { id: '3', title: 'My Reviews', image: require('../../../assets/images/ok.png') },
  { id: '4', title: 'Notifications', image: require('../../../assets/images/notify.png') },
  { id: '5', title: 'Help & Support', image: require('../../../assets/images/helpicon.png') },
  { id: '6', title: 'Logout', image: require('../../../assets/images/logout.png') },
  {id:'7',title:'App Version',image: require('../../../assets/images/versionicon.png')}
  
];

const arrowIcon = require('../../../assets/images/nextarrow.png');


type ProfileCardContentProps = {
  navigation: any;
};
const ProfileCard = ({ navigation }: ProfileCardContentProps) => {
  
  const screenHeight = Dimensions.get('window').height;
  const [slideUp1] = useState(new Animated.Value(0));
  const [isHidden, setIsHidden] = useState(true);

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
 const [showConfirm, setShowConfirm] = useState(false);

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


        console.log("profile card page.... ",userId);
        


        if (!token || !userId) {
          console.warn('Missing token or user ID in AsyncStorage');
          return;
        }

        console.log(token)

        const url = `${MAIN_URL.baseUrl}user/user-profile/${userId}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
        handleForceLogout();
        return;
      }

      // 👇 Case 2: backend wraps statusCode in JSON body
      if (data.statusCode === 401 || data.statusCode === 403) {
        handleForceLogout();
        return;
      }

        if (response.ok) {
          const user = data.data;

          console.log("user data .........",user);
          
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
    const handleForceLogout = async () => {
      console.log('User inactive or unauthorized — logging out');
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
      });
    };

    fetchUserProfile();
  }, []);
  const openStripeOnboarding = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(
        `${MAIN_URL.baseUrl}transaction/account-detail`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
 
      const json = await response.json();
 
      if (json?.statusCode === 200 && json.data.onboardingLink) {
        const onboardingLink = json?.data?.onboardingLink;
 
        if(Platform.OS === 'ios'){
          navigation.replace("StripeOnboardingScreen", {
            onboardingUrl: onboardingLink,
          });
        } else {
          navigation.navigate("StripeOnboardingScreen", {
            onboardingUrl: onboardingLink,
          });
      }
       
     
      }
      else if(json?.data?.stripeAccount?.isboardcomplete)
      {
            
            if(Platform.OS === 'ios'){
              navigation.replace("AccountDeatils", { showSuccess: true })
            } else {
              navigation.navigate("AccountDeatils", { showSuccess: true })
          }
      }
      else {
        Alert.alert('Error', json?.message || 'Something went wrong.Please try again');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Something went wrong.Please try again');
      }
    }
  };


const renderItem = ({ item }: any) => {
  const isLogout = item.title.toLowerCase() === 'logout';
  const isVersion = item.title.toLowerCase() === 'app version';
 

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={async () => {
        if (isLogout) {      
        // await AsyncStorage.setItem('ISLOGIN', 'false');
        // navigation.reset({
        //   index: 0,
        //   routes: [{ name: 'SinglePage', params: { resetToLogin: true , logoutMessage: 'User Logout Successfully'} }],
        // });

        setShowConfirm(true); 
      }
        else if (item.title === 'My Orders') {
          if(Platform.OS === 'ios'){
            navigation.replace('MyOrders'); 
          } else {
            navigation.navigate('MyOrders'); 
          }
          
        } 
        else if (item.title === 'My Reviews') {
          if(Platform.OS === 'ios'){
            navigation.replace('MyReviews'); 
          } else {
            navigation.navigate('MyReviews'); 
          }
          // navigation.navigate('MyReviews'); 
        } 
        else if (item.title === 'Help & Support') {
          navigation.navigate('HelpSupport'); 
        } 

        else if (item.title === 'Notifications') {
          if(Platform.OS === 'ios'){
            navigation.replace('Notification'); 
          } else {
            navigation.navigate('Notification'); 
          }
          
        }
        else if(item.title === 'Payment Methods'){
          openStripeOnboarding();
        } 
         else {
          console.log(item.title, 'pressed');
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
      {isVersion ? (
        <Text allowFontScaling={false} style={styles.versionText}>{APP_VERSION}</Text>
      ) : !isLogout && (
        <Image source={arrowIcon} style={styles.cardArrow} />
      )}
    </TouchableOpacity>
  );
};
  const APP_VERSION = 'v1.0.0'; 

const clickBack = () =>{
    navigation.replace('Dashboard',{AddScreenBackactiveTab: 'Home',isNavigate: false})
  }
  const getInitials = (firstName = '', lastName = '') => {
  const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
  const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
  return (f + l) || '?';
};

return (
  <View style={styles.fullScreenContainer}>
    {/* <View style={[styles.header]}>
      <View style={styles.headerRow}>
        <Text allowFontScaling={false} style={styles.unizyText}>
          Profile
        </Text>
      </View>
    </View> */}

    <View
      style={{
        paddingTop: Platform.OS === 'ios' ? 0: 0,
        marginHorizontal: 16,
        gap: 24,
      }}
    >
      <View style={styles.userRow}>
        <View style={{ gap: 10 }}>
          {userMeta?.profile ? (
            <Image source={{ uri: userMeta.profile }} style={styles.avatar} />
          ) : (
            <View style={styles.initialsCircle}>
              <Text allowFontScaling={false} style={styles.initialsText}>
                {getInitials(
                  userMeta?.firstname ?? 'A',
                  userMeta?.lastname ?? 'W',
                )}
              </Text>
            </View>
          )}
        </View>

        <View style={{
               }}>
          {/* Name + Edit on top row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text allowFontScaling={false} style={styles.userName}>
              {userMeta
                ? `${userMeta.firstname ?? ''} ${
                    userMeta.lastname ?? ''
                  }`.trim()
                : 'Loading...'}
            </Text>
          </View>

          {/* Details below name */}
          <View style={{ flexDirection: 'column', gap: 6, marginTop: 4 }}>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8}}
            >
              <Image
                source={require('../../../assets/images/buildings.png')}
                style={{ width: 16, height: 16 }}
              />
              {/* <Text allowFontScaling={false} style={styles.userSub}>
                {userMeta?.university_name || 'University Name'}
              </Text> */}
              <Text allowFontScaling={false} style={styles.userSub}>
                {userMeta?.university_name
                  ? userMeta.university_name.length > 25
                    ? userMeta.university_name.slice(0, 25) + '…'
                    : userMeta.university_name
                  : 'University Name'}
              </Text>
            </View>

            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <Image
                source={require('../../../assets/images/sms.png')}
                style={{ width: 16, height: 16 }}
              />
              <Text allowFontScaling={false} style={styles.userSub}>
                {userMeta?.email || 'studentname@gmail.com'}
              </Text>
            </View>

            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <Image
                source={require('../../../assets/images/sms.png')}
                style={{ width: 16, height: 16 }}
              />
              <Text allowFontScaling={false} style={styles.userSub}>
                {userMeta?.student_email || 'studentname@university.ac.uk'}
              </Text>
            </View>
          </View>
       
        </View>
        
        <TouchableOpacity
        style={{position: 'absolute',right: 15,top: 14,}}
          onPress={() => {
            navigation.navigate('EditProfile');
          }}
        >
          <View style={styles.editcard}>
            <Text allowFontScaling={false} style={styles.edittext}>
              Edit
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={cardData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      </View>
    </View>

    <Modal
      visible={showConfirm}
      transparent
      animationType="fade"
      onRequestClose={() => setShowConfirm(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowConfirm(false)}>
        <View style={styles.overlay}>
          <BlurView
            style={{
              flex: 1,
              alignContent: 'center',
              justifyContent: 'center',
              width: '100%',
              alignItems: 'center',
            }}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
          >
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(0, 0, 0, 0.32)' },
              ]}
            />

            <View style={styles.popupContainer}>
              <Image
                source={require('../../../assets/images/alert_logout.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text allowFontScaling={false} style={styles.mainheader}>
                Confirm Logout
              </Text>
              <Text allowFontScaling={false} style={styles.subheader}>
                Are you sure you want to log out from your account?
              </Text>

              {/* <TouchableOpacity
                style={styles.loginButton}
                onPress={async () => {
                  setShowConfirm(false);
                  await AsyncStorage.setItem('ISLOGIN', 'false');
                  navigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'SinglePage',
                        params: {
                          resetToLogin: true,
                          logoutMessage: 'User Logout Successfully',
                        },
                      },
                    ],
                  });
                }}
              >
                <Text allowFontScaling={false} style={styles.loginText}>
                  Log out
                </Text>
              </TouchableOpacity> */}

              <TouchableOpacity
              style={styles.loginButton}
              onPress={async () => {
                try {
                  const deviceId = await DeviceInfo.getUniqueId();
                  const user_id = await AsyncStorage.getItem('userId'); // <-- your stored user id

                  const body = {
                    device_type: 'android',
                    device_id: deviceId,
                    user_id: Number(user_id),
                  };

                  const response = await fetch(`${MAIN_URL.baseUrl}user/delete-fcm-token`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                  });

                  const apiData = await response.json();

                  console.log("Logout API Response:", apiData);

                  // If API success → proceed to logout
                  if (apiData?.statusCode === 200) {
                    setShowConfirm(false);
                    await AsyncStorage.setItem('ISLOGIN', 'false');

                    navigation.reset({
                      index: 0,
                      routes: [
                        {
                          name: 'SinglePage',
                          params: {
                            resetToLogin: true,
                            logoutMessage: 'User Logout Successfully',
                          },
                        },
                      ],
                    });
                  } else {
                    showToast("Logout failed! Please try again.");
                  }

                } catch (error) {
                 // console.log("Logout API Error:", error);
                  console.log("Something went wrong. Try again!");
                }
              }}
            >
              <Text allowFontScaling={false} style={styles.loginText}>
                Log out
              </Text>
            </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton1}
                onPress={() => setShowConfirm(false)}
              >
                <Text allowFontScaling={false} style={styles.loginText1}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
    <NewCustomToastContainer />
  </View>
);
};

export default ProfileCard;

const styles = StyleSheet.create({

  logo: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },

    popupContainer: {
    width: '85%',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    overflow: 'hidden',

    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },

  mainheader: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 28,

  },
  subheader: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 6,
  },

  loginText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    width: '100%',
  },
  loginText1: {
    color: '#FFFFFF7A',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    width: '100%',
  },

  loginButton: {
    display: 'flex',
    width: '100%',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    marginTop: 20,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },

  loginButton1: {
    display: 'flex',
    width: '100%',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'rgba(170, 169, 176, 0.56)',
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },


  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  editcard:{
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderColor: '#ffffff11',
    borderRadius:10,
    boxSizing: 'border-box',
    //gap:10,
    alignSelf: 'flex-start',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.14) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.02)inset -1px 10px 5px 10px,rgba(236, 232, 232, 0.3)inset -0.99px -0.88px 0.90px 0px,rgba(236, 232, 232, 0.3)inset 0.99px 0.88px 0.90px 0px', 

  },

  edittext:{
    fontFamily: 'Urbanist-SemiBold',
    fontSize:14,
    color:'#fff',
    fontWeight:600,
    textAlign:'center',
    
    
  },

  initialsCircle:{
    backgroundColor: '#8390D4',
    alignItems: 'center',
    justifyContent: 'center',
    width: 88,
    height: 88,
    borderRadius: 20,

    
    marginRight: 12
  },
  initialsText:{
   color: '#fff',
  fontSize: 36,
  fontWeight:600,
  textAlign: 'center',
  fontFamily: 'Urbanist-SemiBold',
  },
  listContainer: {
    // padding: 16,
    
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
    minHeight:52,
    //marginTop:6,

    
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
    // flex: 1,
  },
  header: {
  
    paddingTop: (Platform.OS === 'ios' ? '15.2%': 40),

    justifyContent: 'center',
    position: 'absolute',
    alignItems: 'center',
    alignSelf: 'center',
   top:  Platform.OS === 'ios' ? 10 : 10, 
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

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
    // justifyContent: 'space-between',
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    // gap: 10,
    padding: 12,
  },
  productdetails: {
    marginTop: 10,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 20,
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