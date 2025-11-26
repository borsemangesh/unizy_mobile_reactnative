
import { BlurView } from "@react-native-community/blur";
import React from "react";
import { View, Text, Image, StyleSheet, ImageSourcePropType, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";


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
           <BlurView 
              blurType="light"
              blurAmount={100}
              style={StyleSheet.absoluteFillObject}
          />
          <Text allowFontScaling={false} style={styles.tagText}>{tag}</Text>
        </View>
        <View style={styles.bookmark1}>
          <BlurView 
                                blurType="light"
                                blurAmount={100}
                                style={StyleSheet.absoluteFillObject}
                              />
            <LinearGradient
                        colors={[
                          'rgba(0, 1, 102, 0.20)',   // center strong blue tint
                          'rgba(0, 1, 102, 0.024)'  // outer faint blue tint
                        ]}
                        style={StyleSheet.absoluteFillObject}
                        useAngle={false} // radial
               />

          <Image
            source={require('../../assets/images/favourite.png')}
            style={{ width: 20, height: 20 }}
          />
        </View>
      </View>

        <View style={styles.infoRow}>
              <Text allowFontScaling={false} style={styles.title}>{infoTitle}</Text>
      
              <View
                style={{
                  flexDirection: 'row',
                  width: '90%',
                  justifyContent: 'space-between',
                  paddingTop:2
                }}
              >
                <Text allowFontScaling={false} style={styles.price}>{inforTitlePrice}</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignContent: 'center',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Image
                    source={require('../../assets/images/staricon.png')}
                    style={styles.image1}
                  />
      
                  <Text allowFontScaling={false} style={styles.ratingText}>{rating}</Text>
                </View>
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
    top: (Platform.OS === 'ios' ? 15 : 10),
    right: (Platform.OS === 'ios' ? 15 : 10),
    //borderRadius: 20,
    height:36,
    width:36,
     alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 12,
     backgroundColor:
       'radial-gradient(109.75% 109.75% at 17.5% 6.25%, rgba(101, 101, 101, 0.13) 0%, rgba(117, 117, 117, 0.1) 100%)',
   
    display: 'flex',
    boxShadow: '0 2px 5px 0 rgba(109, 109, 109, 0.2)',
    borderWidth: 0.5,
    borderColor: '#ffffff2e',
    
    borderBlockStartColor: '#ffffff2e',
    borderBlockColor: '#ffffff2e',

    borderTopColor: '#ffffff2e',
    borderBottomColor: '#ffffff2e',
    borderLeftColor: '#ffffff2e',
    borderRightColor: '#ffffff2e',
    overflow:'hidden'
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
    bottom: (Platform.OS === 'ios' ? 16 : 8),
    right:(Platform.OS === 'ios' ? 13 : 8),
    //backgroundColor: '#fff',
    //backgroundColor:'rgba(255,255,255,0.4)',
    overflow:'hidden',
    borderRadius: 4,
    padding: 4,
    marginVertical:4,
    marginHorizontal:4,
     boxShadow: 'rgba(255, 255, 255, 0.12) inset -1px 5px 5px 1px',
     //overflow:'hidden'
    backgroundColor: 'radial-gradient(87.5% 87.5% at 17.5% 6.25%, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 0.48) 100%)',
    alignSelf: 'flex-end', // 👈 ensures the View wraps the text
    flexShrink: 1,    

 
    maxWidth: (Platform.OS === 'ios' ? '74%' : '80%'),   // restrict width relative to parent
    flexWrap: 'wrap',
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Urbanist-SemiBold',
    fontWeight: '600',
    color: '#000',
    textAlign: 'right',
    flexShrink: 1,
    //flexWrap: 'wrap',
    width:'100%'
    
  },
  // infoRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   //backgroundColor: '#fff',
  //   paddingHorizontal:12,
  //   //paddingVertical:6
  // },
  infoRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    //backgroundColor: '#fff',
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Urbanist-SemiBold',
    width: '90%',
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
    bottom: (Platform.OS === 'ios' ? 4 : 2),
    right: (Platform.OS === 'ios' ? 4 : 2),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
},
});