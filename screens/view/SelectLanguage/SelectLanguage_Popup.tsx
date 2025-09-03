import React, { useState } from 'react';
import {
  View,
  ImageBackground,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';

import { selectlang_styles } from './SelectLanguage.style';

type Language = {
  code: string;
  name: string;
  flag: any;
};

type LoginScreenProps = {
  navigation: any;
};

const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    flag: require('../../../assets/images/English.png'),
  },
  {
    code: 'es',
    name: 'Spanish',
    flag: require('../../../assets/images/Spanish.png'),
  },
  {
    code: 'fr',
    name: 'French',
    flag: require('../../../assets/images/French.png'),
  },
  {
    code: 'sv',
    name: 'Swedish',
    flag: require('../../../assets/images/Swedish.png'),
  },
  {
    code: 'it',
    name: 'Italian',
    flag: require('../../../assets/images/Italian.png'),
  },
  {
    code: 'de',
    name: 'German',
    flag: require('../../../assets/images/German.png'),
  },
  {
    code: 'pt',
    name: 'Portuguese',
    flag: require('../../../assets/images/Portuguese.png'),
  },
];

const SelectLanguage_Popup = ({ navigation }: LoginScreenProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ImageBackground
      source={require('../../../assets/images/BGAnimationScreen.png')}
      style={[selectlang_styles.flex_1]}
    >
      <View style={selectlang_styles.container}>
        <Text style={selectlang_styles.title}>Select Language</Text>

        <View style={selectlang_styles.search_container}>
          <Image
            source={require('../../../assets/images/SearchIcon.png')}
            style={selectlang_styles.searchIcon}
          />
          <TextInput
            style={selectlang_styles.searchBar}
            placeholder="Search"
            placeholderTextColor="#ccc"
            onChangeText={setSearch}
            value={search}
          />
        </View>

        <View style={selectlang_styles.listContainer}>
          <FlatList
            contentContainerStyle={selectlang_styles.listContent}
            style={selectlang_styles.flatListStyle}
            
            data={filteredLanguages}
            keyExtractor={item => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={selectlang_styles.languageItem}
                onPress={() =>
                  navigation.navigate('LoginScreen') || setSelected(item.code)
                }
              >
                
                <View style = {{ display: 'flex',paddingTop: 10,paddingBottom: 12,flexDirection: 'row', alignItems: 'center',alignContent: 'center', width: '100%'}}>

                 
                  <View style={{display: 'flex', flexDirection: 'row',alignItems: 'center', justifyContent: 'space-between',width: '100%'}}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
 <View>
                    <Image source={item.flag} style={selectlang_styles.flag}/>
                  </View>
                    <Text style={selectlang_styles.languageText}>
                      {item.name}
                    </Text>

                    </View>
                    <View>
                      <View style= {selectlang_styles.radioButton_round}>
                        <View
                            style={[
                              selectlang_styles.radioButton,
                              selected === item.code &&
                                selectlang_styles.radioButtonSelected,
                            ]}
                          />
                      </View>
                    </View>
                  </View>
                  
                </View>
                {/* <View style={selectlang_styles.languageInfo}>
                  <Image source={item.flag} style={selectlang_styles.flag} />
                  <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={selectlang_styles.languageText}>
                      {item.name}
                    </Text>
                    <View style= {selectlang_styles.radioButton_round}>
                      <View
                        style={[
                          selectlang_styles.radioButton,
                          selected === item.code &&
                            selectlang_styles.radioButtonSelected,
                        ]}
                      />

                    </View>
                  
                  </View>
                  
                </View> */}
                
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

export default SelectLanguage_Popup;
