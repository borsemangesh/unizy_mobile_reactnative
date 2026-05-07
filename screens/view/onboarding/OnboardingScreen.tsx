import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView
} from 'react-native';
import Pagination from './Pagination';
import { OnboardingData } from './OnboardingData';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width } = Dimensions.get('window');

type OnBoardingProps = {
  navigation: any;
};

const OnboardingScreen = ({ navigation }: OnBoardingProps) => {
  const [index, setIndex] = useState(0);
  const ref = useRef<FlatList>(null);
  const { t } = useTranslation();
  const handleNext = async () => {
    if (index < OnboardingData.length - 1) {
      ref.current?.scrollToOffset({
        offset: (index + 1) * width,
        animated: true,
      });
    } else {
      await AsyncStorage.setItem('ISONBOARDING', 'true');
      navigation.replace('Dashboard', {
        AddScreenBackactiveTab: 'Home',
        isNavigate: true,
      });
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('ISONBOARDING', 'true');

    navigation.replace('Dashboard', {
      AddScreenBackactiveTab: 'Home',
      isNavigate: true,
    });
  };

  const isFirst = index === 0;
  const isLast = index === OnboardingData.length - 1;

  return (
    <ImageBackground
      source={require('../../../assets/images/backimg.png')}
      style={{ width: '100%', height: '100%' }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
      

<FlatList
  ref={ref}
  data={OnboardingData}
  keyExtractor={(item) => item.id}
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  onMomentumScrollEnd={(e) => {
    const newIndex = Math.round(
      e.nativeEvent.contentOffset.x / width
    );
    setIndex(newIndex);
  }}
  renderItem={({ item }) => {
    const ScreenComponent = item.component;
    return (
      <View style={{ width }}>
        <ScreenComponent />
      </View>
    );
  }}
/>
       

      </ScrollView>
        <Pagination data={OnboardingData} index={index} />

        <View style={styles.bottomRow}>
          {isLast ? (
            <>
              <TouchableOpacity
                style={styles.finishbutton}
                onPress={handleNext}
              >
                <Text allowFontScaling = {false} style={styles.buttonText}>{t('info_finish')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {!isLast && (
                <TouchableOpacity
                  style={styles.buttonskip}
                  onPress={handleSkip}
                >
                  <Text allowFontScaling = {false} style={styles.skip}>{t('info_skip')}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text allowFontScaling = {false} style={styles.buttonText}>
                  {isLast ? t('info_finish') : t('info_next')}
                </Text>

                {!isLast && (
                  <Image
                    source={require('../../../assets/images/arrowrightsm1.png')}
                    style={{ width: 24, height: 24, marginLeft: 8 }}
                  />
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ImageBackground>
  );
};
export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
    bottom: 30,
  },
  skip: {
    color: '#FFFFFF',
    // opacity: 0.7,
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
    letterSpacing: 1,
    fontWeight: '600',
  },
  button: {
    backgroundColor: ' rgba(255, 255, 255, 0.56)',
    paddingVertical: 12,
    borderRadius: 25,
    width: '50%',
    textAlign: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  finishbutton: {
    backgroundColor: ' rgba(255, 255, 255, 0.56)',
    paddingVertical: 12,
    borderRadius: 25,
    width: '100%',
    textAlign: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  buttonskip: {
    paddingVertical: 12,
    borderRadius: 25,
    width: '50%',
    textAlign: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    letterSpacing: 1,
    color:"#002050"
  },
});
