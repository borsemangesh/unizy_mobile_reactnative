
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
import SplashScreen from './Hello/SplashScreen';
import BackgroundAnimation from './Hello/BackgroundAnimation';
import { enableScreens } from 'react-native-screens';
import SinglePage from './authentication/SinglePage';

const Stack = createNativeStackNavigator();
//const Stack = createStackNavigator();


export const Navigation = () => {

  enableScreens();
    return (
      <NavigationContainer>
      <Stack.Navigator initialRouteName="SinglePage"  screenOptions={{headerShown: false,gestureEnabled: true,}}>
        {/* <Stack.Screen name="SpalshScreen" component={SplashScreen}  options={{headerShown: false, */}
          {/* gestureEnabled: true,animation: 'fade',presentation: 'fullScreenModal',
        }}/> */}

        <Stack.Screen name="SinglePage" component={SinglePage}  options={{headerShown: false,gestureEnabled: true,
        animation: 'fade',presentation: 'fullScreenModal',}} />
        <Stack.Screen name="HelloScreen" component={HelloScreen}  options={{headerShown: false,gestureEnabled: true,
        }} />

        <Stack.Screen name="LoginScreen" component={LoginScreen}  options={{headerShown: false, presentation: 'fullScreenModal',gestureEnabled: true, }}/>
        <Stack.Screen name="Dashboard" component={DashBoardScreen} options={{headerShown: false}} />
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
      </Stack.Navigator>
    </NavigationContainer>
    );
}
