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
  Dimensions,
  TextInput,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { BlurView } from '@react-native-community/blur';

import { MAIN_URL } from '../APIConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

import FilterButton from './FilterButton';
import FilterButtonApply from './FilterButtonApply';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';


type PriceRange = { min: number; max: number } | null;
interface FilterBottomSheetProps {
  catagory_id: number;
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void; 
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

  const [lastAppliedPriceRange, setLastAppliedPriceRange] =
          useState<PriceRange>(null);
      
      const [postcode, setPostcode] = useState<string>('');
       const [lastAppliedPostcode, setLastAppliedPostcode] = useState<string | null>(null);
  
  

  const fetchFilters = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const language_code = await AsyncStorage.getItem('selectedLanguage') || 'en'

      if (!token) return;

      const body = { category_id: catagory_id };
      const url = MAIN_URL.baseUrl + 'category/feature/filter';
            console.log('URL: ', url);
      console.log('FIlterBody:', body);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          languagecode: language_code
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
        console.log('FIlterResponse:', data);
      if (data.statusCode === 200) {
        const dynamicFilters = data.data.filter(
          (item: any) =>
            item.field_type?.toLowerCase() === 'dropdown' ||           
              item.alias_name?.toLowerCase() === 'price' || 
                item.field_type?.toLowerCase() === 'date' ||
                item.field_type?.toLowerCase() === 'text',
        );

        setFilters(dynamicFilters);


        const priceFilter = dynamicFilters.find(
          (item: any) => item.alias_name?.toLowerCase() === 'price'
        );

        if (priceFilter) {
          const newRange = {
            min: priceFilter.minvalue ?? 0,
            max: priceFilter.maxvalue ?? 10000,
          };
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

    }
  };

  useEffect(() => {
    if (visible) fetchFilters();
  }, [visible]);

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


    const toggleDropdownOption = (
      fieldId: number,
      optionId: number,
      isMultiple: boolean,
    ) => {
      setDropdownSelections(prev => {
        const current = prev[fieldId] || [];

        if (isMultiple) {
          // MULTI SELECT (checkbox)
          if (current.includes(optionId)) {
            return {
              ...prev,
              [fieldId]: current.filter(id => id !== optionId),
            };
          } else {
            return { ...prev, [fieldId]: [...current, optionId] };
          }
        } else {
          // SINGLE SELECT (radio)
          return { ...prev, [fieldId]: [optionId] };
        }
      });
    };


  const handleClearFilters = () => {
    setDropdownSelections({});
    setPriceRange(defaultPriceRange);
    setSliderLow(defaultPriceRange.min);
      setSliderHigh(defaultPriceRange.max);
      setDateSelections({});
      setPostcode('');
  };

  const modelClose = () => {
    onClose();
  }

