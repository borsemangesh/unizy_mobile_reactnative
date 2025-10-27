import { ImageBackground, Text, View } from 'react-native';

const bgImage = require('../../../assets/images/backimg.png');

const MessagesIndividualScreen = () => {

     

  return (
    <ImageBackground 
        source={bgImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text allowFontScaling={false}>Messages Individual Screen</Text>
      </View>
    </ImageBackground>
  );
};

export default MessagesIndividualScreen;
