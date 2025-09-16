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



type LoginScreenProps = {
  navigation: any;
};

type Language = {
  id: number;
  code: string;
  name: string;
  flag: any;
};
const languages: Language[] = [
  {
    id: 1,
    code: 'en',
    name: 'English',
    flag: require('../../../assets/images/english.png'),
  },
  {
    id: 2,
    code: 'es',
    name: 'Spanish',
    flag: require('../../../assets/images/spanish.png'),
  },
  {
    id: 3,
    code: 'fr',
    name: 'French',
    flag: require('../../../assets/images/french.png'),
  },
  {
    id: 4,
    code: 'sv',
    name: 'Swedish',
    flag: require('../../../assets/images/swedish.png'),
  },
  {
    id: 5,
    code: 'it',
    name: 'Italian',
    flag: require('../../../assets/images/italian.png'),
  },
  {
    id: 6,
    code: 'de',
    name: 'German',
    flag: require('../../../assets/images/german.png'),
  },
  {
    id: 7,
    code: 'pt',
    name: 'Portuguese',
    flag: require('../../../assets/images/portuguese.png'),
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
      source={require('../../../assets/images/bganimationscreen.png')}
      style={[selectlang_styles.flex_1]}
    >
      <View style={selectlang_styles.container}>
        <Text style={selectlang_styles.title}>Select Language</Text>

        <View style={selectlang_styles.search_container}>
          <Image
            source={require('../../../assets/images/searchicon.png')}
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
                  navigation.replace('LoginScreen') || setSelected(item.code)
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