  const handleClose = () => {
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
      setPriceRange(defaultPriceRange);
      setSliderLow(defaultPriceRange.min);
        setSliderHigh(defaultPriceRange.max);
        setPostcode('');
    }
    onClose();
  };

    const SCREEN_WIDTH = Dimensions.get('window').width;
    
    const [dateSelections, setDateSelections] = useState<
      Record<number, { startDate?: Date; endDate?: Date }>
        >({});
    
    
    const [showDatePicker, setShowDatePicker] = useState(false);
    
    const [activeDateField, setActiveDateField] = useState<{
      param: any;
      type: 'start' | 'end';
    } | null>(null);
    
        const [tempDate, setTempDate] = useState(new Date());
        
    
  const renderRightContent = () => {
    const currentFilter = filters.find(f => f.field_name === selectedTab);
    if (!currentFilter) return null;

    if (currentFilter.field_type === 'dropdown') {
      return (
        <ScrollView style={{ flexGrow: 0, paddingTop: 10 }}>
          {currentFilter.options.map((opt: any) => {
            const isMultiple = currentFilter.ismultilple;
            const selectedValues = dropdownSelections[currentFilter.id] || [];

            const isSelectedCheckbox = selectedValues.includes(opt.id);
            const isSelectedRadio = selectedValues[0] === opt.id;

            return (
              <TouchableOpacity
                key={opt.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  flexWrap: 'nowrap',
                }}
                onPress={() =>
                  toggleDropdownOption(
                    currentFilter.id,
                    opt.id,
                    isMultiple
                  )
                }
              >
                {/* ICON UI ONLY CHANGED */}
                {isMultiple ? (
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
                    {isSelectedCheckbox && (
                      <Image
                        source={require('../../../assets/images/tickicon.png')}
                        style={styles.tickImage}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                ) : (
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 1.5,
                      borderColor: '#fff',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 10,
                    }}
                  >
                    {isSelectedRadio && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: '#fff',
                        }}
                      />
                    )}
                  </View>
                )}

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
            );
          })}


        </ScrollView>
      );
    }




    else if (currentFilter.alias_name === 'price') {
      return (
        <View style={{ zIndex: 999, position: 'relative' }}>
          <Text allowFontScaling={false} style={{ color: 'white', marginBottom: 10 }}>
            {t('range')}: {sliderLow} - {sliderHigh}
          </Text>

          <View style={{ paddingTop: 10, paddingBottom: 20, paddingLeft: 0 }}>
                      {/* <MultiSlider
                        values={[sliderLow, sliderHigh]}
                        sliderLength={SCREEN_WIDTH/2 - 10}
           
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
                            */}
                      <View
                        style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                      >
                        {/* MIN INPUT */}
                        <TextInput
                          style={[
                            styles.login_container,
                            styles.personalEmailID_TextInput,
                          ]}
                          keyboardType="numeric"
                          placeholder="Min"
                          placeholderTextColor="#aaa"
                          selectionColor={'#FFFFFF'}
                          cursorColor={'#FFFFFF'}
                          value={String(sliderLow)}
                          onChangeText={text => {
                            let value = parseInt(text) || 0;
          
                            if (value > sliderHigh) return;
          
                            setSliderLow(value);
                            setPriceRange({ min: value, max: sliderHigh });
                          }}
                        />
          
                        {/* MAX INPUT */}
                        <TextInput
                          style={[
                            styles.login_container,
                            styles.personalEmailID_TextInput,
                          ]}
                          keyboardType="numeric"
                          placeholder="Max"
                          selectionColor={'#FFFFFF'}
                          cursorColor={'#FFFFFF'}
                          placeholderTextColor="#aaa"
                          value={String(sliderHigh)}
                          onChangeText={text => {
                            let value = parseInt(text);
          
                            if (isNaN(value)) {
                              setSliderHigh(0);
                              return;
                            }
          
                            // Clamp within allowed range
                            const minLimit = sliderLow;
                            const maxLimit = currentFilter?.maxvalue ?? 100;
          
                            let finalValue = Math.min(
                              Math.max(value, minLimit),
                              maxLimit,
                            );
          
                            setSliderHigh(finalValue);
                            setPriceRange({ min: sliderLow, max: finalValue });
                          }}
                        />
                      </View>
                    </View>
        </View>
      );
    } else if (currentFilter.field_type?.toLowerCase() === 'date') {
          const selected = dateSelections[currentFilter.id] || {};
    
          return (
            <View style={{ paddingTop: 10 }}>
             
    
              {/* START DATE */}
              <TouchableOpacity
                style={[
                  styles.login_container,
                  styles.personalEmailID_TextInput,
                  { width: '100%' ,marginTop: 10},
                ]}
                onPress={() => {
                  setActiveDateField({ param: currentFilter, type: 'start' });
                  setTempDate(selected.startDate || new Date());
                  setShowDatePicker(true);
                }}
              >
                <Text style={{ color: '#fff' }}>
                  {selected.startDate
                    ? formatDate(selected.startDate)
                    : 'Select Start Date'}
                </Text>
              </TouchableOpacity>
    
              {/* END DATE */}
              <TouchableOpacity
                style={[
                  styles.login_container,
                  styles.personalEmailID_TextInput,
                  { marginTop: 10, width: '100%' },
                ]}
                onPress={() => {
                  setActiveDateField({ param: currentFilter, type: 'end' });
                  setTempDate(selected.endDate || new Date());
                  setShowDatePicker(true);
                }}
              >
                <Text style={{ color: '#fff' }}>
                  {selected.endDate
                    ? formatDate(selected.endDate)
                    : 'Select End Date'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        } else if (
              currentFilter.field_type?.toLowerCase() === 'text' &&
              currentFilter.field_name?.toLowerCase().includes('postcode')
            ) {
              return (
                <View style={{ paddingTop: 10 }}>
                  <Text style={{ color: 'white', marginBottom: 10 }}>
                    Enter Postcode
                  </Text>
        
                  <TextInput
                    style={[
                      styles.login_container,
                      styles.personalEmailID_TextInput,
                      { width: '100%' },
                    ]}
                    keyboardType="default"
                    placeholder="Enter Postcode"
                    placeholderTextColor="#aaa"
                    value={postcode}
                    onChangeText={text => {
                      const filteredText = text
                        .replace(/[^a-zA-Z0-9]/g, '')
                        .toUpperCase();
                      if (filteredText.length > 7) return;
                      setPostcode(filteredText);
                    }}
                  />
                </View>
              );
            }

    return null;
  };

    const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2); // last 2 digits

  return `${day}-${month}-${year}`;
};
    
    const uniqueFilters = Array.from(
  new Map(filters.map(f => [f.id, f])).values()
);

  const handleApply = () => {
    // const selectedFilters = filters
    //   .map(f => {
    //     if (f.field_type === 'dropdown' && dropdownSelections[f.id]?.length) {
    //       return {
    //         id: f.id,
    //         field_name: f.field_name,
    //         field_type: f.field_type,
    //         alias_name: f.alias_name,
    //         options: dropdownSelections[f.id],
    //       };
    //     }
    //     else if (f.alias_name?.toLowerCase() === 'price') {
    //       const defaultMin = f.minvalue ?? 0;
    //       const defaultMax = f.maxvalue ?? 10000;

    //       const prevMin = lastAppliedPriceRange?.min ?? defaultMin;
    //       const prevMax = lastAppliedPriceRange?.max ?? defaultMax;

    //       if (priceRange.min !== prevMin || priceRange.max !== prevMax) {
    //         return {
    //           id: f.id,
    //           field_name: f.field_name,
    //           field_type: f.field_type,
    //           alias_name: f.alias_name,
    //           options: [priceRange.min, priceRange.max],
    //         };
    //       }
    //       if (lastAppliedPriceRange) {
    //         return {
    //           id: f.id,
    //           field_name: f.field_name,
    //           field_type: f.field_type,
    //           alias_name: f.alias_name,
    //           options: [lastAppliedPriceRange.min, lastAppliedPriceRange.max],
    //         };
    //       }

    //       return null;
    //     }
    //     return null;
    //   })
      //   .filter(Boolean);
      
      const selectedFilters = uniqueFilters
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
        } else if (f.field_type?.toLowerCase() === 'date') {
          const selected = dateSelections[f.id];
          if (selected?.startDate && selected?.endDate) {
            return {
              id: f.id,
              field_name: f.field_name,
              field_type: f.field_type,
              alias_name: f.alias_name,
              options: [
                formatDate(selected.startDate),
                formatDate(selected.endDate),
              ],
            };
          }
        } else if (
          f.field_type?.toLowerCase() === 'text' &&
          f.field_name?.toLowerCase().includes('postcode')
        ) {
          if (postcode) {
            return {
              id: f.id,
              field_name: f.field_name,
              field_type: f.field_type,
              alias_name: f.alias_name,
              options: [postcode],
            };
          }
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
    onApply(filterBody);

    setLastAppliedPriceRange(priceRange);

    onClose();
  };

  const [search = '', setSearch] = useState('');
  return (
    <View
      style={[
        ,
        {
          zIndex: 999,
          display: visible ? 'flex' : 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        },
      ]}
    >
      <BlurView
        style={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        }}
        blurType="dark"
        blurAmount={Platform.OS === 'ios' ? 3 : 4}
        reducedTransparencyFallbackColor="transparent"
      >
        <Modal
          animationType="slide"
          visible={visible}
          transparent
          onRequestClose={modelClose}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              backgroundColor:
                'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(34, 30, 252, 0.08) 0%, rgba(255, 255, 255, 0.10) 100%)',
            }}
          >
            <TouchableWithoutFeedback onPress={modelClose}>
              <View style={StyleSheet.absoluteFillObject} />
            </TouchableWithoutFeedback>

            <View style={[styles.modelcontainer, { zIndex: 1001 }]}>
              {' '}
              <BlurView
                style={[
                  {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 30,
                    backgroundColor: 'rgba(119, 173, 255, 0.07)',
                  },
                ]}
                blurType="light"
                blurAmount={18}
                pointerEvents="none"
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
                          style={{
                            alignItems: 'center',
                            width: '100%',
                            gap: 4,
                          }}
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
              {showDatePicker && activeDateField && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    backgroundColor: '#fff',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
                  }}
                >
                  {/* HEADER */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      padding: 12,
                      borderBottomWidth: 0.5,
                      borderColor: '#ddd',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setShowDatePicker(false);
                        setActiveDateField(null);
                      }}
                    >
                      <Text
                        allowFontScaling={false}
                        style={{ color: '#999', fontSize: 16 }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        // Save selected date
                        const current =
                          dateSelections[activeDateField.param.id] || {};

                        setDateSelections(prev => ({
                          ...prev,
                          [activeDateField.param.id]: {
                            ...current,
                            [activeDateField.type === 'start'
                              ? 'startDate'
                              : 'endDate']: tempDate,
                          },
                        }));

                        setShowDatePicker(false);
                        setActiveDateField(null);
                      }}
                    >
                      <Text
                        allowFontScaling={false}
                        style={{ color: '#007AFF', fontSize: 16 }}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* DATE PICKER */}
                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display={'spinner'}
                    minimumDate={
                      activeDateField.type === 'end'
                        ? dateSelections[activeDateField.param.id]?.startDate ??
                          new Date()
                        : new Date()
                    }
                    onChange={(event, selectedDate) => {
                      if (selectedDate) setTempDate(selectedDate);
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        </Modal>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
    login_container: {
    width: '45%',
    height: 44,
    display: 'flex',
    gap: 10,
    alignSelf: 'stretch',
    borderRadius: 12,
    borderWidth: 0.6,
    borderColor: '#ffffff2c',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',

    boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
    paddingLeft: 12,
  },
  personalEmailID_TextInput: {
    width: '45%',
    fontFamily: 'Urbanist-Regular',
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
    fontStyle: 'normal',
    color: '#fff',
    minHeight: 44,
  },
  scrollview_style: {

    flex: 1,
    backgroundColor:
      Platform.OS === 'ios'
        ? 'rgba(0, 0, 0, 0.30)'
        : 'rgba(255, 255, 255, 0.07)',

  },
  FilterButton_apply: {
    minHeight: 48,
    width: '49%',
    borderRadius: 40,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(197, 196, 196, 0.49) 0%, rgba(255, 255, 255, 0.32) 100%)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px 0 rgba(75, 75, 75, 0.19)',
  },

  FilterButton_cancle: {
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
    minHeight: 100,
    flexShrink: 1,
    width: '100%',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.001)',
    marginBottom: 4,
  },

  activeTab: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(151, 151, 151, 0.4) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#ffffff0e',
    paddingVertical: 10,
    paddingHorizontal: 12,
    boxShadow: 'rgba(255, 255, 255, 0.16) inset -1px 0px 4px 2px',
    minHeight: 100,
    flexShrink: 1,
    width: '100%',
  },

  filterLogo: {
    width: 20, 
    height: 20,      
    marginTop: 4, 
  },
  filtertitle: {
    textAlign: 'center',
    flexWrap: 'wrap',
    width: '100%', 
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 50,
  },

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
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
// import {
//   Modal,
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   Text,
//   ScrollView,
//   Platform,
//   TouchableWithoutFeedback,
//   Dimensions,
//   TextInput,
// } from 'react-native';
// import React, { useEffect, useState } from 'react';
// import { BlurView } from '@react-native-community/blur';

