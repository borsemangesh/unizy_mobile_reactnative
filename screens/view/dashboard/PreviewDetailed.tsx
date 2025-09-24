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
} from 'react-native';
import { Key, useEffect, useRef, useState } from 'react';
import { BlurView } from '@react-native-community/blur';
import { showToast } from '../../utils/toast';
import { MAIN_URL } from '../../utils/APIConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';

type previewDetailsProps = {
  navigation: any;
};

const { width } = Dimensions.get('window');

const profileImg = require('../../../assets/images/user.jpg');

const itemOptions = [
  { id: 1, option_name: 'New' },
  { id: 2, option_name: 'Like new' },
  { id: 3, option_name: 'Used' },
];

const categoryOptions = [
  { id: 4, option_name: 'Appliances (Kitchen & Home)' },
  { id: 8, option_name: 'Clothing, Shoes & Accessories' },
  { id: 9, option_name: 'Electronics & Gadgets' },
  { id: 10, option_name: 'Event Wear & Costumes' },
  { id: 11, option_name: 'Furniture' },
  { id: 12, option_name: 'Games, Toys & Hobbies' },
  { id: 13, option_name: 'Health & Personal Care' },
  { id: 15, option_name: 'Kitchenware & Dining' },
  { id: 16, option_name: 'Miscellaneous / Other' },
  { id: 17, option_name: 'Musical Instruments & Audio Gear' },
  { id: 18, option_name: 'Pet Supplies' },
  { id: 19, option_name: 'Sports & Fitness Gear' },
  { id: 20, option_name: 'Stationery & Office Supplies' },
  { id: 21, option_name: 'Tickets & Gift Cards' },
  { id: 5, option_name: 'Art & Craft Supplies' },
  { id: 7, option_name: 'Books & Study Materials' },
  { id: 6, option_name: 'Bicycles & Personal Transport' },
];

const PreviewDetailed = ({ navigation }: previewDetailsProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const closePopup = () => setShowPopup(false);
  const [scrollY, setScrollY] = useState(0);
  const scrollY1 = new Animated.Value(0);

  const [storedForm, setStoredForm] = useState<any | null>(null);
  const screenWidth = Dimensions.get('window').width;
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const [userMeta, setUserMeta] = useState<UserMeta | null>(null);

  interface UserMeta {
  firstname: string | null;
  lastname: string | null;
  profile: string | null;
  student_email: string | null;
}

  useEffect(() => {
    const fetchStoredData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('formData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log('Stored Form Data:', parsedData);
          setStoredForm(parsedData);
        } else {
          console.log('No form data found');
        }
      } catch (error) {
        console.log('Error reading form data: ', error);
      }
    };

    fetchStoredData();
  }, []);

    useEffect(() => {
    const loadUserMeta = async () => {
      try {
        const metaStr = await AsyncStorage.getItem('userMeta');
        if (metaStr) {
          const meta: UserMeta = JSON.parse(metaStr);
          setUserMeta(meta);
        }
      } catch (error) {
        console.log('Error loading userMeta', error);
      }
    };

    loadUserMeta();
  }, []);


  type FormEntry = {
  value: any;
  alias_name: string | null;
};

const getValueByAlias = (
  formData: Record<string, FormEntry> | null,
  alias: string
): any => {
  if (!formData) return null;

  const entry = Object.values(formData).find(
    (item) => item.alias_name === alias
  ) as FormEntry | undefined;

  return entry ? entry.value : null;
};

