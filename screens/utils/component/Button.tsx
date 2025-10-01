import { BlurView } from '@react-native-community/blur';
import { StyleSheet, Text, View } from 'react-native';

const Button = () => {
  return (
    <View style={styles.container}>
      <View style={styles.viewStyle}>
        {/* Semi-transparent background layer below the BlurView */}
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(255, 255, 255, 0.4)' }, // Adjust opacity for the button background here
          ]}
        />
        
        {/* BlurView applied with no opacity to keep the blur effect strong */}
        <BlurView
          style={[
            StyleSheet.absoluteFill,
            {
              // No opacity applied here to preserve blur strength
            },
          ]}
          blurAmount={20}
          reducedTransparencyFallbackColor="white"
        />
        
        {/* Text displayed over the button */}
        <Text style={styles.buttonText}>Button</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
   
    height: 200,
    width: 200
  },
  viewStyle: {
    display: 'flex',
    width: '90%',
    paddingHorizontal: 20,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.16)', // Light transparency for button
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',
    position: 'absolute',
    bottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Button;
