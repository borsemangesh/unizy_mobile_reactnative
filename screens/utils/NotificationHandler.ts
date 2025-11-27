import { Platform } from 'react-native';
import { navigate, resetNavigation } from '../view/NavigationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const navigationReady = { isReady: false };

export const handleNotification = async (
  notificationData: any,
  isBackground: boolean = false,
) => {
  try {
    console.log(
      ` Handling ${
        isBackground ? 'background' : 'foreground'
      } notification data:`,
      notificationData,
    );

    console.log(' Notification Data handler :', notificationData);
    const parseValue = (value: any) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    };

    if (typeof notificationData === 'string') {
      try {
        notificationData = JSON.parse(notificationData);
      } catch (e) {
        console.warn(' Could not parse data as JSON:', e);
      }
    }

    if (notificationData?.data && typeof notificationData.data === 'string') {
      try {
        const nestedData = JSON.parse(notificationData.data);
        notificationData = { ...notificationData, ...nestedData };
      } catch (e) {
        console.warn(' Could not parse nested data as JSON:', e);
      }
    }

    const title = notificationData?.type;

    if (title == 'order_details') {
      const featureId =
        notificationData?.feature_id ||
        notificationData?.data?.feature_id ||
        null;
      console.log(' Extracted feature_id:', featureId);
      if (Platform.OS === 'ios') {
        resetNavigation('ViewListingDetails', {
          shareid: featureId,
          catagory_id: notificationData?.category_id,
          catagory_name: notificationData?.catagory_name,
        });
      } else {
        navigate('ViewListingDetails', {
          shareid: featureId,
          catagory_id: notificationData?.category_id,
          catagory_name: notificationData?.catagory_name,
        });
      }

      return;
    }

    if (title == 'feature_details') {
      const featureId =
        notificationData?.feature_id ||
        notificationData?.data?.feature_id ||
        null;
      console.log(' Extracted feature_id:', featureId);
      if (Platform.OS === 'ios') {
        resetNavigation('ListingDetails', {
          shareid: featureId,
          catagory_id: notificationData?.category_id,
          catagory_name: notificationData?.catagory_name,
        });
      } else {
        navigate('ListingDetails', {
          shareid: featureId,
          catagory_id: notificationData?.category_id,
          catagory_name: notificationData?.catagory_name,
        });
      }
      return;
    }

    if (title === 'transaction_details') {
      const featureId =
        notificationData?.feature_id ||
        notificationData?.data?.feature_id ||
        null;
      if (Platform.OS === 'ios') {
        resetNavigation('MyOrders', {});
      } else {
        navigate('MyOrders', {});
      }

      return;
    }
    if (title == 'review') {
      const featureId =
        notificationData?.feature_id ||
        notificationData?.data?.feature_id ||
        null;
      if (Platform.OS === 'ios') {
        resetNavigation('ReviewDetails', {
          category_id: notificationData?.category_id,
          id: featureId,
          purchase: false,
        });
      } else {
        navigate('ReviewDetails', {
          category_id: notificationData?.category_id,
          id: featureId,
          purchase: false,
        });
      }

      return;
    }

    if (title == 'payout') {
      if (Platform.OS === 'ios') {
        resetNavigation('Dashboard', {
          AddScreenBackactiveTab: 'Search',
          isNavigate: false,
        });
      } else {
        navigate('Dashboard', {
          AddScreenBackactiveTab: 'Search',
          isNavigate: false,
        });
      }

      return;
    }

    if (title == 'orderotp') {
      if (Platform.OS === 'ios') {
        resetNavigation('Dashboard', {
          AddScreenBackactiveTab: 'Search',
          isNavigate: false,
        });
      } else {
        navigate('Dashboard', {
          AddScreenBackactiveTab: 'Search',
          isNavigate: false,
        });
      }

      return;
    }

    let members = null;
    if (notificationData?.members) {
      const parsedMembers = parseValue(notificationData.members);
      if (Array.isArray(parsedMembers)) {
        members = parsedMembers[0];
      } else if (typeof parsedMembers === 'object' && parsedMembers !== null) {
        members = parsedMembers;
      }
    }

    if (members) {
      members = {
        id: members.id || 0,
        firstname: members.firstname || '',
        lastname: members.lastname || '',
        profile: members.profile || null,
        university: {
          id: members.university?.id || 0,
          name: members.universityName || members.university?.name || '',
        },
      };
    }

    const userConvName =
      notificationData?.userConvName ||
      notificationData?.conv_name ||
      notificationData?.friendlyname ||
      '';

    let currentUserIdList = 0;
    if (notificationData?.current_user_id) {
      currentUserIdList = Number(parseValue(notificationData.current_user_id));
    } else if (notificationData?.from) {
      currentUserIdList = Number(parseValue(notificationData.from)) || 0;
    }
    const conversationSid =
      notificationData?.conversationSid ||
      notificationData?.twilio_conversation_sid ||
      notificationData?.sid ||
      notificationData?.conversation_sid ||
      '';

    const source = notificationData?.source
      ? parseValue(notificationData.source)
      : 'chatList';

    let sellerData = undefined;
    if (source === 'sellerPage' && notificationData?.sellerData) {
      const parsedSellerData = parseValue(notificationData.sellerData);
      if (parsedSellerData && typeof parsedSellerData === 'object') {
        sellerData = {
          featureId: parsedSellerData.featureId || parsedSellerData.id || 0,
          firstname: parsedSellerData.firstname || '',
          lastname: parsedSellerData.lastname || '',
          profile: parsedSellerData.profile || null,
          universityName: parsedSellerData.universityName ||
            parsedSellerData.university || { id: 0, name: '' },
          id: parsedSellerData.id || 0,
        };
      }
    }

    if (userConvName && members && members.firstname) {
      const params = {
        animation: 'none',
        members,
        userConvName,
        currentUserIdList,
        conversationSid,
        source,
        ...(sellerData && { sellerData }),
      };

      console.log(' Final navigation params:', JSON.stringify(params, null, 2));

      await AsyncStorage.removeItem('notificationNavigationCompleted');
      await AsyncStorage.setItem(
        'pendingNotificationNavigation',
        JSON.stringify({
          screen: 'MessagesIndividualScreen',
          params: params,
          timestamp: Date.now(),
        }),
      );

      setTimeout(
        () => {
          if (Platform.OS === 'ios') {
            resetNavigation('MessagesIndividualScreen', params);
          } else {
            navigate('MessagesIndividualScreen', params);
          }
        },
        isBackground ? 200 : 100,
      );

      // const waitForNavigation = async () => {
      // let attempts = 0;

      // while (!navigationReady.isReady && attempts < 15) {
      //     await new Promise(r => setTimeout(r, 200));
      //     attempts++;
      // }
      // };

      // await waitForNavigation();
      // navigate("MessagesIndividualScreen", params);
    } else {
      console.log(
        ' Notification data did not match any known navigation patterns',
      );
    }
  } catch (error) {
    console.error('Error handling notification:', error);
  }
};
