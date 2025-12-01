
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { BlurView } from '@react-native-community/blur';
import { CONSTDEFAULT } from '../CONSTDEFAULT';
import { MAIN_URL } from '../APIConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RangeSlider from 'rn-range-slider';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Button from './Button';
import FilterButton from './FilterButton';
import FilterButtonApply from './FilterButtonApply';
import { useTranslation } from 'react-i18next';


type PriceRange = { min: number; max: number } | null;
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

  const [defaultPriceRange, setDefaultPriceRange] = useState({ min: 0, max: 10000 });


const [lastAppliedPriceRange, setLastAppliedPriceRange] = useState<PriceRange>(null);

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


        const priceFilter = dynamicFilters.find(
            (item: any) => item.alias_name?.toLowerCase() === 'price'
          );

          if (priceFilter) {
            const newRange = {
              min: priceFilter.minvalue ?? 0,
              max: priceFilter.maxvalue ?? 10000,
            };
           // setPriceRange(newRange);
           // setDefaultPriceRange(newRange);
            
             if (!lastAppliedPriceRange) {
            setPriceRange(newRange);
            setDefaultPriceRange(newRange);
            setSliderLow(newRange.min);
            setSliderHigh(newRange.max);
          }
          }
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

  // useEffect(() => {
  //   if (visible && initialFilters?.filters?.length > 0) {
  //     const savedDropdowns: any = {};

  //     initialFilters.filters.forEach((f: any) => {
  //       if (f.field_type === 'dropdown') {
  //         savedDropdowns[f.id] = f.options;
  //       }

  //       if (f.alias_name?.toLowerCase() === 'price' && Array.isArray(f.options)) {
  //         const [minVal, maxVal] = f.options;
  //         setPriceRange({ min: minVal, max: maxVal });
  //         setSliderLow(minVal);
  //         setSliderHigh(maxVal);
  //         setLastAppliedPriceRange({ min: minVal, max: maxVal }); // ✅ added
  //       }
  //     });

  //     setDropdownSelections(savedDropdowns);
  //   }
  // }, [visible, initialFilters]);


  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    if (visible && initialFilters?.filters?.length > 0 && isFirstLoad) {
      const savedDropdowns: any = {};
  
      initialFilters.filters.forEach((f: any) => {
        if (f.field_type === "dropdown") {
          savedDropdowns[f.id] = f.options;
        }
  
        if (f.alias_name?.toLowerCase() === "price") {
          const [min, max] = f.options;
          setPriceRange({ min, max });
          setSliderLow(min);
          setSliderHigh(max);
          setLastAppliedPriceRange({ min, max });
        }
      });
  
      setDropdownSelections(savedDropdowns);
      setIsFirstLoad(false); // 🔥 prevent re-running on next modal open
    }
  }, [visible]);
  

   const { t } = useTranslation();

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
    setPriceRange(defaultPriceRange);  // ✅ reset from API range
    setSliderLow(defaultPriceRange.min);
    setSliderHigh(defaultPriceRange.max);
    //setSelectedTab(null);
    //onClose();
  };
 
  const modelClose= () => {
    onClose();
  }

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
      setDropdownSelections({});
      setPriceRange(defaultPriceRange);  // ✅ reset from API range
      setSliderLow(defaultPriceRange.min);
      setSliderHigh(defaultPriceRange.max);
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
                    resizeMode="contain"
                  />
                )}
              </View>
              <Text
                allowFontScaling={false}
                numberOfLines={3}
                style={[
                  styles.filtertitleFilteryBy,
                  {
                    flexShrink: 1,
                    flexGrow: 1,
                  },
                ]}
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
        } 
        else if (f.alias_name?.toLowerCase() === 'price') {
            const defaultMin = f.minvalue ?? 0;
            const defaultMax = f.maxvalue ?? 10000;
  
            const prevMin = lastAppliedPriceRange?.min ?? defaultMin;
            const prevMax = lastAppliedPriceRange?.max ?? defaultMax;
  
            if (priceRange.min !== prevMin || priceRange.max !== prevMax) {
              return {
                id: f.id,
                field_name: f.field_name,
                field_type: f.field_type,
                alias_name: f.alias_name,
                options: [priceRange.min, priceRange.max],
              };
            }
  
            // ✅ If unchanged but previously applied range exists, include it
            if (lastAppliedPriceRange) {
              return {
                id: f.id,
                field_name: f.field_name,
                field_type: f.field_type,
                alias_name: f.alias_name,
                options: [lastAppliedPriceRange.min, lastAppliedPriceRange.max],
              };
            }
  
            return null;
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
  
    // ✅ Save current applied range for next reopen
    setLastAppliedPriceRange(priceRange);
  
    onClose();
  };

  return (
    <View
    style={[
      ,
      { zIndex: 999, display: visible ? 'flex' : 'none',position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,width: '100%', height: '100%',},
    ]}
  >
    {/* Background BlurView */}
    <BlurView
      style={{ top: 0, left: 0, right: 0, bottom: 0,width: '100%', height: '100%',}}
      blurType="dark"
      blurAmount={Platform.OS === 'ios' ?3 : 4}
      reducedTransparencyFallbackColor="transparent"
    >

    {/* Modal */}
    <Modal
      animationType="slide"
      visible={visible}
      transparent
      onRequestClose={modelClose}
    >
      {/* <View
        style={[{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor:
            'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(34, 30, 252, 0.06) 0%, rgba(64, 122, 229, 0.1) 100%)',
          zIndex: 1000,
        },StyleSheet.absoluteFillObject,]}
      > */}
      <View style={{
            flex: 1, justifyContent: 'flex-end', backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(34, 30, 252, 0.08) 0%, rgba(255, 255, 255, 0.10) 100%)'
          }}>
        {/* Overlay Click to Close */}
        <TouchableWithoutFeedback onPress={modelClose}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

        <View style={[styles.modelcontainer, { zIndex: 1001 }]}>
          {' '}
          {/* Ensure modal container has higher zIndex */}
          {/* <BlurView
            style={[{backgroundColor: 'rgba(81, 151, 255, 0.3)',width: '100%',height: '100%'}]}
            blurType="dark"
            blurAmount={Platform.OS === 'ios' ? 5 : 4}
            reducedTransparencyFallbackColor="transparent"
          > */}
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
                  blurType="light"
                  blurAmount={18}
                  pointerEvents='none'
                  reducedTransparencyFallbackColor="white"
                />
          <View style={styles.modeltitleContainer1}>
            <View
              style={{
                width: 50,
                height: 4,
                borderRadius: 2,
                alignSelf: 'center',
                backgroundColor: '#000228',
                marginTop: 8,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 16,
              }}
            >
              <Text allowFontScaling={false} style={styles.modelTextHeader}>
                {t('filters')}
              </Text>
              <TouchableOpacity onPress={handleClearFilters}>
                <Text allowFontScaling={false} style={styles.clearAll}>
                  {t('clear_all')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            {/* Left-side filter tabs */}
            <View style={styles.modelLeftSideContainer}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: Platform.OS === 'ios' ? 65 : 20,
                }}
              >
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
                    <View
                      style={{ alignItems: 'center', width: '100%', gap: 4 }}
                    >
                      {f.logo ? (
                        <Image
                          source={{ uri: f.logo }}
                          style={styles.filterLogo}
                          resizeMode="contain"
                        />
                      ) : null}
                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.filtertitle,
                          selectedTab === f.field_name
                            ? styles.activeTabText
                            : styles.inactiveTabText,
                        ]}
                      >
                        {f.field_name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Right-side content (filter options) */}
            <ScrollView
              style={styles.scrollview_style}
              contentContainerStyle={{ padding: 16, paddingBottom: 70 }}
              showsVerticalScrollIndicator={false}
            >
              <Text allowFontScaling={false} style={styles.filterHeadTitle}>
                {selectedTab}
              </Text>
              {renderRightContent()}
            </ScrollView>
          </View>
          {/* Bottom buttons */}
          <View style={styles.bottomview}>
            <FilterButton
              title={t('cancel')}
              onPress={handleClose}
              style={styles.FilterButton_cancle}
            />
            <FilterButtonApply
              title={t('apply')}
              onPress={handleApply}
              style={styles.FilterButton_apply}
            />
          </View>
          {/* </BlurView> */}
        </View>
      </View>
    </Modal>
    </BlurView>
  </View>
  );
};

