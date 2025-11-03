


import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  FlatList,
  TextInput,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { BlurView } from '@react-native-community/blur';
import { CONSTDEFAULT } from '../CONSTDEFAULT';
import { MAIN_URL } from '../APIConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RangeSlider from 'rn-range-slider';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Button from './Button';


interface FilterBottomSheetProps {
  catagory_id: number;
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void; // 👈 new callback
  from: number;
  to: number;
  initialFilters?: any; 
  
}
const FilterBottomSheet = ({
  catagory_id,
  visible,
  onClose,
  onApply,
  initialFilters
}: FilterBottomSheetProps) => {
  const [filters, setFilters] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  const [dropdownSelections, setDropdownSelections] = useState<
    Record<number, number[]>
  >({});

  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sliderLow, setSliderLow] = useState(priceRange.min);
  const [sliderHigh, setSliderHigh] = useState(priceRange.max);



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
        console.log("Current Filter: "+ dynamicFilters);
        setFilters(dynamicFilters);
        //if (dynamicFilters.length) setSelectedTab(dynamicFilters[0].field_name);
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

    initialFilters.filters.forEach((f:any) => {
      if (f.field_type === 'dropdown') {
        savedDropdowns[f.id] = f.options;
      }

      if (f.alias_name?.toLowerCase() === 'price' && Array.isArray(f.options)) {
        setPriceRange({ min: f.options[0], max: f.options[1] });
        setSliderLow(f.options[0]);
        setSliderHigh(f.options[1]);
      }
    });

    setDropdownSelections(savedDropdowns);
  }
}, [visible, initialFilters]);

  const handleTabPress = (tabName: string) => {
    setSelectedTab(tabName);
  };

  const toggleDropdownOption = (fieldId: number, optionId: number) => {
    setDropdownSelections(prev => {
      const current = prev[fieldId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [fieldId]: current.filter(id => id !== optionId) };
      } else {
        return { ...prev, [fieldId]: [...current, optionId] };
      }
    });
  };

const handleClearFilters = () => {
  setDropdownSelections({});
  setPriceRange({ min: 0, max: 10000 });
  setSliderLow(0);
  setSliderHigh(10000);
  //setSelectedTab(null);
  //onClose();
};
//  const handleClose = () => {
//   onClose(); // ✅ Only close, no reset
// };

