import React from "react";
import { View, Text, Image, StyleSheet, ImageSourcePropType, Platform } from "react-native";


type PreviewCardProps = {
  tag: string;
  infoTitle: string;
  inforTitlePrice: string;
  rating:string;
  productImage: ImageSourcePropType
};


export default function PreviewCard({tag,infoTitle,inforTitlePrice,rating,productImage}:PreviewCardProps) {
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
            source={require('../../assets/images/bookmark.png')}
            style={{ width: 48, height: 48 }}
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
    width:320 ,
    borderRadius: 20,
    backgroundColor: '#5973c1ff',
    marginHorizontal: 8,
    // shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
    height:300,
    boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 15px 15px 6px',
  },
  imageContainer: {
    width: '100%',
    height: 230,
    position: 'relative',
    padding:(Platform.OS === 'ios' ? 0 : 12),
  },
  image: {
    width: '100%',
    height: '100%',
    padding:12,
    borderRadius:12,
    //borderColor:'000',
   // borderWidth:2,
    alignSelf:'center'
  },

   image1: {
    width: 16,
    height: 16,
    
  },
  bookmark1: {
    position: 'absolute',
    top: 10,
    right: 10,
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
    bottom: 10,
    right: 10,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    //backgroundColor: '#fff',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    marginBottom: 2,
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
    fontWeight: '600',
    color: '#fff',
     fontFamily: 'Urbanist-SemiBold',
  },
  
  ratingText: {
    fontSize: 16,
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