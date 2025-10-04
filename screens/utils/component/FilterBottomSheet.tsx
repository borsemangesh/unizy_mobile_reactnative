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
import Slider from '@react-native-community/slider';
import RangeSlider from 'rn-range-slider';

// interface FilterBottomSheetProps {
//   catagory_id: number;
//   visible: boolean;
//   onClose: () => void;
// }

// const FilterBottomSheet = ({
//   catagory_id,
//   visible,
//   onClose,
// }: FilterBottomSheetProps) => {
//   const displayListOfProduct = async () => {
//     // if (isLoading || !hasMore) return;

//     try {
//       // setIsLoading(true);

//       const body = {
//         category_id: catagory_id,
//       };

//       const url = MAIN_URL.baseUrl + 'category/feature-list/search';
//       const token = await AsyncStorage.getItem('userToken');
//       if (!token) return;

//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(body),
//       });

//       const jsonResponse = await response.json();
//       console.log('API Response:', jsonResponse);

//       if (jsonResponse.statusCode === 200) {
//         const newFeatures = jsonResponse.data.features;
//       }
//     } catch (err) {
//       console.log('Error:', err);
//     } finally {
//       // setIsLoading(false);
//     }
//   };

//   const tabs = [
//     {
//       title: 'Sort By',
//       image: require('../../../assets/images/sort_vertical_02.png'),
//     },
//     {
//       title: 'Price',
//       image: require('../../../assets/images/currency_coin_pound.png'),
//     },
//     {
//       title: 'Featured Listing',
//       image: require('../../../assets/images/diamond.png'),
//     },
//   ];

//   const [selected, setSelected] = useState<string | null>(null);
//   const [selectedTab, setSelectedTab] = useState('Sort By');
//   const [selectedSort, setSelectedSort] = useState('Relevance');
//   const [activeTab, setActiveTab] = useState('Sort By');
//   const [title, setTitle] = useState('Sort By');

//   const handleTabPress = (tabTitle: string) => {
//     setSelectedTab(tabTitle);
//     setActiveTab(tabTitle);
//     setTitle(tabTitle);
//   };

//   const renderSortOptions = () => {
//     if (selectedTab === 'Sort By') {
//       return (
//         <View style={{ width: '100%', height: '100%', gap: 10 }}>
//           <View style={{ gap: 10 }}>
//             {sortOptions.map(option => (
//               <>
//                 <View
//                   style={{
//                     flexDirection: 'row',
//                     alignItems: 'center',
//                     justifyContent: 'space-between',
//                     height: 40,
//                   }}
//                 >
//                   <Text
//                     key={option}
//                     style={styles.filtertitleFilteryBy}
//                     onPress={() => setSelectedSort(option)}
//                   >
//                     {option}
//                   </Text>

//                   <View style={styles.radioButton_round}>
//                     <View
//                       style={[
//                         styles.radioButton,
//                         // selected === item.code &&
//                         // selectlang_styles.radioButtonSelected,
//                       ]}
//                     />
//                   </View>
//                 </View>
//               </>
//             ))}
//           </View>
//         </View>
//       );
//     } else if (selectedTab === 'Price') {
//       return (
//         <View style={{ width: '60%', height: '100%', gap: 10 }}>
//           <Text style={styles.filtertitle}>Price</Text>
//           {/* Render price-related options */}
//         </View>
//       );
//     } else if (selectedTab === 'Featured Listing') {
//       return (
//         <View style={{ width: '60%', height: '100%', gap: 10 }}>
//           <Text style={styles.filtertitle}>Featured Listing</Text>
//           {/* Render featured listing-related options */}
//         </View>
//       );
//     }
//     return null;
//   };

//   const sortOptions = [
//     'Relevance',
//     'Rating: High to Low',
//     'Price: Low to High',
//     'Price: High to Low',
//   ];
//   return (
//     <Modal
//       animationType="slide"
//       visible={visible}
//       transparent
//       onRequestClose={onClose}
//     >
//       <View style={styles.overlay}>
//         <View style={styles.modelcontainer}>
//           <BlurView
//             style={[
//               StyleSheet.absoluteFill,
//               styles.broderTopLeftRightRadius_30,
//             ]}
//             blurAmount={40}
//             reducedTransparencyFallbackColor="white"
//           />
//           <View>
//             <View style={styles.modeltitleContainer}>
//               <Text style={styles.modelTextHeader}>Filters</Text>
//               <TouchableOpacity
//                 onPress={() => {
//                   console.log('Clear All Clicked');
//                 }}
//               >
//                 <Text style={styles.clearAll}>Clear all</Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           <View
//             style={{
//               width: '100%',
//               height: '80%',
//               backgroundColor: '#5d5c5c14',
//             }}
//           >
//             <View
//               style={{
//                 height: '100%',
//                 marginBottom: 10,
//                 display: 'flex',
//                 flexDirection: 'row',
//               }}
//             >
//               <View style={styles.modelLeftSideContainer}>
//                 {tabs.map(tab => (
//                   <TouchableOpacity
//                     key={tab.title}
//                     onPress={() => handleTabPress(tab.title)}
//                     style={[
//                       //   styles.filtertype,
//                       selectedTab === tab.title
//                         ? styles.activeTab
//                         : styles.inactiveTab,
//                     ]}
//                   >
//                     <View style={styles.filterTypeTab}>
//                       <Image
//                         source={tab.image}
//                         style={{ width: 24, height: 24 }}
//                       />
//                       <Text style={styles.filtertitle}>{tab.title}</Text>
//                     </View>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//               <View
//                 style={{
//                   width: '60%',
//                   height: '100%',
//                   gap: 10,
//                   padding: 16,
//                   backgroundColor: '#5d5c5c3c',
//                 }}
//               >
//                 <Text style={styles.filterHeadTitle}>{title}</Text>
//                 {renderSortOptions()}
//               </View>
//             </View>
//           </View>

