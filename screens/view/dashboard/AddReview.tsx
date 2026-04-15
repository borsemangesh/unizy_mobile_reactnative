import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';

const bgImage = require('../../../assets/images/backimg.png');
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import {
  NewCustomToastContainer,
  showToast,
} from '../../utils/component/NewCustomToastManager';
import StarRating from '../../utils/StarRating';
import AddRating from '../../utils/AddRating';
import { BlurView } from '@react-native-community/blur';
import Button from '../../utils/component/Button';
import Loader from '../../utils/component/Loader';
import { Constant } from '../../utils/Constant';
import { useTranslation } from 'react-i18next';
import { IMAGE_URLS } from '../../utils/Style';
import BackgroundWrapper from '../../utils/component/BackgroundWrapper';
import COMMONSTYLE from '../../utils/CommonStyle';

type AddReviewProps = {
  navigation: any;
};

type RootStackParamList = {
  AddReview: { category_id: number; feature_id: number };
};

type AddReviewRouteProp = RouteProp<RootStackParamList, 'AddReview'>;

const AddReview: React.FC<AddReviewProps> = ({ navigation }) => {
  const route = useRoute<AddReviewRouteProp>();
  const { feature_id } = route.params;
  const { category_id } = route.params;
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [username, setUsername] = useState<string>('');
  const [showPopup1, setShowPopup1] = useState(false);
  const closePopup1 = () => setShowPopup1(false);
  const { width } = Dimensions.get('window');
  const { t } = useTranslation();


  const handleSubmit = async () => {
    if (rating === 0) {
      showToast(t(Constant.ENTER_RATING), 'error');
      return;
    }
    if (username.trim() === '') {
      showToast(t(Constant.ENTER_REVIEW), 'error');
      return;
    }

    try {
      setIsLoading(true);
      const language_code = await AsyncStorage.getItem('selectedLanguage') || 'en'
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      if (!token) {
        return;
      }


      const createPayload = {
        rating: rating,
        comment: username,
        feature_id: feature_id,
      };


      const url1 = `${MAIN_URL.baseUrl}category/users/reviews/${category_id}`;


      const response = await fetch(url1, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          languagecode: language_code
        },
        body: JSON.stringify(createPayload),
      });

      const result = await response.json();

      if (result.statusCode === 200) {

        showToast(t(result.message));
        setShowPopup1(true);
      } else {
        console.warn('Error saving review:', result);
        showToast(t(result.message) || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Review error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // <BackgroundWrapper>
    <ImageBackground
              source={IMAGE_URLS.BACK_ICON}
              style={{ flex: 1,width: '100%',
            height: '100%', }}
              resizeMode="cover"
            >
      <View style={styles.fullScreenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
            >
              <View style={styles.backIconRow}>
                <Image
                  source={IMAGE_URLS.BACKICON_ICON}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.unizyText}>
              {t('write_a_review')}
            </Text>
            <View style={{ width: 48 }} />
          </View>
        </View>
      

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View
            style={{
              flex: 1,
              paddingTop: Platform.OS === 'ios' ? 120 : 120,
              paddingHorizontal: 20,
            }}
          >
            <View style={styles.innercontainer}>
              <Text allowFontScaling={false} style={styles.mainlabel}>
                {t('how_many_stars')}
              </Text>
              <Text allowFontScaling={false} style={styles.sublabel}>
                {t('slide_to_rate')}
              </Text>
            </View>

            <View
              style={{ marginTop: 16, marginBottom: 20, alignItems: 'center' }}
            >
              <AddRating starSize={40} onChange={setRating} />
            </View>

            <View style={styles.innercontainer}>
              <Text allowFontScaling={false} style={styles.mainlabel1}>
                {t('tell_us_more')}{' '}
              </Text>

              <View style={styles.login_container}>
                <TextInput
                  selectionColor="#F5F5F5"   // ANDROID cursor color
                  cursorColor="#F5F5F5"    // iOS cursor color
                  allowFontScaling={false}
                  style={[
                    styles.personalEmailID_TextInput,
                    { textAlignVertical: 'top', paddingTop: 10 },
                  ]}
                  placeholder={t('tell')}
                  placeholderTextColor={'rgba(255, 255, 255, 0.48)'}
                  multiline={true}
                  value={username}
                  onChangeText={usernameText => setUsername(usernameText)}
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <Button title={t('submit_review')} onPress={() => handleSubmit()} />

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
                    source={IMAGE_URLS.SUCCESS_ICON}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                  <Text
                    allowFontScaling={false}
                    style={styles.reviewSubmitedText}
                  >
                    {t('review_submitted_success')}!
                  </Text>

                  <TouchableOpacity
                    style={COMMONSTYLE.loginButton}
                    onPress={() => {
                      setShowPopup1(false);
                      navigation.reset({
                        index: 0,
                        routes: [
                          {
                            name: 'Dashboard',
                            params: {
                              AddScreenBackactiveTab: 'Home',
                              isNavigate: false,
                            },
                          },
                        ],
                      });
                    }}
                  >
                    <Text allowFontScaling={false} style={styles.loginText}>
                      {t('return_home')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.loginButton1}
                    onPress={() => {
                      setShowPopup1(false);
                      navigation.reset({
                        index: 0,
                        routes: [
                          {
                            name: 'MyReviews'
                          },
                        ],
                      });

                    }}
                  >
                    <Text allowFontScaling={false} style={styles.loginText1}>
                      {t('return_reviews')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
        {isLoading && (
          <View style={styles.fullLoader}>
            <Loader />
          </View>
        )}
      <NewCustomToastContainer />
    </ImageBackground>
  );
};

export default AddReview;

const styles = StyleSheet.create({
  reviewSubmitedText: {
    ...COMMONSTYLE.FONTFAMILY_SEMIBOLD,
    ...COMMONSTYLE.FONT_20,
    ...COMMONSTYLE.FONTWEIGHT_600,
    color: 'rgba(255, 255, 255, 0.80)',
    letterSpacing: -0.4,
    lineHeight: 28,
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
    ...COMMONSTYLE.FONTFAMILY_MEDIUM,
    ...COMMONSTYLE.FONT_17,
    ...COMMONSTYLE.FONTWEIGHT_500,
    letterSpacing: 1,
    width: '100%',
  },
  loginText1: {
    color: '#FFFFFF7A',
    textAlign: 'center',
    ...COMMONSTYLE.FONTFAMILY_MEDIUM,
    ...COMMONSTYLE.FONT_17,
    ...COMMONSTYLE.FONTWEIGHT_500,
    letterSpacing: 1,
    width: '100%',
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

  mainlabel: {
    color: '#fff',
    marginTop: 8,
    ...COMMONSTYLE.FONTFAMILY_SEMIBOLD,
    ...COMMONSTYLE.FONT_18,
    ...COMMONSTYLE.FONTWEIGHT_600,
  },

  sublabel: {
    color: '#FFFFFFA3',
    ...COMMONSTYLE.FONTFAMILY_MEDIUM,
    ...COMMONSTYLE.FONT_14,
    ...COMMONSTYLE.FONTWEIGHT_600,
    marginTop: 4,
  },
  innercontainer: {
    marginBottom: 8,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  mainlabel1: {
    color: '#fff',
    ...COMMONSTYLE.FONTFAMILY_SEMIBOLD,
    ...COMMONSTYLE.FONT_18,
    ...COMMONSTYLE.FONTWEIGHT_600,
  },

  personalEmailID_TextInput: {
    width: '98%',
    ...COMMONSTYLE.FONTFAMILY_REGULAR,
    ...COMMONSTYLE.FONT_17,
    ...COMMONSTYLE.FONTWEIGHT_400,
    lineHeight: 22,
    fontStyle: 'normal',
    color: '#fff',
    paddingLeft: 12,
    height: '100%',
  },
  login_container: {
    display: 'flex',
    width: '100%',
    minHeight: 160,
    height: 160,
    gap: 10,
    alignSelf: 'stretch',
    borderRadius: 12,
    borderWidth: 0.6,
    borderColor: '#ffffff2c',
    flex: 1,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
    marginTop: 6,
  },
  

  fullScreenContainer: {
    flex: 1,
  },
  header: {
   
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
    alignContent: 'center'
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
});
