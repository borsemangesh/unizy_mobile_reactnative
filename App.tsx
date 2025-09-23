import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Navigation } from './screens/view/Navigation';
import SplashScreen from './screens/view/Hello/SplashScreen';
import { enableScreens } from 'react-native-screens';
import Toast from 'react-native-toast-message';
import EdgeToEdgeScreen from './screens/view/Hello/EdgeToEdgeScreen';

function App() {
  LogBox.ignoreAllLogs();

  enableScreens();

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 0); // Show splash for 4.2s
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
  
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        {showSplash ? (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        ) : (
          <Navigation />
        )}
        <Toast />
      </View>
    </SafeAreaProvider>
  );
}

export default App;
