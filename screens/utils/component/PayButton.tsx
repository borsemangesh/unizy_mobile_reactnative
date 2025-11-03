import { BlurView } from "@react-native-community/blur";
import { TextStyle, TouchableOpacity, StyleSheet, Text, Platform } from "react-native";

type PayButtonProps = {
  amount: number | string; // price to display
  onPress: () => void;
  label?: string; // default "Pay"
  textStyle?: TextStyle; // optional override for text
};

const PayButton = ({ amount, onPress, label = "Pay", textStyle }: PayButtonProps) => {
  const formattedAmount = `£${Number(amount ?? 0).toFixed(2)}`;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.buttonContainer}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={2}
        reducedTransparencyFallbackColor="transparent"
      />

      <Text allowFontScaling={false} style={[styles.buttonText, textStyle]}>
        {label} {formattedAmount}
      </Text>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  buttonContainer: {
    width: '90%',
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
    bottom: (Platform.OS === 'ios'? 16 : 10),
  },
  buttonText: {
    // color: '#000',
    // fontSize: 16,
    // fontWeight: 'bold',
    color: '#002050ff',
    textAlign: 'center',
    fontFamily: 'Urbanist-Medium',
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: 1,
    opacity: 0.9
  },
});

export default PayButton;