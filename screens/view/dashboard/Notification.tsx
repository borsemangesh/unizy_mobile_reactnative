

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
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
const bgImage = require('../../../assets/images/backimg.png');
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';
import NotificationCard from '../../utils/NotificationCard';
import { MAIN_URL } from '../../utils/APIConstant';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import MaskedView from '@react-native-masked-view/masked-view';
import Loader from '../../utils/component/Loader';
import { useTranslation } from 'react-i18next';
import i18n from '../../../localization/i18n';


type NotificationProps = {
  navigation: any;
};

type NotificationItem = {
  id: number;
  user_id: number;
  template_id: number;
  title: string;
  content: string;
  created_at: string;
  metadata: {
    title: string;
    feature_id: number;
  };
  template: {
    id: number;
    name: string;
  };
};

const Notification = ({ navigation }: NotificationProps) => {
  // Animated hooks must be inside the component
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedBlurStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(scrollY.value, [0, 300], [0, 1], 'clamp');
    return { opacity };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    'worklet';
    const borderColor = interpolateColor(
      scrollY.value,
      [0, 300],
      ['rgba(255, 255, 255, 0.56)', 'rgba(255, 255, 255, 0.56)'],
    );
    const redOpacity = interpolate(scrollY.value, [0, 300], [0, 0.15], 'clamp');
    return {
      borderColor,
      backgroundColor: `rgba(255, 255, 255, ${redOpacity})`,
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(scrollY.value, [0, 300], [0.8, 1], 'clamp');
    const tintColor = interpolateColor(
      scrollY.value,
      [0, 150],
      ['#FFFFFF', '#002050'],
    );
    return {
      opacity,
      tintColor,
    };
  });

  const blurAmount = useDerivedValue(() => {
    'worklet';
    return interpolate(scrollY.value, [0, 300], [0, 10], 'clamp');
  });

  const animatedStaticBackgroundStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 30],
        [1, 0],
        'clamp',
      ),
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 40,
    };
  });

  const animatedBlurViewStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 50],
        [0, 1],
        'clamp',
      ),
    };
  });

  const [notificationList, setNotificationList] = useState<NotificationItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pagesize = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const insets = useSafeAreaInsets(); // Safe area insets
  const { height: screenHeight } = Dimensions.get('window');
  const isEmpty = notificationList.length === 0;


  useEffect(() => {
    setPage(1);
    displayListOfProduct(1, true);
  }, []);


  const displayListOfProduct = async (pageNum: number, isInitialLoad: boolean = false) => {
    let start = Date.now();
    if (isLoading || !initialLoading) return;
    if (isLoading || !initialLoading) return;
    try {

      const pagesize = 10;
      let url = `${MAIN_URL.baseUrl}user/mynotification?page=${pageNum}&pagesize=${pagesize}`;



      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        if (isInitialLoad) {
          await new Promise(r => setTimeout(r, 1000));
          setInitialLoading(false);
        }
        return;
      }
      const language_code = await AsyncStorage.getItem('selectedLanguage') || 'es'


      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          languagecode: language_code
        },
      });

      const jsonResponse = await response.json();
      // console.log('API Response:', jsonResponse);

      if (jsonResponse.statusCode === 200) {
        const newData = jsonResponse?.data?.notifications ?? [];




        if (pageNum === 1) {
          setNotificationList(newData);
        } else {
          setNotificationList(prev => [...prev, ...newData]);
        }
      }
      else if (jsonResponse.statusCode === 401 || jsonResponse.statusCode === 403) {
        if (isInitialLoad) {
          await new Promise(r => setTimeout(r, 1000));
          setInitialLoading(false);
        } else {
          setIsLoading(false);
        }
        navigation.reset({
          index: 0,
          routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
        });
      }

      else {
        if (isInitialLoad) {
          await new Promise(r => setTimeout(r, 1000));
          setInitialLoading(false);
        } else {
          setIsLoading(false);
        }
      }
    } catch (err) {

      if (isInitialLoad) {
        await new Promise(r => setTimeout(r, 1000));
        setInitialLoading(false);
      } else {
        setIsLoading(false);
      }
    } finally {
      if (isInitialLoad) {
        let elapsed = Date.now() - start;
        let remaining = Math.max(0, 1000 - elapsed);
        await new Promise(r => setTimeout(r, remaining));
        setInitialLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const filteredNotifications: NotificationItem[] = notificationList.filter((item) =>
    (item.title ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const { t } = useTranslation();


  const formatDate = (dateString: string, t?: any) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = date.getDate();
  const year = date.getFullYear();
  const lang = i18n.language; // detect active language

  // English ordinal suffix
  let suffix = "";
  if (lang === "en") {
    if (day % 10 === 1 && day !== 11) suffix = "st";
    else if (day % 10 === 2 && day !== 12) suffix = "nd";
    else if (day % 10 === 3 && day !== 13) suffix = "rd";
    else suffix = "th";
  }

  // Month translation
  const monthIndex = date.getMonth();
  const monthKeys = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec"
  ];

  const monthShort = t ? t(monthKeys[monthIndex]) : monthKeys[monthIndex];

  return `${day}${suffix} ${monthShort} ${year}`;
};

  const groupByDate = (data: NotificationItem[], t: any) => {
  const grouped: any[] = [];
  let lastDate: string | null = null;

  data.forEach((item) => {
    const displayDate = formatDate(item.created_at, t);

    if (displayDate !== lastDate) {
      grouped.push({
        type: "date",
        id: `date-${displayDate}`,
        displayDate,
      });
      lastDate = displayDate;
    }

    grouped.push({
      ...item,
      type: "item",
    });
  });

  return grouped;
};

  const groupedList = groupByDate(filteredNotifications,t);


  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (item.type === 'date') {
      return (
        <Text
          allowFontScaling={false}
          style={[styles.dateHeading, index === 0 ? null : { marginTop: 16 }]} // add marginTop here
        >
          {item.displayDate}
        </Text>
      )
    }


    const parts = item.content.split(/\*\*([^*]+)\*\*/g);

    const formattedParts = parts.map((part: string, index: number) => {
      const isBold = index % 2 === 1;
      return { text: part, bold: isBold };
    });



    const productImage = require('../../../assets/images/bellicon.png');

    // const templateName = item.template?.name || '';
    // const featureId = item.metadata?.feature_id || item.metadata?.id || 0;
    // const featureTitle = item.metadata?.category.name || item.metadata?.category.name || 'Product';
    // const category_id = item.metadata?.category.id || item.metadata?.category.id || 0;

    const templateName = item?.template?.name ?? '';

    const featureId = item?.metadata?.feature_id ?? item?.metadata?.id ?? 0;

    const featureTitle = item?.metadata?.category?.name ?? 'Product';

    const category_id = item?.metadata?.category?.id ?? 0;


    return (
      <View style={styles.itemContainer}>
        <NotificationCard
          infoTitle={item.title}
          productImage={productImage}
          reviewText={formattedParts}
          navigation={navigation}
          typeid={featureId}
          typename={featureTitle}
          templateName={templateName}
          categoryid={category_id}
        />
      </View>
    );
  };

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        {initialLoading && notificationList.length === 0 && (
          <Loader
            containerStyle={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: Platform.OS === 'ios' ? 0 : 0,
              zIndex: 1000,
              elevation: Platform.OS === 'android' ? 100 : 0,
              pointerEvents: 'none',
            }}
          />
        )}

        <Animated.View
          style={[styles.headerWrapper, animatedBlurStyle]}
          pointerEvents="none"
        >

          <MaskedView
            style={StyleSheet.absoluteFill}
            maskElement={
              <LinearGradient
                colors={['rgba(0,0,0,1)', 'rgba(0,0,0,0)']}
                locations={[0, 0.8]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            }
          >

            <BlurView
              style={StyleSheet.absoluteFill}
              blurType={Platform.OS === 'ios' ? 'prominent' : 'light'}
              blurAmount={Platform.OS === 'ios' ? 45 : 45}
              // overlayColor="rgba(255,255,255,0.05)"
              reducedTransparencyFallbackColor="rgba(255,255,255,0.05)"
            />

            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.45)',
                'rgba(255, 255, 255, 0.02)',
                'rgba(255, 255, 255, 0.02)',
              ]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />


          </MaskedView>

        </Animated.View>

        <View style={styles.header} pointerEvents="box-none">
          <View style={styles.headerRow}>
            <TouchableOpacity 
              onPress={() => {
                if(Platform.OS === 'ios'){
                  navigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'Dashboard',
                        params: {
                          AddScreenBackactiveTab: 'Profile',
                          isNavigate: false,
                        }
                      }
                    ],
                  });
                  
                } else {
                  navigation.replace('Dashboard',{AddScreenBackactiveTab: 'Profile',isNavigate: false})
                }
                // 
                
              }}
            >
              <Animated.View
                style={[styles.blurButtonWrapper, animatedButtonStyle]}
              >
                <Animated.View
                  style={[StyleSheet.absoluteFill, animatedStaticBackgroundStyle]}
                />
                <Animated.View
                  style={[StyleSheet.absoluteFill, animatedBlurViewStyle]}
                >
                  <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType="light"
                    blurAmount={10}
                    reducedTransparencyFallbackColor="transparent"
                  />
                </Animated.View>
                <Animated.Image
                  source={require('../../../assets/images/back.png')}
                  style={[{ height: 24, width: 24 }, animatedIconStyle]}
                />
              </Animated.View>
            </TouchableOpacity>

            <Text allowFontScaling={false} style={styles.unizyText}>
              {t('notifications')}
            </Text>

            <View style={styles.headerSpacer} />
          </View>
        </View>


        <Animated.FlatList
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          data={groupedList}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            const nextPage = page + 1;
            setPage(nextPage);
            displayListOfProduct(nextPage);
          }}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Loader
                  containerStyle={{
                    width: 50,
                    height: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                />
              </View>
            ) : null
          }
          contentContainerStyle={[
            styles.listContainer,
            {
              paddingTop: (Platform.OS === 'ios'? 120 : 100),
              paddingBottom: isEmpty
                ? 10                      
                : Platform.select({
                  ios: screenHeight * 0.01,   // ⬅ apply padding when list has data
                  android: screenHeight * 0.04,
                }),
              flexGrow: 1,
            },
          ]}
          ListEmptyComponent={
            !initialLoading && !isLoading ? (
              <View style={[styles.emptyWrapper]}>
                <View style={styles.emptyContainer}>
                  <Image
                    source={require('../../../assets/images/noproduct.png')}
                    style={styles.emptyImage}
                    resizeMode="contain"
                  />
                  <Text allowFontScaling={false} style={styles.emptyText}>
                   {t('no_notification_found')}
                  </Text>
                </View>
              </View>
            ) : null
          }
        />
      </View>
      <NewCustomToastContainer />
    </ImageBackground>
  );
};

