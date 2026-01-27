import { t } from 'i18next';
import { View, Text, Image, StyleSheet } from 'react-native';

const OnboardingScreen4 = () => {
  return (
    <View
      style={{
        flex: 1,
        height: '100%',
        width: '100%',
        paddingTop: 70,
        paddingHorizontal: 14,
      }}
    >
      <Text allowFontScaling={false} style={styles.title1}>
        {t('info_title4')}
      </Text>
      {/* <Text allowFontScaling={false} style={{fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginTop:4,
        textAlign: 'center',}}>
        {t('info_subtitle4')}
      </Text> */}
      <View
        style={{ width: '100%', alignItems: 'center', gap: 112, marginTop: 64 }}
      >
        <View style={{ width: '100%', alignItems: 'center' }}>
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Urbanist-Medium',
                fontWeight: '600',
                fontSize: 20,
                color: '#fff',
                textAlign: 'center',
              }}
            >
              {t('info_content4')}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.7)',
                marginTop: 4,
                textAlign: 'center',
              }}
            >
              {t('info_subcontent4')}
            </Text>
          </View>
          <Image
            source={require('../../../assets/images/s4_img1.png')}
            style={[styles.image1, {marginTop: 8}]}
            resizeMode="contain"
          />
        </View>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: 'Urbanist-Medium',
              fontWeight: '600',
              fontSize: 20,
              color: '#fff',
              textAlign: 'center',
            }}
          >
            {t('info_bottom_header4')}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.7)',
              marginTop: 4,
              textAlign: 'center',
            }}
          >
            {t('info_bottom_subheader4')}
          </Text>

          <Image
            source={require('../../../assets/images/s4_img2.png')}
            style={[styles.image, { marginTop: 8 }]}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
};

export default OnboardingScreen4;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 70,
  },
  image: {
    width: '90%',
    height: 160,
  },
  image1: {
    width: '90%',
    height: 117,
  },
  title1: {
    fontFamily: "Urbanist-Bold",
    fontWeight: '700',
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
  },
  subtitle1: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 10,
    textAlign: 'center',
  },
});