const styles = StyleSheet.create({
  scrollview_style:{
    
    flex: 1,
    backgroundColor:
      Platform.OS === 'ios'
        ? 'rgba(0, 0, 0, 0.30)'
        : 'rgba(255, 255, 255, 0.07)',
    
  },
  FilterButton_apply:{
    minHeight: 48,
    width: '49%',
    borderRadius: 40,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(197, 196, 196, 0.49) 0%, rgba(255, 255, 255, 0.32) 100%)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px 0 rgba(75, 75, 75, 0.19)',
  },

  FilterButton_cancle:{
    minHeight: 48,
    width: '49%',
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px 0 rgba(75, 75, 75, 0.19)',
  },
  inactiveTab: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    //marginBottom: 5,
    minHeight: 100,
    flexShrink: 1,
    width: '100%',  
    borderWidth: 0.5,
    borderColor:'rgba(255, 255, 255, 0.001)',
    marginBottom:4,
  },
  
  activeTab: {
    marginBottom:4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(151, 151, 151, 0.4) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#ffffff0e',
    paddingVertical: 10,
    paddingHorizontal: 12,
    //marginBottom: 5,
    boxShadow: 'rgba(255, 255, 255, 0.16) inset -1px 0px 4px 2px',
    minHeight: 100,
    flexShrink: 1,
    width: '100%',
  },
  
  filterLogo: {
    width: 20,        // adjust as needed
    height: 20,       // adjust as needed
    marginTop: 4,     // small spacing below text
  },
  filtertitle: {
    textAlign: 'center',
    flexWrap: 'wrap',
    width: '100%',         // ensures wrapping within tab width
    lineHeight: 18,
  },
  activeTabText: {
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'normal',
    
  },
  inactiveTabText: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'normal',
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
    paddingHorizontal: 26,
    paddingBottom: 16,
    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.40)' : 'rgba(0, 0, 0, 0.07)',
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
    opacity: 0.91,
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
  // activeTabText: {
  //   color: '#fff',
  //   fontFamily: 'Urbanist-SemiBold',
  //   fontSize: 16,
  //   fontWeight: '600',
  //   fontStyle: 'normal',
  //   width: '100%',
  // },
  // inactiveTabText: {
  //   color: 'rgba(255, 255, 255, 0.64)',
  //   fontFamily: 'Urbanist-SemiBold',
  //   fontSize: 16,
  //   fontWeight: '600',
  //   fontStyle: 'normal',
  //   width: '100%',
  // },

  // filtertitle: {
  //   color: '#fff',
  //   fontFamily: 'Urbanist-SemiBold',
  //   fontSize: 16,
  //   fontWeight: '600',
  //   fontStyle: 'normal',
  //   width: '100%',
  // },
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
    // backgroundColor:
    //   Platform.OS === 'ios' ? 'rgba(37, 76, 176, 0.18)' : 'rgba(0, 0, 0, 0.07)',

    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.40)' : 'rgba(0, 0, 0, 0.07)',
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

  // inactiveTab: {
  //   display: 'flex',
  //   alignItems: 'center',
  //   borderRadius: 14,
  //   justifyContent: 'center',
  //   padding: 16,
  //   gap: 4,
  //   marginBottom: 5,
  // },
  // activeTab: {
  //   display: 'flex',
  //   alignItems: 'center',
  //   backgroundColor:
  //     'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(151, 151, 151, 0.4) 0%, rgba(255, 255, 255, 0.10) 100%)',
  //   borderRadius: 12,
  //   borderWidth: 0.5,
  //   borderColor: '#ffffff0e',
  //   justifyContent: 'center',
  //   padding: 16,
  //   gap: 4,
  //   marginBottom: 5,
  //   boxShadow: 'rgba(255, 255, 255, 0.16) inset -1px 0px 4px 2px',
  //   height: 80,
  // },

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
