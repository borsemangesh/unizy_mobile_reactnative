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
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { BlurView } from '@react-native-community/blur';
import { CONSTDEFAULT } from '../CONSTDEFAULT';
import { MAIN_URL } from '../APIConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RangeSlider from 'rn-range-slider';

interface FilterBottomSheetProps {
  catagory_id: number;
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void; // 👈 new callback
}
const FilterBottomSheet = ({
  catagory_id,
  visible,
  onClose,
  onApply
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

      const body = { category_id: catagory_id};
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
        setFilters(dynamicFilters);
        if (dynamicFilters.length) setSelectedTab(dynamicFilters[0].field_name);
      }
    } catch (err) {
      console.log('Error fetching filters:', err);
    }
  };

  useEffect(() => {
    if (visible) fetchFilters();
  }, [visible]);

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

  const renderRightContent = () => {
    const currentFilter = filters.find(f => f.field_name === selectedTab);
    if (!currentFilter) return null;

    if (currentFilter.field_type === 'dropdown') {
      return (
        <ScrollView
          style={{ flexGrow: 0, paddingBottom: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {currentFilter.options.map((opt: any) => (
            <TouchableOpacity
              key={opt.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 8,
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
                  <Text style={{ color: '#FFF', fontSize: 12 }}>✓</Text>
                )}
              </View>
              <Text style={{ color: 'white' }}>
                {opt.option_name || opt.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      );
    } else if (currentFilter.alias_name === 'price') {
      return (
        <View>
          <Text style={{ color: 'white', marginBottom: 10 }}>
            Range: {sliderLow} - {sliderHigh}
          </Text>

          <RangeSlider
            min={currentFilter.minvalue || 0}
            max={currentFilter.maxvalue || 10000}
            step={1}
            low={sliderLow}
            high={sliderHigh}
            onValueChanged={(l, h) => {
              setSliderLow(l);
              setSliderHigh(h);
              setPriceRange({ min: l, max: h }); // update your main filter state
            }}
            renderThumb={() => (
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#fff',
                }}
              />
            )}
            renderRail={() => (
              <View
                style={{ height: 4, backgroundColor: '#888', borderRadius: 2 }}
              />
            )}
            renderRailSelected={() => (
              <View
                style={{ height: 4, backgroundColor: '#fff', borderRadius: 2 }}
              />
            )}
          />
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

  // send filter body back to parent
  onApply(filterBody);

  // close bottom sheet
  onClose();
};

  return (
    <Modal
      animationType="slide"
      visible={visible}
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modelcontainer}>
          <BlurView
            style={[
              StyleSheet.absoluteFill,
              styles.broderTopLeftRightRadius_30,
            ]}
            blurAmount={40}
            pointerEvents='none'
          />
          <View style={styles.modeltitleContainer}>
            <Text style={styles.modelTextHeader}>Filters</Text>
            <TouchableOpacity
              onPress={() => {
                setDropdownSelections({});
                setPriceRange({ min: 0, max: 10000 });
              }}
            >
              <Text style={styles.clearAll}>Clear all</Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              backgroundColor: '#5d5c5c14',
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
                  <Text style={styles.filtertitle}>{f.field_name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View
              style={{ flex: 1, padding: 16, backgroundColor: '#5d5c5c3c' }}
            >
              <Text style={styles.filterHeadTitle}>{selectedTab}</Text>
              {renderRightContent()}
            </View>
          </View>

          <View style={styles.bottomview}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: '#ffffff4e' }]}
              onPress={handleApply}
            >
              <Text style={[styles.cancelText, { color: '#000' }]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modeltitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 26,
    backgroundColor: '#5d5c5c14',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  broderTopLeftRightRadius_30: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modelcontainer: {
    height: '84%',
    marginTop: 'auto',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(0, 0, 0, 0.59) 0%, rgba(255, 255, 255, 0.10) 100%)',
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    filter: 'drop-shadow(0 0.833px 3.333px rgba(0, 0, 0, 0.02))',
  },
  bottomview: {
    padding: 10,
    width: '100%',
    height: '10%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#5d5c5c14',
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
    flex: 1,
    marginRight: 8,
    padding: 12,
    borderRadius: 50,
    // backgroundColor: 'gray',
    backgroundColor: '#ffffff1b',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px 0 rgba(75, 75, 75, 0.19)',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    flex: 1,
    justifyContent: 'flex-end',
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
    fontFamily: 'Urbanist-Regular',
    fontSize: 17,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0.17,
    lineHeight: 19.6,
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

export default FilterBottomSheet;
