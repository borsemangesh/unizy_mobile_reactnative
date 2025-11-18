
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
  const insets = useSafeAreaInsets(); // Safe area insets
  const { height: screenHeight } = Dimensions.get('window');
    


useEffect(() => {
  setPage(1);
  displayListOfProduct(1);
}, []);


const displayListOfProduct = async (pageNum: number) => {
  try {
    const pagesize = 10;
    let url = `${MAIN_URL.baseUrl}user/mynotification?page=${pageNum}&pagesize=${pagesize}`;
    
    const token = await AsyncStorage.getItem('userToken'); 
    if (!token) return;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const jsonResponse = await response.json();
    // console.log('API Response:', jsonResponse);

   if (jsonResponse.statusCode === 200) {
      setIsLoading(false);

      const newData = jsonResponse?.data?.notifications ?? [];

      console.log("newData.........",newData);
      console.log("token.........",token);
      console.log("url---------",url);
        

      if (pageNum === 1) {
        setNotificationList(newData);
      } else {
        setNotificationList(prev => [...prev, ...newData]);
      }
    } 
    else if(jsonResponse.statusCode === 401 || jsonResponse.statusCode === 403){
          setIsLoading(false);
          navigation.reset({
          index: 0,
          routes: [{ name: 'SinglePage', params: { resetToLogin: true } }],
        });
        }
    
    else {
      setIsLoading(false);
      // console.log('API Error:', jsonResponse.message);
    }
  } catch (err) {
    setIsLoading(false);
    console.log('Error:', err);
  }
};

  const filteredNotifications: NotificationItem[] = notificationList.filter((item) =>
  (item.title ?? '').toLowerCase().includes(search.toLowerCase())
);

// const formatDate = (dateString: string) => {
//   const date = new Date(dateString);
//   const day = date.getDate();
//   const month = date.toLocaleString('default', { month: 'long' });
//   const year = date.getFullYear();

//   let suffix = 'th';
//   if (day % 10 === 1 && day % 100 !== 11) suffix = 'st';
//   else if (day % 10 === 2 && day % 100 !== 12) suffix = 'nd';
//   else if (day % 10 === 3 && day % 100 !== 13) suffix = 'rd';

//   return `${day}${suffix} ${month} ${year}`;
// };


const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' }); // <-- changed
  const year = date.getFullYear();

  let suffix = 'th';
  if (day % 10 === 1 && day % 100 !== 11) suffix = 'st';
  else if (day % 10 === 2 && day % 100 !== 12) suffix = 'nd';
  else if (day % 10 === 3 && day % 100 !== 13) suffix = 'rd';

  return `${day}${suffix} ${month} ${year}`;
};
const groupByDate = (data: NotificationItem[]) => {
  const grouped: any[] = [];
  let lastDate: string | null = null;

  data.forEach((item) => {
    const displayDate = formatDate(item.created_at);

    if (displayDate !== lastDate) {
      grouped.push({
        type: 'date',
        id: `date-${displayDate}`,
        displayDate,
      });
      lastDate = displayDate;
    }

    grouped.push({
      ...item,
      type: 'item'
    });
  });

  return grouped;
};

const groupedList = groupByDate(filteredNotifications);


const renderItem = ({ item ,index  }: { item: any ;index: number }) => {
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


  console.log("parts...",formattedParts);
  
// };


  const productImage = require('../../../assets/images/bellicon.png');

  // Get template name for navigation
  const templateName = item.template?.name || '';
  const featureId = item.metadata?.feature_id || item.metadata?.id || 0;
  const featureTitle = item.metadata?.feature_title || item.metadata?.title || 'Product';

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
      />
    </View>
  );
};

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>

        {/* <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        /> */}
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


        {/* Header */}
        <View style={styles.header} pointerEvents="box-none">
          <View style={styles.headerRow}>
            <TouchableOpacity 
              onPress={() => navigation.replace('Dashboard',{AddScreenBackactiveTab: 'Profile',isNavigate: false})}
              style={styles.backButtonContainer}
            >
              <Animated.View
                style={[styles.blurButtonWrapper, animatedButtonStyle]}
              >
                {/* Static background (visible when scrollY = 0) */}
                <Animated.View
                  style={[StyleSheet.absoluteFill, animatedStaticBackgroundStyle]}
                />

                {/* Blur view fades in as scroll increases */}
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

                {/* Back Icon */}
                <Animated.Image
                  source={require('../../../assets/images/back.png')}
                  style={[{ height: 24, width: 24 }, animatedIconStyle]}
                />
              </Animated.View>
            </TouchableOpacity>
            
            <Text allowFontScaling={false} style={styles.unizyText}>
              Notifications
            </Text>
            
            {/* Spacer to balance the back button and keep title centered */}
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <View>
   
       
    <Animated.FlatList
    onScroll={scrollHandler}
            scrollEventThrottle={16}
            data={groupedList}
            renderItem={renderItem}
            contentContainerStyle={[
                 styles.listContainer,
                   {                   
                   paddingBottom: (Platform.OS === 'ios' ? 30:screenHeight * 0.150 + insets.bottom), 
                    paddingTop: Platform.OS === 'ios' ? 120 : 130,
                    },
                ]}
            keyExtractor={(item, index) => `${item.type}-${index}`}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              displayListOfProduct(nextPage);
            }}
            ListFooterComponent={
              isLoadingMore ? (
                <ActivityIndicator size="small" color="#fff" style={{ marginVertical: 10 }} />
              ) : null
            }
            ListEmptyComponent={
              !isLoading ? (
                <Text allowFontScaling={false} style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
                  No Notification found
                </Text>
              ) : null
            }
          />

        </View>
      </View>
      <NewCustomToastContainer/>
    </ImageBackground>
  );
};

export default Notification;

const styles = StyleSheet.create({

    backButtonContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

dateHeading:{
    color:'#fff',
    fontSize:12,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight:500,
    marginLeft:6,
    marginBottom:8
    },

  background: { 
    flex: 1,
     width: '100%',
      height: '100%' },
  fullScreenContainer: {
     flex: 1,
    //  marginTop: 10
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
    marginLeft: 10,
    marginRight: 10,
    paddingTop: 10,
    marginTop:14
    // paddingBottom:80,
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
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? '5%' : 40,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'center',
    zIndex: 11,
    pointerEvents: 'box-none',
  
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: 48,
    height: 48,
  },
});