// import React, { useEffect, useState } from "react";
// import { LogBox, StatusBar } from "react-native";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import { Navigation } from "./screens/view/Navigation";
// import { enableScreens } from "react-native-screens";
// import Toast from "react-native-toast-message";
// // import CustomToast from "./screens/view/authentication/CustomToast";

// function App() {
//   LogBox.ignoreAllLogs();
//   enableScreens();

//   return (
//     <SafeAreaProvider>
//       <StatusBar
//         barStyle="light-content"
//         translucent
//         backgroundColor="transparent"
//       />
//       <Navigation />
//       {/* ✅ Single Toast Component */}
//       {/* <Toast
//         config={{
//           customToast: (props) => <CustomToast {...props} />,
//         }}
//         position="bottom"
//         bottomOffset={80}
//       /> */}
//     </SafeAreaProvider>
//   );
// }

// export default App;


import React, { useEffect } from "react";
import { LogBox, StatusBar, View, StyleSheet, ImageBackground } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Navigation } from "./screens/view/Navigation";
import { enableScreens } from "react-native-screens";
import Toast from "react-native-toast-message";
// import CustomToast from "./screens/view/authentication/CustomToast";
import { StripeProvider } from '@stripe/stripe-react-native';
import { Constant } from "./screens/utils/Constant";


function App() {
  LogBox.ignoreAllLogs();
  enableScreens();

  return (
    <StripeProvider publishableKey={Constant.PUBLIC_KEY}>
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <Navigation />
      {/* ✅ Single Toast Component */}
      {/* <Toast
        config={{
          customToast: (props) => <CustomToast {...props} />,
        }}
        position="bottom"
        bottomOffset={80}
      /> */}
    </SafeAreaProvider>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000069", // 🔹 Change this to your app's initial background color
  },
});

export default App;