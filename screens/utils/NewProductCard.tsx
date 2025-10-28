import React from "react";
import { View, Text, Image, StyleSheet, ImageSourcePropType, Platform } from "react-native";


type NewProductCardProps = {
  tag: string;
  infoTitle: string;
  inforTitlePrice: string;
  rating:string;
  productImage: ImageSourcePropType
};


export default function NewProductCard({tag,infoTitle,inforTitlePrice,rating,productImage}:NewProductCardProps) {
  return (
    <View style={styles.card}>
      
      <View style={styles.imageContainer}>
        <Image
          source={productImage}
          style={styles.image}
        />
        <View style={styles.tag}>
          <Text allowFontScaling={false} style={styles.tagText}>{tag}</Text>
        </View>
        {/* </LinearGradient> */}
      
        <View style={styles.bookmark1}>
          <Image
            source={require('../../assets/images/newbookmark.png')}
            style={{ width: 36, height: 36 }}
          />
        </View>
      </View>
{/* require('../../assets/images/bookmark.png') */}
      <View style={styles.infoRow}>
        <View>
          <Text allowFontScaling={false} style={styles.title}>{infoTitle}</Text>
          <Text allowFontScaling={false} style={styles.price}>{inforTitlePrice}</Text>
        </View>
       
        <View style={styles.ratingAbsolute}>
        <Image
          source={require('../../assets/images/staricon.png')}
          style={styles.image1}/>

        <Text allowFontScaling={false} style={styles.ratingText}>{rating}</Text>
      </View>
      </View>
     
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor:
      'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 100%)',
    //marginHorizontal: 8,
    // shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    width:188,
    overflow: 'hidden',
    height:'auto',
    margin:6,
    paddingBottom:10,
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 15px 15px 6px',
  },
  imageContainer: {
    width: 186,
    height: 180,
    position: 'relative',
    // padding:6
    padding:(Platform.OS === 'ios' ? 0 : 6),
  },
  image: {
    width: '100%',
    height: '100%',
    padding:12,
    borderRadius:12,
    //borderColor:'000',
   // borderWidth:2,
    alignSelf:'center',
    resizeMode:'cover'
  },

   image1: {
    width: 16,
    height: 16,
    
  },
  bookmark1: {
    position: 'absolute',
    top: 5,
    right: 5,
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
    bottom: 5,
    right: 5,
    //backgroundColor: '#fff',
    backgroundColor:'rgba(255,255,255,0.4)',
    borderRadius: 4,
    padding: 4,
    marginVertical:4,
    marginHorizontal:4,
     boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 5px 5px 1px',
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    color: '#000',
    
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    //backgroundColor: '#fff',
    paddingHorizontal:6,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
  },
   title1: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000',
    fontFamily: 'Urbanist-Regular',
    marginBottom: 2,
  },
  price: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
     fontFamily: 'Urbanist-SemiBold',
  },
  
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
     fontFamily: 'Urbanist-SemiBold',
    marginLeft: 4,
  },
  ratingAbsolute: {
    position: 'absolute',
    bottom:10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
},
});