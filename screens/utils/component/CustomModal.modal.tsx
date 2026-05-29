import { BlurView } from '@react-native-community/blur';
import { StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native';

type CustomModalProps = {
  onClose: () => void;
  visible: boolean;
  children: React.ReactNode;
};

const CustomModal = ({ visible, children, onClose }: CustomModalProps) => {
  return visible ? (
    <TouchableNativeFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <BlurView
          style={[
            StyleSheet.absoluteFill,
            {
              alignSelf: 'center',
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
            },
          ]}
          blurType="dark"
          blurAmount={10}
          reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
        />
        {children}
      </View>
    </TouchableNativeFeedback>
  ) : null;
};
export default CustomModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});
