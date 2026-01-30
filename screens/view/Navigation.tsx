import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import RevarifyStudentStatus from './revarify/RevarifyStudentStatus';
import DashBoardScreen from './dashboard/DashBoardScreen';
import { enableScreens } from 'react-native-screens';
import SinglePage from './authentication/SinglePage';
import AddScreen from './dashboard/AddScreen';
import PreviewThumbnail from './dashboard/PreviewThumbnail';
import PreviewDetailed from './dashboard/PreviewDetailed';
import ProductDetails from './dashboard/ProductDetails';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
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
import HelpSupport from './dashboard/HelpSupport';
import Notification from './dashboard/Notification';
import EditListScreen from './dashboard/EditListScreen';
import EditPreviewThumbnail from './dashboard/EditPreviewThumbnail';
import EditPreviewDetailed from './dashboard/EditPreviewDetailed';
import UserProfileScreen from './dashboard/UserProfileScreen';
import EditProfile from './dashboard/EditProfile';
import ViewListingDetails from './dashboard/ViewListingDetails';
import StripeOnboardingScreen from './dashboard/StripeOnboardingScreen';
import AccountDetails from './dashboard/AccountDetails';
import StripeOnboardingCancel from './dashboard/StripeOnboardingCancel';
import StripeOnboardingComplete from './dashboard/StripeOnboardingComplete';
import UserReviews from './dashboard/UserReviews';
import UserListing from './dashboard/UserListing';
import UserAddReview from './dashboard/UserAddReview';
import { navigationRef } from './NavigationService';
import ChangePassword from './dashboard/ChangePassword';
import { navigationReady } from '../utils/NotificationHandler';
import TeamsAndCondition from './authentication/termsconditinAndPrivacyPolicy/TeamsAndCondition';
import PrivacyAndPolicy from './authentication/termsconditinAndPrivacyPolicy/PrivacyAndPolicy';
import ReportProduct from './dashboard/ReportProduct';
import SellerInfo from './dashboard/SellerInfo';
import BuyerInfo from './dashboard/BuyerInfo';
import OnboardingScreen from './onboarding/OnboardingScreen';
import MyRatings from './dashboard/MyRatings';

const Stack = createNativeStackNavigator();


export const Navigation = () => {
  const [initialRoute, setInitialRoute] = useState<null | string>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);


  const linking = {
    prefixes: ['unizyapp://'],
    config: {
      screens: {
        StripeOnboardingComplete: 'onboarding-complete',
        StripeOnboardingCancel: 'onboarding-cancel',
      },
    },
  };

  enableScreens();
  return (
    <NavigationContainer ref={navigationRef} linking={linking}
    
    onReady={() => {
    navigationReady.isReady = true;
  }}
    >
      <Stack.Navigator
        initialRouteName="SinglePage"
        screenOptions={{ headerShown: false, animation: 'none' }}
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

        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
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
          name="ViewListingDetails"
          component={ViewListingDetails}
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="ListingDetails"
          component={ListingDetails}
          key={Math.random().toString()}
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
          name="MyRatings"
          component={MyRatings}
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
          name="UserAddReview"
          component={UserAddReview}
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
          name="TeamsAndCondition"
          component={TeamsAndCondition}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="PrivacyAndPolicy"
          component={PrivacyAndPolicy}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="ReportProduct"
          component={ReportProduct}
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
          name="StripeOnboardingComplete"
          component={StripeOnboardingComplete}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="StripeOnboardingScreen"
          component={StripeOnboardingScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="AccountDeatils"
          component={AccountDetails}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="StripeOnboardingCancel"
          component={StripeOnboardingCancel}
          options={{ headerShown: false }}
        />
        <Stack.Screen
              name="UserReviews"
              component={UserReviews}
              options={{
                headerShown: false,
                presentation: 'fullScreenModal',
              }}
            />
             <Stack.Screen
              name="UserListing"
              component={UserListing}
              options={{
                headerShown: false,
                presentation: 'fullScreenModal',
              }}
            />

              <Stack.Screen
              name="ChangePassword"
              component={ChangePassword}
              options={{
                headerShown: false,
                presentation: 'fullScreenModal',
              }}
            />

              <Stack.Screen
              name="SellerInfo"
              component={SellerInfo}
              options={{
                headerShown: false,
                presentation: 'fullScreenModal',
              }}
            />

              <Stack.Screen
              name="BuyerInfo"
              component={BuyerInfo}
              options={{
                headerShown: false,
                presentation: 'fullScreenModal',
              }}
            />
            <Stack.Screen
              name="OnboardingScreen"
              component={OnboardingScreen}
              options={{
                headerShown: false,
                presentation: 'fullScreenModal',
              }}
              />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