// import { MAIN_URL } from '../APIConstant';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import MultiSlider from '@ptomasroos/react-native-multi-slider';

// import FilterButton from './FilterButton';
// import FilterButtonApply from './FilterButtonApply';
// import { useTranslation } from 'react-i18next';
// import DateTimePicker from '@react-native-community/datetimepicker';


// type PriceRange = { min: number; max: number } | null;
// interface FilterBottomSheetProps {
//   catagory_id: number;
//   visible: boolean;
//   onClose: () => void;
//   onApply: (filters: any) => void; 
//   from: number;
//   to: number;
//   initialFilters?: any;
// }
// const FilterBottomSheet = ({
//   catagory_id,
//   visible,
//   onClose,
//   onApply,
//   initialFilters,
// }: FilterBottomSheetProps) => {
//   const [filters, setFilters] = useState<any[]>([]);
//   const [selectedTab, setSelectedTab] = useState<string | null>(null);

//   const [dropdownSelections, setDropdownSelections] = useState<
//     Record<number, number[]>
//   >({});

//   const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
//   const [sliderLow, setSliderLow] = useState(priceRange.min);
//   const [sliderHigh, setSliderHigh] = useState(priceRange.max);

//   const [defaultPriceRange, setDefaultPriceRange] = useState({ min: 0, max: 10000 });

//   const [lastAppliedPriceRange, setLastAppliedPriceRange] =
//           useState<PriceRange>(null);
      
//       const [postcode, setPostcode] = useState<string>('');
//        const [lastAppliedPostcode, setLastAppliedPostcode] = useState<string | null>(null);
  
  

//   const fetchFilters = async () => {
//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       const language_code = await AsyncStorage.getItem('selectedLanguage') || 'en'

//       if (!token) return;

//       const body = { category_id: catagory_id };
//       const url = MAIN_URL.baseUrl + 'category/feature/filter';
//             console.log('URL: ', url);
//       console.log('FIlterBody:', body);

//       const res = await fetch(url, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//           languagecode: language_code
//         },
//         body: JSON.stringify(body),
//       });

//       const data = await res.json();
//         console.log('FIlterResponse:', data);
//       if (data.statusCode === 200) {
//         const dynamicFilters = data.data.filter(
//           (item: any) =>
//             item.field_type?.toLowerCase() === 'dropdown' ||           
//               item.alias_name?.toLowerCase() === 'price' || 
//                 item.field_type?.toLowerCase() === 'date' ||
//                 item.field_type?.toLowerCase() === 'text',
//         );

//         setFilters(dynamicFilters);


//         const priceFilter = dynamicFilters.find(
//           (item: any) => item.alias_name?.toLowerCase() === 'price'
//         );

//         if (priceFilter) {
//           const newRange = {
//             min: priceFilter.minvalue ?? 0,
//             max: priceFilter.maxvalue ?? 10000,
//           };
//           if (!lastAppliedPriceRange) {
//             setPriceRange(newRange);
//             setDefaultPriceRange(newRange);
//             setSliderLow(newRange.min);
//             setSliderHigh(newRange.max);
//           }
//         }
//         if (!selectedTab && dynamicFilters.length) {
//           setSelectedTab(dynamicFilters[0].field_name);
//         }
//       }
//     } catch (err) {

