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
  KeyboardAvoidingView,
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
import { BlurView } from '@react-native-community/blur';
import Button from '../../utils/component/Button';
import Loader from '../../utils/component/Loader';
import { Constant } from '../../utils/Constant';
import { useTranslation } from 'react-i18next';
import BackgroundWrapper from '../../utils/component/BackgroundWrapper';
import { IMAGE_URLS } from '../../utils/Style';

type ReportProductProps = {
  navigation: any
}
const ReportProduct = ({ navigation }: ReportProductProps) => {
  const route = useRoute();
  const { feature_id } = route.params as { feature_id: number, };
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [desc, setDesc] = useState<string>('');
  const [showPopup1, setShowPopup1] = useState(false);
  const closePopup1 = () => setShowPopup1(false);
  const { width } = Dimensions.get('window');
  const { t } = useTranslation();
  const [title, settitle] = useState('');
  const closePopup2 = () => setShowPopup1(false);


  const handleSubmit = async () => {
    console.log('Report Click');
    if (title.trim() === '') {
      showToast(t(Constant.TITLE_ISMAND), 'error');
      return;
    }

    if (desc.trim() === '') {
      showToast(t(Constant.DESC_REQ), 'error');
      return;
    }

    try {
      setIsLoading(true);

      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');
      if (!token) {
        console.log('No token found');
        return;
      }
      // console.log(category_id);

      const listingReportPayload = {
        //   report_type: 'listing',
        reference_id: feature_id,
        reported_by: userId,
        title: title,
        description: desc,
      };


      const url1 = `${MAIN_URL.baseUrl}category/listing-report`;
      console.log("ReportListingurl:", url1);
      console.log("ReportListingpayload:", listingReportPayload);

      console.log(url1);
      const response = await fetch(url1, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(listingReportPayload),
      });

      const result = await response.json();

      if (result.statusCode === 200) {
        console.log('Review saved:', result);
        showToast(t(result.message));
        setIsLoading(false);
        setShowPopup1(true);
      } else {
        console.warn('Error saving review:', result);
        showToast(t(result.message) || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Review error:', error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
      setIsLoading(false);
    }
  };

  const inputCursorColor = "#FFFFFF";
  return (
     <ImageBackground
                            source={IMAGE_URLS.BACK_ICON}
                            style={{ flex: 1,width: '100%',
                          height: '100%', }}
                            resizeMode="cover"
                          >
    {/* <BackgroundWrapper> */}
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
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.unizyText}>
              {t('report_listing')}
            </Text>
            <View style={{ width: 48 }} />
          </View>
        </View>
        {isLoading && (
          <View style={styles.fullLoader}>
            <Loader />
          </View>
        )}

        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          accessible={false}
        >
          <View
            style={{
              flex: 1,
              gap: 10,
              paddingTop: Platform.OS === 'ios' ? 120 : 120,
              paddingHorizontal: 20,
            }}
          >

            <Text allowFontScaling={false} style={styles.mainlabel1}>
              {t('report_title')}{'*'}
            </Text>
            <View style={styles.login_container1}>

              <TextInput
                // cursorColor={inputCursorColor}
                // selectionColor={inputCursorColor}
                allowFontScaling={false}
                style={[styles.personalEmailID_TextInput1]}
                placeholder={t('enter_report_title')}
                placeholderTextColor="rgba(255, 255, 255, 0.48)"
                value={title}
                maxLength={50}
                cursorColor="#FFFFFF"
                selectionColor="#FFFFFF"
                onChangeText={text => {
                  settitle(text);
                }}
              />
            </View>

            <View style={styles.innercontainer}>
              <Text allowFontScaling={false} style={styles.mainlabel1}>
                {t('tell_us_more')}
              </Text>

              <View style={styles.login_container}>
                <TextInput
                // cursorColor='#FFFFFF'
                // selectionColor='#FFFFFF'
                  allowFontScaling={false}
                  style={[
                    styles.personalEmailID_TextInput,
                    { textAlignVertical: 'top', paddingTop: 10 },
                  ]}
                  placeholder={t('report_text')}
                  placeholderTextColor={'rgba(255, 255, 255, 0.48)'}
                  multiline={true}
                  value={desc}
                  onChangeText={de => setDesc(de)}
                  onSubmitEditing={Keyboard.dismiss}
                  cursorColor="#FFFFFF"
                  selectionColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <Button title={t('submit')} onPress={() => {
          handleSubmit()
        }} />


        <Modal
          visible={showPopup1}
          transparent
          animationType="fade"
          onRequestClose={closePopup2}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              navigation.replace('MyListing');
            }}
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
                  <Text allowFontScaling={false} style={styles.mainheader}>
                    {t('success_report')}
                  </Text>
                  <Text allowFontScaling={false} style={styles.subheader1}>
                    {t('report_submitted_success')}
                  </Text>
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => {
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
                      //navigation.goBack();
                    }}
                  >
                    <Text allowFontScaling={false} style={styles.loginText}>
                      {t('done')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <Loader />
        </View>
      )}

      <NewCustomToastContainer />
      {/* </BackgroundWrapper> */}
      </ImageBackground>
  );
};


const styles = StyleSheet.create({
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  mainheader: {
    color: 'rgba(255, 255, 255, 0.80)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  subheader1: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: -0.28,
    lineHeight: 19.6,
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

  innercontainer: {
    marginBottom: 8,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  mainlabel1: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },
  login_container1: {
    display: 'flex',
    width: '100%',
    height: 44,
    gap: (Platform.OS === 'ios' ? 10 : 10),
    alignSelf: 'stretch',
    borderRadius: 12,
    borderWidth: 0.6,
    borderColor: '#ffffff2c',
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',

  },

  login_container: {
    display: 'flex',
    width: '100%',
    minHeight: 160,
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
  personalEmailID_TextInput: {
    width: '98%',
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
    fontStyle: 'normal',
    color: '#fff',
    paddingLeft: 12,
    height: '100%',
  },
  personalEmailID_TextInput1: {
    width: '93%',
    //padding:12,
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
    fontStyle: 'normal',
    color: "#fff",

  },
 
  fullScreenContainer: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: (Platform.OS === 'ios' ? 60 : 40),
    width: Platform.OS === 'ios' ? '100%' : '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 11,
    alignSelf: 'center',
    pointerEvents: 'box-none',
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

export default ReportProduct;