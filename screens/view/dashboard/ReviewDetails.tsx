import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  FlatList,
  Platform,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  ImageSourcePropType,
  ListRenderItem,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_URL } from '../../utils/APIConstant';

const bgImage = require('../../../assets/images/backimg.png');
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NewCustomToastContainer } from '../../utils/component/NewCustomToastManager';
import StarRating from '../../utils/StarRating';


type ReviewDetailsProps = {
  navigation: any;
};

type RootStackParamList = {
  ReviewDetails: { category_id: number ,id:number};
};

type ReviewDetailsRouteProp = RouteProp<RootStackParamList, 'ReviewDetails'>;



const ReviewDetails : React.FC<ReviewDetailsProps> = ({ navigation }) => {

   const route = useRoute<ReviewDetailsRouteProp>();
    const { category_id } = route.params;
    const {id} =route.params;
  

    type Category = {
      id: number | null; 
      name: string;
    };

    const [categories, setCategories] = useState<Category[]>([
      { id: null, name: 'All' }
    ]);
    const [selectedCategory, setSelectedCategory] = useState<Category>({ id: null, name: 'All' });

  useEffect(() => {
    const loadCategories = async () => {
      const stored = await AsyncStorage.getItem('categories');
      if (stored) {
        const parsed = JSON.parse(stored); 
        const catObjects = [
          { id: null, name: 'All' }, 
          ...parsed.map((cat: any) => ({ id: cat.id, name: cat.name })),
        ];
        setCategories(catObjects);
        setSelectedCategory(catObjects[0]); 
      }
    };
    loadCategories();
  }, []);

  type User = {
  id: string;
  name: string;
  university: string;
  rating: number;
  profileImg: any; // or ImageSourcePropType
  comment: string;
};

const users: User[] = [
  {
    id: '1',
    name: 'Alan Walker',
    university: 'University of Warwick, Coventry',
    rating: 4.5,
    profileImg: require('../../../assets/images/user.jpg'),
    comment: 'Totally worth it for the price.',
  },
  
   {
    id: '2',
    name: 'John Doe',
    university: 'Harvard University',
    rating: 4.2,
    profileImg: require('../../../assets/images/user.jpg'),
    comment: 'Excellent experience!',
  },
];

 


const renderItem: ListRenderItem<User> = ({ item }) => (
  <View style={styles.userRow}>
    {/* Top row: Image + Name/Sub + Star */}
    <View style={{ flexDirection: 'row', width: '100%' }}>
      {/* Image column */}
      <View style={{ width: 60, alignItems: 'center' }}>
        <Image source={item.profileImg} style={styles.avatar} />
      </View>

      {/* Name/Sub + Star column */}
      <View style={{ flex: 1, paddingLeft: 10, justifyContent: 'flex-start' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text allowFontScaling={false} style={styles.userName}>{item.name}</Text>
            <Text allowFontScaling={false} style={styles.userSub}>{item.university}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={require('../../../assets/images/staricon.png')}
              style={{ height: 16, width: 16, marginRight: 4 }}
            />
            <Text allowFontScaling={false} style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        {/* Comment below */}
        <Text allowFontScaling={false} style={[styles.bottomText, { marginTop: 4 }]}>{item.comment}</Text>
      </View>
    </View>
  </View>
);

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <View style={styles.fullScreenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() =>
              navigation.replace('SearchDetails', {
                id,
                category_id,
              })
            }>
              <View style={styles.backIconRow}>
                <Image
                  source={require('../../../assets/images/back.png')}
                  style={{ height: 24, width: 24 }}
                />
              </View>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.unizyText}>
            {selectedCategory?.name === 'All'
              ? 'Reviews'
              : `${selectedCategory?.name} Reviews`}
          </Text>
            <View style={{ width: 48 }} />
          </View>
        </View>

    <View>
      <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginVertical: 10 }}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            >
          
       {categories.map((cat, index) => {
                 const isSelected = selectedCategory.name === cat.name;
                 return (
                   <View style={{ paddingVertical: 2 }} key={index}>
                     <TouchableOpacity
                       onPress={() => setSelectedCategory(cat)}
                       style={isSelected ? styles.tabcard : styles.tabcard1}
                     >
                       <Text allowFontScaling={false} style={isSelected ? styles.tabtext : styles.othertext}>
                         {cat.name}
                       </Text>
                     </TouchableOpacity>
                   </View>
                 );
               })}
        </ScrollView>
            

        </View>

        <View style={{ paddingHorizontal: 16, marginBottom: 12, alignItems: 'center' }}>
      <Text allowFontScaling={false} style={{ fontSize: 60, fontWeight: '700', color: '#fff', marginBottom: 4 }}>
        3.5
      </Text>

     <StarRating rating={3.5} starSize={24} />

     <Text allowFontScaling={false} style={styles.reviewcount}>11 Reviews</Text>