//     }
//   };

//   useEffect(() => {
//     if (visible) fetchFilters();
//   }, [visible]);

//   const [isFirstLoad, setIsFirstLoad] = useState(true);

//   useEffect(() => {
//     if (visible && initialFilters?.filters?.length > 0 && isFirstLoad) {
//       const savedDropdowns: any = {};

//       initialFilters.filters.forEach((f: any) => {
//         if (f.field_type === "dropdown") {
//           savedDropdowns[f.id] = f.options;
//         }

//         if (f.alias_name?.toLowerCase() === "price") {
//           const [min, max] = f.options;
//           setPriceRange({ min, max });
//           setSliderLow(min);
//           setSliderHigh(max);
//           setLastAppliedPriceRange({ min, max });
//         }
//       });

//       setDropdownSelections(savedDropdowns);
//       setIsFirstLoad(false); // 🔥 prevent re-running on next modal open
//     }
//   }, [visible]);


//   const { t } = useTranslation();

//   const handleTabPress = (tabName: string) => {
//     setSelectedTab(tabName);
//   };


//     const toggleDropdownOption = (
//       fieldId: number,
//       optionId: number,
//       isMultiple: boolean,
//     ) => {
//       setDropdownSelections(prev => {
//         const current = prev[fieldId] || [];

//         if (isMultiple) {
//           // MULTI SELECT (checkbox)
//           if (current.includes(optionId)) {
//             return {
//               ...prev,
//               [fieldId]: current.filter(id => id !== optionId),
//             };
//           } else {
//             return { ...prev, [fieldId]: [...current, optionId] };
//           }
//         } else {
//           // SINGLE SELECT (radio)
//           return { ...prev, [fieldId]: [optionId] };
//         }
//       });
//     };


//   const handleClearFilters = () => {
//     setDropdownSelections({});
//     setPriceRange(defaultPriceRange);
//     setSliderLow(defaultPriceRange.min);
//       setSliderHigh(defaultPriceRange.max);
//       setDateSelections({});
//       setPostcode('');
//   };

//   const modelClose = () => {
//     onClose();
//   }

//   const handleClose = () => {
//     if (initialFilters?.filters?.length > 0) {
//       const savedDropdowns: Record<number, number[]> = {};
//       initialFilters.filters.forEach((f: any) => {
//         if (f.field_type === "dropdown" && Array.isArray(f.options)) {
//           savedDropdowns[f.id] = f.options;
//         }

//         if (f.alias_name?.toLowerCase() === "price" && Array.isArray(f.options)) {
//           const [min, max] = f.options;
//           setPriceRange({ min, max });
//           setSliderLow(min);
//           setSliderHigh(max);
//         }
//       });

//       setDropdownSelections(savedDropdowns);
//     } else {
//        setDropdownSelections({});
//       setPriceRange(defaultPriceRange);
//       setSliderLow(defaultPriceRange.min);
//         setSliderHigh(defaultPriceRange.max);
//         setPostcode('');
//     }
//     onClose();
//   };

//     const SCREEN_WIDTH = Dimensions.get('window').width;
    
//     const [dateSelections, setDateSelections] = useState<
//       Record<number, { startDate?: Date; endDate?: Date }>
//         >({});
    
    
//     const [showDatePicker, setShowDatePicker] = useState(false);
    
//     const [activeDateField, setActiveDateField] = useState<{
//       param: any;
//       type: 'start' | 'end';
//     } | null>(null);
    
//         const [tempDate, setTempDate] = useState(new Date());
        
    
//   const renderRightContent = () => {
//     const currentFilter = filters.find(f => f.field_name === selectedTab);
//     if (!currentFilter) return null;

//     if (currentFilter.field_type === 'dropdown') {
//       return (
//         <ScrollView style={{ flexGrow: 0, paddingTop: 10 }}>
//           {currentFilter.options.map((opt: any) => {
//             const isMultiple = currentFilter.ismultilple;
//             const selectedValues = dropdownSelections[currentFilter.id] || [];

//             const isSelectedCheckbox = selectedValues.includes(opt.id);
//             const isSelectedRadio = selectedValues[0] === opt.id;

//             return (
//               <TouchableOpacity
//                 key={opt.id}
//                 style={{
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   paddingVertical: 12,
//                   flexWrap: 'nowrap',
//                 }}
//                 onPress={() =>
//                   toggleDropdownOption(
//                     currentFilter.id,
//                     opt.id,
//                     isMultiple
//                   )
//                 }
//               >
//                 {/* ICON UI ONLY CHANGED */}
//                 {isMultiple ? (
//                   <View
//                     style={{
//                       width: 20,
//                       height: 20,
//                       borderRadius: 4,
//                       borderWidth: 1,
//                       borderColor: '#fff',
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                       marginRight: 10,
//                     }}
//                   >
//                     {isSelectedCheckbox && (
//                       <Image
//                         source={require('../../../assets/images/tickicon.png')}
//                         style={styles.tickImage}
//                         resizeMode="contain"
//                       />
//                     )}
//                   </View>
//                 ) : (
//                   <View
//                     style={{
//                       width: 20,
//                       height: 20,
//                       borderRadius: 10,
//                       borderWidth: 1.5,
//                       borderColor: '#fff',
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                       marginRight: 10,
//                     }}
//                   >
//                     {isSelectedRadio && (
//                       <View
//                         style={{
//                           width: 10,
//                           height: 10,
//                           borderRadius: 5,
//                           backgroundColor: '#fff',
//                         }}
//                       />
//                     )}
//                   </View>
//                 )}

//                 <Text
//                   allowFontScaling={false}
//                   numberOfLines={3}
//                   style={[styles.filtertitleFilteryBy, {
//                     flexShrink: 1,
//                     flexGrow: 1,
//                   }]}
//                 >
//                   {opt.option_name || opt.name}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })}


//         </ScrollView>
//       );
//     }




//     else if (currentFilter.alias_name === 'price') {
//       return (
//         <View style={{ zIndex: 999, position: 'relative' }}>
//           <Text allowFontScaling={false} style={{ color: 'white', marginBottom: 10 }}>
//             {t('range')}: {sliderLow} - {sliderHigh}
//           </Text>

