import {
  View,
  Text,
  ImageBackground,
  Platform,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { useState } from 'react';
import { BlurView } from '@react-native-community/blur';

type SearchDetailsProps = {
  navigation: any;
};

 const { width } = Dimensions.get('window');

const profileImg = require('../../../assets/images/user.jpg');



const SearchDetails = ({ navigation }: SearchDetailsProps) => {
     const [showPopup, setShowPopup] = useState(false);
       const closePopup = () => setShowPopup(false);
         const [scrollY, setScrollY] = useState(0);
         const scrollY1 = new Animated.Value(0);
  return (
    <ImageBackground
      source={require('../../../assets/images/bganimationscreen.png')}
      style={{ width: '100%', height: '100%' }}
      resizeMode="cover">
        
        <View style={styles.fullScreenContainer}>
     
       <View style={styles.header}>
                <View style={styles.headerRow}>
                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => {
                      navigation.navigate('Dashboard');
                    }}
                  >
                    <View style={styles.backIconRow}>
                      <Image
                        source={require('../../../assets/images/back.png')}
                        style={{ height: 24, width: 24 }}
                      />
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.unizyText}>List Product</Text>
                  <View style={{ width: 30 }} />
                </View>
              </View>
          

       <ScrollView
                 contentContainerStyle={styles.scrollContainer}
                 onScroll={Animated.event([
                   {
                     nativeEvent: { contentOffset: { y: scrollY1 } },
                   },
                 ])}
                 scrollEventThrottle={16}
               >
            <Image
                 source={require('../../../assets/images/drone.png')}
            style={{ width: '100%', height: '40%' }}
            resizeMode="cover"
            />
        <View style={{ flex: 1, padding: 16 }}>
          <View style={styles.card}>
            <View style={{ gap: 8 }}>
              <Text style={styles.QuaddText}>Quadcopter (Drone)</Text>
              <Text style={styles.priceText}>$10.00</Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
                alignSelf: 'stretch',
              }}
            >
              <Text style={styles.productDesHeding}>Product Description</Text>
              <Text style={styles.productDesc}>
                Your pocket-sized flying buddy! Perfect for capturing epic
                campus shots, recording events, or just having fun with friends.
                Easy to fly, stable in the air, and ready for adventure.
              </Text>
              <View style={styles.datePosted}>
                <Image
                  source={require('../../../assets/images/calendar_icon.png')}
                  style={{ height: 16, width: 16 }}
                />
                <Text style={styles.userSub}>Date Posted:10-01-2025</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.gap12}>
              <Text style={styles.productDeatilsHeading}>Product Details</Text>
              <View style={{ gap: 8 }}>
                {/* <View> */}
                  <Text style={styles.itemcondition}>Item Condition</Text>
                  <Text style={[styles.new,{marginTop: -6}]}>New</Text>
                {/* </View> */}
                <View style={styles.gap4}>
                  <Text style={styles.catagory}>Category</Text>
                  <View style={styles.categoryContainer}>
                    <View style={styles.categoryTag}>
                      <Text style={styles.catagoryText}>Category 1</Text>
                    </View>
                    <Text style={styles.categoryTag}>
                      <Text style={styles.catagoryText}>Category 1</Text>
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Selaer details */}
          <View style={styles.card}>
            <View style={{ gap: 12 }}>
              <Text style={styles.productDeatilsHeading}>Seller Details</Text>

              {/* User Info */}
              <View style={{ flexDirection: 'row' }}>
                <Image source={profileImg} style={styles.avatar} />

                <View style={{ width: '80%', gap: 4 }}>
                  <Text style={styles.userName}>Alan Walker</Text>
                
                    <Text style={styles.univeritytext}>
                      University of Warwick,
                    </Text>
                    <Text style={[styles.univeritytext,{marginTop: -5}]}>Coventry</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View
                  style={{
                    borderRadius: 10,
                    backgroundColor:
                      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
                    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 4,
                    padding: 16,

                    width: '20%',
                  }}
                >
                  <Image
                    source={require('../../../assets/images/staricon.png')}
                    style={{ height: 16, width: 16 }}
                  />

                  <Text
                    style={{
                      color: 'rgba(255, 255, 255, 0.48)',
                      fontFamily: 'Urbanist-SemiBold',
                      fontSize: 14,
                      fontWeight: '600',
                      fontStyle: 'normal',
                      letterSpacing: -0.28,
                    }}
                  >
                    4.5
                  </Text>
                </View>
                <View
                  style={{
                    borderRadius: 10,
                    backgroundColor:
                      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
                    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 4,
                    padding: 16,
                    width: '80%',
                  }}
                >
                  <Image
                    source={require('../../../assets/images/message_chat.png')}
                    style={{ height: 16, width: 16 }}
                  />
                  <Text
                    style={{
                      color: 'rgba(255, 255, 255, 0.48)',
                      fontFamily: 'Urbanist-SemiBold',
                      fontSize: 14,
                      fontWeight: '600',
                      fontStyle: 'normal',
                      letterSpacing: -0.28,
                    }}
                  >
                    Chat with Seller
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        </ScrollView>


      {/* Bottom */}
      <TouchableOpacity
        style={styles.previewBtn}
        onPress={() => {
          setShowPopup(true);
        }}
      >
        <Text style={styles.previewText}>List</Text>
      </TouchableOpacity>
      {/* </ScrollView> */}

      <Modal
        visible={showPopup}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.overlay}>
          <BlurView
            style={{
              flex: 1,
              alignContent: 'center',
              justifyContent: 'center',
              width: '100%',
              alignItems: 'center',
            }}
            blurType="dark"
            blurAmount={1000}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
          >
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(0, 0, 0, 0.32)' },
              ]}
            />
 
            <View style={styles.popupContainer}>
              <Image
                source={require('../../../assets/images/success_icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={{
                color: 'rgba(255, 255, 255, 0.80)',
                fontFamily: 'Urbanist-SemiBold',
                fontSize: 20,
                fontWeight: '600',
                fontStyle: 'normal',
                letterSpacing: -0.4,
                lineHeight: 28,
              }}>Product Listed Successfully!</Text>
              <Text style={{
                color: 'rgba(255, 255, 255, 0.48)',
                fontFamily: 'Urbanist-Regular',
                fontSize: 14,
                fontWeight: '400',
                fontStyle: 'normal',
                letterSpacing: -0.28,
                lineHeight: 19.6,
              }}>
                Your product is now live and visible to other students.
              </Text>
 
              <TouchableOpacity
                style={styles.loginButton}
                onPress={()=>{navigation.navigate('Dashboard') ;setShowPopup(false);}}
              >
                <Text style={styles.loginText}>Return to Choose Category</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
    unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    marginTop: 25,
  },
      backBtn: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

    header: {
    height: 70,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    // overflow: 'hidden',


  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
    fullScreenContainer: {
    flex: 1,
  },

      loginText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    width: '100%',
  },
 
      loginButton: {
    display: 'flex',
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    marginTop: 16,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
  },
     termsText1: {
    color: 'rgba(255,255,255,0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
      logo: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },
 
      popupContainer: {
    width: width * 0.85,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    overflow: 'hidden',
 
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
    overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
 
  previewText: {
    color: '#002050',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
  },
  previewBtn: {
    display: 'flex',
    width: '90%',
    alignSelf: 'center',
    alignContent: 'center',
    paddingHorizontal: 20,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',

    position: 'absolute',
    bottom: 10,
  },
  scrollContainer: {
    paddingBottom: 280,
    paddingTop: 90,
    // paddingHorizontal: 20,
  },

  datePosted: {
    flexDirection: 'row',
    height: 'auto',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.09) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    borderRadius: 8,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 6,
    paddingBottom: 6,

    alignItems: 'center',
    gap: 3,
  },

  userSub: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: -0.24,
  },
  univeritytext: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    fontWeight: '500',
  },
  userName: {
    position: 'relative',
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.32,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  gap12: {
    gap: 12,
  },
  gap4: {
    gap: 4,
  },
  catagory: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
  },
  new: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 20,
  },
  itemcondition: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  catagoryText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 16,
    color: '#fff',
  },
  categoryTag: {
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderWidth: 0.9,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderBlockEndColor: 'rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.48)',
    borderRadius: 4,
    marginRight: 8,
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.23)',
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 2,
    paddingBottom: 2,
  },
  productDesHeding: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
  },
  productDesc: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 20,
  },
  productDeatilsHeading: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: -0.36,
  },

  QuaddText: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    fontStyle: 'normal',
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  priceText: {
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '700',
    fontStyle: 'normal',
    letterSpacing: -0.4,
    lineHeight: 24,
  },

  card: {
    flexDirection: 'column',
    marginBottom: 6,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  h24_w24: {
    width: 24,
    height: 24,
  },
  backIconRow: {
    padding: 12,
    borderRadius: 40,
    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    height: 48,
    width: 48,
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewThumbnail: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
});

export default SearchDetails;
