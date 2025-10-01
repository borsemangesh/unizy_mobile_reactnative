import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';

type ButtonProps = {
  onPress: () => void;
  title?: string;
};

const Header = () => {
  return (
    <View>
      <BlurView
        style={[StyleSheet.absoluteFill,{}]}
        blurType="light"
        blurAmount={50}
        // REMOVE fallback color if you want absolutely NO background color
        reducedTransparencyFallbackColor="transparent"
      />
      <Text style={styles.buttonText}>Product Details</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',    
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 0.5,
    borderColor: 'transparent',
    alignSelf: 'center',
    marginBottom: 10,
    position: 'absolute',
    top: 0
  },
  buttonText: {
    // color: '#000',
    // fontSize: 16,
    // fontWeight: 'bold',
    color: '#002050',
    fontSize: 17,
    fontFamily: 'Urbanist-Medium',
    fontWeight: '500',
    letterSpacing: 1,
    opacity: 0.9
  },
});

export default Header;