export default Notification;

const styles = StyleSheet.create({
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: Platform.OS === 'ios' ? 400 : 300,
    paddingVertical: 40,
  },
  loaderContainer: {
    width: 100,
    height: 100,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    // marginTop: 16,
    // paddingHorizontal: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height:680,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  emptyImage: {
    width: 50,
    height: 50,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 600
  },

  backButtonContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dateHeading: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: 500,
    marginLeft: 6,
    marginBottom: 8
  },

  background: {
    flex: 1,
    //  width: '100%',
    //   height: '100%' 
    },
  fullScreenContainer: {
    flex: 1,
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
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },
  search_container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 16,
    borderRadius: 40,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
  },

  listContainer: {
    marginLeft: (Platform.OS === 'ios' ? 15 : 10),
    marginRight: (Platform.OS === 'ios' ? 15 : 10),
    paddingTop: 10,
    marginTop: 14
  },

  itemContainer: {
    flex: 1,
    marginHorizontal: 4,
  },

  headerWrapper: {
    position: 'absolute',
    top: 0,
    width: Platform.OS === 'ios' ? '100%' : '100%',
    height: Platform.OS === 'ios' ? 180 : 180,
    zIndex: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    pointerEvents: 'none',
  },

  blurButtonWrapper: {
    width: 48,
    height: 48,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 0.4,
    // borderColor: '#ffffff2c',
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',



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

  header: {
    // position: 'absolute',
    width: Platform.OS === 'ios' ? '100%' : '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11,
    alignSelf: 'center',
    pointerEvents: 'box-none',
  

  },
  headerRow: {
    position: 'absolute',
    top: (Platform.OS === 'ios' ? 60 : 40),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 11,
    alignSelf: 'center',
    pointerEvents: 'box-none',
    justifyContent: 'space-between',
 
  },
  headerSpacer: {
    width: 48,
    height: 48,
  },
});