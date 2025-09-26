import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
} from 'react-native';
import React, { useState } from 'react';
interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

const sort = require('../../../assets/images/sort_vertical_02.png');
const price = require('../../../assets/images/currency_coin_pound.png');
const featureListing = require('../../../assets/images/diamond.png');

const FilterBottomSheet = ({ visible, onClose }: FilterBottomSheetProps) => {
  const tabs = [
    {
      title: 'Sort by',
      image: require('../../../assets/images/sort_vertical_02.png'),
    },
    {
      title: 'Price',
      image: require('../../../assets/images/currency_coin_pound.png'),
    },
    {
      title: 'Featured Listing',
      image: require('../../../assets/images/diamond.png'),
    },
  ];

  const [selected, setSelected] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('Sort by');
  const [selectedSort, setSelectedSort] = useState('Relevance');
  const [activeTab, setActiveTab] = useState('Sort by');
  const [title, setTitle] = useState('Sort by');

  const handleTabPress = (tabTitle: string) => {
    setSelectedTab(tabTitle);
    setActiveTab(tabTitle);
    setTitle(tabTitle);
  };

  const renderSortOptions = () => {
    if (selectedTab === 'Sort by') {
      return (
        <View style={{ width: '100%', height: '100%', gap: 10 }}>
          <View style={{ gap: 10 }}>
            {sortOptions.map(option => (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 40,
                  }}
                >
                  <Text
                    key={option}
                    style={styles.filtertitle}
                    onPress={() => setSelectedSort(option)}
                  >
                    {option}
                  </Text>

                  <View style={styles.radioButton_round}>
                    <View
                      style={[
                        styles.radioButton,
                        // selected === item.code &&
                        // selectlang_styles.radioButtonSelected,
                      ]}
                    />
                  </View>
                </View>
              </>
            ))}
          </View>
        </View>
      );
    } else if (selectedTab === 'Price') {
      return (
        <View style={{ width: '60%', height: '100%', gap: 10 }}>
          <Text style={styles.filtertitle}>Price</Text>
          {/* Render price-related options */}
        </View>
      );
    } else if (selectedTab === 'Featured Listing') {
      return (
        <View style={{ width: '60%', height: '100%', gap: 10 }}>
          <Text style={styles.filtertitle}>Featured Listing</Text>
          {/* Render featured listing-related options */}
        </View>
      );
    }
    return null;
  };

  const sortOptions = [
    'Relevance',
    'Rating: High to Low',
    'Price: Low to High',
    'Price: High to Low',
  ];
  return (
    <Modal
      animationType="slide"
      visible={visible}
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={{
            height: '84%',
            marginTop: 'auto',
            backgroundColor: 'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(0, 0, 0, 0.74) 0%, rgba(255, 255, 255, 0.10) 100%)',
            width: '100%',
            borderTopLeftRadius: 50,
            borderTopRightRadius: 50,
            alignItems: 'center',
            filter: 'drop-shadow(0 0.833px 3.333px rgba(0, 0, 0, 0.02))',
//             fill: radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%);
// filter: drop-shadow(0 0.833px 3.333px rgba(0, 0, 0, 0.25));
          }}
        >
          <View>
            <View
              style={{
                width: '10%',
                height: 1,
                backgroundColor: '#fff',
                paddingTop: 1,
                marginTop: 10,
              }}
            ></View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: 25,
                width: '100%',
                backgroundColor: '#5d5c5cff',
              }}
            >
              <Text style={styles.modelTextHeader}>Filters</Text>
              <TouchableOpacity
                onPress={() => {
                  console.log('Clear All Clicked');
                }}
              >
                <Text style={styles.modelTextHeader}>Clear all</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ width: '100%', height: '80%' }}>
            <View
              style={{
                height: '100%',
                marginBottom: 10,
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <View style={styles.modelLeftSideContainer}>
                {tabs.map(tab => (
                  <TouchableOpacity
                    key={tab.title}
                    onPress={() => handleTabPress(tab.title)}
                    style={[
                      //   styles.filtertype,
                      selectedTab === tab.title
                        ? styles.activeTab
                        : styles.inactiveTab,
                    ]}
                  >
                    <View style={styles.filterTypeTab}>
                      <Image
                        source={tab.image}
                        style={{ width: 24, height: 24 }}
                      />
                      <Text style={styles.filtertitle}>{tab.title}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <View
                style={{ width: '60%', height: '100%', gap: 10, padding: 16 }}
              >
                <Text style={styles.filtertitle}>{title}</Text>
                {renderSortOptions()}
              </View>
            </View>
          </View>

          <View
            style={{
              padding: 10,
              width: '100%',
              height: '10%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    borderRadius: 10,
    backgroundColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
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
    letterSpacing: -0.32,
    lineHeight: 19.6,
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
    height: '120%',
    padding: 16,
    backgroundColor: '#5d5c5cc6',
  },
  modelTextHeader: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist',
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
  cancelText: { color: '#fff', fontWeight: '600' },

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
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(151, 151, 151, 0.85) 0%, rgba(255, 255, 255, 0.10) 100%)',
    borderRadius: 14,
    boxShadow:
      '0 2px 8px 0 rgba(0, 0, 0, 0.25)inset 0 2px 8px 0 rgba(0, 0, 0, 0.25)',

    justifyContent: 'center',
    padding: 16,
    gap: 4,
    marginBottom: 5,
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
  },
});

export default FilterBottomSheet;