const titleValue = getValueByAlias(storedForm, 'title') || 'No Title';
const priceValue = getValueByAlias(storedForm, 'price') || '0';
const descriptionvalue= getValueByAlias(storedForm,'Description') || 'No Description'
  

  const onScroll = (event: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    const slideSize = screenWidth;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

  type ImageField = {
  id?: string;
  uri: string;
  name: string;
  type?: string;
};

const handleListPress = async () => {
  console.log('🔵 handleListPress called');
 setShowPopup(true);
  // try {
  //   console.log('Step 1: Fetching formData from AsyncStorage...');
  //   const storedData = await AsyncStorage.getItem('formData');
  //   console.log('✅ AsyncStorage.getItem(formData) result:', storedData);

  //   if (!storedData) {
  //     console.log('⚠️ No form data found in storage');
  //     showToast('No form data found');
  //     return;
  //   }

  //   const formData: Record<
  //     string,
  //     { value: any; alias_name: string | null }
  //   > = JSON.parse(storedData);
  //   console.log('✅ Parsed formData:', formData);

  //   console.log('Step 2: Fetching userToken...');
  //   const token = await AsyncStorage.getItem('userToken');
  //   const productId1 = await AsyncStorage.getItem('selectedProductId');

  //   if (!token) {
  //     console.log('⚠️ Token not found. Cannot upload.');
  //     return;
  //   }

  //   console.log('Step 3: Splitting formData...');

  //   const imageFields = Object.entries(formData)
  //     .filter(([key, obj]) => {
  //       const v = obj.value;
  //       return (
  //         Array.isArray(v) &&
  //         v.length > 0 &&
  //         v.every((item: any) => item?.uri)
  //       );
  //     })
  //     .map(([key, obj]) => [key, obj.value as ImageField[]]) as [
  //     string,
  //     ImageField[]
  //   ][];

  //   const nonImageFields = Object.entries(formData).filter(([key, obj]) => {
  //     const v = obj.value;
  //     return !(Array.isArray(v) && v.every((item: any) => item?.uri));
  //   });

  //   console.log('✅ Non-image fields:', nonImageFields);
  //   console.log('✅ Image fields:', imageFields);

  //   const dataArray = nonImageFields.map(([key, obj]) => ({
  //     id: Number(key),
  //     param_value: obj.value, // now take .value
  //   }));

  //   console.log('✅ Data array for create API:', dataArray);

  //   const createPayload = {
  //     category_id: productId1, // dynamic or static
  //     data: dataArray,
  //   };

  //   console.log('Step 5: Calling create API with payload:', createPayload);

  //   const createRes = await fetch(
  //     `${MAIN_URL.baseUrl}category/featurelist/create`,
  //     {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(createPayload),
  //     },
  //   );

  //   console.log(`✅ Create API status: ${createRes.status}`);
  //   const createJson = await createRes.json();
  //   console.log('✅ Create API response:', createJson);

  //   if (!createRes.ok) {
  //     showToast('Failed to create feature list');
  //     return;
  //   }

  //   // 6️⃣ Get feature_id from create API response
  //   const feature_id = createJson?.data?.id;
  //   if (!feature_id) {
  //     console.log('❌ feature_id not returned from create API.');
  //     showToast('feature_id missing in response');
  //     return;
  //   }
  //   console.log('✅ feature_id from create API:', feature_id);

  //   // 7️⃣ Upload images one by one
  //   for (const [param_id, images] of imageFields) {
  //     console.log(`Step 7: Uploading images for param_id=${param_id}`);

  //     for (const image of images) {
  //       console.log(
  //         `🟡 Preparing upload for image under param_id=${param_id}:`,
  //         image,
  //       );

  //       const data = new FormData();
  //       data.append('files', {
  //         uri: image.uri,
  //         type: image.type || 'image/jpeg',
  //         name: image.name,
  //       } as any);
  //       data.append('feature_id', feature_id); // from API response
  //       data.append('param_id', param_id);

  //       console.log('✅ FormData prepared for upload');

  //       const uploadUrl = `${MAIN_URL.baseUrl}category/featurelist/image-upload`;
  //       console.log(
  //         `Step 7: Uploading image ${image.name} with param_id=${param_id} to ${uploadUrl}`,
  //       );

  //       const uploadRes = await fetch(uploadUrl, {
  //         method: 'POST',
  //         headers: {
  //           Authorization: `Bearer ${token}`, // no Content-Type for FormData
  //         },
  //         body: data,
  //       });

  //       console.log(`✅ Upload completed. Status: ${uploadRes.status}`);
  //       const uploadJson = await uploadRes.json();
  //       console.log('✅ Upload response JSON:', uploadJson);

  //       if (!uploadRes.ok) {
  //         console.log(
  //           `❌ Upload failed for ${image.name} (param_id=${param_id})`,
  //         );
  //         showToast(`Failed to upload image ${image.name}`);
  //       } else {
  //         console.log(
  //           `✅ Upload success for ${image.name} (param_id=${param_id})`,
  //         );
  //       }
  //     }
  //   }

  //   console.log('✅ All uploads done. Showing toast.');
  //   showToast('All data uploaded successfully');
  //   setShowPopup(true);
  // } 
  // catch (error) {
  //   console.log('❌ Error in handleListPress:', error);
  //   showToast('Error uploading data');
  // }
};

  return (
    <ImageBackground
      source={require('../../../assets/images/bganimationscreen.png')}
      style={{ width: '100%', height: '100%' }}
      resizeMode="cover"
    >
      <View style={styles.fullScreenContainer}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.unizyText}>Preview Details</Text>
            <View style={{ width: 30 }} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          onScroll={Animated.event([
            {
              nativeEvent: { contentOffset: { y: scrollY1 } },
            },
          ])}
          scrollEventThrottle={16}
        >
     
        {storedForm?.[6]?.value?.length > 1 ? (
        <View style={{ position: 'relative' }}>
          <FlatList
            ref={flatListRef}
            data={storedForm[6].value}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            onScroll={onScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.uri }}
                style={{ width: screenWidth, height: 250 }}
                resizeMode="cover"
              />
            )}
          />

          {/* Custom Step Indicator inside image */}
          <View
            style={[
              styles.stepIndicatorContainer,
              {
                position: 'absolute',
                bottom: 10, // distance from bottom of image
                left: 0,
                right: 0,
                flexDirection: 'row',
                justifyContent: 'center',
              },
            ]}
          >
            {storedForm[6].value.map((_: any, index: number) => {
              const isActive = index === activeIndex;
              return (
                <View
                  key={index}
                  style={isActive ? styles.activeStepCircle : styles.inactiveStepCircle}
                />
              );
            })}
          </View>
        </View>
      ) : (
        <Image
          source={
            storedForm?.[6]?.value?.[0]?.uri
              ? { uri: storedForm[6].value[0].uri }
              : require('../../../assets/images/drone.png')
          }
          style={{ width: '100%', height: 250 }}
          resizeMode="cover"
        />
      )}

                  <View style={{ flex: 1, padding: 16 }}>
            <View style={styles.card}>
              <View style={{ gap: 8 }}>
                <Text style={styles.QuaddText}>
                  {titleValue}
                </Text>

                <Text style={styles.priceText}>
                  {`£${priceValue}`}
                </Text>
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
                <Text style={styles.productDesHeding}>Product Description</Text>
                <Text style={styles.productDesc}>
                  {descriptionvalue}
                </Text>

                <View style={styles.datePosted}>
                  <Image
                    source={require('../../../assets/images/calendar_icon.png')}
                    style={{ height: 16, width: 16 }}
                  />
                  <Text style={styles.userSub}>Date Posted:10-01-2025</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.gap12}>
                <Text style={styles.productDeatilsHeading}>
                  Product Details
                </Text>
                <View style={{ gap: 8 }}>
                  <Text style={styles.itemcondition}>Item Condition</Text>
                  <View>
                    <View style={styles.categoryContainer}>
                      {storedForm?.[9]?.map((id: number, index: number) => {
                        const option = itemOptions.find(o => o.id === id);
                        return (
                          // <Text key={index} style={[styles.new, { marginTop: -6 }]}>
                          //   {option?.option_name || 'Unknown'}
                          // </Text>
                          <View key={index} style={styles.categoryTag}>
                            <Text style={styles.catagoryText}>
                              {option?.option_name || 'Unknown'}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                  {/* </View> */}
                  <View style={styles.gap4}>
                    <Text style={styles.catagory}>Category</Text>
                    {/* <View style={styles.categoryContainer}>
                    <View style={styles.categoryTag}>
                      <Text style={styles.catagoryText}>Category 1</Text>
                    </View>
                    <Text style={styles.categoryTag}>
                      <Text style={styles.catagoryText}>Category 1</Text>
                    </Text>
                  </View> */}
                    <View style={styles.categoryContainer}>
                      {storedForm?.[10]?.map(
                        (id: number, index: Key | null | undefined) => {
                          const option = categoryOptions.find(o => o.id === id);
                          return (
                            <View key={index} style={styles.categoryTag}>
                              <Text style={styles.catagoryText}>
                                {option?.option_name || 'Unknown'}
                              </Text>
                            </View>
                          );
                        },
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Selaer details */}
            <View style={styles.card}>
              <View style={{ gap: 12 }}>
                <Text style={styles.productDeatilsHeading}>Seller Details</Text>

                {/* User Info */}
                <View style={{ flexDirection: 'row' }}>
                  <Image source={profileImg} style={styles.avatar} />

                  <View style={{ width: '80%', gap: 4 }}>
                    {/* <Text style={styles.userName}>Alan Walker</Text> */}
                    <Text style={styles.userName}>
  {`${userMeta?.firstname ?? ''} ${userMeta?.lastname ?? ''}`.trim()}
</Text>
                    <Text style={styles.univeritytext}>
                      University of Warwick,
                    </Text>
                    <Text style={[styles.univeritytext, { marginTop: -5 }]}>
                      Coventry
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View
                    style={{
                      borderRadius: 10,
                      backgroundColor:
                        'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
                      boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 4,
                      padding: 16,

                      width: '20%',
                    }}
                  >
                    <Image
                      source={require('../../../assets/images/staricon.png')}
                      style={{ height: 16, width: 16 }}
                    />

                    <Text
                      style={{
                        color: 'rgba(255, 255, 255, 0.48)',
                        fontFamily: 'Urbanist-SemiBold',
                        fontSize: 14,
                        fontWeight: '600',
                        fontStyle: 'normal',
                        letterSpacing: -0.28,
                      }}
                    >
                      4.5
                    </Text>
                  </View>
                  <View
                    style={{
                      borderRadius: 10,
                      backgroundColor:
                        'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
                      boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 4,
                      padding: 16,
                      width: '80%',
                    }}
                  >
                    <Image
                      source={require('../../../assets/images/message_chat.png')}
                      style={{ height: 16, width: 16 }}
                    />
                    <Text
                      style={{
                        color: 'rgba(255, 255, 255, 0.48)',
                        fontFamily: 'Urbanist-SemiBold',
                        fontSize: 14,
                        fontWeight: '600',
                        fontStyle: 'normal',
                        letterSpacing: -0.28,
                      }}
                    >
                      Chat with Seller
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom */}
        <TouchableOpacity style={styles.previewBtn} onPress={handleListPress}>
          <Text style={styles.previewText}>List</Text>
        </TouchableOpacity>
        {/* </ScrollView> */}

        <Modal
          visible={showPopup}
          transparent
          animationType="fade"
          onRequestClose={closePopup}
        >
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
                  source={require('../../../assets/images/success_icon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.80)',
                    fontFamily: 'Urbanist-SemiBold',
                    fontSize: 20,
                    fontWeight: '600',
                    fontStyle: 'normal',
                    letterSpacing: -0.4,
                    lineHeight: 28,
                  }}
                >
                  Product Listed Successfully!
                </Text>
                <Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.48)',
                    fontFamily: 'Urbanist-Regular',
                    fontSize: 14,
                    fontWeight: '400',
                    fontStyle: 'normal',
                    letterSpacing: -0.28,
                    lineHeight: 19.6,
                    textAlign:'center'
                  }}
                >
                  Your product is now live and visible to other students.
                </Text>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={async () => {
                    try {
                      await AsyncStorage.removeItem('formData');
                      await AsyncStorage.removeItem('selectedProductId');
                      console.log('✅ formData cleared from AsyncStorage');

                      navigation.navigate('Dashboard');
                      setShowPopup(false);
                    } catch (err) {
                      console.log('❌ Error clearing formData:', err);
                    }
                  }}
                >
                  <Text style={styles.loginText}>
                    Return to Choose Category
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    marginTop: 25,
  },
  backBtn: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    height: 70,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    // overflow: 'hidden',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // fallback for radial-gradient
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullScreenContainer: {
    flex: 1,
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
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    borderRadius: 8,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 6,
    paddingBottom: 6,
    marginTop:6,
    alignItems: 'center',
    gap: 3,
  },

  userSub: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: -0.24,
  },
  univeritytext: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    fontWeight: '500',
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  gap12: {
    gap: 12,
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
    fontFamily: 'Urbanist-Regular',
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
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 16,
    color: '#fff',
  },
  categoryTag: {
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderWidth: 0.9,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderBlockEndColor: 'rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.48)',
    borderRadius: 4,
    marginRight: 8,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.23)',
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 2,
    paddingBottom: 2,
  },
  productDesHeding: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
  },
  productDesc: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 20,
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

  QuaddText: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  priceText: {
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 24,
  },

  card: {
    flexDirection: 'column',
    marginBottom: 6,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  h24_w24: {
    width: 24,
    height: 24,
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
    top: -10,
    left: 0,
    right: 0,
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

export default PreviewDetailed;
