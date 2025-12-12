import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { FlatList, Image, ImageBackground, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MAIN_URL } from '../../utils/APIConstant';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Loader from '../../utils/component/Loader';
import { NewCustomToastContainer, showToast } from '../../utils/component/NewCustomToastManager';
import { BlurView } from '@react-native-community/blur';
import { Constant } from '../../utils/Constant';
import { resetTwilioClient } from '../emoji/twilioService';
import { clearTwilioCache } from './MessageIndividualScreen';

const bgImage = require('../../../assets/images/backimg.png');
const profileImage = require('../../../assets/images/user.jpg');
const back = require('../../../assets/images/back.png');
const smileyhappy = require('../../../assets/images/smileyhappy.png');
const arrowIcon = require('../../../assets/images/nextarrow.png');

type RouteParams = {
  source?: 'chatList' | 'sellerPage';
  members: {
    firstname: string;
    lastname: string;
    id: number;
    profile: string | null;
    isblocked: boolean
    university: { id: number, name: string };
  };
};

type UserProfileScreenProps = {
  navigation: any;
}

const UserProfileScreen = ({ navigation }: UserProfileScreenProps) => {

  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const { members } = route.params;
  const [messageText, setMessageText] = useState('');
  const [userList, setUserList] = useState<any>(null);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchUserChatData = async (query: string = "") => {
      try {
        setLoading(true)
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');

        console.log(token)

        if (!token || !userId) {
          console.warn('Missing token or user ID in AsyncStorage');
          return;
        }

        const url = `${MAIN_URL.baseUrl}user/info?user_id=${members.id}`;

        console.log(url)


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

        const UserData = data.data;
        setUserList(UserData);
      } catch (error) {
        setLoading(false)
        console.error('Chat setup failed:', error);
      }
      finally {
        setLoading(false)
      }
    };

    fetchUserChatData();
  }, []);

  const getInitials = (firstName = '', lastName = '') => {
    const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
    const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
    return (f + l) || '?';
  };

  const renderItem = ({ item }: any) => {
    const isBlockUser = item.id === '3';  // <-- add this
    const isLogout = item.id.toLowerCase() === 'logout';
    const isVersion = item.title.toLowerCase() === 'app version';

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={async () => {
          if (item.id === '2') {
            navigation.navigate('UserListing', {
              animation: 'none',
              members: members,
              source: 'chatList',
            });
          } else if (item.id === '1') {
            navigation.navigate('UserReviews', {
              animation: 'none',
              members: members,
              source: 'chatList',
            });
          } else if (item.id === '3') {
            setShowConfirm(true);
          }
        }}
      >
        <Image source={item.image} style={styles.cardImage} />

        <Text
          allowFontScaling={false}
          style={[
            styles.cardText,
            (isLogout || isBlockUser) && { color: '#FF8282E0' }, // <-- red color
          ]}
        >
          {item.title}
        </Text>

        {/* Hide arrow ONLY for id 3 */}
        {!isBlockUser && (
          <Image source={arrowIcon} style={styles.cardImage} />
        )}
      </TouchableOpacity>
    );
  };


  const cardData = [
    {
      id: '1',
      title: `${userList?.firstname || ''} ${t('reviews')}`,
      image: require('../../../assets/images/ok.png'),
    },
    {
      id: '2',
      title: `${userList?.firstname || ''} ${t('listings')}`,
      image: require('../../../assets/images/mylistingicon.png'),
    },

    {
      id: '3',
      title: `${t('block')} ${userList?.firstname || ''} `,
      image: require('../../../assets/images/block_icon.png'),
    },
  ];

  const filteredCardData = cardData.filter(item => {
  if (members?.isblocked && item.id === '3') {
    return false; // hide block option
  }
  return true;
});
  return (
    <ImageBackground source={bgImage} style={{ flex: 1 }} resizeMode="cover">
      <View style={styles.fullScreenContainer}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => {
              navigation.goBack();
            }}>
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.unizyText}>{t('contact_info')}</Text>
            <View style={{ width: 48 }} />
          </View>
        </View>

        <View style={styles.container}>

          <View style={styles.profileContainer}>
            {userList?.profileUrl ? (
              <Image
                source={{ uri: userList.profileUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.initialsCircle}>
                <Text allowFontScaling={false} style={styles.initialsText}>
                  {getInitials(
                    userList?.firstname ?? '',
                    userList?.lastname ?? ''
                  )}
                </Text>
              </View>
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
              data={filteredCardData}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          </View>
        </View>
      </View>
      {loading && (
        <View style={styles.fullLoader}>
          <Loader />
        </View>
      )}
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
                  source={require('../../../assets/images/block_user.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text allowFontScaling={false} style={styles.mainheader}>
                  {t('block_user')}
                </Text>
                <Text allowFontScaling={false} style={styles.subheader}>
                  {t('block_msg')}
                </Text>


                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={async () => {
                    try {
                      const token = await AsyncStorage.getItem('userToken');
                      const user_id = await AsyncStorage.getItem('userId');

                      const body = {
                        blockedUserId: userList.id,
                        //user_id: Number(user_id),
                      };

                      console.log("📤 Sending block-user request:", body);
                      const response = await fetch(`${MAIN_URL.baseUrl}user/block-user`, {
                        method: 'POST',
                        headers: {
                          Authorization: `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(body),
                      });
                      console.log("📥 Raw Response Status:", response.status);

                      const apiData = await response.json();
                      const backendMsg = apiData?.message || "Success";

                      console.log("📥 Backend Response JSON:", apiData);

                      if (apiData?.statusCode === 200) {
                        setShowConfirm(false);
                        showToast(t(backendMsg), "success");

                        navigation.reset({
                          index: 0,
                          routes: [
                            {
                              name: 'Dashboard',
                              params: {
                                AddScreenBackactiveTab: 'Bookmark',
                                isNavigate: false,
                              },
                            },
                          ],
                        });
                      } else {
                        //showToast(t(Constant.LOGOUT_FAIL), 'error');
                      }

                    } catch (error) {
                      console.log("Something went wrong. Try again!");
                    }
                  }}
                >
                  <Text allowFontScaling={false} style={styles.loginText}>
                    {t('yes_proceed')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.loginButton1}
                  onPress={() => setShowConfirm(false)}
                >
                  <Text allowFontScaling={false} style={styles.loginText1}>
                    {t('cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <NewCustomToastContainer />
    </ImageBackground>
  );

};

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
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

  loginText1: {
    color: '#FFFFFF7A',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    width: '100%',
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

  fullLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  initialsCircle: {
    backgroundColor: '#8390D4',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  initialsText: {
    color: '#fff',
    fontSize: 44,
    fontWeight: 600,
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
  },

  fullScreenContainer: {
    flex: 1
  },
  header: {

    // position: 'absolute',
    // top: Platform.OS === 'ios' ? '6%' : 40,
    // width: Platform.OS === 'ios' ? 393 : '100%',
    // flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'center',
    // paddingHorizontal: 16,
    // zIndex: 11,
    // alignSelf: 'center',
    // pointerEvents: 'box-none',
    // marginTop: 9,
    // marginLeft: 2
    position: 'absolute',
    top: (Platform.OS === 'ios' ? 60 : 40),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 11,
    alignSelf: 'center',
    pointerEvents: 'box-none',
    justifyContent: 'space-between',
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
    // backgroundColor:
    //   'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    // boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
    // borderWidth: 0.4,
    // borderColor: '#ffffff2c',
    height: 48,
    width: 48,


    borderWidth: 0.3,
    borderColor: '#ffffff11',

    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23),0px 0.90px 0px 0px rgba(255, 255, 255, 0.11) inset, 0px -0.90px 0px 0px rgba(255, 255, 255, 0.11) inset',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',

    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',

    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
    boxSizing: 'border-box',
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
    resizeMode: 'contain'
  },
  cardText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
    fontFamily: 'Urbanist-SemiBold',
  },

  container: {
    // flex: 1,
    // backgroundColor: '#0047FF', // Gradient-like deep blue
    // alignItems: 'center',
    paddingTop: 120,
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
    fontSize: 24,
    //fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600
  },
  subText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
    fontFamily: 'Urbanist-Medium',
    fontWeight: 500
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
    height: 50,
    marginTop: 6,

  },

});

export default UserProfileScreen;