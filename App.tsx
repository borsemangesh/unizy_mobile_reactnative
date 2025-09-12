import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './screens/view/Navigation';
import SplashScreen from './screens/view/Hello/SplashScreen';
//import Toast from 'react-native-toast-message';


function App() {
  //LogBox.ignoreAllLogs();
  LogBox.ignoreAllLogs(true);


  const [showSplash, setShowSplash] = useState(true);

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={'#000000'} />
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} /> 
      ) : (
        <Navigation /> 
        
      )}
       {/* <Toast /> */}
    </SafeAreaProvider>
  );
}

export default App;