const handleClose = () => {
  // ✅ Restore last applied filters when cancelling
  if (initialFilters?.filters?.length > 0) {
    const savedDropdowns: Record<number, number[]> = {};

    initialFilters.filters.forEach((f: any) => {
      if (f.field_type === "dropdown" && Array.isArray(f.options)) {
        savedDropdowns[f.id] = f.options;
      }

      if (f.alias_name?.toLowerCase() === "price" && Array.isArray(f.options)) {
        const [min, max] = f.options;
        setPriceRange({ min, max });
        setSliderLow(min);
        setSliderHigh(max);
      }
    });

    setDropdownSelections(savedDropdowns);
  } else {
    // ✅ No previous filters → reset to default clean state
    setDropdownSelections({});
    setPriceRange({ min: 0, max: 10000 });
    setSliderLow(0);
    setSliderHigh(10000);
  }

  onClose(); // Close sheet after restoring UI
};

 
  const renderRightContent = () => {
    const currentFilter = filters.find(f => f.field_name === selectedTab);
    if (!currentFilter) return null;

    if (currentFilter.field_type === 'dropdown') {
      return (
        <ScrollView
        
          style={{ flexGrow: 0, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {currentFilter.options.map((opt: any) => (
            <TouchableOpacity
              key={opt.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                flexWrap: 'nowrap',
              }}
              onPress={() => toggleDropdownOption(currentFilter.id, opt.id)}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: '#fff',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 10,
                }}
              >
                {dropdownSelections[currentFilter.id]?.includes(opt.id) && (
                  <Image
                        source={require('../../../assets/images/tickicon.png')}
                                        style={styles.tickImage}
                                        resizeMode="contain"/>  )}
              </View>
                          <Text
                            allowFontScaling={false}
                            numberOfLines={3}
                            style={[styles.filtertitleFilteryBy, {
                              flexShrink: 1,
                              flexGrow: 1,
                            }]}
                          >
              {opt.option_name || opt.name}
              
            </Text>
               
            </TouchableOpacity>
          ))}
        </ScrollView>
      );
    } 
    
    else if (currentFilter.alias_name === 'price') {
  return (
    <View style={{ zIndex: 999, position: 'relative' }}>
      <Text allowFontScaling={false} style={{ color: 'white', marginBottom: 10 }}>
        Range: {sliderLow} - {sliderHigh}
      </Text>

      <View style={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 20 }}>
        <MultiSlider
          values={[sliderLow, sliderHigh]}
          sliderLength={150}

          min={currentFilter?.minvalue ?? 0}
          max={currentFilter?.maxvalue ?? 100}
          step={1}
          onValuesChange={(values) => {
            const [low, high] = values;
            setSliderLow(low);
            setSliderHigh(high);
            setPriceRange({ min: low, max: high })
          }}

          selectedStyle={{
            backgroundColor: '#fff',
          }}
          unselectedStyle={{
            backgroundColor: '#888',
          }}
          containerStyle={{
            height: 'auto',
          }}
          trackStyle={{
            height: 4,
            borderRadius: 2,
          }}
          markerStyle={{
            height: 20,
            width: 20,
            borderRadius: 10,
            backgroundColor: '#fff',
          }}
        />
      </View>
    </View>
  );
}

    return null;
  };

  const handleApply = () => {
    const selectedFilters = filters
      .map(f => {
        if (f.field_type === 'dropdown' && dropdownSelections[f.id]?.length) {
          return {
            id: f.id,
            field_name: f.field_name,
            field_type: f.field_type,
            alias_name: f.alias_name,
            options: dropdownSelections[f.id],
          };
        } else if (f.alias_name?.toLowerCase() === 'price') {
          return {
            id: f.id,
            field_name: f.field_name,
            field_type: f.field_type,
            alias_name: f.alias_name,
            options: [priceRange.min, priceRange.max],
          };
        }
        return null;
      })
      .filter(Boolean);

    const filterBody = {
      filters: selectedFilters,
      page: 1,
      pagesize: 10,
      search: '',
      category_id: catagory_id,
    };

    console.log('Selected filter body:', JSON.stringify(filterBody, null, 2));
    onApply(filterBody);
    onClose();
   //handleClose()
  };

  return (
    

    <View  style={[StyleSheet.absoluteFillObject, { zIndex: 999, display: visible ? 'flex' : 'none' }]}>
      <BlurView
        style={[StyleSheet.absoluteFillObject]}
        blurType="dark"
        blurAmount={Platform.OS === 'ios' ? 3 : 4}
        reducedTransparencyFallbackColor="transparent"
      />
      <Modal
        animationType="slide"
        visible={visible}
        transparent
        onRequestClose={handleClose}
      >
          <View style={{
            flex: 1, justifyContent: 'flex-end', backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(34, 30, 252, 0.08) 0%, rgba(255, 255, 255, 0.10) 100%)'
          }}>
           

            <View style={styles.overlay}>
               <TouchableWithoutFeedback onPress={handleClose}>
                <View style={StyleSheet.absoluteFillObject} />
              </TouchableWithoutFeedback>
              <View style={[styles.modelcontainer]}>

              
                <BlurView
                  style={[
                    {
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0, borderRadius: 30,
                    },

                  ]}
                  blurType="dark"
                  blurAmount={100}
                  //blurAmount={Platform.OS === 'ios' ? 100 : 100}
                  pointerEvents='none'
                  reducedTransparencyFallbackColor="white"
                />

               
                
                <View style={styles.modeltitleContainer1}>
                 
                   <View
                    style={{
                      width: 50,
                      height: 4,
                      backgroundColor: '#000228',
                      borderRadius: 2,
                      alignSelf: 'center',
                      marginTop:8
                    }}
                  />
                 
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop:16
                  }}>
                 <Text allowFontScaling={false} style={styles.modelTextHeader}>Filters</Text>
                  <TouchableOpacity
                    onPress={handleClearFilters}
                  >
                    <Text allowFontScaling={false} style={styles.clearAll}>Clear all</Text>
                  </TouchableOpacity>
                  </View>
                </View>

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                  }}
                >
                  <View style={styles.modelLeftSideContainer}>
                    {filters.map(f => (
                      <TouchableOpacity
                        key={f.field_name}
                        onPress={() => handleTabPress(f.field_name)}
                        style={
                          selectedTab === f.field_name
                            ? styles.activeTab
                            : styles.inactiveTab
                        }
                      >
                        <Text
                        allowFontScaling={false}
                        style={[
                          styles.filtertitle,
                          selectedTab === f.field_name
                            ? styles.activeTabText     // ✅ Selected text style
                            : styles.inactiveTabText   // ✅ Unselected text style
                        ]}
                      >
                        {f.field_name}
                      </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <ScrollView
                style={{ flex: 1, backgroundColor: '#5d5c5c3c' }}
                contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
              >
                <Text allowFontScaling={false} style={styles.filterHeadTitle}>
                  {selectedTab}
                </Text>
                {renderRightContent()}
              </ScrollView>
                </View>

                <View style={styles.bottomview}>
                  
                  <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                    <Text allowFontScaling={false} style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.loginButton, {}]}
                    onPress={handleApply}
                  >
                    <Text allowFontScaling={false} style={[styles.sendText]}>Apply</Text>
                  </TouchableOpacity>
                  {/* <Button title="Apply" onPress={handleApply} /> */}
                </View>
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
  paddingHorizontal: 26,
  paddingBottom:16,
  backgroundColor: 'rgba(0, 0, 0, 0.07)',
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
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.10) 100%)',
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    opacity: 0.9,
     overflow:'hidden'

  },
  bottomview: {
    padding: 10,
    width: '100%',
    height: '10%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.001)',
    marginBottom:16
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
    minHeight:48,
    flex: 1,
    marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal:12,
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
    minHeight:48,
     flex: 1,
    //marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal:12,
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
    backgroundColor: 'rgba(0, 0, 0, 0.07)',
    
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
    height:80,
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

export default FilterBottomSheet;