//           <View style={{ paddingTop: 10, paddingBottom: 20, paddingLeft: 0 }}>
//                       {/* <MultiSlider
//                         values={[sliderLow, sliderHigh]}
//                         sliderLength={SCREEN_WIDTH/2 - 10}
           
//                         min={currentFilter?.minvalue ?? 0}
//                         max={currentFilter?.maxvalue ?? 100}
//                         step={1}
                        
//                         onValuesChange={(values) => {
//                           const [low, high] = values;
//                           setSliderLow(low);
//                           setSliderHigh(high);
//                           setPriceRange({ min: low, max: high })
//                         }}
           
//                         selectedStyle={{
//                           backgroundColor: '#fff',
//                         }}
//                         unselectedStyle={{
//                           backgroundColor: '#888',
//                         }}
//                         containerStyle={{
//                           height: 'auto',
//                         }}
//                         trackStyle={{
//                           height: 4,
//                           borderRadius: 2,
//                         }}
//                         markerStyle={{
//                           height: 20,
//                           width: 20,
//                           borderRadius: 10,
//                           backgroundColor: '#fff',
//                         }}
//                             /> 
//                             */}
//                       <View
//                         style={{ flexDirection: 'row', justifyContent: 'space-between' }}
//                       >
//                         {/* MIN INPUT */}
//                         <TextInput
//                           style={[
//                             styles.login_container,
//                             styles.personalEmailID_TextInput,
//                           ]}
//                           keyboardType="numeric"
//                           placeholder="Min"
//                           placeholderTextColor="#aaa"
//                           selectionColor={'#FFFFFF'}
//                           cursorColor={'#FFFFFF'}
//                           value={String(sliderLow)}
//                           onChangeText={text => {
//                             let value = parseInt(text) || 0;
          
//                             if (value > sliderHigh) return;
          
//                             setSliderLow(value);
//                             setPriceRange({ min: value, max: sliderHigh });
//                           }}
//                         />
          
//                         {/* MAX INPUT */}
//                         <TextInput
//                           style={[
//                             styles.login_container,
//                             styles.personalEmailID_TextInput,
//                           ]}
//                           keyboardType="numeric"
//                           placeholder="Max"
//                           selectionColor={'#FFFFFF'}
//                           cursorColor={'#FFFFFF'}
//                           placeholderTextColor="#aaa"
//                           value={String(sliderHigh)}
//                           onChangeText={text => {
//                             let value = parseInt(text);
          
//                             if (isNaN(value)) {
//                               setSliderHigh(0);
//                               return;
//                             }
          
//                             // Clamp within allowed range
//                             const minLimit = sliderLow;
//                             const maxLimit = currentFilter?.maxvalue ?? 100;
          
//                             let finalValue = Math.min(
//                               Math.max(value, minLimit),
//                               maxLimit,
//                             );
          
//                             setSliderHigh(finalValue);
//                             setPriceRange({ min: sliderLow, max: finalValue });
//                           }}
//                         />
//                       </View>
//                     </View>
//         </View>
//       );
//     } else if (currentFilter.field_type?.toLowerCase() === 'date') {
//           const selected = dateSelections[currentFilter.id] || {};
    
//           return (
//             <View style={{ paddingTop: 10 }}>
             
    
//               {/* START DATE */}
//               <TouchableOpacity
//                 style={[
//                   styles.login_container,
//                   styles.personalEmailID_TextInput,
//                   { width: '100%' ,marginTop: 10},
//                 ]}
//                 onPress={() => {
//                   setActiveDateField({ param: currentFilter, type: 'start' });
//                   setTempDate(selected.startDate || new Date());
//                   setShowDatePicker(true);
//                 }}
//               >
//                 <Text style={{ color: '#fff' }}>
//                   {selected.startDate
//                     ? formatDate(selected.startDate)
//                     : 'Select Start Date'}
//                 </Text>
//               </TouchableOpacity>
    
//               {/* END DATE */}
//               <TouchableOpacity
//                 style={[
//                   styles.login_container,
//                   styles.personalEmailID_TextInput,
//                   { marginTop: 10, width: '100%' },
//                 ]}
//                 onPress={() => {
//                   setActiveDateField({ param: currentFilter, type: 'end' });
//                   setTempDate(selected.endDate || new Date());
//                   setShowDatePicker(true);
//                 }}
//               >
//                 <Text style={{ color: '#fff' }}>
//                   {selected.endDate
//                     ? formatDate(selected.endDate)
//                     : 'Select End Date'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           );
//         } else if (
//               currentFilter.field_type?.toLowerCase() === 'text' &&
//               currentFilter.field_name?.toLowerCase().includes('postcode')
//             ) {
//               return (
//                 <View style={{ paddingTop: 10 }}>
//                   <Text style={{ color: 'white', marginBottom: 10 }}>
//                     Enter Postcode
//                   </Text>
        
//                   <TextInput
//                     style={[
//                       styles.login_container,
//                       styles.personalEmailID_TextInput,
//                       { width: '100%' },
//                     ]}
//                     keyboardType="default"
//                     placeholder="Enter Postcode"
//                     placeholderTextColor="#aaa"
//                     value={postcode}
//                     onChangeText={text => {
//                       const filteredText = text
//                         .replace(/[^a-zA-Z0-9]/g, '')
//                         .toUpperCase();
//                       if (filteredText.length > 7) return;
//                       setPostcode(filteredText);
//                     }}
//                   />
//                 </View>
//               );
//             }

//     return null;
//   };

//     const formatDate = (date: Date) => {
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = String(date.getFullYear()).slice(-2); // last 2 digits

//   return `${day}-${month}-${year}`;
// };
    
//     const uniqueFilters = Array.from(
//   new Map(filters.map(f => [f.id, f])).values()
// );

//   const handleApply = () => {
//     // const selectedFilters = filters
//     //   .map(f => {
//     //     if (f.field_type === 'dropdown' && dropdownSelections[f.id]?.length) {
//     //       return {
//     //         id: f.id,
//     //         field_name: f.field_name,
//     //         field_type: f.field_type,
//     //         alias_name: f.alias_name,
//     //         options: dropdownSelections[f.id],
//     //       };
//     //     }
//     //     else if (f.alias_name?.toLowerCase() === 'price') {
//     //       const defaultMin = f.minvalue ?? 0;
//     //       const defaultMax = f.maxvalue ?? 10000;

//     //       const prevMin = lastAppliedPriceRange?.min ?? defaultMin;
//     //       const prevMax = lastAppliedPriceRange?.max ?? defaultMax;

