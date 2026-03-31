import React, { useEffect, useState } from 'react';
import { View, Button, Alert, ImageBackground, ActivityIndicator, StyleSheet } from 'react-native';
import { CardField, initPaymentSheet, useStripe } from '@stripe/stripe-react-native';
import { MAIN_URL } from './APIConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useRoute } from '@react-navigation/native';
import { showToast } from './component/NewCustomToastManager';
import Loader from './component/Loader';
import { Constant } from './Constant';
import { useTranslation } from 'react-i18next';
import { isPlatformPaySupported, PlatformPay } from '@stripe/stripe-react-native';


type RootStackParamList = {
  PaymentScreen: {
    amount: number;
    feature_id: number,
    nav: string
    onSuccess: () => void;
  };
};

type PaymentScreenProps = {
  navigation: any;
};

type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'PaymentScreen'>;

const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation }) => {
  const { confirmPayment } = useStripe();
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const route = useRoute<PaymentScreenRouteProp>();
  const { amount, feature_id, nav } = route.params;

  const { onSuccess } = route.params;

  const { t } = useTranslation();


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

      console.log('URL:', url);
      console.log('PAYMENTBODY:', JSON.stringify(body));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });


      const responseJson = await response.json();
          console.log('responseJson:', JSON.stringify(responseJson));


      const clientSecret = responseJson.data;
      const ephemeralKey = responseJson.metadata?.ephemeralKey;
      const customerId = responseJson.metadata?.customerId;
      const paymentintent_id = responseJson.metadata?.paymentIntentId;
      const famount = responseJson.metadata?.amount;


      if (clientSecret) {

        await AsyncStorage.setItem("finalamount", String(famount));

        await AsyncStorage.setItem("paymentintent_id", paymentintent_id);

        return {
          clientSecret,
          ephemeralKey,
          customerId
        };

      }
      else {
      console.log('No clientSecret in response');
    }
    } catch (err) {
      Alert.alert('Payment error', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const check = async () => {
      const supported = await isPlatformPaySupported({
        googlePay: {
          testEnv: true,
          // merchantCountryCode: 'GB',
          // currencyCode: 'GBP',
        }
      });
      console.log('GPay supported on this device:', supported);
    };
    check();
  }, []);

  const initializePaymentSheet = async () => {
    setProcessing(true);

    const result = await handlePayPress();
    if (!result) {
      console.log('No result from handlePayPress');
      setProcessing(false);
      return;
    }
    console.log('handlePayPress result:', JSON.stringify(result));


    const { clientSecret, ephemeralKey, customerId } = result;

    console.log('customerId:', customerId);
    console.log('ephemeralKey:', ephemeralKey);
    console.log('clientSecret:', clientSecret);

    const { error } = await initPaymentSheet({
      customerId,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: "Your Company",
      allowsDelayedPaymentMethods: true,
      // returnURL: 'unizy://stripe-redirect',


      applePay: {
        merchantCountryCode: 'GB', 
        //merchantCountryCode: 'IN',
      },

      googlePay: {
         merchantCountryCode: 'GB',
         currencyCode: "GBP",
        //merchantCountryCode: 'IN',
        //currencyCode: "INR",
        testEnv: __DEV__,
      },
    });
    console.log('initPaymentSheet error:', JSON.stringify(error));

    if (!error) {
      openSheet();
    } else {
      setProcessing(false);
      showToast(Constant.PAYMENT_FAIL, "error");
      console.log('initPaymentSheet error:', JSON.stringify(error));
    }
  };


  const openSheet = async () => {
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        setProcessing(false);

        if (error.code === 'Canceled') {
          navigation.goBack();
          return;
        }

        showToast(t(Constant.PAYMENT_FAIL), 'error');
        return;
      }

      // ✅ Keep loader ON until navigation finishes
      showToast(t(Constant.PAYMENT_COMPLETE), 'success');

      if (onSuccess) await onSuccess();

      navigation.goBack();
    } catch (e) {
      setProcessing(false);
      showToast(t(Constant.SOMTHING_WENT_WRONG), 'error');
    }
  };


  useEffect(() => {
    initializePaymentSheet();
  }, []);

  return (
    // <ImageBackground
    //   source={require("../../assets/images/backimg.png")}
    //   style={styles.bg}
    // >
    //   {loading && (
    //     <Loader />
    //   )}
    //   {/* <View /> */}
    // </ImageBackground>
    <ImageBackground
      source={require("../../assets/images/backimg.png")}
      style={styles.bg}
    >
      {processing && <Loader />}

      {!processing && (
        <Loader />
      )}
    </ImageBackground>
  );

};
const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: "center", alignItems: "center" },
  loader: { position: "absolute" }
});

export default PaymentScreen;

