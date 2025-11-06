import {
  View,
  Text,
  ImageBackground,
  Platform,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Modal,
  Dimensions,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { Key, useEffect, useRef, useState } from 'react';
import { BlurView } from '@react-native-community/blur';
import { useRoute } from '@react-navigation/native';
import { MAIN_URL } from '../../utils/APIConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '../../utils/toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';
import Button from '../../utils/component/Button';
import PayButton from '../../utils/component/PayButton';

type SearchDetailsProps = {
  navigation: any;
};

const { width } = Dimensions.get('window');

const profileImg = require('../../../assets/images/user.jpg');
const mylistings1 = require('../../../assets/images/favourite.png');

type ParamOption = {
  id: number;
  option_id: number;
  option_name: string;
};

type Param = {
  id: number;
  name: string;
  options: ParamOption[];
  field_type: string;
  param_value: string;
};

const SearchDetails = ({ navigation }: SearchDetailsProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showPopup1, setShowPopup1] = useState(false);
  const closePopup = () => setShowPopup(false);
  const closePopup1 = () => setShowPopup1(false);
  const [scrollY, setScrollY] = useState(0);
  const scrollY1 = new Animated.Value(0);
  const route = useRoute();
  const { id } = route.params as { id: number };
  const { name } = route.params as { name: string };
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const screenWidth = Dimensions.get('window').width;

  const [imageUri, setImageUri] = useState<string | null>(null);

  const insets = useSafeAreaInsets(); // Safe area insets
  const { height: screenHeight } = Dimensions.get('window');

  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        console.log(token)
        if (!token) return;
        const url1 = `${MAIN_URL.baseUrl}category/feature-detail/${id}`;
        console.log(url1);
        //const url1 = `http://65.0.99.229:4320/category/feature-detail/30`;

        const res = await fetch(url1, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setDetail(json.data);

        if (res.status === 401 || res.status === 403) {
          handleForceLogout();
          return;
        }

        if (json.statusCode === 401 || json.statusCode === 403) {
          handleForceLogout();
          return;
        }
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleForceLogout = async () => {
      console.log('Force logging out user...');
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
      });
    };
    fetchDetails();
  }, [id]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const images =
    detail?.files?.map((file: any) => ({
      uri: file.signedurl,
    })) || [];

  const onScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(index);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '01-01-2025'; // fallback if null
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handlePay = () => {
  navigation.navigate('PaymentScreen', {
    amount: Number(detail.price).toFixed(2),
    feature_id: id,
    nav: 'purchase',
    onSuccess: async () => {
      await purchaseProduct();
    }
  });
};


  const renderImage = () => {
    const fallbackImage = require('../../../assets/images/drone.png');

    if (detail?.profileshowinview) {
      const profileUri = detail?.createdby?.profile || null;
      const initials = `${detail?.createdby?.firstname?.[0] ?? ''}${
        detail?.createdby?.lastname?.[0] ?? ''
      }`.toUpperCase();

    return (
      <ImageBackground
        source={require('../../../assets/images/featurebg.png')}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          height:270,
          width:'100%'
        }}
      >
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            //paddingVertical: 20,
          }}
        >
          {profileUri ? (
            <Image
              source={{ uri: profileUri }}
              style={{
                //width: '100%',
                height: 180,
                borderRadius: 80,
              }}
              resizeMode="cover"
              onError={() => {
                console.log('Profile image failed to load');
                setImageUri(null);
              }}
            />
          ) : (

            <View
              style={{
                width: 180,
                height: 180,
                borderRadius: 90,
                backgroundColor: '#8390D4',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
              allowFontScaling={false}
                style={{
                  fontSize: 80,
                 color: '#FFF',
                 fontWeight:600,
                textAlign: 'center',
                fontFamily: 'Urbanist-SemiBold',
                }}
              >
                {initials || 'NA'}
              </Text>
            </View>
          )}
        </View>
      </ImageBackground>
    );
  }

    if (images.length > 1) {
      return (
        <View>
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            onScroll={onScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <Image
                source={item.uri ? { uri: item.uri } : fallbackImage}
                style={{ width: screenWidth, height: 270 }}
                resizeMode="cover"
              />
            )}
          />
          {/* Step Indicator */}
          <View style={styles.stepIndicatorContainer}>
            {images.map((_: any, index: number) => (
              <View
                key={index}
                style={
                  index === activeIndex
                    ? styles.activeStepCircle
                    : styles.inactiveStepCircle
                }
              />
            ))}
          </View>
        </View>
      );
    }
    return (
      <Image
        source={images[0]?.uri ? { uri: images[0].uri } : fallbackImage}
        style={{ width: screenWidth, height: 270 }}
        resizeMode="cover"
      />
    );
  };

  const handleBookmarkPress = async (productId: number) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      setDetail(
        (prev: any) =>
          prev ? { ...prev, isbookmarked: !prev.isbookmarked } : prev, // if null, just return null
      );

      const isCurrentlyBookmarked = bookmarkedIds.includes(productId);

      // 2️⃣ Send API request
      const url = MAIN_URL.baseUrl + 'category/list-bookmark';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feature_id: productId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Bookmark response:', data);

      // 3️⃣ Update bookmarkedIds for persistence
      let updatedBookmarks;
      if (isCurrentlyBookmarked) {
        updatedBookmarks = bookmarkedIds.filter(id => id !== productId);
      } else {
        updatedBookmarks = [...bookmarkedIds, productId];
      }

      setBookmarkedIds(updatedBookmarks);
      await AsyncStorage.setItem(
        'bookmarkedIds',
        JSON.stringify(updatedBookmarks),
      );
    } catch (error) {
      console.error('Bookmark error:', error);

      setDetail(
        (prev: any) =>
          prev ? { ...prev, isbookmarked: !prev.isbookmarked } : prev, // if null, just return null
      );
    }
  };

  const getInitials = (firstName = '', lastName = '') => {
    const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
    const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
    return f + l || '?';
  };

  const purchaseProduct = async () =>{
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      console.log('⚠️ Token not found. Cannot upload.');
      return;
    }
    const paymentintent_id= await AsyncStorage.getItem("paymentintent_id");
    try {

      const createPayload = {
          amount: Number(detail.price).toFixed(2), 
          feature_id: id,
          payment_id:paymentintent_id,
          
    };

    const url = `${MAIN_URL.baseUrl}transaction/post-order-complete`;

    console.log('Step 5: Calling create API with payload:', createPayload);

    const response = await fetch(url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createPayload),
      },
    );
      const data = await response.json();
      console.log('Response:', data);


      if (response.ok && data?.statusCode === 200) {
      // Save order id to storage
      await AsyncStorage.setItem("last_order_id", data.data?.orderid?.toString() || "");
      await AsyncStorage.setItem("last_transaction_amount", data.data?.amount?.toString() || "");
      await AsyncStorage.setItem('order_otp',data.data?.order_otp?.toString() || "");

      showToast(" Purchased successfully!", "success");
      setShowPopup1(true)
    } else {
      showToast(data?.message || "Something went wrong", "error");
    }
     
    } catch (err) {
      console.error('Error :', err);
    }
  }

    return (
      <ImageBackground
        source={require('../../../assets/images/backimg.png')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        <View style={styles.fullScreenContainer}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.backBtn}

               onPress={() => {
                  if (navigation.canGoBack()) {
                    navigation.goBack(); // go to previous screen if available
                  } else {
                    navigation.replace('Dashboard', {
                      AddScreenBackactiveTab: 'Home',
                      isNavigate: false,
                    });
                  }
                }}
                // onPress={() =>{navigation.replace('Dashboard',{AddScreenBackactiveTab: 'Home',isNavigate: false})}}
                >
                
                <View style={styles.backIconRow}>
                  <Image
                    source={require('../../../assets/images/back.png')}
                    style={{ height: 24, width: 24 }}
                  />
                </View>
              </TouchableOpacity>
              <Text allowFontScaling={false} style={styles.unizyText}>
                {detail?.category?.name
                  ? `${detail.category.name} Details`
                  : ''}
              </Text>
              <TouchableOpacity
                onPress={() => {
                    handleBookmarkPress(id);
                }}>
              <View style={styles.MylistingsBackground}>
                {/* <Image source={mylistings1} style={styles.iconSmall} /> */}
                <Image
                  source={
                    detail?.isbookmarked
                      ? require('../../../assets/images/favourite_filled.png') // bookmarked
                      : require('../../../assets/images/favourite.png') // not bookmarked
                  }
                  style={styles.iconSmall}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContainer,
              {
                paddingBottom:(Platform.OS === 'ios' ?screenHeight * 0.1 + -40:  screenHeight * 0.1 + insets.bottom),
                marginTop:16 // 10% of screen + safe area
              },
            ]}
            scrollEventThrottle={16}
          >
            {renderImage()}

          <View style={{ flex: 1, padding: 16 }}>
            <View style={styles.card}>
              <View style={{ gap: 8 }}>
                {detail && (
                  <>
                    <Text allowFontScaling={false} style={styles.QuaddText}>
                      {detail.title}
                    </Text>
                    <Text allowFontScaling={false} style={styles.priceText}>
                      £{Number(detail.price).toFixed(2)}
                    </Text>
                  </>
                )}
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 2,
                  alignSelf: 'stretch',
                }}
              >
                <Text allowFontScaling={false} style={styles.productDesHeding}>
                  Product Description
                </Text>
                <Text allowFontScaling={false} style={styles.productDesc}>
                  {detail?.description || 'No description available'}
                </Text>

                <View style={styles.datePosted}>
                  <Image
                    source={require('../../../assets/images/calendar_icon1.png')}
                    style={{ height: 16, width: 16 }}
                  />
                  <Text allowFontScaling={false} style={styles.datetext}>
                    Date Posted: {formatDate(detail?.created_at)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.gap12}>
                <Text
                  allowFontScaling={false}
                  style={styles.productDeatilsHeading1}
                >
                  {detail?.category?.name
                ? detail.category.name === 'Food'
                  ? 'Dish Details'
                  : `${detail.category.name} Details`
                : ''}
                </Text>

                  {detail?.params?.map((param: Param) => (
                    <View key={param.id} style={{ marginTop:4,marginBottom:0 }}>
                      {/* Param name */}
                      <Text allowFontScaling={false}style={styles.itemcondition}>{param.name}</Text>

                    {/* Param value */}
                    {param.options && param.options.length > 0 ? (
                      <View style={styles.categoryContainer}>
                        {param.options
                          // .filter(opt =>
                          //   param.param_value
                          //     ?.split(',')
                          //     .map(v => v.trim())
                          //     .includes(opt.option_id.toString()),
                          // )
                          .filter(opt =>
                            (param.param_value?.toString() || '')
                              .split(',')
                              .map(v => v.trim())
                              .includes(opt.option_id.toString()),
                          )
                          .map((opt: ParamOption) => (
                            <View key={opt.id} style={styles.categoryTag}>
                              <Text
                                allowFontScaling={false}
                                style={styles.catagoryText}
                              >
                                {opt.option_name}
                              </Text>
                            </View>
                          ))}
                      </View>
                    ) : (
                      <Text
                        allowFontScaling={false}
                        style={[styles.new, { marginTop:0}]}
                      >
                        {param.param_value || '—'}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Selaer details */}
            <View style={styles.card}>
              <View style={{ gap: 12 }}>
                <Text
                  allowFontScaling={false}
                  style={styles.productDeatilsHeading}
                >
                  Seller Details
                </Text>

                {/* User Info */}
                <View style={{ flexDirection: 'row',marginBottom:4 }}>
                  {/* <Image
                      source={
                        detail?.createdby?.profile
                          ? { uri: detail.createdby.profile }
                          : require('../../../assets/images/user.jpg')
                      }
                      style={styles.avatar}
                    /> */}
                  {detail?.createdby?.profile ? (
                    <Image
                      source={{ uri: detail.createdby.profile }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.initialsCircle}>
                      <Text
                        allowFontScaling={false}
                        style={styles.initialsText}
                      >
                        {getInitials(
                          detail?.createdby?.firstname ?? 'Alan',
                          detail?.createdby?.lastname ?? 'Walker',
                        )}
                      </Text>
                    </View>
                  )}

                  <View style={{ width: '80%', gap: 0 }}>
                    <Text allowFontScaling={false} style={styles.userName}>
                      {detail?.createdby
                        ? `${detail.createdby.firstname || ''} ${
                            detail.createdby.lastname || ''
                          }`
                        : 'Unknown User'}
                    </Text>

                    <Text allowFontScaling={false} style={styles.univeritytext}>
                      {detail?.university?.name
                        ? `${detail.university.name},`
                        : 'University of Warwick,'}
                    </Text>
                      <Text
                      allowFontScaling={false}
                      style={[styles.univeritytext, { marginTop: 0 }]}>
                      {'Coventry'}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row' }}>
                  <View
                    style={styles.bottombutton}>
                    <TouchableOpacity
                      disabled={!detail?.ispurchased}
                      onPress={() => {
                        if (detail?.ispurchased) {
                          navigation.navigate('ReviewDetails', {
                            category_id: detail?.category_id,
                            id: detail?.id,
                          });
                        }
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center' , gap: 6,}}
                    >
                      <Image
                        source={require('../../../assets/images/staricon.png')}
                        style={{ height: 16, width: 16 }}
                      />

                      <Text
                        allowFontScaling={false}
                        style={ styles.chattext}>
                        4.5
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.chatcard, { marginLeft: 8 }]}>
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                       onPress={() => {
                      if (detail?.ispurchased) {
                        navigation.navigate("MessagesIndividualScreen");
                      } else {
                        setShowPopup(true);
                      }
                    }}
                    >
                      <Image
                        source={require('../../../assets/images/message_chat.png')}
                        style={{ height: 16, width: 16, marginRight: 6 }}
                      />
                      <Text
                        allowFontScaling={false}
                        style={styles.chattext}>
                        Chat with Seller
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* <TouchableOpacity
          style={styles.previewBtn}
          //onPress={() => setShowPopup1(true)}

          onPress={() => navigation.navigate('PaymentScreen',{amount:Number(detail.price).toFixed(2),feature_id:id,nav:'purchase',onSuccess: async () => {
          await purchaseProduct();
        },})}
        >
          <Text allowFontScaling={false} style={{ textAlign: 'center' }}>
            <Text allowFontScaling={false} style={styles.payText}>
              Pay{' '}
            </Text>
            <Text allowFontScaling={false} style={styles.priceText1}>
              £{Number(detail?.price ?? 0).toFixed(2)}
            </Text>
          </Text>
        </TouchableOpacity>  */}
        

        <PayButton
          amount={Number(detail?.price).toFixed(2)}
          label="Pay"
          onPress={handlePay}
      /> 

        
    {/* <Button onPress={handlePay} title={"Pay "+ "£"+Number(detail?.price ?? 0).toFixed(2)} />  */}


        <Modal
          visible={showPopup}
          transparent
          animationType="fade"
          onRequestClose={closePopup}
        >
          <TouchableWithoutFeedback onPress={closePopup}>
            <View style={styles.overlay}>
              <BlurView
                style={{
                  flex: 1,
                  alignContent: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  alignItems: 'center',
                }}
                blurType="dark"
                blurAmount={1000}
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
                    source={require('../../../assets/images/alerticon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: 'rgba(255, 255, 255, 0.80)',
                      fontFamily: 'Urbanist-SemiBold',
                      fontSize: 20,
                      fontWeight: '600',
                      letterSpacing: -0.4,
                      lineHeight: 28,
                    }}
                  >
                    Complete Your Purchase
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: 'rgba(255, 255, 255, 0.48)',
                      fontFamily: 'Urbanist-Regular',
                      fontSize: 14,
                      textAlign: 'center',
                      fontWeight: '400',
                      letterSpacing: -0.28,
                      lineHeight: 19.6,
                    }}
                  >
                    Chat with the seller will be available after you’ve bought
                    this product or service.
                  </Text>

                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => {
                      setShowPopup(false);
                    }}
                  >
                    <Text allowFontScaling={false} style={styles.loginText}>
                      Go Back
                    </Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal
          visible={showPopup1}
          transparent
          animationType="fade"
          onRequestClose={closePopup1}
        >
          <TouchableWithoutFeedback onPress={closePopup1}>
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
                    source={require('../../../assets/images/success_icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: 'rgba(255, 255, 255, 0.80)',
                      fontFamily: 'Urbanist-SemiBold',
                      fontSize: 20,
                      fontWeight: '600',
                      letterSpacing: -0.4,
                      lineHeight: 28,
                    }}
                  >
                    Order Placed Successfully!
                  </Text>

                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => {
                      navigation.replace('Dashboard', {
                        AddScreenBackactiveTab: 'Home',
                        isNavigate: false,
                      });
                      setShowPopup1(false);
                    }}
                  >
                    <Text allowFontScaling={false} style={styles.loginText}>
                      Return to Home
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.loginButton1}
                    onPress={() => {
                      navigation.replace('Dashboard', {
                        AddScreenBackactiveTab: 'Home',
                        isNavigate: false,
                      });
                      setShowPopup1(false);
                    }}
                  >
                    <Text allowFontScaling={false} style={styles.loginText1}>
                      Chat with Seller
                    </Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
      <NewCustomToastContainer />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({


  chattext:{
  color: 'rgba(255, 255, 255, 0.48)',
  fontFamily: 'Urbanist-SemiBold',
  fontSize: 14,
  fontWeight: '600',
  fontStyle: 'normal',
  letterSpacing: -0.28,
  },
  chatcard:{
  borderRadius: 10,
    backgroundColor:'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    flex:1,
    paddingHorizontal: 16,
    paddingVertical:12,
    height:'auto'
    //width: '80%',
  },

  bottombutton:{
 borderRadius: 10,
  backgroundColor:'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
  boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 4,
  padding: 16,
  //width: '20%',
  paddingHorizontal: 16,
  paddingVertical:12,
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

  MylistingsBackground: {
    height: 48,
    width: 48,

    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(97, 179, 255, 0.2) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow:
      '0 2px 8px 0 rgba(255, 255, 255, 0.2)inset 0 2px 8px 0 rgba(0, 0, 0, 0.2)',

    borderTopColor: '#ffffff5d',
    borderBottomColor: '#ffffff36',
    borderLeftColor: '#ffffff5d',
    borderRightColor: '#ffffff36',
    borderWidth: 0.3,
  },
  iconSmall: {
    width: 25,
    height: 25,
  },

  // stepIndicatorContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginTop: 12,
  //   gap: 6,
  // },
  // stepCircle: {
  //   width: 12,
  //   height: 12,
  //   borderRadius: 16,
  //   backgroundColor: 'rgba(255, 255, 255, 0.3)',
  // },
  // activeStepCircle: {
  //   width: 12,
  //   height: 12,
  //   borderRadius: 40,
  //   backgroundColor: '#FFFFFF',
  //   borderColor: '#ffffff4e',
  //   borderWidth: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 1 },
  //   shadowOpacity: 0.25,
  //   shadowRadius: 3.33,
  //   elevation: 2,
  // },
  // inactiveStepCircle: {
  //   width: 12,
  //   height: 12,
  //   borderRadius: 40,
  //   backgroundColor: 'rgba(255, 255, 255, 0.2)', // fallback for radial-gradient
  //   borderColor: '#ffffff4e',
  //   borderWidth: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 1 },
  //   shadowOpacity: 0.25,
  //   shadowRadius: 3.33,
  //   elevation: 2,
  // },

  stepIndicatorContainer: {
  position: 'absolute',
  bottom: 12, // place above bottom edge of image
  alignSelf: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 6,
  zIndex: 10, // ensures it's on top of image
},

stepCircle: {
  width: 12,
  height: 12,
  borderRadius: 16,
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
},

activeStepCircle: {
  width: 12,
  height: 12,
  borderRadius: 40,
  backgroundColor: '#FFFFFF',
  borderColor: '#ffffff4e',
  borderWidth: 1,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.25,
  shadowRadius: 3.33,
  elevation: 2,
},

inactiveStepCircle: {
  width: 12,
  height: 12,
  borderRadius: 40,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderColor: '#ffffff4e',
  borderWidth: 1,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.25,
  shadowRadius: 3.33,
  elevation: 2,
},
  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    // paddingTop: 20,
  },
  backBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    height: 70,
    paddingTop: (Platform.OS === 'ios' ? 40: 40),
    //paddingBottom: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    position: 'absolute',
   top: Platform.OS === 'ios' ? 10 : 10, 
  // bottom:Platform.OS === 'ios' ? 20 : 10,
    left: 0,
    right: 0,
    zIndex: 10,
    // overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 25 : 0,
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
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    marginTop: 16,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },

  loginButton1: {
    display: 'flex',
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'rgba(170, 169, 176, 0.56)',
    marginTop: 16,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },
  termsText1: {
    color: 'rgba(255,255,255,0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },

  popupContainer: {
    width: width * 0.85,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    overflow: 'hidden',

    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  previewText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
  },
  payText: {
    color: '#002050',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 1,
  },
  previewBtn: {
    display: 'flex',
    width: '90%',
    alignSelf: 'center',
    alignContent: 'center',
    paddingHorizontal: 20,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',

    position: 'absolute',
    bottom: 10,
  },
  scrollContainer: {
    paddingBottom: 280,
    paddingTop: 90,
    // paddingHorizontal: 20,
  },

  datePosted: {
    flexDirection: 'row',
    height: 'auto',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.09) 100%)',
    //boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    borderRadius: 8,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 6,
    paddingBottom: 6,
    marginTop:12,
    alignItems: 'center',
    gap: 4,
  },

  userSub: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: -0.24,
  },
   datetext: {
    //color: 'rgba(255, 255, 255, 0.48)',
    color:'#9CD6FF',
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: -0.24,
  },
  univeritytext: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    marginTop:4,
    lineHeight:14
  },
  userName: {
    position: 'relative',
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: -0.32,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    resizeMode:'cover'
  },
  gap12: {
    gap: 8,
  },
  gap4: {
    gap: 4,
  },
  catagory: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
  },
  new: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 20,
  },
  itemcondition: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',

  },
  catagoryText: {
    // fontFamily: 'Urbanist-Regular',
    // fontSize: 12,
    // fontWeight: '500',
    // fontStyle: 'normal',
    // lineHeight: 16,
    // //color: '#fff',
    // color:'#9CD6FF'
    color:'#9CD6FF',
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: -0.24,
  },

   catagoryText1: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 1.3,
    //color: '#fff',
    color:'#9CD6FF'
  },
  categoryTag: {
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.10) 100%)',
    //borderWidth: 0.9,
    //borderColor: 'rgba(255, 255, 255, 0.08)',
    //borderBlockEndColor: 'rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.48)',
    borderRadius: 4,
    marginRight: 8,
    //boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.23)',
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 2,
    paddingBottom: 2,
    marginTop:6
  },
  productDesHeding: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
  },
  productDesc: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-Medium',
    fontSize: 14,
    fontWeight: '500',
    //fontStyle: 'normal',
    lineHeight: 18,
  },
  productDeatilsHeading: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: -0.36,
  },

    productDeatilsHeading1: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: -0.36,
  },
  QuaddText: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    //fontStyle: 'normal',
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  priceText: {
    color: '#fff',
    fontFamily: 'Urbanist-Bold',
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: -0.1,
  },
  priceText1: {
    color: '#002050',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: 1,
  },

  card: {
    flexDirection: 'column',
    marginBottom: 6,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
    marginTop:6
  },
  h24_w24: {
    width: 24,
    height: 24,
  },
  backIconRow: {
    //padding: 12,
    borderRadius: 40,

    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    height: 48,
    width: 48,

    justifyContent: 'center',
    alignItems: 'center',
  },
  previewThumbnail: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
});

export default SearchDetails;
