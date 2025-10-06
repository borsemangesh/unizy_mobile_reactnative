import React, { useEffect, useState } from "react";
import { LogBox, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Navigation } from "./screens/view/Navigation";
import { enableScreens } from "react-native-screens";
import Toast from "react-native-toast-message";
// import CustomToast from "./screens/view/authentication/CustomToast";

function App() {
  LogBox.ignoreAllLogs();
  enableScreens();

  return (
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
  );
}

export default App;


