import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { showToast } from '../../utils/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';
import { useRoute } from '@react-navigation/native';
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';

type ListingDetailsProps = {
  navigation: any;
};
const bgImage = require('../../../assets/images/bganimationscreen.png');
const ListingDetails = ({ navigation }: ListingDetailsProps) => {

  const scrollY1 = new Animated.Value(0);
  const route = useRoute();
  //const { shareid } = route.params as { shareid: number };
  const { shareid = 1 } = (route.params as { shareid?: number }) || {}
  const handleDeactivate = async () => {
  try {
    
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;

    const url2 = `${MAIN_URL.baseUrl}category/feature/active-inactive`;
    const response = await fetch(url2, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify({
        product_id: shareid, 
      }),
    });

    const data = await response.json();
    console.log("✅ API Response:", data);

    // if (response.ok) {
    //   showToast( "Product status updated!",'success');
    // } else {
    //   showToast("Error", data.message || "Something went wrong");
    // }
    if (data.message) {
      showToast(data.message, data.statusCode === 200 ? 'success' : 'error');
    } else {
      showToast("Something went wrong", "error");
    }
    
  } catch (error) {
    console.error("❌ API Error:", error);
    showToast("Failed to update product status",'error');
  }
};
  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.replace('Dashboard')}>
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.unizyText}>Listing Details</Text>
            <View style={{ width: 30 }} />
          </View>
        </View>


        <View >
           <ScrollView
            contentContainerStyle={styles.scrollContainer}
            onScroll={Animated.event([
                {
                nativeEvent: { contentOffset: { y: scrollY1 } },
                },
            ])}
            scrollEventThrottle={16}
            >
            <View style={{gap: 16,justifyContent:'center',alignItems:'center',width: '100%'}}>
                {/* Card */}
                <View style={styles.card}>
                    <View style={{ flexDirection: 'row'}}>
                        <Image source={require('../../../assets/images/drone.png')} style={styles.image} resizeMode="cover" />
                        <View style={{ marginLeft: 10,gap: 8}}>
                            <Text style={styles.productlebleHeader}>Quadcopter (Drone)</Text>
                            <Text style={styles.productlableprice}>$10</Text>
                            <View style={styles.univercitycontainer}>
                                <Text style={styles.universitylable}>University of Warwick</Text>
                                <Text style={styles.datetlable}>01-01-2025</Text>
                            </View>
                            
                        </View>
                    </View>
                    <View style={styles.cardconstinerdivider}/>
                    <View style={styles.listingtyperow}>
                        <Text style={styles.lebleHeader}>Listing Type:</Text>
                        <Text style={styles.status}>Featured</Text>
                    </View>
                    <View style={styles.listingtyperow}>
                        <Text style={styles.lebleHeader}>Listing Status:</Text>
                        <Text style={styles.status}>Active</Text>
                    </View>
                </View>

                <View style={styles.carddivider}/>

                {/* Seller Card */}
                <View style={styles.card}>
                    <View style={{ flexDirection: 'row',alignContent:'center',alignItems:'center',gap: 4,}}>
                        <Image source={require('../../../assets/images/sellerfile.png')} style={{width:24,height:24}} resizeMode="cover" />
                        
                        <Text style={styles.sellerHeaderlable}>Sale Details</Text>
                         
                    </View>
                    <View style={styles.cardconstinerdivider}/>
                    <View style={styles.listingtyperow}>
                        <Text style={styles.lebleHeader}>Buyer Name:</Text>
                        <Text style={styles.status}>Harry Kane</Text>
                    </View>
                    <View style={styles.listingtyperow}>
                        <Text style={styles.lebleHeader}>Buyer’s University:</Text>
                        <Text style={styles.status}>University of Warwick</Text>
                    </View>
                    <View style={styles.listingtyperow}>
                        <Text style={styles.lebleHeader}>City:</Text>
                        <Text style={styles.status}>Coventrys</Text>
                    </View>
                    <View style={styles.listingtyperow}>
                        <Text style={styles.lebleHeader}>Sold On:</Text>
                        <Text style={styles.status}>Jan 01, 2025 - 5:42 pm</Text>
                    </View>
                    <View style={styles.listingtyperow}>
                        <Text style={styles.lebleHeader}>Sold For:</Text>
                        <Text style={styles.status}>$10</Text>
                    </View>
                    <View style={styles.cardconstinerdivider}/>
                    <View style={{justifyContent:'center',alignItems:'center'}}>
                        <TouchableOpacity style={{width:'100%',justifyContent:'center',alignItems:'center'}}>
                            <Text style={styles.status}>Enter OTP</Text>
                        </TouchableOpacity>
                    </View>
                    
                </View>
                {/* Byer Card  */}
                <View style={styles.card}>
                    <View style={{ flexDirection: 'row',alignContent:'center',alignItems:'center',gap: 4,justifyContent: 'space-between'}}>
                        <View style={{flexDirection: 'row',alignContent:'center',alignItems:'center',gap: 4}}>
                            <Image source={require('../../../assets/images/sellerfile.png')} style={{width:24,height:24}} resizeMode="cover" />
                        
                            <Text style={styles.sellerHeaderlable}>Sale Details</Text>
                        </View>
                        <View style={{
                            display: 'flex',
                            paddingLeft: 6,
                            paddingRight: 6,
                            alignItems: 'center',
                            gap: 0,
                            padding: 6,
                            borderRadius: 6,
                            backgroundColor: 'rgba(255, 255, 255, 0.18)',
                            flexDirection: 'row'
                       
                        }}>
                            <Text style={{
                                color: 'rgba(255, 255, 255, 0.88)',
                                fontFamily: 'Urbanist-Regular',
                                fontSize: 12,
                                fontWeight: 600,
                                
                            }}>Completed </Text>
                            <Image source={require('../../../assets/images/tick.png')} style={{width:12,height:12}} resizeMode="cover" />
                        </View>
                         
                    </View>
                    <View style={styles.cardconstinerdivider}/>
                    <View style={styles.listingtyperow}>
                        <Text style={styles.lebleHeader}>Buyer Name:</Text>
                        <Text style={styles.status}>Alex Johnson</Text>
                    </View>
                    <View style={styles.listingtyperow}>
                        <Text style={styles.lebleHeader}>Buyer’s University:</Text>
                        <Text style={styles.status}>University of Warwick</Text>
                    </View>
                    <View style={styles.listingtyperow}>
                        <Text style={styles.lebleHeader}>City:</Text>
                        <Text style={styles.status}>Coventrys</Text>
                    </View>
                    <View style={styles.listingtyperow}>
                        <Text style={styles.lebleHeader}>Sold On:</Text>
                        <Text style={styles.status}>Jan 01, 2025 - 5:42 pm</Text>
                    </View>
                    <View style={styles.listingtyperow}>
                        <Text style={styles.lebleHeader}>Sold For:</Text>
                        <Text style={styles.status}>$10</Text>
                    </View>
                  
                    
                </View>
                </View>
                
          </ScrollView>

        </View>
        
            <View style={styles.bottomview}>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleDeactivate}>
                <Text style={styles.cancelText}>Deactivate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: '#ffffffa7' }]}
            
                >
                <Text style={[styles.cancelText, { color: '#000000' }]}>
                    Edit Listing
                </Text>
                </TouchableOpacity>
            </View>
        
      </View>
      <NewCustomToastContainer/>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  fullScreenContainer: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIconRow: {
    padding: 12,
    borderRadius: 40,

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    height: 48,
    width: 48,
  },
  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },

   card: {
   
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    overflow: 'hidden',
    gap: 10,
    width: '100%',
  },
  listingtyperow: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',    
  },
  lebleHeader:{
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.28,
    lineHeight:16,
    fontFamily: 'Urbanist-Medium',
  },
  status: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.28,
    lineHeight:16,
    fontFamily: 'Urbanist-SemiBold',
  },
   image: {
    width: 72,
    height: 76,
    borderRadius: 16,
  },
  univercitycontainer:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productlebleHeader:{
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight:16,
    fontFamily: 'Urbanist-SemiBold',
    paddingTop: 10
  },
  productlableprice:{
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight:16,
    fontFamily: 'Urbanist-SemiBold',

  },
  universitylable:{
    
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight:16,
    fontFamily: 'Urbanist-Medium',

  },
  datetlable:{
    marginLeft: 10,
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight:16,
    fontFamily: 'Urbanist-Medium',


  },
  carddivider:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        width: '90%',
        height: 1.5,
        // backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
        // boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
        borderStyle: 'dashed',
        borderBottomWidth: 1,
        // : 'rgba(255, 255, 255, 0.20)',
        borderBottomColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
        
    },
    cardconstinerdivider:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        width: '100%',
        height: 1.5,
        borderStyle: 'dashed',
        borderBottomWidth: 1,
        borderBottomColor: '#76c1f0ff',
    },
    sellerHeaderlable: {
        color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.24,
    lineHeight:16,
    fontFamily: 'Urbanist-SemiBold',
  
    },
     scrollContainer: {
    paddingBottom: 180,
    // paddingTop: 90,
    // paddingHorizontal: 20,
    paddingHorizontal: 16 ,width: '100%'
  },
  bottomview: {
    position: 'absolute',
    padding: 6,
    width: '100%',
    height: 60,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#5d5c5c14',
    zIndex: 10,
    bottom: 0,
  },
   cancelBtn: {
    flex: 1,
    marginRight: 8,
    padding: 12,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    // boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',

    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderBlockStartColor: '#ffffff47',
    borderBlockColor: '#ffffff47',

    borderTopColor: '#ffffff47',
    borderBottomColor: '#ffffff47',
    borderLeftColor: '#ffffff47',
    borderRightColor: '#ffffff47',

    boxSizing: 'border-box',
  },
    cancelText: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0.17,
    lineHeight: 19.6,
    
  },
});

export default ListingDetails;
