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
import FilterButton from './FilterButton';
import FilterButtonApply from './FilterButtonApply';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';

interface FilterAndroidProps {
  catagory_id: number;
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void; // 👈 new callback
  from: number;
  to: number;
  initialFilters?: any;
}
const FilterAndroid = ({
  catagory_id,
  visible,
  onClose,
  onApply,
  initialFilters,
}: FilterAndroidProps) => {
  const [filters, setFilters] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  const [dropdownSelections, setDropdownSelections] = useState<
    Record<number, number[]>
  >({});
  type PriceRange = { min: number; max: number } | null;

  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [defaultPriceRange, setDefaultPriceRange] = useState({
    min: 0,
    max: 10000,
  });
  const [sliderLow, setSliderLow] = useState(priceRange.min);
  const [sliderHigh, setSliderHigh] = useState(priceRange.max);
  const [lastAppliedPriceRange, setLastAppliedPriceRange] =
    useState<PriceRange>(null);

  const [postcode, setPostcode] = useState<string>('');
  const [lastAppliedPostcode, setLastAppliedPostcode] = useState<string | null>(
    null,
  );
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const [otherInputs, setOtherInputs] = useState<Record<number, string>>({});

  const [distanceLow, setDistanceLow] = useState(0);
  const [distanceHigh, setDistanceHigh] = useState(1000);

  const [isPriceChanged, setIsPriceChanged] = useState(false);
  const [isDistanceChanged, setIsDistanceChanged] = useState(false);

  const fetchFilters = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const language_code =
        (await AsyncStorage.getItem('selectedLanguage')) || 'en';
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
          languagecode: language_code,
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
          (item: any) => item.alias_name?.toLowerCase() === 'price',
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
          const [minVal, maxVal] = f.options;
          setPriceRange({ min: minVal, max: maxVal });
          setSliderLow(minVal);
          setSliderHigh(maxVal);
          setLastAppliedPriceRange({ min: minVal, max: maxVal }); // ✅ added
        }
      });

      setDropdownSelections(savedDropdowns);
    }
  }, [visible, initialFilters]);

  const { t } = useTranslation();
  const modelClose = () => {
    onClose();
  };

  const handleTabPress = (tabName: string) => {
    setSelectedTab(tabName);
  };

  // const toggleDropdownOption = (
  //   fieldId: number,
  //   optionId: number,
  //   isMultiple: boolean,
  // ) => {
  //   setDropdownSelections(prev => {
  //     const current = prev[fieldId] || [];

  //     if (isMultiple) {
  //       // MULTI SELECT (checkbox)
  //       if (current.includes(optionId)) {
  //         return { ...prev, [fieldId]: current.filter(id => id !== optionId) };
  //       } else {
  //         return { ...prev, [fieldId]: [...current, optionId] };
  //       }
  //     } else {
  //       // SINGLE SELECT (radio)
  //       return { ...prev, [fieldId]: [optionId] };
  //     }
  //   });
  // };

  const toggleDropdownOption = (
    fieldId: number,
    optionId: number,
    isMultiple: boolean,
  ) => {
    setDropdownSelections(prev => {
      const current = prev[fieldId] || [];

      // 🔍 Find current filter + option
      const filter = filters.find(f => f.id === fieldId);
      const option = filter?.options?.find((o: any) => o.id === optionId);

      const isOtherOption =
        option?.option_name?.toLowerCase() === 'other' ||
        option?.name?.toLowerCase() === 'other';

      let updated: number[] = [];

      if (isMultiple) {
        if (current.includes(optionId)) {
          // ❌ UNSELECT
          updated = current.filter(id => id !== optionId);

          // ✅ If "Other" unchecked → remove input
          if (isOtherOption) {
            setOtherInputs(prevInputs => {
              const copy = { ...prevInputs };
              delete copy[fieldId];
              return copy;
            });
          }
        } else {
          // ✅ SELECT
          updated = [...current, optionId];
        }
      } else {
        // 🔘 SINGLE SELECT (radio)

        // ✅ If switching FROM "Other" → clear old input
        const previousSelectedId = current[0];
        const previousOption = filter?.options?.find(
          (o: any) => o.id === previousSelectedId,
        );

        const wasOther =
          previousOption?.option_name?.toLowerCase() === 'other' ||
          previousOption?.name?.toLowerCase() === 'other';

        if (wasOther) {
          setOtherInputs(prevInputs => {
            const copy = { ...prevInputs };
            delete copy[fieldId];
            return copy;
          });
        }

        updated = [optionId];
      }

      return { ...prev, [fieldId]: updated };
    });
  };
  // const handleClearFilters = () => {
  //   setDropdownSelections({});
  //   setPriceRange(defaultPriceRange);
  //   setSliderLow(defaultPriceRange.min);
  //   setSliderHigh(defaultPriceRange.max);
  //   setDateSelections({});
  //   setPostcode('');
  //   setOtherInputs({});
  // };
  const handleClearFilters = () => {
    setDropdownSelections({});

    setPriceRange(defaultPriceRange);
    setSliderLow(defaultPriceRange.min);
    setSliderHigh(defaultPriceRange.max);

    setDistanceLow(0);
    setDistanceHigh(1000);

    setIsPriceChanged(false); // ✅ IMPORTANT
    setIsDistanceChanged(false); // ✅ IMPORTANT

    setIsKm(true);
    setPostcode('');
    setOtherInputs({});
    setDateSelections({});
  };

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
      setPriceRange(defaultPriceRange);
      setSliderLow(defaultPriceRange.min);
      setSliderHigh(defaultPriceRange.max);
      setPostcode('');
    }

    onClose();
  };

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [activeDateField, setActiveDateField] = useState<{
    param: any;
    type: 'start' | 'end';
  } | null>(null);

  const [tempDate, setTempDate] = useState(new Date());

  const [dateSelections, setDateSelections] = useState<
    Record<number, { startDate?: Date; endDate?: Date }>
  >({});

  //   const [sliderLow, setSliderLow] = useState(0);
  // const [sliderHigh, setSliderHigh] = useState(50);
  const [isKm, setIsKm] = useState(true);

  // Convert values dynamically
  const convertValue = (value: any) => {
    return isKm ? value : (value * 0.621371).toFixed(1);
  };
  const [addInformation, setAddInformation] = useState('');

  const kmToMiles = (km: number) => km * 0.621371;
  const milesToKm = (mi: number) => mi / 0.621371;
  const renderRightContent = () => {
    const currentFilter = filters.find(f => f.field_name === selectedTab);
    if (!currentFilter) return null;
    if (currentFilter.field_type === 'dropdown') {
      return (
        <ScrollView style={{ flexGrow: 0, paddingTop: 10 }}>
          {currentFilter.options.map((opt: any) => {
            const isMultiple = currentFilter.ismultilple;
            const selectedValues = dropdownSelections[currentFilter.id] || [];

            const isSelected = currentFilter.ismultilple
              ? selectedValues.includes(opt.id)
              : selectedValues[0] === opt.id;

            const isSelectedCheckbox = selectedValues.includes(opt.id);
            const isSelectedRadio = selectedValues[0] === opt.id;

            const isOtherOption =
              opt.option_name?.toLowerCase() === 'other' ||
              opt.name?.toLowerCase() === 'other';
         
            return (
              <View key={opt.id}>
               
               
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                  }}
                  onPress={() =>
                    toggleDropdownOption(
                      currentFilter.id,
                      opt.id,
                      currentFilter.ismultilple,
                    )
                  }
                >
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
                    <View style={styles.radioOuterCircle}>
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
                {isOtherOption && isSelected && (
                  <TextInput
                    style={[
                      styles.login_container,
                      styles.personalEmailID_TextInput,
                      { marginBottom: 10, width: '100%' },
                    ]}
                    placeholder="Please specify"
                    placeholderTextColor="#aaa"
                    selectionColor={'#FFFFFF'}
                    cursorColor={'#FFFFFF'}
                    value={otherInputs[currentFilter.id] || ''}
                    onChangeText={text => {
                      setOtherInputs(prev => ({
                        ...prev,
                        [currentFilter.id]: text,
                      }));
                    }}
                  />
                )}
              </View>
            );
          })}
        </ScrollView>
      );
    } else if (currentFilter.alias_name === 'price') {
      return (
        <View style={{ zIndex: 999, position: 'relative' }}>
          {/* <Text
            allowFontScaling={false}
            style={{ color: 'white', marginBottom: 10 }}
          >
            {t('range')}: {sliderLow} - {sliderHigh}
          </Text> */}

          <View style={{ paddingTop: 10, paddingBottom: 20, paddingLeft: 0 }}>
            <View
              style={{
                flexDirection: 'row',
                flex: 2,
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1 }}>
                {/* MIN INPUT */}
                <Text
                  allowFontScaling={false}
                  style={{
                    color: 'rgba(255, 255, 255, 0.73)',
                    paddingBottom: 6,
                    paddingStart: 10,
                  }}
                >
                  {t('min')}
                </Text>
                <TextInput
                  style={[
                    styles.login_container,
                    styles.personalEmailID_TextInput,
                    { width: '94%' },
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
                    setIsPriceChanged(true);
                  }}
                />
              </View>

              <View style={{ flex: 1, width: '100%' }}>
                <Text
                  allowFontScaling={false}
                  style={{
                    color: 'rgba(255, 255, 255, 0.73)',
                    paddingBottom: 6,
                    paddingStart: 10,
                  }}
                >
                  {t('max')}
                </Text>
                {/* MAX INPUT */}
                <TextInput
                  style={[
                    styles.login_container,
                    styles.personalEmailID_TextInput,
                    { width: '98%' },
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
                    setIsPriceChanged(true);
                  }}
                />
              </View>
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
              { width: '100%', marginTop: 10 },
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
      currentFilter.alias_name?.toLowerCase().includes('postcode')
    ) {
      console.log('currentFilter', currentFilter);
      return (
        <View style={{ paddingTop: 10 }}>
          <View style={styles.container}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignContent: 'center',
              }}
            >
              {/* 🔁 KM / Miles Toggle */}
              <Text
                style={[
                  {
                    color: 'white',
                    marginBottom: 10,
                    fontFamily: 'Ubuntu-Medium',
                  },
                ]}
              >
                Distance
              </Text>
              <View>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, isKm && styles.active]}
                    onPress={() => setIsKm(true)}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        { color: isKm ? '#FFF' : '#000' },
                      ]}
                    >
                      KM
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.toggleBtn, !isKm && styles.active]}
                    onPress={() => setIsKm(false)}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        { color: isKm ? '#000' : '#fff' },
                      ]}
                    >
                      Miles
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.rangeText}>
                  {/* {convertValue(distanceLow)} - {convertValue(distanceHigh)}{' '}
                  {isKm ? 'km' : 'mi'} */}
                  {/* 0 - {isKm ? distanceHigh : kmToMiles(distanceHigh).toFixed(1)}{' '}
                  {isKm ? 'km' : 'mi'} */}
                  0 -{' '}
                  {isKm
                    ? distanceHigh.toFixed(0)
                    : kmToMiles(distanceHigh).toFixed(1)}{' '}
                  {isKm ? 'km' : 'mi'}
                </Text>
              </View>
            </View>

            {/* 🎚 Multi Slider */}

            <MultiSlider
              sliderLength={SCREEN_WIDTH / 2 - 10}
              min={1}
              max={isKm ? 1000 : kmToMiles(1000)}
              step={1}
              // values={[
              //   isKm ? distanceHigh : kmToMiles(distanceHigh),
              // ]}
              values={[isKm ? distanceHigh : kmToMiles(distanceHigh)]}
              onValuesChange={values => {
                const [value] = values;

                // Always store in KM internally
                const valueInKm = isKm ? value : milesToKm(value);

                // setDistanceHigh(Math.round(valueInKm));
                setDistanceHigh(valueInKm);
                setIsDistanceChanged(true);
              }}
              allowOverlap={false}
              snapped
              selectedStyle={{ backgroundColor: '#fff' }}
              unselectedStyle={{ backgroundColor: '#888' }}
              trackStyle={{ height: 4, borderRadius: 2 }}
              markerStyle={{
                height: 20,
                borderRadius: 12,
                backgroundColor: '#fff',
                width: 4,
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setDistanceHigh(prev => {
                    let currentValue = isKm ? prev : kmToMiles(prev);

                    let newValue = currentValue - 1;

                    if (newValue < 1) return prev;

                    // ✅ FIX: normalize to 1 decimal
                    newValue = parseFloat(newValue.toFixed(1));

                    return isKm ? newValue : milesToKm(newValue);
                  });

                  setIsDistanceChanged(true);
                }}
              >
                <Image
                  source={
                    true
                      ? require('../../../assets/images/blur_minus_512.png')
                      : require('../../../assets/images/icon1.png')
                  }
                  style={{ width: 30, height: 30 }}
                />
              </TouchableOpacity>

              <Text
                allowFontScaling={false}
                style={{
                  color: '#FFF',
                  fontSize: 14,
                  textAlign: 'center',
                  fontFamily: 'Urbanist-SemiBold',
                  fontWeight: 600,
                }}
              >
                {isKm
                  ? distanceHigh.toFixed(0)
                  : kmToMiles(distanceHigh).toFixed(1)}{' '}
                
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setDistanceHigh(prev => {
                    let currentValue = isKm ? prev : kmToMiles(prev);

                    let newValue = currentValue + 1;

                    const max = isKm ? 1000 : kmToMiles(1000);
                    if (newValue > max) return prev;

                    // ✅ FIX: normalize to 1 decimal
                    newValue = parseFloat(newValue.toFixed(1));

                    return isKm ? newValue : milesToKm(newValue);
                  });

                  setIsDistanceChanged(true);
                }}
              >
                <Image
                  source={
                    true //count === maxUnits
                      ? require('../../../assets/images/blur_plus_512.png')
                      : require('../../../assets/images/icon2.png')
                  }
                  style={{ width: 30, height: 30 }}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* <TextInput
            style={[
              styles.login_container,
              styles.personalEmailID_TextInput,
              { width: '100%' },
            ]}
            keyboardType="default"
            placeholder={t('enter_postal_code')}
            placeholderTextColor="#aaa"
            value={postcode}
            onChangeText={text => {
              const filteredText = text
                .replace(/[^a-zA-Z0-9]/g, '')
                .toUpperCase();
              if (filteredText.length > 7) return;
              setPostcode(filteredText);
            }}
          /> */}
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
    new Map(filters.map(f => [f.id, f])).values(),
  );

  const handleApply = () => {
    const selectedFilters = uniqueFilters
      .map(f => {
        if (f.field_type === 'dropdown' && dropdownSelections[f.id]?.length) {
          const selectedIds = dropdownSelections[f.id];
          const selectedOptions = f.options.filter((opt: any) =>
            selectedIds.includes(opt.id),
          );

          const hasOther = selectedOptions.find(
            (opt: any) =>
              opt.option_name?.toLowerCase() === 'other' ||
              opt.name?.toLowerCase() === 'other',
          );

          // return {
          //   id: f.id,
          //   field_name: f.field_name,
          //   field_type: f.field_type,
          //   alias_name: f.alias_name,
          //   options: dropdownSelections[f.id],
          // };
          return {
            id: f.id,
            field_name: f.field_name,
            field_type: f.field_type,
            alias_name: f.alias_name,
            options: selectedIds,
            ...(hasOther && {
              other_value: otherInputs[f.id] || '',
            }),
          };
        } else if (f.alias_name?.toLowerCase() === 'price' && isPriceChanged) {
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
        }
        // else if (
        //   f.field_type?.toLowerCase() === 'text' &&
        //   f.field_name?.toLowerCase().includes('postcode')
        // ) {
        //   if (postcode) {
        //     return {
        //       id: f.id,
        //       field_name: f.field_name,
        //       field_type: f.field_type,
        //       alias_name: f.alias_name,
        //       options: [postcode],
        //     };
        //   }
        // }
        else if (
          f.field_type?.toLowerCase() === 'text' &&
          f.alias_name?.toLowerCase().includes('postcode') &&
          isDistanceChanged
        ) {
          if (postcode || distanceLow !== null || distanceHigh !== null) {
            const min = isKm ? distanceLow : kmToMiles(distanceLow);
            const max = isKm ? distanceHigh : kmToMiles(distanceHigh);
            return {
              id: f.id,
              field_name: f.field_name,
              field_type: f.field_type,
              alias_name: f.alias_name,
              options: [Math.round(min), Math.round(max), isKm ? 'km' : 'mi'],
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

  const currentFilter = filters.find(f => f.field_name === selectedTab);

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
        blurAmount={Platform.OS === 'ios' ? 3 : 4}
        reducedTransparencyFallbackColor="transparent"
      />
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
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={modelClose}>
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
                    bottom: 0,
                    borderRadius: 30,
                  },
                ]}
                blurType="dark"
                blurAmount={100}
                pointerEvents="none"
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

              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                }}
              >
                <View style={styles.modelLeftSideContainer}>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
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
                  style={{ flex: 1, backgroundColor: '#5d5c5c3c' }}
                  contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                  showsVerticalScrollIndicator={false}
                >
                  <Text allowFontScaling={false} style={styles.filterHeadTitle}>
                    {selectedTab}
                  </Text>
                  {currentFilter?.id === 44 && currentFilter?.description ? (
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Urbanist-medium',
    fontSize: 10,
    fontWeight: '400',
    fontStyle: 'normal',
                       
                      }}
                    >
                     ({currentFilter.description}) 
                    </Text>
                  ) : null}
                  {renderRightContent()}
                </ScrollView>
              </View>

              <View style={styles.bottomview}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleClose}
                >
                  <Text allowFontScaling={false} style={styles.cancelText}>
                    {t('cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.loginButton, {}]}
                  onPress={handleApply}
                >
                  <Text allowFontScaling={false} style={[styles.sendText]}>
                    {t('apply')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {showDatePicker && activeDateField && (
            // <DateTimePicker
            //   value={tempDate}
            //   mode="date"
            //   display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
            //   themeVariant="light"
            //   minimumDate={
            //     activeDateField.type === 'end'
            //       ? dateSelections[activeDateField.param.id]?.startDate ??
            //         new Date()
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
            //             [activeDateField.type === 'start'
            //               ? 'startDate'
            //               : 'endDate']: selectedDate,
            //           },
            //         };
            //       });
            //     }
            //     setShowDatePicker(false);
            //   }}
            // />
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
              themeVariant="light"
              minimumDate={
                activeDateField.type === 'end'
                  ? dateSelections[activeDateField.param.id]?.startDate ||
                    undefined
                  : undefined // ✅ No restriction for start date
              }
              onChange={(event, selectedDate) => {
                if (event.type === 'set' && selectedDate) {
                  const fieldId = activeDateField.param.id;

                  setDateSelections(prev => {
                    const existing = prev[fieldId] || {};

                    return {
                      ...prev,
                      [fieldId]: {
                        ...existing,
                        [activeDateField.type === 'start'
                          ? 'startDate'
                          : 'endDate']: selectedDate,
                      },
                    };
                  });
                }
                setShowDatePicker(false);
              }}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  radioOuterCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  container: {
    paddingTop: 16,
  },

  toggleContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: 10,
    backgroundColor: '#eee',
    borderRadius: 20,
  },

  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  active: {
    backgroundColor: '#4CAF50',
  },

  toggleText: {
    fontWeight: '600',
  },

  rangeText: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
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
  filterLogo: {
    width: 20,
    height: 20,
    marginTop: 4,
  },

  modeltitleContainer1: {
    width: '100%',
    paddingHorizontal: 26,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.07)',
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
    overflow: 'hidden',
  },
  bottomview: {
    padding: 10,
    width: '100%',
    height: '10%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.001)',
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
});

export default FilterAndroid;