</View>

  <View style={styles.innercontainer}>
  <Text allowFontScaling={false} style={styles.mainlabel}>Reviews</Text>

  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Image
      source={require('../../../assets/images/staricon.png')}
      style={{ width: 16, height: 16, marginRight: 4 }}
    />
    <Text allowFontScaling={false} style={styles.subrating}> 4.5(10)</Text>
  </View>
</View>
        

    <View style={{ flex: 1 }}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>

    <TouchableOpacity style={styles.previewBtn} onPress={() =>{navigation.navigate('AddReview')}} >
            <Text allowFontScaling={false} style={styles.payText}>Write a Review </Text>
          </TouchableOpacity>

      </View>
      <NewCustomToastContainer/>
    </ImageBackground>
  );
};

export default ReviewDetails;

const styles = StyleSheet.create({

  subrating:{
    color: 'rgba(255, 255, 255, 0.88)',
     fontSize: 14,
      fontFamily: 'Urbanist-SemiBold', 
      fontWeight: '600'
  },

  mainlabel:{
    color: '#fff',
    fontSize: 18, 
    fontWeight: '600', 
    fontFamily: 'Urbanist-SemiBold'
    },

    sublabel:{
    color: '#FFFFFFA3', 
    fontSize: 14, 
    fontWeight: '600',
    fontFamily: 'Urbanist-Medium'
    },
    innercontainer:{
      paddingHorizontal: 16, 
      marginBottom: 8, 
      flexDirection: 'column', 
      justifyContent: 'space-between' 
    },
  payText: {
  color: '#002050',
  fontFamily: 'Urbanist-Medium',
  fontSize: 17,
  fontWeight: '500',
  letterSpacing: 1,
  textAlign:'center'
},

    previewBtn: {
    display: 'flex',
    width: '90%',
    alignSelf: 'center',
    alignContent: 'center',
    paddingHorizontal: 20,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#ffffff2c',

    position: 'absolute',
    bottom: 10,
  },

  reviewcount:{
    paddingHorizontal: 16, 
    marginTop: 12, 
    alignItems: 'center' ,
    color: '#FFFFFFE0',     
  fontFamily:'Urbanist-SemiBold',   
  fontWeight:600,
  fontSize:16, 
  },

  bottomText: {
  marginTop: 4,          
  fontSize: 14,        
  color: '#FFFFFFA3',     
  fontFamily:'Urbanist-Medium',   
  fontWeight:500 
  
},

  ratingText:{
  color: 'rgba(255, 255, 255, 0.48)',
  fontFamily: 'Urbanist-SemiBold',
  fontSize: 14,
  fontWeight: '600',
  fontStyle: 'normal',
  letterSpacing: -0.28,
  },

  initialsCircle:{
 backgroundColor: '#8390D4',
  alignItems: 'center',
  justifyContent: 'center',
   width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  initialsText:{
   color: '#fff',
  fontSize: 18,
  fontWeight:600,
  textAlign: 'center',
  fontFamily: 'Urbanist-SemiBold',
  },

   userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    margin:12
  },
  productdetails: {
    marginTop: 10,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userName: {
    position: 'relative',
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.32,
  },
  userSub: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginTop:4
  },
   userSub1: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginTop:1
  },

  tabcard: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
     borderWidth: 0.4,
    borderColor: '#ffffff11',

    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',

    borderEndEndRadius: 10,
    borderStartEndRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomStartRadius: 10,
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',

    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',

    boxSizing: 'border-box',
  },
  tabcard1: {
     borderWidth: 0.4,
    borderColor: '#ffffff11',

    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.23)',
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 100%)',

    borderEndEndRadius: 10,
    borderStartEndRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomStartRadius: 10,
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',

    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',

    boxSizing: 'border-box',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  tabtext: {
    color: '#fff',   // selected tab text color
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
    fontSize:14

  },
  othertext: {
    color: '#FFFFFF7A',   // unselected tab text color
    fontWeight: '600',
     fontFamily: 'Urbanist-SemiBold',
     fontSize:14
  },

  background: { 
    flex: 1,
     width: '100%',
      height: '100%' },
  fullScreenContainer: {
     flex: 1
     },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIconRow: {
    padding: 12,
    borderRadius: 40,

     display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'radial-gradient(189.13% 141.42% at 0% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.10) 100%)',
      boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 0px 5px 1px',
    borderWidth: 0.4,
    borderColor: '#ffffff2c',
    height: 48,
    width: 48,
  },
  unizyText: {
    color: '#FFFFFF',
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
     fontFamily: 'Urbanist-SemiBold',
  },
  

});