//     //       if (priceRange.min !== prevMin || priceRange.max !== prevMax) {
//     //         return {
//     //           id: f.id,
//     //           field_name: f.field_name,
//     //           field_type: f.field_type,
//     //           alias_name: f.alias_name,
//     //           options: [priceRange.min, priceRange.max],
//     //         };
//     //       }
//     //       if (lastAppliedPriceRange) {
//     //         return {
//     //           id: f.id,
//     //           field_name: f.field_name,
//     //           field_type: f.field_type,
//     //           alias_name: f.alias_name,
//     //           options: [lastAppliedPriceRange.min, lastAppliedPriceRange.max],
//     //         };
//     //       }

//     //       return null;
//     //     }
//     //     return null;
//     //   })
//       //   .filter(Boolean);
      
//       const selectedFilters = uniqueFilters
//       .map(f => {
//         if (f.field_type === 'dropdown' && dropdownSelections[f.id]?.length) {
//           return {
//             id: f.id,
//             field_name: f.field_name,
//             field_type: f.field_type,
//             alias_name: f.alias_name,
//             options: dropdownSelections[f.id],
//           };
//         } else if (f.alias_name?.toLowerCase() === 'price') {
//           return {
//             id: f.id,
//             field_name: f.field_name,
//             field_type: f.field_type,
//             alias_name: f.alias_name,
//             options: [priceRange.min, priceRange.max],
//           };
//         } else if (f.field_type?.toLowerCase() === 'date') {
//           const selected = dateSelections[f.id];
//           if (selected?.startDate && selected?.endDate) {
//             return {
//               id: f.id,
//               field_name: f.field_name,
//               field_type: f.field_type,
//               alias_name: f.alias_name,
//               options: [
//                 formatDate(selected.startDate),
//                 formatDate(selected.endDate),
//               ],
//             };
//           }
//         } else if (
//           f.field_type?.toLowerCase() === 'text' &&
//           f.field_name?.toLowerCase().includes('postcode')
//         ) {
//           if (postcode) {
//             return {
//               id: f.id,
//               field_name: f.field_name,
//               field_type: f.field_type,
//               alias_name: f.alias_name,
//               options: [postcode],
//             };
//           }
//         }

//         return null;
//       })
//       .filter(Boolean);


//     const filterBody = {
//       filters: selectedFilters,
//       page: 1,
//       pagesize: 10,
//       search: '',
//       category_id: catagory_id,
//     };
//     onApply(filterBody);

//     setLastAppliedPriceRange(priceRange);

//     onClose();
//   };

//   const [search = '', setSearch] = useState('');
//   return (
//     <View
//       style={[
//         ,
//         { zIndex: 999, display: visible ? 'flex' : 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', },
//       ]}
//     >
//       <BlurView
//         style={{ top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', }}
//         blurType="dark"
//         blurAmount={Platform.OS === 'ios' ? 3 : 4}
//         reducedTransparencyFallbackColor="transparent"
//       >

//         <Modal
//           animationType="slide"
//           visible={visible}
//           transparent
//           onRequestClose={modelClose}
//         >
//           <View style={{
//             flex: 1, justifyContent: 'flex-end', backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(34, 30, 252, 0.08) 0%, rgba(255, 255, 255, 0.10) 100%)'
//           }}>
//             <TouchableWithoutFeedback onPress={modelClose}>
//               <View style={StyleSheet.absoluteFillObject} />
//             </TouchableWithoutFeedback>

//             <View style={[styles.modelcontainer, { zIndex: 1001 }]}>
//               {' '}
//               <BlurView
//                 style={[
//                   {
//                     position: 'absolute',
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     bottom: 0, borderRadius: 30,
//                     backgroundColor: 'rgba(119, 173, 255, 0.07)'
//                   },

//                 ]}
//                 blurType="light"
//                 blurAmount={18}
//                 pointerEvents='none'
//                 reducedTransparencyFallbackColor="white"
//               />
//               <View style={styles.modeltitleContainer1}>
//                 <View
//                   style={{
//                     width: 50,
//                     height: 4,
//                     borderRadius: 2,
//                     alignSelf: 'center',
//                     backgroundColor: '#000228',
//                     marginTop: 8,
//                   }}
//                 />
//                 <View
//                   style={{
//                     flexDirection: 'row',
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                     paddingTop: 16,
//                   }}
//                 >
//                   <Text allowFontScaling={false} style={styles.modelTextHeader}>
//                     {t('filters')}
//                   </Text>
//                   <TouchableOpacity onPress={handleClearFilters}>
//                     <Text allowFontScaling={false} style={styles.clearAll}>
//                       {t('clear_all')}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//               <View style={{ flex: 1, flexDirection: 'row' }}>
//                 <View style={styles.modelLeftSideContainer}>
//                   <ScrollView
//                     showsVerticalScrollIndicator={false}
//                     contentContainerStyle={{
//                       paddingBottom: Platform.OS === 'ios' ? 65 : 20,
//                     }}
//                   >
//                     {filters.map(f => (
//                       <TouchableOpacity
//                         key={f.field_name}
//                         onPress={() => handleTabPress(f.field_name)}
//                         style={
//                           selectedTab === f.field_name
//                             ? styles.activeTab
//                             : styles.inactiveTab
//                         }
//                       >
//                         <View
//                           style={{ alignItems: 'center', width: '100%', gap: 4 }}
//                         >
//                           {f.logo ? (
//                             <Image
//                               source={{ uri: f.logo }}
//                               style={styles.filterLogo}
//                               resizeMode="contain"
//                             />
//                           ) : null}
//                           <Text
//                             allowFontScaling={false}
//                             style={[
//                               styles.filtertitle,
//                               selectedTab === f.field_name
//                                 ? styles.activeTabText
//                                 : styles.inactiveTabText,
//                             ]}
//                           >
//                             {f.field_name}
//                           </Text>
//                         </View>
//                       </TouchableOpacity>
//                     ))}
//                   </ScrollView>
//                 </View>

