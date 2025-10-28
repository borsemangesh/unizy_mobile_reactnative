import React, { useCallback, useEffect, useState } from 'react';
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
  ImageSourcePropType,
  ListRenderItem,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';

const bgImage = require('../../../assets/images/backimg.png');
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NewCustomToastContainer, showToast } from '../../utils/component/NewCustomToastManager';
import StarRating from '../../utils/StarRating';
import AddRating from '../../utils/AddRating';
import { BlurView } from '@react-native-community/blur';


type AddReviewProps = {
  navigation: any;
};


const AddReview = ({ navigation }: AddReviewProps)  => {


   const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [username, setUsername] = useState<string>('');
  const [showPopup1, setShowPopup1] = useState(false);
    const closePopup1 = () => setShowPopup1(false);
   const { width } = Dimensions.get('window');

   const handleSubmit = async () => {
    if (rating === 0) {
      showToast('Please select a rating');
      return;
    }
    if (username.trim() === '') {
      showToast('Please enter your comment');
      return;
    }

    try {
      setIsLoading(true);

      const token = await AsyncStorage.getItem('userToken');

        if (!token) {
          console.log('No token found');
          return;
        }

      const response = await fetch('http://65.0.99.229:4320/category/users/5/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: rating,
          comment: username,
          feature_id: 40,
        }),
      });

      const result = await response.json();

      if (response.ok && result.statusCode === 200) {
        console.log('Review saved:', result);
        showToast(result.message)
        setShowPopup1(true); 
      } else {
        console.warn('Error saving review:', result);
        showToast(result.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Review error:', error);
      console.log('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() =>{navigation.replace('ReviewDetails',{category_id:1,id: 1,})}}>
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.unizyText}>Write a Review</Text>
            <View style={{ width: 48 }} />
          </View>
        </View>
    <View>
        </View>

          <View style={styles.innercontainer}>
            <Text allowFontScaling={false} style={styles.mainlabel}>How many stars would you give?</Text>
             <Text allowFontScaling={false} style={styles.sublabel}>Slide across the stars to rate this product</Text>
         </View>

        <View style={{ paddingHorizontal: 16, marginTop:12,marginBottom: 12, alignItems: 'center' }}>
        {/* <AddRating starSize={40} /> */}

        <AddRating starSize={40} onChange={setRating} />
        </View>

    <View style={styles.innercontainer}>
        <Text allowFontScaling={false} style={styles.mainlabel1}>Tell us More </Text>

        <View style={styles.login_container}>
              <TextInput
              allowFontScaling={false}
                style={styles.personalEmailID_TextInput}
                placeholder={'Tell other students what you liked, what could be better...'}
                placeholderTextColor={'rgba(255, 255, 255, 0.48)'}
                multiline={true}
                value={username}
                onChangeText={usernameText => setUsername(usernameText)}
              />
            </View>
         </View>
        

        <TouchableOpacity onPress={handleSubmit} style={styles.previewBtn} >
            <Text allowFontScaling={false} style={styles.payText}>Submit Review </Text>
          </TouchableOpacity>

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
              <Text allowFontScaling={false} style={{
                color: 'rgba(255, 255, 255, 0.80)',
                fontFamily: 'Urbanist-SemiBold',
                fontSize: 20,
                fontWeight: '600',
                letterSpacing: -0.4,
                lineHeight: 28,
              }}>Review Submitted Successfully!</Text>
              
 
              <TouchableOpacity
                style={styles.loginButton}
                onPress={()=>{navigation.replace('Dashboard',{AddScreenBackactiveTab: 'Home', isNavigate:false }) ;setShowPopup1(false);}}
              >
                <Text allowFontScaling={false} style={styles.loginText}>Return to Home</Text>
              </TouchableOpacity>

               <TouchableOpacity
                style={styles.loginButton1}
                onPress={()=>{setShowPopup1(false);}}
              >
                <Text allowFontScaling={false} style={styles.loginText1}>Return to Reviews</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
        </TouchableWithoutFeedback>
      </Modal>


      </View>
      <NewCustomToastContainer/>
    </ImageBackground>
  );
};

export default AddReview;

const styles = StyleSheet.create({

     overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
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
 
    backgroundColor: 'rgba(255,255,255,0.15)',
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
 

    mainlabel:{
    color: '#fff',
    fontSize: 18, 
    fontWeight: '600', 
    fontFamily: 'Urbanist-SemiBold',
    textAlign:'center'
    },

    sublabel:{
    color: '#FFFFFFA3', 
    fontSize: 14, 
    fontWeight: '600',
    fontFamily: 'Urbanist-Medium',
    textAlign:'center'
    },
    innercontainer:{
         paddingHorizontal: 16, 
         marginBottom: 8, 
         flexDirection: 'column', 
         justifyContent: 'space-between' 
    },
    mainlabel1:{
    color: '#fff',
    fontSize: 18, 
    fontWeight: '600', 
    fontFamily: 'Urbanist-SemiBold',
    },

    login_container: {
    display: 'flex',
    width: '100%',
    minHeight:160,
    gap: 10,
    alignSelf: 'stretch',
    borderRadius: 12,
    borderWidth: 0.6,
    borderColor: '#ffffff2c',
    flex: 1,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
    marginTop:6
  },
  personalEmailID_TextInput: {
    width: '93%',
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
    fontStyle: 'normal',
    color:"#fff",

  },
   payText: {
  color: '#002050',
  fontFamily: 'Urbanist-Medium',
  fontSize: 17,
  fontWeight: '500',
  letterSpacing: 1,
  textAlign:'center'
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


  tabcard: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
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
    color: '#fff',   // selected tab text color
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize:14

  },
  othertext: {
    color: '#FFFFFF7A',   // unselected tab text color
    fontWeight: '600',
     fontFamily: 'Urbanist-SemiBold',
     fontSize:14
  },

  background: { 
    flex: 1,
     width: '100%',
      height: '100%' },
  fullScreenContainer: {
     flex: 1
     },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
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
  

});