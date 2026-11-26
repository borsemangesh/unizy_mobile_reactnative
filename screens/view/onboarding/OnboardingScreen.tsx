import React, { useRef, useState } from 'react';
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import Pagination from './Pagination';
import { OnboardingData } from './OnboardingData';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type OnBoardingProps = {
  navigation: any;
};

const OnboardingScreen = ({ navigation }: OnBoardingProps) => {
  const [index, setIndex] = useState(0);
  const ref = useRef<FlatList>(null);
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

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

  const isLast = index === OnboardingData.length - 1;

  return (
    <ImageBackground
      source={require('../../../assets/images/backimg.png')}
      style={{ width: '100%', height: '100%' }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <FlatList
          ref={ref}
          data={OnboardingData}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          style={{ flex: 1 }}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e => {
            const newIndex = Math.round(
              e.nativeEvent.contentOffset.x / width,
            );
            setIndex(newIndex);
          }}
          getItemLayout={(_, i) => ({
            length: width,
            offset: width * i,
            index: i,
          })}
          renderItem={({ item }) => {
            const ScreenComponent = item.component;
            return (
              <ScrollView
                style={{ width }}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 12 }}
                showsVerticalScrollIndicator={false}
              >
                <ScreenComponent />
              </ScrollView>
            );
          }}
        />

        <View
          style={[
            styles.footer,
            {
              paddingBottom: Math.max(insets.bottom, 8) + 8,
            },
          ]}
        >
          <Pagination data={OnboardingData} index={index} />

          <View style={styles.bottomRow}>
            {isLast ? (
              <TouchableOpacity
                style={styles.finishbutton}
                onPress={handleNext}
              >
                <Text allowFontScaling={false} style={styles.buttonText}>
                  {t('info_finish')}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.buttonskip}
                  onPress={handleSkip}
                >
                  <Text allowFontScaling={false} style={styles.skip}>
                    {t('info_skip')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                  <Text allowFontScaling={false} style={styles.buttonText}>
                    {t('info_next')}
                  </Text>
                  <Image
                    source={require('../../../assets/images/arrowrightsm1.png')}
                    style={{ width: 24, height: 24, marginLeft: 8 }}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
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
  footer: {
    width: '100%',
    paddingTop: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '100%',
  },
  skip: {
    color: '#FFFFFF',
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
    flexShrink: 0,
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
    color: '#002050',
  },
});
