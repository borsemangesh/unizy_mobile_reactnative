import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  Text,
  View,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Button,
  Linking,
  Alert,
} from 'react-native';
const bgImage = require('../../../assets/images/backimg.png');
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';
import { useTranslation } from 'react-i18next';
import { WebView } from 'react-native-webview';
import Loader from '../../utils/component/Loader';

import BACK_ICON from '../../../assets/images/backimg.png';

type HelpSupportProps = {
  navigation: any;
};

const HelpSupport = ({ navigation }: HelpSupportProps) => {
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

//   const openWhatsApp = () => {
//   const phoneNumber = '919876543210'; // Include country code, no + sign
//   const message = 'Hello, I want to connect!';

//   const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

//   Linking.openURL(url).catch(() => {
//     Alert.alert('Error', 'Make sure WhatsApp is installed');
//   });
// };

  return (
<ImageBackground
          source={BACK_ICON}
          style={{ flex: 1,width: '100%',
        height: '100%', }}
          resizeMode="cover"
        >
    {/* // <BackgroundWrapper> */}
      <View style={styles.fullScreenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() =>
                navigation.replace('Dashboard', {
                  AddScreenBackactiveTab: 'Profile',
                  isNavigate: false,
                })
              }
            >
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.unizyText}>
              {t('help_support')}
            </Text>
            <View style={{ width: 48 }} />
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <WebView
            source={{ uri: 'https://unizy.app/#about' }}
            style={{ flex: 1, backgroundColor: '#0C56C4' }}
            onLoadStart={() => setLoading(true)}
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
            onHttpError={() => setLoading(false)}
          />
        </View>
     
          {/* <Button title="Chat on WhatsApp" onPress={openWhatsApp} /> */}
     

        {loading && (
          <View style={styles.loaderOverlay}>
            <Loader />
          </View>
        )}
      </View>
      <NewCustomToastContainer />
      {/* // </BackgroundWrapper> */}
      </ImageBackground>
  );
};

export default HelpSupport;

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
    marginRight: 12,
  },
});
