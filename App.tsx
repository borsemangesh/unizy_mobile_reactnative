import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './screens/view/Navigation';
import SplashScreen from './screens/view/Hello/SplashScreen';
import { enableScreens } from 'react-native-screens';

function App() {
  LogBox.ignoreAllLogs();

  enableScreens(); 

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 4200); // Show splash for 4.2s
    return () => clearTimeout(timer);
  }, []);
  



  return (
  
    <SafeAreaProvider>
    <StatusBar backgroundColor={'#000000'} />
    {showSplash ? (
      <SplashScreen onFinish={() => setShowSplash(false)} />
    ) : (
      <Navigation />
    )}
  </SafeAreaProvider>
  );
}

export default App;
