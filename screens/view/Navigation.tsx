
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from "@react-navigation/native";
import  HelloScreen  from './Hello/HelloScreen';
import  LoginScreen  from './Login/LoginScreen'
import Home from "./Home/Home";
import SelectLanguage_Popup from "./SelectLanguage/SelectLanguage_Popup";


const Stack = createNativeStackNavigator();


export const Navigation = () => {
    return (
    <NavigationContainer>
      
      <Stack.Navigator initialRouteName="HelloScreen">
        <Stack.Screen name="HelloScreen" component={HelloScreen} options={{headerShown: false,presentation: 'modal' }} />
        <Stack.Screen name="LoginScreen" component={LoginScreen}  options={{headerShown: false}}/>
        <Stack.Screen name="Home" component={Home} options={{headerShown: false}} />
        <Stack.Screen name="LanguagePopup" component={SelectLanguage_Popup} options={{headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
    );
}