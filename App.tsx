import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './screens/view/Navigation';
import SplashScreen from './screens/view/Hello/SplashScreen';

function App() {
  LogBox.ignoreAllLogs();

  const [showSplash, setShowSplash] = useState(true);
   useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000); // show splash for at least 2 seconds
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
