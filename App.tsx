// import React from 'react';
// import { StatusBar } from 'react-native';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { Navigation } from './screens/view/Navigation';
// import { LogBox } from 'react-native';


// function App() {
//   LogBox.ignoreAllLogs();

//   return (
//     <SafeAreaProvider>
//       <StatusBar backgroundColor={'#000000'} />
//       <Navigation />
//     </SafeAreaProvider>
//   );
// }

// export default App;



// import React, { useEffect, useState } from 'react';
// import { View, StatusBar, StyleSheet } from 'react-native';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import LottieView from 'lottie-react-native';
// import { Navigation } from './screens/view/Navigation'; 
// import { LogBox } from 'react-native';

// function App() {
//   LogBox.ignoreAllLogs();

//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // simulate 3 second splash
//     const timer = setTimeout(() => {
//       setIsLoading(false);
//     }, 3000);
//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <SafeAreaProvider>
//       <StatusBar backgroundColor={'#000000'} />

//       {isLoading ? (
//         <View style={styles.container}>
//           <LottieView
//             source={require('./assets/animations/Animation.json')}
//             autoPlay
//             loop={false}   // play once
//             style={{ width: 360, height: 800 }}
//             onAnimationFinish={() => setIsLoading(false)}
//           />
//         </View>
//       ) : (
//         <Navigation />
//       )}
//     </SafeAreaProvider>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000', // splash background
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default App;






import React, { useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './screens/view/Navigation';
import SplashScreen from './screens/view/Hello/SplashScreen'; // ✅ import your splash

function App() {
  LogBox.ignoreAllLogs();

  const [showSplash, setShowSplash] = useState(true);

  return (
    <SafeAreaProvider>
     
     
      <Navigation /> 
    </SafeAreaProvider>
  );
}

export default App;