//           <View style={styles.bottomview}>
//             <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
//               <Text style={styles.cancelText}>Cancel</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.cancelBtn, { backgroundColor: '#ffffff4e' }]}
//               onPress={onClose}
//             >
//               <Text style={[styles.cancelText, { color: '#000000' }]}>
//                 Apply
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };



//addded after

interface FilterBottomSheetProps {
  catagory_id: number;
  visible: boolean;
  onClose: () => void;
}

const FilterBottomSheet = ({
  catagory_id,
  visible,
  onClose,
}: FilterBottomSheetProps) => {
  const [filters, setFilters] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  const [dropdownSelections, setDropdownSelections] = useState<Record<number, number[]>>({});

const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
const [sliderLow, setSliderLow] = useState(priceRange.min);
const [sliderHigh, setSliderHigh] = useState(priceRange.max);

  const fetchFilters = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const body = { category_id: 1 };
      const url = MAIN_URL.baseUrl + 'category/feature/filter';

      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.statusCode === 200) {
        // const dynamicFilters = data.data.filter(
        //   (item: any) =>
        //     (item.field_type === 'dropdown') || item.alias_name === 'price'
        // );
        const dynamicFilters = data.data.filter(
        (item: any) =>
          item.field_type?.toLowerCase() === "dropdown" ||
          item.alias_name?.toLowerCase() === "price"
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
      style={{ flexGrow: 0 ,paddingBottom:10}}
      showsVerticalScrollIndicator={false}
    >
      {currentFilter.options.map((opt: any) => (
        <TouchableOpacity
          key={opt.id}
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
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
          <Text style={{ color: 'white' }}>{opt.option_name || opt.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

    
    // else if (currentFilter.alias_name === 'price') {
    //   return (
    //     <View>
    //       <Text style={{ color: 'white', marginBottom: 10 }}>
    //         Range: {priceRange.min} - {priceRange.max}
    //       </Text>
    //       <Slider
    //         minimumValue={currentFilter.minvalue || 0}
    //         maximumValue={currentFilter.maxvalue || 10000}
    //         value={priceRange.min}
    //         onValueChange={val => setPriceRange(prev => ({ ...prev, min: val }))}
    //       />
         
    //     </View>
    //   );
    // }

 else if (currentFilter.alias_name === 'price') {
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
        renderThumb={() => <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' }} />}
        renderRail={() => <View style={{ height: 4, backgroundColor: '#888', borderRadius: 2 }} />}
        renderRailSelected={() => <View style={{ height: 4, backgroundColor: '#fff', borderRadius: 2 }} />}
      />
    </View>
  );
}


    return null;
  };

  return (
    <Modal animationType="slide" visible={visible} transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modelcontainer}>
          <BlurView style={[StyleSheet.absoluteFill, styles.broderTopLeftRightRadius_30]} blurAmount={40} />
          <View style={styles.modeltitleContainer}>
            <Text style={styles.modelTextHeader}>Filters</Text>
            <TouchableOpacity onPress={() => {
              setDropdownSelections({});
              setPriceRange({ min: 0, max: 10000 });
            }}>
              <Text style={styles.clearAll}>Clear all</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#5d5c5c14' }}>
            <View style={styles.modelLeftSideContainer}>
              {filters.map(f => (
                <TouchableOpacity
                  key={f.field_name}
                  onPress={() => handleTabPress(f.field_name)}
                  style={selectedTab === f.field_name ? styles.activeTab : styles.inactiveTab}
                >
                  <Text style={styles.filtertitle}>{f.field_name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flex: 1, padding: 16, backgroundColor: '#5d5c5c3c' }}>
              <Text style={styles.filterHeadTitle}>{selectedTab}</Text>
              {renderRightContent()}
            </View>
          </View>

          <View style={styles.bottomview}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: '#ffffff4e' }]} onPress={onClose}>
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



