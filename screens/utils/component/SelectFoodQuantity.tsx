import { BlurView } from '@react-native-community/blur';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PayButton from './PayButton';

interface SelectFoodQuantityProps {
  options: { id: number; option_name: string }[];
  visible: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onSelect: (selectedId: number | number[]) => void; 
  selectedValues?: number | number[];
  price?: number | string;  
  totalcount:number
continueToPay?: (amount: number) => void;
 }
const SelectFoodQuantity = ({
  options,
  visible,
  title,
  subtitle,
  onClose,
  onSelect,
  selectedValues,
  price,
  totalcount,
  continueToPay
}: SelectFoodQuantityProps) => {
  
  const screenHeight = Dimensions.get('window').height;

  const [count, setCount] = useState(1);
  const maxUnits = Number(totalcount);
 const unitPrice = Number(price ?? 0);
  const totalPrice = unitPrice * count;

const handleApply = () => {
 
  if (continueToPay) {
    const finalAmount = Number(totalPrice.toFixed(2));
    continueToPay(finalAmount);
  }

//  onClose();
};
  return (
    <View  style={[StyleSheet.absoluteFillObject,{zIndex: 999,display: visible ? 'flex' : 'none'}]}>
      <BlurView
      style={[StyleSheet.absoluteFillObject]}
      blurType="dark"
      blurAmount={Platform.OS === 'ios' ? 2 : 2}
      reducedTransparencyFallbackColor="transparent"
    />
    <Modal
      animationType="slide"
      visible={visible}
      transparent
      onRequestClose={onClose}
    >

    <View style={{ flex: 1,justifyContent: 'flex-end', }}>

      <View style={styles.overlay}>

  <TouchableWithoutFeedback onPress={onClose}>
    <View style={StyleSheet.absoluteFillObject} />
  </TouchableWithoutFeedback>
        <View style={styles.modelcontainer}>
          <BlurView
          blurType={Platform.OS === 'ios' ? 'light' : 'dark'}
            style={[
              // StyleSheet.absoluteFill,
             { position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              opacity: 1,
           
            }
            ]}
            blurAmount={Platform.OS === 'ios' ? 50 : 10}
            reducedTransparencyFallbackColor="none"
          />

          <View style={styles.modeltitleContainer}>
              <View style={{width: '100%',alignSelf: 'center',alignItems: 'center',paddingBottom: 10}}>
              <View style={{height:5,backgroundColor: 'rgba(0, 0, 0, 0.57)',flexDirection: 'row',width: '15%',borderRadius: 10,top:-10}}/>

              </View>
            <View
              style={{
                flexDirection: 'column',
              }}
            >
              <View style={styles.header}>
                <View style={styles.optionHeader}>
                  <View style={styles.checkboxImage}>
                      <Image
                      source={require('../../../assets/images/food_quan.png')}
                      style={{ width: 24, height: 24 }}
                    />
                  </View>
                  <Text allowFontScaling={false} style={styles.modelTextHeader}>{title}</Text>
                </View>
                <Text allowFontScaling={false} style={styles.orderandTotalEarings}>
                  {subtitle}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              width: '100%',
              minHeight: screenHeight * 0.2, 
              maxHeight: screenHeight * 0.6,
              paddingHorizontal: 10,
            }}
          >
            <ScrollView  showsVerticalScrollIndicator={false} contentContainerStyle={{ }}>
              {options.map((option, index) => {
              
                  return (
                      <View
                        style={{
                          paddingHorizontal: 10,
                          marginTop: 10,
                        }}
                        key={index}
                      >
                        <View style={styles.radioButtonContainer}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: 10,
                              justifyContent: 'space-between',
                              width: '100%',
                            }}
                          >
                            <Text
                              allowFontScaling={false}
                              style={{
                                color: 'rgba(255,255,255,0.72)',
                                fontSize: 14,
                                marginLeft: 10,
                                fontWeight: 500,
                                lineHeight: 18,
                                letterSpacing: -0.28,
                                fontFamily: 'Urbanist-Medium',
                              }}
                            >
                              Available Units:{' '}
                              <Text style={{ color: '#fff',
                                fontSize: 17,
                                fontWeight: 600,
                                lineHeight: 18,
                                letterSpacing: -0.28,
                                fontFamily: 'Urbanist-SemiBold', }}>
                                {maxUnits}
                              </Text>
                            </Text>

                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                              }}
                            >
                              {/* Minus Button */}
                              <TouchableOpacity
                                disabled={count === 1}
                                onPress={() => setCount(prev => Math.max(1, prev - 1))}
                              >
                                <Image
                                  source={
                                    count === 1
                                      ? require('../../../assets/images/blur_minus_512.png')
                                      : require('../../../assets/images/icon1.png')
                                  }
                                  style={{ width: 44, height: 44 }}
                                />
                              </TouchableOpacity>

                              {/* Count */}
                              <Text
                                style={{
                                  color: '#FFF',
                                  fontSize: 20,
                                  width: 30,
                                  textAlign: 'center',
                                  fontFamily: 'Urbanist-SemiBold',
                                  fontWeight:600
                                }}
                              >
                                {count}
                              </Text>

                              {/* Plus Button */}
                              <TouchableOpacity
                                disabled={count === maxUnits}
                                onPress={() => setCount(prev => Math.min(maxUnits, prev + 1))}
                              >
                                <Image
                                  source={
                                    count === maxUnits
                                      ? require('../../../assets/images/blur_plus_512.png')
                                      : require('../../../assets/images/icon2.png')
                                  }
                                  style={{ width: 44, height: 44 }}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    );

              })}
               <View style={styles.cardconstinerdivider} />
            </ScrollView>
    
          </View>
  
             <PayButton
            amount={Number(totalPrice.toFixed(2))}
            label={ "Pay"}
            onPress={handleApply}
          />
        </View>
        

      </View>

      </View>
    </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  tickImage:{
   height:24,
   width:24
  },
  cardconstinerdivider: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    height: 1,
    borderColor: '#52577cff',
    marginTop:24
  },
  checkedBox: {
    //backgroundColor: '#ffffff',
  },
  tickMark: {
  color: '#260426ff', 
  fontSize: 10,
  textAlign: 'center',
  fontWeight: '600',
  lineHeight: 10, // keeps it centered
},
  
  radioButtonContainer: {
    marginTop: 10,
    // alignItems: 'center',
  },
  radioButton: {
    width: 19,
    height: 19,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadio: {
    backgroundColor: 'rgba(0, 0, 255, 0)', // Radio button color when selected
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 7,
    backgroundColor: '#fff',
  },
  checkboxWrapper: {
  width: 19,
  height: 19,
  justifyContent: 'center',
  alignItems: 'center',
},
  checkboxContainer: {
    //width: 19,
    //height: 19,
    height:'100%',
    width:'100%',

    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    //marginTop: 10,
   // overflow:'hidden'
  },
  orderandTotalEarings: {
    color: '#FFFFFF',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    opacity: 0.64,
    //textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1,
    marginTop: 10,
    
  },
  header: {
    
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkboxImage: {
    display: 'flex',
    width: 44,
    height: 44,
    padding: 8,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.25)',
  },
  modeltitleContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal:20,
    // backgroundColor: 'rgba(98, 132, 255, 0.46)',
    backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(254, 254, 254, 0.11) 0%, rgba(39, 75, 253, 0.03) 100%)',

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  
  
  },
  broderTopLeftRightRadius_30: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modelcontainer: {
    backgroundColor:
  'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(0, 60, 163, 0.05) 0%, rgba(255, 255, 255, 0.03) 100%)',

    
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    // filter: 'drop-shadow(0 0.833px 3.333px rgba(255, 255, 255, 0.18))',
    gap: 5,
    opacity: 0.8,
    overflow:'hidden'
  },
  // bottomview: {
  //   padding: 16,
  //   width: '100%',
  //   display: 'flex',
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   paddingBottom: (Platform.OS === 'ios' ? 40 : 20),
  //   paddingTop:16,
  //   alignItems:'center',
  //   alignContent:'center',
  //   gap:8

  // },
  radioButtonSelected: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff2d',
    boxShadow: '0 0.833px 3.333px 0 rgba(0, 0, 0, 0.25);',
  },
  radioButton_round: {
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    width: 15,
    height: 15,
    flexShrink: 0,
    borderColor: '#ffffff4e',

    alignItems: 'center',
    borderRadius: 50,
    justifyContent: 'center',
    boxShadow: '0 0.833px 3.333px 0 rgba(0, 0, 0, 0.25);',
    shadowColor: '0 0.833px 3.333px rgba(0, 0, 0, 0.25',
  },
  cancelBtn: {
    minHeight:48,
    flex: 1,
    //marginRight: 8,
    padding: 12,
    borderRadius: 50,
    // backgroundColor: 'gray',
    backgroundColor: '#ffffff1b',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px 0 rgba(75, 75, 75, 0.19)',
  },
  overlay: {
    //backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
    // opacity: 0.8
  },
  filtertitle: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'normal',
    width: '100%',
  },
  filterHeadTitle: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'normal',
    letterSpacing: 0.32,
    lineHeight: 19.6,
  },
  filtertitleFilteryBy: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-Medium',
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'normal',
  },
  filtertype: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderRadius: 14,
    boxShadow:
      '0 2px 8px 0 rgba(0, 0, 0, 0.25)inset 0 2px 8px 0 rgba(0, 0, 0, 0.25)',

    justifyContent: 'center',
    padding: 16,
    gap: 4,
    marginBottom: 5,
  },

  modelLeftSideContainer: {
    width: '40%',
    height: '100%',
    padding: 16,
    backgroundColor: '#5d5c5c0b',
  },
  modelTextHeader: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'normal',
    letterSpacing: -0.34,
    lineHeight: 19.6,
  },
  clearAll: {
    color: 'rgba(255, 255, 255, 0.54)',
    fontFamily: 'Urbanist-Regular',
    fontSize: 17,
    fontWeight: '600',
    fontStyle: 'normal',
    letterSpacing: -0.34,
    lineHeight: 19.6,
  },
  addButton: {
    position: 'absolute',
    zIndex: 11,
    right: 20,
    bottom: 90,
    backgroundColor: '#98B3B7',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },

  addButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  cancelText: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-Medium',
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 0.17,
    //lineHeight: 19.6,
  },

  inactiveTab: {
    display: 'flex',
    alignItems: 'center',

    borderRadius: 14,

    justifyContent: 'center',
    padding: 16,
    gap: 4,
    marginBottom: 5,
  },
  activeTab: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(151, 151, 151, 0.4) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#ffffff0e',
    // boxShadow:
    //   '0 0px 2px 1px rgba(255, 255, 255, 0.16)inset',
    justifyContent: 'center',
    padding: 16,
    gap: 4,
    marginBottom: 5,
    boxShadow: 'rgba(255, 255, 255, 0.16) inset -1px 0px 4px 2px',
  },

  filterTypeTab: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: 14,
    boxShadow:
      '0 2px 8px 0 rgba(0, 0, 0, 0.25)inset 0 2px 8px 0 rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 5,
    textAlign: 'center',
  },
});
export default SelectFoodQuantity;


