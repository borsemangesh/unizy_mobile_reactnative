import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Styles } from './HelloScreen.style'
import MyIcon from '../../utils/MyIcon';
import EdgeToEdgeScreen from './EdgeToEdgeScreen';


type HelloScreenProps = {
  navigation: any;
};

const HelloScreen = ({ navigation }: HelloScreenProps) => {
  return (
    <EdgeToEdgeScreen>
      <ImageBackground
        source={require('../../../assets/images/BGAnimationScreen.png')}
        style={{flex: 1,flexDirection: 'column'}}
        resizeMode='cover'
      >
        <StatusBar backgroundColor="transparent" barStyle="light-content" />
        <View style={Styles.ScreenLayout}>
          <Text style={Styles.unizyText}>UniZy</Text>
          <Text style={Styles.hellowText}>Hello</Text>
          
          <View style={Styles.linearGradient}>
            <TouchableOpacity
              onPress={() => navigation.navigate('LanguagePopup')}
            >
              <View style={[Styles.SelectLanguageContainer]}>
                <MyIcon
                  name="language"
                  size={15}
                  color="#FFFFFF"
                  style={{ maringLeft: 12, marginRight: 8 }}
                />

                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={Styles.selectlanguageText}>Select Language</Text>
                  <MyIcon
                    name="keyboard-arrow-down"
                    size={15}
                    color="rgba(255, 255, 255, 1)"
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </EdgeToEdgeScreen>
  );
};

export default HelloScreen;
