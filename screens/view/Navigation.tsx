
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

const Stack = createNativeStackNavigator();
//const Stack = createStackNavigator();


export const Navigation = () => {
    return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HelloScreen">
      {/* <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} /> */}

        <Stack.Screen name="HelloScreen" component={HelloScreen} options={{headerShown: false, animation: 'fade',  }} />
        <Stack.Screen name="LoginScreen" component={LoginScreen}  options={{headerShown: false,presentation:'fullScreenModal'}}/>
        <Stack.Screen name="Dashboard" component={DashBoardScreen} options={{headerShown: false}} />
        <Stack.Screen name="LanguagePopup" component={SelectLanguage_Popup} options={{
         headerShown: false,
         presentation: 'modal',
         animation: 'fade_from_bottom',
         animationDuration: 700,
       
        }} />
        <Stack.Screen name="Reset" component={ResetPassword} options={{headerShown: false}}/>
        <Stack.Screen name="Signup" component={SignupScreen} options={{headerShown: false,animation: 'fade', presentation: 'fullScreenModal'}}/>
        <Stack.Screen name="RevarifyStudentStatus" component={RevarifyStudentStatus} options={{headerShown: false}} />
        <Stack.Screen name="OTPScreen" component={OTPScreen} options={{headerShown:false}}/>
        <Stack.Screen name="VerifyScreen" component={VerifyScreen} options={{headerShown:false}}/>
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{headerShown:false}}/>



      </Stack.Navigator>
    </NavigationContainer>
    );
}


////////////////////////////////////////////////////////////////////




// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { NavigationContainer } from "@react-navigation/native";
// import HelloScreen from './Hello/HelloScreen';
// import LoginScreen from './Login/LoginScreen';
// import SelectLanguage_Popup from "./SelectLanguage/SelectLanguage_Popup";
// import ResetPassword from './Login/ResetPassword';
// import ResendPopup from './Login/ResendPopup';
// import SignupScreen from './Login/SignupScreen';
// import RevarifyStudentStatus from './revarify/RevarifyStudentStatus';
// import DashBoardScreen from './dashboard/DashBoardScreen';
// import OTPScreen from './Login/OTPScreen';
// import VerifyScreen from './Login/VerifyScreen';
// import ProfileScreen from './Login/ProfileScreen';

// // ✅ import the wrapper
// import TransitionWrapper from '../utils/TransitionWrapper';

// const Stack = createNativeStackNavigator();

// export const Navigation = () => {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="HelloScreen" screenOptions={{ headerShown: false, animation: 'none' }}>
//         <Stack.Screen
//           name="HelloScreen"
//           component={HelloScreen}
//           options={{ presentation: 'modal' }}
//         />
//         <Stack.Screen name="LoginScreen" component={LoginScreen} />
//         <Stack.Screen name="Dashboard" component={DashBoardScreen} />
//         <Stack.Screen
//           name="LanguagePopup"
//           component={SelectLanguage_Popup}
//           options={{
//             presentation: 'transparentModal',
//             animation: 'slide_from_bottom',
//           }}
//         />
//         <Stack.Screen name="Reset" component={ResetPassword} />
//         <Stack.Screen name="RevarifyStudentStatus" component={RevarifyStudentStatus} />

//         {/* ✅ Wrap Signup → OTP → Verify → Profile */}
//         <Stack.Screen name="Signup">
//           {props => (
//             <TransitionWrapper {...props}>
//               <SignupScreen {...props} />
//             </TransitionWrapper>
//           )}
//         </Stack.Screen>
//         <Stack.Screen name="OTPScreen">
//           {props => (
//             <TransitionWrapper {...props}>
//               <OTPScreen {...props} />
//             </TransitionWrapper>
//           )}
//         </Stack.Screen>
//         <Stack.Screen name="VerifyScreen">
//           {props => (
//             <TransitionWrapper {...props}>
//               <VerifyScreen {...props} />
//             </TransitionWrapper>
//           )}
//         </Stack.Screen>
//         <Stack.Screen name="ProfileScreen">
//           {props => (
//             <TransitionWrapper {...props}>
//               <ProfileScreen {...props} />
//             </TransitionWrapper>
//           )}
//         </Stack.Screen>
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };
