 //IOS
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { MAIN_URL } from '../APIConstant';

interface FilterBottomSheetProps {
  catagory_id: number;
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void; // 👈 new callback
  from: number;
  to: number;
  initialFilters?: any;
}

const SelectCatagoryDropdown = ({
  catagory_id,
  visible,
  onClose,
  initialFilters,
  
}: FilterBottomSheetProps) => {
  const [filters, setFilters] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  const [dropdownSelections, setDropdownSelections] = useState<
    Record<number, number[]>
  >({});

  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sliderLow, setSliderLow] = useState(priceRange.min);
  const [sliderHigh, setSliderHigh] = useState(priceRange.max);
  const productImage = require('../../../assets/images/producticon.png');

  const fetchFilters = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const body = { category_id: catagory_id };
      const url = MAIN_URL.baseUrl + 'category/feature/filter';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.statusCode === 200) {
        const dynamicFilters = data.data.filter(
          (item: any) =>
            item.field_type?.toLowerCase() === 'dropdown' ||
            item.alias_name?.toLowerCase() === 'price',
        );
        console.log('Current Filter: ' + dynamicFilters);
        setFilters(dynamicFilters);
        if (!selectedTab && dynamicFilters.length) {
          setSelectedTab(dynamicFilters[0].field_name);
        }
      }
    } catch (err) {
      console.log('Error fetching filters:', err);
    }
  };

  useEffect(() => {
    if (visible) fetchFilters();
  }, [visible]);

  useEffect(() => {
    if (visible && initialFilters?.filters?.length > 0) {
      const savedDropdowns: any = {};

      initialFilters.filters.forEach((f: any) => {
        if (f.field_type === 'dropdown') {
          savedDropdowns[f.id] = f.options;
        }

        if (
          f.alias_name?.toLowerCase() === 'price' &&
          Array.isArray(f.options)
        ) {
          setPriceRange({ min: f.options[0], max: f.options[1] });
          setSliderLow(f.options[0]);
          setSliderHigh(f.options[1]);
        }
      });

      setDropdownSelections(savedDropdowns);
    }
  }, [visible, initialFilters]);


  const handleClose = () => {

    if (initialFilters?.filters?.length > 0) {
      const savedDropdowns: Record<number, number[]> = {};

      initialFilters.filters.forEach((f: any) => {
        if (f.field_type === 'dropdown' && Array.isArray(f.options)) {
          savedDropdowns[f.id] = f.options;
        }

        if (
          f.alias_name?.toLowerCase() === 'price' &&
          Array.isArray(f.options)
        ) {
          const [min, max] = f.options;
          setPriceRange({ min, max });
          setSliderLow(min);
          setSliderHigh(max);
        }
      });

      setDropdownSelections(savedDropdowns);
    } else {

      setDropdownSelections({});
      setPriceRange({ min: 0, max: 10000 });
      setSliderLow(0);
      setSliderHigh(10000);
    }

    onClose(); 
  };

  const getInitials = (firstName = '', lastName = '') => {
    const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
    const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';
    return f + l || '?';
  };

  const renderRightContent = () => {
    const currentFilter = filters.find(f => f.field_name === selectedTab);
    if (!currentFilter) return null;

      return (
        <ScrollView
          style={{ flexGrow: 0, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {currentFilter.options.map((opt: any) => (
            <View style={{}}>
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
                <View style={styles.initialsCircle}>
                    <Text allowFontScaling={false} style={styles.initialsText}>
                      {getInitials('Alan', 'Walker')}
                    </Text>
                  </View>
                <View style={{ gap: 4, flex: 0.5 }}>
                  
                  <Text
                    style={{
                      color: 'rgb(255, 255, 255)',
                      fontWeight: '600',
                      fontFamily: 'Urbanist-SemiBold',
                      fontSize: 14,
                    }}
                  >
                    Christopher Nolan
                  </Text>
                  <Text
                    style={{
                      color: 'rgb(255, 255, 255)',
                      fontWeight: '600',
                      fontFamily: 'Urbanist-SemiBold',
                      fontSize: 12,
                    }}
                  >
                    University of Warwick
                  </Text>
                </View>
                <View style={{ gap: 4, alignItems: 'flex-end', flex: 0.5 }}>
                  <Text
                    style={{
                      color: 'rgb(255, 255, 255)',
                      fontWeight: '600',
                      fontFamily: 'Urbanist-SemiBold',
                      fontSize: 14,
                    }}
                  >
                    $20
                  </Text>
                  <Text
                    style={{
                      color: 'rgb(255, 255, 255)',
                      fontWeight: '600',
                      fontFamily: 'Urbanist-regular',
                      fontSize: 12,
                    }}
                  >
                    01 - 01 -2025
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      );
  
  };

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { zIndex: 999, display: visible ? 'flex' : 'none' },
      ]}
    >
      <BlurView
        style={[StyleSheet.absoluteFillObject]}
        blurType="dark"
        blurAmount={Platform.OS === 'ios' ? 2 : 4}
        reducedTransparencyFallbackColor="transparent"
      />
      <Modal
        animationType="slide"
        visible={visible}
        transparent
        onRequestClose={handleClose}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end'}}
        >
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={handleClose}>
              <View style={StyleSheet.absoluteFillObject} />
            </TouchableWithoutFeedback>
            <View style={[styles.modelcontainer]}>
              <BlurView
                style={[StyleSheet.absoluteFillObject]}
                blurType="dark"
                blurAmount={Platform.OS === 'ios' ? 10 : 4}
                reducedTransparencyFallbackColor="transparent"
              />

              <View style={styles.modeltitleContainer1}>
                <View
                  style={{
                    width: 50,
                    height: 4,
                    borderRadius: 2,
                    alignSelf: 'center',
                    // backgroundColor: '#000228',
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
                    <Image
                      source={productImage}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={styles.salesTitle}>Full House Cleaning</Text>
                </View>

                <View/>

                <View style={styles.cardconstinerdivider} />
              <View style={{flexDirection: 'row', justifyContent: 'space-between',}}>
                <Text style={{fontFamily: 'Urbanist-SemiBold',fontSize: 12,fontWeight: '600',color: '#FFFFFF'}}>Total Orders: 04</Text>
                <Text style={{fontFamily: 'Urbanist-SemiBold',fontSize: 12,fontWeight: '600',color: '#FFFFFF'}}>Total Earnings: $80</Text>
              </View>
              </View>
         

              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                }}
              >
               
                <ScrollView
                  style={{
                    flex: 1,
                    paddingHorizontal: 16,
                  }}
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

  cardconstinerdivider: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    backgroundColor: (Platform.OS === 'ios' ? 'rgba(67, 170, 234, 0.09)' : 'none'),
    height: 2,
    marginTop: 10,
    marginBottom: 10,
    borderColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)'
  },
  initialsCircle: {
    backgroundColor: 'rgba(63, 110, 251, 0.43)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
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
    // padding: 8,
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
  tickImage: {
    height: 24,
    width: 24,
  },

  modeltitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 26,
    backgroundColor: 'rgba(0, 0, 0, 0.07)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modeltitleContainer1: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor:
      Platform.OS === 'ios' ? 'redail-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.10) 100%)' : 'rgba(0, 0, 0, 0.07)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  broderTopLeftRightRadius_30: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modelcontainer: {
    height: '80%',
    marginTop: 'auto',
    // backgroundColor:
    //   'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(0, 29, 252, 0.08) 0%, rgba(255, 255, 255, 0.10) 100%)',
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    // opacity: 0.91,
    overflow: 'hidden',
  },
  bottomview: {
    padding: 10,
    width: '100%',
    height: '10%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,

    // backgroundColor: 'rgba(0, 0, 0, 0.001)',
    // backgroundColor:
    //   Platform.OS === 'ios' ? 'rgba(37, 76, 176, 0.18)' : 'rgba(0, 0, 0, 0.07)',

    // marginBottom:16
    position: 'absolute',
    bottom: 0,
  },
  radioButtonSelected: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff4e',
    boxShadow: '0 0.833px 3.333px 0 rgba(0, 0, 0, 0.25);',
  },
  radioButton: {
    width: 8,
    height: 8,
    borderRadius: 10,
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
    minHeight: 48,
    flex: 1,
    marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 40,
    //backgroundColor: 'rgba(138, 135, 135, 0.63)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(197, 196, 196, 0.49) 0%, rgba(255, 255, 255, 0.32) 100%)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px 0 rgba(75, 75, 75, 0.19)',
  },

  loginButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    borderColor: '#ffffff2c',
    minHeight: 48,
    flex: 1,
    //marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 50,
  },

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  activeTabText: {
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'normal',
    width: '100%',
  },
  inactiveTabText: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'normal',
    width: '100%',
  },

  filtertitle: {
    color: '#fff',
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
    marginTop: 12,
  },
  filtertitleFilteryBy: {
    color: '#fff',
    fontFamily: 'Urbanist-Medium',
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'normal',
  },
  filtertype: {
    display: 'flex',
    alignItems: 'center',
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
    // backgroundColor:
    //   Platform.OS === 'ios' ? 'rgba(37, 76, 176, 0.18)' : 'rgba(0, 0, 0, 0.07)',

    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(22, 49, 110, 0.20)' : 'rgba(0, 0, 0, 0.07)',
  },
  modelTextHeader: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.34,
    lineHeight: 19.6,
  },
  clearAll: {
    color: 'rgba(255, 255, 255, 0.54)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 0.17,
    lineHeight: 19.6,
  },

  sendText: {
    color: '#000016',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
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
    justifyContent: 'center',
    padding: 16,
    gap: 4,
    marginBottom: 5,
    boxShadow: 'rgba(255, 255, 255, 0.16) inset -1px 0px 4px 2px',
    height: 80,
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
export default SelectCatagoryDropdown;