//                 <ScrollView
//                   style={styles.scrollview_style}
//                   contentContainerStyle={{ padding: 16, paddingBottom: 70 }}
//                   showsVerticalScrollIndicator={false}
//                 >
//                   <Text allowFontScaling={false} style={styles.filterHeadTitle}>
//                     {selectedTab} 
//                   </Text>
//                   {/* {selectedTab === 'University Name' && (
//                     <>
//                       <TextInput
//                         allowFontScaling={false}
//                         style={{width: '100%',height:30,backgroundColor: '#FFFFFF',borderRadius: 5,padding: 4,borderColor: '#FFFFFF'}}
//                         placeholder={t('search')}
//                         value={search}
//                         onChangeText={(value) => setSearch(value)}
//                         />
//                     </>
//                   )} */}
//                   {renderRightContent()}
//                 </ScrollView>
//               </View>
//               {/* Bottom buttons */}
//               <View style={styles.bottomview}>
//                 <FilterButton
//                   title={t('cancel')}
//                   onPress={handleClose}
//                   style={styles.FilterButton_cancle}
//                 />
//                 <FilterButtonApply
//                   title={t('apply')}
//                   onPress={handleApply}
//                   style={styles.FilterButton_apply}
//                 />
//               </View>
//                       </View>
                                        
//                   {showDatePicker && activeDateField && (
//   <DateTimePicker
//   value={tempDate}
//   mode="date"
//   display={Platform.OS === 'ios' ? 'inline' : 'calendar'} // ✅ FIX
//   themeVariant="light"
//   minimumDate={
//     activeDateField.type === 'end'
//       ? dateSelections[activeDateField.param.id]?.startDate ?? new Date()
//       : new Date()
//   }
//   onChange={(event, selectedDate) => {
//     if (event.type === 'set' && selectedDate) {
//       const fieldId = activeDateField.param.id;

//       setDateSelections(prev => {
//         const existing = prev[fieldId] || {};

//         return {
//           ...prev,
//           [fieldId]: {
//             ...existing,
//             [activeDateField.type === 'start' ? 'startDate' : 'endDate']:
//               selectedDate,
//           },
//         };
//       });
//     }

//     setShowDatePicker(false);
//   }}
// />
// )}
//           </View>
//         </Modal>
//       </BlurView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//     login_container: {
//     width: '45%',
//     height: 44,
//     display: 'flex',
//     gap: 10,
//     alignSelf: 'stretch',
//     borderRadius: 12,
//     borderWidth: 0.6,
//     borderColor: '#ffffff2c',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignContent: 'center',
//     alignItems: 'center',
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',

//     boxShadow: '0 1.761px 6.897px 0 rgba(0, 0, 0, 0.25)',
//     paddingLeft: 12,
//   },
//   personalEmailID_TextInput: {
//     width: '45%',
//     fontFamily: 'Urbanist-Regular',
//     fontWeight: '400',
//     fontSize: 17,
//     lineHeight: 22,
//     fontStyle: 'normal',
//     color: '#fff',
//     minHeight: 44,
//   },
//   scrollview_style: {

//     flex: 1,
//     backgroundColor:
//       Platform.OS === 'ios'
//         ? 'rgba(0, 0, 0, 0.30)'
//         : 'rgba(255, 255, 255, 0.07)',

//   },
//   FilterButton_apply: {
//     minHeight: 48,
//     width: '49%',
//     borderRadius: 40,
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(197, 196, 196, 0.49) 0%, rgba(255, 255, 255, 0.32) 100%)',
//     alignItems: 'center',
//     justifyContent: 'center',
//     boxShadow: '0 2px 8px 0 rgba(75, 75, 75, 0.19)',
//   },

//   FilterButton_cancle: {
//     minHeight: 48,
//     width: '49%',
//     borderRadius: 40,
//     backgroundColor: 'rgba(0, 0, 0, 0.38)',
//     alignItems: 'center',
//     justifyContent: 'center',
//     boxShadow: '0 2px 8px 0 rgba(75, 75, 75, 0.19)',
//   },
//   inactiveTab: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 14,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     //marginBottom: 5,
//     minHeight: 100,
//     flexShrink: 1,
//     width: '100%',
//     borderWidth: 0.5,
//     borderColor: 'rgba(255, 255, 255, 0.001)',
//     marginBottom: 4,
//   },

//   activeTab: {
//     marginBottom: 4,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(151, 151, 151, 0.4) 0%, rgba(255, 255, 255, 0.10) 100%)',
//     borderRadius: 14,
//     borderWidth: 0.5,
//     borderColor: '#ffffff0e',
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     //marginBottom: 5,
//     boxShadow: 'rgba(255, 255, 255, 0.16) inset -1px 0px 4px 2px',
//     minHeight: 100,
//     flexShrink: 1,
//     width: '100%',
//   },

//   filterLogo: {
//     width: 20,        // adjust as needed
//     height: 20,       // adjust as needed
//     marginTop: 4,     // small spacing below text
//   },
//   filtertitle: {
//     textAlign: 'center',
//     flexWrap: 'wrap',
//     width: '100%',         // ensures wrapping within tab width
//     lineHeight: 18,
//   },
//   activeTabText: {
//     color: '#fff',
//     fontFamily: 'Urbanist-SemiBold',
//     fontSize: 14,
//     fontWeight: '600',
//     fontStyle: 'normal',

//   },
//   inactiveTabText: {
//     color: 'rgba(255, 255, 255, 0.64)',
//     fontFamily: 'Urbanist-SemiBold',
//     fontSize: 14,
//     fontWeight: '600',
//     fontStyle: 'normal',
//   },








//   tickImage: {
//     height: 24,
//     width: 24,
//   },

//   modeltitleContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     padding: 26,
//     backgroundColor: 'rgba(0, 0, 0, 0.07)',
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//   },
//   modeltitleContainer1: {
//     width: '100%',
//     paddingHorizontal: 26,
//     paddingBottom: 16,
//     backgroundColor:
//       Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.40)' : 'rgba(0, 0, 0, 0.07)',
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//   },
//   broderTopLeftRightRadius_30: {
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//   },
//   modelcontainer: {
//     height: '80%',
//     marginTop: 'auto',
//     // backgroundColor:
//     //   'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(0, 29, 252, 0.08) 0%, rgba(255, 255, 255, 0.10) 100%)',
//     width: '100%',
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     alignItems: 'center',
//     opacity: 0.91,
//     overflow: 'hidden',
//   },
//   bottomview: {
//     padding: 10,
//     width: '100%',
//     height: '10%',
//     display: 'flex',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingBottom: 20,

//     // backgroundColor: 'rgba(0, 0, 0, 0.001)',
//     // backgroundColor:
//     //   Platform.OS === 'ios' ? 'rgba(37, 76, 176, 0.18)' : 'rgba(0, 0, 0, 0.07)',

