import { BlurView } from "@react-native-community/blur";
import { TouchableOpacity, StyleSheet, Text, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PayButtonProps = {
  amount?: number | string; 
  onPress: () => void;
  label?: string;
};


const PayButton = ({ amount, onPress, label = "Pay" }: PayButtonProps) => {
  const formattedAmount =
    amount !== null && amount !== undefined
      ? `£${Number(amount).toFixed(2)}`
      : null;
  const insets = useSafeAreaInsets();
  return (
       <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[
            styles.buttonContainer,
            { bottom: (Platform.OS === 'ios'? 25: insets.bottom + 10) }
          ]}>

      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={2}
        reducedTransparencyFallbackColor="transparent"
      />

      <View style={styles.textWrapper}>
        <Text allowFontScaling={false} style={styles.buttonText}>
          <Text style={styles.labelText}>{label}</Text>
          {formattedAmount && (
            <Text style={styles.amountText}> {formattedAmount}</Text>
          )}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({

  textWrapper: {
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  buttonContainer: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
    alignSelf: 'center',
    marginBottom: 10,
    position: 'absolute',
    //bottom: (Platform.OS === 'ios'? 16 : 10),
    left: 16,
    right: 16,
  },
  
  buttonText: {
    textAlign: 'center',
    color: '#002050ff',
    flexDirection: 'row',
  },
  labelText: {
    color: '#002050',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 1,
    opacity:0.9
  },
  amountText: {
    color: '#002050',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: 1,
    opacity:0.9
  },
});

export default PayButton;