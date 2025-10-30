import React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { MAIN_URL } from './APIConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useRoute } from '@react-navigation/native';
import { showToast } from './component/NewCustomToastManager';


type RootStackParamList = {
  PaymentScreen: { 
    amount: number;
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

  const route = useRoute<PaymentScreenRouteProp>();
    const { amount } = route.params;
    const {onSuccess} =route.params;


    console.log(amount)

  const handlePayPress = async () => {
    if (!cardDetails?.complete) {
      Alert.alert('Please enter complete card details');
      return;
    }

    setLoading(true);

    try {
     const token = await AsyncStorage.getItem('userToken');
     if (!token) return;
      
      const url = MAIN_URL.baseUrl+"transaction/feature-payment-create"
      const response = await fetch(url, {
        method: 'POST',
        headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({ amount: amount }) 
      });

     
      const responseJson = await response.json();
      console.log("API Response JSON:", responseJson);
      const clientSecret = responseJson.data; // <-- use 'data' instead of 'clientSecret'

      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        console.log('Payment error:', error);
        showToast(`Payment failed: ${error.message}`,'error');
      // } else if (paymentIntent) {
      //   console.log('Payment successful:', paymentIntent);
      //   showToast('Payment successful', 'success');
      // }

      // if (onSuccess) await onSuccess();

      //   navigation.goBack();
       if (error) {
      console.log('Payment error:', error);
      showToast(`Payment failed: ${error.message}`, 'error');
      return;
    }
  }

    if (paymentIntent) {
      console.log('Payment successful:', paymentIntent);

      const pi = paymentIntent as any; // ✅ cast it

        const paymentData = {
          transactionId: pi.id,
          status: pi.status,
          //amount: pi.amount,
          //currency: pi.currency,
         // timestamp: new Date().toISOString(),
        };
      await AsyncStorage.setItem("last_payment", JSON.stringify(paymentData));
      console.log("Stored payment:", paymentData);

      showToast(`Payment Successful`, 'success');

      if (onSuccess) await onSuccess();

      navigation.goBack(); // ✅ After storing
    

    } 
  }catch (err) {
      Alert.alert('Payment error', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <CardField
        postalCodeEnabled={false}
        placeholders={{ number: '4242 4242 4242 4242' }}
        cardStyle={{ backgroundColor: '#FFFFFF', textColor: '#000000' }}
        style={{ width: '100%', height: 50, marginVertical: 30 }}
        onCardChange={(card) => setCardDetails(card)}
      />
      <Button
      title={loading ? 'Processing...' : `Pay £${(amount).toFixed(2)}`}
      onPress={handlePayPress}
      disabled={loading}
/>
    </View>
  );
};

export default PaymentScreen;

// import React, { useEffect, useState } from 'react';
// import { View, Button, Alert, Text } from 'react-native';
// import { CardField, useStripe, confirmPayment, confirmSetupIntent } from '@stripe/stripe-react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { MAIN_URL } from './APIConstant';
// import { RouteProp, useRoute } from '@react-navigation/native';

// type RootStackParamList = {
//   PaymentScreen: { 
//     amount: number;
//     onSuccess: () => void;
//   };
// };

// type PaymentScreenProps = {
//   navigation: any;
// };

// type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'PaymentScreen'>;

// const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation }) => {
//   const { confirmPayment, confirmSetupIntent } = useStripe();
//   const [cardDetails, setCardDetails] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
//   const [savedPaymentMethod, setSavedPaymentMethod] = useState<string | null>(null);

//   const route = useRoute<PaymentScreenRouteProp>();
//   const { amount, onSuccess } = route.params;

//   useEffect(() => {
//     // Load saved card if exists
//     const loadSavedCard = async () => {
//       const paymentMethod = await AsyncStorage.getItem('savedPaymentMethod');
//       if (paymentMethod) setSavedPaymentMethod(paymentMethod);
//     };
//     loadSavedCard();
//   }, []);

//   // Save card for future use
//   const handleSaveCard = async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem('userToken');
//       if (!token) throw new Error('User not logged in');

//       const response = await fetch(`${MAIN_URL.baseUrl}transaction/create-setup-intent`, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       const { clientSecret } = await response.json();

//       const { setupIntent, error } = await confirmSetupIntent(clientSecret, {
//         paymentMethodType: 'Card',
//       });

//       if (error) {
//         Alert.alert('Save Card Failed', error.message);
//       } else if (setupIntent?.paymentMethod) {
//         //await AsyncStorage.setItem('savedPaymentMethod', setupIntent.paymentMethod);
//         //setSavedPaymentMethod(setupIntent.paymentMethod);
//         Alert.alert('Card saved successfully!');
//       }
//     } catch (err) {
//       Alert.alert('Error', (err as Error).message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Remove saved card
//   const handleRemoveCard = async () => {
//     await AsyncStorage.removeItem('savedPaymentMethod');
//     setSavedPaymentMethod(null);
//     Alert.alert('Saved card removed');
//   };

//   // Handle payment
//   const handlePayPress = async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem('userToken');
//       if (!token) throw new Error('User not logged in');

//       let body: any = { amount };

//       // If saved card exists, pass payment_method to backend
//       if (savedPaymentMethod) {
//         body.payment_method = savedPaymentMethod;
//       } else if (!cardDetails?.complete) {
//         Alert.alert('Please enter complete card details');
//         return;
//       }

//       const response = await fetch(`${MAIN_URL.baseUrl}transaction/feature-payment-create`, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(body),
//       });

//       const responseJson = await response.json();
//       const clientSecret = responseJson.data;

//       let result;
//       if (savedPaymentMethod) {
//         // Confirm payment with saved card
//         result = await confirmPayment(clientSecret);
//       } else {
//         // Confirm payment with new card
//         result = await confirmPayment(clientSecret, { paymentMethodType: 'Card' });
//       }

//       if (result.error) {
//         Alert.alert('Payment Failed', result.error.message);
//       } else if (result.paymentIntent) {
//         Alert.alert('Payment Successful', `Status: ${result.paymentIntent.status}`);
//         if (onSuccess) await onSuccess();
//         navigation.goBack();
//       }
//     } catch (err) {
//       Alert.alert('Payment Error', (err as Error).message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={{ padding: 20 }}>
//       {savedPaymentMethod ? (
//         <>
//           <Text allowFontScaling={false} style={{ marginBottom: 20 }}>Using saved card ending with ****</Text>
//           <Button title="Remove Saved Card" onPress={handleRemoveCard} />
//         </>
//       ) : (
//         <>
//           <CardField
//             postalCodeEnabled={false}
//             placeholders={{ number: '4242 4242 4242 4242' }}
//             cardStyle={{ backgroundColor: '#FFFFFF', textColor: '#000000' }}
//             style={{ width: '100%', height: 50, marginVertical: 30 }}
//             onCardChange={(card) => setCardDetails(card)}
//           />
//           <Button title="Save Card for Future Payments" onPress={handleSaveCard} disabled={!cardDetails?.complete || loading} />
//         </>
//       )}

//       <View style={{ marginTop: 20 }}>
//         <Button
//           title={loading ? 'Processing...' : `Pay £${amount.toFixed(2)}`}
//           onPress={handlePayPress}
//           disabled={loading}
//         />
//       </View>
//     </View>
//   );
// };

// export default PaymentScreen;

