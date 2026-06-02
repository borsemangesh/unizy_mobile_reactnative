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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

interface SelectFoodQuantity_IOSProps {
  options: { id: number; option_name: string }[];
  visible: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onSelect: (selectedId: number | number[]) => void;
  selectedValues?: number | number[];
  price?: number | string;
  totalcount: number
  continueToPay?: (amount: number) => void;
    feePercentage?: number;
  fixedFee?: number;
}
const SelectFoodQuantity_IOS = ({
  options,
  visible,
  title,
  subtitle,
  onClose,
  onSelect,
  selectedValues,
  price,
  totalcount,
  continueToPay,
    feePercentage,
  fixedFee
}: SelectFoodQuantity_IOSProps) => {

  const screenHeight = Dimensions.get('window').height;

  const [count, setCount] = useState(1);
  const maxUnits = Number(totalcount);
  // const unitPrice = Number(price ?? 0);
  // const totalPrice = unitPrice * count;
  const unitPrice = Number(price ?? 0);

const subtotal = unitPrice * count;

const feeAmount =
  subtotal * (Number(feePercentage) / 100);

const totalPrice =
  subtotal +
  feeAmount +
  Number(fixedFee);

  const { t } = useTranslation();
  const handleApply = async () => {
    try {
      await AsyncStorage.setItem('quantitycount', String(count));
    } catch (e) {
      // console.log('storage error', e);
    }

    if (continueToPay) {
      const finalAmount = Number(totalPrice.toFixed(2));
      continueToPay(finalAmount);
    }
  };
  return (
    <View
      onTouchCancel={onClose}
      style={[
        StyleSheet.absoluteFillObject,
        { zIndex: 999, display: visible ? 'flex' : 'none' },
      ]}
    >
      {' '}
      <BlurView
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0, borderRadius: 30,
            backgroundColor: 'rgba(119, 173, 255, 0.07)'
          },

        ]}
        blurType="dark"
        blurAmount={3}
        pointerEvents='none'
        reducedTransparencyFallbackColor="white"
      />
      <Modal
        animationType="slide"
        visible={visible}
        transparent
        onRequestClose={onClose}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.modelcontainer}>
            <BlurView
              blurType={Platform.OS === 'ios' ? 'light' : 'dark'}
              style={[
                {
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  opacity: 1,
                },
              ]}
              blurAmount={Platform.OS === 'ios' ? 5 : 10}
              reducedTransparencyFallbackColor="none"
            />
            <View style={styles.modeltitleContainer}>
              <View
                style={{
                  width: '100%',
                  alignSelf: 'center',
                  alignItems: 'center',
                  paddingBottom: 10,
                }}
              >
                <View
                  style={{
                    height: 5,
                    backgroundColor: 'rgba(0, 0, 0, 0.57)',
                    flexDirection: 'row',
                    width: '15%',
                    borderRadius: 10,
                    top: -10,
                  }}
                />
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
                    <Text
                      allowFontScaling={false}
                      style={styles.modelTextHeader}
                    >
                      {title}
                    </Text>
                  </View>
                  <Text
                    allowFontScaling={false}
                    style={styles.orderandTotalEarings}
                  >
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
                backgroundColor:
                  Platform.OS === 'ios' ? 'rgba(2, 6, 131, 0.26)' : 'none',
              }}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{}}
              >
                {options.map((option, index) => {
                  return (
                    <View
                      style={{
                        paddingHorizontal: 10,
                        marginTop: 10,
                        marginBottom: 10,
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
                            {t('Available_Units')}:{' '}
                            <Text
                            allowFontScaling={false}
                              style={{
                                color: '#fff',
                                fontSize: 17,
                                fontWeight: 600,
                                lineHeight: 18,
                                letterSpacing: -0.28,
                                fontFamily: 'Urbanist-SemiBold',
                              }}
                            >
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
                            <TouchableOpacity
                              disabled={count === 1}
                              onPress={() =>
                                setCount(prev => Math.max(1, prev - 1))
                              }
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

                            <Text
                            allowFontScaling={false}
                              style={{
                                color: '#FFF',
                                fontSize: 20,
                                width: 30,
                                textAlign: 'center',
                                fontFamily: 'Urbanist-SemiBold',
                                fontWeight: 600,
                              }}
                            >
                              {count}
                            </Text>

                            <TouchableOpacity
                              disabled={count === maxUnits}
                              onPress={() =>
                                setCount(prev => Math.min(maxUnits, prev + 1))
                              }
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
              label={t('pay')}
              onPress={handleApply}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({

  cardconstinerdivider: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '95%',
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    marginHorizontal: 10,
    backgroundColor: (Platform.OS === 'ios' ? 'rgba(2, 6, 131, 0.26)' : 'none'),
    height: 1,
    borderColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)'
  },
 
  radioButtonContainer: {
    marginTop: 10,

  },
 
  orderandTotalEarings: {
    color: '#FFFFFF',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    opacity: 0.64,
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
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,

  },
  
  modelcontainer: {
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(10, 64, 156, 0.05) 0%, rgba(255, 255, 255, 0.03) 100%)',
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    opacity: 0.8,
    overflow: 'hidden'
  },
 
  modelTextHeader: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'normal',
    letterSpacing: -0.34,
    lineHeight: 22,
  },

});
export default SelectFoodQuantity_IOS;


