import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WebView from "react-native-webview";
import Loader from "../../../utils/component/Loader";
import { NewCustomToastContainer } from "../../../utils/component/NewCustomToastManager";

const bgImage = require('../../../../assets/images/backimg.png');

type PrivacyAndPolycyProps = {
    navigation: any;
  };

const PrivacyAndPolicy = ({ navigation }: PrivacyAndPolycyProps) => {
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    return (
      <ImageBackground source={bgImage} style={styles.background}>
        <View style={styles.fullScreenContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                 onPress={() =>{
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'SinglePage', params: { termandProlicy: true,forgotPassword: true, resetToLogin: false, currentScreen: 'login', currentScreenIninner: 'login' } }],
                    });          
                    }                     
                }
              >
                <View style={styles.backIconRow}>
                  <Image
                    source={require('../../../../assets/images/back.png')}
                    style={{ height: 24, width: 24 }}
                  />
                </View>
              </TouchableOpacity>
              <Text allowFontScaling={false} style={styles.unizyText}>
                {t('privacy_policy')}
              </Text>
              <View style={{ width: 48 }} />
            </View>
          </View>
  
          <View style={{ flex: 1 }}>
            <WebView
              source={{ uri: 'https://unizy.app/privacy-policy/' }}
              style={{ flex: 1, backgroundColor: '#0C56C4' }}
              onLoadStart={() => setLoading(true)}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
              onHttpError={() => setLoading(false)}
            />
          </View>
  
          {loading && (
            <View style={styles.loaderOverlay}>
              <Loader />
            </View>
          )}
        </View>
        <NewCustomToastContainer />
      </ImageBackground>
    );
  };
  

  
  const styles = StyleSheet.create({
    loaderOverlay: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 100 : 90, // below header
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
  
    background: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    fullScreenContainer: {
      flex: 1,
      marginTop: 10,
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
    },
  });
  

export default PrivacyAndPolicy;