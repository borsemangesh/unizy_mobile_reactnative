import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  FlatList,
  Platform,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const bgImage = require('../../../assets/images/backimg.png');
import { NewCustomToastContainer, showToast } from '../../utils/component/NewCustomToastManager';
import { BlurView } from '@react-native-community/blur';
import { MAIN_URL } from '../../utils/APIConstant';
import {
  Asset,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import Button from '../../utils/component/Button';

type EditProfileProps = {
  navigation: any;
};

interface UserMeta {
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  student_email: string | null;
  city: string | null;
  postal_code: string | null;
  // profile:string | null;
}

const EditProfile = ({ navigation }: EditProfileProps) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [userMeta, setUserMeta] = useState<UserMeta>({
    firstname: '',
    lastname: '',
    email: '',
    student_email: '',
    city: '',
    postal_code: '',
    // profile:''
  });

  //------------------- Get data method ------------------------//

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');

        if (!token || !userId) {
          console.warn('Missing token or user ID in AsyncStorage');
          return;
        }

        console.log(token);
        const url = `${MAIN_URL.baseUrl}user/user-profile/${userId}`;
        console.log('url', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
          handleForceLogout();
          return;
        }

        if (data.statusCode === 401 || data.statusCode === 403) {
          handleForceLogout();
          return;
        }

        if (response.ok) {
          const user = data.data;
          console.log('user', user);

          setUserMeta({
            firstname: user.firstname ?? null,
            lastname: user.lastname ?? null,
            email: user.email ?? null,
            student_email: user.student_email ?? null,
            city: user.city ?? null,
            postal_code: user.postal_code ?? null,
          });
          setPhoto(user.profile);
        } else {
          console.warn(
            'Failed to fetch user profile:',
            data?.message || response.status,
          );
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
    } else if (Platform.OS === 'ios') {
      try {
        const status = await check(PERMISSIONS.IOS.CAMERA);
        if (status === RESULTS.GRANTED) {
          return true;
        }
        const result = await request(PERMISSIONS.IOS.CAMERA);

        if (result === RESULTS.GRANTED) {
          return true;
        } else if (result === RESULTS.BLOCKED) {
          console.warn(
            'Camera permission is blocked. Please enable it in Settings.',
          );
          return false;
        } else {
          return false; // Denied
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true;
    }
  };

//-----------------------Handel validation ---------------------//
  const validateForm = () => {
  const errors = [];
  if (!userMeta.firstname || userMeta.firstname.trim() === '') {
    errors.push('First name is required.');
  }
  if (!userMeta.lastname || userMeta.lastname.trim() === '') {
    errors.push('Last name is required.');
  }
  if (!userMeta.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userMeta.email)) {
    errors.push('Personal Email ID is invalid.');
  }
  if (!userMeta.student_email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userMeta.student_email)) {
    errors.push('Student Email ID is invalid.');
  }
  if (!userMeta.city || userMeta.city.trim() === '') {
    errors.push('City is required.');
  }
  if (!userMeta.postal_code || userMeta.postal_code.trim() === '' || isNaN(+userMeta.postal_code)) {
    errors.push('Postal code is required.');
  }
  return errors;
};

  // ---------------------  Update data method call -----------------//

  const handleSaveProfile = async () => {

      const errors = validateForm();
  if (errors.length > 0) {
    // Alert.alert('Validation Error', errors.join('\n'));
      showToast(errors.join('\n'),'error');
    return;
  }

    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');

      console.log('token', token);
      console.log('userId', userId);

      if (!token || !userId) {
        // Alert.alert('Error', 'User authentication missing.');
         showToast('User authentication missing.','error');
        return;
      }

      const url = `${MAIN_URL.baseUrl}user/profile-edit`;

      const body = {
        firstname: userMeta.firstname,
        lastname: userMeta.lastname,
        email: userMeta.email,
        student_email: userMeta.student_email,
        city: userMeta.city,
        postal_code: userMeta.postal_code,
        // profile:userMeta.profile || photo,
      };
 
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

   console.log("1 st step");
   

      const data = await response.json();
      console.log("data",data);
      
      if (response.ok) {
        // Alert.alert('Success', data.message);
        showToast(data.message,'success');   
        navigation.goBack();
      } else {
        // Alert.alert(
        //   'Error',
        //   data?.message ? data.message : 'Failed to update profile',
        // );

        showToast(data.message,'error');

        //  showToast( data?.message,'error');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  //------------------ image upload functionality ---------------//

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
              {
                mediaType: 'photo',
                cameraType: 'front',
                quality: 0.8,
              },
              response => {
                if (response.didCancel) return;
                if (response.assets && response.assets[0].uri) {
                  setPhoto(response.assets[0].uri);
                  handleUploadImage(response.assets[0]);
                }
              },
            );
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            launchImageLibrary(
              {
                mediaType: 'photo',
                quality: 0.8,
              },
              response => {
                if (response.didCancel) return;
                if (response.assets && response.assets[0].uri) {
                  setPhoto(response.assets[0].uri);
                  handleUploadImage(response.assets[0]);
                }
              },
            );
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  const handleUploadImage = async (image: Asset) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      const url = `${MAIN_URL.baseUrl}user/update-profile`;

      const formData = new FormData();
      formData.append('file', {
        uri: image.uri,
        type: image.type,
        name: image.fileName || `profile_${userId}.jpg`,
      });
      // Optionally append userId or other fields if needed by backend
      formData.append('userId', userId);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();    

      if (response.ok) {
        // Alert.alert('Success', 'Image uploaded successfully!');
   
        
          showToast(data?.message,'success');
      } else {
        // Alert.alert('Error', data?.message || 'Failed to upload image');
         showToast( data?.message,'error');

      }
    } catch (error) {
      // Alert.alert('Error', 'Unexpected error during upload');
       showToast('Unexpected error during upload','error');
    }
  };

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
             onPress={() => navigation.goBack()}
            >           

              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.unizyText}>
              Edit Profile
            </Text>
            <View style={{ width: 48 }} />
          </View>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          style={{ flex: 1 }}
           showsVerticalScrollIndicator={false}
        >
          {/* <View style={styles.avatarContainer}>
            <View style={styles.bigCircle}>
              <TouchableOpacity>
                <Image
                  source={
                    photo
                      ? { uri: photo }
                      : require('../../../assets/images/add1.png')
                  }
                  style={styles.logo}
                  resizeMode="cover"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handleSelectImage}
              >
                <Image
                  source={require('../../../assets/images/new_camera_icon.png')}
                  style={styles.cameraIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>             
            </View>
          </View> */}

            <View style={styles.profileavatarContainer}>
                                          <View style={styles.profilebigCircle}>
                                            <TouchableOpacity>
                                              <Image
                                                source={
                                                  photo
                                                    ? { uri: photo }
                                                    : require('../../../assets/images/add1.png')
                                                }
                                                style={styles.profilelogo}
                                                resizeMode="cover"
                                              />
                                            </TouchableOpacity>
          
                                            <TouchableOpacity
                                              style={styles.profilecameraButton}
                                              onPress={handleSelectImage}
                                            >
                                              {/* assets\images\camera_icon.png */}
                                              <Image
                                              
                                                 source={require('../../../assets/images/camera_1.png')}
                                                // source={require('../../../assets/images/camera_icon.png')}
                                                style={styles.profilecameraIcon}
                                                resizeMode="contain"
                                              />
                                            </TouchableOpacity>

                                                


                                          </View>
                                        </View>

          {/* Blur Glass Form */}
          <View style={styles.blurCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name*</Text>
              <TextInput
                value={userMeta.firstname || ''}
                onChangeText={text =>
                  setUserMeta(prev => ({ ...prev, firstname: text }))
                }
                style={styles.input}
                placeholder="Enter First Name"
                placeholderTextColor="#ccc"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name*</Text>
              <TextInput
                value={userMeta.lastname || ''}
                onChangeText={text =>
                  setUserMeta(prev => ({ ...prev, setLastName: text }))
                }
                style={styles.input}
                placeholder="Enter Last Name"
                placeholderTextColor="#ccc"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Personal Email ID*</Text>
              <TextInput
                value={userMeta.email || ''}
                onChangeText={text =>
                  setUserMeta(prev => ({ ...prev, setPersonalEmail: text }))
                }
                style={styles.input}
                keyboardType="email-address"
                placeholder="Enter Email"
                placeholderTextColor="#ccc"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Student Email ID*</Text>
              <TextInput
                value={userMeta.student_email || ''}
                onChangeText={text =>
                  setUserMeta(prev => ({ ...prev, setStudentEmail: text }))
                }
                style={styles.input}
                keyboardType="email-address"
                placeholder="Enter Student Email"
                placeholderTextColor="#ccc"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>City*</Text>
              <TextInput
                value={userMeta.city || ''}
                onChangeText={text =>
                  setUserMeta(prev => ({ ...prev, city: text }))
                }
                style={styles.input}
                placeholder="Enter City"
                placeholderTextColor="#ccc"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Postal Code*</Text>
              <TextInput
                value={userMeta.postal_code || ''}
                onChangeText={text =>
                  setUserMeta(prev => ({ ...prev, postal_code: text }))
                }
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter Postal Code"
                placeholderTextColor="#ccc"
              />
            </View>
          </View>
        </ScrollView>
        {/* Save Button */}
        {/* <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
          <Text style={styles.saveText}>Save Details</Text>
        </TouchableOpacity> */}
        <Button title='Save Details' onPress={()=>{
            handleSaveProfile()
        }}/>
      </View>
      <NewCustomToastContainer />
    </ImageBackground>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  tabcard: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 0.4,
    borderColor: '#ffffff11',

    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.10) 100%)',

    borderEndEndRadius: 10,
    borderStartEndRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomStartRadius: 10,
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',

    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',

    boxSizing: 'border-box',
  },
  tabcard1: {
    borderWidth: 0.4,
    borderColor: '#ffffff11',

    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',

    borderEndEndRadius: 10,
    borderStartEndRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomStartRadius: 10,
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',

    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',

    boxSizing: 'border-box',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  tabtext: {
    color: '#fff', // selected tab text color
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
  },
  othertext: {
    color: '#FFFFFF7A', // unselected tab text color
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
  },

  background: {
    flex: 1,
    width: '100%',
    height: '100%'   
  },
  fullScreenContainer: {
    flex: 1,
    marginTop: 10,
    width: 361,
    height: 476,
    // 'angle' not a valid RN style — remove it
    opacity: 1,
    borderRadius: 24,
    padding: 16,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
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
    marginRight: 12,
    width: 265,
    height: 28,
    opacity: 1
  },
  search_container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 16,
    borderRadius: 40,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
  },
  searchIcon: {
    margin: 10,
    height: 24,
    width: 24,
  },
  searchBar: {
    fontSize: 17,
    color: '#fff',
    width: '85%',
  },
  listContainer: {
    marginLeft: 10,
    marginRight: 10,
    paddingTop: 10,
    //paddingBottom:80,
  },
  row1: {
    // flexDirection: 'row',
    // justifyContent: 'flex-start',
  },
  itemContainer: {
    flex: 1,
    marginHorizontal: 4,
  },

  container: {
    flex: 1,
    resizeMode: 'cover',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4A80F0',
    padding: 6,
    borderRadius: 18,
  },
  cameraIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
  },
  imageSizeText: {
    color: '#A9C1FF',
    fontSize: 12,
    marginTop: 5,
  },
  blurCard: {
     marginTop: 16,
    borderRadius: 24,
    padding: 16,
    // overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',    
  },
  inputGroup: {
    marginBottom: 12,
    height:64,
  },
  label: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 6,
    opacity: 0.9,
    fontFamily:'Urbanist'
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    height:44,
    // width:329
  },
  saveButton: {
    backgroundColor: '#B4C8FF',
    borderRadius: 25,
    marginTop: 28,
    alignItems: 'center',
    paddingVertical: 14,
  },
  saveText: {
    color: '#1E2A78',
    fontWeight: '700',
    fontSize: 16,
  },

  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bigCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: 'rgba(255, 255, 255, 0.02)inset -1px 0px 15px 1px',
    borderWidth: 1,
    borderColor: '#ffffff2c',
  },

  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

    profileavatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

    profilebigCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: 'rgba(255, 255, 255, 0.02)inset -1px 0px 15px 1px',
    borderWidth: 1,
    borderColor: '#ffffff2c',
  },
 
    profilelogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

    profilecameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
 
    
  },
    profilecameraIcon: {
    width: 40,
    height: 40,
    marginLeft: 5,
    marginTop: 5, 
  },
});
