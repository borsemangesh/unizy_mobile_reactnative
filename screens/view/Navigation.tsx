
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from "@react-navigation/native";
import  HelloScreen  from './Hello/HelloScreen';
import  LoginScreen  from './Login/LoginScreen'
import SelectLanguage_Popup from "./SelectLanguage/SelectLanguage_Popup";
import ResetPassword from './Login/ResetPassword';
import ResendPopup from './Login/ResendPopup';
import SignupScreen from './Login/SignupScreen';
import RevarifyStudentStatus from './revarify/RevarifyStudentStatus';
import DashBoardScreen from './dashboard/DashBoardScreen';
import OTPScreen from './Login/OTPScreen';
import VerifyScreen from './Login/VerifyScreen';
import ProfileScreen from './Login/ProfileScreen';
import { enableScreens } from 'react-native-screens';
import SinglePage from './authentication/SinglePage';
import AddScreen from './dashboard/AddScreen';
import PreviewThumbnail from './dashboard/PreviewThumbnail';
import PreviewDetailed from './dashboard/PreviewDetailed';
import ProductDetails from './dashboard/ProductDetails';
import Temp from './authentication/Temp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import SplashScreen from './Hello/SplashScreen';
import Bookmark from './dashboard/Bookmark';
import MyListing from './dashboard/MyListing';

const Stack = createNativeStackNavigator();


export const Navigation = () => {
    const [initialRoute, setInitialRoute] = useState<null | string>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
useEffect(() => {
    const checkLoginStatus = async () => {
      const flag = await AsyncStorage.getItem('ISLOGIN');
      // Decide route based on flag
      setInitialRoute(flag === 'true' ? 'Dashboard' : 'SinglePage');
    };
    checkLoginStatus();
  }, []);
 
  // 👇 until AsyncStorage resolves, show Splash
  if (initialRoute === null) {
    return <SplashScreen onFinish={() => {}} />; // no navigation yet
  }
 

  enableScreens();
    return (
      <NavigationContainer>
        

      {/* <Stack.Navigator
        initialRouteName={isLoggedIn ? "Dashboard" : "SinglePage"}
        screenOptions={{ headerShown: false, animation: "fade" }}
      > */}
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        <Stack.Screen
          name="SinglePage"
          component={SinglePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashBoardScreen}
          options={{ headerShown: false }}
        />
    
    
      <Stack.Screen name='Temp' component={Temp} options={{headerShown:false,animation: 'fade',presentation: 'fullScreenModal'}}/>



      {/* <Stack.Screen name='SinglePage' component={SinglePage} options={{headerShown:false,animation: 'fade',presentation: 'fullScreenModal'}}/> */}
        {/* {isLoggedIn && (
          <Stack.Screen
            name="SinglePage"
            component={SinglePage}
            options={{ headerShown: false, animation: "fade",presentation: 'fullScreenModal' }}
          />
        )} */}
        <Stack.Screen name="HelloScreen" component={HelloScreen}  options={{headerShown: false,gestureEnabled: true,}} />
                

        <Stack.Screen name='AddScreen' component={AddScreen} options={{headerShown:false,animation: 'fade',presentation: 'fullScreenModal'}}/>
        <Stack.Screen name='PreviewThumbnail' component={PreviewThumbnail} options={{headerShown:false,animation: 'fade',presentation: 'fullScreenModal'}}/>
        <Stack.Screen name='PreviewDetailed' component={PreviewDetailed} options={{headerShown:false,animation: 'fade',presentation: 'fullScreenModal'}}/>
        <Stack.Screen name='ProductDetails' component={ProductDetails} options={{headerShown:false,animation: 'fade',presentation: 'fullScreenModal'}}/>
        <Stack.Screen name="LoginScreen" component={LoginScreen}  options={{headerShown: false, presentation: 'fullScreenModal',gestureEnabled: true, }}/>
        {/* <Stack.Screen name="Dashboard" component={DashBoardScreen} options={{headerShown: false,headerTransparent: true,presentation: 'fullScreenModal',gestureEnabled: true,}} /> */}
        <Stack.Screen name="LanguagePopup" component={SelectLanguage_Popup} options={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'fade_from_bottom',
          animationDuration: 700,
          }} />
        <Stack.Screen name="Reset" component={ResetPassword} options={{headerShown: false, presentation: 'fullScreenModal',gestureEnabled: true,}}/>
        <Stack.Screen name="Signup" component={SignupScreen} options={{headerShown: false, presentation: 'fullScreenModal',gestureEnabled: true,}}/>
        <Stack.Screen name="RevarifyStudentStatus" component={RevarifyStudentStatus} options={{headerShown: false}} />
        <Stack.Screen name="OTPScreen" component={OTPScreen} options={{headerShown:false, presentation: 'fullScreenModal'}}/>
        <Stack.Screen name="VerifyScreen" component={VerifyScreen} options={{headerShown:false,presentation: 'fullScreenModal'}}/>
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{headerShown:false,presentation: 'fullScreenModal'}}/>
        <Stack.Screen name='Bookmark' component={Bookmark} options={{headerShown:false,presentation: 'fullScreenModal'}}/>
        <Stack.Screen name='MyListing' component={MyListing} options={{headerShown:false,presentation: 'fullScreenModal'}}/>
      </Stack.Navigator>
    </NavigationContainer>
    );
}
