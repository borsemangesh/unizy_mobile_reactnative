
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from '@react-native-community/blur';
import { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { MAIN_URL } from '../APIConstant';
import { useTranslation } from 'react-i18next';

interface FilterBottomSheetProps {
  catagory_id: number;
  visible: boolean;
  onClose: () => void;
  SalesImageUrl: string;
  salesDataResponse: any[];
  dropDowntitle: string; 
}

const SalesAllDetailsDropdown = ({
  catagory_id,
  visible,
  onClose,
  SalesImageUrl,
  salesDataResponse,
  dropDowntitle

}: FilterBottomSheetProps) => {
  
  const [salesData, setSalesData] = useState<any[]>([]);// Holds the sales data
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  



  const fetchSalesHistory = async (catagory_id: number) => {
    try {
      // Get user token
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found');
        return;
      }
  
      // Construct the URL
      const url = `${MAIN_URL.baseUrl}transaction/sales-history?feature_id=${catagory_id}`;
      console.log('SalesHistory URL:', url);
  
      // Make the API call
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await response.json();
  
      // Handle response status codes
      if (response.status === 200) {
        setSalesData(json.data.features.buyers);
        console.log("SalesHistory ResponseByers JSON:", json.data);
        console.log("SalesHistory ResponseByers:", json.data.features.buyers);

      }
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      // Parse the JSON response
      
      console.log("SalesHistory Response:", json);
  
      if (json.statusCode === 401 || json.statusCode === 403) {
        // handleForceLogout();
        return;
      }
  
      // Update the sales data to only contain the 'buyers' array
       // <-- Corrected part
  
    } catch (err) {
      console.log('Error fetching sales history:', err);
    } finally {
      setLoading(false);
    }
  };
  
  

  useEffect(() => {
      console.log('Component mounted, fetching sales history',salesDataResponse);
      
      fetchSalesHistory(catagory_id);
        // setSalesData(salesDataResponse);
    
  }, [salesDataResponse]);

  const handleClose = () => {
    onClose();
  };

   const { t } = useTranslation();
  const handleForceLogout = async () => {
    console.log('User inactive or unauthorized — logging out');
    await AsyncStorage.clear();
  };

  const getInitials = (firstName = '', lastName = '') => {
    const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
    const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
    return f + l || '?';
  };

  const totalEarnings = salesData.reduce((acc, buyer) => acc + parseFloat(buyer.amount || 0), 0).toFixed(2);

  const renderRightContent = () => {
    // Check if the sales data is still loading
    if (loading) {
      return (
        <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>Loading...</Text>
      );
    }

    // If there's no sales data, show a message
    if (salesData.length === 0) {
      return (
        <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>No sales data available</Text>
      );
    }

    const formatPurchaseDate = (dateString: string) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
    
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
    
      let suffix = "th";
      if (day % 10 === 1 && day !== 11) suffix = "st";
      else if (day % 10 === 2 && day !== 12) suffix = "nd";
      else if (day % 10 === 3 && day !== 13) suffix = "rd";
    
      return `${day}${suffix} ${month} ${year}`;
    };

    // Render the sales data
    return (

     
      <ScrollView style={{ flexGrow: 0, paddingTop: 10 }} showsVerticalScrollIndicator={false}>
        {Array.isArray(salesData) && salesData.length > 0 ? (
  salesData.map((buyer, index) => (
    <View key={index} style={{ marginBottom: 5 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          flex: 1,
          width: '100%',
          marginBottom: 12,
          alignItems: 'center',
        }}
      >



            {buyer?.profile ? (
                  <Image
                    source={{ uri: buyer.profile }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.initialsCircle}>
                    <Text allowFontScaling={false} style={styles.initialsText}>
            {getInitials(buyer.firstname, buyer.lastname)}
          </Text>
                  </View>
          )}


        {/* <View style={styles.initialsCircle}>
          <Text allowFontScaling={false} style={styles.initialsText}>
            {getInitials(buyer.firstname, buyer.lastname)}
          </Text>
        </View> */}
        <View style={{ gap: 4, flex: 0.5 }}>
          <Text
            style={{
              color: 'rgb(255, 255, 255)',
              fontWeight: '600',
              fontFamily: 'Urbanist-SemiBold',
              fontSize: 14,
            }}
          >
            {buyer.firstname} {buyer.lastname}
          </Text>
          <Text
            style={{
              color: 'rgb(255, 255, 255)',
              fontWeight: '600',
              fontFamily: 'Urbanist-SemiBold',
              fontSize: 12,
            }}
          >
            {buyer.university_name}
          </Text>
        </View>
        <View style={{ gap: 4, alignItems: 'flex-end', flex: 0.5 }}>
         
          {/* <Text
            style={{
              color: 'rgb(255, 255, 255)',
              fontWeight: '600',
              fontFamily: 'Urbanist-SemiBold',
              fontSize: 14,
            }}
          >
            £ {parseFloat(buyer.amount).toFixed(2)} 
          </Text> */}

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>


             <View style={styles.statusBox}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: '#ABABFF',
                      fontWeight: '600',
                      fontSize: 12,
                      fontFamily: 'Urbanist-SemiBold',
                    }}
                  >
                    x{buyer.purchased_quantity}
                  </Text>
                </View>

                <Text
                  style={{
                    color: 'rgb(255, 255, 255)',
                    fontWeight: '600',
                    fontFamily: 'Urbanist-SemiBold',
                    fontSize: 14,
                    marginLeft: 8, // spacing before the box
                  }}
                >
                  £ {parseFloat(buyer.amount).toFixed(2)}
                </Text>

                {/* UNITS BOX RIGHT SIDE */}
               

              </View>

          <Text
            style={{
              color: 'rgb(255, 255, 255)',
              fontWeight: '600',
              fontFamily: 'Urbanist-regular',
              fontSize: 12,
            }}
          >
            {formatPurchaseDate(buyer.purchase_date)}
          </Text>
        </View>
      </View>

      
    </View>




  ))
) : (
  <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>
    No sales data available
  </Text>
)}




    </ScrollView>
    );
  };

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { marginTop: -140, zIndex: 9999, display: visible ? 'flex' : 'none', height: '200%' },
      ]}
    >
      <BlurView
        style={[StyleSheet.absoluteFillObject]}
        blurType="dark"
        blurAmount={Platform.OS === 'ios' ? 1 : 4}
        reducedTransparencyFallbackColor="transparent"
      />
      <Modal animationType="slide" visible={visible} transparent onRequestClose={handleClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={handleClose}>
              <View style={StyleSheet.absoluteFillObject} />
            </TouchableWithoutFeedback>
            <View style={[styles.modelcontainer]}>
              <View>
                <BlurView
                  style={{
                    backgroundColor: 'transparent',
                    width: '210%',
                    height: 900,
                    position: 'absolute',
                    top: 130,
                    left: -300,
                    right: 0,
                    bottom: 0,
                  }}
                  blurType="dark"
                  blurAmount={Platform.OS === 'ios' ? 10 : 4}
                  reducedTransparencyFallbackColor="transparent"
                />
              </View>

              <View style={styles.modeltitleContainer1}>
                <View
                  style={{
                    width: 50,
                    height: 4,
                    borderRadius: 2,
                    alignSelf: 'center',
                    backgroundColor: 'rgba(0, 2, 40, 0.21)',
                    marginTop: 8,
                  }}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    marginTop: 20,
                  }}
                >
                  <View style={styles.imgcontainer}>
                    <Image source={{ uri: SalesImageUrl }}style={styles.image} resizeMode="cover" />
                  </View>
                  <Text style={styles.salesTitle}>{dropDowntitle}</Text>
                </View>

                <View style={styles.cardconstinerdivider} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text
                    style={{
                      fontFamily: 'Urbanist-SemiBold',
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#FFFFFF',
                    }}
                  >
                    Total Orders: {salesData.length}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Urbanist-SemiBold',
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#FFFFFF',
                    }}
                  >
                    {/* Total Earnings: ${salesData.reduce((acc, buyer) => acc + parseFloat(buyer.amount), 0).toFixed(2)} */}
                    Total Earnings: £ {totalEarnings}

                  </Text>
                </View>
              </View>

              <View style={{ flex: 1, flexDirection: 'row', backgroundColor:Platform.OS==="android"? 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(0, 60, 163, 0.18) 0%, rgba(255, 255, 255, 0.03) 100%)' :'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(0, 60, 163, 0.18) 0%, rgba(255, 255, 255, 0.03) 100%)',}}>
                <ScrollView
                  style={{ flex: 1, paddingHorizontal: 16, backgroundColor: Platform.OS === 'android' ? 'transparent': 'rgba(1, 26, 86, 0.12)', }}
                  contentContainerStyle={{ paddingBottom: 70 }}
                  showsVerticalScrollIndicator={false}
                >
                  <Text allowFontScaling={false} style={styles.filterHeadTitle}>
                    Sold To
                  </Text>
                  {renderRightContent()}
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({

  statusBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 6,
    paddingRight: 6,
    gap:12,
    borderRadius: 4,
    justifyContent:'center',
    height: 20,
  },

  cardconstinerdivider: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
     borderBottomWidth: 1,
    borderColor: '#52577cff',
    borderStyle: 'dashed',
    height: 2,
    marginTop: 10,
    marginBottom: 10,
    
    },
  initialsCircle: {
    backgroundColor: 'rgba(63, 110, 251, 0.43)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 12,
  },
  initialsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
  },
  salesTitle: {
    fontWeight: '600',
    fontSize: 17,
    color: '#fff',
    marginBottom: 5,
    letterSpacing: 1,
    fontFamily: 'Urbanist-SemiBold',
  },
  image: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  imgcontainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    paddingTop: 9,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    alignItems: 'center',
    borderWidth: 0.4,
    borderColor: '#ffffff11',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(42, 126, 223, 0.67) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxSizing: 'border-box',
  },
  modeltitleContainer1: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor:
      Platform.OS === 'ios'
        ? 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(216, 229, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)'
        : '#5968bb8a',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modelcontainer: {
    height: '80%',
    marginTop: 'auto',
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor:
  'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgb(0, 60, 163) 0%, rgba(255, 255, 255, 0.03) 100%)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterHeadTitle: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'normal',
    letterSpacing: 0.32,
    lineHeight: 19.6,
    marginTop: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 12,
  },
});

export default SalesAllDetailsDropdown;
