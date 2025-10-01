	
		
		import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, LogBox, View, StyleSheet, Text, Animated, Easing } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Navigation } from './screens/view/Navigation';
import SplashScreen from './screens/view/Hello/SplashScreen';
import { enableScreens } from 'react-native-screens';
import Toast from 'react-native-toast-message';
import { BlurView } from '@react-native-community/blur';

function App() {
  LogBox.ignoreAllLogs();

  enableScreens();

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 4200); // Show splash for 4.2s
    return () => clearTimeout(timer);
  }, []);


const toastDuration = 2500;

const toastConfig = {
  customToast: ({ text1, props }: any) => {
    const textColor =
      props?.type === 'error'
        ? '#FF6666E0'
        : props?.type === 'success'
        ? 'rgba(34, 139, 34, 1)' // green
        : '#60BDFFE0'; // blue info

    // Animation ref
    const progress = useRef(new Animated.Value(1)).current; // start full width (1)

       useEffect(() => {
      progress.setValue(1);
      Animated.timing(progress, {
        toValue: 0,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }, [props.toastId]);

    // Interpolate width
    const progressWidth = progress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'], 
    });

    // return (
    //   <View style={styles.toastContainer}>
    //     <Text style={[styles.toastText, { color: textColor }]}>{text1}</Text>
    //     <View style={styles.progressBarContainer}>
    //       <Animated.View
    //         style={[
    //           styles.progressBar,
    //           {
    //             backgroundColor: textColor,
    //             width: progressWidth,
    //             left: 0, // start from right end
    //           },
    //         ]}
    //       />
    //     </View>
    //   </View>
    // );
    return (
  <View style={{ marginBottom: 20, alignSelf: 'center', borderRadius: 16, overflow: 'hidden' }}>
    <BlurView
      style={styles.toastContainer}
      blurType="light" // or 'dark'
      blurAmount={20} // adjust as needed
      overlayColor="rgba(0,0,0,0.3)" // black fill with 30% opacity
    >
      <Text style={[styles.toastText, { color: textColor }]}>{text1}</Text>
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: textColor,
              width: progressWidth,
              left: 0,
            },
          ]}
        />
      </View>
    </BlurView>
  </View>
);
  },
};

const styles = StyleSheet.create({
  toastContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    //borderRadius: 16,
   // marginBottom: 20,
    //alignSelf: 'center',
    //backgroundColor: '#2c2a2aff',
    width: 'auto',
    //overflow: 'hidden',
  },
  toastText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    //marginBottom: 6, 
    alignSelf:'center',
     fontFamily: 'Urbanist-SemiBold'
  },
   progressBarContainer: {
    height: 4,
    width: '100%', // fill full width of toast
    backgroundColor: 'transparent',
    position: 'absolute', // position at bottom
    bottom: 0, // stick to bottom
    left: 0,
  },
  progressBar: {
    height: '100%',
    borderRadius: 1,
    position: 'absolute',
    left: 0,
  },
});
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      {showSplash ? (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        ) : ( 
          <Navigation />
       )} 
       <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}

export default App;
