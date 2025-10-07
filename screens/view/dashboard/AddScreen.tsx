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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageResizer from 'react-native-image-resizer';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';
import { MAIN_URL } from '../../utils/APIConstant';
// import { showToast } from '../../utils/toast';
import ToggleButton from '../../utils/component/ToggleButton';
import Button from '../../utils/component/Button';
import SelectCatagoryDropdown from '../../utils/component/SelectCatagoryDropdown';
import {
  NewCustomToastContainer,
  showToast,
} from '../../utils/component/NewCustomToastManager';
import { RouteProp, useRoute } from '@react-navigation/native';

const bgImage = require('../../../assets/images/bganimationscreen.png');
const profileImg = require('../../../assets/images/user.jpg'); // your avatar image
const uploadIcon = require('../../../assets/images/upload.png'); // upload icon

const fileIcon = require('../../../assets/images/file.png'); // file icon
const deleteIcon = require('../../../assets/images/delete.png'); // delete/trash ico

type AddScreenContentProps = {
  navigation: any;
};
type RootStackParamList = {
  AddScreen: { productId: number; productName: string };
  // other screens...
};
type AddScreenRouteProp = RouteProp<RootStackParamList, 'AddScreen'>;

const AddScreen = ({ navigation }: AddScreenContentProps) => {
  const [formValues, setFormValues] = useState<any>({});
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const MAX_SIZE_MB = 1;
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB');
  const displayDate = formattedDate.replace(/\//g, '-');
  const [photo, setPhoto] = useState<string | null>(null);

  const [multiSelectModal, setMultiSelectModal] = useState<{
    visible: boolean;
    ismultilple: boolean;
    fieldId?: number;
  }>({ visible: false, ismultilple: false });

  const [multiSelectOptions, setMultiSelectOptions] = useState<any[]>([]);
  const [uploadedImages, setUploadedImages] = useState<
    { id: string; uri: string; name: string }[]
  >([]);

  const screenHeight = Dimensions.get('window').height;
  const [slideUp1] = useState(new Animated.Value(0));

  interface Category {
  id: number;
  name: string;
  description: string | null;
  isactive: boolean;
  logo: string | null;
  commission: string | null;
  max_cappund: string | null;
  feature_fee:string | null
  max_feature_cap: |null,
}

  interface UserMeta {
    firstname: string | null;
    lastname: string | null;
    profile: string | null;
    student_email: string | null;
    category?: Category | null;
  }

  const [userMeta, setUserMeta] = useState<UserMeta | null>(null);
  const [featureFee, setFeatureFee] = useState(0);
const [maxFeatureCap, setMaxFeatureCap] = useState(0);
  //  const [productName, setProductName] = useState('');
  const route = useRoute<AddScreenRouteProp>();
  const { productId, productName } = route.params;

  // useEffect(() => {
  //   const loadProductName = async () => {
  //     try {
  //       const name = await AsyncStorage.getItem('selectedProductName');
  //       if (name) {
  //         setProductName(name);
  //       } else {
  //         setProductName('List Product'); // fallback
  //       }
  //     } catch (error) {
  //       console.log('❌ Error loading product name:', error);
  //     }
  //   };

  //   loadProductName();
  // }, []);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');

        // const productId1 = await AsyncStorage.getItem('selectedProductId');
        if (!token) {
          console.log('No token found');
          return;
        }

        const url = `${MAIN_URL.baseUrl}category/listparams/user/${productId}`;

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

        if (json.metadata.category) {
          // Convert null or undefined to 0
          setFeatureFee(parseFloat(json.metadata.category.feature_fee ?? '0'));
          setMaxFeatureCap(parseFloat(json.metadata.category.max_feature_cap ?? '0'));
        }
          setUserMeta({
            firstname: json.metadata.firstname ?? null,
            lastname: json.metadata.lastname ?? null,
            profile: json.metadata.profile ?? null,
            student_email: json.metadata.student_email ?? null,
            category: json.metadata.category ?? null, // 
          });

          await AsyncStorage.setItem(
            'userMeta',
            JSON.stringify({
              firstname: json.metadata.firstname ?? null,
              lastname: json.metadata.lastname ?? null,
              profile: json.metadata.profile ?? null,
              student_email: json.metadata.student_email ?? null,
              category: json.metadata.category ?? null, // 
            }),
          );
        }
        await AsyncStorage.setItem('selectedProductId', String(productId));

        

        if (json?.data) {
          const sellerFields = json.data.filter(
            (item: any) => item.seller === true,
          );
          setFields(sellerFields);
        }
      } catch (err) {
        console.log('Error fetching fields', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  const [expanded, setExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (expanded) {
      Animated.timing(animatedHeight, {
        toValue: 1,
        duration: 800, // slow expansion
        useNativeDriver: false, // height cannot use native driver
      }).start();
    }
  }, [expanded]);

  const handleValueChange = (
    fieldId: number,
    aliasName: string | null,
    value: any,
  ) => {
    setFormValues((prev: any) => ({
      ...prev,
      [fieldId]: {
        value: value,
        alias_name: aliasName ?? null, // null if no alias_name
      },
    }));
  };

  const handleMultiSelectToggle = (fieldId: number, optionId: number) => {
    const prevSelected: number[] = Array.isArray(formValues[fieldId])
      ? formValues[fieldId]
      : [];

    const updated = prevSelected.includes(optionId)
      ? prevSelected.filter(id => id !== optionId)
      : [...prevSelected, optionId];

    setFormValues((prev: any) => ({ ...prev, [fieldId]: updated }));
  };

  const getCurrentDate = () => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, '0')}-${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}-${today.getFullYear()}`;
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true;
    }
  };

  // const handlePreview = async () => {
  //   try {
  //     const dataToStore: any = { ...formValues };

  //     // Handle image fields separately
  //     fields.forEach(field => {
  //       if (field.param.field_type.toLowerCase() === 'image') {
  //         const uploadedForField = uploadedImages.map(img => ({
  //           id: img.id,
  //           uri: img.uri,
  //           name: img.name,
  //         }));

  //         dataToStore[field.param.id] = {
  //           value: uploadedForField,
  //           alias_name: field.param.alias_name ?? null,
  //         };
  //       }
  //     });

  //     await AsyncStorage.setItem('formData', JSON.stringify(dataToStore));

  //     console.log('Form data saved: ', dataToStore);

  //     navigation.navigate('PreviewThumbnail');
  //   } catch (error) {
  //     console.log('Error saving form data: ', error);
  //     showToast('Failed to save form data');
  //   }
  // };

  const handlePreview = async () => {
    try {
      for (const field of fields) {
        const { id, field_type, alias_name } = field.param;

        if (field.mandatory) {
          let value = formValues[id]?.value;

          if (field_type.toLowerCase() === 'image') {
            value = uploadedImages;
          }

          if (
            value === undefined ||
            value === null ||
            (typeof value === 'string' && value.trim() === '') ||
            (Array.isArray(value) && value.length === 0)
          ) {
            showToast(`${field.param.field_name} is mandatory`);
            return;
          }
        }
      }

      const dataToStore: any = { ...formValues };

      fields.forEach(field => {
        if (field.param.field_type.toLowerCase() === 'image') {
          const uploadedForField = uploadedImages.map(img => ({
            id: img.id,
            uri: img.uri,
            name: img.name,
          }));

          dataToStore[field.param.id] = {
            value: uploadedForField,
            alias_name: field.param.alias_name ?? null,
          };
        }
      });

      await AsyncStorage.setItem('formData', JSON.stringify(dataToStore));
      console.log('Form data saved: ', dataToStore);
      navigation.navigate('PreviewThumbnail');
    } catch (error) {
      console.log('Error saving form data: ', error);
      showToast('Failed to save form data');
    }
  };

  const handleSelectImage = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    Alert.alert(
      'Select Option',
      'Choose a source',
      [
        {
          text: 'Camera',
          onPress: () => {
            launchCamera(
              { mediaType: 'photo', cameraType: 'front', quality: 1 }, // get max quality first
              async response => {
                if (response.didCancel) return;
                if (response.assets && response.assets[0].uri) {
                  const asset = response.assets[0];
                  let uri = asset.uri!;
                  let name = asset.fileName || 'Image';

                  // check size
                  if (
                    asset.fileSize &&
                    asset.fileSize > MAX_SIZE_MB * 1024 * 1024
                  ) {
                    const compressed = await ImageResizer.createResizedImage(
                      uri,
                      800, // width
                      800, // height
                      'JPEG',
                      80, // quality 0-100
                    );
                    uri = compressed.uri;
                    name = compressed.name || name;
                  }

                  setUploadedImages(prev => [
                    ...prev,
                    { id: Date.now().toString(), uri, name },
                  ]);
                }
              },
            );
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            launchImageLibrary(
              { mediaType: 'photo', quality: 1 },
              async response => {
                if (response.didCancel) return;
                if (response.assets && response.assets[0].uri) {
                  const asset = response.assets[0];
                  let uri = asset.uri!;
                  let name = asset.fileName || 'Image';

                  // check size
                  if (
                    asset.fileSize &&
                    asset.fileSize > MAX_SIZE_MB * 1024 * 1024
                  ) {
                    const compressed = await ImageResizer.createResizedImage(
                      uri,
                      800,
                      800,
                      'JPEG',
                      80,
                    );
                    uri = compressed.uri;
                    name = compressed.name || name;
                  }

                  setUploadedImages(prev => [
                    ...prev,
                    { id: Date.now().toString(), uri, name },
                  ]);
                }
              },
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  const renderLabel = (field_name: any, mandatory: any) => (
    <Text style={styles.textstyle}>
      {field_name}
      {mandatory && <Text style={{ color: '#fff' }}> *</Text>}
    </Text>
  );

  const [isCheckbox, setCheckBox] = useState(false);

  const renderField = (field: any) => {
    // const { field_name, field_type, options, id, field_ismultilple } =field.param;
    // const fieldType = field_type.toLowerCase();
    //  const ism = field_ismultilple;
    // console.log('fieldType', ism);
    const param = field?.param;
    if (!param) return null; // skip if param is missing

    const fieldType = param.field_type?.toLowerCase() ?? '';
    const field_ismultilple = param.ismultilple ?? false;
    const field_name = param.field_name ?? '';
    const id = param.id;
    const options = Array.isArray(param.options) ? param.options : [];

    if (!fieldType || !id) return null; // skip if critical info missing

    switch (fieldType) {
      // ---------------- TEXT FIELD ----------------
      case 'text': {
        const { param } = field;
        const { field_name, keyboardtype, alias_name } = param;

        const rawValue = formValues[param.id]?.value || '';

        const isPriceField = alias_name?.toLowerCase() === 'price';
        const placeholderText =
          alias_name?.toLowerCase() === 'price'
            ? `£ ${alias_name}`
            : alias_name || field_name;

        let rnKeyboardType:
          | 'default'
          | 'numeric'
          | 'email-address'
          | 'phone-pad'
          | 'decimal-pad' = 'default';
        switch (keyboardtype) {
          case 'alpha-numeric':
            rnKeyboardType = 'default';
            break;
          case 'numeric':
            rnKeyboardType = 'numeric';
            break;
          case 'decimal':
            rnKeyboardType = 'decimal-pad';
            break;
          case 'email':
            rnKeyboardType = 'email-address';
            break;
          case 'phone':
            rnKeyboardType = 'phone-pad';
            break;
          default:
            rnKeyboardType = 'default';
        }

        return (
          <View key={field.id} style={styles.productTextView}>
            {/* <Text style={styles.textstyle}>{field_name}</Text> */}
            {renderLabel(field_name, field.mandatory)}
            <TextInput
              style={[
                styles.personalEmailID_TextInput,
                styles.login_container,
                {
                  textAlignVertical: 'center', // centers text vertically on Android
                  paddingVertical: 0, // prevents padding changes on focus
                },
              ]}
              placeholder={placeholderText}
              multiline={false}
              placeholderTextColor="rgba(255, 255, 255, 0.48)"
              keyboardType={rnKeyboardType}
              value={isPriceField && rawValue ? `£ ${rawValue}` : rawValue}
              //onChangeText={text => handleValueChange(param.id, alias_name, text)}
              onChangeText={text => {
                if (isPriceField) {
                  // Remove £ and spaces before saving
                  const cleaned = text.replace(/£\s?/g, '');
                  handleValueChange(param.id, alias_name, cleaned);
                } else {
                  handleValueChange(param.id, alias_name, text);
                }
              }}
            />
          </View>
        );
      }

      // ---------------- MULTI-LINE TEXT ----------------
      case 'multi-line-text': {
        const { param } = field;
        const { field_name, keyboardtype, alias_name } = param;
        const placeholderText = alias_name || field_name;

        let rnKeyboardType:
          | 'default'
          | 'numeric'
          | 'email-address'
          | 'phone-pad'
          | 'decimal-pad' = 'default';
        switch (keyboardtype) {
          case 'alpha-numeric':
            rnKeyboardType = 'default';
            break;
          case 'numeric':
            rnKeyboardType = 'numeric';
            break;
          case 'decimal':
            rnKeyboardType = 'decimal-pad';
            break;
          case 'email':
            rnKeyboardType = 'email-address';
            break;
          case 'phone':
            rnKeyboardType = 'phone-pad';
            break;
          default:
            rnKeyboardType = 'default';
        }

        return (
          <View key={field.id} style={styles.productTextView}>
            {/* <Text style={styles.textstyle}>{field_name}</Text> */}
            {renderLabel(field_name, field.mandatory)}
            <TextInput
              style={[
                styles.personalEmailID_TextInput,
                styles.login_container,
                { textAlign: 'left', textAlignVertical: 'top', height: 100 },
              ]}
              placeholder={placeholderText}
              multiline={true}
              placeholderTextColor="rgba(255, 255, 255, 0.48)"
              keyboardType={rnKeyboardType}
              value={formValues[param.id]?.value || ''}
              onChangeText={text =>
                handleValueChange(param.id, alias_name, text)
              }
            />
          </View>
        );
      }

      case 'dropdown':
        return (
          <View key={field.id} style={styles.productTextView}>
            {/* <Text style={styles.textstyle}>{field_name}</Text> */}
            {renderLabel(field_name, field.mandatory)}

            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => {
                console.log('field_ismultilple' + field.ismultilple);
                setMultiSelectModal({
                  visible: true,
                  ismultilple: !!field.param.ismultilple,
                  fieldId: id,
                });
                setMultiSelectOptions(options);
              }}
            >
              <Text style={styles.dropdowntext}>
                {Array.isArray(formValues[id]?.value) &&
                formValues[id]?.value.length > 0
                  ? `${formValues[id]?.value.length} Selected`
                  : `Select ${field_name}`}
              </Text>
            </TouchableOpacity>

            {/* <View style={styles.categoryContainer}>
              {options
                .filter((opt: any) => {
                  const value = formValues[id]?.value;
                  if (Array.isArray(value)) {
                    return value.includes(opt.id);
                  }
                  return value === opt.id;
                })
                .map((opt: any) => (
                  <View key={opt.id} style={styles.categoryTagWrapper}>
                    <TouchableOpacity
                      onPress={() => {
                        setFormValues((prev: any) => {
                          const currentValue = prev[id]?.value;
                          let updated;
                          if (Array.isArray(currentValue)) {
                            updated = currentValue.filter(
                              (v: any) => v !== opt.id,
                            );
                          } else {
                            updated = null;
                          }
                          return {
                            ...prev,
                            [id]: { ...prev[id], value: updated },
                          };
                        });
                      }}
                    >
                      <Text style={styles.categoryTag}>
                        {opt.option_name} ✕
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </View> */}

            <View style={styles.categoryContainer}>
              {options
                .filter((opt: any) => {
                  const value = formValues[id]?.value;
                  if (Array.isArray(value)) {
                    return value.includes(opt.id); // show if selected in multi-select
                  }
                  return value === opt.id; // show if selected in single-select
                })
                .map((opt: any) => (
                  <View key={opt.id} style={styles.categoryTagWrapper}>
                    <TouchableOpacity
                      onPress={() => {
                        setFormValues((prev: any) => {
                          const currentValue = prev[id]?.value;
                          let updated;
                          if (Array.isArray(currentValue)) {
                            updated = currentValue.filter(
                              (v: any) => v !== opt.id,
                            );
                          } else {
                            updated = null; // removing single-select
                          }
                          return {
                            ...prev,
                            [id]: { ...prev[id], value: updated },
                          };
                        });
                      }}
                    >
                      <Text style={styles.categoryTag}>
                        {opt.option_name} ✕
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          </View>
        );

      case 'image': {
        const { param } = field;
        const { field_name, maxvalue, ismulltiple } = param;

        const handleImageSelect = () => {
          if (uploadedImages.length >= maxvalue) {
            showToast(`Maximum ${maxvalue} images allowed`);
            return;
          }
          handleSelectImage();
        };

        return (
          <View key={field.id} style={styles.productTextView}>
            {/* <Text style={styles.textstyle}>{field_name}</Text> */}
            {renderLabel(field_name, field.mandatory)}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleImageSelect}
            >
              <Image source={uploadIcon} style={styles.uploadIcon} />
              <Text style={styles.uploadText}>Upload {field_name}</Text>
            </TouchableOpacity>

            {/* Show uploaded images only if there's at least one */}
            {uploadedImages.length > 0 && (
              <View style={styles.imagelistcard}>
                {uploadedImages.map((file, index) => (
                  <View key={file.id} style={{ width: '100%' }}>
                    {/* Image row */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 10,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                          flex: 1,
                        }}
                      >
                        <Image
                          source={require('../../../assets/images/sixdots.png')}
                          style={styles.threedots}
                        />
                        <Image
                          source={fileIcon}
                          style={{ width: 20, height: 20, marginRight: 5 }}
                        />
                        <Text
                          style={[styles.fileName, { flexShrink: 1 }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {file.name}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() =>
                          setUploadedImages(prev =>
                            prev.filter(img => img.id !== file.id),
                          )
                        }
                      >
                        <Image source={deleteIcon} style={styles.deleteIcon} />
                      </TouchableOpacity>
                    </View>

                    {/* Horizontal line if not the last image */}
                    {uploadedImages.length > 1 &&
                      index !== uploadedImages.length - 1 && (
                        <View
                          style={{
                            height: 1,
                            backgroundColor:
                              'radial-gradient(87.5% 87.5% at 17.5% 6.25%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                            marginHorizontal: 10,
                          }}
                        />
                      )}
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      }

      case 'boolean':
        return (
          <View key={field.id} style={styles.featurecard}>
            {/* Main row with label and toggle */}
            <View style={styles.featuredRow}>
              {/* <Text style={styles.featuredLabel}>{field.param.field_name}</Text> */}
              {renderLabel(field.param.field_name, field.mandatory)}

              <ToggleButton
                value={!!formValues[field.param.id]?.value}
                onValueChange={val =>
                  handleValueChange(field.param.id, field.param.alias_name, val)
                }
              />
            </View>

            <View style={styles.textbg}>
              <Image
                source={require('../../../assets/images/info_icon.png')}
                style={{ width: 16, height: 16, marginRight: 8, marginTop: 2 }}
              />

              {/* Texts */}
              <View style={{ flex: 1 }}>
                <Text style={styles.importantText1}>Important:</Text>
                <Text style={styles.importantText}>
                  Featured listings require a small upfront fee - {featureFee}% of your item’s price or up to £{maxFeatureCap} (whichever is lower).
                </Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {navigation.navigate('Dashboard',{AddScreenBackactiveTab: 'Add'})}}
            >
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.unizyText}>
              {`List${productName ? `  ${productName} ` : ''}`}
            </Text>
            <View style={{ width: 30 }} />
          </View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.userRow}>
              <View style={{ width: '20%' }}>
                {/* <Image source={profileImg} style={styles.avatar} /> */}
                <Image
                  source={
                    userMeta?.profile ? { uri: userMeta?.profile } : require('../../../assets/images/add1.png')
                  }
                  style={styles.avatar}
                />
              </View>
              <View style={{ width: '80%' }}>
                {/* <Text style={styles.userName}>Alan Walker</Text> */}
                <Text style={styles.userName}>
                  {userMeta
                    ? `${userMeta.firstname ?? ''} ${
                        userMeta.lastname ?? ''
                      }`.trim()
                    : 'Alan Walker'}
                </Text>
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    display: 'flex',
                    alignItems: 'stretch',
                  }}
                >
                  <Text style={styles.userSub}>University of Warwick,</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={styles.userSub}>Coventry</Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <Image
                        source={require('../../../assets/images/calendar_icon.png')}
                        style={{ height: 20, width: 20 }}
                      />
                      <Text style={styles.userSub}>{getCurrentDate()}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.productdetails}>
              {/* <Animated.View style={{ transform: [{ translateY: slideUp1 }] }}>
                <Text style={styles.productdetailstext}>Product Details</Text>
                {fields.map(field => renderField(field))}
              </Animated.View> */}
              <Animated.View
                style={{
                  transform: [{ translateY: slideUp1 }],
                  opacity: slideUp1.interpolate({
                    inputRange: [-screenHeight, 0],
                    outputRange: [0, 1],
                  }),
                }}
              >
                <Text style={styles.productdetailstext}>Product Details</Text>
                {fields.map(field => renderField(field))}
              </Animated.View>
            </View>
          </ScrollView>

          <Button title="Preview Details" onPress={() => handlePreview()} />
        </KeyboardAvoidingView>
      </View>

      <SelectCatagoryDropdown
        options={multiSelectOptions}
        visible={multiSelectModal.visible}
        ismultilple={multiSelectModal?.ismultilple}
        selectedValues={formValues[multiSelectModal.fieldId!]?.value} // <-- add this
        onClose={() =>
          setMultiSelectModal(prev => ({ ...prev, visible: false }))
        }
        onSelect={(selectedIds: number[] | number) => {
          setFormValues((prev: any) => ({
            ...prev,
            [multiSelectModal.fieldId!]: { value: selectedIds },
          }));
        }}
      />
      <NewCustomToastContainer />
    </ImageBackground>
  );
};

export default AddScreen;

const styles = StyleSheet.create({
  featurecard: {
    paddingHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  dropdowntext: {
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
    fontStyle: 'normal',
    color: '#fff',
  },

  eyeIcon1: {
    width: 19,
    height: 19,
    // paddingRight: 16,
  },

  headerContainer: {
    height: 80,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    justifyContent: 'center',
  },
  headerBlur: {
    ...StyleSheet.absoluteFillObject,
    // position: 'absolute',
    // left: 0,
    // right: 0,
    // top: 0,
    // bottom: 0,
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
  backArrow: {
    fontSize: 26,
    color: '#fff',
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
  dateText: {
    color: '#ccc',
    fontSize: 12,
  },
  uploadButton: {
    height: 40,
    gap: 10,
    marginTop: 10,
    alignSelf: 'stretch',
    borderRadius: 12,
    borderWidth: 0.9,
    borderColor: '#ffffff33',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
  },
  imagelistcard: {
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.32)',
    borderRadius: 7,
    borderWidth: 0.4,
    borderColor: '#ffffff33',
    marginTop: 10,
  },

  productdetailstext: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'normal',
    letterSpacing: -0.36,
  },

  uploadIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: 'contain',
  },
  uploadText: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 4,
  },

  filecard: {
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },

  fileIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    marginRight: 8,
  },
  fileName: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: -0.32,
    lineHeight: 24,
    paddingStart: 5,
  },
  deleteBtn: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  threedots: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  textstyle: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-Regular',
    fontWeight: 400,
    lineHeight: 16,
    fontSize: 14,
  },
  productTextView: {
    gap: 4,
    marginTop: 10,
  },

  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // marginBottom: 12,
    marginTop: 9,
  },
  categoryTag: {
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderWidth: 0.9,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderBlockEndColor: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9,
    marginRight: 4,
    marginBottom: 4,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.23)',
  },
  featuredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 4,
  },
  featuredLabel: {
    //color: '#fff',
    color: '#FFFFFFE0',
    fontSize: 14,
    fontFamily: 'Urbanist-Medium',
    fontWeight: 500,
  },
  textbg: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
    padding: 6,
    borderWidth: 0.5,
    borderEndEndRadius: 12,
    borderStartEndRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomStartRadius: 12,
    borderBlockStartColor: '#ffffff31',
    borderBlockColor: '#ffffff31',
    borderTopColor: '#ffffff31',
    borderBottomColor: '#ffffff31',
    borderLeftColor: '#ffffff31',
    borderRightColor: '#ffffff31',
  },
  importantText: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 6,
    fontFamily: 'Urbanist-Medium',
    fontWeight: 500,
  },
  importantText1: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 500,
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
  previewText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
  },

  login_container: {
    display: 'flex',
    height: 40,
    gap: 10,
    alignSelf: 'stretch',
    borderRadius: 12,
    borderWidth: 0.6,
    borderColor: '#ffffff2c',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
    paddingLeft: 10,
  },
  personalEmailID_TextInput: {
    width: '100%',
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
    fontStyle: 'normal',
    color: '#fff',
  },

  pickerContainer: {
    borderRadius: 12,
    borderWidth: 0.6,
    overflow: 'hidden',
    borderColor: '#ffffff2c',
    flexDirection: 'row',
    //justifyContent: 'center',
    //alignItems: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
    padding: 10,
    height: 40,
  },

  pickerStyle: {
    color: '#fff',
    width: '100%',
  },

  categoryTagWrapper: {
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },

  modalContent: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },

  modalTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 12,
  },

  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#555',
  },

  modalCloseBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 10,
    marginTop: 16,
    alignItems: 'center',
  },
});
