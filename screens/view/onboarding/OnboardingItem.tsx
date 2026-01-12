import { useTranslation } from "react-i18next";
import { Dimensions, View, Image, Text, StyleSheet } from "react-native";

const { width } = Dimensions.get('window');

const OnboardingItem = ({ item }: any) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      

      <Text allowFontScaling = {false} style={styles.title}>{t(item.s1header)}</Text>
      <Text allowFontScaling = {false} style={styles.subtitle}>{t(item.s1text1)}</Text>
      <Image source={item.image1} style={styles.image} resizeMode="contain" />
      <Text allowFontScaling = {false} style={styles.title}>{t(item.s1header2)}</Text>
      <Text allowFontScaling = {false} style={styles.subtitle}>{t(item.s1text2)}</Text>
      <Image source={item.image2} style={[styles.image,{marginTop: 15}]} resizeMode="contain" />
      <Text allowFontScaling = {false} style={[styles.title,{marginTop: 10}]}>{t(item.s1header3)}</Text>
      <Text allowFontScaling = {false} style={styles.subtitle}>{t(item.s1text3)}</Text>
    </View>
  );
};

export default OnboardingItem;

const styles = StyleSheet.create({
  container: {
    width,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 70
  },
  image: {
    width: '90%',
    height: 200,
    // marginBottom: 30,
  },
  title: {
    fontFamily: "Urbanist-Bold",
    fontWeight: '700',
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 10,
    textAlign: 'center',

//     font-family: Urbanist;
// font-weight: 500;
// font-style: Medium;
// font-size: 14px;
// leading-trim: NONE;
// line-height: 140%;
// letter-spacing: 0%;
// text-align: center;

  },
});