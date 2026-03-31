import { BlurView } from '@react-native-community/blur';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NewCustomToastContainer, showToast } from './NewCustomToastManager';

interface SelectCatagoryDropdownProps {
  options: {
    is_other: boolean;
    id: number;
    option_name: string;
  }[];
  visible: boolean;
  ismultilple: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onSelect: (
    selected:
      | number
      | number[]
      | { selected: number | number[]; text?: string },
  ) => void;
  selectedValues?: number | number[];
  otherTextValue?: string;
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
  otherTextValue,
}: SelectCatagoryDropdownProps) => {
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<number[]>([]);
  const [selectedRadio, setSelectedRadio] = useState<number | null>(null);
  const screenHeight = Dimensions.get('window').height;
  const [otherText, setOtherText] = useState('');
  const [tempSelectedCheckboxes, setTempSelectedCheckboxes] = useState<
    number[]
  >([]);
  const [tempSelectedRadio, setTempSelectedRadio] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (visible) {
      if (Array.isArray(selectedValues)) {
        setTempSelectedCheckboxes(selectedValues);
      } else if (selectedValues) {
        setTempSelectedRadio(selectedValues);
      } else {
        setTempSelectedCheckboxes([]);
        setTempSelectedRadio(null);
      }

      setOtherText(otherTextValue ?? ''); // ✅ RESTORE
    }
  }, [visible, selectedValues, otherTextValue]);

  const toggleCheckbox = (id: number) => {
    setTempSelectedCheckboxes(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  };

  const handleRadioButton = (id: number) => {
    setTempSelectedRadio(id);
  };

  const handleApply = () => {
    const hasTextOption = options.some(
      opt =>
        opt.is_other &&
        (ismultilple
          ? tempSelectedCheckboxes.includes(opt.id)
          : tempSelectedRadio === opt.id),
    );
    if (hasTextOption && (!otherText || otherText.trim() === '')) {
      onClose();
      setTimeout(() => {
        showToast('Please add description', 'error');
      }, 100);
      return;
    }

    if (ismultilple) {
      onSelect({
        selected: tempSelectedCheckboxes,
        text: hasTextOption ? otherText : undefined,
      });
    } else if (tempSelectedRadio != null) {
      onSelect({
        selected: tempSelectedRadio,
        text: hasTextOption ? otherText : undefined,
      });
    }

    onClose();
  };

  const handleCancel = () => {
    onClose();
  };
  const { t } = useTranslation();

  const scrollRef = useRef<ScrollView>(null);

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
        blurAmount={Platform.OS === 'ios' ? 2 : 2}
        reducedTransparencyFallbackColor="transparent"
      />
      <Modal
        animationType="slide"
        visible={visible}
        transparent
        // backdropColor={'rgba(0, 0, 0, 0.5)'}
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.overlay}>
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
                blurAmount={Platform.OS === 'ios' ? 50 : 10}
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
                          source={
                            ismultilple
                              ? require('../../../assets/images/checkboxicon.png')
                              : require('../../../assets/images/radiobuttonicon.png')
                          }
                          style={{ width: 24, height: 24 }}
                        />
                      </View>
                      <Text
                        adjustsFontSizeToFit
                        allowFontScaling={false}
                        style={[styles.modelTextHeader, { flexShrink: 1 }]}
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
                  minHeight: screenHeight * 0.1,
                  maxHeight: screenHeight * 0.6,
                  paddingHorizontal: 10,
                  backgroundColor:
                    Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.40)' : 'none',
                }}
              >
                <ScrollView
                  ref={scrollRef}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {options.map((option, index) => {
                    const isSelectedRadio = tempSelectedRadio === option.id;
                    const isSelectedCheckbox = tempSelectedCheckboxes.includes(
                      option.id,
                    );
                    const isOtherOption = option?.is_other === true;

                    const showOtherInput =
                      isOtherOption &&
                      (ismultilple ? isSelectedCheckbox : isSelectedRadio);

                    return (
                      <View
                        key={index}
                        style={{
                          paddingHorizontal: 10,
                          marginTop: 10,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() =>
                            ismultilple
                              ? toggleCheckbox(option.id)
                              : handleRadioButton(option.id)
                          }
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
                                lineHeight: 22,
                                letterSpacing: -0.28,
                                fontFamily: 'Urbanist-SemiBold',
                              }}
                            >
                              {option.option_name}
                            </Text>
                          </View>
                        </TouchableOpacity>

                        {/* 🔽 OTHER TEXT INPUT */}
                        {showOtherInput && (
                          <View style={{ marginLeft: 8, marginTop: 8 }}>
                            <TextInput
                              autoFocus
                              allowFontScaling={false}
                              value={otherText}
                              onChangeText={setOtherText}
                              placeholder={`${t('please_specify')}*`}
                              placeholderTextColor="rgba(255, 255, 255, 0.48)"
                              cursorColor="#F5F5F5"
                              selectionColor="#F5F5F5"
                              style={{
                                borderWidth: 1,
                                borderColor: '#ffffff4e',
                                borderRadius: 8,
                                paddingHorizontal: 12,
                                paddingVertical: 16,
                                color: '#fff',
                                fontSize: 16,
                              }}
                              onFocus={() => {
                                setTimeout(() => {
                                  scrollRef.current?.scrollToEnd({
                                    animated: true,
                                  });
                                }, 300); // important for iOS
                              }}
                            />
                          </View>
                        )}
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
              <View style={styles.cardconstinerdivider} />
              <View
                style={[
                  styles.bottomview,
                  { paddingBottom: Platform.OS === 'ios' ? 30 : 12 },
                ]}
              >
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleCancel}
                >
                  <Text allowFontScaling={false} style={styles.cancelText}>
                    {t('cancel')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cancelBtn, { backgroundColor: '#ffffff4e' }]}
                  onPress={handleApply}
                >
                  <Text
                    allowFontScaling={false}
                    style={[styles.cancelText, { color: '#000000' }]}
                  >
                    {t('apply')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <NewCustomToastContainer />
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
    width: '95%',
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(176, 178, 255, 0.03)' : 'none',
    height: 1,
    borderColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.43) 0%, rgba(255, 255, 255, 0.10) 100%)',
  },

  radioButtonContainer: {
    marginTop: 10,
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
    backgroundColor: 'rgba(0, 0, 255, 0)',
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
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    // backgroundColor: 'rgba(98, 132, 255, 0.46)',
    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.24)' : 'rgba(0, 0, 0, 0.07)',

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  modelcontainer: {
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(0, 60, 163, 0.05) 0%, rgba(255, 255, 255, 0.03) 100%)',

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
    padding: 16,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 16,
    alignItems: 'center',
    alignContent: 'center',
    gap: 8,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.40)' : 'none',
  },

  cancelBtn: {
    minHeight: 48,
    flex: 1,
    //marginRight: 8,
    padding: 12,
    borderRadius: 50,
    // backgroundColor: 'gray',
    backgroundColor: '#ffffff1b',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px 0 rgba(75, 75, 75, 0.19)',
  },
  overlay: {
    //backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
    // opacity: 0.8
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
 
  cancelText: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontFamily: 'Urbanist-Medium',
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 0.17,
    //lineHeight: 19.6,
  },
});
export default SelectCatagoryDropdown;
