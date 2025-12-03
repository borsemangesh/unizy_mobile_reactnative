

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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const bgImage = require('../../../assets/images/backimg.png');
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';
import { useTranslation } from 'react-i18next';
import { WebView } from 'react-native-webview';
import Loader from '../../utils/component/Loader';

type HelpSupportProps = {
  navigation: any;
};


const HelpSupport = ({ navigation }: HelpSupportProps) => {
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.replace('Dashboard', { AddScreenBackactiveTab: 'Profile', isNavigate: false })}>
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.unizyText}>{t('help_support')}</Text>
            <View style={{ width: 48 }} />
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <WebView
            source={{ uri: 'https://unizy.app/#about' }}
            style={{ flex: 1 }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
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

export default HelpSupport;

const styles = StyleSheet.create({


  loaderOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 90,   // below header
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
    height: '100%'
  },
  fullScreenContainer: {
    flex: 1,
    marginTop: 10
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