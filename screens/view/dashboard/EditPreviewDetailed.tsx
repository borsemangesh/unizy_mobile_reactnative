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
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Key, useEffect, useRef, useState } from 'react';
import { BlurView } from '@react-native-community/blur';
import { showToast } from '../../utils/toast';
import { MAIN_URL } from '../../utils/APIConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import Button from '../../utils/component/Button';
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';

import AnimatedReanimated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

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

const EditPreviewDetailed = ({ navigation }: previewDetailsProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const closePopup = () => setShowPopup(false);
  const scrollY1 = new Animated.Value(0);

  const [storedForm, setStoredForm] = useState<any | null>(null);
  const screenWidth = Dimensions.get('window').width;
  const [activeIndex, setActiveIndex] = useState(0);
  const [userMeta, setUserMeta] = useState<UserMeta | null>(null);
  const insets = useSafeAreaInsets(); // Safe area insets
  const [newdate,setnewdate]=useState('')

  const [fields, setFields] = useState<any[]>([]); // seller fields from API
  const today = new Date();

  // Format as DD-MM-YYYY
  const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}-${today.getFullYear()}`;

  interface Category {
    id: number;
    name: string;
    description: string | null;
    isactive: boolean;
    logo: string | null;
    commission: string | null;
    max_cappund: string | null;
    feature_fee: string | null;
    max_feature_cap: null;
  }

  interface UserMeta {
    firstname: string | null;
    lastname: string | null;
    profile: string | null;
    student_email: string | null;
    university_name: string | null;
    category?: Category | null;
    city?:string|null;
  }

  const flatListRef = useRef(null);
const { height } = Dimensions.get('window');
   const screenHeight = Dimensions.get('window').height;
  const [slideUp1] = useState(new Animated.Value(0));

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      'worklet';
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedBlurStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(scrollY.value, [0, 300], [0, 1], 'clamp');
    return { opacity };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    'worklet';
    const borderColor = interpolateColor(
      scrollY.value,
      [0, 300],
      ['rgba(255, 255, 255, 0.56)', 'rgba(255, 255, 255, 0.56)'],
    );
    const redOpacity = interpolate(scrollY.value, [0, 100], [0, 0.15], 'clamp');
    return {
      borderColor,
      backgroundColor: `rgba(255, 255, 255, ${redOpacity})`,
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(scrollY.value, [0, 100], [0.8, 1], 'clamp');
    const tintColor = interpolateColor(
      scrollY.value,
      [0, 150],
      ['#FFFFFF', '#002050'],
    );
    return {
      opacity,
      tintColor,
    };
  });

  const blurAmount = useDerivedValue(() =>
    interpolate(scrollY.value, [0, 300], [0, 10], 'clamp'),
  );

  useEffect(() => {
    const fetchStoredData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('formData1');
        const storedValue = await AsyncStorage.getItem('newDate');
        if (storedValue !== null) {
          setnewdate(storedValue);
        } else {
          setnewdate('');
        }
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
    alias: string,
  ): any => {
    if (!formData) return null;

    const entry = Object.values(formData).find(
      item => item.alias_name === alias,
    ) as FormEntry | undefined;

    if (entry) return entry.value;

    // fallback if alias_name missing
    if (formData[alias]) return formData[alias].value;

    return null;
  };

const formatDateWithDash = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

  const titleValue = getValueByAlias(storedForm, 'title') || 'No Title';
  //const priceValue = getValueByAlias(storedForm, 'price') || '0';
  const descriptionvalue =
    getValueByAlias(storedForm, 'description') || 'No Description';

  const onScroll = (event: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    const slideSize = screenWidth;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const productId1 = await AsyncStorage.getItem('selectedProductId');
        if (!token) {
          console.log('No token found');
          return;
        }

        const url = `${MAIN_URL.baseUrl}category/listparams/user/${productId1}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();

        if (json?.metadata) {
          setUserMeta({
            firstname: json.metadata.firstname ?? null,
            lastname: json.metadata.lastname ?? null,
            profile: json.metadata.profile ?? null,
            student_email: json.metadata.student_email ?? null,
            university_name: json.metadata.university_name ?? null,
            category: json.metadata.category ?? null,
            city:json.metadata.city ?? null,  
          });

          await AsyncStorage.setItem(
            'userMeta',
            JSON.stringify({
              firstname: json.metadata.firstname ?? null,
              lastname: json.metadata.lastname ?? null,
              profile: json.metadata.profile ?? null,
              student_email: json.metadata.student_email ?? null,
              university_name: json.metadata.university_name ?? null,
              category: json.metadata.category ?? null,
              city:json.metadata.city ?? null, // 
            }),
          );
        }

        if (json?.data) {
          const sellerFields = json.data.filter(
            (item: any) => item.seller === true,
          );
          setFields(sellerFields);
        }
      } catch (err) {
        console.log('Error fetching fields', err);
      } finally {
        //setLoading(false);
      }
    };

    fetchFields();
  }, []);

  type ImageField = {
    id?: string;
    uri: string;
    name: string;
    type?: string;
  };

  
  const handleListPress = async () => {
    console.log('🔵 handleListPress called');
    try {
      console.log('Step 1: Fetching formData from AsyncStorage...');
      const storedData = await AsyncStorage.getItem('formData1');
      console.log('✅ AsyncStorage.getItem(formData) result:', storedData);

      if (!storedData) {
        console.log('⚠️ No form data found in storage');
        showToast('No form data found');
        return;
      }

      const formData: Record<
        string,
        { value: any; alias_name: string | null }
      > = JSON.parse(storedData);
      console.log('✅ Parsed formData:', formData);

      console.log('Step 2: Fetching userToken...');
      const token = await AsyncStorage.getItem('userToken');
      const productId1 = await AsyncStorage.getItem('selectedProductId');
      const shareid = await AsyncStorage.getItem('shareid');

      if (!token) {
        console.log('⚠️ Token not found. Cannot upload.');
        return;
      }

      console.log('Step 3: Splitting formData...');

      const imageFields = Object.entries(formData)
        .filter(([key, obj]) => {
          const v = obj.value;
          return (
            Array.isArray(v) &&
            v.length > 0 &&
            v.every((item: any) => item?.uri)
          );
        })
        .map(([key, obj]) => [key, obj.value as ImageField[]]) as [
        string,
        ImageField[],
      ][];

      const nonImageFields = Object.entries(formData).filter(([key, obj]) => {
        const v = obj.value;
        return !(Array.isArray(v) && v.every((item: any) => item?.uri));
      });

      console.log('✅ Non-image fields:', nonImageFields);
      console.log('✅ Image fields:', imageFields);

      // --- Build data array safely ---
const dataArray = nonImageFields
  .filter(([key, obj]) => !isNaN(Number(key)))
  .map(([key, obj]) => {
    const val = obj.value;
    return {
      id: Number(key),
      param_value: val !== undefined && val !== null && val !== '' ? val : null,
    };
  })
  .filter(item => item.param_value !== null); // ✅ only keep filled values

      console.log('✅ Data array for create API:', dataArray);

      const createPayload = {
        category_id: productId1, // dynamic or static
        data: dataArray,
      };

      console.log('Step 5: Calling create API with payload:', createPayload);

      console.log(
        'API',
        `${MAIN_URL.baseUrl}category/featurelist-update/${shareid}`,
      );
      const createRes = await fetch(
        `${MAIN_URL.baseUrl}category/featurelist-update/${shareid}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(createPayload),
        },
      );

      console.log(`✅ Create API status: ${createRes.status}`);
      const createJson = await createRes.json();
      console.log('✅ Create API response:', createJson);

      if (!createRes.ok) {
        showToast('Failed to create feature list');
        return;
      }

      const feature_id = createJson?.data?.id;
      if (!feature_id) {
        console.log('❌ feature_id not returned from create API.');
        showToast('feature_id missing in response');
        return
      }

      // const imageFieldsWithStatus = Object.entries(formData)
      // .filter(([_, obj]) => Array.isArray(obj.value) && obj.value.length > 0)
      // .map(([key, obj]) => [
      //   key,
      //   obj.value.map((img: any) => ({
      //     id: img.id,
      //     uri: img.uri,
      //     name: img.name,
      //     type: img.type || 'image/jpeg',
      //     status: img.status || 'kept', // ✅ ensure every image has a status
      //   })),
      // ]) as [string, any[]][];

      // console.log("ImagesFiledWithStatus", imageFieldsWithStatus);



   

  const storedDataImages = await AsyncStorage.getItem('deletedImagesId');
  const deletedImageIds = storedDataImages ? JSON.parse(storedDataImages).deleted_image_ids || [] : [];


  for (const [param_id, images] of imageFields) {
    if (!Array.isArray(images)) {
      console.warn(`⚠️ images is not an array for param_id=${param_id}`);
      continue;
    }

    console.log(`Step 7: Uploading images for param_id=${param_id}`);

    for (const image of images) {
      // Defensive check
      if (!image || !image.uri) {
        console.warn(`⚠️ Invalid image data for param_id=${param_id}`, image);
        continue;
      }

      // Skip deleted images
      if (deletedImageIds.includes(image.id)) {
        console.log(`Skipping upload for deleted image with ID: ${image.id}`);
        continue;
      }

      console.log(`🟡 Preparing upload for image under param_id=${param_id}:`, image);

      // Prepare FormData
      const data = new FormData();
      data.append('files', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.name,
      } as any);
      data.append('feature_id', feature_id);
      data.append('param_id', param_id);

      // Add deleted IDs payload
      data.append('deleted_image_ids', JSON.stringify(deletedImageIds));

      console.log('✅ FormData prepared for upload', JSON.stringify(data));

      const uploadUrl = `${MAIN_URL.baseUrl}category/featurelist/image-update`;

      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // DO NOT manually set 'Content-Type' here for FormData!
        },
        body: data,
      });

      console.log(`✅ Upload completed. Status: ${uploadRes.status}`);

      let uploadJson;
      try {
        uploadJson = await uploadRes.json();
      } catch (err) {
        console.error('❌ Failed to parse upload response as JSON', err);
      }

      console.log('✅ Upload response JSON:', uploadJson);

      if (!uploadRes.ok) {
        console.log(`❌ Upload failed for ${image.name} (param_id=${param_id})`);
        showToast(`Failed to upload image ${image.name}`);
      } else {
        console.log(`✅ Upload success for ${image.name} (param_id=${param_id})`);
      }
    }
  }

      // for (const [param_id, images] of imageFields) {
      //   console.log(`Step 7: Uploading images for param_id=${param_id}`);

      //   for (const image of images) {
      //     console.log(
      //       `🟡 Preparing upload for image under param_id=${param_id}:`,
      //       image,
      //     );

      //     const data = new FormData();
      //     data.append('files', {
      //       uri: image.uri,
      //       type: image.type || 'image/jpeg',
      //       name: image.name,
      //     } as any);
      //     data.append('feature_id', feature_id);
      //     data.append('param_id', param_id);

      //     console.log('✅ FormData prepared for upload');

      //     const uploadUrl = `${MAIN_URL.baseUrl}category/featurelist/image-update`;
      //     console.log(
      //       `Step 7: Uploading image ${image.name} with param_id=${param_id} to ${uploadUrl}`,
      //     );

      //     const uploadRes = await fetch(uploadUrl, {
      //       method: 'POST',
      //       headers: {
      //         Authorization: `Bearer ${token}`,
      //       },
      //       body: data,
      //     });

      //     console.log(`✅ Upload completed. Status: ${uploadRes.status}`);
      //     const uploadJson = await uploadRes.json();
      //     console.log('✅ Upload response JSON:', uploadJson);

      //     if (!uploadRes.ok) {
      //       console.log(
      //         `❌ Upload failed for ${image.name} (param_id=${param_id})`,
      //       );
      //       showToast(`Failed to upload image ${image.name}`);
      //     } else {
      //       console.log(
      //         `✅ Upload success for ${image.name} (param_id=${param_id})`,
      //       );
      //     }
      //   }
      // }

      // for (const [param_id, images] of imageFieldsWithStatus) {
      //   for (const image of images) {
      //     if (image.status === 'deleted') {
      //       // ✅ Call DELETE or mark as deleted
      //       const deleteUrl = `${MAIN_URL.baseUrl}category/featurelist/image-update`;
      //       const deleteBody = {
      //         feature_id,
      //         param_id,
      //         file_id: image.id,
      //         status: 'deleted',
      //       };
      
      //       // 🟢 Log the delete body
      //       console.log('🗑️ DELETE Image Body:', JSON.stringify(deleteBody, null, 2));
      
      //       const deleteRes = await fetch(deleteUrl, {
      //         method: 'POST', // or PATCH if your API uses it
      //         headers: {
      //           'Content-Type': 'application/json',
      //           Authorization: `Bearer ${token}`,
      //         },
      //         body: JSON.stringify(deleteBody),
      //       });
      
      //       const deleteJson = await deleteRes.json();
      //       console.log('🗑️ DELETE Response:', deleteJson);
      
      //     } else if (image.status === 'new') {
      //       // ✅ Upload new image
      //     const data = new FormData();
      //     data.append('files', {
      //       uri: image.uri,
      //       type: image.type || 'image/jpeg',
      //       name: image.name,
      //     } as any);
      //     data.append('feature_id', feature_id);
      //     data.append('param_id', param_id);
      //       data.append('status', 'new');
      
      //       // 🟢 Log FormData content (debug-friendly)
      //       console.log('🆕 Uploading New Image Body:');
      //       console.log({
      //         file_name: image.name,
      //         file_uri: image.uri,
      //         feature_id,
      //         param_id,
      //         status: 'new',
      //       });

      //     const uploadUrl = `${MAIN_URL.baseUrl}category/featurelist/image-update`;
      //     const uploadRes = await fetch(uploadUrl, {
      //       method: 'POST',
      //         headers: { Authorization: `Bearer ${token}` },
      //       body: data,
      //     });

      //     const uploadJson = await uploadRes.json();
      //       console.log('🆕 Upload Response:', uploadJson);
      //     }
      //   }
      // }

      

      console.log('✅ All uploads done. Showing toast.');
      showToast('All data uploaded successfully');
      setShowPopup(true);
    } catch (error) {
      console.log('❌ Error in handleListPress:', error);
      showToast('Error uploading data');
    }
  };



  const getCurrentDate = () => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, '0')}-${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}-${today.getFullYear()}`;
  };

  const getInitials = (firstName = '', lastName = '') => {
    const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
    const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
    return f + l || '?';
  };

  const raw = getValueByAlias(storedForm, 'price') ?? '0';
  const priceValue = parseFloat(String(raw)) || 0;

  const commissionPercent = parseFloat(userMeta?.category?.commission ?? '0');
  const maxCap = parseFloat(userMeta?.category?.max_cappund ?? '0');

  const commissionAmount = priceValue * (commissionPercent / 100);
  const calculatedPrice = priceValue + commissionAmount;
  const maxAllowedPrice = priceValue + maxCap;
  const commissionPrice = +Math.min(calculatedPrice, maxAllowedPrice).toFixed(
    2,
  );

  const raw1 = getValueByAlias(storedForm, 'price') ?? '0';
  const priceValue1 = parseFloat(String(raw1)) || 0;

  const commissionPercent1 = parseFloat(userMeta?.category?.feature_fee ?? '0');
  const maxCap1 = parseFloat(userMeta?.category?.max_feature_cap ?? '0');

  const commissionAmount1 = priceValue1 * (commissionPercent1 / 100);
  const calculatedPrice1 = priceValue1 + commissionAmount1;
  const maxAllowedPrice1 = priceValue1 + maxCap1;
  const commissionPrice1 = +Math.min(
    calculatedPrice1,
    maxAllowedPrice1,
  ).toFixed(2);
  const diff1 = commissionPrice1 - priceValue1;

  return (
    <ImageBackground
      source={require('../../../assets/images/backimg.png')}
      style={{ width: '100%', height: '100%' }}
      resizeMode="cover"
    >
      <View style={styles.fullScreenContainer}>
         

                 <StatusBar
                          translucent
                          backgroundColor="transparent"
                          barStyle="light-content"
                        />
                
                        {/* Header with Blur only at top */}
                        <AnimatedReanimated.View
                          style={[styles.headerWrapper, animatedBlurStyle]}
                          pointerEvents="none"
                        >
                          {/* Blur layer only at top with gradient fade */}
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
                              overlayColor="rgba(255,255,255,0.05)"
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
                        </AnimatedReanimated.View>
                
                        {/* Header Content */}
                        <View style={styles.headerContent} pointerEvents="box-none">
                          <TouchableOpacity
                            onPress={() => navigation.replace('EditPreviewThumbnail')}
                            style={styles.backButtonContainer}
                            activeOpacity={0.7}
                          >
                            <AnimatedReanimated.View
                              style={[styles.blurButtonWrapper, animatedButtonStyle]}
                            >
                              {/* Static background (visible when scrollY = 0) */}
                              <AnimatedReanimated.View
                                style={[
                                  StyleSheet.absoluteFill,
                                  useAnimatedStyle(() => ({
                                    opacity: interpolate(
                                      scrollY.value,
                                      [0, 30],
                                      [1, 0],
                                      'clamp',
                                    ),
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    borderRadius: 40,
                                  })),
                                ]}
                              />
                
                              {/* Blur view fades in as scroll increases */}
                              <AnimatedReanimated.View
                                style={[
                                  StyleSheet.absoluteFill,
                                  useAnimatedStyle(() => ({
                                    opacity: interpolate(
                                      scrollY.value,
                                      [0, 50],
                                      [0, 1],
                                      'clamp',
                                    ),
                                  })),
                                ]}
                              >
                                <BlurView
                                  style={StyleSheet.absoluteFill}
                                  blurType="light"
                                  blurAmount={10}
                                  reducedTransparencyFallbackColor="transparent"
                                />
                              </AnimatedReanimated.View>
                
                              {/* Back Icon */}
                              <AnimatedReanimated.Image
                                source={require('../../../assets/images/back.png')}
                                style={[{ height: 24, width: 24 }, animatedIconStyle]}
                              />
                            </AnimatedReanimated.View>
                          </TouchableOpacity>
                
                          <Text allowFontScaling={false} style={styles.unizyText}>
                            Preview Details
                          </Text>
                        </View>
                


        
        <AnimatedReanimated.ScrollView 
                       scrollEventThrottle={16}
                       onScroll={scrollHandler}
                       contentContainerStyle={[
                         styles.scrollContainer,
                         { paddingBottom: height * 0.1 }, // 0.05% of screen height
                       ]}>
        
          <View style={{marginTop:12}}>

        {(userMeta?.category?.id === 2 || userMeta?.category?.id === 5)? (
                      <ImageBackground
                        source={require('../../../assets/images/featurebg.png')}
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: 270,
                          width: '100%',
                        }}
                      >
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                          {userMeta?.profile? (
                            <Image
                              source={{ uri: userMeta?.profile }}
                              style={{
                                width: 180,
                                height: 180,
                                borderRadius: 90,
                              }}
                              resizeMode="cover"
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
                                  fontSize: 70,
                                  color: '#FFF',
                                  fontWeight: '600',
                                  textAlign: 'center',
                                  fontFamily: 'Urbanist-SemiBold',
                                }}
                              >
                                {`${userMeta?.firstname?.[0] ?? ''}${
                                  userMeta?.lastname?.[0] ?? ''
                                }`.toUpperCase() || 'NA'}
                              </Text>
                            </View>
                          )}
                        </View>
                      </ImageBackground>
                    ) : storedForm?.[6]?.value?.length > 1 ? (
                      
                      <View>
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
                              style={{ width: screenWidth, height: 270 }}
                              resizeMode="cover"
                            />
                          )}
                        />
        
                        {/* Custom Step Indicator */}
                        <View style={styles.stepIndicatorContainer}>
                          {storedForm[6].value.map((_: any, index: number) => {
                            const isActive = index === activeIndex;
                            return (
                              <View
                                key={index}
                                style={
                                  isActive
                                    ? styles.activeStepCircle
                                    : styles.inactiveStepCircle
                                }
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
                        style={{ width: '100%', height: 270 }}
                        resizeMode="cover"
                      />
                    )}
          </View>

          <View style={{ flex: 1, padding: 16 }}>
           
            <View style={styles.card1}>
              <View style={{ gap: 8 }}>
                <Text allowFontScaling={false} style={styles.QuaddText}>
                  {titleValue}
                </Text>

                <Text allowFontScaling={false} style={styles.priceText}>
                  {`$${commissionPrice}`}
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
                <Text allowFontScaling={false} style={styles.productDesHeding}>
                {userMeta?.category?.name === 'Food' ? 'Dish Description' : `${userMeta?.category?.name ?? ''} Description`}
                  </Text>
                <Text allowFontScaling={false} style={styles.productDesc}>
                  {descriptionvalue}
                </Text>

               <View style={styles.datePosted}>
                <Image
                  source={require('../../../assets/images/calendar_icon1.png')}
                  style={{ height: 16, width: 16 }}
                  />
              <Text allowFontScaling={false} style={styles.datetext}>Date Posted: {formatDateWithDash(newdate)}</Text>
              </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.gap12}>
                <Text allowFontScaling={false} style={styles.productDeatilsHeading}>
                          {userMeta?.category?.name === 'Food'
                            ? 'Dish Details'
                            : `${userMeta?.category?.name ?? ''} Details`}
                        </Text>

                 <View style={{ gap: 12 }}>
                                {fields.map(field => {
                                  const fieldId = field.param.id;
                
                                  const skipAliases = ['title', 'description', 'price'];
                                  if (
                                    skipAliases.includes(field.param.alias_name ?? '') ||
                                    ['Image', 'boolean'].includes(field.param.field_type)
                                  )
                                    return null;
                
                                  const storedValue = storedForm?.[fieldId]?.value;
                                  if (storedValue == null) return null;
                
                                  let displayValues: string[] = [];
                
                                  if (field.param.field_type === 'dropdown') {
                                    if (Array.isArray(storedValue)) {
                                      displayValues = storedValue
                                        .map((id: number) =>
                                          field.param.options.find((opt: any) => opt.id === id)?.option_name
                                        )
                                        .filter(Boolean) as string[];
                                    } else {
                                      const option = field.param.options.find((opt: any) => opt.id === storedValue);
                                      if (option) displayValues = [option.option_name];
                                    }
                                  } else if (Array.isArray(storedValue)) {
                                    displayValues = storedValue.map(String);
                                  } else {
                                    displayValues = [String(storedValue)];
                                  }
                
                                  return (
                                    <View key={fieldId} style={{  }}>
                                      <Text allowFontScaling={false} style={styles.detailLabel1}>
                                        {field.param.field_name}
                                      </Text>
                
                                      {field.param.field_type === 'dropdown' ? (
                                        <View style={styles.categoryContainer}>
                                          {displayValues.map((val, idx) => (
                                            <View key={idx} style={styles.categoryTag}>
                                              <Text allowFontScaling={false} style={styles.catagoryText}>
                                                {val}
                                              </Text>
                                            </View>
                                          ))}
                                        </View>
                                      ) : (
                                        <Text allowFontScaling={false} style={[styles.new, { marginTop:0}]}>
                                          {displayValues.join(', ')}
                                        </Text>
                                      )}
                                    </View>
                                  );
                                })}
                              </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={{ gap: 12 }}>
               <Text allowFontScaling={false} style={styles.productDeatilsHeading}>Seller Details</Text>
            <View style={{ flexDirection: 'row',marginBottom:4  }}>
            {userMeta?.profile ? (
                <Image
                    source={{ uri: userMeta.profile }}
                                 style={styles.avatar}
                               />
                             ) : (
                               <View style={styles.initialsCircle}>
                                 <Text allowFontScaling={false} style={styles.initialsText}>
                                   {getInitials(
                                     userMeta?.firstname ?? 'Alan',
                                     userMeta?.lastname ?? 'Walker'
                                   )}
                                 </Text>
                               </View>
                             )}
           
                             <View style={{ width: '80%' }}>
                               <Text allowFontScaling={false} style={styles.userName}>
                               {`${userMeta?.firstname ?? ''} ${userMeta?.lastname ?? ''}`.trim()}
                             </Text>
                               <Text allowFontScaling={false} style={styles.univeritytext}>
                                 {userMeta?.university_name || 'University of Warwick,'}
                               </Text>
                               <Text allowFontScaling={false} style={[styles.univeritytext,]}>
                               {userMeta?.city || ''}
                               </Text>
                             </View>
                           </View>
           
           
                           <View style={{ flexDirection: 'row' }}>
                            <View style={styles.bottombutton}>
                             <View style={{ flexDirection: 'row', alignItems: 'center' , gap: 6,}}>
                               <Image
                                 source={require('../../../assets/images/staricon.png')}
                                 style={{ height: 16, width: 16 }}
                               />
           
                               <Text allowFontScaling={false} style={ styles.chattext}>4.5</Text>
                             </View>
                             </View>
                              <View style={[styles.chatcard, { marginLeft: 8, flexDirection: 'row', alignItems: 'center'}]}>
                               <Image
                                 source={require('../../../assets/images/message_chat.png')}
                                 style={{ height: 16, width: 16, marginRight: 4 }}
                               />
                              <Text allowFontScaling={false} style={styles.chattext}>Chat with Seller</Text>
                             </View>
                           </View>
                         </View>
                       </View>
          </View>
        </AnimatedReanimated.ScrollView>
       
          <Button
              onPress={handleListPress}
              title={(() => {
                try {
                  const form = typeof storedForm === 'string' ? JSON.parse(storedForm) : storedForm;
                  const isFeatured = form?.["13"]?.value === true || form?.["13"]?.value === 'true';

                  if (isFeatured) {
                    return `Update for £${diff1.toFixed(2)}`;
                  }
                  return 'Update';
                } catch (e) {
                  console.log('Error parsing storedForm:', e);
                  return 'Update';
                }
              })()}/>

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
                  allowFontScaling={false}
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
                  allowFontScaling={false}
                  style={{
                    color: 'rgba(255, 255, 255, 0.48)',
                    fontFamily: 'Urbanist-Regular',
                    fontSize: 14,
                    fontWeight: '400',
                    fontStyle: 'normal',
                    letterSpacing: -0.28,
                    lineHeight: 19.6,
                    textAlign: 'center',
                  }}
                >
                  Your product is now live and visible to other students.
                </Text>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={async () => {
                    try {
                      await AsyncStorage.removeItem('formData1');
                      await AsyncStorage.removeItem('selectedProductId');
                      await AsyncStorage.removeItem('isfeatured')
                      console.log('✅ formData cleared from AsyncStorage');

                      // navigation.dispatch(
                      //   CommonActions.reset({
                      //     index: 0, // make this the active screen
                      //     routes: [
                      //       {
                      //         name: 'Dashboard',
                      //         params: {
                      //           AddScreenBackactiveTab: 'Home',
                      //           isNavigate: false,
                      //         },
                      //       },
                      //     ],
                      //   }),
                      // );
                      // navigation.goBack();
                      navigation.replace('MyListing',{ animation: 'none' });

                      setShowPopup(false);
                    } catch (err) {
                      console.log('❌ Error clearing formData:', err);
                    }
                  }}
                >
                  <Text allowFontScaling={false} style={styles.loginText}>
                    Return to Choose Category
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </Modal>
      </View>
      <NewCustomToastContainer />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({

  
    headerWrapper: {
    position: 'absolute',
    top: 0,
    width: Platform.OS === 'ios' ? '100%' : '100%',
    height: Platform.OS === 'ios' ? 180 : 180,
    zIndex: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    pointerEvents: 'none',
  },
  headerContent: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 60,
    width: Platform.OS === 'ios' ? 393 : '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 11,
    alignSelf: 'center',
    pointerEvents: 'box-none',
  },
  backButtonContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 11,
    //top: 7,
  },
  blurButtonWrapper: {
    width: 48,
    height: 48,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // fallback tint
  },




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

   catagoryText: {
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
    //boxShadow: 'rgba(255, 255, 255, 0.12)  inset -1px 0px 5px 1px inset ',

   boxShadow:
      '0 2px 8px 0 rgba(255, 255, 255, 0.2)inset 0 2px 8px 0 rgba(0, 0, 0, 0.2)',
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

  // initialsCircle: {
  //   backgroundColor: '#8390D4',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   width: 50,
  //   height: 50,
  //   borderRadius: 25,
  //   marginRight: 12,
  // },
  // initialsText: {
  //   color: '#fff',
  //   fontSize: 18,
  //   fontWeight: 600,
  //   textAlign: 'center',
  //   fontFamily: 'Urbanist-SemiBold',
  // },

  priceText1: {
    color: '#002050',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: 1,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff', // optional
    borderRadius: 8,
    marginVertical: 4,
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
  },
   detailLabel1: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
  },
  
  detailValue: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    textAlign: 'right',
    flex: 1,
  },
 
  backBtn: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
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
 
  fullScreenContainer: {
    flex: 1,
   // marginTop: 30,
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
    //paddingHorizontal: 20,
    paddingBottom: 80,
    paddingTop: Platform.OS === 'ios' ? 160 : 100,
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
    gap: 3,
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
  // catagoryText: {
  //   fontFamily: 'Urbanist-Regular',
  //   fontSize: 12,
  //   fontWeight: '500',
  //   fontStyle: 'normal',
  //   lineHeight: 16,
  //   color: '#fff',
  // },
  // categoryTag: {
  //   backgroundColor:
  //     'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.10) 100%)',
  //   borderWidth: 0.9,
  //   borderColor: 'rgba(255, 255, 255, 0.08)',
  //   borderBlockEndColor: 'rgba(255, 255, 255, 0.08)',
  //   color: 'rgba(255, 255, 255, 0.48)',
  //   borderRadius: 4,
  //   marginRight: 8,
  //   boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.23)',
  //   paddingLeft: 6,
  //   paddingRight: 6,
  //   paddingTop: 2,
  //   paddingBottom: 2,
  // },
  // productDesHeding: {
  //   color: 'rgba(255, 255, 255, 0.72)',
  //   fontFamily: 'Urbanist-Regular',
  //   fontSize: 16,
  //   fontWeight: '600',
  //   fontStyle: 'normal',
  //   lineHeight: 22,
  // },
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
    card1: {
    flexDirection: 'column',
    marginBottom: 6,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    gap: 10,
    marginTop:6
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
 
  previewThumbnail: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
});

export default EditPreviewDetailed;