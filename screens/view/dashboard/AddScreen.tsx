

import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // npm install @react-native-picker/picker
import ToggleButton from '../../utils/component/ToggleButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageResizer from 'react-native-image-resizer';
 import { launchCamera, launchImageLibrary } from "react-native-image-picker";
 import { PermissionsAndroid, Platform } from "react-native";
import { MAIN_URL } from '../../utils/APIConstant';
import { showToast } from '../../utils/toast';

const bgImage = require('../../../assets/images/bganimationscreen.png');
const profileImg = require('../../../assets/images/user.jpg'); // your avatar image
const uploadIcon = require('../../../assets/images/upload.png'); // upload icon

const fileIcon = require('../../../assets/images/file.png'); // file icon
const deleteIcon = require('../../../assets/images/delete.png'); // delete/trash ico

type AddScreenContentProps = {
  navigation: any;
};
const AddScreen: React.FC<AddScreenContentProps> = ({ navigation }) => {
  const [formValues, setFormValues] = useState<any>({});
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
const MAX_SIZE_MB = 1;
// const { productId, name } = route.params;
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB');
  const displayDate = formattedDate.replace(/\//g, '-');
  const [photo, setPhoto] = useState<string | null>(null);

const [multiSelectModal, setMultiSelectModal] = useState<{ visible: boolean; fieldId?: number }>({ visible: false });
const [multiSelectOptions, setMultiSelectOptions] = useState<any[]>([]);
  const [uploadedImages, setUploadedImages] = useState<{ id: string; uri: string; name: string }[]>([]);

//   useEffect(() => {
//   setFormValues({}); // clear all previous selections
// }, []); // run only once on screen mount


 useEffect(() => {
    const fetchFields = async () => {
      try {
        const productId1 = await AsyncStorage.getItem('selectedProductId');

        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          console.log('No token found');
          return;
        }

        //const url = MAIN_URL.baseUrl+"category/listparams/user/1"
        const url = `${MAIN_URL.baseUrl}category/listparams/user/${productId1}`;


        const response = await fetch(
          url,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`, // ✅ use token from AsyncStorage
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        if (json?.data) {
          const sellerFields = json.data.filter((item: any) => item.seller === true);
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

  const handleValueChange = (fieldId: number, value: any) => {
    setFormValues((prev: any) => ({ ...prev, [fieldId]: value }));
  };
  
  const handleMultiSelectToggle = (fieldId: number, optionId: number) => {
  const prevSelected: number[] = Array.isArray(formValues[fieldId])
    ? formValues[fieldId]
    : [];

  const updated = prevSelected.includes(optionId)
    ? prevSelected.filter((id) => id !== optionId)
    : [...prevSelected, optionId];

  setFormValues((prev: any) => ({ ...prev, [fieldId]: updated }));
};

  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs access to your camera",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
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
  
//  const handleSelectImage = async () => {
//   const hasPermission = await requestCameraPermission();
//   if (!hasPermission) return;

//   Alert.alert(
//     "Select Option",
//     "Choose a source",
//     [
//       {
//         text: "Camera",
//         onPress: () => {
//           launchCamera(
//             { mediaType: "photo", cameraType: "front", quality: 0.8 },
//             (response) => {
//               if (response.didCancel) return;
//               if (response.assets && response.assets[0].uri) {
//                 const asset = response.assets[0];
//                 setUploadedImages((prev) => [
//                 ...prev,
//                 { id: Date.now().toString(), uri: asset.uri!, name: asset.fileName || 'Image' },
//               ]);
//               }
//             }
//           );
//         },
//       },
//       {
//         text: "Gallery",
//         onPress: () => {
//           launchImageLibrary({ mediaType: "photo", quality: 0.8 }, (response) => {
//             if (response.didCancel) return;
//             if (response.assets && response.assets[0].uri) {
//               const asset = response.assets[0];
//               setUploadedImages((prev) => [
//               ...prev,
//               { id: Date.now().toString(), uri: asset.uri!, name: asset.fileName || 'Image' },
//             ]);
//             }
//           });
//         },
//       },
//       { text: "Cancel", style: "cancel" },
//     ],
//     { cancelable: true }
//   );
// };


const handlePreview = async () => {
  try {
    const dataToStore: any = { ...formValues };

    // Add images separately
    fields.forEach((field) => {
      if (field.param.field_type.toLowerCase() === 'image') {
        const uploadedForField = uploadedImages.map((img) => ({
          id: img.id,
          uri: img.uri,
          name: img.name,
        }));
        dataToStore[field.param.id] = uploadedForField;
      }
    });

    await AsyncStorage.setItem('formData', JSON.stringify(dataToStore));

    console.log('Form data saved: ', dataToStore);

    navigation.navigate('PreviewThumbnail'); // navigate after saving
  } catch (error) {
    console.log('Error saving form data: ', error);
    showToast('Failed to save form data');
  }
};


const handleSelectImage = async () => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return;

  Alert.alert(
    "Select Option",
    "Choose a source",
    [
      {
        text: "Camera",
        onPress: () => {
          launchCamera(
            { mediaType: "photo", cameraType: "front", quality: 1 }, // get max quality first
            async (response) => {
              if (response.didCancel) return;
              if (response.assets && response.assets[0].uri) {
                const asset = response.assets[0];
                let uri = asset.uri!;
                let name = asset.fileName || 'Image';

                // check size
                if (asset.fileSize && asset.fileSize > MAX_SIZE_MB * 1024 * 1024) {
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

                setUploadedImages((prev) => [
                  ...prev,
                  { id: Date.now().toString(), uri, name },
                ]);
              }
            }
          );
        },
      },
      {
        text: "Gallery",
        onPress: () => {
          launchImageLibrary({ mediaType: "photo", quality: 1 }, async (response) => {
            if (response.didCancel) return;
            if (response.assets && response.assets[0].uri) {
              const asset = response.assets[0];
              let uri = asset.uri!;
              let name = asset.fileName || 'Image';

              // check size
              if (asset.fileSize && asset.fileSize > MAX_SIZE_MB * 1024 * 1024) {
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

              setUploadedImages((prev) => [
                ...prev,
                { id: Date.now().toString(), uri, name },
              ]);
            }
          });
        },
      },
      { text: "Cancel", style: "cancel" },
    ],
    { cancelable: true }
  );
};


  const renderField = (field: any) => {
    const { field_name, field_type, options, id } = field.param;
    const fieldType = field_type.toLowerCase();

    switch (fieldType) {
     
      case 'text': {
  const { param } = field;
  const { field_name, keyboardtype, alias_name, field_type } = param;

  // Placeholder from alias_name if present, else field_name
  const placeholderText = alias_name || field_name;

  let rnKeyboardType: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'decimal-pad' = 'default';
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
      <Text style={styles.textstyle}>{field_name}</Text>
      <TextInput
        style={[styles.personalEmailID_TextInput, styles.login_container]}
        placeholder={placeholderText}
        multiline={false}
        placeholderTextColor="rgba(255, 255, 255, 0.48)"
        keyboardType={rnKeyboardType}
        value={formValues[param.id] || ''}
        onChangeText={(text) => handleValueChange(param.id, text)}
      />
    </View>
  );
}

case 'multi-line-text': {
  const { param } = field;
  const { field_name, keyboardtype, alias_name } = param;
  const placeholderText = alias_name || field_name;

  let rnKeyboardType: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'decimal-pad' = 'default';
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
      <Text style={styles.textstyle}>{field_name}</Text>
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
        value={formValues[param.id] || ''}
        onChangeText={(text) => handleValueChange(param.id, text)}
      />
    </View>
  );
}
    
      case 'dropdown':
        return (
          <View key={field.id} style={styles.productTextView}>
            <Text style={styles.textstyle}>{field_name}</Text>

            {/* Multi-select picker touchable */}
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => {
                setMultiSelectModal({ visible: true, fieldId: id });
                setMultiSelectOptions(options);
              }}
            >
              <Text style={styles.dropdowntext}>
                {Array.isArray(formValues[id]) && formValues[id].length > 0
                  ? `${formValues[id].length} Selected`
                  : `Select ${field_name}`}
              </Text>
            </TouchableOpacity>

           
     <View style={styles.categoryContainer}>
        {options
          .filter((opt: any) => Array.isArray(formValues[id]) && formValues[id].includes(opt.id))
          .map((opt: any) => (
            <View key={opt.id} style={styles.categoryTagWrapper}>
              <TouchableOpacity
                onPress={() => {
                  // remove option from formValues[id]
                  setFormValues((prev: any) => {
                    const updated = Array.isArray(prev[id]) ? [...prev[id]] : [];
                    return {
                      ...prev,
                      [id]: updated.filter((value) => value !== opt.id),
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
    //showToast(ismulltiple)
    if (uploadedImages.length >= maxvalue) {
      showToast(`Maximum ${maxvalue} images allowed`);
      return;
    }

    handleSelectImage(); 
  };


  return (
    <View key={field.id} style={styles.productTextView}>
      <Text style={styles.textstyle}>{field_name}</Text>

      <TouchableOpacity style={styles.uploadButton} onPress={handleImageSelect}>
        <Image source={uploadIcon} style={styles.uploadIcon} />
        <Text style={styles.uploadText}>Upload {field_name}</Text>
      </TouchableOpacity>

      <View style={styles.imagelistcard}>
        {uploadedImages.map((file) => (
          <View key={file.id} style={{ width: '100%', flexDirection: 'row' }}>
            <View
              style={{
                flexDirection: 'row',
                width: '90%',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  width: '100%',
                  padding: 10,
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flexDirection: 'row', width: 30 }}>
                    <Image
                      source={require('../../../assets/images/threedots.png')}
                      style={styles.threedots}
                    />
                    <Image
                      source={require('../../../assets/images/threedots.png')}
                      style={[styles.threedots, { paddingLeft: 5 }]}
                    />
                  </View>

                  <Image source={fileIcon} style={{ width: 20, height: 20, marginRight: 5 }} />

                  <Text
                    style={[styles.fileName, { flexShrink: 1 }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {file.name}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setUploadedImages((prev) => prev.filter((img) => img.id !== file.id))
                }
              >
                <Image source={deleteIcon} style={styles.deleteIcon} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}



      case 'boolean':
        return (
          <View key={field.id} style={styles.featuredRow}>
            <Text style={styles.featuredLabel}>{field_name}</Text>
            <ToggleButton
              value={!!formValues[id]}              // current value
              onValueChange={(val) => handleValueChange(id, val)} // update state
            />
          </View>
        );
      default:
        return null;
    }
  };

  // if (loading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
  //       <ActivityIndicator color="#fff" size="large" />
  //     </View>
  //   );
  // }

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.navigate('Dashboard')}>
               <View style={styles.backIconRow}>
              <Image
                source={require('../../../assets/images/back.png')}
                style={{ height: 24, width: 24 }}
              />
              </View>
            </TouchableOpacity>
            <Text style={styles.unizyText}>List Product</Text>
            <View style={{ width: 30 }} />
          </View>
        </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* User Info */}
          <View style={styles.userRow}>
            <View style={{ width: '20%' }}>
              <Image source={profileImg} style={styles.avatar} />
            </View>
            <View style={{ width: '80%' }}>
              <Text style={styles.userName}>Alan Walker</Text>
              <Text style={styles.userSub}>University of Warwick, Coventry</Text>
              <Text style={styles.userSub}>{displayDate}</Text>
            </View>
          </View>

          {/* Dynamic Fields */}
          <View style={styles.productdetails}>
            <Text style={styles.productdetailstext}>Product Details</Text>
            {fields.map((field) => renderField(field))}
          </View>
        </ScrollView>
    
        <TouchableOpacity
          style={styles.previewBtn}
          onPress={
            //console.log('Collected form values: ', formValues);
            //navigation.navigate('PreviewThumbnail');
            handlePreview
          }
          
          >
          <Text style={styles.previewText}>Preview Details</Text>
        </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
     
    <Modal
      visible={multiSelectModal.visible}
      transparent
      animationType="slide"
      onRequestClose={() => setMultiSelectModal({ visible: false })}
    >
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Select Options</Text>
      <ScrollView>
        {multiSelectOptions.map((opt: any) => (
          <TouchableOpacity
            key={opt.id}
            style={styles.modalOption}
            onPress={() => {
              const prevSelected: number[] = Array.isArray(formValues[multiSelectModal.fieldId!])
                ? formValues[multiSelectModal.fieldId!]
                : [];
              const updated = prevSelected.includes(opt.id)
                ? prevSelected.filter((id) => id !== opt.id)
                : [...prevSelected, opt.id];
              setFormValues((prev: any) => ({
                ...prev,
                [multiSelectModal.fieldId!]: updated,
              }));
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>{opt.option_name}</Text>
            {Array.isArray(formValues[multiSelectModal.fieldId!]) &&
              formValues[multiSelectModal.fieldId!].includes(opt.id) && (
                <Text style={{ color: '#3b82f6', marginLeft: 10 }}>✓</Text>
              )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.modalCloseBtn}
        onPress={() => setMultiSelectModal({ visible: false })}
      >
        <Text style={{ color: '#fff' }}>Done</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </ImageBackground>
  );
};

export default AddScreen;

const styles = StyleSheet.create({

  dropdowntext:{
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
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10,
    justifyContent: "center",
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
    top: -10,
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
    paddingTop: 80,
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
    // padding: 16,
    // borderRadius: 24,
    // backgroundColor: 'rgba(255, 255, 255, 0.05)',
    

    // // gap: 10,
    marginTop: 10,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
  
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

  productdetailstext:{
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

  filecard: {
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },

  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
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
    width: 10,
    height: 10,
    resizeMode: 'contain',
  },
  textstyle:{
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-Regular',
    fontWeight: 400,
    lineHeight: 16,
    fontSize: 14,
  },
  productTextView:{
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
    backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderWidth: 0.9,
    borderColor:'rgba(255, 255, 255, 0.08)',
    borderBlockEndColor: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9,
    marginRight: 4,
    marginBottom: 4,
    boxShadow:'0 2px 8px 0 rgba(0, 0, 0, 0.23)'
  },
  featuredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop:8,
  },
  featuredLabel: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Urbanist-Medium',
    fontWeight:500,
  },
  importantText: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 16,
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
   height:40,
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
  marginBottom: 12 },

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
