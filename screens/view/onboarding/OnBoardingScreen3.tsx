import { t } from 'i18next';
import { View, Text, Image, StyleSheet } from 'react-native';

const OnboardingScreen3 = () => {
  return (
    <View
      style={{
        flex: 1,
        height: '100%',
        width: '100%',
        paddingTop: 70,
        paddingHorizontal: 16,
      }}
    >
      <Text allowFontScaling={false} style={styles.title1}>
        {t('info_title3')}
      </Text>
      <Text allowFontScaling={false} style={{fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginTop:4,
        textAlign: 'center',}}>
        {t('info_subtitle3')}
      </Text>
      <View style={{ width: '100%', alignItems: 'center', gap: 72,marginTop: 40 }}>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <Image
            source={require('../../../assets/images/s3_img1.png')}
            style={[styles.image1, { marginTop: 0 }]}
            resizeMode="contain"
          />
          <View style={{ marginTop: -16 }}>
          <Text
                allowFontScaling={false}
                style={{fontFamily: "Urbanist-Medium",
                fontWeight: '600',
                fontSize: 20,
                color: '#fff',
                textAlign: 'center', marginTop: -10 }}
              >
              {t('info_content3')}
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
              {t('info_subcontent3')}
            </Text>
          </View>
        </View>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <Image
            source={require('../../../assets/images/s3_img2.png')}
            style={[styles.image, { marginTop: 15 }]}
            resizeMode="contain"
          />
          <Text
              allowFontScaling={false}
                style={{fontFamily: "Urbanist-Medium",
                fontWeight: '600',
                fontSize: 20,
                color: '#fff',
                textAlign: 'center', marginTop: 16 }}
            >
            {t('info_bottom_header3')}
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
            {t('info_bottom_subheader3')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default OnboardingScreen3;

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
    height: 160,
    marginTop:20,
  },
  title1: {
    fontFamily: 'Urbanist-Bold',
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
