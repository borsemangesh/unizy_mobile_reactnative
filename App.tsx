import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './screens/view/Navigation';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={'#000000'} />
      {/*<AppContent />*/}
      <Navigation />
    </SafeAreaProvider>
  );
}

export default App;
