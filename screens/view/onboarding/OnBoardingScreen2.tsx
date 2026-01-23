import { t } from 'i18next';
import { View, Text, ImageBackground, Image, StyleSheet } from 'react-native';

const OnboardingScreen2 = () => {
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
        {t('info_title2')}
      </Text>
      <Text allowFontScaling={false} style={styles.subtitle1}>
        {t('info_subtitle2')}
      </Text>


      <View style={{ width: '100%', alignItems: 'center', gap: 84,marginTop: 4 }}>

        <View style={{ width: '100%', alignItems: 'center' }}>
          <Image
            source={require('../../../assets/images/s1_img3.png')}
            style={[styles.image1, { marginTop: 25 }]}
            resizeMode="contain"
          />
          <View style={{ marginTop: 25 }}>
          <Text
                allowFontScaling={false}
                style={{fontFamily: "Urbanist-Medium",
                fontWeight: '600',
                fontSize: 20,
                color: '#fff',
                textAlign: 'center', marginTop: -16 }}
              >
              {t('info_content2')}
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
              {t('info_subcontent2')}
            </Text>
          </View>
        </View>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <Image
            source={require('../../../assets/images/s2_img2.png')}
            style={ {
                width: '90%',
                height: 138,
            }}
            resizeMode="contain"
          />
          <Text
              allowFontScaling={false}
                style={{fontFamily: "Urbanist-Medium",
                fontWeight: '600',
                fontSize: 20,
                color: '#fff',
                textAlign: 'center' ,marginTop: 16}}
            >
            {t('info_bottom_header2')}
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
            {t('info_bottom_subheader2')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default OnboardingScreen2;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 70,
  },
  image: {
    width: '90%',
    height: 200,
  },
  image1: {
    width: '90%',
    height: 200,
    marginTop: 20,
  },
  title1: {
    fontFamily: 'Urbanist-Bold',
    fontWeight: '700',
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
  },
  subtitle1: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    textAlign: 'center',
  },
});
