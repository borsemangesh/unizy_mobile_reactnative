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

interface SelectCatagoryDropdownProps {
  options: { id: number; option_name: string }[];
  visible: boolean;
  ismultilple: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onSelect: (selectedId: number | number[]) => void;
  selectedValues?: number | number[];
}
const SelectCatagoryDropdown = ({
  options,
  visible,
  ismultilple,
  title,
  subtitle,
  onClose,
  onSelect,
  selectedValues,
}: SelectCatagoryDropdownProps) => {
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<number[]>([]); // For checkboxes
  const [selectedRadio, setSelectedRadio] = useState<number | null>(null); // For radio buttons
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    if (visible) {
      if (Array.isArray(selectedValues)) {
        setSelectedCheckboxes(selectedValues);
      } else if (selectedValues) {
        setSelectedRadio(selectedValues);
      } else {
        setSelectedCheckboxes([]);
        setSelectedRadio(null);
      }
    }
  }, [visible, selectedValues]);

  const toggleCheckbox = (id: number) => {
    setSelectedCheckboxes(prevState => {
      let updated;
      if (prevState.includes(id)) {
        updated = prevState.filter(item => item !== id);
      } else {
        updated = [...prevState, id];
      }

      onSelect(updated);
      return updated;
    });
  };

  const handleRadioButton = (id: number) => {
    setSelectedRadio(id);
    onSelect(id);
  };

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
          onRequestClose={onClose}
        >
          <TouchableWithoutFeedback onPress={onClose}>
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                backgroundColor:
                  'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(34, 30, 252, 0.08) 0%, rgba(255, 255, 255, 0.10) 100%)',
              }}
            >
              <View style={[styles.modelcontainer, { zIndex: 1001 }]}>
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
                  <View style={styles.optionHeader}>
                    <View style={styles.checkboxImage}>
                      <Image
                        source={
                          ismultilple
                            ? require('../../../assets/images/checkboxicon.png')
                            : require('../../../assets/images/radiobuttonicon.png')
                        }
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
                <View
                  style={{
                    width: '100%',
                    minHeight: screenHeight  * 0.1,
                    maxHeight: screenHeight * 0.6,
                    paddingHorizontal: 10,
                    zIndex: 1002,
                    paddingBottom:24,

                    backgroundColor:
                      Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.40)' : 'none',
                  }}
                >
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{  paddingTop: 8 }}
                  >
                    {options.map((option, index) => {
                      const isSelectedRadio = selectedRadio === option.id;
                      const isSelectedCheckbox = selectedCheckboxes.includes(
                        option.id,
                      );

                      return (
                        <View
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            width: '100%',
                          }}
                          key={index}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              ismultilple
                                ? toggleCheckbox(option.id)
                                : handleRadioButton(option.id);
                            }}
                            style={styles.radioButtonContainer}
                          >
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 10,
                                justifyContent: 'flex-start',
                              }}
                            >
                              {ismultilple ? (
                                <View style={styles.checkboxWrapper}>
                                  {isSelectedCheckbox ? (
                                    <Image
                                      source={require('../../../assets/images/tickicon.png')}
                                      style={styles.tickImage}
                                      resizeMode="contain"
                                    />
                                  ) : (
                                    <View style={styles.checkboxContainer} />
                                  )}
                                </View>
                              ) : (
                                <View
                                  style={[
                                    styles.radioButton,
                                    isSelectedRadio && styles.selectedRadio,
                                  ]}
                                >
                                  {isSelectedRadio && (
                                    <View style={styles.radioDot} />
                                  )}
                                </View>
                              )}

                              <Text
                                allowFontScaling={false}
                                style={{
                                  color: '#FFF',
                                  fontSize: 16,
                                  marginLeft: 10,
                                  fontWeight: '600',
                                  lineHeight: 18,
                                  letterSpacing: -0.28,
                                  fontFamily: 'Urbanist-SemiBold',
                                  width: '100%',
                                }}
                              >
                                {option.option_name}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
                <View style={styles.cardconstinerdivider} />
                <View style={styles.bottomview}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                    <Text allowFontScaling={false} style={styles.cancelText}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.cancelBtn,
                      { backgroundColor: 'rgba(255, 255, 255, 0.6)' },
                    ]}
                    onPress={onClose}
                  >
                    <Text
                      allowFontScaling={false}
                      style={[styles.cancelText, { color: '#000000' }]}
                    >
                      Apply
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  tickImage: {
    height: 24,
    width: 24,
  },
  cardconstinerdivider: {

    position: 'absolute',
    bottom: 100,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(176, 178, 255, 0.03)' : 'none',
    height: 1,
    borderColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)',
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
    height: '100%',
    width: '100%',

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
  header: {},
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
    // flexDirection: 'column',
    // justifyContent: 'space-between',
    // width: '100%',
    // paddingVertical: 16,
    // paddingHorizontal:20,
    // borderTopLeftRadius: 30,
    // borderTopRightRadius: 30,

    width: '100%',
    paddingBottom: 16,
    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.24)' : 'rgba(0, 0, 0, 0.07)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  broderTopLeftRightRadius_30: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modelcontainer: {
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(10, 64, 156, 0) 0%, rgba(255, 255, 255, 0.03) 100%)',
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    // filter: 'drop-shadow(0 0.833px 3.333px rgba(255, 255, 255, 0.18))',
    // gap: 5,
    opacity: 0.8,
    overflow: 'hidden',
  },
  bottomview: {
    padding: 10,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 40 : 10,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.40)' : 'none',
  },
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
    flex: 1,
    marginRight: 8,
    padding: 12,
    borderRadius: 50,
    // backgroundColor: 'gray',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow:
      Platform.OS === 'ios'
        ? '0 2px 8px 0 rgba(41, 41, 41, 0.19) '
        : '0 2px 8px 0 rgba(75, 75, 75, 0.19)',
  },
  overlay: {
    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
    flex: 1,
    justifyContent: 'flex-end',
    opacity: Platform.OS === 'ios' ? 1 : 0,
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
    lineHeight: 22,
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
    fontSize: 17,
    fontWeight: '500',
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
export default SelectCatagoryDropdown;
