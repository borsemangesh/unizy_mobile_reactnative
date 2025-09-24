import React from "react";
import { View, Text, Image, StyleSheet, ImageSourcePropType, Platform } from "react-native";

type ProductCardProps = {
  tag: string;
  infoTitle: string;
  inforTitlePrice: string;
  rating:string;
  productImage: ImageSourcePropType
};


export default function ProductCard({tag,infoTitle,inforTitlePrice,rating,productImage}:ProductCardProps) {
  return (
    <View style={styles.card}>
      
      <View style={styles.imageContainer}>
        <Image
          source={productImage}
          style={styles.image}
        />

 
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
        {/* </LinearGradient> */}
      
        <View style={styles.bookmark1}>
          <Image
            source={require('../../assets/images/bookmark.png')}
            style={{ width: 48, height: 48 }}
          />
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.title}>{infoTitle}</Text>
          <View style={{flexDirection:'row',width: '100%',justifyContent:'space-between'}}>
            
            <Text style={styles.price}>{inforTitlePrice}</Text>
            <View style={{flexDirection:'row'}}>
              <Image
                source={require('../../assets/images/staricon.png')}
                style={styles.image1}/>

              <Text style={styles.ratingText}>{rating}</Text>
              </View>
          </View>
      </View>
     
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: (Platform.OS === 'ios' ? 360 : 320),
    minWidth: '80%',
    padding:(Platform.OS === 'ios' ? 0 : 10),
  
    height:'70%',
    minHeight: '90%',
    borderRadius: 34,
    backgroundColor: '#5973c1ff',
    marginHorizontal: 8,
    // shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 15px 15px 6px',
    borderBlockColor: '#ffffff79',
    borderStartColor: '#ffffff79',
    borderWidth: 0.4,
    borderColor: '#ffffff79',
    gap:4,
    
    // borderTopColor: '#ffffff5d',
    // borderBottomColor: '#ffffff36',
    // borderLeftColor: '#ffffff5d',
    // borderRightColor: '#ffffff36',
  },
  imageContainer: {
    width: '100%',
    height: '85%',
  },
  image: {
    width: '100%',
    height: '100%',
    padding:12,
    borderRadius:34,
  },

   image1: {
    width: 16,
    height: 16,
    
  },
  bookmark1: {
    position: 'absolute',
    top: (Platform.OS === 'ios' ? 25 : 10),
    right: (Platform.OS === 'ios' ? 25 : 10),
    borderRadius: 20,
    
  },
   bookmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 20,
    padding: 6,
  },
  tag: {
    position: 'absolute',
    // bottom: 10,
    // right: 10,
    bottom:  (Platform.OS === 'ios' ? 15 : 10),
    right: (Platform.OS === 'ios' ? 20 : 10),
    //backgroundColor: '#fff',
    backgroundColor:'rgba(255,255,255,0.4)',
    borderRadius: 12,
    padding: 8,
    marginVertical:8,
    marginHorizontal:8,
     boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 5px 5px 1px',
  },
  tagText: {
    fontSize: 11,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    color: '#000',
    
  },
  infoRow: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    alignContent: 'center',
    alignSelf: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    width: '100%',
  },
   title1: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    fontFamily: 'Urbanist-Regular',
    marginBottom: 2,
  },
  price: {
    fontSize: 17,
    fontWeight: '500',
    color: '#fff',
     fontFamily: 'Urbanist-Bold',
  },
  
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
     fontFamily: 'Urbanist-SemiBold',
    marginLeft: 4,
  },
  ratingAbsolute: {
  // position: 'absolute',
  // bottom:10,
  // right: 10,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
},
});