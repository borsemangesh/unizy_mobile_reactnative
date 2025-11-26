import React, { useEffect, useState } from 'react';
import { View, Button, Alert, ImageBackground, ActivityIndicator, StyleSheet } from 'react-native';
import { CardField, initPaymentSheet, useStripe } from '@stripe/stripe-react-native';
import { MAIN_URL } from './APIConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useRoute } from '@react-navigation/native';
import { showToast } from './component/NewCustomToastManager';
import Loader from './component/Loader';
import { Constant } from './Constant';


type RootStackParamList = {
  PaymentScreen: { 
    amount: number;
    feature_id:number,
    nav:string
    onSuccess: () => void;
  };
};

type PaymentScreenProps = {
  navigation: any;
};

type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'PaymentScreen'>;

const PaymentScreen :React.FC<PaymentScreenProps> = ({ navigation }) => {
  const { confirmPayment } = useStripe();
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
 
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
 
  const route = useRoute<PaymentScreenRouteProp>();
    const { amount,feature_id,nav } = route.params;
   
    const {onSuccess} =route.params;
 
 
    console.log(amount)
 
  const handlePayPress = async () => {
 
    setLoading(true);
 
    try {
     const token = await AsyncStorage.getItem('userToken');
     if (!token) return;
 
     
 
      let url = MAIN_URL.baseUrl + "transaction/feature-payment-create";
      let body: any = { amount };
 
      if (nav !== 'add') {
        url = MAIN_URL.baseUrl + "transaction/post-order-create";
        body = {
          amount,
          feature_id: feature_id
        };
      }
 
      console.log(url)
      console.log(body)
     
      //const url = MAIN_URL.baseUrl+"transaction/feature-payment-create"
      const response = await fetch(url, {
        method: 'POST',
        headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
        body: JSON.stringify(body)
      });
 
     
      const responseJson = await response.json();
      console.log("API Response JSON:", responseJson);
      const clientSecret = responseJson.data;
      const ephemeralKey = responseJson.metadata?.ephemeralKey;
      const customerId = responseJson.metadata?.customerId;
      const paymentintent_id = responseJson.metadata?.paymentIntentId;
      const famount = responseJson.metadata?.amount;
 
 
    if (clientSecret) {
      console.log('Payment successful:', clientSecret);
      await AsyncStorage.setItem("finalamount", String(famount));
 
      await AsyncStorage.setItem("paymentintent_id", paymentintent_id);
      
      return {
        clientSecret,
        ephemeralKey,
        customerId
      };
 
    }
  }catch (err) {
      Alert.alert('Payment error', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };
 
 
  const initializePaymentSheet = async () => {
  const result = await handlePayPress();
  if (!result) return; // safeguard
 
  const { clientSecret, ephemeralKey, customerId } = result;
 
  const { error } = await initPaymentSheet({
    customerId: customerId,
    customerEphemeralKeySecret: ephemeralKey,
    paymentIntentClientSecret: clientSecret,
    merchantDisplayName: "Your Company",  
    allowsDelayedPaymentMethods: true,
  });
 
 
  if (!error) {
      setLoading(false);
      openSheet();
    } else {
      setLoading(false);
      showToast(Constant.PAYMENT_FAIL, "error");
    }
};
 
 
 const openSheet = async () => {
  try {
    const { error } = await presentPaymentSheet();
 
    if (error) {
      if (error.code === 'Canceled') {
        console.log('User cancelled payment');
        navigation.goBack();
        return;
      }
 
      console.log('Payment failed:', error);
      showToast(Constant.PAYMENT_FAIL, 'error');
      return;
    }
 
    showToast(Constant.PAYMENT_COMPLETE,'success');
    if (onSuccess) await onSuccess();
    navigation.goBack();
 
  } catch (e) {
    console.error('Unexpected error during payment:', e);
    showToast(Constant.SOMTHING_WENT_WRONG, 'error');
  }
};
 
  useEffect(() => {
    initializePaymentSheet();
  }, []);
 
   return (
    <ImageBackground
      source={require("../../assets/images/backimg.png")} // ✅ Your background image
      style={styles.bg}
    >
      {loading && (
       <Loader/>
      )}
      <View />
    </ImageBackground>
  );
   
};
const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: "center", alignItems: "center" },
  loader: { position: "absolute" }
});

export default PaymentScreen;

