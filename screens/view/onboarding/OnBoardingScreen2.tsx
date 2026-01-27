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
      {/* <Text allowFontScaling={false} style={styles.subtitle1}>
        {t('info_subtitle2')}
      </Text> */}


      <View style={{ width: '100%', alignItems: 'center', gap: 72,marginTop: 64 }}>

        <View style={{ width: '100%', alignItems: 'center' }}>
          
          <View style={{ }}>
          <Text
                allowFontScaling={false}
                style={{fontFamily: "Urbanist-Medium",
                fontWeight: '600',
                fontSize: 20,
                color: '#fff',
                textAlign: 'center' }}
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
          <Image
            source={require('../../../assets/images/s1_img3.png')}
            style={[styles.image1]}
            resizeMode="contain"
          />
        </View>
        <View style={{ width: '100%', alignItems: 'center' }}>
          
          <Text
              allowFontScaling={false}
                style={{fontFamily: "Urbanist-Medium",
                fontWeight: '600',
                fontSize: 20,
                color: '#fff',
                textAlign: 'center'}}
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
          <Image
            source={require('../../../assets/images/s2_img2.png')}
            style={ {
                width: '90%',
                height: 138,
                marginTop: 8
            }}
            resizeMode="contain"
          />
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
    marginTop: 8
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