//     // marginBottom:16
//     position: 'absolute',
//     bottom: 0,
//   },
//   radioButtonSelected: {
//     backgroundColor: 'white',
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#ffffff4e',
//     boxShadow: '0 0.833px 3.333px 0 rgba(0, 0, 0, 0.25);',
//   },
//   radioButton: {
//     width: 8,
//     height: 8,
//     borderRadius: 10,
//   },
//   radioButton_round: {
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
//     width: 15,
//     height: 15,
//     flexShrink: 0,
//     borderColor: '#ffffff4e',

//     alignItems: 'center',
//     borderRadius: 50,
//     justifyContent: 'center',
//     boxShadow: '0 0.833px 3.333px 0 rgba(0, 0, 0, 0.25);',
//     shadowColor: '0 0.833px 3.333px rgba(0, 0, 0, 0.25',
//   },
//   cancelBtn: {
//     minHeight: 48,
//     flex: 1,
//     marginRight: 8,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 40,
//     //backgroundColor: 'rgba(138, 135, 135, 0.63)',
//     backgroundColor:
//       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(197, 196, 196, 0.49) 0%, rgba(255, 255, 255, 0.32) 100%)',
//     alignItems: 'center',
//     justifyContent: 'center',
//     boxShadow: '0 2px 8px 0 rgba(75, 75, 75, 0.19)',
//   },

//   loginButton: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.56)',
//     borderColor: '#ffffff2c',
//     minHeight: 48,
//     flex: 1,
//     //marginRight: 8,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 50,
//   },

//   overlay: {
//     flex: 1,
//     justifyContent: 'flex-end',
//   },
//   // activeTabText: {
//   //   color: '#fff',
//   //   fontFamily: 'Urbanist-SemiBold',
//   //   fontSize: 16,
//   //   fontWeight: '600',
//   //   fontStyle: 'normal',
//   //   width: '100%',
//   // },
//   // inactiveTabText: {
//   //   color: 'rgba(255, 255, 255, 0.64)',
//   //   fontFamily: 'Urbanist-SemiBold',
//   //   fontSize: 16,
//   //   fontWeight: '600',
//   //   fontStyle: 'normal',
//   //   width: '100%',
//   // },

//   // filtertitle: {
//   //   color: '#fff',
//   //   fontFamily: 'Urbanist-SemiBold',
//   //   fontSize: 16,
//   //   fontWeight: '600',
//   //   fontStyle: 'normal',
//   //   width: '100%',
//   // },
//   filterHeadTitle: {
//     color: 'rgba(255, 255, 255, 0.64)',
//     fontFamily: 'Urbanist-SemiBold',
//     fontSize: 16,
//     fontWeight: '600',
//     fontStyle: 'normal',
//     letterSpacing: 0.32,
//     lineHeight: 19.6,
//   },
//   filtertitleFilteryBy: {
//     color: '#fff',
//     fontFamily: 'Urbanist-Medium',
//     fontSize: 14,
//     fontWeight: '500',
//     fontStyle: 'normal',
//   },
//   filtertype: {
//     display: 'flex',
//     alignItems: 'center',
//     borderRadius: 14,
//     boxShadow:
//       '0 2px 8px 0 rgba(0, 0, 0, 0.25)inset 0 2px 8px 0 rgba(0, 0, 0, 0.25)',

//     justifyContent: 'center',
//     padding: 16,
//     gap: 4,
//     marginBottom: 5,
//   },

//   modelLeftSideContainer: {
//     width: '40%',
//     height: '100%',
//     padding: 16,
//     // backgroundColor:
//     //   Platform.OS === 'ios' ? 'rgba(37, 76, 176, 0.18)' : 'rgba(0, 0, 0, 0.07)',

//     backgroundColor:
//       Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.40)' : 'rgba(0, 0, 0, 0.07)',
//   },
//   modelTextHeader: {
//     color: 'rgba(255, 255, 255, 0.88)',
//     fontFamily: 'Urbanist-SemiBold',
//     fontSize: 17,
//     fontWeight: '600',
//     letterSpacing: -0.34,
//     lineHeight: 19.6,
//   },
//   clearAll: {
//     color: 'rgba(255, 255, 255, 0.54)',
//     fontFamily: 'Urbanist-SemiBold',
//     fontSize: 14,
//     fontWeight: '600',
//     letterSpacing: -0.34,
//     lineHeight: 19.6,
//   },
//   addButton: {
//     position: 'absolute',
//     zIndex: 11,
//     right: 20,
//     bottom: 90,
//     backgroundColor: '#98B3B7',
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 8,
//   },

//   addButtonText: {
//     color: '#fff',
//     fontSize: 18,
//   },
//   cancelText: {
//     color: 'rgba(255, 255, 255, 0.48)',
//     fontFamily: 'Urbanist-Medium',
//     fontSize: 17,
//     fontWeight: '500',
//     letterSpacing: 0.17,
//     lineHeight: 19.6,
//   },

//   sendText: {
//     color: '#000016',
//     textAlign: 'center',
//     fontFamily: 'Urbanist-Medium',
//     fontSize: 17,
//     fontWeight: 500,
//   },

//   // inactiveTab: {
//   //   display: 'flex',
//   //   alignItems: 'center',
//   //   borderRadius: 14,
//   //   justifyContent: 'center',
//   //   padding: 16,
//   //   gap: 4,
//   //   marginBottom: 5,
//   // },
//   // activeTab: {
//   //   display: 'flex',
//   //   alignItems: 'center',
//   //   backgroundColor:
//   //     'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(151, 151, 151, 0.4) 0%, rgba(255, 255, 255, 0.10) 100%)',
//   //   borderRadius: 12,
//   //   borderWidth: 0.5,
//   //   borderColor: '#ffffff0e',
//   //   justifyContent: 'center',
//   //   padding: 16,
//   //   gap: 4,
//   //   marginBottom: 5,
//   //   boxShadow: 'rgba(255, 255, 255, 0.16) inset -1px 0px 4px 2px',
//   //   height: 80,
//   // },

//   filterTypeTab: {
//     display: 'flex',
//     alignItems: 'center',
//     borderRadius: 14,
//     boxShadow:
//       '0 2px 8px 0 rgba(0, 0, 0, 0.25)inset 0 2px 8px 0 rgba(0, 0, 0, 0.25)',
//     justifyContent: 'center',
//     gap: 4,
//     marginBottom: 5,
//     textAlign: 'center',
//   },
// });

// export default FilterBottomSheet;
