
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
import { SignupContext } from './Login/SignupContext ';
import SinglePage from './merge/SinglePage';
import BackgroundWrapper from './Hello/BackgroundAnimation';

const Stack = createNativeStackNavigator();
//const Stack = createStackNavigator();


export const Navigation = () => {

  enableScreens();
    return (
      <NavigationContainer >
      <Stack.Navigator initialRouteName="HelloScreen"  screenOptions={{headerShown: false, animation: 'fade',}}>
      {/* <Stack.Screen name="HelloScreen" component={HelloScreen}  options={{headerShown: false, animation: 'fade'}} /> */}

      <Stack.Screen name="HelloScreen" component={SinglePage}  options={{headerShown: false, animation: 'fade'}} />

        <Stack.Screen name="LoginScreen" component={LoginScreen}  options={{headerShown: false, animation: 'fade', presentation: 'fullScreenModal' }}/>
        <Stack.Screen name="Dashboard" component={DashBoardScreen} options={{headerShown: false}} />
        <Stack.Screen name="LanguagePopup" component={SelectLanguage_Popup} options={{
         headerShown: false,
         presentation: 'modal',
         animation: 'fade_from_bottom',
         animationDuration: 700,
       
        }} />
        <Stack.Screen name="Reset" component={ResetPassword} options={{headerShown: false,animation: 'fade', presentation: 'fullScreenModal'}}/>
        <Stack.Screen name="Signup" component={SignupScreen} options={{headerShown: false,animation: 'fade', presentation: 'fullScreenModal'}}/>
        <Stack.Screen name="RevarifyStudentStatus" component={RevarifyStudentStatus} options={{headerShown: false}} />
        <Stack.Screen name="OTPScreen" component={OTPScreen} options={{headerShown:false,animation: 'fade', presentation: 'fullScreenModal'}}/>
        <Stack.Screen name="VerifyScreen" component={VerifyScreen} options={{headerShown:false,animation: 'fade',presentation: 'fullScreenModal'}}/>
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{headerShown:false,animation: 'fade',presentation: 'fullScreenModal'}}/>



      </Stack.Navigator>
    </NavigationContainer>
    );
}
