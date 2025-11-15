import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HelloScreen from './Hello/HelloScreen';
import LoginScreen from './Login/LoginScreen';
import SelectLanguage_Popup from './SelectLanguage/SelectLanguage_Popup';
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
import SearchDetails from './dashboard/SearchDetails';
import ListingDetails from './dashboard/ListingDetails';
import SearchPage from './dashboard/SearchPage';
import MessagesIndividualScreen from './dashboard/MessageIndividualScreen';
import PaymentScreen from '../utils/PaymentScreen';
import ReviewDetails from './dashboard/ReviewDetails';
import AddReview from './dashboard/AddReview';
import MyReviews from './dashboard/MyReviews';
import MyOrders from './dashboard/MyOrders';
import MyProductDetails from './dashboard/MyProductDetails';
import HelpSupport from './dashboard/HelpSupport';
import Notification from './dashboard/Notification';
import EditListScreen from './dashboard/EditListScreen';
import EditPreviewThumbnail from './dashboard/EditPreviewThumbnail';
import EditPreviewDetailed from './dashboard/EditPreviewDetailed';
import UserProfileScreen from './dashboard/UserProfileScreen';
import EditProfile from './dashboard/EditProfile';
import ProfileCard from './dashboard/ProfileCard';
import { navigationRef } from './NavigationService';

const Stack = createNativeStackNavigator();

export const Navigation = () => {
  const [initialRoute, setInitialRoute] = useState<null | string>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  enableScreens();
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="SinglePage"
        screenOptions={{ headerShown: false, animation: 'none' }}
      >
        <Stack.Screen
          name="Splashscreen"
          component={SplashScreen}
          options={{
            headerShown: false,
            animation: 'none',
            presentation: 'fullScreenModal',
          }}
        />
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

        <Stack.Screen
          name="Temp"
          component={Temp}
          options={{
            headerShown: false,
            animation: 'none',
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="HelloScreen"
          component={HelloScreen}
          options={{ headerShown: false, gestureEnabled: true }}
        />

        <Stack.Screen
          name="AddScreen"
          component={AddScreen}
          options={{
            headerShown: false,
            animation: 'none',
            presentation: 'fullScreenModal',
          }}
        />

        <Stack.Screen
          name="EditListScreen"
          component={EditListScreen}
          options={{
            headerShown: false,
            animation: 'none',
            presentation: 'fullScreenModal',
          }}
        />
        
<Stack.Screen
          name="EditPreviewThumbnail"
          component={EditPreviewThumbnail}
          options={{
            headerShown: false,
            animation: 'none',
            presentation: 'fullScreenModal',
          }}
        />


<Stack.Screen
          name="UserProfileScreen"
          component={UserProfileScreen}
          options={{
            headerShown: false,
            animation: 'none',
            presentation: 'fullScreenModal',
          }}
        />
        
        <Stack.Screen
          name="EditPreviewDetailed"
          component={EditPreviewDetailed}
          options={{
            headerShown: false,
            animation: 'none',
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="PreviewThumbnail"
          component={PreviewThumbnail}
          options={{
            headerShown: false,
            animation: 'none',
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="PreviewDetailed"
          component={PreviewDetailed}
          options={{
            headerShown: false,
            animation: 'none',
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="ProductDetails"
          component={ProductDetails}
          options={{
            headerShown: false,
            animation: 'none',
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            gestureEnabled: true,
          }}
        />
        {/* <Stack.Screen name="Dashboard" component={DashBoardScreen} options={{headerShown: false,headerTransparent: true,presentation: 'fullScreenModal',gestureEnabled: true,}} /> */}
        <Stack.Screen
          name="LanguagePopup"
          component={SelectLanguage_Popup}
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: 'fade_from_bottom',
            animationDuration: 700,
          }}
        />
        <Stack.Screen
          name="Reset"
          component={ResetPassword}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="MessagesIndividualScreen"
          component={MessagesIndividualScreen}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="RevarifyStudentStatus"
          component={RevarifyStudentStatus}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OTPScreen"
          component={OTPScreen}
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="VerifyScreen"
          component={VerifyScreen}
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="Bookmark"
          component={Bookmark}
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="SearchDetails"
          component={SearchDetails}
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="MyListing"
          component={MyListing}
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="ListingDetails"
          component={ListingDetails}
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="SearchPage"
          component={SearchPage}
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="PaymentScreen"
          component={PaymentScreen}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />

        <Stack.Screen
          name="ReviewDetails"
          component={ReviewDetails}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />

        <Stack.Screen
          name="AddReview"
          component={AddReview}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="MyReviews"
          component={MyReviews}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />

        <Stack.Screen
          name="MyOrders"
          component={MyOrders}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />

        <Stack.Screen
          name="MyProductDetails"
          component={MyProductDetails}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />

        <Stack.Screen
          name="HelpSupport"
          component={HelpSupport}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />

        <Stack.Screen
          name="Notification"
          component={Notification}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />

        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />

  <Stack.Screen
          name="ProfileCard"
          component={ProfileCard}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};
