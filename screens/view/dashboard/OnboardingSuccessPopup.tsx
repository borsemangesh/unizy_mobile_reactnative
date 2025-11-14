import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';

type Props = {
  onClose: () => void;
  navigation: any; // You can replace `any` with your navigation type
};

const OnboardingSuccessPopup: React.FC<Props> = ({ onClose, navigation }) => {
  return (
    <View style={styles.overlay}>
      <BlurView
        style={styles.blur as StyleProp<ViewStyle>}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.11)"
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(0, 0, 0, 0.32)' },
          ]}
        />

        <View style={styles.popupContainer}>
          <Image
            source={require('../../../assets/images/success_icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Review Submitted Successfully!</Text>
     
        </View>
      </BlurView>
    </View>
  );
};

export default OnboardingSuccessPopup;

const styles = StyleSheet.create({
       overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  blur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: '85%',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    overflow: 'hidden',
 
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },
 
  title: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
 
  loginText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  
});
